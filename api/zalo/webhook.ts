import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient } from '../_lib/supabase.js';
import { verifyZaloWebhookSignature } from '../_lib/zaloClient.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 0. Handshake xác thực URL từ Zalo Developer Console (Zalo gửi GET challenge hoặc ping kiểm tra URL)
  if (req.method === 'GET') {
    const challenge = req.query.challenge as string | undefined;
    if (challenge) {
      return res.status(200).send(challenge);
    }
    return res.status(200).json({
      error: 0,
      status: 'active',
      service: 'PH Digital Education Zalo ZBS Webhook Service',
      version: '2026.1',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST or GET.' });
  }

  const signature = (req.headers['x-zes-signature'] || req.headers['x-zalo-signature']) as string | undefined;
  const timestamp = (req.headers['x-zes-timestamp'] || req.headers['x-zalo-timestamp']) as string | undefined;
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  // 1. Kiểm tra chữ ký & chống Replay Attack nếu có cấu hình bí mật webhook
  if (process.env.ZALO_OA_SECRET_KEY || process.env.ZALO_APP_SECRET) {
    const verifyResult = verifyZaloWebhookSignature(rawBody, signature, timestamp);
    if (!verifyResult.valid) {
      console.warn('Webhook verification failed:', verifyResult.error);
      return res.status(401).json({ error: verifyResult.error });
    }
  }

  const payload = req.body || {};
  const eventId = payload.event_id || payload.tracking_id || `EVT_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const eventType = payload.event_name || payload.event_type || 'message_status';
  const zaloMsgId = payload.msg_id || payload.message_id || payload.data?.msg_id;
  const status = (payload.status || payload.event_type || '').toLowerCase(); // delivered, failed, sent, received

  const supabase = getSupabaseAdminClient();

  // 2. Chống Replay Attack: Ghi nhận event_id vào zalo_webhook_events (Ràng buộc UNIQUE)
  if (supabase) {
    try {
      const { error: insertErr } = await supabase.from('zalo_webhook_events').insert({
        event_id: eventId,
        event_type: eventType,
        zalo_msg_id: zaloMsgId || null,
        payload,
        signature: signature || null,
        processed: true,
        created_at: new Date().toISOString()
      });

      if (insertErr && insertErr.code === '23505') {
        // Trùng event_id (Duplicate webhook delivery / Replay)
        return res.status(200).json({ message: 'Event already processed (Idempotent)' });
      }
    } catch (e) {
      console.error('Lỗi kiểm tra trùng event_id webhook:', e);
    }

    // 3. Cập nhật trạng thái phát tin (delivered / failed) trong zalo_message_logs
    try {
      let deliveryStatus: 'delivered' | 'failed' = 'failed';
      if (status.includes('delivered') || status.includes('success') || status.includes('received')) {
        deliveryStatus = 'delivered';
      }

      if (zaloMsgId) {
        await supabase
          .from('zalo_message_logs')
          .update({
            delivery_status: deliveryStatus,
            delivered_at: deliveryStatus === 'delivered' ? new Date().toISOString() : null,
            error_code: payload.error_code || null,
            error_message: payload.error_message || null
          })
          .eq('zalo_msg_id', zaloMsgId);
      } else if (payload.tracking_id) {
        await supabase
          .from('zalo_message_logs')
          .update({
            delivery_status: deliveryStatus,
            delivered_at: deliveryStatus === 'delivered' ? new Date().toISOString() : null
          })
          .eq('tracking_id', payload.tracking_id);
      }
    } catch (updateErr) {
      console.error('Lỗi cập nhật log từ webhook:', updateErr);
    }
  }

  // 4. Chuyển tiếp (forward) sự kiện sang Webhook debug (Webhook.site) theo yêu cầu vận hành
  const forwardUrl = process.env.WEBHOOK_FORWARD_URL || 'https://webhook.site/1cae0c37-7f5a-4fb6-9824-b0b5a51d01bd';
  if (forwardUrl) {
    try {
      fetch(forwardUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ZES-Signature': signature || '',
          'X-ZES-Timestamp': timestamp || '',
          'X-Forwarded-From': 'PH-Digital-Education-Webhook'
        },
        body: rawBody
      }).catch(err => console.warn('Lỗi forward webhook debug:', err.message));
    } catch {}
  }

  // Zalo OpenAPI yêu cầu phản hồi 200 OK với error: 0
  return res.status(200).json({
    error: 0,
    message: 'Webhook processed successfully'
  });
}
