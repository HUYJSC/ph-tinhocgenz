import { SmartReviewItem } from '../types/edtech';
import { CurriculumTrack } from '../types/auth';

const STORAGE_KEY_SMART_REVIEW = 'phtinhocgenz_smart_review_vault_v1';

export class SmartReviewService {
  /**
   * Get all review items for a student
   */
  static getReviewVault(studentId: string): SmartReviewItem[] {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_SMART_REVIEW}_${studentId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to get review vault:', e);
    }
    return [];
  }

  /**
   * Save review vault to localStorage
   */
  static saveReviewVault(studentId: string, items: SmartReviewItem[]): void {
    try {
      localStorage.setItem(`${STORAGE_KEY_SMART_REVIEW}_${studentId}`, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save review vault:', e);
    }
  }

  /**
   * Log a mistake when a student answers a question incorrectly
   */
  static recordMistake(
    studentId: string,
    questionData: {
      questionId: string;
      skillId: string;
      skillName: string;
      category: CurriculumTrack;
      prompt: string;
      options: string[];
      correctAnswer: number | number[];
      userAnswer: number | number[];
      explanation: string;
    }
  ): SmartReviewItem {
    const vault = this.getReviewVault(studentId);
    const existingIndex = vault.findIndex(item => item.questionId === questionData.questionId);

    const now = new Date();
    // Default review interval starts at 1 day
    const nextReview = new Date(now);
    nextReview.setDate(now.getDate() + 1);

    let updatedItem: SmartReviewItem;

    if (existingIndex >= 0) {
      const existing = vault[existingIndex];
      updatedItem = {
        ...existing,
        userAnswer: questionData.userAnswer,
        explanation: questionData.explanation,
        mistakeCount: existing.mistakeCount + 1,
        lastMistakeAt: now.toISOString(),
        nextReviewDate: nextReview.toISOString(),
        intervalDays: 1, // Reset interval on repeated mistake
        isResolved: false
      };
      vault[existingIndex] = updatedItem;
    } else {
      updatedItem = {
        id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        studentId,
        questionId: questionData.questionId,
        skillId: questionData.skillId,
        skillName: questionData.skillName,
        category: questionData.category,
        prompt: questionData.prompt,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        userAnswer: questionData.userAnswer,
        explanation: questionData.explanation,
        mistakeCount: 1,
        firstMistakeAt: now.toISOString(),
        lastMistakeAt: now.toISOString(),
        nextReviewDate: nextReview.toISOString(),
        intervalDays: 1,
        isResolved: false
      };
      vault.push(updatedItem);
    }

    this.saveReviewVault(studentId, vault);
    return updatedItem;
  }

  /**
   * Mark a mistake as correctly answered during a Smart Review session
   * Increases the spaced repetition interval (1d -> 3d -> 7d -> 14d -> Resolved)
   */
  static recordCorrectReview(studentId: string, reviewItemId: string): SmartReviewItem | null {
    const vault = this.getReviewVault(studentId);
    const itemIndex = vault.findIndex(item => item.id === reviewItemId);
    if (itemIndex === -1) return null;

    const item = vault[itemIndex];
    let nextInterval = item.intervalDays * 2.5;
    let isResolved = false;

    if (item.intervalDays >= 7) {
      isResolved = true;
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + Math.round(nextInterval));

    const updatedItem: SmartReviewItem = {
      ...item,
      intervalDays: Math.round(nextInterval),
      nextReviewDate: nextReview.toISOString(),
      isResolved
    };

    vault[itemIndex] = updatedItem;
    this.saveReviewVault(studentId, vault);
    return updatedItem;
  }

  /**
   * Get list of questions due for review today
   */
  static getDueReviews(studentId: string, categoryFilter?: CurriculumTrack): SmartReviewItem[] {
    const vault = this.getReviewVault(studentId);
    const now = new Date();

    return vault.filter(item => {
      if (item.isResolved) return false;
      if (categoryFilter && item.category !== categoryFilter) return false;
      const dueDate = new Date(item.nextReviewDate);
      return dueDate <= now || (dueDate.getTime() - now.getTime()) <= 3600 * 1000 * 12; // Within 12 hours
    });
  }

  /**
   * Get all unresolved mistake items
   */
  static getUnresolvedMistakes(studentId: string): SmartReviewItem[] {
    const vault = this.getReviewVault(studentId);
    return vault.filter(item => !item.isResolved);
  }
}
