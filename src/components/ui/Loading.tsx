import React from 'react';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullscreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  fullscreen = false
}) => {
  const getSpinnerSize = () => {
    switch (size) {
      case 'sm': return 18;
      case 'lg': return 40;
      case 'md':
      default: return 28;
    }
  };

  const px = getSpinnerSize();

  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
      <div
        style={{
          width: `${px}px`,
          height: `${px}px`,
          border: '3px solid #E2E8F0',
          borderTopColor: '#0057B8',
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite'
        }}
      />
      {text && (
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(244, 248, 253, 0.85)',
        backdropFilter: 'blur(2px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {spinner}
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      {spinner}
    </div>
  );
};
