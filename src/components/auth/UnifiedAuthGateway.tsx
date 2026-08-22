import React, { useState } from 'react';
import { CurriculumTrack, StudentAccount, UserProfile } from '../../types/auth';
import {
  User, Shield, KeyRound, ShieldAlert, BookOpen, Lock, ArrowRight, Eye, EyeOff
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

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');

    if (!studentCode.trim()) {
      setStudentError('Vui lòng nhập Mã học viên hoặc Họ tên!');
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
        background: 'linear-gradient(180deg, #F8FAFD 0%, #F2F5FA 100%)',
        fontFamily: "'Be Vietnam Pro', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* ── 1. LOGO TRỰC TIẾP (KHÔNG BACKGROUND TRẮNG, KHÔNG CARD, KHÔNG BORDER) ── */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <img
            src="/logo.png"
            alt="PH - Tin Học GenZ"
            style={{
              height: '96px',
              maxWidth: '180px',
              objectFit: 'contain',
              display: 'block'
            }}
          />
        </div>

        {/* ── 2. PHẦN THƯƠNG HIỆU & TIÊU ĐỀ ── */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#0F172A',
              margin: '0 0 6px',
              lineHeight: 1.25
            }}
          >
            PH - TIN HỌC GENZ
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#64748B',
              margin: 0,
              fontWeight: 400,
              lineHeight: 1.4
            }}
          >
            Hệ thống Đào tạo & Khảo thí Tin học
          </p>
        </div>

        {/* ── 3. CARD LOGIN (MODERN UNIVERSITY PORTAL) ── */}
        <div
          style={{
            width: '100%',
            background: '#FFFFFF',
            border: '1px solid #E5EAF2',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
            padding: '28px 32px'
          }}
        >
          {/* ── 4. ROLE TABS (HỌC VIÊN / GIẢNG VIÊN - THANH LỊCH VỚI UNDERLINE) ── */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #E2E8F0',
              marginBottom: '24px'
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
                padding: '10px 0 12px',
                border: 'none',
                background: 'transparent',
                borderBottom: role === 'student' ? '2px solid #315BE8' : '2px solid transparent',
                color: role === 'student' ? '#315BE8' : '#64748B',
                fontWeight: role === 'student' ? 600 : 500,
                fontSize: '14.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <User size={17} color={role === 'student' ? '#315BE8' : '#8492A6'} />
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
                padding: '10px 0 12px',
                border: 'none',
                background: 'transparent',
                borderBottom: role === 'admin' ? '2px solid #315BE8' : '2px solid transparent',
                color: role === 'admin' ? '#315BE8' : '#64748B',
                fontWeight: role === 'admin' ? 600 : 500,
                fontSize: '14.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Shield size={17} color={role === 'admin' ? '#315BE8' : '#8492A6'} />
              <span>Giảng viên</span>
            </button>
          </div>

          {/* ── 5. FORM HỌC VIÊN ── */}
          {role === 'student' && (
            <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Chương trình đào tạo */}
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '8px'
                  }}
                >
                  <BookOpen size={17} color="#8492A6" />
                  <span>Chương trình đào tạo</span>
                </label>
                <select
                  value={selectedTrack}
                  onChange={e => handleTrackChange(e.target.value as CurriculumTrack)}
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '7px',
                    background: '#FFFFFF',
                    border: '1px solid #D8DEE9',
                    color: '#0F172A',
                    fontSize: '14px',
                    fontWeight: 500,
                    padding: '0 14px',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = '#3563E9';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(53, 99, 233, 0.08)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '#D8DEE9';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {TRACK_LIST.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mã học viên hoặc họ tên */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '8px'
                  }}
                >
                  Mã học viên hoặc họ tên
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={18}
                    color="#8492A6"
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none'
                    }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="VD: THGZ01 hoặc Nguyễn Văn An"
                    value={studentCode}
                    onChange={e => setStudentCode(e.target.value)}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '7px',
                      background: '#FFFFFF',
                      border: '1px solid #D8DEE9',
                      color: '#0F172A',
                      fontSize: '14px',
                      fontWeight: 500,
                      padding: '0 14px 0 42px',
                      outline: 'none',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#3563E9';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(53, 99, 233, 0.08)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = '#D8DEE9';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Mật khẩu & Quên mật khẩu */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}
                >
                  <label
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#334155'
                    }}
                  >
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#315BE8',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <KeyRound
                    size={18}
                    color="#8492A6"
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none'
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={studentPassword}
                    onChange={e => setStudentPassword(e.target.value)}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '7px',
                      background: '#FFFFFF',
                      border: '1px solid #D8DEE9',
                      color: '#0F172A',
                      fontSize: '14px',
                      fontWeight: 500,
                      padding: '0 40px 0 42px',
                      outline: 'none',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#3563E9';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(53, 99, 233, 0.08)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = '#D8DEE9';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#8492A6',
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
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px', fontWeight: 400 }}>
                  Mật khẩu mặc định dành cho tài khoản mới: <span style={{ fontWeight: 600, color: '#334155' }}>123</span>
                </div>
              </div>

              {/* Thông báo lỗi */}
              {studentError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '7px',
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    color: '#B91C1C',
                    fontSize: '13px',
                    lineHeight: 1.4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                  <span>{studentError}</span>
                </div>
              )}

              {/* Nút Submit Đăng nhập */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '7px',
                  background: '#315BE8',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px',
                  boxShadow: '0 1px 3px rgba(49, 91, 232, 0.2)',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#274CCB')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#315BE8')}
              >
                <span>Đăng nhập</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* ── 6. FORM GIẢNG VIÊN ── */}
          {role === 'admin' && (
            <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Họ tên giảng viên */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '8px'
                  }}
                >
                  Họ tên giảng viên
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={18}
                    color="#8492A6"
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none'
                    }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="VD: Thầy Quang Huy / Thầy Đức Nam"
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '7px',
                      background: '#FFFFFF',
                      border: '1px solid #D8DEE9',
                      color: '#0F172A',
                      fontSize: '14px',
                      fontWeight: 500,
                      padding: '0 14px 0 42px',
                      outline: 'none',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#3563E9';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(53, 99, 233, 0.08)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = '#D8DEE9';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Mật khẩu giảng viên & Quên mật khẩu */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}
                >
                  <label
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#334155'
                    }}
                  >
                    Mật khẩu giảng viên
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#315BE8',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={18}
                    color="#8492A6"
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none'
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Nhập mật khẩu"
                    value={adminPin}
                    onChange={e => setAdminPin(e.target.value)}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '7px',
                      background: '#FFFFFF',
                      border: '1px solid #D8DEE9',
                      color: '#0F172A',
                      fontSize: '14px',
                      padding: '0 40px 0 42px',
                      outline: 'none',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#3563E9';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(53, 99, 233, 0.08)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = '#D8DEE9';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#8492A6',
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
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px', fontWeight: 400 }}>
                  Mật khẩu mặc định giảng viên: <span style={{ fontWeight: 600, color: '#334155' }}>123</span> (hoặc admin123)
                </div>
              </div>

              {/* Phân hệ quản lý giảng dạy */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '8px'
                  }}
                >
                  Phân hệ quản lý giảng dạy
                </label>
                <select
                  value={adminTrackChoice}
                  onChange={e => setAdminTrackChoice(e.target.value as any)}
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '7px',
                    background: '#FFFFFF',
                    border: '1px solid #D8DEE9',
                    color: '#0F172A',
                    fontSize: '14px',
                    fontWeight: 500,
                    padding: '0 14px',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = '#3563E9';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(53, 99, 233, 0.08)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '#D8DEE9';
                    e.currentTarget.style.boxShadow = 'none';
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

              {/* Lỗi đăng nhập */}
              {adminError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '7px',
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    color: '#B91C1C',
                    fontSize: '13px',
                    lineHeight: 1.4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                  <span>{adminError}</span>
                </div>
              )}

              {/* Nút Submit Giảng viên */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '7px',
                  background: '#315BE8',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px',
                  boxShadow: '0 1px 3px rgba(49, 91, 232, 0.2)',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#274CCB')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#315BE8')}
              >
                <span>Đăng nhập</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>

        {/* ── 7. FOOTER TỐI GIẢN CHÍNH QUY ── */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 500 }}>
            © 2026 PH Tin Học GenZ
          </div>
          <div style={{ fontSize: '12px', color: '#98A2B3', marginTop: '2px' }}>
            Hệ thống đào tạo trực tuyến
          </div>
        </div>
      </div>

      {/* Modal Quên mật khẩu */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onResetPassword={onResetPassword || (() => ({ success: false, message: 'Tính năng chưa sẵn sàng' }))}
      />
    </div>
  );
};
