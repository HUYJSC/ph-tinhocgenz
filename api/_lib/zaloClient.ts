import crypto from 'crypto';
import { getSupabaseAdminClient } from './supabase';

export interface ZaloOaTokenRecord {
  id: string;
  oa_id: string;
  app_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  is_active: boolean;
}

export interface ZaloSendTemplateParams {
  phone: string;
  template_id: string;
  template_data: Record<string, any>;
  tracking_id: string;
}

export interface ZaloApiResponse<T = any> {
  error: number;
  message: string;
  data?: T;
}

/**
 * Chuẩn hóa số điện thoại Việt Nam sang định dạng 84xxxxxxxxx
 * Hỗ trợ các đầu số: 09, 08, 07, 05, 03, +84...
 */
export function normalizeVietnamesePhone(phone: string): { valid: boolean; normalized: string; error?: string } {
  if (!phone) {
    return { valid: false, normalized: '', error: 'Số điện thoại không được để trống' };
  }

  // Loại bỏ khoảng trắng, dấu chấm, dấu gạch ngang, dấu ngoặc
  let clean = phone.replace(/[\s.\-()+]/g, '');

  // Nếu bắt đầu bằng 84
  if (clean.startsWith('84')) {
    clean = clean;
  } else if (clean.startsWith('0')) {
    clean = '84' + clean.substring(1);
  } else if (clean.length === 9 && /^[35789]/.test(clean)) {
    clean = '84' + clean;
  }

  // Kiểm tra định dạng số điện thoại Việt Nam chuẩn: 84 + (3|5|7|8|9) + 8 chữ số
  const vnPhoneRegex = /^84(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
  if (!vnPhoneRegex.test(clean)) {
    return {
      valid: false,
      normalized: clean,
      error: `Số điện thoại ${phone} không đúng định dạng di động Việt Nam hợp lệ (84xxxxxxxxx)`
    };
  }

  return { valid: true, normalized: clean };
}

/**
 * Che dấu số điện thoại bảo vệ thông tin cá nhân (PII)
 * Ví dụ: 84901234567 -> 090***4567 hoặc 8490***4567
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  const start = phone.substring(0, phone.length - 7);
  const mid = phone.substring(phone.length - 7, phone.length - 4);
  const end = phone.substring(phone.length - 4);
  return `${start}${mid.replace(/./g, '*')}***${end}`;
}

/**
 * Phân loại lỗi Zalo API: Lỗi tạm thời (có thể retry) vs Lỗi dữ liệu vĩnh viễn (không retry)
 */
export function isTransientZaloError(errorCode: number): boolean {
  // Lỗi mạng, quá tải, rate limit tạm thời
  if (errorCode === -201) return true; // Rate limit exceeded (Zalo OA)
  if (errorCode === 429) return true;  // Too Many Requests
  if (errorCode >= 500 && errorCode <= 599) return true; // Server error
  return false;
}

/**
 * Lấy Access Token hợp lệ từ cơ sở dữ liệu Supabase, tự động refresh nếu sắp hết hạn
 */
export async function getValidZaloAccessToken(): Promise<{
  token: string | null;
  oaId: string | null;
  error?: string;
  isExpiringSoon?: boolean;
}> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { token: null, oaId: null, error: 'Chưa cấu hình Supabase Serverless' };
  }

  const appId = process.env.ZALO_APP_ID;
  const appSecret = process.env.ZALO_APP_SECRET;

  // Truy vấn token đang hoạt động
  const { data: tokens, error: dbError } = await supabase
    .from('zalo_oauth_tokens')
    .select('*')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (dbError || !tokens || tokens.length === 0) {
    return {
      token: null,
      oaId: null,
      error: 'Chưa cấu hình Token Zalo OA trong cơ sở dữ liệu. Vui lòng cấp quyền OAuth hoặc nạp token.'
    };
  }

  const tokenRecord: ZaloOaTokenRecord = tokens[0];
  const expiresAt = new Date(tokenRecord.expires_at).getTime();
  const now = Date.now();
  const tenMinutesMs = 10 * 60 * 1000;

  // Nếu token còn hạn > 10 phút, sử dụng trực tiếp
  if (expiresAt - now > tenMinutesMs) {
    return {
      token: tokenRecord.access_token,
      oaId: tokenRecord.oa_id,
      isExpiringSoon: false
    };
  }

  // Token đã hết hạn hoặc sắp hết hạn trong 10 phút -> Cần Refresh Token
  if (!appId || !appSecret) {
    // Nếu không có App Secret để refresh, nhưng token chưa hết hạn hẳn
    if (expiresAt > now) {
      return {
        token: tokenRecord.access_token,
        oaId: tokenRecord.oa_id,
        isExpiringSoon: true
      };
    }
    return {
      token: null,
      oaId: tokenRecord.oa_id,
      error: 'Access Token đã hết hạn nhưng thiếu ZALO_APP_ID hoặc ZALO_APP_SECRET để tự động Refresh Token.'
    };
  }

  // Gọi endpoint Refresh Access Token chính thức của Zalo:
  // POST https://oauth.zaloapp.com/v4/oa/access_token
  // Headers: secret_key: <app_secret>, Content-Type: application/x-www-form-urlencoded
  try {
    const params = new URLSearchParams();
    params.append('app_id', appId);
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', tokenRecord.refresh_token);

    const refreshRes = await fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'secret_key': appSecret
      },
      body: params.toString()
    });

    const refreshData = await refreshRes.json();

    if (!refreshData.access_token || !refreshData.refresh_token) {
      return {
        token: null,
        oaId: tokenRecord.oa_id,
        error: `Refresh Token thất bại từ Zalo OAuth: ${refreshData.error_name || refreshData.error || refreshData.message || JSON.stringify(refreshData)}`
      };
    }

    const expiresInSec = parseInt(refreshData.expires_in) || 90000;
    const newExpiresAt = new Date(Date.now() + expiresInSec * 1000).toISOString();

    // Cập nhật nguyên tử vào database vì refresh_token cũ chỉ dùng 1 lần duy nhất
    const { error: updateError } = await supabase
      .from('zalo_oauth_tokens')
      .update({
        access_token: refreshData.access_token,
        refresh_token: refreshData.refresh_token,
        expires_at: newExpiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenRecord.id);

    if (updateError) {
      console.error('Lỗi cập nhật token Zalo vào database:', updateError);
    }

    return {
      token: refreshData.access_token,
      oaId: tokenRecord.oa_id,
      isExpiringSoon: false
    };
  } catch (err: any) {
    return {
      token: null,
      oaId: tokenRecord.oa_id,
      error: `Không thể kết nối đến máy chủ Zalo OAuth: ${err.message}`
    };
  }
}

/**
 * Gửi Zalo ZBS Template Message API chính thức theo tài liệu 2026
 * POST https://business.openapi.zalo.me/message/template
 * Headers: Content-Type: application/json, access_token: <token>
 * Body: { phone, template_id, template_data, tracking_id }
 */
export async function sendZaloTemplateMessage(params: ZaloSendTemplateParams): Promise<{
  success: boolean;
  msg_id?: string;
  error?: number;
  message?: string;
  isTransient?: boolean;
}> {
  // 1. Chuẩn hóa số điện thoại
  const phoneCheck = normalizeVietnamesePhone(params.phone);
  if (!phoneCheck.valid) {
    return {
      success: false,
      error: -213,
      message: phoneCheck.error,
      isTransient: false
    };
  }

  // 2. Lấy Access Token thật từ Server
  const tokenResult = await getValidZaloAccessToken();
  if (!tokenResult.token) {
    return {
      success: false,
      error: -200,
      message: tokenResult.error || 'Thiếu Access Token Zalo OA thật.',
      isTransient: false
    };
  }

  const payload = {
    phone: phoneCheck.normalized,
    template_id: params.template_id,
    template_data: params.template_data,
    tracking_id: params.tracking_id
  };

  try {
    const response = await fetch('https://business.openapi.zalo.me/message/template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': tokenResult.token
      },
      body: JSON.stringify(payload)
    });

    const result: ZaloApiResponse<{ msg_id?: string }> = await response.json();

    // 3. Kiểm tra response: Chỉ thành công khi error === 0
    if (result.error === 0 && result.data?.msg_id) {
      return {
        success: true,
        msg_id: result.data.msg_id,
        error: 0,
        message: result.message || 'Gửi tin nhắn Zalo thành công'
      };
    }

    // Gặp lỗi từ Zalo OpenAPI
    const errorCode = result.error ?? response.status;
    return {
      success: false,
      error: errorCode,
      message: result.message || `Lỗi Zalo ZBS API (Mã: ${errorCode})`,
      isTransient: isTransientZaloError(errorCode)
    };
  } catch (netErr: any) {
    return {
      success: false,
      error: 500,
      message: `Lỗi kết nối Zalo OpenAPI: ${netErr.message}`,
      isTransient: true
    };
  }
}

/**
 * Kiểm tra chữ ký Webhook HMAC-SHA256 từ Zalo
 */
export function verifyZaloWebhookSignature(
  rawBody: string,
  signatureHeader?: string,
  timestampHeader?: string
): { valid: boolean; error?: string } {
  const secretKey = process.env.ZALO_OA_SECRET_KEY || process.env.ZALO_APP_SECRET;
  if (!secretKey) {
    // Nếu chưa cấu hình secret key
    return { valid: false, error: 'Chưa cấu hình ZALO_OA_SECRET_KEY trên server' };
  }

  // 1. Chống Replay Attack: Kiểm tra timestamp (không được cũ quá 5 phút)
  if (timestampHeader) {
    const reqTime = parseInt(timestampHeader, 10);
    const nowSec = Math.floor(Date.now() / 1000);
    if (isNaN(reqTime) || Math.abs(nowSec - reqTime) > 300) {
      return { valid: false, error: 'Webhook request timestamp hết hạn hoặc lệch quá 5 phút (Replay protection)' };
    }
  }

  if (!signatureHeader) {
    return { valid: false, error: 'Thiếu chữ ký xác thực Webhook trong header' };
  }

  // 2. Tính toán HMAC-SHA256
  const dataToSign = timestampHeader ? `${timestampHeader}.${rawBody}` : rawBody;
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(dataToSign);
  const expectedSignature = hmac.digest('hex');

  const cleanSignature = signatureHeader.replace(/^sha256=/, '');
  const isValid = crypto.timingSafeEqual(
    Buffer.from(cleanSignature, 'utf-8'),
    Buffer.from(expectedSignature, 'utf-8')
  );

  if (!isValid) {
    return { valid: false, error: 'Chữ ký Webhook không khớp' };
  }

  return { valid: true };
}
