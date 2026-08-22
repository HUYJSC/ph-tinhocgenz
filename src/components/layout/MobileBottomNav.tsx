import React from 'react';
import { Home, BookOpen, Play, User } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface MobileBottomNavProps {
  onScrollToTop: () => void;
  onScrollToLearn: () => void;
  onOpenProfile: () => void;
  onContinueLearning: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onScrollToTop,
  onScrollToLearn,
  onOpenProfile,
  onContinueLearning
}) => {
  const handleVibrate = () => {
    soundFx.playClick();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(8); } catch (e) {}
    }
  };

  return (
    <nav
      className="mobile-nav"
      style={{
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(56px + var(--safe-bottom))',
        paddingBottom: 'var(--safe-bottom)',
        paddingLeft: 'max(8px, var(--safe-left))',
        paddingRight: 'max(8px, var(--safe-right))',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(24px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
        borderTop: '1px solid var(--border-color)',
        zIndex: 90,
        boxShadow: '0 -2px 12px rgba(0, 0, 0, 0.06)',
        justifyContent: 'space-around',
        alignItems: 'center',
        userSelect: 'none'
      }}
    >
      {/* 1. Home */}
      <button
        onClick={() => {
          handleVibrate();
          onScrollToTop();
        }}
        style={navBtnStyle}
      >
        <Home size={19} color="var(--brand)" />
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brand)' }}>
          Home
        </span>
      </button>

      {/* 2. Learn */}
      <button
        onClick={() => {
          handleVibrate();
          onScrollToLearn();
        }}
        style={navBtnStyle}
      >
        <BookOpen size={19} color="var(--text-secondary)" />
        <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)' }}>
          Learn
        </span>
      </button>

      {/* 3. Continue (Prominent Center Pill) */}
      <button
        onClick={() => {
          handleVibrate();
          onContinueLearning();
        }}
        style={{
          ...navBtnStyle,
          marginTop: '-10px'
        }}
        title="Tiếp tục học"
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--brand)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(79, 110, 247, 0.35)'
          }}
        >
          <Play size={16} fill="#fff" style={{ marginLeft: '2px' }} />
        </div>
        <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--brand)', marginTop: '2px' }}>
          Continue
        </span>
      </button>

      {/* 4. Profile */}
      <button
        onClick={() => {
          handleVibrate();
          onOpenProfile();
        }}
        style={navBtnStyle}
      >
        <User size={19} color="var(--text-secondary)" />
        <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)' }}>
          Profile
        </span>
      </button>
    </nav>
  );
};

const navBtnStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2px',
  height: '100%',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '4px 2px',
  outline: 'none',
  minHeight: '44px'
};
