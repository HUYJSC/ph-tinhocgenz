import React, { useState } from 'react';
import {
  Search, Bell, Sparkles, MessageSquare, HelpCircle,
  Menu, ChevronDown, User, LogOut, Key
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
  onOpenChangePassword?: () => void;
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
  onOpenChangePassword,
  onLogout,
  onSearch
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const displayName = user?.name || (isAdmin ? 'Nguyễn Đình Huy' : 'Nguyễn Văn A');
  const displaySubtitle = isStudent
    ? `Học viên • ${user?.studentCode || 'THGZ01'}`
    : isAdmin
    ? 'Super Admin'
    : user?.role === 'teacher'
    ? `Giảng viên • ${user?.teacherCode || 'GV01'}`
    : 'Giáo vụ học vụ';

  return (
    <header style={{
      height: '64px',
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 900,
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
    }}>
      {/* ── Left: Menu Toggle (Mobile) + Brand Logo ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              cursor: 'pointer',
              color: '#0B2545',
              transition: 'background 0.15s ease'
            }}
          >
            <Menu size={18} />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BrandLogo variant="horizontal" height={36} />
        </div>
      </div>

      {/* ── Center: Search Bar ── */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          flex: '1',
          maxWidth: '520px',
          margin: '0 24px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Search
          size={16}
          color="#94A3B8"
          style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isAdmin ? "Tìm kiếm học viên, khóa học, lớp học, tài liệu... Ctrl + K" : "Tìm khóa học, bài học, tài liệu, giảng viên... ⌘K"}
          aria-label="Tìm kiếm nội dung"
          style={{
            width: '100%',
            height: '40px',
            paddingLeft: '40px',
            paddingRight: '48px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            background: '#F8FAFC',
            fontSize: '13px',
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
        <div style={{
          position: 'absolute',
          right: '10px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '5px',
          padding: '2px 6px',
          fontSize: '11px',
          fontWeight: 600,
          color: '#94A3B8',
          pointerEvents: 'none'
        }}>
          {isAdmin ? 'Ctrl + K' : '⌘ K'}
        </div>
      </form>

      {/* ── Right Actions: AI Tutor, Notifications, Messages, Help, User Profile ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* AI Assistant Button */}
        {onOpenAITutor && (
          <button
            onClick={onOpenAITutor}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #BFDBFE',
              background: '#EFF6FF',
              color: '#0057B8',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title={isAdmin ? "Trợ lý quản trị AI" : "AI Hỗ trợ học tập"}
          >
            <Sparkles size={15} color="#0057B8" />
            <span>{isAdmin ? 'AI Assistant' : 'AI Hỗ trợ'}</span>
          </button>
        )}

        {/* Notifications Bell with Badge */}
        {onOpenNotifications && (
          <button
            onClick={onOpenNotifications}
            aria-label="Thông báo"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              cursor: 'pointer',
              color: '#64748B',
              transition: 'background 0.15s ease'
            }}
          >
            <Bell size={17} />
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: '#EF4444',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1
            }}>
              3
            </span>
          </button>
        )}

        {/* Messages icon (Student view) */}
        {isStudent && (
          <button
            onClick={onOpenNotifications}
            aria-label="Tin nhắn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              cursor: 'pointer',
              color: '#64748B'
            }}
            title="Tin nhắn thảo luận"
          >
            <MessageSquare size={17} />
          </button>
        )}

        {/* Help icon */}
        <button
          onClick={onOpenAITutor}
          aria-label="Trợ giúp"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            background: '#FFFFFF',
            cursor: 'pointer',
            color: '#64748B'
          }}
          title="Trợ giúp & Hướng dẫn"
        >
          <HelpCircle size={17} />
        </button>

        {/* User Profile Pill */}
        <div style={{ position: 'relative', marginLeft: '4px' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User profile menu"
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
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: isAdmin ? '#0057B8' : '#3B82F6',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 700,
              overflow: 'hidden'
            }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B2545', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                {displaySubtitle}
              </div>
            </div>

            <ChevronDown size={14} color="#94A3B8" />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '210px',
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
              padding: '6px',
              zIndex: 999
            }}>
              {onOpenProfile && (
                <button
                  onClick={() => { setShowUserMenu(false); onOpenProfile(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <User size={15} color="#64748B" />
                  <span>Hồ sơ cá nhân</span>
                </button>
              )}

              {onOpenChangePassword && (
                <button
                  onClick={() => { setShowUserMenu(false); onOpenChangePassword(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Key size={15} color="#64748B" />
                  <span>Đổi mật khẩu</span>
                </button>
              )}

              <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />

              {onLogout && (
                <button
                  onClick={() => { setShowUserMenu(false); onLogout(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#EF4444',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={15} color="#EF4444" />
                  <span>Đăng xuất</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
