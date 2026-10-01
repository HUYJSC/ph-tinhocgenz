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
  XCircle
} from 'lucide-react';
import type { ElementType } from 'react';
import type { UserProfile } from '../types/auth';
import { hasPermission, type UserPermission } from '../types/rbac';
import type { AdminPortalSubTab } from '../components/admin/AdminPortal';

/**
 * Canonical admin information architecture.
 *
 * `tab` deliberately remains an existing AdminPortalSubTab so the new
 * navigation can be rolled out without changing API contracts or the legacy
 * content renderer. `path` is the canonical URL; `legacyIds` keeps old
 * bookmarks and callbacks working.
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
      { tab: 'overview', label: 'Tổng quan', path: 'dashboard', icon: LayoutDashboard, legacyIds: ['dashboard', 'admin'] }
    ]
  },
  {
    id: 'user-management',
    label: 'User Management',
    icon: Users,
    items: [
      { tab: 'student_directory', label: 'Học viên', path: 'user-management/students', icon: Users, requiredPermission: 'students.read', legacyIds: ['users', 'students_mgmt', 'students'] },
      { tab: 'teachers', label: 'Giảng viên & Nhân sự', path: 'user-management/teachers', icon: UserCheck, requiredPermission: 'teachers.read', legacyIds: ['teachers_mgmt', 'teachers', 'roles', 'permissions', 'staff'] }

    ]
  },
  {
    id: 'learning-management',
    label: 'Learning Management',
    icon: BookOpen,
    items: [
      { tab: 'courses', label: 'Courses & Curriculum', path: 'learning-management/courses', icon: BookOpen, requiredPermission: 'courses.read', legacyIds: ['courses_mgmt', 'lessons_mgmt'] },
      { tab: 'schedules', label: 'Classes & Schedule', path: 'learning-management/classes', icon: Calendar, requiredPermission: 'schedules.read', legacyIds: ['classes_mgmt', 'teaching_schedule', 'schedules', 'schedule'] },
      { tab: 'meet_hub', label: 'Live Classroom', path: 'learning-management/live', icon: Video, requiredPermission: 'classes.read', legacyIds: ['live', 'meet_hub'] }
    ]
  },
  {
    id: 'assessment',
    label: 'Assessment',
    icon: CheckSquare,
    items: [
      { tab: 'exams', label: 'Exams & Quizzes', path: 'assessment/exams', icon: CheckSquare, requiredPermission: 'exams.read', legacyIds: ['exams'] },
      { tab: 'question_bank', label: 'Question Bank', path: 'assessment/question-bank', icon: FileSpreadsheet, requiredPermission: 'questions.read', legacyIds: ['question_bank'] },
      { tab: 'grading_assignments', label: 'Assignments & Grading', path: 'assessment/assignments', icon: CheckSquare, requiredPermission: 'assignments.read', legacyIds: ['assignments_mgmt', 'grading_assignments', 'assignments', 'grading'] },
      { tab: 'certificates', label: 'Certificates', path: 'assessment/certificates', icon: Award, requiredPermission: 'certificates.read', legacyIds: ['certificates'] }
    ]
  },
  {
    id: 'content-library',
    label: 'Content Library',
    icon: Globe,
    items: [
      { tab: 'learning_sources', label: 'All Content', path: 'content-library/all', icon: Globe, requiredPermission: 'resources.read', legacyIds: ['media_library', 'learning_sources'] },
      { tab: 'review_queue', label: 'Review Queue', path: 'content-library/review', icon: Clock, requiredPermission: 'resources.manage', legacyIds: ['review_queue'] },
      { tab: 'tinhocgenz_studio', label: 'Collections & Published', path: 'content-library/published', icon: Award, requiredPermission: 'resources.read', legacyIds: ['tinhocgenz_studio'] },
      { tab: 'sync_history', label: 'Sources & Sync', path: 'content-library/sync', icon: RefreshCw, requiredPermission: 'audit.read', legacyIds: ['sync_history'] },
      { tab: 'failing_sources', label: 'Content Health', path: 'content-library/health', icon: XCircle, requiredPermission: 'resources.read', legacyIds: ['failing_sources'] }
    ]
  },
  {
    id: 'ai-center',
    label: 'AI Center',
    icon: Sparkles,
    items: [
      { tab: 'automation_settings', label: 'AI Workspace & Automations', path: 'ai-center', icon: Sparkles, requiredPermission: 'ai.content', legacyIds: ['ai_generator', 'automation_settings'] }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    items: [
      { tab: 'quality_reports', label: 'Executive & Learning Reports', path: 'analytics', icon: BarChart3, requiredPermission: 'reports.read', legacyIds: ['data_analytics', 'reports', 'quality_reports', 'revenue_stats'] },
      { tab: 'early_warning', label: 'At-risk Students', path: 'analytics/at-risk', icon: AlertTriangle, requiredPermission: 'analytics.read', legacyIds: ['early_warning'] }
    ]
  },
  {
    id: 'system',
    label: 'System',
    icon: Settings,
    items: [
      { tab: 'seo_center', label: 'Settings, Security & Integrations', path: 'system', icon: Settings, requiredPermission: 'system.settings', legacyIds: ['integrations', 'system_settings', 'backup_security', 'seo_center', 'settings'] }
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
  ['audit_logs', 'sync_history']
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
  // `admin` is the current production owner account. Treat it as the
  // transitional Super Admin alias for navigation until account migration
  // classifies each legacy admin explicitly.
  const effectiveUser = user?.role === 'admin' ? { ...user, role: 'super_admin' as const } : user;
  return ADMIN_NAVIGATION
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.requiredPermission || !effectiveUser || hasPermission(effectiveUser, item.requiredPermission))
    }))
    .filter(section => section.items.length > 0);
}
