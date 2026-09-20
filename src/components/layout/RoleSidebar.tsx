import React from 'react';
import {
  Home, BookOpen, Sparkles, Calendar, CheckSquare,
  QrCode, Award, Users, FolderArchive, Bell, User,
  Headphones, LayoutDashboard, Briefcase, ClipboardCheck,
  Shield, Layers, BarChart3, Database, Key, CreditCard,
  TrendingUp, Settings, Share2, Lock, ChevronRight
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  isRedDot?: boolean;
}

export interface NavGroup {
  groupTitle?: string;
  items: NavItem[];
}

export interface RoleSidebarProps {
  role?: 'student' | 'teacher' | 'giaovu' | 'admin';
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenConsultation?: () => void;
}

export const RoleSidebar: React.FC<RoleSidebarProps> = ({
  role = 'student',
  activeTab,
  onSelectTab,
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
  onOpenConsultation
}) => {
  // ── 1. STUDENT NAVIGATION (Exact 11 Items from Design Source of Truth) ──
  const getStudentItems = (): NavItem[] => [
    { id: 'dashboard', label: 'Trang chủ', icon: Home },
    { id: 'courses', label: 'Khóa học của tôi', icon: BookOpen },
    { id: 'learning_path', label: 'Lộ trình học AI', icon: Sparkles },
    { id: 'schedule', label: 'Lịch học', icon: Calendar },
    { id: 'assignments', label: 'Bài tập & Kiểm tra', icon: CheckSquare },
    { id: 'attendance', label: 'Điểm danh', icon: QrCode, isRedDot: true },
    { id: 'certificates', label: 'Chứng chỉ & Thành tích', icon: Award },
    { id: 'community', label: 'Cộng đồng', icon: Users },
    { id: 'library', label: 'Kho tài liệu', icon: FolderArchive },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: User }
  ];

  // ── 2. ADMIN NAVIGATION (19 Items across 6 Grouped Sections from Specification) ──
  const getAdminGroups = (): NavGroup[] => [
    {
      items: [
        { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard }
      ]
    },
    {
      groupTitle: 'QUẢN LÝ HỆ THỐNG',
      items: [
        { id: 'users', label: 'Người dùng', icon: Users },
        { id: 'permissions', label: 'Phân quyền', icon: Key },
        { id: 'roles', label: 'Nhóm & Vai trò', icon: Shield },
        { id: 'audit_logs', label: 'Nhật ký hệ thống', icon: ClipboardCheck }
      ]
    },
    {
      groupTitle: 'ĐÀO TẠO & NỘI DUNG',
      items: [
        { id: 'courses_mgmt', label: 'Khóa học', icon: BookOpen },
        { id: 'classes_mgmt', label: 'Lớp học', icon: Layers },
        { id: 'teaching_schedule', label: 'Lịch giảng dạy', icon: Calendar },
        { id: 'assignments_mgmt', label: 'Bài tập & Kiểm tra', icon: CheckSquare },
        { id: 'question_bank', label: 'Ngân hàng câu hỏi', icon: Database },
        { id: 'media_library', label: 'Tài liệu & Media', icon: FolderArchive },
        { id: 'learning_sources', label: 'Trung Tâm Nguồn Học Liệu', icon: FolderArchive },
        { id: 'review_queue', label: 'Nội Dung Chờ Kiểm Duyệt', icon: ClipboardCheck },
        { id: 'tinhocgenz_studio', label: 'Kho Tài Liệu TIN HỌC GEN Z', icon: Database }
      ]
    },
    {
      groupTitle: 'HỌC VIÊN & GIẢNG VIÊN',
      items: [
        { id: 'students_mgmt', label: 'Học viên', icon: Users },
        { id: 'teachers_mgmt', label: 'Giảng viên', icon: Briefcase },
        { id: 'attendance_mgmt', label: 'Điểm danh (QR)', icon: QrCode, badge: 'Mới', badgeColor: '#EF4444' },
        { id: 'certificates', label: 'Quản Lý & Cấp Chứng Chỉ', icon: Award }
      ]
    },
    {
      groupTitle: 'TÀI CHÍNH & VẬN HÀNH',
      items: [
        { id: 'tuition_enrollment', label: 'Đăng ký & Học phí', icon: CreditCard },
        { id: 'revenue_stats', label: 'Doanh thu & Thống kê', icon: TrendingUp },
        { id: 'crm_support', label: 'CRM & Chăm sóc HV', icon: Headphones }
      ]
    },
    {
      groupTitle: 'AI & PHÂN TÍCH',
      items: [
        { id: 'ai_generator', label: 'AI Tạo nội dung', icon: Sparkles },
        { id: 'data_analytics', label: 'Phân tích dữ liệu', icon: BarChart3 },
        { id: 'reports', label: 'Báo cáo', icon: BarChart3 }
      ]
    },
    {
      groupTitle: 'CÀI ĐẶT',
      items: [
        { id: 'system_settings', label: 'Cài đặt hệ thống', icon: Settings },
        { id: 'integrations', label: 'Tích hợp', icon: Share2 },
        { id: 'backup_security', label: 'Sao lưu & Bảo mật', icon: Lock }
      ]
    }
  ];

  // ── 3. TEACHER & GIAOVU FALLBACK GROUPS ──
  const getTeacherItems = (): NavItem[] => [
    { id: 'dashboard', label: 'Bàn giảng dạy', icon: LayoutDashboard },
    { id: 'classes', label: 'Lớp học phụ trách', icon: Users },
    { id: 'assignments', label: 'Chấm bài tập', icon: CheckSquare, badge: 'Cần chấm', badgeColor: '#FEF3C7' },
    { id: 'attendance', label: 'Điểm danh QR động', icon: QrCode },
    { id: 'schedule', label: 'Thời khóa biểu', icon: Calendar },
    { id: 'quizzes', label: 'Ngân hàng đề thi', icon: BookOpen }
  ];

  const getGiaoVuItems = (): NavItem[] => [
    { id: 'dashboard', label: 'Vận hành đào tạo', icon: LayoutDashboard },
    { id: 'classes', label: 'Điều phối lớp học', icon: Layers },
    { id: 'schedule', label: 'Lịch học & Phòng thi', icon: Calendar },
    { id: 'attendance', label: 'Giám sát chuyên cần', icon: QrCode, badge: 'Cảnh báo', badgeColor: '#FEE2E2' },
    { id: 'students', label: 'Chăm sóc học viên', icon: Users },
    { id: 'reports', label: 'Báo cáo vận hành', icon: BarChart3 }
  ];

  const sidebarWidth = isCollapsed ? '72px' : '250px';
  const isStudent = role === 'student';
  const isAdmin = role === 'admin';

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
          background: isAdmin ? '#0B2545' : '#FFFFFF',
          borderRight: isAdmin ? '1px solid #1E3A8A' : '1px solid #E2E8F0',
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
        {/* Navigation Content */}
        <div style={{ padding: isCollapsed ? '16px 8px' : '16px 12px' }}>
          {isStudent && (
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {getStudentItems().map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id || (item.id === 'dashboard' && activeTab === '');

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
                      minHeight: '44px',
                      padding: isCollapsed ? '10px 0' : '10px 14px',
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      borderRadius: '10px',
                      border: 'none',
                      background: isActive ? '#0057B8' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#475569',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '13.5px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = '#F1F5F9';
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
                    <Icon size={19} color={isActive ? '#FFFFFF' : '#64748B'} />

                    {!isCollapsed && (
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </span>
                    )}

                    {/* Red dot badge for Attendance */}
                    {item.isRedDot && !isCollapsed && (
                      <span style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#EF4444',
                        display: 'inline-block'
                      }} />
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {isAdmin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {getAdminGroups().map((group, gIdx) => (
                <div key={gIdx}>
                  {group.groupTitle && !isCollapsed && (
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#60A5FA',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      padding: '8px 12px 6px',
                      opacity: 0.85
                    }}>
                      {group.groupTitle}
                    </div>
                  )}

                  <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id || (item.id === 'overview' && (activeTab === 'dashboard' || activeTab === 'overview'));

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
                            minHeight: '40px',
                            padding: isCollapsed ? '8px 0' : '8px 12px',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            borderRadius: '8px',
                            border: 'none',
                            background: isActive ? '#0057B8' : 'transparent',
                            color: isActive ? '#FFFFFF' : '#94A3B8',
                            fontWeight: isActive ? 600 : 500,
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            textAlign: 'left'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                              e.currentTarget.style.color = '#FFFFFF';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#94A3B8';
                            }
                          }}
                        >
                          <Icon size={17} color={isActive ? '#FFFFFF' : '#60A5FA'} />

                          {!isCollapsed && (
                            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.label}
                            </span>
                          )}

                          {!isCollapsed && item.badge && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: item.badgeColor || '#EF4444',
                              color: '#FFFFFF'
                            }}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>
          )}

          {!isStudent && !isAdmin && (
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {(role === 'teacher' ? getTeacherItems() : getGiaoVuItems()).map((item) => {
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
                      minHeight: '44px',
                      padding: isCollapsed ? '10px 0' : '10px 14px',
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      borderRadius: '10px',
                      border: 'none',
                      background: isActive ? '#0057B8' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#475569',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '13.5px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left'
                    }}
                  >
                    <Icon size={18} color={isActive ? '#FFFFFF' : '#64748B'} />
                    {!isCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                    {!isCollapsed && item.badge && (
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px', background: item.badgeColor, color: '#0F172A' }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* ── Bottom Section: Support Card & Version Copyright ── */}
        {!isCollapsed && isStudent && (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Support Callout Box */}
            <div style={{
              background: '#F8FAFD',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#EFF6FF',
                color: '#0057B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px'
              }}>
                <Headphones size={18} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B2545', marginBottom: '2px' }}>
                Cần hỗ trợ?
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '10px' }}>
                Liên hệ đội ngũ tư vấn
              </div>
              <button
                onClick={onOpenConsultation}
                style={{
                  width: '100%',
                  padding: '7px 0',
                  borderRadius: '8px',
                  border: '1px solid #0057B8',
                  background: '#FFFFFF',
                  color: '#0057B8',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#0057B8'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#0057B8'; }}
              >
                <span>Tư vấn ngay</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Version & Brand Copyright */}
            <div style={{
              fontSize: '10.5px',
              color: '#94A3B8',
              lineHeight: 1.5,
              paddingLeft: '4px'
            }}>
              <div style={{ fontWeight: 700, color: '#64748B' }}>TINHOCGENZ</div>
              <div>Phiên bản 2.0.0</div>
              <div>© 2025 Tin Học Gen Z</div>
              <div style={{ color: '#0057B8', marginTop: '2px' }}>Học thông minh hơn, vươn xa cùng công nghệ</div>
            </div>
          </div>
        )}

        {/* Footer for Admin */}
        {!isCollapsed && isAdmin && (
          <div style={{
            padding: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '11px',
            color: '#60A5FA',
            lineHeight: 1.4
          }}>
            <div style={{ fontWeight: 600, color: '#FFFFFF' }}>TINHOCGENZ ADMIN</div>
            <div style={{ color: '#94A3B8' }}>v2.1.0 • Super Admin</div>
          </div>
        )}
      </aside>
    </>
  );
};
