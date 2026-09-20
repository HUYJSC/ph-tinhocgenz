import React, { useState } from 'react';
import {
  Search, Bell, ChevronDown, User, BookOpen, Award,
  LogOut, GraduationCap
} from 'lucide-react';

export interface LmsMainHeaderProps {
  activeNav?: string;
  onNavigate?: (navId: string) => void;
  onOpenSearch?: (query: string) => void;
  onOpenAuth?: () => void;
  onOpenNotifications?: () => void;
  studentName?: string;
  isLoggedIn?: boolean;
}

export const LmsMainHeader: React.FC<LmsMainHeaderProps> = ({
  activeNav = 'home',
  onNavigate,
  onOpenSearch,
  onOpenAuth,
  onOpenNotifications,
  studentName = 'Phương',
  isLoggedIn = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleNav = (navId: string) => {
    if (onNavigate) {
      onNavigate(navId);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onOpenSearch) {
      onOpenSearch(searchQuery);
    } else if (onNavigate) {
      onNavigate('courses');
    }
  };

  return (
    <header style={{
      width: '100%',
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(11, 37, 69, 0.04)',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '0 20px',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        {/* ── 1. LOGO TINHOCGENZ WITH OFFICIAL MOTTO ── */}
        <div
          onClick={() => handleNav('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          {/* Logo Mark PH */}
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0057B8 0%, #0077FE 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 87, 184, 0.25)',
            position: 'relative'
          }}>
            <GraduationCap size={24} color="#FFFFFF" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: '#0B2545',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>TINHOC</span>
              <span style={{ color: '#0057B8' }}>GENZ</span>
            </div>
            <div style={{
              fontSize: '9.5px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: '#64748B',
              textTransform: 'uppercase',
              marginTop: '2px'
            }}>
              Học Thật — Thi Thật — Giá Trị Thật
            </div>
          </div>
        </div>

        {/* ── 2. MAIN NAVIGATION MENU (6 ITEMS) ── */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexShrink: 0
        }}>
          {[
            { id: 'home', label: 'Trang chủ' },
            { id: 'courses', label: 'Khóa học' },
            { id: 'learning_path', label: 'Lộ trình học' },
            { id: 'exams', label: 'Thi chứng chỉ' },
            { id: 'community', label: 'Cộng đồng' },
            { id: 'about', label: 'Về chúng tôi' }
          ].map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#0057B8' : '#334155',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s ease'
                }}
              >
                {item.label}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: '14px',
                    right: '14px',
                    height: '3px',
                    background: '#0057B8',
                    borderRadius: '3px'
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── 3. SEARCH BAR ── */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            flex: 1,
            maxWidth: '320px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm khóa học, kỹ năng, chủ đề..."
            style={{
              width: '100%',
              height: '38px',
              padding: '0 12px 0 36px',
              borderRadius: '20px',
              border: '1px solid #CBD5E1',
              background: '#F8FAFC',
              fontSize: '13px',
              color: '#0F172A',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
          />
        </form>

        {/* ── 4. RIGHT ACTIONS (NOTIFICATIONS & USER PROFILE) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              color: '#475569'
            }}
            title="Thông báo"
          >
            <Bell size={18} />
            <span style={{
              position: 'absolute',
              top: '7px',
              right: '8px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#EF4444',
              border: '1.5px solid #FFFFFF'
            }} />
          </button>

          {/* User Profile Pill / Login CTA */}
          {isLoggedIn ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '4px 12px 4px 6px',
                  borderRadius: '24px',
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0057B8 0%, #38BDF8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13px'
                }}>
                  {studentName.charAt(0).toUpperCase()}
                </div>

                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                    Xin chào, {studentName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1 }}>
                    Học viên
                  </div>
                </div>

                <ChevronDown size={14} color="#64748B" />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '220px',
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12)',
                    padding: '8px',
                    zIndex: 2000
                  }}
                >
                  <button
                    onClick={() => { setShowProfileMenu(false); handleNav('profile'); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: '#334155',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <User size={15} color="#0057B8" /> Thông tin cá nhân
                  </button>

                  <button
                    onClick={() => { setShowProfileMenu(false); handleNav('courses'); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: '#334155',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <BookOpen size={15} color="#0057B8" /> Khóa học của tôi
                  </button>

                  <button
                    onClick={() => { setShowProfileMenu(false); handleNav('verify'); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: '#334155',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Award size={15} color="#0057B8" /> Chứng chỉ Blockchain
                  </button>

                  <div style={{ height: '1px', background: '#E2E8F0', margin: '6px 0' }} />

                  <button
                    onClick={() => { setShowProfileMenu(false); if (onOpenAuth) onOpenAuth(); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: '#EF4444',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <LogOut size={15} color="#EF4444" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              style={{
                background: '#0057B8',
                color: '#FFFFFF',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
