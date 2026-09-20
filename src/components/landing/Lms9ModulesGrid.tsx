import React from 'react';
import {
  Play, ArrowRight, Layers, Sparkles
} from 'lucide-react';

export interface Lms9ModulesGridProps {
  onNavigateToModule: (moduleId: string) => void;
}

export const Lms9ModulesGrid: React.FC<Lms9ModulesGridProps> = ({ onNavigateToModule }) => {
  return (
    <section style={{
      width: '100%',
      background: '#F8FAFC',
      padding: '48px 0 64px',
      borderTop: '1px solid #E2E8F0',
      borderBottom: '1px solid #E2E8F0'
    }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 20px' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '20px',
            background: 'rgba(0, 87, 184, 0.08)',
            color: '#0057B8',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '10px'
          }}>
            <Layers size={14} /> 9 Phân Hệ Đào Tạo & Khảo Thí Toàn Diện
          </div>
          <h2 style={{
            fontSize: 'clamp(24px, 3vw, 32px)',
            fontWeight: 800,
            color: '#0B2545',
            margin: '0 0 10px',
            letterSpacing: '-0.02em'
          }}>
            Hệ Sinh Thái Học Tập Trực Tuyến Thế Hệ Mới
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#64748B',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Khám phá 9 không gian chức năng tương tác chuyên sâu được tích hợp công nghệ AI và bảo chứng năng lực trên nền tảng Blockchain.
          </p>
        </div>

        {/* 9-GRID CONTAINER */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '24px'
        }}>

          {/* ── CARD 1: TRANG CHỦ (HOME) ── */}
          <div
            onClick={() => onNavigateToModule('home')}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #CBD5E1',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(11, 37, 69, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            {/* Header Badge */}
            <div style={{
              background: '#0057B8',
              color: '#FFFFFF',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>1. Trang chủ (Home)</span>
              <span style={{ fontSize: '11px', opacity: 0.85 }}>Cổng thông tin</span>
            </div>

            {/* Mock Visual Body */}
            <div style={{ padding: '16px', flex: 1, background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #E0F2FE 0%, #FFFFFF 100%)',
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid #BAE6FD'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#0284C7' }}>TINHOCGENZ</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>
                  Học công nghệ. Làm chủ tương lai.
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  Ứng dụng AI - Blockchain - Học liệu thực tiễn
                </div>
              </div>

              {/* Featured Courses Row */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                  Khóa học nổi bật:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '11px' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>🐍 Python Cơ Bản</div>
                    <div style={{ color: '#F59E0B', fontSize: '10px' }}>⭐ 4.9 (1.2k)</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '11px' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>⚛️ React Frontend</div>
                    <div style={{ color: '#F59E0B', fontSize: '10px' }}>⭐ 4.8 (850)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div style={{ padding: '10px 16px', background: '#FFFFFF', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0057B8' }}>Khám phá Trang chủ</span>
              <ArrowRight size={14} color="#0057B8" />
            </div>
          </div>

          {/* ── CARD 2: TRANG DANH SÁCH KHÓA HỌC ── */}
          <div
            onClick={() => onNavigateToModule('courses')}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #CBD5E1',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(11, 37, 69, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer'
            }}
          >
            <div style={{
              background: '#0284C7',
              color: '#FFFFFF',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>2. Trang danh sách khóa học</span>
              <span style={{ fontSize: '11px', opacity: 0.85 }}>Catalog & Bộ lọc</span>
            </div>

            <div style={{ padding: '16px', flex: 1, background: '#F8FAFC', display: 'flex', gap: '12px' }}>
              {/* Left filter mock */}
              <div style={{ width: '90px', background: '#FFFFFF', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontWeight: 800, color: '#0F172A' }}>Danh mục</div>
                <div style={{ color: '#0284C7', fontWeight: 700 }}>• Lập trình</div>
                <div style={{ color: '#64748B' }}>• Data & AI</div>
                <div style={{ color: '#64748B' }}>• Thiết kế</div>
                <div style={{ color: '#64748B' }}>• Kỹ năng VP</div>
              </div>

              {/* Right Course List */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', fontSize: '10px' }}>
                  <span style={{ background: '#0284C7', color: '#FFF', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Phổ biến</span>
                  <span style={{ background: '#E2E8F0', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>Mới nhất</span>
                  <span style={{ background: '#E2E8F0', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>Đánh giá cao</span>
                </div>
                <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '11px' }}>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>Python cơ bản đến nâng cao</div>
                  <div style={{ fontSize: '10px', color: '#059669', fontWeight: 700 }}>500.000đ • 24 bài học</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '11px' }}>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>Data Analysis với Excel</div>
                  <div style={{ fontSize: '10px', color: '#059669', fontWeight: 700 }}>800.000đ • 18 bài học</div>
                </div>
              </div>
            </div>

            <div style={{ padding: '10px 16px', background: '#FFFFFF', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0284C7' }}>Xem danh sách khóa học</span>
              <ArrowRight size={14} color="#0284C7" />
            </div>
          </div>

          {/* ── CARD 3: TRANG CHI TIẾT KHÓA HỌC ── */}
          <div
            onClick={() => onNavigateToModule('course-detail')}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #CBD5E1',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(11, 37, 69, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer'
            }}
          >
            <div style={{
              background: '#0D9488',
              color: '#FFFFFF',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>3. Trang chi tiết khóa học</span>
              <span style={{ fontSize: '11px', opacity: 0.85 }}>Syllabus & Học phí</span>
            </div>

            <div style={{ padding: '16px', flex: 1, background: '#F8FAFC', display: 'flex', gap: '12px' }}>
              {/* Left Video Teaser */}
              <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ background: '#0F172A', borderRadius: '8px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8' }}>
                  <Play size={24} fill="#38BDF8" />
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>Lập trình Python toàn diện</div>
                <div style={{ fontSize: '10px', color: '#64748B' }}>12 buổi • GV Thầy Quang Huy</div>
              </div>

              {/* Right Pricing Card */}
              <div style={{ flex: 1, background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0D9488' }}>1.299.000đ</div>
                <div style={{ fontSize: '10px', color: '#94A3B8', textDecoration: 'line-through' }}>1.800.000đ (-28%)</div>
                <button style={{ background: '#0D9488', color: '#FFF', border: 'none', borderRadius: '4px', padding: '4px', fontSize: '10px', fontWeight: 700 }}>
                  Đăng ký ngay
                </button>
                <div style={{ fontSize: '9px', color: '#475569', marginTop: '2px' }}>
                  ✓ Chứng chỉ Blockchain<br />✓ AI Tutor hỗ trợ 24/7
                </div>
              </div>
            </div>

            <div style={{ padding: '10px 16px', background: '#FFFFFF', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0D9488' }}>Xem trang chi tiết</span>
              <ArrowRight size={14} color="#0D9488" />
            </div>
          </div>

          {/* ── CARD 4: TRANG HỌC (LEARNING PLAYER) ── */}
          <div
            onClick={() => onNavigateToModule('student')}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #CBD5E1',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(11, 37, 69, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer'
            }}
          >
            <div style={{
              background: '#2563EB',
              color: '#FFFFFF',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>4. Trang học (Learning Player)</span>
              <span style={{ fontSize: '11px', opacity: 0.85 }}>Trình phát bài học</span>
            </div>

            <div style={{ padding: '14px', flex: 1, background: '#0F172A', color: '#F8FAFC', display: 'flex', gap: '10px' }}>
              {/* Mini Lesson Sidebar */}
              <div style={{ width: '90px', background: '#1E293B', padding: '8px', borderRadius: '6px', fontSize: '9px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontWeight: 700, color: '#38BDF8' }}>Bài học</div>
                <div style={{ color: '#22C55E' }}>✓ 1. Cài đặt Python</div>
                <div style={{ color: '#38BDF8', fontWeight: 700 }}>▶ 2. Biến & Kiểu</div>
                <div style={{ color: '#64748B' }}>🔒 3. Vòng lặp</div>
              </div>

              {/* Player & Code Editor Mock */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ background: '#1E293B', height: '65px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={20} color="#38BDF8" />
                </div>
                <div style={{ background: '#131D33', padding: '6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '9px', color: '#A5F3FC' }}>
                  print("Hello TinHocGenZ!")
                </div>
              </div>
            </div>

            <div style={{ padding: '10px 16px', background: '#FFFFFF', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB' }}>Vào phòng học trực tuyến</span>
              <ArrowRight size={14} color="#2563EB" />
            </div>
          </div>

          {/* ── CARD 5: LỘ TRÌNH HỌC CÁ NHÂN (AI) ── */}
          <div
            onClick={() => onNavigateToModule('learning_path')}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #CBD5E1',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(11, 37, 69, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer'
            }}
          >
            <div style={{
              background: '#7C3AED',
              color: '#FFFFFF',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>5. Lộ trình học cá nhân (AI)</span>
              <span style={{ fontSize: '11px', opacity: 0.85 }}>Adaptive Roadmap</span>
            </div>

            <div style={{ padding: '16px', flex: 1, background: '#FAF5FF', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                  <Sparkles size={16} />
                </div>
                <div style={{ background: '#FFFFFF', border: '1px solid #E9D5FF', borderRadius: '8px', padding: '6px 10px', fontSize: '10.5px', color: '#581C87', flex: 1 }}>
                  "Mình sẽ giúp bạn xây dựng lộ trình phù hợp với mục tiêu của bạn!"
                </div>
              </div>

              {/* 4 Steps Roadmap */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', textAlign: 'center' }}>
                {[
                  { step: '1', title: 'Đánh giá' },
                  { step: '2', title: 'Lộ trình' },
                  { step: '3', title: 'Học tập' },
                  { step: '4', title: 'Chứng chỉ' }
                ].map((s) => (
                  <div key={s.step} style={{ background: '#FFFFFF', border: '1px solid #E9D5FF', padding: '6px 2px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#7C3AED' }}>Bước {s.step}</div>
                    <div style={{ fontSize: '9px', color: '#475569' }}>{s.title}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '10px 16px', background: '#FFFFFF', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#7C3AED' }}>Mở lộ trình học AI</span>
              <ArrowRight size={14} color="#7C3AED" />
            </div>
          </div>

          {/* ── CARD 6: TRANG THI CHỨNG CHỈ ── */}
          <div
            onClick={() => onNavigateToModule('exams')}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #CBD5E1',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(11, 37, 69, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer'
            }}
          >
            <div style={{
              background: '#EA580C',
              color: '#FFFFFF',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>6. Trang thi chứng chỉ</span>
              <span style={{ fontSize: '11px', opacity: 0.85 }}>Online Exams</span>
            </div>

            <div style={{ padding: '16px', flex: 1, background: '#FFF7ED', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', fontSize: '10px' }}>
                <span style={{ background: '#EA580C', color: '#FFF', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>Kỳ thi đang mở</span>
                <span style={{ background: '#FFEDD5', color: '#9A3412', padding: '2px 8px', borderRadius: '4px' }}>Chứng chỉ của tôi</span>
              </div>

              {/* Exam items */}
              <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '8px', border: '1px solid #FED7AA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>Chứng chỉ Lập trình Python</div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Thi trực tuyến • 60 phút</div>
                </div>
                <button style={{ background: '#EA580C', color: '#FFF', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', fontWeight: 700 }}>
                  Đăng ký thi
                </button>
              </div>

              <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '8px', border: '1px solid #FED7AA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>Chứng chỉ Thiết kế Web</div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Thi trực tuyến • 60 phút</div>
                </div>
                <button style={{ background: '#EA580C', color: '#FFF', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', fontWeight: 700 }}>
                  Đăng ký thi
                </button>
              </div>
            </div>

            <div style={{ padding: '10px 16px', background: '#FFFFFF', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#EA580C' }}>Vào phòng thi chứng chỉ</span>
              <ArrowRight size={14} color="#EA580C" />
            </div>
          </div>

          {/* ── CARD 7: CHỨNG CHỈ BLOCKCHAIN ── */}
          <div
            onClick={() => onNavigateToModule('verify')}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #CBD5E1',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(11, 37, 69, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer'
            }}
          >
            <div style={{
              background: '#059669',
              color: '#FFFFFF',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>7. Chứng chỉ Blockchain</span>
              <span style={{ fontSize: '11px', opacity: 0.85 }}>Xác thực On-chain</span>
            </div>

            <div style={{ padding: '14px', flex: 1, background: '#ECFDF5', display: 'flex', gap: '10px' }}>
              {/* Mini Cert Paper */}
              <div style={{ flex: 1.2, background: '#FFFBEB', border: '2px solid #D97706', borderRadius: '6px', padding: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '9px', fontWeight: 800, color: '#B45309' }}>TINHOCGENZ CERTIFICATE</div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>Nguyễn Văn A</div>
                <div style={{ fontSize: '8px', color: '#64748B' }}>Lập trình Python xuất sắc</div>
              </div>

              {/* Mini Verification Stats */}
              <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #A7F3D0', borderRadius: '6px', padding: '8px', fontSize: '9px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontWeight: 800, color: '#059669' }}>Xác thực Blockchain</div>
                <div style={{ color: '#059669', fontWeight: 700 }}>✓ Đã xác thực</div>
                <div style={{ color: '#64748B', fontFamily: 'monospace', fontSize: '8px' }}>Hash: 0x4d12...9b7c</div>
                <div style={{ color: '#64748B' }}>Ngày cấp: 15/09/2026</div>
              </div>
            </div>

            <div style={{ padding: '10px 16px', background: '#FFFFFF', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>Tra cứu & Xác thực On-chain</span>
              <ArrowRight size={14} color="#059669" />
            </div>
          </div>

          {/* ── CARD 8: CỘNG ĐỒNG HỌC TẬP ── */}
          <div
            onClick={() => onNavigateToModule('community')}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #CBD5E1',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(11, 37, 69, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer'
            }}
          >
            <div style={{
              background: '#0284C7',
              color: '#FFFFFF',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>8. Cộng đồng học tập</span>
              <span style={{ fontSize: '11px', opacity: 0.85 }}>Diễn đàn & Hỏi đáp</span>
            </div>

            <div style={{ padding: '16px', flex: 1, background: '#F0F9FF', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '4px', fontSize: '10px' }}>
                <span style={{ background: '#0284C7', color: '#FFF', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Tất cả</span>
                <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '2px 6px', borderRadius: '4px' }}>Thảo luận</span>
                <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '2px 6px', borderRadius: '4px' }}>Hỏi đáp</span>
                <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '2px 6px', borderRadius: '4px' }}>Việc làm</span>
              </div>

              {/* Feed posts */}
              <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '8px', border: '1px solid #BAE6FD', fontSize: '11px' }}>
                <div style={{ fontWeight: 700, color: '#0F172A' }}>Minh Anh • 30 phút trước</div>
                <div style={{ fontSize: '10px', color: '#475569', margin: '2px 0' }}>Cho mình hỏi cách tối ưu câu lệnh truy vấn PostgreSQL?</div>
                <div style={{ fontSize: '9.5px', color: '#0284C7' }}>❤️ 24 thích • 💬 8 trả lời</div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '8px', border: '1px solid #BAE6FD', fontSize: '11px' }}>
                <div style={{ fontWeight: 700, color: '#0F172A' }}>Tuấn Dũng • 2 giờ trước</div>
                <div style={{ fontSize: '10px', color: '#475569', margin: '2px 0' }}>Chia sẻ template đồ án React + TypeScript cực mượt!</div>
                <div style={{ fontSize: '9.5px', color: '#0284C7' }}>❤️ 56 thích • 💬 19 trả lời</div>
              </div>
            </div>

            <div style={{ padding: '10px 16px', background: '#FFFFFF', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0284C7' }}>Tham gia diễn đàn cộng đồng</span>
              <ArrowRight size={14} color="#0284C7" />
            </div>
          </div>

          {/* ── CARD 9: TRANG CÁ NHÂN ── */}
          <div
            onClick={() => onNavigateToModule('profile')}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #CBD5E1',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(11, 37, 69, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer'
            }}
          >
            <div style={{
              background: '#475569',
              color: '#FFFFFF',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>9. Trang cá nhân</span>
              <span style={{ fontSize: '11px', opacity: 0.85 }}>Hồ sơ & Bằng cấp</span>
            </div>

            <div style={{ padding: '16px', flex: 1, background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* User Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #0057B8 0%, #38BDF8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 800 }}>
                  P
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>Nguyễn Thị Phương</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Học viên xuất sắc</div>
                </div>
              </div>

              {/* 3 Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center' }}>
                <div style={{ background: '#FFFFFF', padding: '6px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0057B8' }}>12</div>
                  <div style={{ fontSize: '9px', color: '#64748B' }}>Khóa học</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '6px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>5</div>
                  <div style={{ fontSize: '9px', color: '#64748B' }}>Chứng chỉ</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '6px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#EA580C' }}>120</div>
                  <div style={{ fontSize: '9px', color: '#64748B' }}>Giờ học</div>
                </div>
              </div>
            </div>

            <div style={{ padding: '10px 16px', background: '#FFFFFF', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Xem hồ sơ cá nhân</span>
              <ArrowRight size={14} color="#475569" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
