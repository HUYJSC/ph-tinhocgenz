import { useState, useEffect } from 'react';
import { useAppStorage } from './hooks/useLocalStorage';
import { useAuth } from './hooks/useAuth';
import { useAssignmentStorage } from './hooks/useAssignmentStorage';
import { useAttendanceStorage } from './hooks/useAttendanceStorage';
import { Header } from './components/layout/Header';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
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
import { StudentCheckInModal } from './components/attendance/StudentCheckInModal';
import { CameraQRScanner } from './components/attendance/CameraQRScanner';
import { UnifiedAuthGateway } from './components/auth/UnifiedAuthGateway';
import { PWAInstallModal } from './components/ui/PWAInstallModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';
import { Quiz, QuizAttempt } from './types/quiz';
import { QuizMode } from './hooks/useQuizEngine';
import { CurriculumTrack } from './types/auth';

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

  // Active Session state (Enforces Unified Auth Gateway upfront!)
  const [isSessionActive, setIsSessionActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SESSION_ACTIVE_KEY);
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('quizzes');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeMode, setActiveMode] = useState<QuizMode>('exam');
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Sync auth name to storage stats
  useEffect(() => {
    if (user.name && user.name !== stats.studentName) {
      updateStudentName(user.name);
    }
  }, [user.name]);

  // Unified Student Login (Choose track + login code + locked inside that track!)
  const handleStudentUnifiedLogin = (studentCode: string, password: string, selectedTrack: CurriculumTrack) => {
    const res = loginWithStudentCode(studentCode, password, selectedTrack);
    if (res.success && res.user) {
      updateStudentName(res.user.name);
      setIsSessionActive(true);
      setActiveTab('quizzes');
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
      setActiveTab('admin');
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
    try {
      localStorage.removeItem(SESSION_ACTIVE_KEY);
    } catch (e) {}
  };

  // Quiz runner controls
  const handleStartQuiz = (quiz: Quiz, mode: QuizMode) => {
    setActiveQuiz(quiz);
    setActiveMode(mode);
    setLatestAttempt(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishQuiz = (attempt: QuizAttempt) => {
    recordAttempt(attempt);
    setLatestAttempt(attempt);
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
      {/* Desktop Sidebar (hidden when taking active quiz) */}
      {!activeQuiz && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          bookmarkCount={stats.bookmarkedQuestionIds.length}
          unreadNotificationCount={unreadNotificationCount}
          onLogout={handleLogout}
          onOpenInstallModal={() => setShowInstallModal(true)}
          onOpenAuthModal={handleLogout}
          onOpenProfileModal={() => setShowProfileModal(true)}
          isAdmin={isStaff}
          studentName={user.name}
        />
      )}

      {/* Main Content Area */}
      <main className="main-content">
        {/* Persistent Top Header */}
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          streak={stats.currentStreak}
          totalPoints={stats.totalPoints}
          studentName={user.name}
          studentCode={user.studentCode}
          programTrack={user.programTrack}
          isAdmin={isStaff}
          unreadNotificationCount={unreadNotificationCount}
          onLogout={handleLogout}
          onOpenNotifications={() => setActiveTab('assignments')}
          onOpenAuthModal={handleLogout}
          onOpenProfileModal={() => setShowProfileModal(true)}
        />

        {/* Content Router */}
        <div style={{ flex: 1, padding: '8px 0' }}>
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

          {/* 2. Quiz result review */}
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
              {/* Admin Portal Tab */}
              {activeTab === 'admin' && (
                <AdminPortal
                  quizzes={allQuizzes}
                  attempts={stats.history}
                  studentAccounts={studentAccounts}
                  teacherAccounts={teacherAccounts}
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

      {/* Mobile Bottom Navigation Bar (Hidden when taking active quiz) */}
      {!activeQuiz && (
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          bookmarkCount={stats.bookmarkedQuestionIds.length}
          unreadNotificationCount={unreadNotificationCount}
          isAdmin={isStaff}
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
    </div>
  );
}

export default App;
