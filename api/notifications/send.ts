import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient } from '../_lib/supabase.js';
import webpush from 'web-push';

/**
 * POST /api/notifications/send
 * Admin gửi thông báo → lưu vào app_notifications + gửi Web Push
 * 
 * Body: {
 *   recipients: [{ userId, title?, body? }] | undefined,
 *   title: string,
 *   body: string,
 *   type: 'progress_daily' | 'progress_weekly' | ...,
 *   metadata?: object,
 *   // Hoặc gửi cho 1 user cụ thể:
 *   userId?: string
 * }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  // Cấu hình VAPID
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

  // Xây dựng danh sách người nhận
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
    // 1. Lưu thông báo in-app
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
      console.error('[Send] Insert notification error:', notifErr);
      results.errors.push(`Save failed for ${target.userId}: ${notifErr.message}`);
      continue;
    }

    results.notificationsSaved++;
    const notificationId = notifData?.id;

    // 2. Tìm tất cả push subscriptions active của user
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', target.userId)
      .eq('is_active', true);

    if (!subs || subs.length === 0) {
      continue; // User chưa đăng ký push, chỉ lưu in-app
    }

    // 3. Gửi Web Push đến tất cả devices của user
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
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          },
          pushPayload
        );
        pushSuccessForUser = true;
        results.pushSent++;
      } catch (pushErr: any) {
        console.error('[Send] Push error:', pushErr.statusCode, pushErr.body);

        // Nếu subscription hết hạn hoặc bị hủy (410 Gone, 404) → vô hiệu hóa
        if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('endpoint', sub.endpoint);
        }

        results.pushFailed++;
      }
    }

    // 4. Cập nhật trạng thái push_sent cho notification
    if (pushSuccessForUser && notificationId) {
      await supabase
        .from('app_notifications')
        .update({
          push_sent: true,
          push_sent_at: new Date().toISOString()
        })
        .eq('id', notificationId);
    }
  }

  return res.status(200).json({
    success: true,
    message: `Đã gửi ${results.notificationsSaved} thông báo, ${results.pushSent} push thành công`,
    results
  });
}
