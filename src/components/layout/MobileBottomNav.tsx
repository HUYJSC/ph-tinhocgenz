import React from 'react';
import {
  Home,
  Map,
  Brain,
  FileText,
  User,
  LayoutDashboard,
  Calendar,
  CheckSquare,
  QrCode
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { ActiveTab } from './Sidebar';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  isStaff?: boolean;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenProfile?: () => void;
  // Giữ lại props cũ để tương thích hoàn toàn
  onNavigateLearn?: () => void;
  onNavigateClass?: () => void;
  onNavigateCreds?: () => void;
  onContinueLearning?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  isStaff = false,
  onNavigateTab,
  onOpenProfile,
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

  const handleClick = (tab: ActiveTab, action?: () => void) => {
    handleVibrate();
    if (action) {
      action();
    } else {
      onNavigateTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      className="mobile-nav"
      aria-label="Điều hướng chính di động"
      style={{
        display: 'none',
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        height: 'calc(64px + var(--safe-bottom, 0px))',
        paddingBottom: 'var(--safe-bottom, 0px)',
        paddingLeft: 'max(8px, var(--safe-left, 0px))',
        paddingRight: 'max(8px, var(--safe-right, 0px))',
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(20px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
        borderTop: '1px solid #E2E8F0',
        zIndex: 90,
        boxShadow: '0 -4px 20px rgba(15, 23, 42, 0.08)',
        justifyContent: 'space-around',
        alignItems: 'center',
        userSelect: 'none'
      }}
    >
      {isStaff ? (
        // ── 5 TABS GIẢNG VIÊN ──
        <>
          {/* 1. Tổng quan */}
          <button
            onClick={() => handleClick('dashboard')}
            style={getBtnStyle(activeTab === 'dashboard')}
            aria-label="Tổng quan giảng dạy"
          >
            <LayoutDashboard size={21} color={activeTab === 'dashboard' ? '#2563EB' : '#64748B'} />
            <span style={getLabelStyle(activeTab === 'dashboard')}>Tổng quan</span>
            {activeTab === 'dashboard' && <ActiveDot />}
          </button>

          {/* 2. Ca dạy */}
          <button
            onClick={() => handleClick('schedule')}
            style={getBtnStyle(activeTab === 'schedule')}
            aria-label="Lịch dạy và ca học"
          >
            <Calendar size={21} color={activeTab === 'schedule' ? '#2563EB' : '#64748B'} />
            <span style={getLabelStyle(activeTab === 'schedule')}>Ca dạy</span>
            {activeTab === 'schedule' && <ActiveDot />}
          </button>

          {/* 3. Bài nộp */}
          <button
            onClick={() => handleClick('assignments')}
            style={getBtnStyle(activeTab === 'assignments')}
            aria-label="Chấm điểm bài nộp"
          >
            <CheckSquare size={21} color={activeTab === 'assignments' ? '#2563EB' : '#64748B'} />
            <span style={getLabelStyle(activeTab === 'assignments')}>Bài nộp</span>
            {activeTab === 'assignments' && <ActiveDot />}
          </button>

          {/* 4. Điểm danh */}
          <button
            onClick={() => handleClick('attendance')}
            style={getBtnStyle(activeTab === 'attendance')}
            aria-label="Điểm danh và QR checkin"
          >
            <QrCode size={21} color={activeTab === 'attendance' ? '#2563EB' : '#64748B'} />
            <span style={getLabelStyle(activeTab === 'attendance')}>Điểm danh</span>
            {activeTab === 'attendance' && <ActiveDot />}
          </button>

          {/* 5. Cá nhân */}
          <button
            onClick={() => { handleVibrate(); onOpenProfile ? onOpenProfile() : handleClick('analytics'); }}
            style={getBtnStyle(false)}
            aria-label="Tài khoản cá nhân"
          >
            <User size={21} color="#64748B" />
            <span style={getLabelStyle(false)}>Cá nhân</span>
          </button>
        </>
      ) : (
        // ── 5 TABS HỌC VIÊN ──
        <>
          {/* 1. Trang chủ */}
          <button
            onClick={() => handleClick('dashboard', onNavigateLearn)}
            style={getBtnStyle(activeTab === 'dashboard')}
            aria-label="Trang chủ học tập"
          >
            <Home size={21} color={activeTab === 'dashboard' ? '#2563EB' : '#64748B'} />
            <span style={getLabelStyle(activeTab === 'dashboard')}>Trang chủ</span>
            {activeTab === 'dashboard' && <ActiveDot />}
          </button>

          {/* 2. Lộ trình */}
          <button
            onClick={() => handleClick('learning_path')}
            style={getBtnStyle(activeTab === 'learning_path')}
            aria-label="Lộ trình học"
          >
            <Map size={21} color={activeTab === 'learning_path' ? '#2563EB' : '#64748B'} />
            <span style={getLabelStyle(activeTab === 'learning_path')}>Lộ trình</span>
            {activeTab === 'learning_path' && <ActiveDot />}
          </button>

          {/* 3. Luyện tập */}
          <button
            onClick={() => handleClick('practice_skill', onContinueLearning)}
            style={getBtnStyle(activeTab === 'practice_skill' || activeTab === 'quizzes')}
            aria-label="Luyện tập trắc nghiệm và kỹ năng"
          >
            <Brain size={21} color={activeTab === 'practice_skill' || activeTab === 'quizzes' ? '#2563EB' : '#64748B'} />
            <span style={getLabelStyle(activeTab === 'practice_skill' || activeTab === 'quizzes')}>Luyện tập</span>
            {(activeTab === 'practice_skill' || activeTab === 'quizzes') && <ActiveDot />}
          </button>

          {/* 4. Bài tập */}
          <button
            onClick={() => handleClick('assignments', onNavigateClass)}
            style={getBtnStyle(activeTab === 'assignments' || activeTab === 'attendance')}
            aria-label="Bài tập thực hành và lớp học"
          >
            <FileText size={21} color={activeTab === 'assignments' || activeTab === 'attendance' ? '#2563EB' : '#64748B'} />
            <span style={getLabelStyle(activeTab === 'assignments' || activeTab === 'attendance')}>Bài tập</span>
            {(activeTab === 'assignments' || activeTab === 'attendance') && <ActiveDot />}
          </button>

          {/* 5. Cá nhân */}
          <button
            onClick={() => { handleVibrate(); onOpenProfile ? onOpenProfile() : handleClick('analytics', onNavigateCreds); }}
            style={getBtnStyle(activeTab === 'analytics')}
            aria-label="Hồ sơ cá nhân và chứng nhận"
          >
            <User size={21} color={activeTab === 'analytics' ? '#2563EB' : '#64748B'} />
            <span style={getLabelStyle(activeTab === 'analytics')}>Cá nhân</span>
            {activeTab === 'analytics' && <ActiveDot />}
          </button>
        </>
      )}
    </nav>
  );
};

const ActiveDot: React.FC = () => (
  <span
    style={{
      position: 'absolute',
      bottom: '6px',
      width: '5px',
      height: '5px',
      borderRadius: '50%',
      background: '#2563EB'
    }}
  />
);

const getBtnStyle = (_isActive: boolean): React.CSSProperties => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  height: '100%',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '6px 2px',
  outline: 'none',
  minHeight: '48px',
  minWidth: '48px',
  position: 'relative',
  transition: 'transform 0.15s ease'
});

const getLabelStyle = (isActive: boolean): React.CSSProperties => ({
  fontSize: '11px',
  fontWeight: isActive ? 700 : 500,
  color: isActive ? '#2563EB' : '#64748B',
  letterSpacing: '-0.01em',
  lineHeight: 1.2
});
