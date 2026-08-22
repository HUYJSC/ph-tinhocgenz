import React from 'react';
import { Flame, Bell, FileText, MessageSquare } from 'lucide-react';
import { UserProfile } from '../../types/auth';
import { UserDropdown } from './UserDropdown';
import { soundFx } from '../../utils/audio';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  streak: number;
  totalPoints: number;
  currentUser: UserProfile;
  activeSection?: 'learn' | 'review' | 'exam' | 'progress';
  isAdmin?: boolean;
  unreadNotificationCount?: number;
  onLogout: () => void;
  onOpenNotifications?: () => void;
  onOpenProfileModal: () => void;
  onOpenChangePassword?: () => void;
  onOpenInstallModal: () => void;
  onOpenNotices?: () => void;
  onOpenFeedback?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  toggleTheme,
  streak,
  currentUser,
  activeSection = 'learn',
  isAdmin = false,
  unreadNotificationCount = 0,
  onLogout,
  onOpenNotifications,
  onOpenProfileModal,
  onOpenChangePassword,
  onOpenInstallModal,
  onOpenNotices,
  onOpenFeedback
}) => {
  const studentNavShortcuts = [
    { id: 'learn', label: 'Giáo trình', targetId: 'section-learn' },
    { id: 'review', label: 'Ôn tập', targetId: 'section-review' },
    { id: 'exam', label: 'Khảo thí', targetId: 'section-exam' },
    { id: 'progress', label: 'Năng lực', targetId: 'section-progress' }
  ];

  const teacherNavShortcuts = [
    { id: 'class', label: 'Lớp học', targetId: 'section-teacher-class' },
    { id: 'risk', label: 'Cảnh báo', targetId: 'section-teacher-risk' },
    { id: 'grading', label: 'Chấm bài', targetId: 'section-teacher-grading' },
    { id: 'mgmt', label: 'Quản lý', targetId: 'section-teacher-mgmt' }
  ];

  const navShortcuts = isAdmin ? teacherNavShortcuts : studentNavShortcuts;

  const handleScrollToSection = (targetId: string) => {
    soundFx.playClick();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className="app-header"
      style={{
        height: 'var(--header-height)',
        minHeight: 'var(--header-height)',
        maxHeight: 'var(--header-height)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      {/* ── LEFT: Logo Brand & Top Nav Shortcuts ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0 }}>
        {/* Brand Logo + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: '#fff',
              padding: '2px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <img src="/logo.png" alt="PH - Tin Học GenZ" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            PH TIN HỌC GENZ
          </span>
        </div>

        {/* Scroll-Spy Top Navigation Shortcuts (Desktop & Tablet) */}
        <nav className="hide-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {navShortcuts.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleScrollToSection(item.targetId)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: isActive ? (isAdmin ? 'rgba(217, 119, 6, 0.1)' : 'var(--brand-light)') : 'transparent',
                  border: 'none',
                  color: isActive ? (isAdmin ? '#d97706' : 'var(--brand)') : 'var(--text-secondary)',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {isActive && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isAdmin ? '#d97706' : 'var(--brand)' }} />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── RIGHT: Minimal Controls (Streak + Notifications + User Dropdown) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {/* Streak Badge (Small & Unified) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            color: 'var(--warning)',
            fontSize: '12.5px',
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}
          title="Chuỗi ngày học liên tục"
        >
          <Flame size={13} fill="#f59e0b" color="#d97706" />
          <span>{streak || 1}</span>
        </div>

        {/* Admin Notification Bell */}
        {isAdmin && onOpenNotifications && (
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenNotifications();
            }}
            title="Thông báo bài nộp"
            className="btn btn-icon"
            style={{
              width: '34px',
              height: '34px',
              minHeight: '34px',
              position: 'relative',
              color: unreadNotificationCount > 0 ? 'var(--danger)' : 'var(--text-secondary)'
            }}
          >
            <Bell size={15} />
            {unreadNotificationCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: 'var(--danger)',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {unreadNotificationCount}
              </span>
            )}
          </button>
        )}

        {/* Academic Notice Board */}
        {onOpenNotices && (
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenNotices();
            }}
            title="Bảng tin thông báo học vụ"
            className="btn btn-icon"
            style={{
              width: '32px',
              height: '32px',
              minHeight: '32px',
              color: 'var(--brand)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <FileText size={15} />
          </button>
        )}

        {/* Student Help Desk / Feedback */}
        {onOpenFeedback && (
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenFeedback();
            }}
            title="Góp ý & Hỗ trợ học vụ"
            className="btn btn-icon"
            style={{
              width: '32px',
              height: '32px',
              minHeight: '32px',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <MessageSquare size={15} />
          </button>
        )}

        {/* User Dropdown */}
        <UserDropdown
          currentUser={currentUser}
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenProfile={onOpenProfileModal}
          onOpenChangePassword={onOpenChangePassword}
          onOpenInstallPWA={onOpenInstallModal}
          onLogout={onLogout}
          isAdmin={isAdmin}
        />
      </div>
    </header>
  );
};
