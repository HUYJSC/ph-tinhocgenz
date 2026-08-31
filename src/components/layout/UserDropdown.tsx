import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, TRACK_LABELS, CurriculumTrack } from '../../types/auth';
import {
  User, Key, Moon, Sun, Smartphone, LogOut, ChevronDown,
  Shield
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface UserDropdownProps {
  currentUser: UserProfile;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onOpenProfile: () => void;
  onOpenChangePassword?: () => void;
  onOpenInstallPWA: () => void;
  onLogout: () => void;
  isAdmin?: boolean;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  currentUser,
  theme,
  toggleTheme,
  onOpenProfile,
  onOpenChangePassword,
  onOpenInstallPWA,
  onLogout,
  isAdmin = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const track: CurriculumTrack = currentUser.programTrack || 'office-fast-3in1';
  const trackName = TRACK_LABELS[track] || 'Office 3b';
  const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'H';

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (callback: () => void) => {
    soundFx.playClick();
    setIsOpen(false);
    callback();
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* User Dropdown Trigger (Compact Capsule) */}
      <button
        onClick={() => {
          soundFx.playClick();
          setIsOpen(!isOpen);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px 4px 4px',
          borderRadius: 'var(--radius-full)',
          background: isAdmin ? 'rgba(217, 119, 6, 0.08)' : 'rgba(79, 110, 247, 0.08)',
          border: isOpen
            ? '1.5px solid var(--brand)'
            : isAdmin ? '1px solid rgba(217, 119, 6, 0.22)' : '1px solid rgba(79, 110, 247, 0.2)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          outline: 'none',
          height: '40px'
        }}
        title="Tài khoản & Cài đặt"
      >
        {/* Avatar Circle */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: isAdmin ? 'linear-gradient(135deg, #d97706, #b45309)' : 'linear-gradient(135deg, #4f6ef7, #3b82f6)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '13px',
            flexShrink: 0
          }}
        >
          {isAdmin ? <Shield size={15} /> : initial}
        </div>

        {/* User Info (Name + Role) */}
        <div style={{ textAlign: 'left', minWidth: 0, maxWidth: '130px' }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.2
            }}
          >
            {currentUser.name || 'Học Viên'}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: isAdmin ? '#d97706' : 'var(--brand)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {isAdmin ? 'Giảng viên' : 'Học viên'}
          </div>
        </div>

        <ChevronDown
          size={14}
          color="var(--text-muted)"
          style={{
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0
          }}
        />
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div
          className="card animate-slide-up"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '240px',
            borderRadius: 'var(--radius-md)',
            padding: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}
        >
          {/* Header Block: Name + Role */}
          <div
            style={{
              padding: '8px 12px 10px',
              borderBottom: '1px solid var(--border-color)',
              marginBottom: '4px'
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {currentUser.name || 'Học Viên'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '1px' }}>
              {isAdmin ? 'Giảng viên / Quản trị' : `Học viên • ${trackName}`}
            </div>
          </div>

          <button
            onClick={() => handleAction(onOpenProfile)}
            className="btn-dropdown-item"
            style={dropdownItemStyle}
          >
            <User size={15} color="var(--brand)" />
            <span>Hồ sơ cá nhân</span>
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => handleAction(() => { window.location.href = '/admin'; })}
              className="btn-dropdown-item"
              style={{
                ...dropdownItemStyle,
                color: '#b45309',
                background: 'rgba(245, 158, 11, 0.08)',
                fontWeight: 700
              }}
            >
              <Shield size={15} color="#d97706" />
              <span>Cổng Quản Trị (/admin)</span>
            </button>
          )}

          {onOpenChangePassword && (
            <button
              onClick={() => handleAction(onOpenChangePassword)}
              className="btn-dropdown-item"
              style={dropdownItemStyle}
            >
              <Key size={15} color="#d97706" />
              <span>Đổi mật khẩu</span>
            </button>
          )}

          <button
            onClick={() => handleAction(onOpenInstallPWA)}
            className="btn-dropdown-item"
            style={dropdownItemStyle}
          >
            <Smartphone size={15} color="#06b6d4" />
            <span>Cài ứng dụng</span>
          </button>

          <button
            onClick={() => {
              toggleTheme();
              soundFx.playClick();
            }}
            className="btn-dropdown-item"
            style={dropdownItemStyle}
          >
            {theme === 'dark' ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#4f6ef7" />}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Chế độ {theme === 'dark' ? 'Sáng' : 'Tối'}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brand)' }}>Đổi</span>
            </div>
          </button>

          {/* Section 2: Divider + Logout */}
          <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

          <button
            onClick={() => handleAction(onLogout)}
            className="btn-dropdown-item"
            style={{
              ...dropdownItemStyle,
              color: 'var(--danger)'
            }}
          >
            <LogOut size={15} color="var(--danger)" />
            <span style={{ fontWeight: 600 }}>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
};

const dropdownItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '8px 10px',
  borderRadius: 'var(--radius-sm)',
  border: 'none',
  background: 'transparent',
  color: 'var(--text-primary)',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  textAlign: 'left',
  width: '100%',
  transition: 'background-color 0.15s ease'
};
