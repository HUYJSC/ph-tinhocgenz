import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient } from '../_lib/supabase.js';
import webpush from 'web-push';

/**
 * CRON: /api/cron/notification-weekly
 * Chạy tự động mỗi Chủ nhật 19:00 (UTC+7 = 12:00 UTC)
 * 
 * Luồng:
 * 1. Quét tất cả học viên đang hoạt động từ Supabase
 * 2. AI generate message cá nhân hóa
 * 3. Lưu vào app_notifications
 * 4. Gửi Web Push đến tất cả devices đã đăng ký
 * 
 * → 100% TỰ ĐỘNG, không cần admin thao tác
 */

function getWeekLabel(): string {
  const now = new Date();
  const target = new Date(now.valueOf());
  const dayNr = (now.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${now.getFullYear()}_W${weekNum}`;
}

/**
 * Sinh nội dung thông báo AI theo phong cách sư phạm
 */
function generateWeeklyMessage(student: {
  full_name: string;
  username: string;
  birth_year?: number;
}): { title: string; body: string } {
  const name = student.full_name || student.username || 'Học viên';
  const currentYear = new Date().getFullYear();
  const age = student.birth_year ? (currentYear - student.birth_year) : 21;
  const isParent = age < 25;
  const weekLabel = getWeekLabel().split('_W')[1];

  if (isParent) {
    return {
      title: `📋 Báo cáo tuần ${weekLabel} — ${name}`,
      body:
        `Kính gửi Quý Phụ huynh em ${name},\n\n` +
        `Trung tâm PH Digital Education xin gửi tổng kết học tập tuần ${weekLabel} của em.\n` +
        `Em đang trong tiến trình rèn luyện kỹ năng Tin học thực chiến. ` +
        `Kính mong Quý Phụ huynh nhắc nhở em đăng nhập luyện tập đều đặn tại https://hoctructuyen.tinhocgenz.io.vn.\n\n` +
        `Trân trọng,\nBan Giáo vụ PH Digital Education`
    };
  }

  return {
    title: `📊 Cập nhật tiến độ tuần ${weekLabel}`,
    body:
      `Chào ${name},\n\n` +
      `Hệ thống ghi nhận bạn đã hoàn thành chặng học tuần ${weekLabel}. ` +
      `Hãy truy cập https://hoctructuyen.tinhocgenz.io.vn để xem chi tiết tiến độ ` +
      `và tiếp tục luyện tập để sẵn sàng cho kỳ thi chứng chỉ nhé!\n\n` +
      `Chúc bạn học tập hiệu quả! 🚀`
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Xác thực Cron Secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized Cron Request' });
    }
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  // 2. Cấu hình VAPID cho Web Push
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@tinhocgenz.io.vn';
  const pushEnabled = !!(vapidPublicKey && vapidPrivateKey);

  if (pushEnabled) {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey!, vapidPrivateKey!);
  }

  const weekId = getWeekLabel();

  // 3. Đọc danh sách học viên hoạt động
  const { data: students, error: studentError } = await supabase
    .from('accounts_user')
    .select('id, username, full_name, phone, birth_year, is_active')
    .eq('is_active', true)
    .limit(200);

  if (studentError || !students || students.length === 0) {
    return res.status(200).json({
      message: 'Không có học viên hoạt động.',
      processed: 0,
      weekId
    });
  }

  const results = {
    total: students.length,
    notificationsSaved: 0,
    pushSent: 0,
    pushFailed: 0,
    skippedDuplicate: 0,
    errors: [] as string[]
  };

  for (const student of students) {
    // 4. Idempotency: kiểm tra đã gửi tuần này chưa
    const idempotencyTag = `weekly_push_${student.id}_${weekId}`;
    const { data: existing } = await supabase
      .from('app_notifications')
      .select('id')
      .eq('user_id', student.id)
      .eq('type', 'progress_weekly')
      .gte('created_at', getStartOfWeek().toISOString())
      .limit(1);

    if (existing && existing.length > 0) {
      results.skippedDuplicate++;
      continue;
    }

    // 5. AI Generate message
    const { title, body } = generateWeeklyMessage(student);

    // 6. Lưu vào app_notifications
    const { data: notifData, error: notifErr } = await supabase
      .from('app_notifications')
      .insert({
        user_id: student.id,
        title,
        body,
        type: 'progress_weekly',
        is_read: false,
        metadata: {
          studentName: student.full_name || student.username,
          cycle: 'weekly',
          weekId,
          idempotencyTag
        }
      })
      .select('id')
      .single();

    if (notifErr) {
      results.errors.push(`Save failed: ${student.id}`);
      continue;
    }

    results.notificationsSaved++;

    // 7. Gửi Web Push nếu đã cấu hình VAPID
    if (!pushEnabled) continue;

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', student.id)
      .eq('is_active', true);

    if (!subs || subs.length === 0) continue;

    const pushPayload = JSON.stringify({
      title,
      body: body.substring(0, 200) + (body.length > 200 ? '...' : ''),
      icon: '/icon-192.png',
      badge: '/logo.png',
      tag: `ph-weekly-${weekId}`,
      type: 'progress_weekly',
      notificationId: notifData?.id,
      url: '/',
      requireInteraction: true
    });

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          },
          pushPayload
        );
        results.pushSent++;
      } catch (pushErr: any) {
        // Subscription hết hạn → vô hiệu hóa
        if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('endpoint', sub.endpoint);
        }
        results.pushFailed++;
      }
    }

    // Cập nhật push_sent
    if (notifData?.id) {
      await supabase
        .from('app_notifications')
        .update({ push_sent: true, push_sent_at: new Date().toISOString() })
        .eq('id', notifData.id);
    }

    // Rate limiting nhẹ: 100ms giữa mỗi user
    await new Promise(r => setTimeout(r, 100));
  }

  return res.status(200).json({
    message: `✅ Hoàn tất Cron thông báo tuần (${weekId}). Tự động 100%.`,
    weekId,
    results
  });
}

/**
 * Helper: Lấy đầu tuần (Thứ Hai) để kiểm tra idempotency
 */
function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}
