import React, { useState, useEffect, useRef } from 'react';
import { Assignment, AssignmentSubmission } from '../../types/assignment';
import { UserProfile } from '../../types/auth';
import { SecureDocViewer } from './SecureDocViewer';
import {
  Clock, CheckCircle2, Play, UploadCloud, Send,
  AlertCircle, ArrowLeft, Cloud, Upload, FileSpreadsheet,
  Download, Trash2, RefreshCw, Maximize2, SplitSquareVertical,
  MoveHorizontal, X
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { formatDateTimeAmPm } from '../../utils/timeFormat';

interface StudentAssignmentViewProps {
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  currentUser: UserProfile;
  onSubmitAssignment: (
    assignmentId: string,
    studentId: string,
    studentName: string,
    studentCode: string,
    schoolOrClass: string | undefined,
    answers: { [questionId: string]: string },
    timeSpentSeconds: number,
    attachedFile?: { name: string; size: string; content?: string },
    customDriveLink?: string
  ) => void;
}

// Format Date & Time to readable Vietnamese format with AM/PM
function formatReadableDateTime(isoString: string): string {
  return formatDateTimeAmPm(isoString);
}

export const StudentAssignmentView: React.FC<StudentAssignmentViewProps> = ({
  assignments,
  submissions,
  currentUser,
  onSubmitAssignment
}) => {
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [unifiedAnswer, setUnifiedAnswer] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; content?: string } | null>(null);
  const [customDriveLink, setCustomDriveLink] = useState('');
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<AssignmentSubmission | null>(null);

  // Smart Layout Modes: 'focus' (78/22 - Đề Siêu To), 'full' (100% Siêu Rộng), 'split' (50/50 Cân Bằng)
  const [layoutMode, setLayoutMode] = useState<'focus' | 'full' | 'split'>('focus');
  const [splitPercent, setSplitPercent] = useState<number>(78);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [showDrawerSubmit, setShowDrawerSubmit] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Xử lý kéo thả thanh phân chia kích thước (Draggable Splitter)
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      const pct = Math.round((newWidth / rect.width) * 100);
      if (pct >= 40 && pct <= 85) {
        setSplitPercent(pct);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Active exam countdown timer
  useEffect(() => {
    if (!activeAssignment || submittedSuccess) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });

      setTimeSpentSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeAssignment, submittedSuccess]);

  const handleStartExam = (assign: Assignment) => {
    const now = new Date().getTime();
    const start = new Date(assign.startTime).getTime();
    const end = new Date(assign.endTime).getTime();

    if (!assign.isOpen || now < start || now > end) {
      alert('Đề thi này hiện tại chưa mở hoặc đã quá hạn nộp theo quy định của giáo viên!');
      return;
    }

    setActiveAssignment(assign);
    setTimeLeftSeconds(assign.durationMinutes * 60);
    setTimeSpentSeconds(0);
    setUnifiedAnswer('');
    setAttachedFile(null);
    setCustomDriveLink('');
    setSubmittedSuccess(null);
    soundFx.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isDragging, setIsDragging] = useState(false);

  // Xử lý tệp bài làm thực hành của học viên
  const processFile = (file: File) => {
    let sizeStr = '';
    if (file.size < 1024) sizeStr = `${file.size} B`;
    else if (file.size < 1024 * 1024) sizeStr = `${(file.size / 1024).toFixed(0)} KB`;
    else sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedFile({
        name: file.name,
        size: sizeStr,
        content: event.target?.result as string
      });
      soundFx.playCorrect();
    };
    reader.onerror = () => {
      alert('Không thể đọc tệp bài làm. Vui lòng thử lại!');
      soundFx.playIncorrect();
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Tải nhanh tệp dữ liệu mẫu từ giáo viên về máy
  const handleQuickDownloadSample = (file: any) => {
    soundFx.playClick();
    if (file.downloadUrl) {
      let downloadLink = file.downloadUrl;
      let isBlob = false;
      if (file.downloadUrl.startsWith('data:')) {
        try {
          const parts = file.downloadUrl.split(',');
          const mimeMatch = parts[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
          const base64Data = parts[1].replace(/\s/g, '');
          const binaryString = window.atob(base64Data);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: mime });
          downloadLink = URL.createObjectURL(blob);
          isBlob = true;
        } catch (e) {
          console.error('Error creating blob for sample file:', e);
        }
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

  const handleConfirmSubmit = () => {
    if (!activeAssignment) return;

    if (!unifiedAnswer.trim() && !attachedFile && !customDriveLink.trim()) {
      alert('Vui lòng nhập nội dung bài làm, đính kèm file hoặc dán link Google Drive bài làm!');
      return;
    }

    const sub = onSubmitAssignment(
      activeAssignment.id,
      currentUser.id,
      currentUser.name,
      currentUser.studentCode || 'THGZ01',
      currentUser.schoolOrClass,
      { 'bai_lam_tong_hop': unifiedAnswer },
      timeSpentSeconds,
      attachedFile || undefined,
      customDriveLink || undefined
    ) as any;

    setShowSubmitModal(false);
    setSubmittedSuccess(sub || {
      assignmentTitle: activeAssignment.title,
      submittedAt: formatDateTimeAmPm(new Date())
    });

    soundFx.playVictory();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleAutoSubmit = () => {
    if (!activeAssignment) return;
    onSubmitAssignment(
      activeAssignment.id,
      currentUser.id,
      currentUser.name,
      currentUser.studentCode || 'THGZ01',
      currentUser.schoolOrClass,
      { 'bai_lam_tong_hop': unifiedAnswer || 'Học sinh hết giờ tự động thu bài.' },
      timeSpentSeconds,
      attachedFile || undefined,
      customDriveLink || undefined
    );
    setSubmittedSuccess({
      id: `sub-${Date.now()}`,
      assignmentId: activeAssignment.id,
      assignmentTitle: activeAssignment.title,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentCode: currentUser.studentCode || 'THGZ01',
      answers: { 'bai_lam_tong_hop': unifiedAnswer },
      timeSpentSeconds,
      submittedAt: new Date().toLocaleString('vi-VN'),
      status: 'submitted'
    });
    soundFx.playVictory();
  };

  // Helper formatting for timer
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        maxWidth: activeAssignment ? '100%' : '1200px',
        margin: '0 auto',
        width: '100%',
        padding: activeAssignment ? '6px 16px' : '16px'
      }}
      className="animate-slide-up"
    >
      {/* 1. Exam Result / Success View */}
      {submittedSuccess && (
        <div className="card animate-slide-up" style={{ padding: '36px 24px', textAlign: 'center', maxWidth: '580px', margin: '20px auto' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}
          >
            <CheckCircle2 size={40} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Nộp Bài Thi Thành Công!
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Bài làm của bạn đã được chuyển tới <b>Google Drive & Cổng Chấm Điểm của Giáo Viên</b>.
          </p>

          <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', margin: '20px 0', textAlign: 'left', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div><b>Bài thi:</b> {submittedSuccess.assignmentTitle}</div>
            <div><b>Học viên:</b> {currentUser.name} ({currentUser.studentCode})</div>
            <div><b>Thời gian nộp:</b> {submittedSuccess.submittedAt}</div>
            {attachedFile && <div><b>Tệp đính kèm:</b> {attachedFile.name} ({attachedFile.size})</div>}
            {customDriveLink && <div><b>Link Drive:</b> <a href={customDriveLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>{customDriveLink}</a></div>}
            <div style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
              <Cloud size={16} />
              <span>☁️ Đã lưu trữ an toàn trên Google Drive</span>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveAssignment(null);
              setSubmittedSuccess(null);
            }}
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontWeight: 800 }}
          >
            Quay Về Danh Sách Đề Thi
          </button>
        </div>
      )}

      {/* 2. Active Taking Exam View */}
      {activeAssignment && !submittedSuccess && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Bar with Timer */}
          <div
            className="card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              position: 'sticky',
              top: '64px',
              zIndex: 20,
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(16px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn thoát khỏi phòng thi? Bài làm chưa nộp sẽ không được lưu.')) {
                    setActiveAssignment(null);
                  }
                }}
                className="btn btn-secondary btn-icon"
                style={{ width: '36px', height: '36px' }}
                title="Rời phòng thi"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {activeAssignment.title}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Học viên: {currentUser.name} ({currentUser.studentCode}) • Lớp: {activeAssignment.targetClass}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* BỘ CHUYỂN ĐỔI CHẾ ĐỘ XEM ĐỀ THI TO VÀ BỰ (KHÔNG MỞ TAB) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-secondary, #F1F5F9)',
                  padding: '3px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, #E2E8F0)'
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setLayoutMode('focus');
                    setSplitPercent(78);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: layoutMode === 'focus' ? 'var(--accent-primary, #2563EB)' : 'transparent',
                    color: layoutMode === 'focus' ? '#FFFFFF' : 'var(--text-secondary, #64748B)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                  title="Chế độ Đề Bài Siêu To (78% Đề thi / 22% Nộp bài - Khuyên dùng)"
                >
                  <MoveHorizontal size={13} />
                  <span>Đề Siêu To (78:22)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setLayoutMode('full');
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: layoutMode === 'full' ? 'var(--accent-primary, #2563EB)' : 'transparent',
                    color: layoutMode === 'full' ? '#FFFFFF' : 'var(--text-secondary, #64748B)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                  title="Chế độ Siêu Rộng cực đại 100% (Phiếu nộp bài dạng thanh nổi)"
                >
                  <Maximize2 size={13} />
                  <span>Siêu Rộng (100%)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setLayoutMode('split');
                    setSplitPercent(50);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: layoutMode === 'split' ? 'var(--accent-primary, #2563EB)' : 'transparent',
                    color: layoutMode === 'split' ? '#FFFFFF' : 'var(--text-secondary, #64748B)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                  title="Chế độ Cân Bằng (50% Đề thi / 50% Nộp bài)"
                >
                  <SplitSquareVertical size={13} />
                  <span>Cân Bằng (50:50)</span>
                </button>
              </div>

              {/* Countdown Timer Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  background: timeLeftSeconds <= 300 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(37, 99, 235, 0.1)',
                  color: timeLeftSeconds <= 300 ? '#ef4444' : 'var(--accent-primary)',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  border: timeLeftSeconds <= 300 ? '1px solid #ef4444' : '1px solid rgba(37, 99, 235, 0.25)'
                }}
              >
                <Clock size={18} />
                <span>{formatTimer(timeLeftSeconds)}</span>
              </div>

              <button
                onClick={() => setShowSubmitModal(true)}
                className="btn btn-primary"
                style={{ padding: '10px 22px', fontWeight: 800 }}
              >
                <Send size={16} />
                <span>Nộp Bài Thi</span>
              </button>
            </div>
          </div>

          {/* Helper render Phiếu nộp bài */}
          {(() => {
            const renderSubmissionSheetContent = (inDrawer = false) => (
              <div
                className="card"
                style={{
                  padding: inDrawer ? '18px' : '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: inDrawer ? 'none' : '1px solid var(--border-color)',
                  boxShadow: inDrawer ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                {/* 1. Quick Sample File Downloader */}
                {activeAssignment.sampleDataFiles && activeAssignment.sampleDataFiles.length > 0 && (
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Download size={14} />
                      <span>Bước 1: Tải tệp thực hành mẫu từ Giảng viên</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {activeAssignment.sampleDataFiles.map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleQuickDownloadSample(f)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: '#FFFFFF',
                            border: '1px solid #86EFAC',
                            color: '#15803D',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}
                        >
                          <FileSpreadsheet size={14} color="#16A34A" />
                          <span>Tải: {f.name} ({f.size})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. PRIMARY ACTION: NÚT TẢI TỆP BÀI LÀM THỰC HÀNH LÊN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UploadCloud size={17} color="#2563EB" />
                      <span>Bước 2: Tải lên tệp bài làm thực hành *</span>
                    </label>
                    <span style={{ fontSize: '0.72rem', background: '#DBEAFE', color: '#1D4ED8', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      Bắt buộc tệp làm bài
                    </span>
                  </div>

                  {!attachedFile ? (
                    <label
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: inDrawer ? '20px 14px' : '26px 18px',
                        borderRadius: '10px',
                        background: isDragging ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-primary)',
                        border: isDragging ? '2px dashed #16A34A' : '2px dashed #3B82F6',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          background: '#EFF6FF',
                          color: '#2563EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 10px rgba(37, 99, 235, 0.15)'
                        }}
                      >
                        <Upload size={22} />
                      </div>

                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1E293B' }}>
                          BẤM VÀO ĐÂY ĐỂ TẢI BÀI LÀM LÊN
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                          Kéo thả file Excel (.xlsx), Word (.docx), PowerPoint (.pptx), ZIP
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '6px 16px',
                          borderRadius: '6px',
                          background: '#16A34A',
                          color: '#FFFFFF',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)'
                        }}
                      >
                        <UploadCloud size={15} />
                        <span>Chọn Tệp Từ Máy Tính</span>
                      </div>

                      <input
                        type="file"
                        style={{ display: 'none' }}
                        accept=".xlsx,.xls,.docx,.doc,.pptx,.ppt,.zip,.rar,.7z,.pdf,.py,.txt"
                        onChange={handleFileUpload}
                      />
                    </label>
                  ) : (
                    <div
                      style={{
                        background: '#F0FDF4',
                        border: '2px solid #22C55E',
                        borderRadius: '10px',
                        padding: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: '#DCFCE7',
                            color: '#16A34A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <FileSpreadsheet size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', wordBreak: 'break-all' }}>
                            {attachedFile.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} color="#16A34A" />
                            <span>Dung lượng: <strong>{attachedFile.size}</strong> • Sẵn sàng nộp</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <label
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            color: '#334155',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <RefreshCw size={12} />
                          <span>Đổi tệp</span>
                          <input
                            type="file"
                            style={{ display: 'none' }}
                            accept=".xlsx,.xls,.docx,.doc,.pptx,.ppt,.zip,.rar,.7z,.pdf,.py,.txt"
                            onChange={handleFileUpload}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => setAttachedFile(null)}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            background: '#FEE2E2',
                            border: '1px solid #FCA5A5',
                            color: '#DC2626',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Trash2 size={12} />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Optional Notes / Remarks */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Ghi chú hoặc lời nhắn cho Giảng viên (Tùy chọn):
                  </label>
                  <textarea
                    rows={inDrawer ? 2 : 3}
                    placeholder="Nhập ghi chú bài làm của bạn (ví dụ: Em đã làm hoàn chỉnh trên Sheet 1 và Sheet 2...)..."
                    value={unifiedAnswer}
                    onChange={e => setUnifiedAnswer(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'vertical',
                      lineHeight: '1.5'
                    }}
                  />
                </div>

                {/* Cloud & Teacher Delivery Guarantee */}
                <div style={{ fontSize: '0.78rem', color: '#16A34A', background: '#DCFCE7', padding: '8px 12px', borderRadius: '6px', border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cloud size={15} />
                  <span>Bài làm tự động đồng bộ về Google Drive của Giảng viên.</span>
                </div>

                {/* Big Action Submit Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (inDrawer) setShowDrawerSubmit(false);
                    setShowSubmitModal(true);
                  }}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  <Send size={17} />
                  <span>{attachedFile ? `Nộp Bài Thực Hành (Kèm ${attachedFile.name})` : 'Xác Nhận & Nộp Bài Làm'}</span>
                </button>
              </div>
            );

            return (
              <>
                {/* ── BỐ CỤC THÔNG MINH: ĐỀ THI TO & BỰ + THANH PHÂN CHIA KÉO THẢ ── */}
                <div
                  ref={containerRef}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: layoutMode === 'full' ? '0' : '14px',
                    alignItems: 'stretch',
                    position: 'relative',
                    width: '100%'
                  }}
                >
                  {/* CỘT TRÁI: KHUNG XEM ĐỀ THI SIÊU BỰ */}
                  <div
                    style={{
                      flex: layoutMode === 'full' ? '1 1 100%' : `0 0 ${splitPercent}%`,
                      maxWidth: layoutMode === 'full' ? '100%' : `${splitPercent}%`,
                      minWidth: '320px',
                      transition: isResizing ? 'none' : 'flex 0.2s ease, max-width 0.2s ease'
                    }}
                  >
                    <div style={{ marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>1. Đề thi gốc từ Giáo viên (Bảo mật - Chống sao chép):</span>
                      {layoutMode === 'full' && (
                        <span style={{ fontSize: '0.78rem', color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          📖 Chế độ xem Siêu Rộng 100%
                        </span>
                      )}
                      {layoutMode === 'focus' && (
                        <span style={{ fontSize: '0.78rem', color: '#2563EB', background: '#DBEAFE', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          🎯 Chế độ Đề Bài To ({splitPercent}%)
                        </span>
                      )}
                    </div>

                    <SecureDocViewer
                      content={activeAssignment.rawContent}
                      sourceFileType={activeAssignment.sourceFileType}
                      sourceFileName={activeAssignment.sourceFileName}
                      studentName={currentUser.name}
                      studentCode={currentUser.studentCode || 'THGZ01'}
                      title={activeAssignment.title}
                      videoLecture={activeAssignment.videoLecture}
                      sampleDataFiles={activeAssignment.sampleDataFiles}
                      isFullWidth={layoutMode === 'full'}
                      onToggleFullWidth={() => {
                        soundFx.playClick();
                        setLayoutMode(prev => prev === 'full' ? 'focus' : 'full');
                        if (layoutMode === 'full') setSplitPercent(70);
                      }}
                      onQuickSubmit={() => setShowSubmitModal(true)}
                    />
                  </div>

                  {/* THANH KÉO PHÂN CHIA (DRAGGABLE SPLITTER RESIZER) */}
                  {layoutMode !== 'full' && (
                    <div
                      onMouseDown={handleMouseDownResize}
                      title="Rê chuột kéo thả để tùy biến độ to của đề bài theo ý muốn"
                      style={{
                        width: '10px',
                        cursor: 'col-resize',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        userSelect: 'none',
                        position: 'relative',
                        zIndex: 10,
                        margin: '0 -2px'
                      }}
                    >
                      <div
                        style={{
                          width: '4px',
                          height: '46px',
                          borderRadius: '4px',
                          background: isResizing ? '#2563EB' : '#CBD5E1',
                          boxShadow: isResizing ? '0 0 8px rgba(37, 99, 235, 0.5)' : 'none',
                          transition: 'background 0.2s ease'
                        }}
                      />
                    </div>
                  )}

                  {/* CỘT PHẢI: PHIẾU NỘP BÀI (TỰ ĐỘNG THU GỌN KHI Ở CHẾ ĐỘ FOCUS, ẨN KHI Ở CHẾ ĐỘ FULL) */}
                  {layoutMode !== 'full' && (
                    <div
                      style={{
                        flex: `1 1 calc(${100 - splitPercent}% - 14px)`,
                        minWidth: '280px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        position: 'sticky',
                        top: '130px',
                        alignSelf: 'flex-start'
                      }}
                    >
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>2. Phiếu Làm Bài & Nộp Tệp:</span>
                      </div>
                      {renderSubmissionSheetContent(false)}
                    </div>
                  )}
                </div>

                {/* ── FLOATING SUBMISSION DOCK (THANH NỘP BÀI NỔI KHI Ở CHẾ ĐỘ 100% SIÊU RỘNG) ── */}
                {layoutMode === 'full' && (
                  <div
                    style={{
                      position: 'fixed',
                      bottom: '24px',
                      right: '24px',
                      zIndex: 9999,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 18px',
                      background: 'rgba(15, 23, 42, 0.94)',
                      backdropFilter: 'blur(16px)',
                      borderRadius: 'var(--radius-full, 9999px)',
                      boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      color: '#FFFFFF'
                    }}
                    className="animate-fade-in"
                  >
                    {/* Timer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 800, color: timeLeftSeconds <= 300 ? '#EF4444' : '#38BDF8' }}>
                      <Clock size={16} />
                      <span>{formatTimer(timeLeftSeconds)}</span>
                    </div>

                    <div style={{ height: '22px', width: '1px', background: 'rgba(255,255,255,0.2)' }} />

                    {/* Trạng thái bài làm */}
                    <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {attachedFile ? (
                        <span style={{ color: '#4ADE80', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={15} />
                          <span>{attachedFile.name.length > 18 ? attachedFile.name.substring(0, 15) + '...' : attachedFile.name}</span>
                        </span>
                      ) : (
                        <span style={{ color: '#F87171', fontSize: '0.8rem', fontWeight: 600 }}>
                          ⚠️ Chưa nạp file bài làm
                        </span>
                      )}
                    </div>

                    {/* Nút mở phiếu nộp bài dạng Drawer bên phải */}
                    <button
                      type="button"
                      onClick={() => setShowDrawerSubmit(true)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-full, 9999px)',
                        background: '#3B82F6',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
                      }}
                    >
                      <UploadCloud size={15} />
                      <span>Phiếu Nộp Bài</span>
                    </button>

                    {/* Nút Nộp Bài Thi */}
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(true)}
                      className="btn btn-primary"
                      style={{
                        padding: '8px 18px',
                        borderRadius: 'var(--radius-full, 9999px)',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Send size={15} />
                      <span>Nộp Bài</span>
                    </button>

                    {/* Nút Thu Nhỏ lại 70:30 */}
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setLayoutMode('focus');
                        setSplitPercent(70);
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.12)',
                        border: 'none',
                        color: '#CBD5E1',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full, 9999px)',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                      title="Quay về bố cục 70:30"
                    >
                      Thu Nhỏ (70:30)
                    </button>
                  </div>
                )}

                {/* ── SIDE DRAWER NỘP BÀI (KHI Ở CHẾ ĐỘ SIÊU RỘNG 100%) ── */}
                {showDrawerSubmit && (
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 99998,
                      background: 'rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      justifyContent: 'flex-end'
                    }}
                    onClick={() => setShowDrawerSubmit(false)}
                    className="animate-fade-in"
                  >
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '440px',
                        height: '100%',
                        background: 'var(--bg-card, #FFFFFF)',
                        boxShadow: '-8px 0 30px rgba(0,0,0,0.25)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'auto'
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <div
                        style={{
                          padding: '16px 20px',
                          borderBottom: '1px solid var(--border-color, #E2E8F0)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'var(--bg-secondary, #F8FAFC)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.95rem' }}>
                          <UploadCloud size={18} color="#2563EB" />
                          <span>Phiếu Nộp Tệp Thực Hành</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowDrawerSubmit(false)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted, #64748B)',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div style={{ padding: '16px' }}>
                        {renderSubmissionSheetContent(true)}
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* 3. Normal View: Classroom Assignment List */}
      {!activeAssignment && !submittedSuccess && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Banner */}
          <div
            className="card"
            style={{
              padding: '22px 24px',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid rgba(37, 99, 235, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px'
            }}
          >
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                <Cloud size={16} />
                <span>Cổng Khảo Thí & Lưu Trữ Đám Mây Học Viên</span>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }}>
                Đề Thi & Bài Tập Lớp Học
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Làm bài trực tuyến hoặc nộp file thực hành, bài làm tự động lưu trữ trên Google Drive của giáo viên.
              </p>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Học viên: <b>{currentUser.name}</b> ({currentUser.studentCode}) • Lớp: <b>{currentUser.schoolOrClass || 'Tin Học Chuẩn'}</b>
            </div>
          </div>

          {/* List of Classroom Assignments */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {(() => {
              const allowedTracks: string[] = currentUser.enrolledTracks || (currentUser.programTrack ? [currentUser.programTrack] : ['office-fast-3in1']);
              const visibleList = assignments.filter(a =>
                allowedTracks.includes(a.category || '') ||
                (a.targetClass && currentUser.schoolOrClass && a.targetClass.toLowerCase().includes(currentUser.schoolOrClass.toLowerCase()))
              );

              if (visibleList.length === 0) {
                return (
                  <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                    Không có đề thi nào được giao cho khóa học của bạn ({currentUser.schoolOrClass || 'Lớp của bạn'}).
                  </div>
                );
              }

              return visibleList.map(assign => {
                const mySubmissions = submissions.filter(
                  s => s.assignmentId === assign.id && s.studentId === currentUser.id
                );
                const hasSubmitted = mySubmissions.length > 0;
                const latestSub = mySubmissions[0];

                const now = new Date().getTime();
                const start = new Date(assign.startTime).getTime();
                const end = new Date(assign.endTime).getTime();
                const isUpcoming = now < start;
                const isExpired = now > end;
                const isCurrentlyOpen = assign.isOpen && !isUpcoming && !isExpired;

                return (
                  <div key={assign.id} className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span className="badge" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent-primary)', fontWeight: 700 }}>
                          {assign.category}
                        </span>
                        {hasSubmitted ? (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
                            ✓ Đã nộp bài
                          </span>
                        ) : isCurrentlyOpen ? (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', background: 'rgba(37, 99, 235, 0.1)', padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
                            Đang mở nhận bài
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
                            {isUpcoming ? 'Chưa mở' : 'Đã đóng nộp'}
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {assign.title}
                      </h3>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                        {assign.description || 'Đề thi thực hành & trắc nghiệm chuẩn hóa.'}
                      </p>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '3px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                        <div>📅 Mở: <b>{formatReadableDateTime(assign.startTime)}</b></div>
                        <div>⏰ Đóng: <b>{formatReadableDateTime(assign.endTime)}</b></div>
                        <div>⏱️ Thời lượng: <b>{assign.durationMinutes} phút</b></div>
                      </div>
                    </div>

                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                      {hasSubmitted ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            Điểm số: <b style={{ color: latestSub.score !== undefined ? '#10b981' : '#d97706' }}>{latestSub.score !== undefined ? `${latestSub.score}/100 Đ` : 'Đang chờ chấm'}</b>
                          </span>
                          <button
                            disabled
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.78rem', opacity: 0.7 }}
                          >
                            Đã Nộp Thành Công
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartExam(assign)}
                          disabled={!isCurrentlyOpen}
                          className="btn btn-primary"
                          style={{
                            width: '100%',
                            padding: '10px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            opacity: isCurrentlyOpen ? 1 : 0.5
                          }}
                        >
                          <Play size={16} />
                          <span>{isCurrentlyOpen ? 'Bắt Đầu Làm & Nộp Bài' : 'Chưa Mở Nhận Bài'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
            backdropFilter: 'blur(4px)'
          }}
          className="animate-fade-in"
        >
          <div
            className="card"
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              background: 'var(--bg-card)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <AlertCircle size={24} color="#d97706" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Xác Nhận Nộp Bài Thi
              </h3>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              Bạn có chắc chắn muốn nộp bài thi <b>{activeAssignment?.title}</b>? Bài làm sẽ được chuyển an toàn tới Giảng viên để chấm điểm.
            </p>

            <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', marginBottom: '18px' }}>
              <div>• Học viên: <b>{currentUser.name}</b> ({currentUser.studentCode})</div>
              {attachedFile && <div>• Tệp đính kèm: <b>{attachedFile.name}</b></div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="btn btn-secondary"
                style={{ padding: '9px 16px' }}
              >
                Tiếp Tục Làm Bài
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="btn btn-primary"
                style={{ padding: '9px 20px', fontWeight: 800 }}
              >
                Nộp Bài Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
