/**
 * documentTitle.ts — Utility for standardized, SEO-friendly browser tab titles.
 * Formats: "<Page Name> | Tin Học Gen Z" or default master title.
 */

const BASE_TITLE = 'Tin Học Gen Z';
const DEFAULT_TITLE = 'Tin Học Gen Z • Nâng Kỹ Năng Số – Mở Lối Tương Lai';

export function setDocumentTitle(pageTitle?: string): void {
  if (typeof document === 'undefined') return;

  if (!pageTitle || pageTitle.trim() === '') {
    document.title = DEFAULT_TITLE;
    return;
  }

  // Avoid duplicate "Tin Học Gen Z | Tin Học Gen Z"
  if (pageTitle.includes(BASE_TITLE)) {
    document.title = pageTitle;
  } else {
    document.title = `${pageTitle} | ${BASE_TITLE}`;
  }
}

/**
 * Route to page title mapping
 */
export const ROUTE_TITLES: Record<string, string> = {
  home: DEFAULT_TITLE,
  landing: DEFAULT_TITLE,
  courses: 'Khóa Học Lập Trình & Tin Học Văn Phòng',
  'learning-paths': 'Lộ Trình Học & Chứng Chỉ Số',
  'mock-test': 'Thi Thử & Khảo Thí Trực Tuyến',
  verify: 'Xác Thực Chứng Chỉ Số Blockchain',
  student: 'Cổng Học Viên',
  teacher: 'Cổng Giảng Viên',
  giaovu: 'Cổng Vận Hành Đào Tạo',
  admin: 'Quản Trị Hệ Thống',
  attendance: 'Điểm Danh Số Thông Minh',
  schedule: 'Thời Khóa Biểu & Lịch Học',
  assignments: 'Bài Tập & Thực Hành',
  certificates: 'Chứng Chỉ Số & Hồ Sơ Năng Lực'
};

export function updateTitleByRoute(route: string, subTab?: string): void {
  const mainTitle = ROUTE_TITLES[route] || 'Học Trực Tuyến';
  if (subTab) {
    const formattedSub = subTab.charAt(0).toUpperCase() + subTab.slice(1);
    setDocumentTitle(`${formattedSub} — ${mainTitle}`);
  } else {
    setDocumentTitle(mainTitle);
  }
}
