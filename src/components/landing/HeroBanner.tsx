import React from 'react';
import { ArrowRight, Laptop, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';

interface HeroBannerProps {
  onExploreCourses?: () => void;
  onEnterLMS?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreCourses,
  onEnterLMS
}) => {
  const handlePrimaryClick = (e: React.MouseEvent) => {
    if (onExploreCourses) {
      e.preventDefault();
      onExploreCourses();
    } else {
      const el = document.getElementById('tracks');
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSecondaryClick = (e: React.MouseEvent) => {
    if (onEnterLMS) {
      e.preventDefault();
      onEnterLMS();
    }
  };

  return (
    <section
      aria-label="Tin Học Gen Z - Học Thực Chiến"
      className="hero-banner-container"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '620px',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(180deg, #F0F6FF 0%, #F8FAFC 55%, #FFFFFF 100%)',
        overflow: 'hidden',
        padding: '120px 20px 60px'
      }}
    >
      {/* Decorative ambient backdrop */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-15%',
          left: '10%',
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(191, 219, 254, 0.45) 0%, rgba(240, 246, 255, 0) 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none'
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '5%',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(224, 231, 255, 0.5) 0%, rgba(255, 255, 255, 0) 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }}
      />

      {/* Main inner container */}
      <div
        className="hero-banner-inner"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
          gap: '40px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* LEFT COLUMN: BRAND LABEL, H1, DESCRIPTION, CTAS, BENEFITS */}
        <div className="hero-text-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {/* Small Brand Label */}
          <div
            className="hero-brand-pill"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#1D4ED8',
              fontSize: '12.5px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '18px',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.08)'
            }}
          >
            <Sparkles size={14} color="#2563EB" />
            <span>TIN HỌC GEN Z • HỌC THỰC CHIẾN</span>
          </div>

          {/* Single Main H1 Headline */}
          <h1
            className="hero-heading"
            style={{
              fontSize: 'clamp(2.1rem, 4.2vw, 3.75rem)',
              fontWeight: 900,
              lineHeight: 1.12,
              color: '#0F172A',
              letterSpacing: '-0.03em',
              margin: '0 0 18px 0'
            }}
          >
            Nâng kỹ năng số –{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 60%, #4338CA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}
            >
              Mở lối tương lai
            </span>
          </h1>

          {/* Description */}
          <p
            className="hero-description"
            style={{
              fontSize: 'clamp(1rem, 1.35vw, 1.15rem)',
              color: '#334155',
              lineHeight: 1.65,
              margin: '0 0 32px 0',
              maxWidth: '560px'
            }}
          >
            Học Tin học văn phòng, thiết kế và AI theo lộ trình rõ ràng, ứng dụng ngay vào học tập và công việc.
          </p>

          {/* Action CTAs */}
          <div
            className="hero-cta-group"
            style={{
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
              marginBottom: '28px',
              width: '100%'
            }}
          >
            {/* Primary CTA */}
            <a
              href="#tracks"
              onClick={handlePrimaryClick}
              className="hero-btn-primary"
              style={{
                minHeight: '48px',
                padding: '13px 28px',
                borderRadius: '9999px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
                textDecoration: 'none',
                transition: 'all 0.25s ease'
              }}
            >
              <span>Khám phá khóa học</span>
              <ArrowRight size={16} />
            </a>

            {/* Secondary CTA */}
            <a
              href="https://hoctructuyen.tinhocgenz.io.vn/"
              onClick={handleSecondaryClick}
              className="hero-btn-secondary"
              style={{
                minHeight: '48px',
                padding: '13px 24px',
                borderRadius: '9999px',
                border: '1.5px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#0F172A',
                fontSize: '14.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Laptop size={16} color="#2563EB" />
              <span>Vào hệ thống học tập</span>
            </a>
          </div>

          {/* Benefits Proof Line */}
          <div
            className="hero-benefits-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#475569',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={15} color="#16A34A" />
              <span>Lộ trình rõ ràng</span>
            </div>
            <span style={{ color: '#CBD5E1' }}>•</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={15} color="#2563EB" />
              <span>Bài tập thực hành</span>
            </div>
            <span style={{ color: '#CBD5E1' }}>•</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={15} color="#EA580C" />
              <span>Hỗ trợ tận tâm</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ARTWORK PICTURE (AVIF/WEBP ART DIRECTION) */}
        <div
          className="hero-artwork-col"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
          }}
        >
          {/* Main Picture Wrapper with fixed aspect ratio to eliminate Layout Shift (CLS) */}
          <div
            className="hero-picture-wrapper"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '560px',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(226, 232, 240, 0.8)',
              background: '#EDF4FF',
              aspectRatio: '16 / 10'
            }}
          >
            <picture>
              {/* Mobile/Small screen: 1080x1350 portrait crop */}
              <source
                media="(max-width: 639px)"
                type="image/avif"
                srcSet="/banner-tin-hoc-gen-z-mobile.avif"
              />
              <source
                media="(max-width: 639px)"
                type="image/webp"
                srcSet="/banner-tin-hoc-gen-z-mobile.webp"
              />

              {/* Desktop/Tablet: 1920x720 landscape */}
              <source
                media="(min-width: 640px)"
                type="image/avif"
                srcSet="/banner-tin-hoc-gen-z-hoc-thuc-chien.avif"
              />
              <source
                media="(min-width: 640px)"
                type="image/webp"
                srcSet="/banner-tin-hoc-gen-z-hoc-thuc-chien.webp"
              />

              {/* Fallback image with LCP priority */}
              <img
                src="/banner-tin-hoc-gen-z-hoc-thuc-chien.jpg"
                alt="Học viên Tin Học Gen Z thực hành kỹ năng tin học, thiết kế và AI trên máy tính"
                width="1920"
                height="720"
                loading="eager"
                // @ts-ignore
                fetchpriority="high"
                decoding="async"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block'
                }}
              />
            </picture>

            {/* Subtle Overlay Badge (Floating Credibility Card) */}
            <div
              className="hero-floating-card"
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(12px)',
                borderRadius: '14px',
                padding: '10px 14px',
                boxShadow: '0 10px 25px -4px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.8)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                maxWidth: 'calc(100% - 32px)'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0
                }}
              >
                <Laptop size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                  Chứng chỉ Quốc tế Certiport & CNTT
                </span>
                <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600, lineHeight: 1.2 }}>
                  ✓ Đề thi sát 99% đề thi thật
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded CSS for responsive adjustments and accessibility focus rings */}
      <style>{`
        .hero-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 26px rgba(37, 99, 235, 0.45);
        }
        .hero-btn-primary:active {
          transform: translateY(0);
        }
        .hero-btn-primary:focus-visible {
          outline: 3px solid #60A5FA;
          outline-offset: 3px;
        }
        .hero-btn-secondary:hover {
          background: #F8FAFC;
          border-color: #94A3B8;
        }
        .hero-btn-secondary:active {
          transform: translateY(0);
        }
        .hero-btn-secondary:focus-visible {
          outline: 3px solid #60A5FA;
          outline-offset: 3px;
        }
        @media (max-width: 900px) {
          .hero-banner-inner {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            text-align: left;
          }
          .hero-banner-container {
            padding: 100px 16px 40px !important;
            min-height: auto !important;
          }
          .hero-heading {
            font-size: clamp(1.85rem, 6.5vw, 2.6rem) !important;
          }
          .hero-picture-wrapper {
            max-width: 100% !important;
            aspect-ratio: 4 / 3 !important;
          }
        }
        @media (max-width: 480px) {
          .hero-cta-group {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .hero-btn-primary, .hero-btn-secondary {
            width: 100% !important;
          }
          .hero-benefits-row {
            font-size: 11.5px !important;
            gap: 8px !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-btn-primary, .hero-btn-secondary {
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
};
