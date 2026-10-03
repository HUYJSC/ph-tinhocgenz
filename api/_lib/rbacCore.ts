/**
 * RBAC Core Engine — TINHOCGENZ Commercial LMS
 * Standardized roles, permissions, role normalization, and default credentials.
 */

export type CanonicalRole = 'SUPER_ADMIN' | 'ADMIN' | 'ACADEMIC' | 'TEACHER' | 'STUDENT';

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'academic'
  | 'academic_manager'
  | 'academic_staff'
  | 'giaovu'
  | 'teacher'
  | 'student';

export const ALL_SYSTEM_PERMISSIONS = [
  // User Management
  'users.read',
  'users.create',
  'users.update',
  'users.lock',
  'roles.manage',
  'permissions.manage',
  'audit.read',
  'audit.export',
  // Courses & Training
  'courses.read',
  'courses.create',
  'courses.edit',
  'courses.publish',
  'courses.delete',
  'classes.read',
  'classes.manage',
  'schedules.read',
  'schedules.manage',
  'lessons.read',
  'lessons.manage',
  'resources.read',
  'resources.manage',
  // Assessment & Grading
  'assignments.read',
  'assignments.grade',
  'assignments.manage',
  'questions.read',
  'questions.manage',
  'exams.read',
  'exams.manage',
  // Students & Teachers
  'students.read',
  'students.manage',
  'teachers.read',
  'teachers.manage',
  // Attendance
  'attendance.read',
  'attendance.take',
  'attendance.override',
  'attendance.manage',
  // Certificates & Blockchain
  'certificates.read',
  'certificates.issue',
  'certificates.revoke',
  // Finance & Enrollments
  'enrollments.read',
  'enrollments.approve',
  'payments.read',
  'payments.manage',
  'finance.read',
  // CRM & Support
  'crm.read',
  'crm.manage',
  // AI & Analytics
  'ai.content',
  'ai.assistant',
  'analytics.read',
  'reports.read',
  'reports.export',
  // System Settings
  'system.health.read',
  'system.settings',
  'system.security',
  'system.backups',
  'system.integrations'
] as const;

export type SystemPermission = typeof ALL_SYSTEM_PERMISSIONS[number];

export const DEFAULT_SUPER_ADMIN_PERMISSIONS: string[] = [...ALL_SYSTEM_PERMISSIONS];

export const DEFAULT_ADMIN_PERMISSIONS: string[] = [
  'users.read', 'users.create', 'users.update',
  'courses.read', 'courses.create', 'courses.edit', 'courses.publish',
  'classes.read', 'classes.manage',
  'schedules.read', 'schedules.manage',
  'lessons.read', 'lessons.manage',
  'resources.read', 'resources.manage',
  'assignments.read', 'assignments.grade', 'assignments.manage',
  'questions.read', 'questions.manage',
  'exams.read', 'exams.manage',
  'students.read', 'students.manage',
  'teachers.read', 'teachers.manage',
  'attendance.read', 'attendance.take', 'attendance.override', 'attendance.manage',
  'certificates.read', 'certificates.issue',
  'enrollments.read', 'enrollments.approve',
  'crm.read', 'crm.manage',
  'ai.content', 'ai.assistant',
  'analytics.read', 'reports.read', 'reports.export'
];

export const DEFAULT_TEACHER_PERMISSIONS: string[] = [
  'courses.read',
  'classes.read',
  'schedules.read',
  'lessons.read', 'lessons.manage',
  'assignments.read', 'assignments.grade', 'assignments.manage',
  'questions.read', 'questions.manage',
  'exams.read',
  'attendance.read', 'attendance.take',
  'students.read',
  'ai.assistant',
  'analytics.read'
];

export const DEFAULT_ACADEMIC_PERMISSIONS: string[] = [
  'courses.read',
  'classes.read', 'classes.manage',
  'schedules.read', 'schedules.manage',
  'students.read', 'students.manage',
  'teachers.read',
  'exams.read', 'certificates.read',
  'enrollments.read', 'enrollments.approve',
  'payments.read',
  'attendance.read', 'attendance.override',
  'crm.read', 'crm.manage',
  'ai.assistant',
  'reports.read'
];

export const DEFAULT_STUDENT_PERMISSIONS: string[] = [
  'courses.read',
  'classes.read',
  'schedules.read',
  'lessons.read',
  'resources.read',
  'assignments.read',
  'exams.read',
  'attendance.read',
  'certificates.read',
  'ai.assistant'
];

/**
 * Standardize any role string into canonical lowercase role.
 * Handles variations like TEACHER, Teacher, gv, giangvien, sub_admin, giaovu, etc.
 */
export function normalizeRole(roleInput?: string | null): 'super_admin' | 'admin' | 'academic' | 'teacher' | 'student' {
  if (!roleInput) return 'student';
  const clean = roleInput.toString().trim().toLowerCase().replace(/[\s\-_]/g, '');
  if (clean === 'superadmin') return 'super_admin';
  if (clean === 'admin' || clean === 'quantri' || clean === 'quantrivien' || clean === 'subadmin') return 'admin';
  if (
    clean === 'academic' ||
    clean === 'academicmanager' ||
    clean === 'academicstaff' ||
    clean === 'giaovu' ||
    clean === 'hocvu' ||
    clean === 'nhanvienhocvu'
  ) {
    return 'academic';
  }
  if (
    clean === 'teacher' ||
    clean === 'giangvien' ||
    clean === 'giaovien' ||
    clean === 'gv' ||
    clean === 'lecturer'
  ) {
    return 'teacher';
  }
  if (clean === 'student' || clean === 'hocvien' || clean === 'hv') return 'student';
  return 'student';
}

/**
 * Get canonical uppercase role enum name
 */
export function getRoleCanonicalName(roleInput?: string | null): CanonicalRole {
  const norm = normalizeRole(roleInput);
  switch (norm) {
    case 'super_admin': return 'SUPER_ADMIN';
    case 'admin': return 'ADMIN';
    case 'academic': return 'ACADEMIC';
    case 'teacher': return 'TEACHER';
    case 'student': return 'STUDENT';
  }
}

/**
 * Get dedicated dashboard redirect URL for role
 */
export function getRoleRedirectUrl(roleInput?: string | null): string {
  const norm = normalizeRole(roleInput);
  switch (norm) {
    case 'super_admin':
    case 'admin':
      return '/admin';
    case 'academic':
      return '/academic';
    case 'teacher':
      return '/teacher';
    case 'student':
    default:
      return '/student';
  }
}

/**
 * Get permissions array for given role
 */
export function getRolePermissions(roleInput?: string | null): string[] {
  const norm = normalizeRole(roleInput);
  switch (norm) {
    case 'super_admin': return DEFAULT_SUPER_ADMIN_PERMISSIONS;
    case 'admin': return DEFAULT_ADMIN_PERMISSIONS;
    case 'academic': return DEFAULT_ACADEMIC_PERMISSIONS;
    case 'teacher': return DEFAULT_TEACHER_PERMISSIONS;
    case 'student': return DEFAULT_STUDENT_PERMISSIONS;
  }
}

/**
 * Check if a user has a specific permission
 */
export function checkUserPermission(
  userRole?: string | null,
  userPermissions?: string[] | null,
  requiredPermission?: string
): boolean {
  if (!requiredPermission) return true;
  const normRole = normalizeRole(userRole);
  if (normRole === 'super_admin') return true;

  if (Array.isArray(userPermissions) && userPermissions.length > 0) {
    return userPermissions.includes(requiredPermission);
  }

  const defaultPerms = getRolePermissions(normRole);
  return defaultPerms.includes(requiredPermission);
}
