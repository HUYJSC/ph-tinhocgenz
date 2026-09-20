/**
 * RBAC 2.0 Permission Engine — TINHOCGENZ LMS
 * Fine-grained access control with strict permission checking.
 */

export type UserPermission =
  // Quản lý người dùng
  | 'users.read'
  | 'users.create'
  | 'users.update'
  | 'users.lock'
  // Vai trò & Phân quyền
  | 'roles.manage'
  | 'permissions.manage'
  // Nhật ký
  | 'audit.read'
  | 'audit.export'
  // Đào tạo & Nội dung
  | 'courses.read'
  | 'courses.create'
  | 'courses.edit'
  | 'courses.publish'
  | 'courses.delete'
  | 'classes.read'
  | 'classes.manage'
  | 'schedules.read'
  | 'schedules.manage'
  | 'lessons.read'
  | 'lessons.manage'
  | 'resources.read'
  | 'resources.manage'
  // Khảo thí & Chấm điểm
  | 'assignments.read'
  | 'assignments.grade'
  | 'assignments.manage'
  | 'questions.read'
  | 'questions.manage'
  | 'exams.read'
  | 'exams.manage'
  // Học viên & Giảng viên
  | 'students.read'
  | 'students.manage'
  | 'teachers.read'
  | 'teachers.manage'
  // Điểm danh
  | 'attendance.read'
  | 'attendance.take'
  | 'attendance.override'
  | 'attendance.manage'
  // Chứng chỉ
  | 'certificates.read'
  | 'certificates.issue'
  | 'certificates.revoke'
  // Tài chính & Đăng ký
  | 'enrollments.read'
  | 'enrollments.approve'
  | 'payments.read'
  | 'payments.manage'
  | 'finance.read'
  // CRM
  | 'crm.read'
  | 'crm.manage'
  // AI & Báo cáo
  | 'ai.content'
  | 'ai.assistant'
  | 'analytics.read'
  | 'reports.read'
  | 'reports.export'
  // Hệ thống
  | 'system.health.read'
  | 'system.settings'
  | 'system.security'
  | 'system.backups'
  | 'system.integrations';

export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: {
    key: UserPermission;
    label: string;
    action: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'manage';
  }[];
}

export const ALL_PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'users',
    name: 'Quản lý người dùng',
    description: 'Quyền xem, tạo, sửa và khóa tài khoản',
    permissions: [
      { key: 'users.read', label: 'Xem danh sách', action: 'view' },
      { key: 'users.create', label: 'Tạo tài khoản', action: 'create' },
      { key: 'users.update', label: 'Sửa thông tin', action: 'edit' },
      { key: 'users.lock', label: 'Khóa / Mở khóa', action: 'delete' }
    ]
  },
  {
    id: 'courses',
    name: 'Khóa học & Nội dung',
    description: 'Quản lý chương trình đào tạo, bài giảng và tài liệu',
    permissions: [
      { key: 'courses.read', label: 'Xem khóa học', action: 'view' },
      { key: 'courses.create', label: 'Tạo khóa học', action: 'create' },
      { key: 'courses.edit', label: 'Chỉnh sửa khóa học', action: 'edit' },
      { key: 'courses.publish', label: 'Xuất bản khóa học', action: 'approve' },
      { key: 'courses.delete', label: 'Xóa khóa học', action: 'delete' },
      { key: 'lessons.manage', label: 'Quản lý bài giảng', action: 'manage' },
      { key: 'resources.manage', label: 'Quản lý tài nguyên media', action: 'manage' }
    ]
  },
  {
    id: 'classes',
    name: 'Lớp học & Lịch giảng dạy',
    description: 'Điều phối lớp học, phòng học và thời khóa biểu',
    permissions: [
      { key: 'classes.read', label: 'Xem lớp học', action: 'view' },
      { key: 'classes.manage', label: 'Quản lý lớp học', action: 'manage' },
      { key: 'schedules.read', label: 'Xem lịch giảng', action: 'view' },
      { key: 'schedules.manage', label: 'Điều phối lịch & phòng', action: 'manage' }
    ]
  },
  {
    id: 'assessments',
    name: 'Khảo thí & Chấm điểm',
    description: 'Ngân hàng câu hỏi, đề thi và chấm bài tập',
    permissions: [
      { key: 'questions.manage', label: 'Ngân hàng câu hỏi', action: 'manage' },
      { key: 'exams.manage', label: 'Quản lý đề thi', action: 'manage' },
      { key: 'assignments.grade', label: 'Chấm điểm bài tập', action: 'approve' },
      { key: 'assignments.manage', label: 'Quản lý bài tập', action: 'manage' }
    ]
  },
  {
    id: 'attendance',
    name: 'Điểm danh & Chuyên cần',
    description: 'Điểm danh QR động và xử lý ngoại lệ',
    permissions: [
      { key: 'attendance.read', label: 'Xem điểm danh', action: 'view' },
      { key: 'attendance.take', label: 'Mở điểm danh QR', action: 'create' },
      { key: 'attendance.override', label: 'Ghi đè điểm danh thủ công', action: 'approve' },
      { key: 'attendance.manage', label: 'Toàn quyền điểm danh', action: 'manage' }
    ]
  },
  {
    id: 'certificates',
    name: 'Chứng chỉ & Blockchain',
    description: 'Phôi mẫu và cấp phát chứng chỉ số',
    permissions: [
      { key: 'certificates.read', label: 'Xem chứng chỉ', action: 'view' },
      { key: 'certificates.issue', label: 'Cấp chứng chỉ mới', action: 'create' },
      { key: 'certificates.revoke', label: 'Thu hồi chứng chỉ', action: 'delete' }
    ]
  },
  {
    id: 'finance',
    name: 'Tài chính & Đăng ký',
    description: 'Doanh thu, thanh toán và duyệt đơn nhập học',
    permissions: [
      { key: 'enrollments.read', label: 'Xem đơn đăng ký', action: 'view' },
      { key: 'enrollments.approve', label: 'Duyệt đơn nhập học', action: 'approve' },
      { key: 'payments.read', label: 'Xem thanh toán', action: 'view' },
      { key: 'finance.read', label: 'Xem doanh thu & tài chính', action: 'view' },
      { key: 'payments.manage', label: 'Quản lý giao dịch', action: 'manage' }
    ]
  },
  {
    id: 'crm',
    name: 'CRM & Chăm sóc học viên',
    description: 'Hỗ trợ kỹ thuật và chăm sóc học viên yếu',
    permissions: [
      { key: 'crm.read', label: 'Xem ticket hỗ trợ', action: 'view' },
      { key: 'crm.manage', label: 'Xử lý ticket hỗ trợ', action: 'manage' },
      { key: 'students.manage', label: 'Quản lý hồ sơ học viên', action: 'manage' }
    ]
  },
  {
    id: 'ai_data',
    name: 'AI & Dữ liệu báo cáo',
    description: 'AI Trợ lý, phân tích chất lượng và trích xuất báo cáo',
    permissions: [
      { key: 'ai.content', label: 'Sử dụng AI Content Engine', action: 'create' },
      { key: 'ai.assistant', label: 'Sử dụng AI Copilot', action: 'view' },
      { key: 'analytics.read', label: 'Xem phân tích dữ liệu', action: 'view' },
      { key: 'reports.read', label: 'Xem báo cáo', action: 'view' },
      { key: 'reports.export', label: 'Xuất file báo cáo (Excel/CSV)', action: 'approve' }
    ]
  },
  {
    id: 'system',
    name: 'Hệ thống & Bảo mật',
    description: 'Cài đặt hệ thống, nhật ký audit, backup và tích hợp',
    permissions: [
      { key: 'system.health.read', label: 'Xem sức khỏe hệ thống', action: 'view' },
      { key: 'audit.read', label: 'Xem nhật ký hệ thống (Audit)', action: 'view' },
      { key: 'audit.export', label: 'Xuất nhật ký audit', action: 'approve' },
      { key: 'roles.manage', label: 'Quản lý vai trò', action: 'manage' },
      { key: 'permissions.manage', label: 'Phân quyền người dùng', action: 'manage' },
      { key: 'system.settings', label: 'Cài đặt tổng thể', action: 'manage' },
      { key: 'system.security', label: 'Bảo mật & Phiên làm việc', action: 'manage' },
      { key: 'system.backups', label: 'Sao lưu dữ liệu', action: 'manage' },
      { key: 'system.integrations', label: 'Quản lý tích hợp API', action: 'manage' }
    ]
  }
];

/**
 * Standard default permissions for roles
 */
export const DEFAULT_SUPER_ADMIN_PERMISSIONS: UserPermission[] = ALL_PERMISSION_GROUPS.flatMap(g =>
  g.permissions.map(p => p.key)
);

export const DEFAULT_ADMIN_PERMISSIONS: UserPermission[] = [
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

export const DEFAULT_TEACHER_PERMISSIONS: UserPermission[] = [
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

export const DEFAULT_ACADEMIC_STAFF_PERMISSIONS: UserPermission[] = [
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

/**
 * Fine-grained permission checker
 */
export function hasPermission(
  user: { role?: string; permissions?: (UserPermission | string)[] } | null | undefined,
  permission: UserPermission
): boolean {
  if (!user) return false;
  const role = (user.role || '').toLowerCase();
  
  // Super admin always has full privileges
  if (role === 'super_admin') return true;

  // Check explicit permission array if defined
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    return user.permissions.includes(permission);
  }

  // Fallback to role-based default permission set
  if (role === 'admin') {
    return DEFAULT_ADMIN_PERMISSIONS.includes(permission);
  }
  if (role === 'teacher') {
    return DEFAULT_TEACHER_PERMISSIONS.includes(permission);
  }
  if (role === 'academic_staff' || role === 'giaovu') {
    return DEFAULT_ACADEMIC_STAFF_PERMISSIONS.includes(permission);
  }

  return false;
}
