import { useState, useEffect } from 'react';
import { useAppStorage } from './hooks/useLocalStorage';
import { useAuth } from './hooks/useAuth';
import { useAssignmentStorage } from './hooks/useAssignmentStorage';
import { useAttendanceStorage } from './hooks/useAttendanceStorage';
import { useScheduleStorage } from './hooks/useScheduleStorage';
import { Header } from './components/layout/Header';
import { type ActiveTab } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { QuizCatalog } from './components/quiz/QuizCatalog';
import { QuizRunner } from './components/quiz/QuizRunner';
import { QuizResult } from './components/quiz/QuizResult';
import { FlashcardDeck } from './components/flashcards/FlashcardDeck';
import { Dashboard } from './components/analytics/Dashboard';
import { QuizCreator } from './components/creator/QuizCreator';
import { BookmarkedQuestions } from './components/bookmarks/BookmarkedQuestions';
import { AdminPortal } from './components/admin/AdminPortal';
import { StudentAssignmentView } from './components/assignment/StudentAssignmentView';
import { TeacherAssignmentManager } from './components/assignment/TeacherAssignmentManager';
import { AttendanceManager } from './components/attendance/AttendanceManager';
import { StudentAttendanceDashboard } from './components/attendance/StudentAttendanceDashboard';
import { ScheduleCalendar } from './components/schedule/ScheduleCalendar';
import { StudentCheckInModal } from './components/attendance/StudentCheckInModal';
import { CameraQRScanner } from './components/attendance/CameraQRScanner';
import { UnifiedAuthGateway } from './components/auth/UnifiedAuthGateway';
import { PWAInstallModal } from './components/ui/PWAInstallModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';
import { StudentOnePageDashboard } from './components/dashboard/StudentOnePageDashboard';
import { TeacherAcademicHeader } from './components/layout/TeacherAcademicHeader';
import { TeacherAcademicPortal } from './components/teacher/TeacherAcademicPortal';
import { LearningPathRoadmap } from './components/learning-path/LearningPathRoadmap';
import { SmartReviewModal } from './components/smart-review/SmartReviewModal';
import { AITutorDrawer } from './components/ai-tutor/AITutorDrawer';
import { EarlyWarningDashboard } from './components/teacher/EarlyWarningDashboard';
import { DiagnosticOnboardingModal } from './components/onboarding/DiagnosticOnboardingModal';
import { CertificateVerificationModal } from './components/certificates/CertificateVerificationModal';
import { DigitalCertificate, DiagnosticResult } from './types/edtech';
import { CertificateService } from './services/certificateService';
import { AnalyticsService } from './services/analyticsService';
import { Quiz, QuizAttempt } from './types/quiz';
import { QuizMode } from './hooks/useQuizEngine';
import { CurriculumTrack } from './types/auth';
import { AcademicNoticeModal } from './components/modals/AcademicNoticeModal';
import { AcademicFeedbackModal } from './components/modals/AcademicFeedbackModal';

const SESSION_ACTIVE_KEY = 'phtinhocgenz_session_active_v4';

export function App() {
  const {
    stats,
    allQuizzes,
    theme,
    toggleTheme,
    updateStudentName,
    addCustomQuiz,
    deleteCustomQuiz,
    toggleBookmark,
    recordAttempt,
    resetAllProgress
  } = useAppStorage();

  const {
    user,
    isStaff,
    studentAccounts,
    teacherAccounts,
    loginWithStudentCode,
    loginAsStaff,
    changeUserPassword,
    resetUserPassword,
    createStudentAccount,
    updateStudentAccount,
    deleteStudentAccount,
    createTeacherAccount,
    updateTeacherAccount,
    deleteTeacherAccount,
    switchStudentTrack
  } = useAuth();

  const {
    assignments,
    submissions,
    notifications,
    unreadNotificationCount,
    googleDriveConfig,
    updateGoogleDriveConfig,
    createAssignment,
    deleteAssignment,
    toggleAssignmentOpen,
    submitAssignment,
    gradeSubmission,
    markNotificationAsRead
  } = useAssignmentStorage();

  const {
    sessions: attendanceSessions,
    makeupReports,
    createSession: createAttendanceSession,
    rotateQRCode: rotateAttendanceQR,
    updateSessionSecurity: updateAttendanceSessionSecurity,
    toggleSessionOpen: toggleAttendanceSessionOpen,
    updateStudentStatus: updateAttendanceStatus,
    markAllPresent: markAllAttendancePresent,
    studentCheckIn: studentAttendanceCheckIn,
    saveSession: saveAttendanceSession,
    deleteSession: deleteAttendanceSession,
    clearMakeupReport: clearAttendanceMakeupReport
  } = useAttendanceStorage(studentAccounts);

  const {
    schedules,
    createSchedule,
    updateSchedule,
    deleteSchedule
  } = useScheduleStorage();

  // Active Session state (Enforces Unified Auth Gateway upfront!)
  const [isSessionActive, setIsSessionActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SESSION_ACTIVE_KEY);
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeMode, setActiveMode] = useState<QuizMode>('exam');
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showAITutorDrawer, setShowAITutorDrawer] = useState(false);
  const [aiTutorPrompt, setAiTutorPrompt] = useState('');
  const [showSmartReviewModal, setShowSmartReviewModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<DigitalCertificate | null>(null);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Sync auth name to storage stats
  useEffect(() => {
    if (user.name && user.name !== stats.studentName) {
      updateStudentName(user.name);
    }
  }, [user.name]);

  // Check if first-time student needs diagnostic onboarding
  useEffect(() => {
    if (isSessionActive && !isStaff && user.role === 'student') {
      const isDone = localStorage.getItem(`tgz_onboarding_done_${user.id}`);
      if (!isDone) {
        setShowOnboardingModal(true);
      }
    }
  }, [isSessionActive, isStaff, user.id]);

  // Unified Student Login (Choose track + login code + locked inside that track!)
  const handleStudentUnifiedLogin = (studentCode: string, password: string, selectedTrack: CurriculumTrack) => {
    const res = loginWithStudentCode(studentCode, password, selectedTrack);
    if (res.success && res.user) {
      updateStudentName(res.user.name);
      setIsSessionActive(true);
      setActiveTab('dashboard');
      try {
        localStorage.setItem(SESSION_ACTIVE_KEY, 'true');
      } catch (e) {}
    }
    return res;
  };

  // Unified Admin / Teacher Login (Choose track or All tracks + PIN/Password)
  const handleAdminUnifiedLogin = (pinOrPassword: string, name?: string, selectedTrack?: CurriculumTrack | 'all') => {
    const res = loginAsStaff(pinOrPassword, name, selectedTrack);
    if (res.success && res.user) {
      if (selectedTrack && selectedTrack !== 'all') {
        switchStudentTrack(selectedTrack);
      }
      setIsSessionActive(true);
      setActiveTab('dashboard');
      try {
        localStorage.setItem(SESSION_ACTIVE_KEY, 'true');
      } catch (e) {}
    }
    return res;
  };

  // Logout / Switch track handler
  const handleLogout = () => {
    setIsSessionActive(false);
    setActiveQuiz(null);
    setLatestAttempt(null);
    setActiveTab('dashboard');
    try {
      localStorage.removeItem(SESSION_ACTIVE_KEY);
    } catch (e) {}
  };

  // Open AI Tutor with optional prompt
  const handleOpenAITutor = (prompt?: string) => {
    setAiTutorPrompt(prompt || '');
    setShowAITutorDrawer(true);
  };

  // Complete diagnostic onboarding
  const handleCompleteOnboarding = (result: DiagnosticResult) => {
    try {
      localStorage.setItem(`tgz_onboarding_done_${user.id}`, 'true');
      localStorage.setItem(`tgz_diagnostic_${user.id}`, JSON.stringify(result));
    } catch (e) {}
    setShowOnboardingModal(false);
    setActiveTab('learning_path');
  };

  // Quiz runner controls
  const handleStartQuiz = (quiz: Quiz, mode: QuizMode) => {
    setActiveQuiz(quiz);
    setActiveMode(mode);
    setLatestAttempt(null);
    AnalyticsService.trackEvent(user.id, mode === 'exam' ? 'exam_started' : 'quiz_started', {
      track: user.programTrack,
      metadata: { quizId: quiz.id, quizTitle: quiz.title }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchTrackQuiz = (mode: QuizMode = 'practice') => {
    const match = allQuizzes.find(q => q.category === user.programTrack) || allQuizzes[0];
    if (match) {
      handleStartQuiz(match, mode);
    } else {
      setActiveTab('quizzes');
    }
  };

  const handleFinishQuiz = (attempt: QuizAttempt) => {
    recordAttempt(attempt);
    setLatestAttempt(attempt);
    AnalyticsService.trackEvent(user.id, attempt.mode === 'exam' ? 'exam_completed' : 'quiz_completed', {
      track: user.programTrack,
      metadata: { score: attempt.score, totalQuestions: attempt.totalQuestions, percentage: attempt.percentage }
    });

    // Automatically issue certificate if passing score >= 80%
    if (attempt.percentage >= 80 && user.programTrack) {
      const issuedCert = CertificateService.issueCertificate(user.name, user.studentCode || 'HV2026', user.programTrack, attempt.percentage);
      setSelectedCertificate(issuedCert);
      AnalyticsService.trackEvent(user.id, 'certificate_earned', { track: user.programTrack });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetryQuiz = () => {
    if (activeQuiz) {
      setLatestAttempt(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExitQuiz = () => {
    setActiveQuiz(null);
    setLatestAttempt(null);
    setActiveTab('quizzes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. UNIFIED AUTH GATEWAY (Mandatory screen when not authenticated)
  if (!isSessionActive) {
    return (
      <div className={`app-container ${theme}`}>
        <UnifiedAuthGateway
          studentAccounts={studentAccounts}
          onStudentLogin={handleStudentUnifiedLogin}
          onAdminLogin={handleAdminUnifiedLogin}
          onResetPassword={resetUserPassword}
        />
      </div>
    );
  }

  // 2. LOCKED IN-SESSION APPLICATION (User is locked strictly to their chosen track/role)
  return (
    <div className={`app-container ${theme}`}>
      {/* Main Content Area (Zero Heavy Sidebar for both Student & Teacher) */}
      <main className="main-content" style={{ padding: 0 }}>
        {/* Header: Two-Tier Academic Header for Staff / Minimal Flow Header for Students */}
        {isStaff ? (
          <TeacherAcademicHeader
            currentUser={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            theme={theme}
            toggleTheme={toggleTheme}
            unreadNotificationCount={unreadNotificationCount}
            onLogout={handleLogout}
            onOpenNotifications={() => setActiveTab('assignments')}
            onOpenProfileModal={() => setShowProfileModal(true)}
            onOpenChangePassword={() => setShowChangePasswordModal(true)}
            onOpenInstallModal={() => setShowInstallModal(true)}
            onOpenAITutor={() => handleOpenAITutor()}
            onOpenNotices={() => setShowNoticeModal(true)}
          />
        ) : (
          <Header
            theme={theme}
            toggleTheme={toggleTheme}
            streak={stats.currentStreak}
            totalPoints={stats.totalPoints}
            currentUser={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAdmin={false}
            unreadNotificationCount={unreadNotificationCount}
            onLogout={handleLogout}
            onOpenNotifications={() => setActiveTab('assignments')}
            onOpenProfileModal={() => setShowProfileModal(true)}
            onOpenChangePassword={() => setShowChangePasswordModal(true)}
            onOpenInstallModal={() => setShowInstallModal(true)}
            onOpenNotices={() => setShowNoticeModal(true)}
            onOpenFeedback={() => setShowFeedbackModal(true)}
          />
        )}

        {/* Optional Back to Overview Bar for deep tabs in Teacher/Student views */}
        {activeTab !== 'dashboard' && !activeQuiz && (
          <div style={{ maxWidth: isStaff ? '1100px' : '860px', margin: '0 auto', width: '100%', padding: '12px 24px 0' }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--brand)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 0'
              }}
            >
              <span>← Quay lại {isStaff ? 'Tổng quan giảng dạy' : 'Trang Học Tập'}</span>
            </button>
          </div>
        )}

        {/* Content Router */}
        <div style={{ flex: 1, padding: 0 }}>
          {/* 1. Quiz is running */}
          {activeQuiz && !latestAttempt && (
            <QuizRunner
              quiz={activeQuiz}
              mode={activeMode}
              onFinish={handleFinishQuiz}
              onExit={handleExitQuiz}
              bookmarkedQuestionIds={stats.bookmarkedQuestionIds}
              onToggleBookmark={toggleBookmark}
            />
          )}

          {/* 2. Quiz Result Review */}
          {activeQuiz && latestAttempt && (
            <QuizResult
              quiz={activeQuiz}
              attempt={latestAttempt}
              studentName={user.name}
              onRetry={handleRetryQuiz}
              onGoHome={handleExitQuiz}
            />
          )}

          {/* 3. Normal Tab Views */}
          {!activeQuiz && (
            <>
              {/* Teacher Academic Portal (Modern University Academic Style) */}
              {isStaff && activeTab === 'dashboard' && (
                <TeacherAcademicPortal
                  currentUser={user}
                  studentAccounts={studentAccounts}
                  schedules={schedules}
                  assignments={assignments}
                  submissions={submissions}
                  onOpenAttendanceSession={(_sched) => setActiveTab('attendance')}
                  onOpenEarlyWarning={() => setActiveTab('early_warning')}
                  onOpenAssignmentManager={() => setActiveTab('assignments')}
                  onOpenAdminPortal={() => setActiveTab('admin')}
                  onOpenScheduleCalendar={() => setActiveTab('schedule')}
                  onOpenQuizBank={() => setActiveTab('quizzes')}
                />
              )}

              {/* Student OnePage Master Dashboard */}
              {!isStaff && activeTab === 'dashboard' && (
                <StudentOnePageDashboard
                  currentUser={user}
                  streak={stats.currentStreak}
                  schedules={schedules}
                  onContinueLearning={() => handleLaunchTrackQuiz('practice')}
                  onStartSmartReview={() => setShowSmartReviewModal(true)}
                  onStartMiniTest={() => handleLaunchTrackQuiz('practice')}
                  onOpenLearningPath={() => setActiveTab('learning_path')}
                  onOpenFlashcards={() => setActiveTab('flashcards')}
                  onOpenBookmarks={() => setActiveTab('bookmarks')}
                  onOpenAssignments={() => setActiveTab('assignments')}
                  onOpenAITutor={(prompt) => handleOpenAITutor(prompt)}
                  onOpenQRScanner={() => setShowCameraScanner(true)}
                />
              )}

              {/* Learning Path Roadmap Tab */}
              {activeTab === 'learning_path' && (
                <LearningPathRoadmap
                  currentUser={user}
                  onStartNodePractice={(_node) => handleLaunchTrackQuiz('practice')}
                />
              )}

              {/* Early Warning Dashboard (Teacher & Admin) */}
              {activeTab === 'early_warning' && isStaff && (
                <EarlyWarningDashboard
                  studentAccounts={studentAccounts}
                />
              )}

              {/* Smart Review Direct Tab */}
              {activeTab === 'smart_review' && (
                <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '20px' }}>
                  <button
                    onClick={() => setShowSmartReviewModal(true)}
                    className="btn btn-primary"
                    style={{ padding: '12px 24px', fontWeight: 800, borderRadius: '12px' }}
                  >
                    BẮT ĐẦU ÔN TẬP CÂU LÀM SAI (SPACED REPETITION)
                  </button>
                </div>
              )}

              {/* Admin Portal Tab */}
              {activeTab === 'admin' && (
                <AdminPortal
                  quizzes={allQuizzes}
                  attempts={stats.history}
                  studentAccounts={studentAccounts}
                  teacherAccounts={teacherAccounts}
                  assignments={assignments}
                  submissions={submissions}
                  notifications={notifications}
                  googleDriveConfig={googleDriveConfig}
                  onUpdateGoogleDriveConfig={updateGoogleDriveConfig}
                  onCreateAssignment={createAssignment}
                  onDeleteAssignment={deleteAssignment}
                  onToggleOpen={toggleAssignmentOpen}
                  onGradeSubmission={gradeSubmission}
                  onMarkNotificationAsRead={markNotificationAsRead}
                  onAddQuiz={addCustomQuiz}
                  onDeleteCustomQuiz={deleteCustomQuiz}
                  onNavigateToCreator={() => setActiveTab('creator')}
                  onCreateStudentAccount={createStudentAccount}
                  onUpdateStudentAccount={updateStudentAccount}
                  onDeleteStudentAccount={deleteStudentAccount}
                  onCreateTeacherAccount={createTeacherAccount}
                  onUpdateTeacherAccount={updateTeacherAccount}
                  onDeleteTeacherAccount={deleteTeacherAccount}
                  currentUser={user}
                />
              )}

              {/* Classroom Assignments (DRM File Exams & Homework) */}
              {activeTab === 'assignments' && (
                isStaff ? (
                  <TeacherAssignmentManager
                    assignments={assignments}
                    submissions={submissions}
                    notifications={notifications}
                    googleDriveConfig={googleDriveConfig}
                    onUpdateGoogleDriveConfig={updateGoogleDriveConfig}
                    currentUser={user}
                    onCreateAssignment={createAssignment}
                    onDeleteAssignment={deleteAssignment}
                    onToggleOpen={toggleAssignmentOpen}
                    onGradeSubmission={gradeSubmission}
                    onMarkNotificationAsRead={markNotificationAsRead}
                  />
                ) : (
                  <StudentAssignmentView
                    assignments={assignments}
                    submissions={submissions}
                    currentUser={user}
                    onSubmitAssignment={submitAssignment}
                  />
                )
              )}

              {activeTab === 'attendance' && (
                isStaff ? (
                  <AttendanceManager
                    sessions={attendanceSessions}
                    studentAccounts={studentAccounts}
                    makeupReports={makeupReports}
                    currentUser={user}
                    onCreateSession={createAttendanceSession}
                    onRotateQR={rotateAttendanceQR}
                    onUpdateSessionSecurity={updateAttendanceSessionSecurity}
                    onToggleSessionOpen={toggleAttendanceSessionOpen}
                    onUpdateStatus={updateAttendanceStatus}
                    onMarkAllPresent={markAllAttendancePresent}
                    onSaveSession={saveAttendanceSession}
                    onDeleteSession={deleteAttendanceSession}
                    onClearMakeupReport={clearAttendanceMakeupReport}
                  />
                ) : (
                  <StudentAttendanceDashboard
                    currentUser={user}
                    sessions={attendanceSessions}
                    onOpenQRScanner={() => setShowCameraScanner(true)}
                    onOpenPinModal={() => setShowCheckInModal(true)}
                  />
                )
              )}

              {activeTab === 'schedule' && (
                <ScheduleCalendar
                  currentUser={user}
                  schedules={schedules}
                  onCreateSchedule={createSchedule}
                  onUpdateSchedule={updateSchedule}
                  onDeleteSchedule={deleteSchedule}
                  onNavigateToAttendance={() => setActiveTab('attendance')}
                />
              )}

              {activeTab === 'quizzes' && (
                <QuizCatalog
                  quizzes={allQuizzes}
                  currentUser={user}
                  onStartQuiz={handleStartQuiz}
                  onDeleteCustomQuiz={deleteCustomQuiz}
                />
              )}

              {activeTab === 'flashcards' && (
                <FlashcardDeck
                  quizzes={allQuizzes}
                  currentUser={user}
                />
              )}

              {activeTab === 'analytics' && (
                <Dashboard
                  stats={stats}
                  onResetProgress={resetAllProgress}
                />
              )}

              {activeTab === 'creator' && isStaff && (
                <QuizCreator
                  onAddQuiz={addCustomQuiz}
                  onSuccessNavigate={() => setActiveTab('admin')}
                />
              )}

              {activeTab === 'bookmarks' && (
                <BookmarkedQuestions
                  allQuizzes={allQuizzes}
                  bookmarkedQuestionIds={stats.bookmarkedQuestionIds}
                  onToggleBookmark={toggleBookmark}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation (4 Items: Home, Learn, Continue, Profile) */}
      {!activeQuiz && !isStaff && (
        <MobileBottomNav
          onScrollToTop={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onScrollToLearn={() => {
            const el = document.getElementById('section-learn');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenProfile={() => setShowProfileModal(true)}
          onContinueLearning={() => {
            if (allQuizzes.length > 0) {
              handleStartQuiz(allQuizzes[0], 'practice');
            } else {
              setActiveTab('quizzes');
            }
          }}
        />
      )}

      {/* ── 2026 EDTECH FLOATING AI & MODALS ── */}
      <AITutorDrawer
        isOpen={showAITutorDrawer}
        initialPrompt={aiTutorPrompt}
        onClose={() => setShowAITutorDrawer(false)}
        currentUser={user}
      />

      {showSmartReviewModal && (
        <SmartReviewModal
          currentUser={user}
          onClose={() => setShowSmartReviewModal(false)}
          onAskAITutor={handleOpenAITutor}
        />
      )}

      {showOnboardingModal && (
        <DiagnosticOnboardingModal
          currentUser={user}
          onClose={() => setShowOnboardingModal(false)}
          onCompleteOnboarding={handleCompleteOnboarding}
        />
      )}

      {selectedCertificate && (
        <CertificateVerificationModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}

      {/* Modals */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

      <StudentCheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        studentName={user.name}
        studentCode={user.studentCode || 'THGZ01'}
        programTrack={user.programTrack}
        onCheckIn={(code, name, pin, track, coords) => studentAttendanceCheckIn(code, name, pin, track, coords)}
      />

      <CameraQRScanner
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        studentName={user.name}
        studentCode={user.studentCode || 'THGZ01'}
        onScanResult={(scannedText, coords) => {
          return studentAttendanceCheckIn(
            user.studentCode || 'THGZ01',
            user.name,
            scannedText,
            user.programTrack || 'office-fast-3in1',
            coords
          );
        }}
      />

      {/* User Profile Dropdown Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentUser={user}
        onOpenChangePassword={() => setShowChangePasswordModal(true)}
        onLogout={handleLogout}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal || Boolean(isSessionActive && user.mustChangePassword)}
        isFirstTime={Boolean(isSessionActive && user.mustChangePassword)}
        onClose={() => setShowChangePasswordModal(false)}
        currentUser={user}
        onChangePassword={changeUserPassword}
      />

      {/* Official Academic Notice Board Modal */}
      <AcademicNoticeModal
        isOpen={showNoticeModal}
        onClose={() => setShowNoticeModal(false)}
      />

      {/* Student Academic Help Desk & Feedback Modal */}
      <AcademicFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        studentName={user.name}
        studentCode={user.studentCode || 'THGZ01'}
      />
    </div>
  );
}

export default App;
