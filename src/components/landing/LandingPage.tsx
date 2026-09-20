import { useState, useMemo } from 'react';
import {
  ArrowRight, BarChart3, BookOpen, ChevronRight,
  ClipboardCheck, FileCheck2, GraduationCap, Laptop,
  MonitorCheck, ShieldCheck, Sparkles, Target,
  Users, Bot
} from 'lucide-react';
import { LmsMainHeader } from '../layout/LmsMainHeader';
import './landing.css';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigateToCourses?: () => void;
  onNavigateToPortal?: (portal: 'student' | 'teacher' | 'giaovu' | 'admin' | 'attendance' | 'verify') => void;
  onOpenAITutor?: (prompt?: string) => void;
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

const COURSE_TABS: Array<{ key: CourseCategory; label: string }> = [
  { key: 'all', label: 'Tất cả nổi bật' },
  { key: 'web-dev', label: 'Lập trình Web (FE & BE)' },
  { key: 'mos-ic3', label: 'MOS & IC3' },
  { key: 'cntt', label: 'Chứng chỉ CNTT' },
  { key: 'office', label: 'Kỹ năng văn phòng' }
];

export function LandingPage({ onGetStarted, onNavigateToCourses, onNavigateToPortal, onOpenAITutor }: LandingPageProps) {
  const [category, setCategory] = useState<CourseCategory>('all');
  const [activeNav, setActiveNav] = useState('home');

  const visibleCourses = useMemo(() => {
    if (category === 'all') return COURSES.filter((course) => course.featured);
    return COURSES.filter((course) => course.category === category);
  }, [category]);

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

  const handleModuleNavigation = (moduleId: string) => {
    if (moduleId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (moduleId === 'courses' || moduleId === 'course-detail') {
      if (onNavigateToCourses) onNavigateToCourses();
      else window.location.href = '/courses';
    } else if (moduleId === 'student') {
      handlePortalClick('student');
    } else if (moduleId === 'learning_path') {
      handlePortalClick('student');
    } else if (moduleId === 'exams') {
      handlePortalClick('student');
    } else if (moduleId === 'verify') {
      handlePortalClick('verify');
    } else if (moduleId === 'community') {
      handlePortalClick('student');
    } else if (moduleId === 'profile') {
      handlePortalClick('student');
    }
  };

  return (
    <div className="landing-page" style={{ margin: 0, padding: 0, background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── 1. MAIN HEADER MATCHING IMAGE SPECIFICATION ── */}
      <LmsMainHeader
        activeNav={activeNav}
        onNavigate={(navId) => {
          setActiveNav(navId);
          if (navId === 'courses') {
            if (onNavigateToCourses) onNavigateToCourses();
            else window.location.href = '/courses';
          } else if (navId === 'learning_path' || navId === 'exams' || navId === 'community' || navId === 'profile') {
            handleModuleNavigation(navId);
          } else if (navId === 'about') {
            document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onOpenAuth={onGetStarted}
        onOpenSearch={() => {
          if (onNavigateToCourses) onNavigateToCourses();
          else window.location.href = '/courses';
        }}
        studentName="Phương"
        isLoggedIn={true}
      />

      {/* ── 2. HERO BANNER: 3-COLUMN REPRODUCTION OF TOP HALF ── */}
      <section style={{
        background: 'linear-gradient(180deg, #F0F7FF 0%, #FFFFFF 100%)',
        padding: '36px 0 28px',
        borderBottom: '1px solid #E2E8F0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.95fr) minmax(0, 0.95fr)',
            gap: '28px',
            alignItems: 'center'
          }}>

            {/* ── COLUMN 1: LEFT COPY & CALL TO ACTIONS ── */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 800,
                color: '#0057B8',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}>
                <Sparkles size={14} color="#0057B8" /> NỀN TẢNG HỌC TRỰC TUYẾN THẾ HỆ MỚI
              </div>

              <h1 style={{
                fontSize: 'clamp(34px, 4.2vw, 52px)',
                fontWeight: 850,
                color: '#0B2545',
                lineHeight: 1.15,
                margin: '0 0 16px',
                letterSpacing: '-0.035em'
              }}>
                Học công nghệ.<br />
                <span style={{ color: '#0057B8' }}>Làm chủ tương lai.</span>
              </h1>

              <p style={{
                fontSize: '15.5px',
                color: '#475569',
                lineHeight: 1.6,
                margin: '0 0 24px',
                maxWidth: '480px'
              }}>
                Ứng dụng AI - Blockchain - Học liệu thực tiễn để kiến tạo thế hệ nhân lực số chất lượng cao.
              </p>

              {/* Primary & Secondary Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
                <button
                  onClick={() => {
                    if (onNavigateToCourses) onNavigateToCourses();
                    else window.location.href = '/courses';
                  }}
                  style={{
                    background: '#0057B8',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '13px 26px',
                    borderRadius: '10px',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(0, 87, 184, 0.28)',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  Khám phá khóa học <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => handlePortalClick('student')}
                  style={{
                    background: '#FFFFFF',
                    color: '#0B2545',
                    border: '1px solid #CBD5E1',
                    padding: '13px 22px',
                    borderRadius: '10px',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Xem lộ trình học
                </button>

                {/* Hidden/Preserved Required Test Anchor */}
                <button
                  onClick={onGetStarted}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748B',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '4px'
                  }}
                >
                  Kiểm tra trình độ miễn phí
                </button>
              </div>

              {/* 4 Feature Badges with Icons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px 16px',
                paddingTop: '20px',
                borderTop: '1px solid #E2E8F0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  <Laptop size={16} color="#0057B8" /> Học mọi lúc mọi nơi
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  <ShieldCheck size={16} color="#059669" /> Chứng chỉ Blockchain minh bạch, xác thực
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  <Bot size={16} color="#7C3AED" /> AI cá nhân hóa lộ trình học
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  <Users size={16} color="#0284C7" /> Kết nối cộng đồng học tập
                </div>
              </div>
            </div>

            {/* ── COLUMN 2: CENTER GRAPHIC OF ENERGETIC TECH LEARNERS ── */}
            <div style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Central Graphic Container */}
              <div style={{
                width: '100%',
                maxWidth: '380px',
                aspectRatio: '1/1',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #E0F2FE 0%, #EFF6FF 50%, #DBEAFE 100%)',
                border: '2px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 20px 40px -15px rgba(0, 87, 184, 0.15)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {/* Visual Graphic Representation */}
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  <div style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0057B8 0%, #38BDF8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: '0 8px 24px rgba(0, 87, 184, 0.3)'
                  }}>
                    <GraduationCap size={46} color="#FFFFFF" />
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 850, color: '#0B2545', letterSpacing: '-0.02em' }}>
                    TINHOCGENZ TECH TALENT
                  </div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#0057B8',
                    marginTop: '4px',
                    fontStyle: 'italic'
                  }}>
                    "Cùng bạn kiến tạo giá trị thật!"
                  </div>
                </div>

                {/* Floating Chips around learners */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  padding: '6px 10px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#0057B8',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #BAE6FD',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Sparkles size={13} color="#0057B8" /> AI Learning
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '16px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  padding: '6px 10px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#059669',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #A7F3D0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <ShieldCheck size={13} color="#059669" /> Blockchain Cert
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '24px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  padding: '6px 10px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#0284C7',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #BAE6FD',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Laptop size={13} color="#0284C7" /> Real Projects
                </div>
              </div>
            </div>

            {/* ── COLUMN 3: 2 INTERACTIVE WIDGETS (AI ASSISTANT & BLOCKCHAIN) ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Widget 1: Trợ lý học tập AI */}
              <div style={{
                background: 'linear-gradient(135deg, #0057B8 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                borderRadius: '16px',
                padding: '18px 20px',
                boxShadow: '0 10px 25px -5px rgba(0, 87, 184, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Bot size={18} color="#FFFFFF" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '14.5px' }}>Trợ lý học tập AI</span>
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    background: '#22C55E',
                    color: '#FFF',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>Online 24/7</span>
                </div>

                {/* Speech Bubble */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '12.5px',
                  lineHeight: 1.45,
                  marginBottom: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  Chào bạn! Mình có thể giúp gì cho bạn?
                </div>

                {/* 4 Quick Action Chips */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginBottom: '14px' }}>
                  {[
                    { label: 'Tư vấn lộ trình học', prompt: 'Tư vấn lộ trình học cho tôi' },
                    { label: 'Giới thiệu khóa học', prompt: 'Giới thiệu các khóa học hot nhất' },
                    { label: 'Giải đáp thắc mắc', prompt: 'Giải đáp bài tập tin học' },
                    { label: 'Hỗ trợ kỹ thuật', prompt: 'Hỗ trợ kỹ thuật thi chứng chỉ' }
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => {
                        if (onOpenAITutor) onOpenAITutor(chip.prompt);
                        else handlePortalClick('student');
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.12)',
                        border: '1px solid rgba(255, 255, 255, 0.22)',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      • {chip.label}
                    </button>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => {
                    if (onOpenAITutor) onOpenAITutor();
                    else handlePortalClick('student');
                  }}
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    color: '#0057B8',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 750,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  Bắt đầu trò chuyện <ArrowRight size={14} />
                </button>
              </div>

              {/* Widget 2: Chứng chỉ Blockchain */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '16px 20px',
                border: '1px solid #BAE6FD',
                boxShadow: '0 4px 14px rgba(0, 87, 184, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                {/* 3D Glowing Cube Icon */}
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
                }}>
                  <ShieldCheck size={26} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                    Chứng chỉ Blockchain
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', lineHeight: 1.35, marginTop: '2px' }}>
                    Xác thực kỹ năng của bạn trên nền tảng Blockchain
                  </div>
                </div>

                <button
                  onClick={() => handlePortalClick('verify')}
                  style={{
                    background: '#0057B8',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '7px 12px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Tìm hiểu ngay →
                </button>
              </div>

            </div>

          </div>

          {/* ── STATS COUNTER STRIP (4 METRICS) ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            background: '#FFFFFF',
            padding: '20px 24px',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 14px rgba(11, 37, 69, 0.04)',
            marginTop: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0057B8' }}>
                <Users size={22} />
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 850, color: '#0B2545', lineHeight: 1.1 }}>10.000+</div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Học viên tin tưởng</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                <BookOpen size={22} />
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 850, color: '#0B2545', lineHeight: 1.1 }}>500+</div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Khóa học chất lượng</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                <GraduationCap size={22} />
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 850, color: '#0B2545', lineHeight: 1.1 }}>100+</div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Chuyên gia đồng hành</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 850, color: '#0B2545', lineHeight: 1.1 }}>95%</div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Hài lòng sau khóa học</div>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ── 3. FEATURED COURSES SECTION (MAINTAINING CURRICULUM RICHNESS) ── */}
      <section className="landing-section" id="courses" style={{ padding: '48px 0', background: '#FFFFFF' }}>
        <div className="landing-shell">
          <div className="section-heading section-heading--split">
            <div>
              <span className="section-kicker" style={{ color: '#0057B8' }}>Chương trình đào tạo</span>
              <h2>Khóa học chuẩn thực chiến</h2>
              <p>Chương trình được thiết kế bám sát thực tế công việc và cấu trúc đề thi chính thức.</p>
            </div>
            <button className="text-link" type="button" onClick={() => { if (onNavigateToCourses) onNavigateToCourses(); else window.location.href = '/courses'; }}>
              Xem tất cả khóa học <ChevronRight size={16} />
            </button>
          </div>

          <div className="course-tabs" role="tablist" aria-label="Lọc chương trình">
            {COURSE_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={category === tab.key}
                className={category === tab.key ? 'is-active' : ''}
                onClick={() => setCategory(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="course-grid">
            {visibleCourses.map((course) => {
              const Icon = course.icon;
              return (
                <article className="course-card" key={course.id}>
                  <div className="course-card__top">
                    <span className="course-card__icon"><Icon size={23} /></span>
                    <span className="course-card__label">{course.label}</span>
                  </div>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <dl className="course-card__meta">
                    <div><dt>Thời lượng</dt><dd>{course.duration}</dd></div>
                    <div><dt>Nội dung</dt><dd>{course.lessons}</dd></div>
                    <div><dt>Trình độ</dt><dd>{course.level}</dd></div>
                  </dl>
                  <button className="course-card__action" type="button" onClick={() => { if (onNavigateToCourses) onNavigateToCourses(); else window.location.href = '/courses'; }}>
                    Vào khóa học <ChevronRight size={17} />
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. FOOTER MATCHING DESIGN SPECIFICATION ── */}
      <footer id="about-section" style={{
        background: '#071C32',
        color: '#CBD5E1',
        padding: '36px 0 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            paddingBottom: '24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#0057B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF'
              }}>
                <GraduationCap size={20} />
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  TINHOC<span style={{ color: '#38BDF8' }}>GENZ</span>
                </div>
                <div style={{ fontSize: '9px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                  PH DIGITAL EDUCATION
                </div>
              </div>
            </div>

            {/* Center Slogan */}
            <div style={{ fontSize: '13.5px', color: '#94A3B8', fontWeight: 500, textAlign: 'center' }}>
              TINHOCGENZ — Kiến tạo thế hệ nhân lực số Việt Nam
            </div>

            {/* Social / Contact Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Kết nối với chúng tôi:</span>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: '#38BDF8', fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>Facebook</a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={{ color: '#F87171', fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>YouTube</a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" style={{ color: '#F472B6', fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>TikTok</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: '#60A5FA', fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>LinkedIn</a>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '20px',
            fontSize: '12px',
            color: '#64748B'
          }}>
            <div>© 2026 TINHOCGENZ • PH DIGITAL EDUCATION. Bản quyền hệ thống thuộc về chúng tôi.</div>
            <div style={{ color: '#38BDF8', fontWeight: 700, fontStyle: 'italic' }}>
              Học thật — Làm thật — Giá trị thật
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
