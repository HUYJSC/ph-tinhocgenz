import React, { useState, useEffect } from 'react';
import {
  BookOpen, Award, ChevronRight, Monitor, Star,
  CheckCircle2, Play, ArrowRight, GraduationCap, BarChart3,
  Brain, Zap, Shield, Globe
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const TRACKS = [
  { icon: '📊', name: 'MOS Excel', desc: 'Hàm, PivotTable, Chart', color: '#10b981', level: 'Cơ bản → Nâng cao' },
  { icon: '📝', name: 'MOS Word', desc: 'Soạn thảo chuẩn hành chính', color: '#3b82f6', level: 'Cơ bản → Nâng cao' },
  { icon: '💻', name: 'IC3 GS6', desc: 'Chứng chỉ quốc tế IC3', color: '#8b5cf6', level: 'Tiêu chuẩn quốc tế' },
  { icon: '🖥️', name: 'CC CNTT', desc: 'Chứng chỉ Tin học Bộ GD&ĐT', color: '#f59e0b', level: 'Cơ bản & Nâng cao' },
  { icon: '🤖', name: 'AI Văn Phòng', desc: 'Ứng dụng AI vào công việc', color: '#ef4444', level: 'Hiện đại & Thực chiến' },
  { icon: '📈', name: 'Excel Kế Toán', desc: 'Excel chuyên ngành kế toán', color: '#06b6d4', level: 'Nghề nghiệp' },
];

const FEATURES = [
  { icon: <Brain size={22} />, title: 'Kiểm tra trình độ đầu vào', desc: 'Bài test chẩn đoán xác định điểm mạnh/yếu, tạo lộ trình học cá nhân hóa.', color: '#8b5cf6' },
  { icon: <BarChart3 size={22} />, title: 'Phân tích kỹ năng chi tiết', desc: 'Sau mỗi bài thi, biết chính xác kỹ năng nào yếu để tập trung cải thiện.', color: '#3b82f6' },
  { icon: <Zap size={22} />, title: 'Smart Review (Spaced Repetition)', desc: 'Ôn tập câu sai theo thuật toán khoa học — nhớ lâu hơn, hiệu quả hơn.', color: '#10b981' },
  { icon: <Shield size={22} />, title: 'Thi thử chuẩn format thực', desc: 'Đề thi sát đề thật, có giới hạn thời gian, tự động lưu câu trả lời.', color: '#f59e0b' },
  { icon: <Globe size={22} />, title: 'Học mọi lúc, mọi nơi', desc: 'Web app + PWA cài ngay lên điện thoại, không cần download.', color: '#ef4444' },
  { icon: <Award size={22} />, title: 'Chứng chỉ QR Verifiable', desc: 'Hoàn thành khóa học nhận chứng nhận điện tử có thể xác thực qua QR.', color: '#f59e0b' },
];

const STATS = [
  { value: '10+', label: 'Chương trình học', icon: <BookOpen size={20} /> },
  { value: '500+', label: 'Câu hỏi luyện tập', icon: <CheckCircle2 size={20} /> },
  { value: '100%', label: 'Miễn phí cho học viên', icon: <Star size={20} /> },
  { value: 'PWA', label: 'Cài vào điện thoại', icon: <Monitor size={20} /> },
];

const LEARNING_STEPS = [
  { step: '01', title: 'Kiểm tra trình độ', desc: 'Làm bài test đầu vào → hệ thống phân tích điểm mạnh/yếu', color: '#4f6ef7' },
  { step: '02', title: 'Nhận lộ trình học', desc: 'Lộ trình cá nhân hóa → biết mình cần học gì, theo thứ tự nào', color: '#8b5cf6' },
  { step: '03', title: 'Học & luyện tập', desc: 'Học theo bài, luyện từng kỹ năng, nhận feedback ngay lập tức', color: '#10b981' },
  { step: '04', title: 'Thi thử & phân tích', desc: 'Thi thử sát format thực → phân tích chi tiết theo từng kỹ năng', color: '#f59e0b' },
  { step: '05', title: 'Ôn điểm yếu & thi lại', desc: 'Hệ thống gợi ý bài cần ôn → ôn đúng chỗ → thi đạt chuẩn', color: '#ef4444' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [activeTrack, setActiveTrack] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--bg-base)', color: 'var(--text-primary)', overflowX: 'hidden' }}>

      {/* ─────── NAVBAR ─────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: scrollY > 40 ? 'var(--bg-glass)' : 'transparent',
        backdropFilter: scrollY > 40 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 40 ? '1px solid var(--border-color)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <GraduationCap size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>PH DIGITAL</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>EDUCATION</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={onGetStarted}
              style={{
                padding: '8px 20px', borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                background: 'transparent', color: 'var(--text-primary)',
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Đăng nhập
            </button>
            <button
              onClick={onGetStarted}
              className="btn btn-primary"
              style={{ padding: '8px 20px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}
            >
              Bắt đầu học →
            </button>
          </div>
        </div>
      </nav>

      {/* ─────── HERO SECTION ─────── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1530 50%, #0a192f 100%)',
        padding: '100px 24px 60px', position: 'relative', overflow: 'hidden'
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: 'linear-gradient(rgba(99,132,251,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,132,251,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        {/* Glow orbs */}
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,110,247,0.2) 0%, transparent 70%)', top: '-100px', left: '-200px', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', bottom: '-80px', right: '-100px', filter: 'blur(40px)' }} />

        <div style={{ textAlign: 'center', position: 'relative', maxWidth: '820px' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: 'var(--radius-full)',
            background: 'rgba(79, 110, 247, 0.15)', border: '1px solid rgba(79, 110, 247, 0.35)',
            marginBottom: '28px', fontSize: '0.8rem', color: '#8ba3fd', fontWeight: 600
          }}>
            <Zap size={13} />
            Nền tảng học Tin học thông minh #1 tại PH DIGITAL EDUCATION
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.6rem)', fontWeight: 900, lineHeight: 1.1,
            color: '#f8fafc', marginBottom: '20px', letterSpacing: '-0.03em'
          }}>
            Học Tin học theo{' '}
            <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              đúng năng lực
            </span>{' '}
            của bạn
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#94a3b8', lineHeight: 1.7,
            marginBottom: '40px', maxWidth: '620px', margin: '0 auto 40px'
          }}>
            Kiểm tra trình độ đầu vào → Nhận lộ trình học cá nhân hóa → Luyện đề chuẩn MOS, IC3, CC CNTT
            → Phân tích kỹ năng → Đạt chứng chỉ quốc tế.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onGetStarted}
              className="btn btn-primary"
              style={{
                padding: '14px 32px', fontSize: '1rem', fontWeight: 700,
                borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-brand)',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <Play size={18} fill="white" />
              Kiểm tra trình độ miễn phí
            </button>
            <button
              onClick={onGetStarted}
              style={{
                padding: '14px 28px', fontSize: '1rem', fontWeight: 600,
                borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.07)', color: '#f8fafc', cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            >
              Xem lộ trình học <ChevronRight size={18} />
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginTop: '56px', flexWrap: 'wrap' }}>
            {STATS.map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: '#f8fafc' }}>{stat.value}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────── LEARNING TRACKS ─────── */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-base)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
              Chương trình học
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, marginBottom: '12px' }}>
              Học theo đúng mục tiêu của bạn
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '520px', margin: '0 auto' }}>
              Từ Tin học văn phòng cơ bản đến chứng chỉ quốc tế MOS, IC3 — mỗi lộ trình được thiết kế riêng biệt.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {TRACKS.map((track, i) => (
              <div
                key={i}
                onClick={() => { setActiveTrack(i); onGetStarted(); }}
                style={{
                  padding: '24px', borderRadius: 'var(--radius-xl)',
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  cursor: 'pointer', transition: 'all 0.25s',
                  position: 'relative', overflow: 'hidden',
                  boxShadow: activeTrack === i ? `0 0 0 2px ${track.color}40, var(--shadow-md)` : 'var(--shadow-sm)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${track.color}40, var(--shadow-lg)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: track.color, opacity: 0.8 }} />
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{track.icon}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>{track.name}</h3>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{track.desc}</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, color: track.color }}>
                  {track.level} <ArrowRight size={12} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <button
              onClick={onGetStarted}
              className="btn btn-primary"
              style={{ padding: '12px 28px', borderRadius: 'var(--radius-full)', fontSize: '0.95rem' }}
            >
              Xem tất cả khóa học →
            </button>
          </div>
        </div>
      </section>

      {/* ─────── LEARNING JOURNEY ─────── */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
              Learning Journey
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800 }}>
              Lộ trình học khép kín — từ 0 đến chứng chỉ
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {LEARNING_STEPS.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', padding: '24px 0', borderBottom: i < LEARNING_STEPS.length - 1 ? '1px solid var(--border-muted)' : 'none' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
                  background: `${step.color}20`, border: `2px solid ${step.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 900, color: step.color
                }}>
                  {step.step}
                </div>
                <div style={{ flex: 1, paddingTop: '4px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>{step.title}</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</div>
                </div>
                {i < LEARNING_STEPS.length - 1 && (
                  <div style={{ width: '24px', display: 'flex', justifyContent: 'center', paddingTop: '14px' }}>
                    <ChevronRight size={18} color="var(--text-muted)" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────── FEATURES ─────── */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-base)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, marginBottom: '12px' }}>
              Tại sao học tại PH Digital Education?
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                padding: '24px', borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                display: 'flex', flexDirection: 'column', gap: '12px'
              }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color }}>
                  {f.icon}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{f.title}</div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────── SOCIAL PROOF ─────── */}
      <section style={{ padding: '60px 24px', background: 'linear-gradient(135deg, #0a0f1e, #0d1530)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '16px' }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="#fbbf24" color="#fbbf24" />)}
          </div>
          <blockquote style={{ fontSize: '1.15rem', color: '#e2e8f0', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '20px' }}>
            "Chưa bao giờ học Tin học mà biết mình đang yếu ở đâu rõ ràng đến vậy. Sau khi làm bài test, hệ thống chỉ ra ngay tôi cần ôn kỹ năng VLOOKUP và PivotTable. Chỉ 2 tuần ôn đúng chỗ là thi đạt MOS Excel."
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem' }}>N</div>
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.9rem' }}>Nguyễn Thị Lan Anh</div>
              <div style={{ color: '#64748b', fontSize: '0.78rem' }}>Học viên lớp K26-WE01 • Đạt MOS Excel 2024</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────── CTA FOOTER ─────── */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-secondary)', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Sẵn sàng bắt đầu chưa?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '36px', lineHeight: 1.7 }}>
            Tham gia ngay hôm nay — hoàn toàn miễn phí cho học viên.<br />
            Hệ thống sẽ đánh giá trình độ và tạo lộ trình học riêng cho bạn.
          </p>
          <button
            onClick={onGetStarted}
            className="btn btn-primary"
            style={{
              padding: '16px 40px', fontSize: '1.05rem', fontWeight: 700,
              borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-brand)',
              display: 'inline-flex', alignItems: 'center', gap: '10px'
            }}
          >
            <Play size={20} fill="white" />
            Kiểm tra trình độ miễn phí ngay
          </button>
          <div style={{ marginTop: '20px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Không cần thẻ tín dụng • Học viên nhận mã từ Thầy/Cô • Hỗ trợ 24/7
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 24px', background: '#060a13', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={16} color="white" />
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8' }}>PH DIGITAL EDUCATION</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#4b5563' }}>
          © 2026 PH Digital Education — hoctructuyen.tinhocgenz.io.vn
        </div>
      </footer>
    </div>
  );
};
