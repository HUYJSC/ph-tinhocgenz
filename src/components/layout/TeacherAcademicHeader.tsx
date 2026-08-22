import React from 'react';
import { Bell, Bot } from 'lucide-react';
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
  onOpenAITutor
}) => {
  const academicNavItems: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: 'Tổng quan' },
    { id: 'attendance', label: 'Lớp học & Điểm danh' },
    { id: 'schedule', label: 'Lịch giảng dạy' },
    { id: 'assignments', label: 'Chấm bài & Đề thi' },
    { id: 'admin', label: 'Hồ sơ học viên' },
    { id: 'early_warning', label: 'Cảnh báo học vụ' },
    { id: 'creator', label: 'Soạn đề thi' }
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#ffffff',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
      }}
    >
      {/* ── TẦNG 1: TOP TIER (THƯƠNG HIỆU & HỆ THỐNG) ── */}
      <div
        style={{
          height: '54px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #F1F5F9'
        }}
      >
        {/* Left: Brand Logo + Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: '#fff',
              border: '1px solid #E2E8F0',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img src="/logo.png" alt="PH - Tin Học GenZ" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              PH TIN HỌC GENZ
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, letterSpacing: '0.01em' }}>
              Cổng đào tạo & Quản lý học vụ
            </div>
          </div>
        </div>

        {/* Right: Academic AI trigger + Notifications + Staff Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Compact AI Assistant Trigger */}
          {onOpenAITutor && (
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenAITutor();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#334155',
                fontSize: '12.5px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Mở Trợ lý học vụ AI"
            >
              <Bot size={14} color="#2563EB" />
              <span>Trợ lý học vụ AI</span>
            </button>
          )}

          {/* Notifications Bell */}
          <button
            onClick={() => {
              soundFx.playClick();
              if (onOpenNotifications) onOpenNotifications();
              else setActiveTab('assignments');
            }}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '6px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              color: unreadNotificationCount > 0 ? '#DC2626' : '#64748B'
            }}
            title="Thông báo học vụ"
          >
            <Bell size={15} />
            {unreadNotificationCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  minWidth: '15px',
                  height: '15px',
                  borderRadius: '9999px',
                  background: '#DC2626',
                  color: '#fff',
                  fontSize: '9.5px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px'
                }}
              >
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* User Profile & Dropdown */}
          <UserDropdown
            currentUser={currentUser}
            theme={theme}
            toggleTheme={toggleTheme}
            onOpenProfile={onOpenProfileModal}
            onOpenChangePassword={onOpenChangePassword}
            onOpenInstallPWA={onOpenInstallModal}
            onLogout={onLogout}
            isAdmin={true}
          />
        </div>
      </div>

      {/* ── TẦNG 2: BOTTOM TIER (ACADEMIC NAVIGATION TABS) ── */}
      <div
        style={{
          height: '42px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}
      >
        {academicNavItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(item.id);
              }}
              style={{
                height: '42px',
                padding: '0 12px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2.5px solid #2563EB' : '2.5px solid transparent',
                color: isActive ? '#2563EB' : '#475569',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '0'
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
