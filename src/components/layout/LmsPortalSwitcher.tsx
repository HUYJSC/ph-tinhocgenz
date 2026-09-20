import React from 'react';
import { LayoutDashboard, GraduationCap, Users, ShieldAlert, QrCode, BookOpen, Award, Home } from 'lucide-react';

export interface LmsPortalSwitcherProps {
  currentRoute?: string;
  onSelectPortal?: (portal: 'landing' | 'student' | 'teacher' | 'giaovu' | 'admin' | 'attendance' | 'courses' | 'verify') => void;
}

export const LmsPortalSwitcher: React.FC<LmsPortalSwitcherProps> = ({
  currentRoute = 'landing',
  onSelectPortal
}) => {
  const navigate = (portal: 'landing' | 'student' | 'teacher' | 'giaovu' | 'admin' | 'attendance' | 'courses' | 'verify', path: string) => {
    if (onSelectPortal) {
      onSelectPortal(portal);
    } else {
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', path);
        window.location.href = path;
      }
    }
  };

  return (
    <div style={{
      width: '100%',
      boxSizing: 'border-box',
      flexShrink: 0,
      background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
      color: '#f8fafc',
      padding: '7px 16px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      fontSize: '13px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      position: 'sticky',
      top: 0,
      zIndex: 9999,
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{
          background: '#0057B8',
          color: '#ffffff',
          fontSize: '11px',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '4px',
          letterSpacing: '0.5px',
          whiteSpace: 'nowrap'
        }}>
          LMS MULTI-PORTAL
        </span>
        <span style={{ fontWeight: 600, color: '#94a3b8', whiteSpace: 'nowrap' }}>
          Hệ thống Đào tạo & Khảo thí:
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        paddingBottom: '2px'
      }}>
        <button
          onClick={() => navigate('landing', '/')}
          style={{
            flexShrink: 0,
            whiteSpace: 'nowrap',
            background: currentRoute === 'landing' ? '#0057B8' : 'rgba(255,255,255,0.08)',
            color: '#ffffff',
            border: '1px solid ' + (currentRoute === 'landing' ? '#0057B8' : 'rgba(255,255,255,0.15)'),
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.15s ease'
          }}
        >
          <Home size={13} /> Trang Chủ
        </button>

        <button
          onClick={() => navigate('student', '/student')}
          style={{
            flexShrink: 0,
            whiteSpace: 'nowrap',
            background: currentRoute === 'student' ? '#0057B8' : 'rgba(255,255,255,0.08)',
            color: '#ffffff',
            border: '1px solid ' + (currentRoute === 'student' ? '#0057B8' : 'rgba(255,255,255,0.15)'),
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.15s ease'
          }}
        >
          <GraduationCap size={13} /> Cổng Học Viên (Ảnh 03)
        </button>

        <button
          onClick={() => navigate('teacher', '/teacher')}
          style={{
            flexShrink: 0,
            whiteSpace: 'nowrap',
            background: currentRoute === 'teacher' ? '#0057B8' : 'rgba(255,255,255,0.08)',
            color: '#ffffff',
            border: '1px solid ' + (currentRoute === 'teacher' ? '#0057B8' : 'rgba(255,255,255,0.15)'),
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.15s ease'
          }}
        >
          <Users size={13} /> Cổng Giảng Viên (Ảnh 04)
        </button>

        <button
          onClick={() => navigate('giaovu', '/giaovu')}
          style={{
            flexShrink: 0,
            whiteSpace: 'nowrap',
            background: currentRoute === 'giaovu' ? '#0057B8' : 'rgba(255,255,255,0.08)',
            color: '#ffffff',
            border: '1px solid ' + (currentRoute === 'giaovu' ? '#0057B8' : 'rgba(255,255,255,0.15)'),
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.15s ease'
          }}
        >
          <LayoutDashboard size={13} /> Cổng Giáo Vụ (Ảnh 05)
        </button>

        <button
          onClick={() => navigate('admin', '/admin')}
          style={{
            flexShrink: 0,
            whiteSpace: 'nowrap',
            background: currentRoute === 'admin' ? '#0057B8' : 'rgba(255,255,255,0.08)',
            color: '#ffffff',
            border: '1px solid ' + (currentRoute === 'admin' ? '#0057B8' : 'rgba(255,255,255,0.15)'),
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.15s ease'
          }}
        >
          <ShieldAlert size={13} /> Quản Trị Admin (Ảnh 02)
        </button>

        <button
          onClick={() => navigate('attendance', '/attendance')}
          style={{
            flexShrink: 0,
            whiteSpace: 'nowrap',
            background: currentRoute === 'attendance' ? '#0057B8' : 'rgba(255,255,255,0.08)',
            color: '#ffffff',
            border: '1px solid ' + (currentRoute === 'attendance' ? '#0057B8' : 'rgba(255,255,255,0.15)'),
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.15s ease'
          }}
        >
          <QrCode size={13} /> Điểm Danh QR (Ảnh 06)
        </button>

        <button
          onClick={() => navigate('courses', '/courses')}
          style={{
            flexShrink: 0,
            whiteSpace: 'nowrap',
            background: currentRoute === 'courses' ? '#0057B8' : 'rgba(255,255,255,0.08)',
            color: '#ffffff',
            border: '1px solid ' + (currentRoute === 'courses' ? '#0057B8' : 'rgba(255,255,255,0.15)'),
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.15s ease'
          }}
        >
          <BookOpen size={13} /> Khóa Học
        </button>

        <button
          onClick={() => navigate('verify', '/verify')}
          style={{
            flexShrink: 0,
            whiteSpace: 'nowrap',
            background: currentRoute === 'verify' ? '#0057B8' : 'rgba(255,255,255,0.08)',
            color: '#ffffff',
            border: '1px solid ' + (currentRoute === 'verify' ? '#0057B8' : 'rgba(255,255,255,0.15)'),
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.15s ease'
          }}
        >
          <Award size={13} /> Chứng Chỉ
        </button>
      </div>
    </div>
  );
};
