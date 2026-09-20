import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient, verifyUserRole } from '../_lib/supabase.js';
import { validateSafeUrlForFetch } from '../_lib/ssrfProtection.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { endpoint } = req.query;
  const ep = Array.isArray(endpoint) ? endpoint[0] : endpoint;

  const auth = await verifyUserRole(req.headers['authorization']);
  if (!auth.authenticated && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: auth.error || 'Yêu cầu đăng nhập quản trị viên.' });
  }

  const supabase = getSupabaseAdminClient();

  // 1. CONTENT-REVIEW-QUEUE
  if (ep === 'content-review-queue') {
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
      const { resource_id, action, notes } = req.body || {};
      if (!resource_id || !action) {
        return res.status(400).json({ error: 'Thiếu resource_id hoặc action.' });
      }

      if (action === 'publish' && auth.role !== 'admin') {
        return res.status(403).json({ error: 'Chỉ Super Admin mới có quyền xuất bản tài liệu.' });
      }

      if (supabase) {
        await supabase.from('content_review_actions').insert({
          id: `act-${Date.now()}`,
          resource_id,
          action,
          actor_name: auth.userId || 'Admin',
          actor_role: auth.role || 'admin',
          notes: notes || '',
          created_at: new Date().toISOString()
        });

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

  // 2. LEARNING-SOURCES
  if (ep === 'learning-sources') {
    if (req.method === 'GET') {
      if (supabase) {
        const { data, error } = await supabase
          .from('learning_sources')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ ok: true, data });
      }
      return res.status(200).json({ ok: true, data: [] });
    }

    if (req.method === 'POST') {
      const { name, base_url, source_type, source_tier, description, allowed_domains } = req.body || {};
      if (!name || !base_url || !source_tier) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (name, base_url, source_tier).' });
      }

      const ssrf = validateSafeUrlForFetch(base_url, allowed_domains);
      if (!ssrf.safe) {
        return res.status(400).json({ error: `Bảo mật SSRF chặn URL: ${ssrf.reason}` });
      }

      const newSource = {
        id: `src-${Date.now()}`,
        name,
        base_url,
        source_type: source_type || 'html_category',
        source_tier,
        description: description || '',
        allowed_domains: allowed_domains || [],
        crawl_enabled: true,
        auto_discover_enabled: true,
        requires_login: false,
        license_status: 'needs_review',
        sync_frequency: 'monthly',
        consecutive_failures: 0,
        status: 'active',
        created_by: auth.userId || 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (supabase) {
        const { data, error } = await supabase.from('learning_sources').insert(newSource).select().single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json({ ok: true, data });
      }

      return res.status(201).json({ ok: true, data: newSource });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 3. TEAM-NOTIFICATIONS
  if (ep === 'team-notifications') {
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

  return res.status(404).json({ error: `Admin endpoint '${ep}' không hợp lệ` });
}
