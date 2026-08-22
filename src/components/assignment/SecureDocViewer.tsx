import React, { useEffect, useState } from 'react';
import {
  ShieldCheck, Lock, AlertTriangle, FileText, Download,
  Video, Eye, FileSpreadsheet
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

export const SecureDocViewer: React.FC<SecureDocViewerProps> = ({
  content,
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

  // Intercept right click, copy, print, save, DevTools keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check Ctrl+P (Print), Ctrl+S (Save), Ctrl+C (Copy), Ctrl+U (View Source), Ctrl+A
      if (
        (e.ctrlKey || e.metaKey) &&
        ['p', 's', 'c', 'u', 'a'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        triggerSecurityWarning('🔒 Thao tác bị khóa: Tuyệt đối không được phép tải xuống, in ấn hoặc sao chép đề thi!');
      }

      // Check DevTools F12 or Ctrl+Shift+I
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i')) {
        e.preventDefault();
        triggerSecurityWarning('🔒 Cảnh báo: Chế độ kiểm tra mã nguồn bị vô hiệu hóa trong phòng thi.');
      }

      // Check PrintScreen
      if (e.key === 'PrintScreen') {
        triggerSecurityWarning('⚠️ Cảnh báo bảo mật: Đề thi có gắn hình mờ định danh gắn liền tài khoản của bạn.');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerSecurityWarning('🔒 Chuột phải bị khóa: Đề thi được bảo vệ bản quyền, tuyệt đối không được tải về.');
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerSecurityWarning('🔒 Chức năng sao chép bị khóa để đảm bảo tính minh bạch của kỳ thi.');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
    };
  }, []);

  const triggerSecurityWarning = (msg: string) => {
    soundFx.playIncorrect();
    setSecurityAlert(msg);
    setTimeout(() => {
      setSecurityAlert(null);
    }, 4000);
  };

  // Trigger sample data file download safely
  const handleDownloadSampleFile = (file: SampleDataFile) => {
    soundFx.playClick();
    if (file.downloadUrl) {
      const a = document.createElement('a');
      a.href = file.downloadUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Create sample file content if mock URL
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

  const watermarkText = `${studentName} • ${studentCode || 'THGZ-2026'} • ${new Date().toLocaleString('vi-VN')}`;

  return (
    <div
      style={{
        position: 'relative',
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #CBD5E1',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        fontFamily: "'Be Vietnam Pro', sans-serif"
      }}
    >
      {/* ── TOP HEADER TABS: ĐỀ THI / CLIP BÀI GIẢNG / FILE DỮ LIỆU MẪU ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          padding: '0 12px'
        }}
      >
        {/* Navigation Tabs */}
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
              fontWeight: activeTab === 'exam' ? 600 : 500,
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
                fontWeight: activeTab === 'video' ? 600 : 500,
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
              fontWeight: activeTab === 'sample_data' ? 600 : 500,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={14} color={activeTab === 'sample_data' ? '#16A34A' : '#64748B'} />
            <span>File dữ liệu mẫu (Được tải về)</span>
            <span style={{ fontSize: '11px', background: '#DCFCE7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
              {sampleDataFiles.length > 0 ? sampleDataFiles.length : 1}
            </span>
          </button>
        </div>

        {/* Security Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', padding: '6px 0' }}>
          <ShieldCheck size={14} color="#16A34A" />
          <span>DRM Watermark: {studentName} ({studentCode || 'THGZ'})</span>
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

      {/* ── VIEW 1: ĐỀ THI BẢO MẬT (CHẶN TẢI XUỐNG 100%) ── */}
      {activeTab === 'exam' && (
        <div
          style={{
            position: 'relative',
            padding: '24px',
            minHeight: '380px',
            maxHeight: '520px',
            overflowY: 'auto',
            background: '#ffffff',
            color: '#0F172A',
            lineHeight: 1.7,
            fontSize: '14px',
            userSelect: 'none',
            WebkitUserSelect: 'none'
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
                  fontWeight: 600,
                  color: '#0F172A',
                  whiteSpace: 'nowrap'
                }}
              >
                {watermarkText}
              </div>
            ))}
          </div>

          {/* Exam Header */}
          <div style={{ paddingBottom: '16px', marginBottom: '18px', borderBottom: '1.5px dashed #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                🔒 ĐỀ THI THỰC HÀNH CHÍNH THỨC (CHỐNG RÒ RỈ & CHẶN TẢI VỀ)
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', margin: '4px 0 0' }}>
                {title}
              </h3>
              {sourceFileName && (
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  Tài liệu gốc: {sourceFileName}
                </div>
              )}
            </div>

            <span style={{ padding: '4px 10px', borderRadius: '4px', background: '#FEE2E2', color: '#991B1B', fontSize: '12px', fontWeight: 600 }}>
              Chỉ xem trực tuyến
            </span>
          </div>

          {/* Protected Document Content Body */}
          <div style={{ whiteSpace: 'pre-wrap', position: 'relative', zIndex: 1 }}>
            {content || 'Đang tải nội dung đề thi bảo mật...'}
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

          {/* Video Player Frame */}
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

          {/* Sample Files List */}
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

                {/* Actions: Download (Allowed!) + Preview */}
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

          {/* Live Preview Box if clicked */}
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

              {/* Sample Table Preview */}
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
                    <tr>
                      <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>3</td>
                      <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0', color: '#2563EB', fontWeight: 500 }}>THGZ03</td>
                      <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>Phạm Minh Tuấn</td>
                      <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>7.0</td>
                      <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>8.0</td>
                      <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0', color: '#D97706', fontWeight: 600 }}>Khá</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
