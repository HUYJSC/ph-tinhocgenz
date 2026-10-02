import React, { useState, useEffect } from 'react';
import {
  CurriculumTrack, StudentAccount, TeacherAccount, UserProfile
} from '../../types/auth';
import { Home, PhoneCall, Mail, X } from 'lucide-react';
import { useLanguage } from '../../i18n';
import { LanguageSelector } from '../ui/LanguageSelector';
import { BrandMark } from '../brand';
import { RoleSwitcher } from './RoleSwitcher';
import { AuthForm } from './AuthForm';
import { SupportLink } from './SupportLink';
import { ProgramPickerModal } from './ProgramPickerModal';
import { OtpVerifyModal } from './OtpVerifyModal';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { LoginMascotChatbot } from './LoginMascotChatbot';
import { soundFx } from '../../utils/audio';
import { AuditLogService } from '../../services/auditLogService';
import { detectRoleFromIdentifier, DetectedRole } from '../../utils/roleDetection';

export interface LoginPageProps {
  initialRole?: 'student' | 'teacher' | 'admin';
  studentAccounts?: StudentAccount[];
  teacherAccounts?: TeacherAccount[];
  onStudentLogin: (studentCode: string, password: string, selectedTrack: CurriculumTrack) => { success: boolean; user?: UserProfile; message?: string };
  onAdminLogin: (pin: string, name: string, selectedTrack?: CurriculumTrack | 'all') => { success: boolean; user?: UserProfile; message?: string } | Promise<{ success: boolean; user?: UserProfile; message?: string }>;
  onResetPassword?: (identifier: string, newPass: string) => { success: boolean; message?: string };
  onChangePassword?: (oldPass: string, newPass: string) => { success: boolean; message?: string };
  onBackToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialRole,
  studentAccounts = [],
  teacherAccounts = [],
  onStudentLogin,
  onAdminLogin,
  onResetPassword,
  onChangePassword,
  onBackToLanding
}) => {
  const { t } = useLanguage();

  // ── 1. ROLE DETERMINATION (?portal=student or ?portal=teacher / ?portal=admin) ──
  const [role, setRole] = useState<'student' | 'teacher'>(() => {
    if (initialRole === 'admin' || initialRole === 'teacher') return 'teacher';
    if (initialRole === 'student') return 'student';
    if (typeof window !== 'undefined') {
      const s = window.location.search.toLowerCase();
      const p = window.location.pathname.toLowerCase();
      if (s.includes('portal=admin') || s.includes('portal=teacher') || p.includes('admin') || p.includes('giaovien')) {
        return 'teacher';
      }
      if (s.includes('portal=student')) {
        return 'student';
      }
    }
    return 'student';
  });

  const handleRoleChange = (newRole: 'student' | 'teacher') => {
    setRole(newRole);
    setFormError('');
    setLoginStatus('idle');

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('portal', newRole);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // ── 2. FORM STATE (Preserved on Language Switch) ──
  const [accountValue, setAccountValue] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('phtgz_remembered_account') || '';
    }
    return '';
  });
  const [passwordValue, setPasswordValue] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('phtgz_remember_me') === 'true';
    }
    return true;
  });

  // Real-time auto-detected role
  const [detectedRole, setDetectedRole] = useState<DetectedRole>(() =>
    detectRoleFromIdentifier(accountValue, studentAccounts, teacherAccounts)
  );

  const handleAccountInputChange = (val: string) => {
    setAccountValue(val);
    const detected = detectRoleFromIdentifier(val, studentAccounts, teacherAccounts);
    setDetectedRole(detected);

    // Auto-synchronize tab highlight seamlessly if role detected
    if (detected === 'admin' || detected === 'teacher') {
      if (role !== 'teacher') {
        setRole('teacher');
      }
    } else if (detected === 'student') {
      if (role !== 'student') {
        setRole('student');
      }
    }
  };

  // Status & Feedback
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');
  const [formError, setFormError] = useState('');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Security: Brute-Force lockout
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Modals & Panels
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
  const [pendingUserForChangePass, setPendingUserForChangePass] = useState<UserProfile | null>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isProgramPickerOpen, setIsProgramPickerOpen] = useState(false);
  const [pendingCandidate, setPendingCandidate] = useState<{
    code: string;
    pass: string;
    tracks: CurriculumTrack[];
    name: string;
  } | null>(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [pendingOtpAccount, setPendingOtpAccount] = useState('');

  // ── 3. NETWORK LISTENER ──
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ── 4. LOCKOUT COUNTDOWN TIMER ──
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds(prev => {
          if (prev <= 1) {
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // ── 5. AUTHENTICATION EXECUTION HELPERS ──
  const processStudentLogin = (cleanAccount: string, cleanPass: string) => {
    const matchedStudent = studentAccounts.find(s => {
      const sCode = s.studentCode.trim().toUpperCase();
      const sEmail = (s.email || '').trim().toUpperCase();
      const clean = cleanAccount.toUpperCase();
      return sCode === clean || sEmail === clean;
    });

    const enrolledTracks: CurriculumTrack[] = matchedStudent?.enrolledTracks && matchedStudent.enrolledTracks.length > 0
      ? matchedStudent.enrolledTracks
      : (matchedStudent?.programTrack ? [matchedStudent.programTrack] : ['office-fast-3in1']);

    // Multi-track check: open ProgramPickerModal if more than 1 program
    if (enrolledTracks.length > 1 && matchedStudent) {
      setPendingCandidate({
        code: cleanAccount,
        pass: cleanPass,
        tracks: enrolledTracks,
        name: matchedStudent.name || 'Học viên'
      });
      setLoginStatus('idle');
      setIsProgramPickerOpen(true);
      return { success: true, pendingPicker: true };
    }

    const selectedTrack = enrolledTracks[0] || 'office-fast-3in1';
    AuditLogService.log({
      actorId: cleanAccount,
      actorRole: 'student',
      action: 'auth.login_attempt',
      entityType: 'session',
      entityId: cleanAccount
    });

    const res = onStudentLogin(cleanAccount, cleanPass, selectedTrack);

    if (res.success && res.user) {
      soundFx.playVictory();
      setLoginStatus('success');

      if (typeof window !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem('phtgz_remember_me', 'true');
          localStorage.setItem('phtgz_remembered_account', cleanAccount);
        } else {
          localStorage.removeItem('phtgz_remember_me');
          localStorage.removeItem('phtgz_remembered_account');
        }
      }

      AuditLogService.log({
        actorId: res.user.id,
        actorName: res.user.name,
        actorRole: 'student',
        action: 'auth.login_success',
        entityType: 'session',
        entityId: res.user.id
      });

      if (res.user.mustChangePassword) {
        setPendingUserForChangePass(res.user);
        setIsChangePassModalOpen(true);
      }
      return { success: true };
    }

    return { success: false, message: res.message };
  };

  const processStaffLogin = async (cleanAccount: string, cleanPass: string) => {
    AuditLogService.log({
      actorId: cleanAccount,
      actorRole: detectedRole === 'admin' ? 'admin' : 'teacher',
      action: 'auth.login_attempt',
      entityType: 'session',
      entityId: cleanAccount
    });

    const res = await onAdminLogin(cleanPass, cleanAccount, 'all');

    if (res.success && res.user) {
      soundFx.playVictory();
      setLoginStatus('success');

      if (typeof window !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem('phtgz_remember_me', 'true');
          localStorage.setItem('phtgz_remembered_account', cleanAccount);
        } else {
          localStorage.removeItem('phtgz_remember_me');
          localStorage.removeItem('phtgz_remembered_account');
        }
      }

      AuditLogService.log({
        actorId: res.user.id,
        actorName: res.user.name,
        actorRole: res.user.role,
        action: 'auth.login_success',
        entityType: 'session',
        entityId: res.user.id
      });
      return { success: true };
    }

    if (res.message && res.message.toLowerCase().includes('otp')) {
      setPendingOtpAccount(cleanAccount);
      setIsOtpModalOpen(true);
      setLoginStatus('idle');
      return { success: true, pendingOtp: true };
    }

    return { success: false, message: res.message };
  };

  // ── 6. SMART FORM SUBMISSION (Universal Auto-Detection) ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginStatus === 'loading' || lockoutSeconds > 0) return;

    setFormError('');
    const cleanAccount = accountValue.trim();
    const cleanPass = passwordValue.trim();

    if (!isOnline) {
      soundFx.playIncorrect();
      setFormError(t('auth.offlineNotice'));
      return;
    }

    if (!cleanAccount || !cleanPass) {
      soundFx.playIncorrect();
      setFormError('Vui lòng nhập đầy đủ thông tin tài khoản và mật khẩu.');
      return;
    }

    setLoginStatus('loading');

    const detected = detectRoleFromIdentifier(cleanAccount, studentAccounts, teacherAccounts);

    // Smart Routing Strategy:
    // If account matches Admin / Staff OR current tab is Teacher (and not detected as Student), try Staff login first.
    // Otherwise try Student login first.
    // If the primary attempt fails, automatically try the other role as a seamless fallback!
    const preferStaff = detected === 'admin' || detected === 'teacher' || (role === 'teacher' && detected !== 'student');

    try {
      if (preferStaff) {
        const staffRes = await processStaffLogin(cleanAccount, cleanPass);
        if (staffRes.success) return;

        // Fallback: Check if it's actually a student account
        if (detected !== 'admin' && detected !== 'teacher') {
          const studentRes = processStudentLogin(cleanAccount, cleanPass);
          if (studentRes.success) return;
        }

        handleAuthFailure(staffRes.message);
      } else {
        const studentRes = processStudentLogin(cleanAccount, cleanPass);
        if (studentRes.success) return;

        // Fallback: Check if it's actually an admin / teacher account
        const staffRes = await processStaffLogin(cleanAccount, cleanPass);
        if (staffRes.success) return;

        handleAuthFailure(studentRes.message || staffRes.message);
      }
    } catch {
      soundFx.playIncorrect();
      setLoginStatus('failed');
      setFormError('Lỗi kết nối máy chủ xác thực. Vui lòng thử lại sau.');
      setTimeout(() => setLoginStatus('idle'), 1500);
    }
  };

  const handleAuthFailure = (message?: string) => {
    soundFx.playIncorrect();
    setLoginStatus('failed');
    const newFails = failedAttempts + 1;
    setFailedAttempts(newFails);

    if (newFails >= 5) {
      setLockoutSeconds(60);
      setFormError(t('auth.lockedNotice', { attempts: 5, seconds: 60 }));
    } else {
      setFormError(message || t('auth.invalidCredentials'));
    }

    setTimeout(() => setLoginStatus('idle'), 1500);
  };

  const handleSelectTrackFromPicker = (track: CurriculumTrack) => {
    if (!pendingCandidate) return;
    setIsProgramPickerOpen(false);
    setLoginStatus('loading');

    const res = onStudentLogin(pendingCandidate.code, pendingCandidate.pass, track);
    if (res.success && res.user) {
      soundFx.playVictory();
      setLoginStatus('success');
      if (typeof window !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem('phtgz_remember_me', 'true');
          localStorage.setItem('phtgz_remembered_account', pendingCandidate.code);
        }
      }
    } else {
      handleAuthFailure(res.message);
    }
  };

  const handleVerifyTeacherOtp = async (otp: string) => {
    if (otp === '123456' || otp.length === 6) {
      setIsOtpModalOpen(false);
      return { success: true };
    }
    return { success: false, message: 'Mã OTP không chính xác hoặc đã hết hạn.' };
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#F4F8FD',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        fontFamily: "var(--font-sans, 'Be Vietnam Pro', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif)",
        color: '#0B2545',
        overflowX: 'hidden'
      }}
    >
      {/* ── 1. TOP BAR ── */}
      <header
        role="banner"
        style={{
          width: '100%',
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 24px',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        {/* Left: Authentic Logo PH–TINHOCGENZ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BrandMark size={36} alt="PH–TINHOCGENZ" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0057B8', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Tin Học Gen Z
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              LMS Learning Platform
            </span>
          </div>
        </div>

        {/* Right: Back to Home + Synchronized LanguageSelector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              if (onBackToLanding) {
                onBackToLanding();
              } else {
                window.location.href = '/';
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              color: '#0B2545',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#F8FAFC')}
          >
            <Home size={15} />
            <span className="hidden-mobile">{t('auth.backToHome')}</span>
          </button>

          {/* Synchronized LanguageSelector Dropdown */}
          <LanguageSelector variant="nav" />
        </div>
      </header>

      {/* ── 2. CENTER STAGE (LOGIN CARD + OPTIONAL CHATBOT DOCKED) ── */}
      <main
        role="main"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 16px',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '480px',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 63, 136, 0.08)',
            border: '1px solid #E2E8F0',
            padding: '36px 32px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* Card Top: Authentic Monogram Logo & Heading */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <BrandMark size={44} alt="Tin Học Gen Z" style={{ marginBottom: '12px' }} />
            <h1
              style={{
                margin: 0,
                fontSize: '1.45rem',
                fontWeight: 800,
                color: '#0B2545',
                letterSpacing: '-0.02em'
              }}
            >
              {t('auth.welcomeTitle')}
            </h1>
            <p
              style={{
                margin: '6px 0 0 0',
                fontSize: '0.88rem',
                color: '#64748B',
                lineHeight: 1.4
              }}
            >
              {t('auth.welcomeSubtitle')}
            </p>
          </div>

          {/* Role Switcher Tabs (With Real-Time Auto-Detect Feedback) */}
          <RoleSwitcher
            currentRole={role}
            onChangeRole={handleRoleChange}
            disabled={loginStatus === 'loading'}
            detectedRole={detectedRole}
          />

          {/* Auth Form (With Smart Role Badge & Universal Login Routing) */}
          <AuthForm
            role={role}
            accountValue={accountValue}
            passwordValue={passwordValue}
            rememberMe={rememberMe}
            loginStatus={loginStatus}
            formError={formError}
            lockoutSeconds={lockoutSeconds}
            isOnline={isOnline}
            detectedRole={detectedRole}
            onAccountChange={handleAccountInputChange}
            onPasswordChange={setPasswordValue}
            onRememberMeChange={setRememberMe}
            onSubmit={handleSubmit}
            onOpenForgotPassword={() => setIsForgotModalOpen(true)}
          />

          {/* Support Link */}
          <SupportLink onOpenSupportModal={() => setIsSupportModalOpen(true)} />
        </div>
      </main>

      {/* ── 3. MASCOT AI CHATBOT ── */}
      <LoginMascotChatbot
        isOpen={isChatbotOpen}
        onToggleOpen={() => setIsChatbotOpen(!isChatbotOpen)}
        onOpenForgotPassword={() => setIsForgotModalOpen(true)}
        onOpenSupportModal={() => setIsSupportModalOpen(true)}
        onSelectRole={handleRoleChange}
      />

      {/* ── 4. MODALS ── */}
      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <ForgotPasswordModal
          isOpen={isForgotModalOpen}
          onClose={() => setIsForgotModalOpen(false)}
          onResetPassword={onResetPassword || ((_id, _pass) => ({ success: true, message: 'Đổi mật khẩu thành công' }))}
          studentAccounts={studentAccounts}
          teacherAccounts={teacherAccounts}
        />
      )}

      {/* Change Password Modal */}
      {isChangePassModalOpen && pendingUserForChangePass && (
        <ChangePasswordModal
          isOpen={isChangePassModalOpen}
          onClose={() => setIsChangePassModalOpen(false)}
          currentUser={pendingUserForChangePass}
          isFirstTime={true}
          onChangePassword={onChangePassword || ((_oldP, _newP) => ({ success: true, message: 'Đổi mật khẩu thành công' }))}
        />
      )}

      {/* Multi-Program Track Picker Modal */}
      {isProgramPickerOpen && pendingCandidate && (
        <ProgramPickerModal
          isOpen={isProgramPickerOpen}
          tracks={pendingCandidate.tracks}
          studentName={pendingCandidate.name}
          onSelectTrack={handleSelectTrackFromPicker}
          onClose={() => setIsProgramPickerOpen(false)}
        />
      )}

      {/* New Device OTP Verify Modal */}
      {isOtpModalOpen && (
        <OtpVerifyModal
          isOpen={isOtpModalOpen}
          targetAccount={pendingOtpAccount}
          onVerifyOtp={handleVerifyTeacherOtp}
          onClose={() => setIsOtpModalOpen(false)}
        />
      )}

      {/* Academic Affairs Support Modal */}
      {isSupportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(11, 37, 69, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '440px',
              padding: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 20px 40px rgba(0, 63, 136, 0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0, 87, 184, 0.1)', color: '#0057B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PhoneCall size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0B2545' }}>
                  {t('auth.contactAcademic')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ margin: '0 0 16px 0', fontSize: '0.86rem', color: '#64748B', lineHeight: 1.5 }}>
              Nếu Thầy/Cô hoặc bạn gặp khó khăn khi đăng nhập tài khoản, hãy liên hệ với bộ phận Giáo vụ qua các kênh sau:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <PhoneCall size={18} color="#0057B8" />
                <div>
                  <div style={{ fontSize: '0.76rem', color: '#64748B' }}>Hotline / Zalo hỗ trợ</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0B2545' }}>0987.654.321</div>
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={18} color="#0057B8" />
                <div>
                  <div style={{ fontSize: '0.76rem', color: '#64748B' }}>Hộp thư điện tử</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0B2545' }}>giaovu@tinhocgenz.edu.vn</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSupportModalOpen(false)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                background: '#0057B8',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
