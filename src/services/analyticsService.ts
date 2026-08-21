import { LearningEvent, LearningEventType } from '../types/edtech';
import { CurriculumTrack } from '../types/auth';

const STORAGE_KEY_EVENTS = 'phtinhocgenz_learning_events_v1';
const SESSION_ID = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

export class AnalyticsService {
  /**
   * Track a structured Learning Event across any component
   */
  static trackEvent(
    userId: string,
    eventType: LearningEventType,
    options?: {
      track?: CurriculumTrack;
      skillId?: string;
      questionId?: string;
      metadata?: Record<string, any>;
    }
  ): LearningEvent {
    const newEvent: LearningEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: userId || 'anonymous',
      eventType,
      track: options?.track,
      skillId: options?.skillId,
      questionId: options?.questionId,
      metadata: options?.metadata,
      timestamp: new Date().toISOString(),
      sessionId: SESSION_ID,
      device: typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop') : 'Desktop'
    };

    try {
      const existing = this.getEventHistory(userId);
      // Keep last 500 events to maintain optimal performance
      const updated = [newEvent, ...existing].slice(0, 500);
      localStorage.setItem(`${STORAGE_KEY_EVENTS}_${userId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Analytics event logging fallback:', e);
    }

    return newEvent;
  }

  /**
   * Get learning event history for a student
   */
  static getEventHistory(userId: string): LearningEvent[] {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_EVENTS}_${userId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to get event history:', e);
    }
    return [];
  }

  /**
   * Compute study streak and activity summary
   */
  static getStudyActivitySummary(userId: string): {
    totalEvents: number;
    quizzesCompleted: number;
    reviewsDone: number;
    activeDaysCount: number;
  } {
    const events = this.getEventHistory(userId);
    const uniqueDays = new Set(events.map(e => e.timestamp.split('T')[0]));

    return {
      totalEvents: events.length,
      quizzesCompleted: events.filter(e => e.eventType === 'quiz_completed' || e.eventType === 'exam_completed').length,
      reviewsDone: events.filter(e => e.eventType === 'review_completed').length,
      activeDaysCount: uniqueDays.size
    };
  }
}
