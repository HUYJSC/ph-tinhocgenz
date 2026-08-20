import React from 'react';
import { Moon, Sun, Volume2, VolumeX, Flame, Award } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  streak: number;
  totalPoints: number;
  studentName: string;
  onEditName?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  toggleTheme,
  streak,
  totalPoints,
  studentName,
  onEditName
}) => {
  const [isMuted, setIsMuted] = React.useState(soundFx.isMuted);

  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) soundFx.playClick();
  };

  return (
    <header className="app-header">
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
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            PH- TINHOCGENZ
          </h1>
          <p
            onClick={onEditName}
            title="Bấm để đổi tên học viên"
            style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>{studentName}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}>✎</span>
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
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
