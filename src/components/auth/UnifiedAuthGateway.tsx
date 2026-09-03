import React, { useState } from 'react';
import { CurriculumTrack, StudentAccount, UserProfile, TRACK_LIST } from '../../types/auth';
import {
  User, Shield, ShieldAlert, BookOpen, ArrowRight, Eye, EyeOff,
  GraduationCap, Lock, Award, Sparkles, ArrowLeft
} from 'lucide-react';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { soundFx } from '../../utils/audio';

interface UnifiedAuthGatewayProps {
  initialRole?: 'student' | 'admin';
  studentAccounts?: StudentAccount[];
  onStudentLogin: (studentCode: string, password: string, selectedTrack: CurriculumTrack) => { success: boolean; user?: UserProfile; message?: string };
  onAdminLogin: (pin: string, name: string, selectedTrack?: CurriculumTrack | 'all') => { success: boolean; user?: UserProfile; message?: string };
  onResetPassword?: (identifier: string, newPass: string) => { success: boolean; message?: string };
  onBackToLanding?: () => void;
}

export const UnifiedAuthGateway: React.FC<UnifiedAuthGatewayProps> = ({
  initialRole,
  studentAccounts,
  onStudentLogin,
  onAdminLogin,
  onResetPassword,
  onBackToLanding
}) => {
  const [role, setRole] = useState<'student' | 'admin'>(() => {
    if (initialRole) return initialRole;
    if (typeof window !== 'undefined' && (window.location.pathname.toLowerCase().includes('admin') || window.location.hash.toLowerCase().includes('admin'))) {
      return 'admin';
    }
    return 'student';
  });
  const [selectedTrack, setSelectedTrack] = useState<CurriculumTrack>('office-fast-3in1');
  const [adminTrackChoice, setAdminTrackChoice] = useState<CurriculumTrack | 'all'>('all');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Student Form
  const [studentCode, setStudentCode] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentError, setStudentError] = useState('');

  // Admin Form
  const [adminName, setAdminName] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');

  const handleTrackChange = (trackId: CurriculumTrack) => {
    setSelectedTrack(trackId);
    setStudentError('');
    soundFx.playClick();
  };

  // STRICT VALIDATION: Correct credentials enter, wrong credentials are completely rejected
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');

    const cleanCode = studentCode.trim();
    const cleanPass = studentPassword.trim();

    if (!cleanCode) {
      setStudentError('Vui lòng nhập Mã học viên hoặc Email!');
      soundFx.playIncorrect();
      return;
    }

    if (!cleanPass) {
      setStudentError('Vui lòng nhập Mật khẩu để đăng nhập!');
      soundFx.playIncorrect();
      return;
    }

    const res = onStudentLogin(cleanCode, cleanPass, selectedTrack);
    if (res.success) {
      soundFx.playVictory();
    } else {
      soundFx.playIncorrect();
      setStudentError(res.message || 'Mã học viên hoặc mật khẩu không chính xác. Không thể truy cập!');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    const cleanName = adminName.trim();
    const cleanPin = adminPin.trim();

    if (!cleanName) {
      setAdminError('Vui lòng nhập họ và tên giảng viên!');
      soundFx.playIncorrect();
      return;
    }

    if (!cleanPin) {
      setAdminError('Vui lòng nhập mã PIN quản trị!');
      soundFx.playIncorrect();
      return;
    }

    const res = onAdminLogin(cleanPin, cleanName, adminTrackChoice);
    if (res.success) {
      soundFx.playVictory();
    } else {
      soundFx.playIncorrect();
      setAdminError(res.message || 'Thông tin giảng viên hoặc mã PIN không đúng. Không thể truy cập!');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #EEF4FF 0%, #F8FAFC 50%, #E0F2FE 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '36px 16px',
      fontFamily: 'var(--font-sans)',
      position: 'relative',
      overflowX: 'hidden'
    }}>

      {/* Main Dual-Column Master Card Container */}
      <div style={{
        width: '100%',
        maxWidth: '1020px',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '24px',
        boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.02)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10
      }}>

        {/* LEFT COLUMN: BRAND SHOWCASE & CREDIBILITY */}
        <div style={{
          background: 'linear-gradient(160deg, #1E40AF 0%, #2563EB 50%, #3B82F6 100%)',
          padding: '44px 36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#FFFFFF'
        }}>
          {/* Back button */}
          <div>
            <button
              onClick={() => {
                soundFx.playClick();
                if (onBackToLanding) {
                  onBackToLanding();
                } else {
                  window.location.href = '/';
                }
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#FFFFFF',
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                marginBottom: '36px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
            >
              <ArrowLeft size={14} /> Quay lại Trang chủ
            </button>

            {/* Brand Logo & Title - Pure Transparent, High-Contrast White & Gold (Bật Tông) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
              <img
                src="/LogoPH-mark-light.png"
                alt="PH DIGITAL EDUCATION"
                style={{
                  height: '62px',
                  width: '62px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 14px rgba(0, 0, 0, 0.35))',
                  flexShrink: 0
                }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/LogoPH.png'; }}
              />
              <div>
                <h1 style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  margin: 0,
                  lineHeight: 1.2,
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                }}>
                  PH DIGITAL EDUCATION
                </h1>
                <span style={{
                  display: 'inline-block',
                  marginTop: '4px',
                  fontSize: '11.5px',
                  color: '#FDE047',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  CỔNG KHẢO THÍ & HỌC TẬP LMS
                </span>
              </div>
            </div>

            <p style={{ fontSize: '13.5px', color: '#DBEAFE', lineHeight: 1.65, marginBottom: '34px' }}>
              Cổng xác thực đào tạo an toàn. Vui lòng đăng nhập bằng tài khoản được cấp để tiếp tục.
            </p>

            {/* Feature Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Award size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>
                    Khảo Thí Chuẩn Certiport
                  </div>
                  <div style={{ fontSize: '12px', color: '#DBEAFE', lineHeight: 1.5 }}>
                    Ngân hàng 500+ đề thi thật MOS Excel, Word, PPT và IC3 GS6 bấm giờ tự động.
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>
                    Xác Thực Nghiêm Ngặt
                  </div>
                  <div style={{ fontSize: '12px', color: '#DBEAFE', lineHeight: 1.5 }}>
                    Bảo vệ tài khoản và kết quả thi cử theo tiêu chuẩn an toàn bảo mật LMS.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security footnote */}
          <div style={{
            marginTop: '36px',
            paddingTop: '18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11.5px',
            color: '#BFDBFE'
          }}>
            <Shield size={14} color="#A7F3D0" />
            <span>Hệ thống đào tạo & khảo thí Tin học Quốc tế • PH Digital Education</span>
          </div>
        </div>

        {/* RIGHT COLUMN: REFINED AUTHENTICATION CARD */}
        <div style={{
          background: '#FFFFFF',
          padding: '44px 38px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: 900,
                color: '#0F172A',
                letterSpacing: '-0.02em',
                marginBottom: '6px'
              }}>
                Đăng nhập Cổng LMS
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
                Chọn đúng cổng <strong>Học viên</strong> hoặc <strong>Giảng viên</strong> để đăng nhập
              </p>
            </div>

            {/* CHỌN CỔNG: HỌC VIÊN HOẶC GIẢNG VIÊN */}
            <div style={{
              display: 'flex',
              background: '#F1F5F9',
              borderRadius: '9999px',
              padding: '4px',
              marginBottom: '26px',
              border: '1px solid #E2E8F0'
            }}>
              <button
                type="button"
                onClick={() => { setRole('student'); soundFx.playClick(); setStudentError(''); setAdminError(''); }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: role === 'student' ? '#2563EB' : 'transparent',
                  color: role === 'student' ? '#FFFFFF' : '#475569',
                  fontSize: '13.5px',
                  fontWeight: role === 'student' ? 700 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: role === 'student' ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <GraduationCap size={16} /> Cổng Học viên
              </button>

              <button
                type="button"
                onClick={() => { setRole('admin'); soundFx.playClick(); setStudentError(''); setAdminError(''); }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: role === 'admin' ? '#2563EB' : 'transparent',
                  color: role === 'admin' ? '#FFFFFF' : '#475569',
                  fontSize: '13.5px',
                  fontWeight: role === 'admin' ? 700 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: role === 'admin' ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <Shield size={16} /> Cổng Giảng viên
              </button>
            </div>

            {/* Error Banner */}
            {(studentError || adminError) && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#FEF2F2',
                border: '1.5px solid #FCA5A5',
                color: '#B91C1C',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px'
              }}>
                <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                <span>{studentError || adminError}</span>
              </div>
            )}

            {/* CỔNG 1: FORM ĐĂNG NHẬP HỌC VIÊN */}
            {role === 'student' ? (
              <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Track Selector */}
                <div>
                  <label htmlFor="student-track" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    <BookOpen size={14} color="#2563EB" /> Chương trình đào tạo
                  </label>
                  <select
                    id="student-track"
                    value={selectedTrack}
                    onChange={e => handleTrackChange(e.target.value as CurriculumTrack)}
                    style={{
                      width: '100%',
                      height: '44px',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1.5px solid #CBD5E1',
                      color: '#0F172A',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      padding: '0 12px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {TRACK_LIST.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Student Code or Email */}
                <div>
                  <label htmlFor="student-code" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    <User size={14} color="#2563EB" /> Mã học viên hoặc Email
                  </label>
                  <input
                    id="student-code"
                    name="username"
                    autoComplete="username"
                    type="text"
                    value={studentCode}
                    onChange={e => { setStudentCode(e.target.value); setStudentError(''); }}
                    placeholder="Nhập mã học viên (VD: THGZ01)"
                    style={{
                      width: '100%',
                      height: '44px',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1.5px solid #CBD5E1',
                      color: '#0F172A',
                      fontSize: '13.5px',
                      padding: '0 14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label htmlFor="student-password" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      <Lock size={14} color="#2563EB" /> Mật khẩu
                    </label>
                    <button
                      type="button"
                      onClick={() => { soundFx.playClick(); setIsForgotModalOpen(true); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563EB',
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
                      value={studentPassword}
                      onChange={e => { setStudentPassword(e.target.value); setStudentError(''); }}
                      placeholder="Nhập mật khẩu tài khoản"
                      style={{
                        width: '100%',
                        height: '44px',
                        borderRadius: '12px',
                        background: '#F8FAFC',
                        border: '1.5px solid #CBD5E1',
                        color: '#0F172A',
                        fontSize: '13.5px',
                        padding: '0 42px 0 14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Hiện hoặc ẩn mật khẩu"
                      style={{
                        position: 'absolute',
                        right: '12px',
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

                {/* Remember Me */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#2563EB', cursor: 'pointer' }}
                  />
                  <label htmlFor="remember-me" style={{ fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                    Duy trì đăng nhập trên thiết bị này
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    color: '#FFFFFF',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>Đăng nhập Cổng Học viên</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              /* CỔNG 2: FORM ĐĂNG NHẬP GIẢNG VIÊN / QUẢN TRỊ */
              <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label htmlFor="admin-name" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    <User size={14} color="#2563EB" /> Họ và tên Giảng viên
                  </label>
                  <input
                    id="admin-name"
                    name="admin-name"
                    type="text"
                    value={adminName}
                    onChange={e => { setAdminName(e.target.value); setAdminError(''); }}
                    placeholder="Nhập tên Giảng viên (VD: Thầy Quang Huy)"
                    style={{
                      width: '100%',
                      height: '44px',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1.5px solid #CBD5E1',
                      color: '#0F172A',
                      fontSize: '13.5px',
                      padding: '0 14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="admin-pin" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    <Shield size={14} color="#2563EB" /> Mã PIN Quản trị
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="admin-pin"
                      name="admin-pin"
                      type={showPassword ? 'text' : 'password'}
                      value={adminPin}
                      onChange={e => { setAdminPin(e.target.value); setAdminError(''); }}
                      placeholder="Nhập mã PIN giảng viên"
                      style={{
                        width: '100%',
                        height: '44px',
                        borderRadius: '12px',
                        background: '#F8FAFC',
                        border: '1.5px solid #CBD5E1',
                        color: '#0F172A',
                        fontSize: '13.5px',
                        padding: '0 42px 0 14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Hiện hoặc ẩn mã PIN"
                      style={{
                        position: 'absolute',
                        right: '12px',
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

                <div>
                  <label htmlFor="admin-track-scope" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    <BookOpen size={14} color="#2563EB" /> Phân hệ quản lý giảng dạy
                  </label>
                  <select
                    id="admin-track-scope"
                    value={adminTrackChoice}
                    onChange={e => setAdminTrackChoice(e.target.value as any)}
                    style={{
                      width: '100%',
                      height: '44px',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1.5px solid #CBD5E1',
                      color: '#0F172A',
                      fontSize: '13.5px',
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

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    color: '#FFFFFF',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
                  }}
                >
                  <span>Đăng nhập Cổng Giảng viên</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onResetPassword={onResetPassword || (() => ({ success: false, message: 'Tính năng chưa sẵn sàng' }))}
        studentAccounts={studentAccounts}
      />
    </div>
  );
};
