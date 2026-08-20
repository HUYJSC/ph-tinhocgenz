import React, { useState } from 'react';
import { Assignment, AssignmentSubmission, TeacherNotification, GoogleDriveConfig } from '../../types/assignment';
import { UserProfile, CurriculumTrack, TRACK_LABELS } from '../../types/auth';
import { SubjectCategory } from '../../types/quiz';
import { parseUploadedDocument } from '../../utils/documentParser';
import { GOOGLE_APPS_SCRIPT_CODE } from '../../utils/googleDriveService';
import {
  PlusCircle, Trash2,
  Bell, Lock, Unlock, Eye, X, Clock, FileText,
  FolderOpen, Cloud, Copy, Check, ExternalLink, Link2, FileSpreadsheet
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

const ALL_TRACK_OPTIONS: { id: CurriculumTrack; label: string; icon: string }[] = [
  { id: 'office-fast-3in1', label: '1. Word, Excel, PowerPoint (3Buổi 1 môn)', icon: '⚡' },
  { id: 'cc-cntt-basic', label: '2. CC CNTT Cơ bản (6 buổi)', icon: '💻' },
  { id: 'cc-cntt-advanced', label: '3. CC CNTT Nâng cao (6 buổi)', icon: '⚙️' },
  { id: 'cntt-basic-we', label: '4. CNTT Cơ bản: Word + Excel (10-12b)', icon: '📄' },
  { id: 'cntt-adv-we', label: '5. CNTT Nâng Cao: Word + Excel (10-12b)', icon: '📊' },
  { id: 'ai-office', label: '6. Ứng dụng AI vào công việc Văn phòng (5b)', icon: '🤖' },
  { id: 'excel-accounting', label: '7. Excel cho Kế toán (Custom tuỳ nhu cầu)', icon: '📈' },
  { id: 'word-6b', label: '8. Word (6 buổi)', icon: '📝' },
  { id: 'excel-6b', label: '9. Excel (6 buổi)', icon: '📊' },
  { id: 'ppt-6b', label: '10. PPT (6 buổi)', icon: '📽️' }
];

interface TeacherAssignmentManagerProps {
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  notifications: TeacherNotification[];
  googleDriveConfig?: GoogleDriveConfig;
  onUpdateGoogleDriveConfig?: (config: GoogleDriveConfig) => void;
  currentUser: UserProfile;
  onCreateAssignment: (data: Omit<Assignment, 'id' | 'createdAt'>) => void;
  onDeleteAssignment: (id: string) => void;
  onToggleOpen: (id: string) => void;
  onGradeSubmission: (submissionId: string, score: number, maxScore: number, feedback: string) => void;
  onMarkNotificationAsRead: (id: string) => void;
}

// Format Date & Time to readable Vietnamese format
function formatReadableDateTime(isoString: string): string {
  if (!isoString) return 'Chưa thiết lập';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = daysOfWeek[d.getDay()];
    return `${hours}:${mins} - ${dayName}, ${day}/${month}/${year}`;
  } catch (e) {
    return isoString;
  }
}

export const TeacherAssignmentManager: React.FC<TeacherAssignmentManagerProps> = ({
  assignments,
  submissions,
  notifications,
  googleDriveConfig,
  onUpdateGoogleDriveConfig,
  currentUser,
  onCreateAssignment,
  onDeleteAssignment,
  onToggleOpen,
  onGradeSubmission,
  onMarkNotificationAsRead
}) => {
  const [activeTab, setActiveTab] = useState<'manage' | 'create' | 'submissions' | 'drive_cloud' | 'notifications'>('manage');
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SubjectCategory>('office-fast-3in1');
  const [targetClass, setTargetClass] = useState('Lớp Word, Excel, PowerPoint (3b/môn)');
  const [durationMinutes, setDurationMinutes] = useState(45);
  
  // Format current local time for datetime-local input
  const getLocalDatetimeString = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const [startTime, setStartTime] = useState(() => getLocalDatetimeString(new Date()));
  const [endTime, setEndTime] = useState(() => {
    const end = new Date();
    end.setDate(end.getDate() + 7); // Default 7 days
    end.setHours(23, 59, 0, 0);
    return getLocalDatetimeString(end);
  });

  const [disableCopy, setDisableCopy] = useState(true);
  const [disableDownload, setDisableDownload] = useState(true);
  const [watermarkStudent, setWatermarkStudent] = useState(true);
  const [sourceFileName, setSourceFileName] = useState('');
  const [sourceFileType, setSourceFileType] = useState<'docx' | 'doc' | 'pdf' | 'image' | 'text'>('docx');
  const [rawContent, setRawContent] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileError, setFileError] = useState('');

  // Selected Submission to Grade
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(85);
  const [gradeFeedback, setGradeFeedback] = useState<string>('Bài làm rất tốt, định dạng chuẩn yêu cầu.');

  // Google Drive Settings State
  const [driveFolderInput, setDriveFolderInput] = useState(googleDriveConfig?.driveFolderUrl || 'https://drive.google.com/drive/my-drive');
  const [driveWebhookInput, setDriveWebhookInput] = useState(googleDriveConfig?.scriptWebhookUrl || '');
  const [driveFolderNameInput, setDriveFolderNameInput] = useState(googleDriveConfig?.folderName || 'PH_TINHOCGENZ_BAI_NOP');
  const [isCopiedScript, setIsCopiedScript] = useState(false);
  const [driveSaveSuccess, setDriveSaveSuccess] = useState(false);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setIsCopiedScript(true);
    soundFx.playClick();
    setTimeout(() => setIsCopiedScript(false), 2500);
  };

  const handleSaveDriveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateGoogleDriveConfig) {
      onUpdateGoogleDriveConfig({
        driveFolderUrl: driveFolderInput.trim() || 'https://drive.google.com/drive/my-drive',
        scriptWebhookUrl: driveWebhookInput.trim(),
        folderName: driveFolderNameInput.trim() || 'PH_TINHOCGENZ_BAI_NOP',
        autoSyncEnabled: true,
        lastConnectedAt: new Date().toISOString().split('T')[0]
      });
      setDriveSaveSuccess(true);
      soundFx.playVictory();
      setTimeout(() => setDriveSaveSuccess(false), 3000);
    }
  };

  const setQuickDeadline = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(23, 59, 0, 0);
    setEndTime(getLocalDatetimeString(d));
    soundFx.playClick();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setFileError('');
    try {
      const parsed = await parseUploadedDocument(file);
      setSourceFileName(file.name);
      setSourceFileType(parsed.sourceFileType);
      setRawContent(parsed.rawContent);
      setParsedQuestions(parsed.parsedQuestions || []);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }
      if (!description && parsed.description) {
        setDescription(parsed.description);
      }
      soundFx.playCorrect();
    } catch (err: any) {
      setFileError(err.message || 'Lỗi khi đọc file tài liệu.');
      soundFx.playIncorrect();
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề đề thi / bài tập!');
      return;
    }

    onCreateAssignment({
      title,
      description,
      category,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      targetClass,
      sourceFileName,
      sourceFileType,
      rawContent,
      parsedQuestions,
      startTime,
      endTime,
      durationMinutes,
      isOpen: true,
      allowLateSubmission: false,
      securityOptions: {
        disableCopy,
        disableDownload,
        watermarkStudent
      }
    });

    soundFx.playVictory();
    setActiveTab('manage');
  };

  const exportSubmissionsExcel = () => {
    if (submissions.length === 0) {
      alert('Chưa có bài nộp nào của học viên để xuất Excel!');
      return;
    }

    const headers = [
      'STT',
      'Mã Học Viên',
      'Họ Và Tên Học Viên',
      'Lớp / Phân Hệ Đào Tạo',
      'Tên Đề Thi / Bài Tập',
      'Thời Gian Nộp Bài',
      'Điểm Chấm',
      'Điểm Tối Đa',
      'Trạng Thái Chấm Điểm',
      'Nhận Xét Của Giáo Viên',
      'Link File Google Drive'
    ];

    const escapeCsv = (val: any) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = submissions.map((sub, index) => {
      const isGraded = sub.score !== undefined && sub.score !== null;
      const status = isGraded ? 'Đã Chấm Điểm' : 'Chờ Giáo Viên Chấm';

      return [
        index + 1,
        escapeCsv(sub.studentCode),
        escapeCsv(sub.studentName),
        escapeCsv(sub.schoolOrClass),
        escapeCsv(sub.assignmentTitle),
        escapeCsv(sub.submittedAt),
        isGraded ? sub.score : '',
        sub.maxScore || 100,
        escapeCsv(status),
        escapeCsv(sub.teacherFeedback || ''),
        escapeCsv(sub.driveFileUrl || 'Nộp nội bộ')
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DanhSach_BaiNop_HocVien_PH_TINHOCGENZ_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    soundFx.playVictory();
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    onGradeSubmission(selectedSubmission.id, gradeScore, 100, gradeFeedback);
    setSelectedSubmission(null);
    soundFx.playCorrect();
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '16px' }} className="animate-slide-up">
      {/* Header Banner */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(245, 158, 11, 0.04) 100%)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '20px',
          border: '1.5px solid rgba(217, 119, 6, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              Quản Lý Đề Thi & Lưu Trữ Bài Nộp
            </h2>
            <span style={{ fontSize: '0.72rem', background: '#d97706', color: '#fff', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 800 }}>
              Giảng Viên
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Phát hành đề thi bảo mật, tự động đồng bộ bài nộp về Google Drive của giáo viên.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('drive_cloud')}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.82rem', fontWeight: 700, border: '1px solid rgba(37, 99, 235, 0.3)', color: 'var(--accent-primary)' }}
          >
            <Cloud size={15} />
            <span>Kết Nối Google Drive</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 800, background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}
          >
            <PlusCircle size={16} />
            <span>Tạo Đề Thi Mới</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px', overflowX: 'auto' }}>
        {[
          { id: 'manage', label: `Danh Sách Đề Thi (${assignments.length})`, icon: FileText },
          { id: 'submissions', label: `Bài Nộp Của Học Viên (${submissions.length})`, icon: FolderOpen },
          { id: 'drive_cloud', label: 'Lưu Trữ Google Drive ☁️', icon: Cloud },
          { id: 'create', label: 'Phát Hành Đề Mới', icon: PlusCircle },
          { id: 'notifications', label: `Thông Báo (${notifications.filter(n => !n.isRead).length})`, icon: Bell }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                soundFx.playClick();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                background: 'transparent',
                borderBottom: isActive ? '2.5px solid #d97706' : '2.5px solid transparent',
                color: isActive ? '#d97706' : 'var(--text-secondary)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.86rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. MANAGE ASSIGNMENTS TAB */}
      {activeTab === 'manage' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {assignments.map(a => (
            <div key={a.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                    {TRACK_LABELS[a.category as CurriculumTrack] || a.targetClass}
                  </span>
                  <button
                    onClick={() => onDeleteAssignment(a.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    title="Xóa đề thi này"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {a.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {a.description || 'Đề thi trắc nghiệm & tự luận chuẩn hóa.'}
                </p>
              </div>

              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  📅 Hạn nộp: <b>{formatReadableDateTime(a.endTime)}</b>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: a.isOpen ? '#10b981' : '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {a.isOpen ? <Unlock size={13} /> : <Lock size={13} />}
                    <span>{a.isOpen ? 'Đang mở nhận bài' : 'Đã đóng nộp bài'}</span>
                  </span>

                  <button
                    onClick={() => onToggleOpen(a.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: a.isOpen ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      border: 'none',
                      color: a.isOpen ? '#ef4444' : '#10b981',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {a.isOpen ? 'Khóa Đề' : 'Mở Đề'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. SUBMISSIONS & DRIVE VIEW TAB */}
      {activeTab === 'submissions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Tổng số bài nộp: <b>{submissions.length} bài</b>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={exportSubmissionsExcel}
                className="btn btn-secondary"
                style={{
                  padding: '7px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  background: 'rgba(16, 185, 129, 0.08)',
                  color: '#059669'
                }}
                title="Xuất toàn bộ danh sách điểm và bài nộp sang file Excel"
              >
                <FileSpreadsheet size={15} />
                <span>Xuất Excel Danh Sách Bài Nộp</span>
              </button>

              {googleDriveConfig?.driveFolderUrl && (
                <a
                  href={googleDriveConfig.driveFolderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ padding: '7px 14px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FolderOpen size={15} color="var(--accent-primary)" />
                  <span>Mở Thư Mục Tổng Trên Google Drive</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            {submissions.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Chưa có học sinh nào nộp bài.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px 16px' }}>Học Viên</th>
                    <th style={{ padding: '12px 14px' }}>Bài Thi</th>
                    <th style={{ padding: '12px 14px' }}>Thời Gian Nộp</th>
                    <th style={{ padding: '12px 14px' }}>Lưu Trữ Google Drive</th>
                    <th style={{ padding: '12px 14px' }}>Điểm Số</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(sub => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        <div>{sub.studentName}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{sub.studentCode} • {sub.schoolOrClass}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>{sub.assignmentTitle}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub.submittedAt}</td>
                      <td style={{ padding: '12px 14px' }}>
                        {sub.driveFileUrl ? (
                          <a
                            href={sub.driveFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 9px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(37, 99, 235, 0.1)',
                              color: 'var(--accent-primary)',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              textDecoration: 'none'
                            }}
                            title="Bấm để mở file bài làm trực tiếp trên Google Drive của giáo viên"
                          >
                            <FolderOpen size={13} />
                            <span>Mở Google Drive</span>
                            <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nộp trực tiếp</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {sub.status === 'graded' ? (
                          <span style={{ color: '#10b981', fontWeight: 800 }}>{sub.score}/100 Đ</span>
                        ) : (
                          <span style={{ color: '#d97706', fontWeight: 700 }}>Chưa chấm</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setGradeScore(sub.score || 85);
                              setGradeFeedback(sub.teacherFeedback || 'Bài làm tốt, áp dụng đúng kiến thức.');
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700 }}
                          >
                            <Eye size={14} />
                            <span>Chấm Bài</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 3. GOOGLE DRIVE CLOUD SETTINGS TAB */}
      {activeTab === 'drive_cloud' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} className="animate-slide-up">
          <div className="card" style={{ padding: '24px', border: '1.5px solid var(--accent-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cloud size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Cấu Hình Lưu Trữ Google Drive Của Giảng Viên
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  Kết nối thư mục Google Drive để toàn bộ bài làm của học viên tự động được lưu và phân loại khoa học.
                </p>
              </div>
            </div>

            {driveSaveSuccess && (
              <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#059669', fontSize: '0.85rem', fontWeight: 700, marginBottom: '16px' }}>
                ✓ Đã lưu cấu hình Google Drive thành công! Các bài nộp mới sẽ tự động liên kết tới thư mục này.
              </div>
            )}

            <form onSubmit={handleSaveDriveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  1. Đường Dẫn Thư Mục Google Drive Của Bạn (Folder URL) *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={driveFolderInput}
                    onChange={e => setDriveFolderInput(e.target.value)}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' }}
                  />
                  {driveFolderInput && (
                    <a
                      href={driveFolderInput}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '10px 14px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <FolderOpen size={15} />
                      <span>Mở Thử</span>
                    </a>
                  )}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Mẹo: Mở Google Drive của bạn ➔ Tạo thư mục "PH_TINHOCGENZ_BAI_NOP" ➔ Bấm Chuột phải chọn "Chia sẻ" (hoặc lấy đường link) ➔ Dán vào ô trên.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  2. Tên Thư Mục Lưu Trữ
                </label>
                <input
                  type="text"
                  placeholder="PH_TINHOCGENZ_BAI_NOP"
                  value={driveFolderNameInput}
                  onChange={e => setDriveFolderNameInput(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  3. Webhook Google Apps Script (Tùy chọn tự động hóa tải file trực tiếp):
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={driveWebhookInput}
                  onChange={e => setDriveWebhookInput(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontWeight: 800 }}>
                  Lưu Cấu Hình Google Drive
                </button>
              </div>
            </form>
          </div>

          {/* Apps Script Guide Card */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link2 size={18} color="#d97706" />
                <span>Mã Google Apps Script Tự Động Lưu File (Sao Chép 1 Chạm)</span>
              </h4>

              <button
                onClick={handleCopyScript}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                {isCopiedScript ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{isCopiedScript ? 'Đã Sao Chép!' : 'Sao Chép Mã Script'}</span>
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '10px' }}>
              Giảng viên chỉ cần mở <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>script.google.com</a> ➔ Bấm <b>Dự án mới</b> ➔ Dán đoạn mã bên dưới ➔ Bấm <b>Triển khai (Deploy as Web App)</b> ➔ Dán link nhận được vào ô Webhook ở trên.
            </p>

            <pre
              style={{
                fontFamily: 'var(--font-mono)',
                background: '#0f172a',
                color: '#38bdf8',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                maxHeight: '220px',
                overflowY: 'auto'
              }}
            >
              {GOOGLE_APPS_SCRIPT_CODE}
            </pre>
          </div>
        </div>
      )}

      {/* 4. CREATE ASSIGNMENT FORM TAB */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateSubmit} className="card animate-slide-up" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Phát Hành Đề Thi & Bài Tập Mới
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                Tiêu Đề Đề Thi / Bài Tập *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Đề Kiểm Tra MOS Excel Hàm Nâng Cao"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                Phân Hệ Môn Học Đào Tạo *
              </label>
              <select
                value={category}
                onChange={e => {
                  const trk = e.target.value as SubjectCategory;
                  setCategory(trk);
                  if (TRACK_LABELS[trk as CurriculumTrack]) {
                    setTargetClass(`Lớp ${TRACK_LABELS[trk as CurriculumTrack]}`);
                  }
                }}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
              >
                {ALL_TRACK_OPTIONS.map(trk => (
                  <option key={trk.id} value={trk.id}>
                    {trk.icon} {trk.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                Lớp Học Phân Công
              </label>
              <input
                type="text"
                value={targetClass}
                onChange={e => setTargetClass(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                Thời Gian Làm Bài (Phút)
              </label>
              <input
                type="number"
                min={5}
                max={300}
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
          </div>

          {/* Schedule Configuration */}
          <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} color="#d97706" />
              <span>Thời Gian Mở Cửa & Hạn Chót Nộp Bài</span>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  Thời Điểm Bắt Đầu Mở Đề:
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Hạn Chót Đóng Đề:</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[
                      { label: '+3 Ngày', days: 3 },
                      { label: '+7 Ngày', days: 7 },
                      { label: '+30 Ngày', days: 30 }
                    ].map(p => (
                      <button
                        key={p.days}
                        type="button"
                        onClick={() => setQuickDeadline(p.days)}
                        style={{ padding: '3px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', fontSize: '0.72rem', cursor: 'pointer' }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* File Document Upload */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
              Tải Lên Tệp Đề Bài Gốc (.DOCX, .PDF, .XLSX, .PPTX, Ảnh)
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".docx,.doc,.pdf,.xlsx,.pptx,.png,.jpg,.jpeg,.txt"
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px dashed var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
            />
            {isProcessingFile && <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', marginTop: '4px' }}>⏳ Đang xử lý file...</div>}
            {fileError && <div style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '4px' }}>{fileError}</div>}
          </div>

          {/* DRM Options */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', background: 'var(--bg-primary)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={disableCopy} onChange={e => setDisableCopy(e.target.checked)} />
              <span>Chống Sao Chép (Anti-Copy)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={disableDownload} onChange={e => setDisableDownload(e.target.checked)} />
              <span>Chặn Tải Về Trực Tiếp</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={watermarkStudent} onChange={e => setWatermarkStudent(e.target.checked)} />
              <span>Đóng Dấu Watermark Tên Học Viên</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '12px', fontWeight: 800, background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}
          >
            Phát Hành Đề Thi & Mở Nhận Bài
          </button>
        </form>
      )}

      {/* 5. NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.length === 0 ? (
            <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Không có thông báo mới.
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className="card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: n.isRead ? 'var(--bg-card)' : 'rgba(217, 119, 6, 0.08)',
                  border: n.isRead ? '1px solid var(--border-color)' : '1px solid rgba(217, 119, 6, 0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: n.isRead ? 'var(--bg-primary)' : 'rgba(217, 119, 6, 0.2)',
                      color: '#d97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Bell size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                      Học viên <b>{n.studentName}</b> ({n.studentCode}) vừa nộp bài thi
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Bài thi: <b>{n.assignmentTitle}</b> • Lúc: {n.timestamp}
                    </div>
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    onClick={() => onMarkNotificationAsRead(n.id)}
                    className="btn btn-secondary"
                    style={{ padding: '5px 10px', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    Đã Xem
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* GRADING & GOOGLE DRIVE REVIEW MODAL */}
      {selectedSubmission && (
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
              maxWidth: '680px',
              width: '100%',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              background: 'var(--bg-card)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Chấm Điểm Bài Thi: {selectedSubmission.studentName}
              </h3>
              <button onClick={() => setSelectedSubmission(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{selectedSubmission.assignmentTitle}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Mã SV: {selectedSubmission.studentCode} • Nộp lúc: {selectedSubmission.submittedAt}
                  </div>
                </div>

                {selectedSubmission.driveFileUrl && (
                  <a
                    href={selectedSubmission.driveFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ padding: '8px 14px', fontSize: '0.82rem', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <FolderOpen size={15} />
                    <span>Mở Trên Google Drive</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {/* Answers View */}
              {Object.keys(selectedSubmission.answers).length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Câu Trả Lời Trực Tuyến:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                    {Object.entries(selectedSubmission.answers).map(([qId, ans], idx) => (
                      <div key={qId} style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                        <b>Câu {idx + 1}:</b> {ans}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grading Form */}
              <form onSubmit={handleGradeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Điểm Số Đạt Được (Thang điểm 100):
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={gradeScore}
                    onChange={e => setGradeScore(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 900, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Lời Nhận Xét & Góp Ý Của Giảng Viên:
                  </label>
                  <textarea
                    rows={3}
                    value={gradeFeedback}
                    onChange={e => setGradeFeedback(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button type="button" onClick={() => setSelectedSubmission(null)} className="btn btn-secondary">
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontWeight: 800 }}>
                    Lưu Điểm & Trả Kết Quả Cho Học Viên
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
