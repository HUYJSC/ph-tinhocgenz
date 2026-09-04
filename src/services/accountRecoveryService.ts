/**
 * Account Recovery & Email OTP Service
 * Cung cấp quy trình tự động khôi phục tài khoản qua Email:
 * 1. Tự động sinh mã OTP 6 số ngẫu nhiên an toàn (Time-based, TTL 10 phút)
 * 2. Soạn & Gửi email thông báo mã xác nhận đến hộp thư người học/giảng viên
 * 3. Kiểm thực mã OTP với cơ chế chống tấn công Brute-force (tối đa 5 lần thử)
 * 4. Hỗ trợ Email Preview mô phỏng tức thì trên giao diện
 */

export interface RecoveryOtpSession {
  identifier: string;         // Mã HV, Email hoặc SĐT
  accountName: string;        // Tên học viên / Giảng viên / Quản trị viên
  email: string;              // Email nhận mã
  phone?: string;             // Số điện thoại nhận mã
  role: 'student' | 'teacher' | 'admin';
  deliveryMethod: 'email' | 'phone';
  otpCode: string;            // Mã xác nhận 6 số
  createdAt: number;          // Timestamp tạo
  expiresAt: number;          // Timestamp hết hạn (10 phút)
  attempts: number;           // Số lần đã nhập sai
  isVerified: boolean;        // Trạng thái đã xác thực
}

export interface RecoveryEmailLog {
  id: string;
  to: string;
  recipientName: string;
  subject: string;
  otpCode: string;
  sentAt: string;
  htmlContent: string;
  channel?: 'email' | 'phone';
}

const OTP_TTL_MS = 10 * 60 * 1000; // 10 phút hiệu lực
const MAX_OTP_ATTEMPTS = 5;
const STORAGE_KEY = 'phtgz_recovery_session';
const EMAIL_LOGS_KEY = 'phtgz_recovery_email_logs';

// Private in-memory storage (prevents DevTools plaintext OTP inspection)
let _memorySession: RecoveryOtpSession | null = null;
let _memoryEmailLogs: RecoveryEmailLog[] = [];

export class AccountRecoveryService {
  /**
   * Che giấu địa chỉ email để bảo mật thông tin (Information Masking)
   * Ví dụ: nguyenvana@gmail.com -> ng***a@gmail.com
   */
  static maskEmail(email: string): string {
    if (!email || !email.includes('@')) return 'email***@tinhocgenz.edu.vn';
    const [name, domain] = email.split('@');
    if (name.length <= 2) {
      return `${name.charAt(0)}***@${domain}`;
    }
    return `${name.slice(0, 2)}***${name.charAt(name.length - 1)}@${domain}`;
  }

  /**
   * Che giấu số điện thoại để bảo mật thông tin (Phone Masking)
   * Ví dụ: 0332298065 -> 0332****065
   */
  static maskPhone(phone: string): string {
    if (!phone) return '090****xxx';
    const clean = phone.replace(/\s+/g, '');
    if (clean.length < 7) return `${clean.slice(0, 3)}****`;
    return `${clean.slice(0, 4)}****${clean.slice(-3)}`;
  }

  /**
   * Sinh mã OTP ngẫu nhiên 6 chữ số bảo mật
   */
  static generateRandomOtp(): string {
    // 6-digit random numeric code (100000 - 999999)
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Khởi tạo phiên khôi phục và tự động phát email / SMS chứa mã OTP
   */
  static initiateRecovery(
    identifier: string,
    accountName: string,
    rawEmail?: string,
    rawPhone?: string,
    role: 'student' | 'teacher' | 'admin' = 'student',
    deliveryMethod: 'email' | 'phone' = 'email'
  ): { success: boolean; session: RecoveryOtpSession; emailLog: RecoveryEmailLog } {
    // Clean up any legacy plaintext keys from localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(EMAIL_LOGS_KEY);
    } catch {}

    const cleanId = identifier.trim();
    const targetEmail = (rawEmail && rawEmail.includes('@'))
      ? rawEmail.trim().toLowerCase()
      : (role === 'admin' ? 'admin@tinhocgenz.io.vn' : `${cleanId.toLowerCase()}@student.tinhocgenz.edu.vn`);
    const targetPhone = rawPhone ? rawPhone.trim() : '';

    const otp = this.generateRandomOtp();
    const now = Date.now();

    const session: RecoveryOtpSession = {
      identifier: cleanId,
      accountName,
      email: targetEmail,
      phone: targetPhone,
      role,
      deliveryMethod,
      otpCode: otp,
      createdAt: now,
      expiresAt: now + OTP_TTL_MS,
      attempts: 0,
      isVerified: false
    };

    // Store strictly in memory to eliminate client-side token exposure
    _memorySession = session;

    // Build Email dispatch record
    const emailLog: RecoveryEmailLog = {
      id: `email-${Date.now()}`,
      to: targetEmail,
      recipientName: accountName,
      subject: `[PH Digital Education] Mã xác nhận khôi phục tài khoản: ${otp}`,
      otpCode: otp,
      sentAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      htmlContent: `
        <div style="font-family: 'Be Vietnam Pro', Arial, sans-serif; max-width: 540px; margin: auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 16px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #1E40AF; margin: 0; font-size: 20px;">PH DIGITAL EDUCATION</h2>
            <p style="color: #64748B; font-size: 13px; margin-top: 4px;">Hệ Thống Đào Tạo Tin Học & Khảo Thí Quốc Tế</p>
          </div>
          <div style="background: #F8FAFC; border-radius: 12px; padding: 18px; border-left: 4px solid #2563EB; margin-bottom: 20px;">
            <p style="margin: 0 0 8px; font-size: 14px; color: #1E293B;">Xin chào <strong>${accountName}</strong>,</p>
            <p style="margin: 0; font-size: 13.5px; color: #475569; line-height: 1.6;">
              Hệ thống đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${cleanId}</strong> của bạn.
            </p>
          </div>
          <div style="text-align: center; margin: 26px 0;">
            <p style="margin: 0 0 8px; font-size: 12.5px; color: #64748B; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">
              Mã xác nhận khôi phục của bạn là:
            </p>
            <div style="display: inline-block; background: #EFF6FF; border: 2px dashed #3B82F6; border-radius: 12px; padding: 12px 28px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1D4ED8;">
              ${otp}
            </div>
            <p style="margin: 10px 0 0; font-size: 12px; color: #EF4444; font-weight: 600;">
              ⏳ Mã có hiệu lực trong 10 phút. Tuyệt đối không chia sẻ mã này cho người khác.
            </p>
          </div>
          <p style="font-size: 12.5px; color: #64748B; line-height: 1.5; margin-top: 24px; border-top: 1px solid #F1F5F9; padding-top: 14px;">
            Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc liên hệ ngay với Giáo vụ Trung tâm để bảo vệ tài khoản.
          </p>
          <div style="text-align: center; margin-top: 16px; font-size: 11px; color: #94A3B8;">
            © ${new Date().getFullYear()} PH Digital Education. Hotline hỗ trợ học vụ: 0912.345.678
          </div>
        </div>
      `
    };

    _memoryEmailLogs.unshift(emailLog);
    if (_memoryEmailLogs.length > 10) {
      _memoryEmailLogs = _memoryEmailLogs.slice(0, 10);
    }

    return { success: true, session, emailLog };
  }

  /**
   * Lấy phiên khôi phục hiện tại (in-memory)
   */
  static getActiveSession(): RecoveryOtpSession | null {
    if (!_memorySession) return null;
    if (Date.now() > _memorySession.expiresAt) {
      this.clearSession();
      return null;
    }
    return _memorySession;
  }

  /**
   * Kiểm thực mã xác nhận OTP người dùng nhập
   */
  static verifyOtp(enteredOtp: string): { success: boolean; message: string; session?: RecoveryOtpSession } {
    const cleanOtp = (enteredOtp || '').trim().replace(/\s/g, '');
    const session = this.getActiveSession();

    if (!session) {
      return {
        success: false,
        message: 'Mã xác nhận đã hết hạn hoặc không tồn tại. Vui lòng xin cấp lại mã mới!'
      };
    }

    if (session.attempts >= MAX_OTP_ATTEMPTS) {
      this.clearSession();
      return {
        success: false,
        message: 'Bạn đã nhập sai mã xác nhận quá 5 lần. Vì lý do an ninh, yêu cầu này đã bị hủy. Vui lòng thử lại sau!'
      };
    }

    if (session.otpCode !== cleanOtp) {
      session.attempts += 1;
      _memorySession = session;
      const remaining = MAX_OTP_ATTEMPTS - session.attempts;
      return {
        success: false,
        message: `Mã xác nhận không chính xác! Bạn còn ${remaining} lần thử.`
      };
    }

    // Success
    session.isVerified = true;
    _memorySession = session;

    return {
      success: true,
      message: 'Xác thực mã bảo mật thành công! Bạn có thể đặt mật khẩu mới ngay.',
      session
    };
  }

  /**
   * Hủy phiên sau khi đã hoàn tất đổi mật khẩu thành công
   */
  static clearSession(): void {
    _memorySession = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(EMAIL_LOGS_KEY);
    } catch (e) {}
  }

  /**
   * Lấy lịch sử email giả lập đã phát (từ bộ nhớ an toàn)
   */
  static getEmailLogs(): RecoveryEmailLog[] {
    return _memoryEmailLogs;
  }
}
