// ── SKILL TAXONOMY TYPES (BA Review — Data Model) ──
// Hierarchy: Subject → Topic → Skill
// Skill là trung tâm liên kết: Nội dung học + Câu hỏi + Luyện tập + Kỳ thi + Kết quả

export interface SkillTaxonomySubject {
  id: string;
  name: string;
  code: string;           // e.g. "MOS_EXCEL", "CC_CNTT_BASIC"
  iconName?: string;
  color?: string;
  trackIds: string[];     // CurriculumTrack IDs
  topics: SkillTaxonomyTopic[];
}

export interface SkillTaxonomyTopic {
  id: string;
  subjectId: string;
  name: string;           // e.g. "Formula", "Formatting", "Database"
  orderIndex: number;
  skills: SkillTaxonomySkill[];
}

export interface SkillTaxonomySkill {
  id: string;
  topicId: string;
  subjectId: string;
  name: string;           // e.g. "VLOOKUP", "IF Function", "PivotTable"
  description?: string;
  level: 1 | 2 | 3;      // 1=Basic, 2=Intermediate, 3=Advanced
  prerequisiteIds?: string[];
  relatedQuizIds?: string[];  // Quiz IDs dùng để luyện kỹ năng này
  lessonRef?: string;         // Reference đến bài học liên quan
}

// ── SKILL SCORE MODEL (BA Review — Section 14) ──
// Tách biệt Accuracy khỏi Mastery
// Cần đủ sample size để kết luận mastery

export interface SkillScore {
  skillId: string;
  skillName: string;
  subjectId: string;
  topicId: string;

  // Raw metrics
  correctCount: number;
  wrongCount: number;
  totalAttempts: number;
  streak: number;

  // Computed scores
  accuracy: number;       // correctCount / totalAttempts * 100
  masteryScore: number;   // Weighted: accuracy*0.5 + sampleFactor*0.25 + recency*0.15 + difficulty*0.10
  confidenceLevel: 'none' | 'low' | 'medium' | 'high';
  // none = 0 câu, low = 1-4 câu, medium = 5-9 câu, high = 10+ câu

  status: 'not_started' | 'in_progress' | 'need_review' | 'mastered';
  lastAttemptAt: string;    // ISO date
  improvementTrend?: 'improving' | 'stable' | 'declining';
}

// ── WEAK SKILL DETECTION (BA Review — Section 15) ──
// Rule Engine V1 — phải explainable

export interface WeakSkill {
  skillId: string;
  skillName: string;
  subjectId: string;
  topicId: string;

  accuracy: number;
  sampleSize: number;       // Số câu đã làm
  severity: 'critical' | 'weak' | 'borderline';
  // critical  = sampleSize >= 3  AND accuracy < 40%
  // weak      = sampleSize >= 5  AND accuracy < 60%
  // borderline= sampleSize >= 5  AND accuracy < 70%

  reason: string;           // Explainable reason string
  // e.g. "Bạn đã làm 8 câu VLOOKUP, chỉ đúng 3 (37%)"

  recommendations: SkillRecommendation[];
}

export interface SkillRecommendation {
  type: 'practice_skill' | 'review_lesson' | 'take_exam' | 'watch_video';
  label: string;            // CTA label
  description: string;
  targetId?: string;        // quizId, lessonId, examId
  targetRoute?: string;     // Tab/route to navigate
  priority: 1 | 2 | 3;
}

// ── SKILL BREAKDOWN (cho QuizResult — Section 13) ──
// Phân tích kết quả thi theo skill

export interface SkillBreakdownItem {
  skillId: string;
  skillName: string;
  topicName: string;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;         // 0-100
  status: 'strong' | 'average' | 'weak';
  // strong  = accuracy >= 75%
  // average = accuracy >= 50%
  // weak    = accuracy < 50%
}

export interface ExamSkillBreakdown {
  attemptId: string;
  quizId: string;
  skillBreakdown: SkillBreakdownItem[];
  overallAccuracy: number;
  weakSkills: WeakSkill[];
  strongSkills: string[];   // skill names
}
