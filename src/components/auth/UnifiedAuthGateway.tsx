import React, { useState } from 'react';
import { CurriculumTrack, StudentAccount, TRACK_LABELS, UserProfile } from '../../types/auth';
import {
  User, Shield, KeyRound, ArrowRight, CheckCircle2,
  Cpu, FileSpreadsheet, FileText, Presentation, Code2, Network, ShieldAlert
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface UnifiedAuthGatewayProps {
  studentAccounts: StudentAccount[];
  onStudentLogin: (studentCode: string, password: string, selectedTrack: CurriculumTrack) => { success: boolean; user?: UserProfile; message?: string };
  onAdminLogin: (pin: string, name: string, selectedTrack?: CurriculumTrack | 'all') => { success: boolean; user?: UserProfile; message?: string };
}

const TRACK_OPTIONS: { id: CurriculumTrack; title: string; subTitle: string; icon: any; color: string }[] = [
  {
    id: 'cntt-basic',
    title: '1. CNTT & Tin Học Cơ Bản',
    subTitle: 'Máy tính, Windows, Tệp tin, Internet',
    icon: Cpu,
    color: '#10b981'
  },
  {
    id: 'mos-office',
    title: '2. Tin Học Văn Phòng Quốc Tế MOS',
    subTitle: 'MOS Word, MOS Excel, MOS PowerPoint',
    icon: FileSpreadsheet,
    color: '#2563eb'
  },
  {
    id: 'ic3-gs',
    title: '3. Chuẩn Tin Học Quốc Tế IC3 GS6',
    subTitle: 'Computing, Key Apps, Living Online',
    icon: FileText,
    color: '#3b82f6'
  },
  {
    id: 'cntt-advanced',
    title: '4. CNTT Nâng Cao & Xử Lý Dữ Liệu',
    subTitle: 'INDEX-MATCH, Dynamic Arrays, VBA',
    icon: Presentation,
    color: '#ea580c'
  },
  {
    id: 'programming',
    title: '5. Lập Trình Python & Thuật Toán',
    subTitle: 'Cú pháp Python 3, Cấu trúc dữ liệu, Giải thuật',
    icon: Code2,
    color: '#f59e0b'
  },
  {
    id: 'cyber-security',
    title: '6. Mạng Máy Tính & An Toàn Thông Tin',
    subTitle: 'Hệ thống DNS, IP, SSL/HTTPS, Bảo mật số',
    icon: Network,
    color: '#6366f1'
  }
];

export const UnifiedAuthGateway: React.FC<UnifiedAuthGatewayProps> = ({
  studentAccounts,
  onStudentLogin,
  onAdminLogin
}) => {
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [selectedTrack, setSelectedTrack] = useState<CurriculumTrack>('mos-office');
  const [adminTrackChoice, setAdminTrackChoice] = useState<CurriculumTrack | 'all'>('all');

  // Student Inputs
  const [studentCode, setStudentCode] = useState('THGZ02');
  const [studentPassword, setStudentPassword] = useState('123');
  const [studentError, setStudentError] = useState('');

  // Admin Inputs
  const [adminName, setAdminName] = useState('Thầy Huy (Giảng Viên Trưởng)');
  const [adminPin, setAdminPin] = useState('admin123');
  const [adminError, setAdminError] = useState('');

  // Filter starter student accounts matching the chosen track
  const matchingStudents = studentAccounts.filter(s => s.programTrack === selectedTrack || s.enrolledTracks?.includes(selectedTrack));

  const handleSelectTrack = (trackId: CurriculumTrack) => {
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
      setStudentError('Vui lòng nhập Mã Học Viên hoặc Họ Tên!');
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

  const handleSelectQuickStudent = (acc: StudentAccount) => {
    setStudentCode(acc.studentCode);
    setStudentPassword(acc.password || '123');
    setSelectedTrack(acc.programTrack);
    setStudentError('');
    const res = onStudentLogin(acc.studentCode, acc.password || '123', acc.programTrack);
    if (res.success) {
      soundFx.playVictory();
    } else {
      soundFx.playIncorrect();
      setStudentError(res.message || 'Mã học viên không chính xác!');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 15%, rgba(37, 99, 235, 0.09) 0%, var(--bg-primary) 70%)',
        padding: '30px 16px 60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      className="animate-fade-in"
    >
      <div style={{ maxWidth: '780px', width: '100%' }}>
        {/* Branding Top */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.12)',
              marginBottom: '10px'
            }}
          >
            <img src="/logo.png" alt="PH Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 900, letterSpacing: '-0.02em', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '2px 0' }}>
            PH- TINHOCGENZ • CỔNG XÁC THỰC ĐÀO TẠO
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Chọn vai trò, chọn phân hệ chuyên môn và đăng nhập để vào đúng lớp học của bạn
          </p>
        </div>

        {/* Main Card */}
        <div
          className="card"
          style={{
            padding: '28px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            border: '1.5px solid var(--border-color)',
            background: 'var(--bg-card)'
          }}
        >
          {/* 1. ROLE SELECTOR TABS */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-primary)',
              padding: '5px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '24px',
              border: '1px solid var(--border-color)'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setRole('student');
                soundFx.playClick();
              }}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: role === 'student' ? 'var(--bg-card)' : 'transparent',
                color: role === 'student' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: role === 'student' ? 800 : 600,
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: role === 'student' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.18s ease'
              }}
            >
              <User size={18} />
              <span>1. Tôi Là Học Viên (Học & Thi)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('admin');
                soundFx.playClick();
              }}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: role === 'admin' ? 'var(--bg-card)' : 'transparent',
                color: role === 'admin' ? '#d97706' : 'var(--text-secondary)',
                fontWeight: role === 'admin' ? 800 : 600,
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: role === 'admin' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.18s ease'
              }}
            >
              <Shield size={18} />
              <span>2. Tôi Là Giảng Viên / Quản Trị</span>
            </button>
          </div>

          {/* 2. STUDENT LOGIN FORM */}
          {role === 'student' && (
            <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Select Curriculum Track */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  A. CHỌN CHƯƠNG TRÌNH / PHÂN HỆ ĐANG THEO HỌC:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                  {TRACK_OPTIONS.map(track => {
                    const Icon = track.icon;
                    const isSelected = selectedTrack === track.id;
                    return (
                      <div
                        key={track.id}
                        onClick={() => handleSelectTrack(track.id)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          background: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-primary)',
                          border: isSelected ? `2px solid ${track.color}` : '1px solid var(--border-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: isSelected ? track.color : 'var(--border-color)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <Icon size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isSelected ? track.color : 'var(--text-primary)' }}>
                            {track.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {track.subTitle}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Textbox Credentials */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
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
                      style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Mật Khẩu Học Viên (Mặc định: 123)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      placeholder="Mặc định: 123"
                      value={studentPassword}
                      onChange={e => setStudentPassword(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {studentError && (
                <div
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1.5px solid rgba(239, 68, 68, 0.35)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}
                  className="animate-fade-in"
                >
                  <ShieldAlert size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 800, color: '#ef4444', marginBottom: '4px', fontSize: '0.9rem' }}>
                      Thông Báo Xác Thực & Phân Quyền
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {studentError}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '13px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <span>Xác Thực & Vào Học {TRACK_LABELS[selectedTrack]}</span>
                <ArrowRight size={18} />
              </button>

              {/* Quick 1-Click Sample Student Picker */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  💡 Hoặc nhấp chọn nhanh tài khoản học viên mẫu của môn này:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {matchingStudents.map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleSelectQuickStudent(acc)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckCircle2 size={13} color="var(--accent-primary)" />
                      <span><b>{acc.name}</b> ({acc.studentCode})</span>
                    </button>
                  ))}
                  {matchingStudents.length === 0 && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      (Chưa có học sinh mẫu, hệ thống sẽ tự cấp tài khoản mới khi bấm đăng nhập)
                    </span>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* 3. ADMIN / TEACHER LOGIN FORM */}
          {role === 'admin' && (
            <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(217, 119, 6, 0.08)', border: '1px solid rgba(217, 119, 6, 0.25)', fontSize: '0.84rem', color: '#b45309', lineHeight: 1.5 }}>
                🔒 <b>Cổng Quản Trị Dành Cho Giảng Viên</b>: Quản lý toàn bộ 6 phân hệ, cấp tài khoản học sinh, giao đề thi và chấm điểm.
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Phân Hệ Giảng Dạy & Quản Trị:
                </label>
                <select
                  value={adminTrackChoice}
                  onChange={e => setAdminTrackChoice(e.target.value as any)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="all">🌟 Toàn Bộ 6 Phân Hệ Đào Tạo CNTT (Quyền Tổng Quản)</option>
                  <option value="cntt-basic">1. CNTT & Tin Học Cơ Bản</option>
                  <option value="mos-office">2. Tin Học Văn Phòng MOS</option>
                  <option value="ic3-gs">3. Chuẩn Quốc Tế IC3 GS6</option>
                  <option value="cntt-advanced">4. CNTT Nâng Cao & Xử Lý Dữ Liệu</option>
                  <option value="programming">5. Lập Trình Python & Thuật Toán</option>
                  <option value="cyber-security">6. Mạng Máy Tính & Bảo Mật IT</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Họ Tên Giảng Viên
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Mã PIN / Mật Khẩu Quản Trị *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      required
                      placeholder="Mặc định: admin123 hoặc 123"
                      value={adminPin}
                      onChange={e => setAdminPin(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {adminError && (
                <div
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1.5px solid rgba(239, 68, 68, 0.35)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}
                  className="animate-fade-in"
                >
                  <ShieldAlert size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 800, color: '#ef4444', marginBottom: '4px', fontSize: '0.9rem' }}>
                      Xác Thực Quản Trị Không Thành Công
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {adminError}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '13px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)'
                }}
              >
                <Shield size={18} />
                <span>Xác Thực Vào Cổng Quản Trị Giảng Viên</span>
              </button>
            </form>
          )}
        </div>

        {/* Security Footer Notice */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          🔒 Hệ thống bảo mật PH DIGITAL EDUCATION • Học viên chỉ được truy cập đúng môn học được cấp quyền.
        </div>
      </div>
    </div>
  );
};
