/**
 * documentTitle.ts — Standardized, SEO-friendly browser tab titles.
 * Exact Spec Requirements:
 * Website: Tin Học Gen Z | MOS, IC3 & Tin Học Ứng Dụng
 * Student: {Page} | Cổng Học Viên Tin Học Gen Z
 * Teacher: {Page} | Cổng Giảng Viên Tin Học Gen Z
 * Giaovu:  {Page} | Giáo Vụ Tin Học Gen Z
 * Admin:   {Page} | Quản Trị Tin Học Gen Z
 */

export const PUBLIC_SITE_TITLE = 'Tin Học Gen Z | MOS, IC3 & Tin Học Ứng Dụng';

export const PORTAL_SUFFIXES = {
  website: 'Tin Học Gen Z | MOS, IC3 & Tin Học Ứng Dụng',
  student: 'Cổng Học Viên Tin Học Gen Z',
  teacher: 'Cổng Giảng Viên Tin Học Gen Z',
  giaovien: 'Cổng Giảng Viên Tin Học Gen Z',
  giaovu: 'Giáo Vụ Tin Học Gen Z',
  academic: 'Giáo Vụ Tin Học Gen Z',
  admin: 'Quản Trị Tin Học Gen Z'
} as const;

export function setDocumentTitle(pageTitle?: string): void {
  if (typeof document === 'undefined') return;

  if (!pageTitle || pageTitle.trim() === '') {
    document.title = PUBLIC_SITE_TITLE;
    return;
  }

  if (pageTitle.includes('Tin Học Gen Z')) {
    document.title = pageTitle;
  } else {
    document.title = `${pageTitle} | ${PUBLIC_SITE_TITLE}`;
  }
}

export function updateTitleByRoute(route: string, subTab?: string): void {
  if (typeof document === 'undefined') return;

  if (route === 'landing' || route === 'home') {
    document.title = PUBLIC_SITE_TITLE;
    return;
  }

  const suffix = (PORTAL_SUFFIXES as any)[route] || PORTAL_SUFFIXES.website;
  let pageName = 'Bảng điều khiển';

  const tabLabels: Record<string, string> = {
    overview: 'Tổng quan',
    dashboard: 'Bảng điều khiển',
    courses: 'Khóa học',
    learning_path: 'Lộ trình học AI',
    schedule: 'Lịch học',
    assignments: 'Bài tập & Kiểm tra',
    attendance: 'Điểm danh QR',
    certificates: 'Chứng chỉ & Thành tích',
    community: 'Cộng đồng',
    library: 'Kho tài liệu',
    notifications: 'Thông báo',
    profile: 'Hồ sơ cá nhân',
    users: 'Quản lý người dùng',
    classes: 'Quản lý lớp học',
    lessons: 'Bài giảng',
    students: 'Học viên',
    grading: 'Chấm điểm',
    schedules: 'Lịch & phân công',
    enrollments: 'Duyệt đăng ký',
    payments: 'Học phí & thanh toán',
    student_care: 'Chăm sóc học viên',
    support: 'Yêu cầu hỗ trợ',
    rooms: 'Phòng học & thiết bị',
    reports: 'Báo cáo vận hành'
  };

  if (subTab && tabLabels[subTab]) {
    pageName = tabLabels[subTab];
  } else if (subTab) {
    pageName = subTab.charAt(0).toUpperCase() + subTab.slice(1);
  }

  document.title = `${pageName} | ${suffix}`;
}
