import React, { useState } from 'react';
import { Assignment, AssignmentSubmission, TeacherNotification } from '../../types/assignment';
import { UserProfile } from '../../types/auth';
import { SubjectCategory } from '../../types/quiz';
import { parseUploadedDocument } from '../../utils/documentParser';
import {
  UploadCloud, PlusCircle, Trash2,
  Bell, Lock, Unlock, Eye, X
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface TeacherAssignmentManagerProps {
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  notifications: TeacherNotification[];
  currentUser: UserProfile;
  onCreateAssignment: (data: Omit<Assignment, 'id' | 'createdAt'>) => void;
  onDeleteAssignment: (id: string) => void;
  onToggleOpen: (id: string) => void;
  onGradeSubmission: (submissionId: string, score: number, maxScore: number, feedback: string) => void;
  onMarkNotificationAsRead: (id: string) => void;
}

export const TeacherAssignmentManager: React.FC<TeacherAssignmentManagerProps> = ({
  assignments,
  submissions,
  notifications,
  currentUser,
  onCreateAssignment,
  onDeleteAssignment,
  onToggleOpen,
  onGradeSubmission,
  onMarkNotificationAsRead
}) => {
  const [activeTab, setActiveTab] = useState<'manage' | 'create' | 'submissions' | 'notifications'>('manage');
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SubjectCategory>('mos-excel');
  const [targetClass, setTargetClass] = useState('Lớp Luyện Thi MOS & IC3');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [startTime, setStartTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 16);
  });
  const [rawContent, setRawContent] = useState('');
  const [sourceFileName, setSourceFileName] = useState('');
  const [sourceFileType, setSourceFileType] = useState<'docx' | 'doc' | 'pdf' | 'image' | 'text'>('docx');
  const [parsedQuestions, setParsedQuestions] = useState<Array<{ id: string; number: number; prompt: string; points: number }>>([]);
  const [isParsing, setIsParsing] = useState(false);

  // Grading Modal State
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(85);
  const [gradeFeedback, setGradeFeedback] = useState<string>('Bài làm rất tốt, các công thức áp dụng chính xác.');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      const result = await parseUploadedDocument(file);
      setTitle(result.title);
      setDescription(result.description);
      setSourceFileName(result.sourceFileName);
      setSourceFileType(result.sourceFileType);
      setRawContent(result.rawContent);
      setParsedQuestions(result.parsedQuestions);
      soundFx.playCorrect();
    } catch (err) {
      console.error(err);
      alert('Không thể đọc file. Hãy thử file dạng docx, pdf hoặc ảnh!');
    } finally {
      setIsParsing(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rawContent.trim()) {
      alert('Vui lòng tải file đề bài hoặc nhập nội dung đề thi!');
      return;
    }

    onCreateAssignment({
      title,
      description,
      category,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      targetClass,
      sourceFileName: sourceFileName || 'De_Thi.docx',
      sourceFileType,
      rawContent,
      parsedQuestions: parsedQuestions.length > 0 ? parsedQuestions : [
        { id: 'q1', number: 1, prompt: 'Hoàn thành các yêu cầu trong đề bài', points: 100 }
      ],
      startTime,
      endTime,
      durationMinutes: Number(durationMinutes) || 45,
      isOpen: true,
      allowLateSubmission: false,
      securityOptions: {
        disableCopy: true,
        disableDownload: true,
        watermarkStudent: true
      }
    });

    soundFx.playVictory();
    setActiveTab('manage');
  };

  const handleSaveGrade = () => {
    if (!selectedSubmission) return;
    onGradeSubmission(selectedSubmission.id, gradeScore, 100, gradeFeedback);
    setSelectedSubmission(null);
    soundFx.playCorrect();
  };

  const unreadNotifs = notifications.filter(n => !n.isRead);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '16px' }} className="animate-slide-up">
      {/* Top Header */}
      <div
        className="card"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '20px',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>
            <span>Phân Hệ Giảng Viên • Khảo Thí & Bảo Mật</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            Giao Đề Thi Tài Liệu (DOC/PDF/Ảnh) & Quản Lý Nộp Bài
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Đọc tự động file đề thi, thiết lập thời gian đóng/mở, chống tải về và nhận thông báo học viên nộp bài.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('create')}
          className="btn btn-primary"
          style={{
            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)'
          }}
        >
          <PlusCircle size={16} />
          <span>Tải Lên & Giao Đề Mới</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
        {[
          { id: 'manage', label: 'Danh Sách Đề Đã Giao', count: assignments.length },
          { id: 'create', label: 'Tải File & Giao Đề Thi' },
          { id: 'submissions', label: 'Bài Nộp Của Học Sinh', count: submissions.length },
          { id: 'notifications', label: 'Thông Báo Nộp Bài', count: unreadNotifs.length, highlight: unreadNotifs.length > 0 }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id as any);
              soundFx.playClick();
            }}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              background: activeTab === t.id ? 'var(--bg-secondary)' : 'var(--bg-card)',
              border: activeTab === t.id ? '1.5px solid #d97706' : '1px solid var(--border-color)',
              color: activeTab === t.id ? '#d97706' : 'var(--text-secondary)',
              fontWeight: activeTab === t.id ? 700 : 500,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span
                style={{
                  fontSize: '0.72rem',
                  background: t.highlight ? '#ef4444' : 'rgba(217, 119, 6, 0.15)',
                  color: t.highlight ? '#ffffff' : '#d97706',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 1. MANAGE TAB */}
      {activeTab === 'manage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px' }}>Tiêu Đề Đề Thi</th>
                  <th style={{ padding: '12px 14px' }}>Môn Học</th>
                  <th style={{ padding: '12px 14px' }}>Lớp Áp Dụng</th>
                  <th style={{ padding: '12px 14px' }}>Thời Lượng</th>
                  <th style={{ padding: '12px 14px' }}>Khung Giờ Mở/Đóng</th>
                  <th style={{ padding: '12px 14px' }}>Trạng Thái</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <div>{a.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tệp: {a.sourceFileName}</div>
                    </td>
                    <td style={{ padding: '12px 14px', textTransform: 'uppercase', fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                      {a.category}
                    </td>
                    <td style={{ padding: '12px 14px' }}>{a.targetClass}</td>
                    <td style={{ padding: '12px 14px' }}>{a.durationMinutes} phút</td>
                    <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <div>Mở: {new Date(a.startTime).toLocaleDateString('vi-VN')}</div>
                      <div>Đóng: {new Date(a.endTime).toLocaleDateString('vi-VN')}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <button
                        onClick={() => onToggleOpen(a.id)}
                        style={{
                          background: a.isOpen ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: a.isOpen ? '#10b981' : '#ef4444',
                          border: a.isOpen ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {a.isOpen ? <Unlock size={12} /> : <Lock size={12} />}
                        <span>{a.isOpen ? 'Đang Mở' : 'Đã Khóa'}</span>
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => onDeleteAssignment(a.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        title="Xóa đề thi này"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. CREATE ASSIGNMENT FROM FILE TAB */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateSubmit} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            1. Tải Lên Tệp Đề Bài (DOCX, PDF hoặc Hình Ảnh)
          </h3>

          {/* Drag & Drop File Upload Box */}
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '36px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)',
              border: '2px dashed var(--accent-primary)',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            <UploadCloud size={36} color="var(--accent-primary)" />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isParsing ? 'Đang đọc và phân tích cấu trúc file đề bài...' : (sourceFileName ? `✓ Đã nạp file: ${sourceFileName}` : 'Nhấp để tải file Word (.docx), PDF hoặc Hình ảnh')}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Hệ thống tự động trích xuất nội dung và khóa bảo mật chống tải về cho học viên
              </p>
            </div>
            <input
              type="file"
              accept=".docx,.doc,.pdf,.png,.jpg,.jpeg,.txt"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </label>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '10px' }}>
            2. Cấu Hình Khung Giờ Làm Bài & Lớp Học
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Tiêu Đề Đề Thi *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Kiểm tra 45 phút MOS Excel K12"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Chuyên Đề Môn Học
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as SubjectCategory)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
              >
                <option value="mos-excel">MOS Excel (Bảng tính & Hàm)</option>
                <option value="mos-word">MOS Word (Văn bản & Trộn thư)</option>
                <option value="mos-powerpoint">MOS PowerPoint (Trình chiếu)</option>
                <option value="ic3-gs">Chuẩn Quốc Tế IC3 GS6</option>
                <option value="programming">Lập Trình Python</option>
                <option value="general-it">Mạng Máy Tính & An Toàn IT</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Lớp Học Áp Dụng
              </label>
              <input
                type="text"
                placeholder="Lớp Luyện Thi MOS K12"
                value={targetClass}
                onChange={e => setTargetClass(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Thời Lượng Làm Bài (Phút)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Ngày Giờ Mở Đề
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Hạn Chót Đóng Đề
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
          </div>

          {/* Raw Content Preview & Edit */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Nội Dung Đề Bài (Hệ thống sẽ hiển thị trong khung bảo mật chống tải về):
            </label>
            <textarea
              rows={8}
              value={rawContent}
              onChange={e => setRawContent(e.target.value)}
              placeholder="Nội dung đề bài trích xuất từ file hoặc nhập trực tiếp tại đây..."
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: '14px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
            }}
          >
            <span>Phát Hành & Mở Đề Thi Cho Học Viên</span>
          </button>
        </form>
      )}

      {/* 3. SUBMISSIONS TAB */}
      {activeTab === 'submissions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                    <th style={{ padding: '12px 14px' }}>Tệp Đính Kèm</th>
                    <th style={{ padding: '12px 14px' }}>Trạng Thái Điểm</th>
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
                        {sub.attachedFileName ? (
                          <span style={{ color: '#10b981', fontWeight: 600 }}>{sub.attachedFileName}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Trả lời trực tiếp</span>
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
                        <button
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setGradeScore(sub.score || 85);
                            setGradeFeedback(sub.teacherFeedback || 'Bài làm tốt, áp dụng đúng kiến thức.');
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          <Eye size={14} />
                          <span>Xem & Chấm Điểm</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 4. NOTIFICATIONS TAB */}
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
                  background: n.isRead ? 'var(--bg-secondary)' : 'rgba(217, 119, 6, 0.08)',
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
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  >
                    Đã xem
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Grading Modal */}
      {selectedSubmission && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(6px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div className="card animate-slide-up" style={{ maxWidth: '650px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Chấm Điểm Bài Thi Của {selectedSubmission.studentName}
              </h3>
              <button onClick={() => setSelectedSubmission(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.85rem' }}>
              <div><b>Bài thi:</b> {selectedSubmission.assignmentTitle}</div>
              <div><b>Thời gian nộp:</b> {selectedSubmission.submittedAt}</div>
              {selectedSubmission.attachedFileName && <div><b>Tệp đính kèm:</b> {selectedSubmission.attachedFileName}</div>}
            </div>

            {/* Answer details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Câu trả lời của học sinh:</h4>
              {Object.entries(selectedSubmission.answers).map(([qId, ans], idx) => (
                <div key={qId} style={{ padding: '10px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '4px' }}>Câu {idx + 1}:</div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{ans || '(Học sinh không nhập nội dung)'}</div>
                </div>
              ))}
            </div>

            {/* Teacher score & feedback form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  Điểm số (Thang 100):
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={gradeScore}
                  onChange={e => setGradeScore(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.1rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  Nhận xét & Lời khuyên của Giáo viên:
                </label>
                <textarea
                  rows={3}
                  value={gradeFeedback}
                  onChange={e => setGradeFeedback(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem' }}
                />
              </div>

              <button
                onClick={handleSaveGrade}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  fontWeight: 800
                }}
              >
                Lưu Điểm & Trả Kết Quả Cho Học Sinh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
