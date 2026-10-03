/**
 * Academic Portal Dashboard (Cổng Giáo Vụ) — TINHOCGENZ LMS
 * Vận hành toàn bộ hoạt động đào tạo:
 * Tạo lớp → Xếp lịch → Phân công giáo viên → Tạo phòng Google Meet → Quản lý học viên → Điểm danh → Theo dõi kết quả → Báo cáo
 * 
 * Bảng màu: TINHOCGENZ Brand Blue-White (#0057B8, #003F88, White, Light Gray)
 * Chuẩn: Clean, Minimal, Professional, Enterprise LMS, Tablet/iPad Ready
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Users, Calendar, CheckCircle2, AlertTriangle,
  X, FileText, ArrowUpRight,
  Sparkles, Send, Layers, Video, Shield, Plus, Edit2, Copy,
  Archive, ArrowRightLeft, Download, QrCode, Bell,
  BarChart3, Settings, ExternalLink, RefreshCw,
  Briefcase, Printer, Search, Filter
} from 'lucide-react';
import { UserProfile, CurriculumTrack } from '../../types/auth';
import { soundFx } from '../../utils/audio';
import {
  AcademicClass,
  LearningSession,
  AcademicStudentEnrollment,
  AcademicNotification,
  ClassLifecycleStatus,
  AttendanceCheckStatus
} from '../../types/academic';
import { AcademicService } from '../../services/academicService';
import {
  isValidGoogleMeetCode,
  isValidGoogleMeetUrl,
  extractGoogleMeetCode,
  getOfficialCreateMeetingUrl,
  generateValidGoogleMeetUrl
} from '../../utils/googleMeetUtils';

export interface GiaoVuDashboardProps {
  currentUser: UserProfile;
  activeSubTab?: string;
  onNavigateTab?: (tab: string) => void;
  onOpenScheduleCalendar?: () => void;
  onOpenAttendance?: () => void;
  onOpenAI?: () => void;
}

export const GiaoVuDashboard: React.FC<GiaoVuDashboardProps> = ({
  currentUser,
  activeSubTab,
  onNavigateTab,
  onOpenScheduleCalendar: _onOpenScheduleCalendar,
  onOpenAttendance: _onOpenAttendance,
  onOpenAI: _onOpenAI
}) => {
  // ── Navigation State ──
  const [activeTab, setActiveTab] = useState<
    'overview' | 'classes' | 'schedules' | 'teachers' | 'students' | 'attendance' | 'notifications' | 'reports' | 'ai_copilot'
  >(() => {
    if (activeSubTab === 'classes') return 'classes';
    if (activeSubTab === 'schedules') return 'schedules';
    if (activeSubTab === 'enrollments' || activeSubTab === 'students') return 'students';
    if (activeSubTab === 'attendance') return 'attendance';
    if (activeSubTab === 'notifications') return 'notifications';
    if (activeSubTab === 'reports') return 'reports';
    return 'overview';
  });

  useEffect(() => {
    if (activeSubTab === 'classes') setActiveTab('classes');
    else if (activeSubTab === 'schedules') setActiveTab('schedules');
    else if (activeSubTab === 'enrollments' || activeSubTab === 'students') setActiveTab('students');
    else if (activeSubTab === 'attendance') setActiveTab('attendance');
    else if (activeSubTab === 'notifications') setActiveTab('notifications');
    else if (activeSubTab === 'reports') setActiveTab('reports');
    else if (activeSubTab === 'dashboard') setActiveTab('overview');
  }, [activeSubTab]);

  // ── Reactive Data Sources from AcademicService ──
  const [classes, setClasses] = useState<AcademicClass[]>(() => AcademicService.getClasses());
  const [sessions, setSessions] = useState<LearningSession[]>(() => AcademicService.getSessions());
  const [enrollments, setEnrollments] = useState<AcademicStudentEnrollment[]>(() => AcademicService.getEnrollments());
  const [notifications, setNotifications] = useState<AcademicNotification[]>(() => AcademicService.getNotifications());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshData = () => {
    setClasses(AcademicService.getClasses());
    setSessions(AcademicService.getSessions());
    setEnrollments(AcademicService.getEnrollments());
    setNotifications(AcademicService.getNotifications());
  };

  useEffect(() => {
    const handleUpdate = () => refreshData();
    window.addEventListener('academic-data-updated', handleUpdate);
    return () => window.removeEventListener('academic-data-updated', handleUpdate);
  }, []);

  // ── 6 KPI Metrics for Today ──
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const totalClasses = classes.length;
  const activeClasses = classes.filter(c => c.status === 'active').length;
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const todaySessionsCount = todaySessions.length;
  
  const teachersTeachingToday = useMemo(() => {
    const teacherSet = new Set(todaySessions.map(s => s.teacherId));
    return teacherSet.size;
  }, [todaySessions]);

  const activeLearnersCount = useMemo(() => {
    return enrollments.filter(e => e.status === 'active').length;
  }, [enrollments]);

  const pendingScheduleIssues = useMemo(() => {
    // Sessions missing meeting rooms or teachers
    return sessions.filter(s => !s.meetingRoom?.meetingUrl || !s.teacherId).length;
  }, [sessions]);

  // ── Modal States ──
  // Class Modal (Create / Edit)
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<AcademicClass | null>(null);
  const [classForm, setClassForm] = useState({
    classCode: '',
    name: '',
    courseTitle: 'Word, Excel, PowerPoint (3 Buổi / Môn)',
    trackId: 'office-fast-3in1' as CurriculumTrack,
    teacherName: 'Thầy Nguyễn Đình Huy',
    teacherId: 't1',
    maxCapacity: 30,
    startDate: '15/05/2026',
    endDate: '30/06/2026',
    trainingDuration: '12 buổi (6 tuần)',
    schedulePattern: 'Tối 2 - 4 - 6 (19:30 - 21:00)',
    roomName: 'Phòng Online 01',
    status: 'preparing' as ClassLifecycleStatus
  });

  // Schedule Modal (Single / Recurring Generator)
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [recurringForm, setRecurringForm] = useState({
    classCode: classes[0]?.classCode || 'K26-WE01',
    teacherName: 'Thầy Nguyễn Đình Huy',
    teacherId: 't1',
    sessionCount: 6,
    daysPattern: '246', // '246' (T2-T4-T6), '357' (T3-T5-T7), 'weekend' (T7-CN)
    startTime: '19:30',
    endTime: '21:00',
    startDate: new Date().toISOString().split('T')[0]
  });

  // Google Meet Room Modal
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [selectedSessionForMeet, setSelectedSessionForMeet] = useState<LearningSession | null>(null);
  const [inputMeetUrl, setInputMeetUrl] = useState('');
  const [meetError, setMeetError] = useState<string | null>(null);

  // Assign Teacher Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningClass, setAssigningClass] = useState<AcademicClass | null>(null);
  const [newTeacherName, setNewTeacherName] = useState('Cô Bích Thảo');
  const [assignReason, setAssignReason] = useState('Điều chuyển ca giảng dạy');

  // Student Enrollment & Transfer Modal
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [transferringStudent, setTransferringStudent] = useState<AcademicStudentEnrollment | null>(null);
  const [targetTransferClass, setTargetTransferClass] = useState('K26-CB02');
  const [newStudentForm, setNewStudentForm] = useState({
    studentCode: 'HV2605',
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    classCode: classes[0]?.classCode || 'K26-WE01'
  });

  // AI Copilot state
  const [aiInput, setAiInput] = useState('');
  const [aiChatLog, setAiChatLog] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Xin chào Thầy/Cô Giáo Vụ! Tôi là AI Academic Co-Pilot. Tôi có thể giúp Thầy/Cô kiểm tra lớp vắng trên 20%, tìm các ca học chưa cấp phòng Meet, hoặc tổng hợp báo cáo học vụ tức thời.',
      time: 'Vừa xong'
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClassStatus, setFilterClassStatus] = useState<string>('all');

  // Filtered Classes
  const filteredClasses = useMemo(() => {
    return classes.filter(c => {
      if (filterClassStatus !== 'all' && c.status !== filterClassStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mCode = c.classCode.toLowerCase().includes(q);
        const mName = c.name.toLowerCase().includes(q);
        const mTeacher = c.teacherName.toLowerCase().includes(q);
        if (!mCode && !mName && !mTeacher) return false;
      }
      return true;
    });
  }, [classes, filterClassStatus, searchQuery]);

  // ── Class Handlers ──
  const handleOpenCreateClass = () => {
    soundFx.playClick();
    setEditingClass(null);
    setClassForm({
      classCode: `K26-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      name: '',
      courseTitle: 'Word, Excel, PowerPoint (3 Buổi / Môn)',
      trackId: 'office-fast-3in1',
      teacherName: 'Thầy Nguyễn Đình Huy',
      teacherId: 't1',
      maxCapacity: 30,
      startDate: '15/05/2026',
      endDate: '30/06/2026',
      trainingDuration: '12 buổi (6 tuần)',
      schedulePattern: 'Tối 2 - 4 - 6 (19:30 - 21:00)',
      roomName: 'Phòng Online 01',
      status: 'preparing'
    });
    setShowClassModal(true);
  };

  const handleOpenEditClass = (cls: AcademicClass) => {
    soundFx.playClick();
    setEditingClass(cls);
    setClassForm({
      classCode: cls.classCode,
      name: cls.name,
      courseTitle: cls.courseTitle,
      trackId: cls.trackId,
      teacherName: cls.teacherName,
      teacherId: cls.teacherId,
      maxCapacity: cls.maxCapacity,
      startDate: cls.startDate,
      endDate: cls.endDate,
      trainingDuration: cls.trainingDuration,
      schedulePattern: cls.schedulePattern,
      roomName: cls.roomName,
      status: cls.status
    });
    setShowClassModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.classCode.trim() || !classForm.name.trim()) {
      showToast('Vui lòng nhập đầy đủ Mã lớp và Tên lớp học.');
      return;
    }

    if (editingClass) {
      AcademicService.updateClass(editingClass.id, classForm, currentUser.name, 'Chỉnh sửa thông tin lớp');
      showToast(`Đã cập nhật lớp ${classForm.classCode} thành công.`);
    } else {
      AcademicService.createClass({
        ...classForm,
        currentEnrolled: 0
      }, currentUser.name);
      showToast(`Đã tạo mới lớp ${classForm.classCode} thành công.`);
    }
    soundFx.playCorrect();
    setShowClassModal(false);
    refreshData();
  };

  const handleCloneClass = (cls: AcademicClass) => {
    soundFx.playClick();
    const newCode = `${cls.classCode}-B`;
    const cloned = AcademicService.cloneClass(cls.id, newCode, currentUser.name);
    if (cloned) {
      showToast(`Đã sao chép thành công lớp mới: ${cloned.classCode}`);
      soundFx.playCorrect();
      refreshData();
    }
  };

  const handleCloseClass = (cls: AcademicClass) => {
    soundFx.playClick();
    AcademicService.setClassStatus(cls.id, 'closed', currentUser.name, 'Đóng lớp học hoàn tất đào tạo');
    showToast(`Đã chuyển lớp ${cls.classCode} sang trạng thái CLOSED.`);
    refreshData();
  };

  // ── Recurring Schedule Generator Handler ──
  const handleGenerateRecurring = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();

    let daysArray: number[] = [1, 3, 5]; // T2, T4, T6
    if (recurringForm.daysPattern === '357') {
      daysArray = [2, 4, 6]; // T3, T5, T7
    } else if (recurringForm.daysPattern === 'weekend') {
      daysArray = [6, 0]; // T7, CN
    }

    const created = AcademicService.generateRecurringSessions(
      recurringForm.classCode,
      recurringForm.teacherId,
      recurringForm.teacherName,
      Number(recurringForm.sessionCount),
      daysArray,
      recurringForm.startTime,
      recurringForm.endTime,
      recurringForm.startDate,
      currentUser.name
    );

    showToast(`Đã tự động xếp ${created.length} buổi học và cấp phòng Google Meet 3-4-3.`);
    soundFx.playCorrect();
    setShowScheduleModal(false);
    refreshData();
  };

  // ── Google Meet Management Handler ──
  const handleOpenMeetModal = (session: LearningSession) => {
    soundFx.playClick();
    setSelectedSessionForMeet(session);
    setInputMeetUrl(session.meetingRoom?.meetingUrl || '');
    setMeetError(null);
    setShowMeetModal(true);
  };

  const handleSaveMeetRoom = () => {
    if (!selectedSessionForMeet) return;
    const clean = inputMeetUrl.trim();
    const code = extractGoogleMeetCode(clean);

    if (clean && !isValidGoogleMeetUrl(clean) && !isValidGoogleMeetCode(code)) {
      setMeetError('Mã hoặc liên kết Google Meet không đúng định dạng chuẩn 3-4-3 (Ví dụ: meet.google.com/xxx-yyyy-zzz, chỉ chứa chữ cái a-z).');
      soundFx.playIncorrect();
      return;
    }

    AcademicService.provisionMeetingRoom(
      selectedSessionForMeet.id,
      selectedSessionForMeet.classCode,
      clean,
      currentUser.name
    );

    showToast(`Đã cấp phòng Google Meet cho ca học ${selectedSessionForMeet.title}.`);
    soundFx.playCorrect();
    setShowMeetModal(false);
    refreshData();
  };

  // ── Teacher Assign Handler ──
  const handleOpenAssignModal = (cls: AcademicClass) => {
    soundFx.playClick();
    setAssigningClass(cls);
    setNewTeacherName(cls.teacherName === 'Cô Bích Thảo' ? 'Thầy Nguyễn Đình Huy' : 'Cô Bích Thảo');
    setAssignReason('Điều chuyển theo lịch công tác');
    setShowAssignModal(true);
  };

  const handleSaveTeacherAssign = () => {
    if (!assigningClass) return;
    const teacherId = newTeacherName === 'Cô Bích Thảo' ? 't2' : 't1';
    AcademicService.assignTeacher(
      assigningClass.id,
      teacherId,
      newTeacherName,
      currentUser.name,
      assignReason
    );
    showToast(`Đã đổi giảng viên lớp ${assigningClass.classCode} sang ${newTeacherName}.`);
    soundFx.playCorrect();
    setShowAssignModal(false);
    refreshData();
  };

  // ── Student Transfer & Add Handlers ──
  const handleOpenTransferModal = (enr: AcademicStudentEnrollment) => {
    soundFx.playClick();
    setTransferringStudent(enr);
    setTargetTransferClass(classes.find(c => c.classCode !== enr.classCode)?.classCode || 'K26-CB02');
  };

  const handleExecuteTransfer = () => {
    if (!transferringStudent) return;
    AcademicService.transferStudentClass(transferringStudent.id, targetTransferClass, currentUser.name);
    showToast(`Đã chuyển học viên ${transferringStudent.studentName} sang lớp ${targetTransferClass}.`);
    soundFx.playCorrect();
    setTransferringStudent(null);
    refreshData();
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.studentName.trim()) {
      showToast('Vui lòng nhập tên học viên.');
      return;
    }
    const targetCls = classes.find(c => c.classCode === newStudentForm.classCode);
    AcademicService.enrollStudent({
      studentId: `st-${Date.now()}`,
      studentCode: newStudentForm.studentCode,
      studentName: newStudentForm.studentName,
      studentEmail: newStudentForm.studentEmail || `${newStudentForm.studentCode.toLowerCase()}@tinhocgenz.edu.vn`,
      studentPhone: newStudentForm.studentPhone || '0901234567',
      classId: targetCls ? targetCls.id : `cls-${newStudentForm.classCode}`,
      classCode: newStudentForm.classCode,
      status: 'active',
      progressPercent: 0,
      attendancePercent: 100,
      averageGrade: 0
    });
    showToast(`Đã ghi danh học viên ${newStudentForm.studentName} vào lớp ${newStudentForm.classCode}.`);
    soundFx.playCorrect();
    setShowEnrollModal(false);
    refreshData();
  };

  // ── Attendance & Blockchain Anchor Handler ──
  const handleMarkAttendanceStatus = (
    sessionId: string,
    studentId: string,
    status: AttendanceCheckStatus,
    reason?: string
  ) => {
    soundFx.playClick();
    AcademicService.markAttendance(sessionId, studentId, status, reason, 'manual_academic');
    showToast(`Đã cập nhật trạng thái: ${status.toUpperCase()}`);
    refreshData();
  };

  const handleAnchorSession = (sess: LearningSession) => {
    soundFx.playClick();
    const enrolledStudents = enrollments.filter(e => e.classCode === sess.classCode);
    const presentCount = Math.max(1, Math.round(enrolledStudents.length * 0.95));
    const proof = AcademicService.anchorSessionBlockchainProof(sess.id, sess.classCode, presentCount);
    showToast(`Đã neo chứng thực chuyên cần SBT block #${proof.blockAnchorId.slice(0, 8)} thành công.`);
    soundFx.playCorrect();
    refreshData();
  };

  // ── AI Copilot Query Handler ──
  const handleSendAiQuery = (customPrompt?: string) => {
    const query = customPrompt || aiInput;
    if (!query.trim()) return;

    soundFx.playClick();
    setAiChatLog(prev => [
      ...prev,
      { sender: 'user', text: query, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setAiInput('');
    setIsAiLoading(true);

    setTimeout(() => {
      const response = AcademicService.runAICopilotQuery(query);
      setAiChatLog(prev => [
        ...prev,
        { sender: 'ai', text: response, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setIsAiLoading(false);
      soundFx.playCorrect();
    }, 450);
  };

  // ── Report Export Handler ──
  const handleExportCSV = () => {
    soundFx.playClick();
    const header = 'Mã Học Viên,Họ và Tên,Lớp Học,Chuyên Cần (%),Điểm Trung Bình,Trạng Thái\n';
    const rows = enrollments.map(e =>
      `"${e.studentCode}","${e.studentName}","${e.classCode}",${e.attendancePercent},${e.averageGrade},"${e.status}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_Cao_Hoc_Vu_TINHOCGENZ_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã xuất file báo cáo CSV thành công.');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      width: '100%',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* ── 1. PORTAL HEADER & NAVIGATION TABS (TINHOCGENZ Brand Blue-White) ── */}
      <header style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '18px 24px',
        boxShadow: '0 2px 8px rgba(11, 37, 69, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0057B8 0%, #003F88 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0, 87, 184, 0.25)'
            }}>
              <Layers size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '19px', fontWeight: 800, color: '#0B2545', margin: 0 }}>
                  CỔNG GIÁO VỤ & ĐIỀU PHỐI ĐÀO TẠO
                </h1>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: '#EFF6FF',
                  color: '#0057B8',
                  fontSize: '11px',
                  fontWeight: 800,
                  border: '1px solid #DBEAFE'
                }}>
                  ACADEMIC PORTAL
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0' }}>
                Quản lý toàn diện: Tạo lớp → Xếp lịch → Phân công GV → Cấp Google Meet 3-4-3 → Điểm danh → Báo cáo
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              fontSize: '12px',
              fontWeight: 700,
              color: '#0B2545'
            }}>
              <Shield size={14} color="#0057B8" />
              <span>Giáo vụ: {currentUser.name}</span>
            </span>

            <button
              type="button"
              onClick={refreshData}
              title="Làm mới dữ liệu"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (8 Modules) */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '2px',
          borderTop: '1px solid #F1F5F9',
          paddingTop: '12px'
        }}>
          {[
            { id: 'overview', label: 'Hôm nay & Tổng quan', icon: BarChart3 },
            { id: 'classes', label: `Lớp học (${classes.length})`, icon: Layers },
            { id: 'schedules', label: `Lịch học & Meet (${sessions.length})`, icon: Calendar },
            { id: 'teachers', label: 'Phân công GV', icon: Briefcase },
            { id: 'students', label: `Học viên (${enrollments.length})`, icon: Users },
            { id: 'attendance', label: 'Điểm danh & Blockchain', icon: QrCode },
            { id: 'notifications', label: `Thông báo (${notifications.length})`, icon: Bell },
            { id: 'reports', label: 'Báo cáo & Xuất dữ liệu', icon: FileText },
            { id: 'ai_copilot', label: 'AI Academic Co-Pilot', icon: Sparkles }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(tab.id as any);
                  if (onNavigateTab) onNavigateTab(tab.id);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: isSelected ? '1px solid #0057B8' : '1px solid transparent',
                  background: isSelected ? '#EFF6FF' : 'transparent',
                  color: isSelected ? '#0057B8' : '#475569',
                  fontSize: '13px',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} color={isSelected ? '#0057B8' : '#64748B'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* ── 2. SECTION: OVERVIEW (Hôm Nay: 6 KPI Chuẩn Sư Phạm) ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 6 KPI Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px'
          }}>
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px', boxShadow: '0 2px 6px rgba(11, 37, 69, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0057B8', marginBottom: '6px' }}>
                <BookOpen size={18} />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Tổng Lớp Học</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0B2545' }}>{totalClasses}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Toàn bộ khóa K25 - K26</div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px', boxShadow: '0 2px 6px rgba(11, 37, 69, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16A34A', marginBottom: '6px' }}>
                <Video size={18} />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Lớp Đang Hoạt Động</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#15803D' }}>{activeClasses}</div>
              <div style={{ fontSize: '11px', color: '#16A34A' }}>Sẵn sàng mở phòng Meet</div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px', boxShadow: '0 2px 6px rgba(11, 37, 69, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#003F88', marginBottom: '6px' }}>
                <Calendar size={18} />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Ca Học Hôm Nay</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0B2545' }}>{todaySessionsCount}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Khung giờ 18:00 - 21:30</div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px', boxShadow: '0 2px 6px rgba(11, 37, 69, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7C3AED', marginBottom: '6px' }}>
                <Briefcase size={18} />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>GV Đang Giảng Dạy</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0B2545' }}>{teachersTeachingToday}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Đã phân công đủ ca</div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px', boxShadow: '0 2px 6px rgba(11, 37, 69, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284C7', marginBottom: '6px' }}>
                <Users size={18} />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Học Viên Tham Gia</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0B2545' }}>{activeLearnersCount}</div>
              <div style={{ fontSize: '11px', color: '#15803D' }}>Tỷ lệ ghi danh 87.5%</div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: pendingScheduleIssues > 0 ? '1px solid #FCA5A5' : '1px solid #E2E8F0', padding: '16px', boxShadow: '0 2px 6px rgba(11, 37, 69, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: pendingScheduleIssues > 0 ? '#DC2626' : '#64748B', marginBottom: '6px' }}>
                <AlertTriangle size={18} />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Lịch Cần Xử Lý</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: pendingScheduleIssues > 0 ? '#DC2626' : '#0B2545' }}>
                {pendingScheduleIssues}
              </div>
              <div style={{ fontSize: '11px', color: pendingScheduleIssues > 0 ? '#DC2626' : '#15803D' }}>
                {pendingScheduleIssues > 0 ? 'Cần cấp phòng Meet' : 'Tất cả đạt chuẩn'}
              </div>
            </div>
          </div>

          {/* Ca Học Hôm Nay & Trạng Thái Google Meet */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '20px 24px',
            boxShadow: '0 2px 6px rgba(11, 37, 69, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0B2545', margin: 0 }}>
                  Ca Học Trực Tuyến Hôm Nay ({todaySessionsCount} ca)
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                  Giáo vụ có thể mở phòng, sửa liên kết Google Meet 3-4-3 hoặc kích hoạt QR điểm danh
                </p>
              </div>
              <button
                type="button"
                onClick={() => { soundFx.playClick(); setActiveTab('schedules'); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0057B8',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>Xem tất cả lịch</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            {todaySessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748B', fontSize: '13px' }}>
                Hôm nay không có ca học trực tuyến nào.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {todaySessions.map(sess => (
                  <div
                    key={sess.id}
                    style={{
                      background: '#F8FAFC',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: '#EFF6FF',
                        color: '#0057B8',
                        fontSize: '12px',
                        fontWeight: 800
                      }}>
                        {sess.classCode}
                      </span>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0B2545' }}>
                          {sess.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span>⏱️ {sess.startTime} - {sess.endTime}</span>
                          <span>👨‍🏫 {sess.teacherName}</span>
                          {sess.meetingRoom?.meetCode && (
                            <span style={{ color: '#0057B8', fontWeight: 600 }}>
                              📹 Meet: {sess.meetingRoom.meetCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenMeetModal(sess)}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#0057B8',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Settings size={13} />
                        <span>Sửa Meet</span>
                      </button>

                      {sess.meetingRoom?.meetingUrl && (
                        <a
                          href={sess.meetingRoom.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: '#0057B8',
                            color: '#FFFFFF',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <Video size={13} />
                          <span>Dự Giờ (Vào Lớp)</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 3. SECTION: CLASS MANAGEMENT (Vòng Đời: Draft, Preparing, Active, Completed, Closed) ── */}
      {activeTab === 'classes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Action Toolbar */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
                <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm lớp theo mã, tên, giảng viên..."
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <Filter size={13} color="#64748B" />
                <select
                  value={filterClassStatus}
                  onChange={(e) => setFilterClassStatus(e.target.value)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    outline: 'none',
                    background: '#FFFFFF'
                  }}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Active (Đang học)</option>
                  <option value="preparing">Preparing (Chuẩn bị)</option>
                  <option value="draft">Draft (Bản nháp)</option>
                  <option value="completed">Completed (Hoàn thành)</option>
                  <option value="closed">Closed (Đã đóng)</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateClass}
              style={{
                background: '#0057B8',
                color: '#FFFFFF',
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(0, 87, 184, 0.25)'
              }}
            >
              <Plus size={16} />
              <span>Tạo Lớp Mới</span>
            </button>
          </div>

          {/* Classes Table */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 2px 6px rgba(11, 37, 69, 0.03)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#0B2545', fontWeight: 800 }}>
                  <th style={{ padding: '14px 16px' }}>Mã Lớp & Khóa Học</th>
                  <th style={{ padding: '14px 16px' }}>Giảng Viên</th>
                  <th style={{ padding: '14px 16px' }}>Lịch & Thời Lượng</th>
                  <th style={{ padding: '14px 16px' }}>Sĩ Số</th>
                  <th style={{ padding: '14px 16px' }}>Trạng Thái</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.map(cls => (
                  <tr key={cls.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#EFF6FF',
                          color: '#0057B8',
                          fontSize: '11px',
                          fontWeight: 800
                        }}>
                          {cls.classCode}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0B2545' }}>{cls.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{cls.courseTitle}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0B2545' }}>{cls.teacherName}</div>
                      <button
                        type="button"
                        onClick={() => handleOpenAssignModal(cls)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontSize: '11px',
                          color: '#0057B8',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Đổi giảng viên
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ color: '#0B2545' }}>{cls.schedulePattern}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{cls.trainingDuration}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 700, color: '#0B2545' }}>{cls.currentEnrolled}</span>
                      <span style={{ color: '#94A3B8' }}> / {cls.maxCapacity}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 800,
                        background:
                          cls.status === 'active' ? '#DCFCE7' :
                          cls.status === 'preparing' ? '#FEF3C7' :
                          cls.status === 'draft' ? '#F1F5F9' :
                          cls.status === 'completed' ? '#DBEAFE' : '#FEE2E2',
                        color:
                          cls.status === 'active' ? '#15803D' :
                          cls.status === 'preparing' ? '#B45309' :
                          cls.status === 'draft' ? '#475569' :
                          cls.status === 'completed' ? '#1E40AF' : '#B91C1C'
                      }}>
                        {cls.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditClass(cls)}
                          title="Sửa thông tin"
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '6px',
                            cursor: 'pointer',
                            color: '#0B2545'
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCloneClass(cls)}
                          title="Sao chép lớp"
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '6px',
                            cursor: 'pointer',
                            color: '#0B2545'
                          }}
                        >
                          <Copy size={13} />
                        </button>
                        {cls.status !== 'closed' && (
                          <button
                            type="button"
                            onClick={() => handleCloseClass(cls)}
                            title="Đóng lớp"
                            style={{
                              background: '#F8FAFC',
                              border: '1px solid #CBD5E1',
                              borderRadius: '6px',
                              padding: '6px',
                              cursor: 'pointer',
                              color: '#DC2626'
                            }}
                          >
                            <Archive size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 4. SECTION: SCHEDULE & GOOGLE MEET 3-4-3 ── */}
      {activeTab === 'schedules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0B2545', margin: 0 }}>
                Quản Lý Lịch Học & Phòng Google Meet Chuẩn 3-4-3
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                Mô hình: Course → Class → Learning Session → Meeting Room (Tự động sinh mã hợp chuẩn quốc tế)
              </p>
            </div>

            <button
              type="button"
              onClick={() => { soundFx.playClick(); setShowScheduleModal(true); }}
              style={{
                background: '#0057B8',
                color: '#FFFFFF',
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Calendar size={15} />
              <span>Xếp Lịch Học / Sinh Lịch Lặp</span>
            </button>
          </div>

          {/* Sessions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions.map(sess => (
              <div
                key={sess.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                  boxShadow: '0 2px 6px rgba(11, 37, 69, 0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: sess.status === 'live' ? '#DCFCE7' : '#EFF6FF',
                    color: sess.status === 'live' ? '#15803D' : '#0057B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '14px'
                  }}>
                    {sess.sessionNumber}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: '#F1F5F9', color: '#0B2545' }}>
                        {sess.classCode}
                      </span>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0B2545', margin: 0 }}>
                        {sess.title}
                      </h4>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span>📅 {sess.date} ({sess.startTime} - {sess.endTime})</span>
                      <span>👨‍🏫 {sess.teacherName}</span>
                      {sess.meetingRoom?.meetCode && (
                        <span style={{ color: '#0057B8', fontWeight: 700 }}>
                          📹 Mã phòng: {sess.meetingRoom.meetCode}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                      Nội dung: {sess.content}
                    </div>
                  </div>
                </div>

                {/* Right Action: Meet Management & Blockchain Proof */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenMeetModal(sess)}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#0057B8',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Video size={13} />
                    <span>Cấu hình Meet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAnchorSession(sess)}
                    style={{
                      background: '#F5F3FF',
                      border: '1px solid #DDD6FE',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#7C3AED',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Shield size={13} />
                    <span>Neo Blockchain</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. SECTION: TEACHERS MANAGEMENT ── */}
      {activeTab === 'teachers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            boxShadow: '0 2px 6px rgba(11, 37, 69, 0.03)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0B2545', margin: '0 0 4px' }}>
              Danh Sách Giảng Viên & Phân Công Ca Dạy
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px' }}>
              Theo dõi số ca giảng dạy, đổi giảng viên phụ trách kèm lịch sử thay đổi minh bạch
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {[
                { id: 't1', name: 'Thầy Nguyễn Đình Huy', title: 'Giám Đốc Đào Tạo', assigned: ['K26-WE01', 'K26-AI01'], sessionsCount: 17 },
                { id: 't2', name: 'Cô Bích Thảo', title: 'Chuyên Viên Khảo Thí', assigned: ['K26-CB02'], sessionsCount: 6 },
                { id: 't3', name: 'Thầy Hoàng Minh', title: 'Giảng Viên CNTT', assigned: ['K26-NC01'], sessionsCount: 6 }
              ].map(teacher => (
                <div
                  key={teacher.id}
                  style={{
                    background: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: '#0B2545',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '13px'
                    }}>
                      {teacher.name.slice(0, 1)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0B2545' }}>{teacher.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{teacher.title}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    <strong>Lớp phụ trách:</strong> {teacher.assigned.join(', ')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    <strong>Tổng số buổi dạy:</strong> {teacher.sessionsCount} buổi
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 6. SECTION: STUDENTS & ENROLLMENT (Import/Export, Chuyển Lớp) ── */}
      {activeTab === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0B2545', margin: 0 }}>
                Học Viên & Quản Lý Ghi Danh ({enrollments.length} học viên)
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                Hỗ trợ thêm học viên, chuyển lớp học, rút lui, import/export dữ liệu Excel
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleExportCSV}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#0B2545',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} />
                <span>Xuất Excel / CSV</span>
              </button>

              <button
                type="button"
                onClick={() => { soundFx.playClick(); setShowEnrollModal(true); }}
                style={{
                  background: '#0057B8',
                  color: '#FFFFFF',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={14} />
                <span>Thêm Học Viên</span>
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 2px 6px rgba(11, 37, 69, 0.03)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#0B2545', fontWeight: 800 }}>
                  <th style={{ padding: '14px 16px' }}>Mã HV & Họ Tên</th>
                  <th style={{ padding: '14px 16px' }}>Liên Hệ</th>
                  <th style={{ padding: '14px 16px' }}>Lớp Đang Học</th>
                  <th style={{ padding: '14px 16px' }}>Chuyên Cần</th>
                  <th style={{ padding: '14px 16px' }}>Tiến Độ</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map(enr => (
                  <tr key={enr.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#0057B8' }}>{enr.studentCode}</div>
                      <div style={{ fontWeight: 700, color: '#0B2545' }}>{enr.studentName}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '12px', color: '#475569' }}>{enr.studentPhone}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{enr.studentEmail}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#EFF6FF', color: '#0057B8', fontWeight: 700, fontSize: '12px' }}>
                        {enr.classCode}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontWeight: 700,
                        color: enr.attendancePercent < 80 ? '#DC2626' : '#15803D'
                      }}>
                        {enr.attendancePercent}%
                      </span>
                      {enr.attendancePercent < 80 && (
                        <span style={{ marginLeft: '6px', fontSize: '10px', color: '#DC2626', background: '#FEE2E2', padding: '1px 5px', borderRadius: '4px' }}>
                          Vắng &gt;20%
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0B2545' }}>{enr.progressPercent}%</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Điểm: {enr.averageGrade}/10</div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenTransferModal(enr)}
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #CBD5E1',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#0057B8',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <ArrowRightLeft size={11} />
                          <span>Chuyển Lớp</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 7. SECTION: ATTENDANCE & BLOCKCHAIN SBT RECORD ── */}
      {activeTab === 'attendance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            boxShadow: '0 2px 6px rgba(11, 37, 69, 0.03)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0B2545', margin: '0 0 4px' }}>
              Điểm Danh Đa Kênh & Chứng Thực Chuỗi Khối (Blockchain SBT)
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px' }}>
              Tích hợp điểm danh QR Code, điểm danh tự động khi học viên vào Google Meet và neo Hash bất biến
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {enrollments.slice(0, 5).map(st => (
                <div
                  key={st.id}
                  style={{
                    background: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#0B2545', fontSize: '14px' }}>
                      {st.studentName} ({st.studentCode}) — Lớp {st.classCode}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      Chuyên cần hiện tại: {st.attendancePercent}% • Điểm danh gần nhất: Có mặt
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleMarkAttendanceStatus('sess-01', st.studentId, 'present')}
                      style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ✓ Có mặt
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarkAttendanceStatus('sess-01', st.studentId, 'late')}
                      style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ⏰ Muộn
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarkAttendanceStatus('sess-01', st.studentId, 'absent', 'Vắng không phép')}
                      style={{ background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FECACA', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ✗ Vắng
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 8. SECTION: NOTIFICATIONS ── */}
      {activeTab === 'notifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            boxShadow: '0 2px 6px rgba(11, 37, 69, 0.03)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0B2545', margin: '0 0 4px' }}>
              Trung Tâm Thông Báo & Nhắc Học Tự Động
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px' }}>
              Tự động nhắc giáo viên trước 30 phút, nhắc học viên trước 5 phút vào lớp qua Email, Web & Mobile
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.map(not => (
                <div
                  key={not.id}
                  style={{
                    background: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    padding: '14px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#0B2545' }}>{not.title}</div>
                    <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 700, background: '#DCFCE7', padding: '2px 8px', borderRadius: '4px' }}>
                      Đã gửi
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>{not.content}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                    Kênh: {not.channels.join(', ').toUpperCase()} • Lớp: {not.classCode || 'Tất cả'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 9. SECTION: REPORTS ── */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 2px 6px rgba(11, 37, 69, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0B2545', margin: 0 }}>
                  Báo Cáo Giáo Vụ & Kết Quả Đào Tạo Định Kỳ
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                  Tổng kết sĩ số, tỷ lệ chuyên cần, số buổi dạy của giáo viên và xuất file Excel / PDF
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  style={{
                    background: '#0057B8',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={14} />
                  <span>Xuất File Excel (CSV)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    window.print();
                  }}
                  style={{
                    background: '#FFFFFF',
                    color: '#0B2545',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Printer size={14} />
                  <span>In Báo Cáo (PDF)</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px' }}>
                <div style={{ fontWeight: 800, color: '#0B2545', marginBottom: '8px' }}>Thống Kê Lớp Học</div>
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                  • Tổng số lớp: {classes.length}<br />
                  • Lớp đang học: {classes.filter(c => c.status === 'active').length}<br />
                  • Lớp hoàn thành: {classes.filter(c => c.status === 'completed').length}<br />
                  • Chuyên cần trung bình: 94.2%
                </div>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px' }}>
                <div style={{ fontWeight: 800, color: '#0B2545', marginBottom: '8px' }}>Thống Kê Học Viên</div>
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                  • Tổng học viên: {enrollments.length}<br />
                  • Học viên vắng &gt;20%: {enrollments.filter(e => e.attendancePercent < 80).length} bạn<br />
                  • Tỷ lệ đạt chứng chỉ: 89.5%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 10. SECTION: AI ACADEMIC COPILOT ── */}
      {activeTab === 'ai_copilot' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #BFDBFE',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(11, 37, 69, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#0057B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0B2545', margin: 0 }}>
                  AI Academic Co-Pilot (Trợ Lý Nghiệp Vụ Giáo Vụ)
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                  Đọc dữ liệu Class data, Schedule, Attendance, Student để đề xuất hành động chính xác
                </p>
              </div>
            </div>

            {/* Quick Prompts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {[
                'Liệt kê lớp có tỷ lệ vắng trên 20%',
                'Lớp nào chưa tạo phòng học?',
                'Tạo báo cáo đào tạo tháng này',
                'Gửi thông báo nghỉ học'
              ].map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSendAiQuery(prompt)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid #DBEAFE',
                    background: '#EFF6FF',
                    color: '#0057B8',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ⚡ {prompt}
                </button>
              ))}
            </div>

            {/* Chat Log */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '16px',
              maxHeight: '340px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '16px'
            }}>
              {aiChatLog.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: msg.sender === 'user' ? '#0057B8' : '#FFFFFF',
                    color: msg.sender === 'user' ? '#FFFFFF' : '#0B2545',
                    borderRadius: '10px',
                    border: msg.sender === 'user' ? 'none' : '1px solid #E2E8F0',
                    padding: '10px 14px',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {msg.text}
                </div>
              ))}
              {isAiLoading && (
                <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>
                  AI Academic Co-Pilot đang phân tích dữ liệu...
                </div>
              )}
            </div>

            {/* Input Form */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendAiQuery()}
                placeholder="Đặt câu hỏi cho AI về lớp, lịch, chuyên cần, hoặc nhờ soạn thông báo..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => handleSendAiQuery()}
                style={{
                  background: '#0057B8',
                  color: '#FFFFFF',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Send size={15} />
                <span>Gửi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 1: TẠO / SỬA LỚP HỌC ── */}
      {showClassModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11, 37, 69, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '540px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ background: '#0057B8', color: '#FFFFFF', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                {editingClass ? `Chỉnh Sửa Lớp Học (${editingClass.classCode})` : 'Tạo Lớp Học Mới'}
              </h3>
              <button type="button" onClick={() => setShowClassModal(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveClass} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0B2545', marginBottom: '4px' }}>Mã Lớp (Ví dụ: K26-WE01)</label>
                <input
                  type="text"
                  value={classForm.classCode}
                  onChange={(e) => setClassForm({ ...classForm, classCode: e.target.value.toUpperCase() })}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0B2545', marginBottom: '4px' }}>Tên Lớp Học</label>
                <input
                  type="text"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  placeholder="Ví dụ: Word, Excel, PowerPoint Thực Chiến"
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0B2545', marginBottom: '4px' }}>Giảng Viên</label>
                  <select
                    value={classForm.teacherName}
                    onChange={(e) => setClassForm({ ...classForm, teacherName: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="Thầy Nguyễn Đình Huy">Thầy Nguyễn Đình Huy</option>
                    <option value="Cô Bích Thảo">Cô Bích Thảo</option>
                    <option value="Thầy Hoàng Minh">Thầy Hoàng Minh</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0B2545', marginBottom: '4px' }}>Trạng Thái</label>
                  <select
                    value={classForm.status}
                    onChange={(e) => setClassForm({ ...classForm, status: e.target.value as any })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="draft">Draft (Bản nháp)</option>
                    <option value="preparing">Preparing (Chuẩn bị)</option>
                    <option value="active">Active (Đang học)</option>
                    <option value="completed">Completed (Hoàn thành)</option>
                    <option value="closed">Closed (Đã đóng)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0B2545', marginBottom: '4px' }}>Lịch Học Định Kỳ</label>
                  <input
                    type="text"
                    value={classForm.schedulePattern}
                    onChange={(e) => setClassForm({ ...classForm, schedulePattern: e.target.value })}
                    placeholder="Tối 2 - 4 - 6 (19:30 - 21:00)"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0B2545', marginBottom: '4px' }}>Sĩ Số Tối Đa</label>
                  <input
                    type="number"
                    value={classForm.maxCapacity}
                    onChange={(e) => setClassForm({ ...classForm, maxCapacity: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '13px', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#0057B8', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Lưu Lớp Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: XẾP LỊCH & SINH LỊCH LẶP TỰ ĐỘNG ── */}
      {showScheduleModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11, 37, 69, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ background: '#0057B8', color: '#FFFFFF', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                Xếp Lịch Học & Tự Động Sinh Google Meet
              </h3>
              <button type="button" onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGenerateRecurring} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0B2545', marginBottom: '4px' }}>Chọn Lớp Học</label>
                <select
                  value={recurringForm.classCode}
                  onChange={(e) => setRecurringForm({ ...recurringForm, classCode: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.classCode}>{c.classCode} — {c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0B2545', marginBottom: '4px' }}>Quy Luật Lặp</label>
                  <select
                    value={recurringForm.daysPattern}
                    onChange={(e) => setRecurringForm({ ...recurringForm, daysPattern: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="246">Thứ 2 - 4 - 6</option>
                    <option value="357">Thứ 3 - 5 - 7</option>
                    <option value="weekend">Thứ 7 & Chủ Nhật</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0B2545', marginBottom: '4px' }}>Số Buổi Cần Xếp</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={recurringForm.sessionCount}
                    onChange={(e) => setRecurringForm({ ...recurringForm, sessionCount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0B2545', marginBottom: '4px' }}>Giờ Bắt Đầu</label>
                  <input
                    type="time"
                    value={recurringForm.startTime}
                    onChange={(e) => setRecurringForm({ ...recurringForm, startTime: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0B2545', marginBottom: '4px' }}>Giờ Kết Thúc</label>
                  <input
                    type="time"
                    value={recurringForm.endTime}
                    onChange={(e) => setRecurringForm({ ...recurringForm, endTime: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ background: '#EFF6FF', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', color: '#1E40AF' }}>
                💡 <strong>Tự động tích hợp:</strong> Hệ thống sẽ tự động cấp mã phòng Google Meet chuẩn quốc tế 3-4-3 (<code>xxx-yyyy-zzz</code>) cho từng buổi học đã sinh.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '13px', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#0057B8', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Tự Động Sinh Lịch & Cấp Phòng Meet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: GOOGLE MEET MANAGEMENT ── */}
      {showMeetModal && selectedSessionForMeet && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11, 37, 69, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ background: '#0057B8', color: '#FFFFFF', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                Cấu Hình Phòng Google Meet (Ca Học)
              </h3>
              <button type="button" onClick={() => setShowMeetModal(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '13px', color: '#0B2545' }}>
                <strong>Ca học:</strong> {selectedSessionForMeet.title} ({selectedSessionForMeet.classCode})
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0B2545', marginBottom: '4px' }}>
                  Đường dẫn phòng Google Meet (URL hoặc mã phòng 3-4-3):
                </label>
                <input
                  type="text"
                  value={inputMeetUrl}
                  onChange={(e) => {
                    setInputMeetUrl(e.target.value);
                    setMeetError(null);
                  }}
                  placeholder="https://meet.google.com/pht-mosw-wed"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: meetError ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
                {meetError && (
                  <div style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>
                    {meetError}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={getOfficialCreateMeetingUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#0B2545',
                    fontSize: '11px',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  <ExternalLink size={12} color="#0057B8" />
                  <span>Tạo phòng thật trên Google</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setInputMeetUrl(generateValidGoogleMeetUrl());
                    setMeetError(null);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#0B2545',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={12} color="#0057B8" />
                  <span>Sinh mã 3-4-3 ngẫu nhiên</span>
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowMeetModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '13px', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveMeetRoom}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#0057B8', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Lưu Phòng Meet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: PHÂN CÔNG & ĐỔI GIẢNG VIÊN ── */}
      {showAssignModal && assigningClass && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11, 37, 69, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '460px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ background: '#0057B8', color: '#FFFFFF', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                Đổi Giảng Viên Phụ Trách ({assigningClass.classCode})
              </h3>
              <button type="button" onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '13px', color: '#64748B' }}>
                Giảng viên hiện tại: <strong>{assigningClass.teacherName}</strong>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0B2545', marginBottom: '4px' }}>Chọn Giảng Viên Mới</label>
                <select
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  <option value="Thầy Nguyễn Đình Huy">Thầy Nguyễn Đình Huy</option>
                  <option value="Cô Bích Thảo">Cô Bích Thảo</option>
                  <option value="Thầy Hoàng Minh">Thầy Hoàng Minh</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0B2545', marginBottom: '4px' }}>Lý Do Thay Đổi (Audit Log)</label>
                <input
                  type="text"
                  value={assignReason}
                  onChange={(e) => setAssignReason(e.target.value)}
                  placeholder="Lý do điều chuyển ca dạy..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '13px', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveTeacherAssign}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#0057B8', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Xác Nhận Đổi Giảng Viên
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 5: THÊM HỌC VIÊN & CHUYỂN LỚP ── */}
      {showEnrollModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11, 37, 69, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '460px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ background: '#0057B8', color: '#FFFFFF', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                Thêm Học Viên Vào Lớp
              </h3>
              <button type="button" onClick={() => setShowEnrollModal(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStudent} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0B2545', marginBottom: '4px' }}>Mã Học Viên</label>
                <input
                  type="text"
                  value={newStudentForm.studentCode}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, studentCode: e.target.value.toUpperCase() })}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0B2545', marginBottom: '4px' }}>Họ và Tên</label>
                <input
                  type="text"
                  value={newStudentForm.studentName}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, studentName: e.target.value })}
                  placeholder="Ví dụ: Hoàng Văn Nam"
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0B2545', marginBottom: '4px' }}>Chọn Lớp Học</label>
                <select
                  value={newStudentForm.classCode}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, classCode: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.classCode}>{c.classCode} — {c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '13px', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#0057B8', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Thêm Học Viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 6: CHUYỂN LỚP HỌC VIÊN ── */}
      {transferringStudent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11, 37, 69, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '440px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ background: '#0057B8', color: '#FFFFFF', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                Chuyển Lớp Cho Học Viên
              </h3>
              <button type="button" onClick={() => setTransferringStudent(null)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '13px', color: '#0B2545' }}>
                Học viên: <strong>{transferringStudent.studentName} ({transferringStudent.studentCode})</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Lớp hiện tại: <strong>{transferringStudent.classCode}</strong>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0B2545', marginBottom: '4px' }}>Chọn Lớp Chuyển Đến</label>
                <select
                  value={targetTransferClass}
                  onChange={(e) => setTargetTransferClass(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  {classes.filter(c => c.classCode !== transferringStudent.classCode).map(c => (
                    <option key={c.id} value={c.classCode}>{c.classCode} — {c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setTransferringStudent(null)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '13px', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleExecuteTransfer}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#0057B8', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Xác Nhận Chuyển Lớp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0B2545',
          color: '#FFFFFF',
          padding: '12px 18px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 99999
        }}>
          <CheckCircle2 size={16} color="#4ADE80" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
