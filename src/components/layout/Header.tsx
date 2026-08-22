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
        padding: '0 16px',
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
      {/* LEFT: Track Badge & Quick AI Tutor Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        {/* Track Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--brand-light)',
            border: '1px solid rgba(79, 110, 247, 0.2)',
            color: 'var(--brand)',
            fontSize: '0.74rem',
            fontWeight: 800,
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand)' }} />
          <span>{isAdmin ? '🛡️ Ban Đào Tạo & Khảo Thí' : `📘 ${trackName}`}</span>
        </div>

        {/* Quick AI Tutor Trigger (Tablet & Desktop) */}
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
              gap: '5px',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              color: '#8b5cf6',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <Bot size={13} />
            <span>Hỏi AI Tutor</span>
          </button>
        )}
      </div>

      {/* RIGHT: Gamification Badges + Notifications + User Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Streak Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(245, 158, 11, 0.09)',
            border: '1px solid rgba(245, 158, 11, 0.22)',
            color: '#d97706',
            fontSize: '0.72rem',
            fontWeight: 800,
            whiteSpace: 'nowrap'
          }}
          title="Chuỗi ngày học liên tục"
        >
          <Flame size={13} fill="#f59e0b" color="#d97706" />
          <span>{streak || 3}d</span>
        </div>

        {/* XP Points (Hidden on extra small screens) */}
        <div
          className="hide-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(79, 110, 247, 0.07)',
            border: '1px solid rgba(79, 110, 247, 0.18)',
            color: 'var(--accent-primary)',
            fontSize: '0.72rem',
            fontWeight: 800,
            whiteSpace: 'nowrap'
          }}
          title="Điểm kinh nghiệm tích lũy"
        >
          <Award size={13} />
          <span>{totalPoints || 120} XP</span>
        </div>

        {/* Admin Notification Bell */}
        {isAdmin && onOpenNotifications && (
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenNotifications();
            }}
            title="Thông báo bài nộp mới"
            className="btn btn-icon"
            style={{
              width: '32px',
              height: '32px',
              minHeight: '32px',
              position: 'relative',
              color: unreadNotificationCount > 0 ? '#dc2626' : 'var(--text-secondary)'
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
                  background: '#dc2626',
                  color: '#fff',
                  fontSize: '0.55rem',
                  fontWeight: 900,
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

        {/* Unified User Dropdown (Gom Profile / Theme / PWA / Logout) */}
        <UserDropdown
          currentUser={currentUser}
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenProfile={onOpenProfileModal}
          onOpenChangePassword={onOpenChangePassword}
          onOpenInstallPWA={onOpenInstallModal}
          onOpenAITutor={onOpenAITutor}
          onLogout={onLogout}
          isAdmin={isAdmin}
        />
      </div>
    </header>
  );
};
