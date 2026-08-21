import React from 'react';
import { BookOpen, Layers, BarChart2, Shield, FileText, QrCode } from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  bookmarkCount?: number;
  unreadNotificationCount?: number;
  isAdmin?: boolean;
}

interface BottomNavItem {
  id: ActiveTab;
  label: string;
  icon: any;
  accentColor: string;
  count?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  unreadNotificationCount = 0,
  isAdmin = false
}) => {
  const studentTabs: BottomNavItem[] = [
    { id: 'quizzes',     label: 'Luyện Đề',   icon: BookOpen,      accentColor: '#4f6ef7' },
    { id: 'assignments', label: 'Bài Thi',    icon: FileText,      accentColor: '#10b981' },
    { id: 'attendance',  label: 'Điểm Danh',  icon: QrCode,        accentColor: '#06b6d4' },
    { id: 'flashcards',  label: 'Ghi Nhớ',    icon: Layers,        accentColor: '#f59e0b' },
    { id: 'analytics',   label: 'Tiến Độ',    icon: BarChart2,     accentColor: '#8b5cf6' }
  ];

  const adminTabs: BottomNavItem[] = [
    { id: 'admin',       label: 'Quản Trị',   icon: Shield,        accentColor: '#d97706' },
    { id: 'attendance',  label: 'Điểm Danh',  icon: QrCode,        accentColor: '#06b6d4' },
    { id: 'assignments', label: 'Chấm Điểm',  icon: FileText,      accentColor: '#10b981', count: unreadNotificationCount },
    { id: 'quizzes',     label: 'Kho Đề',     icon: BookOpen,      accentColor: '#4f6ef7' },
    { id: 'flashcards',  label: 'Ghi Nhớ',    icon: Layers,        accentColor: '#f59e0b' }
  ];

  const tabs: BottomNavItem[] = isAdmin ? adminTabs : studentTabs;

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
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
        paddingLeft: 'max(6px, var(--safe-left))',
        paddingRight: 'max(6px, var(--safe-right))',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(24px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
        borderTop: '1px solid var(--border-color)',
        zIndex: 90,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.06)',
        justifyContent: 'space-around',
        alignItems: 'center',
        userSelect: 'none'
      }}
    >
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id as ActiveTab)}
            style={{
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
              position: 'relative',
              padding: '4px 2px',
              transition: 'all 0.15s ease',
              outline: 'none',
              minHeight: '44px'
            }}
          >
            {/* Top Indicator Glow Bar */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '28px',
                  height: '3px',
                  borderRadius: '0 0 3px 3px',
                  background: tab.accentColor,
                  boxShadow: `0 2px 8px ${tab.accentColor}`
                }}
              />
            )}

            {/* Icon Box with Active Capsule */}
            <div
              style={{
                position: 'relative',
                width: '32px',
                height: '26px',
                borderRadius: '8px',
                background: isActive ? `${tab.accentColor}16` : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isActive ? 'scale(1.06)' : 'scale(1)'
              }}
            >
              <Icon
                size={18}
                color={isActive ? tab.accentColor : 'var(--text-muted)'}
                strokeWidth={isActive ? 2.5 : 2}
              />

              {/* Notification Badge */}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-4px',
                    minWidth: '14px',
                    height: '14px',
                    padding: '0 3px',
                    borderRadius: 'var(--radius-full)',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.58rem',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  {tab.count}
                </span>
              )}
            </div>

            {/* Tab Label */}
            <span
              style={{
                fontSize: '0.66rem',
                fontWeight: isActive ? 800 : 500,
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                letterSpacing: '-0.01em',
                lineHeight: 1
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
