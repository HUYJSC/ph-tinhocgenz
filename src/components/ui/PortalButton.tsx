import React from 'react';
import { PORTAL_TOKENS } from '../../styles/portalDesignTokens';

export type PortalButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export interface PortalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PortalButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const PortalButton: React.FC<PortalButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  disabled,
  className = '',
  ...rest
}) => {
  const getStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: fullWidth ? 'flex' : 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      borderRadius: PORTAL_TOKENS.radii.sm,
      fontWeight: PORTAL_TOKENS.typography.weights.semibold,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transition: 'all 0.15s ease',
      border: 'none',
      width: fullWidth ? '100%' : 'auto',
      fontFamily: PORTAL_TOKENS.typography.fontFamily
    };

    if (size === 'sm') {
      base.padding = '6px 12px';
      base.fontSize = '12px';
    } else if (size === 'lg') {
      base.padding = '12px 24px';
      base.fontSize = '15px';
    } else {
      base.padding = '8px 16px';
      base.fontSize = '13px';
    }

    switch (variant) {
      case 'secondary':
        return {
          ...base,
          backgroundColor: '#F1F5F9',
          color: PORTAL_TOKENS.colors.text,
          border: `1px solid ${PORTAL_TOKENS.colors.border}`
        };
      case 'outline':
        return {
          ...base,
          backgroundColor: 'transparent',
          color: PORTAL_TOKENS.colors.primary,
          border: `1px solid ${PORTAL_TOKENS.colors.primary}`
        };
      case 'ghost':
        return {
          ...base,
          backgroundColor: 'transparent',
          color: PORTAL_TOKENS.colors.textSecondary
        };
      case 'danger':
        return {
          ...base,
          backgroundColor: PORTAL_TOKENS.colors.error,
          color: '#FFFFFF'
        };
      case 'primary':
      default:
        return {
          ...base,
          backgroundColor: PORTAL_TOKENS.colors.primary,
          color: '#FFFFFF'
        };
    }
  };

  return (
    <button
      style={{ ...getStyles(), ...style }}
      disabled={disabled}
      className={`portal-button ${className}`}
      {...rest}
    >
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </button>
  );
};
