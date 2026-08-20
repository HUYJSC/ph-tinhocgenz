import { useState, useEffect } from 'react';
import { Quiz, QuizAttempt, UserStats } from '../types/quiz';
import { DEFAULT_QUIZZES } from '../data/defaultQuizzes';
import { DEFAULT_BADGES } from '../data/badges';

const STATS_KEY = 'eduquest_user_stats_v1';
const CUSTOM_QUIZZES_KEY = 'eduquest_custom_quizzes_v1';
const THEME_KEY = 'eduquest_theme_mode';

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
  studentName: 'Học viên EduQuest'
};

export function useAppStorage() {
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_KEY);
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
      const saved = localStorage.getItem(CUSTOM_QUIZZES_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load custom quizzes from localStorage', e);
    }
    return [];
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      // fallback
    }
    return 'dark';
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

  // Combine default quizzes and custom quizzes
  const allQuizzes: Quiz[] = [...DEFAULT_QUIZZES, ...customQuizzes];

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

    // Check custom quiz badge
    checkAndUnlockBadges({ ...stats }, 1);
    return newQuiz;
  };

  const deleteCustomQuiz = (quizId: string) => {
    setCustomQuizzes(prev => prev.filter(q => q.id !== quizId));
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
    deleteCustomQuiz,
    toggleBookmark,
    recordAttempt,
    resetAllProgress
  };
}
