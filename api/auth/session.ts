/**
 * Serverless Auth Endpoint: GET /api/auth/session
 * Kiểm tra phiên đăng nhập an toàn từ HttpOnly Session Cookie hoặc Bearer Header.
 * Trả về User, Role chuẩn hóa, Permissions và RedirectUrl.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSessionFromRequest } from '../_lib/authSession.js';
import {
  normalizeRole,
  getRoleRedirectUrl,
  getRolePermissions
} from '../_lib/rbacCore.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ authenticated: false, code: 'METHOD_NOT_ALLOWED' });
  }

  const session = getSessionFromRequest(req);

  if (!session) {
    return res.status(401).json({
      authenticated: false,
      code: 'SESSION_EXPIRED',
      message: 'Phiên làm việc đã hết hạn hoặc chưa đăng nhập.'
    });
  }

  const normRole = normalizeRole(session.role);
  const permissions = (session.permissions && session.permissions.length > 0)
    ? session.permissions
    : getRolePermissions(normRole);
  const redirectUrl = getRoleRedirectUrl(normRole);

  return res.status(200).json({
    authenticated: true,
    user: {
      id: session.userId,
      role: normRole,
      name: session.name,
      studentCode: session.studentCode,
      teacherCode: session.teacherCode,
      email: session.email,
      programTrack: session.track || 'office-fast-3in1',
      permissions
    },
    role: normRole,
    permissions,
    redirectUrl
  });
}
