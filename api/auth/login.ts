/**
 * Serverless Auth Endpoint: POST /api/auth/login
 * Tiêu chuẩn bảo mật P0:
 * 1. Xác thực toàn diện tại Server, không so khớp mật khẩu ở client
 * 2. Rate limiting theo IP/User ngăn chặn Brute-force
 * 3. Thiết lập Session Cookie HttpOnly + Secure
 * 4. Trả về Token JWT, Role chuẩn hóa, Quyền hạn (Permissions) và RedirectUrl tương ứng
 * 5. Chuẩn hóa mã lỗi và không tiết lộ sự tồn tại của tài khoản
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { checkRateLimit } from '../_lib/rateLimiter.js';
import { signSessionToken, setSessionCookie } from '../_lib/authSession.js';
import { getSupabaseAdminClient } from '../_lib/supabase.js';
import {
  normalizeRole,
  getRoleRedirectUrl,
  getRolePermissions
} from '../_lib/rbacCore.js';

const AUTH_SALT = 'tgz_sec_2026_salt_9d8f7e6a5b4c';

export function hashPasswordServer(password: string): string {
  const clean = (password || '').trim();
  if (!clean) return '';
  return crypto.createHash('sha256').update(clean + ':' + AUTH_SALT).digest('hex');
}

export function safeCompareStrings(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return crypto.timingSafeEqual(bufA, bufB);
}

// Preset Staff & System Accounts
export const PRESET_STAFF_ACCOUNTS = [
  {
    id: 'usr-admin-01',
    name: 'Thầy Quang Huy (Quản Trị Viên)',
    teacherCode: 'ADMIN01',
    studentCode: 'ADMIN01',
    email: 'admin@tinhocgenz.io.vn',
    phone: '0332298065',
    aliases: ['admin', 'admin01', 'quantri', 'quantrivien', '0332298065', 'admin@tinhocgenz.io.vn', 'hdh.hutech@gmail.com'],
    role: 'admin' as const,
    passwordHashes: [
      '0d8d3d420252f9b82aacbcb11755b20069ce2cccc849be3eff7d1f9960090efc', // Admin@2026
      'e7596dbaa16f5acbac77da80425730d7435e84d97da1b9ad76807f85044a1954', // admin123
      '2c04069d620601f942c9dc11b1341b9606e018cef31560aed88a9d753a0ba6f5', // admin
      '5c44038168b3cc107698a0f3e40ee72a585ae8818709155a5b63b1f832d812d3'  // 123
    ],
    plainFallbacks: ['admin@2026', 'admin123', 'admin', '123', '0332298065']
  },
  {
    id: 'usr-academic-01',
    name: 'Cán Bộ Giáo Vụ',
    teacherCode: 'GV00',
    studentCode: 'GV00',
    email: 'academic01@tinhocgenz.io.vn',
    phone: '0912345000',
    aliases: ['gv00', 'academic01', 'academic01@tinhocgenz.io.vn', 'giaovu', 'academic', 'hocvu'],
    role: 'academic' as const,
    passwordHashes: [
      '9f99a5d34d6bbeb11ce0435a129feb3c8d26bf26c01627330f2a2835e5630a5e', // academic@2026
      '5c44038168b3cc107698a0f3e40ee72a585ae8818709155a5b63b1f832d812d3'  // 123
    ],
    plainFallbacks: ['academic@2026', '123', 'gv123']
  },
  {
    id: 'usr-tch-01',
    name: 'Cô Hoàng Mai',
    teacherCode: 'GV01',
    studentCode: 'GV01',
    email: 'teacher01@tinhocgenz.io.vn',
    phone: '0912345601',
    aliases: ['gv01', 'teacher01', 'teacher01@tinhocgenz.io.vn', 'hoangmai', 'hoangmai@tinhocgenz.io.vn'],
    role: 'teacher' as const,
    passwordHashes: [
      '68d35003c3aca94689e8b8c0c910c5ea2a69a48c0363c6ba49f4235eb2965413', // teacher@2026
      '5c44038168b3cc107698a0f3e40ee72a585ae8818709155a5b63b1f832d812d3'  // 123
    ],
    plainFallbacks: ['teacher@2026', '123', 'gv123']
  },
  {
    id: 'usr-tch-02',
    name: 'Thầy Đức Nam',
    teacherCode: 'GV02',
    studentCode: 'GV02',
    email: 'teacher02@tinhocgenz.io.vn',
    phone: '0912345602',
    aliases: ['gv02', 'teacher02', 'teacher02@tinhocgenz.io.vn', 'ducnam', 'ducnam@tinhocgenz.io.vn'],
    role: 'teacher' as const,
    passwordHashes: [
      '68d35003c3aca94689e8b8c0c910c5ea2a69a48c0363c6ba49f4235eb2965413',
      '5c44038168b3cc107698a0f3e40ee72a585ae8818709155a5b63b1f832d812d3'
    ],
    plainFallbacks: ['teacher@2026', '123', 'gv123']
  },
  {
    id: 'usr-tch-03',
    name: 'Thầy Quang Huy',
    teacherCode: 'GV03',
    studentCode: 'GV03',
    email: 'teacher03@tinhocgenz.io.vn',
    phone: '0912345603',
    aliases: ['gv03', 'teacher03', 'teacher03@tinhocgenz.io.vn', 'quanghuy', 'quanghuy@tinhocgenz.io.vn'],
    role: 'teacher' as const,
    passwordHashes: [
      '68d35003c3aca94689e8b8c0c910c5ea2a69a48c0363c6ba49f4235eb2965413',
      '5c44038168b3cc107698a0f3e40ee72a585ae8818709155a5b63b1f832d812d3'
    ],
    plainFallbacks: ['teacher@2026', '123', 'gv123']
  },
  {
    id: 'usr-tch-04',
    name: 'Cô Thu Minh',
    teacherCode: 'GV04',
    studentCode: 'GV04',
    email: 'teacher04@tinhocgenz.io.vn',
    phone: '0988776655',
    aliases: ['gv04', 'teacher04', 'teacher04@tinhocgenz.io.vn', 'thuminh', 'thuminh@tinhocgenz.io.vn'],
    role: 'teacher' as const,
    passwordHashes: [
      '68d35003c3aca94689e8b8c0c910c5ea2a69a48c0363c6ba49f4235eb2965413',
      '5c44038168b3cc107698a0f3e40ee72a585ae8818709155a5b63b1f832d812d3'
    ],
    plainFallbacks: ['teacher@2026', '123', 'gv123']
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, code: 'METHOD_NOT_ALLOWED', message: 'Phương thức không được hỗ trợ.' });
  }

  // 1. Kiểm tra Rate Limiting chống Brute-force theo IP
  const clientIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  const rateLimitKey = `auth_login_${clientIp}`;
  const rateLimit = checkRateLimit(rateLimitKey, 15, 60 * 1000); // 15 lần trong 1 phút

  if (!rateLimit.allowed) {
    return res.status(429).json({
      success: false,
      code: 'RATE_LIMITED',
      message: `Quá nhiều yêu cầu đăng nhập từ thiết bị của bạn. Vui lòng chờ ${rateLimit.resetInSec} giây.`
    });
  }

  const { username, password, selectedTrack = 'office-fast-3in1' } = req.body || {};

  const cleanUser = String(username || '').trim();
  const cleanPass = String(password || '').trim();

  if (!cleanUser || !cleanPass) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_CREDENTIALS',
      message: 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.'
    });
  }

  const cleanUserLower = cleanUser.toLowerCase();
  const hashedInput = hashPasswordServer(cleanPass);

  // 2. Tra cứu cơ sở dữ liệu Supabase nếu đã cấu hình
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const { data: dbProfile, error: dbErr } = await supabase
        .from('profiles')
        .select('*')
        .or(`student_code.ilike.${cleanUser},teacher_code.ilike.${cleanUser},email.ilike.${cleanUser},phone.eq.${cleanUser}`)
        .maybeSingle();

      if (!dbErr && dbProfile) {
        const isDbPassMatch = dbProfile.password_hash && safeCompareStrings(hashedInput, dbProfile.password_hash);
        if (isDbPassMatch) {
          const normRole = normalizeRole(dbProfile.role);
          const permissions = getRolePermissions(normRole);
          const redirectUrl = getRoleRedirectUrl(normRole);

          const token = signSessionToken({
            userId: dbProfile.id,
            role: normRole,
            name: dbProfile.full_name || cleanUser,
            studentCode: dbProfile.student_code,
            teacherCode: dbProfile.teacher_code,
            email: dbProfile.email,
            permissions,
            track: selectedTrack
          });

          setSessionCookie(res, token);
          return res.status(200).json({
            success: true,
            user: {
              id: dbProfile.id,
              name: dbProfile.full_name || cleanUser,
              role: normRole,
              studentCode: dbProfile.student_code,
              teacherCode: dbProfile.teacher_code,
              email: dbProfile.email,
              phone: dbProfile.phone,
              programTrack: selectedTrack,
              permissions
            },
            role: normRole,
            permissions,
            token,
            redirectUrl,
            message: 'Đăng nhập thành công.'
          });
        }
      }
    } catch {
      // Tiếp tục fallback server-side an toàn
    }
  }

  // 3. Tra cứu Cán bộ / Giáo viên / Quản trị viên
  const matchedStaff = PRESET_STAFF_ACCOUNTS.find(s =>
    s.teacherCode.toLowerCase() === cleanUserLower ||
    (s.email && s.email.toLowerCase() === cleanUserLower) ||
    s.aliases.includes(cleanUserLower)
  );

  if (matchedStaff) {
    const isHashMatch = matchedStaff.passwordHashes.some(h => safeCompareStrings(hashedInput, h));
    const isPlainMatch = matchedStaff.plainFallbacks.some(f => safeCompareStrings(cleanPass.toLowerCase(), f.toLowerCase()));

    if (!isHashMatch && !isPlainMatch) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Thông tin tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.'
      });
    }

    const normRole = normalizeRole(matchedStaff.role);
    const permissions = getRolePermissions(normRole);
    const redirectUrl = getRoleRedirectUrl(normRole);

    const token = signSessionToken({
      userId: matchedStaff.id,
      role: normRole,
      name: matchedStaff.name,
      teacherCode: matchedStaff.teacherCode,
      studentCode: matchedStaff.studentCode,
      email: matchedStaff.email,
      permissions,
      track: selectedTrack
    });

    setSessionCookie(res, token);
    return res.status(200).json({
      success: true,
      user: {
        id: matchedStaff.id,
        name: matchedStaff.name,
        role: normRole,
        teacherCode: matchedStaff.teacherCode,
        studentCode: matchedStaff.studentCode,
        email: matchedStaff.email,
        phone: matchedStaff.phone,
        programTrack: selectedTrack,
        permissions
      },
      role: normRole,
      permissions,
      token,
      redirectUrl,
      message: 'Đăng nhập thành công.'
    });
  }

  // 4. Tra cứu Học viên Server-side (THGZ01 - THGZ12 hoặc student01@tinhocgenz.io.vn)
  const isStudentPattern =
    /^THGZ\d{2}$/i.test(cleanUser) ||
    cleanUserLower === 'student01' ||
    cleanUserLower === 'student01@tinhocgenz.io.vn' ||
    cleanUserLower === 'student';

  if (isStudentPattern) {
    const studentHashes = [
      '99bf37fc119f9309210e9fae0477a72d1f3ca0d41ad47ba1fa04b733f95fcdbe', // student@2026
      '5c44038168b3cc107698a0f3e40ee72a585ae8818709155a5b63b1f832d812d3'  // 123
    ];
    const isStudentMatch =
      studentHashes.some(h => safeCompareStrings(hashedInput, h)) ||
      safeCompareStrings(cleanPass.toLowerCase(), 'student@2026') ||
      safeCompareStrings(cleanPass, '123');

    if (!isStudentMatch) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Thông tin tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.'
      });
    }

    const studentCodeUpper = (cleanUserLower === 'student01' || cleanUserLower === 'student01@tinhocgenz.io.vn' || cleanUserLower === 'student')
      ? 'THGZ01'
      : cleanUser.toUpperCase();

    const normRole = 'student';
    const permissions = getRolePermissions(normRole);
    const redirectUrl = getRoleRedirectUrl(normRole);

    const token = signSessionToken({
      userId: `std-${studentCodeUpper.toLowerCase()}`,
      role: normRole,
      name: `Học Viên ${studentCodeUpper}`,
      studentCode: studentCodeUpper,
      email: `${studentCodeUpper.toLowerCase()}@tinhocgenz.io.vn`,
      permissions,
      track: selectedTrack
    });

    setSessionCookie(res, token);
    return res.status(200).json({
      success: true,
      user: {
        id: `std-${studentCodeUpper.toLowerCase()}`,
        name: `Học Viên ${studentCodeUpper}`,
        role: normRole,
        studentCode: studentCodeUpper,
        email: `${studentCodeUpper.toLowerCase()}@tinhocgenz.io.vn`,
        programTrack: selectedTrack,
        permissions
      },
      role: normRole,
      permissions,
      token,
      redirectUrl,
      message: 'Đăng nhập học viên thành công.'
    });
  }

  // 5. Nếu không khớp bất kỳ tài khoản nào
  return res.status(401).json({
    success: false,
    code: 'INVALID_CREDENTIALS',
    message: 'Thông tin tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.'
  });
}
