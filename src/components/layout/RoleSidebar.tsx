import React from 'react';
import {
  Home, BookOpen, Sparkles, Calendar, CheckSquare,
  QrCode, Award, Users, FolderArchive, Bell, User,
  Headphones, LayoutDashboard, Briefcase, ClipboardCheck,
  Shield, Layers, BarChart3, Database, Key, CreditCard,
  TrendingUp, Settings, Share2, Lock, ChevronRight, Video, HelpCircle
} from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { UserProfile } from '../../types/auth';
import { hasPermission, UserPermission } from '../../types/rbac';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  isRedDot?: boolean;
  requiredPermission?: UserPermission;
}

export interface NavGroup {
  groupTitle?: string;
  items: NavItem[];
}

export interface RoleSidebarProps {
  role?: 'student' | 'teacher' | 'giaovu' | 'admin' | string;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenConsultation?: () => void;
  currentUser?: UserProfile | null;
}

export const RoleSidebar: React.FC<RoleSidebarProps> = ({
  role = 'student',
  activeTab,
  onSelectTab,
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
  onOpenConsultation,
  currentUser
}) => {
  // ── 1. STUDENT NAVIGATION (11 Items) ──
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

  // ── 2. ADMIN NAVIGATION (7 Grouped Sections with Fine-Grained RBAC Filtering) ──
  const getAdminGroups = (): NavGroup[] => {
    const rawGroups: NavGroup[] = [
      {
        groupTitle: '01. TỔNG QUAN',
        items: [
          { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard }
        ]
      },
      {
        groupTitle: '02. QUẢN LÝ HỆ THỐNG',
        items: [
          { id: 'users', label: 'Người dùng', icon: Users, requiredPermission: 'users.read' },
          { id: 'roles', label: 'Nhóm & Vai trò', icon: Shield, requiredPermission: 'roles.manage' },
          { id: 'permissions', label: 'Phân quyền', icon: Key, requiredPermission: 'permissions.manage' },
          { id: 'audit_logs', label: 'Nhật ký hệ thống', icon: ClipboardCheck, requiredPermission: 'audit.read' }
        ]
      },
      {
        groupTitle: '03. ĐÀO TẠO & NỘI DUNG',
        items: [
          { id: 'courses_mgmt', label: 'Khóa học', icon: BookOpen, requiredPermission: 'courses.read' },
          { id: 'classes_mgmt', label: 'Lớp học', icon: Layers, requiredPermission: 'classes.read' },
          { id: 'teaching_schedule', label: 'Lịch giảng dạy', icon: Calendar, requiredPermission: 'schedules.read' },
          { id: 'lessons_mgmt', label: 'Bài giảng', icon: BookOpen, requiredPermission: 'lessons.read' },
          { id: 'assignments_mgmt', label: 'Bài tập & Kiểm tra', icon: CheckSquare, requiredPermission: 'assignments.read' },
          { id: 'question_bank', label: 'Ngân hàng câu hỏi', icon: Database, requiredPermission: 'questions.read' },
          { id: 'exams', label: 'Đề thi', icon: ClipboardCheck, requiredPermission: 'exams.read' },
          { id: 'media_library', label: 'Tài liệu & Media', icon: FolderArchive, requiredPermission: 'resources.read' },
          { id: 'learning_sources', label: 'Trung Tâm Nguồn Học Liệu', icon: FolderArchive, requiredPermission: 'resources.read' },
          { id: 'review_queue', label: 'Nội Dung Chờ Kiểm Duyệt', icon: ClipboardCheck, requiredPermission: 'resources.manage' },
          { id: 'tinhocgenz_studio', label: 'Kho Tài Liệu TIN HỌC GEN Z', icon: Database, requiredPermission: 'resources.read' },
          { id: 'sync_history', label: 'Lịch Sử Đồng Bộ', icon: ClipboardCheck, requiredPermission: 'audit.read' },
          { id: 'quality_reports', label: 'Báo Cáo Chất Lượng', icon: BarChart3, requiredPermission: 'reports.read' },
          { id: 'failing_sources', label: 'Nguồn Bị Lỗi', icon: FolderArchive, requiredPermission: 'resources.read' },
          { id: 'automation_settings', label: 'Thiết Lập Tự Động Hóa', icon: Settings, requiredPermission: 'system.settings' }
        ]
      },
      {
        groupTitle: '04. HỌC VIÊN & GIẢNG VIÊN',
        items: [
          { id: 'students_mgmt', label: 'Học viên', icon: Users, requiredPermission: 'students.read' },
          { id: 'teachers_mgmt', label: 'Giảng viên', icon: Briefcase, requiredPermission: 'teachers.read' },
          { id: 'attendance_mgmt', label: 'Điểm danh', icon: QrCode, requiredPermission: 'attendance.read' },
          { id: 'certificates', label: 'Quản Lý & Cấp Chứng Chỉ', icon: Award, requiredPermission: 'certificates.read' }
        ]
      },
      {
        groupTitle: '05. TÀI CHÍNH & VẬN HÀNH',
        items: [
          { id: 'tuition_enrollment', label: 'Đăng ký & Học phí', icon: CreditCard, requiredPermission: 'enrollments.read' },
          { id: 'revenue_stats', label: 'Doanh thu & Thống kê', icon: TrendingUp, requiredPermission: 'finance.read' },
          { id: 'crm_support', label: 'CRM & Chăm sóc HV', icon: Headphones, requiredPermission: 'crm.read' }
        ]
      },
      {
        groupTitle: '06. AI & DỮ LIỆU',
        items: [
          { id: 'ai_generator', label: 'AI Content Engine', icon: Sparkles, requiredPermission: 'ai.content' },
          { id: 'data_analytics', label: 'Phân tích dữ liệu', icon: BarChart3, requiredPermission: 'analytics.read' },
          { id: 'reports', label: 'Báo cáo', icon: BarChart3, requiredPermission: 'reports.read' }
        ]
      },
      {
        groupTitle: '07. HỆ THỐNG',
        items: [
          { id: 'integrations', label: 'Tích hợp', icon: Share2, requiredPermission: 'system.integrations' },
          { id: 'system_settings', label: 'Cài đặt', icon: Settings, requiredPermission: 'system.settings' },
          { id: 'backup_security', label: 'Bảo mật & Sao lưu', icon: Lock, requiredPermission: 'system.security' }
        ]
      }
    ];

    // Filter items based on user permissions
    return rawGroups.map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (!item.requiredPermission) return true;
        return hasPermission(currentUser, item.requiredPermission);
      })
    })).filter(group => group.items.length > 0);
  };

  // ── 3. TEACHER NAVIGATION (Exact 15 Canonical Items from Spec) ──
  const getTeacherItems = (): NavItem[] => [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
    { id: 'classes', label: 'Lớp học', icon: Layers },
    { id: 'lessons', label: 'Bài giảng', icon: BookOpen },
    { id: 'students', label: 'Học viên', icon: Users },
    { id: 'assignments', label: 'Bài tập', icon: CheckSquare, badge: 'Cần chấm', badgeColor: '#FEF3C7' },
    { id: 'question_bank', label: 'Ngân hàng câu hỏi', icon: Database },
    { id: 'exams', label: 'Đề thi', icon: ClipboardCheck },
    { id: 'grading', label: 'Chấm điểm', icon: Award },
    { id: 'schedule', label: 'Lịch dạy', icon: Calendar },
    { id: 'live', label: 'Lớp trực tuyến', icon: Video },
    { id: 'attendance', label: 'Điểm danh QR', icon: QrCode },
    { id: 'library', label: 'Thư viện', icon: FolderArchive },
    { id: 'analytics', label: 'Thống kê', icon: BarChart3 },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'profile', label: 'Hồ sơ giảng viên', icon: User }
  ];

  // ── 4. GIAO VU NAVIGATION (Exact 14 Canonical Items from Spec) ──
  const getGiaoVuItems = (): NavItem[] => [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'classes', label: 'Quản lý lớp học', icon: Layers },
    { id: 'schedules', label: 'Lịch & phân công GV', icon: Calendar },
    { id: 'students', label: 'Quản lý học viên', icon: Users },
    { id: 'teachers', label: 'Giảng viên', icon: Briefcase },
    { id: 'exams', label: 'Thi & chứng chỉ', icon: Award },
    { id: 'enrollments', label: 'Duyệt đăng ký', icon: CheckSquare },
    { id: 'payments', label: 'Học phí & thanh toán', icon: CreditCard },
    { id: 'attendance', label: 'Điểm danh', icon: QrCode },
    { id: 'student_care', label: 'Chăm sóc học viên', icon: Headphones },
    { id: 'support', label: 'Yêu cầu hỗ trợ', icon: HelpCircle },
    { id: 'rooms', label: 'Phòng học & thiết bị', icon: Settings },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'reports', label: 'Báo cáo vận hành', icon: BarChart3 }
  ];

  const sidebarWidth = isCollapsed ? '72px' : '232px';
  const isStudent = role === 'student';
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isTeacher = role === 'teacher';
  const isGiaoVu = role === 'giaovu' || role === 'academic_staff';

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
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflowY: 'auto'
        }}
      >
        {/* ── Top Master Logo Area (Height ~72px, Object-fit Contain) ── */}
        <div style={{
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          padding: isCollapsed ? '0 8px' : '0 18px',
          borderBottom: isAdmin ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
          background: isAdmin ? '#081D38' : '#FFFFFF',
          flexShrink: 0
        }}>
          <BrandLogo
            variant={isAdmin ? 'dark' : 'horizontal'}
            height={isCollapsed ? 32 : 40}
          />
        </div>

        {/* ── Navigation Content ── */}
        <div style={{ padding: isCollapsed ? '16px 8px' : '16px 12px', flex: 1 }}>
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
                      minHeight: '42px',
                      padding: isCollapsed ? '10px 0' : '9px 12px',
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive ? '#0057B8' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#475569',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                      position: 'relative'
                    }}
                  >
                    <Icon size={18} color={isActive ? '#FFFFFF' : '#64748B'} />
                    {!isCollapsed && (
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </span>
                    )}
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

          {isTeacher && (
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {getTeacherItems().map((item) => {
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
                      minHeight: '40px',
                      padding: isCollapsed ? '9px 0' : '8px 12px',
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive ? '#0057B8' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#334155',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '13px',
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
                        e.currentTarget.style.color = '#334155';
                      }
                    }}
                  >
                    <Icon size={18} color={isActive ? '#FFFFFF' : '#64748B'} />
                    {!isCollapsed && (
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </span>
                    )}
                    {item.badge && !isCollapsed && (
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: item.badgeColor || '#EFF6FF',
                        color: '#92400E'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {isGiaoVu && (
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {getGiaoVuItems().map((item) => {
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
                      minHeight: '40px',
                      padding: isCollapsed ? '9px 0' : '8px 12px',
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive ? '#0057B8' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#334155',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '13px',
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
                        e.currentTarget.style.color = '#334155';
                      }
                    }}
                  >
                    <Icon size={18} color={isActive ? '#FFFFFF' : '#64748B'} />
                    {!isCollapsed && (
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {isAdmin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {getAdminGroups().map((group, gIdx) => (
                <div key={gIdx}>
                  {group.groupTitle && !isCollapsed && (
                    <div style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      color: '#93C5FD',
                      padding: '4px 10px 6px',
                      textTransform: 'uppercase'
                    }}>
                      {group.groupTitle}
                    </div>
                  )}

                  <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id || (item.id === 'overview' && activeTab === '');

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
                            gap: '10px',
                            width: '100%',
                            minHeight: '36px',
                            padding: isCollapsed ? '8px 0' : '7px 10px',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            borderRadius: '6px',
                            border: 'none',
                            background: isActive ? '#0057B8' : 'transparent',
                            color: isActive ? '#FFFFFF' : '#94A3B8',
                            fontWeight: isActive ? 600 : 400,
                            fontSize: '12.5px',
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
                          <Icon size={16} color={isActive ? '#FFFFFF' : '#94A3B8'} />
                          {!isCollapsed && (
                            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.label}
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
        </div>

        {/* ── Bottom Section: Support Card & Version Copyright ── */}
        {!isCollapsed && isStudent && (
          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              background: '#F8FAFD',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#EFF6FF',
                color: '#0057B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 6px'
              }}>
                <Headphones size={16} />
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0B2545', marginBottom: '2px' }}>
                Cần hỗ trợ?
              </div>
              <button
                onClick={onOpenConsultation}
                style={{
                  width: '100%',
                  padding: '6px 0',
                  borderRadius: '6px',
                  border: '1px solid #0057B8',
                  background: '#FFFFFF',
                  color: '#0057B8',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  marginTop: '6px'
                }}
              >
                <span>Tư vấn ngay</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Footer for Admin */}
        {!isCollapsed && isAdmin && (
          <div style={{
            padding: '14px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '11px',
            color: '#93C5FD',
            lineHeight: 1.4
          }}>
            <div style={{ fontWeight: 600, color: '#FFFFFF' }}>TINHOCGENZ ADMIN</div>
            <div style={{ color: '#94A3B8' }}>v2.2.0 • {currentUser?.role === 'super_admin' ? 'Super Admin' : 'Quản trị viên'}</div>
          </div>
        )}
      </aside>
    </>
  );
};
