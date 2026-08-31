import React, { useState } from 'react';
import { CurriculumTrack, StudentAccount, UserProfile, TRACK_LIST } from '../../types/auth';
import {
  User, Shield, ShieldAlert, BookOpen, ArrowRight, Eye, EyeOff,
  GraduationCap, Lock, Award, Sparkles, ArrowLeft
} from 'lucide-react';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { soundFx } from '../../utils/audio';

interface UnifiedAuthGatewayProps {
  studentAccounts?: StudentAccount[];
  onStudentLogin: (studentCode: string, password: string, selectedTrack: CurriculumTrack) => { success: boolean; user?: UserProfile; message?: string };
  onAdminLogin: (pin: string, name: string, selectedTrack?: CurriculumTrack | 'all') => { success: boolean; user?: UserProfile; message?: string };
  onResetPassword?: (identifier: string, newPass: string) => { success: boolean; message?: string };
  onBackToLanding?: () => void;
}

export const UnifiedAuthGateway: React.FC<UnifiedAuthGatewayProps> = ({
  onStudentLogin,
  onAdminLogin,
  onResetPassword,
  onBackToLanding
}) => {
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [selectedTrack, setSelectedTrack] = useState<CurriculumTrack>('office-fast-3in1');
  const [adminTrackChoice, setAdminTrackChoice] = useState<CurriculumTrack | 'all'>('all');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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

  const handleQuickFillStudent = () => {
    soundFx.playClick();
    setStudentCode('THGZ01');
    setStudentPassword('123');
    setSelectedTrack('office-fast-3in1');
    setStudentError('');
  };

  const handleQuickFillAdmin = () => {
    soundFx.playClick();
    setAdminName('Thầy Quang Huy');
    setAdminPin('admin123');
    setAdminTrackChoice('all');
    setAdminError('');
  };

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
      setStudentError('Vui lòng nhập mật khẩu tài khoản!');
      soundFx.playIncorrect();
      return;
    }

    const res = onStudentLogin(cleanCode, cleanPass, selectedTrack);
    if (res.success) {
      soundFx.playVictory();
    } else {
      soundFx.playIncorrect();
      setStudentError(res.message || 'Mã học viên hoặc mật khẩu không chính xác! (Thử THGZ01 / 123)');
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
      setAdminError(res.message || 'Mã PIN quản trị không chính xác! (Thử: admin123 hoặc 123)');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(37, 99, 235, 0.22), transparent 70%), #070B14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 16px',
      fontFamily: 'var(--font-sans)',
      position: 'relative',
      overflowX: 'hidden'
    }}>

      {/* Background tech grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.05,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none'
      }} />

      {/* Main Dual-Column Master Card Container */}
      <div style={{
        width: '100%',
        maxWidth: '1060px',
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '28px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(37, 99, 235, 0.12)',
        backdropFilter: 'blur(20px)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10
      }}>

        {/* LEFT COLUMN: BRAND SHOWCASE & CREDIBILITY */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 60%, rgba(15, 43, 72, 0.95) 100%)',
          padding: '40px 36px',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
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
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#CBD5E1',
                padding: '8px 14px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                marginBottom: '32px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = '#CBD5E1';
              }}
            >
              <ArrowLeft size={14} /> Quay lại Trang chủ
            </button>

            {/* Brand Logo & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <img
                src="/LogoPH.png"
                alt="PH DIGITAL EDUCATION"
                style={{
                  height: '48px',
                  width: 'auto',
                  objectFit: 'contain',
                  background: '#FFFFFF',
                  padding: '6px 10px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.png'; }}
              />
              <div>
                <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>
                  PH DIGITAL EDUCATION
                </h1>
                <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 700, letterSpacing: '0.04em' }}>
                  CỔNG KHẢO THÍ & HỌC TẬP LMS
                </span>
              </div>
            </div>

            <p style={{ fontSize: '13.5px', color: '#94A3B8', lineHeight: 1.65, marginBottom: '32px' }}>
              Hệ thống quản lý học tập thông minh, luyện thi sát format đề thi Certiport 2026 và theo dõi lộ trình tiến bộ của học viên.
            </p>

            {/* Feature Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
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
                  background: 'rgba(37, 99, 235, 0.2)',
                  color: '#60A5FA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Award size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>
                    Khảo Thí Chuẩn Certiport
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>
                    Ngân hàng 500+ đề thi thật MOS Excel, Word, PPT và IC3 GS6 bấm giờ tự động.
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
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
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>
                    AI Chẩn Đoán Lỗ Hổng Năng Lực
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>
                    Phân tích điểm yếu từng hàm và kiến nghị lộ trình khắc phục với Smart Review.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security footnote */}
          <div style={{
            marginTop: '32px',
            paddingTop: '18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11.5px',
            color: '#64748B'
          }}>
            <Shield size={14} color="#10B981" />
            <span>Mã hóa SSL 256-bit • Đăng nhập an toàn SSO • LMS 2026</span>
          </div>
        </div>

        {/* RIGHT COLUMN: REFINED AUTHENTICATION CARD */}
        <div style={{
          background: '#FFFFFF',
          padding: '40px 36px 32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.02em',
                marginBottom: '6px'
              }}>
                Đăng nhập Cổng LMS
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                Chọn vai trò và nhập thông tin để truy cập bài học và phòng thi
              </p>
            </div>

            {/* Role Switcher (Pill Style) */}
            <div style={{
              display: 'flex',
              background: '#F1F5F9',
              borderRadius: '9999px',
              padding: '4px',
              marginBottom: '24px',
              border: '1px solid #E2E8F0'
            }}>
              <button
                type="button"
                onClick={() => { setRole('student'); soundFx.playClick(); setStudentError(''); }}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: role === 'student' ? '#FFFFFF' : 'transparent',
                  color: role === 'student' ? '#2563EB' : '#64748B',
                  fontSize: '13px',
                  fontWeight: role === 'student' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: role === 'student' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <GraduationCap size={16} /> Học viên
              </button>

              <button
                type="button"
                onClick={() => { setRole('admin'); soundFx.playClick(); setAdminError(''); }}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: role === 'admin' ? '#FFFFFF' : 'transparent',
                  color: role === 'admin' ? '#2563EB' : '#64748B',
                  fontSize: '13px',
                  fontWeight: role === 'admin' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: role === 'admin' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <Shield size={16} /> Giảng viên / Quản trị
              </button>
            </div>

            {/* Error Banner */}
            {(studentError || adminError) && (
              <div style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#B91C1C',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '18px'
              }}>
                <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                <span>{studentError || adminError}</span>
              </div>
            )}

            {/* STUDENT FORM */}
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
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
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
                  <div style={{ position: 'relative' }}>
                    <input
                      id="student-code"
                      name="username"
                      autoComplete="username"
                      type="text"
                      value={studentCode}
                      onChange={e => { setStudentCode(e.target.value); setStudentError(''); }}
                      placeholder="VD: THGZ01 hoặc học viên@gmail.com"
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
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
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
                        transition: 'border-color 0.2s',
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

                {/* Remember Me checkbox */}
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
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <span>Đăng nhập học tập</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              /* TEACHER / ADMIN FORM */
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
                    placeholder="VD: Thầy Quang Huy hoặc Cô Minh Châu"
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
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
                  }}
                >
                  <span>Đăng nhập Giảng viên</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>

          {/* QUICK DEMO FILL BUTTONS TOOLBAR */}
          <div style={{
            marginTop: '26px',
            paddingTop: '18px',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
              ⚡ Trải nghiệm nhanh tài khoản mẫu:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleQuickFillStudent}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: '8px',
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#1D4ED8',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <GraduationCap size={13} /> Học viên (THGZ01)
              </button>

              <button
                type="button"
                onClick={handleQuickFillAdmin}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Shield size={13} /> Giảng viên
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onResetPassword={onResetPassword || (() => ({ success: false, message: 'Tính năng chưa sẵn sàng' }))}
      />
    </div>
  );
};
