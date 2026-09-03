import React, { useState, useEffect } from 'react';
import {
  Award, ChevronRight, Star,
  CheckCircle2, Play, ArrowRight, BarChart3,
  Brain, Zap, Shield, Globe, Clock
} from 'lucide-react';
import { HeroBanner } from './HeroBanner';

interface LandingPageProps {
  onGetStarted: () => void;
}

interface TrackItem {
  id: string;
  category: 'mos-ic3' | 'cntt' | 'office-pro';
  icon: string;
  name: string;
  tag: string;
  desc: string;
  duration: string;
  badge: string;
  color: string;
  highlights: string[];
}

const ALL_TRACKS: TrackItem[] = [
  {
    id: 'office-fast-3in1',
    category: 'mos-ic3',
    icon: '⚡',
    name: 'Combo Cấp Tốc 3in1 (Word + Excel + PPT)',
    tag: 'MOS & IC3',
    desc: 'Trọn bộ kỹ năng tin học văn phòng thực chiến và luyện thi bao đỗ chứng chỉ quốc tế Certiport.',
    duration: '10 - 12 buổi',
    badge: 'Phổ biến nhất',
    color: '#2563EB',
    highlights: ['Luyện sát đề Certiport 2026', 'Cam kết bao đỗ 100%', 'Kèm 1:1 giải đáp bài tập']
  },
  {
    id: 'excel-6b',
    category: 'mos-ic3',
    icon: '📊',
    name: 'MOS Excel 2019/365 Chuyên Sâu',
    tag: 'MOS',
    desc: 'Làm chủ các hàm tìm kiếm XLOOKUP, INDEX-MATCH, PivotTable, Dashboard động và xử lý dữ liệu lớn.',
    duration: '6 buổi',
    badge: 'Bán chạy',
    color: '#059669',
    highlights: ['Hàm logic & tra cứu nâng cao', 'Vẽ biểu đồ động chuyên nghiệp', 'Tự động hóa báo cáo']
  },
  {
    id: 'word-6b',
    category: 'mos-ic3',
    icon: '📝',
    name: 'MOS Word 2019/365 Chuẩn Quốc Tế',
    tag: 'MOS',
    desc: 'Soạn thảo văn bản chuẩn hành chính, mục lục tự động, trộn thư Mail Merge và định dạng luận văn chuẩn đẹp.',
    duration: '6 buổi',
    badge: 'Căn bản',
    color: '#1D4ED8',
    highlights: ['Heading Styles chuẩn đề thi', 'Quản lý Section & Header/Footer', 'Trộn thư nâng cao']
  },
  {
    id: 'ppt-6b',
    category: 'mos-ic3',
    icon: '🎨',
    name: 'MOS PowerPoint Thiết Kế Thuyết Trình',
    tag: 'MOS',
    desc: 'Tư duy bố cục slide hiện đại, Slide Master, kỹ xảo hoạt ảnh Morph mượt mà và thuyết trình tự tin.',
    duration: '6 buổi',
    badge: 'Sáng tạo',
    color: '#EA580C',
    highlights: ['Slide Master đồng bộ thương hiệu', 'Kỹ thuật Morph & Zoom 3D', 'Xuất bản video Full HD']
  },
  {
    id: 'ic3-gs6',
    category: 'mos-ic3',
    icon: '🌐',
    name: 'Chứng Chỉ Quốc Tế IC3 GS6 (Level 1, 2, 3)',
    tag: 'IC3 GS6',
    desc: 'Chuẩn tin học số toàn cầu của Certiport bao gồm Máy tính căn bản, Ứng dụng số và Cuộc sống trực tuyến.',
    duration: '8 buổi',
    badge: 'Quốc tế',
    color: '#7C3AED',
    highlights: ['An toàn mạng & Điện toán đám mây', 'Phần mềm văn phòng trực tuyến', 'Đủ điều kiện tốt nghiệp Đại học']
  },
  {
    id: 'cc-cntt-basic',
    category: 'cntt',
    icon: '💻',
    name: 'Chứng Chỉ Tin Học CNTT Cơ Bản (Bộ GD&ĐT)',
    tag: 'Bộ GD&ĐT',
    desc: 'Chứng chỉ chuẩn đầu ra bắt buộc cho sinh viên các trường Đại học, Cao đẳng trên toàn quốc.',
    duration: '6 buổi',
    badge: 'Chuẩn đầu ra',
    color: '#0284C7',
    highlights: ['6 Module chuẩn Thông tư 03', 'Thực hành máy tính Windows', 'Bao đỗ 100%']
  },
  {
    id: 'cc-cntt-advanced',
    category: 'cntt',
    icon: '🚀',
    name: 'Chứng Chỉ Tin Học CNTT Nâng Cao (Bộ GD&ĐT)',
    tag: 'Bộ GD&ĐT',
    desc: 'Dành cho sinh viên và nhân sự cần chứng chỉ thi công chức, viên chức và xét nâng ngạch chuyên môn.',
    duration: '6 buổi',
    badge: 'Nâng cao',
    color: '#E11D48',
    highlights: ['Macro & VBA cơ bản', 'Bảo mật cơ sở dữ liệu', 'Định dạng tài liệu phức tạp']
  },
  {
    id: 'ai-office',
    category: 'office-pro',
    icon: '🤖',
    name: 'Ứng Dụng AI Vào Công Việc Văn Phòng 2026',
    tag: 'AI Văn Phòng',
    desc: 'Tăng tốc 300% hiệu suất làm việc với ChatGPT, Claude, Microsoft Copilot trong Word, Excel và PowerPoint.',
    duration: '5 buổi',
    badge: 'Đón đầu 2026',
    color: '#9333EA',
    highlights: ['Prompt Engineering thực chiến', 'Tự động viết hàm Excel bằng AI', 'Tạo slide thuyết trình trong 3 phút']
  },
  {
    id: 'excel-accounting',
    category: 'office-pro',
    icon: '📑',
    name: 'Excel Chuyên Ngành Kế Toán - Tài Chính',
    tag: 'Thực chiến',
    desc: 'Lập sổ nhật ký chung, bảng lương, báo cáo tài chính và phiếu thu chi tự động chuẩn quy định thuế.',
    duration: '8 buổi',
    badge: 'Nghề nghiệp',
    color: '#047857',
    highlights: ['Sổ sách kế toán tự động', 'Hàm tài chính & khấu hao', 'Kỹ thuật lọc báo cáo động']
  }
];

const LEARNING_STEPS = [
  {
    step: '01',
    title: 'Kiểm tra trình độ đầu vào (Diagnostic Test)',
    desc: 'Hệ thống tự động chấm điểm bài test 15 phút, vẽ biểu đồ Radar phân tích điểm mạnh, điểm yếu theo từng hàm và kỹ năng.',
    color: '#2563EB'
  },
  {
    step: '02',
    title: 'Nhận lộ trình cá nhân hóa (AI Pathway)',
    desc: 'Thuật toán tự động thiết kế lộ trình tinh gọn, chỉ tập trung vào các kỹ năng còn thiếu hụt giúp tiết kiệm 50% thời gian.',
    color: '#7C3AED'
  },
  {
    step: '03',
    title: 'Học lý thuyết thực chiến & Làm bài mẫu',
    desc: 'Học qua các tình huống văn phòng thực tế, xem video giải chi tiết các bẫy thi thường gặp trong đề thi Certiport.',
    color: '#059669'
  },
  {
    step: '04',
    title: 'Thi thử bấm giờ sát 99% đề thật',
    desc: 'Làm bài thi trên phòng thi trực tuyến với đồng hồ đếm ngược, tự động lưu bài từng giây và mô phỏng chính xác giao diện thi thật.',
    color: '#D97706'
  },
  {
    step: '05',
    title: 'Ôn luyện câu sai & Cấp chứng nhận QR',
    desc: 'Tính năng Smart Review tự động gom các câu làm sai để nhắc ôn lại theo chu kỳ khoa học Spaced Repetition, đảm bảo thi đỗ 1000/1000.',
    color: '#DC2626'
  }
];

const FEATURES = [
  {
    icon: <Brain size={24} />,
    title: 'Chẩn đoán năng lực bằng AI',
    desc: 'Phân tích chính xác từng kỹ năng con (VLOOKUP, PivotTable, Slide Master, Mail Merge) để chỉ ra điểm cần cải thiện ngay.',
    color: '#2563EB'
  },
  {
    icon: <Shield size={24} />,
    title: 'Đề thi sát 99% đề thật Certiport',
    desc: 'Ngân hàng 500+ câu hỏi cập nhật mới nhất năm 2026, bấm giờ chuẩn xác và tự động sao lưu câu trả lời không sợ rớt mạng.',
    color: '#059669'
  },
  {
    icon: <Zap size={24} />,
    title: 'Smart Review (Spaced Repetition)',
    desc: 'Thuật toán lặp lại ngắt quãng thông minh giúp não bộ ghi nhớ lâu các công thức và phím tắt quan trọng.',
    color: '#D97706'
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Radar Chart Năng Lực Trực Quan',
    desc: 'Theo dõi sự tiến bộ hàng ngày qua biểu đồ radar nhiều chiều, đo lường độ thành thạo kỹ năng từ 0% đến 100%.',
    color: '#7C3AED'
  },
  {
    icon: <Award size={24} />,
    title: 'Chứng nhận điện tử QR Verifiable',
    desc: 'Hoàn thành khóa học được cấp chứng nhận điện tử có mã QR xác minh công khai, nâng tầm CV xin việc.',
    color: '#DB2777'
  },
  {
    icon: <Globe size={24} />,
    title: 'Học mọi lúc trên Web & Mobile PWA',
    desc: 'Giao diện tối ưu hoàn hảo cho máy tính, máy tính bảng và điện thoại. Cài đặt trực tiếp như ứng dụng di động.',
    color: '#0284C7'
  }
];

const TESTIMONIALS = [
  {
    name: 'Nguyễn Thị Lan Anh',
    school: 'Sinh viên ĐH HUTECH',
    score: '1000 / 1000 điểm',
    badge: 'MOS Excel 2019',
    quote: 'Làm bài test đầu vào xong hệ thống chỉ ra ngay mình bị hổng phần VLOOKUP và PivotTable. Mình chỉ cần ôn đúng phần yếu trong 2 tuần là thi đạt điểm tuyệt đối 1000/1000!'
  },
  {
    name: 'Trần Minh Tuấn',
    school: 'Sinh viên ĐH Kinh Tế TP.HCM (UEH)',
    score: '960 / 1000 điểm',
    badge: 'MOS Word & Excel',
    quote: 'Giao diện thi thử ở đây giống đề thi thật Certiport đến 99%. Đề bấm giờ nghiêm túc và có lời giải chi tiết cho từng câu, đi thi thật tâm lý cực kỳ tự tin.'
  },
  {
    name: 'Hoàng Thảo My',
    school: 'Chuyên viên Nhân sự & Tuyển dụng',
    score: 'Xuất Sắc',
    badge: 'Ứng Dụng AI Văn Phòng',
    quote: 'Khóa học AI Văn phòng giúp mình rút ngắn thời gian xử lý báo cáo nhân sự từ 3 tiếng xuống còn 15 phút. Kiến thức cực kỳ thực tế và áp dụng được ngay vào công việc!'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'mos-ic3' | 'cntt' | 'office-pro'>('all');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredTracks = activeCategory === 'all'
    ? ALL_TRACKS
    : ALL_TRACKS.filter(t => t.category === activeCategory);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#F8FAFC',
      color: '#0F172A',
      fontFamily: 'var(--font-sans)',
      overflowX: 'hidden',
      position: 'relative'
    }}>

      {/* 1. TOP NAVIGATION BAR (LUMINOUS GLASSMORPHISM) */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 999,
        background: scrollY > 20 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: scrollY > 20 ? '0 4px 20px -2px rgba(0, 0, 0, 0.05)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img
              src="/logo-icon.png"
              alt="PH DIGITAL EDUCATION Icon"
              style={{ height: '36px', width: '36px', objectFit: 'contain' }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo.png';
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#0F172A',
                lineHeight: 1.2
              }}>
                PH DIGITAL EDUCATION
              </span>
              <span style={{
                fontSize: '10.5px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: '#2563EB',
                lineHeight: 1
              }}>
                Information Technology • IC3 • MOS
              </span>
            </div>
          </div>

          {/* Center Links (Desktop) */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="hide-sm">
            <button
              onClick={() => scrollToSection('tracks')}
              style={{ background: 'none', border: 'none', color: '#475569', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#2563EB')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
            >
              Chương trình đào tạo
            </button>
            <button
              onClick={() => scrollToSection('roadmap')}
              style={{ background: 'none', border: 'none', color: '#475569', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#2563EB')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
            >
              Lộ trình 5 bước
            </button>
            <button
              onClick={() => scrollToSection('features')}
              style={{ background: 'none', border: 'none', color: '#475569', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#2563EB')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
            >
              Tính năng nổi bật
            </button>
            <button
              onClick={() => scrollToSection('reviews')}
              style={{ background: 'none', border: 'none', color: '#475569', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#2563EB')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
            >
              Cam kết đầu ra
            </button>
          </nav>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onGetStarted}
              style={{
                padding: '8px 20px',
                borderRadius: '9999px',
                border: '1.5px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#0F172A',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2563EB';
                e.currentTarget.style.color = '#2563EB';
                e.currentTarget.style.background = '#EFF6FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#CBD5E1';
                e.currentTarget.style.color = '#0F172A';
                e.currentTarget.style.background = '#FFFFFF';
              }}
            >
              Đăng nhập
            </button>
            <button
              onClick={onGetStarted}
              style={{
                padding: '8px 22px',
                borderRadius: '9999px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              Bắt đầu học <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>
      {/* 2. BRAND-NEW MODERN EDTECH HERO BANNER (SENIOR/MASTER STANDARD) */}
      <HeroBanner
        onExploreCourses={() => scrollToSection('tracks')}
        onEnterLMS={onGetStarted}
      />

      {/* 3. SECTION: 10 CHƯƠNG TRÌNH ĐÀO TẠO THỰC CHIẾN (#tracks) */}
      <section id="tracks" style={{ padding: '90px 20px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Section Heading */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{
              fontSize: '11.5px',
              fontWeight: 800,
              color: '#2563EB',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              padding: '4px 14px',
              borderRadius: '9999px',
              display: 'inline-block',
              marginBottom: '12px'
            }}>
              HỆ THỐNG 10 CHƯƠNG TRÌNH ĐÀO TẠO CHUYÊN SÂU
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '14px' }}>
              Chọn Lộ Trình Phù Hợp Với Mục Tiêu Của Bạn
            </h2>
            <p style={{ fontSize: '15px', color: '#64748B', maxWidth: '640px', margin: '0 auto' }}>
              Từ tin học đại trà, chuẩn đầu ra Đại học đến chứng chỉ quốc tế MOS, IC3 GS6 và ứng dụng AI thực chiến 2026.
            </p>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'Tất cả 10 chương trình' },
              { key: 'mos-ic3', label: 'Chứng chỉ MOS & IC3 GS6' },
              { key: 'cntt', label: 'Chứng chỉ CNTT Bộ GD&ĐT' },
              { key: 'office-pro', label: 'Tin học Thực chiến & AI' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key as any)}
                style={{
                  padding: '8px 22px',
                  borderRadius: '9999px',
                  border: activeCategory === tab.key ? '1px solid #2563EB' : '1px solid #CBD5E1',
                  background: activeCategory === tab.key ? '#2563EB' : '#FFFFFF',
                  color: activeCategory === tab.key ? '#FFFFFF' : '#475569',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: activeCategory === tab.key ? '0 4px 12px rgba(37, 99, 235, 0.25)' : '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tracks Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px'
          }}>
            {filteredTracks.map(t => (
              <div
                key={t.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '20px',
                  padding: '26px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.25s',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = t.color;
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
                }}
              >
                {/* Top Accent Strip */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: t.color }} />

                <div>
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '28px' }}>{t.icon}</span>
                    <span style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: t.color,
                      background: '#F1F5F9',
                      border: `1px solid #E2E8F0`,
                      padding: '3px 10px',
                      borderRadius: '9999px'
                    }}>
                      {t.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginBottom: '8px', lineHeight: 1.35 }}>
                    {t.name}
                  </h3>
                  <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.6, marginBottom: '18px' }}>
                    {t.desc}
                  </p>

                  {/* Highlights */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {t.highlights.map((hl, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#334155' }}>
                        <CheckCircle2 size={15} color={t.color} />
                        {hl}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer row with CTA */}
                <div style={{
                  paddingTop: '16px',
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '12.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                    <Clock size={14} /> {t.duration}
                  </span>
                  <button
                    onClick={onGetStarted}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: t.color,
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px'
                    }}
                  >
                    Vào luyện tập <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SECTION: LỘ TRÌNH HỌC TẬP 5 BƯỚC (#roadmap) */}
      <section id="roadmap" style={{ padding: '90px 20px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{
              fontSize: '11.5px',
              fontWeight: 800,
              color: '#059669',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              padding: '4px 14px',
              borderRadius: '9999px',
              display: 'inline-block',
              marginBottom: '12px'
            }}>
              PHƯƠNG PHÁP ĐÀO TẠO KHOA HỌC
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '14px' }}>
              Quy Trình 5 Bước Chinh Phục Điểm Tuyệt Đối
            </h2>
            <p style={{ fontSize: '15px', color: '#64748B', maxWidth: '640px', margin: '0 auto' }}>
              Loại bỏ việc học vẹt lan man. Bạn chỉ học chính xác những gì mình còn thiếu để đạt chứng chỉ nhanh nhất.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {LEARNING_STEPS.map((s) => (
              <div
                key={s.step}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '24px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = s.color;
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.background = '#F8FAFC';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: '#EFF6FF',
                  border: `2px solid ${s.color}40`,
                  color: s.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '17px',
                  fontWeight: 900,
                  flexShrink: 0
                }}>
                  {s.step}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                    {s.desc}
                  </p>
                </div>
                <div style={{ color: '#94A3B8', alignSelf: 'center' }}>
                  <ChevronRight size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SECTION: TẠI SAO CHỌN PH DIGITAL EDUCATION? (#features) */}
      <section id="features" style={{ padding: '90px 20px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{
              fontSize: '11.5px',
              fontWeight: 800,
              color: '#7C3AED',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: '#F5F3FF',
              border: '1px solid #DDD6FE',
              padding: '4px 14px',
              borderRadius: '9999px',
              display: 'inline-block',
              marginBottom: '12px'
            }}>
              ƯU THẾ CÔNG NGHỆ KHẢO THÍ VƯỢT TRỘI
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '14px' }}>
              Tại Sao Học Viên Chọn PH Digital Education?
            </h2>
            <p style={{ fontSize: '15px', color: '#64748B', maxWidth: '640px', margin: '0 auto' }}>
              Hệ thống kết hợp giữa giảng viên MOS Master giàu kinh nghiệm và nền tảng trí tuệ nhân tạo hỗ trợ học tập 24/7.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {FEATURES.map((f, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '20px',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = f.color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
                }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: '#EFF6FF',
                  color: f.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SECTION: CẢM NHẬN HỌC VIÊN & CHỨNG CHỈ THẬT (#reviews) */}
      <section id="reviews" style={{ padding: '90px 20px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{
              fontSize: '11.5px',
              fontWeight: 800,
              color: '#D97706',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              padding: '4px 14px',
              borderRadius: '9999px',
              display: 'inline-block',
              marginBottom: '12px'
            }}>
              KẾT QUẢ ĐÀO TẠO THỰC TẾ
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '14px' }}>
              Học Viên Nói Gì Về PH Digital Education?
            </h2>
            <p style={{ fontSize: '15px', color: '#64748B', maxWidth: '640px', margin: '0 auto' }}>
              Hàng ngàn sinh viên HUTECH, UEH, UFM, Bách Khoa và nhân sự doanh nghiệp đã đạt chứng chỉ điểm cao ngay lần thi đầu tiên.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '60px'
          }}>
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '20px',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                    ))}
                  </div>
                  <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '16px' }}>
                    "{t.quote}"
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '14px',
                  borderTop: '1px solid #E2E8F0'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{t.school}</div>
                  </div>
                  <span style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#059669',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '4px 10px',
                    borderRadius: '8px'
                  }}>
                    {t.score}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Banner inside Section */}
          <div style={{
            background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #3B82F6 100%)',
            borderRadius: '24px',
            padding: '44px 30px',
            textAlign: 'center',
            maxWidth: '900px',
            margin: '0 auto',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 15px 35px -5px rgba(37, 99, 235, 0.4)'
          }}>
            <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 900, color: '#FFFFFF', marginBottom: '12px' }}>
              Sẵn Sàng Chinh Phục Chứng Chỉ Quốc Tế?
            </h3>
            <p style={{ fontSize: '15px', color: '#DBEAFE', maxWidth: '580px', margin: '0 auto 28px', lineHeight: 1.6 }}>
              Bắt đầu với bài kiểm tra năng lực đầu vào miễn phí 100%. Nhận kết quả chẩn đoán và lộ trình học cá nhân hóa ngay hôm nay.
            </p>
            <button
              onClick={onGetStarted}
              style={{
                padding: '16px 36px',
                borderRadius: '9999px',
                border: 'none',
                background: '#FFFFFF',
                color: '#1D4ED8',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Play size={18} fill="#1D4ED8" /> Kiểm tra trình độ miễn phí ngay
            </button>
          </div>
        </div>
      </section>

      {/* 7. FOOTER CHUẨN 4 CỘT HIỆN ĐẠI (SECTION I SPECIFICATION) */}
      <footer style={{
        padding: '64px 24px 32px',
        background: '#0F172A',
        color: '#E2E8F0',
        borderTop: '1px solid #1E293B'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Main 4-Column Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            marginBottom: '48px'
          }}>
            {/* CỘT 1: VỀ PH DIGITAL EDUCATION */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <img
                  src="/logo-icon.png"
                  alt="Logo PH DIGITAL EDUCATION"
                  style={{ height: '40px', width: '40px', objectFit: 'contain', borderRadius: '8px', background: '#FFFFFF', padding: '3px' }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.png'; }}
                />
                <div>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.01em', display: 'block' }}>
                    PH DIGITAL EDUCATION
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#38BDF8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Học Viện Tin Học & Khảo Thí Quốc Tế
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '13.5px', color: '#94A3B8', lineHeight: 1.7, marginBottom: '16px' }}>
                Hệ sinh thái đào tạo Tin Học Văn Phòng Thực Chiến và Luyện thi chứng chỉ quốc tế MOS, IC3 GS6 chuẩn Certiport & Chứng chỉ CNTT Quốc gia theo Thông tư 03/2014/TT-BTTTT.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', fontSize: '12px', color: '#38BDF8', fontWeight: 600 }}>
                <span>🛡️</span> Cam kết chuẩn đầu ra • Bao đỗ 100%
              </div>
            </div>

            {/* CỘT 2: 10 CHƯƠNG TRÌNH ĐÀO TẠO */}
            <div>
              <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#FFFFFF', marginBottom: '16px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Chương Trình Đào Tạo
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '13px', color: '#94A3B8' }}>
                <li><a href="#tracks" onClick={() => scrollToSection('tracks')} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#38BDF8'} onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}>1. Tin Học Văn Phòng Cấp Tốc 3in1</a></li>
                <li><a href="#tracks" onClick={() => scrollToSection('tracks')} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#38BDF8'} onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}>2. Luyện Thi CC CNTT Cơ Bản</a></li>
                <li><a href="#tracks" onClick={() => scrollToSection('tracks')} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#38BDF8'} onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}>3. Luyện Thi CC CNTT Nâng Cao</a></li>
                <li><a href="#tracks" onClick={() => scrollToSection('tracks')} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#38BDF8'} onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}>4. CNTT Cơ Bản Word + Excel</a></li>
                <li><a href="#tracks" onClick={() => scrollToSection('tracks')} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#38BDF8'} onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}>5. CNTT Nâng Cao Word + Excel</a></li>
                <li><a href="#tracks" onClick={() => scrollToSection('tracks')} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#38BDF8'} onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}>6. Ứng Dụng AI Vào Công Việc Văn Phòng</a></li>
                <li><a href="#tracks" onClick={() => scrollToSection('tracks')} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#38BDF8'} onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}>7. Excel Kế Toán & Quản Trị Tài Chính</a></li>
                <li><a href="#tracks" onClick={() => scrollToSection('tracks')} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#38BDF8'} onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}>8. Kỹ Năng Word Chuẩn Doanh Nghiệp</a></li>
                <li><a href="#tracks" onClick={() => scrollToSection('tracks')} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#38BDF8'} onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}>9. Kỹ Năng Excel Thực Chiến 6 Buổi</a></li>
                <li><a href="#tracks" onClick={() => scrollToSection('tracks')} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#38BDF8'} onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}>10. Thiết Kế Slide PowerPoint Pro</a></li>
              </ul>
            </div>

            {/* CỘT 3: HỖ TRỢ HỌC VIÊN */}
            <div>
              <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#FFFFFF', marginBottom: '16px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Hỗ Trợ Học Viên
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#94A3B8' }}>
                <li>
                  <a href="/verify" style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onMouseEnter={(e) => e.currentTarget.style.color = '#38BDF8'} onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}>
                    📜 Tra cứu Chứng chỉ số SHA-256
                  </a>
                </li>
                <li>
                  <a href="#guide" onClick={onGetStarted} style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onMouseEnter={(e) => e.currentTarget.style.color = '#38BDF8'} onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}>
                    📂 Hướng dẫn nộp bài tập Google Drive
                  </a>
                </li>
                <li>
                  <a href="#rules" onClick={onGetStarted} style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onMouseEnter={(e) => e.currentTarget.style.color = '#38BDF8'} onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}>
                    ⚖️ Quy chế thi & Giám sát chống gian lận
                  </a>
                </li>
                <li>
                  <a href="#faq" onClick={() => scrollToSection('faq')} style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onMouseEnter={(e) => e.currentTarget.style.color = '#38BDF8'} onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}>
                    ❓ Câu hỏi thường gặp (FAQ)
                  </a>
                </li>
                <li>
                  <a href="https://zalo.me/0332298065" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onMouseEnter={(e) => e.currentTarget.style.color = '#38BDF8'} onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}>
                    💬 Hỗ trợ học vụ & Kỹ thuật Zalo 1-1
                  </a>
                </li>
              </ul>
            </div>

            {/* CỘT 4: THÔNG TIN LIÊN HỆ & MẠNG XÃ HỘI */}
            <div>
              <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#FFFFFF', marginBottom: '16px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Thông Tin Liên Hệ
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#94A3B8', lineHeight: 1.6 }}>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Hotline / Tuyển sinh:</span>
                  <a href="tel:0332298065" style={{ color: '#38BDF8', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }}>033.229.8065</a>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Zalo Official Account:</span>
                  <span style={{ color: '#F1F5F9', fontWeight: 600 }}>PH Digital Education</span>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Email Học vụ:</span>
                  <a href="mailto:support@tinhocgenz.io.vn" style={{ color: '#E2E8F0', textDecoration: 'none' }}>support@tinhocgenz.io.vn</a>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Thời gian hỗ trợ:</span>
                  <span style={{ color: '#F1F5F9' }}>08:00 – 21:30 (Thứ 2 – Chủ Nhật)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Strip — STRICTLY ZERO /admin LINKS */}
          <div style={{
            paddingTop: '24px',
            borderTop: '1px solid #1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '12px',
            color: '#64748B'
          }}>
            <div>
              © {new Date().getFullYear()} PH DIGITAL EDUCATION (tinhocgenz.io.vn). Bảo lưu mọi quyền.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span>Đào tạo Trực tuyến Toàn Quốc</span>
              <span>•</span>
              <span>Bảo mật dữ liệu chuẩn ISO/IEC 27001</span>
              <span>•</span>
              <a href="#privacy" onClick={onGetStarted} style={{ color: '#94A3B8', textDecoration: 'none' }}>Điều khoản & Bảo mật</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
