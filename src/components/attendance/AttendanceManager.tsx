import React, { useState, useEffect } from 'react';
import { AttendanceSession, AttendanceStatus, MakeupAttendanceReport } from '../../types/attendance';
import { UserProfile, CurriculumTrack, TRACK_LABELS, StudentAccount } from '../../types/auth';
import { TRACK_CLASS_CODES } from '../../hooks/useAttendanceStorage';
import {
  QrCode, CheckCircle2, Clock, RefreshCw,
  FileSpreadsheet, Trash2, Save, Users, Calendar,
  CheckCheck, Lock, Unlock, UserCheck,
  MapPin, Radio
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
  studentAccounts: _studentAccounts = [],
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
        currentUser.name || classMeta?.defaultTeacherName || 'Cô Hoàng Mai',
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
    } catch (err: any) {
      alert(`Không thể lấy tọa độ GPS: ${err?.message || 'Vui lòng cấp quyền vị trí trình duyệt'}`);
    } finally {
      setIsFetchingGps(false);
    }
  };

  const formatMMSS = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Compute live attendance metrics
  const totalStudents = activeSession?.records?.length || 0;
  const presentCount = activeSession?.records?.filter(r => r.status === 'present').length || 0;
  const lateCount = activeSession?.records?.filter(r => r.status === 'late').length || 0;
  const makeupCount = activeSession?.records?.filter(r => r.status === 'makeup' || r.isMakeup).length || 0;
  const presentRate = totalStudents > 0 ? Math.round(((presentCount + makeupCount + lateCount) / totalStudents) * 100) : 0;

  // Filter ONLY students who have checked in, sorted newest first
  const checkedInRecords = (activeSession?.records || [])
    .filter(r => r.status === 'present' || r.status === 'makeup' || r.status === 'late' || r.isMakeup)
    .sort((a, b) => {
      if (!a.checkInTime) return 1;
      if (!b.checkInTime) return -1;
      return b.checkInTime.localeCompare(a.checkInTime);
    });

  const exportAttendanceExcel = (targetSession?: AttendanceSession) => {
    const sess = targetSession || activeSession;
    if (!sess) return;

    soundFx.playClick();
    const rows = [
      ['STT', 'Mã Học Viên', 'Họ và Tên', 'Trạng Thái', 'Giờ Điểm Danh', 'Hình Thức', 'Ghi Chú'],
      ...sess.records.map((r, i) => [
        i + 1,
        r.studentCode,
        r.studentName,
        r.status === 'present' ? 'Có mặt' : r.status === 'makeup' || r.isMakeup ? 'Học bù' : r.status === 'late' ? 'Đi muộn' : 'Vắng',
        r.checkInTime || '',
        r.checkInMethod === 'qr_scan' ? 'Quét QR' : r.checkInMethod === 'pin_code' ? 'Nhập PIN' : 'Thủ công',
        r.note || ''
      ])
    ];

    const csvContent = '\uFEFF' + rows.map(e => e.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DiemDanh_${sess.className.replace(/\s+/g, '_')}_${sess.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveCurrentSession = () => {
    if (!activeSession) return;
    onSaveSession(activeSession);
    soundFx.playVictory();
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const currentClassCode = activeSession?.classCode || TRACK_CLASS_CODES[selectedTrack]?.classCode || 'K26';
  const qrCheckInUrl = activeSession
    ? `https://hoctructuyen.tinhocgenz.io.vn/?action=checkin&track=${activeSession.track}&class=${currentClassCode}&pin=${activeSession.qrPinCode}&token=${activeSession.qrToken}`
    : 'https://hoctructuyen.tinhocgenz.io.vn';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=14&data=${encodeURIComponent(qrCheckInUrl)}`;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '16px 20px', fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      {/* Top Selector Bar */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '260px' }}>
          <Users size={16} color="#2563EB" />
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
              fontSize: '13.5px',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#0F172A',
              outline: 'none'
            }}
          >
            {ALL_TRACKS.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '3px 8px', borderRadius: '4px', border: '1px solid #BFDBFE' }}>
            {currentClassCode}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => exportAttendanceExcel()}
            style={{
              padding: '6px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              borderRadius: '6px',
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileSpreadsheet size={14} />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: '16px', background: '#FFFFFF', borderRadius: '6px 6px 0 0' }}>
        {[
          { id: 'qr_mode',        label: 'Mã QR Điểm Danh Trực Tiếp', icon: QrCode },
          { id: 'manual_list',    label: `Danh Sách Cả Lớp (${presentCount + makeupCount + lateCount}/${totalStudents})`, icon: CheckCheck },
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
                padding: '10px 18px',
                border: 'none',
                background: 'transparent',
                borderBottom: isActive ? '2.5px solid #2563EB' : '2.5px solid transparent',
                color: isActive ? '#2563EB' : '#64748B',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.id === 'makeup_reports' && makeupReports.length > 0 && (
                <span style={{ background: '#D97706', color: '#fff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
                  {makeupReports.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: DUAL VIEW (GIANT QR CODE HERO + LIVE CHECK-IN STREAM) ─── */}
      {activeSubTab === 'qr_mode' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)', gap: '18px', alignItems: 'start' }}>
          
          {/* CỘT TRÁI (ƯU TIÊN MÃ ĐIỂM DANH SIÊU BỰ CHO MÁY CHIẾU) */}
          <div
            style={{
              padding: '24px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF'
            }}
          >
            {/* Header Status & Countdown */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '14px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                {activeSession?.className || `Lớp ${currentClassCode}`}
              </div>

              {/* 5-Minute Countdown Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '999px',
                background: activeSession?.isOpen === false ? '#FEE2E2' : '#DCFCE7',
                color: activeSession?.isOpen === false ? '#DC2626' : '#16A34A',
                fontSize: '12.5px',
                fontWeight: 700
              }}>
                <Clock size={14} />
                <span>{activeSession?.isOpen === false ? 'ĐÃ KHÓA' : `Tự đổi mã: ${formatMMSS(timeLeftSeconds)}`}</span>
              </div>
            </div>

            {/* Giant QR Code Display (280x280px) */}
            <div style={{
              position: 'relative',
              padding: '14px',
              background: '#FFFFFF',
              borderRadius: '10px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
              border: '1.5px solid #E2E8F0',
              marginBottom: '16px',
              overflow: 'hidden'
            }}>
              <img
                src={qrImageUrl}
                alt="Mã QR Điểm Danh"
                style={{
                  width: '280px',
                  height: '280px',
                  display: 'block',
                  borderRadius: '6px',
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
                  <Lock size={36} color="#ef4444" style={{ marginBottom: '6px' }} />
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                    ĐÃ KHÓA ĐIỂM DANH
                  </div>
                  <button
                    onClick={() => {
                      if (activeSession) {
                        onToggleSessionOpen(activeSession.id);
                        soundFx.playVictory();
                      }
                    }}
                    style={{
                      padding: '6px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      background: '#16A34A',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Unlock size={14} />
                    <span>Mở Lại QR</span>
                  </button>
                </div>
              )}
            </div>

            {/* Giant 6-Digit PIN Code for Manual Typing */}
            <div style={{ marginBottom: '16px', width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                MÃ PIN NHẬP TAY 6 SỐ
              </div>
              <div style={{
                fontSize: '2.4rem',
                fontWeight: 900,
                color: activeSession?.isOpen === false ? '#94A3B8' : '#2563EB',
                letterSpacing: '0.22em',
                fontFamily: 'monospace',
                lineHeight: 1.2
              }}>
                {activeSession?.isOpen === false ? 'LOCKED' : (activeSession?.qrPinCode || '------')}
              </div>
            </div>

            {/* Minimal Toolbar (Rotate, GPS, Lock) */}
            <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleRotateNow}
                style={{
                  padding: '7px 14px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#1E293B',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                title="Đổi mã QR & PIN mới ngay lập tức"
              >
                <RefreshCw size={13} />
                <span>Đổi Mã Ngay</span>
              </button>

              <button
                onClick={handleToggleGpsLock}
                disabled={isFetchingGps}
                style={{
                  padding: '7px 14px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: activeSession?.requireLocation ? '#FEF3C7' : '#F1F5F9',
                  border: activeSession?.requireLocation ? '1px solid #FCD34D' : '1px solid #CBD5E1',
                  color: activeSession?.requireLocation ? '#92400E' : '#1E293B',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                title="Giới hạn học viên điểm danh trong bán kính GPS 150m lớp học"
              >
                <MapPin size={13} />
                <span>{isFetchingGps ? 'Đang lấy GPS...' : activeSession?.requireLocation ? 'GPS: ĐANG BẬT (150m)' : 'Bật Vị Trí GPS'}</span>
              </button>

              {activeSession && (
                <button
                  onClick={() => {
                    onToggleSessionOpen(activeSession.id);
                    soundFx.playClick();
                  }}
                  style={{
                    padding: '7px 14px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    background: activeSession.isOpen !== false ? '#FEE2E2' : '#DCFCE7',
                    border: activeSession.isOpen !== false ? '1px solid #FCA5A5' : '1px solid #86EFAC',
                    color: activeSession.isOpen !== false ? '#DC2626' : '#166534',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  {activeSession.isOpen !== false ? <Lock size={13} /> : <Unlock size={13} />}
                  <span>{activeSession.isOpen !== false ? 'Khóa QR' : 'Mở QR'}</span>
                </button>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: DÒNG SỰ KIỆN HỌC VIÊN ĐIỂM DANH THÀNH CÔNG (REALTIME STREAM) */}
          <div
            style={{
              padding: '18px 20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '480px'
            }}
          >
            {/* Header with Live Stats & Counter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A', boxShadow: '0 0 8px #16A34A' }} />
                <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                  Dòng sự kiện điểm danh ({checkedInRecords.length})
                </h3>
              </div>

              <span style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '3px 9px', borderRadius: '999px' }}>
                {presentCount + makeupCount + lateCount} / {totalStudents} Có Mặt ({presentRate}%)
              </span>
            </div>

            {/* Live Stream of Checked-In Students (Newest on Top) */}
            <div style={{ flex: 1, maxHeight: '410px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '2px' }}>
              {checkedInRecords.length > 0 ? (
                checkedInRecords.map((rec, idx) => {
                  const isNewest = idx === 0;
                  const checkInOrder = checkedInRecords.length - idx;
                  return (
                    <div
                      key={rec.studentId}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        background: isNewest ? '#F0FDF4' : '#F8FAFC',
                        border: isNewest ? '1.5px solid #86EFAC' : '1px solid #E2E8F0',
                        boxShadow: isNewest ? '0 2px 8px rgba(22, 163, 74, 0.1)' : 'none',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: isNewest ? '#16A34A' : '#64748B',
                          background: isNewest ? '#DCFCE7' : '#FFFFFF',
                          border: '1px solid',
                          borderColor: isNewest ? '#86EFAC' : '#CBD5E1',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          minWidth: '28px',
                          textAlign: 'center'
                        }}>
                          #{checkInOrder}
                        </span>

                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {rec.studentName}
                            </span>
                            {isNewest && (
                              <span style={{ fontSize: '10px', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '1px 5px', borderRadius: '4px' }}>
                                ⭐ MỚI NHẤT
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748B', fontFamily: 'monospace', marginTop: '1px' }}>
                            {rec.studentCode}
                          </div>
                        </div>
                      </div>

                      {/* Check-in time & method badge */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{
                          fontSize: '11.5px',
                          fontWeight: 600,
                          color: rec.status === 'makeup' || rec.isMakeup ? '#92400E' : '#166534',
                          background: rec.status === 'makeup' || rec.isMakeup ? '#FEF3C7' : '#DCFCE7',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <CheckCircle2 size={12} />
                          <span>{rec.status === 'makeup' || rec.isMakeup ? 'HỌC BÙ' : 'ĐÃ ĐIỂM DANH'}</span>
                        </span>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          ⏱️ {rec.checkInTime || 'Vừa xong'} • {rec.checkInMethod === 'qr_scan' ? 'Quét QR' : 'Nhập PIN'}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '48px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '100%' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Radio size={24} />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                    Đang chờ học viên quét mã...
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748B', maxWidth: '280px', lineHeight: 1.4 }}>
                    Khi học viên quét QR hoặc nhập PIN 6 số trên màn hình, danh sách sẽ tự động cập nhật và đẩy học viên mới lên trên cùng.
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ─── TAB 2: DETAILED STUDENT CLASS ROSTER (FULL LIST FOR MANUAL TICK) ─── */}
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
                style={{
                  padding: '7px 14px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: '#16A34A',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle2 size={14} />
                <span>Đánh Dấu Tất Cả Có Mặt</span>
              </button>

              <button
                onClick={handleSaveCurrentSession}
                style={{
                  padding: '7px 14px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: '#2563EB',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Save size={14} />
                <span>{isSavedNotice ? 'Đã Lưu! ✓' : 'Lưu Danh Sách'}</span>
              </button>
            </div>

            <div style={{ fontSize: '13px', color: '#64748B' }}>
              Lớp: <b>{currentClassCode}</b> • Có mặt: <b>{presentCount + makeupCount + lateCount}/{totalStudents}</b> ({presentRate}%)
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>STT</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Mã HV</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Họ và Tên</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Trạng Thái</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Thời Gian</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {activeSession?.records.map((rec, idx) => (
                  <tr key={rec.studentId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 12px', color: '#64748B' }}>{idx + 1}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#2563EB' }}>{rec.studentCode}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 500, color: '#0F172A' }}>{rec.studentName}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        background: rec.status === 'present' ? '#DCFCE7' : rec.status === 'makeup' || rec.isMakeup ? '#FEF3C7' : rec.status === 'late' ? '#FEF9C3' : '#F1F5F9',
                        color: rec.status === 'present' ? '#166534' : rec.status === 'makeup' || rec.isMakeup ? '#92400E' : rec.status === 'late' ? '#854D0E' : '#64748B'
                      }}>
                        {rec.status === 'present' ? 'Có mặt' : rec.status === 'makeup' || rec.isMakeup ? 'Học bù' : rec.status === 'late' ? 'Đi muộn' : 'Vắng'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#64748B', fontSize: '12px' }}>
                      {rec.checkInTime || '--'}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button
                          onClick={() => {
                            onUpdateStatus(activeSession.id, rec.studentId, 'present', undefined, 'manual');
                            soundFx.playClick();
                          }}
                          style={{ padding: '3px 8px', borderRadius: '4px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Có mặt
                        </button>
                        <button
                          onClick={() => {
                            onUpdateStatus(activeSession.id, rec.studentId, 'absent', undefined, 'manual');
                            soundFx.playClick();
                          }}
                          style={{ padding: '3px 8px', borderRadius: '4px', background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', fontSize: '11.5px', fontWeight: 500, cursor: 'pointer' }}
                        >
                          Vắng
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: MAKEUP ATTENDANCE REPORTS ─── */}
      {activeSubTab === 'makeup_reports' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '12px' }}>
            Danh sách học viên đăng ký học bù
          </div>

          {makeupReports.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {makeupReports.map(rep => (
                <div key={rep.id} style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>{rep.studentName} ({rep.studentCode})</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Lý do: {rep.reason || 'Học bù ca khác'} • Ngày: {rep.sessionDate}</div>
                  </div>
                  {onClearMakeupReport && (
                    <button
                      onClick={() => onClearMakeupReport(rep.id)}
                      style={{ padding: '4px 10px', borderRadius: '4px', background: '#F1F5F9', border: '1px solid #CBD5E1', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Đã xử lý
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
              Không có yêu cầu học bù nào đang chờ duyệt.
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: ATTENDANCE HISTORY ─── */}
      {activeSubTab === 'history' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '12px' }}>
            Lịch sử các buổi điểm danh ({sessions.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessions.map(s => (
              <div key={s.id} style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>{s.className}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Ngày: {s.date} • Mã PIN: {s.qrPinCode}</div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => exportAttendanceExcel(s)}
                    style={{ padding: '4px 10px', borderRadius: '4px', background: '#FFFFFF', border: '1px solid #CBD5E1', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <FileSpreadsheet size={13} />
                    <span>Xuất CSV</span>
                  </button>
                  <button
                    onClick={() => onDeleteSession(s.id)}
                    style={{ padding: '4px 8px', borderRadius: '4px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#DC2626', fontSize: '12px', cursor: 'pointer' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
