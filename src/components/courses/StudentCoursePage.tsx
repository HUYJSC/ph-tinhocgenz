import React, { useState } from 'react';
import {
  BookOpen, Search, Play, Users, Clock,
  Filter, Sparkles
} from 'lucide-react';
import { PORTAL_TOKENS } from '../../styles/portalDesignTokens';
import { PortalCard } from '../ui/PortalCard';
import { PortalButton } from '../ui/PortalButton';
import { PortalBadge } from '../ui/PortalBadge';
import { PortalEmptyState } from '../ui/PortalEmptyState';

export type MainTabType = 'my_courses' | 'explore';
export type FilterCategory = 'all' | 'in_progress' | 'not_started' | 'completed' | 'office' | 'certificate' | 'web' | 'ai';

export interface EnrolledCourse {
  id: string;
  title: string;
  instructor: string;
  thumbnailUrl?: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  nextLesson: string;
  status: 'in_progress' | 'not_started' | 'completed';
  category: string;
}

export interface ExploreCourse {
  id: string;
  title: string;
  category: string;
  lessonsCount: number;
  enrolledStudentsCount: number;
  priceVnd: number;
  thumbnailUrl?: string;
  instructor: string;
}

export interface StudentCoursePageProps {
  onContinueLearning?: (courseId: string) => void;
  onViewCourseDetail?: (courseId: string) => void;
}

export const StudentCoursePage: React.FC<StudentCoursePageProps> = ({
  onContinueLearning,
  onViewCourseDetail
}) => {
  const [mainTab, setMainTab] = useState<MainTabType>('my_courses');
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Enrolled courses data
  const enrolledCourses: EnrolledCourse[] = [
    {
      id: 'enc-1',
      title: 'Word, Excel, PowerPoint 3-in-1 Thực Chiến',
      instructor: 'Thầy Quang Huy',
      progress: 68,
      completedLessons: 16,
      totalLessons: 24,
      nextLesson: 'Bài 17: Phân tích dữ liệu bằng Pivot Table',
      status: 'in_progress',
      category: 'office'
    },
    {
      id: 'enc-2',
      title: 'Luyện Thi Chứng Chỉ IC3 GS6 Chuẩn Quốc Tế',
      instructor: 'Cô Hoàng Mai',
      progress: 25,
      completedLessons: 4,
      totalLessons: 16,
      nextLesson: 'Bài 05: An toàn số & Bảo mật thông tin mạng',
      status: 'in_progress',
      category: 'certificate'
    },
    {
      id: 'enc-3',
      title: 'Kỹ Năng Soạn Thảo Văn Bản Chuẩn Nghị Định 30',
      instructor: 'Thầy Nguyễn Đình Huy',
      progress: 0,
      completedLessons: 0,
      totalLessons: 8,
      nextLesson: 'Bài 01: Quy cách trình bày và thể thức văn bản',
      status: 'not_started',
      category: 'office'
    },
    {
      id: 'enc-4',
      title: 'Nhập Môn Tin Học Căn Bản Cho Người Mới Bắt Đầu',
      instructor: 'Cô Thu Minh',
      progress: 100,
      completedLessons: 10,
      totalLessons: 10,
      nextLesson: 'Đã hoàn thành toàn bộ chương trình',
      status: 'completed',
      category: 'office'
    }
  ];

  // Explore courses data (Unregistered courses)
  const exploreCourses: ExploreCourse[] = [
    {
      id: 'exp-1',
      title: 'Ứng Dụng AI & Gemini Vào Tự Động Hóa Văn Phòng',
      category: 'AI & Tự động hóa',
      lessonsCount: 15,
      enrolledStudentsCount: 312,
      priceVnd: 1200000,
      instructor: 'Thầy Quang Huy'
    },
    {
      id: 'exp-2',
      title: 'Excel Cho Kế Toán & Phân Tích Tài Chính Nâng Cao',
      category: 'Tin học văn phòng',
      lessonsCount: 20,
      enrolledStudentsCount: 184,
      priceVnd: 950000,
      instructor: 'Cô Thu Minh'
    },
    {
      id: 'exp-3',
      title: 'Lập Trình Web Frontend Hiện Đại (HTML, CSS, React)',
      category: 'Lập trình Web',
      lessonsCount: 36,
      enrolledStudentsCount: 145,
      priceVnd: 2500000,
      instructor: 'Thầy Nguyễn Đình Huy'
    },
    {
      id: 'exp-4',
      title: 'Luyện Thi Chứng Chỉ Tin Học Cơ Bản Chuẩn TT03',
      category: 'Chứng chỉ',
      lessonsCount: 14,
      enrolledStudentsCount: 220,
      priceVnd: 800000,
      instructor: 'Cô Hoàng Mai'
    }
  ];

  // Filter chips
  const filterOptions: Array<{ id: FilterCategory; label: string }> = [
    { id: 'all', label: 'Tất cả' },
    { id: 'in_progress', label: 'Đang học' },
    { id: 'not_started', label: 'Chưa bắt đầu' },
    { id: 'completed', label: 'Hoàn thành' },
    { id: 'office', label: 'Tin học văn phòng' },
    { id: 'certificate', label: 'Chứng chỉ' },
    { id: 'web', label: 'Lập trình Web' },
    { id: 'ai', label: 'AI & Tự động hóa' }
  ];

  // Filter enrolled courses
  const filteredEnrolledCourses = enrolledCourses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'in_progress') return c.status === 'in_progress';
    if (selectedFilter === 'not_started') return c.status === 'not_started';
    if (selectedFilter === 'completed') return c.status === 'completed';
    if (selectedFilter === 'office') return c.category === 'office';
    if (selectedFilter === 'certificate') return c.category === 'certificate';
    return true;
  });

  // Filter explore courses
  const filteredExploreCourses = exploreCourses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'office') return c.category.includes('văn phòng');
    if (selectedFilter === 'certificate') return c.category.includes('Chứng chỉ');
    if (selectedFilter === 'web') return c.category.includes('Web');
    if (selectedFilter === 'ai') return c.category.includes('AI');
    return true;
  });

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return price.toLocaleString('vi-VN') + ' ₫';
  };

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
      {/* ── HEADER & SEARCH ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
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
            Quản Lý Khóa Học
          </h1>
          <p style={{ margin: 0, fontSize: PORTAL_TOKENS.typography.sizes.body, color: PORTAL_TOKENS.colors.textMuted }}>
            Theo dõi tiến độ học tập và đăng ký các chương trình đào tạo chuẩn kỹ năng số.
          </p>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <Search size={16} color={PORTAL_TOKENS.colors.textMuted} style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên khóa học, giảng viên..."
            style={{
              width: '100%',
              height: '40px',
              paddingLeft: '38px',
              paddingRight: '12px',
              borderRadius: PORTAL_TOKENS.radii.sm,
              border: `1px solid ${PORTAL_TOKENS.colors.border}`,
              backgroundColor: PORTAL_TOKENS.colors.card,
              fontSize: '13px',
              color: PORTAL_TOKENS.colors.text,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* ── TAB SELECTOR: TAB A (Khóa học của tôi) vs TAB B (Khám phá khóa học) ── */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: `1px solid ${PORTAL_TOKENS.colors.border}`,
          paddingBottom: '2px'
        }}
      >
        <button
          onClick={() => {
            setMainTab('my_courses');
            setSelectedFilter('all');
          }}
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: mainTab === 'my_courses' ? 700 : 500,
            color: mainTab === 'my_courses' ? PORTAL_TOKENS.colors.primary : PORTAL_TOKENS.colors.textSecondary,
            border: 'none',
            borderBottom: mainTab === 'my_courses' ? `2px solid ${PORTAL_TOKENS.colors.primary}` : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <BookOpen size={16} />
          Khóa học của tôi ({enrolledCourses.length})
        </button>

        <button
          onClick={() => {
            setMainTab('explore');
            setSelectedFilter('all');
          }}
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: mainTab === 'explore' ? 700 : 500,
            color: mainTab === 'explore' ? PORTAL_TOKENS.colors.primary : PORTAL_TOKENS.colors.textSecondary,
            border: 'none',
            borderBottom: mainTab === 'explore' ? `2px solid ${PORTAL_TOKENS.colors.primary}` : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Sparkles size={16} />
          Khám phá khóa học ({exploreCourses.length})
        </button>
      </div>

      {/* ── BỘ LỌC DANH MỤC & TRẠNG THÁI ── */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: PORTAL_TOKENS.colors.textMuted, display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
          <Filter size={14} /> Bộ lọc:
        </span>
        {filterOptions.map((opt) => {
          // If in explore tab, don't show status filters (in_progress, not_started, completed)
          if (mainTab === 'explore' && ['in_progress', 'not_started', 'completed'].includes(opt.id)) {
            return null;
          }

          const isSelected = selectedFilter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setSelectedFilter(opt.id)}
              style={{
                padding: '6px 12px',
                borderRadius: PORTAL_TOKENS.radii.sm,
                fontSize: '12px',
                fontWeight: isSelected ? 600 : 500,
                border: `1px solid ${isSelected ? PORTAL_TOKENS.colors.primary : PORTAL_TOKENS.colors.border}`,
                backgroundColor: isSelected ? '#EFF6FF' : PORTAL_TOKENS.colors.card,
                color: isSelected ? PORTAL_TOKENS.colors.primary : PORTAL_TOKENS.colors.textSecondary,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB A: KHÓA HỌC CỦA TÔI ── */}
      {mainTab === 'my_courses' && (
        <div>
          {filteredEnrolledCourses.length === 0 ? (
            <PortalEmptyState
              icon={<BookOpen size={24} />}
              title="Không tìm thấy khóa học phù hợp"
              description="Bạn chưa đăng ký khóa học nào trong danh mục này hoặc từ khóa tìm kiếm không khớp."
              actionText="Khám phá khóa học ngay"
              onAction={() => setMainTab('explore')}
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
              }}
            >
              {filteredEnrolledCourses.map((course) => (
                <PortalCard key={course.id} padding="20px" hoverable>
                  {/* Status badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    {course.status === 'completed' ? (
                      <PortalBadge variant="success" size="sm">Đã hoàn thành</PortalBadge>
                    ) : course.status === 'not_started' ? (
                      <PortalBadge variant="neutral" size="sm">Chưa bắt đầu</PortalBadge>
                    ) : (
                      <PortalBadge variant="primary" size="sm">Đang học</PortalBadge>
                    )}
                    <span style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.textMuted }}>
                      {course.completedLessons}/{course.totalLessons} bài học
                    </span>
                  </div>

                  {/* Course Title */}
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: PORTAL_TOKENS.typography.weights.bold,
                      color: PORTAL_TOKENS.colors.text,
                      margin: '0 0 6px 0',
                      lineHeight: 1.4,
                      minHeight: '44px'
                    }}
                  >
                    {course.title}
                  </h3>

                  {/* Instructor */}
                  <div style={{ fontSize: '13px', color: PORTAL_TOKENS.colors.textSecondary, marginBottom: '16px' }}>
                    Giảng viên: <strong>{course.instructor}</strong>
                  </div>

                  {/* Progress */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: PORTAL_TOKENS.colors.textSecondary }}>
                      <span>Tiến độ học tập</span>
                      <span style={{ fontWeight: 700, color: PORTAL_TOKENS.colors.primary }}>{course.progress}%</span>
                    </div>
                    <div
                      style={{
                        height: '6px',
                        backgroundColor: '#E2E8F0',
                        borderRadius: PORTAL_TOKENS.radii.full,
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${course.progress}%`,
                          backgroundColor: course.status === 'completed' ? PORTAL_TOKENS.colors.success : PORTAL_TOKENS.colors.primary,
                          borderRadius: PORTAL_TOKENS.radii.full
                        }}
                      />
                    </div>
                  </div>

                  {/* Next Lesson */}
                  <div
                    style={{
                      fontSize: '12px',
                      color: PORTAL_TOKENS.colors.textMuted,
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    <Clock size={14} color={PORTAL_TOKENS.colors.primary} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {course.status === 'completed' ? 'Khóa học đã hoàn tất' : `Bài tiếp: ${course.nextLesson}`}
                    </span>
                  </div>

                  {/* ACTION: Strictly "Tiếp tục học" CTA. NO price and NO "Đăng ký" button for enrolled courses! */}
                  <PortalButton
                    variant={course.status === 'completed' ? 'outline' : 'primary'}
                    fullWidth
                    icon={<Play size={15} />}
                    onClick={() => onContinueLearning && onContinueLearning(course.id)}
                  >
                    {course.status === 'completed' ? 'Ôn tập lại' : 'Tiếp tục học'}
                  </PortalButton>
                </PortalCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB B: KHÁM PHÁ KHÓA HỌC (Chưa đăng ký) ── */}
      {mainTab === 'explore' && (
        <div>
          {filteredExploreCourses.length === 0 ? (
            <PortalEmptyState
              icon={<Search size={24} />}
              title="Không tìm thấy khóa học"
              description="Hiện không có khóa học nào phù hợp với bộ lọc đã chọn."
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
              }}
            >
              {filteredExploreCourses.map((course) => (
                <PortalCard key={course.id} padding="20px" hoverable>
                  {/* Category badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <PortalBadge variant="neutral" size="sm">{course.category}</PortalBadge>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: PORTAL_TOKENS.colors.primary }}>
                      {formatPrice(course.priceVnd)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: PORTAL_TOKENS.typography.weights.bold,
                      color: PORTAL_TOKENS.colors.text,
                      margin: '0 0 8px 0',
                      lineHeight: 1.4,
                      minHeight: '44px'
                    }}
                  >
                    {course.title}
                  </h3>

                  {/* Instructor */}
                  <div style={{ fontSize: '13px', color: PORTAL_TOKENS.colors.textSecondary, marginBottom: '14px' }}>
                    Giảng viên: <strong>{course.instructor}</strong>
                  </div>

                  {/* Stats: Lessons count & Enrolled count */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '12px',
                      color: PORTAL_TOKENS.colors.textMuted,
                      marginBottom: '20px',
                      paddingTop: '8px',
                      borderTop: `1px solid ${PORTAL_TOKENS.colors.border}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BookOpen size={14} />
                      <span>{course.lessonsCount} bài học</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={14} />
                      <span>{course.enrolledStudentsCount} học viên</span>
                    </div>
                  </div>

                  {/* Action: "Xem chi tiết" CTA */}
                  <PortalButton
                    variant="outline"
                    fullWidth
                    onClick={() => onViewCourseDetail && onViewCourseDetail(course.id)}
                  >
                    Xem chi tiết
                  </PortalButton>
                </PortalCard>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
