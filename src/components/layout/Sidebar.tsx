import React from 'react';
import { BookOpen, Layers, BarChart2, PlusCircle, BookmarkCheck, Smartphone, Shield, FileText, LogOut } from 'lucide-react';
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

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: any;
  count?: number;
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
  const studentNavItems: NavItem[] = [
    { id: 'quizzes', label: 'Kho Trắc Nghiệm', icon: BookOpen },
    { id: 'assignments', label: 'Đề Thi & Nộp Bài Tập', icon: FileText },
    { id: 'flashcards', label: 'Thẻ Ghi Nhớ Kiến Thức', icon: Layers },
    { id: 'analytics', label: 'Bảng Điểm & Tiến Độ', icon: BarChart2 },
    { id: 'bookmarks', label: 'Câu Hỏi Đã Lưu', icon: BookmarkCheck, count: bookmarkCount }
  ];

  const adminNavItems: NavItem[] = [
    { id: 'admin', label: 'Cổng Quản Trị Giảng Viên', icon: Shield },
    { id: 'assignments', label: 'Quản Lý Đề Thi & Chấm Bài', icon: FileText, count: unreadNotificationCount },
    { id: 'quizzes', label: 'Xem Đề Thi Học Viên', icon: BookOpen },
    { id: 'creator', label: 'Soạn Đề Thi Mới', icon: PlusCircle },
    { id: 'flashcards', label: 'Thẻ Ghi Nhớ Flashcards', icon: Layers }
  ];

  const currentNavItems: NavItem[] = isAdmin ? adminNavItems : studentNavItems;

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    soundFx.playClick();
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
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
            <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              PH - TINHOCGENZ
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
              Học Trực Tuyến Chuyên Nghiệp
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Student / Teacher Profile Card */}
      <div style={{ padding: '12px 14px' }}>
        <div
          onClick={onOpenAuthModal}
          style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: isAdmin
              ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.09) 0%, rgba(245, 158, 11, 0.04) 100%)'
              : 'linear-gradient(135deg, rgba(37, 99, 235, 0.09) 0%, rgba(16, 185, 129, 0.05) 100%)',
            border: isAdmin ? '1px solid rgba(217, 119, 6, 0.25)' : '1px solid rgba(37, 99, 235, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
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
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
          >
            {isAdmin ? <Shield size={18} /> : (studentName ? studentName.charAt(0).toUpperCase() : 'H')}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {studentName}
            </div>
            <div style={{ fontSize: '0.72rem', color: isAdmin ? '#d97706' : '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isAdmin ? '#d97706' : '#10b981', display: 'inline-block' }}></span>
              <span>{isAdmin ? 'Giảng Viên Quản Trị' : 'Học Viên Chính Thức'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '0 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {currentNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id as ActiveTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? (item.id === 'admin' ? 'rgba(217, 119, 6, 0.12)' : 'rgba(37, 99, 235, 0.09)') : 'transparent',
                border: isActive ? (item.id === 'admin' ? '1px solid #d97706' : '1px solid rgba(37, 99, 235, 0.25)') : '1px solid transparent',
                color: isActive ? (item.id === 'admin' ? '#d97706' : 'var(--accent-primary)') : 'var(--text-secondary)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.86rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={17} color={isActive ? (item.id === 'admin' ? '#d97706' : 'var(--accent-primary)') : 'currentColor'} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    background: item.id === 'assignments' && unreadNotificationCount > 0 ? '#ef4444' : 'var(--accent-primary)',
                    color: '#ffffff',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 800
                  }}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Controls: PWA Install & Logout */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={onOpenInstallModal}
          className="btn btn-secondary"
          style={{ width: '100%', padding: '8px 12px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <Smartphone size={14} />
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
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              background: 'rgba(239, 68, 68, 0.06)',
              color: '#ef4444',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={14} />
            <span>Đăng Xuất / Đổi Môn</span>
          </button>
        )}
      </div>
    </aside>
  );
};
