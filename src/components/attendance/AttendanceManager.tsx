import React, { useState, useEffect } from 'react';
import { AttendanceSession, AttendanceStatus, MakeupAttendanceReport } from '../../types/attendance';
import { UserProfile, CurriculumTrack, TRACK_LABELS, StudentAccount } from '../../types/auth';
import { TRACK_CLASS_CODES } from '../../hooks/useAttendanceStorage';
import {
  QrCode, CheckCircle2, Clock, RefreshCw,
  FileSpreadsheet, Trash2, Save, Users, Calendar,
  CheckCheck, Lock, Unlock, UserCheck, AlertTriangle,
  MapPin
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { getCurrentCoordinates } from '../../utils/securityUtils';

interface AttendanceManagerProps {
  sessions: AttendanceSession[];
  studentAccounts?: StudentAccount[];
  makeupReports?: MakeupAttendanceReport[];
  currentUser: UserProfile;
  onCreateSession: (track: CurriculumTrack, className: string, teacherId: string, teacherName: string, classCode?: string) => AttendanceSession;
  onRotateQR: (sessionId: string, intervalSeconds?: number) => { token: string; pinCode: string; expiresAt: number };
  onUpdateSessionSecurity?: (sessionId: string, updates: Partial<AttendanceSession>) => void;
  onToggleSessionOpen: (sessionId: string) => void;
  onUpdateStatus: (sessionId: string, studentId: string, status: AttendanceStatus, note?: string, method?: 'manual' | 'qr_scan' | 'pin_code', isMakeup?: boolean) => void;
  onMarkAllPresent: (sessionId: string) => void;
  onSaveSession: (session: AttendanceSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearMakeupReport?: (reportId: string) => void;
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
  studentAccounts = [],
  makeupReports = [],
  currentUser,
  onCreateSession,
  onRotateQR,
  onUpdateSessionSecurity,
  onToggleSessionOpen,
  onUpdateStatus,
  onMarkAllPresent,
  onSaveSession,
  onDeleteSession,
  onClearMakeupReport
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'qr_mode' | 'manual_list' | 'makeup_reports' | 'history'>('qr_mode');
  const [selectedTrack, setSelectedTrack] = useState<CurriculumTrack>(currentUser.programTrack || 'office-fast-3in1');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [rotationInterval] = useState<number>(300); // 5 minutes default (300s)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(300);
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [isFetchingGps, setIsFetchingGps] = useState(false);

  // Auto select active session
  const activeSession = sessions.find(s => s.id === selectedSessionId) || sessions.find(s => s.track === selectedTrack) || sessions[0];

  useEffect(() => {
    if (!activeSession && selectedTrack) {
      const classMeta = TRACK_CLASS_CODES[selectedTrack];
      const newSess = onCreateSession(
        selectedTrack,
        `Lớp ${classMeta?.classCode || 'K26'} - ${TRACK_LABELS[selectedTrack]}`,
        currentUser.id || classMeta?.defaultTeacherId || 'tch-03',
        currentUser.name || classMeta?.defaultTeacherName || 'Thầy Quang Huy',
        classMeta?.classCode
      );
      setSelectedSessionId(newSess.id);
    } else if (activeSession && activeSession.id !== selectedSessionId) {
      setSelectedSessionId(activeSession.id);
    }
  }, [activeSession, selectedSessionId, selectedTrack, onCreateSession, currentUser]);

  // Dynamic 5-minute countdown timer (repeats continuously)
  useEffect(() => {
    if (!activeSession || !activeSession.qrExpiresAt) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((activeSession.qrExpiresAt! - Date.now()) / 1000));
      setTimeLeftSeconds(remaining);

      // Auto rotate when 5 minutes expire
      if (remaining === 0) {
        onRotateQR(activeSession.id, rotationInterval);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession?.id, activeSession?.qrExpiresAt, onRotateQR, rotationInterval]);

  const handleRotateNow = () => {
    if (!activeSession) return;
    onRotateQR(activeSession.id, rotationInterval);
    soundFx.playClick();
  };

  // Toggle GPS Geolocation Lock (< 150m)
  const handleToggleGpsLock = async () => {
    if (!activeSession || !onUpdateSessionSecurity) return;
    setIsFetchingGps(true);
    try {
      if (activeSession.requireLocation) {
        onUpdateSessionSecurity(activeSession.id, { requireLocation: false });
        soundFx.playClick();
      } else {
        const coords = await getCurrentCoordinates();
        onUpdateSessionSecurity(activeSession.id, {
          requireLocation: true,
          classroomLat: coords.latitude,
          classroomLng: coords.longitude,
          allowedRadiusMeters: 150
        });
        soundFx.playVictory();
      }
    } catch (e: any) {
      alert('Lỗi lấy GPS: ' + (e?.message || 'Vui lòng cấp quyền vị trí trên trình duyệt.'));
    } finally {
      setIsFetchingGps(false);
    }
  };

  const handleSaveCurrentSession = () => {
    if (!activeSession) return;
    onSaveSession(activeSession);
    setIsSavedNotice(true);
    soundFx.playVictory();
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  // Format MM:SS helper
  const formatMMSS = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Export Attendance to Excel
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
      'Mã Lớp',
      'Môn Học',
      'Giáo Viên',
      'Mã HV',
      'Họ Và Tên',
      'Số Điện Thoại',
      'Trạng Thái',
      'Học Bù / Vắng Bù',
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
      makeup: 'Học Bù (Vắng Bù)',
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

    const rows = targetSession.records.map((rec, index) => {
      const stAcc = studentAccounts.find(s => s.studentCode === rec.studentCode);
      return [
        index + 1,
        escapeCsv(targetSession.date),
        escapeCsv(targetSession.startTime),
        escapeCsv(rec.classCode || targetSession.classCode),
        escapeCsv(trackTitle),
        escapeCsv(targetSession.teacherName),
        escapeCsv(rec.studentCode),
        escapeCsv(rec.studentName),
        escapeCsv(stAcc?.phone || '--'),
        escapeCsv(statusMap[rec.status] || 'Vắng Mặt'),
        escapeCsv(rec.isMakeup || rec.status === 'makeup' ? 'ĐÚNG (Học Bù)' : 'Không'),
        escapeCsv(methodMap[rec.checkInMethod] || 'Thủ công'),
        escapeCsv(rec.checkInTime || '--:--'),
        escapeCsv(rec.note || '')
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DiemDanh_${targetSession.classCode || targetSession.track}_${targetSession.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    soundFx.playVictory();
  };

  // Live stats
  const totalStudents = activeSession?.records.length || 0;
  const presentCount = activeSession?.records.filter(r => r.status === 'present').length || 0;
  const makeupCount = activeSession?.records.filter(r => r.status === 'makeup' || r.isMakeup).length || 0;
  const lateCount = activeSession?.records.filter(r => r.status === 'late').length || 0;
  const presentRate = totalStudents > 0 ? Math.round(((presentCount + makeupCount + lateCount) / totalStudents) * 100) : 0;

  // QR Code Deep Link URL
  const currentClassCode = activeSession?.classCode || TRACK_CLASS_CODES[selectedTrack]?.classCode || 'K26';
  const qrCheckInUrl = activeSession
    ? `https://hoctructuyen.tinhocgenz.io.vn/?action=checkin&track=${activeSession.track}&class=${currentClassCode}&pin=${activeSession.qrPinCode}&token=${activeSession.qrToken}`
    : 'https://hoctructuyen.tinhocgenz.io.vn';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(qrCheckInUrl)}`;

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', width: '100%', padding: '14px 16px' }} className="animate-slide-up">
      {/* Top Selector Bar */}
      <div
        className="card"
        style={{
          padding: '12px 16px',
          borderRadius: '16px',
          marginBottom: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '260px' }}>
          <Users size={16} color="var(--brand)" />
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
              maxWidth: '380px',
              padding: '6px 12px',
              fontSize: '0.86rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}
          >
            {ALL_TRACKS.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--brand)', background: 'rgba(79,110,247,0.1)', padding: '3px 8px', borderRadius: '6px' }}>
            {currentClassCode}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => exportAttendanceExcel()}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700, gap: '6px' }}
          >
            <FileSpreadsheet size={14} />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="horizontal-scroll" style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        {[
          { id: 'qr_mode',        label: 'Mã QR Điểm Danh', icon: QrCode },
          { id: 'manual_list',    label: `Danh Sách Lớp (${presentCount + makeupCount + lateCount}/${totalStudents})`, icon: CheckCheck },
          { id: 'makeup_reports', label: `Học Bù (${makeupReports.length})`, icon: UserCheck },
          { id: 'history',        label: `Lịch Sử (${sessions.length})`, icon: Calendar }
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
                fontSize: '0.86rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.id === 'makeup_reports' && makeupReports.length > 0 && (
                <span style={{ background: '#f59e0b', color: '#fff', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>
                  {makeupReports.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: DUAL VIEW (QR CODE + LIVE CHECK-IN ROSTER BOARD) ─── */}
      {activeSubTab === 'qr_mode' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '16px', alignItems: 'start' }}>
          {/* Left: Projector QR Code Card */}
          <div
            className="card"
            style={{
              padding: '24px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: '20px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.08)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)'
            }}
          >
            {/* Header Status & Countdown */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              marginBottom: '14px'
            }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {activeSession?.className || `Lớp ${currentClassCode}`}
              </div>

              {/* 5-Minute Countdown Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '999px',
                background: activeSession?.isOpen === false ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                color: activeSession?.isOpen === false ? '#ef4444' : '#10b981',
                fontSize: '0.84rem',
                fontWeight: 900
              }}>
                <Clock size={14} />
                <span>{activeSession?.isOpen === false ? 'ĐÃ KHÓA' : formatMMSS(timeLeftSeconds)}</span>
              </div>
            </div>

            {/* Giant QR Code Display */}
            <div style={{
              position: 'relative',
              padding: '12px',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              marginBottom: '14px',
              overflow: 'hidden'
            }}>
              <img
                src={qrImageUrl}
                alt="QR Code"
                style={{
                  width: '240px',
                  height: '240px',
                  display: 'block',
                  borderRadius: '8px',
                  filter: activeSession?.isOpen === false ? 'blur(8px) grayscale(100%)' : 'none',
                  opacity: activeSession?.isOpen === false ? 0.3 : 1,
                  transition: 'all 0.3s ease'
                }}
              />

              {activeSession?.isOpen === false && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(15, 23, 42, 0.78)',
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
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#fff', marginBottom: '6px' }}>
                    ĐÃ KHÓA ĐIỂM DANH
                  </div>
                  <button
                    onClick={() => {
                      if (activeSession) {
                        onToggleSessionOpen(activeSession.id);
                        soundFx.playVictory();
                      }
                    }}
                    className="btn btn-success"
                    style={{ padding: '5px 12px', fontSize: '0.76rem', fontWeight: 800, gap: '4px' }}
                  >
                    <Unlock size={13} />
                    <span>Mở Lại QR</span>
                  </button>
                </div>
              )}
            </div>

            {/* 6-Digit PIN Code */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{
                fontSize: '1.9rem',
                fontWeight: 900,
                color: activeSession?.isOpen === false ? 'var(--text-muted)' : 'var(--brand)',
                letterSpacing: '0.2em',
                fontFamily: 'var(--font-mono)'
              }}>
                {activeSession?.isOpen === false ? 'LOCKED' : (activeSession?.qrPinCode || '------')}
              </div>
            </div>

            {/* Minimal Toolbar (GPS Toggle, Rotate Now, Lock/Unlock) */}
            <div style={{ display: 'flex', gap: '6px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleRotateNow}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, gap: '5px' }}
                title="Đổi mã QR & PIN mới ngay lập tức"
              >
                <RefreshCw size={13} />
                <span>Đổi Mã</span>
              </button>

              <button
                onClick={handleToggleGpsLock}
                disabled={isFetchingGps}
                className={`btn ${activeSession?.requireLocation ? 'btn-warning' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, gap: '5px' }}
                title="Giới hạn học viên điểm danh trong bán kính GPS 150m lớp học"
              >
                <MapPin size={13} />
                <span>{isFetchingGps ? 'Đang lấy GPS...' : activeSession?.requireLocation ? 'GPS: BẬT' : 'Bật GPS'}</span>
              </button>

              {activeSession && (
                <button
                  onClick={() => {
                    onToggleSessionOpen(activeSession.id);
                    soundFx.playClick();
                  }}
                  className={`btn ${activeSession.isOpen !== false ? 'btn-danger' : 'btn-success'}`}
                  style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, gap: '5px' }}
                >
                  {activeSession.isOpen !== false ? <Lock size={13} /> : <Unlock size={13} />}
                  <span>{activeSession.isOpen !== false ? 'Khóa QR' : 'Mở QR'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Live Student Attendance Board */}
          <div
            className="card"
            style={{
              padding: '18px 20px',
              borderRadius: '20px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.08)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '440px'
            }}
          >
            {/* Header with Live Stats & Counter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Học Viên Đã Điểm Danh
                </h3>
              </div>

              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '3px 9px', borderRadius: '999px' }}>
                {presentCount + makeupCount + lateCount} / {totalStudents} Có Mặt ({presentRate}%)
              </span>
            </div>

            {/* Scrollable Live List of Students */}
            <div style={{ flex: 1, maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
              {activeSession && activeSession.records.length > 0 ? (
                activeSession.records.map((rec, index) => {
                  const isCheckedIn = rec.status === 'present' || rec.status === 'makeup' || rec.status === 'late' || rec.isMakeup;
                  return (
                    <div
                      key={rec.studentId}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        background: isCheckedIn ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-secondary)',
                        border: isCheckedIn ? '1px solid rgba(16, 185, 129, 0.28)' : '1px solid var(--border-color)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', width: '18px', textAlign: 'center' }}>
                          {index + 1}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {rec.studentName}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            {rec.studentCode}
                          </div>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {isCheckedIn ? (
                          <div style={{ textAlign: 'right' }}>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              color: rec.status === 'makeup' || rec.isMakeup ? '#f59e0b' : '#10b981',
                              background: rec.status === 'makeup' || rec.isMakeup ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <CheckCircle2 size={12} />
                              <span>{rec.status === 'makeup' || rec.isMakeup ? 'HỌC BÙ' : 'ĐÃ CÓ MẶT'}</span>
                            </span>
                            {rec.checkInTime && (
                              <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {rec.checkInTime} ({rec.checkInMethod === 'qr_scan' ? 'QR' : 'PIN'})
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            background: 'var(--bg-primary)',
                            padding: '2px 7px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)'
                          }}>
                            Chưa quét
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Chưa có học viên nào trong danh sách lớp.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: DETAILED STUDENT CLASS ROSTER ─── */}
      {activeSubTab === 'manual_list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
              Lớp: <b>{currentClassCode}</b> • Có mặt: <b>{presentCount + makeupCount + lateCount}/{totalStudents}</b> ({presentRate}%)
            </div>
          </div>

          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 12px', width: '35px', textAlign: 'center' }}>#</th>
                    <th style={{ padding: '10px 12px', width: '90px' }}>Mã HV</th>
                    <th style={{ padding: '10px 12px', minWidth: '140px' }}>Họ Và Tên</th>
                    <th style={{ padding: '10px 12px', width: '90px' }}>Mã Lớp</th>
                    <th style={{ padding: '10px 12px', width: '100px' }}>SĐT</th>
                    <th style={{ padding: '10px 12px', minWidth: '260px' }}>Trạng Thái Điểm Danh</th>
                    <th style={{ padding: '10px 12px', minWidth: '120px' }}>Thời Điểm</th>
                    <th style={{ padding: '10px 12px', minWidth: '150px' }}>Ghi Chú</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSession && activeSession.records.length > 0 ? (
                    activeSession.records.map((rec, idx) => {
                      const stAcc = studentAccounts.find(s => s.studentCode === rec.studentCode);
                      return (
                        <tr
                          key={rec.studentId}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            background: rec.status === 'makeup' || rec.isMakeup
                              ? 'rgba(245, 158, 11, 0.05)'
                              : rec.status === 'present'
                                ? 'rgba(16, 185, 129, 0.03)'
                                : 'transparent'
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
                          <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand)' }}>
                            {rec.classCode || currentClassCode}
                          </td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '0.76rem' }}>
                            {stAcc?.phone || '--'}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {[
                                { id: 'present', label: 'Có Mặt', color: '#10b981' },
                                { id: 'makeup',  label: 'Học Bù', color: '#f59e0b' },
                                { id: 'late',    label: 'Đi Trễ', color: '#d97706' },
                                { id: 'excused', label: 'Có Phép', color: '#3b82f6' },
                                { id: 'absent',  label: 'Vắng',   color: '#ef4444' }
                              ].map(st => {
                                const isSelected = rec.status === st.id;
                                return (
                                  <button
                                    key={st.id}
                                    onClick={() => {
                                      onUpdateStatus(
                                        activeSession.id,
                                        rec.studentId,
                                        st.id as AttendanceStatus,
                                        rec.note,
                                        'manual',
                                        st.id === 'makeup'
                                      );
                                      soundFx.playClick();
                                    }}
                                    style={{
                                      padding: '3px 7px',
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
                          <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '0.74rem' }}>
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
                              placeholder="Ghi chú..."
                              defaultValue={rec.note || ''}
                              onBlur={e => {
                                if (e.target.value !== rec.note) {
                                  onUpdateStatus(activeSession.id, rec.studentId, rec.status, e.target.value, rec.checkInMethod, rec.isMakeup);
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
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
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

      {/* ─── TAB 3: MAKEUP ATTENDANCE REPORTS ─── */}
      {activeSubTab === 'makeup_reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            padding: '12px 16px',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
              Danh sách học viên học bù từ lớp khác được ghi nhận tự động và gửi về Ban Quản Trị.
            </div>
          </div>

          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 12px', width: '40px', textAlign: 'center' }}>#</th>
                    <th style={{ padding: '10px 12px', width: '90px' }}>Mã HV</th>
                    <th style={{ padding: '10px 12px' }}>Họ Và Tên</th>
                    <th style={{ padding: '10px 12px' }}>Lớp Gốc</th>
                    <th style={{ padding: '10px 12px' }}>Lớp Học Bù</th>
                    <th style={{ padding: '10px 12px' }}>Giáo Viên</th>
                    <th style={{ padding: '10px 12px' }}>Ngày / Giờ</th>
                    <th style={{ padding: '10px 12px' }}>Lý Do</th>
                    {onClearMakeupReport && <th style={{ padding: '10px 12px', width: '50px' }}>Xóa</th>}
                  </tr>
                </thead>
                <tbody>
                  {makeupReports.length > 0 ? (
                    makeupReports.map((rpt, idx) => (
                      <tr key={rpt.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, fontFamily: 'monospace' }}>{rpt.studentCode}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{rpt.studentName}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{rpt.originalClassCode}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: '#f59e0b' }}>{rpt.makeupClassCode}</td>
                        <td style={{ padding: '8px 12px' }}>{rpt.teacherName}</td>
                        <td style={{ padding: '8px 12px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          {rpt.sessionDate} ({rpt.checkInTime})
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{rpt.reason}</td>
                        {onClearMakeupReport && (
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <button
                              onClick={() => onClearMakeupReport(rpt.id)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Chưa có sinh viên nào đi học bù.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: ATTENDANCE HISTORY ─── */}
      {activeSubTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sessions.length > 0 ? (
            sessions.map(sess => {
              const pCount = sess.records.filter(r => r.status === 'present').length;
              const mCount = sess.records.filter(r => r.status === 'makeup' || r.isMakeup).length;
              const lCount = sess.records.filter(r => r.status === 'late').length;
              const aCount = sess.records.filter(r => r.status === 'absent').length;
              const tCount = sess.records.length;
              const pRate = tCount > 0 ? Math.round(((pCount + mCount + lCount) / tCount) * 100) : 0;
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
                        Lớp {sess.classCode || 'K26'} - {TRACK_LABELS[sess.track] || sess.track}
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
                      <div style={{ fontWeight: 800, color: '#10b981' }}>{pCount + mCount + lCount}/{tCount} Có mặt ({pRate}%)</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{mCount} học bù • {aCount} vắng</div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => exportAttendanceExcel(sess)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.74rem', gap: '4px' }}
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
