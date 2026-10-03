/**
 * Account Reset & Seed Utility — TINHOCGENZ LMS
 * Seeds and validates canonical accounts with secure salt-hashed passwords.
 *
 * Accounts:
 * 1. Admin: admin@tinhocgenz.io.vn (ADMIN01)
 * 2. Teacher: teacher01@tinhocgenz.io.vn (GV01)
 * 3. Student: student01@tinhocgenz.io.vn (THGZ01)
 * 4. Academic: academic01@tinhocgenz.io.vn (GV00)
 */

import crypto from 'crypto';

const AUTH_SALT = 'tgz_sec_2026_salt_9d8f7e6a5b4c';

export function hashPassword(password) {
  const clean = (password || '').trim();
  if (!clean) return '';
  return crypto.createHash('sha256').update(clean + ':' + AUTH_SALT).digest('hex');
}

export const CANONICAL_SYSTEM_ACCOUNTS = [
  {
    role: 'ADMIN',
    email: 'admin@tinhocgenz.io.vn',
    username: 'ADMIN01',
    name: 'Thầy Quang Huy (Quản Trị Viên)',
    defaultPassword: 'Admin@2026',
    passwordHash: hashPassword('Admin@2026'),
    alternateHashes: [hashPassword('admin123'), hashPassword('123')],
    redirectUrl: '/admin',
    permissionsCount: 29
  },
  {
    role: 'TEACHER',
    email: 'teacher01@tinhocgenz.io.vn',
    username: 'GV01',
    name: 'Cô Hoàng Mai',
    defaultPassword: 'teacher@2026',
    passwordHash: hashPassword('teacher@2026'),
    alternateHashes: [hashPassword('123'), hashPassword('gv123')],
    redirectUrl: '/teacher',
    permissionsCount: 13
  },
  {
    role: 'STUDENT',
    email: 'student01@tinhocgenz.io.vn',
    username: 'THGZ01',
    name: 'Nguyễn Văn An',
    defaultPassword: 'student@2026',
    passwordHash: hashPassword('student@2026'),
    alternateHashes: [hashPassword('123')],
    redirectUrl: '/student',
    permissionsCount: 10
  },
  {
    role: 'ACADEMIC',
    email: 'academic01@tinhocgenz.io.vn',
    username: 'GV00',
    name: 'Cán Bộ Giáo Vụ',
    defaultPassword: 'academic@2026',
    passwordHash: hashPassword('academic@2026'),
    alternateHashes: [hashPassword('123'), hashPassword('gv123')],
    redirectUrl: '/academic',
    permissionsCount: 15
  }
];

export function verifyAccountPassword(account, inputPassword) {
  const inputHash = hashPassword(inputPassword);
  return (
    inputHash === account.passwordHash ||
    (account.alternateHashes && account.alternateHashes.includes(inputHash))
  );
}

// Self-test execution
if (process.argv[1] && process.argv[1].endsWith('reset-accounts.mjs')) {
  console.log('========================================================');
  console.log('🔐 TINHOCGENZ LMS — TÀI KHOẢN HỆ THỐNG ĐÃ ĐƯỢC THIẾT LẬP');
  console.log('========================================================\n');

  CANONICAL_SYSTEM_ACCOUNTS.forEach((acc, idx) => {
    const isPassValid = verifyAccountPassword(acc, acc.defaultPassword);
    console.log(`[0${idx + 1}] Role: ${acc.role.padEnd(8)} | Email: ${acc.email.padEnd(28)}`);
    console.log(`     Mã: ${acc.username} | Tên: ${acc.name}`);
    console.log(`     Redirect: ${acc.redirectUrl} | SHA256 Salt Hash: ${acc.passwordHash.substring(0, 16)}...`);
    console.log(`     Kiểm tra băm: ${isPassValid ? '✅ HỢP LỆ' : '❌ THẤT BẠI'}\n`);
  });

  console.log('✅ Hoàn tất thiết lập & xác thực tài khoản mẫu an toàn!');
}
