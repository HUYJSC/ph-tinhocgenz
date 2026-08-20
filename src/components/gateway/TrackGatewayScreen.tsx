import React from 'react';
import { CurriculumTrack } from '../../types/auth';
import {
  Cpu, FileSpreadsheet, FileText, Presentation, Code2, Network,
  Shield, ArrowRight, Sparkles, CheckCircle2
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface TrackGatewayScreenProps {
  onSelectTrack: (track: CurriculumTrack) => void;
  onOpenAdminLogin: () => void;
}

interface TrackCardInfo {
  id: CurriculumTrack;
  title: string;
  subTitle: string;
  badge: string;
  badgeColor: string;
  accentColor: string;
  icon: any;
  features: string[];
}

const TRACK_CARDS: TrackCardInfo[] = [
  {
    id: 'cntt-basic',
    title: '1. CNTT & Tin Học Cơ Bản',
    subTitle: 'Chuẩn Kỹ Năng CNTT Căn Bản',
    badge: 'Khởi Đầu Vững Chắc',
    badgeColor: '#10b981',
    accentColor: '#10b981',
    icon: Cpu,
    features: [
      'Phần cứng & Thiết bị ngoại vi máy tính',
      'Hệ điều hành Windows & Quản lý File Explorer',
      'Khai thác Internet & Email công vụ an toàn'
    ]
  },
  {
    id: 'mos-office',
    title: '2. Tin Học Văn Phòng Quốc Tế MOS',
    subTitle: 'Microsoft Office Specialist (Word, Excel, PowerPoint)',
    badge: 'Chứng Chỉ Quốc Tế Hot',
    badgeColor: '#2563eb',
    accentColor: '#2563eb',
    icon: FileSpreadsheet,
    features: [
      'MOS Word: Định dạng văn bản hành chính & Mail Merge',
      'MOS Excel: Công thức hàm tra cứu, PivotTable & Biểu đồ',
      'MOS PowerPoint: Thiết kế slide chuyên nghiệp & Morph'
    ]
  },
  {
    id: 'ic3-gs',
    title: '3. Chuẩn Tin Học Quốc Tế IC3 GS6',
    subTitle: 'IC3 Global Standard 6 (Level 1, 2, 3)',
    badge: 'Toàn Cầu Công Nhận',
    badgeColor: '#3b82f6',
    accentColor: '#3b82f6',
    icon: FileText,
    features: [
      'Computing Fundamentals: Điện toán máy tính',
      'Key Applications: Ứng dụng công nghệ then chốt',
      'Living Online: Không gian mạng & Bản quyền số'
    ]
  },
  {
    id: 'cntt-advanced',
    title: '4. CNTT Nâng Cao & Xử Lý Dữ Liệu',
    subTitle: 'Data Analysis, Dynamic Arrays & Tự Động Hóa',
    badge: 'Chuyên Sâu & Nâng Cao',
    badgeColor: '#ea580c',
    accentColor: '#ea580c',
    icon: Presentation,
    features: [
      'Hàm lồng phức hợp: INDEX-MATCH, XLOOKUP, SUMIFS',
      'Xử lý mảng động Dynamic Arrays (FILTER, UNIQUE, SORT)',
      'Tổng hợp dữ liệu đa chiều & Tự động hóa Macro'
    ]
  },
  {
    id: 'programming',
    title: '5. Lập Trình Python & Thuật Toán',
    subTitle: 'Coding Foundation & Giải Thuật Tin Học Trẻ',
    badge: 'Tư Duy Lập Trình',
    badgeColor: '#f59e0b',
    accentColor: '#f59e0b',
    icon: Code2,
    features: [
      'Cú pháp Python 3 & Cấu trúc dữ liệu nâng cao',
      'Thuật toán tìm kiếm, sắp xếp & Đệ quy',
      'Luyện giải đề thi học sinh giỏi & Olympic Tin học'
    ]
  },
  {
    id: 'cyber-security',
    title: '6. Mạng Máy Tính & An Toàn Thông Tin',
    subTitle: 'Computer Networks & Cybersecurity Fundamentals',
    badge: 'Bảo Mật & Hạ Tầng',
    badgeColor: '#6366f1',
    accentColor: '#6366f1',
    icon: Network,
    features: [
      'Hạ tầng mạng: Mô hình OSI/TCP-IP, IPv4/IPv6, DNS',
      'Giao thức bảo mật: SSL/TLS, HTTPS, Tường lửa (Firewall)',
      'Phòng chống tấn công mạng (Phishing, Malware, DDoS)'
    ]
  }
];

export const TrackGatewayScreen: React.FC<TrackGatewayScreenProps> = ({
  onSelectTrack,
  onOpenAdminLogin
}) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 10%, rgba(37, 99, 235, 0.08) 0%, var(--bg-primary) 70%)',
        padding: '32px 16px 60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
      className="animate-fade-in"
    >
      {/* Top Navbar */}
      <div
        style={{
          maxWidth: '1160px',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)'
            }}
          >
            <img src="/logo.png" alt="PH Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              PH- TINHOCGENZ
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              PH DIGITAL EDUCATION • HỆ THỐNG KHẢO THÍ & ĐÀO TẠO
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            onOpenAdminLogin();
          }}
          className="btn btn-secondary"
          style={{
            padding: '8px 16px',
            fontSize: '0.82rem',
            fontWeight: 700,
            borderColor: 'rgba(217, 119, 6, 0.3)',
            color: '#d97706',
            background: 'rgba(217, 119, 6, 0.08)'
          }}
        >
          <Shield size={16} />
          <span>Cổng Giảng Viên / Quản Trị</span>
        </button>
      </div>

      {/* Hero Title */}
      <div style={{ textAlign: 'center', maxWidth: '840px', marginBottom: '36px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(37, 99, 235, 0.1)',
            color: 'var(--accent-primary)',
            fontSize: '0.82rem',
            fontWeight: 800,
            marginBottom: '12px'
          }}
        >
          <Sparkles size={14} />
          <span>BƯỚC 1: CHỌN CHƯƠNG TRÌNH ĐÀO TẠO CỦA BẠN</span>
        </div>

        <h1
          style={{
            fontSize: '2.1rem',
            fontWeight: 900,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            marginBottom: '10px',
            lineHeight: 1.25
          }}
        >
          Bạn Đang Theo Học Phân Hệ Tin Học Nào?
        </h1>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Vui lòng chọn đúng phân hệ chương trình bạn đang học để hệ thống mở khóa chính xác tài liệu,
          đề thi trắc nghiệm và bài tập thực hành dành riêng cho bạn.
        </p>
      </div>

      {/* 6 Grid Track Cards */}
      <div
        style={{
          maxWidth: '1160px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px'
        }}
      >
        {TRACK_CARDS.map(track => {
          const Icon = track.icon;
          return (
            <div
              key={track.id}
              onClick={() => {
                soundFx.playCorrect();
                onSelectTrack(track.id);
              }}
              className="card card-interactive"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: `4px solid ${track.accentColor}`,
                cursor: 'pointer',
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.22s ease'
              }}
            >
              <div>
                {/* Badge & Icon */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: `rgba(37, 99, 235, 0.08)`,
                      color: track.accentColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={24} />
                  </div>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: track.badgeColor,
                      background: `rgba(37, 99, 235, 0.08)`,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      border: `1px solid ${track.badgeColor}33`
                    }}
                  >
                    {track.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {track.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: track.accentColor, fontWeight: 700, marginBottom: '14px' }}>
                  {track.subTitle}
                </p>

                {/* Key Features list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {track.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      <CheckCircle2 size={14} color={track.accentColor} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '11px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: `linear-gradient(135deg, ${track.accentColor} 0%, ${track.accentColor}dd 100%)`,
                  border: 'none',
                  boxShadow: `0 4px 12px ${track.accentColor}33`
                }}
              >
                <span>Vào Học Phân Hệ Này</span>
                <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Support Info */}
      <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        Học viên có thể tự do chuyển đổi phân hệ bất cứ lúc nào qua nút <b>"🔄 Đổi Phân Hệ"</b> ở thanh điều hướng trên cùng.
      </div>
    </div>
  );
};
