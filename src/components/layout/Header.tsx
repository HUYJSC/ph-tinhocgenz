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

  return (
    <header className="app-header">
      {/* Brand & User Profile Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            flexShrink: 0
          }}
        >
          <img
            src="/logo.png"
            alt="PH Digital Education"
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              PH- TINHOCGENZ
            </h1>
            {isAdmin ? (
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  color: '#fff',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <Shield size={10} />
                <span>Giảng Viên</span>
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: 'var(--accent-primary)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                Học Viên • {programTrack === 'mos-office' ? 'Khóa MOS Quốc Tế' : programTrack === 'programming' ? 'Khóa Lập Trình Python' : programTrack === 'cntt-basic' ? 'Khóa CNTT Cơ Bản' : programTrack === 'ic3-gs' ? 'Khóa Chuẩn IC3' : 'Tin Học Chuẩn'}
              </span>
            )}
          </div>

          <p
            onClick={onOpenAuthModal}
            title="Bấm để đổi tài khoản Học Viên / Giảng Viên"
            style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>{studentName}</span>
            {studentCode && <span style={{ color: 'var(--text-muted)' }}>({studentCode})</span>}
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}>✎ Đổi</span>
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Logout / Switch Account Button */}
        {onLogout && (
          <button
            onClick={() => {
              soundFx.playClick();
              onLogout();
            }}
            title="Đăng xuất / Đổi môn học hoặc đổi tài khoản"
            className="btn btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#ef4444'
            }}
          >
            <LogOut size={14} />
            <span>Đăng Xuất</span>
          </button>
        )}

        {/* Teacher Real-time Notification Bell */}
        {isAdmin && onOpenNotifications && (
          <button
            onClick={onOpenNotifications}
            title="Thông báo học sinh nộp bài"
            className="btn btn-secondary btn-icon"
            style={{ width: '36px', height: '36px', position: 'relative' }}
          >
            <Bell size={16} color={unreadNotificationCount > 0 ? '#ef4444' : 'currentColor'} />
            {unreadNotificationCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.5)'
                }}
              >
                {unreadNotificationCount}
              </span>
            )}
          </button>
        )}

        {/* Streak Badge */}
        <div
          title="Chuỗi ngày học liên tục"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#f59e0b',
            fontSize: '0.85rem',
            fontWeight: 700
          }}
        >
          <Flame size={16} fill="#f59e0b" />
          <span>{streak} ngày</span>
        </div>

        {/* XP Points */}
        <div
          title="Tổng điểm XP tích lũy"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(37, 99, 235, 0.1)',
            border: '1px solid rgba(37, 99, 235, 0.25)',
            color: 'var(--accent-primary)',
            fontSize: '0.85rem',
            fontWeight: 700
          }}
        >
          <Award size={16} />
          <span>{totalPoints} XP</span>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={handleToggleMute}
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          className="btn btn-secondary btn-icon"
          style={{ width: '36px', height: '36px' }}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
          className="btn btn-secondary btn-icon"
          style={{ width: '36px', height: '36px' }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};
