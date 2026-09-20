import React, { useState, useEffect } from 'react';
import {
  QrCode, MapPin, RefreshCw, CheckCircle2,
  AlertTriangle, Download, Users, Compass,
  Radio, ChevronRight
} from 'lucide-react';
import { AttendanceSession, AttendanceStatus } from '../../types/attendance';
import { ClassScheduleItem } from '../../types/schedule';
import { StudentAccount, UserProfile } from '../../types/auth';
import { soundFx } from '../../utils/audio';

export interface TeacherQRGeoAttendanceProps {
  currentUser?: UserProfile;
  sessions?: AttendanceSession[];
  schedules?: ClassScheduleItem[];
  studentAccounts?: StudentAccount[];
  onRotateQR?: (sessionId: string) => void;
  onUpdateStatus?: (sessionId: string, studentId: string, status: AttendanceStatus) => void;
  onToggleSessionOpen?: (sessionId: string, isOpen: boolean) => void;
  onBackToDashboard?: () => void;
}

export const TeacherQRGeoAttendance: React.FC<TeacherQRGeoAttendanceProps> = ({
  currentUser,
  sessions = [],
  onRotateQR,
  onUpdateStatus,
  onBackToDashboard
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(() => sessions[0]?.id || 'session-default');
  const [countdown, setCountdown] = useState<number>(15);
  const [geofenceRadius, setGeofenceRadius] = useState<number>(50); // meters
  const [isLocationEnforced, setIsLocationEnforced] = useState<boolean>(true);
  const [classroomCoords, setClassroomCoords] = useState<{ lat: number; lng: number }>({
    lat: 10.7769,
    lng: 106.7009 // Trung tâm TINHOCGENZ Lab
  });
  const [qrPin, setQrPin] = useState<string>('849201');
  const [searchStudent, setSearchStudent] = useState<string>('');

  // Find active session or construct a mock one if empty
  const activeSession = sessions.find(s => s.id === selectedSessionId) || sessions[0] || {
    id: 'session-live',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '11:00',
    track: 'office-fast-3in1',
    classCode: 'K26-WE01',
    className: 'Word, Excel, PowerPoint 3-in-1 (Sáng T7 - CN)',
    teacherId: currentUser?.id || 't1',
    teacherName: currentUser?.name || 'Thầy Đình Huy',
    room: 'Phòng Lab Thực Hành 01',
    qrToken: 'GENZ-QR-' + Date.now(),
    isOpen: true,
    records: [
      {
        studentId: 's1',
        studentCode: 'HV2601',
        studentName: 'Trần Văn Bảo',
        status: 'present',
        checkInMethod: 'qr_scan',
        checkInTime: '08:04:12',
        distanceMeters: 4.2,
        gpsAccuracy: 3.5,
        riskScore: 5
      },
      {
        studentId: 's2',
        studentCode: 'HV2602',
        studentName: 'Nguyễn Thị Mai',
        status: 'present',
        checkInMethod: 'qr_scan',
        checkInTime: '08:06:45',
        distanceMeters: 8.1,
        gpsAccuracy: 4.0,
        riskScore: 8
      },
      {
        studentId: 's3',
        studentCode: 'HV2603',
        studentName: 'Lê Minh Khang',
        status: 'need_verification',
        checkInMethod: 'qr_scan',
        checkInTime: '08:14:02',
        distanceMeters: 62.5,
        gpsAccuracy: 15.0,
        riskScore: 78,
        fraudFlags: ['OUTSIDE_GEOFENCE']
      },
      {
        studentId: 's4',
        studentCode: 'HV2604',
        studentName: 'Phạm Hồng Nhung',
        status: 'absent',
        checkInMethod: 'manual'
      }
    ]
  } as AttendanceSession;

  // Countdown timer for rotating QR (15 seconds cycle)
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Generate new token & pin
          setQrPin(Math.floor(100000 + Math.random() * 900000).toString());
          if (onRotateQR && activeSession) {
            onRotateQR(activeSession.id);
          }
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSession, onRotateQR]);

  const handleGetCurrentLocation = () => {
    soundFx.playClick();
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setClassroomCoords({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6))
          });
          soundFx.playCorrect();
          alert(`Đã cập nhật tọa độ tâm phòng học theo GPS thực tế: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        },
        _err => {
          alert('Không thể lấy tọa độ GPS của thiết bị. Vui lòng cho phép quyền truy cập vị trí trong trình duyệt.');
        }
      );
    }
  };

  const records = activeSession.records || [];
  const presentCount = records.filter(r => r.status === 'present').length;
  const lateCount = records.filter(r => r.status === 'late').length;
  const flaggedCount = records.filter(r => r.status === 'need_verification' || (r.riskScore && r.riskScore > 50)).length;
  const absentCount = records.filter(r => r.status === 'absent').length;

  const handleOverrideStatus = (studentId: string, newStatus: AttendanceStatus) => {
    soundFx.playCorrect();
    if (onUpdateStatus) {
      onUpdateStatus(activeSession.id, studentId, newStatus);
    } else {
      const rec = activeSession.records.find(r => r.studentId === studentId);
      if (rec) {
        rec.status = newStatus;
        if (newStatus === 'present') {
          rec.riskScore = 0;
          rec.fraudFlags = [];
        }
      }
    }
  };

  const handleExportCSV = () => {
    soundFx.playClick();
    const csvContent = `Mã Học Viên,Họ và Tên,Thời Gian,Phương Thức,Khoảng Cách (m),Rủi Ro,Trạng Thái\n` +
      records.map(r => `"${r.studentCode}","${r.studentName}","${r.checkInTime || 'Chưa điểm danh'}","${r.checkInMethod}","${r.distanceMeters || 'N/A'}","${r.riskScore || 0}%","${r.status}"`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Diem_Danh_${activeSession.classCode}_${activeSession.date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Giảng Viên</span>
            <ChevronRight size={14} color="#94a3b8" />
            <span style={{ fontSize: '13px', color: '#0057B8', fontWeight: 600 }}>Điểm Danh QR & Geofencing</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <QrCode size={28} color="#0057B8" />
            Điểm Danh Thông Minh QR Động & Định Vị GPS
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748B' }}>
            Bảo vệ chống gian lận check-in chéo, mã QR tự xoay 15 giây và khoanh vùng phòng học bán kính {geofenceRadius}m.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {sessions.length > 1 && (
            <select
              value={activeSession.id}
              onChange={e => setSelectedSessionId(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0F172A',
                cursor: 'pointer'
              }}
            >
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.classCode} — {s.className}
                </option>
              ))}
            </select>
          )}

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ← Bảng điều khiển
            </button>
          )}

          <button
            onClick={handleExportCSV}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#0057B8',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={14} />
            Xuất file CSV
          </button>
        </div>
      </div>

      {/* Grid: Left Column (Live Dynamic QR & Geofence Settings) + Right Column (Live Student Feed) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 420px) 1fr', gap: '24px' }}>
        {/* Left Column: QR Code Stage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main QR Card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0057B8', background: '#EFF6FF', padding: '4px 10px', borderRadius: '20px' }}>
                {activeSession.classCode} • {activeSession.room || 'Phòng LAB 01'}
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#15803D'
              }}>
                <Radio size={12} color="#15803D" style={{ animation: 'pulse 1.5s infinite' }} />
                Đang mở
              </span>
            </div>

            {/* QR Code Container */}
            <div style={{
              margin: '0 auto 16px',
              width: '240px',
              height: '240px',
              background: '#FFFFFF',
              padding: '12px',
              borderRadius: '12px',
              border: '2px dashed #0057B8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {/* Dynamic QR Illustration */}
              <div style={{
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at center, #EFF6FF 0%, #FFFFFF 70%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <QrCode size={160} color="#0057B8" />
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginTop: '6px' }}>
                  Quét bằng Camera điện thoại
                </div>
              </div>

              {/* Rotating token badge */}
              <div style={{
                position: 'absolute',
                bottom: '10px',
                background: '#0F172A',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <RefreshCw size={11} style={{ animation: 'spin 4s linear infinite' }} />
                Đổi mã sau: {countdown}s
              </div>
            </div>

            {/* Backup PIN */}
            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>
                MÃ PIN DỰ PHÒNG (NẾU CAMERA LỖI)
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '6px', color: '#0057B8' }}>
                {qrPin}
              </div>
            </div>

            {/* Progress Bar for Countdown */}
            <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${(countdown / 15) * 100}%`,
                height: '100%',
                background: countdown < 4 ? '#EF4444' : '#0057B8',
                transition: 'width 1s linear'
              }} />
            </div>
          </div>

          {/* Geofence & Anti-Cheat Settings */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={18} color="#0057B8" />
              Thiết Lập Geofence Phòng Học
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  <span>Bán kính cho phép check-in:</span>
                  <span style={{ color: '#0057B8', fontWeight: 700 }}>{geofenceRadius} mét</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={geofenceRadius}
                  onChange={e => setGeofenceRadius(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#0057B8' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8' }}>
                  <span>5m (Chỉ trong phòng)</span>
                  <span>50m (Khuôn viên)</span>
                  <span>200m</span>
                </div>
              </div>

              {/* Coordinates Pill */}
              <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}>
                <div style={{ color: '#64748B', fontWeight: 600, marginBottom: '2px' }}>Tọa độ tâm phòng học:</div>
                <div style={{ color: '#0F172A', fontFamily: 'monospace', fontWeight: 600 }}>
                  {classroomCoords.lat}, {classroomCoords.lng}
                </div>
              </div>

              <button
                onClick={handleGetCurrentLocation}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #0057B8',
                  background: '#EFF6FF',
                  color: '#0057B8',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <MapPin size={14} />
                Lấy tọa độ vị trí hiện tại của tôi
              </button>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155', cursor: 'pointer', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  checked={isLocationEnforced}
                  onChange={e => setIsLocationEnforced(e.target.checked)}
                  style={{ accentColor: '#0057B8', width: '16px', height: '16px' }}
                />
                <span>Bắt buộc định vị GPS khi điểm danh</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Real-time Check-in Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Stats Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px'
          }}>
            <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>CÓ MẶT</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#15803D' }}>{presentCount}</div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>ĐI MUỘN</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#D97706' }}>{lateCount}</div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>CẢNH BÁO GPS</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#DC2626' }}>{flaggedCount}</div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>VẮNG MẶT</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#64748B' }}>{absentCount}</div>
            </div>
          </div>

          {/* Student Check-in Table */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#0057B8" />
                Danh Sách Điểm Danh Lớp ({records.length} học viên)
              </h3>
              <input
                type="text"
                placeholder="Lọc tên / mã học viên..."
                value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '10px 16px' }}>Học Viên</th>
                  <th style={{ padding: '10px 16px' }}>Thời Gian</th>
                  <th style={{ padding: '10px 16px' }}>Khoảng Cách</th>
                  <th style={{ padding: '10px 16px' }}>Trạng Thái</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {records
                  .filter(r => (r.studentName || '').toLowerCase().includes(searchStudent.toLowerCase()) || (r.studentCode || '').toLowerCase().includes(searchStudent.toLowerCase()))
                  .map((rec, idx) => {
                    const isFraudRisk = rec.riskScore && rec.riskScore > 50;
                    return (
                      <tr key={rec.studentId || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>{rec.studentName}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{rec.studentCode}</div>
                        </td>

                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                          {rec.checkInTime || '—'}
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          {typeof rec.distanceMeters === 'number' ? (
                            <span style={{
                              fontWeight: 600,
                              color: rec.distanceMeters <= geofenceRadius ? '#15803D' : '#DC2626'
                            }}>
                              {rec.distanceMeters}m
                            </span>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>—</span>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          {rec.status === 'present' ? (
                            <span style={{ background: '#DCFCE7', color: '#15803D', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={12} /> Có mặt
                            </span>
                          ) : rec.status === 'need_verification' || isFraudRisk ? (
                            <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <AlertTriangle size={12} /> Ngoài vùng GPS
                            </span>
                          ) : (
                            <span style={{ background: '#F1F5F9', color: '#64748B', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                              Vắng mặt
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            {rec.status !== 'present' && (
                              <button
                                onClick={() => handleOverrideStatus(rec.studentId, 'present')}
                                title="Xác nhận có mặt (Override)"
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  background: '#DCFCE7',
                                  border: '1px solid #86EFAC',
                                  color: '#15803D',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Duyệt
                              </button>
                            )}

                            {rec.status !== 'absent' && (
                              <button
                                onClick={() => handleOverrideStatus(rec.studentId, 'absent')}
                                title="Đánh dấu vắng"
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  background: '#FEE2E2',
                                  border: '1px solid #FCA5A5',
                                  color: '#DC2626',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Vắng
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

