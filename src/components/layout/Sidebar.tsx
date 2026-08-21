import {
  BookOpen, Layers, BarChart2, PlusCircle, BookmarkCheck,
  Smartphone, Shield, FileText, QrCode, ChevronDown, Calendar,
  LayoutDashboard, GitBranch, RotateCcw, Bot, ShieldAlert, LogOut
} from 'lucide-react';

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

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab, setActiveTab, bookmarkCount, unreadNotificationCount = 0,
  onLogout, onOpenInstallModal, onOpenAuthModal, onOpenProfileModal, onOpenAITutor, isAdmin, studentName
}) => {
  // Student structured sections
  const studentMainSection: NavItem[] = [
    { id: 'dashboard',    label: 'Dashboard 2026',    icon: LayoutDashboard,color: '#4f6ef7', bg: 'rgba(79,110,247,0.1)' },
    { id: 'learning_path',label: 'Lộ Trình Cá Nhân',  icon: GitBranch,      color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { id: 'quizzes',      label: 'Luyện Đề Thi',      icon: BookOpen,       color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
    { id: 'smart_review', label: 'Ôn Tập Câu Sai',    icon: RotateCcw,      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { id: 'schedule',     label: 'Thời Khóa Biểu',    icon: Calendar,       color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { id: 'assignments',  label: 'Đề Thi & Nộp Bài',  icon: FileText,       color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
    { id: 'flashcards',   label: 'Thẻ Ghi Nhớ',        icon: Layers,         color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
    { id: 'bookmarks',    label: 'Câu Đã Lưu',         icon: BookmarkCheck,  color: '#6366f1', bg: 'rgba(99,102,241,0.1)', count: bookmarkCount }
  ];

  const studentUtilitySection: NavItem[] = [
    { id: 'attendance',  label: 'Điểm Danh QR',      icon: QrCode,        color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
    { id: 'analytics',   label: 'Tiến Độ & Năng Lực',icon: BarChart2,     color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' }
  ];

  // Admin / Teacher structured sections
  const adminMainSection: NavItem[] = [
    { id: 'early_warning',label: 'Cảnh Báo Sớm 🚨',   icon: ShieldAlert,   color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    { id: 'schedule',     label: 'Thời Khóa Biểu Lớp',icon: Calendar,      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { id: 'admin',        label: 'Quản Lý Học Viên',  icon: Shield,        color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
    { id: 'attendance',   label: 'Điểm Danh Lớp (5m)',icon: QrCode,        color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
    { id: 'assignments',  label: 'Quản Lý & Chấm Bài',icon: FileText,      color: '#10b981', bg: 'rgba(16,185,129,0.1)', count: unreadNotificationCount }
  ];

  const adminBankSection: NavItem[] = [
    { id: 'quizzes',     label: 'Ngân Hàng Đề',      icon: BookOpen,      color: '#4f6ef7', bg: 'rgba(79,110,247,0.1)' },
    { id: 'creator',     label: 'Soạn Đề Thi',       icon: PlusCircle,    color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { id: 'flashcards',  label: 'Bộ Thẻ Ghi Nhớ',    icon: Layers,        color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }
  ];

  const handleSelect = (tab: ActiveTab) => { setActiveTab(tab); };
  const initial = studentName ? studentName.charAt(0).toUpperCase() : 'H';

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ padding: '4px 8px 6px', fontSize: '0.64rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {items.map(item => {
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
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? 'var(--bg-card)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none',
                borderLeft: isActive ? `3px solid ${item.color}` : '3px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                background: isActive ? item.bg : 'var(--bg-primary)',
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={15} />
              </div>

              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.label}
              </span>

              {item.count !== undefined && item.count > 0 && (
                <span style={{
                  padding: '1px 6px',
                  borderRadius: '999px',
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  background: item.color,
                  color: '#fff'
                }}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside
      className="sidebar"
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        zIndex: 40
      }}
    >
      {/* Brand Header */}
      <div style={{ padding: '16px 16px 14px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: '#fff', padding: '3px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid var(--border-color)', flexShrink: 0
          }}>
            <img src="/logo.png" alt="PH Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              PH TIN HỌC GENZ
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
              Hệ Thống Học Trực Tuyến
            </div>
          </div>
        </div>
      </div>

      {/* User Card with Dropdown Arrow */}
      <div style={{ padding: '12px 14px' }}>
        <button
          onClick={onOpenProfileModal || onOpenAuthModal}
          title="Xem thông tin chi tiết & Đổi mật khẩu"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '12px',
            background: isAdmin ? 'rgba(217,119,6,0.07)' : 'rgba(79,110,247,0.06)',
            border: isAdmin ? '1px solid rgba(217,119,6,0.2)' : '1px solid rgba(79,110,247,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
            background: isAdmin ? 'linear-gradient(135deg,#d97706,#b45309)' : 'linear-gradient(135deg,#4f6ef7,#6384fb)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.86rem'
          }}>
            {isAdmin ? <Shield size={15} /> : initial}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {studentName}
            </div>
            <div style={{ fontSize: '0.66rem', color: isAdmin ? '#d97706' : '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isAdmin ? '#d97706' : '#10b981', display: 'inline-block' }} />
              {isAdmin ? 'Giảng Viên' : 'Học Viên'}
            </div>
          </div>
          <ChevronDown size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        </button>
      </div>

      {/* Structured Navigation Groups */}
      <nav style={{ padding: '0 10px', flex: 1, overflowY: 'auto' }}>
        {isAdmin ? (
          <>
            {renderNavGroup('Quản Trị Đào Tạo', adminMainSection)}
            {renderNavGroup('Khảo Thí & Đề Thi', adminBankSection)}
          </>
        ) : (
          <>
            {renderNavGroup('Học Tập & Ôn Luyện', studentMainSection)}
            {renderNavGroup('Tiện Ích & Báo Cáo', studentUtilitySection)}
          </>
        )}
      </nav>

      {/* Footer Utilities */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {onOpenAITutor && (
          <button
            onClick={onOpenAITutor}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              background: 'rgba(139, 92, 246, 0.08)',
              color: '#8b5cf6',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              marginBottom: '2px'
            }}
          >
            <Bot size={15} />
            <span>Trợ Lý AI Tutor 2026</span>
          </button>
        )}

        <button
          onClick={onOpenInstallModal}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 10px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--bg-primary)',
            color: 'var(--text-secondary)',
            fontSize: '0.76rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Smartphone size={14} color="var(--brand)" />
          <span>Cài Ứng Dụng Web</span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(239, 68, 68, 0.06)',
              color: '#ef4444',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <LogOut size={14} />
            <span>Đăng Xuất</span>
          </button>
        )}
      </div>
    </aside>
  );
};
