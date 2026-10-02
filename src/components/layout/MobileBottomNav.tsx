import React from 'react';
import { Home, BookOpen, Bot, Bell, User } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { triggerHapticFeedback } from '../../utils/mobilePlatform';

export interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab?: (tabId: string) => void;
  onNavigateTab?: (newTab: string) => void;
  isStaff?: boolean;
  onOpenProfile?: () => void;
  onOpenAITutor?: () => void;
  onOpenNotifications?: () => void;
  onNavigateLearn?: () => void;
  onNavigateClass?: () => void;
  onNavigateCreds?: () => void;
  onContinueLearning?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onNavigateTab,
  onOpenProfile,
  onOpenAITutor,
  onOpenNotifications
}) => {
  // Canonical 5-item Mobile Navigation according to Phase 11 LMS Standard:
  // Home | Courses | AI (Center) | Notification | Profile
  const navItems = [
    { id: 'dashboard', label: 'Trang chủ', icon: Home },
    { id: 'courses', label: 'Khóa học', icon: BookOpen },
    { id: 'ai_tutor', label: 'Trợ lý AI', icon: Bot, isCenter: true },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'profile', label: 'Cá nhân', icon: User }
  ];

  const handleItemClick = (id: string, isCenter?: boolean) => {
    soundFx.playClick();
    triggerHapticFeedback(isCenter ? 'medium' : 'light');

    if (id === 'profile' && onOpenProfile) {
      onOpenProfile();
      return;
    }
    if (id === 'ai_tutor' && onOpenAITutor) {
      onOpenAITutor();
      return;
    }
    if (id === 'notifications' && onOpenNotifications) {
      onOpenNotifications();
      return;
    }

    if (onSelectTab) {
      onSelectTab(id);
    } else if (onNavigateTab) {
      onNavigateTab(id);
    }
  };

  return (
    <>
      <nav
        className="mobile-bottom-nav safe-bottom"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '62px',
          background: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 900,
          boxShadow: '0 -2px 10px rgba(15, 23, 42, 0.06)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'dashboard' && activeTab === 'home');

          if (item.isCenter) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id, true)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                  marginTop: '-18px'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#0057B8',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(0, 87, 184, 0.4)',
                  border: '3px solid #FFFFFF'
                }}>
                  <Icon size={22} />
                </div>
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: isActive ? '#0057B8' : '#64748B'
                }}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item.id, false)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                flex: 1,
                height: '100%',
                color: isActive ? '#0057B8' : '#64748B',
                transition: 'color 0.15s ease'
              }}
            >
              <Icon size={19} color={isActive ? '#0057B8' : '#64748B'} />
              <span style={{
                fontSize: '11px',
                fontWeight: isActive ? 700 : 500
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <style>{`
        @media (min-width: 768px) {
          .mobile-bottom-nav {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          main {
            padding-bottom: 72px !important;
          }
        }
      `}</style>
    </>
  );
};

