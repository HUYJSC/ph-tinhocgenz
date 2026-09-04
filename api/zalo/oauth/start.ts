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

  // Tạo PKCE code_verifier (43 ký tự Base64URL) và code_challenge SHA-256 theo chuẩn Zalo v4
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

  // Lưu code_verifier và state vào Cookie để đối soát khi callback
  res.setHeader('Set-Cookie', [
    `zalo_pkce_verifier=${codeVerifier}; Path=/api/zalo/oauth; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    `zalo_oauth_state=${state}; Path=/api/zalo/oauth; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  ]);

  // URL cấp quyền Zalo Official Account chính thức có kèm code_challenge bắt buộc của Zalo v4
  const zaloAuthUrl = new URL('https://oauth.zaloapp.com/v4/oa/permission');
  zaloAuthUrl.searchParams.append('app_id', config.appId);
  zaloAuthUrl.searchParams.append('redirect_uri', callbackUrl);
  zaloAuthUrl.searchParams.append('code_challenge', codeChallenge);
  zaloAuthUrl.searchParams.append('state', state);

  // Nếu gọi với query ?json=1 thì trả về JSON chứa đầy đủ thông số cho nhà phát triển copy
  if (req.query.json === '1' || req.query.format === 'json') {
    return res.status(200).json({
      auth_url: zaloAuthUrl.toString(),
      code_challenge: codeChallenge,
      code_verifier: codeVerifier,
      state: state,
      callback_url: callbackUrl
    });
  }

  // Chuyển hướng trình duyệt sang Zalo OAuth
  return res.redirect(302, zaloAuthUrl.toString());
}
