import React from 'react';
import { Home, GitBranch, Play, Bot, User } from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { soundFx } from '../../utils/audio';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAITutor: () => void;
  onOpenProfile: () => void;
  onContinueLearning: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAITutor,
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
        height: 'calc(58px + var(--safe-bottom))',
        paddingBottom: 'var(--safe-bottom)',
        paddingLeft: 'max(8px, var(--safe-left))',
        paddingRight: 'max(8px, var(--safe-right))',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(24px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
        borderTop: '1px solid var(--border-color)',
        zIndex: 90,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
        justifyContent: 'space-around',
        alignItems: 'center',
        userSelect: 'none'
      }}
    >
      {/* 1. Home */}
      <button
        onClick={() => {
          handleVibrate();
          setActiveTab('dashboard');
        }}
        style={navBtnStyle}
      >
        <Home
          size={20}
          color={activeTab === 'dashboard' ? 'var(--brand)' : 'var(--text-muted)'}
          strokeWidth={activeTab === 'dashboard' ? 2.5 : 2}
        />
        <span
          style={{
            fontSize: '11px',
            fontWeight: activeTab === 'dashboard' ? 700 : 500,
            color: activeTab === 'dashboard' ? 'var(--brand)' : 'var(--text-muted)'
          }}
        >
          Home
        </span>
      </button>

      {/* 2. Learn */}
      <button
        onClick={() => {
          handleVibrate();
          setActiveTab('learning_path');
        }}
        style={navBtnStyle}
      >
        <GitBranch
          size={20}
          color={activeTab === 'learning_path' ? 'var(--brand)' : 'var(--text-muted)'}
          strokeWidth={activeTab === 'learning_path' ? 2.5 : 2}
        />
        <span
          style={{
            fontSize: '11px',
            fontWeight: activeTab === 'learning_path' ? 700 : 500,
            color: activeTab === 'learning_path' ? 'var(--brand)' : 'var(--text-muted)'
          }}
        >
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
          marginTop: '-12px'
        }}
        title="Tiếp tục học"
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--brand) 0%, #3b82f6 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(79, 110, 247, 0.4)',
            transform: 'scale(1.05)'
          }}
        >
          <Play size={18} fill="#fff" style={{ marginLeft: '2px' }} />
        </div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--brand)',
            marginTop: '2px'
          }}
        >
          Continue
        </span>
      </button>

      {/* 4. AI */}
      <button
        onClick={() => {
          handleVibrate();
          onOpenAITutor();
        }}
        style={navBtnStyle}
      >
        <Bot size={20} color="var(--purple-ai)" strokeWidth={2} />
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--purple-ai)'
          }}
        >
          AI
        </span>
      </button>

      {/* 5. Profile */}
      <button
        onClick={() => {
          handleVibrate();
          onOpenProfile();
        }}
        style={navBtnStyle}
      >
        <User size={20} color="var(--text-muted)" strokeWidth={2} />
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--text-muted)'
          }}
        >
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
