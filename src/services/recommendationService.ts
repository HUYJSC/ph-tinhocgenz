// ── RECOMMENDATION ENGINE V1 (BA Review — Section 16) ──
// Rule-based, không cần AI/ML ở Version 1
// Flow: Weak Skill → Related Lesson → Practice → Re-test

import { WeakSkill, SkillRecommendation } from '../types/skill';

// Skill → Related Quiz ID lookup table
// Khi có backend: fetch từ API /skills/:id/recommendations
const SKILL_TO_QUIZ_MAP: Record<string, string[]> = {
  // Excel skills
  'skill-vlookup':      ['quiz-excel-6b', 'quiz-cc-cntt-basic'],
  'skill-if-func':      ['quiz-excel-6b', 'quiz-cc-cntt-basic'],
  'skill-countif':      ['quiz-excel-6b'],
  'skill-pivot-table':  ['quiz-excel-accounting', 'quiz-excel-6b'],
  'skill-sum':          ['quiz-office-fast-3in1', 'quiz-excel-6b'],
  'skill-formatting-excel': ['quiz-excel-6b'],

  // Word skills
  'skill-word-styles':  ['quiz-word-6b', 'quiz-office-fast-3in1'],
  'skill-word-table':   ['quiz-word-6b'],
  'skill-word-header':  ['quiz-word-6b'],

  // Computer basics
  'skill-hardware':     ['quiz-cc-cntt-basic'],
  'skill-network':      ['quiz-cc-cntt-basic', 'quiz-cc-cntt-advanced'],
  'skill-security':     ['quiz-cc-cntt-advanced'],
  'skill-os-windows':   ['quiz-cc-cntt-basic'],
  'skill-internet':     ['quiz-cc-cntt-basic'],
};

// Skill → Lesson reference (khi có backend: lesson URL)
const SKILL_TO_LESSON_MAP: Record<string, string> = {
  'skill-vlookup':      'Bài: Hàm VLOOKUP trong Excel',
  'skill-if-func':      'Bài: Hàm IF và IF lồng nhau',
  'skill-countif':      'Bài: COUNTIF và COUNTIFS',
  'skill-pivot-table':  'Bài: PivotTable — Phân tích dữ liệu',
  'skill-hardware':     'Bài: Cấu trúc máy tính và thiết bị ngoại vi',
  'skill-network':      'Bài: Mạng máy tính và Internet',
  'skill-security':     'Bài: Bảo mật thông tin cơ bản',
};

export class RecommendationService {
  /**
   * [BA Section 16] Generate recommendations cho weak skills
   * Priority: Practice → Lesson → Re-test
   */
  static generateForWeakSkill(weakSkill: WeakSkill): SkillRecommendation[] {
    const recommendations: SkillRecommendation[] = [];
    const relatedQuizIds = SKILL_TO_QUIZ_MAP[weakSkill.skillId] || [];
    const relatedLesson = SKILL_TO_LESSON_MAP[weakSkill.skillId];

    // Priority 1: Practice (luôn đề xuất đầu tiên)
    if (relatedQuizIds.length > 0) {
      recommendations.push({
        type: 'practice_skill',
        label: `Luyện ${weakSkill.skillName}`,
        description: `Làm thêm câu hỏi về kỹ năng "${weakSkill.skillName}" để cải thiện (hiện tại: ${weakSkill.accuracy}%)`,
        targetId: relatedQuizIds[0],
        targetRoute: 'quizzes',
        priority: 1
      });
    }

    // Priority 2: Lesson review
    if (relatedLesson) {
      recommendations.push({
        type: 'review_lesson',
        label: `Xem lại bài học`,
        description: relatedLesson,
        targetRoute: 'learning_path',
        priority: 2
      });
    }

    // Priority 3: Re-test sau khi luyện
    if (relatedQuizIds.length > 0) {
      recommendations.push({
        type: 'take_exam',
        label: 'Thi thử lại',
        description: `Kiểm tra lại sau khi ôn tập "${weakSkill.skillName}"`,
        targetId: relatedQuizIds[0],
        targetRoute: 'quizzes',
        priority: 3
      });
    }

    return recommendations;
  }

  /**
   * Generate recommendations for a list of weak skills
   * Returns top 3 most actionable recommendations
   */
  static generateDashboardRecommendations(weakSkills: WeakSkill[]): {
    title: string;
    description: string;
    actionLabel: string;
    targetRoute: string;
    targetId?: string;
    severity: WeakSkill['severity'];
    skillId: string;
    skillName: string;
  }[] {
    const recs: ReturnType<typeof this.generateDashboardRecommendations> = [];

    // Take top 3 weakest skills
    weakSkills.slice(0, 3).forEach(skill => {
      const skillRecs = this.generateForWeakSkill(skill);
      const primary = skillRecs[0];
      if (!primary) return;

      recs.push({
        title: primary.label,
        description: skill.reason,
        actionLabel: primary.label,
        targetRoute: primary.targetRoute || 'quizzes',
        targetId: primary.targetId,
        severity: skill.severity,
        skillId: skill.skillId,
        skillName: skill.skillName
      });
    });

    return recs;
  }

  /**
   * Generate next action items for Student Dashboard
   * "Việc cần làm tiếp theo" — task-oriented
   */
  static getNextActions(
    weakSkills: WeakSkill[],
    hasActiveQuiz: boolean,
    dueSmartReviews: number
  ): { priority: number; label: string; description: string; icon: string; targetRoute: string; targetId?: string }[] {
    const actions: ReturnType<typeof this.getNextActions> = [];

    // 1. Smart review (due cards from spaced repetition)
    if (dueSmartReviews > 0) {
      actions.push({
        priority: 1,
        label: `Ôn lại ${dueSmartReviews} câu sai`,
        description: 'Spaced repetition — ôn tập câu hỏi cần nhớ lại hôm nay',
        icon: 'RotateCcw',
        targetRoute: 'smart_review'
      });
    }

    // 2. Practice weak skills
    weakSkills.filter(s => s.severity === 'critical' || s.severity === 'weak').slice(0, 2).forEach(skill => {
      const recQuizId = (SKILL_TO_QUIZ_MAP[skill.skillId] || [])[0];
      actions.push({
        priority: 2,
        label: `Luyện tập: ${skill.skillName}`,
        description: `${skill.accuracy}% đúng — cần cải thiện`,
        icon: 'Dumbbell',
        targetRoute: 'quizzes',
        targetId: recQuizId
      });
    });

    // 3. Take exam if no active quiz
    if (!hasActiveQuiz && weakSkills.length === 0) {
      actions.push({
        priority: 3,
        label: 'Thi thử để kiểm tra trình độ',
        description: 'Bạn đang học tốt! Hãy thử sức với đề thi',
        icon: 'FileText',
        targetRoute: 'quizzes'
      });
    }

    return actions.sort((a, b) => a.priority - b.priority).slice(0, 3);
  }
}
