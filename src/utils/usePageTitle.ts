import { useEffect } from 'react';

export type PortalType = 'admin' | 'giaovien' | 'teacher' | 'giaovu' | 'student';

export function setPortalDocumentTitle(pageName: string, portal: PortalType) {
  if (typeof document === 'undefined') return;

  let suffix = 'Tin Học Gen Z';
  if (portal === 'admin') {
    suffix = 'Quản Trị Tin Học Gen Z';
  } else if (portal === 'giaovien' || portal === 'teacher') {
    suffix = 'Cổng Giảng Viên Tin Học Gen Z';
  } else if (portal === 'giaovu') {
    suffix = 'Giáo Vụ Tin Học Gen Z';
  } else if (portal === 'student') {
    suffix = 'Học Viên Tin Học Gen Z';
  }

  document.title = pageName ? `${pageName} | ${suffix}` : suffix;
}

export function usePageTitle(pageName: string, portal: PortalType) {
  useEffect(() => {
    setPortalDocumentTitle(pageName, portal);
  }, [pageName, portal]);
}
