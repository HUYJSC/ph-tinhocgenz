/**
 * Serverless Auth Endpoint: POST /api/auth/logout
 * Hủy bỏ phiên đăng nhập và xóa HttpOnly Session Cookie
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearSessionCookie } from '../_lib/authSession';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, code: 'METHOD_NOT_ALLOWED' });
  }

  clearSessionCookie(res);

  return res.status(200).json({
    success: true,
    message: 'Đã đăng xuất an toàn khỏi hệ thống.'
  });
}
