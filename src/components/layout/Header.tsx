import React from 'react';
import { Flame, Award, Bell, Bot } from 'lucide-react';
import { UserProfile, CurriculumTrack, TRACK_LABELS } from '../../types/auth';
import { UserDropdown } from './UserDropdown';
import { soundFx } from '../../utils/audio';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  streak: number;
  totalPoints: number;
  currentUser: UserProfile;
  isAdmin?: boolean;
  unreadNotificationCount?: number;
  onLogout: () => void;
  onOpenNotifications?: () => void;
  onOpenProfileModal: () => void;
  onOpenChangePassword?: () => void;
  onOpenInstallModal: () => void;
  onOpenAITutor?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  toggleTheme,
  streak,
  totalPoints,
  currentUser,
  isAdmin = false,
  unreadNotificationCount = 0,
  onLogout,
  onOpenNotifications,
  onOpenProfileModal,
  onOpenChangePassword,
  onOpenInstallModal,
  onOpenAITutor
}) => {
  const track: CurriculumTrack = currentUser.programTrack || 'office-fast-3in1';
  const trackName = TRACK_LABELS[track] || 'Office 3b';

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
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}
    >
      {/* ── LEFT: Mobile Logo / Desktop Track Badge ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        {/* Mobile Logo Only */}
        <div
          className="show-mobile-only"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <img src="/logo.png" alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>TinHocGenZ</span>
        </div>

        {/* Current Course Track Badge (Desktop & Tablet) */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--brand-light)',
            border: '1px solid rgba(79, 110, 247, 0.2)',
            color: 'var(--brand)',
            fontSize: '13px',
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand)' }} />
          <span>{isAdmin ? '🛡️ Quản trị đào tạo' : `📘 ${trackName}`}</span>
        </div>

        {/* Quick AI Tutor Pill */}
        {onOpenAITutor && (
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenAITutor();
            }}
            className="hide-xs"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              color: 'var(--purple-ai)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <Bot size={14} />
            <span>AI Tutor</span>
          </button>
        )}
      </div>

      {/* ── RIGHT: Unified Controls (Streak + XP + User Dropdown) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {/* Streak Badge (Single Source of Truth) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(245, 158, 11, 0.09)',
            border: '1px solid rgba(245, 158, 11, 0.22)',
            color: 'var(--warning)',
            fontSize: '13px',
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}
          title="Chuỗi ngày học liên tục"
        >
          <Flame size={14} fill="#f59e0b" color="#d97706" />
          <span>{streak || 1}d streak</span>
        </div>

        {/* XP Points (Desktop only) */}
        <div
          className="hide-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(79, 110, 247, 0.07)',
            border: '1px solid rgba(79, 110, 247, 0.18)',
            color: 'var(--accent-primary)',
            fontSize: '13px',
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}
          title="Điểm kinh nghiệm tích lũy"
        >
          <Award size={14} />
          <span>{totalPoints || 0} XP</span>
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
              width: '36px',
              height: '36px',
              minHeight: '36px',
              position: 'relative',
              color: unreadNotificationCount > 0 ? 'var(--danger)' : 'var(--text-secondary)'
            }}
          >
            <Bell size={16} />
            {unreadNotificationCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  background: 'var(--danger)',
                  color: '#fff',
                  fontSize: '10px',
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

        {/* ── User Dropdown (Gom Profile, Password, Theme, PWA, Logout) ── */}
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
