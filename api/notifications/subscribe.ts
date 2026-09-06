import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient } from '../_lib/supabase.js';

/**
 * POST: Đăng ký Push Subscription mới
 * DELETE: Hủy đăng ký Push Subscription
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  // ── POST: Đăng ký mới ──
  if (req.method === 'POST') {
    const { userId, subscription } = req.body || {};

    if (!userId || !subscription?.endpoint || !subscription?.keys) {
      return res.status(400).json({
        error: 'Thiếu userId hoặc subscription data'
      });
    }

    const { endpoint, keys } = subscription;

    // Upsert: nếu đã tồn tại endpoint cho user → cập nhật
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: userId,
          endpoint: endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          user_agent: req.headers['user-agent'] || '',
          is_active: true,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id,endpoint' }
      );

    if (error) {
      console.error('[Subscribe] Upsert error:', error);
      return res.status(500).json({ error: 'Lỗi lưu subscription', detail: error.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Đã đăng ký nhận thông báo Push thành công'
    });
  }

  // ── DELETE: Hủy đăng ký ──
  if (req.method === 'DELETE') {
    const { userId, endpoint } = req.body || {};

    if (!userId || !endpoint) {
      return res.status(400).json({ error: 'Thiếu userId hoặc endpoint' });
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('endpoint', endpoint);

    if (error) {
      console.error('[Unsubscribe] Error:', error);
      return res.status(500).json({ error: 'Lỗi hủy subscription' });
    }

    return res.status(200).json({
      success: true,
      message: 'Đã hủy đăng ký nhận thông báo'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
