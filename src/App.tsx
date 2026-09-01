import { useState, useEffect, lazy, Suspense } from 'react';
import { useAppStorage } from './hooks/useLocalStorage';
import { useAuth } from './hooks/useAuth';
import { useAssignmentStorage } from './hooks/useAssignmentStorage';
import { useAttendanceStorage } from './hooks/useAttendanceStorage';
import { useScheduleStorage } from './hooks/useScheduleStorage';
import { Header } from './components/layout/Header';
import { type ActiveTab } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { TeacherAcademicHeader } from './components/layout/TeacherAcademicHeader';
import { StudentCheckInModal } from './components/attendance/StudentCheckInModal';
import { CertificateService } from './services/certificateService';
import { AnalyticsService } from './services/analyticsService';
import type { DigitalCertificate, DiagnosticResult } from './types/edtech';
import type { Quiz, QuizAttempt } from './types/quiz';
import type { QuizMode } from './hooks/useQuizEngine';
import type { CurriculumTrack } from './types/auth';

// ── CODE SPLITTING (DYNAMIC IMPORTS FOR HEAVY ROUTE COMPONENTS) ──
const LandingPage = lazy(() => import('./components/landing/LandingPage').then(m => ({ default: m.LandingPage })));
const UnifiedAuthGateway = lazy(() => import('./components/auth/UnifiedAuthGateway').then(m => ({ default: m.UnifiedAuthGateway })));
const StudentOnePageDashboard = lazy(() => import('./components/dashboard/StudentOnePageDashboard').then(m => ({ default: m.StudentOnePageDashboard })));
const StandaloneAdminApp = lazy(() => import('./components/admin/StandaloneAdminApp').then(m => ({ default: m.StandaloneAdminApp })));
const TeacherAcademicPortal = lazy(() => import('./components/admin/TeacherAcademicPortal').then(m => ({ default: m.TeacherAcademicPortal })));
const AdminPortal = lazy(() => import('./components/admin/AdminPortal').then(m => ({ default: m.AdminPortal })));
const AttendanceManager = lazy(() => import('./components/admin/AttendanceManager').then(m => ({ default: m.AttendanceManager })));
const PracticeBySkill = lazy(() => import('./components/practice/PracticeBySkill').then(m => ({ default: m.PracticeBySkill })));
const QuizRunner = lazy(() => import('./components/quiz/QuizRunner').then(m => ({ default: m.QuizRunner })));
const QuizResult = lazy(() => import('./components/quiz/QuizResult').then(m => ({ default: m.QuizResult })));
const QuizCatalog = lazy(() => import('./components/quiz/QuizCatalog').then(m => ({ default: m.QuizCatalog })));
const QuizCreator = lazy(() => import('./components/creator/QuizCreator').then(m => ({ default: m.QuizCreator })));
const BookmarkedQuestions = lazy(() => import('./components/bookmarks/BookmarkedQuestions').then(m => ({ default: m.BookmarkedQuestions })));
const FlashcardDeck = lazy(() => import('./components/flashcards/FlashcardDeck').then(m => ({ default: m.FlashcardDeck })));
const Dashboard = lazy(() => import('./components/analytics/Dashboard').then(m => ({ default: m.Dashboard })));
const LearningPathRoadmap = lazy(() => import('./components/learning-path/LearningPathRoadmap').then(m => ({ default: m.LearningPathRoadmap })));
const StudentAssignmentView = lazy(() => import('./components/assignment/StudentAssignmentView').then(m => ({ default: m.StudentAssignmentView })));
const StudentAttendanceDashboard = lazy(() => import('./components/attendance/StudentAttendanceDashboard').then(m => ({ default: m.StudentAttendanceDashboard })));
const ScheduleCalendar = lazy(() => import('./components/schedule/ScheduleCalendar').then(m => ({ default: m.ScheduleCalendar })));
const CameraQRScanner = lazy(() => import('./components/attendance/CameraQRScanner').then(m => ({ default: m.CameraQRScanner })));
const PWAInstallModal = lazy(() => import('./components/ui/PWAInstallModal').then(m => ({ default: m.PWAInstallModal })));
const UserProfileModal = lazy(() => import('./components/auth/UserProfileModal').then(m => ({ default: m.UserProfileModal })));
const ChangePasswordModal = lazy(() => import('./components/auth/ChangePasswordModal').then(m => ({ default: m.ChangePasswordModal })));
const SmartReviewModal = lazy(() => import('./components/smart-review/SmartReviewModal').then(m => ({ default: m.SmartReviewModal })));
const AITutorDrawer = lazy(() => import('./components/ai-tutor/AITutorDrawer').then(m => ({ default: m.AITutorDrawer })));
const DiagnosticOnboardingModal = lazy(() => import('./components/onboarding/DiagnosticOnboardingModal').then(m => ({ default: m.DiagnosticOnboardingModal })));
const CertificateVerificationModal = lazy(() => import('./components/certificates/CertificateVerificationModal').then(m => ({ default: m.CertificateVerificationModal })));
const AcademicNoticeModal = lazy(() => import('./components/modals/AcademicNoticeModal').then(m => ({ default: m.AcademicNoticeModal })));
const AcademicFeedbackModal = lazy(() => import('./components/modals/AcademicFeedbackModal').then(m => ({ default: m.AcademicFeedbackModal })));

export const PageLoadingFallback = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', color: '#2563eb' }}>
    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(37,99,235,0.15)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <div style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>Đang nạp phân hệ PH EDU...</div>
  </div>
);

const SESSION_ACTIVE_KEY = 'phtinhocgenz_session_active_v4';

export type AppRoute = 'landing' | 'student' | 'teacher' | 'academic' | 'admin' | 'verify';

export const getAppRoute = (): { route: AppRoute; param?: string } => {
  if (typeof window === 'undefined') return { route: 'landing' };
  const p = window.location.pathname.toLowerCase();
  const h = window.location.hash.toLowerCase();
  if (p.includes('/admin') || h.includes('admin')) return { route: 'admin' };
  if (p.includes('/teacher') || h.includes('teacher')) return { route: 'teacher' };
  if (p.includes('/academic') || h.includes('academic')) return { route: 'academic' };
  if (p.includes('/app') || p.includes('/student') || h.includes('app') || h.includes('student')) return { route: 'student' };
  if (p.includes('/verify') || h.includes('verify')) {
    const parts = p.split('/verify/');
    return { route: 'verify', param: parts[1] ? parts[1].replace(/\/$/, '') : '' };
  }
  return { route: 'landing' };
};

const isAdminPath = () => {
  const { route } = getAppRoute();
  return route === 'admin' || route === 'teacher' || route === 'academic';
};

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

  // [BA FIX] Track whether guest has clicked through to auth or accessed /admin
  const [showAuthGateway, setShowAuthGateway] = useState<boolean>(() => {
    try {
      if (isAdminPath()) return true;
      if (typeof window !== 'undefined') {
        const p = window.location.pathname.toLowerCase();
        if (p.includes('login') || p.includes('auth')) return true;
      }
      return localStorage.getItem('phtgz_show_auth') === 'true';
    } catch { return false; }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (isAdminPath()) {
      return 'admin';
    }
    return 'dashboard';
  });

  // SPA Browser history synchronization across all routes
  useEffect(() => {
    const handlePopState = () => {
      const { route, param } = getAppRoute();
      if (route === 'admin') {
        if (isSessionActive && isStaff) {
          setActiveTab('admin');
        } else if (!isSessionActive) {
          setShowAuthGateway(true);
        }
      } else if (route === 'teacher' || route === 'academic') {
        if (isSessionActive) {
          setActiveTab('admin');
        } else {
          setShowAuthGateway(true);
        }
      } else if (route === 'student') {
        if (isSessionActive) {
          setActiveTab('dashboard');
        } else {
          setShowAuthGateway(true);
        }
      } else if (route === 'verify') {
        const allCerts = CertificateService.getAllCertificates();
        const matched = param ? allCerts.find((c: DigitalCertificate) => c.certificateId.toLowerCase() === param.toLowerCase()) : allCerts[0];
        if (matched) setVerifyCert(matched);
      } else {
        if (!isSessionActive) {
          setShowAuthGateway(false);
        } else if (activeTab === 'admin') {
          setActiveTab('dashboard');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isSessionActive, isStaff, activeTab]);

  const isSuperAdmin = user.role === 'admin';

  // RBAC Client Guard & Redirect enforcement
  useEffect(() => {
    if (!isSessionActive) return;
    const { route } = getAppRoute();
    if (user.role === 'student') {
      if (route === 'admin' || route === 'teacher' || route === 'academic') {
        window.history.replaceState(null, '', '/student');
        setActiveTab('dashboard');
      }
    } else if (user.role === 'teacher') {
      if (route === 'admin') {
        window.history.replaceState(null, '', '/teacher');
        setActiveTab('admin');
      }
    }
  }, [isSessionActive, user.role]);

  // Navigate tab with URL synchronization across separated roles
  const handleNavigateTab = (newTab: ActiveTab) => {
    setActiveTab(newTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof window !== 'undefined') {
      let targetPath = '/';
      if (newTab === 'admin') {
        targetPath = '/admin';
      } else if (newTab === 'schedule' || newTab === 'assignments' || newTab === 'attendance' || newTab === 'early_warning') {
        targetPath = isSuperAdmin ? '/admin' : '/teacher';
      } else if (isSessionActive) {
        targetPath = '/student';
      }
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    }
  };

  const [verifyCert, setVerifyCert] = useState<DigitalCertificate | null>(null);

  // Initial route handler for /verify
  useEffect(() => {
    const { route, param } = getAppRoute();
    if (route === 'verify') {
      const allCerts = CertificateService.getAllCertificates();
      const matched = param ? allCerts.find((c: DigitalCertificate) => c.certificateId.toLowerCase() === param.toLowerCase()) : allCerts[0];
      if (matched) setVerifyCert(matched);
    }
  }, []);

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
  const [practiceSkillId, setPracticeSkillId] = useState<string | undefined>(undefined);

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
        if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().includes('admin')) {
          window.history.pushState(null, '', '/');
        }
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
        if (typeof window !== 'undefined' && !window.location.pathname.toLowerCase().includes('admin')) {
          window.history.pushState(null, '', '/admin');
        }
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
      if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().includes('admin')) {
        window.history.pushState(null, '', '/');
      }
    } catch (e) {}
  };

  // Open AI Tutor with optional prompt
  const handleOpenAITutor = (prompt?: string) => {
    setAiTutorPrompt(prompt || '');
    setShowAITutorDrawer(true);
  };

  // Open Practice by Skill tab (with optional preselected skill)
  const handleOpenPracticeSkill = (skillId?: string) => {
    setPracticeSkillId(skillId);
    setActiveQuiz(null);
    setLatestAttempt(null);
    setActiveTab('practice_skill');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // 0. DEDICATED STANDALONE ADMIN ROUTE (/admin)
  const isCurrentlyOnAdmin = getAppRoute().route === 'admin' || (typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/admin'));
  if (isCurrentlyOnAdmin) {
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <StandaloneAdminApp
          currentUser={user}
          isSessionActive={isSessionActive}
          quizzes={allQuizzes}
          attempts={stats.history}
          studentAccounts={studentAccounts}
          teacherAccounts={teacherAccounts}
          schedules={schedules}
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
          onNavigateToCreator={() => {
            setActiveTab('creator');
          }}
          onCreateStudentAccount={createStudentAccount}
          onUpdateStudentAccount={updateStudentAccount}
          onDeleteStudentAccount={deleteStudentAccount}
          onCreateTeacherAccount={createTeacherAccount}
          onUpdateTeacherAccount={updateTeacherAccount}
          onDeleteTeacherAccount={deleteTeacherAccount}
          onCreateSchedule={createSchedule}
          onUpdateSchedule={updateSchedule}
          onDeleteSchedule={deleteSchedule}
          onLoginAsAdmin={(pass, name) => {
            const res = loginAsStaff(pass, name, 'all');
            if (res.success && res.user) {
              setIsSessionActive(true);
              try { localStorage.setItem(SESSION_ACTIVE_KEY, 'true'); } catch {}
            }
            return res;
          }}
          onLogout={handleLogout}
          onBackToStudentPortal={() => {
            if (typeof window !== 'undefined') {
              window.history.pushState(null, '', '/');
            }
            setActiveTab('dashboard');
          }}
        />
      </Suspense>
    );
  }

  // 1. NOT authenticated: show Landing Page for guests, Auth Gateway when they click CTA
  if (!isSessionActive) {
    if (!showAuthGateway) {
      return (
        <div className="landing-page-wrapper" style={{ display: "block", width: "100%", minHeight: "100vh", margin: 0, padding: 0, background: "#F8FAFC" }}>
          <Suspense fallback={<PageLoadingFallback />}>
            <LandingPage
              onGetStarted={() => {
                setShowAuthGateway(true);
                try { localStorage.setItem('phtgz_show_auth', 'true'); } catch { }
              }}
            />
          </Suspense>
        </div>
      );
    }
    return (
      <div className="auth-page-wrapper" style={{ display: "block", width: "100%", minHeight: "100vh", margin: 0, padding: 0, background: "#F8FAFC" }}>
        <Suspense fallback={<PageLoadingFallback />}>
          <UnifiedAuthGateway
            initialRole={typeof window !== 'undefined' && window.location.pathname.toLowerCase().includes('admin') ? 'admin' : undefined}
            studentAccounts={studentAccounts}
            onStudentLogin={handleStudentUnifiedLogin}
            onAdminLogin={handleAdminUnifiedLogin}
            onResetPassword={resetUserPassword}
            onBackToLanding={() => {
              setShowAuthGateway(false);
              try {
                localStorage.removeItem('phtgz_show_auth');
                if (window.location.pathname.toLowerCase().includes('admin')) {
                  window.history.pushState({}, '', '/');
                }
              } catch { }
            }}
          />
        </Suspense>
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
            setActiveTab={handleNavigateTab}
            theme={theme}
            toggleTheme={toggleTheme}
            unreadNotificationCount={unreadNotificationCount}
            onLogout={handleLogout}
            onOpenNotifications={() => handleNavigateTab('assignments')}
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
            setActiveTab={handleNavigateTab}
            isAdmin={false}
            unreadNotificationCount={unreadNotificationCount}
            onLogout={handleLogout}
            onOpenNotifications={() => handleNavigateTab('assignments')}
            onOpenProfileModal={() => setShowProfileModal(true)}
            onOpenChangePassword={() => setShowChangePasswordModal(true)}
            onOpenInstallModal={() => setShowInstallModal(true)}
            onOpenNotices={() => setShowNoticeModal(true)}
            onOpenFeedback={() => setShowFeedbackModal(true)}
            onOpenAITutor={() => handleOpenAITutor()}
          />
        )}

        {/* Optional Back to Overview Bar for deep tabs in Teacher/Student views */}
        {activeTab !== 'dashboard' && !activeQuiz && (
          <div style={{ maxWidth: isStaff ? '1100px' : '860px', margin: '0 auto', width: '100%', padding: '12px 24px 0' }}>
            <button
              onClick={() => handleNavigateTab('dashboard')}
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
          <Suspense fallback={<PageLoadingFallback />}>
            {/* 1. Quiz is running */}
            {activeQuiz && !latestAttempt && (
            <QuizRunner
              quiz={activeQuiz}
              mode={activeMode}
              onFinish={handleFinishQuiz}
              onExit={handleExitQuiz}
              bookmarkedQuestionIds={stats.bookmarkedQuestionIds}
              onToggleBookmark={toggleBookmark}
              userId={user.id}
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
              onPracticeSkill={handleOpenPracticeSkill}
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
                  onOpenPracticeSkill={handleOpenPracticeSkill}
                />
              )}

              {/* Learning Path Roadmap Tab */}
              {activeTab === 'learning_path' && (
                <LearningPathRoadmap
                  currentUser={user}
                  onStartNodePractice={(_node) => handleLaunchTrackQuiz('practice')}
                />
              )}

              {/* Practice By Skill Tab */}
              {activeTab === 'practice_skill' && (
                <PracticeBySkill
                  quizzes={allQuizzes}
                  initialSkillId={practiceSkillId}
                  onBack={() => {
                    setPracticeSkillId(undefined);
                    setActiveTab('dashboard');
                  }}
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

              {/* Unified Staff Academic & Exam Portal (Schedule + Grading + Admin + Early Warning) */}
              {isStaff && (activeTab === 'admin' || activeTab === 'schedule' || activeTab === 'assignments' || activeTab === 'early_warning') && (
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
                  onNavigateToCreator={() => handleNavigateTab('creator')}
                  onCreateStudentAccount={createStudentAccount}
                  onUpdateStudentAccount={updateStudentAccount}
                  onDeleteStudentAccount={deleteStudentAccount}
                  onCreateTeacherAccount={createTeacherAccount}
                  onUpdateTeacherAccount={updateTeacherAccount}
                  onDeleteTeacherAccount={deleteTeacherAccount}
                  schedules={schedules}
                  onCreateSchedule={createSchedule}
                  onUpdateSchedule={updateSchedule}
                  onDeleteSchedule={deleteSchedule}
                  initialSubTab={
                    activeTab === 'schedule' ? 'schedules' :
                    activeTab === 'assignments' ? 'grading_assignments' :
                    activeTab === 'early_warning' ? 'early_warning' : 'overview'
                  }
                  onNavigateToAttendance={() => handleNavigateTab('attendance')}
                  currentUser={user}
                />
              )}

              {/* Student Classroom Assignments View */}
              {!isStaff && activeTab === 'assignments' && (
                <StudentAssignmentView
                  assignments={assignments}
                  submissions={submissions}
                  currentUser={user}
                  onSubmitAssignment={submitAssignment}
                />
              )}

              {/* Student Schedule Calendar */}
              {!isStaff && activeTab === 'schedule' && (
                <ScheduleCalendar
                  currentUser={user}
                  schedules={schedules}
                  onCreateSchedule={createSchedule}
                  onUpdateSchedule={updateSchedule}
                  onDeleteSchedule={deleteSchedule}
                  onNavigateToAttendance={() => handleNavigateTab('attendance')}
                />
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
                  onSuccessNavigate={() => handleNavigateTab('admin')}
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
          </Suspense>
        </div>
      </main>

      {/* Mobile Bottom Navigation — 5-Tab model for both Student & Teacher */}
      {!activeQuiz && (
        <MobileBottomNav
          activeTab={activeTab}
          isStaff={isStaff}
          onNavigateTab={handleNavigateTab}
          onOpenProfile={() => setShowProfileModal(true)}
          onNavigateLearn={() => {
            setActiveTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateClass={() => {
            setActiveTab('attendance');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateCreds={() => {
            setActiveTab('analytics');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
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
      <Suspense fallback={null}>
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

      {/* Public Digital Certificate Verification Portal */}
      {verifyCert && (
        <CertificateVerificationModal
          certificate={verifyCert}
          onClose={() => {
            setVerifyCert(null);
            if (window.location.pathname.includes('verify')) {
              window.history.pushState(null, '', isSessionActive ? '/student' : '/');
            }
          }}
        />
      )}
      </Suspense>
    </div>
  );
}

export default App;
