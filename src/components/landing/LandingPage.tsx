import React, { useState, useEffect } from 'react';
import {
  Award, ChevronRight, Star,
  CheckCircle2, Play, ArrowRight, BarChart3,
  Brain, Zap, Shield, Globe, Clock, Check, Sparkles
} from 'lucide-react';

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
    color: '#3b82f6',
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
    color: '#10b981',
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
    color: '#2563eb',
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
    color: '#f97316',
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
    color: '#8b5cf6',
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
    color: '#06b6d4',
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
    color: '#e11d48',
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
    color: '#a855f7',
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
    color: '#059669',
    highlights: ['Sổ sách kế toán tự động', 'Hàm tài chính & khấu hao', 'Kỹ thuật lọc báo cáo động']
  }
];

const LEARNING_STEPS = [
  {
    step: '01',
    title: 'Kiểm tra trình độ đầu vào (Diagnostic Test)',
    desc: 'Hệ thống tự động chấm điểm bài test 15 phút, vẽ biểu đồ Radar phân tích điểm mạnh, điểm yếu theo từng hàm và kỹ năng.',
    color: '#3b82f6'
  },
  {
    step: '02',
    title: 'Nhận lộ trình cá nhân hóa (AI Pathway)',
    desc: 'Thuật toán tự động thiết kế lộ trình tinh gọn, chỉ tập trung vào các kỹ năng còn thiếu hụt giúp tiết kiệm 50% thời gian.',
    color: '#8b5cf6'
  },
  {
    step: '03',
    title: 'Học lý thuyết thực chiến & Làm bài mẫu',
    desc: 'Học qua các tình huống văn phòng thực tế, xem video giải chi tiết các bẫy thi thường gặp trong đề thi Certiport.',
    color: '#10b981'
  },
  {
    step: '04',
    title: 'Thi thử bấm giờ sát 99% đề thật',
    desc: 'Làm bài thi trên phòng thi trực tuyến với đồng hồ đếm ngược, tự động lưu bài từng giây và mô phỏng chính xác giao diện thi thật.',
    color: '#f59e0b'
  },
  {
    step: '05',
    title: 'Ôn luyện câu sai & Cấp chứng nhận QR',
    desc: 'Tính năng Smart Review tự động gom các câu làm sai để nhắc ôn lại theo chu kỳ khoa học Spaced Repetition, đảm bảo thi đỗ 1000/1000.',
    color: '#ef4444'
  }
];

const FEATURES = [
  {
    icon: <Brain size={24} />,
    title: 'Chẩn đoán năng lực bằng AI',
    desc: 'Phân tích chính xác từng kỹ năng con (VLOOKUP, PivotTable, Slide Master, Mail Merge) để chỉ ra điểm cần cải thiện ngay.',
    color: '#3b82f6'
  },
  {
    icon: <Shield size={24} />,
    title: 'Đề thi sát 99% đề thật Certiport',
    desc: 'Ngân hàng 500+ câu hỏi cập nhật mới nhất năm 2026, bấm giờ chuẩn xác và tự động sao lưu câu trả lời không sợ rớt mạng.',
    color: '#10b981'
  },
  {
    icon: <Zap size={24} />,
    title: 'Smart Review (Spaced Repetition)',
    desc: 'Thuật toán lặp lại ngắt quãng thông minh giúp não bộ ghi nhớ lâu các công thức và phím tắt quan trọng.',
    color: '#f59e0b'
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Radar Chart Năng Lực Trực Quan',
    desc: 'Theo dõi sự tiến bộ hàng ngày qua biểu đồ radar nhiều chiều, đo lường độ thành thạo kỹ năng từ 0% đến 100%.',
    color: '#8b5cf6'
  },
  {
    icon: <Award size={24} />,
    title: 'Chứng nhận điện tử QR Verifiable',
    desc: 'Hoàn thành khóa học được cấp chứng nhận điện tử có mã QR xác minh công khai, nâng tầm CV xin việc.',
    color: '#ec4899'
  },
  {
    icon: <Globe size={24} />,
    title: 'Học mọi lúc trên Web & Mobile PWA',
    desc: 'Giao diện tối ưu hoàn hảo cho máy tính, máy tính bảng và điện thoại. Cài đặt trực tiếp như ứng dụng di động.',
    color: '#06b6d4'
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
  const [selectedMockOption, setSelectedMockOption] = useState<string>('B');
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
      background: '#070B14',
      color: '#F8FAFC',
      fontFamily: 'var(--font-sans)',
      overflowX: 'hidden',
      position: 'relative'
    }}>

      {/* 1. TOP NAVIGATION BAR (FULL-WIDTH GLASSMORPHISM) */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 999,
        background: scrollY > 20 ? 'rgba(7, 11, 20, 0.88)' : 'transparent',
        backdropFilter: 'blur(16px)',
        borderBottom: scrollY > 20 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img
              src="/LogoPH.png"
              alt="PH DIGITAL EDUCATION Logo"
              style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo.png';
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
                lineHeight: 1.2
              }}>
                PH DIGITAL EDUCATION
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: '#94A3B8',
                lineHeight: 1
              }}>
                Information Technology • IC3 • MOS
              </span>
            </div>
          </div>

          {/* Center Links (Desktop) */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }} className="hide-sm">
            <button
              onClick={() => scrollToSection('tracks')}
              style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#38BDF8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
            >
              Chương trình đào tạo
            </button>
            <button
              onClick={() => scrollToSection('roadmap')}
              style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#38BDF8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
            >
              Lộ trình 5 bước
            </button>
            <button
              onClick={() => scrollToSection('features')}
              style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#38BDF8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
            >
              Tính năng nổi bật
            </button>
            <button
              onClick={() => scrollToSection('reviews')}
              style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#38BDF8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
            >
              Cam kết đầu ra
            </button>
          </nav>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onGetStarted}
              style={{
                padding: '8px 18px',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#F8FAFC',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }}
            >
              Đăng nhập
            </button>
            <button
              onClick={onGetStarted}
              style={{
                padding: '8px 20px',
                borderRadius: '9999px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
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

      {/* 2. HERO SECTION (BALANCED 2-COLUMN MODERN EDTECH LAYOUT) */}
      <section style={{
        position: 'relative',
        padding: '120px 20px 70px',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(37, 99, 235, 0.25), transparent 70%), #070B14',
        overflow: 'hidden'
      }}>
        {/* Subtle background tech grid */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.08,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none'
        }} />

        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          {/* LEFT COLUMN: HERO CONTENT & VALUE PROPOSITION */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {/* Top Chip */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(37, 99, 235, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              color: '#60A5FA',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '20px'
            }}>
              <Zap size={14} />
              Nền tảng học & khảo thí Tin học thông minh 2026
            </div>

            {/* Main Headline */}
            <h1 style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              marginBottom: '20px'
            }}>
              Học Tin học theo{' '}
              <span style={{
                background: 'linear-gradient(135deg, #38BDF8 0%, #3B82F6 60%, #818CF8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                đúng năng lực
              </span>{' '}
              của bạn
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)',
              color: '#94A3B8',
              lineHeight: 1.7,
              marginBottom: '32px',
              maxWidth: '560px'
            }}>
              Kiểm tra trình độ đầu vào miễn phí • Nhận lộ trình cá nhân hóa • Luyện đề thi sát 99% đề thật Certiport • Phân tích kỹ năng yếu và cam kết bao đỗ chứng chỉ MOS, IC3 GS6 & CNTT 100%.
            </p>

            {/* Primary & Secondary Action CTAs */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '44px', width: '100%' }}>
              <button
                onClick={onGetStarted}
                style={{
                  padding: '14px 28px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.45)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(37, 99, 235, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.45)';
                }}
              >
                <Play size={18} fill="white" />
                Kiểm tra trình độ miễn phí
              </button>

              <button
                onClick={() => scrollToSection('tracks')}
                style={{
                  padding: '14px 24px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: '#E2E8F0',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
                }}
              >
                Xem 10 chương trình học <ArrowRight size={15} />
              </button>
            </div>

            {/* Quick Stats Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              width: '100%'
            }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#F8FAFC', lineHeight: 1.1 }}>10+</div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', fontWeight: 500 }}>Chương trình</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#38BDF8', lineHeight: 1.1 }}>500+</div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', fontWeight: 500 }}>Đề thi & bài tập</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#10B981', lineHeight: 1.1 }}>100%</div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', fontWeight: 500 }}>Cam kết bao đỗ</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#F59E0B', lineHeight: 1.1 }}>PWA</div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', fontWeight: 500 }}>Web & Mobile</div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE CERTIPORT ASSESSMENT SIMULATION CARD */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '540px', margin: '0 auto' }}>
            {/* Ambient Backlight Glow */}
            <div style={{
              position: 'absolute',
              width: '320px',
              height: '320px',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
              top: '-30px',
              right: '-20px',
              filter: 'blur(50px)',
              pointerEvents: 'none'
            }} />

            {/* Floating Badge 1 (Top-Right) */}
            <div style={{
              position: 'absolute',
              top: '-18px',
              right: '10px',
              zIndex: 20,
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '12px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)'
            }}>
              <Award size={18} color="#F59E0B" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#F8FAFC' }}>Chuẩn Certiport 2026</span>
                <span style={{ fontSize: '9px', color: '#F59E0B', fontWeight: 600 }}>Dự đoán: 980 / 1000 Điểm</span>
              </div>
            </div>

            {/* Main Interactive Card */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 24px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(37, 99, 235, 0.15)',
              backdropFilter: 'blur(20px)',
              position: 'relative'
            }}>
              {/* Card Header with Live Indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10B981',
                    boxShadow: '0 0 10px #10B981'
                  }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#34D399', letterSpacing: '0.04em' }}>
                    ĐANG DIỄN RA CA THI THỬ
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  color: '#94A3B8',
                  fontFamily: 'var(--font-mono)'
                }}>
                  <Clock size={13} /> 38:45
                </div>
              </div>

              {/* Question Context */}
              <div style={{ marginBottom: '14px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#38BDF8',
                  background: 'rgba(56, 189, 248, 0.12)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  textTransform: 'uppercase'
                }}>
                  MOS Excel 2019/365 • Hàm Nâng Cao
                </span>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#F1F5F9',
                  lineHeight: 1.5,
                  marginTop: '10px'
                }}>
                  Trong Excel 2019/365, hàm nào được khuyến nghị thay thế cho INDEX & MATCH để tra cứu linh hoạt 2 chiều và tự động bắt lỗi?
                </p>
              </div>

              {/* Interactive Options list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {[
                  { key: 'A', text: 'Hàm VLOOKUP', isCorrect: false },
                  { key: 'B', text: 'Hàm XLOOKUP (Tra cứu 2 chiều thông minh)', isCorrect: true },
                  { key: 'C', text: 'Hàm HLOOKUP', isCorrect: false },
                  { key: 'D', text: 'Hàm SEARCH kết hợp MID', isCorrect: false }
                ].map((opt) => {
                  const isSelected = selectedMockOption === opt.key;
                  return (
                    <div
                      key={opt.key}
                      onClick={() => setSelectedMockOption(opt.key)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '1.5px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: isSelected ? '#10B981' : 'rgba(255, 255, 255, 0.08)',
                          color: isSelected ? '#FFFFFF' : '#94A3B8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 800
                        }}>
                          {opt.key}
                        </span>
                        <span style={{ fontSize: '13px', color: isSelected ? '#FFFFFF' : '#CBD5E1', fontWeight: isSelected ? 600 : 400 }}>
                          {opt.text}
                        </span>
                      </div>
                      {isSelected && opt.isCorrect && (
                        <span style={{ fontSize: '11px', color: '#34D399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={14} /> Chính xác
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanatory Snippet */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px dashed rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                padding: '12px 14px',
                fontSize: '12px',
                color: '#93C5FD',
                lineHeight: 1.5
              }}>
                <strong>💡 Giải thích từ Giảng viên MOS Master:</strong> XLOOKUP là hàm thế hệ mới, không yêu cầu cột tìm kiếm nằm đầu tiên và tích hợp sẵn tham số xử lý lỗi #N/A.
              </div>

              {/* Bottom Prediction Meter */}
              <div style={{
                marginTop: '16px',
                paddingTop: '14px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>TỶ LỆ LÀM CHỦ KỸ NĂNG</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#34D399' }}>94% • Đạt chuẩn Xuất Sắc</span>
                </div>
                <button
                  onClick={onGetStarted}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#38BDF8',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Làm thử toàn bộ đề <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Floating Badge 2 (Bottom-Left) */}
            <div style={{
              position: 'absolute',
              bottom: '-16px',
              left: '10px',
              zIndex: 20,
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '12px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)'
            }}>
              <Sparkles size={16} color="#38BDF8" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#F8FAFC' }}>AI Smart Review</span>
                <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 500 }}>Tự động gom câu sai để ôn lại</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION: 10 CHƯƠNG TRÌNH ĐÀO TẠO THỰC CHIẾN (#tracks) */}
      <section id="tracks" style={{ padding: '90px 20px', background: '#090E1A', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Section Heading */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#38BDF8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'rgba(56, 189, 248, 0.1)',
              padding: '4px 12px',
              borderRadius: '9999px',
              display: 'inline-block',
              marginBottom: '12px'
            }}>
              HỆ THỐNG 10 CHƯƠNG TRÌNH ĐÀO TẠO CHUYÊN SÂU
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '14px' }}>
              Chọn Lộ Trình Phù Hợp Với Mục Tiêu Của Bạn
            </h2>
            <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '640px', margin: '0 auto' }}>
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
                  padding: '8px 20px',
                  borderRadius: '9999px',
                  border: activeCategory === tab.key ? '1px solid #3B82F6' : '1px solid rgba(255,255,255,0.1)',
                  background: activeCategory === tab.key ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255,255,255,0.03)',
                  color: activeCategory === tab.key ? '#60A5FA' : '#94A3B8',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
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
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.25s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = t.color;
                  e.currentTarget.style.boxShadow = `0 12px 30px rgba(0,0,0,0.4), 0 0 20px ${t.color}25`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Top Accent Strip */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: t.color }} />

                <div>
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '26px' }}>{t.icon}</span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: t.color,
                      background: `${t.color}15`,
                      border: `1px solid ${t.color}35`,
                      padding: '3px 10px',
                      borderRadius: '9999px'
                    }}>
                      {t.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px', lineHeight: 1.3 }}>
                    {t.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '18px' }}>
                    {t.desc}
                  </p>

                  {/* Highlights */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {t.highlights.map((hl, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#CBD5E1' }}>
                        <CheckCircle2 size={14} color={t.color} />
                        {hl}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer row with CTA */}
                <div style={{
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> {t.duration}
                  </span>
                  <button
                    onClick={onGetStarted}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: t.color,
                      fontSize: '13px',
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
      <section id="roadmap" style={{ padding: '90px 20px', background: '#070B14' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#10B981',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '4px 12px',
              borderRadius: '9999px',
              display: 'inline-block',
              marginBottom: '12px'
            }}>
              PHƯƠNG PHÁP ĐÀO TẠO KHOA HỌC
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '14px' }}>
              Quy Trình 5 Bước Chinh Phục Điểm Tuyệt Đối
            </h2>
            <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '640px', margin: '0 auto' }}>
              Loại bỏ việc học vẹt lan man. Bạn chỉ học chính xác những gì mình còn thiếu để đạt chứng chỉ nhanh nhất.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {LEARNING_STEPS.map((s) => (
              <div
                key={s.step}
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '24px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = s.color;
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.5)';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: `${s.color}15`,
                  border: `2px solid ${s.color}40`,
                  color: s.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 900,
                  flexShrink: 0
                }}>
                  {s.step}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6 }}>
                    {s.desc}
                  </p>
                </div>
                <div style={{ color: '#475569', alignSelf: 'center' }}>
                  <ChevronRight size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SECTION: TẠI SAO CHỌN PH DIGITAL EDUCATION? (#features) */}
      <section id="features" style={{ padding: '90px 20px', background: '#090E1A', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#8B5CF6',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'rgba(139, 92, 246, 0.1)',
              padding: '4px 12px',
              borderRadius: '9999px',
              display: 'inline-block',
              marginBottom: '12px'
            }}>
              ƯU THẾ CÔNG NGHỆ KHẢO THÍ VƯỢT TRỘI
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '14px' }}>
              Tại Sao Học Viên Chọn PH Digital Education?
            </h2>
            <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '640px', margin: '0 auto' }}>
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
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = f.color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: `${f.color}15`,
                  border: `1px solid ${f.color}35`,
                  color: f.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SECTION: CẢM NHẬN HỌC VIÊN & CHỨNG CHỈ THẬT (#reviews) */}
      <section id="reviews" style={{ padding: '90px 20px', background: '#070B14' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#F59E0B',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'rgba(245, 158, 11, 0.1)',
              padding: '4px 12px',
              borderRadius: '9999px',
              display: 'inline-block',
              marginBottom: '12px'
            }}>
              KẾT QUẢ ĐÀO TẠO THỰC TẾ
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '14px' }}>
              Học Viên Nói Gì Về PH Digital Education?
            </h2>
            <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '640px', margin: '0 auto' }}>
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
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                    ))}
                  </div>
                  <p style={{ fontSize: '14px', color: '#E2E8F0', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '16px' }}>
                    "{t.quote}"
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '14px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>{t.school}</div>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#34D399',
                    background: 'rgba(16, 185, 129, 0.12)',
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
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%), rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(99, 132, 251, 0.3)',
            borderRadius: '24px',
            padding: '40px 30px',
            textAlign: 'center',
            maxWidth: '900px',
            margin: '0 auto',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px' }}>
              Sẵn Sàng Chinh Phục Chứng Chỉ Quốc Tế?
            </h3>
            <p style={{ fontSize: '15px', color: '#CBD5E1', maxWidth: '580px', margin: '0 auto 28px', lineHeight: 1.6 }}>
              Bắt đầu với bài kiểm tra năng lực đầu vào miễn phí 100%. Nhận kết quả chẩn đoán và lộ trình học cá nhân hóa ngay hôm nay.
            </p>
            <button
              onClick={onGetStarted}
              style={{
                padding: '16px 36px',
                borderRadius: '9999px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.5)',
                transition: 'all 0.2s'
              }}
            >
              <Play size={18} fill="white" /> Kiểm tra trình độ miễn phí ngay
            </button>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer style={{
        padding: '50px 20px 30px',
        background: '#04070E',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '40px',
            marginBottom: '40px'
          }}>
            {/* Col 1 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <img
                  src="/LogoPH.png"
                  alt="Logo PH"
                  style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.png'; }}
                />
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
                  PH DIGITAL EDUCATION
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.7, marginBottom: '14px' }}>
                Hệ sinh thái đào tạo Tin học Văn phòng Thực chiến & Luyện thi Chứng chỉ Quốc tế MOS, IC3 GS6 chuẩn Certiport. Cam kết chuẩn đầu ra Đại học bao đỗ 100%.
              </p>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Hotline / Zalo: <strong style={{ color: '#38BDF8' }}>033.229.8065</strong>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '14px' }}>
                Chương Trình Đào Tạo
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#94A3B8' }}>
                <li>Luyện thi MOS Excel 2019 / 365</li>
                <li>Luyện thi MOS Word & PowerPoint</li>
                <li>Chứng chỉ Tin học Quốc tế IC3 GS6</li>
                <li>Chứng chỉ CNTT Cơ bản & Nâng cao</li>
                <li>Ứng dụng AI vào Công việc Văn phòng</li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '14px' }}>
                Tính Năng Nổi Bật
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#94A3B8' }}>
                <li>Kiểm tra trình độ đầu vào miễn phí</li>
                <li>Phòng thi trực tuyến tự động lưu bài</li>
                <li>Smart Review ôn luyện câu sai</li>
                <li>Radar chẩn đoán năng lực kỹ năng</li>
                <li>Cấp chứng nhận điện tử xác minh QR</li>
              </ul>
            </div>
          </div>

          <div style={{
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '12px',
            color: '#64748B'
          }}>
            <div>
              © {new Date().getFullYear()} PH DIGITAL EDUCATION (tinhocgenz.io.vn). All rights reserved.
            </div>
            <div>
              Đào tạo Online toàn quốc • Hỗ trợ học viên 24/7
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
