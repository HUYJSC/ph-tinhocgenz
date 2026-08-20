import React from 'react';
import { Moon, Sun, Volume2, VolumeX, Flame, Award, Shield, Bell, LogOut } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  streak: number;
  totalPoints: number;
  studentName: string;
  studentCode?: string;
  programTrack?: string;
  isAdmin?: boolean;
  unreadNotificationCount?: number;
  onLogout?: () => void;
  onOpenNotifications?: () => void;
  onOpenAuthModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  toggleTheme,
  streak,
  totalPoints,
  studentName,
  studentCode,
  programTrack,
  isAdmin = false,
  unreadNotificationCount = 0,
  onLogout,
  onOpenNotifications,
  onOpenAuthModal
}) => {
  const [isMuted, setIsMuted] = React.useState(soundFx.isMuted);

  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) soundFx.playClick();
  };

  const getTrackShortName = (track?: string) => {
    switch (track) {
      case 'cntt-basic': return 'CNTT Cơ Bản';
      case 'mos-office': return 'MOS Quốc Tế';
      case 'ic3-gs': return 'IC3 GS6';
      case 'cntt-advanced': return 'CNTT Nâng Cao';
      case 'programming': return 'Lập Trình Python';
      case 'cyber-security': return 'Bảo Mật IT';
      default: return 'Tin Học Chuẩn';
    }
  };

  return (
    <header
      className="app-header"
      style={{
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'nowrap'
      }}
    >
      {/* 1. LEFT: Brand & Prominent Student / Admin Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        {/* Crisp Logo Container */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3px',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.12)',
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

        {/* Student / Admin Highlight Capsule */}
        <div
          onClick={onOpenAuthModal}
          title="Tài khoản đang đăng nhập"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 12px 5px 6px',
            borderRadius: 'var(--radius-full)',
            background: isAdmin ? 'rgba(217, 119, 6, 0.08)' : 'rgba(37, 99, 235, 0.07)',
            border: isAdmin ? '1px solid rgba(217, 119, 6, 0.25)' : '1px solid rgba(37, 99, 235, 0.2)',
            minWidth: 0,
            cursor: 'default'
          }}
        >
          {/* Avatar Initial Circle */}
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: isAdmin
                ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.8rem',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}
          >
            {isAdmin ? <Shield size={14} /> : (studentName ? studentName.charAt(0).toUpperCase() : 'H')}
          </div>

          {/* Name & Track Meta */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '160px'
                }}
              >
                {studentName}
              </span>
              {studentCode && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: 'var(--accent-primary)',
                    background: 'rgba(37, 99, 235, 0.12)',
                    padding: '1px 5px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  {studentCode}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              <span>{isAdmin ? 'Quản Trị Viên' : getTrackShortName(programTrack)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RIGHT: Gamification, Utility & Logout Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Streak Pill */}
        <div
          title="Chuỗi ngày học"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            color: '#d97706',
            fontSize: '0.8rem',
            fontWeight: 800
          }}
        >
          <Flame size={14} fill="#f59e0b" color="#d97706" />
          <span>{streak}d</span>
        </div>

        {/* XP Points */}
        <div
          title="Điểm kinh nghiệm XP"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(37, 99, 235, 0.08)',
            border: '1px solid rgba(37, 99, 235, 0.2)',
            color: 'var(--accent-primary)',
            fontSize: '0.8rem',
            fontWeight: 800
          }}
        >
          <Award size={14} />
          <span>{totalPoints} XP</span>
        </div>

        {/* Teacher Real-time Notification Bell */}
        {isAdmin && onOpenNotifications && (
          <button
            onClick={onOpenNotifications}
            title="Thông báo bài nộp"
            className="btn btn-secondary btn-icon"
            style={{ width: '34px', height: '34px', position: 'relative' }}
          >
            <Bell size={15} color={unreadNotificationCount > 0 ? '#ef4444' : 'currentColor'} />
            {unreadNotificationCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.62rem',
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

        {/* Sound Toggle */}
        <button
          onClick={handleToggleMute}
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          className="btn btn-secondary btn-icon"
          style={{ width: '34px', height: '34px' }}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Giao diện Sáng' : 'Giao diện Tối'}
          className="btn btn-secondary btn-icon"
          style={{ width: '34px', height: '34px' }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={() => {
              soundFx.playClick();
              onLogout();
            }}
            title="Đăng xuất khỏi hệ thống"
            style={{
              padding: '6px 10px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#ef4444',
              cursor: 'pointer'
            }}
          >
            <LogOut size={13} />
            <span style={{ display: 'none' }} className="desktop-inline">Đăng Xuất</span>
          </button>
        )}
      </div>
    </header>
  );
};
