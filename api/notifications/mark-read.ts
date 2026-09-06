import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient } from '../_lib/supabase.js';

/**
 * POST /api/notifications/mark-read
 * Đánh dấu thông báo đã đọc
 * 
 * Body:
 *   { notificationId: string, userId: string }  → đánh dấu 1 tin
 *   { markAll: true, userId: string }            → đánh dấu tất cả
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  const { notificationId, markAll, userId } = req.body || {};

  if (!userId) {
    return res.status(400).json({ error: 'Thiếu userId' });
  }

  if (markAll) {
    // Đánh dấu tất cả đã đọc
    const { error, count } = await supabase
      .from('app_notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      return res.status(500).json({ error: 'Lỗi cập nhật' });
    }

    return res.status(200).json({
      success: true,
      message: `Đã đánh dấu ${count || 'tất cả'} thông báo đã đọc`
    });
  }

  if (notificationId) {
    // Đánh dấu 1 tin
    const { error } = await supabase
      .from('app_notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({ error: 'Lỗi cập nhật' });
    }

    return res.status(200).json({
      success: true,
      message: 'Đã đánh dấu đã đọc'
    });
  }

  return res.status(400).json({ error: 'Thiếu notificationId hoặc markAll' });
}
