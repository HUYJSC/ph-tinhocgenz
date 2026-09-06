import { StudentAccount, TRACK_LABELS, CurriculumTrack } from '../types/auth';
import { EarlyWarningService } from './earlyWarningService';
import { StudentRiskProfile } from '../types/edtech';
import {
  NotificationLog,
  NotificationDispatchConfig,
  ReminderCycle,
  RecipientType
} from '../types/notification';

const STORAGE_KEY_CONFIG = 'ph_notification_dispatch_config_v2';
const STORAGE_KEY_LOGS = 'ph_notification_logs_v2';

export const DEFAULT_NOTIFICATION_CONFIG: NotificationDispatchConfig = {
  ageThreshold: 25,
  autoDispatchEnabled: true,
  dailyReminderHour: 19,
  weeklyDigestDay: 0, // Chủ nhật
  monthlyMilestoneDay: 1, // Ngày đầu tháng
  aiToneParent: 'supportive_pedagogical',
  aiToneAdult: 'career_coach'
};

export class AiNotificationService {
  /**
   * Che giấu số điện thoại bảo vệ thông tin riêng tư (PII)
   */
  static maskPhoneNumber(phone: string): string {
    if (!phone) return '090***xxxx';
    const clean = phone.replace(/[\s.\-()+]/g, '');
    if (clean.length < 7) return clean;
    const prefix = clean.substring(0, 3);
    const suffix = clean.substring(clean.length - 4);
    return `${prefix}***${suffix}`;
  }

  /**
   * Lấy cấu hình phát tin
   */
  static getConfig(): NotificationDispatchConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (raw) return { ...DEFAULT_NOTIFICATION_CONFIG, ...JSON.parse(raw) };
    } catch {
      // Fallback
    }
    return DEFAULT_NOTIFICATION_CONFIG;
  }

  /**
   * Lưu cấu hình phát tin
   */
  static saveConfig(config: Partial<NotificationDispatchConfig>): NotificationDispatchConfig {
    const updated = { ...this.getConfig(), ...config };
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
    } catch (e) {
      console.warn('Cannot persist notification config:', e);
    }
    return updated;
  }

  /**
   * Tính tuổi học viên dựa trên năm sinh hoặc lớp học
   */
  static calculateStudentAge(student: StudentAccount): number {
    const currentYear = new Date().getFullYear();
    if (student.age && student.age > 0) return student.age;
    if (student.birthYear && student.birthYear > 1940) return currentYear - student.birthYear;

    if (student.schoolOrClass && /đại học|dh|hutech|neu|ftu|k2|k3|sinh viên/i.test(student.schoolOrClass)) {
      return 21;
    }
    if (student.schoolOrClass && /doanh nghiệp|công ty|người đi làm|kế toán trưởng/i.test(student.schoolOrClass)) {
      return 29;
    }

    return 21;
  }

  /**
   * Xác định người nhận: Phụ huynh (< 25t) hoặc Học viên (>= 25t)
   */
  static determineRecipient(student: StudentAccount, config = this.getConfig()): {
    recipientType: RecipientType;
    recipientName: string;
    recipientPhone: string;
  } {
    const age = this.calculateStudentAge(student);

    if (age < config.ageThreshold) {
      const parentName = student.parentName || `Phụ huynh em ${student.name}`;
      const parentPhone = student.parentPhone || student.phone || '0988123456';
      return {
        recipientType: 'parent',
        recipientName: parentName,
        recipientPhone: parentPhone
      };
    }

    return {
      recipientType: 'student',
      recipientName: student.name,
      recipientPhone: student.phone || '0901234567'
    };
  }

  /**
   * Sinh nội dung AI cá nhân hóa theo chu kỳ và độ tuổi (Web Push & In-App)
   */
  static generateAiMessage(
    student: StudentAccount,
    cycle: ReminderCycle,
    recipientType: RecipientType,
    warning: StudentRiskProfile
  ): string {
    const trackKey = (student.programTrack || student.enrolledTracks?.[0] || 'office-fast-3in1') as CurriculumTrack;
    const trackLabel = TRACK_LABELS[trackKey] || 'Tin học Thực chiến';

    // ── KỊCH BẢN 1: HỌC VIÊN DƯỚI 25 TUỔI -> GỬI PHỤ HUYNH ──
    if (recipientType === 'parent') {
      if (cycle === 'daily') {
        if (warning.riskLevel === 'CRITICAL' || warning.riskLevel === 'HIGH') {
          return (
            `[CẢNH BÁO HỌC VỤ] Kính gửi Quý Phụ huynh em ${student.name},\n\n` +
            `Hệ thống ghi nhận hôm nay em chưa hoàn thành ca luyện tập chuyên đề ${trackLabel} ` +
            `(Mức độ thành thạo hiện tại: ${warning.averageMastery}%). ` +
            `Kính mong Quý Phụ huynh đôn đốc em mở máy ôn tập ít nhất 30 phút tối nay để tránh bị hổng kiến thức.\n\n` +
            `Trân trọng,\nBan Giáo vụ PH Digital Education`
          );
        }
        return (
          `[NHẮC NHỞ HỌC TẬP] Kính gửi Quý Phụ huynh em ${student.name},\n\n` +
          `Hôm nay em ${student.name} có lịch ôn luyện thường nhật môn ${trackLabel}. ` +
          `Kính mong Phụ huynh nhắc em đăng nhập hệ thống hoàn thành mục tiêu 15 câu hỏi trắc nghiệm thực chiến.\n\n` +
          `Ban Giáo vụ PH Digital Education đồng hành cùng gia đình.`
        );
      }

      if (cycle === 'weekly') {
        return (
          `[BÁO CÁO TUẦN] Kính gửi Quý Phụ huynh em ${student.name},\n\n` +
          `Báo cáo tiến độ tuần này của em môn ${trackLabel}:\n` +
          `- Điểm thành thạo kỹ năng: ${warning.averageMastery}%\n` +
          `- Đánh giá học vụ: ${warning.factors?.[0] || 'Tiến độ học tập tích cực'}\n` +
          `Kính mong Phụ huynh tiếp tục đồng hành và động viên em chuẩn bị tốt cho kỳ thi chứng chỉ sắp tới.\n\n` +
          `Ban Giáo vụ PH Digital Education`
        );
      }

      // monthly
      return (
        `[TỔNG KẾT THÁNG] Kính gửi Quý Phụ huynh em ${student.name},\n\n` +
        `Chúc mừng gia đình và em ${student.name} đã hoàn thành cột mốc học tập tháng qua tại PH Digital Education! ` +
        `Khóa học: ${trackLabel}. Tỉ lệ thành thạo kỹ năng: ${warning.averageMastery}%. ` +
        `Chi tiết bảng điểm chuẩn hóa đã được cập nhật trên cổng trực tuyến.\n\n` +
        `Trân trọng cảm ơn Quý Phụ huynh!`
      );
    }

    // ── KỊCH BẢN 2: HỌC VIÊN TỪ 25 TUỔI TRỞ LÊN -> GỬI TRỰC TIẾP HỌC VIÊN ──
    if (cycle === 'daily') {
      if (warning.riskLevel === 'CRITICAL' || warning.riskLevel === 'HIGH') {
        return (
          `[CỐ VẤN HỌC TẬP] Chào ${student.name},\n\n` +
          `Hệ thống AI nhận thấy bạn đã gián đoạn luyện tập môn ${trackLabel} vài ngày qua. ` +
          `Để đảm bảo mục tiêu chứng chỉ không bị chậm trễ, hãy dành 20 phút tối nay để hoàn thành 1 đề luyện ngắn.\n\n` +
          `Chúc bạn học tập hiệu quả!`
        );
      }
      return (
        `[MỤC TIÊU HÔM NAY] Chào ${student.name},\n\n` +
        `Đừng quên duy trì chuỗi học tập hôm nay tại khóa ${trackLabel}. ` +
        `Chỉ cần 1 bài thi mô phỏng 15 phút sẽ giúp bạn vững vàng thao tác thực tế.\n\n` +
        `Đăng nhập ngay để luyện tập!`
      );
    }

    if (cycle === 'weekly') {
      return (
        `[BÁO CÁO TIẾN ĐỘ TUẦN] Chào ${student.name},\n\n` +
        `Tổng kết tuần qua tại khóa ${trackLabel}:\n` +
        `- Điểm thành thạo kỹ năng: ${warning.averageMastery}%\n` +
        `- Nhận xét tiến độ: ${warning.factors?.[0] || 'Hoàn thành tốt mục tiêu học tập'}\n` +
        `Hãy tiếp tục giữ vững phong độ để sẵn sàng cán đích trong tháng này nhé!\n\n` +
        `Đội ngũ Chuyên môn PH Digital Education`
      );
    }

    // monthly
    return (
      `[TỔNG KẾT THÁNG] Chào ${student.name},\n\n` +
      `Chúc mừng bạn đã hoàn thành chặng học tập tháng qua tại khóa ${trackLabel}. ` +
      `Hồ sơ năng lực của bạn đã tích lũy thêm các kỹ năng thực chiến then chốt. ` +
      `Hãy vào hệ thống kiểm tra báo cáo năng lực chi tiết và nhận chứng nhận số!\n\n` +
      `PH Digital Education`
    );
  }

  /**
   * Quét danh sách học viên và sinh bản thảo thông báo
   */
  static scanAndGenerateNotifications(
    students: StudentAccount[],
    cycle: ReminderCycle = 'weekly'
  ): NotificationLog[] {
    const config = this.getConfig();
    const warnings = EarlyWarningService.evaluateAllStudents(students);
    const warningMap = new Map(warnings.map(w => [w.studentId, w]));

    const logs: NotificationLog[] = students.map((student, idx) => {
      const age = this.calculateStudentAge(student);
      const recipient = this.determineRecipient(student, config);
      const warning = warningMap.get(student.id) || EarlyWarningService.computeStudentRisk(student);

      const aiMessage = this.generateAiMessage(
        student,
        cycle,
        recipient.recipientType,
        warning
      );

      return {
        id: `DRAFT_${student.id}_${cycle}_${Date.now()}_${idx}`,
        studentId: student.id,
        studentName: student.name,
        studentCode: student.studentCode || `HV${String(idx + 1).padStart(4, '0')}`,
        age,
        birthYear: student.birthYear,
        recipientType: recipient.recipientType,
        recipientName: recipient.recipientName,
        recipientPhone: recipient.recipientPhone,
        maskedPhone: this.maskPhoneNumber(recipient.recipientPhone),
        cycle,
        riskLevel: warning.riskLevel,
        riskScore: warning.riskScore,
        factors: warning.factors,
        weakSkills: [],
        attendanceRate: warning.averageMastery,
        aiGeneratedMessage: aiMessage,
        sentAt: new Date().toISOString(),
        status: 'queued',
        channel: 'web_push'
      };
    });

    return logs;
  }

  /**
   * Phát 1 thông báo thật đến học viên / phụ huynh (Web Push + In-App)
   */
  static async dispatchSingleNotification(log: NotificationLog): Promise<{
    success: boolean;
    notificationId?: string;
    pushSent?: number;
    error?: string;
  }> {
    try {
      const cycleTitleMap: Record<ReminderCycle, string> = {
        daily: '📊 Tiến độ học tập hôm nay',
        weekly: '📋 Báo cáo tiến độ tuần',
        monthly: '🏆 Cột mốc học tập tháng'
      };

      const title = cycleTitleMap[log.cycle] || '🔔 Thông báo học tập';

      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: log.studentId,
          title,
          body: log.aiGeneratedMessage,
          type: `progress_${log.cycle}`,
          metadata: {
            studentName: log.studentName,
            studentCode: log.studentCode,
            riskLevel: log.riskLevel,
            cycle: log.cycle,
            recipientType: log.recipientType,
            attendanceRate: log.attendanceRate
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP Error ${response.status}`
        };
      }

      const result = await response.json();
      return {
        success: true,
        pushSent: result.pushSent || 0
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Lỗi mạng khi phát thông báo'
      };
    }
  }

  /**
   * Phát thông báo hàng loạt qua Web Push & In-App
   */
  static async dispatchBatchNotifications(
    logs: NotificationLog[],
    onProgress?: (current: number, total: number, lastLog: NotificationLog) => void
  ): Promise<{
    total: number;
    succeeded: number;
    failed: number;
    updatedLogs: NotificationLog[];
  }> {
    let succeeded = 0;
    let failed = 0;
    const updatedLogs: NotificationLog[] = [];

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      const result = await this.dispatchSingleNotification(log);

      const updated: NotificationLog = {
        ...log,
        status: result.success ? 'delivered' : 'failed',
        errorMessage: result.error,
        sentAt: new Date().toISOString()
      };

      if (result.success) succeeded++;
      else failed++;

      updatedLogs.push(updated);
      if (onProgress) onProgress(i + 1, logs.length, updated);

      if (i < logs.length - 1) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updatedLogs.slice(0, 100)));
    } catch {
      // ignore
    }

    return { total: logs.length, succeeded, failed, updatedLogs };
  }
}

// Backward compatibility export alias
export const AiZaloNotificationService = AiNotificationService;
