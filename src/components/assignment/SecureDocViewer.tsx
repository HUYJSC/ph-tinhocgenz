import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, AlertTriangle, FileText, Image as ImageIcon } from 'lucide-react';

interface SecureDocViewerProps {
  content: string;
  sourceFileType: 'docx' | 'doc' | 'pdf' | 'image' | 'text';
  sourceFileName?: string;
  studentName: string;
  studentCode: string;
  title: string;
}

export const SecureDocViewer: React.FC<SecureDocViewerProps> = ({
  content,
  sourceFileType,
  sourceFileName,
  studentName,
  studentCode,
  title
}) => {
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);

  // Intercept right click, copy, print, save keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check Ctrl+P (Print), Ctrl+S (Save), Ctrl+C (Copy), Ctrl+U (View Source)
      if (
        (e.ctrlKey || e.metaKey) &&
        ['p', 's', 'c', 'u', 'a'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        triggerSecurityWarning('Thao tác bị khóa: Không được phép sao chép, in ấn hoặc lưu tài liệu đề thi!');
      }

      // Check PrintScreen
      if (e.key === 'PrintScreen') {
        triggerSecurityWarning('Cảnh báo: Đề thi có hình mờ bảo mật gắn liền mã học viên của bạn!');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerSecurityWarning('Chuột phải bị khóa để bảo vệ bản quyền đề thi của nhà trường.');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const triggerSecurityWarning = (msg: string) => {
    setSecurityAlert(msg);
    setTimeout(() => {
      setSecurityAlert(null);
    }, 3500);
  };

  const watermarkText = `${studentName} • ${studentCode || 'THGZ-2026'} • ${new Date().toLocaleDateString('vi-VN')}`;

  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Top Security Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          background: 'rgba(37, 99, 235, 0.08)',
          borderBottom: '1px solid rgba(37, 99, 235, 0.2)',
          fontSize: '0.8rem',
          color: 'var(--accent-primary)',
          fontWeight: 700
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={15} />
          <span>Tài Liệu Đề Thi Bảo Mật (Chống Tải Xuống & Chống Sao Chép)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>DRM Watermarked: {studentName}</span>
        </div>
      </div>

      {/* Floating Security Alert Toast */}
      {securityAlert && (
        <div
          className="animate-slide-up"
          style={{
            position: 'absolute',
            top: '48px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(239, 68, 68, 0.95)',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 30,
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)'
          }}
        >
          <AlertTriangle size={16} />
          <span>{securityAlert}</span>
        </div>
      )}

      {/* Content Viewport with Diagonal Watermarks */}
      <div
        style={{
          position: 'relative',
          padding: '24px',
          maxHeight: '480px',
          overflowY: 'auto',
          background: '#ffffff',
          color: '#1e293b',
          lineHeight: '1.7',
          fontSize: '0.92rem'
        }}
      >
        {/* Dynamic Repeating Diagonal Watermark */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 10,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(4, 1fr)',
            opacity: 0.12,
            overflow: 'hidden'
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                transform: 'rotate(-25deg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 900,
                color: '#0f172a',
                whiteSpace: 'nowrap',
                textTransform: 'uppercase'
              }}
            >
              {watermarkText}
            </div>
          ))}
        </div>

        {/* Document Header Header in Paper View */}
        <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              PH DIGITAL EDUCATION • PHÒNG KHẢO THÍ & ĐÀO TẠO
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Mã đề: #{title.slice(0, 10)}
            </div>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            {title}
          </h3>
          {sourceFileName && (
            <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {sourceFileType === 'image' ? <ImageIcon size={14} /> : <FileText size={14} />}
              <span>Tệp gốc: {sourceFileName} (Chế độ đọc trực tuyến an toàn)</span>
            </div>
          )}
        </div>

        {/* Render Image or Text */}
        {sourceFileType === 'image' && content.startsWith('data:image') ? (
          <div style={{ textAlign: 'center', margin: '10px 0' }}>
            <img
              src={content}
              alt="Đề thi"
              draggable={false}
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                pointerEvents: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
              }}
            />
          </div>
        ) : (
          <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
            {content}
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div
        style={{
          padding: '8px 16px',
          background: 'var(--bg-primary)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}
      >
        <span>🔒 Chế độ bảo mật chống rò rỉ đề thi</span>
        <span>Học viên: <b>{studentName}</b> ({studentCode})</span>
      </div>
    </div>
  );
};
