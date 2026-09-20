import React from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title = 'Chưa có dữ liệu',
  description = 'Hiện tại chưa có mục nào trong danh sách này.',
  actionLabel,
  onAction,
  style
}) => {
  return (
    <div style={{
      padding: '48px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: '12px',
      width: '100%',
      boxSizing: 'border-box',
      ...style
    }}>
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '12px',
        background: '#F1F5F9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94A3B8'
      }}>
        <Icon size={26} />
      </div>

      <h4 style={{
        fontSize: '15px',
        fontWeight: 700,
        color: '#0F172A',
        margin: 0
      }}>
        {title}
      </h4>

      <p style={{
        fontSize: '13px',
        color: '#64748B',
        maxWidth: '380px',
        margin: 0,
        lineHeight: 1.5
      }}>
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: '8px',
            padding: '8px 18px',
            background: '#0057B8',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#004494')}
          onMouseLeave={e => (e.currentTarget.style.background = '#0057B8')}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
