import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient, verifyUserRole } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = await verifyUserRole(req.headers['authorization']);
  if (!auth.authenticated && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: auth.error || 'Yêu cầu đăng nhập quản trị viên.' });
  }

  const supabase = getSupabaseAdminClient();

  if (req.method === 'GET') {
    if (supabase) {
      const { data, error } = await supabase
        .from('team_notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true, data });
    }
    return res.status(200).json({ ok: true, data: [] });
  }

  if (req.method === 'POST') {
    const { notification_id } = req.body || {};
    if (!notification_id) {
      return res.status(400).json({ error: 'Thiếu notification_id' });
    }

    if (supabase) {
      await supabase
        .from('team_notifications')
        .update({ is_read: true })
        .eq('id', notification_id);
      return res.status(200).json({ ok: true, message: 'Đã đánh dấu đã đọc.' });
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
