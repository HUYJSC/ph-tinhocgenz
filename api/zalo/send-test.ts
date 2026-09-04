import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient, verifyUserRole } from '../_lib/supabase.js';
import {
  sendZaloTemplateMessage,
  normalizeVietnamesePhone,
  maskPhone
} from '../_lib/zaloClient.js';
import { getZaloConfig } from '../_lib/zaloConfig.js';
import { checkRateLimit } from '../_lib/rateLimiter.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  // 1. Phân quyền nghiêm ngặt: Chỉ ADMIN được phép gửi thử
  const authHeader = req.headers.authorization;
  const roleCheck = await verifyUserRole(authHeader);

  if (roleCheck.authenticated) {
    if (roleCheck.role !== 'admin' && roleCheck.role !== 'service_role') {
      return res.status(403).json({
        error: 'Forbidden. Chỉ Quản trị viên (Admin) mới có quyền thực hiện chức năng gửi thử Zalo.'
      });
    }
  } else if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(401).json({
      error: 'Unauthorized. Vui lòng đăng nhập tài khoản Quản trị viên để gửi thử.'
    });
  }

  // 2. Áp dụng Rate Limit: Tối đa 5 lượt gửi thử / phút / IP hoặc User
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const rateLimit = checkRateLimit(`send_test_${clientIp}`, 5, 60 * 1000);

  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: `Bạn đã thực hiện quá nhiều lượt gửi thử. Vui lòng thử lại sau ${rateLimit.resetInSec} giây.`
    });
  }

  const { recipient, phone, template = 'REMINDER', parameters = {}, template_data } = req.body || {};
  const targetPhone = recipient || phone;

  if (!targetPhone) {
    return res.status(400).json({
      error: 'Thiếu số điện thoại người nhận (recipient).'
    });
  }

  // 3. Chuẩn hóa số điện thoại
  const phoneNorm = normalizeVietnamesePhone(targetPhone);
  if (!phoneNorm.valid) {
    return res.status(400).json({
      error: phoneNorm.error
    });
  }

  const config = getZaloConfig();
  const templateId =
    template === 'WARNING'
      ? config.templates.warning
      : template === 'PAYMENT'
      ? config.templates.payment
      : config.templates.reminder;

  const actualTemplateData = template_data || parameters || {
    student_name: 'Học viên Test',
    recipient_name: 'Quản trị viên Hệ thống',
    cycle: 'Test Probe',
    message_body: 'Đây là tin nhắn kiểm thử kết nối chính thức Zalo ZBS từ Hệ thống PH Digital Education.'
  };

  const actualTrackingId = `TEST_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const masked = maskPhone(phoneNorm.normalized);

  // 4. Gửi qua Zalo OpenAPI chính thức
  const sendResult = await sendZaloTemplateMessage({
    phone: phoneNorm.normalized,
    template_id: templateId,
    template_data: actualTemplateData,
    tracking_id: actualTrackingId
  });

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      await supabase.from('zalo_message_logs').insert({
        student_id: 'ADMIN_TEST',
        recipient_type: 'admin',
        masked_phone: masked,
        template_id: templateId,
        tracking_id: actualTrackingId,
        zalo_msg_id: sendResult.msg_id || null,
        request_status: sendResult.success ? 'accepted' : 'failed',
        delivery_status: 'pending',
        error_code: sendResult.error || 0,
        error_message: sendResult.message || null,
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('Lỗi lưu log gửi thử:', e);
    }
  }

  if (!sendResult.success) {
    return res.status(400).json({
      success: false,
      error: sendResult.error,
      message: sendResult.message || 'Zalo OpenAPI từ chối gửi tin thử nghiệm.',
      tracking_id: actualTrackingId
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Gửi thử nghiệm qua Zalo ZBS OpenAPI thành công!',
    msg_id: sendResult.msg_id,
    tracking_id: actualTrackingId,
    recipient_masked: masked
  });
}
