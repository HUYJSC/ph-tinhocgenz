export type QuestionType = 'single' | 'multiple' | 'true-false' | 'fill-blank' | 'matching';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type SubjectCategory =
  | 'all'
  | 'mos-excel'
  | 'mos-word'
  | 'mos-powerpoint'
  | 'ic3-gs'
  | 'programming'
  | 'general-it';

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  codeSnippet?: string;
  options?: string[]; // for single and multiple choice
  correctAnswer?: number | number[] | boolean | string; // index/indices or true/false or exact string
  matchingPairs?: MatchingPair[]; // for matching type
  explanation: string;
  hint?: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: SubjectCategory;
  difficulty: Difficulty;
  timeLimitMinutes: number; // 0 for untimed
  icon: string;
  badgeColor: string;
  questions: Question[];
  author?: string;
  createdAt?: string;
  isCustom?: boolean;
}

export interface QuestionResult {
  questionId: string;
  userAnswer: any;
  isCorrect: boolean;
  scoreEarned: number;
  timeSpentSeconds: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  category: SubjectCategory;
  mode: 'exam' | 'practice' | 'flashcards';
  score: number;
  maxScore: number;
  percentage: number;
  totalQuestions: number;
  correctCount: number;
  timeSpentSeconds: number;
  completedAt: string;
  questionResults: QuestionResult[];
}

export interface UserStats {
  totalQuizzesTaken: number;
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  history: QuizAttempt[];
  bookmarkedQuestionIds: string[];
  unlockedBadgeIds: string[];
  studentName: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirementType: 'quizzes' | 'score' | 'streak' | 'custom_quiz' | 'perfect';
  requirementValue: number;
}
