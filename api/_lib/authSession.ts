/**
 * Serverless Auth Session & Cookie Engine — PH Digital Education
 * Cung cấp:
 * 1. Ký và xác thực Session Token bằng HMAC-SHA256 an toàn tại Server
 * 2. Đọc và thiết lập Cookie bảo mật: HttpOnly, Secure, SameSite=Lax
 * 3. Ngăn chặn triệt để việc lưu Access Token nhạy cảm trong localStorage
 */

import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SESSION_COOKIE_NAME = 'tgz_session';
const SESSION_MAX_AGE_SEC = 7 * 24 * 60 * 60; // 7 ngày

function getAuthSecret(): string {
  return process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'tgz_auth_jwt_super_secret_salt_2026';
}

export interface SessionPayload {
  userId: string;
  role: 'student' | 'teacher' | 'admin' | 'super_admin';
  name: string;
  studentCode?: string;
  teacherCode?: string;
  track?: string;
  exp: number;
  iat: number;
}

/**
 * Sinh Session Token mã hóa và có chữ ký HMAC-SHA256
 */
export function signSessionToken(payload: Omit<SessionPayload, 'exp' | 'iat'>, expiresInSec = SESSION_MAX_AGE_SEC): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SessionPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSec
  };

  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getAuthSecret())
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

/**
 * Xác thực Session Token
 */
export function verifySessionToken(token?: string): SessionPayload | null {
  if (!token || !token.includes('.')) return null;

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;

  const expectedSignature = crypto
    .createHmac('sha256', getAuthSecret())
    .update(encodedPayload)
    .digest('base64url');

  // Chống Timing Attack
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expectedSignature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const payload: SessionPayload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null; // Hết hạn
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Đọc cookie từ request
 */
export function getSessionFromRequest(req: VercelRequest): SessionPayload | null {
  // 1. Kiểm tra Cookie HttpOnly
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]*)`));
  if (match && match[1]) {
    const session = verifySessionToken(decodeURIComponent(match[1]));
    if (session) return session;
  }

  // 2. Fallback: Kiểm tra Authorization header (Bearer <token>)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    return verifySessionToken(token);
  }

  return null;
}

/**
 * Thiết lập Cookie HttpOnly vào Response Header
 */
export function setSessionCookie(res: VercelResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieFlags = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_MAX_AGE_SEC}`
  ];

  if (isProduction) {
    cookieFlags.push('Secure');
  }

  res.setHeader('Set-Cookie', cookieFlags.join('; '));
}

/**
 * Xóa Cookie Session khi đăng xuất
 */
export function clearSessionCookie(res: VercelResponse): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieFlags = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  ];

  if (isProduction) {
    cookieFlags.push('Secure');
  }

  res.setHeader('Set-Cookie', cookieFlags.join('; '));
}
