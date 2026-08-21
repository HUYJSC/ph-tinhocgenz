import React, { useState } from 'react';
import { CurriculumTrack, StudentAccount, UserProfile } from '../../types/auth';
import {
  User, Shield, KeyRound, ArrowRight, ShieldAlert, BookOpen, Lock
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface UnifiedAuthGatewayProps {
  studentAccounts?: StudentAccount[];
  onStudentLogin: (studentCode: string, password: string, selectedTrack: CurriculumTrack) => { success: boolean; user?: UserProfile; message?: string };
  onAdminLogin: (pin: string, name: string, selectedTrack?: CurriculumTrack | 'all') => { success: boolean; user?: UserProfile; message?: string };
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
  onAdminLogin
}) => {
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [selectedTrack, setSelectedTrack] = useState<CurriculumTrack>('office-fast-3in1');
  const [adminTrackChoice, setAdminTrackChoice] = useState<CurriculumTrack | 'all'>('all');

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
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'radial-gradient(ellipse at 50% 15%, rgba(79, 110, 247, 0.08) 0%, var(--bg-primary) 70%)'
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Balanced & High-Class Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
              marginBottom: '14px',
              transition: 'transform 0.2s ease'
            }}
          >
            <img
              src="/logo.png"
              alt="PH - Tin Học GenZ"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          <h1
            style={{
              fontSize: '1.45rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              margin: '0 0 4px'
            }}
          >
            PH - TIN HỌC GENZ
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
            Hệ Thống Đào Tạo & Khảo Thí Tin Học Chuẩn
          </p>
        </div>

        {/* Main Authentication Card */}
        <div
          className="card"
          style={{
            width: '100%',
            padding: '26px 24px',
            borderRadius: '20px',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.07), 0 0 0 1px var(--border-color)',
            background: 'var(--bg-card)'
          }}
        >
          {/* Segmented Symmetrical Role Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'var(--bg-secondary)',
              padding: '4px',
              borderRadius: '12px',
              marginBottom: '22px',
              border: '1px solid var(--border-color)'
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
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: role === 'student' ? 'var(--bg-card)' : 'transparent',
                color: role === 'student' ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontWeight: role === 'student' ? 800 : 600,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: role === 'student' ? '0 2px 8px rgba(0, 0, 0, 0.06)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <User size={16} />
              <span>Học Viên</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('admin');
                setAdminError('');
                soundFx.playClick();
              }}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: role === 'admin' ? 'var(--bg-card)' : 'transparent',
                color: role === 'admin' ? '#d97706' : 'var(--text-muted)',
                fontWeight: role === 'admin' ? 800 : 600,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: role === 'admin' ? '0 2px 8px rgba(0, 0, 0, 0.06)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Shield size={16} />
              <span>Giảng Viên</span>
            </button>
          </div>

          {/* 1. STUDENT FORM */}
          {role === 'student' && (
            <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Program Track Selector */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <BookOpen size={14} color="var(--accent-primary)" />
                  <span>Chương Trình Đào Tạo</span>
                </label>
                <select
                  value={selectedTrack}
                  onChange={e => handleTrackChange(e.target.value as CurriculumTrack)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.86rem',
                    fontWeight: 600,
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

              {/* Student Code / Name Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Mã Học Viên Hoặc Họ Tên
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    placeholder="VD: THGZ01 hoặc Nguyễn Văn An"
                    value={studentCode}
                    onChange={e => setStudentCode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: '10px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Mật Khẩu
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    placeholder="Mật khẩu tài khoản (Mặc định: 123)"
                    value={studentPassword}
                    onChange={e => setStudentPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: '10px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Error Message */}
              {studentError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#ef4444',
                    fontSize: '0.8rem',
                    lineHeight: 1.4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  className="animate-fade-in"
                >
                  <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                  <span>{studentError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px',
                  borderRadius: '10px'
                }}
              >
                <span>Vào Cổng Học Tập</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* 2. ADMIN / TEACHER FORM */}
          {role === 'admin' && (
            <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Teacher Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Họ Tên Giảng Viên
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    placeholder="VD: Thầy Quang Huy / Thầy Đức Nam"
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: '10px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Password / Admin PIN */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Mật Khẩu Quản Trị
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    placeholder="Nhập mã PIN hoặc mật khẩu quản trị"
                    value={adminPin}
                    onChange={e => setAdminPin(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: '10px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Training Track Choice */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Phân Hệ Quản Lý Giảng Dạy
                </label>
                <select
                  value={adminTrackChoice}
                  onChange={e => setAdminTrackChoice(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">Toàn Bộ 10 Phân Hệ Đào Tạo</option>
                  {TRACK_LIST.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error Alert */}
              {adminError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#ef4444',
                    fontSize: '0.8rem',
                    lineHeight: 1.4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  className="animate-fade-in"
                >
                  <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                  <span>{adminError}</span>
                </div>
              )}

              {/* Admin Submit Button */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(217, 119, 6, 0.25)',
                  cursor: 'pointer'
                }}
              >
                <Shield size={16} />
                <span>Vào Cổng Giảng Dạy & Quản Trị</span>
              </button>
            </form>
          )}
        </div>

        {/* Clean Minimal Footer */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          Hệ thống đào tạo nội bộ © <b>PH-TINHOCGENZ</b>
        </div>
      </div>
    </div>
  );
};
