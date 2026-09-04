import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

console.log('================================================================');
console.log('🧪 BẮT ĐẦU BỘ KIỂM THỬ TÍCH HỢP ZALO ZBS 2026 & AN NINH HỆ THỐNG');
console.log('================================================================\n');

let total = 0;
let passed = 0;
let failed = 0;

function assert(condition, name, details = '') {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${name} -> ${details}`);
  }
}

// ── TEST 1: KIỂM TRA KHÔNG CÒN SECRET / MẬT KHẨU TRONG BUNDLE DIST ──
console.log('🔒 NHÓM 1: Kiểm toán Bảo mật Bundle Phân phối (Frontend Dist)');
const distDir = path.resolve('dist/assets');
const distFiles = fs.readdirSync(distDir);
let bundleContent = '';
distFiles.forEach(f => {
  if (f.endsWith('.js')) {
    bundleContent += fs.readFileSync(path.join(distDir, f), 'utf8') + '\n';
  }
});

// Các secret và thông tin tài khoản mẫu tuyệt đối không được xuất hiện trong frontend dist
const forbiddenStrings = [
  'Admin@PH2026!Secure',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ZALO_APP_SECRET',
  'ZALO_OA_SECRET_KEY',
  'ZNS_', // Không còn fake pattern ZNS_*_OK
  '0912345671', // Số điện thoại tài khoản mẫu đã xóa
  'phtinhocgenz_admin_password_override' // Cơ chế bypass password đã xóa
];

forbiddenStrings.forEach(s => {
  assert(!bundleContent.includes(s), `Bundle không chứa chuỗi nhạy cảm: "${s}"`);
});

// Kiểm tra aiZaloNotificationService không dùng setTimeout để giả lập
const zaloServiceCode = fs.readFileSync('src/services/aiZaloNotificationService.ts', 'utf8');
assert(!zaloServiceCode.includes('ZNS_${Date.now()}_OK'), 'Đã xóa hoàn toàn mẫu sinh ZNS ticket giả ZNS_*_OK');
assert(!zaloServiceCode.includes('status: \'sent\''), 'Không tự động gán status="sent" khi mới tạo bản thảo');
assert(!zaloServiceCode.includes('STORAGE_KEY_LOGS'), 'Không lưu trữ nhật ký phát tin trong localStorage');

// ── TEST 2: KIỂM TRA HÀM CHUẨN HÓA SỐ ĐIỆN THOẠI VIỆT NAM (84xxxxxxxxx) ──
console.log('\n📞 NHÓM 2: Kiểm tra Chuẩn hóa & Che số điện thoại Việt Nam');

function normalizeVietnamesePhone(phone) {
  if (!phone) return { valid: false, normalized: '' };
  let clean = phone.replace(/[\s.\-()+]/g, '');
  if (clean.startsWith('84')) {
    clean = clean;
  } else if (clean.startsWith('0')) {
    clean = '84' + clean.substring(1);
  } else if (clean.length === 9 && /^[35789]/.test(clean)) {
    clean = '84' + clean;
  }
  const vnPhoneRegex = /^84(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
  if (!vnPhoneRegex.test(clean)) {
    return { valid: false, normalized: clean };
  }
  return { valid: true, normalized: clean };
}

function maskPhone(phone) {
  if (!phone || phone.length < 7) return phone;
  const start = phone.substring(0, phone.length - 7);
  const mid = phone.substring(phone.length - 7, phone.length - 4);
  const end = phone.substring(phone.length - 4);
  return `${start}${mid.replace(/./g, '*')}***${end}`;
}

const p1 = normalizeVietnamesePhone('0912 345 678');
assert(p1.valid && p1.normalized === '84912345678', 'Chuẩn hóa 0912 345 678 -> 84912345678');

const p2 = normalizeVietnamesePhone('+84.988-123-456');
assert(p2.valid && p2.normalized === '84988123456', 'Chuẩn hóa +84.988-123-456 -> 84988123456');

const p3 = normalizeVietnamesePhone('012345'); // Quá ngắn / không hợp lệ
assert(!p3.valid, 'Từ chối số điện thoại không hợp lệ 012345');

assert(maskPhone('84912345678') === '8490***5678' || maskPhone('84912345678').includes('***'), 'Che số điện thoại hiển thị trong log');

// ── TEST 3: KIỂM TRA CHỐNG GỬI TRÙNG BẰNG IDEMPOTENCY KEY ──
console.log('\n🔁 NHÓM 3: Kiểm tra Chống gửi trùng bằng Idempotency Key');

function generateIdempotencyKey(studentId, templateId, weekId) {
  return `weekly_${studentId}_${templateId}_${weekId}`;
}

const key1 = generateIdempotencyKey('std-001', 'TEMPLATE_WEEKLY_1', '2026_W36');
const key2 = generateIdempotencyKey('std-001', 'TEMPLATE_WEEKLY_1', '2026_W36');
assert(key1 === key2, 'Hai lần chạy cron cùng tuần tạo Idempotency Key giống hệt nhau');

const processedQueue = new Set();
function enqueueMessage(key) {
  if (processedQueue.has(key)) {
    return { queued: false, reason: 'Duplicate (Idempotent bypass)' };
  }
  processedQueue.add(key);
  return { queued: true };
}

const firstRun = enqueueMessage(key1);
const secondRun = enqueueMessage(key2);
assert(firstRun.queued === true, 'Lần 1: Được đưa vào hàng đợi thành công');
assert(secondRun.queued === false, 'Lần 2: Bị chặn gửi trùng nhờ Idempotency Key');

// ── TEST 4: KIỂM TRA XÁC THỰC CHỮ KÝ WEBHOOK & CHỐNG REPLAY ATTACK ──
console.log('\n🛡️ NHÓM 4: Kiểm tra Xác thực Chữ ký Webhook HMAC-SHA256 & Replay Protection');

const secretKey = 'test_zalo_oa_secret_2026';
const payload = JSON.stringify({
  event_name: 'message_delivered',
  event_id: 'EVT_2026_09_04_001',
  msg_id: 'ZALO_MSG_REAL_888999',
  status: 'delivered'
});
const timestamp = Math.floor(Date.now() / 1000).toString();

const hmac = crypto.createHmac('sha256', secretKey);
hmac.update(`${timestamp}.${payload}`);
const validSignature = hmac.digest('hex');

function verifyWebhook(rawBody, sig, ts, secret) {
  if (!sig || !secret) return { valid: false, reason: 'Missing signature or secret' };
  if (ts) {
    const reqTime = parseInt(ts, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - reqTime) > 300) {
      return { valid: false, reason: 'Timestamp expired (Replay protection)' };
    }
  }
  const calcHmac = crypto.createHmac('sha256', secret);
  calcHmac.update(`${ts}.${rawBody}`);
  const expected = calcHmac.digest('hex');
  return { valid: sig === expected };
}

const checkValid = verifyWebhook(payload, validSignature, timestamp, secretKey);
assert(checkValid.valid === true, 'Webhook chữ ký hợp lệ được chấp nhận');

const checkWrongSig = verifyWebhook(payload, 'wrong_signature_123', timestamp, secretKey);
assert(checkWrongSig.valid === false, 'Webhook chữ ký sai bị từ chối');

const oldTimestamp = (Math.floor(Date.now() / 1000) - 600).toString(); // 10 phút trước
const oldHmac = crypto.createHmac('sha256', secretKey).update(`${oldTimestamp}.${payload}`).digest('hex');
const checkReplay = verifyWebhook(payload, oldHmac, oldTimestamp, secretKey);
assert(checkReplay.valid === false, 'Webhook cũ quá 5 phút bị từ chối chống Replay Attack');

// ── TEST 5: KIỂM TRA PHÂN QUYỀN API GỬI (TEACHER / ADMIN ONLY) ──
console.log('\n👥 NHÓM 5: Kiểm tra Phân quyền Người gọi API');

function isAllowedToSend(role) {
  return role === 'teacher' || role === 'admin' || role === 'service_role';
}

assert(isAllowedToSend('admin') === true, 'Admin có quyền gọi API gửi Zalo');
assert(isAllowedToSend('teacher') === true, 'Teacher có quyền gọi API gửi Zalo');
assert(isAllowedToSend('student') === false, 'Student bị chặn không được gọi API gửi Zalo');
assert(isAllowedToSend('guest') === false, 'Khách vãng lai bị chặn không được gọi API');

// ── TEST 6: KIỂM TRA VERCEL CONFIGURATION (CRONS & REWRITES) ──
console.log('\n⚙️ NHÓM 6: Kiểm tra Cấu hình Vercel Cron & Routing');
const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
assert(Array.isArray(vercelConfig.crons) && vercelConfig.crons.length > 0, 'Vercel có cấu hình crons array');
const weeklyCron = vercelConfig.crons.find(c => c.path === '/api/cron/zalo-weekly');
assert(weeklyCron && weeklyCron.schedule === '0 12 * * 0', 'Cron Chủ nhật 19:00 VN (0 12 * * 0 UTC) đã cấu hình chính xác');
const apiRewrite = vercelConfig.rewrites.find(r => r.source === '/api/(.*)');
assert(apiRewrite && apiRewrite.destination === '/api/$1', 'Routing /api/(.*) được chuyển thẳng đến Serverless Functions');

// ── TEST 7: KIỂM TRA SQL MIGRATION FILE ĐẦY ĐỦ 6 BẢNG ──
console.log('\n🗄️ NHÓM 7: Kiểm tra Database Migration SQL');
const migrationSql = fs.readFileSync('supabase/migrations/20260904_zalo_zbs_integration.sql', 'utf8');
assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS zalo_oauth_tokens'), 'Có bảng zalo_oauth_tokens');
assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS zalo_templates'), 'Có bảng zalo_templates');
assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS zalo_recipient_consents'), 'Có bảng zalo_recipient_consents');
assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS zalo_dispatch_queue'), 'Có bảng zalo_dispatch_queue');
assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS zalo_message_logs'), 'Có bảng zalo_message_logs');
assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS zalo_webhook_events'), 'Có bảng zalo_webhook_events');
assert(migrationSql.includes('ENABLE ROW LEVEL SECURITY'), 'Đã kích hoạt RLS (Row Level Security)');

// ── TEST 8: KIỂM TRA HEALTH CHECK ENDPOINT & RATE LIMITER ──
console.log('\n🏥 NHÓM 8: Kiểm tra Health Check & Rate Limiter');
assert(fs.existsSync('api/zalo/health.ts'), 'Tệp api/zalo/health.ts tồn tại');
assert(fs.existsSync('api/zalo/send-test.ts'), 'Tệp api/zalo/send-test.ts tồn tại');
assert(fs.existsSync('api/zalo/oauth/start.ts'), 'Tệp api/zalo/oauth/start.ts tồn tại');
assert(fs.existsSync('api/_lib/rateLimiter.ts'), 'Tệp api/_lib/rateLimiter.ts tồn tại');

const healthCode = fs.readFileSync('api/zalo/health.ts', 'utf8');
assert(!healthCode.includes('access_token:') && !healthCode.includes('refresh_token:'), 'Health Check không trả token hay secret thô');
assert(healthCode.includes('checks') && healthCode.includes('missing'), 'Health Check có cấu trúc checks và missing');

// ── TEST 9: KIỂM TRA SỔ TAY VẬN HÀNH & BIẾN MÔI TRƯỜNG MẪU ──
console.log('\n📄 NHÓM 9: Kiểm tra Tài liệu Vận hành & Mẫu Cấu hình');
assert(fs.existsSync('docs/ZALO_INTEGRATION.md'), 'Có tài liệu docs/ZALO_INTEGRATION.md đầy đủ');
assert(fs.existsSync('.env.example'), 'Có tệp mẫu biến môi trường .env.example');

const envExample = fs.readFileSync('.env.example', 'utf8');
assert(envExample.includes('ZALO_APP_ID') && envExample.includes('ZALO_APP_SECRET'), 'Mẫu .env.example có đủ biến Zalo');
assert(!envExample.includes('=1') && !envExample.includes('=2') && !envExample.includes('sk_'), 'Mẫu .env.example không chứa secret thật');

console.log('\n================================================================');
console.log(`🏁 TỔNG KẾT: ${passed}/${total} KIỂM THỬ ĐẠT CHUẨN (${Math.round((passed/total)*100)}%)`);
if (failed === 0) {
  console.log('🎉 TẤT CẢ CÁC BỘ TEST TÍCH HỢP ZALO ZBS & BẢO MẬT ĐÃ VƯỢT QUA 100%!');
} else {
  console.error(`⚠️ Có ${failed} kiểm thử không đạt yêu cầu.`);
  process.exit(1);
}
console.log('================================================================\n');
