/**
 * CourseCatalogPage — Trang danh sách khóa học công khai
 * LMS EduQuest — PH Digital Education
 */
import { useState, useEffect } from 'react';
import {
  BookOpen, Users, Star, Search,
  Code2, Monitor, Cpu, Award, Play, Globe
} from 'lucide-react';
import type { Course } from '../../types/course';

// Demo courses cho fallback khi chưa có backend
const DEMO_COURSES: Course[] = [
  {
    id: 'course-office-fast',
    slug: 'office-cap-toc-3in1',
    title: 'Microsoft Office Cấp Tốc 3-in-1',
    description: 'Word, Excel và PowerPoint trong 3 buổi học chuyên sâu. Phù hợp cho người đi làm cần kỹ năng tin học văn phòng gấp.',
    track: 'office-fast-3in1',
    thumbnail_url: '',
    price_vnd: 500000,
    status: 'published',
    sort_order: 1,
    created_at: '2026-01-01',
    lesson_count: 9,
    enrolled_count: 248,
    instructor_name: 'Thầy Quang Huy'
  },
  {
    id: 'course-cc-cntt-basic',
    slug: 'chung-chi-cntt-co-ban',
    title: 'Chứng Chỉ CNTT Cơ Bản (IC3)',
    description: 'Ôn luyện và thi lấy chứng chỉ Tin học cơ bản theo tiêu chuẩn quốc gia. Cam kết đậu sau 6 buổi học.',
    track: 'cc-cntt-basic',
    thumbnail_url: '',
    price_vnd: 800000,
    status: 'published',
    sort_order: 2,
    created_at: '2026-01-01',
    lesson_count: 18,
    enrolled_count: 156,
    instructor_name: 'Cô Hoàng Mai'
  },
  {
    id: 'course-ai-office',
    slug: 'ung-dung-ai-van-phong',
    title: 'Ứng Dụng AI Vào Văn Phòng',
    description: 'Làm chủ ChatGPT, Copilot, Gemini trong công việc văn phòng hằng ngày. Tăng năng suất 5x bằng AI.',
    track: 'ai-office',
    thumbnail_url: '',
    price_vnd: 1200000,
    status: 'published',
    sort_order: 3,
    created_at: '2026-01-01',
    lesson_count: 15,
    enrolled_count: 312,
    instructor_name: 'Thầy Quang Huy'
  },
  {
    id: 'course-fe-modern',
    slug: 'lap-trinh-frontend-hien-dai',
    title: 'Lập Trình Frontend (FE) Hiện Đại',
    description: 'HTML5, CSS3, JavaScript ES6+, React 18, TypeScript, Tailwind CSS. Xây dựng giao diện web chuyên nghiệp từ đầu.',
    track: 'web-frontend',
    thumbnail_url: '',
    price_vnd: 2500000,
    status: 'published',
    sort_order: 4,
    created_at: '2026-01-01',
    lesson_count: 42,
    enrolled_count: 89,
    instructor_name: 'Thầy Quang Huy'
  },
  {
    id: 'course-be-professional',
    slug: 'lap-trinh-backend-chuyen-nghiep',
    title: 'Lập Trình Backend (BE) Chuyên Nghiệp',
    description: 'Python, Django REST Framework, Node.js, PostgreSQL, RESTful API, JWT Auth, Microservices. Kiến trúc server-side toàn diện.',
    track: 'web-backend',
    thumbnail_url: '',
    price_vnd: 3000000,
    status: 'published',
    sort_order: 5,
    created_at: '2026-01-01',
    lesson_count: 55,
    enrolled_count: 67,
    instructor_name: 'Thầy Quang Huy'
  },
  {
    id: 'course-excel-accounting',
    slug: 'excel-ke-toan',
    title: 'Excel Cho Kế Toán',
    description: 'Hàm tài chính, Pivot Table, VBA macro tự động hóa, báo cáo kế toán chuyên nghiệp với Excel.',
    track: 'excel-accounting',
    thumbnail_url: '',
    price_vnd: 900000,
    status: 'published',
    sort_order: 6,
    created_at: '2026-01-01',
    lesson_count: 24,
    enrolled_count: 134,
    instructor_name: 'Cô Thu Minh'
  }
];

const TRACK_ICON: Record<string, JSX.Element> = {
  'office-fast-3in1': <Monitor size={16} />,
  'cc-cntt-basic': <Award size={16} />,
  'cc-cntt-advanced': <Award size={16} />,
  'ai-office': <Cpu size={16} />,
  'excel-accounting': <BookOpen size={16} />,
  'web-frontend': <Code2 size={16} />,
  'web-backend': <Globe size={16} />,
};

const TRACK_COLOR: Record<string, string> = {
  'office-fast-3in1': '#0057B8',
  'cc-cntt-basic': '#7C3AED',
  'cc-cntt-advanced': '#6D28D9',
  'ai-office': '#059669',
  'excel-accounting': '#D97706',
  'web-frontend': '#0284C7',
  'web-backend': '#0369A1',
  'word-6b': '#1D4ED8',
  'excel-6b': '#166534',
  'ppt-6b': '#B45309',
};

function formatPrice(price: number): string {
  if (price === 0) return 'Miễn phí';
  return price.toLocaleString('vi-VN') + ' ₫';
}

interface CourseCardProps {
  course: Course;
  onEnroll?: (course: Course) => void;
}

function CourseCard({ course, onEnroll }: CourseCardProps) {
  const trackColor = TRACK_COLOR[course.track || ''] || '#0057B8';
  const TrackIcon = TRACK_ICON[course.track || ''] || <BookOpen size={16} />;

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #E2E8F0',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.2s, transform 0.2s',
      display: 'flex',
      flexDirection: 'column',
      cursor: 'pointer'
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,87,184,0.12)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Thumbnail */}
      <div style={{
        background: `linear-gradient(135deg, ${trackColor}15 0%, ${trackColor}30 100%)`,
        height: '140px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={{
          width: '64px', height: '64px',
          background: `${trackColor}20`,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: trackColor, fontSize: '28px'
        }}>
          {course.track?.startsWith('web-frontend') ? <Code2 size={32} /> :
           course.track?.startsWith('web-backend') ? <Globe size={32} /> :
           course.track?.includes('ai') ? <Cpu size={32} /> :
           course.track?.includes('excel') ? <BookOpen size={32} /> :
           <Monitor size={32} />}
        </div>
        {course.price_vnd === 0 && (
          <div style={{
            position: 'absolute', top: '12px', right: '12px',
            background: '#16A34A', color: '#ffffff',
            fontSize: '11px', fontWeight: '700', padding: '2px 8px',
            borderRadius: '9999px'
          }}>
            MIỄN PHÍ
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Track badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          background: `${trackColor}12`, color: trackColor,
          fontSize: '11px', fontWeight: '600', padding: '3px 10px',
          borderRadius: '9999px', width: 'fit-content'
        }}>
          {TrackIcon}
          <span>{course.track?.toUpperCase().replace(/-/g, ' ')}</span>
        </div>

        {/* Title */}
        <h3 style={{
          margin: 0, fontSize: '16px', fontWeight: '700',
          color: '#0F172A', lineHeight: '1.4'
        }}>
          {course.title}
        </h3>

        {/* Description */}
        <p style={{
          margin: 0, fontSize: '13px', color: '#64748B',
          lineHeight: '1.6', flex: 1,
          display: '-webkit-box', WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {course.description}
        </p>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: '16px',
          fontSize: '12px', color: '#64748B'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BookOpen size={13} /> {course.lesson_count || 0} bài
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={13} /> {course.enrolled_count || 0} học viên
          </span>
          {course.instructor_name && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={13} fill="#F59E0B" color="#F59E0B" /> {course.instructor_name}
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: '4px', paddingTop: '12px',
          borderTop: '1px solid #F1F5F9'
        }}>
          <div>
            <div style={{
              fontSize: '18px', fontWeight: '800',
              color: course.price_vnd === 0 ? '#16A34A' : '#0057B8'
            }}>
              {formatPrice(course.price_vnd)}
            </div>
          </div>
          <button
            onClick={() => onEnroll?.(course)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#0057B8', color: '#ffffff',
              border: 'none', borderRadius: '8px',
              padding: '8px 16px', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', transition: 'background 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1D4ED8')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0057B8')}
          >
            <Play size={14} fill="currentColor" />
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  );
}

const CATEGORY_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'office', label: 'Tin học VP' },
  { id: 'certification', label: 'Chứng chỉ' },
  { id: 'webdev', label: 'Lập trình Web' },
  { id: 'ai', label: 'AI & Tự động hóa' },
];

function matchCategory(course: Course, cat: string): boolean {
  if (cat === 'all') return true;
  if (cat === 'office') return ['office-fast-3in1','word-6b','excel-6b','ppt-6b','excel-accounting'].includes(course.track || '');
  if (cat === 'certification') return ['cc-cntt-basic','cc-cntt-advanced','cntt-basic-we','cntt-adv-we'].includes(course.track || '');
  if (cat === 'webdev') return (course.track || '').startsWith('web-');
  if (cat === 'ai') return course.track === 'ai-office';
  return true;
}

interface CourseCatalogPageProps {
  onCourseSelect?: (course: Course) => void;
  showHeader?: boolean;
}

export function CourseCatalogPage({ onCourseSelect, showHeader = true }: CourseCatalogPageProps) {
  const [courses, setCourses] = useState<Course[]>(DEMO_COURSES);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    // Try to fetch from API, fall back to demo data
    fetch('/api/courses')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data?.length) setCourses(data.data);
      })
      .catch(() => { /* use demo */ })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = courses.filter(c =>
    matchCategory(c, activeCategory) &&
    (searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      {showHeader && (
        <div style={{
          background: 'linear-gradient(135deg, #0057B8 0%, #1D4ED8 100%)',
          color: '#ffffff', padding: '48px 24px', textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '32px', fontWeight: '800' }}>
            Danh Sách Khóa Học
          </h1>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '16px' }}>
            Chọn lộ trình học phù hợp — từ tin học văn phòng đến lập trình chuyên nghiệp
          </p>
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{
            flex: 1, minWidth: '240px', position: 'relative',
            display: 'flex', alignItems: 'center'
          }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', color: '#94A3B8' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm khóa học..."
              style={{
                width: '100%', padding: '10px 12px 10px 36px',
                border: '1px solid #E2E8F0', borderRadius: '10px',
                fontSize: '14px', background: '#ffffff', outline: 'none',
                color: '#0F172A'
              }}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              style={{
                padding: '8px 18px', borderRadius: '9999px',
                border: activeCategory === tab.id ? 'none' : '1px solid #E2E8F0',
                background: activeCategory === tab.id ? '#0057B8' : '#ffffff',
                color: activeCategory === tab.id ? '#ffffff' : '#64748B',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div style={{ marginBottom: '20px', color: '#64748B', fontSize: '14px' }}>
          Hiển thị <strong style={{ color: '#0F172A' }}>{filtered.length}</strong> khóa học
          {searchQuery && ` cho "${searchQuery}"`}
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{
                height: '360px', background: '#E2E8F0',
                borderRadius: '16px', animation: 'pulse 1.5s infinite'
              }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
            <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
            <p style={{ fontSize: '16px', margin: 0 }}>Không tìm thấy khóa học phù hợp</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {filtered.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={onCourseSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
