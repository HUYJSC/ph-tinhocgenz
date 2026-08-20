import React from 'react';
import {
  BookOpen, Layers, BarChart2, PlusCircle, BookmarkCheck,
  Smartphone, Shield, FileText, LogOut, Sparkles, ChevronRight
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export type ActiveTab = 'quizzes' | 'assignments' | 'flashcards' | 'analytics' | 'creator' | 'bookmarks' | 'admin';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  bookmarkCount: number;
  unreadNotificationCount?: number;
  onLogout?: () => void;
  onOpenInstallModal: () => void;
  onOpenAuthModal: () => void;
  isAdmin: boolean;
  studentName: string;
}

interface EdTechNavItem {
  id: ActiveTab;
  label: string;
  subtitle: string;
  icon: any;
  accentColor: string;
  bgTint: string;
  count?: number;
  section: 'learn' | 'personal' | 'admin';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  bookmarkCount,
  unreadNotificationCount = 0,
  onLogout,
  onOpenInstallModal,
  onOpenAuthModal,
  isAdmin,
  studentName
}) => {
  const studentNavItems: EdTechNavItem[] = [
    // Section 1: HỌC TẬP & KHẢO THÍ
    {
      id: 'quizzes',
      label: 'Khảo Thí & Luyện Đề',
      subtitle: 'Ngân hàng câu hỏi chuẩn hóa',
      icon: BookOpen,
      accentColor: '#2563eb',
      bgTint: 'rgba(37, 99, 235, 0.12)',
      section: 'learn'
    },
    {
      id: 'assignments',
      label: 'Bài Tập & Đề Thi Mở',
      subtitle: 'Nộp bài & bảo mật khảo thí',
      icon: FileText,
      accentColor: '#10b981',
      bgTint: 'rgba(16, 185, 129, 0.12)',
      section: 'learn'
    },
    {
      id: 'flashcards',
      label: 'Học Phần Thẻ Ghi Nhớ',
      subtitle: 'Hệ thống thuật ngữ & phím tắt',
      icon: Layers,
      accentColor: '#f59e0b',
      bgTint: 'rgba(245, 158, 11, 0.12)',
      section: 'learn'
    },
    // Section 2: CÁ NHÂN & TIẾN ĐỘ HỌC TẬP
    {
      id: 'analytics',
      label: 'Hồ Sơ & Tiến Độ Học Tập',
      subtitle: 'Báo cáo đánh giá năng lực',
      icon: BarChart2,
      accentColor: '#8b5cf6',
      bgTint: 'rgba(139, 92, 246, 0.12)',
      section: 'personal'
    },
    {
      id: 'bookmarks',
      label: 'Câu Hỏi Trọng Tâm Đã Lưu',
      subtitle: 'Ôn tập kiến thức củng cố',
      icon: BookmarkCheck,
      accentColor: '#ec4899',
      bgTint: 'rgba(236, 72, 153, 0.12)',
      count: bookmarkCount,
      section: 'personal'
    }
  ];

  const adminNavItems: EdTechNavItem[] = [
    // Section 3: QUẢN TRỊ & HỘI ĐỒNG KHẢO THÍ
    {
      id: 'admin',
      label: 'Cổng Quản Trị Học Thuật',
      subtitle: 'Phân quyền & giám sát đào tạo',
      icon: Shield,
      accentColor: '#d97706',
      bgTint: 'rgba(217, 119, 6, 0.15)',
      section: 'admin'
    },
    {
      id: 'assignments',
      label: 'Quản Lý Khảo Thí & Chấm Điểm',
      subtitle: 'Đánh giá & công bố kết quả',
      icon: FileText,
      accentColor: '#10b981',
      bgTint: 'rgba(16, 185, 129, 0.12)',
      count: unreadNotificationCount,
      section: 'admin'
    },
    {
      id: 'quizzes',
      label: 'Ngân Hàng Khảo Thí',
      subtitle: '10 Chương trình đào tạo chuẩn',
      icon: BookOpen,
      accentColor: '#2563eb',
      bgTint: 'rgba(37, 99, 235, 0.12)',
      section: 'admin'
    },
    {
      id: 'creator',
      label: 'Xây Dựng Đề Thi Mới',
      subtitle: 'Soạn thảo & ma trận đề thi',
      icon: PlusCircle,
      accentColor: '#06b6d4',
      bgTint: 'rgba(6, 182, 212, 0.12)',
      section: 'admin'
    },
    {
      id: 'flashcards',
      label: 'Hệ Thống Thẻ Kiến Thức',
      subtitle: 'Học phần thuật ngữ chuyên ngành',
      icon: Layers,
      accentColor: '#f59e0b',
      bgTint: 'rgba(245, 158, 11, 0.12)',
      section: 'admin'
    }
  ];

  const currentNavItems = isAdmin ? adminNavItems : studentNavItems;

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    soundFx.playClick();
  };

  return (
    <aside
      className="sidebar"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--border-color)',
        userSelect: 'none'
      }}
    >
      {/* 1. BRAND HEADER */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
              border: '1.5px solid rgba(37, 99, 235, 0.18)',
              flexShrink: 0
            }}
          >
            <img
              src="/logo.png"
              alt="PH Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 900, fontSize: '0.96rem', color: 'var(--text-primary)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>PH - TINHOCGENZ</span>
              <Sparkles size={13} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
              Học Trực Tuyến Chuyên Nghiệp
            </div>
          </div>
        </div>
      </div>

      {/* 2. USER PROFILE BADGE CARD & ACTION BUTTONS */}
      <div style={{ padding: '10px 12px 6px' }}>
        <div
          style={{
            padding: '12px',
            borderRadius: '14px',
            background: isAdmin
              ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(245, 158, 11, 0.04) 100%)'
              : 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(16, 185, 129, 0.04) 100%)',
            border: isAdmin ? '1.5px solid rgba(217, 119, 6, 0.25)' : '1.5px solid rgba(37, 99, 235, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
          }}
        >
          {/* User Info Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: isAdmin
                  ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                  : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.95rem',
                flexShrink: 0,
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)'
              }}
            >
              {isAdmin ? <Shield size={19} /> : (studentName ? studentName.charAt(0).toUpperCase() : 'H')}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {studentName}
              </div>
              <div style={{ fontSize: '0.72rem', color: isAdmin ? '#d97706' : '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isAdmin ? '#d97706' : '#10b981', display: 'inline-block' }}></span>
                <span>{isAdmin ? 'Giảng Viên / Admin' : 'Học Viên Đang Học'}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons on Profile Card */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenAuthModal();
              }}
              style={{
                padding: '6px 8px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.15s ease'
              }}
              title="Đổi tài khoản hoặc phân hệ môn học"
            >
              <Sparkles size={12} color="var(--accent-primary)" />
              <span>Đổi Môn</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onLogout();
                }}
                style={{
                  padding: '6px 8px',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: '#ef4444',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
                title="Đăng xuất khỏi phiên học"
              >
                <LogOut size={12} />
                <span>Đăng Xuất</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. EDTECH NAVIGATION BUTTONS LIST */}
      <nav
        style={{
          padding: '8px 10px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          overflowY: 'auto'
        }}
      >
        {/* Section 1 Header */}
        <div style={{ padding: '6px 10px 2px', fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {isAdmin ? 'Quản Trị & Khảo Thí' : 'Học Tập & Luyện Đề'}
        </div>

        {currentNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id as ActiveTab)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '9px 12px',
                borderRadius: '13px',
                background: isActive ? item.bgTint : 'transparent',
                border: isActive ? `1.5px solid ${item.accentColor}40` : '1.5px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? `0 4px 12px ${item.accentColor}15` : 'none'
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              {/* Left Active Glow Indicator */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '20%',
                    bottom: '20%',
                    width: '3.5px',
                    borderRadius: '0 4px 4px 0',
                    background: item.accentColor,
                    boxShadow: `0 0 8px ${item.accentColor}`
                  }}
                />
              )}

              {/* Icon Container & Text Labels */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: isActive ? item.accentColor : item.bgTint,
                    color: isActive ? '#ffffff' : item.accentColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? `0 3px 8px ${item.accentColor}40` : 'none'
                  }}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 800 : 700,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      lineHeight: 1.2
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      color: isActive ? item.accentColor : 'var(--text-muted)',
                      fontWeight: 600,
                      marginTop: '2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {item.subtitle}
                  </div>
                </div>
              </div>

              {/* Right Counter Badge or Subtle Indicator */}
              {item.count !== undefined && item.count > 0 ? (
                <span
                  style={{
                    fontSize: '0.72rem',
                    background: item.id === 'assignments' && unreadNotificationCount > 0 ? '#ef4444' : item.accentColor,
                    color: '#ffffff',
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 800,
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  {item.count}
                </span>
              ) : isActive ? (
                <ChevronRight size={14} color={item.accentColor} style={{ opacity: 0.8 }} />
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* 4. FOOTER CONTROLS: PWA INSTALL & LOGOUT */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={onOpenInstallModal}
          className="btn btn-secondary"
          style={{ width: '100%', padding: '8px 12px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '10px' }}
        >
          <Smartphone size={14} color="var(--accent-primary)" />
          <span>Cài Đặt App Di Động</span>
        </button>

        {onLogout && (
          <button
            onClick={() => {
              soundFx.playClick();
              onLogout();
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              background: 'rgba(239, 68, 68, 0.06)',
              color: '#ef4444',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)')}
          >
            <LogOut size={14} />
            <span>Đăng Xuất / Đổi Môn</span>
          </button>
        )}
      </div>
    </aside>
  );
};
