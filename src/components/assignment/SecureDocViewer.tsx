import React, { useEffect, useState } from 'react';
import {
  ShieldCheck, Lock, AlertTriangle, FileText, Download,
  Video, Eye, FileSpreadsheet, Maximize2, Minimize2, ExternalLink
} from 'lucide-react';
import { SampleDataFile, VideoLecture } from '../../types/assignment';
import { soundFx } from '../../utils/audio';

interface SecureDocViewerProps {
  content: string;
  sourceFileType: 'docx' | 'doc' | 'pdf' | 'image' | 'text';
  sourceFileName?: string;
  studentName: string;
  studentCode: string;
  title: string;
  videoLecture?: VideoLecture;
  sampleDataFiles?: SampleDataFile[];
}

/**
 * Chuyển đổi base64 data URL sang Blob URL để nhúng trong iframe / object
 */
function getFileBlobUrl(content: string, mimeType = 'application/pdf'): string {
  if (!content) return '';
  if (content.startsWith('blob:') || content.startsWith('http://') || content.startsWith('https://')) {
    return content;
  }
  if (content.startsWith('data:')) {
    try {
      const parts = content.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : mimeType;
      const base64Data = parts[1].replace(/\s/g, '');
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mime });
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error('Error creating Blob URL from base64:', err);
      return content;
    }
  }
  // Raw base64 không có tiền tố data:
  if (content.startsWith('JVBERi0')) {
    try {
      const binaryString = window.atob(content.replace(/\s/g, ''));
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error('Error creating Blob URL from raw base64:', err);
      return content;
    }
  }
  return content;
}

export const SecureDocViewer: React.FC<SecureDocViewerProps> = ({
  content,
  sourceFileType,
  sourceFileName,
  studentName,
  studentCode,
  title,
  videoLecture,
  sampleDataFiles = []
}) => {
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'exam' | 'video' | 'sample_data'>('exam');
  const [previewingSampleFile, setPreviewingSampleFile] = useState<SampleDataFile | null>(null);
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Nhận diện định dạng tệp thông minh
  const isPdf =
    sourceFileType === 'pdf' ||
    (content && (
      content.startsWith('data:application/pdf') ||
      content.includes('application/pdf') ||
      content.startsWith('JVBERi0') ||
      (sourceFileName && sourceFileName.toLowerCase().endsWith('.pdf'))
    ));

  const isImage =
    sourceFileType === 'image' ||
    (content && (
      content.startsWith('data:image/') ||
      (sourceFileName && /\.(png|jpe?g|webp|gif|bmp)$/i.test(sourceFileName))
    ));

  // Tạo & giải phóng Blob URL an toàn
  useEffect(() => {
    if (isPdf && content) {
      const url = getFileBlobUrl(content, 'application/pdf');
      setBlobUrl(url);
      return () => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      };
    } else if (isImage && content) {
      const url = getFileBlobUrl(content, 'image/png');
      setBlobUrl(url);
      return () => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      };
    } else {
      setBlobUrl('');
    }
  }, [content, isPdf, isImage]);

  // Khóa phím chụp màn hình / in ấn / copy bảo vệ đề thi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['p', 's', 'c', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        triggerSecurityWarning('🔒 Thao tác bị khóa: Tuyệt đối không được phép tải xuống, in ấn hoặc sao chép đề thi!');
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i')) {
        e.preventDefault();
        triggerSecurityWarning('🔒 Cảnh báo: Chế độ kiểm tra mã nguồn bị vô hiệu hóa trong phòng thi.');
      }
      if (e.key === 'PrintScreen') {
        triggerSecurityWarning('⚠️ Cảnh báo bảo mật: Đề thi có gắn hình mờ định danh gắn liền tài khoản của bạn.');
      }
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerSecurityWarning('🔒 Chuột phải bị khóa: Đề thi được bảo vệ bản quyền, tuyệt đối không được tải về.');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isFullScreen]);

  const triggerSecurityWarning = (msg: string) => {
    soundFx.playIncorrect();
    setSecurityAlert(msg);
    setTimeout(() => {
      setSecurityAlert(null);
    }, 4000);
  };

  const handleDownloadSampleFile = (file: SampleDataFile) => {
    soundFx.playClick();
    if (file.downloadUrl) {
      let downloadLink = file.downloadUrl;
      let isBlob = false;
      if (file.downloadUrl.startsWith('data:')) {
        downloadLink = getFileBlobUrl(file.downloadUrl, 'application/octet-stream');
        isBlob = downloadLink.startsWith('blob:');
      }
      const a = document.createElement('a');
      a.href = downloadLink;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (isBlob) {
        setTimeout(() => URL.revokeObjectURL(downloadLink), 2000);
      }
    } else {
      const sampleCsv = `STT,Mã Học Viên,Họ và Tên,Điểm Word,Điểm Excel,Điểm PPT,Xếp Loại\n1,THGZ01,Nguyễn Văn An,8.5,9.0,8.0,Giỏi\n2,THGZ02,Trần Thị Mai,9.0,9.5,8.5,Xuất sắc\n3,THGZ03,Phạm Minh Tuấn,7.0,8.0,7.5,Khá\n4,THGZ04,Lê Thu Trang,8.0,8.5,9.0,Giỏi`;
      const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name || 'Du_Lieu_Mau_Thuc_Hanh.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const watermarkText = `${studentName} • ${studentCode || 'THGZ-2026'} • ${new Date().toLocaleDateString('vi-VN')}`;

  // Watermark Component
  const WatermarkOverlay = () => (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 5,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        opacity: 0.08,
        overflow: 'hidden'
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-25deg)',
            fontSize: '12px',
            fontWeight: 700,
            color: '#0F172A',
            whiteSpace: 'nowrap'
          }}
        >
          {watermarkText}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div
        style={{
          position: 'relative',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #CBD5E1)',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* ── TOP HEADER TABS: ĐỀ THI / CLIP BÀI GIẢNG / FILE DỮ LIỆU MẪU ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            background: 'var(--bg-secondary, #F8FAFC)',
            borderBottom: '1px solid var(--border-color, #E2E8F0)',
            padding: '0 12px'
          }}
        >
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('exam')}
              style={{
                padding: '10px 14px',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 'exam' ? '2.5px solid #2563EB' : '2.5px solid transparent',
                color: activeTab === 'exam' ? '#2563EB' : '#475569',
                fontWeight: activeTab === 'exam' ? 700 : 500,
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Lock size={14} color={activeTab === 'exam' ? '#2563EB' : '#64748B'} />
              <span>Đề thi bảo mật (Chống tải)</span>
            </button>

            {videoLecture && (
              <button
                type="button"
                onClick={() => setActiveTab('video')}
                style={{
                  padding: '10px 14px',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: activeTab === 'video' ? '2.5px solid #2563EB' : '2.5px solid transparent',
                  color: activeTab === 'video' ? '#2563EB' : '#475569',
                  fontWeight: activeTab === 'video' ? 700 : 500,
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Video size={14} color={activeTab === 'video' ? '#2563EB' : '#64748B'} />
                <span>Clip bài giảng</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('sample_data')}
              style={{
                padding: '10px 14px',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 'sample_data' ? '2.5px solid #16A34A' : '2.5px solid transparent',
                color: activeTab === 'sample_data' ? '#16A34A' : '#475569',
                fontWeight: activeTab === 'sample_data' ? 700 : 500,
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <FileSpreadsheet size={14} color={activeTab === 'sample_data' ? '#16A34A' : '#64748B'} />
              <span>File dữ liệu mẫu (Được tải về)</span>
              <span style={{ fontSize: '11px', background: '#DCFCE7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                {sampleDataFiles.length > 0 ? sampleDataFiles.length : 1}
              </span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', padding: '6px 0' }}>
            <ShieldCheck size={14} color="#16A34A" />
            <span>DRM: {studentName} ({studentCode || 'THGZ'})</span>
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
              background: '#DC2626',
              color: '#ffffff',
              padding: '8px 18px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 40,
              boxShadow: '0 8px 20px rgba(220, 38, 38, 0.3)'
            }}
          >
            <AlertTriangle size={16} />
            <span>{securityAlert}</span>
          </div>
        )}

        {/* ── VIEW 1: ĐỀ THI BẢO MẬT (CHỐNG TẢI XUỐNG 100%) ── */}
        {activeTab === 'exam' && (
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
            {/* Exam Sub-Header with Controls */}
            <div
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                background: '#F8FAFC'
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  🔒 ĐỀ THI THỰC HÀNH CHÍNH THỨC (CHỐNG RÒ RỈ & CHẶN TẢI VỀ)
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '2px 0 0' }}>
                  {title}
                </h3>
                {sourceFileName && (
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '1px' }}>
                    Tài liệu gốc: <strong>{sourceFileName}</strong>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsFullScreen(true)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#2563EB',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  title="Mở toàn màn hình để quan sát đề bài dễ dàng hơn"
                >
                  <Maximize2 size={13} />
                  <span>Toàn Màn Hình</span>
                </button>

                {blobUrl && (
                  <button
                    type="button"
                    onClick={() => window.open(blobUrl, '_blank')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      color: '#475569',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    title="Mở tài liệu trong cửa sổ trình duyệt mới"
                  >
                    <ExternalLink size={13} />
                    <span>Mở Cửa Sổ Riêng</span>
                  </button>
                )}

                <span style={{ padding: '4px 10px', borderRadius: '4px', background: '#FEE2E2', color: '#991B1B', fontSize: '11.5px', fontWeight: 700 }}>
                  Chỉ xem trực tuyến
                </span>
              </div>
            </div>

            {/* ── NỘI DUNG TỆP (PDF / HÌNH ẢNH / VĂN BẢN) ── */}
            <div style={{ position: 'relative', minHeight: '620px', background: '#F1F5F9' }}>
              <WatermarkOverlay />

              {/* 1. HIỂN THỊ FILE PDF TRỰC TIẾP QUA IFRAME & OBJECT */}
              {isPdf && blobUrl ? (
                <div style={{ position: 'relative', width: '100%', height: '680px', background: '#525659' }}>
                  <iframe
                    src={`${blobUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                    title={title}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                </div>
              ) : isImage && (blobUrl || content) ? (
                /* 2. HIỂN THỊ FILE HÌNH ẢNH */
                <div style={{ padding: '20px', textAlign: 'center', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={blobUrl || content}
                    alt={title}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '650px',
                      objectFit: 'contain',
                      borderRadius: '6px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                    }}
                  />
                </div>
              ) : (
                /* 3. HIỂN THỊ VĂN BẢN / WORD ĐƯỢC ĐỊNH DẠNG ĐẸP MẮT */
                <div
                  style={{
                    padding: '24px 28px',
                    minHeight: '400px',
                    maxHeight: '650px',
                    overflowY: 'auto',
                    background: '#ffffff',
                    color: '#0F172A',
                    lineHeight: 1.7,
                    fontSize: '14.5px',
                    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif"
                  }}
                >
                  <div style={{ whiteSpace: 'pre-wrap', position: 'relative', zIndex: 1 }}>
                    {content && !content.startsWith('data:') && !content.startsWith('JVBERi0')
                      ? content
                      : 'Đang chuẩn bị nội dung tài liệu đề thi...'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── VIEW 2: VIDEO CLIP BÀI GIẢNG TRỰC TUYẾN ── */}
        {activeTab === 'video' && videoLecture && (
          <div style={{ padding: '24px', background: '#0F172A', color: '#ffffff', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 600 }}>
                🎥 {videoLecture.title || 'Clip Bài Giảng Hướng Dẫn'}
              </div>
              {videoLecture.durationText && (
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>⏱️ {videoLecture.durationText}</span>
              )}
            </div>

            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#000000', borderRadius: '6px', overflow: 'hidden' }}>
              {videoLecture.videoUrl.includes('youtube.com') || videoLecture.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={videoLecture.videoUrl.replace('watch?v=', 'embed/')}
                  title="Clip Bài Giảng"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                />
              ) : (
                <video
                  src={videoLecture.videoUrl}
                  controls
                  controlsList="nodownload"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                >
                  Trình duyệt của bạn không hỗ trợ phát video trực tiếp.
                </video>
              )}
            </div>

            {videoLecture.description && (
              <p style={{ fontSize: '13px', color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
                {videoLecture.description}
              </p>
            )}
          </div>
        )}

        {/* ── VIEW 3: FILE DỮ LIỆU MẪU (CHO PHÉP TẢI VỀ MÁY ĐỂ LÀM BÀI) ── */}
        {activeTab === 'sample_data' && (
          <div style={{ padding: '24px', background: '#F8FAFC', minHeight: '380px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                💾 FILE DỮ LIỆU MẪU THỰC HÀNH (SAMPLE DATASET)
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', margin: '4px 0 2px' }}>
                Tải file dữ liệu mẫu về máy tính để làm bài tập
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                Học viên tải file dữ liệu mẫu bên dưới, mở trên Microsoft Excel / Word để thực hiện các yêu cầu trong đề thi, sau đó nộp lại file hoàn thành.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(sampleDataFiles.length > 0 ? sampleDataFiles : [
                {
                  id: 'sample-default-1',
                  name: 'Du_Lieu_Mau_Thuc_Hanh_Excel.xlsx',
                  size: '245 KB',
                  fileType: 'excel' as const,
                  previewData: 'Danh sách nhân viên, Doanh thu quý 1, Bảng lương, Bảng chấm công'
                },
                {
                  id: 'sample-default-2',
                  name: 'File_Van_Ban_Mau_Word.docx',
                  size: '120 KB',
                  fileType: 'word' as const,
                  previewData: 'Văn bản hợp đồng mẫu, Báo cáo tài chính, Mẫu tờ trình'
                }
              ]).map(file => (
                <div
                  key={file.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '6px',
                        background: file.fileType === 'excel' ? '#DCFCE7' : '#EFF6FF',
                        color: file.fileType === 'excel' ? '#16A34A' : '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {file.fileType === 'excel' ? <FileSpreadsheet size={20} /> : <FileText size={20} />}
                    </div>

                    <div>
                      <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#0F172A' }}>
                        {file.name}
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                        Dung lượng: {file.size} • Định dạng: {file.fileType.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setPreviewingSampleFile(previewingSampleFile?.id === file.id ? null : file)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '6px',
                        background: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        color: '#334155',
                        fontSize: '12.5px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Eye size={13} />
                      <span>{previewingSampleFile?.id === file.id ? 'Đóng xem' : 'Xem trực tiếp'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadSampleFile(file)}
                      style={{
                        padding: '7px 16px',
                        borderRadius: '6px',
                        background: '#16A34A',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 1px 2px rgba(22, 163, 74, 0.2)'
                      }}
                    >
                      <Download size={14} />
                      <span>Tải file mẫu về máy</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {previewingSampleFile && (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '16px',
                  marginTop: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                    👁️ Xem trước bảng dữ liệu: {previewingSampleFile.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewingSampleFile(null)}
                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Đóng lại ✕
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#F1F5F9' }}>
                        <th style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>STT</th>
                        <th style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>Mã NV / HV</th>
                        <th style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>Họ và Tên</th>
                        <th style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>Điểm Word</th>
                        <th style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>Điểm Excel</th>
                        <th style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>Xếp loại</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>1</td>
                        <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0', color: '#2563EB', fontWeight: 500 }}>THGZ01</td>
                        <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>Nguyễn Văn An</td>
                        <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>8.5</td>
                        <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>9.0</td>
                        <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0', color: '#16A34A', fontWeight: 600 }}>Giỏi</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>2</td>
                        <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0', color: '#2563EB', fontWeight: 500 }}>THGZ02</td>
                        <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>Trần Thị Mai</td>
                        <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>9.0</td>
                        <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>9.5</td>
                        <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0', color: '#16A34A', fontWeight: 600 }}>Xuất sắc</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL XEM TOÀN MÀN HÌNH (FULL SCREEN VIEWER) ── */}
      {isFullScreen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.92)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            backdropFilter: 'blur(8px)'
          }}
          className="animate-fade-in"
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 18px',
              background: '#1E293B',
              borderRadius: '10px 10px 0 0',
              borderBottom: '1px solid #334155'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Lock size={16} color="#38BDF8" />
              <div>
                <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '15px' }}>{title}</span>
                {sourceFileName && <span style={{ color: '#94A3B8', fontSize: '12px', marginLeft: '8px' }}>({sourceFileName})</span>}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#94A3B8', fontSize: '12px' }}>
                🛡️ DRM: {studentName} ({studentCode})
              </span>
              {blobUrl && (
                <button
                  type="button"
                  onClick={() => window.open(blobUrl, '_blank')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: '#334155',
                    color: '#F8FAFC',
                    border: '1px solid #475569',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ExternalLink size={13} />
                  <span>Tab Mới</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsFullScreen(false)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Minimize2 size={13} />
                <span>Thoát Toàn Màn Hình</span>
              </button>
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative', background: '#0F172A', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
            <WatermarkOverlay />
            {isPdf && blobUrl ? (
              <iframe
                src={`${blobUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                title={title}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            ) : isImage && (blobUrl || content) ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <img src={blobUrl || content} alt={title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
            ) : (
              <div style={{ padding: '30px', color: '#FFFFFF', whiteSpace: 'pre-wrap', maxHeight: '100%', overflowY: 'auto' }}>
                {content}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
