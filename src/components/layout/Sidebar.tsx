import React from 'react';
import {
  BookOpen, Layers, BarChart2, PlusCircle, BookmarkCheck,
  Smartphone, Shield, FileText, LogOut, ChevronRight
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

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: any;
  color: string;
  bg: string;
  count?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab, setActiveTab, bookmarkCount, unreadNotificationCount = 0,
  onLogout, onOpenInstallModal, onOpenAuthModal, isAdmin, studentName
}) => {
  const studentNav: NavItem[] = [
    { id: 'quizzes',     label: 'Luyện Đề & Khảo Thí', icon: BookOpen,      color: '#4f6ef7', bg: 'rgba(79,110,247,0.1)' },
    { id: 'assignments', label: 'Đề Thi & Nộp Bài',    icon: FileText,      color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { id: 'flashcards',  label: 'Thẻ Ghi Nhớ',          icon: Layers,        color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { id: 'analytics',   label: 'Tiến Độ Học Tập',      icon: BarChart2,     color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { id: 'bookmarks',   label: 'Câu Hỏi Đã Lưu',       icon: BookmarkCheck, color: '#ec4899', bg: 'rgba(236,72,153,0.1)', count: bookmarkCount }
  ];

  const adminNav: NavItem[] = [
    { id: 'admin',       label: 'Quản Trị Hệ Thống',   icon: Shield,        color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
    { id: 'assignments', label: 'Quản Lý Đề & Chấm',   icon: FileText,      color: '#10b981', bg: 'rgba(16,185,129,0.1)', count: unreadNotificationCount },
    { id: 'quizzes',     label: 'Ngân Hàng Câu Hỏi',   icon: BookOpen,      color: '#4f6ef7', bg: 'rgba(79,110,247,0.1)' },
    { id: 'creator',     label: 'Soạn Đề Thi Mới',      icon: PlusCircle,    color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
    { id: 'flashcards',  label: 'Bộ Thẻ Ghi Nhớ',      icon: Layers,        color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }
  ];

  const navItems = isAdmin ? adminNav : studentNav;

  const handleSelect = (tab: ActiveTab) => { setActiveTab(tab); soundFx.playClick(); };

  const initial = studentName ? studentName.charAt(0).toUpperCase() : 'H';

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
      zIndex: 40
    }}>

      {/* Logo */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: '#fff', padding: '3px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid var(--border-color)', flexShrink: 0
          }}>
            <img src="/logo.png" alt="PH Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '7px' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              PH TinHocGenz
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
              Nền Tảng Học Trực Tuyến
            </div>
          </div>
        </div>
      </div>

      {/* User Card */}
      <div style={{ padding: '10px 12px' }}>
        <button
          onClick={onOpenAuthModal}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '12px',
            background: isAdmin ? 'rgba(217,119,6,0.07)' : 'rgba(79,110,247,0.06)',
            border: isAdmin ? '1px solid rgba(217,119,6,0.2)' : '1px solid rgba(79,110,247,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{
            width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
            background: isAdmin ? 'linear-gradient(135deg,#d97706,#b45309)' : 'linear-gradient(135deg,#4f6ef7,#6384fb)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.9rem',
            boxShadow: isAdmin ? '0 3px 10px rgba(217,119,6,0.3)' : '0 3px 10px rgba(79,110,247,0.3)'
          }}>
            {isAdmin ? <Shield size={16} /> : initial}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {studentName}
            </div>
            <div style={{ fontSize: '0.68rem', color: isAdmin ? '#d97706' : '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isAdmin ? '#d97706' : '#10b981', display: 'inline-block' }} />
              {isAdmin ? 'Giảng viên' : 'Học viên'}
            </div>
          </div>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ padding: '4px 10px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ padding: '6px 6px 4px', fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          {isAdmin ? 'Quản Trị & Khảo Thí' : 'Học Tập & Ôn Luyện'}
        </div>

        {navItems.map(item => {
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
                padding: '9px 10px',
                borderRadius: '10px',
                background: isActive ? item.bg : 'transparent',
                border: isActive ? `1px solid ${item.color}30` : '1px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.transform = 'translateX(2px)'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateX(0)'; } }}
            >
              {isActive && <div style={{ position: 'absolute', left: 0, top: '18%', bottom: '18%', width: '3px', borderRadius: '0 3px 3px 0', background: item.color }} />}

              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                  background: isActive ? item.color : item.bg,
                  color: isActive ? '#fff' : item.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? `0 3px 8px ${item.color}35` : 'none'
                }}>
                  <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span style={{
                  fontSize: '0.83rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {item.label}
                </span>
              </div>

              {item.count !== undefined && item.count > 0 ? (
                <span style={{
                  fontSize: '0.68rem', background: item.color, color: '#fff',
                  padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: 800, flexShrink: 0
                }}>{item.count}</span>
              ) : isActive ? (
                <ChevronRight size={13} color={item.color} style={{ flexShrink: 0, opacity: 0.7 }} />
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px 12px 12px', borderTop: '1px solid var(--border-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button
          onClick={onOpenInstallModal}
          className="btn btn-secondary"
          style={{ width: '100%', padding: '7px 12px', fontSize: '0.77rem', fontWeight: 600, gap: '6px', borderRadius: '9px' }}
        >
          <Smartphone size={13} color="var(--accent-primary)" />
          <span>Cài App Di Động</span>
        </button>

        {onLogout && (
          <button
            onClick={() => { soundFx.playClick(); onLogout(); }}
            style={{
              width: '100%', padding: '7px 12px', borderRadius: '9px',
              border: '1px solid rgba(220,38,38,0.2)',
              background: 'rgba(220,38,38,0.05)', color: 'var(--danger)',
              fontSize: '0.77rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.05)'; }}
          >
            <LogOut size={13} />
            <span>Đăng Xuất</span>
          </button>
        )}
      </div>
    </aside>
  );
};
