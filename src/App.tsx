import { useState, useEffect } from 'react';
import { useAppStorage } from './hooks/useLocalStorage';
import { useAuth } from './hooks/useAuth';
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
import { AuthModal } from './components/auth/AuthModal';
import { PWAInstallModal } from './components/ui/PWAInstallModal';
import { Quiz, QuizAttempt } from './types/quiz';
import { QuizMode } from './hooks/useQuizEngine';

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
    loginAsStudent,
    loginAsAdmin
  } = useAuth();

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

  // If user is admin, auto-switch to admin tab on initial load if desired
  const handleStudentLogin = (name: string, studentCode?: string, schoolOrClass?: string) => {
    loginAsStudent(name, studentCode, schoolOrClass);
    updateStudentName(name);
    if (activeTab === 'admin') {
      setActiveTab('quizzes');
    }
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

  return (
    <div className={`app-container ${theme}`}>
      {/* Desktop Sidebar (hidden when taking active quiz) */}
      {!activeQuiz && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          bookmarkCount={stats.bookmarkedQuestionIds.length}
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
          isAdmin={isAdmin}
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
                  onAddQuiz={addCustomQuiz}
                  onDeleteCustomQuiz={deleteCustomQuiz}
                  onNavigateToCreator={() => setActiveTab('creator')}
                  currentUser={user}
                />
              )}

              {activeTab === 'quizzes' && (
                <QuizCatalog
                  quizzes={allQuizzes}
                  onStartQuiz={handleStartQuiz}
                  onDeleteCustomQuiz={deleteCustomQuiz}
                />
              )}

              {activeTab === 'flashcards' && (
                <FlashcardDeck quizzes={allQuizzes} />
              )}

              {activeTab === 'analytics' && (
                <Dashboard
                  stats={stats}
                  onResetProgress={resetAllProgress}
                />
              )}

              {activeTab === 'creator' && (
                <QuizCreator
                  onAddQuiz={addCustomQuiz}
                  onSuccessNavigate={() => setActiveTab(isAdmin ? 'admin' : 'quizzes')}
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
        onLoginStudent={handleStudentLogin}
        onLoginAdmin={handleAdminLogin}
      />
    </div>
  );
}

export default App;
