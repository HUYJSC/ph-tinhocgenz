import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Award, BarChart3, BookOpen, Check, ChevronRight,
  ClipboardCheck, Clock3, FileCheck2, GraduationCap, Laptop,
  Menu, MonitorCheck, PlayCircle, ShieldCheck, Sparkles, Target, X
} from 'lucide-react';
import './landing.css';

interface LandingPageProps { onGetStarted: () => void; }
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

export function LandingPage({ onGetStarted }: LandingPageProps) {
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

  return (
    <div className="landing-page">
      <header className={`landing-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="landing-shell landing-header__inner">
          <button className="brand" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img className="brand__mark" src="/logo-icon.png" alt="" width="40" height="40" />
            <span className="brand__copy"><strong>Tin Học Gen Z</strong><small>PH DIGITAL EDUCATION</small></span>
          </button>
          <nav className="landing-nav" aria-label="Điều hướng chính">
            <button type="button" onClick={() => goTo('courses')}>Khóa học</button>
            <button type="button" onClick={() => goTo('learning-path')}>Lộ trình</button>
            <button type="button" onClick={() => goTo('platform')}>Nền tảng</button>
          </nav>
          <div className="landing-header__actions">
            <button className="button button--quiet header-login" type="button" onClick={onGetStarted}>Đăng nhập</button>
            <button className="button button--primary header-start" type="button" onClick={onGetStarted}>Vào học <ArrowRight size={17} /></button>
            <button className="mobile-menu-button" type="button" aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="mobile-nav" aria-label="Điều hướng di động">
            <button type="button" onClick={() => goTo('courses')}>Khóa học</button>
            <button type="button" onClick={() => goTo('learning-path')}>Lộ trình học</button>
            <button type="button" onClick={() => goTo('platform')}>Nền tảng học tập</button>
            <button className="button button--primary" type="button" onClick={onGetStarted}>Đăng nhập hệ thống</button>
          </nav>
        )}
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-shell landing-hero__grid">
            <div className="landing-hero__content">
              <span className="eyebrow"><BookOpen size={15} /> Học để làm được</span>
              <h1>Nâng kỹ năng số<br /><span>vững bước tương lai</span></h1>
              <p className="landing-hero__lead">Học tin học văn phòng, luyện thi chứng chỉ và thực hành kỹ năng số theo lộ trình rõ ràng, dễ theo dõi.</p>
              <div className="landing-hero__actions">
                <button className="button button--primary button--large" type="button" onClick={() => goTo('courses')}>Xem chương trình học <ArrowRight size={18} /></button>
                <button className="button button--secondary button--large" type="button" onClick={onGetStarted}><PlayCircle size={18} /> Kiểm tra trình độ miễn phí</button>
              </div>
              <ul className="hero-proof" aria-label="Ưu điểm chính">
                <li><Check size={16} /> Lộ trình rõ ràng</li><li><Check size={16} /> Bài tập thực hành</li><li><Check size={16} /> Theo dõi tiến độ</li>
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
              <div className="hero-progress-card"><span className="hero-progress-card__icon"><Target size={19} /></span><span><strong>Học đúng trọng tâm</strong><small>Tiếp tục từ bài gần nhất</small></span></div>
            </div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Các nhóm chương trình">
          <div className="landing-shell trust-strip__inner"><span>MOS 2019/365</span><span>IC3 Digital Literacy</span><span>Ứng dụng CNTT</span><span>Kỹ năng văn phòng</span></div>
        </section>

        <section className="landing-section landing-section--soft" id="courses">
          <div className="landing-shell">
            <div className="section-heading section-heading--split">
              <div><span className="section-kicker">Chương trình đào tạo</span><h2>Chọn khóa học phù hợp với mục tiêu</h2><p>Thông tin ngắn gọn, rõ thời lượng và định hướng của từng chương trình.</p></div>
              <button className="text-link" type="button" onClick={onGetStarted}>Vào danh mục học tập <ArrowRight size={17} /></button>
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
                    <button className="course-card__action" type="button" onClick={onGetStarted}>Xem khóa học <ChevronRight size={17} /></button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="landing-section" id="learning-path">
          <div className="landing-shell learning-layout">
            <div className="learning-layout__intro"><span className="section-kicker">Lộ trình học tập</span><h2>Một quy trình đơn giản để học đều và tiến bộ</h2><p>Người học luôn biết mình đang ở đâu, cần làm gì tiếp theo và đã hoàn thành những nội dung nào.</p><button className="button button--secondary" type="button" onClick={onGetStarted}>Khám phá hệ thống <ArrowRight size={17} /></button></div>
            <ol className="learning-steps">{LEARNING_STEPS.map((step) => <li key={step.number}><span className="learning-steps__number">{step.number}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></li>)}</ol>
          </div>
        </section>

        <section className="landing-section landing-section--navy" id="platform">
          <div className="landing-shell">
            <div className="section-heading section-heading--center section-heading--inverse"><span className="section-kicker">Nền tảng học tập</span><h2>Mọi công cụ học tập trong một hệ thống</h2><p>Tập trung vào những chức năng người học sử dụng hằng ngày, không thêm yếu tố trang trí dư thừa.</p></div>
            <div className="feature-grid">{PLATFORM_FEATURES.map((feature) => { const Icon = feature.icon; return <article className="feature-card" key={feature.title}><span><Icon size={22} /></span><h3>{feature.title}</h3><p>{feature.description}</p></article>; })}</div>
          </div>
        </section>

        <section className="landing-section landing-cta">
          <div className="landing-shell landing-cta__inner"><div><span className="section-kicker">Bắt đầu học</span><h2>Sẵn sàng xây dựng kỹ năng số của bạn?</h2><p>Đăng nhập để xem khóa học, bài tập và tiến độ học tập.</p></div><button className="button button--primary button--large" type="button" onClick={onGetStarted}>Vào hệ thống học tập <ArrowRight size={18} /></button></div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-shell landing-footer__grid">
          <div className="landing-footer__brand"><img src="/logo-icon.png" alt="" width="42" height="42" /><div><strong>Tin Học Gen Z</strong><span>PH Digital Education</span></div><p>Nền tảng học và luyện tập kỹ năng tin học dành cho học viên Việt Nam.</p></div>
          <div><h3>Chương trình</h3><button type="button" onClick={() => goTo('courses')}>MOS & IC3</button><button type="button" onClick={() => goTo('courses')}>Ứng dụng CNTT</button><button type="button" onClick={() => goTo('courses')}>Kỹ năng văn phòng</button></div>
          <div><h3>Học viên</h3><button type="button" onClick={onGetStarted}>Đăng nhập</button><a href="/verify">Tra cứu chứng nhận</a><a href="mailto:support@tinhocgenz.io.vn">Hỗ trợ học vụ</a></div>
          <div><h3>Liên hệ</h3><a href="tel:0332298065">033 229 8065</a><a href="mailto:support@tinhocgenz.io.vn">support@tinhocgenz.io.vn</a><span>Hỗ trợ trực tuyến toàn quốc</span></div>
        </div>
        <div className="landing-shell landing-footer__bottom"><span>© 2026 PH Digital Education</span><span>Tin Học Gen Z · Học để làm được</span></div>
      </footer>
    </div>
  );
}
