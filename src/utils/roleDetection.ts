import { StudentAccount, TeacherAccount } from '../types/auth';

export type DetectedRole = 'admin' | 'teacher' | 'student' | null;

/**
 * Danh sách các từ khóa nhận diện Quản trị viên hệ thống
 */
const ADMIN_KEYWORDS = [
  'admin',
  'admin01',
  'quantri',
  'quantrivien',
  '0332298065',
  '0988999888',
  'hdh.hutech@gmail.com',
  'admin@tinhocgenz.io.vn',
  'thầy huy',
  'thay huy',
  'quang huy',
  'thầy quang huy'
];

/**
 * Tự động nhận diện vai trò tài khoản từ tên đăng nhập / email / SĐT / mã người dùng
 */
export function detectRoleFromIdentifier(
  identifier: string,
  studentAccounts: StudentAccount[] = [],
  teacherAccounts: TeacherAccount[] = []
): DetectedRole {
  const clean = (identifier || '').trim().toLowerCase();
  if (!clean) return null;

  // 1. Nhận diện Quản trị viên
  if (ADMIN_KEYWORDS.some(k => clean === k || clean.startsWith('admin'))) {
    return 'admin';
  }

  const cleanPhone = clean.replace(/[\s.\-()+]/g, '');

  const matchedAdmin = teacherAccounts.find(t =>
    t.role === 'admin' && (
      t.teacherCode.toLowerCase() === clean ||
      t.name.toLowerCase() === clean ||
      (t.email && t.email.toLowerCase() === clean) ||
      (t.phone && t.phone.replace(/[\s.\-()+]/g, '') === cleanPhone)
    )
  );
  if (matchedAdmin) return 'admin';

  // 2. Nhận diện Giảng viên & Giáo vụ
  if (clean.startsWith('academic') || clean === 'giaovu' || clean === 'hocvu') {
    return 'teacher'; // Staff group
  }

  const matchedTeacher = teacherAccounts.find(t =>
    t.teacherCode.toLowerCase() === clean ||
    t.name.toLowerCase() === clean ||
    (t.email && t.email.toLowerCase() === clean) ||
    (t.phone && t.phone.replace(/[\s.\-()+]/g, '') === cleanPhone)
  );
  if (matchedTeacher || clean.startsWith('gv') || clean.startsWith('tch') || clean.startsWith('teacher')) {
    return 'teacher';
  }

  // 3. Nhận diện Học viên
  const matchedStudent = studentAccounts.find(s =>
    s.studentCode.toLowerCase() === clean ||
    s.name.toLowerCase() === clean ||
    (s.email && s.email.toLowerCase() === clean) ||
    (s.phone && s.phone.replace(/[\s.\-()+]/g, '') === cleanPhone)
  );
  if (matchedStudent || clean.startsWith('hv') || clean.startsWith('std') || clean.startsWith('thgz') || clean.startsWith('student')) {
    return 'student';
  }

  return null;
}

/**
 * Kiểm tra nhanh xem định danh có thuộc nhóm Cán bộ / Quản trị viên hay không
 */
export function isStaffIdentifier(
  identifier: string,
  teacherAccounts: TeacherAccount[] = []
): boolean {
  const role = detectRoleFromIdentifier(identifier, [], teacherAccounts);
  return role === 'admin' || role === 'teacher';
}

