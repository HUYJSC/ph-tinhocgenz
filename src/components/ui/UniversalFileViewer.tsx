import React, { useState, useEffect } from 'react';
import {
  FileText, Download, Maximize2, Minimize2, ZoomIn, ZoomOut,
  FileSpreadsheet, Image as ImageIcon, Video, Music, Code,
  X, ShieldCheck, RotateCw
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export type SupportedFileCategory = 'document' | 'image' | 'video' | 'audio' | 'code' | 'spreadsheet' | 'presentation' | 'other';

export interface LMSFileItem {
  id: string;
  name: string;
  type: string;
  size: string | number;
  url: string;
  previewUrl?: string;
  uploader?: string;
  createdAt?: string;
  permission?: 'public' | 'student' | 'teacher' | 'restricted';
  textContent?: string;
  description?: string;
}

export interface UniversalFileViewerProps {
  file: LMSFileItem | null;
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  studentCode?: string;
  allowDownload?: boolean;
}

export function detectFileCategory(fileNameOrType: string): SupportedFileCategory {
  const ext = (fileNameOrType.split('.').pop() || fileNameOrType).toLowerCase();
  if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) return 'image';
  if (['mp4', 'mov', 'webm', 'mkv'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) return 'audio';
  if (['pdf'].includes(ext)) return 'document';
  if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) return 'document';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'spreadsheet';
  if (['ppt', 'pptx'].includes(ext)) return 'presentation';
  if (['py', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'java', 'cpp', 'c', 'json', 'sql'].includes(ext)) return 'code';
  return 'other';
}

export function formatFileSize(size: string | number): string {
  if (typeof size === 'string' && size.includes('B')) return size;
  const num = typeof size === 'string' ? parseFloat(size) : size;
  if (!num || isNaN(num)) return 'Không rõ';
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
}

export const UniversalFileViewer: React.FC<UniversalFileViewerProps> = ({
  file,
  isOpen,
  onClose,
  studentName = 'Học viên Tin Học Gen Z',
  studentCode = 'THGZ2026',
  allowDownload = true
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isFullScreen) {
          setIsFullScreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullScreen, onClose]);

  if (!isOpen || !file) return null;

  const category = detectFileCategory(file.name || file.type);
  const ext = (file.name.split('.').pop() || file.type).toUpperCase();

  const handleDownload = () => {
    soundFx.playClick();
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyContent = () => {
    if (file.textContent) {
      navigator.clipboard.writeText(file.textContent);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(11, 37, 69, 0.85)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isFullScreen ? 0 : '16px'
      }}
    >
      <div
        style={{
          width: isFullScreen ? '100vw' : '94vw',
          maxWidth: isFullScreen ? '100vw' : '1200px',
          height: isFullScreen ? '100vh' : '90vh',
          background: '#FFFFFF',
          borderRadius: isFullScreen ? 0 : '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: isFullScreen ? 'none' : '1px solid #D9E2F0'
        }}
      >
        {/* Header Toolbar */}
        <div
          style={{
            height: '60px',
            background: '#0B2545',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* File Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#0057B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {category === 'image' && <ImageIcon size={20} />}
              {category === 'video' && <Video size={20} />}
              {category === 'audio' && <Music size={20} />}
              {category === 'spreadsheet' && <FileSpreadsheet size={20} />}
              {category === 'code' && <Code size={20} />}
              {(category === 'document' || category === 'presentation' || category === 'other') && <FileText size={20} />}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {file.name}
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', gap: '8px' }}>
                <span>Định dạng: {ext}</span>
                <span>•</span>
                <span>Dung lượng: {formatFileSize(file.size)}</span>
                {file.uploader && (
                  <>
                    <span>•</span>
                    <span>Tải lên bởi: {file.uploader}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(category === 'image' || category === 'document') && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  gap: '6px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(50, prev - 15))}
                  title="Thu nhỏ"
                  style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '4px' }}
                >
                  <ZoomOut size={16} />
                </button>
                <span style={{ fontSize: '12px', minWidth: '40px', textAlign: 'center', color: '#FFFFFF' }}>
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(200, prev + 15))}
                  title="Phóng to"
                  style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '4px' }}
                >
                  <ZoomIn size={16} />
                </button>
                {category === 'image' && (
                  <button
                    type="button"
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                    title="Xoay hình"
                    style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '4px' }}
                  >
                    <RotateCw size={16} />
                  </button>
                )}
              </div>
            )}

            {category === 'code' && file.textContent && (
              <button
                type="button"
                onClick={handleCopyContent}
                style={{
                  background: copiedCode ? '#16A34A' : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {copiedCode ? 'Đã chép mã!' : 'Sao chép mã'}
              </button>
            )}

            {allowDownload && (
              <button
                type="button"
                onClick={handleDownload}
                style={{
                  background: '#0057B8',
                  border: 'none',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} />
                <span>Tải về</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              title={isFullScreen ? 'Thu nhỏ' : 'Toàn màn hình'}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '6px',
                padding: '6px',
                cursor: 'pointer'
              }}
            >
              {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            <button
              type="button"
              onClick={onClose}
              title="Đóng (ESC)"
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#F87171',
                borderRadius: '6px',
                padding: '6px',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            background: category === 'code' ? '#0F172A' : '#F4F8FD',
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Security Watermark */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              alignItems: 'center',
              opacity: 0.04,
              userSelect: 'none',
              transform: 'rotate(-20deg)'
            }}
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ fontSize: '26px', fontWeight: 900, color: '#000000', letterSpacing: '4px' }}>
                PH TIN HỌC GEN Z • {studentName} • {studentCode}
              </div>
            ))}
          </div>

          {/* 1. PDF */}
          {ext === 'PDF' && (
            <iframe
              src={`${file.url}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
              title={file.name}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center'
              }}
            />
          )}

          {/* 2. Office Documents */}
          {['DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX'].includes(ext) && (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              {file.url.startsWith('http') ? (
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`}
                  title={file.name}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              ) : (
                <div
                  style={{
                    padding: '36px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '20px',
                    textAlign: 'center',
                    maxWidth: '560px',
                    margin: 'auto'
                  }}
                >
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '16px',
                      background: ext.includes('XLS') ? '#107C41' : ext.includes('PPT') ? '#D83B01' : '#0057B8',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {ext.includes('XLS') ? <FileSpreadsheet size={36} /> : <FileText size={36} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0B2545', margin: '0 0 6px 0' }}>
                      Tài liệu Microsoft {ext}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#64748B', margin: 0, lineHeight: 1.6 }}>
                      Tài liệu giáo trình nội bộ đã được xác thực an toàn bởi PH Digital Education.
                      Bạn có thể đọc trực tuyến qua liên kết đồng bộ hoặc tải file về để thực hành.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={handleDownload}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        background: '#0057B8',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Download size={16} /> Tải về máy để làm bài
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Image */}
          {category === 'image' && (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px'
              }}
            >
              <img
                src={file.url}
                alt={file.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-out'
                }}
              />
            </div>
          )}

          {/* 4. Video */}
          {category === 'video' && (
            <div style={{ width: '100%', height: '100%', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video
                src={file.url}
                controls
                autoPlay
                playsInline
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              >
                Trình duyệt của bạn không hỗ trợ phát video định dạng này.
              </video>
            </div>
          )}

          {/* 5. Audio */}
          {category === 'audio' && (
            <div
              style={{
                background: '#FFFFFF',
                padding: '40px',
                borderRadius: '16px',
                border: '1px solid #D9E2F0',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                maxWidth: '480px',
                width: '90%'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#EFF6FF',
                  color: '#0057B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Music size={32} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0B2545' }}>{file.name}</h4>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Bài giảng Audio LMS Tin Học Gen Z</span>
              </div>
              <audio src={file.url} controls style={{ width: '100%', marginTop: '8px' }} />
            </div>
          )}

          {/* 6. Code */}
          {category === 'code' && (
            <div
              style={{
                width: '100%',
                height: '100%',
                padding: '24px',
                color: '#E2E8F0',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '13px',
                lineHeight: 1.7,
                overflow: 'auto',
                whiteSpace: 'pre-wrap'
              }}
            >
              {file.textContent || '// Nội dung mã nguồn đang được đồng bộ hóa từ máy chủ LMS...'}
            </div>
          )}

          {/* 7. Other / TXT */}
          {(category === 'other' || ext === 'TXT' || ext === 'CSV') && (
            <div
              style={{
                width: '100%',
                height: '100%',
                padding: '32px',
                overflow: 'auto',
                background: '#FFFFFF'
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontSize: '13px',
                  lineHeight: 1.6,
                  color: '#1E293B',
                  whiteSpace: 'pre-wrap',
                  fontFamily: ext === 'CSV' ? 'monospace' : 'inherit'
                }}
              >
                {file.textContent || 'Đang nạp dữ liệu văn bản...'}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            height: '40px',
            background: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            fontSize: '12px',
            color: '#64748B'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#16803C" />
            <span>Tài liệu an toàn • Bản quyền thuộc PH Digital Education (PH–TINHOCGENZ)</span>
          </div>
          <div>Bấm ESC để đóng cửa sổ</div>
        </div>
      </div>
    </div>
  );
};
