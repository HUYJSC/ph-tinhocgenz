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
  theme, toggleTheme, streak, totalPoints, studentName,
  studentCode, programTrack, isAdmin = false,
  unreadNotificationCount = 0, onLogout, onOpenNotifications, onOpenAuthModal
}) => {
  const [isMuted, setIsMuted] = React.useState(soundFx.isMuted);

  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) soundFx.playClick();
  };

  const TRACK_MAP: Record<string,string> = {
    'office-fast-3in1': 'Word, Excel, PPT(3b)',
    'cc-cntt-basic':    'CC CNTT Cơ bản',
    'cc-cntt-advanced': 'CC CNTT Nâng cao',
    'cntt-basic-we':    'CNTT Cơ bản (W+E)',
    'cntt-adv-we':      'CNTT Nâng Cao (W+E)',
    'ai-office':        'Ứng dụng AI VP',
    'excel-accounting': 'Excel Kế toán',
    'word-6b':          'Word',
    'excel-6b':         'Excel',
    'ppt-6b':           'PowerPoint',
  };

  const initial = studentName ? studentName.charAt(0).toUpperCase() : 'H';

  const iconBtn: React.CSSProperties = {
    width: '34px', height: '34px', borderRadius: '9px', border: '1px solid var(--border-color)',
    background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    transition: 'all 0.15s ease', boxShadow: 'var(--shadow-xs)'
  };

  return (
    <header className="app-header">

      {/* LEFT: Logo + User profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '9px',
          background: '#fff', padding: '2px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)', flexShrink: 0
        }}>
          <img src="/logo.png" alt="PH" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '7px' }} />
        </div>

        <div
          onClick={onOpenAuthModal}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '5px 10px 5px 5px',
            borderRadius: 'var(--radius-full)',
            background: isAdmin ? 'rgba(217,119,6,0.07)' : 'rgba(79,110,247,0.06)',
            border: isAdmin ? '1px solid rgba(217,119,6,0.2)' : '1px solid rgba(79,110,247,0.15)',
            cursor: 'pointer', minWidth: 0, flexShrink: 0
          }}
        >
          <div style={{
            width: '27px', height: '27px', borderRadius: '50%',
            background: isAdmin ? 'linear-gradient(135deg,#d97706,#b45309)' : 'linear-gradient(135deg,#4f6ef7,#6384fb)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.78rem', flexShrink: 0
          }}>
            {isAdmin ? <Shield size={13} /> : initial}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                {studentName}
              </span>
              {studentCode && (
                <span style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--accent-primary)', background: 'var(--brand-light)', padding: '1px 5px', borderRadius: '5px' }}>
                  {studentCode}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '1px' }}>
              {isAdmin ? 'Quản Trị Viên' : (TRACK_MAP[programTrack || ''] || 'Đổi Môn ▾')}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Stats + Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>

        {/* Streak */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '5px 9px', borderRadius: 'var(--radius-full)',
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
          color: '#d97706', fontSize: '0.78rem', fontWeight: 700
        }}>
          <Flame size={13} fill="#f59e0b" color="#d97706" />
          <span>{streak}d</span>
        </div>

        {/* XP */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '5px 9px', borderRadius: 'var(--radius-full)',
          background: 'rgba(79,110,247,0.07)', border: '1px solid rgba(79,110,247,0.18)',
          color: 'var(--accent-primary)', fontSize: '0.78rem', fontWeight: 700
        }}>
          <Award size={13} />
          <span>{totalPoints} XP</span>
        </div>

        {/* Notification Bell (Admin) */}
        {isAdmin && onOpenNotifications && (
          <button onClick={onOpenNotifications} title="Thông báo" style={{ ...iconBtn, position: 'relative', color: unreadNotificationCount > 0 ? '#dc2626' : 'var(--text-secondary)' }}>
            <Bell size={15} />
            {unreadNotificationCount > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '15px', height: '15px', borderRadius: '50%', background: '#dc2626', color: '#fff', fontSize: '0.58rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--bg-glass)' }}>
                {unreadNotificationCount}
              </span>
            )}
          </button>
        )}

        {/* Sound */}
        <button onClick={handleToggleMute} title={isMuted ? 'Bật âm' : 'Tắt âm'} style={iconBtn}>
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>

        {/* Theme */}
        <button onClick={toggleTheme} title={theme === 'dark' ? 'Sáng' : 'Tối'} style={iconBtn}>
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Logout */}
        {onLogout && (
          <button
            onClick={() => { soundFx.playClick(); onLogout(); }}
            title="Đăng xuất"
            style={{
              ...iconBtn,
              paddingInline: '10px', width: 'auto',
              color: 'var(--danger)',
              border: '1px solid rgba(220,38,38,0.2)',
              background: 'rgba(220,38,38,0.05)',
              gap: '5px', display: 'flex', alignItems: 'center'
            }}
          >
            <LogOut size={13} />
            <span className="desktop-inline" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Đăng Xuất</span>
          </button>
        )}
      </div>
    </header>
  );
};
