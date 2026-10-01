import React from 'react';
import { PORTAL_TOKENS } from '../../styles/portalDesignTokens';

export type PortalBadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

export interface PortalBadgeProps {
  children: React.ReactNode;
  variant?: PortalBadgeVariant;
  size?: 'sm' | 'md';
}

export const PortalBadge: React.FC<PortalBadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md'
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: PORTAL_TOKENS.colors.successBg, text: PORTAL_TOKENS.colors.success, border: '#C8E6C9' };
      case 'warning':
        return { bg: PORTAL_TOKENS.colors.warningBg, text: PORTAL_TOKENS.colors.warning, border: '#FFE0B2' };
      case 'error':
        return { bg: PORTAL_TOKENS.colors.errorBg, text: PORTAL_TOKENS.colors.error, border: '#FFCDD2' };
      case 'neutral':
        return { bg: '#F1F5F9', text: PORTAL_TOKENS.colors.textSecondary, border: PORTAL_TOKENS.colors.border };
      case 'primary':
      default:
        return { bg: '#EFF6FF', text: PORTAL_TOKENS.colors.primary, border: '#BFDBFE' };
    }
  };

  const colors = getColors();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '2px 6px' : '4px 10px',
        borderRadius: PORTAL_TOKENS.radii.sm,
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: PORTAL_TOKENS.typography.weights.semibold,
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        lineHeight: 1.2
      }}
    >
      {children}
    </span>
  );
};
