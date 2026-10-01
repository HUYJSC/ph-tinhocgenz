import React from 'react';
import { PORTAL_TOKENS } from '../../styles/portalDesignTokens';
import { PortalButton } from './PortalButton';

export interface PortalEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const PortalEmptyState: React.FC<PortalEmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        backgroundColor: PORTAL_TOKENS.colors.card,
        borderRadius: PORTAL_TOKENS.radii.md,
        border: `1px solid ${PORTAL_TOKENS.colors.border}`,
        width: '100%'
      }}
    >
      {icon && (
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: PORTAL_TOKENS.colors.primary,
            marginBottom: '16px'
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          margin: '0 0 8px',
          fontSize: PORTAL_TOKENS.typography.sizes.h3,
          fontWeight: PORTAL_TOKENS.typography.weights.semibold,
          color: PORTAL_TOKENS.colors.text
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            margin: '0 0 20px',
            fontSize: PORTAL_TOKENS.typography.sizes.body,
            color: PORTAL_TOKENS.colors.textMuted,
            maxWidth: '420px',
            lineHeight: 1.5
          }}
        >
          {description}
        </p>
      )}
      {actionText && onAction && (
        <PortalButton variant="primary" onClick={onAction}>
          {actionText}
        </PortalButton>
      )}
    </div>
  );
};
