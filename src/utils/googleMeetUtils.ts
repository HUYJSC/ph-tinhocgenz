/**
 * Google Meet Utilities & Validation Engine — PH Digital Education LMS
 * Chuẩn hóa 100% định dạng Google Meet quốc tế:
 * - Cú pháp chuẩn: xxx-yyyy-zzz (3 chữ cái - 4 chữ cái - 3 chữ cái = 10 ký tự a-z)
 * - Không cho phép chữ số (0-9) hay ký tự lạ
 * - Hỗ trợ liên kết tạo phòng tức thì: meet.google.com/new
 * - Lưu trữ cấu hình phòng họp động của Giảng viên qua localStorage
 */

export const GOOGLE_MEET_CODE_REGEX = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
export const GOOGLE_MEET_URL_REGEX = /^https?:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(\?.*)?$/i;

const STORAGE_KEY_MEET_URLS = 'phtgz_custom_classroom_meet_urls';

/**
 * Kiểm tra xem một mã Meet có đúng định dạng chuẩn 3-4-3 hay không
 */
export function isValidGoogleMeetCode(code: string): boolean {
  if (!code) return false;
  const clean = code.trim().toLowerCase();
  return GOOGLE_MEET_CODE_REGEX.test(clean);
}

/**
 * Kiểm tra xem một URL có phải là đường dẫn Google Meet hợp lệ hay không
 */
export function isValidGoogleMeetUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.trim();
  return GOOGLE_MEET_URL_REGEX.test(clean);
}

/**
 * Trích xuất mã cuộc họp (xxx-yyyy-zzz) từ URL hoặc chuỗi nhập vào
 */
export function extractGoogleMeetCode(input: string): string {
  if (!input) return '';
  let clean = input.trim().toLowerCase();
  
  // Loại bỏ query string hoặc hash
  clean = clean.split('?')[0].split('#')[0];
  
  // Loại bỏ tiền tố domain meet.google.com
  clean = clean.replace(/^https?:\/\/meet\.google\.com\//i, '');
  clean = clean.replace(/^meet\.google\.com\//i, '');
  clean = clean.replace(/^\//, '').replace(/\/$/, '');

  return clean;
}

/**
 * Chuẩn hóa mã phòng thành URL Google Meet đầy đủ
 */
export function formatGoogleMeetUrl(codeOrUrl: string): string {
  if (!codeOrUrl) return 'https://meet.google.com/new';
  const clean = codeOrUrl.trim();
  if (clean.toLowerCase().startsWith('http://') || clean.toLowerCase().startsWith('https://')) {
    return clean;
  }
  const code = extractGoogleMeetCode(clean);
  return `https://meet.google.com/${code}`;
}

/**
 * Sinh ngẫu nhiên mã Google Meet chuẩn quốc tế (3 - 4 - 3, 100% chữ cái thường a-z)
 */
export function generateValidGoogleMeetCode(): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const randomSeg = (len: number) => {
    let res = '';
    for (let i = 0; i < len; i++) {
      res += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return res;
  };
  return `${randomSeg(3)}-${randomSeg(4)}-${randomSeg(3)}`;
}

/**
 * Sinh URL Google Meet hợp lệ ngẫu nhiên
 */
export function generateValidGoogleMeetUrl(): string {
  return `https://meet.google.com/${generateValidGoogleMeetCode()}`;
}

/**
 * Trả về liên kết tạo cuộc họp tức thì chính thống của Google
 */
export function getOfficialCreateMeetingUrl(): string {
  return 'https://meet.google.com/new';
}

/**
 * Lấy URL phòng học cho lớp (Ưu tiên link giảng viên đã lưu tùy chỉnh)
 */
export function getClassroomMeetUrl(classCode: string, fallbackUrl: string): string {
  if (typeof window === 'undefined') return fallbackUrl;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEET_URLS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed[classCode]) {
        return parsed[classCode];
      }
    }
  } catch {}
  return fallbackUrl;
}

/**
 * Lưu URL phòng học tùy chỉnh của Giảng viên / Quản trị viên
 */
export function setClassroomMeetUrl(classCode: string, url: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEET_URLS);
    const store = raw ? JSON.parse(raw) : {};
    store[classCode] = url.trim();
    localStorage.setItem(STORAGE_KEY_MEET_URLS, JSON.stringify(store));
  } catch {}
}
