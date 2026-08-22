import React, { useState } from 'react';
import { AttendanceSession } from '../../types/attendance';
import { UserProfile, TRACK_LABELS } from '../../types/auth';
import {
  QrCode, Camera, CheckCircle2, AlertCircle, Clock,
  Calendar, ShieldCheck, UserCheck, CheckCheck,
  Award, MapPin
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface StudentAttendanceDashboardProps {
  currentUser: UserProfile;
  sessions: AttendanceSession[];
  onOpenQRScanner: () => void;
  onOpenPinModal: () => void;
}

export const StudentAttendanceDashboard: React.FC<StudentAttendanceDashboardProps> = ({
  currentUser,
  sessions,
  onOpenQRScanner,
  onOpenPinModal
}) => {
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>('all');

  const studentCode = currentUser.studentCode?.trim().toLowerCase() || '';
  const studentName = currentUser.name?.trim().toLowerCase() || '';

  // Filter sessions that belong to student's enrolled tracks or where student has a record
  const studentSessions = sessions.filter(session => {
    if (selectedTrackFilter !== 'all' && session.track !== selectedTrackFilter) {
      return false;
    }

    // Is enrolled in track or has a record
    const hasRecord = session.records.some(
      r => r.studentCode.trim().toLowerCase() === studentCode ||
           r.studentName.trim().toLowerCase() === studentName ||
           r.studentId === currentUser.id
    );

    const isTrackEnrolled = session.track === currentUser.programTrack ||
      (currentUser.enrolledTracks && currentUser.enrolledTracks.includes(session.track));

    return hasRecord || isTrackEnrolled;
  });

  // Match the student's exact enrolled class and session
  const activeClassSession = studentSessions.find(s =>
    selectedTrackFilter !== 'all' ? s.track === selectedTrackFilter : s.track === currentUser.programTrack
  ) || studentSessions[0] || sessions.find(s => s.track === currentUser.programTrack) || sessions[0];

  const activeClassTitle = activeClassSession?.className || `Lớp ${activeClassSession?.classCode || 'K26'}`;
  const activeRoomName = activeClassSession?.room || 'Phòng LAB 01 (Tầng 2)';
  const activeTeacher = activeClassSession?.teacherName || 'Giảng Viên';

  // Calculate student statistics
  let totalClasses = studentSessions.length;
  let presentCount = 0;
  let makeupCount = 0;
  let lateCount = 0;
  let absentCount = 0;

  studentSessions.forEach(session => {
    const myRec = session.records.find(
      r => r.studentCode.trim().toLowerCase() === studentCode ||
           r.studentName.trim().toLowerCase() === studentName ||
           r.studentId === currentUser.id
    );

    if (!myRec) {
      absentCount++;
    } else if (myRec.status === 'present') {
      presentCount++;
    } else if (myRec.status === 'makeup' || myRec.isMakeup) {
      makeupCount++;
    } else if (myRec.status === 'late') {
      lateCount++;
    } else {
      absentCount++;
    }
  });

  const attendedTotal = presentCount + makeupCount + lateCount;
  const attendanceRate = totalClasses > 0 ? Math.round((attendedTotal / totalClasses) * 100) : 100;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%', padding: '14px 16px' }} className="animate-slide-up">
      {/* ─── 1. TOP HERO ACTION CARD ─── */}
      <div
        className="card"
        style={{
          padding: '24px 20px',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(16, 185, 129, 0.06) 100%)',
          borderRadius: '8px',
          border: '1.5px solid #2563EB',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '540px', margin: '0 auto' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 12px',
            borderRadius: '999px',
            background: '#EFF6FF',
            color: '#2563EB',
            fontSize: '0.78rem',
            fontWeight: 800,
            marginBottom: '10px'
          }}>
            <ShieldCheck size={14} />
            <span>HỌC VIÊN: {currentUser.name} ({currentUser.studentCode || 'THGZ01'})</span>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Điểm Danh Chuyên Cần Trực Tiếp Tại Lớp
          </h2>

          {/* Dedicated Classroom Info Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: '6px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#0F172A',
            margin: '6px auto 14px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <span style={{ color: '#2563EB' }}>🏫 {activeClassTitle}</span>
            <span>•</span>
            <span style={{ color: '#16A34A' }}>👨‍🏫 {activeTeacher}</span>
            <span>•</span>
            <span style={{ color: '#64748B' }}>📍 {activeRoomName}</span>
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>
            Bật camera điện thoại hoặc laptop để quét mã QR trên màn hình máy chiếu lớp học, hoặc nhập mã PIN 6 số để ghi nhận chuyên cần.
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '360px', margin: '0 auto' }}>
            <button
              onClick={() => {
                onOpenQRScanner();
                soundFx.playClick();
              }}
              className="btn btn-primary"
              style={{
                padding: '13px 20px',
                fontSize: '0.95rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '6px',
                background: '#2563EB',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
              }}
            >
              <Camera size={19} />
              <span>Bật Camera Quét Mã QR</span>
            </button>

            <button
              onClick={() => {
                onOpenPinModal();
                soundFx.playClick();
              }}
              className="btn btn-secondary"
              style={{
                padding: '10px 18px',
                fontSize: '0.86rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                borderRadius: '6px'
              }}
            >
              <QrCode size={16} />
              <span>Nhập Mã PIN 6 Số Thủ Công</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. ATTENDANCE STATS OVERVIEW ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        <div className="card" style={{ padding: '14px', textAlign: 'center', borderTop: '4px solid var(--brand)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>CHUYÊN CẦN</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--brand)', margin: '2px 0' }}>
            {attendanceRate}%
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            {attendedTotal}/{totalClasses} buổi
          </div>
        </div>

        <div className="card" style={{ padding: '14px', textAlign: 'center', borderTop: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>CÓ MẶT</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', margin: '2px 0' }}>
            {presentCount}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Đúng giờ</div>
        </div>

        <div className="card" style={{ padding: '14px', textAlign: 'center', borderTop: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>HỌC BÙ</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f59e0b', margin: '2px 0' }}>
            {makeupCount}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Đã bù buổi vắng</div>
        </div>

        <div className="card" style={{ padding: '14px', textAlign: 'center', borderTop: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>VẮNG MẶT</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ef4444', margin: '2px 0' }}>
            {absentCount}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Cần xin học bù</div>
        </div>
      </div>

      {/* ─── 3. MY ATTENDANCE HISTORY LIST ─── */}
      <div className="card" style={{ padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--brand)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Lịch Sử Điểm Danh Của Tôi
            </h3>
          </div>

          {/* Filter if student is enrolled in multiple tracks */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Môn học:</span>
            <select
              value={selectedTrackFilter}
              onChange={e => setSelectedTrackFilter(e.target.value)}
              style={{
                padding: '4px 10px',
                fontSize: '0.76rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: '1px solid var(--border-color)'
              }}
            >
              <option value="all">Tất cả môn học</option>
              {currentUser.enrolledTracks && currentUser.enrolledTracks.length > 0 ? (
                currentUser.enrolledTracks.map(t => (
                  <option key={t} value={t}>{TRACK_LABELS[t] || t}</option>
                ))
              ) : currentUser.programTrack ? (
                <option value={currentUser.programTrack}>{TRACK_LABELS[currentUser.programTrack] || currentUser.programTrack}</option>
              ) : null}
            </select>
          </div>
        </div>

        {studentSessions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {studentSessions.map((session, idx) => {
              const myRec = session.records.find(
                r => r.studentCode.trim().toLowerCase() === studentCode ||
                     r.studentName.trim().toLowerCase() === studentName ||
                     r.studentId === currentUser.id
              );

              const isPresent = myRec && myRec.status === 'present';
              const isMakeup = myRec && (myRec.status === 'makeup' || myRec.isMakeup);
              const isLate = myRec && myRec.status === 'late';
              const isAbsent = !myRec || myRec.status === 'absent';

              return (
                <div
                  key={session.id || idx}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: isPresent
                      ? 'rgba(16, 185, 129, 0.05)'
                      : isMakeup
                        ? 'rgba(245, 158, 11, 0.06)'
                        : isLate
                          ? 'rgba(217, 119, 6, 0.05)'
                          : 'rgba(239, 68, 68, 0.04)',
                    border: isPresent
                      ? '1px solid rgba(16, 185, 129, 0.25)'
                      : isMakeup
                        ? '1px solid rgba(245, 158, 11, 0.3)'
                        : isLate
                          ? '1px solid rgba(217, 119, 6, 0.25)'
                          : '1px solid rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  {/* Left: Class & Date Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: isPresent
                        ? 'rgba(16, 185, 129, 0.15)'
                        : isMakeup
                          ? 'rgba(245, 158, 11, 0.15)'
                          : isLate
                            ? 'rgba(217, 119, 6, 0.15)'
                            : 'rgba(239, 68, 68, 0.12)',
                      color: isPresent
                        ? '#10b981'
                        : isMakeup
                          ? '#f59e0b'
                          : isLate
                            ? '#d97706'
                            : '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isPresent ? <CheckCircle2 size={22} /> : isMakeup ? <Award size={22} /> : isLate ? <Clock size={22} /> : <AlertCircle size={22} />}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {session.className || `Lớp ${session.classCode} - ${TRACK_LABELS[session.track] || session.track}`}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span>📅 {session.date}</span>
                        <span>⏰ {session.startTime || '08:00'}</span>
                        <span>👨‍🏫 GV: {session.teacherName}</span>
                        {session.room && (
                          <span style={{ color: 'var(--brand)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <MapPin size={11} />
                            <span>{session.room}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Attendance Result Badge */}
                  <div style={{ textAlign: 'right' }}>
                    {isPresent && (
                      <div>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          fontSize: '0.76rem',
                          fontWeight: 800
                        }}>
                          <CheckCheck size={14} />
                          <span>ĐÃ ĐIỂM DANH</span>
                        </span>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                          Lúc {myRec.checkInTime} ({myRec.checkInMethod === 'qr_scan' ? 'Quét QR' : myRec.checkInMethod === 'pin_code' ? 'Mã PIN' : 'GV chấm'})
                        </div>
                      </div>
                    )}

                    {isMakeup && (
                      <div>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#f59e0b',
                          fontSize: '0.76rem',
                          fontWeight: 800
                        }}>
                          <UserCheck size={14} />
                          <span>HỌC BÙ (VẮNG BÙ)</span>
                        </span>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                          Lúc {myRec?.checkInTime || '--:--'} • Báo cáo Admin ✓
                        </div>
                      </div>
                    )}

                    {isLate && (
                      <div>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          background: 'rgba(217, 119, 6, 0.15)',
                          color: '#d97706',
                          fontSize: '0.76rem',
                          fontWeight: 800
                        }}>
                          <Clock size={14} />
                          <span>ĐI TRỄ</span>
                        </span>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                          Lúc {myRec?.checkInTime}
                        </div>
                      </div>
                    )}

                    {isAbsent && (
                      <div>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          background: 'rgba(239, 68, 68, 0.12)',
                          color: '#ef4444',
                          fontSize: '0.76rem',
                          fontWeight: 800
                        }}>
                          <AlertCircle size={14} />
                          <span>CHƯA ĐIỂM DANH</span>
                        </span>
                        <div style={{ fontSize: '0.68rem', color: '#ef4444', marginTop: '3px' }}>
                          Vắng mặt
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-muted)' }}>
            <Calendar size={36} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Chưa có dữ liệu buổi học nào cho lớp của bạn.</div>
            <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>Các buổi học sẽ tự động xuất hiện ở đây khi Giảng viên tạo buổi điểm danh.</div>
          </div>
        )}
      </div>
    </div>
  );
};
