import { MasteryRecord, SkillStatus } from '../types/edtech';
import { CurriculumTrack } from '../types/auth';

const STORAGE_KEY_MASTERY = 'phtinhocgenz_mastery_records_v1';

export class MasteryService {
  /**
   * Get all mastery records for a user from storage
   */
  static getMasteryRecords(userId: string): Record<string, MasteryRecord> {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_MASTERY}_${userId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to parse mastery records:', e);
    }
    return {};
  }

  /**
   * Save mastery records for a user
   */
  static saveMasteryRecords(userId: string, records: Record<string, MasteryRecord>): void {
    try {
      localStorage.setItem(`${STORAGE_KEY_MASTERY}_${userId}`, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save mastery records:', e);
    }
  }

  /**
   * Calculate mastery score algorithm:
   * Score = (Accuracy Rate * 0.6) + (Streak Bonus * 0.25) + (Volume Factor * 0.15)
   * Status:
   * 0-40: not_started / need_review
   * 41-75: in_progress
   * 76-89: need_review (if decayed) or in_progress
   * 90-100: mastered
   */
  static calculateMasteryScore(correctCount: number, wrongCount: number, streak: number): number {
    const total = correctCount + wrongCount;
    if (total === 0) return 0;

    const accuracyRate = (correctCount / total) * 100;
    const streakBonus = Math.min(streak * 10, 100);
    const volumeFactor = Math.min((total / 10) * 100, 100);

    const calculated = Math.round(accuracyRate * 0.6 + streakBonus * 0.25 + volumeFactor * 0.15);
    return Math.min(Math.max(calculated, 0), 100);
  }

  /**
   * Determine skill status based on score and mistake frequency
   */
  static determineStatus(score: number, wrongCount: number): SkillStatus {
    if (score >= 88 && wrongCount <= 1) return 'mastered';
    if (score >= 50) return 'in_progress';
    if (wrongCount >= 2 || score < 50) return 'need_review';
    return 'not_started';
  }

  /**
   * Record a question attempt for a specific skill and update its mastery score
   */
  static recordSkillAttempt(
    userId: string,
    skillId: string,
    skillName: string,
    category: CurriculumTrack,
    isCorrect: boolean
  ): MasteryRecord {
    const records = this.getMasteryRecords(userId);
    const existing = records[skillId] || {
      skillId,
      skillName,
      category,
      masteryScore: 0,
      correctCount: 0,
      wrongCount: 0,
      totalAttempts: 0,
      lastAttemptDate: new Date().toISOString(),
      status: 'not_started' as SkillStatus,
      streak: 0
    };

    const newCorrect = existing.correctCount + (isCorrect ? 1 : 0);
    const newWrong = existing.wrongCount + (isCorrect ? 0 : 1);
    const newStreak = isCorrect ? existing.streak + 1 : 0;
    const newTotal = existing.totalAttempts + 1;

    const newScore = this.calculateMasteryScore(newCorrect, newWrong, newStreak);
    const newStatus = this.determineStatus(newScore, newWrong);

    const updatedRecord: MasteryRecord = {
      ...existing,
      skillName,
      category,
      correctCount: newCorrect,
      wrongCount: newWrong,
      totalAttempts: newTotal,
      streak: newStreak,
      masteryScore: newScore,
      status: newStatus,
      lastAttemptDate: new Date().toISOString()
    };

    records[skillId] = updatedRecord;
    this.saveMasteryRecords(userId, records);
    return updatedRecord;
  }

  /**
   * Compute overall average mastery score for a student across all skills or a specific track
   */
  static getOverallMastery(userId: string, track?: CurriculumTrack): number {
    const records = Object.values(this.getMasteryRecords(userId));
    const filtered = track ? records.filter(r => r.category === track) : records;
    if (filtered.length === 0) return 0;
    const sum = filtered.reduce((acc, curr) => acc + curr.masteryScore, 0);
    return Math.round(sum / filtered.length);
  }
}
