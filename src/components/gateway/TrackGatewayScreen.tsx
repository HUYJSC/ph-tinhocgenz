import React from 'react';
import { CurriculumTrack } from '../../types/auth';
import {
  Cpu, FileSpreadsheet, FileText, Presentation, Code2,
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
    id: 'office-fast-3in1',
    title: '1. Word, Excel, PowerPoint (3Buổi 1 môn)',
    subTitle: 'Cấp Tốc Chuẩn Công Sở 3in1',
    badge: 'Cấp Tốc Hot',
    badgeColor: '#2563eb',
    accentColor: '#2563eb',
    icon: FileSpreadsheet,
    features: [
      'Word: Căn lề hành chính, phím tắt & in ấn văn bản',
      'Excel: Hàm tính toán tổng hợp & thống kê cơ bản',
      'PowerPoint: Thiết kế slide thuyết trình nhanh gọn'
    ]
  },
  {
    id: 'cc-cntt-basic',
    title: '2. CC CNTT Cơ bản (6 buổi)',
    subTitle: 'Chứng Chỉ Tin Học Chuẩn Bộ GD&ĐT',
    badge: 'Chuẩn Quốc Gia',
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
    id: 'cc-cntt-advanced',
    title: '3. CC CNTT Nâng cao (6 buổi)',
    subTitle: 'Chứng Chỉ Ứng Dụng CNTT Nâng Cao',
    badge: 'Chuyên Sâu',
    badgeColor: '#8b5cf6',
    accentColor: '#8b5cf6',
    icon: Presentation,
    features: [
      'Hàm tra cứu nhiều điều kiện: INDEX, MATCH, XLOOKUP',
      'Xử lý bảng dữ liệu lớn & PivotTable nâng cao',
      'Trộn thư tự động Mail Merge chuyên nghiệp'
    ]
  },
  {
    id: 'cntt-basic-we',
    title: '4. CNTT Cơ bản: Word + Excel (10-12b)',
    subTitle: 'Khóa Nền Tảng Thực Hành Bài Bản',
    badge: 'Bài Bản Thực Chiến',
    badgeColor: '#06b6d4',
    accentColor: '#06b6d4',
    icon: FileText,
    features: [
      'Soạn thảo văn bản theo Nghị định 30 chuẩn',
      'Kỹ năng bảng biểu & định dạng nâng cao Word',
      'Công thức tính toán bảng lương & tài chính Excel'
    ]
  },
  {
    id: 'cntt-adv-we',
    title: '5. CNTT Nâng Cao: Word + Excel (10-12b)',
    subTitle: 'Chuyên Sâu Văn Phòng Cao Cấp',
    badge: 'Nâng Cao Toàn Diện',
    badgeColor: '#ec4899',
    accentColor: '#ec4899',
    icon: Presentation,
    features: [
      'Tự động hóa Word: Style, Section Break & Mục lục',
      'Phân tích dữ liệu đa chiều PivotTable & Dashboard',
      'Bảo vệ dữ liệu, kiểm soát ô nhập & bảo mật file'
    ]
  },
  {
    id: 'ai-office',
    title: '6. Ứng dụng AI vào công việc Văn phòng (5b)',
    subTitle: 'Tối Ưu Hiệu Suất Với AI Thế Hệ Mới',
    badge: 'Xu Hướng Đột Phá',
    badgeColor: '#f59e0b',
    accentColor: '#f59e0b',
    icon: Code2,
    features: [
      'Làm chủ Prompt Engineering cho ChatGPT, Claude',
      'Tự động tóm tắt tài liệu & viết báo cáo với AI',
      'Tạo slide thuyết trình tự động qua Gamma & Copilot'
    ]
  },
  {
    id: 'excel-accounting',
    title: '7. Excel cho Kế toán (Custom tuỳ nhu cầu)',
    subTitle: 'Chuyên Đề Kế Toán Doanh Nghiệp',
    badge: 'Kế Toán & Thuế',
    badgeColor: '#d97706',
    accentColor: '#d97706',
    icon: FileSpreadsheet,
    features: [
      'Sổ nhật ký chung & Bảng cân đối phát sinh',
      'Hàm SUMIFS, IFERROR & Báo cáo công nợ',
      'Tự động hóa trích khấu hao TSCĐ & Tiền lương'
    ]
  },
  {
    id: 'word-6b',
    title: '8. Word (6 buổi)',
    subTitle: 'Soạn Thảo & Trình Bày Chuẩn Quốc Gia',
    badge: 'Kỹ Năng Word',
    badgeColor: '#2563eb',
    accentColor: '#2563eb',
    icon: FileText,
    features: [
      'Căn lề, thước kẻ Ruler & Tab Stop có Leader',
      'Header, Footer, đánh số trang theo phân vùng',
      'Thiết kế Table hợp đồng & xuất bản file in ấn'
    ]
  },
  {
    id: 'excel-6b',
    title: '9. Excel (6 buổi)',
    subTitle: 'Làm Chủ Bảng Tính & 20 Hàm Phổ Biến',
    badge: 'Kỹ Năng Excel',
    badgeColor: '#10b981',
    accentColor: '#10b981',
    icon: FileSpreadsheet,
    features: [
      '20 hàm thông dụng: IF, VLOOKUP, HLOOKUP, COUNTIF',
      'Lọc nâng cao Advanced Filter & Sắp xếp dữ liệu',
      'Trực quan hóa số liệu với biểu đồ Chart'
    ]
  },
  {
    id: 'ppt-6b',
    title: '10. PPT (6 buổi)',
    subTitle: 'Thiết Kế Slide Thuyết Trình Thu Hút',
    badge: 'Thuyết Trình Đỉnh Cao',
    badgeColor: '#f97316',
    accentColor: '#f97316',
    icon: Presentation,
    features: [
      'Slide Master thiết kế template đồng bộ',
      'Hiệu ứng Morph & Motion Animation chuyên nghiệp',
      'Chèn âm thanh, video & xuất file MP4'
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
