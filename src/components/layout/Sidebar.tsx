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
    {
      id: 'quizzes',
      label: 'Luyện Đề & Khảo Thí',
      subtitle: 'Ngân hàng câu hỏi chuẩn hóa',
      icon: BookOpen,
      accentColor: '#2563eb',
      bgTint: 'rgba(37, 99, 235, 0.12)',
      section: 'learn'
    },
    {
      id: 'assignments',
      label: 'Đề Thi & Nộp Bài',
      subtitle: 'Kiểm tra mở — bảo mật khảo thí',
      icon: FileText,
      accentColor: '#10b981',
      bgTint: 'rgba(16, 185, 129, 0.12)',
      section: 'learn'
    },
    {
      id: 'flashcards',
      label: 'Thẻ Ghi Nhớ',
      subtitle: 'Thuật ngữ & phím tắt chuyên ngành',
      icon: Layers,
      accentColor: '#f59e0b',
      bgTint: 'rgba(245, 158, 11, 0.12)',
      section: 'learn'
    },
    {
      id: 'analytics',
      label: 'Tiến Độ Học Tập',
      subtitle: 'Báo cáo năng lực & điểm số',
      icon: BarChart2,
      accentColor: '#8b5cf6',
      bgTint: 'rgba(139, 92, 246, 0.12)',
      section: 'personal'
    },
    {
      id: 'bookmarks',
      label: 'Câu Hỏi Đã Lưu',
      subtitle: 'Ôn lại kiến thức trọng tâm',
      icon: BookmarkCheck,
      accentColor: '#ec4899',
      bgTint: 'rgba(236, 72, 153, 0.12)',
      count: bookmarkCount,
      section: 'personal'
    }
  ];

  const adminNavItems: EdTechNavItem[] = [
    {
      id: 'admin',
      label: 'Tổng Quan Hệ Thống',
      subtitle: 'Phân quyền & giám sát đào tạo',
      icon: Shield,
      accentColor: '#d97706',
      bgTint: 'rgba(217, 119, 6, 0.15)',
      section: 'admin'
    },
    {
      id: 'assignments',
      label: 'Khảo Thí & Chấm Điểm',
      subtitle: 'Giao đề, chấm & công bố kết quả',
      icon: FileText,
      accentColor: '#10b981',
      bgTint: 'rgba(16, 185, 129, 0.12)',
      count: unreadNotificationCount,
      section: 'admin'
    },
    {
      id: 'quizzes',
      label: 'Ngân Hàng Đề Thi',
      subtitle: '10 chương trình đào tạo chuẩn',
      icon: BookOpen,
      accentColor: '#2563eb',
      bgTint: 'rgba(37, 99, 235, 0.12)',
      section: 'admin'
    },
    {
      id: 'creator',
      label: 'Soạn Đề Thi',
      subtitle: 'Tạo đề trắc nghiệm & tự luận',
      icon: PlusCircle,
      accentColor: '#06b6d4',
      bgTint: 'rgba(6, 182, 212, 0.12)',
      section: 'admin'
    },
    {
      id: 'flashcards',
      label: 'Thẻ Kiến Thức',
      subtitle: 'Học phần thuật ngữ chuyên ngành',
      icon: Layers,
      accentColor: '#f59e0b',
      bgTint: 'rgba(245, 158, 11, 0.12)',
      section: 'admin'
    }
  ];

  const currentNavItems = isAdmin ? adminNavItems : studentNavItems;
  const accentMain = isAdmin ? '#d97706' : '#2563eb';

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
      {/* ── 1. BRAND: Logo lớn căn giữa + tên thương hiệu ───────────── */}
      <div style={{
        padding: '20px 16px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '20px',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.11), 0 0 0 1.5px rgba(37,99,235,0.13)',
          flexShrink: 0,
        }}>
          <img
            src="/logo.png"
            alt="PH TinHocGenz"
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '13px' }}
          />
        </div>

        <div style={{ textAlign: 'center', lineHeight: 1.35 }}>
          <div style={{
            fontWeight: 900,
            fontSize: '0.9rem',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}>
            <span>PH TinHocGenz</span>
            <Sparkles size={12} color="#f59e0b" />
          </div>
          <div style={{
            fontSize: '0.66rem',
            color: accentMain,
            fontWeight: 700,
            marginTop: '3px',
            letterSpacing: '0.02em',
          }}>
            {isAdmin ? 'Cổng Giảng Viên & Quản Trị' : 'Nền Tảng Học Trực Tuyến'}
          </div>
        </div>
      </div>

      {/* ── 2. USER PROFILE — compact 1 hàng, không duplicate action ─── */}
      <div style={{ padding: '10px 12px 4px' }}>
        <div style={{
          padding: '9px 11px',
          borderRadius: '12px',
          background: isAdmin ? 'rgba(217,119,6,0.07)' : 'rgba(37,99,235,0.07)',
          border: `1px solid ${isAdmin ? 'rgba(217,119,6,0.2)' : 'rgba(37,99,235,0.14)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
        }}>
          {/* Avatar */}
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '9px',
            background: isAdmin
              ? 'linear-gradient(135deg,#d97706,#b45309)'
              : 'linear-gradient(135deg,#2563eb,#1d4ed8)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.88rem',
            flexShrink: 0,
            boxShadow: `0 2px 8px ${accentMain}28`,
          }}>
            {isAdmin ? <Shield size={16} /> : (studentName ? studentName.charAt(0).toUpperCase() : 'H')}
          </div>

          {/* Tên + vai trò */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {studentName}
            </div>
            <div style={{
              fontSize: '0.66rem',
              color: isAdmin ? '#d97706' : '#10b981',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              marginTop: '1px',
            }}>
              <span style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: isAdmin ? '#d97706' : '#10b981',
                display: 'inline-block', flexShrink: 0,
              }} />
              {isAdmin ? 'Giảng Viên' : 'Học Viên'}
            </div>
          </div>

          {/* Đổi môn — icon only, tooltip, không lặp chữ */}
          <button
            type="button"
            title="Đổi môn học / tài khoản"
            onClick={() => { soundFx.playClick(); onOpenAuthModal(); }}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = accentMain;
              e.currentTarget.style.borderColor = accentMain + '50';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <Sparkles size={13} />
          </button>
        </div>
      </div>

      {/* ── 3. NAVIGATION ────────────────────────────────────────────── */}
      <nav style={{
        padding: '8px 10px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        overflowY: 'auto',
      }}>
        <div style={{
          padding: '6px 10px 5px',
          fontSize: '0.62rem',
          fontWeight: 800,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}>
          {isAdmin ? 'Quản Trị & Giảng Dạy' : 'Học Tập & Ôn Luyện'}
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
                padding: '8px 10px',
                borderRadius: '11px',
                background: isActive ? item.bgTint : 'transparent',
                border: isActive ? `1.5px solid ${item.accentColor}35` : '1.5px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: isActive ? `0 2px 10px ${item.accentColor}12` : 'none',
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.background = 'var(--bg-secondary)';
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0, top: '22%', bottom: '22%',
                  width: '3px',
                  borderRadius: '0 3px 3px 0',
                  background: item.accentColor,
                  boxShadow: `0 0 6px ${item.accentColor}`,
                }} />
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9px',
                  background: isActive ? item.accentColor : item.bgTint,
                  color: isActive ? '#fff' : item.accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.18s ease',
                  boxShadow: isActive ? `0 2px 8px ${item.accentColor}35` : 'none',
                }}>
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.82rem',
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    lineHeight: 1.25,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: '0.66rem',
                    color: isActive ? item.accentColor : 'var(--text-muted)',
                    fontWeight: 500,
                    marginTop: '1px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {item.subtitle}
                  </div>
                </div>
              </div>

              {item.count !== undefined && item.count > 0 ? (
                <span style={{
                  fontSize: '0.64rem',
                  background: item.id === 'assignments' && unreadNotificationCount > 0 ? '#ef4444' : item.accentColor,
                  color: '#fff',
                  padding: '1px 6px',
                  borderRadius: '99px',
                  fontWeight: 800,
                  flexShrink: 0,
                }}>
                  {item.count}
                </span>
              ) : isActive ? (
                <ChevronRight size={13} color={item.accentColor} style={{ opacity: 0.7, flexShrink: 0 }} />
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* ── 4. FOOTER — 1 nút install + 1 nút đăng xuất, không lặp ──── */}
      <div style={{
        padding: '10px 12px 14px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}>
        <button
          onClick={onOpenInstallModal}
          className="btn btn-secondary"
          style={{
            width: '100%',
            padding: '7px 12px',
            fontSize: '0.74rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            borderRadius: '9px',
          }}
        >
          <Smartphone size={13} color="var(--accent-primary)" />
          <span>Cài App Di Động</span>
        </button>

        {onLogout && (
          <button
            onClick={() => { soundFx.playClick(); onLogout(); }}
            style={{
              width: '100%',
              padding: '7px 12px',
              borderRadius: '9px',
              border: '1px solid rgba(239,68,68,0.22)',
              background: 'rgba(239,68,68,0.05)',
              color: '#ef4444',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.05)')}
          >
            <LogOut size={13} />
            <span>Đăng Xuất</span>
          </button>
        )}
      </div>
    </aside>
  );
};
