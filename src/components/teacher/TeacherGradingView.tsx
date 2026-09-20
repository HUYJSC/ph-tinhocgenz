import React, { useState } from 'react';
import {
  Award, CheckCircle, Clock, AlertCircle, Search,
  FileText, ExternalLink, X, Save, Check, ChevronRight
} from 'lucide-react';
import { Assignment, AssignmentSubmission } from '../../types/assignment';
import { UserProfile } from '../../types/auth';
import { soundFx } from '../../utils/audio';

export interface TeacherGradingViewProps {
  currentUser?: UserProfile;
  assignments?: Assignment[];
  submissions: AssignmentSubmission[];
  onGradeSubmission?: (submissionId: string, grade: number, feedback: string) => void;
  onBackToDashboard?: () => void;
}

export const TeacherGradingView: React.FC<TeacherGradingViewProps> = ({
  submissions = [],
  onGradeSubmission,
  onBackToDashboard
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'graded'>('submitted');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [gradeInput, setGradeInput] = useState<number>(8);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isGradingSuccess, setIsGradingSuccess] = useState(false);

  // Filter submissions
  const filteredSubmissions = submissions.filter(s => {
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (s.studentName || '').toLowerCase().includes(q);
      const matchCode = (s.studentCode || '').toLowerCase().includes(q);
      const matchTitle = (s.assignmentTitle || '').toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchTitle) return false;
    }
    return true;
  });

  const pendingCount = submissions.filter(s => s.status === 'submitted').length;
  const gradedCount = submissions.filter(s => s.status === 'graded').length;
  const totalCount = submissions.length;
  const avgScore = gradedCount > 0
    ? (submissions.filter(s => s.status === 'graded' && typeof s.score === 'number').reduce((acc, s) => acc + (s.score || 0), 0) / gradedCount).toFixed(1)
    : '0.0';

  const handleOpenGrading = (sub: AssignmentSubmission) => {
    setSelectedSubmission(sub);
    setGradeInput(typeof sub.score === 'number' ? sub.score : 8.5);
    setFeedbackInput(sub.teacherFeedback || 'Bài làm tốt, kỹ năng xử lý bảng tính và định dạng chuẩn xác. Cần chú ý thêm định dạng số thập phân.');
    soundFx.playClick();
  };

  const handleSaveGrade = (isDraft = false) => {
    if (!selectedSubmission) return;
    soundFx.playCorrect();
    if (onGradeSubmission) {
      onGradeSubmission(selectedSubmission.id, gradeInput, feedbackInput);
    } else {
      // Local state update fallback
      selectedSubmission.status = isDraft ? 'submitted' : 'graded';
      selectedSubmission.score = gradeInput;
      selectedSubmission.teacherFeedback = feedbackInput;
    }
    setIsGradingSuccess(true);
    setTimeout(() => {
      setIsGradingSuccess(false);
      setSelectedSubmission(null);
    }, 1200);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Giảng Viên</span>
            <ChevronRight size={14} color="#94a3b8" />
            <span style={{ fontSize: '13px', color: '#0057B8', fontWeight: 600 }}>Chấm Điểm & Đánh Giá</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={26} color="#0057B8" />
            Quản Lý Chấm Điểm Bài Tập & Thực Hành
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748B' }}>
            Đánh giá bài nộp của học viên, cung cấp phản hồi rubric và đồng bộ bảng điểm lớp học.
          </p>
        </div>

        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ← Bảng điều khiển
          </button>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Chờ Chấm Điểm</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#D97706' }}>{pendingCount} bài</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Đã Hoàn Tất Chấm</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#16A34A' }}>{gradedCount} bài</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0057B8' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Tổng Bài Nộp</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A' }}>{totalCount} bài</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7E22CE' }}>
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Điểm Trung Bình</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#7E22CE' }}>{avgScore}/10</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        background: '#FFFFFF',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['submitted', 'all', 'graded'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setFilterStatus(tab); soundFx.playClick(); }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: filterStatus === tab ? '1px solid #0057B8' : '1px solid #E2E8F0',
                background: filterStatus === tab ? '#EFF6FF' : '#FFFFFF',
                color: filterStatus === tab ? '#0057B8' : '#64748B'
              }}
            >
              {tab === 'submitted' ? `Cần chấm (${pendingCount})` : tab === 'all' ? `Tất cả (${totalCount})` : `Đã chấm (${gradedCount})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo học viên, mã HV, bài tập..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '13px',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Submissions Table */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600 }}>
              <th style={{ padding: '12px 16px' }}>Học Viên</th>
              <th style={{ padding: '12px 16px' }}>Bài Tập / Khóa Học</th>
              <th style={{ padding: '12px 16px' }}>Thời Gian Nộp</th>
              <th style={{ padding: '12px 16px' }}>Trạng Thái</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Điểm Số</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: '#94A3B8' }}>
                  <AlertCircle size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                  Không có bài nộp nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              filteredSubmissions.map((sub, idx) => {
                const isPending = sub.status === 'submitted';
                return (
                  <tr
                    key={sub.id || idx}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background 0.15s',
                      background: selectedSubmission?.id === sub.id ? '#F0FDF4' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EFF6FF', color: '#0057B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                          {(sub.studentName || 'H').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>{sub.studentName || 'Học viên'}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{sub.studentCode || 'HV-GENZ'}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{sub.assignmentTitle || 'Bài tập thực hành Office'}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Word, Excel, PowerPoint 3-in-1</div>
                    </td>

                    <td style={{ padding: '12px 16px', color: '#64748B' }}>
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('vi-VN') : 'Hôm nay, 10:30'}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: isPending ? '#FEF3C7' : '#DCFCE7',
                        color: isPending ? '#B45309' : '#15803D'
                      }}>
                        {isPending ? <Clock size={12} /> : <Check size={12} />}
                        {isPending ? 'Chờ chấm' : 'Đã chấm'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {typeof sub.score === 'number' ? (
                        <span style={{ fontWeight: 700, color: sub.score >= 8 ? '#15803D' : sub.score >= 5 ? '#B45309' : '#DC2626', fontSize: '14px' }}>
                          {sub.score}/10
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenGrading(sub)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: isPending ? '#0057B8' : '#F1F5F9',
                          color: isPending ? '#FFFFFF' : '#334155',
                          border: isPending ? 'none' : '1px solid #CBD5E1'
                        }}
                      >
                        {isPending ? 'Chấm bài' : 'Xem / Sửa'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Grading Modal / Drawer */}
      {selectedSubmission && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '560px',
            background: '#FFFFFF',
            height: '100%',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.15)'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
                  Chấm Bài: {selectedSubmission.studentName}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  {selectedSubmission.assignmentTitle} • {selectedSubmission.studentCode}
                </span>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Submission Content Section */}
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Nội dung bài làm của học viên
                </div>
                <div style={{ fontSize: '13px', color: '#1E293B', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {selectedSubmission.answers && Object.keys(selectedSubmission.answers).length > 0
                    ? Object.entries(selectedSubmission.answers).map(([qId, ans]) => `${qId}: ${ans}`).join('\n')
                    : 'Học viên đã hoàn thành file bảng tính Excel tính toán lương và tạo pivot table phân tích chi phí bán hàng tháng 5.'}
                </div>
                {(selectedSubmission.attachedFileUrl || selectedSubmission.driveFileUrl) && (
                  <div style={{ marginTop: '12px' }}>
                    <a
                      href={selectedSubmission.attachedFileUrl || selectedSubmission.driveFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#EFF6FF',
                        color: '#0057B8',
                        fontSize: '12px',
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                    >
                      <FileText size={14} />
                      Mở file đính kèm bài tập
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>

              {/* Rubric Scoring Guide */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  Điểm Số (Thang điểm 10):
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={gradeInput}
                    onChange={e => setGradeInput(parseFloat(e.target.value))}
                    style={{ flex: 1, accentColor: '#0057B8' }}
                  />
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={gradeInput}
                    onChange={e => setGradeInput(Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)))}
                    style={{
                      width: '70px',
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '16px',
                      fontWeight: 700,
                      textAlign: 'center',
                      color: '#0057B8'
                    }}
                  />
                </div>
              </div>

              {/* Quick Feedback Pills */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '8px' }}>
                  Gợi ý nhận xét nhanh:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    'Làm đúng yêu cầu, định dạng đẹp.',
                    'Kỹ năng tính toán tốt.',
                    'Cần chú ý công thức VLOOKUP.',
                    'Thiếu biểu đồ trực quan.',
                    'Xuất sắc, đạt chuẩn khảo thí!'
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFeedbackInput(prev => prev ? `${prev} ${preset}` : preset)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        fontSize: '11px',
                        color: '#334155',
                        cursor: 'pointer'
                      }}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Textarea */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  Nhận xét chi tiết cho học viên:
                </label>
                <textarea
                  rows={4}
                  value={feedbackInput}
                  onChange={e => setFeedbackInput(e.target.value)}
                  placeholder="Ghi chú nhận xét để học viên khắc phục lỗi hoặc phát huy..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {isGradingSuccess && (
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#DCFCE7',
                  color: '#15803D',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Check size={16} />
                  Đã cập nhật điểm số và gửi thông báo thành công cho học viên!
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setSelectedSubmission(null)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Hủy bỏ
              </button>

              <button
                onClick={() => handleSaveGrade(true)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #0057B8',
                  background: '#EFF6FF',
                  color: '#0057B8',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Save size={14} />
                Lưu nháp
              </button>

              <button
                onClick={() => handleSaveGrade(false)}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0057B8',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Check size={16} />
                Hoàn tất chấm điểm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

