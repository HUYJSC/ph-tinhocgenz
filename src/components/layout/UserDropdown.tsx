import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, TRACK_LABELS, CurriculumTrack } from '../../types/auth';
import {
  User, Key, Moon, Sun, Smartphone, LogOut, ChevronDown,
  Shield, Bot
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface UserDropdownProps {
  currentUser: UserProfile;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onOpenProfile: () => void;
  onOpenChangePassword?: () => void;
  onOpenInstallPWA: () => void;
  onOpenAITutor?: () => void;
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
  onOpenAITutor,
  onLogout,
  isAdmin = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const track: CurriculumTrack = currentUser.programTrack || 'office-fast-3in1';
  const trackName = TRACK_LABELS[track] || 'Office Cấp Tốc (3b)';
  const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'H';

  // Close dropdown on outside click
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
      {/* Trigger Button */}
      <button
        onClick={() => {
          soundFx.playClick();
          setIsOpen(!isOpen);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px 4px 5px',
          borderRadius: 'var(--radius-full)',
          background: isAdmin ? 'rgba(217, 119, 6, 0.08)' : 'rgba(79, 110, 247, 0.08)',
          border: isOpen
            ? '1.5px solid var(--brand)'
            : isAdmin ? '1px solid rgba(217, 119, 6, 0.22)' : '1px solid rgba(79, 110, 247, 0.2)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          outline: 'none'
        }}
        title="Tài khoản & Thiết lập"
      >
        {/* Avatar */}
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: isAdmin ? 'linear-gradient(135deg, #d97706, #b45309)' : 'linear-gradient(135deg, #4f6ef7, #3b82f6)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.78rem',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
        >
          {isAdmin ? <Shield size={13} /> : initial}
        </div>

        {/* User Short Info */}
        <div style={{ textAlign: 'left', minWidth: 0, maxWidth: '140px' }}>
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
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
              fontSize: '0.62rem',
              color: isAdmin ? '#d97706' : 'var(--brand)',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {isAdmin ? 'Giảng Viên / Quản Trị' : trackName}
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
            width: '260px',
            borderRadius: '16px',
            padding: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.18)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '3px'
          }}
        >
          {/* Header Card inside Dropdown */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              marginBottom: '4px'
            }}
          >
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Mã: <strong>{currentUser.studentCode || 'THGZ-01'}</strong> • {isAdmin ? 'Giảng Viên' : trackName}
            </div>
          </div>

          {/* Item 1: Hồ sơ cá nhân */}
          <button
            onClick={() => handleAction(onOpenProfile)}
            className="btn-dropdown-item"
            style={dropdownItemStyle}
          >
            <div style={{ ...iconBadgeStyle, background: 'rgba(79, 110, 247, 0.1)', color: 'var(--brand)' }}>
              <User size={14} />
            </div>
            <span>Thông Tin Cá Nhân & Khóa Học</span>
          </button>

          {/* Item 2: Đổi mật khẩu */}
          {onOpenChangePassword && (
            <button
              onClick={() => handleAction(onOpenChangePassword)}
              className="btn-dropdown-item"
              style={dropdownItemStyle}
            >
              <div style={{ ...iconBadgeStyle, background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>
                <Key size={14} />
              </div>
              <span>Đổi Mật Khẩu Bảo Vệ</span>
            </button>
          )}

          {/* Item 3: AI Tutor Quick Launch */}
          {onOpenAITutor && (
            <button
              onClick={() => handleAction(onOpenAITutor)}
              className="btn-dropdown-item"
              style={dropdownItemStyle}
            >
              <div style={{ ...iconBadgeStyle, background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                <Bot size={14} />
              </div>
              <span>Trợ Lý AI Tutor 2026</span>
            </button>
          )}

          <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

          {/* Item 4: Theme Toggle */}
          <button
            onClick={() => {
              toggleTheme();
              soundFx.playClick();
            }}
            className="btn-dropdown-item"
            style={dropdownItemStyle}
          >
            <div style={{ ...iconBadgeStyle, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Giao Diện: {theme === 'dark' ? 'Tối (Dark)' : 'Sáng (Light)'}</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--brand)' }}>Đổi</span>
            </div>
          </button>

          {/* Item 5: Install PWA Web App */}
          <button
            onClick={() => handleAction(onOpenInstallPWA)}
            className="btn-dropdown-item"
            style={dropdownItemStyle}
          >
            <div style={{ ...iconBadgeStyle, background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
              <Smartphone size={14} />
            </div>
            <span>Cài Ứng Dụng (PWA)</span>
          </button>

          <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

          {/* Item 6: Logout */}
          <button
            onClick={() => handleAction(onLogout)}
            className="btn-dropdown-item"
            style={{
              ...dropdownItemStyle,
              color: '#dc2626'
            }}
          >
            <div style={{ ...iconBadgeStyle, background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}>
              <LogOut size={14} />
            </div>
            <span style={{ fontWeight: 800 }}>Đăng Xuất Khỏi Thiết Bị</span>
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
  borderRadius: '10px',
  border: 'none',
  background: 'transparent',
  color: 'var(--text-primary)',
  fontSize: '0.78rem',
  fontWeight: 600,
  cursor: 'pointer',
  textAlign: 'left',
  width: '100%',
  transition: 'background-color 0.15s ease'
};

const iconBadgeStyle: React.CSSProperties = {
  width: '26px',
  height: '26px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};
