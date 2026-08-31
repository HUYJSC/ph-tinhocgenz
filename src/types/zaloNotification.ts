import { RiskLevel } from './edtech';

export type ReminderCycle = 'daily' | 'weekly' | 'monthly';
export type RecipientType = 'parent' | 'student';
export type DeliveryStatus = 'pending' | 'sent' | 'failed';

export interface ZaloNotificationLog {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  age: number;
  birthYear?: number;
  recipientType: RecipientType;
  recipientName: string;
  recipientPhone: string;
  recipientZalo?: string;
  cycle: ReminderCycle;
  riskLevel: RiskLevel;
  riskScore: number;
  factors: string[];
  weakSkills: string[];
  attendanceRate: number;
  aiGeneratedMessage: string;
  sentAt: string;
  status: DeliveryStatus;
  channel: 'zalo_zns' | 'zalo_oa' | 'sms_fallback';
  deliveredMessageId?: string;
}

export interface ZaloDispatchConfig {
  ageThreshold: number; // Default: 25 years old
  autoDispatchEnabled: boolean;
  dailyReminderHour: number; // e.g. 19 (19:00 / 7:00 PM)
  weeklyDigestDay: number; // 0 = Sunday, 1 = Monday, etc.
  monthlyMilestoneDay: number; // 1 = 1st of month
  aiToneParent: 'supportive_pedagogical' | 'formal' | 'urgent';
  aiToneAdult: 'career_coach' | 'colleague' | 'concise';
  zaloOaId?: string;
  zaloAppId?: string;
}
