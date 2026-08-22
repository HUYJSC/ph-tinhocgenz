import React, { useState } from 'react';
import { Assignment, AssignmentSubmission, TeacherNotification, GoogleDriveConfig } from '../../types/assignment';
import { UserProfile, CurriculumTrack, TRACK_LABELS } from '../../types/auth';
import { SubjectCategory } from '../../types/quiz';
import { parseUploadedDocument } from '../../utils/documentParser';
import { MASTER_ADMIN_DRIVE_CONFIG } from '../../utils/googleDriveService';
import {
  PlusCircle, Trash2,
  Bell, Lock, Unlock, Eye, X, Clock, FileText,
  FolderOpen, Cloud, ExternalLink, FileSpreadsheet,
  Search, RotateCcw
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
const ALL_TRACK_OPTIONS: { id: CurriculumTrack; label: string }[] = [
  { id: 'office-fast-3in1', label: '1. Word, Excel, PowerPoint (3 Buổi 1 môn)' },
  { id: 'cc-cntt-basic',    label: '2. CC CNTT Cơ bản (6 buổi)' },
  { id: 'cc-cntt-advanced', label: '3. CC CNTT Nâng cao (6 buổi)' },
  { id: 'cntt-basic-we',    label: '4. CNTT Cơ bản: Word + Excel (10-12 buổi)' },
  { id: 'cntt-adv-we',      label: '5. CNTT Nâng Cao: Word + Excel (10-12 buổi)' },
  { id: 'ai-office',        label: '6. Ứng dụng AI vào công việc Văn phòng (5 buổi)' },
  { id: 'excel-accounting', label: '7. Excel cho Kế toán' },
  { id: 'word-6b',          label: '8. Kỹ năng soạn thảo Word (6 buổi)' },
  { id: 'excel-6b',         label: '9. Xử lý bảng tính Excel (6 buổi)' },
  { id: 'ppt-6b',           label: '10. Thiết kế PowerPoint (6 buổi)' }
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
  const [selectedFamily, setSelectedFamily] = useState<'all' | 'word' | 'excel' | 'powerpoint' | 'ai_cntt'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
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

  // Video Lecture & Sample Dataset State
  const [videoLectureUrl, setVideoLectureUrl] = useState('');
  const [videoLectureTitle, setVideoLectureTitle] = useState('');
  const [hasSampleFile, setHasSampleFile] = useState(true);
  const [sampleFileName, setSampleFileName] = useState('Du_Lieu_Mau_Thuc_Hanh_Excel.xlsx');
  const [sampleFileSize, setSampleFileSize] = useState('245 KB');
  const [sampleFileType, setSampleFileType] = useState<'excel' | 'word' | 'powerpoint' | 'zip' | 'other'>('excel');

  // Selected Submission to Grade
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(85);
  const [gradeFeedback, setGradeFeedback] = useState<string>('Bài làm rất tốt, định dạng chuẩn yêu cầu.');

  // Master Google Drive Settings State
  const [driveFolderInput, setDriveFolderInput] = useState(
    googleDriveConfig?.driveFolderUrl || MASTER_ADMIN_DRIVE_CONFIG.masterFolderUrl
  );
  const driveFolderNameInput = googleDriveConfig?.folderName || MASTER_ADMIN_DRIVE_CONFIG.folderName;
  const [driveSaveSuccess, setDriveSaveSuccess] = useState(false);

  const handleSaveDriveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateGoogleDriveConfig) {
      onUpdateGoogleDriveConfig({
        driveFolderUrl: driveFolderInput.trim() || MASTER_ADMIN_DRIVE_CONFIG.masterFolderUrl,
        folderName: driveFolderNameInput || MASTER_ADMIN_DRIVE_CONFIG.folderName,
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
      setParsedQuestions(parsed.parsedQuestions);
      if (!title) {
        setTitle(parsed.title || file.name.replace(/\.[^/.]+$/, ''));
      }
      soundFx.playClick();
    } catch (err: any) {
      setFileError('Không thể xử lý file. Vui lòng kiểm tra định dạng!');
      soundFx.playIncorrect();
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề đề thi!');
      return;
    }

    onCreateAssignment({
      title,
      description,
      category,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      targetClass,
      sourceFileName: sourceFileName || 'De_Thi_Bao_Mat.docx',
      sourceFileType,
      rawContent: rawContent || 'Nội dung đề thi thực hành chính quy.',
      parsedQuestions: parsedQuestions.length > 0 ? parsedQuestions : [
        { id: `q-${Date.now()}-1`, number: 1, prompt: 'Thực hiện định dạng bảng tính Excel theo yêu cầu đề bài.', points: 50 },
        { id: `q-${Date.now()}-2`, number: 2, prompt: 'Sử dụng các hàm tính toán và trích xuất dữ liệu hoàn chỉnh.', points: 50 }
      ],
      startTime,
      endTime,
      durationMinutes,
      isOpen: true,
      allowLateSubmission: false,
      securityOptions: {
        disableCopy,
        disableDownload,
        watermarkStudent
      },
      videoLecture: videoLectureUrl.trim() ? {
        title: videoLectureTitle.trim() || 'Clip Bài Giảng Hướng Dẫn',
        videoUrl: videoLectureUrl.trim()
      } : undefined,
      sampleDataFiles: hasSampleFile ? [{
        id: `sample-${Date.now()}`,
        name: sampleFileName.trim() || 'Du_Lieu_Mau_Thuc_Hanh_Excel.xlsx',
        size: sampleFileSize || '245 KB',
        fileType: sampleFileType
      }] : []
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
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '14px 16px' }} className="animate-slide-up">
      {/* Sleek Compact Header */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(245, 158, 11, 0.04) 100%)',
          borderRadius: '16px',
          marginBottom: '14px',
          border: '1px solid rgba(217, 119, 6, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Quản Lý Đề Thi & Chấm Bài Nộp
            </h2>
            <span style={{ fontSize: '0.68rem', background: '#d97706', color: '#fff', padding: '2px 8px', borderRadius: '999px', fontWeight: 800 }}>
              Giảng Viên
            </span>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>
            Đề thi bảo mật • Tự động đồng bộ bài nộp Google Drive
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('drive_cloud')}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', minHeight: '32px', height: '32px', fontSize: '0.78rem', fontWeight: 700, borderRadius: '8px', color: 'var(--brand)' }}
          >
            <Cloud size={14} />
            <span>Google Drive</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className="btn btn-primary"
            style={{ padding: '6px 14px', minHeight: '32px', height: '32px', fontSize: '0.78rem', fontWeight: 800, borderRadius: '8px', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}
          >
            <PlusCircle size={14} />
            <span>Tạo Đề Thi Mới</span>
          </button>
        </div>
      </div>

      {/* Segmented Tabs Bar */}
      <div className="horizontal-scroll" style={{ marginBottom: '16px', paddingBottom: '4px' }}>
        {[
          { id: 'manage', label: `Đề Thi (${assignments.length})`, icon: FileText },
          { id: 'submissions', label: `Bài Nộp (${submissions.length})`, icon: FolderOpen },
          { id: 'drive_cloud', label: 'Google Drive Tổng (Admin)', icon: Cloud },
          { id: 'create', label: 'Soạn Đề Mới', icon: PlusCircle },
          { id: 'notifications', label: `Thông Báo (${notifications.filter(n => !n.isRead).length})`, icon: Bell }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '10px',
                border: isActive ? '1.5px solid #d97706' : '1px solid var(--border-color)',
                background: isActive ? 'var(--bg-card)' : 'transparent',
                color: isActive ? '#d97706' : 'var(--text-secondary)',
                fontWeight: isActive ? 800 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 2px 8px rgba(217, 119, 6, 0.12)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. MANAGE ASSIGNMENTS TAB */}
      {activeTab === 'manage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Subject Family Taskbar */}
          <div className="card" style={{ padding: '10px 14px', borderRadius: '14px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div className="horizontal-scroll" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {[
                { id: 'all', label: '🌟 Tất Cả', color: 'var(--brand)', bg: 'rgba(79, 110, 247, 0.12)' },
                { id: 'word', label: '📘 Word', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)' },
                { id: 'excel', label: '📗 Excel', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
                { id: 'powerpoint', label: '📙 PowerPoint', color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)' },
                { id: 'ai_cntt', label: '🤖 AI & CNTT', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' }
              ].map(tab => {
                const isSelected = selectedFamily === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSelectedFamily(tab.id as any);
                      soundFx.playClick();
                    }}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '999px',
                      border: isSelected ? `2px solid ${tab.color}` : '1px solid var(--border-color)',
                      background: isSelected ? tab.bg : 'var(--bg-primary)',
                      color: isSelected ? tab.color : 'var(--text-secondary)',
                      fontWeight: isSelected ? 850 : 600,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ position: 'relative', width: '200px', minWidth: '160px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Tìm đề bài tập..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    borderRadius: '8px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.78rem'
                  }}
                />
              </div>

              {(searchQuery || selectedFamily !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedFamily('all');
                  }}
                  title="Đặt lại bộ lọc"
                  className="btn btn-icon"
                  style={{ width: '30px', height: '30px', minHeight: '30px', borderRadius: '8px', color: 'var(--text-muted)' }}
                >
                  <RotateCcw size={13} />
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {assignments
              .filter(a => {
                if (selectedFamily === 'word') {
                  const isWord = a.title.toLowerCase().includes('word') || a.category.includes('word') || a.category === 'cntt-basic-we' || a.category === 'cntt-adv-we' || a.category === 'office-fast-3in1';
                  if (!isWord) return false;
                }
                if (selectedFamily === 'excel') {
                  const isExcel = a.title.toLowerCase().includes('excel') || a.category.includes('excel') || a.category === 'cntt-basic-we' || a.category === 'cntt-adv-we' || a.category === 'office-fast-3in1';
                  if (!isExcel) return false;
                }
                if (selectedFamily === 'powerpoint') {
                  const isPpt = a.title.toLowerCase().includes('powerpoint') || a.title.toLowerCase().includes('ppt') || a.category.includes('ppt') || a.category === 'office-fast-3in1';
                  if (!isPpt) return false;
                }
                if (selectedFamily === 'ai_cntt') {
                  const isAi = a.category === 'ai-office' || a.category === 'cc-cntt-basic' || a.category === 'cc-cntt-advanced' || a.title.toLowerCase().includes('ai') || a.title.toLowerCase().includes('cntt');
                  if (!isAi) return false;
                }
                if (searchQuery) {
                  const match = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || (a.description || '').toLowerCase().includes(searchQuery.toLowerCase());
                  if (!match) return false;
                }
                return true;
              })
              .map(a => (
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

      {/* 3. GOOGLE DRIVE MASTER CLOUD TAB */}
      {activeTab === 'drive_cloud' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-slide-up">
          {/* Main Card: Master Drive Connection Status */}
          <div className="card" style={{ padding: '24px', border: '1.5px solid #2563EB', background: '#FFFFFF', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Cloud size={28} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      Google Drive Tổng Trung Tâm (Master Academic Cloud)
                    </h3>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: '4px', border: '1px solid #86EFAC' }}>
                      🟢 TỰ ĐỘNG ĐỒNG BỘ 100%
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
                    Tất cả bài tập thực hành của sinh viên tự động lưu thẳng về Google Drive Tổng của Admin mà không cần bất kỳ cài đặt nào.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={driveFolderInput || MASTER_ADMIN_DRIVE_CONFIG.masterFolderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    background: '#2563EB',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <FolderOpen size={15} />
                  <span>Mở Thư Mục Drive Tổng</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* Cloud Status Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Tài Khoản Lưu Trữ Gốc</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                  {MASTER_ADMIN_DRIVE_CONFIG.organizationName}
                </div>
                <div style={{ fontSize: '11.5px', color: '#2563EB', marginTop: '2px' }}>{MASTER_ADMIN_DRIVE_CONFIG.adminEmail}</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Thư Mục Gốc Lưu Trữ</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                  {driveFolderNameInput || 'PH_TINHOCGENZ_MASTER_STORE'}
                </div>
                <div style={{ fontSize: '11.5px', color: '#16A34A', marginTop: '2px' }}>Tự phân loại theo môn & tên HV</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Tổng Số Bài Nộp Đã Lưu</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                  {submissions.length} Bài Thực Hành
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>~{(submissions.length * 3.2).toFixed(1)} MB Đã Lưu</div>
              </div>
            </div>

            {/* Admin Settings Section (Optional link change) */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                ⚙️ Cấu Hình Đường Dẫn Drive Tổng Của Học Viện (Dành cho Admin)
              </div>
              <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '12px', lineHeight: 1.4 }}>
                Nếu Admin chuyển sang tài khoản Google Drive khác, chỉ cần dán đường dẫn Folder Drive mới tại đây một lần duy nhất. Toàn bộ giáo viên và học viên sẽ tự động chuyển sang lưu tại thư mục mới.
              </p>

              {driveSaveSuccess && (
                <div style={{ padding: '10px 14px', borderRadius: '6px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>
                  ✓ Đã lưu cập nhật đường dẫn Google Drive Tổng thành công!
                </div>
              )}

              <form onSubmit={handleSaveDriveSettings} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={driveFolderInput}
                  onChange={e => setDriveFolderInput(e.target.value)}
                  style={{ flex: 1, minWidth: '280px', padding: '9px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A', outline: 'none' }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '9px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    background: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Lưu Cập Nhật
                </button>
              </form>
            </div>
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
                Mô Tả Ngắn Gọn
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Luyện tập các hàm thống kê và dò tìm dữ liệu..."
                value={description}
                onChange={e => setDescription(e.target.value)}
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
                    {trk.label}
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

          {/* 1. File Document Upload (PROTECTED EXAM - NO DOWNLOAD) */}
          <div style={{ background: '#FEF2F2', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #FCA5A5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#991B1B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={15} />
                <span>1. Tệp Đề Bài Gốc (Bảo Mật Cao - Tuyệt Đối Chặn Tải Xuống) *</span>
              </label>
              <span style={{ fontSize: '0.72rem', background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                Học viên chỉ được xem trực tiếp
              </span>
            </div>
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".docx,.doc,.pdf,.xlsx,.pptx,.png,.jpg,.jpeg,.txt"
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: '#FFFFFF', border: '1px dashed #DC2626', color: 'var(--text-primary)', outline: 'none' }}
            />
            {sourceFileName && <div style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: 700, marginTop: '6px' }}>✓ Đã tải tệp đề: {sourceFileName}</div>}
            {isProcessingFile && <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', marginTop: '4px' }}>⏳ Đang xử lý bóc tách nội dung đề thi...</div>}
            {fileError && <div style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '4px' }}>{fileError}</div>}
          </div>

          {/* 2. Video Lecture Clip Link */}
          <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🎥 2. Clip Bài Giảng / Hướng Dẫn Trực Tuyến (Tùy chọn)</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <input
                type="text"
                placeholder="Tiêu đề clip bài giảng (VD: Hướng dẫn giải bài tập Excel cơ bản...)"
                value={videoLectureTitle}
                onChange={e => setVideoLectureTitle(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
              />
              <input
                type="url"
                placeholder="Link Video (YouTube / Google Drive / MP4 embed...)"
                value={videoLectureUrl}
                onChange={e => setVideoLectureUrl(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
              />
            </div>
          </div>

          {/* 3. Sample Dataset File (DOWNLOAD ALLOWED) */}
          <div style={{ background: '#F0FDF4', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>💾 3. File Dữ Liệu Mẫu Thực Hành (CHO PHÉP Học Viên Tải Về Máy)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#166534', fontWeight: 700, cursor: 'pointer' }}>
                <input type="checkbox" checked={hasSampleFile} onChange={e => setHasSampleFile(e.target.checked)} />
                <span>Kèm file dữ liệu mẫu</span>
              </label>
            </div>

            {hasSampleFile && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>Tên file mẫu:</label>
                  <input
                    type="text"
                    value={sampleFileName}
                    onChange={e => setSampleFileName(e.target.value)}
                    placeholder="Du_Lieu_Mau_Excel.xlsx"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: '#FFFFFF', border: '1px solid #86EFAC', fontSize: '0.82rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>Định dạng file:</label>
                  <select
                    value={sampleFileType}
                    onChange={e => setSampleFileType(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: '#FFFFFF', border: '1px solid #86EFAC', fontSize: '0.82rem', outline: 'none' }}
                  >
                    <option value="excel">Microsoft Excel (.xlsx / .xls / .csv)</option>
                    <option value="word">Microsoft Word (.docx / .doc)</option>
                    <option value="powerpoint">Microsoft PowerPoint (.pptx)</option>
                    <option value="zip">Tệp nén tài nguyên (.zip / .rar)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>Dung lượng ước tính:</label>
                  <input
                    type="text"
                    value={sampleFileSize}
                    onChange={e => setSampleFileSize(e.target.value)}
                    placeholder="245 KB"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: '#FFFFFF', border: '1px solid #86EFAC', fontSize: '0.82rem', outline: 'none' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. DRM Security Options */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', background: 'var(--bg-primary)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={disableCopy} onChange={e => setDisableCopy(e.target.checked)} />
              <span>Chống Sao Chép (Anti-Copy)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={disableDownload} onChange={e => setDisableDownload(e.target.checked)} />
              <span>Chặn Tuyệt Đối Tải File Đề</span>
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
