import { RiskLevel } from './edtech';

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

export type OaConnectionStatus = 'unconfigured' | 'connected' | 'token_expiring' | 'webhook_error';

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
  maskedPhone?: string;
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
  zaloMsgId?: string;
  trackingId?: string;
  errorCode?: number;
  errorMessage?: string;
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

export interface ZaloOaStatusResponse {
  status: OaConnectionStatus;
  message: string;
  missing_env?: string[];
  oa_id: string | null;
  expires_at?: string;
  active_template_count: number;
  remaining_quota: number;
  last_webhook_at: string | null;
  recent_logs: Array<{
    id: string;
    student_id: string;
    recipient_type: RecipientType;
    masked_phone: string;
    template_id: string;
    tracking_id: string;
    zalo_msg_id?: string;
    request_status: string;
    delivery_status: DeliveryStatus;
    error_code?: number;
    error_message?: string;
    created_at: string;
    delivered_at?: string;
  }>;
}
