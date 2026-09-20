import React, { useState } from 'react';
import { Topbar } from './Topbar';
import { RoleSidebar } from './RoleSidebar';

export interface AppShellProps {
  children: React.ReactNode;
  user?: {
    name?: string;
    role?: 'student' | 'teacher' | 'giaovu' | 'admin';
    studentCode?: string;
    teacherCode?: string;
    avatar?: string;
  } | null;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenAITutor?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  currentPortal?: string;
  onSwitchPortal?: (portal: string) => void;
}

/**
 * AppShell — Unified layout container for all 4 roles (Student, Teacher, Giaovu, Admin).
 * Replaces disparate layouts with a single, responsive, high-performance frame.
 */
export const AppShell: React.FC<AppShellProps> = ({
  children,
  user,
  activeTab,
  onSelectTab,
  onOpenAITutor,
  onOpenNotifications,
  onOpenProfile,
  onLogout,
  onSearch,
  currentPortal = 'student',
  onSwitchPortal
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#F4F8FD',
      width: '100%'
    }}>
      {/* ── Standardized Topbar ── */}
      <Topbar
        user={user}
        onToggleSidebar={() => {
          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setIsMobileSidebarOpen(!isMobileSidebarOpen);
          } else {
            setIsSidebarCollapsed(!isSidebarCollapsed);
          }
        }}
        onOpenAITutor={onOpenAITutor}
        onOpenNotifications={onOpenNotifications}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onSearch={onSearch}
        currentPortal={currentPortal}
        onSwitchPortal={onSwitchPortal}
      />

      {/* ── Main Frame: Dynamic Sidebar + Content Area ── */}
      <div style={{
        display: 'flex',
        flex: 1,
        width: '100%',
        minWidth: 0,
        position: 'relative'
      }}>
        {/* Dynamic Role Sidebar */}
        <RoleSidebar
          role={user?.role || 'student'}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Scrollable Main Content */}
        <main style={{
          flex: 1,
          minWidth: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#F4F8FD',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};
