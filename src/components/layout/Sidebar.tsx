import React from 'react';
import { BookOpen, Layers, BarChart2, PlusCircle, BookmarkCheck, Smartphone, Shield, User, FileText, RefreshCw } from 'lucide-react';
import { soundFx } from '../../utils/audio';

export type ActiveTab = 'quizzes' | 'assignments' | 'flashcards' | 'analytics' | 'creator' | 'bookmarks' | 'admin';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  bookmarkCount: number;
  unreadNotificationCount?: number;
  onChangeTrack?: () => void;
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
  onChangeTrack,
  onOpenInstallModal,
  onOpenAuthModal,
  isAdmin,
  studentName
}) => {
  const studentNavItems: NavItem[] = [
    { id: 'quizzes', label: 'Kho Trắc Nghiệm (6 Phân Hệ)', icon: BookOpen },
    { id: 'assignments', label: 'Đề Thi & Bài Tập Lớp Học', icon: FileText },
    { id: 'flashcards', label: 'Thẻ Ghi Nhớ Kiến Thức', icon: Layers },
    { id: 'analytics', label: 'Tiến Độ & Điểm Số', icon: BarChart2 },
    { id: 'bookmarks', label: 'Câu Hỏi Đã Lưu', icon: BookmarkCheck, count: bookmarkCount }
  ];

  const adminNavItems: NavItem[] = [
    { id: 'admin', label: 'Cổng Quản Trị Giảng Viên', icon: Shield },
    { id: 'assignments', label: 'Giao Đề & Quản Lý Nộp Bài', icon: FileText, count: unreadNotificationCount },
    { id: 'quizzes', label: 'Xem Đề Thi Học Sinh', icon: BookOpen },
    { id: 'creator', label: 'Tạo Đề Thi Mới', icon: PlusCircle },
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
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              flexShrink: 0
            }}
          >
            <img
              src="/logo.png"
              alt="PH Digital Education Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }}
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              PH- TINHOCGENZ
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 600, letterSpacing: '0.02em' }}>
              Học Trực Tuyến • MOS / IC3
            </div>
          </div>
        </div>
      </div>

      {/* Account Info Pill */}
      <div style={{ padding: '12px 14px 4px' }}>
        <div
          onClick={onOpenAuthModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            background: isAdmin ? 'rgba(217, 119, 6, 0.1)' : 'rgba(37, 99, 235, 0.08)',
            border: isAdmin ? '1px solid rgba(217, 119, 6, 0.25)' : '1px solid rgba(37, 99, 235, 0.2)',
            cursor: 'pointer'
          }}
          title="Bấm để đổi tài khoản Học Viên / Giảng Viên"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            {isAdmin ? (
              <Shield size={16} color="#d97706" />
            ) : (
              <User size={16} color="var(--accent-primary)" />
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {studentName}
              </div>
              <div style={{ fontSize: '0.68rem', color: isAdmin ? '#d97706' : 'var(--text-secondary)' }}>
                {isAdmin ? 'Quản Trị Viên 🔑' : 'Tài Khoản Học Viên'}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 700 }}>Đổi</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                padding: '11px 14px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? (item.id === 'admin' ? 'rgba(217, 119, 6, 0.12)' : 'rgba(37, 99, 235, 0.08)') : 'transparent',
                border: isActive ? (item.id === 'admin' ? '1px solid #d97706' : '1px solid rgba(37, 99, 235, 0.25)') : '1px solid transparent',
                color: isActive ? (item.id === 'admin' ? '#d97706' : 'var(--accent-primary)') : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} color={isActive ? (item.id === 'admin' ? '#d97706' : 'var(--accent-primary)') : 'currentColor'} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    background: item.id === 'assignments' && isAdmin ? '#ef4444' : 'var(--accent-primary)',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700
                  }}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom PWA info & Switch Track */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {onChangeTrack && (
          <button
            onClick={() => {
              soundFx.playClick();
              onChangeTrack();
            }}
            style={{
              width: '100%',
              padding: '9px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--accent-primary)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={14} />
            <span>Đổi Phân Hệ Đào Tạo</span>
          </button>
        )}

        <button
          onClick={onOpenInstallModal}
          style={{
            width: '100%',
            padding: '9px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(37, 99, 235, 0.05)',
            border: '1px dashed rgba(37, 99, 235, 0.25)',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Smartphone size={15} color="var(--accent-primary)" />
          <span>Cài app trên Điện thoại</span>
        </button>
      </div>
    </aside>
  );
};
