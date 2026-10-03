import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckSquare,
  Clock,
  FileSpreadsheet,
  Globe,
  LayoutDashboard,
  RefreshCw,
  Settings,
  Sparkles,
  UserCheck,
  Users,
  Video,
  XCircle,
  Shield,
  Key
} from 'lucide-react';
import type { ElementType } from 'react';
import type { UserProfile } from '../types/auth';
import { hasPermission, type UserPermission } from '../types/rbac';
import type { AdminPortalSubTab } from '../components/admin/AdminPortal';

/**
 * Canonical admin information architecture.
 *
 * 6 Primary SaaS LMS Sections:
 * 1. Dashboard
 * 2. Users
 * 3. Training
 * 4. Security
 * 5. Reports
 * 6. System
 */
export interface AdminNavigationItem {
  tab: AdminPortalSubTab;
  label: string;
  path: string;
  icon: ElementType;
  requiredPermission?: UserPermission;
  legacyIds?: string[];
}

export interface AdminNavigationSection {
  id: string;
  label: string;
  icon: ElementType;
  items: AdminNavigationItem[];
}

export const ADMIN_NAVIGATION: AdminNavigationSection[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    items: [
      { tab: 'overview', label: 'Tổng quan hệ thống', path: 'dashboard', icon: LayoutDashboard, legacyIds: ['dashboard', 'admin', 'overview'] }
    ]
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    items: [
      { tab: 'student_directory', label: 'Học viên & Người dùng', path: 'users/students', icon: Users, requiredPermission: 'students.read', legacyIds: ['users', 'students_mgmt', 'students', 'student_directory'] },
      { tab: 'teachers', label: 'Giảng viên & Nhân sự', path: 'users/teachers', icon: UserCheck, requiredPermission: 'teachers.read', legacyIds: ['teachers_mgmt', 'teachers', 'roles', 'permissions', 'staff'] }
    ]
  },
  {
    id: 'training',
    label: 'Training',
    icon: BookOpen,
    items: [
      { tab: 'courses', label: 'Khóa học & Chương trình', path: 'training/courses', icon: BookOpen, requiredPermission: 'courses.read', legacyIds: ['courses_mgmt', 'lessons_mgmt', 'courses'] },
      { tab: 'exams', label: 'Đề thi & Khảo thí', path: 'training/exams', icon: CheckSquare, requiredPermission: 'exams.read', legacyIds: ['exams'] },
      { tab: 'schedules', label: 'Lớp học & Lịch giảng dạy', path: 'training/classes', icon: Calendar, requiredPermission: 'schedules.read', legacyIds: ['classes_mgmt', 'teaching_schedule', 'schedules', 'schedule'] },
      { tab: 'grading_assignments', label: 'Bài tập & Chấm điểm', path: 'training/assignments', icon: CheckSquare, requiredPermission: 'assignments.read', legacyIds: ['assignments_mgmt', 'grading_assignments', 'assignments', 'grading'] },
      { tab: 'question_bank', label: 'Ngân hàng câu hỏi', path: 'training/question-bank', icon: FileSpreadsheet, requiredPermission: 'questions.read', legacyIds: ['question_bank'] },
      { tab: 'learning_sources', label: 'Trung Tâm Nguồn Học Liệu', path: 'training/sources', icon: Globe, requiredPermission: 'resources.read', legacyIds: ['media_library', 'learning_sources'] },
      { tab: 'review_queue', label: 'Nội Dung Chờ Kiểm Duyệt', path: 'training/review', icon: Clock, requiredPermission: 'resources.manage', legacyIds: ['review_queue'] },
      { tab: 'tinhocgenz_studio', label: 'Kho Tài Liệu TIN HỌC GEN Z', path: 'training/published', icon: Award, requiredPermission: 'resources.read', legacyIds: ['tinhocgenz_studio'] }
    ]
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    items: [
      { tab: 'security_blockchain', label: 'Blockchain & Bảo mật số', path: 'security/blockchain', icon: Shield, requiredPermission: 'system.security', legacyIds: ['security', 'blockchain', 'security_blockchain', 'digital_identity'] },
      { tab: 'audit_logs', label: 'Nhật ký kiểm toán (Audit Log)', path: 'security/audit-logs', icon: RefreshCw, requiredPermission: 'audit.read', legacyIds: ['audit_logs', 'audit', 'security_audit'] },
      { tab: 'permissions', label: 'Phân quyền & Kiểm soát truy cập', path: 'security/permissions', icon: Key, requiredPermission: 'permissions.manage', legacyIds: ['permissions', 'roles', 'rbac'] }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    items: [
      { tab: 'quality_reports', label: 'Báo cáo chất lượng & Vận hành', path: 'reports/quality', icon: BarChart3, requiredPermission: 'reports.read', legacyIds: ['data_analytics', 'reports', 'quality_reports', 'revenue_stats'] },
      { tab: 'certificates', label: 'Quản Lý & Cấp Chứng Chỉ', path: 'reports/certificates', icon: Award, requiredPermission: 'certificates.read', legacyIds: ['certificates'] },
      { tab: 'early_warning', label: 'Cảnh báo học tập & Điểm danh', path: 'reports/early-warning', icon: AlertTriangle, requiredPermission: 'analytics.read', legacyIds: ['early_warning', 'attendance', 'attendance_mgmt'] },
      { tab: 'sync_history', label: 'Lịch Sử Đồng Bộ', path: 'reports/sync', icon: RefreshCw, requiredPermission: 'audit.read', legacyIds: ['sync_history'] },
      { tab: 'failing_sources', label: 'Nguồn Bị Lỗi', path: 'reports/health', icon: XCircle, requiredPermission: 'resources.read', legacyIds: ['failing_sources'] }
    ]
  },
  {
    id: 'system',
    label: 'System',
    icon: Settings,
    items: [
      { tab: 'seo_center', label: 'Cấu hình hệ thống & Cài đặt', path: 'system/settings', icon: Settings, requiredPermission: 'system.settings', legacyIds: ['integrations', 'system_settings', 'backup_security', 'seo_center', 'settings'] },
      { tab: 'automation_settings', label: 'Thiết Lập Tự Động Hóa & AI', path: 'system/automation', icon: Sparkles, requiredPermission: 'ai.content', legacyIds: ['ai_generator', 'automation_settings', 'ai_center'] },
      { tab: 'meet_hub', label: 'Phòng học trực tuyến Google Meet', path: 'system/live', icon: Video, requiredPermission: 'classes.read', legacyIds: ['live', 'meet_hub'] }
    ]
  }
];

export const ADMIN_NAVIGATION_ITEMS = ADMIN_NAVIGATION.flatMap(section => section.items);

const legacyToTab = new Map<string, AdminPortalSubTab>();
ADMIN_NAVIGATION_ITEMS.forEach(item => {
  legacyToTab.set(item.tab, item.tab);
  legacyToTab.set(item.path, item.tab);
  item.legacyIds?.forEach(id => legacyToTab.set(id, item.tab));
});

// Existing routes which were previously resolved by App.tsx but not exposed
// as a first-class menu item are retained here as compatibility aliases.
[
  ['students', 'student_directory'],
  ['teachers', 'teachers'],
  ['staff', 'teachers'],
  ['user-management/students', 'student_directory'],
  ['user-management/teachers', 'teachers'],
  ['tuition_enrollment', 'schedules'],
  ['attendance_mgmt', 'early_warning'],
  ['attendance', 'early_warning'],
  ['crm_support', 'meet_hub'],
  ['media_library', 'learning_sources'],
  ['lessons_mgmt', 'courses'],
  ['audit_logs', 'audit_logs'],
  ['security', 'security_blockchain'],
  ['blockchain', 'security_blockchain']
].forEach(([legacyId, target]) => legacyToTab.set(legacyId, target as AdminPortalSubTab));

export function resolveAdminPortalTab(value?: string | null): AdminPortalSubTab {
  if (!value) return 'overview';
  return legacyToTab.get(value.toLowerCase()) || 'overview';
}

export function getAdminNavigationItem(tabOrPath?: string | null): AdminNavigationItem | undefined {
  const tab = resolveAdminPortalTab(tabOrPath);
  return ADMIN_NAVIGATION_ITEMS.find(item => item.tab === tab);
}

export function getAdminPathForTab(tabOrPath?: string | null): string {
  return getAdminNavigationItem(tabOrPath)?.path || 'dashboard';
}

export function getAdminNavigationForUser(user?: UserProfile | null): AdminNavigationSection[] {
  const effectiveUser = user?.role === 'admin' ? { ...user, role: 'super_admin' as const } : user;
  return ADMIN_NAVIGATION
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.requiredPermission || !effectiveUser || hasPermission(effectiveUser, item.requiredPermission))
    }))
    .filter(section => section.items.length > 0);
}
