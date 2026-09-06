/**
 * Time Formatting Utility (Standard 24-Hour Format: 00:00 - 23:59 / 24:00)
 * Hoàn toàn loại bỏ SA, CH, AM, PM theo chuẩn hiển thị 24h
 * Antigravity standard time formatter for EduQuest / PH Tin Học
 */

/**
 * Helper to convert single time string to 24-hour format HH:mm
 * Examples:
 * - "06:30 PM" / "06:30 CH" -> "18:30"
 * - "08:00 AM" / "08:00 SA" -> "08:00"
 * - "18:30" -> "18:30"
 * - "8:30" -> "08:30"
 */
function parseSingleTimeTo24h(timeStr: string): string {
  const raw = timeStr.trim();
  if (!raw) return '';

  const isPM = /(PM|CH|Chi\u1EC1u|T\u1ED1i)/i.test(raw);
  const isAM = /(AM|SA|S\u00E1ng)/i.test(raw);

  // Remove any AM, PM, SA, CH words or prefixes/suffixes
  const clean = raw.replace(/(AM|PM|SA|CH|S\u00E1ng|Chi\u1EC1u|T\u1ED1i|h|H)/gi, '').trim();

  const parts = clean.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const mins = parseInt(parts[1], 10);
    if (!isNaN(hours) && !isNaN(mins)) {
      if (isPM && hours < 12) {
        hours += 12;
      } else if (isAM && hours === 12) {
        hours = 0;
      }
      const hPad = hours.toString().padStart(2, '0');
      const mPad = mins.toString().padStart(2, '0');
      return `${hPad}:${mPad}`;
    }
  }

  return clean;
}

/**
 * Formats any time string or range into clean 24-hour format (HH:mm)
 * Example:
 * - "18:30" -> "18:30"
 * - "06:30 PM - 08:30 PM" -> "18:30 - 20:30"
 * - "08:00 SA – 10:00 SA" -> "08:00 – 10:00"
 */
export function formatTime24h(timeStr: string | undefined | null): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (!trimmed) return '';

  // If it's a range like "18:30 - 20:30" or "08:00 – 10:00"
  if (trimmed.includes(' - ') || trimmed.includes(' – ')) {
    const delimiter = trimmed.includes(' - ') ? ' - ' : ' – ';
    const parts = trimmed.split(delimiter);
    return parts.map(p => parseSingleTimeTo24h(p)).join(delimiter);
  }

  return parseSingleTimeTo24h(trimmed);
}

// Alias for backwards compatibility, ensuring 24-hour output everywhere
export const formatTimeAmPm = formatTime24h;

/**
 * Formats a Date or ISO string into Vietnamese 24-hour format:
 * Example: "18:30 - Chủ Nhật, 13/09/2026" (No SA, no CH, no AM, no PM)
 */
export function formatDateTime24h(isoOrDate: string | Date | undefined | null): string {
  if (!isoOrDate) return 'Chưa thiết lập';
  try {
    const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
    if (isNaN(d.getTime())) return String(isoOrDate);

    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = daysOfWeek[d.getDay()];

    return `${hours}:${mins} - ${dayName}, ${day}/${month}/${year}`;
  } catch {
    return String(isoOrDate);
  }
}

// Alias for backwards compatibility, ensuring 24-hour output everywhere
export const formatDateTimeAmPm = formatDateTime24h;

/**
 * Returns current timestamp string in 24-hour format: e.g. "08:15" or "18:30:45"
 */
export function getCurrentTime24h(includeSeconds: boolean = false): string {
  const d = new Date();
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  if (includeSeconds) {
    const secs = d.getSeconds().toString().padStart(2, '0');
    return `${hours}:${mins}:${secs}`;
  }
  return `${hours}:${mins}`;
}

// Alias for backwards compatibility
export const getCurrentTimeAmPm = getCurrentTime24h;
