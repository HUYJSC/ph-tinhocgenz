import React from 'react';

const pulseKeyframes = `
@keyframes shimmerPulse {
  0% { opacity: 0.6; background-color: #E2E8F0; }
  50% { opacity: 0.3; background-color: #F1F5F9; }
  100% { opacity: 0.6; background-color: #E2E8F0; }
}
`;

export const SkeletonBox: React.FC<{
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
}> = ({ width = '100%', height = '16px', borderRadius = '6px', style }) => {
  return (
    <>
      <style>{pulseKeyframes}</style>
      <div
        style={{
          width,
          height,
          borderRadius,
          animation: 'shimmerPulse 1.5s ease-in-out infinite',
          ...style
        }}
      />
    </>
  );
};

export const SkeletonKPI: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`,
      gap: '16px',
      width: '100%'
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '16px',
            height: '110px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SkeletonBox width="60%" height="14px" />
            <SkeletonBox width="28px" height="28px" borderRadius="8px" />
          </div>
          <SkeletonBox width="45%" height="24px" />
          <SkeletonBox width="30%" height="12px" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: '12px', paddingBottom: '8px', borderBottom: '1px solid #E2E8F0' }}>
        {Array.from({ length: cols }).map((_, c) => (
          <SkeletonBox key={c} width={`${100 / cols}%`} height="18px" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonBox key={c} width={`${100 / cols}%`} height="15px" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ height?: string }> = ({ height = '180px' }) => {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '12px',
      padding: '20px',
      height,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      <SkeletonBox width="40%" height="20px" />
      <SkeletonBox width="80%" height="14px" />
      <SkeletonBox width="100%" height="60px" borderRadius="8px" />
    </div>
  );
};
