import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient } from '../_lib/supabase';
import {
  sendZaloTemplateMessage,
  normalizeVietnamesePhone,
  maskPhone,
  isTransientZaloError
} from '../_lib/zaloClient';

/**
 * Tính số tuần trong năm để sinh Idempotency Key duy nhất cho chu kỳ hàng tuần
 */
function getWeekNumber(d: Date): string {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${d.getFullYear()}_W${weekNum}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Xác thực Vercel Cron Secret nếu có cấu hình
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized Cron Request' });
    }
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return res.status(503).json({ error: 'Supabase Database not configured for Cron execution' });
  }

  const weekId = getWeekNumber(new Date());

  // 2. Lấy Template thông báo tuần đã được phê duyệt và đang được bật
  const { data: templates } = await supabase
    .from('zalo_templates')
    .select('*')
    .eq('template_type', 'reminder')
    .eq('is_enabled', true)
    .eq('status', 'approved')
    .limit(1);

  const defaultTemplateId = templates?.[0]?.id || 'PH_WEEKLY_DIGEST_2026';

  // 3. Đọc danh sách học viên từ database thật
  // Tìm trong bảng accounts_user hoặc classes_enrollment
  const { data: students, error: studentError } = await supabase
    .from('accounts_user')
    .select('id, username, full_name, phone, birth_year, is_active')
    .eq('is_active', true)
    .limit(200);

  if (studentError || !students || students.length === 0) {
    return res.status(200).json({
      message: 'Không có học viên hoạt động để gửi thông báo tuần.',
      processed: 0
    });
  }

  const results = {
    total: students.length,
    queued: 0,
    accepted: 0,
    skipped_duplicate: 0,
    skipped_optout: 0,
    failed: 0
  };

  const currentYear = new Date().getFullYear();

  for (const student of students) {
    const age = student.birth_year ? (currentYear - student.birth_year) : 21;
    const isParent = age < 25;
    const recipientType: 'parent' | 'student' = isParent ? 'parent' : 'student';
    const targetPhone = student.phone || '';

    // 4. Kiểm tra số điện thoại hợp lệ
    const phoneNorm = normalizeVietnamesePhone(targetPhone);
    if (!phoneNorm.valid) {
      results.failed++;
      continue;
    }

    // 5. Kiểm tra sự đồng ý nhận thông báo (zalo_recipient_consents)
    const { data: consent } = await supabase
      .from('zalo_recipient_consents')
      .select('consent_status')
      .eq('student_id', student.id)
      .eq('recipient_phone', phoneNorm.normalized)
      .maybeSingle();

    if (consent && consent.consent_status === 'opt_out') {
      results.skipped_optout++;
      continue;
    }

    // 6. Idempotency Key duy nhất: Một học viên chỉ nhận tối đa 1 tin tuần mỗi chu kỳ
    const idempotencyKey = `weekly_${student.id}_${defaultTemplateId}_${weekId}`;

    // Kiểm tra hàng đợi có bị trùng không
    const { data: existingQueue } = await supabase
      .from('zalo_dispatch_queue')
      .select('id, status')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (existingQueue) {
      results.skipped_duplicate++;
      continue;
    }

    const trackingId = `CRON_${weekId}_${student.id.substring(0, 8)}_${Math.random().toString(36).substring(2, 6)}`;
    const templateData = {
      student_name: student.full_name || student.username,
      recipient_name: isParent ? `Quý Phụ huynh em ${student.full_name}` : student.full_name,
      week_label: `Tuần ${weekId.split('_W')[1]}`,
      attendance_summary: 'Chuyên cần đạt yêu cầu',
      study_link: 'https://hoctructuyen.tinhocgenz.io.vn'
    };

    // Đưa vào hàng đợi zalo_dispatch_queue
    const { error: queueErr } = await supabase
      .from('zalo_dispatch_queue')
      .insert({
        idempotency_key: idempotencyKey,
        student_id: student.id,
        recipient_type: recipientType,
        recipient_phone: phoneNorm.normalized,
        template_id: defaultTemplateId,
        template_data: templateData,
        tracking_id: trackingId,
        status: 'processing',
        scheduled_at: new Date().toISOString()
      });

    if (queueErr) {
      console.error('Lỗi xếp hàng phát tin:', queueErr);
      results.failed++;
      continue;
    }

    results.queued++;

    // 7. Gửi tin với Rate Limiting (giãn cách nhẹ 150ms để tuân thủ OpenAPI)
    await new Promise(r => setTimeout(r, 150));

    const sendRes = await sendZaloTemplateMessage({
      phone: phoneNorm.normalized,
      template_id: defaultTemplateId,
      template_data: templateData,
      tracking_id: trackingId
    });

    // 8. Cập nhật kết quả vào zalo_dispatch_queue và zalo_message_logs
    const masked = maskPhone(phoneNorm.normalized);
    if (sendRes.success) {
      results.accepted++;
      await supabase
        .from('zalo_dispatch_queue')
        .update({
          status: 'accepted',
          processed_at: new Date().toISOString()
        })
        .eq('idempotency_key', idempotencyKey);

      await supabase.from('zalo_message_logs').insert({
        student_id: student.id,
        recipient_type: recipientType,
        masked_phone: masked,
        template_id: defaultTemplateId,
        tracking_id: trackingId,
        zalo_msg_id: sendRes.msg_id || null,
        request_status: 'accepted',
        delivery_status: 'pending',
        created_at: new Date().toISOString()
      });
    } else {
      results.failed++;
      const isTransient = isTransientZaloError(sendRes.error || 0);

      await supabase
        .from('zalo_dispatch_queue')
        .update({
          status: isTransient ? 'queued' : 'failed',
          retry_count: isTransient ? 1 : 0,
          last_error: sendRes.message,
          processed_at: new Date().toISOString()
        })
        .eq('idempotency_key', idempotencyKey);

      await supabase.from('zalo_message_logs').insert({
        student_id: student.id,
        recipient_type: recipientType,
        masked_phone: masked,
        template_id: defaultTemplateId,
        tracking_id: trackingId,
        request_status: 'failed',
        delivery_status: 'failed',
        error_code: sendRes.error || 0,
        error_message: sendRes.message,
        created_at: new Date().toISOString()
      });
    }
  }

  return res.status(200).json({
    message: `Hoàn tất chu kỳ Cron Chủ nhật 19:00 Zalo Thông báo tuần (${weekId}).`,
    results
  });
}
