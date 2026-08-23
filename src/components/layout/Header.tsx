import React from 'react';
import { Flame, Bell, FileText, MessageSquare, Camera } from 'lucide-react';
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
  onOpenQRScanner?: () => void;
  onOpenCheckInModal?: () => void;
}

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
  onOpenQRScanner,
  onOpenCheckInModal
}) => {
  const studentNavItems: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: 'Tổng quan' },
    { id: 'attendance', label: 'Điểm danh lớp' },
    { id: 'learning_path', label: 'Lộ trình học' },
    { id: 'quizzes', label: 'Khóa học & Đề thi' },
    { id: 'schedule', label: 'Thời khóa biểu' },
    { id: 'assignments', label: 'Bài tập & Nộp bài' },
    { id: 'flashcards', label: 'Thẻ ghi nhớ' }
  ];

  const handleSelectTab = (tabId: ActiveTab) => {
    soundFx.playClick();
    if (setActiveTab) {
      setActiveTab(tabId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className="app-header"
      style={{
        height: 'var(--header-height)',
        minHeight: 'var(--header-height)',
        maxHeight: 'var(--header-height)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      {/* ── LEFT: Logo Brand & Top Nav Shortcuts ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0 }}>
        {/* Brand Logo + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div
            style={{
              height: '42px',
              maxWidth: '220px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img src="/logo.png" alt="PH DIGITAL EDUCATION" style={{ height: '100%', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Academic Top Navigation Tab Bar (Desktop & Mobile Scrollable) */}
        <nav className="hide-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', padding: '4px 0' }}>
          {studentNavItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  background: isActive ? '#EFF6FF' : 'transparent',
                  border: isActive ? '1px solid #BFDBFE' : '1px solid transparent',
                  color: isActive ? '#2563EB' : '#475569',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 700 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.color = '#0F172A';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#475569';
                  }
                }}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── RIGHT: Minimal Controls (Streak + Notifications + User Dropdown) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {/* Student QR Check-In Scanner Button */}
        {onOpenQRScanner && !isAdmin && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenQRScanner();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)'
              }}
              title="Mở Camera quét mã QR điểm danh lớp học"
            >
              <Camera size={14} />
              <span>Quét QR</span>
            </button>

            {onOpenCheckInModal && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenCheckInModal();
                }}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 600
                }}
                title="Nhập mã PIN điểm danh 6 số"
              >
                <span>Nhập PIN</span>
              </button>
            )}
          </div>
        )}

        {/* Streak Badge (Small & Unified) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            color: 'var(--warning)',
            fontSize: '12.5px',
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}
          title="Chuỗi ngày học liên tục"
        >
          <Flame size={13} fill="#f59e0b" color="#d97706" />
          <span>{streak || 1}</span>
        </div>

        {/* Admin Notification Bell */}
        {isAdmin && onOpenNotifications && (
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenNotifications();
            }}
            title="Thông báo bài nộp"
            className="btn btn-icon"
            style={{
              width: '34px',
              height: '34px',
              minHeight: '34px',
              position: 'relative',
              color: unreadNotificationCount > 0 ? 'var(--danger)' : 'var(--text-secondary)'
            }}
          >
            <Bell size={15} />
            {unreadNotificationCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: 'var(--danger)',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {unreadNotificationCount}
              </span>
            )}
          </button>
        )}

        {/* Academic Notice Board */}
        {onOpenNotices && (
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenNotices();
            }}
            title="Bảng tin thông báo học vụ"
            className="btn btn-icon"
            style={{
              width: '32px',
              height: '32px',
              minHeight: '32px',
              color: 'var(--brand)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <FileText size={15} />
          </button>
        )}

        {/* Student Help Desk / Feedback */}
        {onOpenFeedback && (
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenFeedback();
            }}
            title="Góp ý & Hỗ trợ học vụ"
            className="btn btn-icon"
            style={{
              width: '32px',
              height: '32px',
              minHeight: '32px',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <MessageSquare size={15} />
          </button>
        )}

        {/* User Dropdown */}
        <UserDropdown
          currentUser={currentUser}
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenProfile={onOpenProfileModal}
          onOpenChangePassword={onOpenChangePassword}
          onOpenInstallPWA={onOpenInstallModal}
          onLogout={onLogout}
          isAdmin={isAdmin}
        />
      </div>
    </header>
  );
};
