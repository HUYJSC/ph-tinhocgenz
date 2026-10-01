import React, { useState, useEffect, useMemo } from 'react';
import { CurriculumTrack, StudentAccount, TeacherAccount, UserProfile, TRACK_LIST, TRACK_LABELS } from '../../types/auth';
import {
  User, Shield, ShieldAlert, BookOpen, ArrowRight, Eye, EyeOff,
  GraduationCap, Lock, ArrowLeft, Loader2, CheckCircle2,
  AlertTriangle, WifiOff, LogOut, HelpCircle
} from 'lucide-react';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { soundFx } from '../../utils/audio';
import { BrandMark } from '../brand';
import { AuditLogService } from '../../services/auditLogService';
import { authService } from '../../services/api/authService';

interface UnifiedAuthGatewayProps {
  initialRole?: 'student' | 'admin';
  studentAccounts?: StudentAccount[];
  teacherAccounts?: TeacherAccount[];
  onStudentLogin: (studentCode: string, password: string, selectedTrack: CurriculumTrack) => { success: boolean; user?: UserProfile; message?: string };
  onAdminLogin: (pin: string, name: string, selectedTrack?: CurriculumTrack | 'all') => { success: boolean; user?: UserProfile; message?: string } | Promise<{ success: boolean; user?: UserProfile; message?: string }>;
  onResetPassword?: (identifier: string, newPass: string) => { success: boolean; message?: string };
  onChangePassword?: (oldPass: string, newPass: string) => { success: boolean; message?: string };
  onBackToLanding?: () => void;
}

export const UnifiedAuthGateway: React.FC<UnifiedAuthGatewayProps> = ({
  initialRole,
  studentAccounts = [],
  teacherAccounts = [],
  onStudentLogin,
  onAdminLogin,
  onResetPassword,
  onChangePassword,
  onBackToLanding
}) => {
  // ── 1. ROLE DETERMINATION (?portal=student or ?portal=admin / ?portal=teacher) ──
  const [role, setRole] = useState<'student' | 'admin'>(() => {
    if (initialRole) return initialRole;
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      const h = window.location.hash.toLowerCase();
      const s = window.location.search.toLowerCase();
      if (s.includes('portal=admin') || s.includes('portal=teacher') || p.includes('admin') || h.includes('admin')) {
        return 'admin';
      }
      if (s.includes('portal=student')) {
        return 'student';
      }
    }
    return 'student';
  });

  // Switch role tab and update URL query cleanly
  const handleSelectRole = (newRole: 'student' | 'admin') => {
    setRole(newRole);
    soundFx.playClick();
    setFormError('');
    setLoginStatus('idle');

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('portal', newRole);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // ── 2. FORM STATES ──
  const [studentCode, setStudentCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('phtgz_remembered_student') || '';
    }
    return '';
  });
  const [studentPassword, setStudentPassword] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<CurriculumTrack>('office-fast-3in1');

  const [adminName, setAdminName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('phtgz_remembered_staff') || '';
    }
    return '';
  });
  const [adminPin, setAdminPin] = useState('');
  const [adminTrackChoice, setAdminTrackChoice] = useState<CurriculumTrack | 'all'>('all');

  // UI Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('phtgz_remember_me') === 'true';
    }
    return true;
  });

  // Modals
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
  const [pendingUserForChangePass, setPendingUserForChangePass] = useState<UserProfile | null>(null);
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);
  const [logoutAllMessage, setLogoutAllMessage] = useState('');

  // Status & Button Feedback (idle | loading | success | failed)
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');
  const [formError, setFormError] = useState('');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Security: Brute-Force lockout (5 failed attempts -> 60s lockout)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Special System Banner notices (Session expired, maintenance)
  const [systemNotice, setSystemNotice] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const s = window.location.search.toLowerCase();
      if (s.includes('reason=session_expired') || s.includes('expired=true')) {
        return 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại để tiếp tục học tập.';
      }
      if (s.includes('status=maintenance')) {
        return 'Hệ thống đang đồng bộ dữ liệu khảo thí định kỳ. Kết quả học tập được bảo toàn an toàn.';
      }
    }
    return null;
  });

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

  // ── 5. SMART CURRICULUM TRACK RESOLUTION (Requirement 5) ──
  // Do NOT require selecting track upfront!
  // After entering student code or email:
  // - If single enrolled track -> auto select
  // - If multiple enrolled tracks -> show list of their courses
  // - If unidentified -> show friendly help & support link
  const trackResolution = useMemo(() => {
    const clean = studentCode.trim().toUpperCase();
    if (!clean || clean.length < 2) {
      return { status: 'idle' as const, tracks: [] as CurriculumTrack[], student: null };
    }

    const matched = studentAccounts.find(s => {
      const sCode = s.studentCode.trim().toUpperCase();
      const sEmail = (s.email || '').trim().toUpperCase();
      const sPhone = (s.phone || '').replace(/[\s.\-()+]/g, '');
      const cleanPhone = clean.replace(/[\s.\-()+]/g, '');
      return sCode === clean || sEmail === clean || (sPhone && sPhone === cleanPhone);
    });

    if (!matched) {
      return { status: 'unidentified' as const, tracks: [] as CurriculumTrack[], student: null };
    }

    const enrolled: CurriculumTrack[] = (matched.enrolledTracks && matched.enrolledTracks.length > 0)
      ? matched.enrolledTracks
      : (matched.programTrack ? [matched.programTrack] : ['office-fast-3in1']);

    if (enrolled.length === 1) {
      return { status: 'single' as const, tracks: enrolled, student: matched };
    } else {
      return { status: 'multiple' as const, tracks: enrolled, student: matched };
    }
  }, [studentCode, studentAccounts]);

  // Sync selectedTrack with resolution
  useEffect(() => {
    if (trackResolution.status === 'single' && trackResolution.tracks[0]) {
      setSelectedTrack(trackResolution.tracks[0]);
    } else if (trackResolution.status === 'multiple' && trackResolution.tracks[0]) {
      if (!trackResolution.tracks.includes(selectedTrack)) {
        setSelectedTrack(trackResolution.tracks[0]);
      }
    }
  }, [trackResolution, selectedTrack]);

  // ── 6. STUDENT LOGIN SUBMISSION ──
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginStatus === 'loading' || lockoutSeconds > 0) return;

    setFormError('');
    const cleanCode = studentCode.trim();
    const cleanPass = studentPassword.trim();

    if (!isOnline) {
      soundFx.playIncorrect();
      setFormError('Thiết bị đang ngoại tuyến. Vui lòng kiểm tra kết nối mạng Wi-Fi hoặc 4G/5G.');
      return;
    }

    if (!cleanCode) {
      soundFx.playIncorrect();
      setFormError('Vui lòng nhập Mã học viên hoặc Email.');
      return;
    }

    if (!cleanPass) {
      soundFx.playIncorrect();
      setFormError('Vui lòng nhập Mật khẩu tài khoản.');
      return;
    }

    setLoginStatus('loading');

    try {
      // Log attempt to security audit
      AuditLogService.log({
        actorId: cleanCode,
        actorRole: 'student',
        action: 'auth.login_attempt',
        entityType: 'session',
        entityId: cleanCode
      });

      const res = onStudentLogin(cleanCode, cleanPass, selectedTrack);

      if (res.success && res.user) {
        soundFx.playVictory();
        setLoginStatus('success');

        // Remember login preference
        if (typeof window !== 'undefined') {
          if (rememberMe) {
            localStorage.setItem('phtgz_remember_me', 'true');
            localStorage.setItem('phtgz_remembered_student', cleanCode);
          } else {
            localStorage.removeItem('phtgz_remember_me');
            localStorage.removeItem('phtgz_remembered_student');
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

        // Check if user must change password
        if (res.user.mustChangePassword) {
          setPendingUserForChangePass(res.user);
          setIsChangePassModalOpen(true);
        }
      } else {
        soundFx.playIncorrect();
        setLoginStatus('failed');

        const newFails = failedAttempts + 1;
        setFailedAttempts(newFails);

        AuditLogService.log({
          actorId: cleanCode,
          actorRole: 'student',
          action: 'auth.login_failed',
          entityType: 'session',
          entityId: cleanCode
        });

        if (newFails >= 5) {
          setLockoutSeconds(60);
          setFormError('Tài khoản tạm khóa: Bạn đã nhập sai 5 lần liên tiếp. Vui lòng đợi 60 giây hoặc sử dụng chức năng Quên mật khẩu.');
        } else {
          setFormError(res.message || 'Thông tin tài khoản hoặc mật khẩu chưa chính xác. Vui lòng kiểm tra lại.');
        }

        setTimeout(() => setLoginStatus('idle'), 1500);
      }
    } catch {
      soundFx.playIncorrect();
      setLoginStatus('failed');
      setFormError('Lỗi kết nối máy chủ xác thực. Vui lòng thử lại sau giây lát.');
      setTimeout(() => setLoginStatus('idle'), 1500);
    }
  };

  // ── 7. TEACHER / ADMIN LOGIN SUBMISSION ──
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginStatus === 'loading' || lockoutSeconds > 0) return;

    setFormError('');
    const cleanName = adminName.trim();
    const cleanPin = adminPin.trim();

    if (!isOnline) {
      soundFx.playIncorrect();
      setFormError('Thiết bị đang ngoại tuyến. Vui lòng kiểm tra kết nối mạng Wi-Fi hoặc 4G/5G.');
      return;
    }

    if (!cleanName) {
      soundFx.playIncorrect();
      setFormError('Vui lòng nhập tài khoản hoặc email cán bộ.');
      return;
    }

    if (!cleanPin) {
      soundFx.playIncorrect();
      setFormError('Vui lòng nhập mật khẩu xác thực.');
      return;
    }

    setLoginStatus('loading');

    try {
      AuditLogService.log({
        actorId: cleanName,
        actorRole: 'admin',
        action: 'auth.login_attempt',
        entityType: 'session',
        entityId: cleanName
      });

      const res = await onAdminLogin(cleanPin, cleanName, adminTrackChoice);

      if (res.success && res.user) {
        soundFx.playVictory();
        setLoginStatus('success');

        if (typeof window !== 'undefined') {
          if (rememberMe) {
            localStorage.setItem('phtgz_remember_me', 'true');
            localStorage.setItem('phtgz_remembered_staff', cleanName);
          } else {
            localStorage.removeItem('phtgz_remember_me');
            localStorage.removeItem('phtgz_remembered_staff');
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
      } else {
        soundFx.playIncorrect();
        setLoginStatus('failed');

        const newFails = failedAttempts + 1;
        setFailedAttempts(newFails);

        AuditLogService.log({
          actorId: cleanName,
          actorRole: 'admin',
          action: 'auth.login_failed',
          entityType: 'session',
          entityId: cleanName
        });

        if (newFails >= 5) {
          setLockoutSeconds(60);
          setFormError('Tài khoản tạm khóa: Bạn đã nhập sai 5 lần liên tiếp. Vui lòng đợi 60 giây.');
        } else {
          setFormError(res.message || 'Thông tin tài khoản hoặc mật khẩu không chính xác. Quyền truy cập bị từ chối.');
        }

        setTimeout(() => setLoginStatus('idle'), 1500);
      }
    } catch {
      soundFx.playIncorrect();
      setLoginStatus('failed');
      setFormError('Lỗi kết nối tới máy chủ xác thực. Vui lòng thử lại sau giây lát.');
      setTimeout(() => setLoginStatus('idle'), 1500);
    }
  };

  // ── 8. LOGOUT FROM ALL DEVICES ──
  const handleLogoutAllDevices = async () => {
    try {
      await authService.serverLogout();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('phtgz_session_active_v4');
        localStorage.removeItem('phtinhocgenz_auth_user_v12');
      }
      AuditLogService.log({
        actorId: studentCode || adminName || 'anonymous',
        actorRole: role,
        action: 'auth.logout_all_devices',
        entityType: 'session',
        entityId: 'all'
      });
      setShowLogoutAllConfirm(false);
      setLogoutAllMessage('Đã hủy phiên làm việc trên toàn bộ các thiết bị thành công.');
      soundFx.playClick();
      setTimeout(() => setLogoutAllMessage(''), 5000);
    } catch {
      setLogoutAllMessage('Không thể kết nối máy chủ để đăng xuất toàn bộ thiết bị.');
    }
  };

  return (
    <div className="auth-page-container">
      {/* Main Dual-Column Card */}
      <div className="auth-master-card">

        {/* ─── LEFT COLUMN: BRAND IDENTIFICATION & EDUCATIONAL SHOWCASE (DESKTOP/TABLET) ─── */}
        <div className="auth-left-column">
          <div>
            {/* Back button */}
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
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                color: '#FFFFFF',
                padding: '7px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                marginBottom: '28px'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; }}
            >
              <ArrowLeft size={13} /> Quay lại Trang chủ
            </button>

            {/* Brand Logo & Slogan */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
              <BrandMark
                size={52}
                alt="Tin Học Gen Z"
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(11, 37, 69, 0.4))',
                  flexShrink: 0
                }}
              />
              <div>
                <h1 style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  margin: 0,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em'
                }}>
                  Tin Học Gen Z
                </h1>
                <span style={{
                  display: 'inline-block',
                  marginTop: '3px',
                  fontSize: '11px',
                  color: '#FDE047',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}>
                  Học Thiệt • Thi Thật • Giá Trị Thật
                </span>
              </div>
            </div>

            <p style={{
              fontSize: '13.5px',
              color: '#DBEAFE',
              lineHeight: 1.6,
              marginBottom: '26px',
              maxWidth: '340px'
            }}>
              Nền tảng đào tạo & khảo thí Tin học thực chiến chuẩn quốc tế Certiport và Bộ TT&TT.
            </p>

            {/* Educational Vector Graphic (Requirement 9) */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              <svg width="180" height="90" viewBox="0 0 180 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Laptop monitor base */}
                <rect x="25" y="16" width="130" height="60" rx="6" fill="#0B2545" fillOpacity="0.8" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                <rect x="33" y="24" width="114" height="44" rx="3" fill="#003F88" fillOpacity="0.6"/>
                <path d="M15 76H165C167 76 169 78 167 80L163 82H17L13 80C11 78 13 76 15 76Z" fill="rgba(255,255,255,0.25)"/>
                {/* Screen content: exam badge and progress */}
                <circle cx="50" cy="46" r="10" fill="#0057B8" stroke="#38BDF8" strokeWidth="1.5"/>
                <path d="M46 46L49 49L55 43" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="68" y="40" width="60" height="4" rx="2" fill="rgba(255,255,255,0.4)"/>
                <rect x="68" y="48" width="40" height="4" rx="2" fill="#38BDF8"/>
                {/* Floating academic stars */}
                <path d="M148 18L150 22L154 23L151 26L152 30L148 28L144 30L145 26L142 23L146 22L148 18Z" fill="#FDE047" fillOpacity="0.85"/>
                <path d="M22 34L23 37L26 38L24 40L25 43L22 41L19 43L20 40L18 38L21 37L22 34Z" fill="#93C5FD" fillOpacity="0.7"/>
              </svg>

              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF', marginTop: '10px' }}>
                Khảo thí trắc nghiệm & Thực hành 100% thời gian thực
              </div>
              <div style={{ fontSize: '11.5px', color: '#BFDBFE', marginTop: '4px' }}>
                Bảo vệ tài khoản và kết quả thi theo tiêu chuẩn an toàn LMS.
              </div>
            </div>
          </div>

          {/* Help & Support Footnote */}
          <div style={{
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.16)',
            fontSize: '11.5px',
            color: '#BFDBFE',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFFFFF', fontWeight: 600 }}>
              <HelpCircle size={13} color="#FDE047" />
              <span>Cần trợ giúp truy cập?</span>
            </div>
            <div style={{ color: '#E0E7FF' }}>
              Hotline: <strong>0332 298 065</strong> • Zalo OA: Tin Học Gen Z
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: AUTHENTICATION FORM ─── */}
        <div className="auth-right-column">
          <div>
            {/* Mobile Header (Requirement 10) */}
            <div className="auth-mobile-header">
              <BrandMark size={46} alt="Tin Học Gen Z" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#0B2545', letterSpacing: '-0.02em' }}>
                Tin Học Gen Z
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
                Học Thiệt • Thi Thật • Giá Trị Thật
              </div>
            </div>

            {/* Form Title & Description */}
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: 900,
                color: '#0B2545',
                letterSpacing: '-0.02em',
                marginBottom: '4px'
              }}>
                Đăng nhập Cổng Đào Tạo
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                Hệ thống xác thực LMS an toàn. Vui lòng chọn cổng truy cập phù hợp.
              </p>
            </div>

            {/* ─── ROLE TOGGLE: CỔNG HỌC VIÊN vs CỔNG GIẢNG VIÊN (Requirement 3) ─── */}
            <div style={{
              display: 'flex',
              background: '#F4F8FD',
              borderRadius: '12px',
              padding: '4px',
              marginBottom: '20px',
              border: '1px solid #E2E8F0'
            }}>
              <button
                type="button"
                onClick={() => handleSelectRole('student')}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: role === 'student' ? '#0057B8' : 'transparent',
                  color: role === 'student' ? '#FFFFFF' : '#475569',
                  fontSize: '13.5px',
                  fontWeight: role === 'student' ? 700 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: role === 'student' ? '0 2px 8px rgba(0, 87, 184, 0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <GraduationCap size={16} /> Cổng Học viên
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('admin')}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: role === 'admin' ? '#0057B8' : 'transparent',
                  color: role === 'admin' ? '#FFFFFF' : '#475569',
                  fontSize: '13.5px',
                  fontWeight: role === 'admin' ? 700 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: role === 'admin' ? '0 2px 8px rgba(0, 87, 184, 0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Shield size={16} /> Cổng Giảng viên
              </button>
            </div>

            {/* ─── SYSTEM BANNERS (Lỗi mạng, Bảo trì, Phiên hết hạn) ─── */}
            {!isOnline && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#B91C1C',
                fontSize: '12.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <WifiOff size={16} style={{ flexShrink: 0 }} />
                <span>Mất kết nối mạng. Vui lòng kiểm tra lại đường truyền Wi-Fi hoặc 4G/5G.</span>
              </div>
            )}

            {systemNotice && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: '#FEF3C7',
                border: '1px solid #FDE68A',
                color: '#92400E',
                fontSize: '12.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>{systemNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSystemNotice(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400E', fontSize: '16px', lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
            )}

            {logoutAllMessage && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                fontSize: '12.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{logoutAllMessage}</span>
              </div>
            )}

            {/* Error Message Banner */}
            {formError && (
              <div style={{
                padding: '11px 14px',
                borderRadius: '10px',
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#B91C1C',
                fontSize: '12.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{formError}</span>
              </div>
            )}

            {/* Lockout Banner */}
            {lockoutSeconds > 0 && (
              <div style={{
                padding: '11px 14px',
                borderRadius: '10px',
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                fontSize: '12.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <Lock size={16} />
                <span>Tạm khóa: Vui lòng đợi {lockoutSeconds} giây trước khi thử lại.</span>
              </div>
            )}

            {/* ─── ROLE 1: CỔNG HỌC VIÊN ─── */}
            {role === 'student' ? (
              <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* 1. Student Code or Email (Input first!) */}
                <div>
                  <label htmlFor="student-code" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0B2545',
                    marginBottom: '6px'
                  }}>
                    <User size={14} color="#0057B8" /> Mã học viên hoặc Email
                  </label>
                  <input
                    id="student-code"
                    name="username"
                    autoComplete="username"
                    type="text"
                    disabled={lockoutSeconds > 0 || loginStatus === 'loading'}
                    value={studentCode}
                    onChange={e => {
                      setStudentCode(e.target.value);
                      setFormError('');
                    }}
                    placeholder="Nhập mã học viên hoặc email đã ghi danh"
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      borderRadius: '10px',
                      background: '#F8FAFC',
                      border: '1.5px solid #CBD5E1',
                      color: '#0B2545',
                      fontSize: '14px',
                      padding: '0 14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#0057B8'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#CBD5E1'; }}
                  />
                </div>

                {/* 2. Smart Course Track Resolution Display (Requirement 5) */}
                {trackResolution.status === 'single' && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#F0F9FF',
                    border: '1px solid #BAE6FD',
                    fontSize: '12px',
                    color: '#0369A1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <BookOpen size={14} color="#0057B8" />
                    <span>
                      Chương trình: <strong>{TRACK_LABELS[selectedTrack] || selectedTrack}</strong>
                    </span>
                  </div>
                )}

                {trackResolution.status === 'multiple' && (
                  <div>
                    <label htmlFor="student-track-select" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#0B2545',
                      marginBottom: '4px'
                    }}>
                      <BookOpen size={14} color="#0057B8" /> Chọn môn học bạn muốn vào:
                    </label>
                    <select
                      id="student-track-select"
                      value={selectedTrack}
                      onChange={e => setSelectedTrack(e.target.value as CurriculumTrack)}
                      style={{
                        width: '100%',
                        minHeight: '42px',
                        borderRadius: '10px',
                        background: '#FFFFFF',
                        border: '1.5px solid #0057B8',
                        color: '#0B2545',
                        fontSize: '13px',
                        fontWeight: 600,
                        padding: '0 10px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {trackResolution.tracks.map(t => (
                        <option key={t} value={t}>
                          {TRACK_LABELS[t as CurriculumTrack] || t}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {trackResolution.status === 'unidentified' && studentCode.trim().length >= 3 && (
                  <div>
                    <div style={{
                      fontSize: '11.5px',
                      color: '#64748B',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>Chưa nhận diện lớp tự động? Chọn môn học dự kiến:</span>
                    </div>
                    <select
                      id="student-track-fallback"
                      value={selectedTrack}
                      onChange={e => setSelectedTrack(e.target.value as CurriculumTrack)}
                      style={{
                        width: '100%',
                        minHeight: '40px',
                        borderRadius: '8px',
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        color: '#0B2545',
                        fontSize: '12.5px',
                        padding: '0 10px',
                        outline: 'none'
                      }}
                    >
                      {TRACK_LIST.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 3. Password Input */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label htmlFor="student-password" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0B2545'
                    }}>
                      <Lock size={14} color="#0057B8" /> Mật khẩu
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setIsForgotModalOpen(true);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0057B8',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="student-password"
                      name="password"
                      autoComplete="current-password"
                      type={showPassword ? 'text' : 'password'}
                      disabled={lockoutSeconds > 0 || loginStatus === 'loading'}
                      value={studentPassword}
                      onChange={e => {
                        setStudentPassword(e.target.value);
                        setFormError('');
                      }}
                      placeholder="Nhập mật khẩu tài khoản"
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        borderRadius: '10px',
                        background: '#F8FAFC',
                        border: '1.5px solid #CBD5E1',
                        color: '#0B2545',
                        fontSize: '14px',
                        padding: '0 42px 0 14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#0057B8'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#CBD5E1'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Hiện hoặc ẩn mật khẩu"
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748B',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* 4. Remember Me Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label htmlFor="remember-me" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#475569',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#0057B8', cursor: 'pointer' }}
                    />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowLogoutAllConfirm(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <LogOut size={12} /> Đăng xuất mọi thiết bị
                  </button>
                </div>

                {/* 5. Submit Button with 6 States (Requirement 8) */}
                <button
                  type="submit"
                  disabled={lockoutSeconds > 0 || loginStatus === 'loading'}
                  className={`auth-btn-submit ${
                    loginStatus === 'loading'
                      ? 'is-loading'
                      : loginStatus === 'success'
                        ? 'is-success'
                        : loginStatus === 'failed'
                          ? 'is-failed'
                          : ''
                  }`}
                >
                  {loginStatus === 'loading' ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Đang xác thực thông tin...</span>
                    </>
                  ) : loginStatus === 'success' ? (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Đăng nhập thành công!</span>
                    </>
                  ) : loginStatus === 'failed' ? (
                    <>
                      <ShieldAlert size={18} />
                      <span>Đăng nhập thất bại</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập Cổng Học viên</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* ─── ROLE 2: CỔNG GIẢNG VIÊN / QUẢN TRỊ ─── */
              <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* 1. Staff Account / Email */}
                <div>
                  <label htmlFor="admin-name" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0B2545',
                    marginBottom: '6px'
                  }}>
                    <User size={14} color="#0057B8" /> Tài khoản hoặc Email Giảng viên
                  </label>
                  <input
                    id="admin-name"
                    name="admin-name"
                    type="text"
                    disabled={lockoutSeconds > 0 || loginStatus === 'loading'}
                    value={adminName}
                    onChange={e => {
                      setAdminName(e.target.value);
                      setFormError('');
                    }}
                    placeholder="Nhập tài khoản hoặc email được cấp"
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      borderRadius: '10px',
                      background: '#F8FAFC',
                      border: '1.5px solid #CBD5E1',
                      color: '#0B2545',
                      fontSize: '14px',
                      padding: '0 14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#0057B8'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#CBD5E1'; }}
                  />
                </div>

                {/* 2. Staff Password / PIN */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label htmlFor="admin-pin" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0B2545'
                    }}>
                      <Shield size={14} color="#0057B8" /> Mật khẩu xác thực
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setIsForgotModalOpen(true);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0057B8',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="admin-pin"
                      name="admin-pin"
                      type={showPassword ? 'text' : 'password'}
                      disabled={lockoutSeconds > 0 || loginStatus === 'loading'}
                      value={adminPin}
                      onChange={e => {
                        setAdminPin(e.target.value);
                        setFormError('');
                      }}
                      placeholder="Nhập mật khẩu hoặc mã PIN"
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        borderRadius: '10px',
                        background: '#F8FAFC',
                        border: '1.5px solid #CBD5E1',
                        color: '#0B2545',
                        fontSize: '14px',
                        padding: '0 42px 0 14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#0057B8'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#CBD5E1'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Hiện hoặc ẩn mật khẩu"
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748B',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* 3. Phân hệ giảng dạy */}
                <div>
                  <label htmlFor="admin-track-scope" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#0B2545',
                    marginBottom: '6px'
                  }}>
                    <BookOpen size={14} color="#0057B8" /> Phân hệ quản lý giảng dạy
                  </label>
                  <select
                    id="admin-track-scope"
                    value={adminTrackChoice}
                    onChange={e => setAdminTrackChoice(e.target.value as any)}
                    style={{
                      width: '100%',
                      minHeight: '42px',
                      borderRadius: '10px',
                      background: '#F8FAFC',
                      border: '1.5px solid #CBD5E1',
                      color: '#0B2545',
                      fontSize: '13px',
                      fontWeight: 600,
                      padding: '0 12px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">Toàn bộ 10 phân hệ đào tạo</option>
                    {TRACK_LIST.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Remember Me */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label htmlFor="remember-me-staff" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#475569',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      id="remember-me-staff"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#0057B8', cursor: 'pointer' }}
                    />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowLogoutAllConfirm(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <LogOut size={12} /> Đăng xuất mọi thiết bị
                  </button>
                </div>

                {/* 5. Submit Button */}
                <button
                  type="submit"
                  disabled={lockoutSeconds > 0 || loginStatus === 'loading'}
                  className={`auth-btn-submit ${
                    loginStatus === 'loading'
                      ? 'is-loading'
                      : loginStatus === 'success'
                        ? 'is-success'
                        : loginStatus === 'failed'
                          ? 'is-failed'
                          : ''
                  }`}
                >
                  {loginStatus === 'loading' ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Đang xác thực thông tin...</span>
                    </>
                  ) : loginStatus === 'success' ? (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Đăng nhập thành công!</span>
                    </>
                  ) : loginStatus === 'failed' ? (
                    <>
                      <ShieldAlert size={18} />
                      <span>Đăng nhập thất bại</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập Cổng Giảng viên</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Support footer on card */}
            <div style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid #E2E8F0',
              textAlign: 'center',
              fontSize: '12px',
              color: '#64748B'
            }}>
              Gặp sự cố đăng nhập? Liên hệ Giáo vụ: <a href="tel:0332298065" style={{ color: '#0057B8', fontWeight: 600, textDecoration: 'none' }}>0332 298 065</a>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODAL: QUÊN MẬT KHẨU & OTP (Requirement 6) ─── */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onResetPassword={onResetPassword || (() => ({ success: false, message: 'Tính năng chưa sẵn sàng' }))}
        studentAccounts={studentAccounts}
        teacherAccounts={teacherAccounts}
      />

      {/* ─── MODAL: ĐỔI MẬT KHẨU (Requirement 6) ─── */}
      {pendingUserForChangePass && (
        <ChangePasswordModal
          isOpen={isChangePassModalOpen}
          onClose={() => {
            setIsChangePassModalOpen(false);
            setPendingUserForChangePass(null);
          }}
          currentUser={pendingUserForChangePass}
          isFirstTime={true}
          onChangePassword={onChangePassword || ((_o, _n) => ({ success: true, message: 'Đổi mật khẩu thành công' }))}
        />
      )}

      {/* ─── DIALOG: XÁC NHẬN ĐĂNG XUẤT TẤT CẢ THIẾT BỊ (Requirement 6) ─── */}
      {showLogoutAllConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11, 37, 69, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '420px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#B91C1C', marginBottom: '12px' }}>
              <LogOut size={22} />
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>Đăng xuất khỏi mọi thiết bị?</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5, marginBottom: '20px' }}>
              Hành động này sẽ hủy bỏ toàn bộ phiên đăng nhập đang hoạt động trên máy tính, điện thoại và máy tính bảng khác của bạn.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowLogoutAllConfirm(false)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleLogoutAllDevices}
                style={{
                  padding: '9px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Xác nhận đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
