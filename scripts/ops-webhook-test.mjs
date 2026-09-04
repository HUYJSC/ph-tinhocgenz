/**
 * Operations Tool: Zalo ZBS Webhook Connectivity & Dispatch Verification
 * DevOps / SRE Operations Engineer Script
 * PH Digital Education 2026
 */

import crypto from 'crypto';

const WEBHOOK_SITE_URL = 'https://webhook.site/1cae0c37-7f5a-4fb6-9824-b0b5a51d01bd';
const SECRET_KEY = process.env.ZALO_OA_SECRET_KEY || 'ops_secret_key_demo_2026';

function generateHmacSha256(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

async function runOpsVerification() {
  console.log('================================================================');
  console.log('🚀 [PH DEVOPS SRE] KIỂM TRA & KẾT NỐI HỆ THỐNG ZALO ZBS WEBHOOK');
  console.log('================================================================');
  console.log(`📡 Đích Webhook Site: ${WEBHOOK_SITE_URL}`);
  console.log(`⏱️ Thời gian kiểm thử: ${new Date().toISOString()}`);

  const nowSec = Math.floor(Date.now() / 1000);
  const testMsgId = `zalo_zbs_${Date.now()}_ops`;
  const trackingId = `trk_ops_${Date.now()}`;

  // 1. Giả lập Payload chuẩn Zalo ZBS 2026 Webhook Event (Delivered)
  const webhookPayload = {
    app_id: '439281729019284',
    oa_id: '382910492810482',
    user_id_by_app: '84901234567',
    event_name: 'template_message_status',
    event_id: `EVT_SRE_${Date.now()}`,
    timestamp: nowSec,
    msg_id: testMsgId,
    tracking_id: trackingId,
    status: 'delivered',
    data: {
      template_id: '348291',
      recipient: '84901234567',
      delivered_time: Date.now(),
      cost: 1,
      network: 'Viettel'
    },
    system_metadata: {
      environment: 'production',
      deployer: 'DevOps_Ops_Engineer',
      app: 'PH_Digital_Education'
    }
  };

  const rawBody = JSON.stringify(webhookPayload, null, 2);
  const signature = generateHmacSha256(`${rawBody}${nowSec}`, SECRET_KEY);

  console.log('\n[1/2] 📤 Đang phát tín hiệu Webhook Event sang Webhook.site...');
  const startTime = Date.now();

  try {
    const res = await fetch(WEBHOOK_SITE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ZES-Signature': `mac=${signature}`,
        'X-ZES-Timestamp': `${nowSec}`,
        'X-Zalo-OA-Id': '382910492810482',
        'X-Service-Name': 'PH-Digital-Education-Ops',
        'User-Agent': 'Zalo-ZBS-Webhook-Dispatch/2026.1'
      },
      body: rawBody
    });

    const duration = Date.now() - startTime;
    console.log(`   Status: HTTP ${res.status} ${res.statusText}`);
    console.log(`   Response Latency: ${duration}ms`);

    if (res.ok) {
      console.log('   ✅ KẾT NỐI THÀNH CÔNG: Tín hiệu đã được ghi nhận ngay lập tức trên Webhook.site!');
    } else {
      console.error(`   ❌ Phản hồi không hợp lệ: HTTP ${res.status}`);
    }
  } catch (err) {
    console.error('   ❌ Lỗi kết nối Webhook.site:', err.message);
  }

  // 2. Phát thêm sự kiện kiểm tra "Học viên phản hồi Zalo OA" (User Feedback / Follow)
  console.log('\n[2/2] 📤 Đang phát sự kiện Zalo OA Follow / Interacted Event...');
  const followPayload = {
    app_id: '439281729019284',
    oa_id: '382910492810482',
    user_id_by_app: '84901234567',
    event_name: 'follow',
    event_id: `EVT_FOLLOW_${Date.now()}`,
    timestamp: nowSec,
    source: 'zalo_zbs_template_cta',
    message: 'Phụ huynh học viên đã theo dõi Zalo OA và bấm nút xác nhận kết quả học tập',
    operator: 'DevOps_Live_Probe'
  };

  try {
    const resFollow = await fetch(WEBHOOK_SITE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ZES-Signature': `mac=${generateHmacSha256(JSON.stringify(followPayload), SECRET_KEY)}`,
        'X-ZES-Timestamp': `${nowSec}`,
        'X-Event-Type': 'follow',
        'User-Agent': 'Zalo-ZBS-Webhook-Dispatch/2026.1'
      },
      body: JSON.stringify(followPayload, null, 2)
    });

    console.log(`   Status: HTTP ${resFollow.status} ${resFollow.statusText}`);
    if (resFollow.ok) {
      console.log('   ✅ GỬI SỰ KIỆN TƯƠNG TÁC THÀNH CÔNG!');
    }
  } catch (err) {
    console.error('   ❌ Lỗi gửi follow event:', err.message);
  }

  console.log('\n================================================================');
  console.log('🎯 TỔNG KẾT VẬN HÀNH:');
  console.log(`- Webhook Endpoint: ${WEBHOOK_SITE_URL}`);
  console.log('- Xem trực tiếp luồng gói tin tại: https://webhook.site/#!/view/1cae0c37-7f5a-4fb6-9824-b0b5a51d01bd');
  console.log('================================================================\n');
}

runOpsVerification();
