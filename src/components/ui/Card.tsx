import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'flat' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  variant = 'default',
  padding = 'md',
  style,
  className = '',
  ...props
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'none': return '0';
      case 'sm': return '12px 16px';
      case 'lg': return '24px 28px';
      case 'md':
      default: return '18px 20px';
    }
  };

  const getShadow = () => {
    switch (variant) {
      case 'flat': return 'none';
      case 'elevated': return '0 10px 25px -5px rgba(11, 37, 69, 0.08), 0 8px 10px -6px rgba(11, 37, 69, 0.04)';
      case 'default':
      default: return '0 1px 3px rgba(11, 37, 69, 0.04), 0 1px 2px rgba(11, 37, 69, 0.02)';
    }
  };

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        boxShadow: getShadow(),
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        ...style
      }}
      className={`tinhocgenz-card ${className}`}
      {...props}
    >
      {header && (
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FAFCFF'
        }}>
          {header}
        </div>
      )}
      <div style={{ padding: getPadding(), flex: 1 }}>
        {children}
      </div>
      {footer && (
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #F1F5F9',
          background: '#F8FAFC'
        }}>
          {footer}
        </div>
      )}
    </div>
  );
};
