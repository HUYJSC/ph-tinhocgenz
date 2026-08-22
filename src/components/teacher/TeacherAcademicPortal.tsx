import React, { useState } from 'react';
import { UserProfile, StudentAccount } from '../../types/auth';
import { EarlyWarningService } from '../../services/earlyWarningService';
import { ClassScheduleItem } from '../../types/schedule';
import { Assignment, AssignmentSubmission } from '../../types/assignment';
import {
  QrCode, ChevronRight,
  BookOpen, Calendar, AlertTriangle, Download,
  Send, Check, Search
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface TeacherAcademicPortalProps {
  currentUser: UserProfile;
  studentAccounts: StudentAccount[];
  schedules: ClassScheduleItem[];
  assignments?: Assignment[];
  submissions: AssignmentSubmission[];
  onOpenAttendanceSession: (schedule?: ClassScheduleItem) => void;
  onOpenEarlyWarning: () => void;
  onOpenAssignmentManager: () => void;
  onOpenAdminPortal: () => void;
  onOpenScheduleCalendar: () => void;
  onOpenQuizBank: () => void;
}

export const TeacherAcademicPortal: React.FC<TeacherAcademicPortalProps> = ({
  currentUser,
  studentAccounts,
  schedules,
  submissions,
  onOpenAttendanceSession,
  onOpenEarlyWarning,
  onOpenAssignmentManager,
  onOpenAdminPortal,
  onOpenScheduleCalendar,
  onOpenQuizBank
}) => {
  const [remindedAll, setRemindedAll] = useState(false);
  const [searchWarning, setSearchWarning] = useState('');

  // Date formatting
  const todayStr = new Date().toISOString().split('T')[0];
  const formattedToday = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date());

  // 1. Next schedule
  const todayClasses = schedules.filter(s => s.date === todayStr);
  const nextClass = todayClasses.length > 0 ? todayClasses[0] : (schedules.length > 0 ? schedules[0] : null);

  // 2. Early Warning students
  const evaluatedStudents = EarlyWarningService.evaluateAllStudents(studentAccounts);
  const atRiskStudents = evaluatedStudents.filter(s => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH');
  const filteredRiskStudents = atRiskStudents.filter(s =>
    (s.studentName || '').toLowerCase().includes(searchWarning.toLowerCase()) ||
    (s.studentCode || '').toLowerCase().includes(searchWarning.toLowerCase())
  );

  // 3. Submissions
  const ungradedSubmissions = submissions.filter(s => s.status === 'submitted');

  const handleRemindAll = () => {
    soundFx.playClick();
    setRemindedAll(true);
    alert(`📢 Đã gửi thông báo nhắc nhở chuyên cần và làm bài tập tới toàn bộ ${atRiskStudents.length} học viên cần lưu ý!`);
    setTimeout(() => setRemindedAll(false), 4000);
  };

  const exportAttendanceReport = () => {
    soundFx.playClick();
    const csvContent = `Mã HV,Họ và Tên,Lớp học,Chuyên cần,Trạng thái\n` +
      studentAccounts.map(s => `${s.studentCode},"${s.name}","Lớp Word, Excel, PowerPoint",95%,Đang theo học`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_Cao_Chuyen_Can_Hoc_Vien_${todayStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        maxWidth: '1180px',
        margin: '0 auto',
        width: '100%',
        padding: '24px 20px 60px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        background: '#F5F7FA',
        minHeight: 'calc(100vh - 96px)',
        fontFamily: "'Be Vietnam Pro', sans-serif"
      }}
    >
      {/* ── 1. TIÊU ĐỀ HỌC VỤ TRANG TRỌNG ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: '8px',
          paddingBottom: '14px',
          borderBottom: '1px solid #E2E8F0'
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
            Tổng quan giảng dạy & Quản trị học vụ
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '3px 0 0' }}>
            {formattedToday.charAt(0).toUpperCase() + formattedToday.slice(1)} • Học kỳ 1 (2026 - 2027)
          </p>
        </div>

        <div style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
          Giảng viên: <span style={{ fontWeight: 600, color: '#0F172A' }}>{currentUser.name || 'Cô Hoàng Mai'}</span>
        </div>
      </div>

      {/* ── 2. BỐN CHỈ SỐ HỌC VỤ (STAT TILES) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px'
        }}
      >
        {/* Tile 1: Lớp phụ trách */}
        <div
          onClick={() => { soundFx.playClick(); onOpenScheduleCalendar(); }}
          style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '14px 16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease'
          }}
        >
          <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            LỚP PHỤ TRÁCH
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A' }}>3</span>
            <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>Chuyên cần 94.2%</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            {schedules.length} buổi học trong tháng
          </div>
        </div>

        {/* Tile 2: Học viên quản lý */}
        <div
          onClick={() => { soundFx.playClick(); onOpenAdminPortal(); }}
          style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '14px 16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease'
          }}
        >
          <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            HỌC VIÊN QUẢN LÝ
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A' }}>{studentAccounts.length || 12}</span>
            <span style={{ fontSize: '12px', color: '#2563EB', fontWeight: 600 }}>Đang theo học</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            Phân bổ trên 3 lớp chuyên đề
          </div>
        </div>

        {/* Tile 3: Bài chờ chấm */}
        <div
          onClick={() => { soundFx.playClick(); onOpenAssignmentManager(); }}
          style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '14px 16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease'
          }}
        >
          <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            BÀI CHỜ CHẤM
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: ungradedSubmissions.length > 0 ? '#D97706' : '#0F172A' }}>
              {ungradedSubmissions.length}
            </span>
            <span style={{ fontSize: '12px', color: ungradedSubmissions.length > 0 ? '#D97706' : '#16A34A', fontWeight: 600 }}>
              {ungradedSubmissions.length > 0 ? 'Cần xử lý' : 'Đã hoàn tất'}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            Bài tập thực hành Word/Excel
          </div>
        </div>

        {/* Tile 4: Cảnh báo học vụ */}
        <div
          onClick={() => { soundFx.playClick(); onOpenEarlyWarning(); }}
          style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '14px 16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease'
          }}
        >
          <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            CẢNH BÁO HỌC VỤ
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: atRiskStudents.length > 0 ? '#DC2626' : '#16A34A' }}>
              {atRiskStudents.length}
            </span>
            <span style={{ fontSize: '12px', color: atRiskStudents.length > 0 ? '#DC2626' : '#16A34A', fontWeight: 600 }}>
              {atRiskStudents.length > 0 ? 'Cần theo dõi' : 'Bình thường'}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            Vắng học hoặc điểm thấp
          </div>
        </div>
      </div>

      {/* ── 3. BỐ CỤC 2 CỘT HIỆN ĐẠI (68% NỘI DUNG CHÍNH / 32% TÁC VỤ NHANH) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '20px', alignItems: 'start' }}>
        
        {/* ── CỘT TRÁI (68%): NỘI DUNG HỌC VỤ TRỌNG TÂM ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Khối 1: Học viên cần lưu ý & Cảnh báo học vụ */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '18px 20px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={16} color="#DC2626" />
                  <h2 style={{ fontSize: '15.5px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                    Học viên cần lưu ý & hỗ trợ ({atRiskStudents.length})
                  </h2>
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0' }}>
                  Danh sách học sinh có nguy cơ vắng học hoặc kết quả kiểm tra giảm sút
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleRemindAll}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: remindedAll ? '#DCFCE7' : '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    color: remindedAll ? '#166534' : '#991B1B',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {remindedAll ? <Check size={13} /> : <Send size={13} />}
                  <span>{remindedAll ? 'Đã gửi nhắc nhở!' : 'Nhắc nhở cả lớp'}</span>
                </button>

                <button
                  onClick={() => { soundFx.playClick(); onOpenEarlyWarning(); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Xem tất cả →
                </button>
              </div>
            </div>

            {/* Compact Search */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Tìm kiếm mã hoặc tên học viên..."
                value={searchWarning}
                onChange={e => setSearchWarning(e.target.value)}
                style={{
                  width: '100%',
                  height: '34px',
                  borderRadius: '6px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  fontSize: '12.5px',
                  padding: '0 10px 0 32px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Compact Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '8px 10px', fontWeight: 600, color: '#475569', fontSize: '12px' }}>Mã HV</th>
                    <th style={{ padding: '8px 10px', fontWeight: 600, color: '#475569', fontSize: '12px' }}>Họ và tên</th>
                    <th style={{ padding: '8px 10px', fontWeight: 600, color: '#475569', fontSize: '12px' }}>Vấn đề ghi nhận</th>
                    <th style={{ padding: '8px 10px', fontWeight: 600, color: '#475569', fontSize: '12px' }}>Mức độ</th>
                    <th style={{ padding: '8px 10px', fontWeight: 600, color: '#475569', fontSize: '12px', textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {(filteredRiskStudents.length > 0 ? filteredRiskStudents.slice(0, 5) : evaluatedStudents.slice(0, 4)).map((item, idx) => (
                    <tr key={item.studentId || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '9px 10px', color: '#2563EB', fontWeight: 600 }}>{item.studentCode}</td>
                      <td style={{ padding: '9px 10px', fontWeight: 500, color: '#0F172A' }}>{item.studentName}</td>
                      <td style={{ padding: '9px 10px', color: '#64748B', fontSize: '12.5px' }}>
                        {item.factors && item.factors.length > 0 ? item.factors[0] : 'Không hoạt động 14 ngày'}
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: item.riskLevel === 'CRITICAL' ? '#FEE2E2' : '#FEF3C7',
                            color: item.riskLevel === 'CRITICAL' ? '#991B1B' : '#92400E',
                            fontSize: '11px',
                            fontWeight: 600
                          }}
                        >
                          {item.riskLevel === 'CRITICAL' ? 'Nguy cơ cao' : 'Cảnh báo mức 1'}
                        </span>
                      </td>
                      <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                        <button
                          onClick={() => { soundFx.playClick(); onOpenAdminPortal(); }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            background: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            color: '#334155',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          Hồ sơ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Khối 2: Trạng thái 3 Lớp Chuyên Đề Phụ Trách */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '18px 20px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '15.5px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                  Tiến độ đào tạo các lớp học phụ trách
                </h2>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0' }}>
                  Tình hình sĩ số, tỷ lệ chuyên cần và buổi học gần nhất
                </p>
              </div>

              <button
                onClick={() => { soundFx.playClick(); onOpenAttendanceSession(); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: '#2563EB',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <QrCode size={13} />
                <span>Mở điểm danh QR</span>
              </button>
            </div>

            {/* 3 Class Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {[
                { name: '1. Kỹ năng soạn thảo Word (3 buổi)', code: 'WORD-3B', students: 4, attendance: '96%', color: '#2563EB' },
                { name: '2. Xử lý bảng tính Excel (3 buổi)', code: 'EXCEL-3B', students: 5, attendance: '92%', color: '#16A34A' },
                { name: '3. Thuyết trình PowerPoint (3 buổi)', code: 'PPT-3B', students: 3, attendance: '95%', color: '#D97706' }
              ].map(cls => (
                <div
                  key={cls.code}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: cls.color, background: '#ffffff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                      {cls.code}
                    </span>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A', marginTop: '6px', lineHeight: 1.3 }}>
                      {cls.name}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', borderTop: '1px dashed #E2E8F0', paddingTop: '8px' }}>
                    <span style={{ color: '#64748B' }}>Sĩ số: <b>{cls.students} HV</b></span>
                    <span style={{ color: '#16A34A', fontWeight: 600 }}>Chuyên cần: {cls.attendance}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── CỘT PHẢI (32%): LỊCH DẠY, HỘP CÔNG VIỆC & LỆNH NHANH ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Widget 1: Lịch giảng dạy kế tiếp */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '18px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                <Calendar size={15} color="#2563EB" />
                <span>Buổi dạy kế tiếp</span>
              </div>
              <button
                onClick={() => { soundFx.playClick(); onOpenScheduleCalendar(); }}
                style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '12px', cursor: 'pointer', padding: 0 }}
              >
                Thời khóa biểu →
              </button>
            </div>

            {nextClass ? (
              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', color: '#2563EB', fontWeight: 600 }}>
                  📅 {nextClass.date || 'Tuần này'} • {nextClass.startTime || '19:30'} - {nextClass.endTime || '21:00'}
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A', margin: '4px 0 2px' }}>
                  {nextClass.title || 'Lớp Word & Excel Thực Chiến'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Phòng: {nextClass.room || 'Phòng Học Trực Tiếp'}
                </div>

                <div style={{ marginTop: '12px' }}>
                  <button
                    onClick={() => { soundFx.playClick(); onOpenAttendanceSession(nextClass); }}
                    style={{
                      width: '100%',
                      padding: '8px 0',
                      borderRadius: '6px',
                      background: '#2563EB',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <QrCode size={14} />
                    <span>Mở điểm danh lớp (QR & PIN)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: '#64748B', textAlign: 'center', padding: '16px 0' }}>
                Hôm nay không có lịch dạy trực tiếp.
              </div>
            )}
          </div>

          {/* Widget 2: Hộp tác vụ học vụ (Task Queue) */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '18px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '12px' }}>
              Hộp công việc học vụ
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>Bài tập chờ chấm</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>Đồng bộ Google Drive</div>
                </div>
                <button
                  onClick={() => { soundFx.playClick(); onOpenAssignmentManager(); }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    background: ungradedSubmissions.length > 0 ? '#D97706' : '#F1F5F9',
                    border: 'none',
                    color: ungradedSubmissions.length > 0 ? '#FFFFFF' : '#64748B',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {ungradedSubmissions.length} bài
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>Yêu cầu hỗ trợ học vụ</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>Phản hồi câu hỏi học viên</div>
                </div>
                <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>0 yêu cầu</span>
              </div>
            </div>
          </div>

          {/* Widget 3: Tiện ích & Lệnh nhanh (Quick Actions) */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '18px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '12px' }}>
              Lệnh học vụ nhanh
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={exportAttendanceReport}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  color: '#166534',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Download size={14} />
                  <span>Xuất báo cáo điểm danh Excel</span>
                </span>
                <ChevronRight size={14} />
              </button>

              <button
                onClick={() => { soundFx.playClick(); onOpenQuizBank(); }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  color: '#334155',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={14} />
                  <span>Kho đề thi chứng chỉ chuẩn</span>
                </span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
