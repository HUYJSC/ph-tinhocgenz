import React from 'react';
import { Moon, Sun, Flame, Award, Shield, Bell, LogOut } from 'lucide-react';
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
  programTrack, isAdmin = false,
  unreadNotificationCount = 0, onLogout, onOpenNotifications, onOpenAuthModal
}) => {

  const TRACK_MAP: Record<string,string> = {
    'office-fast-3in1': 'Office 3b',
    'cc-cntt-basic':    'CC CNTT Cơ bản',
    'cc-cntt-advanced': 'CC CNTT Nâng cao',
    'cntt-basic-we':    'CNTT CB (W+E)',
    'cntt-adv-we':      'CNTT NC (W+E)',
    'ai-office':        'AI Văn phòng',
    'excel-accounting': 'Excel Kế toán',
    'word-6b':          'Word 6b',
    'excel-6b':         'Excel 6b',
    'ppt-6b':           'PPT 6b',
  };

  const initial = studentName ? studentName.charAt(0).toUpperCase() : 'H';

  return (
    <header className="app-header">
      {/* LEFT: Logo + Compact User Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 1 }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '8px',
          background: '#fff', padding: '2px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xs)', flexShrink: 0
        }}>
          <img src="/logo.png" alt="PH" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }} />
        </div>

        <button
          onClick={onOpenAuthModal}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 8px 4px 4px',
            borderRadius: 'var(--radius-full)',
            background: isAdmin ? 'rgba(217,119,6,0.08)' : 'rgba(79,110,247,0.07)',
            border: isAdmin ? '1px solid rgba(217,119,6,0.22)' : '1px solid rgba(79,110,247,0.18)',
            cursor: 'pointer', minWidth: 0, maxWidth: '170px',
            textAlign: 'left'
          }}
          title="Bấm để đổi môn / tài khoản"
        >
          <div style={{
            width: '24px', height: '24px', borderRadius: '50%',
            background: isAdmin ? 'linear-gradient(135deg,#d97706,#b45309)' : 'linear-gradient(135deg,#4f6ef7,#6384fb)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.72rem', flexShrink: 0
          }}>
            {isAdmin ? <Shield size={12} /> : initial}
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{
              fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2
            }}>
              {studentName}
            </div>
            <div style={{
              fontSize: '0.62rem', color: 'var(--text-muted)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {isAdmin ? 'Quản Trị' : (TRACK_MAP[programTrack || ''] || 'Đổi Môn ▾')}
            </div>
          </div>
        </button>
      </div>

      {/* RIGHT: Compact Controls (Never Overlaps) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
        {/* Streak Pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '3px',
          padding: '4px 8px', borderRadius: 'var(--radius-full)',
          background: 'rgba(245,158,11,0.09)', border: '1px solid rgba(245,158,11,0.22)',
          color: '#d97706', fontSize: '0.74rem', fontWeight: 800,
          whiteSpace: 'nowrap'
        }}>
          <Flame size={12} fill="#f59e0b" color="#d97706" />
          <span>{streak}d</span>
        </div>

        {/* XP Points (Desktop & larger mobile only) */}
        <div className="hide-sm" style={{
          display: 'flex', alignItems: 'center', gap: '3px',
          padding: '4px 8px', borderRadius: 'var(--radius-full)',
          background: 'rgba(79,110,247,0.07)', border: '1px solid rgba(79,110,247,0.18)',
          color: 'var(--accent-primary)', fontSize: '0.74rem', fontWeight: 800,
          whiteSpace: 'nowrap'
        }}>
          <Award size={12} />
          <span>{totalPoints} XP</span>
        </div>

        {/* Notification Bell (Admin) */}
        {isAdmin && onOpenNotifications && (
          <button
            onClick={onOpenNotifications}
            title="Thông báo"
            className="btn btn-icon"
            style={{
              width: '32px', height: '32px', minHeight: '32px',
              position: 'relative',
              color: unreadNotificationCount > 0 ? '#dc2626' : 'var(--text-secondary)'
            }}
          >
            <Bell size={14} />
            {unreadNotificationCount > 0 && (
              <span style={{
                position: 'absolute', top: '-2px', right: '-2px',
                width: '14px', height: '14px', borderRadius: '50%',
                background: '#dc2626', color: '#fff', fontSize: '0.55rem',
                fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {unreadNotificationCount}
              </span>
            )}
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Giao diện Sáng' : 'Giao diện Tối'}
          className="btn btn-icon"
          style={{ width: '32px', height: '32px', minHeight: '32px', color: 'var(--text-secondary)' }}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Logout */}
        {onLogout && (
          <button
            onClick={() => { soundFx.playClick(); onLogout(); }}
            title="Đăng xuất"
            className="btn"
            style={{
              padding: '6px 8px', minHeight: '32px', height: '32px',
              color: 'var(--danger)',
              border: '1px solid rgba(220,38,38,0.2)',
              background: 'rgba(220,38,38,0.05)',
              gap: '4px', display: 'flex', alignItems: 'center'
            }}
          >
            <LogOut size={13} />
            <span className="desktop-inline" style={{ fontSize: '0.76rem', fontWeight: 700 }}>Đăng Xuất</span>
          </button>
        )}
      </div>
    </header>
  );
};
