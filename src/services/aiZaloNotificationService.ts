import { StudentAccount, TRACK_LABELS } from '../types/auth';
import { EarlyWarningService } from './earlyWarningService';
import {
  ZaloNotificationLog,
  ZaloDispatchConfig,
  ReminderCycle,
  RecipientType,
  ZaloOaStatusResponse
} from '../types/zaloNotification';

const STORAGE_KEY_CONFIG = 'ph_zalo_dispatch_config_v1';

export const DEFAULT_ZALO_CONFIG: ZaloDispatchConfig = {
  ageThreshold: 25,
  autoDispatchEnabled: true,
  dailyReminderHour: 19,
  weeklyDigestDay: 0, // Chủ nhật
  monthlyMilestoneDay: 1, // Ngày đầu tháng
  aiToneParent: 'supportive_pedagogical',
  aiToneAdult: 'career_coach',
  zaloOaId: 'PH_DIGITAL_EDU_OFFICIAL',
  zaloAppId: '2026_ZBS_EDTECH'
};

export class AiZaloNotificationService {
  /**
   * Che giấu số điện thoại bảo vệ thông tin riêng tư (PII)
   * Ví dụ: 0912345678 -> 091***5678
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
  static getConfig(): ZaloDispatchConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (raw) return { ...DEFAULT_ZALO_CONFIG, ...JSON.parse(raw) };
    } catch {
      // Fallback
    }
    return DEFAULT_ZALO_CONFIG;
  }

  /**
   * Lưu cấu hình phát tin
   */
  static saveConfig(config: Partial<ZaloDispatchConfig>): ZaloDispatchConfig {
    const updated = { ...this.getConfig(), ...config };
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
    } catch (e) {
      console.warn('Cannot persist Zalo config:', e);
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

    // Suy luận thông minh dựa trên thông tin trường hoặc lớp
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
      // Dưới 25 tuổi: Gửi phụ huynh
      const parentName = student.parentName || `Phụ huynh em ${student.name}`;
      const parentPhone = student.parentPhone || student.parentZalo || student.phone || '0988123456';
      return {
        recipientType: 'parent',
        recipientName: parentName,
        recipientPhone: parentPhone
      };
    }

    // Từ 25 tuổi trở lên: Gửi trực tiếp người học, tôn trọng quyền tự chủ
    return {
      recipientType: 'student',
      recipientName: student.name,
      recipientPhone: student.phone || student.email || '0909123456'
    };
  }

  /**
   * Tạo nội dung sư phạm gợi ý cho Template Zalo (Quy tắc AI: Đề xuất nội dung theo Template)
   */
  static generateAiMessage(
    student: StudentAccount,
    cycle: ReminderCycle,
    riskData = EarlyWarningService.computeStudentRisk(student)
  ): string {
    const age = this.calculateStudentAge(student);
    const config = this.getConfig();
    const isParent = age < config.ageThreshold;
    const trackLabel = TRACK_LABELS[student.programTrack] || 'Tin học Văn phòng Chuẩn Quốc tế';
    const weakSkillsStr = riskData.factors.slice(0, 2).join(', ');

    if (isParent) {
      const parentGreeting = student.parentName ? `Kính gửi ${student.parentName}` : `Kính gửi Quý Phụ huynh em ${student.name}`;

      if (cycle === 'daily') {
        if (riskData.riskLevel === 'CRITICAL' || riskData.riskLevel === 'HIGH') {
          return `${parentGreeting} (Học viên lớp ${student.classCode || 'K26'} - Mã HV: ${student.studentCode}),\n\n` +
            `Học viện PH Digital Education xin phép thông báo tình hình học tập hôm nay của em:\n` +
            `• Môn học: ${trackLabel}\n` +
            `• Tình trạng hiện tại: Đang có dấu hiệu chững lại (${weakSkillsStr || 'Điểm chuyên cần chưa đạt'}).\n` +
            `• Gợi ý từ Giảng viên: Em cần dành 25 phút tối nay để hoàn thành bài thực hành đang tồn đọng.\n\n` +
            `Kính mong Quý Phụ huynh cùng Trung tâm nhắc nhở, động viên em đăng nhập học trực tuyến tại https://hoctructuyen.tinhocgenz.io.vn để không bị hổng kiến thức trước kỳ thi.\n` +
            `Trân trọng,\nBan Giáo vụ PH Digital Education (Hotline: 033.229.8065).`;
        } else {
          return `${parentGreeting},\n\n` +
            `Học viện PH Digital Education chúc mừng em ${student.name} đã hoàn thành tốt mục tiêu học tập ngày hôm nay với tiến độ ${100 - riskData.riskScore}%.\n` +
            `Kính mời Quý Phụ huynh theo dõi hành trình đạt chuẩn đầu ra của con tại: https://hoctructuyen.tinhocgenz.io.vn.`;
        }
      }

      if (cycle === 'weekly') {
        return `${parentGreeting},\n\n` +
          `[BÁO CÁO HỌC TẬP TUẦN - PH DIGITAL EDUCATION]\n` +
          `Hệ thống AI gửi Quý Phụ huynh tổng kết tuần của em ${student.name} (Lớp: ${student.classCode || 'Tin học văn phòng'}):\n` +
          `• Mức độ bám sát lộ trình: ${riskData.riskLevel === 'LOW' ? 'Rất Tốt (95%)' : riskData.riskLevel === 'MEDIUM' ? 'Đạt chuẩn (75%)' : 'Cần Chú Ý Khẩn Cấp (Dưới 50%)'}\n` +
          `• Nội dung trọng tâm cần rèn luyện: ${weakSkillsStr || 'Kỹ năng định dạng bảng tính và văn bản thực chiến'}\n` +
          `• Hỗ trợ từ Học viện: Thầy Huy và Ban Trợ giảng sẽ mở ca phụ đạo 1-1 miễn phí tối thứ Tư tuần tới.\n\n` +
          `Sự đồng hành của gia đình là động lực to lớn giúp em tự tin bao đỗ 100% chứng chỉ!\n` +
          `Trân trọng cảm ơn Quý Phụ huynh!`;
      }

      // cycle === 'monthly'
      return `${parentGreeting},\n\n` +
        `[ĐÁNH GIÁ CỘT MỐC ĐỊNH KỲ THÁNG - HỌC VIÊN ${student.name.toUpperCase()}]\n` +
        `Qua 30 ngày rèn luyện chương trình ${trackLabel}:\n` +
        `• Đánh giá chung: ${riskData.riskLevel === 'CRITICAL' ? 'Có nguy cơ trễ hạn thi chuẩn đầu ra do vắng buổi' : 'Tiến bộ ổn định qua các bài khảo thí'}.\n` +
        `• Tỷ lệ hoàn thành chứng chỉ dự kiến: ${Math.max(10, 100 - riskData.riskScore)}%.\n` +
        `Chi tiết bảng điểm thực hành đã được lưu tại hồ sơ học vụ trực tuyến.\n` +
        `Mọi thắc mắc Quý Phụ huynh vui lòng liên hệ trực tiếp Giảng viên phụ trách qua Zalo này.`;
    }

    const studentGreeting = `Chào anh/chị ${student.name}`;

    if (cycle === 'daily') {
      if (riskData.riskLevel === 'CRITICAL' || riskData.riskLevel === 'HIGH') {
        return `${studentGreeting},\n\n` +
          `Hệ thống học tập PH Digital Education nhận thấy anh/chị đang có chút bận rộn trong công việc tuần này nên bài luyện tập ${trackLabel} đang bị gián đoạn.\n` +
          `• Lưu ý kỹ năng: ${weakSkillsStr || 'Các hàm xử lý dữ liệu tự động'}.\n` +
          `• Gợi ý tối ưu: Anh/chị có thể tận dụng 15 phút giải lao hoặc buổi tối truy cập chế độ "Luyện tập theo kỹ năng" được thiết kế riêng dạng micro-learning ngắn gọn.\n\n` +
          `Link học bù nhanh: https://hoctructuyen.tinhocgenz.io.vn\n` +
          `Chúc anh/chị hoàn thành công việc suôn sẻ và học tập hiệu quả!`;
      } else {
        return `${studentGreeting},\n\n` +
          `Nhắc nhở lịch học tối nay: Chuyên đề mới của chương trình ${trackLabel} đã sẵn sàng. Chúc anh/chị có một buổi học thực chiến nhiều giá trị cho công việc!`;
      }
    }

    if (cycle === 'weekly') {
      return `${studentGreeting},\n\n` +
        `[BẢN TIN TIẾN ĐỘ TUẦN DÀNH CHO BẠN]\n` +
        `Tổng kết tuần qua chương trình ${trackLabel}:\n` +
        `• Điểm làm chủ kỹ năng (Mastery Score): ${riskData.averageMastery}%\n` +
        `• Kỹ năng ứng dụng công việc tuần tới: Rèn luyện mẹo phím tắt, tối ưu bảng tính và tự động hóa với AI.\n` +
        `Nếu cần hỗ trợ tài liệu thực hành Excel/Word chuyên sâu cho ngành của mình, anh/chị có thể nhắn lại để Thầy Huy gửi bổ sung nhé!`;
    }

    // cycle === 'monthly'
    return `${studentGreeting},\n\n` +
      `[TỔNG KẾT CỘT MỐC THÁNG - HỌC TẬP THỰC CHIẾN]\n` +
      `Chúc mừng anh/chị ${student.name} đã hoàn thành chặng học tập tháng qua. Hồ sơ ghi nhận anh/chị đã tích lũy đầy đủ các chuyên đề thực tế của ${trackLabel}.\n` +
      `Chúc anh/chị ứng dụng hiệu quả vào công việc hàng ngày và sớm đăng ký thi lấy chứng chỉ quốc tế Certiport!`;
  }

  /**
   * Quét học viên và tạo bản thảo xem trước (Preview) cho Giáo viên duyệt
   * Trạng thái khởi tạo là 'pending', KHÔNG tự gán status='sent'
   */
  static scanAndGenerateNotifications(
    students: StudentAccount[],
    cycle: ReminderCycle = 'weekly'
  ): ZaloNotificationLog[] {
    const config = this.getConfig();
    const newLogs: ZaloNotificationLog[] = [];
    const nowStr = new Date().toLocaleString('vi-VN');

    students.forEach(student => {
      const risk = EarlyWarningService.computeStudentRisk(student);
      const age = this.calculateStudentAge(student);
      const recipient = this.determineRecipient(student, config);

      const shouldSend = cycle !== 'daily' || risk.riskLevel === 'CRITICAL' || risk.riskLevel === 'HIGH';

      if (shouldSend) {
        const message = this.generateAiMessage(student, cycle, risk);

        const log: ZaloNotificationLog = {
          id: `preview-${student.id}-${cycle}-${Date.now()}`,
          studentId: student.id,
          studentName: student.name,
          studentCode: student.studentCode,
          age,
          birthYear: student.birthYear,
          recipientType: recipient.recipientType,
          recipientName: recipient.recipientName,
          recipientPhone: recipient.recipientPhone,
          maskedPhone: this.maskPhoneNumber(recipient.recipientPhone),
          recipientZalo: student.parentZalo,
          cycle,
          riskLevel: risk.riskLevel,
          riskScore: risk.riskScore,
          factors: risk.factors,
          weakSkills: risk.factors.slice(0, 2),
          attendanceRate: Math.max(20, 100 - (risk.lastActiveDaysAgo * 8)),
          aiGeneratedMessage: message,
          sentAt: nowStr,
          status: 'pending', // KHÔNG tự gán 'sent'
          channel: 'zalo_zns'
        };

        newLogs.push(log);
      }
    });

    return newLogs;
  }

  /**
   * Lấy trạng thái kết nối OA và kiểm tra sức khỏe hệ thống từ /api/zalo/health
   */
  static async fetchOaStatus(): Promise<ZaloOaStatusResponse> {
    try {
      const res = await fetch('/api/zalo/health');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback sang endpoint status nếu health chưa phản hồi
      try {
        const resFallback = await fetch('/api/zalo/status');
        if (resFallback.ok) {
          return await resFallback.json();
        }
      } catch (e) {
        console.warn('Không thể kết nối /api/zalo/health hoặc /api/zalo/status:', e);
      }
    }

    return {
      configured: false,
      status: 'not_configured',
      message: 'Hệ thống Zalo chưa được cấu hình đầy đủ trên máy chủ.',
      missing: ['app_id', 'credentials', 'token'],
      oa_id: null,
      active_template_count: 0,
      remaining_quota: 0,
      last_webhook_at: null,
      checks: {
        app: false,
        oa: false,
        token: false,
        refreshToken: false,
        template: false,
        webhook: false,
        database: false
      },
      recent_logs: []
    };
  }

  /**
   * Gửi thử nghiệm Zalo ZBS đến số quản trị viên qua endpoint chuyên dụng /api/zalo/send-test
   */
  static async sendTestMessage(
    recipientPhone: string,
    templateType: 'REMINDER' | 'WARNING' | 'PAYMENT' = 'REMINDER',
    parameters?: Record<string, any>,
    authToken?: string
  ): Promise<{ success: boolean; msg_id?: string; message?: string; error?: string }> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/zalo/send-test', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          recipient: recipientPhone,
          template: templateType,
          parameters: parameters || {
            student_name: 'Học viên Test',
            recipient_name: 'Quản trị viên Hệ thống',
            cycle: 'Kiểm thử Vận hành',
            message_body: 'Đây là tin nhắn kiểm thử kết nối chính thức Zalo ZBS từ Hệ thống PH Digital Education.'
          }
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          msg_id: data.msg_id,
          message: data.message
        };
      }

      return {
        success: false,
        error: data.error || data.message || 'Gửi thử nghiệm qua Zalo thất bại'
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Lỗi kết nối máy chủ gửi thử: ${err.message}`
      };
    }
  }

  /**
   * Gửi tin nhắn Zalo ZBS Template Message thật qua server-side endpoint /api/zalo/send
   * Tuyệt đối không dùng giả lập
   */
  static async dispatchSingleMessage(
    log: ZaloNotificationLog,
    authToken?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch('/api/zalo/send', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phone: log.recipientPhone,
          template_id: 'PH_EDU_REMINDER_2026',
          template_data: {
            student_name: log.studentName,
            recipient_name: log.recipientName,
            cycle: log.cycle,
            risk_level: log.riskLevel,
            attendance_rate: `${log.attendanceRate}%`,
            message_body: log.aiGeneratedMessage
          },
          tracking_id: `CLI_${Date.now()}_${log.studentId.substring(0, 8)}`,
          student_id: log.studentId,
          recipient_type: log.recipientType
        })
      });

      const data = await response.json();

      if (response.ok && data.success && data.msg_id) {
        return {
          success: true,
          messageId: data.msg_id
        };
      }

      return {
        success: false,
        error: data.message || data.error || 'Gửi thất bại từ Zalo OpenAPI'
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Lỗi kết nối máy chủ gửi Zalo: ${err.message}`
      };
    }
  }
}
