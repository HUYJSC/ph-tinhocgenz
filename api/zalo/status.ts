import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient } from '../_lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const missingEnv: string[] = [];

  if (!process.env.SUPABASE_URL && !process.env.VITE_SUPABASE_URL) missingEnv.push('SUPABASE_URL');
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missingEnv.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!process.env.ZALO_APP_ID) missingEnv.push('ZALO_APP_ID');
  if (!process.env.ZALO_APP_SECRET) missingEnv.push('ZALO_APP_SECRET');
  if (!process.env.ZALO_OA_SECRET_KEY) missingEnv.push('ZALO_OA_SECRET_KEY');

  const supabase = getSupabaseAdminClient();

  if (!supabase || missingEnv.length > 0) {
    return res.status(200).json({
      status: 'unconfigured',
      message: 'Hệ thống chưa được cấu hình đầy đủ thông tin Zalo ZBS hoặc Supabase.',
      missing_env: missingEnv,
      oa_id: null,
      active_template_count: 0,
      remaining_quota: 0,
      last_webhook_at: null,
      recent_logs: []
    });
  }

  try {
    // 1. Kiểm tra Token
    const { data: tokens } = await supabase
      .from('zalo_oauth_tokens')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (!tokens || tokens.length === 0) {
      return res.status(200).json({
        status: 'unconfigured',
        message: 'Chưa có Access Token của Zalo OA trong cơ sở dữ liệu.',
        missing_env: ['ZALO_OA_OAUTH_TOKEN'],
        oa_id: null,
        active_template_count: 0,
        remaining_quota: 0,
        last_webhook_at: null,
        recent_logs: []
      });
    }

    const tokenRecord = tokens[0];
    const expiresAt = new Date(tokenRecord.expires_at).getTime();
    const now = Date.now();
    const isTokenExpired = expiresAt <= now;
    const isExpiringSoon = expiresAt - now < 30 * 60 * 1000; // Còn dưới 30 phút

    // 2. Lấy số lượng Template được bật
    const { count: templateCount } = await supabase
      .from('zalo_templates')
      .select('*', { count: 'exact', head: true })
      .eq('is_enabled', true)
      .eq('status', 'approved');

    // 3. Lấy sự kiện webhook gần nhất
    const { data: recentWebhooks } = await supabase
      .from('zalo_webhook_events')
      .select('created_at, processed')
      .order('created_at', { ascending: false })
      .limit(1);

    // 4. Lấy recent logs đã che số điện thoại
    const { data: logs } = await supabase
      .from('zalo_message_logs')
      .select('id, student_id, recipient_type, masked_phone, template_id, tracking_id, zalo_msg_id, request_status, delivery_status, error_code, error_message, created_at, delivered_at')
      .order('created_at', { ascending: false })
      .limit(50);

    let status = 'connected';
    if (isTokenExpired || isExpiringSoon) {
      status = 'token_expiring';
    }

    return res.status(200).json({
      status,
      message: status === 'connected' ? 'Đã kết nối Zalo ZBS OpenAPI thành công.' : 'Token sắp hết hạn hoặc đang được tự động làm mới.',
      oa_id: tokenRecord.oa_id,
      expires_at: tokenRecord.expires_at,
      active_template_count: templateCount || 0,
      remaining_quota: 5000, // Quota định mức tiêu chuẩn hoặc query từ Zalo API
      last_webhook_at: recentWebhooks?.[0]?.created_at || null,
      recent_logs: logs || []
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 'webhook_error',
      message: `Lỗi truy vấn cơ sở dữ liệu: ${err.message}`,
      oa_id: null,
      recent_logs: []
    });
  }
}
