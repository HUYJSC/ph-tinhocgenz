import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FolderArchive,
  ArrowRight,
  Plus
} from 'lucide-react';
import {
  splitSingleFileInto3Modules,
  SingleFileSplitResult,
  getSample3in1CombinedDocument
} from '../../utils/packageBundleParser';
import { soundFx } from '../../utils/audio';

interface FileSplitter3in1ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onProceedToCreator: (splitResult: SingleFileSplitResult) => void;
  onOpenBlankCreator?: () => void;
}

export const FileSplitter3in1Modal: React.FC<FileSplitter3in1ModalProps> = ({
  isOpen = true,
  onClose,
  onProceedToCreator,
  onOpenBlankCreator = () => {}
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitResult, setSplitResult] = useState<SingleFileSplitResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const result = await splitSingleFileInto3Modules(file);
      setSplitResult(result);
      soundFx.playVictory();
    } catch (err: any) {
      console.error('Lỗi tách file 3 môn:', err);
      setErrorMsg(err.message || 'Không thể bóc tách file. Vui lòng thử lại với định dạng .docx hoặc .txt.');
      soundFx.playIncorrect();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSampleFile = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const sampleText = getSample3in1CombinedDocument();
      const sampleBlob = new Blob([sampleText], { type: 'text/plain;charset=utf-8' });
      const sampleFile = new File([sampleBlob], 'De_Tong_Hop_3_Mon_Word_Excel_PPT.txt', { type: 'text/plain' });
      const result = await splitSingleFileInto3Modules(sampleFile);
      setSplitResult(result);
      soundFx.playFanfare();
    } catch (err: any) {
      setErrorMsg('Không thể nạp file mẫu: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll3Files = () => {
    if (!splitResult) return;
    soundFx.playClick();

    // Trigger download for each of the 3 files
    const triggerDownload = (url: string, name: string) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    triggerDownload(splitResult.wordFile.downloadUrl, splitResult.wordFile.fileName);
    setTimeout(() => {
      triggerDownload(splitResult.excelFile.downloadUrl, splitResult.excelFile.fileName);
    }, 200);
    setTimeout(() => {
      triggerDownload(splitResult.pptFile.downloadUrl, splitResult.pptFile.fileName);
    }, 400);
  };

  return (
    <div
      className="mobile-bottom-sheet-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="mobile-bottom-sheet"
        style={{
          width: '100%',
          maxWidth: '740px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile Swipe / Drag Handle indicator */}
        <div className="mobile-sheet-handle show-sm" style={{ marginTop: '12px' }} />

        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(to right, #F8FAFC, #EFF6FF)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)'
              }}
            >
              <FolderArchive size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Tách Đề 3 Môn: Word • Excel • PowerPoint
              </h2>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0' }}>
                Tải 1 file tổng hợp chứa cả 3 môn → Hệ thống tự động bóc tách thành 3 file đề & thực hành riêng biệt
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Feature Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '10px 12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#1D4ED8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📘 Tách file 1:</span> Word
              </div>
              <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
                Trích xuất câu hỏi và file văn bản thực hành riêng (.docx)
              </div>
            </div>

            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '10px 12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#15803D', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📊 Tách file 2:</span> Excel
              </div>
              <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
                Trích xuất bảng tính, công thức và dữ liệu thực hành (.csv/.xlsx)
              </div>
            </div>

            <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '8px', padding: '10px 12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#C2410C', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📙 Tách file 3:</span> PowerPoint
              </div>
              <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
                Trích xuất Slide Master, câu hỏi trình chiếu mẫu (.txt/.pptx)
              </div>
            </div>
          </div>

          {/* Upload Dropzone */}
          <label
            style={{
              border: '2px dashed #93C5FD',
              borderRadius: '10px',
              padding: '28px 20px',
              textAlign: 'center',
              background: isProcessing ? '#F8FAFC' : '#F0F7FF',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s ease'
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 size={36} color="#2563EB" className="animate-spin" />
                <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#2563EB' }}>
                  Đang phân tích và bóc tách 1 file thành 3 môn Word, Excel, PowerPoint...
                </span>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: '#DBEAFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <UploadCloud size={28} color="#2563EB" />
                </div>
                <div>
                  <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#1E293B', display: 'block' }}>
                    Chọn hoặc Kéo thả 1 File Tổng Hợp 3 Môn vào đây
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginTop: '2px' }}>
                    Hỗ trợ tệp: .docx, .doc, .xlsx, .pptx, .pdf, .txt, .zip (file chứa chung cả 3 môn)
                  </span>
                </div>
              </>
            )}
            <input
              type="file"
              disabled={isProcessing}
              accept=".docx,.doc,.xlsx,.xls,.pptx,.ppt,.pdf,.txt,.zip"
              style={{ display: 'none' }}
              onChange={e => {
                if (e.target.files && e.target.files.length > 0) {
                  handleProcessFile(e.target.files[0]);
                }
              }}
            />
          </label>

          {/* Quick 1-Click Sample File */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                ⚡ Chưa có sẵn file tài liệu 3 môn trên máy?
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Nạp nhanh 1 file mẫu tổng hợp chuẩn (chứa sẵn câu hỏi Word, Excel, PPT) để xem hệ thống tự động bóc tách.
              </div>
            </div>
            <button
              type="button"
              onClick={handleLoadSampleFile}
              disabled={isProcessing}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                background: '#2563EB',
                border: 'none',
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
            >
              Nạp File Mẫu 3 Môn
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '12px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontSize: '13px' }}>
              <AlertCircle size={18} color="#DC2626" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Separation Results */}
          {splitResult && (
            <div
              style={{
                background: '#F0FDF4',
                border: '1.5px solid #86EFAC',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', fontWeight: 800, fontSize: '14px' }}>
                  <CheckCircle2 size={20} color="#16A34A" />
                  <span>{splitResult.summaryText}</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadAll3Files}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: '#16A34A',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Download size={14} />
                  <span>Tải trọn bộ 3 file</span>
                </button>
              </div>

              {/* 3 Separated Files Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {/* Word */}
                <div style={{ background: '#ffffff', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#1D4ED8' }}>
                    📘 File 1: Microsoft Word
                  </div>
                  <div style={{ fontSize: '12px', color: '#0F172A', fontWeight: 600, wordBreak: 'break-all' }}>
                    {splitResult.wordFile.fileName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Dung lượng: {splitResult.wordFile.fileSize} • {splitResult.wordFile.questions.length} câu hỏi
                  </div>
                  <a
                    href={splitResult.wordFile.downloadUrl}
                    download={splitResult.wordFile.fileName}
                    style={{
                      marginTop: 'auto',
                      paddingTop: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: '#2563EB',
                      textDecoration: 'none',
                      fontWeight: 700
                    }}
                  >
                    <Download size={13} />
                    <span>Tải file Word</span>
                  </a>
                </div>

                {/* Excel */}
                <div style={{ background: '#ffffff', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#15803D' }}>
                    📊 File 2: Microsoft Excel
                  </div>
                  <div style={{ fontSize: '12px', color: '#0F172A', fontWeight: 600, wordBreak: 'break-all' }}>
                    {splitResult.excelFile.fileName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Dung lượng: {splitResult.excelFile.fileSize} • {splitResult.excelFile.questions.length} câu hỏi
                  </div>
                  <a
                    href={splitResult.excelFile.downloadUrl}
                    download={splitResult.excelFile.fileName}
                    style={{
                      marginTop: 'auto',
                      paddingTop: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: '#16A34A',
                      textDecoration: 'none',
                      fontWeight: 700
                    }}
                  >
                    <Download size={13} />
                    <span>Tải file Excel</span>
                  </a>
                </div>

                {/* PowerPoint */}
                <div style={{ background: '#ffffff', border: '1px solid #FFEDD5', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#C2410C' }}>
                    📙 File 3: PowerPoint
                  </div>
                  <div style={{ fontSize: '12px', color: '#0F172A', fontWeight: 600, wordBreak: 'break-all' }}>
                    {splitResult.pptFile.fileName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Dung lượng: {splitResult.pptFile.fileSize} • {splitResult.pptFile.questions.length} câu hỏi
                  </div>
                  <a
                    href={splitResult.pptFile.downloadUrl}
                    download={splitResult.pptFile.fileName}
                    style={{
                      marginTop: 'auto',
                      paddingTop: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: '#EA580C',
                      textDecoration: 'none',
                      fontWeight: 700
                    }}
                  >
                    <Download size={13} />
                    <span>Tải file PPT</span>
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E2E8F0',
            background: '#F8FAFC',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <button
            type="button"
            onClick={onOpenBlankCreator}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={15} />
            <span>Soạn đề trắng thủ công</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Đóng
            </button>

            {splitResult && (
              <button
                type="button"
                onClick={() => onProceedToCreator(splitResult)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 22px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
                }}
              >
                <span>Nạp Vào Trình Soạn Đề 3in1</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
