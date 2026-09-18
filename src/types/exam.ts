// Server-side exam types
export interface ExamSession {
  session_id: string;
  quiz_id: string;
  deadline_at: string; // ISO timestamp từ server
  time_limit_seconds: number;
  started_at: string;
  is_finalized: boolean;
}

export interface QuestionForClient {
  id: string;
  type: 'single' | 'multiple' | 'true-false' | 'fill-blank' | 'matching';
  prompt: string;
  codeSnippet?: string;
  options?: string[]; // for single and multiple
  matchingPairs?: Array<{ id: string; left: string }>; // right values STRIPPED
  hint?: string;
  points: number;
  skillId?: string;
  // NOTE: correctAnswer is NEVER included
}

export interface ExamStartResponse {
  session_id: string;
  deadline_at: string;
  time_limit_seconds: number;
  questions: QuestionForClient[];
  quiz_title: string;
  quiz_id: string;
}

export interface ExamSubmitRequest {
  session_id: string;
  answers: Record<string, any>;
}

export interface QuestionServerResult {
  question_id: string;
  is_correct: boolean;
  score_earned: number;
  max_points: number;
  user_answer: any;
}

export interface ExamResult {
  score: number;
  max_score: number;
  percentage: number;
  correct_count: number;
  total_questions: number;
  time_spent_seconds: number;
  question_results: QuestionServerResult[];
  certificate_issued?: boolean;
  certificate_id?: string;
}
