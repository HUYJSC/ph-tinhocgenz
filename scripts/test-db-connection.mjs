/**
 * scripts/test-db-connection.mjs
 * Script kiểm tra kết nối MySQL DirectAdmin
 * Chạy: node scripts/test-db-connection.mjs
 *
 * Yêu cầu: Đã điền DATABASE_URL trong file .env
 */

import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Đọc .env thủ công (không cần dotenv dependency)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');

let envVars = {};
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    envVars[key] = val;
  }
} catch {
  console.error('❌ Không tìm thấy file .env — hãy tạo .env từ .env.example');
  process.exit(1);
}

const DB_HOST     = envVars.DB_HOST     || '103.82.20.110';
const DB_PORT     = parseInt(envVars.DB_PORT || '3306');
const DB_USER     = envVars.DB_USER     || '';
const DB_PASSWORD = envVars.DB_PASSWORD || '';
const DB_NAME     = envVars.DB_NAME     || '';

console.log('\n🔗 PH TinhocGenz — MySQL Connection Test');
console.log('─'.repeat(45));
console.log(`  Host    : ${DB_HOST}`);
console.log(`  Port    : ${DB_PORT}`);
console.log(`  User    : ${DB_USER}`);
console.log(`  Database: ${DB_NAME}`);
console.log('─'.repeat(45));

if (!DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.error('\n❌ Thiếu thông tin kết nối!');
  console.error('   Hãy điền DB_USER, DB_PASSWORD, DB_NAME trong file .env\n');
  process.exit(1);
}

let connection;
try {
  console.log('\n⏳ Đang kết nối tới MySQL...');

  connection = await createConnection({
    host    : DB_HOST,
    port    : DB_PORT,
    user    : DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    connectTimeout: 10000
  });

  // Test query
  const [rows] = await connection.execute('SELECT VERSION() AS version, NOW() AS server_time, DATABASE() AS current_db');
  const info = rows[0];

  console.log('\n✅ KẾT NỐI THÀNH CÔNG!');
  console.log('─'.repeat(45));
  console.log(`  MySQL Version : ${info.version}`);
  console.log(`  Server Time   : ${info.server_time}`);
  console.log(`  Database      : ${info.current_db}`);

  // Kiểm tra bảng
  const [tables] = await connection.execute('SHOW TABLES');
  console.log(`  Số bảng hiện có: ${tables.length}`);
  if (tables.length > 0) {
    const tableKey = Object.keys(tables[0])[0];
    console.log(`  Danh sách bảng: ${tables.map(t => t[tableKey]).join(', ')}`);
  } else {
    console.log('  ℹ️  Database trống — chưa có bảng nào. Chạy: npx prisma migrate deploy');
  }
  console.log('─'.repeat(45));
  console.log('\n🚀 Bước tiếp theo:');
  console.log('   npx prisma migrate deploy   ← Tạo bảng từ schema.prisma');
  console.log('   npx prisma studio           ← Xem dữ liệu trực quan\n');

} catch (err) {
  console.error('\n❌ KẾT NỐI THẤT BẠI!');
  console.error('─'.repeat(45));
  console.error(`  Lỗi: ${err.message}`);
  console.error('\n🔧 Kiểm tra:');
  console.error('   1. Server DirectAdmin có allow remote MySQL connection không?');
  console.error('   2. DB_USER có được cấp quyền remote access không? (GRANT ALL ON db.* TO user@\'%\')');
  console.error('   3. Firewall có mở port 3306 không?');
  console.error('   4. DB_PASSWORD có đúng không?\n');
  process.exit(1);

} finally {
  if (connection) await connection.end();
}
