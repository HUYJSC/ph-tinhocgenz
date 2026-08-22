import React, { useState } from 'react';
import {
  BookOpen, Layers, BarChart2, PlusCircle, BookmarkCheck,
  Shield, FileText, QrCode, ChevronDown, Calendar,
  LayoutDashboard, GitBranch, RotateCcw, Bot, ShieldAlert
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export type ActiveTab =
  | 'dashboard'
  | 'learning_path'
  | 'quizzes'
  | 'smart_review'
  | 'assignments'
  | 'attendance'
  | 'schedule'
  | 'flashcards'
  | 'early_warning'
  | 'analytics'
  | 'creator'
  | 'bookmarks'
  | 'admin';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  bookmarkCount: number;
  unreadNotificationCount?: number;
  onLogout?: () => void;
  onOpenInstallModal: () => void;
  onOpenAuthModal: () => void;
  onOpenProfileModal?: () => void;
  onOpenAITutor?: () => void;
  isAdmin: boolean;
  studentName: string;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: any;
  color: string;
  bg: string;
  count?: number;
}

interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  bookmarkCount,
  unreadNotificationCount = 0,
  onOpenProfileModal,
  onOpenAITutor,
  isAdmin,
  studentName
}) => {
  // Accordion open sections state (all expanded by default for quick access)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    learn: true,
    assess: true,
    class: true,
    admin_mgmt: true,
    admin_bank: true
  });

  const toggleSection = (sectionId: string) => {
    soundFx.playClick();
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // ── STUDENT ACCORDION SECTIONS (NO DUPLICATES) ──
  const studentSections: NavSection[] = [
    {
      id: 'learn',
      title: '📘 Học Tập & Lộ Trình',
      items: [
        { id: 'dashboard',    label: 'Dashboard 2026',    icon: LayoutDashboard, color: '#4f6ef7', bg: 'rgba(79,110,247,0.1)' },
        { id: 'learning_path',label: 'Lộ Trình Cá Nhân',  icon: GitBranch,       color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
        { id: 'smart_review', label: 'Ôn Lỗi Sai (Spaced)',icon: RotateCcw,     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        { id: 'flashcards',   label: 'Thẻ Ghi Nhớ',        icon: Layers,          color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
        { id: 'bookmarks',    label: 'Câu Đã Lưu',         icon: BookmarkCheck,   color: '#6366f1', bg: 'rgba(99,102,241,0.1)', count: bookmarkCount }
      ]
    },
    {
      id: 'assess',
      title: '📝 Khảo Thí & Thực Hành',
      items: [
        { id: 'quizzes',     label: 'Luyện Đề Thi Trắc Nghiệm', icon: BookOpen, color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
        { id: 'assignments', label: 'Đề Thi MOS & Nộp Bài',      icon: FileText, color: '#10b981', bg: 'rgba(16,185,129,0.1)' }
      ]
    },
    {
      id: 'class',
      title: '📅 Lớp Học & Tiện Ích',
      items: [
        { id: 'schedule',   label: 'Thời Khóa Biểu & Meet', icon: Calendar, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        { id: 'attendance', label: 'Điểm Danh QR Code',     icon: QrCode,   color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
        { id: 'analytics',  label: 'Báo Cáo Năng Lực',      icon: BarChart2,color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' }
      ]
    }
  ];

  // ── ADMIN / TEACHER ACCORDION SECTIONS (NO DUPLICATES) ──
  const adminSections: NavSection[] = [
    {
      id: 'admin_mgmt',
      title: '🛡️ Quản Trị Đào Tạo',
      items: [
        { id: 'early_warning',label: 'Cảnh Báo Sớm 🚨',   icon: ShieldAlert, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        { id: 'admin',        label: 'Quản Lý Học Viên',  icon: Shield,      color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
        { id: 'attendance',   label: 'Điểm Danh Lớp (5m)',icon: QrCode,      color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
        { id: 'assignments',  label: 'Quản Lý & Chấm Bài',icon: FileText,    color: '#10b981', bg: 'rgba(16,185,129,0.1)', count: unreadNotificationCount }
      ]
    },
    {
      id: 'admin_bank',
      title: '📚 Ngân Hàng & Khảo Thí',
      items: [
        { id: 'quizzes',    label: 'Ngân Hàng Đề Thi',  icon: BookOpen,   color: '#4f6ef7', bg: 'rgba(79,110,247,0.1)' },
        { id: 'creator',    label: 'Soạn Đề Thi Mới',   icon: PlusCircle, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
        { id: 'schedule',   label: 'Lịch Dạy & Meet Hub',icon: Calendar,  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        { id: 'flashcards', label: 'Bộ Thẻ Ghi Nhớ',    icon: Layers,     color: '#ec4899', bg: 'rgba(236,72,153,0.1)' }
      ]
    }
  ];

  const sections = isAdmin ? adminSections : studentSections;

  const handleSelect = (tab: ActiveTab) => {
    soundFx.playClick();
    setActiveTab(tab);
  };

  const initial = studentName ? studentName.charAt(0).toUpperCase() : 'H';

  return (
    <aside
      className="sidebar"
      style={{
        width: 'var(--sidebar-width)',
        minWidth: 'var(--sidebar-width)',
        height: '100vh',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        userSelect: 'none'
      }}
    >
      {/* ── 1. LOGO & BRAND HEADER ── */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#fff',
            padding: '3px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            flexShrink: 0
          }}
        >
          <img src="/logo.png" alt="Tin Học GenZ" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        <div>
          <div style={{ fontSize: '0.94rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Tin Học GenZ
          </div>
          <div style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            AI Platform 2026
          </div>
        </div>
      </div>

      {/* ── 2. COMPACT USER PROFILE TILE ── */}
      <div style={{ padding: '10px 12px 6px' }}>
        <button
          onClick={onOpenProfileModal}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: '12px',
            background: isAdmin ? 'rgba(217, 119, 6, 0.07)' : 'rgba(79, 110, 247, 0.06)',
            border: isAdmin ? '1px solid rgba(217, 119, 6, 0.2)' : '1px solid rgba(79, 110, 247, 0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
          title="Xem thông tin chi tiết tài khoản"
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: isAdmin ? 'linear-gradient(135deg, #d97706, #b45309)' : 'linear-gradient(135deg, #4f6ef7, #3b82f6)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.76rem',
              flexShrink: 0
            }}
          >
            {isAdmin ? <Shield size={13} /> : initial}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {studentName || 'Học Viên'}
            </div>
            <div style={{ fontSize: '0.62rem', color: isAdmin ? '#d97706' : '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: isAdmin ? '#d97706' : '#10b981', display: 'inline-block' }} />
              <span>{isAdmin ? 'Giảng Viên' : 'Học Viên Online'}</span>
            </div>
          </div>
        </button>
      </div>

      {/* ── 3. ACCORDION NAVIGATION GROUPS ── */}
      <nav style={{ padding: '4px 10px 14px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sections.map(sec => {
          const isOpen = openSections[sec.id] ?? true;

          return (
            <div
              key={sec.id}
              style={{
                borderRadius: '12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleSection(sec.id)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)'
                }}
              >
                <span>{sec.title}</span>
                <ChevronDown
                  size={13}
                  color="var(--text-muted)"
                  style={{
                    transition: 'transform 0.2s ease',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              </button>

              {/* Accordion Items List */}
              {isOpen && (
                <div style={{ padding: '4px 4px 6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {sec.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.id)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          border: 'none',
                          background: isActive ? item.bg : 'transparent',
                          color: isActive ? item.color : 'var(--text-secondary)',
                          fontWeight: isActive ? 800 : 500,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          borderLeft: isActive ? `3px solid ${item.color}` : '3px solid transparent',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: isActive ? item.bg : 'var(--bg-primary)',
                            color: item.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <Icon size={14} />
                        </div>

                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.label}
                        </span>

                        {item.count !== undefined && item.count > 0 && (
                          <span
                            style={{
                              padding: '1px 5px',
                              borderRadius: '999px',
                              fontSize: '0.62rem',
                              fontWeight: 900,
                              background: item.color,
                              color: '#fff'
                            }}
                          >
                            {item.count}
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
      </nav>

      {/* ── 4. FOOTER: QUICK AI TUTOR BUTTON ── */}
      {onOpenAITutor && (
        <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={onOpenAITutor}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(79, 110, 247, 0.05) 100%)',
              color: '#8b5cf6',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.1)'
            }}
          >
            <Bot size={15} />
            <span>Trợ Lý AI Tutor 2026</span>
          </button>
        </div>
      )}
    </aside>
  );
};
