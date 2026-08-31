import React, { useState } from 'react';
import { Flame, Bell, FileText, MessageSquare, BookOpen, School, Award, Bot, ChevronDown } from 'lucide-react';
import { UserProfile } from '../../types/auth';
import { UserDropdown } from './UserDropdown';
import { soundFx } from '../../utils/audio';

import { ActiveTab } from './Sidebar';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  streak: number;
  totalPoints: number;
  currentUser: UserProfile;
  activeSection?: 'learn' | 'review' | 'exam' | 'progress';
  activeTab?: ActiveTab;
  setActiveTab?: (tab: ActiveTab) => void;
  isAdmin?: boolean;
  unreadNotificationCount?: number;
  onLogout: () => void;
  onOpenNotifications?: () => void;
  onOpenProfileModal: () => void;
  onOpenChangePassword?: () => void;
  onOpenInstallModal: () => void;
  onOpenNotices?: () => void;
  onOpenFeedback?: () => void;
  onOpenAITutor?: () => void;
}

// ── Unified Hub Definitions for Student View ──
const HUB_LEARN_TABS: ActiveTab[] = ['dashboard', 'learning_path', 'quizzes', 'practice_skill', 'flashcards', 'smart_review', 'bookmarks'];
const HUB_CLASS_TABS: ActiveTab[] = ['attendance', 'schedule', 'assignments'];


type HubId = 'hub_learn' | 'hub_class' | 'hub_cred';

function getActiveHub(tab: ActiveTab): HubId {
  if (HUB_LEARN_TABS.includes(tab)) return 'hub_learn';
  if (HUB_CLASS_TABS.includes(tab)) return 'hub_class';
  return 'hub_cred';
}

const HUB_DEFS: { id: HubId; label: string; icon: React.ReactNode; defaultTab: ActiveTab; subItems: { id: ActiveTab; label: string }[] }[] = [
  {
    id: 'hub_learn',
    label: '📚 Học & Luyện tập',
    icon: <BookOpen size={15} />,
    defaultTab: 'dashboard',
    subItems: [
      { id: 'dashboard',      label: 'Tổng quan học tập' },
      { id: 'learning_path',  label: 'Lộ trình cá nhân hóa' },
      { id: 'quizzes',        label: 'Ngân hàng đề thi MOS/IC3' },
      { id: 'practice_skill', label: 'Luyện tập theo kỹ năng' },
      { id: 'flashcards',     label: 'Thẻ ghi nhớ kiến thức' },
      { id: 'smart_review',   label: 'Ôn câu sai Spaced Repetition' },
      { id: 'bookmarks',      label: 'Câu hỏi đã đánh dấu' },
    ]
  },
  {
    id: 'hub_class',
    label: '🏫 Lớp học',
    icon: <School size={15} />,
    defaultTab: 'attendance',
    subItems: [
      { id: 'attendance',  label: 'Điểm danh & Quét QR' },
      { id: 'schedule',    label: 'Thời khóa biểu lớp' },
      { id: 'assignments', label: 'Bài tập & Nộp bài' },
    ]
  },
  {
    id: 'hub_cred',
    label: '🎖️ Chứng nhận',
    icon: <Award size={15} />,
    defaultTab: 'analytics',
    subItems: [
      { id: 'analytics', label: 'Hồ sơ năng lực & Blockchain Certs' },
    ]
  }
];

export const Header: React.FC<HeaderProps> = ({
  theme,
  toggleTheme,
  streak,
  currentUser,
  activeTab = 'dashboard',
  setActiveTab,
  isAdmin = false,
  unreadNotificationCount = 0,
  onLogout,
  onOpenNotifications,
  onOpenProfileModal,
  onOpenChangePassword,
  onOpenInstallModal,
  onOpenNotices,
  onOpenFeedback,
  onOpenAITutor,
}) => {
  const [openHub, setOpenHub] = useState<HubId | null>(null);
  const activeHub = getActiveHub(activeTab);

  const handleSelectTab = (tabId: ActiveTab) => {
    soundFx.playClick();
    if (setActiveTab) setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setOpenHub(null);
  };

  const handleHubClick = (hub: typeof HUB_DEFS[0]) => {
    soundFx.playClick();
    if (openHub === hub.id) {
      setOpenHub(null);
    } else if (hub.subItems.length === 1) {
      handleSelectTab(hub.subItems[0].id);
    } else {
      setOpenHub(openHub === hub.id ? null : hub.id);
    }
  };

  return (
    <header
      className="app-header"
      style={{
        height: 'auto',
        minHeight: 'var(--header-height)',
        padding: '0 20px',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      {/* ── TOP ROW: Logo | HubNav | Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '52px', width: '100%' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
          <div style={{ height: '38px', maxWidth: '220px', display: 'flex', alignItems: 'center' }}>
            <img src="/logo-horizontal.png" alt="PH DIGITAL EDUCATION" style={{ height: '100%', width: 'auto', objectFit: 'contain' }} />
          </div>

          {/* ── HUB NAVIGATION (Desktop) ── */}
          <nav className="hide-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
            {HUB_DEFS.map(hub => {
              const isHubActive = activeHub === hub.id;
              const isOpen = openHub === hub.id;
              return (
                <div key={hub.id} style={{ position: 'relative' }}>
                  <button
                    onClick={() => handleHubClick(hub)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '6px 13px', borderRadius: '8px',
                      background: isHubActive ? 'rgba(37,99,235,0.08)' : 'transparent',
                      border: isHubActive ? '1px solid rgba(37,99,235,0.18)' : '1px solid transparent',
                      color: isHubActive ? '#2563EB' : 'var(--text-secondary)',
                      fontSize: '13px', fontWeight: isHubActive ? 700 : 500,
                      cursor: 'pointer', transition: 'all 0.15s ease', whiteSpace: 'nowrap'
                    }}
                  >
                    {hub.label}
                    {hub.subItems.length > 1 && <ChevronDown size={12} style={{ transition: 'transform 0.15s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />}
                  </button>
                  {/* Sub-dropdown */}
                  {isOpen && hub.subItems.length > 1 && (
                    <div
                      style={{
                        position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                        borderRadius: '12px', padding: '6px', minWidth: '220px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200,
                        display: 'flex', flexDirection: 'column', gap: '2px'
                      }}
                    >
                      {hub.subItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleSelectTab(item.id)}
                          style={{
                            padding: '8px 12px', borderRadius: '8px', border: 'none', textAlign: 'left',
                            background: activeTab === item.id ? 'rgba(37,99,235,0.08)' : 'transparent',
                            color: activeTab === item.id ? '#2563EB' : 'var(--text-primary)',
                            fontSize: '13px', fontWeight: activeTab === item.id ? 700 : 400,
                            cursor: 'pointer', transition: 'background 0.1s'
                          }}
                          onMouseEnter={e => { if (activeTab !== item.id) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                          onMouseLeave={e => { if (activeTab !== item.id) e.currentTarget.style.background = 'transparent'; }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* ── RIGHT CONTROLS ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Streak */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--warning)', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }} title="Chuỗi ngày học liên tục">
            <Flame size={13} fill="#f59e0b" color="#d97706" />
            <span>{streak || 1}</span>
          </div>

          {/* AI Tutor Quick Access */}
          {onOpenAITutor && (
            <button onClick={() => { soundFx.playClick(); onOpenAITutor(); }} title="Trợ lý học vụ AI" className="btn btn-icon hide-sm" style={{ width: '32px', height: '32px', minHeight: '32px', color: '#7C3AED' }}>
              <Bot size={15} />
            </button>
          )}

          {/* Notices */}
          {onOpenNotices && (
            <button onClick={() => { soundFx.playClick(); onOpenNotices?.(); }} title="Bảng tin thông báo" className="btn btn-icon" style={{ width: '32px', height: '32px', minHeight: '32px', color: 'var(--brand)' }}>
              <FileText size={15} />
            </button>
          )}

          {/* Notifications */}
          {onOpenNotifications && (
            <button onClick={() => { soundFx.playClick(); onOpenNotifications?.(); }} title="Thông báo bài nộp" className="btn btn-icon" style={{ width: '34px', height: '34px', minHeight: '34px', position: 'relative', color: unreadNotificationCount > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
              <Bell size={15} />
              {unreadNotificationCount > 0 && (
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--danger)', color: '#fff', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          )}

          {/* Feedback */}
          {onOpenFeedback && (
            <button onClick={() => { soundFx.playClick(); onOpenFeedback?.(); }} title="Góp ý & Hỗ trợ" className="btn btn-icon hide-sm" style={{ width: '32px', height: '32px', minHeight: '32px', color: 'var(--text-secondary)' }}>
              <MessageSquare size={15} />
            </button>
          )}

          {/* User Dropdown */}
          <UserDropdown currentUser={currentUser} theme={theme} toggleTheme={toggleTheme} onOpenProfile={onOpenProfileModal} onOpenChangePassword={onOpenChangePassword} onOpenInstallPWA={onOpenInstallModal} onLogout={onLogout} isAdmin={isAdmin} />
        </div>
      </div>

      {/* ── MOBILE BOTTOM SECONDARY SUB-NAV (3 Hub Pills) ── */}
      <div className="show-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 0 8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {HUB_DEFS.map(hub => {
          const isHubActive = activeHub === hub.id;
          return (
            <button
              key={hub.id}
              onClick={() => { soundFx.playClick(); handleSelectTab(hub.defaultTab); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '5px 12px', borderRadius: '999px', whiteSpace: 'nowrap',
                background: isHubActive ? '#2563EB' : 'var(--bg-secondary)',
                border: 'none', color: isHubActive ? '#fff' : 'var(--text-secondary)',
                fontSize: '12px', fontWeight: isHubActive ? 700 : 500, cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {hub.label}
            </button>
          );
        })}
      </div>

      {/* Backdrop for closing dropdowns */}
      {openHub && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={() => setOpenHub(null)} />
      )}
    </header>
  );
};
