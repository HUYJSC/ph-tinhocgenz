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
    { id: 'quizzes', label: 'Trắc nghiệm', icon: BookOpen },
    { id: 'assignments', label: 'Đề tài liệu', icon: FileText },
    { id: 'flashcards', label: 'Flashcard', icon: Layers },
    { id: 'analytics', label: 'Tiến độ', icon: BarChart2 },
    { id: 'bookmarks', label: 'Đã lưu', icon: BookmarkCheck, count: bookmarkCount }
  ];

  const adminTabs: BottomNavItem[] = [
    { id: 'admin', label: 'Quản trị', icon: Shield },
    { id: 'assignments', label: 'Giao đề', icon: FileText, count: unreadNotificationCount },
    { id: 'quizzes', label: 'Đề thi', icon: BookOpen },
    { id: 'creator', label: 'Tạo đề', icon: PlusCircle }
  ];

  const tabs: BottomNavItem[] = isAdmin ? adminTabs : studentTabs;

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    soundFx.playClick();
  };

  return (
    <nav className="mobile-nav">
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
              gap: '4px',
              height: '100%',
              background: 'transparent',
              border: 'none',
              color: isActive ? (tab.id === 'admin' ? '#d97706' : 'var(--accent-primary)') : 'var(--text-muted)',
              cursor: 'pointer',
              position: 'relative',
              padding: '6px 0'
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-8px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: 'var(--danger)',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {tab.count}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: isActive ? 700 : 500 }}>
              {tab.label}
            </span>
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '24px',
                  height: '3px',
                  borderRadius: '0 0 4px 4px',
                  background: tab.id === 'admin' ? '#d97706' : 'var(--accent-primary)'
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
