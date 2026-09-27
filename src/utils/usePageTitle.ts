import { useEffect } from 'react';

export type PortalType = 'website' | 'admin' | 'giaovien' | 'teacher' | 'giaovu' | 'student';

export function setPortalDocumentTitle(pageName?: string, portal: PortalType = 'website') {
  if (typeof document === 'undefined') return;

  let suffix = 'Tin Học Gen Z | MOS, IC3 & Tin Học Ứng Dụng';
  if (portal === 'admin') {
    suffix = 'Quản Trị Tin Học Gen Z';
  } else if (portal === 'giaovien' || portal === 'teacher') {
    suffix = 'Cổng Giảng Viên Tin Học Gen Z';
  } else if (portal === 'giaovu') {
    suffix = 'Giáo Vụ Tin Học Gen Z';
  } else if (portal === 'student') {
    suffix = 'Cổng Học Viên Tin Học Gen Z';
  }

  if (!pageName || pageName === 'Trang chủ' || pageName === 'Tin Học Gen Z') {
    if (portal === 'website') {
      document.title = 'Tin Học Gen Z | MOS, IC3 & Tin Học Ứng Dụng';
    } else {
      document.title = `Trang chủ | ${suffix}`;
    }
  } else {
    document.title = `${pageName} | ${suffix}`;
  }
}

export function usePageTitle(pageName: string, portal: PortalType) {
  useEffect(() => {
    setPortalDocumentTitle(pageName, portal);
  }, [pageName, portal]);
}
