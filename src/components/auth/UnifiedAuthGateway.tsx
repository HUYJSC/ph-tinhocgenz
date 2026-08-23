import React, { useState } from 'react';
import { CurriculumTrack, StudentAccount, UserProfile } from '../../types/auth';
import {
  User, Shield, ShieldAlert, BookOpen, ArrowRight, Eye, EyeOff
} from 'lucide-react';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { soundFx } from '../../utils/audio';

interface UnifiedAuthGatewayProps {
  studentAccounts?: StudentAccount[];
  onStudentLogin: (studentCode: string, password: string, selectedTrack: CurriculumTrack) => { success: boolean; user?: UserProfile; message?: string };
  onAdminLogin: (pin: string, name: string, selectedTrack?: CurriculumTrack | 'all') => { success: boolean; user?: UserProfile; message?: string };
  onResetPassword?: (identifier: string, newPass: string) => { success: boolean; message?: string };
}

const TRACK_LIST: { id: CurriculumTrack; label: string }[] = [
  { id: 'office-fast-3in1', label: '1. Word, Excel, PowerPoint (3 Buổi 1 môn)' },
  { id: 'cc-cntt-basic',    label: '2. CC CNTT Cơ bản (6 buổi)' },
  { id: 'cc-cntt-advanced', label: '3. CC CNTT Nâng cao (6 buổi)' },
  { id: 'cntt-basic-we',    label: '4. CNTT Cơ bản: Word + Excel (10-12 buổi)' },
  { id: 'cntt-adv-we',      label: '5. CNTT Nâng Cao: Word + Excel (10-12 buổi)' },
  { id: 'ai-office',        label: '6. Ứng dụng AI vào công việc Văn phòng (5 buổi)' },
  { id: 'excel-accounting', label: '7. Excel cho Kế toán' },
  { id: 'word-6b',          label: '8. Kỹ năng soạn thảo Word (6 buổi)' },
  { id: 'excel-6b',         label: '9. Xử lý bảng tính Excel (6 buổi)' },
  { id: 'ppt-6b',           label: '10. Thiết kế thuyết trình PowerPoint (6 buổi)' }
];

export const UnifiedAuthGateway: React.FC<UnifiedAuthGatewayProps> = ({
  onStudentLogin,
  onAdminLogin,
  onResetPassword
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
  };

  const handleQuickFillAdmin = () => {
    soundFx.playClick();
    setAdminName('Thầy Quang Huy');
    setAdminPin('admin123');
    setAdminTrackChoice('all');
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');

    if (!studentCode.trim()) {
      setStudentError('Vui lòng nhập Mã học viên hoặc Email!');
      return;
    }

    const res = onStudentLogin(studentCode.trim(), studentPassword.trim() || '123', selectedTrack);
    if (res.success) {
      soundFx.playVictory();
    } else {
      soundFx.playIncorrect();
      setStudentError(res.message || 'Mã học viên hoặc mật khẩu không chính xác!');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    if (!adminName.trim()) {
      setAdminError('Vui lòng nhập họ tên giảng viên!');
      return;
    }

    const res = onAdminLogin(adminPin.trim(), adminName.trim(), adminTrackChoice);
    if (res.success) {
      soundFx.playVictory();
    } else {
      soundFx.playIncorrect();
      setAdminError(res.message || 'Mã PIN quản trị không chính xác (Mặc định: admin123 hoặc 123)!');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        fontFamily: 'var(--font-sans)',
        position: 'relative'
      }}
    >
      {/* ── CANVAS LMS STANDARD CENTERED LOGIN CONTAINER ── */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.45)',
          padding: '36px 32px 28px',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* ── 1. LOGO TRƯỜNG / HỆ THỐNG Ở ĐẦU CARD (Chuẩn Canvas LMS Header Logo) ── */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}
          >
            <img
              src="/logo.png"
              alt="PH DIGITAL EDUCATION"
              style={{
                maxHeight: '56px',
                maxWidth: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
          <p
            style={{
              fontSize: '13px',
              color: '#64748B',
              margin: '4px 0 0',
              fontWeight: 500
            }}
          >
            Cổng Đăng nhập Hệ thống Học tập & Khảo thí LMS
          </p>
        </div>

        {/* ── 2. ROLE TABS (Học viên / Giảng viên) ── */}
        <div
          style={{
            display: 'flex',
            borderBottom: '2px solid #F1F5F9',
            marginBottom: '22px'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setRole('student');
              setStudentError('');
              soundFx.playClick();
            }}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: 'transparent',
              borderBottom: role === 'student' ? '2px solid #2563EB' : '2px solid transparent',
              marginBottom: '-2px',
              color: role === 'student' ? '#2563EB' : '#64748B',
              fontWeight: role === 'student' ? 700 : 600,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <User size={16} />
            <span>Học viên</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('admin');
              setAdminError('');
              soundFx.playClick();
            }}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: 'transparent',
              borderBottom: role === 'admin' ? '2px solid #2563EB' : '2px solid transparent',
              marginBottom: '-2px',
              color: role === 'admin' ? '#2563EB' : '#64748B',
              fontWeight: role === 'admin' ? 700 : 600,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Shield size={16} />
            <span>Giảng viên</span>
          </button>
        </div>

        {/* ── 3. FORM HỌC VIÊN (Canvas Form Standard) ── */}
        {role === 'student' && (
          <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Phân hệ đào tạo */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px'
                }}
              >
                <BookOpen size={15} color="#2563EB" />
                <span>Chương trình đào tạo</span>
              </label>
              <select
                value={selectedTrack}
                onChange={e => handleTrackChange(e.target.value as CurriculumTrack)}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1.5px solid #CBD5E1',
                  color: '#0F172A',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  padding: '0 12px',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease'
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#2563EB')}
                onBlur={e => (e.currentTarget.style.borderColor = '#CBD5E1')}
              >
                {TRACK_LIST.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Email / Mã học viên */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px'
                }}
              >
                Mã học viên hoặc Email
              </label>
              <input
                type="text"
                required
                placeholder="VD: THGZ01 hoặc nguyenvana@..."
                value={studentCode}
                onChange={e => setStudentCode(e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  color: '#0F172A',
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '0 14px',
                  outline: 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#2563EB';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px'
                }}
              >
                Mật khẩu
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={studentPassword}
                  onChange={e => setStudentPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    color: '#0F172A',
                    fontSize: '14px',
                    fontWeight: 500,
                    padding: '0 40px 0 14px',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = '#2563EB';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Canvas Action Row: Stay signed in + Forgot Password + Submit */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginTop: '4px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    color: '#475569',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                  />
                  <span>Duy trì đăng nhập</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left'
                  }}
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Log In Button (Right side, classic Canvas style) */}
              <button
                type="submit"
                style={{
                  minWidth: '120px',
                  height: '42px',
                  borderRadius: '8px',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2563EB')}
              >
                <span>Đăng nhập</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Error Message */}
            {studentError && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#B91C1C',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '6px'
                }}
              >
                <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                <span>{studentError}</span>
              </div>
            )}
          </form>
        )}

        {/* ── 4. FORM GIẢNG VIÊN ── */}
        {role === 'admin' && (
          <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px'
                }}
              >
                Họ tên giảng viên
              </label>
              <input
                type="text"
                required
                placeholder="VD: Thầy Quang Huy / Thầy Đức Nam"
                value={adminName}
                onChange={e => setAdminName(e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  color: '#0F172A',
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '0 14px',
                  outline: 'none',
                  transition: 'border-color 0.15s ease'
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#2563EB')}
                onBlur={e => (e.currentTarget.style.borderColor = '#CBD5E1')}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px'
                }}
              >
                Mật khẩu quản trị (PIN)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập mật khẩu PIN"
                  value={adminPin}
                  onChange={e => setAdminPin(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    color: '#0F172A',
                    fontSize: '14px',
                    padding: '0 40px 0 14px',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#2563EB')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#CBD5E1')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px'
                }}
              >
                Phân hệ quản lý giảng dạy
              </label>
              <select
                value={adminTrackChoice}
                onChange={e => setAdminTrackChoice(e.target.value as any)}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1.5px solid #CBD5E1',
                  color: '#0F172A',
                  fontSize: '13.5px',
                  fontWeight: 500,
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

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '4px'
              }}
            >
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Quên mật khẩu?
              </button>

              <button
                type="submit"
                style={{
                  minWidth: '120px',
                  height: '42px',
                  borderRadius: '8px',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
                }}
              >
                <span>Đăng nhập</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {adminError && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#B91C1C',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '6px'
                }}
              >
                <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                <span>{adminError}</span>
              </div>
            )}
          </form>
        )}

        {/* ── 5. QUICK DEMO FILL BUTTONS ── */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            fontSize: '12px'
          }}
        >
          <span style={{ color: '#64748B', fontWeight: 500 }}>Tài khoản thử nghiệm:</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={handleQuickFillStudent}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#2563EB',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Học viên (THGZ01)
            </button>
            <button
              type="button"
              onClick={handleQuickFillAdmin}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                color: '#475569',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Giảng viên
            </button>
          </div>
        </div>
      </div>

      {/* ── 6. CANVAS LMS FOOTER LINKS ── */}
      <footer
        style={{
          marginTop: '20px',
          textAlign: 'center',
          color: '#94A3B8',
          fontSize: '12.5px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <a
            href="#"
            onClick={e => { e.preventDefault(); soundFx.playClick(); setIsForgotModalOpen(true); }}
            style={{ color: '#CBD5E1', textDecoration: 'none', transition: 'color 0.15s ease' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={e => (e.currentTarget.style.color = '#CBD5E1')}
          >
            Trợ giúp học vụ
          </a>
          <span>•</span>
          <span style={{ color: '#94A3B8' }}>PH DIGITAL EDUCATION LMS</span>
        </div>
        <div style={{ fontSize: '11.5px', color: '#64748B' }}>
          Hệ thống Quản lý Học tập & Khảo thí Tin học Chuẩn Quốc tế
        </div>
      </footer>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onResetPassword={onResetPassword || (() => ({ success: false, message: 'Tính năng chưa sẵn sàng' }))}
      />
    </div>
  );
};
