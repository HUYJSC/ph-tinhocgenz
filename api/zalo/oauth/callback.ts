import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient } from '../_lib/supabase';

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
    const params = new URLSearchParams();
    params.append('app_id', appId);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);

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
    }

    // Chuyển hướng về trang quản trị
    return res.redirect(302, '/admin?zalo_connected=true');
  } catch (err: any) {
    return res.status(500).json({
      error: `Lỗi kết nối máy chủ Zalo OAuth: ${err.message}`
    });
  }
}
