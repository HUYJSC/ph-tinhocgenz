import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
  };
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  primaryAction,
  secondaryAction
}) => {
  return (
    <div style={{
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      padding: '20px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      {/* Breadcrumb Navigation */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#64748B' }}>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {crumb.onClick && !isLast ? (
                  <button
                    onClick={crumb.onClick}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#0057B8',
                      cursor: 'pointer',
                      fontSize: 'inherit',
                      fontWeight: 500
                    }}
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span style={{ color: isLast ? '#0B2545' : '#64748B', fontWeight: isLast ? 600 : 400 }}>
                    {crumb.label}
                  </span>
                )}
                {!isLast && <ChevronRight size={13} color="#94A3B8" />}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Title & Actions Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#0B2545',
            margin: 0,
            lineHeight: 1.25,
            letterSpacing: '-0.01em'
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: '13.5px',
              color: '#52677D',
              margin: '4px 0 0 0',
              lineHeight: 1.4
            }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Buttons (1 Primary, 1 Secondary max per UX Principle) */}
        {(primaryAction || secondaryAction) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                style={{
                  height: '38px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  color: '#0B2545',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background 0.15s ease'
                }}
              >
                {secondaryAction.icon && React.createElement(secondaryAction.icon, { size: 16 })}
                {secondaryAction.label}
              </button>
            )}

            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                style={{
                  height: '38px',
                  padding: '0 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0057B8',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(0, 87, 184, 0.25)',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#003F88'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#0057B8'}
              >
                {primaryAction.icon && React.createElement(primaryAction.icon, { size: 16 })}
                {primaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

