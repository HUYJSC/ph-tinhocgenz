import React, { useState, useEffect } from 'react';
import { AttendanceSession, AttendanceStatus } from '../../types/attendance';
import { UserProfile, CurriculumTrack, TRACK_LABELS, StudentAccount } from '../../types/auth';
import {
  QrCode, CheckCircle2, Clock, RefreshCw,
  FileSpreadsheet, Trash2, Save, Users, Calendar, Sparkles,
  ShieldCheck, CheckCheck, Lock, Unlock
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface AttendanceManagerProps {
  sessions: AttendanceSession[];
  studentAccounts?: StudentAccount[];
  currentUser: UserProfile;
  onCreateSession: (track: CurriculumTrack, className: string, teacherId: string, teacherName: string) => AttendanceSession;
  onRotateQR: (sessionId: string, intervalSeconds?: number) => { token: string; pinCode: string; expiresAt: number };
  onToggleSessionOpen: (sessionId: string) => void;
  onUpdateStatus: (sessionId: string, studentId: string, status: AttendanceStatus, note?: string, method?: 'manual' | 'qr_scan' | 'pin_code') => void;
  onMarkAllPresent: (sessionId: string) => void;
  onSaveSession: (session: AttendanceSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

const ALL_TRACKS: { id: CurriculumTrack; label: string }[] = [
  { id: 'office-fast-3in1', label: '1. Word, Excel, PowerPoint (3Buổi 1 môn)' },
  { id: 'cc-cntt-basic', label: '2. CC CNTT Cơ bản (6 buổi)' },
  { id: 'cc-cntt-advanced', label: '3. CC CNTT Nâng cao (6 buổi)' },
  { id: 'cntt-basic-we', label: '4. CNTT Cơ bản: Word + Excel (10-12b)' },
  { id: 'cntt-adv-we', label: '5. CNTT Nâng Cao: Word + Excel (10-12b)' },
  { id: 'ai-office', label: '6. Ứng dụng AI vào công việc Văn phòng (5b)' },
  { id: 'excel-accounting', label: '7. Excel cho Kế toán' },
  { id: 'word-6b', label: '8. Word (6 buổi)' },
  { id: 'excel-6b', label: '9. Excel (6 buổi)' },
  { id: 'ppt-6b', label: '10. PPT (6 buổi)' }
];

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  sessions,
  currentUser,
  onCreateSession,
  onRotateQR,
  onToggleSessionOpen,
  onUpdateStatus,
  onMarkAllPresent,
  onSaveSession,
  onDeleteSession
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'qr_mode' | 'manual_list' | 'history'>('qr_mode');
  const [selectedTrack, setSelectedTrack] = useState<CurriculumTrack>('office-fast-3in1');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [rotationInterval, setRotationInterval] = useState<number>(30);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(30);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Auto select or create session
  const activeSession = sessions.find(s => s.id === selectedSessionId) || sessions.find(s => s.track === selectedTrack) || sessions[0];

  useEffect(() => {
    if (!activeSession && selectedTrack) {
      const trackName = TRACK_LABELS[selectedTrack] || selectedTrack;
      const newSess = onCreateSession(
        selectedTrack,
        `Lớp ${trackName}`,
        currentUser.id || 'teacher-01',
        currentUser.name
      );
      setSelectedSessionId(newSess.id);
    } else if (activeSession && activeSession.id !== selectedSessionId) {
      setSelectedSessionId(activeSession.id);
    }
  }, [activeSession, selectedSessionId, selectedTrack, onCreateSession, currentUser]);

  // Countdown Timer logic for dynamic QR code
  useEffect(() => {
    if (!activeSession || !activeSession.qrExpiresAt) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((activeSession.qrExpiresAt! - Date.now()) / 1000));
      setTimeLeftSeconds(remaining);

      // Auto-rotate when timer hits 0
      if (remaining === 0) {
        onRotateQR(activeSession.id, rotationInterval);
        soundFx.playCorrect();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession?.id, activeSession?.qrExpiresAt, onRotateQR, rotationInterval]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleRotateNow = () => {
    if (!activeSession) return;
    onRotateQR(activeSession.id, rotationInterval);
    soundFx.playClick();
  };

  const handleSaveCurrentSession = () => {
    if (!activeSession) return;
    onSaveSession(activeSession);
    setIsSavedNotice(true);
    soundFx.playVictory();
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  // Export Attendance to Excel (.csv with UTF-8 BOM)
  const exportAttendanceExcel = (sessionToExport?: AttendanceSession) => {
    const targetSession = sessionToExport || activeSession;
    if (!targetSession || targetSession.records.length === 0) {
      alert('Chưa có dữ liệu học viên để xuất file Excel!');
      return;
    }

    const headers = [
      'STT',
      'Ngày',
      'Giờ',
      'Lớp Học',
      'Giáo Viên',
      'Mã HV',
      'Họ Và Tên',
      'Trạng Thái',
      'Hình Thức',
      'Thời Điểm',
      'Ghi Chú'
    ];

    const escapeCsv = (val: any) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const statusMap: Record<AttendanceStatus, string> = {
      present: 'Có Mặt',
      absent: 'Vắng Mặt',
      late: 'Đi Trễ',
      excused: 'Có Phép'
    };

    const methodMap: Record<string, string> = {
      qr_scan: 'Quét QR',
      pin_code: 'Nhập PIN',
      manual: 'Thủ Công'
    };

    const trackTitle = TRACK_LABELS[targetSession.track] || targetSession.track;

    const rows = targetSession.records.map((rec, index) => [
      index + 1,
      escapeCsv(targetSession.date),
      escapeCsv(targetSession.startTime),
      escapeCsv(trackTitle),
      escapeCsv(targetSession.teacherName),
      escapeCsv(rec.studentCode),
      escapeCsv(rec.studentName),
      escapeCsv(statusMap[rec.status] || 'Vắng Mặt'),
      escapeCsv(methodMap[rec.checkInMethod] || 'Thủ công'),
      escapeCsv(rec.checkInTime || '--:--'),
      escapeCsv(rec.note || '')
    ].join(','));

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DiemDanh_${targetSession.track}_${targetSession.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    soundFx.playVictory();
  };

  // Compute live statistics
  const totalStudents = activeSession?.records.length || 0;
  const presentCount = activeSession?.records.filter(r => r.status === 'present').length || 0;
  const lateCount = activeSession?.records.filter(r => r.status === 'late').length || 0;
  const absentCount = activeSession?.records.filter(r => r.status === 'absent').length || 0;
  const presentRate = totalStudents > 0 ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 0;

  // QR Code URL (Points to the student auto check-in deep link)
  const qrCheckInUrl = activeSession
    ? `https://hoctructuyen.tinhocgenz.io.vn/?action=checkin&track=${activeSession.track}&pin=${activeSession.qrPinCode}&token=${activeSession.qrToken}`
    : 'https://hoctructuyen.tinhocgenz.io.vn';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(qrCheckInUrl)}`;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '14px 16px' }} className="animate-slide-up">
      {/* Sleek Compact Header */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          background: 'linear-gradient(135deg, rgba(79, 110, 247, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '14px',
          border: '1px solid rgba(79, 110, 247, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Điểm Danh QR
          </h2>
          <span style={{
            fontSize: '0.68rem',
            background: '#10b981',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 800
          }}>
            30S
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {activeSession && (
            <button
              onClick={() => {
                onToggleSessionOpen(activeSession.id);
                soundFx.playClick();
              }}
              className="btn"
              style={{
                padding: '7px 14px',
                fontSize: '0.82rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: activeSession.isOpen !== false ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.14)',
                border: activeSession.isOpen !== false ? '1.5px solid rgba(239, 68, 68, 0.4)' : '1.5px solid rgba(16, 185, 129, 0.4)',
                color: activeSession.isOpen !== false ? '#ef4444' : '#10b981'
              }}
              title={activeSession.isOpen !== false ? 'Bấm để tắt điểm danh' : 'Bấm để mở lại điểm danh'}
            >
              {activeSession.isOpen !== false ? <Lock size={15} /> : <Unlock size={15} />}
              <span>{activeSession.isOpen !== false ? 'Khóa Điểm Danh' : 'Mở Điểm Danh'}</span>
            </button>
          )}

          <button
            onClick={() => exportAttendanceExcel()}
            className="btn btn-secondary"
            style={{
              padding: '7px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              background: 'rgba(16, 185, 129, 0.08)',
              color: '#059669'
            }}
            title="Xuất bảng điểm danh sang file Excel (.CSV UTF-8)"
          >
            <FileSpreadsheet size={15} />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Class Selector Bar */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={15} color="var(--brand)" />
          <span>Lớp Học:</span>
        </div>

        <select
          value={selectedTrack}
          onChange={e => {
            const tr = e.target.value as CurriculumTrack;
            setSelectedTrack(tr);
            const found = sessions.find(s => s.track === tr);
            if (found) setSelectedSessionId(found.id);
            soundFx.playClick();
          }}
          style={{
            flex: 1,
            minWidth: '220px',
            maxWidth: '420px',
            padding: '7px 28px 7px 12px',
            fontSize: '0.84rem',
            minHeight: '36px'
          }}
        >
          {ALL_TRACKS.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="horizontal-scroll" style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '14px' }}>
        {[
          { id: 'qr_mode',     label: 'Mã QR (30s)', icon: QrCode },
          { id: 'manual_list', label: `Danh Sách Lớp (${totalStudents})`, icon: CheckCheck },
          { id: 'history',     label: `Lịch Sử (${sessions.length})`, icon: Calendar }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                soundFx.playClick();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                border: 'none',
                background: 'transparent',
                borderBottom: isActive ? '2.5px solid var(--brand)' : '2.5px solid transparent',
                color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: DYNAMIC 30S QR CODE ─── */}
      {activeSubTab === 'qr_mode' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
          {/* Left: QR Display Card */}
          <div className="card" style={{ padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(79, 110, 247, 0.08)', color: 'var(--brand)', fontSize: '0.74rem', fontWeight: 700, marginBottom: '10px' }}>
              <ShieldCheck size={14} />
              <span>{TRACK_LABELS[selectedTrack] || selectedTrack}</span>
            </div>

            {/* Countdown / Locked Status Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              background: activeSession?.isOpen === false
                ? 'rgba(239, 68, 68, 0.12)'
                : timeLeftSeconds > 10
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
              color: activeSession?.isOpen === false
                ? '#ef4444'
                : timeLeftSeconds > 10
                  ? '#10b981'
                  : '#ef4444',
              fontSize: '0.88rem',
              fontWeight: 900,
              marginBottom: '12px',
              border: activeSession?.isOpen === false
                ? '1px solid rgba(239, 68, 68, 0.35)'
                : timeLeftSeconds > 10
                  ? '1px solid rgba(16, 185, 129, 0.3)'
                  : '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              {activeSession?.isOpen === false ? (
                <>
                  <Lock size={15} />
                  <span>ĐÃ KHÓA ĐIỂM DANH</span>
                </>
              ) : (
                <>
                  <Clock size={15} />
                  <span>Đổi mã sau: {formatCountdown(timeLeftSeconds)}</span>
                </>
              )}
            </div>

            {/* QR Code Container */}
            <div style={{
              position: 'relative',
              padding: '12px',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              border: '1.5px solid var(--border-color)',
              marginBottom: '12px',
              overflow: 'hidden'
            }}>
              <img
                src={qrImageUrl}
                alt="QR Code Điểm Danh"
                style={{
                  width: '210px', height: '210px', display: 'block', borderRadius: '8px',
                  filter: activeSession?.isOpen === false ? 'blur(8px) grayscale(100%)' : 'none',
                  opacity: activeSession?.isOpen === false ? 0.3 : 1,
                  transition: 'all 0.3s ease'
                }}
              />

              {activeSession?.isOpen === false && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  color: '#fff',
                  textAlign: 'center'
                }}>
                  <Lock size={32} color="#ef4444" style={{ marginBottom: '6px' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff' }}>
                    ĐÃ TẮT ĐIỂM DANH
                  </div>
                  <button
                    onClick={() => {
                      if (activeSession) {
                        onToggleSessionOpen(activeSession.id);
                        soundFx.playVictory();
                      }
                    }}
                    className="btn btn-success"
                    style={{ padding: '6px 12px', fontSize: '0.76rem', fontWeight: 800, gap: '4px', marginTop: '8px' }}
                  >
                    <Unlock size={13} />
                    <span>Mở Lại QR</span>
                  </button>
                </div>
              )}
            </div>

            {/* 6-Digit PIN Code */}
            <div style={{ marginBottom: '12px', opacity: activeSession?.isOpen === false ? 0.4 : 1 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                MÃ PIN DỰ PHÒNG
              </div>
              <div style={{
                fontSize: '1.7rem',
                fontWeight: 900,
                color: activeSession?.isOpen === false ? 'var(--text-muted)' : 'var(--brand)',
                letterSpacing: '0.2em',
                fontFamily: 'var(--font-mono)',
                marginTop: '2px'
              }}>
                {activeSession?.isOpen === false ? 'LOCKED' : (activeSession?.qrPinCode || '------')}
              </div>
            </div>

            {/* Anti-cheat rotation speed selector */}
            <div style={{ width: '100%', maxWidth: '300px', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '4px' }}>
                ⏱️ Tốc độ xoay:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                {[
                  { sec: 30, label: '30s ⚡' },
                  { sec: 60, label: '1 phút' },
                  { sec: 120, label: '2 phút' },
                  { sec: 300, label: '5 phút' }
                ].map(item => (
                  <button
                    key={item.sec}
                    onClick={() => {
                      setRotationInterval(item.sec);
                      if (activeSession) onRotateQR(activeSession.id, item.sec);
                      soundFx.playClick();
                    }}
                    style={{
                      padding: '5px 4px',
                      borderRadius: '6px',
                      border: rotationInterval === item.sec ? '1.5px solid var(--brand)' : '1px solid var(--border-color)',
                      background: rotationInterval === item.sec ? 'var(--brand-light)' : 'var(--bg-card)',
                      color: rotationInterval === item.sec ? 'var(--brand)' : 'var(--text-secondary)',
                      fontSize: '0.72rem',
                      fontWeight: rotationInterval === item.sec ? 800 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rotate Button */}
            <button
              onClick={handleRotateNow}
              className="btn btn-secondary"
              style={{ width: '100%', maxWidth: '260px', padding: '7px 12px', fontSize: '0.78rem', fontWeight: 700, gap: '6px' }}
            >
              <RefreshCw size={13} />
              <span>Đổi Mã Ngay</span>
            </button>
          </div>

          {/* Right: Live Attendance Progress Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div className="card" style={{ padding: '12px', borderLeft: '4px solid #10b981' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>CÓ MẶT</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{presentCount}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{presentRate}% chuyên cần</div>
              </div>

              <div className="card" style={{ padding: '12px', borderLeft: '4px solid #ef4444' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>CHƯA ĐIỂM DANH</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ef4444' }}>{absentCount}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tổng số {totalStudents} bạn</div>
              </div>
            </div>

            {/* Instructions */}
            <div className="card" style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="var(--brand)" />
                  <span>Cách Điểm Danh</span>
                </h4>
                <ul style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingLeft: '16px', lineHeight: 1.5, margin: 0 }}>
                  <li>Dùng <b>Camera điện thoại / Web</b> quét mã QR.</li>
                  <li>Hoặc nhập <b>mã PIN 6 số</b> trên điện thoại.</li>
                  <li>Mã tự động đổi mỗi <b>30 giây</b> chống gửi ảnh.</li>
                </ul>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setActiveSubTab('manual_list')}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '7px 12px', fontSize: '0.78rem', fontWeight: 700, gap: '6px' }}
                >
                  <CheckCheck size={14} />
                  <span>Xem Danh Sách & Chấm Tay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: MANUAL ATTENDANCE TICK LIST ─── */}
      {activeSubTab === 'manual_list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Action Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => {
                  if (activeSession) {
                    onMarkAllPresent(activeSession.id);
                    soundFx.playVictory();
                  }
                }}
                className="btn btn-success"
                style={{ padding: '7px 13px', fontSize: '0.78rem', fontWeight: 700, gap: '6px' }}
              >
                <CheckCircle2 size={14} />
                <span>Tick Tất Cả Có Mặt</span>
              </button>

              <button
                onClick={handleSaveCurrentSession}
                className="btn btn-primary"
                style={{ padding: '7px 13px', fontSize: '0.78rem', fontWeight: 700, gap: '6px' }}
              >
                <Save size={14} />
                <span>{isSavedNotice ? 'Đã Lưu! ✓' : 'Lưu Danh Sách'}</span>
              </button>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Đã điểm danh: <b>{presentCount + lateCount}/{totalStudents}</b> ({presentRate}%)
            </div>
          </div>

          {/* Table Container */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 12px', width: '40px', textAlign: 'center' }}>#</th>
                    <th style={{ padding: '10px 12px', width: '100px' }}>Mã HV</th>
                    <th style={{ padding: '10px 12px', minWidth: '150px' }}>Họ Và Tên</th>
                    <th style={{ padding: '10px 12px', minWidth: '220px' }}>Trạng Thái</th>
                    <th style={{ padding: '10px 12px', width: '110px' }}>Thời Điểm</th>
                    <th style={{ padding: '10px 12px', minWidth: '160px' }}>Ghi Chú</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSession && activeSession.records.length > 0 ? (
                    activeSession.records.map((rec, idx) => (
                      <tr
                        key={rec.studentId}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          background: rec.status === 'present' ? 'rgba(16, 185, 129, 0.03)' : 'transparent'
                        }}
                      >
                        <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                          {rec.studentCode}
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {rec.studentName}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {[
                              { id: 'present', label: 'Có Mặt', color: '#10b981' },
                              { id: 'late',    label: 'Đi Trễ', color: '#f59e0b' },
                              { id: 'excused', label: 'Có Phép', color: '#3b82f6' },
                              { id: 'absent',  label: 'Vắng',   color: '#ef4444' }
                            ].map(st => {
                              const isSelected = rec.status === st.id;
                              return (
                                <button
                                  key={st.id}
                                  onClick={() => {
                                    onUpdateStatus(activeSession.id, rec.studentId, st.id as AttendanceStatus, rec.note);
                                    soundFx.playClick();
                                  }}
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: 'var(--radius-full)',
                                    border: isSelected ? `1.5px solid ${st.color}` : '1px solid var(--border-color)',
                                    background: isSelected ? `${st.color}22` : 'transparent',
                                    color: isSelected ? st.color : 'var(--text-secondary)',
                                    fontSize: '0.72rem',
                                    fontWeight: isSelected ? 800 : 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  {st.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                          {rec.checkInTime ? (
                            <span style={{ color: '#10b981', fontWeight: 700 }}>
                              {rec.checkInTime} ({rec.checkInMethod === 'qr_scan' ? 'QR' : rec.checkInMethod === 'pin_code' ? 'PIN' : 'Tay'})
                            </span>
                          ) : (
                            '--:--'
                          )}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <input
                            type="text"
                            placeholder="Thêm ghi chú..."
                            defaultValue={rec.note || ''}
                            onBlur={e => {
                              if (e.target.value !== rec.note) {
                                onUpdateStatus(activeSession.id, rec.studentId, rec.status, e.target.value);
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '4px 8px',
                              fontSize: '0.76rem',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px'
                            }}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Chưa có học viên nào trong danh sách lớp này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: ATTENDANCE HISTORY ─── */}
      {activeSubTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sessions.length > 0 ? (
            sessions.map(sess => {
              const pCount = sess.records.filter(r => r.status === 'present').length;
              const lCount = sess.records.filter(r => r.status === 'late').length;
              const aCount = sess.records.filter(r => r.status === 'absent').length;
              const tCount = sess.records.length;
              const pRate = tCount > 0 ? Math.round(((pCount + lCount) / tCount) * 100) : 0;
              const isCurrent = sess.id === activeSession?.id;

              return (
                <div
                  key={sess.id}
                  className="card"
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                    borderLeft: isCurrent ? '4px solid var(--brand)' : '4px solid transparent'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {TRACK_LABELS[sess.track] || sess.track}
                      </span>
                      {isCurrent && (
                        <span style={{ fontSize: '0.66rem', background: 'var(--brand)', color: '#fff', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontWeight: 800 }}>
                          HIỆN TẠI
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      📅 {sess.date} lúc {sess.startTime} • Giảng viên: {sess.teacherName}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right', fontSize: '0.78rem' }}>
                      <div style={{ fontWeight: 800, color: '#10b981' }}>{pCount + lCount}/{tCount} Có mặt ({pRate}%)</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{aCount} vắng</div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => exportAttendanceExcel(sess)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.74rem', gap: '4px' }}
                        title="Xuất Excel cho buổi học này"
                      >
                        <FileSpreadsheet size={13} />
                        <span>Excel</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa phiên điểm danh ngày ${sess.date}?`)) {
                            onDeleteSession(sess.id);
                            soundFx.playClick();
                          }
                        }}
                        className="btn btn-danger"
                        style={{ padding: '6px 8px', fontSize: '0.74rem' }}
                        title="Xóa phiên"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Chưa có lịch sử buổi học nào.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
