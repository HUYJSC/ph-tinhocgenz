import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient } from '../_lib/supabase.js';

/**
 * GET /api/notifications/list
 * Lấy danh sách thông báo in-app cho user
 * 
 * Query params:
 *   userId (required): ID người dùng
 *   unreadOnly (optional): 'true' để chỉ lấy chưa đọc
 *   limit (optional): giới hạn số lượng (default: 50)
 *   offset (optional): phân trang
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  const userId = req.query.userId as string;
  const unreadOnly = req.query.unreadOnly === 'true';
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const offset = parseInt(req.query.offset as string) || 0;

  if (!userId) {
    return res.status(400).json({ error: 'Thiếu userId' });
  }

  // Lấy thông báo
  let query = supabase
    .from('app_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data: notifications, error } = await query;

  if (error) {
    console.error('[List] Query error:', error);
    return res.status(500).json({ error: 'Lỗi truy vấn thông báo' });
  }

  // Đếm số chưa đọc
  const { count: unreadCount } = await supabase
    .from('app_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  // Map sang format frontend
  const mapped = (notifications || []).map((n: any) => ({
    id: n.id,
    userId: n.user_id,
    title: n.title,
    body: n.body,
    type: n.type,
    isRead: n.is_read,
    metadata: n.metadata || {},
    createdAt: n.created_at
  }));

  return res.status(200).json({
    notifications: mapped,
    unreadCount: unreadCount || 0,
    total: mapped.length,
    offset,
    limit
  });
}
