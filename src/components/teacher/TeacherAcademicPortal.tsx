import React from 'react';
import { UserProfile, StudentAccount } from '../../types/auth';
import { EarlyWarningService } from '../../services/earlyWarningService';
import { ClassScheduleItem } from '../../types/schedule';
import { Assignment, AssignmentSubmission } from '../../types/assignment';
import {
  QrCode, FileText, CheckCircle2,
  ExternalLink, Users, ChevronRight,
  BookOpen
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
  onOpenQuizCreator: () => void;
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
  onOpenQuizCreator,
  onOpenQuizBank
}) => {
  // Current date formatting
  const todayStr = new Date().toISOString().split('T')[0];
  const formattedToday = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date());

  // 1. Evaluate today's schedule
  const todayClasses = schedules.filter(s => s.date === todayStr);

  // 2. Evaluate Early Warning students
  const evaluatedStudents = EarlyWarningService.evaluateAllStudents(studentAccounts);
  const atRiskStudents = evaluatedStudents.filter(s => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH');

  // 3. Evaluate pending submissions
  const ungradedSubmissions = submissions.filter(s => s.status === 'submitted');

  return (
    <div
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        padding: '24px 24px 64px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        background: '#F5F7FA',
        minHeight: 'calc(100vh - 96px)',
        fontFamily: "'Be Vietnam Pro', sans-serif"
      }}
    >
      {/* ── 1. TIÊU ĐỀ HỌC VỤ & THỜI GIAN HIỆN TẠI (NO PROMO HERO) ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: '8px',
          paddingBottom: '16px',
          borderBottom: '1px solid #E2E8F0'
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
            Tổng quan giảng dạy
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '3px 0 0', fontWeight: 400 }}>
            {formattedToday.charAt(0).toUpperCase() + formattedToday.slice(1)} • Học kỳ 1 (2026 - 2027)
          </p>
        </div>

        <div style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
          Giảng viên: <span style={{ fontWeight: 600, color: '#0F172A' }}>{currentUser.name || 'Thầy Quang Huy'}</span>
        </div>
      </div>

      {/* ── 2. BỐN CHỈ SỐ HỌC VỤ (STAT TILES - COMPACT & INSTITUTIONAL) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Tile 1: Lớp phụ trách */}
        <div
          onClick={() => { soundFx.playClick(); onOpenScheduleCalendar(); }}
          style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Lớp phụ trách
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '24px', fontWeight: 600, color: '#0F172A' }}>3</span>
            <span style={{ fontSize: '12.5px', color: '#16A34A', fontWeight: 500 }}>Chuyên cần 94.2%</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
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
            padding: '16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Học viên quản lý
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '24px', fontWeight: 600, color: '#0F172A' }}>{studentAccounts.length || 48}</span>
            <span style={{ fontSize: '12.5px', color: '#2563EB', fontWeight: 500 }}>Đang theo học</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
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
            padding: '16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Bài chờ chấm
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '24px', fontWeight: 600, color: ungradedSubmissions.length > 0 ? '#D97706' : '#0F172A' }}>
              {ungradedSubmissions.length}
            </span>
            <span style={{ fontSize: '12.5px', color: ungradedSubmissions.length > 0 ? '#D97706' : '#64748B', fontWeight: 500 }}>
              {ungradedSubmissions.length > 0 ? 'Cần xử lý' : 'Đã hoàn tất'}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
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
            padding: '16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Cảnh báo học vụ
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '24px', fontWeight: 600, color: atRiskStudents.length > 0 ? '#DC2626' : '#16A34A' }}>
              {atRiskStudents.length}
            </span>
            <span style={{ fontSize: '12.5px', color: atRiskStudents.length > 0 ? '#DC2626' : '#16A34A', fontWeight: 500 }}>
              {atRiskStudents.length > 0 ? 'Cần theo dõi' : 'Bình thường'}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            Vắng học hoặc điểm quiz thấp
          </div>
        </div>
      </div>

      {/* ── 3. PHÂN MỤC 1: LỊCH GIẢNG DẠY (TEACHING SCHEDULE) ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          padding: '20px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Lịch giảng dạy hôm nay
            </h2>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0' }}>
              Thời khóa biểu và phòng học trực tuyến/trực tiếp
            </p>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onOpenScheduleCalendar(); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563EB',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: 0
            }}
          >
            Xem toàn bộ thời khóa biểu →
          </button>
        </div>

        {todayClasses.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Thời gian</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Mã lớp</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Tên môn học / Chuyên đề</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Địa điểm / Meet</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {todayClasses.map(cls => (
                  <tr key={cls.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px', color: '#0F172A', fontWeight: 600 }}>
                      {cls.startTime} - {cls.endTime}
                    </td>
                    <td style={{ padding: '12px', color: '#2563EB', fontWeight: 500 }}>
                      {cls.classCode}
                    </td>
                    <td style={{ padding: '12px', color: '#0F172A', fontWeight: 500 }}>
                      {cls.title}
                    </td>
                    <td style={{ padding: '12px', color: '#475569' }}>
                      {cls.room || 'Phòng LAB 01'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {cls.onlineMeetingUrl && (
                          <a
                            href={cls.onlineMeetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: '#F1F5F9',
                              border: '1px solid #CBD5E1',
                              color: '#334155',
                              fontSize: '12px',
                              fontWeight: 500,
                              textDecoration: 'none'
                            }}
                          >
                            <ExternalLink size={12} />
                            <span>Vào Meet</span>
                          </a>
                        )}
                        <button
                          onClick={() => onOpenAttendanceSession(cls)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: '#2563EB',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '12.5px',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          <QrCode size={13} />
                          <span>Mở lớp & điểm danh</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
            Hôm nay không có lịch giảng dạy. Giảng viên có thể kiểm tra danh sách bài nộp hoặc thời khóa biểu tuần tới.
          </div>
        )}
      </div>

      {/* ── 4. PHÂN MỤC 2: CÔNG VIỆC CẦN XỬ LÝ (PENDING TASKS) ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          padding: '20px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Công việc cần xử lý ({ungradedSubmissions.length})
            </h2>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0' }}>
              Danh sách bài nộp và nhiệm vụ học vụ cần phê duyệt & chấm điểm
            </p>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onOpenAssignmentManager(); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563EB',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: 0
            }}
          >
            Quản lý tất cả bài nộp →
          </button>
        </div>

        {ungradedSubmissions.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Học viên</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Bài tập</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Thời gian nộp</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Trạng thái</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {ungradedSubmissions.slice(0, 5).map(sub => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px', color: '#0F172A', fontWeight: 500 }}>
                      {sub.studentName}
                    </td>
                    <td style={{ padding: '12px', color: '#334155' }}>
                      {sub.assignmentTitle}
                    </td>
                    <td style={{ padding: '12px', color: '#64748B', fontSize: '12.5px' }}>
                      {sub.submittedAt.replace('T', ' ').substring(0, 16)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                          fontWeight: 500,
                          background: '#FEF3C7',
                          color: '#B45309'
                        }}
                      >
                        Chờ chấm điểm
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        onClick={() => onOpenAssignmentManager()}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '6px',
                          background: '#ffffff',
                          border: '1px solid #CBD5E1',
                          color: '#2563EB',
                          fontSize: '12.5px',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        Chấm điểm
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#16A34A', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} />
            <span>Tất cả bài tập đã được chấm điểm và phản hồi đầy đủ!</span>
          </div>
        )}
      </div>

      {/* ── 5. PHÂN MỤC 3: HỌC VIÊN CẦN LƯU Ý (ACADEMIC WARNINGS) ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          padding: '20px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Học viên cần lưu ý ({atRiskStudents.length})
            </h2>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0' }}>
              Danh sách học viên có nguy cơ vắng học hoặc kết quả kiểm tra giảm
            </p>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onOpenEarlyWarning(); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563EB',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: 0
            }}
          >
            Xem tất cả cảnh báo học vụ →
          </button>
        </div>

        {atRiskStudents.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Mã HV</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Họ và tên</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Vấn đề ghi nhận</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Mức độ</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {atRiskStudents.slice(0, 5).map(s => (
                  <tr key={s.studentId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px', color: '#2563EB', fontWeight: 500 }}>
                      {s.studentCode}
                    </td>
                    <td style={{ padding: '12px', color: '#0F172A', fontWeight: 500 }}>
                      {s.studentName}
                    </td>
                    <td style={{ padding: '12px', color: '#475569' }}>
                      {s.factors[0] || 'Vắng học 2 buổi liên tiếp hoặc điểm kiểm tra dưới 50%'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                          fontWeight: 500,
                          background: s.riskLevel === 'CRITICAL' ? '#FEE2E2' : '#FEF3C7',
                          color: s.riskLevel === 'CRITICAL' ? '#B91C1C' : '#B45309'
                        }}
                      >
                        {s.riskLevel === 'CRITICAL' ? 'Cảnh báo mức 2' : 'Cảnh báo mức 1'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        onClick={() => onOpenEarlyWarning()}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '6px',
                          background: '#ffffff',
                          border: '1px solid #CBD5E1',
                          color: '#2563EB',
                          fontSize: '12.5px',
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
        ) : (
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#16A34A', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} />
            <span>Tình hình học vụ của toàn bộ học viên đang ở mức ổn định!</span>
          </div>
        )}
      </div>

      {/* ── 6. PHÂN MỤC 4: TIỆN ÍCH QUẢN TRỊ & KHẢO THÍ (ACADEMIC UTILITIES) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}
      >
        <div
          onClick={() => { soundFx.playClick(); onOpenAdminPortal(); }}
          style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={20} color="#2563EB" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Danh sách học viên</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Tra cứu & quản lý hồ sơ {studentAccounts.length} học viên</div>
            </div>
          </div>
          <ChevronRight size={16} color="#94A3B8" />
        </div>

        <div
          onClick={() => { soundFx.playClick(); onOpenQuizCreator(); }}
          style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={20} color="#16A34A" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Soạn đề kiểm tra</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Tạo ngân hàng câu hỏi trắc nghiệm</div>
            </div>
          </div>
          <ChevronRight size={16} color="#94A3B8" />
        </div>

        <div
          onClick={() => { soundFx.playClick(); onOpenQuizBank(); }}
          style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BookOpen size={20} color="#D97706" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Ngân hàng đề thi</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Kho đề thi chứng chỉ chuẩn hóa</div>
            </div>
          </div>
          <ChevronRight size={16} color="#94A3B8" />
        </div>
      </div>

    </div>
  );
};
