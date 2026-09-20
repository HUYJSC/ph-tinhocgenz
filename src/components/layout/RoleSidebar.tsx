import React from 'react';
import {
  LayoutDashboard, BookOpen, Calendar, FileText, Award,
  QrCode, BarChart3, Users, CheckSquare, Layers, Shield,
  FolderKanban
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

export interface RoleSidebarProps {
  role?: 'student' | 'teacher' | 'giaovu' | 'admin';
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const RoleSidebar: React.FC<RoleSidebarProps> = ({
  role = 'student',
  activeTab,
  onSelectTab,
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Tổng quan KPI', icon: LayoutDashboard },
          { id: 'users', label: 'Quản lý người dùng', icon: Users },
          { id: 'courses', label: 'Khóa học & Học liệu', icon: BookOpen },
          { id: 'certificates', label: 'Phôi mẫu & Cấp bằng', icon: Award },
          { id: 'learning-hub', label: 'Nguồn học liệu số', icon: FolderKanban },
          { id: 'security', label: 'Bảo mật & Audit', icon: Shield }
        ];

      case 'teacher':
        return [
          { id: 'dashboard', label: 'Bàn giảng dạy', icon: LayoutDashboard },
          { id: 'classes', label: 'Lớp học phụ trách', icon: Users },
          { id: 'grading', label: 'Chấm bài học viên', icon: CheckSquare, badge: 'Cần chấm', badgeColor: '#FEF3C7' },
          { id: 'attendance', label: 'Điểm danh QR động', icon: QrCode },
          { id: 'schedule', label: 'Thời khóa biểu', icon: Calendar },
          { id: 'library', label: 'Ngân hàng đề thi', icon: BookOpen }
        ];

      case 'giaovu':
        return [
          { id: 'dashboard', label: 'Vận hành đào tạo', icon: LayoutDashboard },
          { id: 'classes', label: 'Điều phối lớp học', icon: Layers },
          { id: 'schedule', label: 'Lịch học & Phòng thi', icon: Calendar },
          { id: 'attendance', label: 'Giám sát chuyên cần', icon: QrCode, badge: 'Cảnh báo', badgeColor: '#FEE2E2' },
          { id: 'students', label: 'Chăm sóc học viên', icon: Users },
          { id: 'reports', label: 'Báo cáo vận hành', icon: BarChart3 }
        ];

      case 'student':
      default:
        return [
          { id: 'dashboard', label: 'Hôm nay học gì', icon: LayoutDashboard },
          { id: 'courses', label: 'Khóa học của tôi', icon: BookOpen },
          { id: 'schedule', label: 'Lịch học tuần', icon: Calendar },
          { id: 'assignments', label: 'Bài tập thực hành', icon: FileText },
          { id: 'quizzes', label: 'Khảo thí trực tuyến', icon: CheckSquare },
          { id: 'attendance', label: 'Điểm danh QR', icon: QrCode },
          { id: 'certificates', label: 'Chứng chỉ số', icon: Award },
          { id: 'analytics', label: 'Bản đồ kỹ năng', icon: BarChart3 }
        ];
    }
  };

  const navItems = getNavItems();

  const sidebarWidth = isCollapsed ? '72px' : '240px';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            zIndex: 950,
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: sidebarWidth,
          background: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'width 0.2s ease, transform 0.2s ease',
          zIndex: 960,
          flexShrink: 0,
          height: 'calc(100vh - 64px)',
          position: 'sticky',
          top: '64px',
          overflowY: 'auto'
        }}
      >
        {/* Navigation List */}
        <div style={{ padding: '16px 10px' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#94A3B8',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: isCollapsed ? '0 0 10px' : '0 12px 10px',
            textAlign: isCollapsed ? 'center' : 'left'
          }}>
            {isCollapsed ? '•••' : 'Menu Chính'}
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  title={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    minHeight: '44px', // Touch-friendly 44px min target
                    padding: isCollapsed ? '10px 0' : '10px 14px',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? '#EFF6FF' : 'transparent',
                    color: isActive ? '#0057B8' : '#475569',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#F8FAFC';
                      e.currentTarget.style.color = '#0B2545';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#475569';
                    }
                  }}
                >
                  {/* Active Indicator Strip */}
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: '8px',
                      bottom: '8px',
                      width: '3px',
                      borderRadius: '0 3px 3px 0',
                      background: '#0057B8'
                    }} />
                  )}

                  <Icon size={18} color={isActive ? '#0057B8' : '#64748B'} />

                  {!isCollapsed && (
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '6px',
                      background: item.badgeColor || '#E2E8F0',
                      color: '#0F172A'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        {!isCollapsed && (
          <div style={{
            padding: '16px',
            borderTop: '1px solid #F1F5F9',
            background: '#FAFAFA',
            margin: '8px',
            borderRadius: '8px',
            fontSize: '11.5px',
            color: '#64748B',
            textAlign: 'center',
            lineHeight: 1.4
          }}>
            <div style={{ fontWeight: 600, color: '#0B2545' }}>TIN HỌC GEN Z</div>
            <div>Nền tảng LMS AI & Blockchain</div>
            <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>v2026.1 • Production</div>
          </div>
        )}
      </aside>
    </>
  );
};
