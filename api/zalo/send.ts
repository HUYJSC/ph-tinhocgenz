import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient, verifyUserRole } from '../_lib/supabase.js';
import {
  sendZaloTemplateMessage,
  normalizeVietnamesePhone,
  maskPhone
} from '../_lib/zaloClient.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Chỉ chấp nhận phương thức POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  // 1. Kiểm tra xác thực & quyền hạn (Chỉ Teacher & Admin được gửi tin)
  const authHeader = req.headers.authorization;
  const roleCheck = await verifyUserRole(authHeader);

  // Nếu môi trường Supabase có sẵn và token không hợp lệ hoặc role là student -> Chặn
  if (roleCheck.authenticated) {
    if (roleCheck.role !== 'teacher' && roleCheck.role !== 'admin' && roleCheck.role !== 'service_role') {
      return res.status(403).json({
        error: 'Forbidden. Chỉ Giảng viên (Teacher) hoặc Quản trị viên (Admin) mới có quyền phát tin Zalo ZBS.'
      });
    }
  } else {
    // Nếu token hoàn toàn thiếu hoặc sai định dạng khi server yêu cầu bảo mật
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(401).json({
        error: `Unauthorized: ${roleCheck.error || 'Vui lòng đăng nhập với tài khoản Quản trị/Giảng viên để thực hiện gửi Zalo.'}`
      });
    }
  }

  const {
    phone,
    template_id,
    template_data,
    tracking_id,
    student_id = 'SYSTEM',
    recipient_type = 'parent'
  } = req.body || {};

  if (!phone || !template_id || !template_data) {
    return res.status(400).json({
      error: 'Bad Request. Thiếu tham số bắt buộc: phone, template_id, template_data.'
    });
  }

  const phoneNorm = normalizeVietnamesePhone(phone);
  if (!phoneNorm.valid) {
    return res.status(400).json({
      error: phoneNorm.error
    });
  }

  const actualTrackingId = tracking_id || `TRK_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const masked = maskPhone(phoneNorm.normalized);
  const supabase = getSupabaseAdminClient();

  // 2. Gọi Zalo ZBS Template Message API chính thức
  const sendResult = await sendZaloTemplateMessage({
    phone: phoneNorm.normalized,
    template_id,
    template_data,
    tracking_id: actualTrackingId
  });

  // 3. Ghi nhận vào bảng zalo_message_logs
  if (supabase) {
    try {
      await supabase.from('zalo_message_logs').insert({
        student_id,
        recipient_type,
        masked_phone: masked,
        template_id,
        tracking_id: actualTrackingId,
        zalo_msg_id: sendResult.msg_id || null,
        request_status: sendResult.success ? 'accepted' : 'failed',
        delivery_status: 'pending',
        error_code: sendResult.error || 0,
        error_message: sendResult.message || null,
        created_at: new Date().toISOString()
      });
    } catch (dbErr) {
      console.error('Không thể lưu log vào Supabase:', dbErr);
    }
  }

  // 4. Phản hồi kết quả thật
  if (!sendResult.success) {
    return res.status(400).json({
      success: false,
      error: sendResult.error,
      message: sendResult.message,
      tracking_id: actualTrackingId,
      is_transient: sendResult.isTransient
    });
  }

  return res.status(200).json({
    success: true,
    msg_id: sendResult.msg_id,
    tracking_id: actualTrackingId,
    masked_phone: masked,
    status: 'accepted',
    message: 'Tin nhắn đã được Zalo OpenAPI tiếp nhận xử lý.'
  });
}
