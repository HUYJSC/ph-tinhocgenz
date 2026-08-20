import React, { useState } from 'react';
import { CurriculumTrack, StudentAccount, UserProfile } from '../../types/auth';
import {
  User, Shield, KeyRound, ArrowRight, ShieldAlert, Sparkles, BookOpen
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface UnifiedAuthGatewayProps {
  studentAccounts: StudentAccount[];
  onStudentLogin: (studentCode: string, password: string, selectedTrack: CurriculumTrack) => { success: boolean; user?: UserProfile; message?: string };
  onAdminLogin: (pin: string, name: string, selectedTrack?: CurriculumTrack | 'all') => { success: boolean; user?: UserProfile; message?: string };
}

const TRACK_LIST: { id: CurriculumTrack; label: string; icon: string }[] = [
  { id: 'office-fast-3in1', label: '1. Word, Excel, PowerPoint (3Buổi 1 môn)', icon: '⚡' },
  { id: 'cc-cntt-basic', label: '2. CC CNTT Cơ bản (6 buổi)', icon: '💻' },
  { id: 'cc-cntt-advanced', label: '3. CC CNTT Nâng cao (6 buổi)', icon: '⚙️' },
  { id: 'cntt-basic-we', label: '4. CNTT Cơ bản: Word + Excel (10-12b)', icon: '📄' },
  { id: 'cntt-adv-we', label: '5. CNTT Nâng Cao: Word + Excel (10-12b)', icon: '📊' },
  { id: 'ai-office', label: '6. Ứng dụng AI vào công việc Văn phòng (5b)', icon: '🤖' },
  { id: 'excel-accounting', label: '7. Excel cho Kế toán (Custom tuỳ nhu cầu)', icon: '📈' },
  { id: 'word-6b', label: '8. Word (6 buổi)', icon: '📝' },
  { id: 'excel-6b', label: '9. Excel (6 buổi)', icon: '📊' },
  { id: 'ppt-6b', label: '10. PPT (6 buổi)', icon: '📽️' }
];

export const UnifiedAuthGateway: React.FC<UnifiedAuthGatewayProps> = ({
  studentAccounts,
  onStudentLogin,
  onAdminLogin
}) => {
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [selectedTrack, setSelectedTrack] = useState<CurriculumTrack>('office-fast-3in1');
  const [adminTrackChoice, setAdminTrackChoice] = useState<CurriculumTrack | 'all'>('all');

  // Student Form
  const [studentCode, setStudentCode] = useState('THGZ01');
  const [studentPassword, setStudentPassword] = useState('123');
  const [studentError, setStudentError] = useState('');

  // Admin Form
  const [adminName, setAdminName] = useState('Thầy Huy (Giảng Viên Trưởng)');
  const [adminPin, setAdminPin] = useState('admin123');
  const [adminError, setAdminError] = useState('');

  // Filter sample student matching the selected track
  const sampleStudent = studentAccounts.find(
    s => s.programTrack === selectedTrack || s.enrolledTracks?.includes(selectedTrack)
  );

  const handleTrackChange = (trackId: CurriculumTrack) => {
    setSelectedTrack(trackId);
    setStudentError('');
    const match = studentAccounts.find(s => s.programTrack === trackId || s.enrolledTracks?.includes(trackId));
    if (match) {
      setStudentCode(match.studentCode);
      setStudentPassword(match.password || '123');
    }
    soundFx.playClick();
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');

    if (!studentCode.trim()) {
      setStudentError('Vui lòng nhập Mã học viên hoặc Họ tên!');
      return;
    }

    const res = onStudentLogin(studentCode, studentPassword, selectedTrack);
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

    const res = onAdminLogin(adminPin, adminName, adminTrackChoice);
    if (res.success) {
      soundFx.playVictory();
    } else {
      soundFx.playIncorrect();
      setAdminError(res.message || 'Mã PIN quản trị không chính xác (mặc định: admin123 hoặc 123)!');
    }
  };

  const handleQuickFill = (acc: StudentAccount) => {
    setStudentCode(acc.studentCode);
    setStudentPassword(acc.password || '123');
    setStudentError('');
    soundFx.playClick();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'radial-gradient(circle at 50% 20%, rgba(37, 99, 235, 0.08) 0%, var(--bg-primary) 75%)'
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Compact Logo & Brand */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
              marginBottom: '8px'
            }}
          >
            <img src="/logo.png" alt="PH Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1
            style={{
              fontSize: '1.35rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 2px'
            }}
          >
            PH - TINHOCGENZ
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
            Cổng Đăng Nhập Học & Khảo Thí Trực Tuyến
          </p>
        </div>

        {/* Main Clean Card */}
        <div
          className="card"
          style={{
            width: '100%',
            padding: '22px 20px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)'
          }}
        >
          {/* Segmented Role Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'var(--bg-primary)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '18px',
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
                padding: '9px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: role === 'student' ? 'var(--bg-card)' : 'transparent',
                color: role === 'student' ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontWeight: role === 'student' ? 800 : 600,
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: role === 'student' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease'
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
                padding: '9px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: role === 'admin' ? 'var(--bg-card)' : 'transparent',
                color: role === 'admin' ? '#d97706' : 'var(--text-muted)',
                fontWeight: role === 'admin' ? 800 : 600,
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: role === 'admin' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Shield size={16} />
              <span>Giảng Viên</span>
            </button>
          </div>

          {/* 1. STUDENT FORM */}
          {role === 'student' && (
            <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Track Selector Dropdown */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  <BookOpen size={14} color="var(--accent-primary)" />
                  <span>Chương Trình Đang Học *</span>
                </label>
                <select
                  value={selectedTrack}
                  onChange={e => handleTrackChange(e.target.value as CurriculumTrack)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-primary)',
                    border: '1.5px solid var(--accent-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {TRACK_LIST.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Code / Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Mã Học Viên Hoặc Họ Tên *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: THGZ02 hoặc Trần Thị Mai"
                    value={studentCode}
                    onChange={e => setStudentCode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Mật Khẩu (Mặc định: 123)
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    placeholder="123"
                    value={studentPassword}
                    onChange={e => setStudentPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Concise Error Alert */}
              {studentError && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                  className="animate-fade-in"
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <ShieldAlert size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ color: 'var(--text-secondary)' }}>
                      <b style={{ color: '#ef4444' }}>Chưa khớp môn học: </b>
                      {studentError}
                    </div>
                  </div>

                  {(() => {
                    const match = studentAccounts.find(
                      s => s.studentCode.toUpperCase() === studentCode.trim().toUpperCase() || s.name.toLowerCase() === studentCode.trim().toLowerCase()
                    );
                    if (match?.programTrack && match.programTrack !== selectedTrack) {
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTrack(match.programTrack!);
                            setStudentError('');
                            soundFx.playClick();
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(37, 99, 235, 0.12)',
                            border: '1px solid var(--accent-primary)',
                            color: 'var(--accent-primary)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            marginTop: '2px'
                          }}
                        >
                          <span>👉 Bấm vào đây để chọn đúng môn của bạn</span>
                        </button>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '11px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <span>Vào Lớp Học Ngay</span>
                <ArrowRight size={16} />
              </button>

              {/* Quick Sample Student Link */}
              {sampleStudent && (
                <div style={{ textAlign: 'center', marginTop: '2px' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickFill(sampleStudent)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Sparkles size={12} />
                    <span>Mẫu môn này: <b>{sampleStudent.name} ({sampleStudent.studentCode})</b></span>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* 2. ADMIN / TEACHER FORM */}
          {role === 'admin' && (
            <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Họ Tên Giảng Viên
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Mật Khẩu Quản Trị (Mặc định: admin123)
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    placeholder="admin123"
                    value={adminPin}
                    onChange={e => setAdminPin(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Phân Hệ Quản Lý Giảng Dạy
                </label>
                <select
                  value={adminTrackChoice}
                  onChange={e => setAdminTrackChoice(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">🌟 Toàn Bộ 6 Phân Hệ Đào Tạo</option>
                  {TRACK_LIST.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {adminError && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    lineHeight: 1.5,
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start'
                  }}
                  className="animate-fade-in"
                >
                  <ShieldAlert size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ color: 'var(--text-secondary)' }}>
                    <b style={{ color: '#ef4444' }}>Thông báo: </b>
                    {adminError}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '11px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px',
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  boxShadow: '0 4px 14px rgba(217, 119, 6, 0.25)'
                }}
              >
                <Shield size={16} />
                <span>Vào Cổng Giảng Dạy & Quản Trị</span>
              </button>

              {/* Quick Staff Shortcuts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setAdminName('Thầy Huy (Giảng Viên Trưởng)');
                    setAdminPin('admin123');
                    setAdminTrackChoice('all');
                    setAdminError('');
                    soundFx.playClick();
                  }}
                  style={{
                    background: 'rgba(217, 119, 6, 0.08)',
                    border: '1px dashed rgba(217, 119, 6, 0.3)',
                    color: '#d97706',
                    padding: '5px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>👑 Admin: Thầy Huy</span>
                  <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>Toàn quyền</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAdminName('Cô Hoàng Mai');
                    setAdminPin('123');
                    setAdminTrackChoice('office-fast-3in1');
                    setAdminError('');
                    soundFx.playClick();
                  }}
                  style={{
                    background: 'rgba(37, 99, 235, 0.06)',
                    border: '1px dashed rgba(37, 99, 235, 0.25)',
                    color: 'var(--accent-primary)',
                    padding: '5px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>👩‍🏫 Giảng Viên: Cô Hoàng Mai (GV01)</span>
                  <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>Quyền theo môn</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Support Note */}
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Hỗ trợ kỹ thuật đào tạo: <b>Ban Giảng Huấn PH-TINHOCGENZ</b>
        </div>
      </div>
    </div>
  );
};
