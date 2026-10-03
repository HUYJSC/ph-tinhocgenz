import React, { useState, useRef } from 'react';
import {
  User, Copy, Check, MessageSquare, Edit3,
  MoreHorizontal, Key, Ban, Unlock, Camera
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export interface ProfileHeaderProps {
  id: string;
  name: string;
  code?: string;
  role: 'STUDENT' | 'TEACHER' | 'STAFF' | 'ADMIN' | string;
  status: 'active' | 'locked';
  avatar?: string;
  departmentOrClass?: string;
  onSendMessage?: () => void;
  onEdit?: () => void;
  onAdd?: () => void;
  onResetPassword?: () => void;
  onToggleLock?: () => void;
  onUploadAvatar?: (file: File) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  code,
  role,
  status,
  avatar,
  departmentOrClass,
  onSendMessage,
  onEdit,
  onAdd,
  onResetPassword,
  onToggleLock,
  onUploadAvatar
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizedRole = role.toUpperCase();
  const isActive = status === 'active';

  const getRolePresentation = () => {
    switch (normalizedRole) {
      case 'STUDENT':
        return { label: 'Học viên', icon: '🎓', bg: '#EFF6FF', color: '#0057B8', border: '#BFDBFE' };
      case 'TEACHER':
        return { label: 'Giảng viên', icon: '👨‍🏫', bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' };
      case 'STAFF':
      case 'ACADEMIC':
      case 'GIAOVU':
      case 'ACADEMIC_STAFF':
        return { label: 'Nhân sự / Giáo vụ', icon: '📋', bg: '#F8FAFC', color: '#334155', border: '#CBD5E1' };
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return { label: 'Quản trị viên', icon: '🛡️', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' };
      default:
        return { label: 'Thành viên', icon: '👤', bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
    }
  };

  const roleInfo = getRolePresentation();

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!code) return;
    soundFx.playClick();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadAvatar) {
      soundFx.playClick();
      onUploadAvatar(file);
    }
  };

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '16px',
      border: '1px solid #E2E8F0',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(11, 37, 69, 0.04)',
      position: 'relative'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        {/* Left: Avatar + Identity Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', minWidth: '260px' }}>
          {/* Avatar with Monogram or Image */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#0057B8',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(0, 87, 184, 0.25)',
              border: '3px solid #FFFFFF',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {avatar ? (
                <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                name ? name.charAt(0).toUpperCase() : <User size={32} />
              )}
            </div>

            {/* Avatar Upload trigger */}
            {onUploadAvatar && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Tải lên ảnh đại diện"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    border: '1.5px solid #0057B8',
                    color: '#0057B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <Camera size={12} />
                </button>
              </>
            )}
          </div>

          {/* Name, Code, Badges */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#0B2545',
                letterSpacing: '-0.02em'
              }}>
                {name}
              </h2>

              {code && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  title="Nhấn để sao chép mã"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#0057B8',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{code}</span>
                  {copiedCode ? <Check size={11} color="#16A34A" /> : <Copy size={11} />}
                </button>
              )}
            </div>

            {/* Badges: Role, Status, Department */}
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
                <span>{isActive ? (normalizedRole === 'STUDENT' ? 'Đang học' : 'Đang hoạt động') : 'Tài khoản khóa'}</span>
              </span>

              {departmentOrClass && (
                <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                  {departmentOrClass}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Primary Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {onSendMessage && (
            <button
              type="button"
              onClick={() => { soundFx.playClick(); onSendMessage(); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #0057B8',
                background: '#F4F8FD',
                color: '#0057B8',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <MessageSquare size={14} />
              <span>Gửi tin nhắn</span>
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={() => { soundFx.playClick(); onEdit(); }}
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
            >
              <Edit3 size={14} />
              <span>Chỉnh sửa</span>
            </button>
          )}

          {/* More Actions Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => { soundFx.playClick(); setShowMoreMenu(!showMoreMenu); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#0B2545',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <MoreHorizontal size={16} />
              <span>Thao tác</span>
            </button>

            {showMoreMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  minWidth: '180px',
                  zIndex: 20,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {onAdd && (
                  <button
                    type="button"
                    onClick={() => { setShowMoreMenu(false); onAdd(); }}
                    style={{
                      padding: '10px 14px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#0B2545',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderBottom: '1px solid #F1F5F9'
                    }}
                  >
                    <span>➕ Thêm vào lớp / môn</span>
                  </button>
                )}

                {onResetPassword && (
                  <button
                    type="button"
                    onClick={() => { setShowMoreMenu(false); onResetPassword(); }}
                    style={{
                      padding: '10px 14px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#0057B8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderBottom: '1px solid #F1F5F9'
                    }}
                  >
                    <Key size={14} />
                    <span>Đổi mật khẩu</span>
                  </button>
                )}

                {onToggleLock && (
                  <button
                    type="button"
                    onClick={() => { setShowMoreMenu(false); onToggleLock(); }}
                    style={{
                      padding: '10px 14px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: isActive ? '#DC2626' : '#16A34A',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {isActive ? <Ban size={14} /> : <Unlock size={14} />}
                    <span>{isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

