import React from 'react';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  role?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'Người dùng',
  size = 'md',
  role
}) => {
  const getInitials = (str: string) => {
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getDimension = () => {
    switch (size) {
      case 'sm': return { px: 28, font: '11px' };
      case 'lg': return { px: 48, font: '16px' };
      case 'xl': return { px: 64, font: '22px' };
      case 'md':
      default: return { px: 38, font: '13px' };
    }
  };

  const { px, font } = getDimension();

  return (
    <div
      style={{
        width: `${px}px`,
        height: `${px}px`,
        borderRadius: '50%',
        backgroundColor: '#EFF6FF',
        color: '#0057B8',
        border: '1.5px solid #BFDBFE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: font,
        userSelect: 'none',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden'
      }}
      title={`${name} ${role ? `(${role})` : ''}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            // Fallback to initials if image fails
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};
