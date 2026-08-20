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
import { AuthModal } from './components/auth/AuthModal';
import { PWAInstallModal } from './components/ui/PWAInstallModal';
import { TrackGatewayScreen } from './components/gateway/TrackGatewayScreen';
import { Quiz, QuizAttempt } from './types/quiz';
import { QuizMode } from './hooks/useQuizEngine';
import { CurriculumTrack } from './types/auth';

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

  // Track Gateway State (Forced track selection upfront)
  const [selectedTrack, setSelectedTrack] = useState<CurriculumTrack | null>(() => {
    try {
      const saved = localStorage.getItem('phtinhocgenz_selected_track_v1');
      if (saved) return saved as CurriculumTrack;
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('quizzes');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeMode, setActiveMode] = useState<QuizMode>('exam');
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Sync auth name to storage stats
  useEffect(() => {
    if (user.name && user.name !== stats.studentName) {
      updateStudentName(user.name);
    }
  }, [user.name]);

  // Handle Track Selection from Gateway
  const handleSelectTrack = (track: CurriculumTrack) => {
    setSelectedTrack(track);
    switchStudentTrack(track);
    try {
      localStorage.setItem('phtinhocgenz_selected_track_v1', track);
    } catch (e) {
      console.error(e);
    }
    setActiveTab('quizzes');
  };

  // Open Gateway to change track anytime
  const handleOpenGateway = () => {
    setSelectedTrack(null);
    try {
      localStorage.removeItem('phtinhocgenz_selected_track_v1');
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Login Handlers
  const handleStudentLogin = (studentCode: string, password?: string) => {
    const res = loginWithStudentCode(studentCode, password);
    if (res.success && res.user) {
      updateStudentName(res.user.name);
      if (res.user.programTrack) {
        setSelectedTrack(res.user.programTrack);
      }
      if (activeTab === 'admin' || activeTab === 'creator') {
        setActiveTab('quizzes');
      }
    }
    return res;
  };

  const handleAdminLogin = (pin: string, name?: string) => {
    const res = loginAsAdmin(pin, name);
    if (res.success) {
      setActiveTab('admin');
    }
    return res;
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

  // 1. Mandatory Track Gateway Screen (Shown when visitor hasn't chosen a track yet)
  if (!selectedTrack && !isAdmin) {
    return (
      <div className={`app-container ${theme}`}>
        <TrackGatewayScreen
          onSelectTrack={handleSelectTrack}
          onOpenAdminLogin={() => setShowAuthModal(true)}
        />

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          currentUser={user}
          studentAccounts={studentAccounts}
          onLoginStudent={handleStudentLogin}
          onLoginAdmin={handleAdminLogin}
        />
      </div>
    );
  }

  // 2. Normal In-Session Learning App (Locked to selected track or Admin)
  return (
    <div className={`app-container ${theme}`}>
      {/* Desktop Sidebar (hidden when taking active quiz) */}
      {!activeQuiz && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          bookmarkCount={stats.bookmarkedQuestionIds.length}
          unreadNotificationCount={unreadNotificationCount}
          onChangeTrack={handleOpenGateway}
          onOpenInstallModal={() => setShowInstallModal(true)}
          onOpenAuthModal={() => setShowAuthModal(true)}
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
          programTrack={selectedTrack || user.programTrack}
          isAdmin={isAdmin}
          unreadNotificationCount={unreadNotificationCount}
          onChangeTrack={handleOpenGateway}
          onOpenNotifications={() => setActiveTab('assignments')}
          onOpenAuthModal={() => setShowAuthModal(true)}
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
                    currentUser={{ ...user, programTrack: selectedTrack || user.programTrack }}
                    onSubmitAssignment={submitAssignment}
                  />
                )
              )}

              {activeTab === 'quizzes' && (
                <QuizCatalog
                  quizzes={allQuizzes}
                  currentUser={{ ...user, programTrack: selectedTrack || user.programTrack }}
                  onStartQuiz={handleStartQuiz}
                  onDeleteCustomQuiz={deleteCustomQuiz}
                />
              )}

              {activeTab === 'flashcards' && (
                <FlashcardDeck
                  quizzes={allQuizzes}
                  currentUser={{ ...user, programTrack: selectedTrack || user.programTrack }}
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

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={user}
        studentAccounts={studentAccounts}
        onLoginStudent={handleStudentLogin}
        onLoginAdmin={handleAdminLogin}
      />
    </div>
  );
}

export default App;
