import { useState, useEffect, useRef, useCallback } from 'react';
import { Quiz, Question, QuestionResult, QuizAttempt } from '../types/quiz';
import { soundFx } from '../utils/audio';

// [BA FIX] Autosave key generator for exam recovery
const getAutosaveKey = (quizId: string, userId?: string) =>
  `phtgz_exam_autosave_${quizId}_${userId || 'anon'}`;

export interface AutosaveState {
  quizId: string;
  answers: Record<string, any>;
  currentIndex: number;
  flaggedQuestions: Record<string, boolean>;
  savedAt: string;
  startTime: number;
}

export type QuizMode = 'exam' | 'practice' | 'flashcards';

interface UseQuizEngineProps {
  quiz: Quiz;
  mode: QuizMode;
  onFinish: (attempt: QuizAttempt) => void;
  userId?: string; // for autosave scoping
}

export function useQuizEngine({ quiz, mode, onFinish, userId }: UseQuizEngineProps) {
  // [BA FIX] Try to restore autosave state for exam mode
  const autosaveKey = getAutosaveKey(quiz.id, userId);
  const savedState: AutosaveState | null = (() => {
    if (mode !== 'exam') return null;
    try {
      const raw = localStorage.getItem(autosaveKey);
      if (!raw) return null;
      const parsed: AutosaveState = JSON.parse(raw);
      // Only restore if same quiz and saved within 3 hours
      if (parsed.quizId === quiz.id) {
        const age = Date.now() - new Date(parsed.savedAt).getTime();
        if (age < 3 * 60 * 60 * 1000) return parsed;
      }
    } catch { }
    return null;
  })();

  const [currentIndex, setCurrentIndex] = useState(savedState?.currentIndex || 0);
  const [answers, setAnswers] = useState<Record<string, any>>(savedState?.answers || {});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>(savedState?.flaggedQuestions || {});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [wasRestored] = useState(!!savedState); // notify UI that we restored
  const [startTime] = useState<number>(savedState?.startTime || Date.now());
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (quiz.timeLimitMinutes <= 0) return 0;
    if (savedState) {
      // Calculate remaining time accounting for time already elapsed
      const elapsed = Math.floor((Date.now() - savedState.startTime) / 1000);
      const total = quiz.timeLimitMinutes * 60;
      return Math.max(0, total - elapsed);
    }
    return quiz.timeLimitMinutes * 60;
  });
  const [questionTimeSpents, setQuestionTimeSpents] = useState<Record<string, number>>({});
  const lastQuestionSwitchTime = useRef<number>(Date.now());


  const currentQuestion: Question | undefined = quiz.questions[currentIndex];

  // Evaluate single question answer
  const isQuestionCorrect = useCallback((question: Question, userAnswer: any): boolean => {
    if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
      return false;
    }

    switch (question.type) {
      case 'single':
        return Number(userAnswer) === Number(question.correctAnswer);

      case 'true-false':
        return Boolean(userAnswer) === Boolean(question.correctAnswer);

      case 'multiple': {
        if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswer)) return false;
        if (userAnswer.length !== question.correctAnswer.length) return false;
        const sortedUser = [...userAnswer].sort((a, b) => a - b);
        const sortedCorrect = [...question.correctAnswer].sort((a, b) => a - b);
        return sortedUser.every((val, idx) => val === sortedCorrect[idx]);
      }

      case 'fill-blank': {
        if (typeof userAnswer !== 'string' || typeof question.correctAnswer !== 'string') return false;
        // Normalize whitespace and accents if any
        return userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
      }

      case 'matching': {
        if (!question.matchingPairs || typeof userAnswer !== 'object') return false;
        // userAnswer should be record of pairId -> selected right value
        return question.matchingPairs.every(
          pair => userAnswer[pair.id] === pair.right
        );
      }

      default:
        return false;
    }
  }, []);

  // Update time spent on current question when navigating
  const recordQuestionTime = useCallback(() => {
    if (!currentQuestion) return;
    const now = Date.now();
    const elapsed = Math.max(1, Math.round((now - lastQuestionSwitchTime.current) / 1000));
    setQuestionTimeSpents(prev => ({
      ...prev,
      [currentQuestion.id]: (prev[currentQuestion.id] || 0) + elapsed
    }));
    lastQuestionSwitchTime.current = now;
  }, [currentQuestion]);

  // Submit quiz function
  // [BA FIX] Clear autosave data on submit
  const clearAutosave = useCallback(() => {
    try { localStorage.removeItem(autosaveKey); } catch { }
  }, [autosaveKey]);

  const submitQuiz = useCallback(() => {
    if (isSubmitted) return;
    recordQuestionTime();
    setIsSubmitted(true);

    const questionResults: QuestionResult[] = quiz.questions.map(q => {
      const userAnswer = answers[q.id];
      const correct = isQuestionCorrect(q, userAnswer);
      return {
        questionId: q.id,
        userAnswer,
        isCorrect: correct,
        scoreEarned: correct ? q.points : 0,
        timeSpentSeconds: questionTimeSpents[q.id] || 0
      };
    });

    const totalQuestions = quiz.questions.length;
    const correctCount = questionResults.filter(r => r.isCorrect).length;
    const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const score = questionResults.reduce((sum, r) => sum + r.scoreEarned, 0);
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    if (percentage >= 80) {
      soundFx.playFanfare();
    } else {
      soundFx.playCorrect();
    }

    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      category: quiz.category,
      mode,
      score,
      maxScore,
      percentage,
      totalQuestions,
      correctCount,
      timeSpentSeconds,
      completedAt: new Date().toISOString(),
      questionResults
    };

    onFinish(attempt);
    clearAutosave(); // [BA FIX] Clear saved state after successful submit
  }, [isSubmitted, recordQuestionTime, quiz, answers, isQuestionCorrect, questionTimeSpents, startTime, mode, onFinish, clearAutosave]);


  // [BA FIX] Autosave every 30 seconds in exam mode
  useEffect(() => {
    if (mode !== 'exam' || isSubmitted) return;
    const save = () => {
      try {
        const state: AutosaveState = {
          quizId: quiz.id,
          answers,
          currentIndex,
          flaggedQuestions,
          savedAt: new Date().toISOString(),
          startTime
        };
        localStorage.setItem(autosaveKey, JSON.stringify(state));
      } catch { }
    };
    save(); // immediate save on change
    const interval = setInterval(save, 30_000);
    return () => clearInterval(interval);
  }, [mode, isSubmitted, answers, currentIndex, flaggedQuestions, quiz.id, autosaveKey, startTime]);

  // Timer countdown for Exam mode
  useEffect(() => {
    if (mode !== 'exam' || quiz.timeLimitMinutes <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, quiz.timeLimitMinutes, isSubmitted, submitQuiz]);

  const setAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));

    if (mode === 'practice') {
      const q = quiz.questions.find(item => item.id === questionId);
      if (q) {
        const correct = isQuestionCorrect(q, answer);
        if (correct) {
          soundFx.playCorrect();
        } else {
          soundFx.playIncorrect();
        }
      }
    } else {
      soundFx.playClick();
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < quiz.questions.length) {
      recordQuestionTime();
      setCurrentIndex(index);
      soundFx.playClick();
    }
  };

  const nextQuestion = () => {
    if (currentIndex < quiz.questions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
    soundFx.playClick();
  };

  const revealHint = (questionId: string) => {
    setRevealedHints(prev => ({
      ...prev,
      [questionId]: true
    }));
    soundFx.playClick();
  };

  const answeredCount = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== '').length;

  return {
    currentIndex,
    currentQuestion,
    totalQuestions: quiz.questions.length,
    answers,
    revealedHints,
    flaggedQuestions,
    remainingSeconds,
    isSubmitted,
    answeredCount,
    wasRestored,   // [BA FIX] true if state was recovered from autosave
    setAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    toggleFlag,
    revealHint,
    submitQuiz,
    isQuestionCorrect
  };
}
