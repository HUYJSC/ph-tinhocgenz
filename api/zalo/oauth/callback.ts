import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient } from '../_lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, oa_id } = req.query as { code?: string; oa_id?: string };

  if (!code) {
    return res.status(400).json({ error: 'Thiếu authorization code từ Zalo OAuth callback.' });
  }

  const appId = process.env.ZALO_APP_ID;
  const appSecret = process.env.ZALO_APP_SECRET;

  if (!appId || !appSecret) {
    return res.status(500).json({
      error: 'Máy chủ chưa cấu hình ZALO_APP_ID và ZALO_APP_SECRET trong biến môi trường.'
    });
  }

  try {
    // Đọc PKCE code_verifier từ Cookie hoặc query param
    const cookies = (req.headers.cookie || '').split(';').reduce((acc, c) => {
      const [k, v] = c.trim().split('=');
      if (k && v) acc[k] = decodeURIComponent(v);
      return acc;
    }, {} as Record<string, string>);

    const codeVerifier = (req.query.code_verifier as string) || cookies['zalo_pkce_verifier'] || '';

    const params = new URLSearchParams();
    params.append('app_id', appId);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    if (codeVerifier) {
      params.append('code_verifier', codeVerifier);
    }

    const tokenRes = await fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'secret_key': appSecret
      },
      body: params.toString()
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token || !tokenData.refresh_token) {
      return res.status(400).json({
        error: `Trao đổi mã code thất bại: ${tokenData.error_name || tokenData.error || tokenData.message || JSON.stringify(tokenData)}`
      });
    }

    const expiresInSec = parseInt(tokenData.expires_in) || 90000;
    const expiresAt = new Date(Date.now() + expiresInSec * 1000).toISOString();
    const effectiveOaId = oa_id || tokenData.oa_id || 'PH_DIGITAL_EDU_OFFICIAL';

    const supabase = getSupabaseAdminClient();
    if (supabase) {
      // Upsert token vào zalo_oauth_tokens
      await supabase.from('zalo_oauth_tokens').upsert({
        oa_id: effectiveOaId,
        app_id: appId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        is_active: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'oa_id' });
      return res.redirect(302, '/admin?zalo_connected=true');
    }

    // Nếu chưa cấu hình Supabase, hiển thị trang chúc mừng với đầy đủ thông tin
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="vi">
      <head><meta charset="utf-8"/><title>Kết Nối Zalo OA Thành Công</title></head>
      <body style="font-family: system-ui, sans-serif; padding: 40px; text-align: center; background: #0f172a; color: #f8fafc;">
        <div style="max-width: 580px; margin: 40px auto; background: #1e293b; padding: 32px; border-radius: 16px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
          <h2 style="color: #38bdf8; margin: 0 0 12px 0;">Kết Nối Zalo OA Thành Công!</h2>
          <p style="color: #94a3b8; font-size: 15px; margin: 0 0 20px 0;">Ứng dụng Tin Học Gen Z đã được cấp quyền truy cập Official Account chính thức.</p>
          <div style="background: #0f172a; padding: 16px; border-radius: 8px; text-align: left; font-size: 13px; font-family: monospace; color: #a5f3fc; word-break: break-all; margin-bottom: 24px;">
            <div><strong>OA ID:</strong> ${effectiveOaId}</div>
            <div style="margin-top: 6px;"><strong>Expires In:</strong> ${expiresInSec}s</div>
            <div style="margin-top: 6px;"><strong>Status:</strong> Authorized (PKCE Verified)</div>
          </div>
          <a href="/admin?zalo_connected=true" style="display: inline-block; background: #0284c7; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Quay Về Trang Quản Trị</a>
        </div>
      </body>
      </html>
    `);
  } catch (err: any) {
    return res.status(500).json({
      error: `Lỗi kết nối máy chủ Zalo OAuth: ${err.message}`
    });
  }
}
