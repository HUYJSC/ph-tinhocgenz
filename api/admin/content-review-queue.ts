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
        .from('content_review_queue')
        .select('*, learning_resources(*)')
        .order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true, data });
    }
    return res.status(200).json({ ok: true, data: [] });
  }

  if (req.method === 'POST') {
    // Action: approve, reject, request_changes, publish
    const { resource_id, action, notes } = req.body || {};

    if (!resource_id || !action) {
      return res.status(400).json({ error: 'Thiếu resource_id hoặc action.' });
    }

    if (action === 'publish' && auth.role !== 'admin') {
      return res.status(403).json({ error: 'Chỉ Super Admin mới có quyền xuất bản tài liệu.' });
    }

    if (supabase) {
      // Ghi audit action
      await supabase.from('content_review_actions').insert({
        id: `act-${Date.now()}`,
        resource_id,
        action,
        actor_name: auth.userId || 'Admin',
        actor_role: auth.role || 'admin',
        notes: notes || '',
        created_at: new Date().toISOString()
      });

      // Cập nhật trạng thái
      const newReviewStatus = action === 'approve' || action === 'publish' ? 'approved' : action === 'reject' ? 'rejected' : 'changes_requested';
      const newPubStatus = action === 'publish' ? 'published' : 'unpublished';

      await supabase
        .from('learning_resources')
        .update({
          review_status: newReviewStatus,
          publication_status: newPubStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', resource_id);

      await supabase
        .from('content_review_queue')
        .update({
          review_status: newReviewStatus,
          reviewed_by: auth.userId || 'Admin',
          reviewed_at: new Date().toISOString(),
          reviewer_note: notes || ''
        })
        .eq('resource_id', resource_id);

      return res.status(200).json({ ok: true, message: `Thực hiện ${action} thành công.` });
    }

    return res.status(200).json({ ok: true, message: `Thao tác ${action} đã được ghi nhận.` });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
