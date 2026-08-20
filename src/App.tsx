import { useState, useEffect } from 'react';
import { useAppStorage } from './hooks/useLocalStorage';
import { useAuth } from './hooks/useAuth';
import { useAssignmentStorage } from './hooks/useAssignmentStorage';
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
import { UnifiedAuthGateway } from './components/auth/UnifiedAuthGateway';
import { PWAInstallModal } from './components/ui/PWAInstallModal';
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
    isAdmin,
    studentAccounts,
    loginWithStudentCode,
    loginAsAdmin,
    createStudentAccount,
    deleteStudentAccount,
    switchStudentTrack
  } = useAuth();

  const {
    assignments,
    submissions,
    notifications,
    unreadNotificationCount,
    createAssignment,
    deleteAssignment,
    toggleAssignmentOpen,
    submitAssignment,
    gradeSubmission,
    markNotificationAsRead
  } = useAssignmentStorage();

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

  // Sync auth name to storage stats
  useEffect(() => {
    if (user.name && user.name !== stats.studentName) {
      updateStudentName(user.name);
    }
  }, [user.name]);

  // Unified Student Login (Choose track + login code + locked inside that track!)
  const handleStudentUnifiedLogin = (studentCode: string, password: string, selectedTrack: CurriculumTrack) => {
    const res = loginWithStudentCode(studentCode, password);
    if (res.success && res.user) {
      updateStudentName(res.user.name);
      switchStudentTrack(selectedTrack);
      setIsSessionActive(true);
      setActiveTab('quizzes');
      try {
        localStorage.setItem(SESSION_ACTIVE_KEY, 'true');
      } catch (e) {}
    }
    return res;
  };

  // Unified Admin Login (Choose track or All tracks + PIN)
  const handleAdminUnifiedLogin = (pin: string, name: string, selectedTrack?: CurriculumTrack | 'all') => {
    const res = loginAsAdmin(pin, name);
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

  // Start a quiz session
  const handleStartQuiz = (quiz: Quiz, mode: QuizMode) => {
    setActiveQuiz(quiz);
    setActiveMode(mode);
    setLatestAttempt(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Complete a quiz session
  const handleFinishQuiz = (attempt: QuizAttempt) => {
    recordAttempt(attempt);
    setLatestAttempt(attempt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Exit or reset quiz state
  const handleExitQuiz = () => {
    setActiveQuiz(null);
    setLatestAttempt(null);
  };

  const handleRetryQuiz = () => {
    if (activeQuiz) {
      setLatestAttempt(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 1. UNIFIED AUTH GATEWAY (Mandatory screen when not authenticated)
  if (!isSessionActive) {
    return (
      <div className={`app-container ${theme}`}>
        <UnifiedAuthGateway
          studentAccounts={studentAccounts}
          onStudentLogin={handleStudentUnifiedLogin}
          onAdminLogin={handleAdminUnifiedLogin}
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
          isAdmin={isAdmin}
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
          isAdmin={isAdmin}
          unreadNotificationCount={unreadNotificationCount}
          onLogout={handleLogout}
          onOpenNotifications={() => setActiveTab('assignments')}
          onOpenAuthModal={handleLogout}
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
                  onAddQuiz={addCustomQuiz}
                  onDeleteCustomQuiz={deleteCustomQuiz}
                  onNavigateToCreator={() => setActiveTab('creator')}
                  onCreateStudentAccount={createStudentAccount}
                  onDeleteStudentAccount={deleteStudentAccount}
                  currentUser={user}
                />
              )}

              {/* Classroom Assignments (DRM File Exams & Homework) */}
              {activeTab === 'assignments' && (
                isAdmin ? (
                  <TeacherAssignmentManager
                    assignments={assignments}
                    submissions={submissions}
                    notifications={notifications}
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

              {activeTab === 'creator' && isAdmin && (
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
          isAdmin={isAdmin}
        />
      )}

      {/* Modals */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
}

export default App;
