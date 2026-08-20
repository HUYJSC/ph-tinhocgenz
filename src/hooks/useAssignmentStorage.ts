import { useState, useEffect } from 'react';
import { Assignment, AssignmentSubmission, TeacherNotification } from '../types/assignment';
import { SAMPLE_INFORMATICS_EXAMS } from '../utils/documentParser';

const ASSIGNMENTS_KEY = 'phtinhocgenz_assignments_v1';
const SUBMISSIONS_KEY = 'phtinhocgenz_submissions_v1';
const NOTIFICATIONS_KEY = 'phtinhocgenz_notifications_v1';

export function useAssignmentStorage() {
  // 1. Assignments list
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const saved = localStorage.getItem(ASSIGNMENTS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load assignments', e);
    }
    // Initialize with default sample exams
    return SAMPLE_INFORMATICS_EXAMS.map((sample, idx) => ({
      id: `assign-sample-${idx + 1}`,
      title: sample.title || 'Đề Thi Tin Học Mẫu',
      description: sample.description || '',
      category: sample.category || 'mos-excel',
      teacherId: 'admin-01',
      teacherName: 'Thầy Huy (Giảng Viên Trưởng)',
      targetClass: sample.targetClass || 'Lớp Tin Học Chuẩn',
      sourceFileName: sample.sourceFileName || 'De_Thi_Mau.docx',
      sourceFileType: sample.sourceFileType || 'docx',
      rawContent: sample.rawContent || '',
      parsedQuestions: sample.parsedQuestions || [],
      startTime: new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 16),
      endTime: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16),
      durationMinutes: sample.durationMinutes || 45,
      isOpen: sample.isOpen !== undefined ? sample.isOpen : true,
      allowLateSubmission: false,
      securityOptions: sample.securityOptions || {
        disableCopy: true,
        disableDownload: true,
        watermarkStudent: true
      },
      createdAt: new Date().toISOString().split('T')[0]
    }));
  });

  // 2. Submissions list
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(SUBMISSIONS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load submissions', e);
    }
    return [];
  });

  // 3. Teacher Notifications
  const [notifications, setNotifications] = useState<TeacherNotification[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
    return [];
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
    } catch (e) {
      console.error('Failed to save assignments', e);
    }
  }, [assignments]);

  useEffect(() => {
    try {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
    } catch (e) {
      console.error('Failed to save submissions', e);
    }
  }, [submissions]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications', e);
    }
  }, [notifications]);

  // Create new assignment
  const createAssignment = (assignmentData: Omit<Assignment, 'id' | 'createdAt'>) => {
    const newAssignment: Assignment = {
      ...assignmentData,
      id: `assign-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAssignments(prev => [newAssignment, ...prev]);
    return newAssignment;
  };

  // Delete assignment
  const deleteAssignment = (assignmentId: string) => {
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
  };

  // Toggle open/close status
  const toggleAssignmentOpen = (assignmentId: string) => {
    setAssignments(prev =>
      prev.map(a => (a.id === assignmentId ? { ...a, isOpen: !a.isOpen } : a))
    );
  };

  // Student submits assignment
  const submitAssignment = (
    assignmentId: string,
    studentId: string,
    studentName: string,
    studentCode: string,
    schoolOrClass: string | undefined,
    answers: { [questionId: string]: string },
    timeSpentSeconds: number,
    attachedFile?: { name: string; size: string; content?: string }
  ): AssignmentSubmission => {
    const targetAssignment = assignments.find(a => a.id === assignmentId);
    const submissionId = `sub-${Date.now()}`;
    const now = new Date();

    const isLate = targetAssignment?.endTime
      ? new Date(targetAssignment.endTime).getTime() < now.getTime()
      : false;

    const newSubmission: AssignmentSubmission = {
      id: submissionId,
      assignmentId,
      assignmentTitle: targetAssignment?.title || 'Bài tập Tin học',
      studentId,
      studentName,
      studentCode,
      schoolOrClass,
      answers,
      attachedFileName: attachedFile?.name,
      attachedFileSize: attachedFile?.size,
      attachedFileUrl: attachedFile?.content,
      timeSpentSeconds,
      submittedAt: now.toLocaleString('vi-VN'),
      status: isLate ? 'late' : 'submitted'
    };

    // Save submission
    setSubmissions(prev => [newSubmission, ...prev]);

    // Dispatch Teacher Notification immediately!
    const newNotification: TeacherNotification = {
      id: `notif-${Date.now()}`,
      type: 'student_submitted',
      assignmentId,
      submissionId,
      studentName,
      studentCode,
      assignmentTitle: targetAssignment?.title || 'Bài tập Tin học',
      timestamp: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    return newSubmission;
  };

  // Grade submission
  const gradeSubmission = (
    submissionId: string,
    score: number,
    maxScore: number,
    feedback: string
  ) => {
    setSubmissions(prev =>
      prev.map(sub =>
        sub.id === submissionId
          ? {
              ...sub,
              score,
              maxScore,
              teacherFeedback: feedback,
              status: 'graded',
              gradedAt: new Date().toLocaleString('vi-VN')
            }
          : sub
      )
    );
  };

  // Notification read handlers
  const markNotificationAsRead = (notifId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  return {
    assignments,
    submissions,
    notifications,
    unreadNotificationCount,
    createAssignment,
    deleteAssignment,
    toggleAssignmentOpen,
    submitAssignment,
    gradeSubmission,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications
  };
}
