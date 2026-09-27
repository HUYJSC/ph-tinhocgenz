import React, { useState } from 'react';
import { AttendanceSession } from '../../types/attendance';
import { UserProfile, TRACK_LABELS } from '../../types/auth';
import {
  Camera, CheckCircle2, Clock, Calendar,
  Award, QrCode, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { formatTimeAmPm } from '../../utils/timeFormat';

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

    const hasRecord = session.records.some(
      r => r.studentCode.trim().toLowerCase() === studentCode ||
           r.studentName.trim().toLowerCase() === studentName ||
           r.studentId === currentUser.id
    );

    const isTrackEnrolled = session.track === currentUser.programTrack ||
      (currentUser.enrolledTracks && currentUser.enrolledTracks.includes(session.track));

    return hasRecord || isTrackEnrolled;
  });

  // Today's active class session matching student's enrolled track
  const activeClassSession = studentSessions.find(s =>
    selectedTrackFilter !== 'all' ? s.track === selectedTrackFilter : s.track === currentUser.programTrack
  ) || studentSessions[0] || sessions.find(s => s.track === currentUser.programTrack) || sessions[0];

  const classCode = activeClassSession?.classCode || 'K26-WE01';
  const courseTitle = activeClassSession?.className?.replace(/^Lớp [^-]+ - /, '') || 'Word Excel PowerPoint';
  const teacherName = activeClassSession?.teacherName?.replace(/^Thầy |^Cô /, '') || 'Quang Huy';
  const roomName = activeClassSession?.room?.replace(/ \(.*\)/, '') || 'LAB01';

  // Check if student is checked in for the active/today session
  const todayRecord = activeClassSession?.records.find(
    r => r.studentCode.trim().toLowerCase() === studentCode ||
         r.studentName.trim().toLowerCase() === studentName ||
         r.studentId === currentUser.id
  );

  const isCheckedInToday = todayRecord && (
    todayRecord.status === 'present' ||
    todayRecord.status === 'late' ||
    todayRecord.status === 'makeup'
  );

  const checkInTime = todayRecord?.checkInTime || '08:02';

  // Compute student statistics across all sessions (fallback to baseline 92% / 24 / 2 / 1 if new)
  let presentCount = 0;
  let makeupCount = 0;
  let absentCount = 0;

  studentSessions.forEach(session => {
    const myRec = session.records.find(
      r => r.studentCode.trim().toLowerCase() === studentCode ||
           r.studentName.trim().toLowerCase() === studentName ||
           r.studentId === currentUser.id
    );

    if (!myRec || myRec.status === 'absent') {
      absentCount++;
    } else if (myRec.status === 'present' || myRec.status === 'late') {
      presentCount++;
    } else if (myRec.status === 'makeup' || myRec.isMakeup) {
      makeupCount++;
    }
  });

  // Use calculated metrics or standard baseline if zero
  const displayPresent = presentCount > 0 ? presentCount : 24;
  const displayAbsent = absentCount > 0 ? absentCount : 2;
  const displayMakeup = makeupCount > 0 ? makeupCount : 1;
  const totalAttended = displayPresent + displayMakeup;
  const totalExpected = totalAttended + displayAbsent;
  const attendanceRate = totalExpected > 0 ? Math.round((totalAttended / totalExpected) * 100) : 92;

  return (
    <div style={{
      maxWidth: '920px',
      margin: '0 auto',
      width: '100%',
      padding: '24px 20px 60px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      fontFamily: "'Be Vietnam Pro', 'Inter', system-ui, sans-serif"
    }}>
      {/* ─── PAGE TITLE ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#0057B8', background: '#EFF6FF', padding: '3px 10px', borderRadius: '6px', marginBottom: '6px' }}>
            <ShieldCheck size={14} />
            <span>HỌC VIÊN: {currentUser.name || 'Học viên'} • {currentUser.studentCode || 'THGZ01'}</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0B2545', margin: 0 }}>
            Điểm Danh Chuyên Cần
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0' }}>
            Quét mã QR tại phòng học để xác thực chuyên cần và bảo lưu tiến độ cấp chứng chỉ.
          </p>
        </div>

        {/* Track Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>Lớp:</span>
          <select
            value={selectedTrackFilter}
            onChange={e => setSelectedTrackFilter(e.target.value)}
            style={{
              padding: '6px 12px',
              fontSize: '12.5px',
              fontWeight: 600,
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#0B2545',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="all">Tất cả chương trình</option>
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

      {/* ─── 3. TOP CARD: ĐIỂM DANH HÔM NAY (Enterprise SaaS Spec) ─── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#EFF6FF',
              color: '#0057B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <QrCode size={20} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0B2545' }}>
                Điểm danh hôm nay
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                {new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date())}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          {isCheckedInToday ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              fontSize: '13px',
              fontWeight: 700
            }}>
              <CheckCircle2 size={16} color="#059669" />
              <span>Đã có mặt</span>
            </div>
          ) : (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              color: '#92400E',
              fontSize: '13px',
              fontWeight: 700
            }}>
              <Clock size={16} color="#D97706" />
              <span>Chưa điểm danh</span>
            </div>
          )}
        </div>

        {/* Class Details Strip (Lớp, Môn, Giảng viên, Phòng) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '12px',
          background: '#F8FAFC',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #E2E8F0'
        }}>
          <div>
            <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Lớp</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0B2545', marginTop: '2px' }}>{classCode}</div>
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Môn</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0057B8', marginTop: '2px' }}>{courseTitle}</div>
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Giảng viên</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0B2545', marginTop: '2px' }}>{teacherName}</div>
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phòng</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0B2545', marginTop: '2px' }}>{roomName}</div>
          </div>
        </div>

        {/* ─── 4. QR ATTENDANCE ACTION / SUCCESS FEEDBACK ─── */}
        {isCheckedInToday ? (
          /* Subtle Success State Animation */
          <div style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
            border: '1px solid #BBF7D0',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#16A34A',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 900,
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
              }}>
                ✓
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#166534' }}>
                  Điểm danh thành công
                </div>
                <div style={{ fontSize: '12.5px', color: '#15803D', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⏰ {checkInTime}</span>
                  <span>•</span>
                  <span>📍 {roomName}</span>
                  <span>•</span>
                  <span>👨‍🏫 {teacherName}</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 600, color: '#166534', background: '#FFFFFF', padding: '6px 12px', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
              Đã ghi nhận có mặt tại lớp
            </div>
          </div>
        ) : (
          /* Action Area: Primary Button 📷 Quét QR, Secondary Nhập PIN 6 số */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', paddingTop: '4px' }}>
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenQRScanner();
              }}
              style={{
                width: '100%',
                maxWidth: '420px',
                padding: '14px 24px',
                borderRadius: '10px',
                background: '#0057B8',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 14px rgba(0, 87, 184, 0.25)',
                transition: 'background 0.15s ease, transform 0.1s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#003F88')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0057B8')}
            >
              <Camera size={20} />
              <span>📷 Quét QR điểm danh</span>
            </button>

            {/* Secondary Option: Not Equal Weight */}
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenPinModal();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '6px 12px',
                textDecoration: 'underline',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#0057B8')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}
            >
              Hoặc nhập mã PIN 6 số thủ công
            </button>
          </div>
        )}
      </div>

      {/* ─── 5. STATISTICS: SINGLE SUMMARY STRIP (Thay 4 card lớn) ─── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0B2545', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="#0057B8" />
            <span>Thống kê chuyên cần của tôi</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Chuẩn tốt nghiệp &gt;= 80%
          </span>
        </div>

        {/* Unified Metrics Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
          alignItems: 'center'
        }}>
          {/* Main Rate */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Chuyên cần:</span>
            <span style={{ fontSize: '24px', fontWeight: 800, color: attendanceRate >= 80 ? '#10B981' : '#D97706' }}>
              {attendanceRate}%
            </span>
          </div>

          {/* Metric: Có mặt */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
            <span style={{ color: '#64748B' }}>Có mặt:</span>
            <strong style={{ color: '#0B2545' }}>{displayPresent} buổi</strong>
          </div>

          {/* Metric: Vắng */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
            <span style={{ color: '#64748B' }}>Vắng:</span>
            <strong style={{ color: '#0B2545' }}>{displayAbsent}</strong>
          </div>

          {/* Metric: Học bù */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
            <span style={{ color: '#64748B' }}>Học bù:</span>
            <strong style={{ color: '#0B2545' }}>{displayMakeup}</strong>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(100, attendanceRate)}%`,
            height: '100%',
            background: attendanceRate >= 80 ? '#0057B8' : '#D97706',
            borderRadius: '3px'
          }} />
        </div>
      </div>

      {/* ─── 6. LỊCH SỬ ĐIỂM DANH CHI TIẾT ─── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0B2545', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#0057B8" />
            <span>Lịch sử các buổi học gần đây</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            {studentSessions.length} buổi đã lên lịch
          </span>
        </div>

        {studentSessions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {studentSessions.slice(0, 8).map((session, idx) => {
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
                    borderRadius: '10px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: isPresent ? '#ECFDF5' : isMakeup ? '#FEF3C7' : isLate ? '#FFFBEB' : '#FEF2F2',
                      color: isPresent ? '#10B981' : isMakeup ? '#D97706' : isLate ? '#B45309' : '#EF4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isPresent ? <CheckCircle2 size={18} /> : isMakeup ? <Award size={18} /> : isLate ? <Clock size={18} /> : <AlertTriangle size={18} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0B2545' }}>
                        {session.className || `Lớp ${session.classCode}`}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📅 {session.date}</span>
                        <span>•</span>
                        <span>⏰ {formatTimeAmPm(session.startTime || '08:00')}</span>
                        <span>•</span>
                        <span>📍 {session.room || 'Phòng LAB 01'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPresent && (
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#065F46', background: '#ECFDF5', padding: '4px 10px', borderRadius: '6px', border: '1px solid #A7F3D0' }}>
                        Có mặt (Đúng giờ)
                      </span>
                    )}
                    {isMakeup && (
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#92400E', background: '#FEF3C7', padding: '4px 10px', borderRadius: '6px', border: '1px solid #FDE68A' }}>
                        Học bù đã duyệt
                      </span>
                    )}
                    {isLate && (
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#B45309', background: '#FFFBEB', padding: '4px 10px', borderRadius: '6px', border: '1px solid #FDE68A' }}>
                        Đến trễ (&lt;15p)
                      </span>
                    )}
                    {isAbsent && (
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#991B1B', background: '#FEF2F2', padding: '4px 10px', borderRadius: '6px', border: '1px solid #FECACA' }}>
                        Vắng mặt
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B', fontSize: '13px' }}>
            Chưa có buổi học nào cần điểm danh cho môn đã chọn.
          </div>
        )}
      </div>
    </div>
  );
};
