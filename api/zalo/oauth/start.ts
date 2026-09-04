import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getZaloConfig } from '../../_lib/zaloConfig.js';
import { checkRateLimit } from '../../_lib/rateLimiter.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const rateLimit = checkRateLimit(`oauth_start_${clientIp}`, 5, 60 * 1000);

  if (!rateLimit.allowed) {
    return res.status(429).json({ error: 'Quá nhiều yêu cầu OAuth. Vui lòng thử lại sau.' });
  }

  const config = getZaloConfig();
  if (!config.appId) {
    return res.status(400).json({
      error: 'Máy chủ chưa cấu hình ZALO_APP_ID. Vui lòng cấu hình trên Vercel trước khi kết nối OAuth.'
    });
  }

  const host = req.headers.host || 'hoctructuyen.tinhocgenz.io.vn';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const callbackUrl = `${proto}://${host}/api/zalo/oauth/callback`;

  // Tạo CSRF State ngẫu nhiên an toàn
  const state = crypto.randomBytes(16).toString('hex');

  // URL cấp quyền Zalo Official Account chính thức
  const zaloAuthUrl = new URL('https://oauth.zaloapp.com/v4/oa/permission');
  zaloAuthUrl.searchParams.append('app_id', config.appId);
  zaloAuthUrl.searchParams.append('redirect_uri', callbackUrl);
  zaloAuthUrl.searchParams.append('state', state);

  // Chuyển hướng trình duyệt sang Zalo OAuth
  return res.redirect(302, zaloAuthUrl.toString());
}
