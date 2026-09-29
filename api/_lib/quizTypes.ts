export type QuestionType = 'single' | 'multiple' | 'true-false' | 'fill-blank' | 'matching';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type SubjectCategory =
  | 'all'
  | 'office-fast-3in1'
  | 'cc-cntt-basic'
  | 'cc-cntt-advanced'
  | 'cntt-basic-we'
  | 'cntt-adv-we'
  | 'ai-office'
  | 'excel-accounting'
  | 'word-6b'
  | 'excel-6b'
  | 'ppt-6b'
  | 'web-frontend'
  | 'web-backend';

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
  options?: string[];
  correctAnswer?: number | number[] | boolean | string | Record<string, string>;
  explanation: string;
  matchingPairs?: MatchingPair[];
  points?: number;
  tags?: string[];
  skillId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: SubjectCategory;
  difficulty: Difficulty;
  timeLimitMinutes: number;
  questions: Question[];
  icon: string;
  badgeColor: string;
  isCustom?: boolean;
}
