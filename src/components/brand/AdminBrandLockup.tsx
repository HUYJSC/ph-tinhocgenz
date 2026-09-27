import React from 'react';
import { GraduationCap } from 'lucide-react';

export interface AdminBrandLockupProps {
  collapsed?: boolean;
  size?: number;
  className?: string;
}

/**
 * Compact admin identity used by both admin shells. It intentionally stays
 * separate from the public PH Digital Education wordmark so the admin portal
 * has a clear product identity at a glance.
 */
export const AdminBrandLockup: React.FC<AdminBrandLockupProps> = ({
  collapsed = false,
  size = 40,
  className = ''
}) => {
  const iconSize = Math.max(18, Math.round(size * 0.52));

  return (
    <div
      className={`admin-brand-lockup ${className}`}
      aria-label="PH Education LMS — Cổng Quản Trị Học Vụ"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: '10px',
        minWidth: 0,
        userSelect: 'none'
      }}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '11px',
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          flexShrink: 0,
          boxShadow: '0 5px 16px rgba(37, 99, 235, 0.35)'
        }}
      >
        <GraduationCap size={iconSize} strokeWidth={2.1} />
      </div>

      {!collapsed && (
        <div style={{ minWidth: 0, lineHeight: 1.15 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 800,
              letterSpacing: '0.015em'
            }}>
              PH EDUCATION
            </span>
            <span style={{
              color: '#38BDF8',
              border: '1px solid rgba(56, 189, 248, 0.55)',
              background: 'rgba(56, 189, 248, 0.12)',
              borderRadius: '4px',
              padding: '2px 5px',
              fontSize: '9px',
              fontWeight: 800,
              lineHeight: 1
            }}>
              LMS
            </span>
          </div>
          <div style={{
            color: '#94A3B8',
            fontSize: '10.5px',
            fontWeight: 600,
            marginTop: '4px',
            whiteSpace: 'nowrap'
          }}>
            Cổng Quản Trị Học Vụ
          </div>
        </div>
      )}
    </div>
  );
};

