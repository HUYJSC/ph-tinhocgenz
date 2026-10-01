import React from 'react';
import { PORTAL_TOKENS } from '../../styles/portalDesignTokens';

export interface PortalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: string;
  bordered?: boolean;
  hoverable?: boolean;
}

export const PortalCard: React.FC<PortalCardProps> = ({
  children,
  padding = '20px',
  bordered = true,
  hoverable = false,
  style,
  className = '',
  ...rest
}) => {
  return (
    <div
      className={`portal-card ${hoverable ? 'portal-card-hoverable' : ''} ${className}`}
      style={{
        backgroundColor: PORTAL_TOKENS.colors.card,
        border: bordered ? `1px solid ${PORTAL_TOKENS.colors.border}` : 'none',
        borderRadius: PORTAL_TOKENS.radii.md,
        boxShadow: PORTAL_TOKENS.shadows.card,
        padding,
        transition: 'all 0.15s ease',
        ...style
      }}
      {...rest}
    >
      {children}
    </div>
  );
};
