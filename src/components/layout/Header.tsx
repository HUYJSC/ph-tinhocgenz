import React from 'react';
import { Moon, Sun, Volume2, VolumeX, Flame, Award, Shield, Bell, LogOut, ChevronDown } from 'lucide-react';
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
      case 'office-fast-3in1': return 'Word, Excel, PPT (3b)';
      case 'cc-cntt-basic': return 'CC CNTT Cơ bản (6b)';
      case 'cc-cntt-advanced': return 'CC CNTT Nâng cao (6b)';
      case 'cntt-basic-we': return 'CNTT Cơ bản: Word+Excel';
      case 'cntt-adv-we': return 'CNTT Nâng Cao: Word+Excel';
      case 'ai-office': return 'Ứng dụng AI Văn phòng';
      case 'excel-accounting': return 'Excel cho Kế toán';
      case 'word-6b': return 'Word (6 buổi)';
      case 'excel-6b': return 'Excel (6 buổi)';
      case 'ppt-6b': return 'PPT (6 buổi)';
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

        {/* Student / Admin Highlight Capsule & Switch Button */}
        <div
          onClick={onOpenAuthModal}
          title="Bấm để đổi môn học hoặc quản lý tài khoản"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px 4px 6px',
            borderRadius: 'var(--radius-full)',
            background: isAdmin ? 'rgba(217, 119, 6, 0.08)' : 'rgba(37, 99, 235, 0.07)',
            border: isAdmin ? '1.5px solid rgba(217, 119, 6, 0.3)' : '1.5px solid rgba(37, 99, 235, 0.25)',
            minWidth: 0,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
          }}
        >
          {/* Avatar Initial Circle */}
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: isAdmin
                ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.82rem',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}
          >
            {isAdmin ? <Shield size={15} /> : (studentName ? studentName.charAt(0).toUpperCase() : 'H')}
          </div>

          {/* Name & Track Meta */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '140px'
                }}
              >
                {studentName}
              </span>
              {studentCode && (
                <span
                  style={{
                    fontSize: '0.68rem',
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              <span>{isAdmin ? 'Quản Trị Viên' : getTrackShortName(programTrack)}</span>
            </div>
          </div>

          {/* Quick Switch Button Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              background: isAdmin ? 'rgba(217, 119, 6, 0.15)' : 'rgba(37, 99, 235, 0.12)',
              color: isAdmin ? '#d97706' : 'var(--accent-primary)',
              fontSize: '0.68rem',
              fontWeight: 800,
              marginLeft: '2px'
            }}
          >
            <span>Đổi Môn</span>
            <ChevronDown size={12} />
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
            title="Đăng xuất / Đổi tài khoản"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.06) 100%)',
              color: '#ef4444',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.08)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#ef4444';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.06) 100%)';
              e.currentTarget.style.color = '#ef4444';
            }}
          >
            <LogOut size={13} />
            <span>Đăng Xuất</span>
          </button>
        )}
      </div>
    </header>
  );
};
