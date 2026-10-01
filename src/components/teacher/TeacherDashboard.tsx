import React from 'react';
import {
  Layers, Users, CheckSquare, Clock,
  AlertCircle,
  TrendingUp, ArrowRight, Sparkles
} from 'lucide-react';
import { UserProfile, StudentAccount } from '../../types/auth';
import { ClassScheduleItem } from '../../types/schedule';
import { AssignmentSubmission } from '../../types/assignment';
import { PORTAL_TOKENS } from '../../styles/portalDesignTokens';
import { PortalCard } from '../ui/PortalCard';
import { PortalButton } from '../ui/PortalButton';
import { PortalBadge } from '../ui/PortalBadge';

export interface AssignedClass {
  id: string;
  classCode: string;
  name: string;
  studentCount: number;
  averageProgress: number;
  nextSchedule: string;
}

export interface TeacherDashboardProps {
  currentUser: UserProfile;
  studentAccounts?: StudentAccount[];
  schedules?: ClassScheduleItem[];
  submissions?: AssignmentSubmission[];
  onOpenClass: (classCode: string) => void;
  onOpenGrading: () => void;
  onOpenAttendance: () => void;
  onOpenSchedule?: () => void;
  onOpenAITutor?: (prompt?: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  studentAccounts = [],
  schedules = [],
  submissions = [],
  onOpenClass,
  onOpenGrading,
  onOpenAttendance,
  onOpenSchedule,
  onOpenAITutor
}) => {
  // 1. Classes assigned to teacher
  const assignedClasses: AssignedClass[] = [
    {
      id: 'cls-1',
      classCode: 'K26-WE01',
      name: 'Word, Excel, PowerPoint 3-in-1 Thực Chiến',
      studentCount: studentAccounts.length > 0 ? studentAccounts.length : 24,
      averageProgress: 72,
      nextSchedule: schedules.length > 0 ? `${schedules[0].date} (${schedules[0].startTime} - ${schedules[0].endTime}) • ${schedules[0].room}` : 'Thứ Ba (19:30 - 21:30) • LAB 01'
    },
    {
      id: 'cls-2',
      classCode: 'K26-IC02',
      name: 'Luyện Thi Chứng Chỉ IC3 GS6 Chuẩn Quốc Tế',
      studentCount: 18,
      averageProgress: 45,
      nextSchedule: 'Thứ Năm (19:30 - 21:30) • LAB 02'
    }
  ];

  // 2. Pending work
  const ungradedCount = submissions.filter(s => s.status === 'submitted').length || 3;
  const pendingAttendanceCount = 1; // Pending session check
  const upcomingDeadlinesCount = 2; // Upcoming assignment deadlines
  const pendingFeedbackCount = 4; // Discussion questions

  // 3. Stats
  const totalClasses = assignedClasses.length;
  const totalStudents = studentAccounts.length > 0 ? studentAccounts.length : assignedClasses.reduce((acc, c) => acc + c.studentCount, 0);
  const avgCompletionRate = 65;

  // 4. Recent activities
  const recentActivities = [
    {
      id: 'act-1',
      type: 'submission',
      title: 'Học viên nộp bài',
      desc: 'Trần Thị Mai (K26-WE01) vừa nộp "Bài tập 03: Thiết kế báo cáo Pivot Table"',
      time: '10 phút trước',
      actionText: 'Chấm bài',
      onAction: onOpenGrading
    },
    {
      id: 'act-2',
      type: 'absence',
      title: 'Học viên vắng',
      desc: 'Lê Hoàng Long vắng buổi học "Soạn thảo công văn nâng cao" có phép',
      time: 'Hôm qua',
      actionText: 'Xem điểm danh',
      onAction: onOpenAttendance
    },
    {
      id: 'act-3',
      type: 'completion',
      title: 'Học viên hoàn thành bài',
      desc: 'Nguyễn Văn Nam đã hoàn thành trắc nghiệm IC3 GS6 với điểm số 95/100',
      time: 'Hôm qua',
      actionText: 'Xem kết quả',
      onAction: onOpenGrading
    },
    {
      id: 'act-4',
      type: 'schedule_change',
      title: 'Thay đổi lịch học',
      desc: 'Phòng Đào Tạo cập nhật phòng học LAB 01 cho buổi học Thứ Ba tuần tới',
      time: '2 ngày trước',
      actionText: 'Xem lịch',
      onAction: onOpenSchedule
    }
  ];

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        fontFamily: PORTAL_TOKENS.typography.fontFamily
      }}
    >
      {/* ── GREETING ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: PORTAL_TOKENS.typography.sizes.h1,
              fontWeight: PORTAL_TOKENS.typography.weights.bold,
              color: PORTAL_TOKENS.colors.text,
              margin: '0 0 6px 0'
            }}
          >
            Xin chào, {currentUser?.name || 'Thầy/Cô Giảng Viên'}
          </h1>
          <p
            style={{
              fontSize: PORTAL_TOKENS.typography.sizes.body,
              color: PORTAL_TOKENS.colors.textMuted,
              margin: 0
            }}
          >
            Đây là tổng quan hoạt động giảng dạy của bạn.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <PortalButton
            variant="outline"
            size="sm"
            icon={<Sparkles size={14} />}
            onClick={() => onOpenAITutor && onOpenAITutor('Lớp nào sắp có bài cần chấm?')}
          >
            Trợ lý AI Giảng dạy
          </PortalButton>
        </div>
      </div>

      {/* ── KHU VỰC 3: THỐNG KÊ GIẢNG DẠY (4 THẺ KPI ĐỒNG BỘ) ── */}
      <div>
        <h2
          style={{
            fontSize: PORTAL_TOKENS.typography.sizes.h3,
            fontWeight: PORTAL_TOKENS.typography.weights.bold,
            color: PORTAL_TOKENS.colors.text,
            margin: '0 0 16px 0'
          }}
        >
          Thống kê giảng dạy
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}
        >
          {/* 1. Tổng số lớp */}
          <PortalCard padding="18px">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: PORTAL_TOKENS.colors.textMuted, textTransform: 'uppercase' }}>
                Tổng số lớp
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: PORTAL_TOKENS.radii.sm, backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: PORTAL_TOKENS.colors.primary }}>
                <Layers size={16} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: PORTAL_TOKENS.colors.text }}>
              {totalClasses}
            </div>
            <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.textSecondary, marginTop: '4px' }}>
              Lớp đang hoạt động
            </div>
          </PortalCard>

          {/* 2. Tổng số học viên */}
          <PortalCard padding="18px">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: PORTAL_TOKENS.colors.textMuted, textTransform: 'uppercase' }}>
                Tổng số học viên
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: PORTAL_TOKENS.radii.sm, backgroundColor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: PORTAL_TOKENS.colors.success }}>
                <Users size={16} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: PORTAL_TOKENS.colors.text }}>
              {totalStudents}
            </div>
            <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.textSecondary, marginTop: '4px' }}>
              Học viên trực thuộc phụ trách
            </div>
          </PortalCard>

          {/* 3. Bài tập chờ chấm */}
          <PortalCard padding="18px" hoverable onClick={onOpenGrading} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: PORTAL_TOKENS.colors.textMuted, textTransform: 'uppercase' }}>
                Bài tập chờ chấm
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: PORTAL_TOKENS.radii.sm, backgroundColor: '#FFF4E5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: PORTAL_TOKENS.colors.warning }}>
                <CheckSquare size={16} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: PORTAL_TOKENS.colors.warning }}>
              {ungradedCount}
            </div>
            <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.warning, fontWeight: 600, marginTop: '4px' }}>
              Cần xử lý kịp thời →
            </div>
          </PortalCard>

          {/* 4. Tỷ lệ hoàn thành trung bình */}
          <PortalCard padding="18px">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: PORTAL_TOKENS.colors.textMuted, textTransform: 'uppercase' }}>
                Tỷ lệ hoàn thành TB
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: PORTAL_TOKENS.radii.sm, backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: PORTAL_TOKENS.colors.primary }}>
                <TrendingUp size={16} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: PORTAL_TOKENS.colors.primary }}>
              {avgCompletionRate}%
            </div>
            <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.textSecondary, marginTop: '4px' }}>
              Tiến độ tích cực
            </div>
          </PortalCard>
        </div>
      </div>

      {/* ── KHU VỰC 1: LỚP HỌC ĐANG PHỤ TRÁCH ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2
              style={{
                fontSize: PORTAL_TOKENS.typography.sizes.h3,
                fontWeight: PORTAL_TOKENS.typography.weights.bold,
                color: PORTAL_TOKENS.colors.text,
                margin: '0 0 4px 0'
              }}
            >
              Lớp học đang phụ trách
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: PORTAL_TOKENS.colors.textMuted }}>
              Danh sách các lớp học được phòng đào tạo phân công cho bạn.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '20px'
          }}
        >
          {assignedClasses.map((cls) => (
            <PortalCard key={cls.id} padding="20px" hoverable>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <PortalBadge variant="primary" size="sm">Mã lớp: {cls.classCode}</PortalBadge>
                <span style={{ fontSize: '13px', color: PORTAL_TOKENS.colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={14} /> <strong>{cls.studentCount}</strong> học viên
                </span>
              </div>

              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: PORTAL_TOKENS.typography.weights.bold,
                  color: PORTAL_TOKENS.colors.text,
                  margin: '0 0 12px 0',
                  lineHeight: 1.4,
                  minHeight: '44px'
                }}
              >
                {cls.name}
              </h3>

              {/* Average Progress */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: PORTAL_TOKENS.colors.textSecondary }}>
                  <span>Tiến độ lớp học</span>
                  <span style={{ fontWeight: 700, color: PORTAL_TOKENS.colors.primary }}>{cls.averageProgress}%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: PORTAL_TOKENS.radii.full, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${cls.averageProgress}%`, backgroundColor: PORTAL_TOKENS.colors.primary, borderRadius: PORTAL_TOKENS.radii.full }} />
                </div>
              </div>

              {/* Next Schedule */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: PORTAL_TOKENS.colors.textMuted, marginBottom: '18px' }}>
                <Clock size={14} color={PORTAL_TOKENS.colors.primary} />
                <span>Lịch tiếp theo: <strong>{cls.nextSchedule}</strong></span>
              </div>

              {/* Action: "Mở lớp" CTA */}
              <PortalButton
                variant="primary"
                fullWidth
                icon={<ArrowRight size={15} />}
                iconPosition="right"
                onClick={() => onOpenClass(cls.classCode)}
              >
                Mở lớp
              </PortalButton>
            </PortalCard>
          ))}
        </div>
      </div>

      {/* ── KHU VỰC 2 & KHU VỰC 4: CÔNG VIỆC CẦN XỬ LÝ & HOẠT ĐỘNG GẦN ĐÂY ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px'
        }}
      >
        {/* 2. Công việc cần xử lý */}
        <PortalCard padding="20px">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2
              style={{
                fontSize: PORTAL_TOKENS.typography.sizes.h3,
                fontWeight: PORTAL_TOKENS.typography.weights.bold,
                color: PORTAL_TOKENS.colors.text,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={18} color={PORTAL_TOKENS.colors.warning} />
              Công việc cần xử lý
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Bài chưa chấm */}
            <div
              onClick={onOpenGrading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: PORTAL_TOKENS.radii.sm,
                backgroundColor: '#F8FAFC',
                border: `1px solid ${PORTAL_TOKENS.colors.border}`,
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: PORTAL_TOKENS.colors.warning }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: PORTAL_TOKENS.colors.text }}>
                  Bài chưa chấm
                </span>
              </div>
              <PortalBadge variant="warning" size="sm">{ungradedCount} bài chờ chấm</PortalBadge>
            </div>

            {/* Điểm danh chưa hoàn tất */}
            <div
              onClick={onOpenAttendance}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: PORTAL_TOKENS.radii.sm,
                backgroundColor: '#F8FAFC',
                border: `1px solid ${PORTAL_TOKENS.colors.border}`,
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: PORTAL_TOKENS.colors.primary }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: PORTAL_TOKENS.colors.text }}>
                  Điểm danh chưa hoàn tất
                </span>
              </div>
              <PortalBadge variant="primary" size="sm">{pendingAttendanceCount} ca cần xác nhận</PortalBadge>
            </div>

            {/* Bài tập sắp đến hạn */}
            <div
              onClick={onOpenGrading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: PORTAL_TOKENS.radii.sm,
                backgroundColor: '#F8FAFC',
                border: `1px solid ${PORTAL_TOKENS.colors.border}`,
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#64748B' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: PORTAL_TOKENS.colors.text }}>
                  Bài tập sắp đến hạn
                </span>
              </div>
              <PortalBadge variant="neutral" size="sm">{upcomingDeadlinesCount} bài tập trong tuần</PortalBadge>
            </div>

            {/* Thông báo cần phản hồi */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: PORTAL_TOKENS.radii.sm,
                backgroundColor: '#F8FAFC',
                border: `1px solid ${PORTAL_TOKENS.colors.border}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: PORTAL_TOKENS.colors.primary }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: PORTAL_TOKENS.colors.text }}>
                  Thông báo cần phản hồi
                </span>
              </div>
              <PortalBadge variant="neutral" size="sm">{pendingFeedbackCount} câu hỏi mới</PortalBadge>
            </div>
          </div>
        </PortalCard>

        {/* 4. Hoạt động gần đây */}
        <PortalCard padding="20px">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2
              style={{
                fontSize: PORTAL_TOKENS.typography.sizes.h3,
                fontWeight: PORTAL_TOKENS.typography.weights.bold,
                color: PORTAL_TOKENS.colors.text,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Clock size={18} color={PORTAL_TOKENS.colors.primary} />
              Hoạt động gần đây
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivities.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  paddingBottom: '12px',
                  borderBottom: `1px solid ${PORTAL_TOKENS.colors.divider}`
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: PORTAL_TOKENS.colors.text }}>
                      {act.title}
                    </span>
                    <span style={{ fontSize: '11px', color: PORTAL_TOKENS.colors.textMuted }}>
                      • {act.time}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.textSecondary, lineHeight: 1.4 }}>
                    {act.desc}
                  </div>
                </div>

                {act.actionText && act.onAction && (
                  <button
                    onClick={act.onAction}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: PORTAL_TOKENS.colors.primary,
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      padding: '2px 0'
                    }}
                  >
                    {act.actionText} →
                  </button>
                )}
              </div>
            ))}
          </div>
        </PortalCard>
      </div>
    </div>
  );
};
