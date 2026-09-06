/**
 * Time Formatting Utility with AM/PM (12-hour format)
 * Antigravity standard time formatter for EduQuest / PH Tin Học
 */

/**
 * Converts any 24-hour time string ("18:30", "08:00", "14:00:00")
 * or range ("18:30 - 20:30") to AM/PM format ("06:30 PM", "08:00 AM", "02:00 PM").
 */
export function formatTimeAmPm(timeStr: string | undefined | null): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (!trimmed) return '';

  // If already contains AM or PM, return as is
  if (/AM|PM/i.test(trimmed)) return trimmed;

  // If it's a range like "18:30 - 20:30" or "08:00 – 10:00"
  if (trimmed.includes(' - ') || trimmed.includes(' – ')) {
    const delimiter = trimmed.includes(' - ') ? ' - ' : ' – ';
    const parts = trimmed.split(delimiter);
    return parts.map(p => formatTimeAmPm(p.trim())).join(delimiter);
  }

  // Parse HH:mm or HH:mm:ss
  const parts = trimmed.split(':');
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const mins = parseInt(parts[1], 10);
    if (!isNaN(hours) && !isNaN(mins)) {
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = (hours % 12 || 12).toString().padStart(2, '0');
      const minsPad = mins.toString().padStart(2, '0');
      if (parts.length >= 3) {
        const secs = parseInt(parts[2], 10);
        if (!isNaN(secs)) {
          const secsPad = secs.toString().padStart(2, '0');
          return `${hours12}:${minsPad}:${secsPad} ${period}`;
        }
      }
      return `${hours12}:${minsPad} ${period}`;
    }
  }

  return trimmed;
}

/**
 * Formats a Date or ISO string into Vietnamese full readable format with AM/PM:
 * Example: "11:59 PM - Chủ Nhật, 13/09/2026"
 */
export function formatDateTimeAmPm(isoOrDate: string | Date | undefined | null): string {
  if (!isoOrDate) return 'Chưa thiết lập';
  try {
    const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
    if (isNaN(d.getTime())) return String(isoOrDate);

    const hours = d.getHours();
    const mins = d.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = (hours % 12 || 12).toString().padStart(2, '0');

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = daysOfWeek[d.getDay()];

    return `${hours12}:${mins} ${period} - ${dayName}, ${day}/${month}/${year}`;
  } catch {
    return String(isoOrDate);
  }
}

/**
 * Returns current timestamp string with AM/PM: e.g. "08:15:30 AM" or "06:30 PM"
 */
export function getCurrentTimeAmPm(includeSeconds: boolean = false): string {
  const d = new Date();
  const hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = (hours % 12 || 12).toString().padStart(2, '0');
  if (includeSeconds) {
    const secs = d.getSeconds().toString().padStart(2, '0');
    return `${hours12}:${mins}:${secs} ${period}`;
  }
  return `${hours12}:${mins} ${period}`;
}
