import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Award, BarChart3, BookOpen, Check, ChevronRight,
  ClipboardCheck, Clock3, FileCheck2, GraduationCap, Laptop,
  Menu, MonitorCheck, PlayCircle, ShieldCheck, Sparkles, Target, X,
  LayoutDashboard, Users, ShieldAlert, QrCode, Cpu, Layers
} from 'lucide-react';
import { LmsPortalSwitcher } from '../layout/LmsPortalSwitcher';
import './landing.css';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigateToCourses?: () => void;
  onNavigateToPortal?: (portal: 'student' | 'teacher' | 'giaovu' | 'admin' | 'attendance' | 'verify') => void;
}

type CourseCategory = 'all' | 'web-dev' | 'mos-ic3' | 'cntt' | 'office';

interface Course {
  id: string;
  category: Exclude<CourseCategory, 'all'>;
  title: string;
  label: string;
  description: string;
  duration: string;
  lessons: string;
  level: string;
  icon: typeof BookOpen;
  featured?: boolean;
}

const COURSES: Course[] = [
  { id: 'web-frontend-react', category: 'web-dev', title: 'Lập trình Frontend (FE) Hiện Đại', label: 'Frontend Web Dev', description: 'Nắm vững HTML5, CSS3, JavaScript ES6+, React 18, TypeScript và xây dựng giao diện người dùng Responsive tốc độ cao.', duration: '12 buổi', lessons: 'React & TypeScript', level: 'Thực chiến', icon: MonitorCheck, featured: true },
  { id: 'web-backend-python', category: 'web-dev', title: 'Lập trình Backend (BE) Chuyên Nghiệp', label: 'Backend Web Dev', description: 'Làm chủ Python, Django REST Framework, Node.js, CSDL SQL/PostgreSQL và thiết kế hệ thống RESTful API an toàn, bảo mật.', duration: '12 buổi', lessons: 'Python, API & SQL', level: 'Chuyên sâu', icon: Target, featured: true },
  { id: 'web-fullstack-dev', category: 'web-dev', title: 'Fullstack Web Developer (FE + BE)', label: 'Fullstack Mastery', description: 'Tích hợp toàn diện Frontend React với Backend API, cơ chế xác thực Session/JWT, ORM và triển khai Cloud Vercel/Docker.', duration: '16 buổi', lessons: 'Fullstack Project', level: 'Toàn diện', icon: Laptop, featured: true },
  { id: 'office-3-in-1', category: 'office', title: 'Tin học văn phòng 3 trong 1', label: 'Word · Excel · PowerPoint', description: 'Xây dựng nền tảng làm việc với bộ công cụ văn phòng thông qua bài tập thực hành.', duration: '10–12 buổi', lessons: '3 chuyên đề', level: 'Cơ bản', icon: Laptop, featured: true },
  { id: 'mos-excel', category: 'mos-ic3', title: 'MOS Excel 2019/365', label: 'Chứng chỉ MOS', description: 'Học theo nhóm kỹ năng, luyện thao tác và làm bài kiểm tra theo thời gian.', duration: '6 buổi', lessons: 'Excel', level: 'Cơ bản–nâng cao', icon: BarChart3, featured: true },
  { id: 'mos-word', category: 'mos-ic3', title: 'MOS Word 2019/365', label: 'Chứng chỉ MOS', description: 'Rèn kỹ năng định dạng tài liệu, quản lý nội dung và xử lý văn bản chuyên nghiệp.', duration: '6 buổi', lessons: 'Word', level: 'Cơ bản–nâng cao', icon: FileCheck2, featured: true },
  { id: 'mos-powerpoint', category: 'mos-ic3', title: 'MOS PowerPoint', label: 'Chứng chỉ MOS', description: 'Thiết kế bài trình chiếu có bố cục rõ ràng và sử dụng công cụ trình bày hiệu quả.', duration: '6 buổi', lessons: 'PowerPoint', level: 'Cơ bản–nâng cao', icon: MonitorCheck, featured: true },
  { id: 'ic3-gs6', category: 'mos-ic3', title: 'IC3 Digital Literacy GS6', label: 'Chứng chỉ IC3', description: 'Trang bị kiến thức máy tính, ứng dụng số và kỹ năng làm việc an toàn trên môi trường trực tuyến.', duration: '8 buổi', lessons: '3 cấp độ', level: 'Nền tảng số', icon: ShieldCheck, featured: true },
  { id: 'cntt-basic', category: 'cntt', title: 'Ứng dụng CNTT cơ bản', label: 'Chuẩn kỹ năng CNTT', description: 'Ôn tập kiến thức và thực hành các mô-đun kỹ năng sử dụng công nghệ thông tin cơ bản.', duration: '6 buổi', lessons: '6 mô-đun', level: 'Cơ bản', icon: GraduationCap, featured: true },
  { id: 'cntt-advanced', category: 'cntt', title: 'Ứng dụng CNTT nâng cao', label: 'Chuẩn kỹ năng CNTT', description: 'Phát triển kỹ năng xử lý tài liệu, bảng tính và dữ liệu ở mức chuyên sâu hơn.', duration: '6 buổi', lessons: 'Chuyên đề nâng cao', level: 'Nâng cao', icon: Target },
  { id: 'excel-accounting', category: 'office', title: 'Excel cho kế toán – tài chính', label: 'Ứng dụng nghề nghiệp', description: 'Thực hành quản lý dữ liệu, lập bảng biểu và xây dựng báo cáo phục vụ công việc.', duration: '8 buổi', lessons: 'Bài tập tình huống', level: 'Thực hành', icon: ClipboardCheck },
  { id: 'ai-office', category: 'office', title: 'Công cụ AI trong công việc văn phòng', label: 'Kỹ năng bổ trợ', description: 'Học cách sử dụng công cụ AI có kiểm soát để hỗ trợ soạn thảo, phân tích và trình bày.', duration: '5 buổi', lessons: 'Tình huống thực tế', level: 'Ứng dụng', icon: Sparkles }
];

const LMS_PORTALS = [
  {
    id: 'student' as const,
    roleTitle: 'Cổng Học Viên (Learner Portal)',
    specRef: 'Đặc tả Ảnh 03',
    badge: 'Học Viên / Sinh Viên',
    color: '#0057B8',
    icon: GraduationCap,
    path: '/student',
    summary: 'Không gian cá nhân hóa học tập toàn diện.',
    features: ['3 lộ trình cá nhân hóa', 'Đề thi trắc nghiệm MOS/IC3', 'Chuỗi Streak & AI Tutor 24/7', 'Thẻ nhớ Spaced Repetition']
  },
  {
    id: 'teacher' as const,
    roleTitle: 'Cổng Giảng Viên (Instructor Portal)',
    specRef: 'Đặc tả Ảnh 04',
    badge: 'Giảng Viên Bộ Môn',
    color: '#0284C7',
    icon: Users,
    path: '/teacher',
    summary: 'Trung tâm quản lý học vụ & chấm điểm lớp học.',
    features: ['Quản lý lớp học & sĩ số', 'Sổ điểm điện tử tự động', 'Chấm bài tập thực hành', 'Cảnh báo sớm học tập']
  },
  {
    id: 'giaovu' as const,
    roleTitle: 'Cổng Giáo Vụ (Academic Affairs)',
    specRef: 'Đặc tả Ảnh 05',
    badge: 'Ban Đào Tạo & Khảo Thí',
    color: '#0D9488',
    icon: LayoutDashboard,
    path: '/giaovu',
    summary: '5 KPI vận hành & điều phối học viện thông minh.',
    features: ['5 KPI điều hành trung tâm', 'Duyệt đơn nghỉ/bảo lưu', 'Kiểm soát học phí thời gian thực', 'Điều phối phòng máy & AI Giáo vụ']
  },
  {
    id: 'admin' as const,
    roleTitle: 'Cổng Quản Trị (Admin Console)',
    specRef: 'Đặc tả Ảnh 02',
    badge: 'Super Admin',
    color: '#1E293B',
    icon: ShieldAlert,
    path: '/admin',
    summary: 'Bảng điều khiển quản trị tối cao và bảo mật RBAC.',
    features: ['Giám sát toàn bộ KPI hệ thống', 'Trung tâm học liệu tự động', 'Kiểm duyệt nội dung bài giảng', 'Cấp phát & thu hồi Chứng chỉ']
  },
  {
    id: 'attendance' as const,
    roleTitle: 'Điểm Danh QR Dynamic & Anti-Fraud',
    specRef: 'Đặc tả Ảnh 06',
    badge: 'Khảo Thí & Điểm Danh',
    color: '#7C3AED',
    icon: QrCode,
    path: '/attendance',
    summary: 'Công nghệ điểm danh chống gian lận đa tầng.',
    features: ['QR Code tự xoay mỗi 15s', 'Định vị GPS Haversine', 'Risk Score 0-100 chống Proxy', 'Chặn trùng IP & thiết bị lạ']
  }
];

const LEARNING_STEPS = [
  { number: '01', title: 'Xác định mục tiêu', description: 'Chọn chương trình phù hợp với trình độ, mục tiêu học tập và thời gian của bạn.' },
  { number: '02', title: 'Học theo chuyên đề', description: 'Theo dõi nội dung theo lộ trình, thực hành ngay sau từng nhóm kiến thức.' },
  { number: '03', title: 'Luyện tập và kiểm tra', description: 'Làm bài luyện tập, thi thử có thời gian và xem lại những nội dung chưa vững.' },
  { number: '04', title: 'Theo dõi tiến bộ', description: 'Xem kết quả, tiến độ hoàn thành và tiếp tục từ đúng bài học gần nhất.' }
];

const PLATFORM_FEATURES = [
  { icon: PlayCircle, title: 'Học tập theo lộ trình', description: 'Nội dung được chia thành chương, bài học và nhiệm vụ rõ ràng.' },
  { icon: ClipboardCheck, title: 'Luyện tập có phản hồi', description: 'Thực hành theo kỹ năng, nhận kết quả và xem lại câu trả lời.' },
  { icon: Clock3, title: 'Thi thử có thời gian', description: 'Làm quen với áp lực thời gian và quy trình hoàn thành bài thi.' },
  { icon: BarChart3, title: 'Theo dõi tiến độ', description: 'Tổng hợp quá trình học và kết quả ở một khu vực thống nhất.' },
  { icon: Award, title: 'Chứng nhận điện tử', description: 'Quản lý và xác minh chứng nhận hoàn thành trên hệ thống.' },
  { icon: ShieldCheck, title: 'Phân quyền tài khoản', description: 'Không gian riêng cho học viên, giảng viên và quản trị viên.' }
];

const COURSE_TABS: Array<{ key: CourseCategory; label: string }> = [
  { key: 'all', label: 'Tất cả nổi bật' },
  { key: 'web-dev', label: 'Lập trình Web (FE & BE)' },
  { key: 'mos-ic3', label: 'MOS & IC3' },
  { key: 'cntt', label: 'Chứng chỉ CNTT' },
  { key: 'office', label: 'Kỹ năng văn phòng' }
];

export function LandingPage({ onGetStarted, onNavigateToCourses, onNavigateToPortal }: LandingPageProps) {
  const [category, setCategory] = useState<CourseCategory>('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const visibleCourses = useMemo(() => {
    if (category === 'all') return COURSES.filter((course) => course.featured);
    return COURSES.filter((course) => course.category === category);
  }, [category]);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const handlePortalClick = (portalId: 'student' | 'teacher' | 'giaovu' | 'admin' | 'attendance' | 'verify') => {
    if (onNavigateToPortal) {
      onNavigateToPortal(portalId);
    } else {
      const path = portalId === 'student' ? '/student'
        : portalId === 'teacher' ? '/teacher'
        : portalId === 'giaovu' ? '/giaovu'
        : portalId === 'admin' ? '/admin'
        : portalId === 'attendance' ? '/attendance'
        : '/verify';
      window.history.pushState(null, '', path);
      window.location.href = path;
    }
  };

  return (
    <div className="landing-page">
      {/* ── GLOBAL MULTI-PORTAL SWITCHER BANNER ── */}
      <LmsPortalSwitcher
        currentRoute="landing"
        onSelectPortal={(p) => {
          if (p === 'landing') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (p === 'courses') {
            if (onNavigateToCourses) onNavigateToCourses();
            else window.location.href = '/courses';
          } else {
            handlePortalClick(p);
          }
        }}
      />

      <header className={`landing-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="landing-shell landing-header__inner">
          <button className="brand" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img className="brand__mark" src="/logo-icon.png" alt="" width="40" height="40" />
            <span className="brand__copy"><strong>Tin Học Gen Z</strong><small>PH DIGITAL EDUCATION</small></span>
          </button>

          <nav className="landing-nav" aria-label="Điều hướng chính">
            <button type="button" onClick={() => { if (onNavigateToCourses) onNavigateToCourses(); else goTo('courses'); }}>Khóa học LMS</button>
            <button type="button" onClick={() => handlePortalClick('student')}>Cổng Học Viên</button>
            <button type="button" onClick={() => handlePortalClick('teacher')}>Cổng Giảng Viên</button>
            <button type="button" onClick={() => handlePortalClick('giaovu')}>Cổng Giáo Vụ</button>
            <button type="button" onClick={() => handlePortalClick('admin')}>Quản Trị Admin</button>
            <button type="button" onClick={() => handlePortalClick('attendance')}>Điểm Danh QR</button>
            <a href="/verify" style={{ border: 0, background: 'transparent', color: '#38536d', fontWeight: 600, fontSize: '14px', padding: '10px 14px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' }}>Thi & Chứng chỉ</a>
          </nav>

          <div className="landing-header__actions">
            <button className="button button--quiet header-login" type="button" onClick={onGetStarted}>Đăng nhập</button>
            <button className="button button--primary header-start" type="button" onClick={() => handlePortalClick('student')}>
              Vào học <ArrowRight size={17} />
            </button>
            <button className="mobile-menu-button" type="button" aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="mobile-nav" aria-label="Điều hướng di động">
            <button type="button" onClick={() => { if (onNavigateToCourses) onNavigateToCourses(); else goTo('courses'); }}>Khóa học LMS</button>
            <button type="button" onClick={() => handlePortalClick('student')}>🎓 Cổng Học Viên</button>
            <button type="button" onClick={() => handlePortalClick('teacher')}>👨‍🏫 Cổng Giảng Viên</button>
            <button type="button" onClick={() => handlePortalClick('giaovu')}>🏛️ Cổng Giáo Vụ</button>
            <button type="button" onClick={() => handlePortalClick('admin')}>⚡ Quản Trị Admin</button>
            <button type="button" onClick={() => handlePortalClick('attendance')}>📱 Điểm Danh QR Dynamic</button>
            <a href="/verify" style={{ border: 0, background: 'transparent', color: '#38536d', fontWeight: 600, fontSize: '14px', padding: '10px 14px', textDecoration: 'none', display: 'block' }}>Thi & Chứng chỉ</a>
            <button className="button button--primary" type="button" onClick={onGetStarted}>Đăng nhập hệ thống</button>
          </nav>
        )}
      </header>

      <main>
        {/* ── HERO SECTION WITH LMS SPECIFICATION SHOWCASE ── */}
        <section className="landing-hero" style={{ paddingBottom: '32px' }}>
          <div className="landing-shell landing-hero__grid">
            <div className="landing-hero__content">
              <span className="eyebrow" style={{ background: 'rgba(0,87,184,0.08)', color: '#0057B8', borderColor: 'rgba(0,87,184,0.2)' }}>
                <BookOpen size={15} /> PH DIGITAL EDUCATION — HỆ THỐNG LMS THỰC CHIẾN
              </span>
              <h1>Nâng kỹ năng số<br /><span style={{ color: '#0057B8' }}>vững bước tương lai</span></h1>
              <p className="landing-hero__lead">
                Nền tảng Quản lý Học tập & Khảo thí Số tích hợp 5 phân hệ chuyên sâu: Học viên, Giảng viên, Giáo vụ, Quản trị viên & Điểm danh QR Dynamic chống gian lận.
              </p>
              <div className="landing-hero__actions">
                <button className="button button--primary button--large" type="button" onClick={() => { if (onNavigateToCourses) onNavigateToCourses(); else goTo('courses'); }}>
                  Xem chương trình học <ArrowRight size={18} />
                </button>
                <button className="button button--secondary button--large" type="button" onClick={onGetStarted}>
                  <PlayCircle size={18} /> Kiểm tra trình độ miễn phí
                </button>
              </div>
              <ul className="hero-proof" aria-label="Ưu điểm chính">
                <li><Check size={16} /> 5 Phân hệ Role-based LMS</li>
                <li><Check size={16} /> Điểm danh QR Anti-Fraud</li>
                <li><Check size={16} /> Chứng chỉ Blockchain & RLS</li>
              </ul>
            </div>
            <div className="landing-hero__visual">
              <div className="hero-image-frame">
                <picture>
                  <source type="image/avif" srcSet="/banner-tin-hoc-gen-z-hoc-thuc-chien.avif" />
                  <source type="image/webp" srcSet="/banner-tin-hoc-gen-z-hoc-thuc-chien.webp" />
                  <img src="/banner-tin-hoc-gen-z-hoc-thuc-chien.jpg" alt="Học viên thực hành kỹ năng tin học trên máy tính" width="1920" height="720" fetchPriority="high" />
                </picture>
              </div>
              <div className="hero-progress-card">
                <span className="hero-progress-card__icon" style={{ background: '#0057B8', color: '#fff' }}><Target size={19} /></span>
                <span><strong>Hệ Thống LMS Chuẩn Khảo Thí</strong><small>Bảo mật Backend & Chống Sửa Điểm</small></span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5 INTERACTIVE PORTAL HUBS (THEO ĐÚNG 6 ẢNH SPEC) ── */}
        <section style={{ background: '#F1F5F9', padding: '48px 0', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
          <div className="landing-shell">
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <span style={{ color: '#0057B8', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                TRẢI NGHIỆM ĐA PHÂN HỆ — ĐẶC TẢ GIAO DIỆN THEO ẢNH
              </span>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
                Chọn Cổng Phân Hệ Bạn Muốn Khám Phá
              </h2>
              <p style={{ color: '#64748B', maxWidth: '640px', margin: '8px auto 0', fontSize: '15px' }}>
                Mỗi phân hệ được thiết kế chuyên biệt theo đúng luồng công tác thực tế của Trung tâm Tin học.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {LMS_PORTALS.map((portal) => {
                const Icon = portal.icon;
                return (
                  <div
                    key={portal.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: `${portal.color}15`,
                          color: portal.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Icon size={24} />
                        </div>
                        <span style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          color: '#475569',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          {portal.specRef}
                        </span>
                      </div>

                      <span style={{ color: portal.color, fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>
                        {portal.badge}
                      </span>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '4px 0 8px' }}>
                        {portal.roleTitle}
                      </h3>
                      <p style={{ color: '#64748B', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
                        {portal.summary}
                      </p>

                      <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '12px', marginBottom: '20px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                          Tính năng cốt lõi:
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {portal.features.map((feat, idx) => (
                            <li key={idx} style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Check size={13} color={portal.color} /> {feat}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePortalClick(portal.id)}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: portal.color,
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'opacity 0.15s ease'
                      }}
                    >
                      Truy cập ngay <ArrowRight size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── ARCHITECTURE & TOP 0.001% ENGINEERING SPECS (ẢNH 01) ── */}
        <section style={{ padding: '60px 0', background: '#FFFFFF' }}>
          <div className="landing-shell">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <span style={{ color: '#0057B8', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                HỆ THỐNG KIẾN TRÚC TOÀN DIỆN (ĐẶC TẢ ẢNH 01)
              </span>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
                Kiến Trúc LMS AI + Blockchain Chống Gian Lận
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Cpu size={22} color="#0057B8" />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Backend Security Layer</h3>
                </div>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>
                  100% tính điểm, đo lường thời gian và cấp chứng chỉ được tính toán server-side qua Vercel Serverless Functions. Đáp án đúng không bao giờ bị lộ về client.
                </p>
              </div>

              <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <QrCode size={22} color="#7C3AED" />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>QR Dynamic & Anti-Fraud</h3>
                </div>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>
                  Tích hợp công thức Haversine đo bán kính GPS phòng học, phát hiện cấm proxy, đánh cờ rủi ro tự động khi phát hiện đăng nhập đa tài khoản trên 1 thiết bị.
                </p>
              </div>

              <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Layers size={22} color="#0D9488" />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Role-Based Access Control (RBAC)</h3>
                </div>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>
                  Phân quyền triệt để 5 cấp độ: Học viên (student), Giảng viên (teacher), Giáo vụ (academic_staff), Quản trị viên (admin) và Super Admin với RLS Supabase.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── COURSE SECTION ── */}
        <section className="landing-section landing-section--soft" id="courses">
          <div className="landing-shell">
            <div className="section-heading section-heading--split">
              <div>
                <span className="section-kicker">Chương trình đào tạo</span>
                <h2>Kho Khóa Học Lập Trình & Tin Học Thực Chiến</h2>
                <p>Nâng cao năng lực số từ Lập trình Web Fullstack (FE & BE) đến Chuẩn Quốc Tế MOS & IC3.</p>
              </div>
              <button className="text-link" type="button" onClick={() => { if (onNavigateToCourses) onNavigateToCourses(); else window.location.href = '/courses'; }}>
                Xem toàn bộ khóa học LMS <ArrowRight size={17} />
              </button>
            </div>
            <div className="course-tabs" role="tablist" aria-label="Lọc chương trình">
              {COURSE_TABS.map((tab) => <button key={tab.key} type="button" role="tab" aria-selected={category === tab.key} className={category === tab.key ? 'is-active' : ''} onClick={() => setCategory(tab.key)}>{tab.label}</button>)}
            </div>
            <div className="course-grid">
              {visibleCourses.map((course) => {
                const Icon = course.icon;
                return (
                  <article className="course-card" key={course.id}>
                    <div className="course-card__top"><span className="course-card__icon"><Icon size={23} /></span><span className="course-card__label">{course.label}</span></div>
                    <h3>{course.title}</h3><p>{course.description}</p>
                    <dl className="course-card__meta"><div><dt>Thời lượng</dt><dd>{course.duration}</dd></div><div><dt>Nội dung</dt><dd>{course.lessons}</dd></div><div><dt>Trình độ</dt><dd>{course.level}</dd></div></dl>
                    <button className="course-card__action" type="button" onClick={() => { if (onNavigateToCourses) onNavigateToCourses(); else window.location.href = '/courses'; }}>
                      Vào khóa học <ChevronRight size={17} />
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── LEARNING PATH ── */}
        <section className="landing-section" id="learning-path">
          <div className="landing-shell learning-layout">
            <div className="learning-layout__intro"><span className="section-kicker">Lộ trình học tập</span><h2>Một quy trình đơn giản để học đều và tiến bộ</h2><p>Người học luôn biết mình đang ở đâu, cần làm gì tiếp theo và đã hoàn thành những nội dung nào.</p><button className="button button--secondary" type="button" onClick={() => handlePortalClick('student')}>Khám phá hệ thống <ArrowRight size={17} /></button></div>
            <ol className="learning-steps">{LEARNING_STEPS.map((step) => <li key={step.number}><span className="learning-steps__number">{step.number}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></li>)}</ol>
          </div>
        </section>

        {/* ── PLATFORM FEATURES ── */}
        <section className="landing-section landing-section--navy" id="platform">
          <div className="landing-shell">
            <div className="section-heading section-heading--center section-heading--inverse"><span className="section-kicker">Nền tảng học tập</span><h2>Mọi công cụ học tập trong một hệ thống</h2><p>Tập trung vào những chức năng người học sử dụng hằng ngày, không thêm yếu tố trang trí dư thừa.</p></div>
            <div className="feature-grid">{PLATFORM_FEATURES.map((feature) => { const Icon = feature.icon; return <article className="feature-card" key={feature.title}><span><Icon size={22} /></span><h3>{feature.title}</h3><p>{feature.description}</p></article>; })}</div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="landing-section landing-cta">
          <div className="landing-shell landing-cta__inner">
            <div>
              <span className="section-kicker">Bắt đầu học</span>
              <h2>Sẵn sàng xây dựng kỹ năng số của bạn?</h2>
              <p>Đăng nhập hoặc chọn phân hệ để trực tiếp trải nghiệm toàn bộ tính năng LMS.</p>
            </div>
            <button className="button button--primary button--large" type="button" onClick={() => handlePortalClick('student')}>
              Vào hệ thống học tập <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-shell landing-footer__grid">
          <div className="landing-footer__brand"><img src="/logo-icon.png" alt="" width="42" height="42" /><div><strong>Tin Học Gen Z</strong><span>PH Digital Education</span></div><p>Nền tảng học và luyện tập kỹ năng tin học dành cho học viên Việt Nam.</p></div>
          <div><h3>Phân hệ LMS</h3><button type="button" onClick={() => handlePortalClick('student')}>Cổng Học Viên</button><button type="button" onClick={() => handlePortalClick('teacher')}>Cổng Giảng Viên</button><button type="button" onClick={() => handlePortalClick('giaovu')}>Cổng Giáo Vụ</button><button type="button" onClick={() => handlePortalClick('admin')}>Quản Trị Admin</button></div>
          <div><h3>Học vụ & Chứng chỉ</h3><button type="button" onClick={onGetStarted}>Đăng nhập</button><a href="/verify">Tra cứu chứng nhận</a><button type="button" onClick={() => handlePortalClick('attendance')}>Quét QR điểm danh</button></div>
          <div><h3>Liên hệ</h3><a href="tel:0332298065">033 229 8065</a><a href="mailto:support@tinhocgenz.io.vn">support@tinhocgenz.io.vn</a><span>Hỗ trợ trực tuyến toàn quốc</span></div>
        </div>
        <div className="landing-shell landing-footer__bottom"><span>© 2026 PH Digital Education</span><span>Tin Học Gen Z · Học để làm được</span></div>
      </footer>
    </div>
  );
}
