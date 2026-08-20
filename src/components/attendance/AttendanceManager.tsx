import React, { useState, useEffect } from 'react';
import { AttendanceSession, AttendanceStatus } from '../../types/attendance';
import { UserProfile, CurriculumTrack, TRACK_LABELS, StudentAccount } from '../../types/auth';
import {
  QrCode, CheckCircle2, Clock, RefreshCw,
  FileSpreadsheet, Trash2, Save, Users, Calendar, Sparkles,
  ShieldCheck, CheckCheck, Play
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface AttendanceManagerProps {
  sessions: AttendanceSession[];
  studentAccounts?: StudentAccount[];
  currentUser: UserProfile;
  onCreateSession: (track: CurriculumTrack, className: string, teacherId: string, teacherName: string) => AttendanceSession;
  onRotateQR: (sessionId: string, intervalSeconds?: number) => { token: string; pinCode: string; expiresAt: number };
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
  onUpdateStatus,
  onMarkAllPresent,
  onSaveSession,
  onDeleteSession
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'qr_mode' | 'manual_list' | 'history'>('qr_mode');
  const [selectedTrack, setSelectedTrack] = useState<CurriculumTrack>('office-fast-3in1');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [rotationInterval, setRotationInterval] = useState<number>(300); // default 5 minutes
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(300);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Auto select or create session
  const activeSession = sessions.find(s => s.id === selectedSessionId) || sessions.find(s => s.track === selectedTrack) || sessions[0];

  useEffect(() => {
    if (activeSession && activeSession.id !== selectedSessionId) {
      setSelectedSessionId(activeSession.id);
    }
  }, [activeSession, selectedSessionId]);

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

  const handleStartNewSession = () => {
    const trackName = TRACK_LABELS[selectedTrack] || selectedTrack;
    const newSess = onCreateSession(
      selectedTrack,
      `Lớp ${trackName}`,
      currentUser.id || 'teacher-01',
      currentUser.name
    );
    setSelectedSessionId(newSess.id);
    soundFx.playVictory();
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
      'Ngày Điểm Danh',
      'Giờ Bắt Đầu',
      'Phân Hệ / Lớp Học',
      'Giảng Viên Điểm Danh',
      'Mã Học Viên',
      'Họ Và Tên Học Viên',
      'Trạng Thái',
      'Hình Thức Điểm Danh',
      'Thời Điểm Quét / Điểm Danh',
      'Ghi Chú Của Giáo Viên'
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
      qr_scan: 'Quét QR 5 Phút',
      pin_code: 'Nhập Mã PIN',
      manual: 'Điểm Danh Thủ Công'
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
      {/* Header Banner */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(79, 110, 247, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '16px',
          border: '1px solid rgba(79, 110, 247, 0.22)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Hệ Thống Điểm Danh Thông Minh
            </h2>
            <span style={{
              fontSize: '0.68rem',
              background: '#10b981',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 800
            }}>
              QR ĐỘNG 5 PHÚT
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
            Quét mã QR tự động xoay mỗi 5 phút hoặc điểm danh tick tay • Tự động xuất file Excel cho Admin
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => exportAttendanceExcel()}
            className="btn btn-secondary"
            style={{
              padding: '8px 14px',
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
            <span>Xuất Excel Điểm Danh</span>
          </button>

          <button
            onClick={handleStartNewSession}
            className="btn btn-primary"
            style={{ padding: '8px 14px', fontSize: '0.82rem', fontWeight: 800, gap: '6px' }}
          >
            <Play size={14} />
            <span>Mở Phiên Điểm Danh Mới</span>
          </button>
        </div>
      </div>

      {/* Class Selector Bar */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={15} color="var(--brand)" />
          <span>Chọn Lớp / Phân Hệ:</span>
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
            maxWidth: '450px',
            padding: '8px 30px 8px 12px',
            fontSize: '0.84rem',
            minHeight: '38px'
          }}
        >
          {ALL_TRACKS.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="horizontal-scroll" style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        {[
          { id: 'qr_mode',     label: 'Mã QR Động (5 Phút)', icon: QrCode },
          { id: 'manual_list', label: `Điểm Danh Thủ Công (${totalStudents})`, icon: CheckCheck },
          { id: 'history',     label: `Lịch Sử Buổi Học (${sessions.length})`, icon: Calendar }
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
                padding: '8px 16px',
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

      {/* ─── TAB 1: DYNAMIC 5-MINUTE QR CODE ─── */}
      {activeSubTab === 'qr_mode' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {/* Left: QR Display Card */}
          <div className="card" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(79, 110, 247, 0.08)', color: 'var(--brand)', fontSize: '0.74rem', fontWeight: 700, marginBottom: '12px' }}>
              <ShieldCheck size={14} />
              <span>{TRACK_LABELS[selectedTrack] || selectedTrack}</span>
            </div>

            {/* Countdown Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: timeLeftSeconds > 60 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: timeLeftSeconds > 60 ? '#10b981' : '#ef4444',
              fontSize: '0.92rem',
              fontWeight: 900,
              marginBottom: '16px',
              border: timeLeftSeconds > 60 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <Clock size={16} />
              <span>Hết hạn sau: {formatCountdown(timeLeftSeconds)}</span>
            </div>

            {/* QR Code Container */}
            <div style={{
              padding: '14px',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              border: '1.5px solid var(--border-color)',
              marginBottom: '14px'
            }}>
              <img
                src={qrImageUrl}
                alt="QR Code Điểm Danh"
                style={{ width: '220px', height: '220px', display: 'block', borderRadius: '8px' }}
              />
            </div>

            {/* 6-Digit PIN Code */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                MÃ PIN ĐIỂM DANH THAY THẾ (NẾU KHÔNG QUÉT ĐƯỢC)
              </div>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: 900,
                color: 'var(--brand)',
                letterSpacing: '0.2em',
                fontFamily: 'var(--font-mono)',
                marginTop: '4px'
              }}>
                {activeSession?.qrPinCode || '------'}
              </div>
            </div>

            {/* Anti-cheat rotation speed selector */}
            <div style={{ width: '100%', maxWidth: '320px', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
                🛡️ TỐC ĐỘ TỰ ĐỘNG XOAY MÃ (CHỐNG GỬI ẢNH ZALO):
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
              style={{ width: '100%', maxWidth: '280px', padding: '8px 14px', fontSize: '0.8rem', fontWeight: 700, gap: '6px' }}
            >
              <RefreshCw size={14} />
              <span>Làm Mới Mã QR Ngay Lập Tức</span>
            </button>
          </div>

          {/* Right: Live Attendance Progress Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div className="card" style={{ padding: '14px', borderLeft: '4px solid #10b981' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>CÓ MẶT</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981' }}>{presentCount}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{presentRate}% tỷ lệ tham gia</div>
              </div>

              <div className="card" style={{ padding: '14px', borderLeft: '4px solid #ef4444' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>CHƯA ĐIỂM DANH</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ef4444' }}>{absentCount}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Trên tổng số {totalStudents} bạn</div>
              </div>
            </div>

            {/* Instructions & Quick Switch */}
            <div className="card" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={15} color="var(--brand)" />
                  <span>Hướng Dẫn Cho Học Viên</span>
                </h4>
                <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: 1.6, margin: 0 }}>
                  <li>Học sinh dùng <b>Camera điện thoại / Zalo / Web</b> quét mã QR trên màn hình chiếu.</li>
                  <li>Hoặc nhập <b>mã PIN 6 số</b> trên góc phải màn hình của mình.</li>
                  <li>Mã QR sẽ <b>tự động xoay sau 5 phút</b> để chống gian lận.</li>
                </ul>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setActiveSubTab('manual_list')}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', fontWeight: 700, gap: '6px' }}
                >
                  <CheckCheck size={14} />
                  <span>Xem & Tick Thủ Công</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: MANUAL ATTENDANCE TICK LIST ─── */}
      {activeSubTab === 'manual_list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                <span>{isSavedNotice ? 'Đã Lưu Thành Công! ✓' : 'Lưu Danh Sách'}</span>
              </button>
            </div>

            <button
              onClick={() => exportAttendanceExcel()}
              className="btn btn-secondary"
              style={{ padding: '7px 13px', fontSize: '0.78rem', fontWeight: 700, gap: '6px' }}
            >
              <FileSpreadsheet size={14} color="#059669" />
              <span>Xuất File Excel</span>
            </button>
          </div>

          {/* Attendance Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            {!activeSession || activeSession.records.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Chưa có học viên nào trong phân hệ này hoặc chưa mở phiên điểm danh.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px 14px', width: '45px' }}>STT</th>
                      <th style={{ padding: '10px 14px' }}>Học Viên</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>Trạng Thái Điểm Danh</th>
                      <th style={{ padding: '10px 14px' }}>Thời Gian</th>
                      <th style={{ padding: '10px 14px' }}>Ghi Chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeSession.records.map((rec, idx) => (
                      <tr key={rec.studentId || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{rec.studentName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {rec.studentCode} {rec.schoolOrClass && `• ${rec.schoolOrClass}`}
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {[
                              { id: 'present', label: 'Có Mặt', bg: '#10b981' },
                              { id: 'late',    label: 'Trễ',    bg: '#f59e0b' },
                              { id: 'excused', label: 'Có Phép',bg: '#3b82f6' },
                              { id: 'absent',  label: 'Vắng',   bg: '#ef4444' }
                            ].map(st => {
                              const isSelected = rec.status === st.id;
                              return (
                                <button
                                  key={st.id}
                                  onClick={() => {
                                    onUpdateStatus(activeSession.id, rec.studentId, st.id as AttendanceStatus, rec.note, 'manual');
                                    soundFx.playClick();
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    border: isSelected ? `1.5px solid ${st.bg}` : '1px solid var(--border-color)',
                                    background: isSelected ? `${st.bg}18` : 'var(--bg-card)',
                                    color: isSelected ? st.bg : 'var(--text-muted)',
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
                        <td style={{ padding: '10px 14px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          {rec.checkInTime || '--:--'}
                          <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                            {rec.checkInMethod === 'qr_scan' ? '📱 Quét QR' : rec.checkInMethod === 'pin_code' ? '🔢 Nhập PIN' : '✍️ Thủ công'}
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <input
                            type="text"
                            placeholder="Ghi chú..."
                            defaultValue={rec.note || ''}
                            onBlur={e => {
                              onUpdateStatus(activeSession.id, rec.studentId, rec.status, e.target.value, rec.checkInMethod);
                            }}
                            style={{
                              padding: '5px 8px',
                              fontSize: '0.76rem',
                              minHeight: '30px',
                              borderRadius: '6px'
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: ATTENDANCE SESSIONS HISTORY ─── */}
      {activeSubTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sessions.length === 0 ? (
            <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Chưa có phiên điểm danh nào được tạo.
            </div>
          ) : (
            sessions.map(s => {
              const pCount = s.records.filter(r => r.status === 'present').length;
              const aCount = s.records.filter(r => r.status === 'absent').length;
              const lCount = s.records.filter(r => r.status === 'late').length;
              const eCount = s.records.filter(r => r.status === 'excused').length;
              const total = s.records.length;
              const rate = total > 0 ? Math.round(((pCount + lCount) / total) * 100) : 0;

              return (
                <div
                  key={s.id}
                  className="card"
                  style={{
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {TRACK_LABELS[s.track] || s.track}
                      </span>
                      <span style={{ fontSize: '0.7rem', background: 'var(--brand-light)', color: 'var(--brand)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                        {s.date} lúc {s.startTime}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      <span>Có mặt: <b style={{ color: '#10b981' }}>{pCount}</b></span>
                      <span>Trễ: <b style={{ color: '#f59e0b' }}>{lCount}</b></span>
                      <span>Có phép: <b style={{ color: '#3b82f6' }}>{eCount}</b></span>
                      <span>Vắng: <b style={{ color: '#ef4444' }}>{aCount}</b></span>
                      <span>Tỷ lệ: <b>{rate}%</b></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        setSelectedSessionId(s.id);
                        setSelectedTrack(s.track);
                        setActiveSubTab('manual_list');
                        soundFx.playClick();
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.76rem', fontWeight: 700 }}
                    >
                      Xem & Chỉnh Sửa
                    </button>

                    <button
                      onClick={() => exportAttendanceExcel(s)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.76rem', fontWeight: 700, color: '#059669' }}
                    >
                      <FileSpreadsheet size={13} />
                      <span>Xuất Excel</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc chắn muốn xóa phiên điểm danh ngày ${s.date}?`)) {
                          onDeleteSession(s.id);
                          soundFx.playClick();
                        }
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.76rem', color: 'var(--danger)' }}
                      title="Xóa phiên"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
