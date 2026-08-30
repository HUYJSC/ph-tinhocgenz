// ── WEAK SKILL DETECTION SERVICE (BA Review — Section 15) ──
// Rule Engine V1: Explainable, không cần Machine Learning
// Rule: questions >= 5 AND accuracy < 60% → Weak Skill
// Rule: questions >= 3 AND accuracy < 40% → Critical (Early Detection)

import { WeakSkill, SkillBreakdownItem } from '../types/skill';
import { QuizAttempt, Quiz } from '../types/quiz';

// Minimum sample sizes for conclusions
const MIN_SAMPLE_WEAK = 5;        // >= 5 câu để kết luận "yếu"
const MIN_SAMPLE_CRITICAL = 3;   // >= 3 câu để kết luận "cực yếu"
const MIN_SAMPLE_BORDERLINE = 5; // >= 5 câu để kết luận "cần chú ý"

const THRESHOLD_CRITICAL   = 40; // accuracy < 40% → Critical Weak
const THRESHOLD_WEAK       = 60; // accuracy < 60% → Weak
const THRESHOLD_BORDERLINE = 70; // accuracy < 70% → Borderline

export class WeakSkillService {
  /**
   * [BA Section 15] Detect weak skills từ kết quả QuizAttempt
   * Rule-based, explainable output
   */
  static detectFromAttempt(quiz: Quiz, attempt: QuizAttempt): WeakSkill[] {
    // Group question results by skillId
    const skillMap: Record<string, { skillId: string; skillName: string; correct: number; total: number; subjectId?: string; topicId?: string }> = {};

    quiz.questions.forEach(q => {
      const skillId = q.skillId;
      if (!skillId) return; // skip untagged questions

      if (!skillMap[skillId]) {
        skillMap[skillId] = {
          skillId,
          skillName: q.skillId || 'Không xác định',
          subjectId: q.subjectId,
          topicId: q.topicId,
          correct: 0,
          total: 0
        };
      }

      const result = attempt.questionResults.find(r => r.questionId === q.id);
      skillMap[skillId].total += 1;
      if (result?.isCorrect) skillMap[skillId].correct += 1;
    });

    const weakSkills: WeakSkill[] = [];

    Object.values(skillMap).forEach(skill => {
      const accuracy = skill.total > 0 ? Math.round((skill.correct / skill.total) * 100) : 0;

      let severity: WeakSkill['severity'] | null = null;

      if (skill.total >= MIN_SAMPLE_CRITICAL && accuracy < THRESHOLD_CRITICAL) {
        severity = 'critical';
      } else if (skill.total >= MIN_SAMPLE_WEAK && accuracy < THRESHOLD_WEAK) {
        severity = 'weak';
      } else if (skill.total >= MIN_SAMPLE_BORDERLINE && accuracy < THRESHOLD_BORDERLINE) {
        severity = 'borderline';
      }

      if (!severity) return;

      const reason = `Bạn đã làm ${skill.total} câu về "${skill.skillName}", chỉ đúng ${skill.correct} (${accuracy}%)`;

      weakSkills.push({
        skillId: skill.skillId,
        skillName: skill.skillName,
        subjectId: skill.subjectId || '',
        topicId: skill.topicId || '',
        accuracy,
        sampleSize: skill.total,
        severity,
        reason,
        recommendations: [] // filled by RecommendationService
      });
    });

    // Sort: critical first, then by accuracy ascending
    return weakSkills.sort((a, b) => {
      const order = { critical: 0, weak: 1, borderline: 2 };
      if (order[a.severity] !== order[b.severity]) return order[a.severity] - order[b.severity];
      return a.accuracy - b.accuracy;
    });
  }

  /**
   * [BA Section 13] Compute skill breakdown for QuizResult display
   */
  static computeSkillBreakdown(quiz: Quiz, attempt: QuizAttempt): SkillBreakdownItem[] {
    const skillMap: Record<string, {
      skillId: string; skillName: string; topicName: string;
      correct: number; total: number;
    }> = {};

    quiz.questions.forEach(q => {
      const skillId = q.skillId || `no-skill-${q.topicId || 'general'}`;
      const skillName = q.skillId
        ? q.skillId.replace(/skill-/g, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : 'Kiến thức chung';
      const topicName = q.topicId
        ? q.topicId.replace(/topic-/g, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : 'Chủ đề chung';

      if (!skillMap[skillId]) {
        skillMap[skillId] = { skillId, skillName, topicName, correct: 0, total: 0 };
      }

      const result = attempt.questionResults.find(r => r.questionId === q.id);
      skillMap[skillId].total += 1;
      if (result?.isCorrect) skillMap[skillId].correct += 1;
    });

    return Object.values(skillMap).map(s => {
      const accuracy = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
      const status: SkillBreakdownItem['status'] =
        accuracy >= 75 ? 'strong' :
        accuracy >= 50 ? 'average' :
        'weak';

      return {
        skillId: s.skillId,
        skillName: s.skillName,
        topicName: s.topicName,
        totalQuestions: s.total,
        correctCount: s.correct,
        accuracy,
        status
      };
    }).sort((a, b) => a.accuracy - b.accuracy); // weakest first
  }

  /**
   * Detect weak skills from MasteryRecords (ongoing learning — not just one attempt)
   * Uses questions >= 5 AND accuracy < 60%
   */
  static detectFromMasteryRecords(
    masteryRecords: Record<string, { skillId: string; skillName: string; correctCount: number; wrongCount: number; totalAttempts: number; category?: string }>
  ): WeakSkill[] {
    const weakSkills: WeakSkill[] = [];

    Object.values(masteryRecords).forEach(record => {
      if (record.totalAttempts === 0) return;

      const accuracy = Math.round((record.correctCount / record.totalAttempts) * 100);

      let severity: WeakSkill['severity'] | null = null;
      if (record.totalAttempts >= MIN_SAMPLE_CRITICAL && accuracy < THRESHOLD_CRITICAL) {
        severity = 'critical';
      } else if (record.totalAttempts >= MIN_SAMPLE_WEAK && accuracy < THRESHOLD_WEAK) {
        severity = 'weak';
      } else if (record.totalAttempts >= MIN_SAMPLE_BORDERLINE && accuracy < THRESHOLD_BORDERLINE) {
        severity = 'borderline';
      }

      if (!severity) return;

      weakSkills.push({
        skillId: record.skillId,
        skillName: record.skillName,
        subjectId: record.category || '',
        topicId: '',
        accuracy,
        sampleSize: record.totalAttempts,
        severity,
        reason: `Bạn đã làm ${record.totalAttempts} câu về "${record.skillName}", đúng ${record.correctCount} (${accuracy}%)`,
        recommendations: []
      });
    });

    return weakSkills.sort((a, b) => a.accuracy - b.accuracy);
  }
}
