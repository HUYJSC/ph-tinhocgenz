import React, { useState, useEffect } from 'react';
import {
  Lock, User, AlertCircle, CheckCircle2, X,
  Mail, Phone, Send, ArrowRight, ShieldCheck, KeyRound, Clock,
  RefreshCw, Copy, Check, Eye, EyeOff, Sparkles
} from 'lucide-react';
import { AccountRecoveryService, RecoveryEmailLog } from '../../services/accountRecoveryService';
import { INITIAL_STUDENT_ACCOUNTS } from '../../hooks/useAuth';
import { StudentAccount, TeacherAccount } from '../../types/auth';
import { soundFx } from '../../utils/audio';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetPassword: (identifier: string, newPass: string) => { success: boolean; message?: string };
  studentAccounts?: StudentAccount[];
  teacherAccounts?: TeacherAccount[];
}

type RecoveryStep = 'find_account' | 'enter_otp' | 'new_password' | 'success';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onResetPassword,
  studentAccounts,
  teacherAccounts
}) => {
  const [step, setStep] = useState<RecoveryStep>('find_account');
  const [identifier, setIdentifier] = useState('');
  const [deliveryChannel, setDeliveryChannel] = useState<'email' | 'phone'>('email');
  const [targetAccount, setTargetAccount] = useState<{
    name: string;
    code: string;
    email: string;
    phone?: string;
    role: 'student' | 'teacher' | 'admin';
    classOrSchool?: string;
  } | null>(null);

  // OTP State
  const [otpInput, setOtpInput] = useState('');
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [emailLog, setEmailLog] = useState<RecoveryEmailLog | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // New Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset states on open/close
  useEffect(() => {
    if (isOpen) {
      setStep('find_account');
      setIdentifier('');
      setTargetAccount(null);
      setOtpInput('');
      setCountdown(600);
      setEmailLog(null);
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  // Countdown timer for Step 2
  useEffect(() => {
    let timer: any;
    if (step === 'enter_otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper: Find account in passed lists or fallback
  const findAccountByIdentifier = (idStr: string) => {
    const clean = idStr.trim().toLowerCase();
    if (!clean) return null;

    // Load available accounts
    let allStudents: StudentAccount[] = studentAccounts || [];
    if (allStudents.length === 0) {
      try {
        const localStudents = localStorage.getItem('phtgz_student_accounts');
        allStudents = localStudents ? JSON.parse(localStudents) : INITIAL_STUDENT_ACCOUNTS;
      } catch {
        allStudents = INITIAL_STUDENT_ACCOUNTS;
      }
    }

    const matchedStudent = allStudents.find(s =>
      s.studentCode.toLowerCase() === clean ||
      s.name.toLowerCase() === clean ||
      (s.email && s.email.toLowerCase() === clean) ||
      (s.phone && s.phone.replace(/\s/g, '').includes(clean.replace(/\s/g, '')))
    );

    if (matchedStudent) {
      return {
        name: matchedStudent.name,
        code: matchedStudent.studentCode,
        email: matchedStudent.email || `${matchedStudent.studentCode.toLowerCase()}@student.tinhocgenz.edu.vn`,
        phone: matchedStudent.phone || '',
        role: 'student' as const,
        classOrSchool: matchedStudent.schoolOrClass
      };
    }

    // Check teacher and admin accounts
    let allTeachers: TeacherAccount[] = teacherAccounts || [];
    if (allTeachers.length === 0) {
      try {
        const localTeachers = localStorage.getItem('phtgz_teacher_accounts');
        if (localTeachers) allTeachers = JSON.parse(localTeachers);
      } catch {}
    }

    // Explicit Admin alias check
    if (clean === 'admin' || clean === 'admin01' || clean === 'quantri' || clean === 'quantrivien') {
      const adminAcc = allTeachers.find(t => t.role === 'admin' || t.teacherCode.toLowerCase() === 'admin01');
      return {
        name: adminAcc?.name || 'Quản Trị Viên (Thầy Huy)',
        code: adminAcc?.teacherCode || 'ADMIN01',
        email: adminAcc?.email || 'hdh.hutech@gmail.com',
        phone: adminAcc?.phone || '0332298065',
        role: 'admin' as const,
        classOrSchool: 'Cổng Quản Trị Hệ Thống'
      };
    }

    const matchedTeacher = allTeachers.find(t =>
      t.teacherCode.toLowerCase() === clean ||
      t.name.toLowerCase() === clean ||
      (t.email && t.email.toLowerCase() === clean) ||
      (t.phone && t.phone.replace(/\s/g, '').includes(clean.replace(/\s/g, ''))) ||
      ((clean === 'admin' || clean === 'admin01') && (t.role === 'admin' || t.teacherCode === 'ADMIN01'))
    );

    if (matchedTeacher) {
      const isRoleAdmin = matchedTeacher.role === 'admin' || matchedTeacher.teacherCode === 'ADMIN01';
      return {
        name: matchedTeacher.name,
        code: matchedTeacher.teacherCode,
        email: matchedTeacher.email || (isRoleAdmin ? 'hdh.hutech@gmail.com' : `${matchedTeacher.teacherCode.toLowerCase()}@tinhocgenz.io.vn`),
        phone: matchedTeacher.phone || (isRoleAdmin ? '0332298065' : ''),
        role: isRoleAdmin ? ('admin' as const) : ('teacher' as const),
        classOrSchool: isRoleAdmin ? 'Cổng Quản Trị Hệ Thống' : 'Giảng viên Trung tâm'
      };
    }

    // Fallback if user entered a valid-looking email or student code
    if (clean.includes('@')) {
      return {
        name: clean.includes('admin') ? 'Quản Trị Viên Hệ Thống' : 'Học viên Tin học GenZ',
        code: clean.includes('admin') ? 'ADMIN01' : clean.split('@')[0].toUpperCase(),
        email: clean,
        phone: clean.includes('admin') ? '0332298065' : '',
        role: clean.includes('admin') ? ('admin' as const) : ('student' as const),
        classOrSchool: clean.includes('admin') ? 'Cổng Quản Trị Hệ Thống' : 'Học viên đã đăng ký'
      };
    }

    return null;
  };

  // STEP 1: Handle Send OTP via Email or Phone
  const handleFindAndSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Vui lòng nhập Mã tài khoản, Gmail hoặc Số điện thoại!');
      soundFx.playClick();
      return;
    }

    const account = findAccountByIdentifier(identifier);
    if (!account) {
      setErrorMsg('Không tìm thấy tài khoản phù hợp với thông tin đã nhập. Vui lòng kiểm tra lại!');
      soundFx.playClick();
      return;
    }

    setTargetAccount(account);
    setIsSubmitting(true);
    soundFx.playClick();

    setTimeout(() => {
      const recovery = AccountRecoveryService.initiateRecovery(
        account.code,
        account.name,
        account.email,
        account.phone,
        account.role,
        deliveryChannel
      );

      setIsSubmitting(false);
      if (recovery.success) {
        setEmailLog(recovery.emailLog);
        setStep('enter_otp');
        setCountdown(600);
        const destinationText = deliveryChannel === 'phone'
          ? `số điện thoại ${AccountRecoveryService.maskPhone(account.phone || '0332298065')}`
          : `email ${AccountRecoveryService.maskEmail(account.email)}`;
        setSuccessMsg(`Mã xác nhận 6 chữ số đã được gửi tự động đến ${destinationText}!`);
        soundFx.playCorrect();
      } else {
        setErrorMsg('Không thể khởi tạo mã OTP, vui lòng thử lại sau!');
      }
    }, 600);
  };

  // STEP 2: Handle Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otpInput || otpInput.trim().length !== 6) {
      setErrorMsg('Vui lòng nhập đúng đủ 6 chữ số mã xác nhận!');
      soundFx.playClick();
      return;
    }

    const res = AccountRecoveryService.verifyOtp(otpInput);
    if (res.success) {
      soundFx.playCorrect();
      setSuccessMsg(res.message);
      setStep('new_password');
    } else {
      soundFx.playClick();
      setErrorMsg(res.message);
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (!targetAccount) return;
    soundFx.playClick();
    const recovery = AccountRecoveryService.initiateRecovery(
      targetAccount.code,
      targetAccount.name,
      targetAccount.email,
      targetAccount.role
    );
    if (recovery.success) {
      setEmailLog(recovery.emailLog);
      setCountdown(600);
      setOtpInput('');
      setSuccessMsg('Đã cấp và gửi lại mã xác nhận mới tới email của bạn!');
      soundFx.playCorrect();
    }
  };

  // Copy simulated OTP for fast testing
  const handleCopyOtp = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedOtp(true);
    soundFx.playClick();
    setTimeout(() => setCopiedOtp(false), 1500);
  };

  // STEP 3: Handle Set New Password
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      soundFx.playClick();
      return;
    }

    if (newPassword === '123' || newPassword === 'admin123') {
      setErrorMsg('Vui lòng không đặt lại mật khẩu mặc định (123). Hãy chọn mật khẩu bảo mật riêng của bạn!');
      soundFx.playClick();
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp!');
      soundFx.playClick();
      return;
    }

    if (!targetAccount) return;

    setIsSubmitting(true);
    const res = onResetPassword(targetAccount.code, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      AccountRecoveryService.clearSession();
      setStep('success');
      soundFx.playCorrect();
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      soundFx.playClick();
      setErrorMsg(res.message || 'Không thể cập nhật mật khẩu, vui lòng thử lại!');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="card animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          border: '1px solid #E2E8F0',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            padding: '6px',
            borderRadius: '50%',
            background: '#F1F5F9',
            border: 'none',
            cursor: 'pointer',
            color: '#64748B'
          }}
          title="Đóng"
        >
          <X size={18} />
        </button>

        {/* Modal Top Branding & Icon */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: '#EFF6FF',
            color: '#2563EB',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            border: '1px solid #BFDBFE'
          }}>
            {step === 'enter_otp' ? (
              <Mail size={26} />
            ) : step === 'new_password' ? (
              <KeyRound size={26} />
            ) : step === 'success' ? (
              <CheckCircle2 size={26} color="#10B981" />
            ) : (
              <ShieldCheck size={26} />
            )}
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            {step === 'enter_otp'
              ? 'Nhập Mã Xác Nhận Email'
              : step === 'new_password'
              ? 'Thiết Lập Mật Khẩu Mới'
              : step === 'success'
              ? 'Khôi Phục Thành Công'
              : 'Tự Khôi Phục Tài Khoản'}
          </h3>

          <p style={{ fontSize: '13px', color: '#64748B', margin: '6px 0 0', lineHeight: 1.5 }}>
            {step === 'enter_otp'
              ? `Hệ thống đã tự động gửi mã bảo mật 6 chữ số đến hộp thư của bạn.`
              : step === 'new_password'
              ? `Tài khoản ${targetAccount?.name} (${targetAccount?.code}) đã được xác thực an toàn.`
              : step === 'success'
              ? 'Mật khẩu tài khoản của bạn đã được cập nhật thành công!'
              : 'Hệ thống sẽ tự động sinh mã xác nhận OTP và gửi đến Email của bạn để xác thực.'}
          </p>
        </div>

        {/* Error / Feedback Banner */}
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            fontSize: '12.5px',
            fontWeight: 600,
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#059669',
            fontSize: '12.5px',
            fontWeight: 700,
            marginBottom: '16px'
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── BƯỚC 1: TÌM KIẾM TÀI KHOẢN & GỬI OTP EMAIL / PHONE ── */}
        {step === 'find_account' && (
          <form onSubmit={handleFindAndSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Mã tài khoản (ADMIN01 / THGZ01...), Gmail hoặc Số điện thoại
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Ví dụ: ADMIN01, admin, 0332298065, hoặc hdh.hutech@gmail.com"
                  value={identifier}
                  onChange={e => { setIdentifier(e.target.value); setErrorMsg(''); }}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '12px',
                    border: '1.5px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '13.5px',
                    paddingLeft: '38px',
                    paddingRight: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                  required
                />
              </div>
              <p style={{ fontSize: '11.5px', color: '#64748B', margin: '6px 0 0' }}>
                💡 Quản trị viên nhập <strong>ADMIN01</strong> hoặc <strong>admin</strong> • Học viên nhập <strong>THGZ01</strong>, <strong>THGZ02</strong>...
              </p>
            </div>

            {/* Delivery Channel Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Kênh Nhận Mã OTP Bảo Mật:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setDeliveryChannel('email'); soundFx.playClick(); }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: deliveryChannel === 'email' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                    background: deliveryChannel === 'email' ? '#EFF6FF' : '#FFFFFF',
                    color: deliveryChannel === 'email' ? '#1D4ED8' : '#64748B',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Mail size={14} />
                  <span>Hộp thư Gmail</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setDeliveryChannel('phone'); soundFx.playClick(); }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: deliveryChannel === 'phone' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                    background: deliveryChannel === 'phone' ? '#EFF6FF' : '#FFFFFF',
                    color: deliveryChannel === 'phone' ? '#1D4ED8' : '#64748B',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Phone size={14} />
                  <span>SĐT / SMS Zalo</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  height: '44px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 2,
                  height: '44px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
                }}
              >
                <span>{isSubmitting ? 'Đang kiểm tra...' : `Gửi Mã Qua ${deliveryChannel === 'phone' ? 'SĐT / SMS' : 'Gmail'}`}</span>
                <Send size={15} />
              </button>
            </div>
          </form>
        )}

        {/* ── BƯỚC 2: NHẬP MÃ OTP 6 SỐ TỰ ĐỘNG GỬI ── */}
        {step === 'enter_otp' && targetAccount && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Account & Destination Summary Box */}
            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '12px 14px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  {targetAccount.name} ({targetAccount.code})
                </span>
                <span style={{
                  fontSize: '11px',
                  background: targetAccount.role === 'admin' ? '#FEF3C7' : '#DBEAFE',
                  color: targetAccount.role === 'admin' ? '#92400E' : '#1E40AF',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 800
                }}>
                  {targetAccount.role === 'admin' ? '🛡️ Quản Trị Viên' : targetAccount.role === 'teacher' ? '👨‍🏫 Giảng Viên' : '🎓 Học Viên'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {deliveryChannel === 'phone' ? (
                  <>
                    <Phone size={13} color="#16A34A" />
                    <span>SĐT nhận mã: <strong>{AccountRecoveryService.maskPhone(targetAccount.phone || '0332298065')}</strong></span>
                  </>
                ) : (
                  <>
                    <Mail size={13} color="#2563EB" />
                    <span>Gmail nhận mã: <strong>{AccountRecoveryService.maskEmail(targetAccount.email)}</strong></span>
                  </>
                )}
              </div>
            </div>

            {/* Quick OTP Preview (Development & Practical Test Simulator) */}
            {emailLog && (
              <div style={{
                background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                border: '1px dashed #3B82F6',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#2563EB" />
                  <div style={{ fontSize: '12px', color: '#1E40AF' }}>
                    Mã xác nhận của bạn: <strong style={{ fontSize: '14px', letterSpacing: '2px', color: '#1D4ED8' }}>{emailLog.otpCode}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyOtp(emailLog.otpCode)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    border: '1px solid #BFDBFE',
                    color: '#2563EB',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {copiedOtp ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                  <span>{copiedOtp ? 'Đã chép' : 'Dán mã'}</span>
                </button>
              </div>
            )}

            {/* OTP Input Field */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                  Mã OTP 6 chữ số
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: countdown > 60 ? '#2563EB' : '#EF4444', fontWeight: 700 }}>
                  <Clock size={13} />
                  <span>{formatTime(countdown)}</span>
                </div>
              </div>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  setOtpInput(val);
                  setErrorMsg('');
                }}
                placeholder="------"
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: '12px',
                  border: '2px solid #3B82F6',
                  background: '#FFFFFF',
                  fontSize: '24px',
                  fontWeight: 800,
                  textAlign: 'center',
                  letterSpacing: '10px',
                  color: '#1D4ED8',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
            </div>

            {/* Countdown / Resend Action */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleResendOtp}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <RefreshCw size={13} />
                <span>{deliveryChannel === 'phone' ? 'Chưa nhận được SMS? Gửi lại mã OTP mới' : 'Chưa nhận được email? Gửi lại mã OTP mới'}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setStep('find_account')}
                style={{
                  flex: 1,
                  height: '44px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Quay Lại
              </button>
              <button
                type="submit"
                style={{
                  flex: 2,
                  height: '44px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
                }}
              >
                <span>Xác Thực Mã OTP</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* ── BƯỚC 3: THIẾT LẬP MẬT KHẨU MỚI ── */}
        {step === 'new_password' && targetAccount && (
          <form onSubmit={handleSaveNewPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#ECFDF5', borderRadius: '12px', padding: '10px 14px', border: '1px solid #A7F3D0', color: '#059669', fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} />
              <span>Đã xác minh email thành công. Mời bạn đặt mật khẩu mới:</span>
            </div>

            {/* New Password */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Mật khẩu mới (Tối thiểu 6 ký tự)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type={showNewPass ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu mới..."
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setErrorMsg(''); }}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '13.5px',
                    paddingLeft: '38px',
                    paddingRight: '42px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Xác nhận mật khẩu mới
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu mới..."
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setErrorMsg(''); }}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '13.5px',
                    paddingLeft: '38px',
                    paddingRight: '42px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                marginTop: '6px'
              }}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu Mật Khẩu & Đăng Nhập'}
            </button>
          </form>
        )}

        {/* ── BƯỚC 4: THÀNH CÔNG ── */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#ECFDF5',
              color: '#10B981',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Check size={36} />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
              Đặt Lại Mật Khẩu Thành Công!
            </h4>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
              Bạn có thể sử dụng mật khẩu mới để đăng nhập ngay bây giờ.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
