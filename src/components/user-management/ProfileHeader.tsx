import React from 'react';
import {
  User, Copy, Check, Key, Ban, Unlock
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export interface ProfileHeaderProps {
  id: string;
  name: string;
  code: string; // e.g. "HV001" or "GV001"
  role: 'student' | 'teacher' | 'academic' | 'admin' | string;
  status: 'active' | 'locked';
  avatar?: string;
  departmentOrClass?: string;
  onResetPassword?: () => void;
  onToggleLock?: () => void;
  onCopyCode?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  code,
  role,
  status,
  avatar,
  departmentOrClass,
  onResetPassword,
  onToggleLock
}) => {
  const [copied, setCopied] = React.useState(false);

  const getRoleBadge = () => {
    switch (role) {
      case 'student':
        return { label: 'Học viên', icon: '🎓', bg: '#EFF6FF', color: '#0057B8', border: '#BFDBFE' };
      case 'teacher':
        return { label: 'Giảng viên', icon: '👨‍🏫', bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' };
      case 'academic':
      case 'academic_manager':
      case 'academic_staff':
      case 'giaovu':
        return { label: 'Giáo vụ / Nhân sự', icon: '📋', bg: '#F5F3FF', color: '#5B21B6', border: '#DDD6FE' };
      case 'admin':
      case 'super_admin':
        return { label: 'Quản trị viên', icon: '🛡️', bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' };
      default:
        return { label: 'Người dùng', icon: '👤', bg: '#F1F5F9', color: '#334155', border: '#E2E8F0' };
    }
  };

  const roleInfo = getRoleBadge();
  const isActive = status === 'active';

  const handleCopyCode = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Left: Avatar + Identity Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
          {/* Avatar Container with Status Pip */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #0057B8'
                }}
              />
            ) : (
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0057B8 0%, #003F88 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '22px',
                border: '2px solid #FFFFFF',
                boxShadow: '0 2px 8px rgba(0, 87, 184, 0.25)'
              }}>
                {name.trim() ? name.trim().slice(0, 1).toUpperCase() : <User size={28} />}
              </div>
            )}

            {/* Status Pulse Dot */}
            <span
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: isActive ? '#10B981' : '#EF4444',
                border: '2px solid #FFFFFF'
              }}
              title={isActive ? 'Đang hoạt động' : 'Tài khoản đang bị khóa'}
            />
          </div>

          {/* Name, Code, Badges */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#0B2545',
                margin: 0,
                lineHeight: 1.2
              }}>
                {name}
              </h2>

              {/* User Code with Copy Button */}
              <button
                type="button"
                onClick={handleCopyCode}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Nhấp để sao chép mã người dùng"
              >
                <span>{code}</span>
                {copied ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
              </button>
            </div>

            {/* Badges Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Role Badge */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '999px',
                background: roleInfo.bg,
                color: roleInfo.color,
                border: `1px solid ${roleInfo.border}`,
                fontSize: '0.76rem',
                fontWeight: 700
              }}>
                <span>{roleInfo.icon}</span>
                <span>{roleInfo.label}</span>
              </span>

              {/* Status Badge */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '999px',
                background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                color: isActive ? '#059669' : '#DC2626',
                border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                fontSize: '0.76rem',
                fontWeight: 700
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isActive ? '#10B981' : '#EF4444'
                }} />
                <span>{isActive ? (role === 'student' ? 'Đang học' : 'Đang hoạt động') : 'Tài khoản khóa'}</span>
              </span>

              {departmentOrClass && (
                <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                  • {departmentOrClass}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {onResetPassword && (
            <button
              type="button"
              onClick={() => { soundFx.playClick(); onResetPassword(); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#0B2545',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Đặt lại mật khẩu cho người dùng này"
            >
              <Key size={14} color="#0057B8" />
              <span>Đổi mật khẩu</span>
            </button>
          )}

          {onToggleLock && (
            <button
              type="button"
              onClick={() => { soundFx.playClick(); onToggleLock(); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: `1px solid ${isActive ? '#FCA5A5' : '#86EFAC'}`,
                background: isActive ? '#FEF2F2' : '#F0FDF4',
                color: isActive ? '#DC2626' : '#16A34A',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isActive ? <Ban size={14} /> : <Unlock size={14} />}
              <span>{isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
