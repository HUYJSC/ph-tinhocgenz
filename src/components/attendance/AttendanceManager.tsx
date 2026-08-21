import React, { useState, useEffect } from 'react';
import { AttendanceSession, AttendanceStatus, MakeupAttendanceReport } from '../../types/attendance';
import { UserProfile, CurriculumTrack, TRACK_LABELS, StudentAccount } from '../../types/auth';
import { TRACK_CLASS_CODES } from '../../hooks/useAttendanceStorage';
import {
  QrCode, CheckCircle2, Clock, RefreshCw,
  FileSpreadsheet, Trash2, Save, Users, Calendar,
  ShieldCheck, CheckCheck, Lock, Unlock, UserCheck, AlertTriangle,
  Wifi, MapPin, Smartphone
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { getClientIp, getCurrentCoordinates } from '../../utils/securityUtils';

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

const INTERVAL_OPTIONS = [
  { value: 120, label: '2 Phút (Chuẩn - Khuyến nghị)' },
  { value: 60,  label: '1 Phút (Nhanh)' },
  { value: 30,  label: '30 Giây (Siêu tốc)' },
  { value: 300, label: '5 Phút (Thoải mái)' }
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
  const [rotationInterval, setRotationInterval] = useState<number>(120); // 2 minutes default
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(120);
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [isFetchingIp, setIsFetchingIp] = useState(false);
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
      if (activeSession.intervalSeconds) {
        setRotationInterval(activeSession.intervalSeconds);
      }
    }
  }, [activeSession, selectedSessionId, selectedTrack, onCreateSession, currentUser]);

  // Dynamic countdown timer (Default 2 minutes / 120s)
  useEffect(() => {
    if (!activeSession || !activeSession.qrExpiresAt) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((activeSession.qrExpiresAt! - Date.now()) / 1000));
      setTimeLeftSeconds(remaining);

      // Auto rotate when timer expires
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

  const handleIntervalChange = (newInterval: number) => {
    setRotationInterval(newInterval);
    if (activeSession) {
      onRotateQR(activeSession.id, newInterval);
      if (onUpdateSessionSecurity) {
        onUpdateSessionSecurity(activeSession.id, { intervalSeconds: newInterval });
      }
    }
    soundFx.playClick();
  };

  // Toggle IP Network Lock (Chỉ cho phép cùng mạng WiFi phòng học)
  const handleToggleIpLock = async () => {
    if (!activeSession || !onUpdateSessionSecurity) return;
    setIsFetchingIp(true);
    try {
      if (activeSession.requireSameIp) {
        onUpdateSessionSecurity(activeSession.id, { requireSameIp: false });
        soundFx.playClick();
      } else {
        const ip = await getClientIp();
        onUpdateSessionSecurity(activeSession.id, { requireSameIp: true, teacherIp: ip });
        soundFx.playVictory();
        alert(`🛡️ ĐÃ BẬT KHÓA IP PHÒNG HỌC!\nIP Giáo viên ghi nhận: ${ip}\nChỉ sinh viên kết nối cùng mạng WiFi phòng học mới có thể điểm danh!`);
      }
    } catch (e: any) {
      alert('Không thể lấy IP mạng hiện tại: ' + (e?.message || 'Lỗi kết nối'));
    } finally {
      setIsFetchingIp(false);
    }
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
        alert(`📍 ĐÃ KHÓA VỊ TRÍ PHÒNG HỌC (GPS)!\nTọa độ: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}\nBán kính hợp lệ: 150 mét xung quanh lớp học.`);
      }
    } catch (e: any) {
      alert('Không thể lấy vị trí GPS: ' + (e?.message || 'Vui lòng cấp quyền vị trí trên trình duyệt.'));
    } finally {
      setIsFetchingGps(false);
    }
  };

  // Toggle Multi-device Anti-fraud Lock
  const handleToggleMultiDevice = () => {
    if (!activeSession || !onUpdateSessionSecurity) return;
    const nextVal = activeSession.preventMultiCheckIn === false ? true : false;
    onUpdateSessionSecurity(activeSession.id, { preventMultiCheckIn: nextVal });
    soundFx.playClick();
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
      'Địa Chỉ IP',
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
        escapeCsv(rec.clientIp || '--'),
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

  // Compute live statistics
  const totalStudents = activeSession?.records.length || 0;
  const presentCount = activeSession?.records.filter(r => r.status === 'present').length || 0;
  const makeupCount = activeSession?.records.filter(r => r.status === 'makeup' || r.isMakeup).length || 0;
  const lateCount = activeSession?.records.filter(r => r.status === 'late').length || 0;
  const absentCount = activeSession?.records.filter(r => r.status === 'absent').length || 0;
  const presentRate = totalStudents > 0 ? Math.round(((presentCount + makeupCount + lateCount) / totalStudents) * 100) : 0;

  // QR Code Deep Link URL with dynamic 2-minute rolling code
  const currentClassCode = activeSession?.classCode || TRACK_CLASS_CODES[selectedTrack]?.classCode || 'K26';
  const qrCheckInUrl = activeSession
    ? `https://hoctructuyen.tinhocgenz.io.vn/?action=checkin&track=${activeSession.track}&class=${currentClassCode}&pin=${activeSession.qrPinCode}&token=${activeSession.qrToken}`
    : 'https://hoctructuyen.tinhocgenz.io.vn';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(qrCheckInUrl)}`;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '14px 16px' }} className="animate-slide-up">
      {/* Header Bar */}
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
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            Điểm Danh QR Chống Gian Lận
          </h2>
          <span style={{
            fontSize: '0.68rem',
            background: activeSession?.isOpen !== false ? '#10b981' : '#ef4444',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fff' }} />
            {activeSession?.isOpen !== false ? 'ĐANG MỞ' : 'ĐÃ KHÓA'}
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
              title={activeSession.isOpen !== false ? 'Bấm để khóa điểm danh' : 'Bấm để mở lại điểm danh'}
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

      {/* Class & Teacher Details Bar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        flexWrap: 'wrap',
        background: 'var(--bg-card)',
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '260px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} color="var(--brand)" />
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
              maxWidth: '380px',
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

        {/* Teacher & Class Info Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
          <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(79, 110, 247, 0.1)', color: 'var(--brand)', fontWeight: 800, fontFamily: 'monospace' }}>
            MÃ LỚP: {currentClassCode}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>
            👨‍🏫 {activeSession?.teacherName || 'Thầy Quang Huy'}
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="horizontal-scroll" style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '14px' }}>
        {[
          { id: 'qr_mode',        label: 'Mã QR Trực Tiếp (2 Phút)', icon: QrCode },
          { id: 'manual_list',    label: `Danh Sách Lớp & IP (${totalStudents})`, icon: CheckCheck },
          { id: 'makeup_reports', label: `Báo Cáo Học Bù (${makeupReports.length})`, icon: UserCheck },
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
              {tab.id === 'makeup_reports' && makeupReports.length > 0 && (
                <span style={{ background: '#f59e0b', color: '#fff', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>
                  {makeupReports.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: DYNAMIC QR CODE DISPLAY ─── */}
      {activeSubTab === 'qr_mode' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
          {/* Left: QR Display Card */}
          <div className="card" style={{ padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(79, 110, 247, 0.08)', color: 'var(--brand)', fontSize: '0.74rem', fontWeight: 800, marginBottom: '10px' }}>
              <ShieldCheck size={14} />
              <span>LỚP {currentClassCode} • {TRACK_LABELS[selectedTrack] || selectedTrack}</span>
            </div>

            {/* Countdown / Locked Status Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: activeSession?.isOpen === false
                ? 'rgba(239, 68, 68, 0.12)'
                : 'rgba(16, 185, 129, 0.1)',
              color: activeSession?.isOpen === false
                ? '#ef4444'
                : '#10b981',
              fontSize: '0.92rem',
              fontWeight: 900,
              marginBottom: '12px',
              border: activeSession?.isOpen === false
                ? '1px solid rgba(239, 68, 68, 0.35)'
                : '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              {activeSession?.isOpen === false ? (
                <>
                  <Lock size={16} />
                  <span>ĐÃ KHÓA ĐIỂM DANH</span>
                </>
              ) : (
                <>
                  <Clock size={16} />
                  <span>Đổi mã sau: {formatMMSS(timeLeftSeconds)}</span>
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
                  width: '220px', height: '220px', display: 'block', borderRadius: '8px',
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
                MÃ PIN 6 SỐ TRỰC TIẾP
              </div>
              <div style={{
                fontSize: '1.9rem',
                fontWeight: 900,
                color: activeSession?.isOpen === false ? 'var(--text-muted)' : 'var(--brand)',
                letterSpacing: '0.2em',
                fontFamily: 'var(--font-mono)',
                marginTop: '2px'
              }}>
                {activeSession?.isOpen === false ? 'LOCKED' : (activeSession?.qrPinCode || '------')}
              </div>
            </div>

            {/* Controls: Select Rotation Interval & Manual Refresh */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-muted)', justifyContent: 'center' }}>
                <span>Chu kỳ đổi mã:</span>
                <select
                  value={rotationInterval}
                  onChange={e => handleIntervalChange(Number(e.target.value))}
                  style={{ padding: '4px 8px', fontSize: '0.74rem', borderRadius: '6px', fontWeight: 700 }}
                >
                  {INTERVAL_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleRotateNow}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '7px 12px', fontSize: '0.78rem', fontWeight: 700, gap: '6px' }}
              >
                <RefreshCw size={13} />
                <span>Đổi Mã Ngay Lập Tức</span>
              </button>
            </div>
          </div>

          {/* Right: Live Anti-Fraud Dashboard & Stats Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div className="card" style={{ padding: '12px', borderLeft: '4px solid #10b981' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>CÓ MẶT</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>{presentCount}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{presentRate}% chuyên cần</div>
              </div>

              <div className="card" style={{ padding: '12px', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>HỌC BÙ</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b' }}>{makeupCount}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Vắng bù từ lớp khác</div>
              </div>

              <div className="card" style={{ padding: '12px', borderLeft: '4px solid #ef4444' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>VẮNG</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ef4444' }}>{absentCount}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Tổng {totalStudents} học viên</div>
              </div>
            </div>

            {/* Anti-Fraud Security Control Center */}
            <div className="card" style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="var(--brand)" />
                  <span>Bộ Lọc Chống Điểm Danh Hộ Từ Xa</span>
                </h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                  3 Lớp Bảo Mật
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* 1. IP / WiFi Lock */}
                <div style={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: activeSession?.requireSameIp ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-secondary)',
                  border: activeSession?.requireSameIp ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wifi size={16} color={activeSession?.requireSameIp ? '#10b981' : 'var(--text-muted)'} />
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Khóa Mạng WiFi Phòng Học (IP)
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {activeSession?.requireSameIp ? `Đang khóa theo IP: ${activeSession.teacherIp}` : 'Bắt buộc SV phải kết nối cùng WiFi phòng học'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleIpLock}
                    disabled={isFetchingIp}
                    className={`btn ${activeSession?.requireSameIp ? 'btn-success' : 'btn-secondary'}`}
                    style={{ padding: '5px 10px', fontSize: '0.72rem', fontWeight: 700 }}
                  >
                    {isFetchingIp ? 'Đang lấy IP...' : activeSession?.requireSameIp ? 'ĐANG BẬT' : 'BẬT KHÓA IP'}
                  </button>
                </div>

                {/* 2. Device Lock */}
                <div style={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: activeSession?.preventMultiCheckIn !== false ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-secondary)',
                  border: activeSession?.preventMultiCheckIn !== false ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Smartphone size={16} color={activeSession?.preventMultiCheckIn !== false ? '#3b82f6' : 'var(--text-muted)'} />
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Chống 1 Máy Điểm Danh Nhiều Người
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        Chặn sinh viên mượn máy hoặc log in hộ bạn bè
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleMultiDevice}
                    className={`btn ${activeSession?.preventMultiCheckIn !== false ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '5px 10px', fontSize: '0.72rem', fontWeight: 700 }}
                  >
                    {activeSession?.preventMultiCheckIn !== false ? 'ĐANG BẬT' : 'TẮT'}
                  </button>
                </div>

                {/* 3. GPS Geofencing Lock */}
                <div style={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: activeSession?.requireLocation ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-secondary)',
                  border: activeSession?.requireLocation ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} color={activeSession?.requireLocation ? '#f59e0b' : 'var(--text-muted)'} />
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Định Vị GPS Lớp Học (&le; 150m)
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {activeSession?.requireLocation ? 'Đã ghim tọa độ phòng học' : 'Chặn SV ở nhà hoặc ngoài bán kính'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleGpsLock}
                    disabled={isFetchingGps}
                    className={`btn ${activeSession?.requireLocation ? 'btn-warning' : 'btn-secondary'}`}
                    style={{ padding: '5px 10px', fontSize: '0.72rem', fontWeight: 700 }}
                  >
                    {isFetchingGps ? 'Đang lấy GPS...' : activeSession?.requireLocation ? 'ĐANG BẬT' : 'BẬT GPS'}
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setActiveSubTab('manual_list')}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '7px 12px', fontSize: '0.78rem', fontWeight: 700, gap: '6px' }}
                >
                  <CheckCheck size={14} />
                  <span>Xem Chi Tiết IP & Chấm Tay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: DETAILED STUDENT CLASS ROSTER ─── */}
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
              Lớp: <b>{currentClassCode}</b> • Có mặt: <b>{presentCount + makeupCount + lateCount}/{totalStudents}</b> ({presentRate}%)
            </div>
          </div>

          {/* Detailed Student Roster Table */}
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
                    <th style={{ padding: '10px 12px', minWidth: '120px' }}>Thời Điểm & IP</th>
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
                              <div>
                                <span style={{ color: '#10b981', fontWeight: 700 }}>
                                  {rec.checkInTime} ({rec.checkInMethod === 'qr_scan' ? 'QR' : rec.checkInMethod === 'pin_code' ? 'PIN' : 'Tay'})
                                </span>
                                {rec.clientIp && (
                                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                    IP: {rec.clientIp}
                                  </div>
                                )}
                              </div>
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

      {/* ─── TAB 3: MAKEUP ATTENDANCE REPORTS (Gửi Admin) ─── */}
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
              <b>Báo Cáo Tự Động Về Admin:</b> Khi sinh viên thuộc lớp khác quét QR hoặc được giáo viên đánh dấu <b>HỌC BÙ</b>, hệ thống sẽ tự động tổng hợp danh sách gửi về Ban Quản Trị để theo dõi chuyên cần và bảo lưu buổi học.
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
                    <th style={{ padding: '10px 12px' }}>Lớp Đi Học Bù</th>
                    <th style={{ padding: '10px 12px' }}>Giáo Viên Dạy Bù</th>
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
