import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient } from '../_lib/supabase';
import { getZaloConfig } from '../_lib/zaloConfig';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Chỉ chấp nhận GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed. Use GET.' });
  }

  const config = getZaloConfig();
  const missing: string[] = [];

  if (!config.appId) missing.push('ZALO_APP_ID');
  if (!config.appSecret) missing.push('ZALO_APP_SECRET');
  if (!config.oaSecretKey) missing.push('ZALO_OA_SECRET_KEY');
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  const supabase = getSupabaseAdminClient();
  let dbConnected = false;
  let hasActiveToken = false;
  let hasRefreshToken = false;
  let tokenExpiresAt: string | null = null;
  let isTokenExpired = false;
  let isExpiringSoon = false;
  let activeTemplateCount = 0;
  let lastWebhookAt: string | null = null;

  if (supabase) {
    try {
      // 1. Kiểm tra token trong database
      const { data: tokens, error: tokenErr } = await supabase
        .from('zalo_oauth_tokens')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1);

      dbConnected = !tokenErr;

      if (tokens && tokens.length > 0) {
        const tokenRec = tokens[0];
        hasActiveToken = Boolean(tokenRec.access_token);
        hasRefreshToken = Boolean(tokenRec.refresh_token);
        tokenExpiresAt = tokenRec.expires_at;

        const expMs = new Date(tokenRec.expires_at).getTime();
        const nowMs = Date.now();
        isTokenExpired = expMs <= nowMs;
        isExpiringSoon = expMs - nowMs < 30 * 60 * 1000;
      }

      // 2. Kiểm tra template
      const { count } = await supabase
        .from('zalo_templates')
        .select('*', { count: 'exact', head: true })
        .eq('is_enabled', true)
        .eq('status', 'approved');

      activeTemplateCount = count || (config.templateId ? 1 : 0);

      // 3. Kiểm tra webhook gần nhất
      const { data: webhooks } = await supabase
        .from('zalo_webhook_events')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      if (webhooks && webhooks.length > 0) {
        lastWebhookAt = webhooks[0].created_at;
      }
    } catch {
      dbConnected = false;
    }
  }

  // Nếu trong database chưa có token nhưng có biến môi trường tĩnh (fallback)
  if (!hasActiveToken && config.staticAccessToken) {
    hasActiveToken = true;
    hasRefreshToken = Boolean(config.staticRefreshToken);
  }

  if (!hasActiveToken) {
    missing.push('ZALO_OA_ACCESS_TOKEN');
  }

  const checks = {
    app: Boolean(config.appId && config.appSecret),
    oa: Boolean(config.oaId || config.oaSecretKey),
    token: hasActiveToken && !isTokenExpired,
    refreshToken: hasRefreshToken,
    template: Boolean(config.templateId) || activeTemplateCount > 0,
    webhook: Boolean(config.oaSecretKey),
    database: dbConnected
  };

  // Xác định 5 trạng thái chuẩn
  let status: 'connected' | 'not_configured' | 'config_incomplete' | 'token_expiring' | 'token_expired' = 'connected';
  let message = 'Zalo ZBS đã kết nối chính thức và sẵn sàng hoạt động.';

  if (missing.length > 0 && !hasActiveToken) {
    status = 'not_configured';
    message = 'Hệ thống Zalo chưa được cấu hình đầy đủ biến môi trường trên máy chủ.';
  } else if (missing.length > 0) {
    status = 'config_incomplete';
    message = 'Hệ thống đã có token nhưng thiếu một số cấu hình bổ trợ (App ID/Secret hoặc Webhook).';
  } else if (isTokenExpired) {
    status = 'token_expired';
    message = 'Access Token Zalo OA đã hết hạn, cần thực hiện Refresh Token hoặc kết nối lại OA.';
  } else if (isExpiringSoon) {
    status = 'token_expiring';
    message = 'Access Token Zalo OA sắp hết hạn trong 30 phút, hệ thống sẽ tự động làm mới khi phát tin.';
  }

  const configured = status === 'connected' || status === 'token_expiring';

  return res.status(200).json({
    configured,
    status,
    message,
    checks,
    missing,
    flags: config.flags,
    oa_id: config.oaId || 'PH_DIGITAL_EDUCATION_OA',
    expires_at: tokenExpiresAt,
    active_template_count: activeTemplateCount,
    last_webhook_at: lastWebhookAt
  });
}
