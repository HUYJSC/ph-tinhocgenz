import { CurriculumTrack } from './auth';

// ── 1. SKILL & MASTERY ──
export type SkillStatus = 'not_started' | 'in_progress' | 'need_review' | 'mastered';

export interface SkillNode {
  id: string;
  name: string;
  category: CurriculumTrack | 'general_office';
  description: string;
  level: 1 | 2 | 3 | 4 | 5;
  iconName?: string;
  prerequisites?: string[]; // IDs of required predecessor skills
}

export interface MasteryRecord {
  skillId: string;
  skillName: string;
  category: CurriculumTrack;
  masteryScore: number; // 0 to 100
  correctCount: number;
  wrongCount: number;
  totalAttempts: number;
  lastAttemptDate: string; // ISO date
  status: SkillStatus;
  streak: number;
}

// ── 2. SMART REVIEW (ERROR VAULT & SPACED REPETITION) ──
export interface SmartReviewItem {
  id: string;
  studentId: string;
  questionId: string;
  skillId: string;
  skillName: string;
  category: CurriculumTrack;
  prompt: string;
  options: string[];
  correctAnswer: number | number[];
  userAnswer: number | number[];
  explanation: string;
  mistakeCount: number;
  firstMistakeAt: string;
  lastMistakeAt: string;
  nextReviewDate: string; // ISO date
  intervalDays: number;
  isResolved: boolean;
  notes?: string;
}

// ── 3. LEARNING PATH & ROADMAP ──
export interface LearningPathNode {
  id: string;
  title: string;
  skillIds: string[];
  estimatedMinutes: number;
  isCompleted: boolean;
  masteryScore: number; // 0 to 100
  isCurrentTarget: boolean;
  order: number;
}

export interface StudentLearningPath {
  studentId: string;
  track: CurriculumTrack;
  trackName: string;
  targetGoal: string;
  currentLevel: string;
  overallMastery: number; // 0 to 100
  nodes: LearningPathNode[];
  createdAt: string;
  updatedAt: string;
}

// ── 4. DIAGNOSTIC ONBOARDING ──
export interface DiagnosticQuestion {
  id: string;
  skillId: string;
  skillName: string;
  category: CurriculumTrack;
  prompt: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface DiagnosticResult {
  studentId: string;
  track: CurriculumTrack;
  targetGoal: string;
  totalScore: number; // percentage
  skillBreakdown: { [skillId: string]: { name: string; score: number } };
  strengths: string[];
  weaknesses: string[];
  recommendedStartNodeId: string;
  completedAt: string;
}

// ── 5. AI TUTOR COMPANION ──
export type AITutorMode = 'explain' | 'hint' | 'quiz_check';

export interface AITutorMessage {
  id: string;
  sender: 'student' | 'ai';
  text: string;
  mode?: AITutorMode;
  suggestedAction?: {
    label: string;
    actionType: 'open_lesson' | 'review_skill' | 'take_quiz';
    payload?: string;
  };
  timestamp: string;
}

// ── 6. EARLY WARNING & RISK SCORE (TEACHER) ──
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface StudentRiskProfile {
  studentId: string;
  studentName: string;
  studentCode: string;
  enrolledTracks: CurriculumTrack[];
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  factors: string[];
  lastActiveDaysAgo: number;
  averageMastery: number;
  recentScoresTrend: 'improving' | 'stable' | 'declining';
  unresolvedMistakesCount: number;
  suggestedAction: string;
}

// ── 7. VERIFIABLE QR CERTIFICATE ──
export interface DigitalCertificate {
  certificateId: string; // e.g. TGZ-MOS-2026-02831
  studentName: string;
  studentCode: string;
  courseTitle: string;
  track: CurriculumTrack;
  issueDate: string;
  finalScore: number;
  honorsTitle?: string; // e.g. "Thủ Khoa Khóa Học", "Xuất Sắc"
  verificationUrl: string;
  status: 'valid' | 'revoked';
}

// ── 8. LEARNING EVENTS (EDTECH ANALYTICS) ──
export type LearningEventType =
  | 'lesson_started'
  | 'lesson_completed'
  | 'video_progress'
  | 'question_answered'
  | 'question_wrong'
  | 'quiz_started'
  | 'quiz_completed'
  | 'exam_started'
  | 'exam_completed'
  | 'ai_question_asked'
  | 'review_started'
  | 'review_completed'
  | 'skill_mastered'
  | 'onboarding_completed'
  | 'certificate_earned';

export interface LearningEvent {
  id: string;
  userId: string;
  eventType: LearningEventType;
  track?: CurriculumTrack;
  skillId?: string;
  questionId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  sessionId: string;
  device?: string;
}
