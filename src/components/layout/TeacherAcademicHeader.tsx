import React, { useState } from 'react';
import { Bell, Bot, FileText, BookOpen, ClipboardList, Settings2, ChevronDown } from 'lucide-react';
import { UserProfile } from '../../types/auth';
import { UserDropdown } from './UserDropdown';
import { ActiveTab } from './Sidebar';
import { soundFx } from '../../utils/audio';

interface TeacherAcademicHeaderProps {
  currentUser: UserProfile;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  unreadNotificationCount?: number;
  onLogout: () => void;
  onOpenNotifications?: () => void;
  onOpenProfileModal: () => void;
  onOpenChangePassword?: () => void;
  onOpenInstallModal: () => void;
  onOpenAITutor?: () => void;
  onOpenNotices?: () => void;
}

// ── Teacher Hub Definitions (3 Hubs gom 6 tabs cũ lại) ──
type TeacherHubId = 'hub_teach' | 'hub_assess' | 'hub_admin';

const TEACHER_HUB_DEFS: {
  id: TeacherHubId;
  label: string;
  icon: React.ReactNode;
  defaultTab: ActiveTab;
  subItems: { id: ActiveTab; label: string }[];
}[] = [
  {
    id: 'hub_teach',
    label: '📊 Bàn làm việc',
    icon: <BookOpen size={14} />,
    defaultTab: 'dashboard',
    subItems: [
      { id: 'dashboard',  label: 'Tổng quan giảng dạy' },
      { id: 'attendance', label: 'Lớp học & Điểm danh QR' },
      { id: 'schedule',   label: 'Lịch giảng dạy theo tuần' },
    ]
  },
  {
    id: 'hub_assess',
    label: '📝 Khảo thí & Chấm điểm',
    icon: <ClipboardList size={14} />,
    defaultTab: 'assignments',
    subItems: [
      { id: 'assignments',   label: 'Quản lý & Chấm bài nộp' },
      { id: 'early_warning', label: 'Cảnh báo học vụ sớm' },
      { id: 'creator',       label: 'Soạn đề thi mới' },
    ]
  },
  {
    id: 'hub_admin',
    label: '⚙️ Quản trị & Blockchain',
    icon: <Settings2 size={14} />,
    defaultTab: 'admin',
    subItems: [
      { id: 'admin',   label: 'Quản trị Học vụ & Tài khoản' },
      { id: 'analytics', label: 'Sổ cái Blockchain Chứng chỉ' },
    ]
  }
];

function getTeacherActiveHub(tab: ActiveTab): TeacherHubId {
  for (const hub of TEACHER_HUB_DEFS) {
    if (hub.subItems.some(s => s.id === tab)) return hub.id;
  }
  return 'hub_teach';
}

export const TeacherAcademicHeader: React.FC<TeacherAcademicHeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  unreadNotificationCount = 0,
  onLogout,
  onOpenNotifications,
  onOpenProfileModal,
  onOpenChangePassword,
  onOpenInstallModal,
  onOpenAITutor,
  onOpenNotices
}) => {
  const [openHub, setOpenHub] = useState<TeacherHubId | null>(null);
  const activeHub = getTeacherActiveHub(activeTab);

  const handleSelectTab = (tabId: ActiveTab) => {
    soundFx.playClick();
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setOpenHub(null);
  };

  const handleHubClick = (hub: typeof TEACHER_HUB_DEFS[0]) => {
    soundFx.playClick();
    if (hub.subItems.length === 1) {
      handleSelectTab(hub.subItems[0].id);
    } else {
      setOpenHub(openHub === hub.id ? null : hub.id);
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#ffffff',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* ── TẦNG 1: THƯƠNG HIỆU & CONTROLS ── */}
      <div style={{ height: '52px', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9' }}>
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ height: '38px', maxWidth: '200px', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="PH DIGITAL EDUCATION" style={{ height: '100%', width: 'auto', objectFit: 'contain' }} />
          </div>
          <div style={{ height: '18px', width: '1px', background: '#E2E8F0' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', letterSpacing: '0.03em' }}>GIẢNG VIÊN / QUẢN TRỊ</span>
        </div>

        {/* Right: AI + Notices + Bell + User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* AI Assistant */}
          {onOpenAITutor && (
            <button
              onClick={() => { soundFx.playClick(); onOpenAITutor(); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '6px',
                background: 'linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 100%)',
                border: '1px solid #C4B5FD', color: '#6D28D9',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease'
              }}
              title="Mở Trợ lý học vụ AI"
            >
              <Bot size={14} color="#7C3AED" />
              <span>Trợ lý AI</span>
            </button>
          )}

          {/* Notice Board */}
          {onOpenNotices && (
            <button
              onClick={() => { soundFx.playClick(); onOpenNotices(); }}
              style={{ width: '34px', height: '34px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#2563EB' }}
              title="Bảng tin thông báo & Biểu mẫu học vụ"
            >
              <FileText size={15} />
            </button>
          )}

          {/* Notifications Bell */}
          <button
            onClick={() => { soundFx.playClick(); if (onOpenNotifications) onOpenNotifications(); else setActiveTab('assignments'); }}
            style={{ width: '34px', height: '34px', borderRadius: '6px', background: '#F8FAFC', border: `1px solid ${unreadNotificationCount > 0 ? '#FCA5A5' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', color: unreadNotificationCount > 0 ? '#DC2626' : '#64748B' }}
            title="Thông báo học vụ"
          >
            <Bell size={15} />
            {unreadNotificationCount > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', minWidth: '16px', height: '16px', borderRadius: '9999px', background: '#DC2626', color: '#fff', fontSize: '9.5px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '1.5px solid #fff' }}>
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* User Dropdown */}
          <UserDropdown currentUser={currentUser} theme={theme} toggleTheme={toggleTheme} onOpenProfile={onOpenProfileModal} onOpenChangePassword={onOpenChangePassword} onOpenInstallPWA={onOpenInstallModal} onLogout={onLogout} isAdmin={true} />
        </div>
      </div>

      {/* ── TẦNG 2: 3-HUB NAVIGATION TABS ── */}
      <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', gap: '2px', height: '44px', position: 'relative' }}>
        {TEACHER_HUB_DEFS.map(hub => {
          const isHubActive = activeHub === hub.id;
          const isOpen = openHub === hub.id;
          return (
            <div key={hub.id} style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => handleHubClick(hub)}
                style={{
                  height: '100%', padding: '0 14px',
                  background: 'transparent', border: 'none',
                  borderBottom: isHubActive ? '2.5px solid #2563EB' : '2.5px solid transparent',
                  color: isHubActive ? '#2563EB' : '#475569',
                  fontSize: '13px', fontWeight: isHubActive ? 700 : 500,
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s ease',
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                }}
              >
                {hub.label}
                <ChevronDown size={12} style={{ transition: 'transform 0.15s', transform: isOpen ? 'rotate(180deg)' : 'none', opacity: 0.6 }} />
              </button>

              {/* Dropdown Sub-menu */}
              {isOpen && (
                <div
                  style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0,
                    background: '#FFFFFF', border: '1px solid #E2E8F0',
                    borderRadius: '12px', padding: '6px', minWidth: '240px',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.1)', zIndex: 200,
                    display: 'flex', flexDirection: 'column', gap: '2px'
                  }}
                >
                  {hub.subItems.map(item => {
                    const isItemActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTab(item.id)}
                        style={{
                          padding: '9px 12px', borderRadius: '8px', border: 'none', textAlign: 'left',
                          background: isItemActive ? 'rgba(37,99,235,0.07)' : 'transparent',
                          color: isItemActive ? '#2563EB' : '#374151',
                          fontSize: '13px', fontWeight: isItemActive ? 700 : 400,
                          cursor: 'pointer', transition: 'background 0.1s',
                          display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                        onMouseEnter={e => { if (!isItemActive) e.currentTarget.style.background = '#F8FAFC'; }}
                        onMouseLeave={e => { if (!isItemActive) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {isItemActive && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#2563EB', flexShrink: 0 }} />}
                        {item.label}
                        {item.id === 'assignments' && unreadNotificationCount > 0 && (
                          <span style={{ marginLeft: 'auto', background: '#DC2626', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '999px' }}>
                            {unreadNotificationCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Backdrop */}
      {openHub && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={() => setOpenHub(null)} />
      )}
    </header>
  );
};
