import { useState, useEffect, useMemo } from 'react';
import { Quiz, QuizAttempt, UserStats, Question } from '../types/quiz';
import { DEFAULT_QUIZZES } from '../data/defaultQuizzes';
import { DEFAULT_BADGES } from '../data/badges';
import { SystemBackupService } from '../services/systemBackupService';

const STATS_KEY = 'phtinhocgenz_user_stats_v1';
const LEGACY_STATS_KEY = 'eduquest_user_stats_v1';
const CUSTOM_QUIZZES_KEY = 'phtinhocgenz_custom_quizzes_v1';
const LEGACY_CUSTOM_QUIZZES_KEY = 'eduquest_custom_quizzes_v1';
const QUIZ_OVERRIDES_KEY = 'phtinhocgenz_quiz_overrides_v1';
const DELETED_QUIZZES_KEY = 'phtinhocgenz_deleted_quizzes_v1';
const THEME_KEY = 'phtinhocgenz_theme_mode';

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const initialStats: UserStats = {
  totalQuizzesTaken: 0,
  totalPoints: 0,
  currentStreak: 1,
  bestStreak: 1,
  lastActiveDate: getTodayString(),
  history: [],
  bookmarkedQuestionIds: [],
  unlockedBadgeIds: ['first_quiz'],
  studentName: 'Học viên TINHOCGENZ'
};

export function useAppStorage() {
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_KEY) || localStorage.getItem(LEGACY_STATS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load stats from localStorage', e);
    }
    return initialStats;
  });

  const [customQuizzes, setCustomQuizzes] = useState<Quiz[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_QUIZZES_KEY) || localStorage.getItem(LEGACY_CUSTOM_QUIZZES_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load custom quizzes from localStorage', e);
    }
    return [];
  });

  const [quizOverrides, setQuizOverrides] = useState<Record<string, Quiz>>(() => {
    try {
      const saved = localStorage.getItem(QUIZ_OVERRIDES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load quiz overrides', e);
    }
    return {};
  });

  const [deletedQuizIds, setDeletedQuizIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(DELETED_QUIZZES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load deleted quiz ids', e);
    }
    return [];
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY) || localStorage.getItem('eduquest_theme_mode');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      // fallback
    }
    return 'light';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save stats', e);
    }
  }, [stats]);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_QUIZZES_KEY, JSON.stringify(customQuizzes));
    } catch (e) {
      console.error('Failed to save custom quizzes', e);
    }
  }, [customQuizzes]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      // fallback
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(QUIZ_OVERRIDES_KEY, JSON.stringify(quizOverrides));
    } catch (e) {
      console.error('Failed to save quiz overrides', e);
    }
  }, [quizOverrides]);

  useEffect(() => {
    try {
      localStorage.setItem(DELETED_QUIZZES_KEY, JSON.stringify(deletedQuizIds));
    } catch (e) {
      console.error('Failed to save deleted quiz ids', e);
    }
  }, [deletedQuizIds]);

  // Listen to cross-tab synchronization events
  useEffect(() => {
    const unsub = SystemBackupService.onSync((event) => {
      if (['QUIZ_CREATED', 'QUIZ_UPDATED', 'QUIZ_DELETED', 'QUESTION_UPDATED', 'QUESTION_DELETED', 'SYSTEM_RESTORE'].includes(event.type)) {
        try {
          const savedCustom = localStorage.getItem(CUSTOM_QUIZZES_KEY);
          if (savedCustom) setCustomQuizzes(JSON.parse(savedCustom));
          const savedOverrides = localStorage.getItem(QUIZ_OVERRIDES_KEY);
          if (savedOverrides) setQuizOverrides(JSON.parse(savedOverrides));
          const savedDeleted = localStorage.getItem(DELETED_QUIZZES_KEY);
          if (savedDeleted) setDeletedQuizIds(JSON.parse(savedDeleted));
        } catch (e) {
          console.error('Failed to reload synced quiz state', e);
        }
      }
    });
    return unsub;
  }, []);

  // Combine default quizzes and custom quizzes with overrides & deleted filters (Admin full edit power)
  const allQuizzes: Quiz[] = useMemo(() => {
    const combined = [...DEFAULT_QUIZZES, ...customQuizzes];
    return combined
      .filter(q => !deletedQuizIds.includes(q.id))
      .map(q => quizOverrides[q.id] ? { ...q, ...quizOverrides[q.id] } : q);
  }, [customQuizzes, quizOverrides, deletedQuizIds]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const updateStudentName = (name: string) => {
    setStats(prev => ({ ...prev, studentName: name }));
  };

  const addCustomQuiz = (quiz: Quiz) => {
    const newQuiz: Quiz = {
      ...quiz,
      id: `custom-${Date.now()}`,
      isCustom: true,
      createdAt: getTodayString()
    };
    setCustomQuizzes(prev => [newQuiz, ...prev]);

    // Record Audit & Broadcast
    SystemBackupService.recordAuditLog('CREATE', 'QUIZ', `Tạo đề thi mới: ${newQuiz.title}`);
    SystemBackupService.broadcastEvent('QUIZ_CREATED', { id: newQuiz.id });

    // Check custom quiz badge
    checkAndUnlockBadges({ ...stats }, 1);
    return newQuiz;
  };

  const updateQuiz = (updatedQuiz: Quiz) => {
    const isCustom = customQuizzes.some(q => q.id === updatedQuiz.id);
    if (isCustom) {
      setCustomQuizzes(prev => prev.map(q => q.id === updatedQuiz.id ? updatedQuiz : q));
    } else {
      setQuizOverrides(prev => ({ ...prev, [updatedQuiz.id]: updatedQuiz }));
    }

    // Record Audit & Broadcast
    SystemBackupService.recordAuditLog('UPDATE', 'QUIZ', `Cập nhật đề thi: ${updatedQuiz.title}`);
    SystemBackupService.broadcastEvent('QUIZ_UPDATED', { id: updatedQuiz.id });
  };

  const deleteQuiz = (quizId: string) => {
    const target = allQuizzes.find(q => q.id === quizId);
    setCustomQuizzes(prev => prev.filter(q => q.id !== quizId));
    setDeletedQuizIds(prev => prev.includes(quizId) ? prev : [...prev, quizId]);

    // Record Audit & Broadcast
    SystemBackupService.recordAuditLog('DELETE', 'QUIZ', `Xóa đề thi: ${target?.title || quizId}`);
    SystemBackupService.broadcastEvent('QUIZ_DELETED', { id: quizId });
  };

  const deleteCustomQuiz = (quizId: string) => {
    deleteQuiz(quizId);
  };

  const updateQuestion = (quizId: string, questionIndex: number, updatedQuestion: Partial<Question>) => {
    const targetQuiz = allQuizzes.find(q => q.id === quizId);
    if (!targetQuiz) return;
    const newQuestions = [...targetQuiz.questions];
    if (questionIndex >= 0 && questionIndex < newQuestions.length) {
      newQuestions[questionIndex] = { ...newQuestions[questionIndex], ...updatedQuestion } as Question;
      updateQuiz({ ...targetQuiz, questions: newQuestions });

      // Record Audit & Broadcast
      SystemBackupService.recordAuditLog('UPDATE', 'QUESTION', `Sửa câu hỏi #${questionIndex + 1} đề "${targetQuiz.title}"`);
      SystemBackupService.broadcastEvent('QUESTION_UPDATED', { quizId, questionIndex });
    }
  };

  const deleteQuestion = (quizId: string, questionIndex: number) => {
    const targetQuiz = allQuizzes.find(q => q.id === quizId);
    if (!targetQuiz) return;
    const newQuestions = targetQuiz.questions.filter((_, idx) => idx !== questionIndex);
    updateQuiz({ ...targetQuiz, questions: newQuestions });

    // Record Audit & Broadcast
    SystemBackupService.recordAuditLog('DELETE', 'QUESTION', `Xóa câu hỏi #${questionIndex + 1} khỏi đề "${targetQuiz.title}"`);
    SystemBackupService.broadcastEvent('QUESTION_DELETED', { quizId, questionIndex });
  };

  const toggleBookmark = (questionId: string) => {
    setStats(prev => {
      const exists = prev.bookmarkedQuestionIds.includes(questionId);
      const updated = exists
        ? prev.bookmarkedQuestionIds.filter(id => id !== questionId)
        : [...prev.bookmarkedQuestionIds, questionId];
      return { ...prev, bookmarkedQuestionIds: updated };
    });
  };

  const checkAndUnlockBadges = (currentStats: UserStats, customCount: number = customQuizzes.length): string[] => {
    const newUnlocked = [...currentStats.unlockedBadgeIds];
    
    DEFAULT_BADGES.forEach(badge => {
      if (newUnlocked.includes(badge.id)) return;

      let eligible = false;
      if (badge.requirementType === 'quizzes' && currentStats.totalQuizzesTaken >= badge.requirementValue) {
        eligible = true;
      } else if (badge.requirementType === 'score' && currentStats.totalPoints >= badge.requirementValue) {
        eligible = true;
      } else if (badge.requirementType === 'streak' && currentStats.currentStreak >= badge.requirementValue) {
        eligible = true;
      } else if (badge.requirementType === 'custom_quiz' && customCount >= badge.requirementValue) {
        eligible = true;
      } else if (badge.requirementType === 'perfect') {
        const hasPerfect = currentStats.history.some(h => h.percentage === 100);
        if (hasPerfect) eligible = true;
      }

      if (eligible) {
        newUnlocked.push(badge.id);
      }
    });

    return newUnlocked;
  };

  const recordAttempt = (attempt: QuizAttempt) => {
    const today = getTodayString();
    
    setStats(prev => {
      let streak = prev.currentStreak;
      const last = prev.lastActiveDate;

      if (last) {
        const lastDate = new Date(last);
        const currDate = new Date(today);
        const diffTime = currDate.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

        if (diffDays === 1) {
          streak += 1;
        } else if (diffDays > 1) {
          streak = 1;
        }
      } else {
        streak = 1;
      }

      const bestStreak = Math.max(streak, prev.bestStreak);
      const totalPoints = prev.totalPoints + attempt.score;
      const totalQuizzes = prev.totalQuizzesTaken + 1;
      const updatedHistory = [attempt, ...prev.history].slice(0, 50); // Keep last 50 attempts

      const tempStats: UserStats = {
        ...prev,
        totalQuizzesTaken: totalQuizzes,
        totalPoints,
        currentStreak: streak,
        bestStreak,
        lastActiveDate: today,
        history: updatedHistory
      };

      const unlockedBadges = checkAndUnlockBadges(tempStats, customQuizzes.length);

      return {
        ...tempStats,
        unlockedBadgeIds: unlockedBadges
      };
    });
  };

  const resetAllProgress = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ và điểm số không?')) {
      const reset = { ...initialStats, studentName: stats.studentName };
      setStats(reset);
      localStorage.setItem(STATS_KEY, JSON.stringify(reset));
    }
  };

  return {
    stats,
    allQuizzes,
    customQuizzes,
    theme,
    toggleTheme,
    updateStudentName,
    addCustomQuiz,
    updateQuiz,
    deleteQuiz,
    deleteCustomQuiz,
    updateQuestion,
    deleteQuestion,
    toggleBookmark,
    recordAttempt,
    resetAllProgress
  };
}
