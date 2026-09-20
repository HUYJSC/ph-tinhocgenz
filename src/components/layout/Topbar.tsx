import React, { useState } from 'react';
import {
  Search, Bell, Bot, ChevronDown, User, LogOut,
  GraduationCap, Briefcase, Shield, ClipboardCheck, Menu
} from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';

export interface TopbarProps {
  user?: {
    name?: string;
    role?: 'student' | 'teacher' | 'giaovu' | 'admin';
    studentCode?: string;
    teacherCode?: string;
    avatar?: string;
  } | null;
  onToggleSidebar?: () => void;
  onOpenAITutor?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  currentPortal?: string;
  onSwitchPortal?: (portal: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  user,
  onToggleSidebar,
  onOpenAITutor,
  onOpenNotifications,
  onOpenProfile,
  onLogout,
  onSearch
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Quản trị viên', bg: '#FEE2E2', color: '#991B1B', icon: Shield };
      case 'teacher':
        return { label: 'Giảng viên', bg: '#FEF3C7', color: '#92400E', icon: Briefcase };
      case 'giaovu':
        return { label: 'Giáo vụ', bg: '#EDE9FE', color: '#5B21B6', icon: ClipboardCheck };
      case 'student':
      default:
        return { label: 'Học viên', bg: '#E0F2FE', color: '#0369A1', icon: GraduationCap };
    }
  };

  const badge = getRoleBadge(user?.role);
  const RoleIcon = badge.icon;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <header style={{
      height: '64px',
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 900,
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
    }}>
      {/* ── Left: Menu Toggle + Brand Logo ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              cursor: 'pointer',
              color: '#0B2545',
              transition: 'background 0.15s ease'
            }}
          >
            <Menu size={20} />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BrandLogo variant="horizontal" height={34} />
        </div>
      </div>

      {/* ── Center: Search Bar ── */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          flex: '1',
          maxWidth: '440px',
          margin: '0 24px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Search
          size={16}
          color="#94A3B8"
          style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm bài học, đề thi, kỹ năng (Ctrl + K)..."
          aria-label="Tìm kiếm nội dung"
          style={{
            width: '100%',
            height: '38px',
            paddingLeft: '38px',
            paddingRight: '12px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            background: '#F8FAFC',
            fontSize: '13.5px',
            color: '#0B2545',
            outline: 'none',
            transition: 'all 0.15s ease'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#0057B8';
            e.currentTarget.style.background = '#FFFFFF';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 87, 184, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.background = '#F8FAFC';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </form>

      {/* ── Right Actions: AI Tutor, Notifications, User Menu ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* AI Learning Copilot Trigger */}
        {onOpenAITutor && (
          <button
            onClick={onOpenAITutor}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #BFDBFE',
              background: '#EFF6FF',
              color: '#0057B8',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Trợ lý học tập AI Tin Học Gen Z"
          >
            <Bot size={16} />
            <span style={{ display: 'none', displayOutside: 'inline' } as any}>AI Copilot</span>
          </button>
        )}

        {/* Notifications Bell */}
        {onOpenNotifications && (
          <button
            onClick={onOpenNotifications}
            aria-label="Thông báo hệ thống"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              cursor: 'pointer',
              color: '#64748B'
            }}
          >
            <Bell size={18} />
            <span style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#EF4444'
            }} />
          </button>
        )}

        {/* User Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 8px 4px 4px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#0057B8',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 700
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0B2545', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'Tài khoản'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: badge.bg,
                  color: badge.color,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  <RoleIcon size={10} />
                  {badge.label}
                </span>
              </div>
            </div>

            <ChevronDown size={14} color="#94A3B8" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                width: '220px',
                background: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 25px rgba(15, 23, 42, 0.1)',
                padding: '6px',
                zIndex: 1000
              }}
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0B2545' }}>{user?.name}</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  {user?.studentCode || user?.teacherCode || 'TIN HỌC GEN Z'}
                </div>
              </div>

              {onOpenProfile && (
                <button
                  onClick={() => { setShowUserMenu(false); onOpenProfile(); }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#334155',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <User size={15} color="#64748B" />
                  Hồ sơ cá nhân
                </button>
              )}

              {onLogout && (
                <button
                  onClick={() => { setShowUserMenu(false); onLogout(); }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#EF4444',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <LogOut size={15} color="#EF4444" />
                  Đăng xuất
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
