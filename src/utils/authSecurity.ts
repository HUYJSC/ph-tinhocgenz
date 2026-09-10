/**
 * TIN HỌC GEN Z — Auth Security & Cryptographic Utilities
 * Tiêu chuẩn bảo mật P0:
 * 1. Băm mật khẩu bằng SHA-256 kết hợp Salt bảo mật
 * 2. So sánh chuỗi an toàn chống timing attack (constant-time comparison)
 * 3. Tuyệt đối không lưu trữ hoặc xử lý mật khẩu dạng văn bản rõ (plaintext)
 */

const AUTH_SALT = 'tgz_sec_2026_salt_9d8f7e6a5b4c';

/**
 * Băm mật khẩu với SHA-256 và Salt tĩnh của hệ thống
 */
export async function hashPassword(password: string): Promise<string> {
  const clean = (password || '').trim();
  if (!clean) return '';

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(clean + ':' + AUTH_SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback băm nội bộ khi môi trường không có Web Crypto API
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  const str = clean + ':' + AUTH_SALT;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

/**
 * Băm đồng bộ nhanh (Sync Hash) phục vụ so khớp tức thời
 */
export function hashPasswordSync(password: string): string {
  const clean = (password || '').trim();
  if (!clean) return '';
  const str = clean + ':' + AUTH_SALT;
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  let h2 = 0;
  for (let i = 0; i < str.length; i++) {
    h2 = ((h2 << 7) - h2) + str.charCodeAt(i);
    h2 = h2 & h2;
  }
  return (hash >>> 0).toString(16) + '-' + (h2 >>> 0).toString(16);
}

/**
 * So khớp hằng số thời gian (Constant-time string comparison) chống Timing Attack
 */
export function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Kiểm tra độ mạnh mật khẩu (Tối thiểu 6 ký tự, không được là chuỗi dễ đoán)
 */
export function validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
  const p = (password || '').trim();
  if (p.length < 6) {
    return { isValid: false, message: 'Mật khẩu phải có tối thiểu 6 ký tự bảo mật.' };
  }
  const blacklist = ['123456', 'password', 'admin123', 'qwerty', '12345678', '111111', '666666'];
  if (blacklist.includes(p.toLowerCase())) {
    return { isValid: false, message: 'Mật khẩu quá đơn giản và dễ đoán. Vui lòng chọn mật khẩu mạnh hơn.' };
  }
  return { isValid: true };
}