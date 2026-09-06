/**
 * PH DIGITAL EDUCATION — In-App & Web Push Notification Types
 * Hệ thống thông báo tự động cho phụ huynh/học viên (100% Web Push & In-App)
 */
import { RiskLevel } from './edtech';

export type NotificationType =
  | 'progress_daily'
  | 'progress_weekly'
  | 'progress_monthly'
  | 'attendance'
  | 'assignment'
  | 'system';

export type ReminderCycle = 'daily' | 'weekly' | 'monthly';
export type RecipientType = 'parent' | 'student';
export type DeliveryStatus =
  | 'queued'
  | 'processing'
  | 'accepted'
  | 'delivered'
  | 'failed'
  | 'cancelled'
  | 'pending';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: {
    studentName?: string;
    studentCode?: string;
    riskLevel?: string;
    cycle?: string;
    attendanceRate?: number;
    icon?: string;
  };
  createdAt: string;
}

export interface PushSubscriptionRecord {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  age: number;
  birthYear?: number;
  recipientType: RecipientType;
  recipientName: string;
  recipientPhone: string;
  maskedPhone?: string;
  cycle: ReminderCycle;
  riskLevel: RiskLevel;
  riskScore: number;
  factors: string[];
  weakSkills: string[];
  attendanceRate: number;
  aiGeneratedMessage: string;
  sentAt: string;
  status: DeliveryStatus;
  channel: 'web_push' | 'in_app';
  deliveredMessageId?: string;
  trackingId?: string;
  errorCode?: number;
  errorMessage?: string;
}

export interface NotificationDispatchConfig {
  ageThreshold: number; // Mặc định: 25 tuổi (< 25 gửi Phụ huynh, >= 25 gửi Học viên)
  autoDispatchEnabled: boolean;
  dailyReminderHour: number; // e.g. 19 (19:00)
  weeklyDigestDay: number; // 0 = Chủ nhật
  monthlyMilestoneDay: number; // 1 = ngày mùng 1
  aiToneParent: 'supportive_pedagogical' | 'formal' | 'urgent';
  aiToneAdult: 'career_coach' | 'colleague' | 'concise';
}

// Aliases for legacy backward compatibility
export type ZaloNotificationLog = NotificationLog;
export type ZaloDispatchConfig = NotificationDispatchConfig;

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  progress_daily: 'Tiến độ hằng ngày',
  progress_weekly: 'Báo cáo tuần',
  progress_monthly: 'Cột mốc tháng',
  attendance: 'Chuyên cần',
  assignment: 'Bài tập',
  system: 'Hệ thống'
};

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  progress_daily: '📊',
  progress_weekly: '📋',
  progress_monthly: '🏆',
  attendance: '✅',
  assignment: '📝',
  system: '⚙️'
};
