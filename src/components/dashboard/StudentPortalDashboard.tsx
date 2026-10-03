import React from 'react';
import {
  Play, Calendar, CheckSquare,
  Clock, ShieldCheck,
  Sparkles, TrendingUp, Video
} from 'lucide-react';
import { UserProfile } from '../../types/auth';
import { ClassScheduleItem } from '../../types/schedule';
import { PORTAL_TOKENS } from '../../styles/portalDesignTokens';
import { PortalCard } from '../ui/PortalCard';
import { PortalButton } from '../ui/PortalButton';
import { PortalBadge } from '../ui/PortalBadge';

export interface StudentPortalDashboardProps {
  currentUser: UserProfile;
  schedules?: ClassScheduleItem[];
  onContinueLearning: () => void;
  onOpenCourses?: () => void;
  onOpenSchedule?: () => void;
  onOpenAssignments?: () => void;
  onOpenAttendance?: () => void;
  onOpenCertificates?: () => void;
  onOpenAITutor?: (prompt?: string) => void;
  onOpenLiveClass?: () => void;
}

export const StudentPortalDashboard: React.FC<StudentPortalDashboardProps> = ({
  currentUser,
  schedules = [],
  onContinueLearning,
  onOpenCourses,
  onOpenSchedule,
  onOpenAssignments,
  onOpenAttendance,
  onOpenCertificates,
  onOpenAITutor,
  onOpenLiveClass
}) => {
  // Recent course mock / live state
  const currentCourse = {
    title: 'Word, Excel, PowerPoint 3-in-1 Thực Chiến',
    progress: 68,
    completedLessons: 16,
    totalLessons: 24,
    nextLesson: 'Bài 17: Phân tích dữ liệu bằng Pivot Table và Slicer'
  };

  // Recommended courses (max 3-4, strictly uniform white cards with #D9E2F0 border)
  const recommendedCourses = [
    {
      id: 'rc-1',
      title: 'Kỹ Năng Excel Nâng Cao Cho Kế Toán & Tài Chính',
      category: 'Tin học văn phòng',
      lessonsCount: 18,
      duration: '6 tuần',
      instructor: 'Thầy Quang Huy'
    },
    {
      id: 'rc-2',
      title: 'Luyện Thi Chứng Chỉ IC3 Chuẩn Quốc Tế',
      category: 'Chứng chỉ',
      lessonsCount: 22,
      duration: '8 tuần',
      instructor: 'Cô Hoàng Mai'
    },
    {
      id: 'rc-3',
      title: 'Ứng Dụng AI & ChatGPT Vào Tự Động Hóa Văn Phòng',
      category: 'AI & Tự động hóa',
      lessonsCount: 15,
      duration: '4 tuần',
      instructor: 'Thầy Nguyễn Đình Huy'
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
      {/* ── GREETING HEADER ── */}
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
            Xin chào, {currentUser?.name || 'Học viên'}
          </h1>
          <p
            style={{
              fontSize: PORTAL_TOKENS.typography.sizes.body,
              color: PORTAL_TOKENS.colors.textMuted,
              margin: 0
            }}
          >
            Tiếp tục hành trình học tập của bạn.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {onOpenLiveClass && (
            <PortalButton
              variant="primary"
              size="sm"
              icon={<Video size={14} />}
              onClick={onOpenLiveClass}
              style={{ background: '#0057B8', color: '#fff', fontWeight: 700 }}
            >
              Vào Lớp Trực Tuyến
            </PortalButton>
          )}
          <PortalButton
            variant="outline"
            size="sm"
            icon={<Sparkles size={14} />}
            onClick={() => onOpenAITutor && onOpenAITutor('Hướng dẫn tôi bài học tiếp theo')}
          >
            Hỏi Trợ lý AI
          </PortalButton>
        </div>
      </div>

      {/* ── KHU VỰC 1: TIẾP TỤC HỌC ── */}
      <PortalCard padding="24px">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: PORTAL_TOKENS.colors.primary,
                display: 'inline-block'
              }}
            />
            <h2
              style={{
                fontSize: PORTAL_TOKENS.typography.sizes.h3,
                fontWeight: PORTAL_TOKENS.typography.weights.bold,
                color: PORTAL_TOKENS.colors.text,
                margin: 0
              }}
            >
              Tiếp tục học
            </h2>
          </div>
          <PortalBadge variant="primary">Khóa học đang học gần nhất</PortalBadge>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          <div style={{ flex: '1', minWidth: '280px' }}>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: PORTAL_TOKENS.typography.weights.bold,
                color: PORTAL_TOKENS.colors.text,
                margin: '0 0 8px 0'
              }}
            >
              {currentCourse.title}
            </h3>

            {/* Progress bar */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: PORTAL_TOKENS.colors.textSecondary }}>
                <span>Tiến độ: {currentCourse.completedLessons}/{currentCourse.totalLessons} bài học</span>
                <span style={{ fontWeight: PORTAL_TOKENS.typography.weights.bold, color: PORTAL_TOKENS.colors.primary }}>
                  {currentCourse.progress}%
                </span>
              </div>
              <div
                style={{
                  height: '8px',
                  backgroundColor: '#E2E8F0',
                  borderRadius: PORTAL_TOKENS.radii.full,
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${currentCourse.progress}%`,
                    backgroundColor: PORTAL_TOKENS.colors.primary,
                    borderRadius: PORTAL_TOKENS.radii.full,
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: PORTAL_TOKENS.colors.textSecondary }}>
              <Clock size={15} color={PORTAL_TOKENS.colors.primary} />
              <span>Bài học tiếp theo: <strong>{currentCourse.nextLesson}</strong></span>
            </div>
          </div>

          <div>
            <PortalButton
              variant="primary"
              size="lg"
              icon={<Play size={16} />}
              onClick={onContinueLearning}
            >
              Tiếp tục học
            </PortalButton>
          </div>
        </div>
      </PortalCard>

      {/* ── KHU VỰC 2 & KHU VỰC 3: LỊCH SẮP TỚI & TÓM TẮT HỌC TẬP (GRID 2 CỘT) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}
      >
        {/* 2. Lịch sắp tới */}
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
              <Calendar size={18} color={PORTAL_TOKENS.colors.primary} />
              Lịch sắp tới
            </h2>
            {onOpenSchedule && (
              <button
                onClick={onOpenSchedule}
                style={{
                  background: 'none',
                  border: 'none',
                  color: PORTAL_TOKENS.colors.primary,
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Xem tất cả →
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Lịch học */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: PORTAL_TOKENS.radii.sm,
                backgroundColor: '#F8FAFC',
                border: `1px solid ${PORTAL_TOKENS.colors.border}`
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: PORTAL_TOKENS.radii.sm,
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: PORTAL_TOKENS.colors.primary,
                  flexShrink: 0
                }}
              >
                <Calendar size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: PORTAL_TOKENS.colors.text }}>
                  {schedules.length > 0 ? schedules[0].title : 'Buổi 07: Kỹ năng định dạng bảng tính Excel'}
                </div>
                <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.textMuted, marginTop: '2px' }}>
                  {schedules.length > 0 ? `${schedules[0].date} • ${schedules[0].startTime} - ${schedules[0].endTime} • ${schedules[0].room}` : 'Hôm nay • 19:30 - 21:30 • Phòng LAB 01'}
                </div>
              </div>
              <PortalBadge variant="neutral" size="sm">Lịch học</PortalBadge>
            </div>

            {/* Hạn nộp bài */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: PORTAL_TOKENS.radii.sm,
                backgroundColor: '#F8FAFC',
                border: `1px solid ${PORTAL_TOKENS.colors.border}`
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: PORTAL_TOKENS.radii.sm,
                  backgroundColor: '#FFF4E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: PORTAL_TOKENS.colors.warning,
                  flexShrink: 0
                }}
              >
                <CheckSquare size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: PORTAL_TOKENS.colors.text }}>
                  Bài tập 03: Thiết kế mẫu biểu báo cáo tài chính
                </div>
                <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.textMuted, marginTop: '2px' }}>
                  Hạn nộp: Ngày mai, 23:59
                </div>
              </div>
              <PortalBadge variant="warning" size="sm">Hạn nộp bài</PortalBadge>
            </div>

            {/* Lịch kiểm tra & Điểm danh */}
            <div
              onClick={onOpenAttendance}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: PORTAL_TOKENS.radii.sm,
                backgroundColor: '#F8FAFC',
                border: `1px solid ${PORTAL_TOKENS.colors.border}`,
                cursor: onOpenAttendance ? 'pointer' : 'default'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: PORTAL_TOKENS.radii.sm,
                  backgroundColor: '#E8F5E9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: PORTAL_TOKENS.colors.success,
                  flexShrink: 0
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: PORTAL_TOKENS.colors.text }}>
                  Điểm danh buổi học & Khảo sát giữa kỳ
                </div>
                <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.textMuted, marginTop: '2px' }}>
                  Yêu cầu: Có mặt trước 19:45 để quét QR
                </div>
              </div>
              <PortalBadge variant="success" size="sm">Hạn điểm danh</PortalBadge>
            </div>
          </div>
        </PortalCard>

        {/* 3. Tóm tắt học tập */}
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
              <TrendingUp size={18} color={PORTAL_TOKENS.colors.primary} />
              Tóm tắt học tập
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }}
          >
            {/* KPI 1: Số khóa học đang học */}
            <div
              onClick={onOpenCourses}
              style={{
                padding: '14px',
                borderRadius: PORTAL_TOKENS.radii.sm,
                backgroundColor: '#F8FAFC',
                border: `1px solid ${PORTAL_TOKENS.colors.border}`,
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.textMuted, marginBottom: '4px' }}>
                Khóa học đang học
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: PORTAL_TOKENS.colors.primary }}>
                2
              </div>
              <div style={{ fontSize: '11px', color: PORTAL_TOKENS.colors.textSecondary, marginTop: '2px' }}>
                Đang theo học
              </div>
            </div>

            {/* KPI 2: Số bài tập chưa hoàn thành */}
            <div
              onClick={onOpenAssignments}
              style={{
                padding: '14px',
                borderRadius: PORTAL_TOKENS.radii.sm,
                backgroundColor: '#F8FAFC',
                border: `1px solid ${PORTAL_TOKENS.colors.border}`,
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.textMuted, marginBottom: '4px' }}>
                Bài tập chưa nộp
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: PORTAL_TOKENS.colors.warning }}>
                1
              </div>
              <div style={{ fontSize: '11px', color: PORTAL_TOKENS.colors.textSecondary, marginTop: '2px' }}>
                Cần hoàn thành
              </div>
            </div>

            {/* KPI 3: Tỷ lệ hoàn thành */}
            <div
              style={{
                padding: '14px',
                borderRadius: PORTAL_TOKENS.radii.sm,
                backgroundColor: '#F8FAFC',
                border: `1px solid ${PORTAL_TOKENS.colors.border}`
              }}
            >
              <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.textMuted, marginBottom: '4px' }}>
                Tỷ lệ hoàn thành
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: PORTAL_TOKENS.colors.success }}>
                68%
              </div>
              <div style={{ fontSize: '11px', color: PORTAL_TOKENS.colors.textSecondary, marginTop: '2px' }}>
                Đạt tiến độ chuẩn
              </div>
            </div>

            {/* KPI 4: Chứng chỉ đã đạt */}
            <div
              onClick={onOpenCertificates}
              style={{
                padding: '14px',
                borderRadius: PORTAL_TOKENS.radii.sm,
                backgroundColor: '#F8FAFC',
                border: `1px solid ${PORTAL_TOKENS.colors.border}`,
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.textMuted, marginBottom: '4px' }}>
                Chứng chỉ đã đạt
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: PORTAL_TOKENS.colors.primary }}>
                1
              </div>
              <div style={{ fontSize: '11px', color: PORTAL_TOKENS.colors.textSecondary, marginTop: '2px' }}>
                IC3 Chuẩn Quốc Tế
              </div>
            </div>
          </div>
        </PortalCard>
      </div>

      {/* ── KHU VỰC 4: KHÓA HỌC ĐỀ XUẤT (TỐI ĐA 3-4 KHÓA, THẺ TRẮNG ĐỒNG BỘ) ── */}
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
              Khóa học đề xuất
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: PORTAL_TOKENS.colors.textMuted }}>
              Lộ trình được tuyển chọn phù hợp với định hướng kỹ năng số của bạn.
            </p>
          </div>
          {onOpenCourses && (
            <PortalButton variant="outline" size="sm" onClick={onOpenCourses}>
              Xem tất cả khóa học
            </PortalButton>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}
        >
          {recommendedCourses.map((rc) => (
            <PortalCard key={rc.id} padding="20px" hoverable>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <PortalBadge variant="neutral" size="sm">{rc.category}</PortalBadge>
                <span style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.textMuted }}>{rc.duration}</span>
              </div>

              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: PORTAL_TOKENS.typography.weights.semibold,
                  color: PORTAL_TOKENS.colors.text,
                  margin: '0 0 10px 0',
                  lineHeight: 1.4,
                  minHeight: '42px'
                }}
              >
                {rc.title}
              </h3>

              <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.textSecondary, marginBottom: '16px' }}>
                Giảng viên: {rc.instructor} • {rc.lessonsCount} bài học
              </div>

              <PortalButton
                variant="outline"
                size="sm"
                fullWidth
                onClick={onOpenCourses}
              >
                Xem chi tiết
              </PortalButton>
            </PortalCard>
          ))}
        </div>
      </div>
    </div>
  );
};
