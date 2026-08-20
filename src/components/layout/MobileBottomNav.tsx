import React from 'react';
import { BookOpen, Layers, BarChart2, PlusCircle, BookmarkCheck, Shield, FileText } from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { soundFx } from '../../utils/audio';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  bookmarkCount: number;
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
  bookmarkCount,
  unreadNotificationCount = 0,
  isAdmin = false
}) => {
  const studentTabs: BottomNavItem[] = [
    { id: 'quizzes', label: 'Trắc Nghiệm', icon: BookOpen, accentColor: '#2563eb' },
    { id: 'assignments', label: 'Đề Thi', icon: FileText, accentColor: '#10b981' },
    { id: 'flashcards', label: 'Flashcard', icon: Layers, accentColor: '#f59e0b' },
    { id: 'analytics', label: 'Tiến Độ', icon: BarChart2, accentColor: '#8b5cf6' },
    { id: 'bookmarks', label: 'Đã Lưu', icon: BookmarkCheck, accentColor: '#ec4899', count: bookmarkCount }
  ];

  const adminTabs: BottomNavItem[] = [
    { id: 'admin', label: 'Quản Trị', icon: Shield, accentColor: '#d97706' },
    { id: 'assignments', label: 'Giao Đề', icon: FileText, accentColor: '#10b981', count: unreadNotificationCount },
    { id: 'quizzes', label: 'Đề Thi', icon: BookOpen, accentColor: '#2563eb' },
    { id: 'creator', label: 'Tạo Đề', icon: PlusCircle, accentColor: '#06b6d4' },
    { id: 'flashcards', label: 'Flashcard', icon: Layers, accentColor: '#f59e0b' }
  ];

  const tabs: BottomNavItem[] = isAdmin ? adminTabs : studentTabs;

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    soundFx.playClick();
  };

  return (
    <nav
      className="mobile-nav"
      style={{
        display: 'none', // Controlled by CSS media query @media (max-width: 768px) { display: flex }
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '66px',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-color)',
        zIndex: 100,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
        padding: '0 8px'
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
              gap: '3px',
              height: '100%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              padding: '6px 2px',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
          >
            {/* Top Active Indicator Glow Bar */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '32px',
                  height: '3px',
                  borderRadius: '0 0 4px 4px',
                  background: tab.accentColor,
                  boxShadow: `0 2px 8px ${tab.accentColor}`
                }}
              />
            )}

            {/* Icon Box with Active Capsule */}
            <div
              style={{
                position: 'relative',
                width: '34px',
                height: '28px',
                borderRadius: '8px',
                background: isActive ? `${tab.accentColor}18` : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isActive ? 'scale(1.08)' : 'scale(1)'
              }}
            >
              <Icon
                size={19}
                color={isActive ? tab.accentColor : 'var(--text-muted)'}
                strokeWidth={isActive ? 2.5 : 2}
              />

              {/* Notification Badge */}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-5px',
                    minWidth: '15px',
                    height: '15px',
                    padding: '0 3px',
                    borderRadius: 'var(--radius-full)',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.62rem',
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

            {/* Micro Label */}
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? tab.accentColor : 'var(--text-muted)',
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
