import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  style,
  className = '',
  ...props
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return { background: '#EFF6FF', color: '#0057B8', border: '1px solid #BFDBFE' };
      case 'success':
        return { background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' };
      case 'warning':
        return { background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' };
      case 'danger':
        return { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' };
      case 'neutral':
      default:
        return { background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' };
    }
  };

  const getDotColor = () => {
    switch (variant) {
      case 'primary': return '#0057B8';
      case 'success': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'danger': return '#EF4444';
      default: return '#64748B';
    }
  };

  const padding = size === 'sm' ? '2px 6px' : '4px 8px';
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontWeight: 600,
        borderRadius: '6px',
        padding,
        fontSize,
        lineHeight: 1.2,
        ...getStyles(),
        ...style
      }}
      className={`tinhocgenz-badge ${className}`}
      {...props}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: getDotColor(),
            display: 'inline-block'
          }}
        />
      )}
      {children}
    </span>
  );
};
