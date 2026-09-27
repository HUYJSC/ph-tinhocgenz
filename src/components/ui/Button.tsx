import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  className = '',
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          background: '#0057B8',
          color: '#FFFFFF',
          border: '1px solid #0057B8',
          boxShadow: '0 1px 2px rgba(0, 87, 184, 0.12)'
        };
      case 'secondary':
        return {
          background: '#F1F5F9',
          color: '#0B2545',
          border: '1px solid #E2E8F0'
        };
      case 'outline':
        return {
          background: 'transparent',
          color: '#0057B8',
          border: '1px solid #0057B8'
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: '#475569',
          border: '1px solid transparent'
        };
      case 'danger':
        return {
          background: '#EF4444',
          color: '#FFFFFF',
          border: '1px solid #EF4444'
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px', fontSize: '12px', minHeight: '32px' };
      case 'lg':
        return { padding: '12px 24px', fontSize: '15px', minHeight: '46px' };
      case 'md':
      default:
        return { padding: '9px 18px', fontSize: '13.5px', minHeight: '38px' };
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 600,
        borderRadius: '8px',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.65 : 1,
        transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: 'inherit',
        outline: 'none',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style
      }}
      className={`tinhocgenz-btn tinhocgenz-btn-${variant} ${className}`}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          if (variant === 'primary') e.currentTarget.style.background = '#003F88';
          if (variant === 'secondary') e.currentTarget.style.background = '#E2E8F0';
          if (variant === 'outline') e.currentTarget.style.background = '#EFF6FF';
          if (variant === 'ghost') e.currentTarget.style.background = '#F8FAFC';
          if (variant === 'danger') e.currentTarget.style.background = '#DC2626';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading) {
          const defaultStyles = getVariantStyles();
          if (defaultStyles.background) e.currentTarget.style.background = defaultStyles.background as string;
        }
      }}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.6s linear infinite'
          }}
        />
      ) : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
