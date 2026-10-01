import React, { useState, useEffect } from 'react';
import { UserProfile, StudentAccount } from '../../types/auth';
import { ClassScheduleItem } from '../../types/schedule';
import { Assignment, AssignmentSubmission } from '../../types/assignment';
import { AttendanceSession, AttendanceStatus } from '../../types/attendance';
import { TeacherGradingView } from '../teacher/TeacherGradingView';
import { TeacherQRGeoAttendance } from '../teacher/TeacherQRGeoAttendance';
import { TeacherClassDetail } from '../teacher/TeacherClassDetail';
import { TeacherDashboard } from '../teacher/TeacherDashboard';

export interface TeacherAcademicPortalProps {
  currentUser: UserProfile;
  studentAccounts: StudentAccount[];
  schedules: ClassScheduleItem[];
  assignments?: Assignment[];
  submissions: AssignmentSubmission[];
  activeSubTab?: string;
  sessions?: AttendanceSession[];
  onRotateQR?: (sessionId: string) => void;
  onUpdateStatus?: (sessionId: string, studentId: string, status: AttendanceStatus) => void;
  onToggleSessionOpen?: (sessionId: string, isOpen: boolean) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenAttendanceSession?: (schedule?: ClassScheduleItem) => void;
  onOpenEarlyWarning?: () => void;
  onOpenAssignmentManager?: () => void;
  onOpenAdminPortal?: () => void;
  onOpenScheduleCalendar?: () => void;
  onOpenQuizBank?: () => void;
}

export const TeacherAcademicPortal: React.FC<TeacherAcademicPortalProps> = ({
  currentUser,
  studentAccounts,
  schedules,
  submissions,
  activeSubTab,
  sessions,
  onRotateQR,
  onUpdateStatus,
  onToggleSessionOpen,
  onNavigateTab,
  onOpenScheduleCalendar
}) => {
  const [selectedClassCode, setSelectedClassCode] = useState('K26-WE01');
  const [internalView, setInternalView] = useState<'dashboard' | 'grading' | 'attendance' | 'classes'>(() => {
    if (activeSubTab === 'grading') return 'grading';
    if (activeSubTab === 'attendance') return 'attendance';
    if (activeSubTab === 'classes') return 'classes';
    return 'dashboard';
  });

  // Keep internalView in sync with activeSubTab prop if provided
  useEffect(() => {
    if (activeSubTab === 'grading') setInternalView('grading');
    else if (activeSubTab === 'attendance') setInternalView('attendance');
    else if (activeSubTab === 'classes') setInternalView('classes');
    else if (activeSubTab === 'dashboard') setInternalView('dashboard');
  }, [activeSubTab]);

  // Sub-view renders
  if (internalView === 'grading') {
    return (
      <TeacherGradingView
        currentUser={currentUser}
        submissions={submissions}
        onBackToDashboard={() => {
          setInternalView('dashboard');
          if (onNavigateTab) onNavigateTab('dashboard');
        }}
      />
    );
  }

  if (internalView === 'attendance') {
    return (
      <TeacherQRGeoAttendance
        currentUser={currentUser}
        sessions={sessions}
        schedules={schedules}
        studentAccounts={studentAccounts}
        onRotateQR={onRotateQR}
        onUpdateStatus={onUpdateStatus}
        onToggleSessionOpen={onToggleSessionOpen}
        onBackToDashboard={() => {
          setInternalView('dashboard');
          if (onNavigateTab) onNavigateTab('dashboard');
        }}
      />
    );
  }

  if (internalView === 'classes') {
    return (
      <TeacherClassDetail
        currentUser={currentUser}
        classCode={selectedClassCode}
        studentAccounts={studentAccounts}
        schedules={schedules}
        onBack={() => {
          setInternalView('dashboard');
          if (onNavigateTab) onNavigateTab('dashboard');
        }}
        onNavigateTab={tab => {
          if (tab === 'attendance') setInternalView('attendance');
          else if (tab === 'grading') setInternalView('grading');
          else if (onNavigateTab) onNavigateTab(tab);
        }}
      />
    );
  }

  return (
    <TeacherDashboard
      currentUser={currentUser}
      studentAccounts={studentAccounts}
      schedules={schedules}
      submissions={submissions}
      onOpenClass={(clsCode) => {
        setSelectedClassCode(clsCode);
        setInternalView('classes');
      }}
      onOpenGrading={() => setInternalView('grading')}
      onOpenAttendance={() => setInternalView('attendance')}
      onOpenSchedule={onOpenScheduleCalendar}
    />
  );
};
