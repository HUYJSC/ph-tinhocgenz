import React from 'react';
import { BookOpen, School, Award, Play } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { ActiveTab } from './Sidebar';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onNavigateLearn: () => void;
  onNavigateClass: () => void;
  onNavigateCreds: () => void;
  onContinueLearning: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onNavigateLearn,
  onNavigateClass,
  onNavigateCreds,
  onContinueLearning
}) => {
  const handleVibrate = () => {
    soundFx.playClick();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(8); } catch (e) {}
    }
  };

  const HUB_LEARN_TABS: ActiveTab[] = ['dashboard', 'learning_path', 'quizzes', 'practice_skill', 'flashcards', 'smart_review', 'bookmarks'];
  const HUB_CLASS_TABS: ActiveTab[] = ['attendance', 'schedule', 'assignments'];
  const HUB_CRED_TABS: ActiveTab[] = ['analytics'];

  const isLearnActive = HUB_LEARN_TABS.includes(activeTab);
  const isClassActive = HUB_CLASS_TABS.includes(activeTab);
  const isCredActive  = HUB_CRED_TABS.includes(activeTab);

  return (
    <nav
      className="mobile-nav"
      style={{
        display: 'none',
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        height: 'calc(62px + var(--safe-bottom))',
        paddingBottom: 'var(--safe-bottom)',
        paddingLeft: 'max(8px, var(--safe-left))',
        paddingRight: 'max(8px, var(--safe-right))',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(24px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
        borderTop: '1px solid var(--border-color)',
        zIndex: 90,
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
        justifyContent: 'space-around',
        alignItems: 'center',
        userSelect: 'none'
      }}
    >
      {/* 1. Hub: Học & Luyện tập */}
      <button
        onClick={() => { handleVibrate(); onNavigateLearn(); }}
        style={{ ...navBtnStyle, color: isLearnActive ? 'var(--brand)' : 'var(--text-muted)' }}
      >
        <BookOpen size={20} color={isLearnActive ? 'var(--brand)' : 'var(--text-muted)'} />
        <span style={{ fontSize: '10px', fontWeight: isLearnActive ? 700 : 500 }}>Học tập</span>
        {isLearnActive && <ActiveDot />}
      </button>

      {/* 2. Center: Continue Learning CTA */}
      <button
        onClick={() => { handleVibrate(); onContinueLearning(); }}
        style={{ ...navBtnStyle, marginTop: '-14px' }}
        title="Tiếp tục học ngay"
      >
        <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand) 0%, #7C3AED 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(79,110,247,0.4)' }}>
          <Play size={18} fill="#fff" style={{ marginLeft: '2px' }} />
        </div>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--brand)', marginTop: '2px' }}>Học ngay</span>
      </button>

      {/* 3. Hub: Lớp học */}
      <button
        onClick={() => { handleVibrate(); onNavigateClass(); }}
        style={{ ...navBtnStyle, color: isClassActive ? '#059669' : 'var(--text-muted)' }}
      >
        <School size={20} color={isClassActive ? '#059669' : 'var(--text-muted)'} />
        <span style={{ fontSize: '10px', fontWeight: isClassActive ? 700 : 500 }}>Lớp học</span>
        {isClassActive && <ActiveDot color="#059669" />}
      </button>

      {/* 4. Hub: Chứng nhận */}
      <button
        onClick={() => { handleVibrate(); onNavigateCreds(); }}
        style={{ ...navBtnStyle, color: isCredActive ? '#d97706' : 'var(--text-muted)' }}
      >
        <Award size={20} color={isCredActive ? '#d97706' : 'var(--text-muted)'} />
        <span style={{ fontSize: '10px', fontWeight: isCredActive ? 700 : 500 }}>Chứng nhận</span>
        {isCredActive && <ActiveDot color="#d97706" />}
      </button>
    </nav>
  );
};

const ActiveDot: React.FC<{ color?: string }> = ({ color = 'var(--brand)' }) => (
  <span style={{ position: 'absolute', bottom: '6px', width: '4px', height: '4px', borderRadius: '50%', background: color }} />
);

const navBtnStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '3px',
  height: '100%',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '4px 2px',
  outline: 'none',
  minHeight: '44px',
  position: 'relative'
};
