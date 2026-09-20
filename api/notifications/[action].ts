import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient } from '../_lib/supabase.js';
import webpush from 'web-push';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;
  const act = Array.isArray(action) ? action[0] : action;

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  // 1. LIST: GET /api/notifications/list
  if (act === 'list') {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const userId = req.query.userId as string;
    const unreadOnly = req.query.unreadOnly === 'true';
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return res.status(400).json({ error: 'Thiếu userId' });
    }

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
      return res.status(500).json({ error: 'Lỗi truy vấn thông báo' });
    }

    const { count: unreadCount } = await supabase
      .from('app_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

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

  // 2. MARK-READ: POST /api/notifications/mark-read
  if (act === 'mark-read') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { notificationId, markAll, userId } = req.body || {};
    if (!userId) {
      return res.status(400).json({ error: 'Thiếu userId' });
    }

    if (markAll) {
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

  // 3. SEND: POST /api/notifications/send
  if (act === 'send') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@tinhocgenz.io.vn';

    if (!vapidPublicKey || !vapidPrivateKey) {
      return res.status(503).json({ error: 'VAPID keys not configured' });
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const {
      recipients,
      title,
      body,
      type = 'system',
      metadata = {},
      userId: singleUserId
    } = req.body || {};

    if (!title || !body) {
      return res.status(400).json({ error: 'Thiếu title hoặc body' });
    }

    let targetUsers: Array<{ userId: string; title: string; body: string }> = [];
    if (recipients && Array.isArray(recipients)) {
      targetUsers = recipients.map((r: any) => ({
        userId: r.userId,
        title: r.title || title,
        body: r.body || body
      }));
    } else if (singleUserId) {
      targetUsers = [{ userId: singleUserId, title, body }];
    } else {
      return res.status(400).json({ error: 'Thiếu recipients hoặc userId' });
    }

    const results = {
      total: targetUsers.length,
      notificationsSaved: 0,
      pushSent: 0,
      pushFailed: 0,
      errors: [] as string[]
    };

    for (const target of targetUsers) {
      const { data: notifData, error: notifErr } = await supabase
        .from('app_notifications')
        .insert({
          user_id: target.userId,
          title: target.title,
          body: target.body,
          type,
          metadata,
          is_read: false
        })
        .select('id')
        .single();

      if (notifErr) {
        results.errors.push(`Save failed for ${target.userId}: ${notifErr.message}`);
        continue;
      }

      results.notificationsSaved++;
      const notificationId = notifData?.id;

      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('user_id', target.userId)
        .eq('is_active', true);

      if (!subs || subs.length === 0) continue;

      const pushPayload = JSON.stringify({
        title: target.title,
        body: target.body,
        icon: '/icon-192.png',
        badge: '/logo.png',
        tag: `ph-${type}-${Date.now()}`,
        type,
        notificationId,
        url: '/',
        requireInteraction: type.includes('progress') || type === 'attendance'
      });

      let pushSuccessForUser = false;
      for (const sub of subs) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            pushPayload
          );
          pushSuccessForUser = true;
          results.pushSent++;
        } catch (pushErr: any) {
          if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
            await supabase.from('push_subscriptions').update({ is_active: false }).eq('endpoint', sub.endpoint);
          }
          results.pushFailed++;
        }
      }

      if (pushSuccessForUser && notificationId) {
        await supabase
          .from('app_notifications')
          .update({ push_sent: true, push_sent_at: new Date().toISOString() })
          .eq('id', notificationId);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Đã gửi ${results.notificationsSaved} thông báo, ${results.pushSent} push thành công`,
      results
    });
  }

  // 4. SUBSCRIBE: POST/DELETE /api/notifications/subscribe
  if (act === 'subscribe') {
    if (req.method === 'POST') {
      const { userId, subscription } = req.body || {};
      if (!userId || !subscription?.endpoint || !subscription?.keys) {
        return res.status(400).json({ error: 'Thiếu userId hoặc subscription data' });
      }

      const { endpoint, keys } = subscription;
      const { error } = await supabase.from('push_subscriptions').upsert(
        {
          user_id: userId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          user_agent: req.headers['user-agent'] || '',
          is_active: true,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id,endpoint' }
      );

      if (error) {
        return res.status(500).json({ error: 'Lỗi lưu subscription', detail: error.message });
      }

      return res.status(200).json({
        success: true,
        message: 'Đã đăng ký nhận thông báo Push thành công'
      });
    }

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
        return res.status(500).json({ error: 'Lỗi hủy subscription' });
      }

      return res.status(200).json({
        success: true,
        message: 'Đã hủy đăng ký nhận thông báo'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(404).json({ error: `Hành động notifications '${act}' không hợp lệ` });
}
