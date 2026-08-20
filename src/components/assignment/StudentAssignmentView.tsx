import React, { useState, useEffect } from 'react';
import { Assignment, AssignmentSubmission } from '../../types/assignment';
import { UserProfile } from '../../types/auth';
import { SecureDocViewer } from './SecureDocViewer';
import {
  Clock, CheckCircle2, Play, UploadCloud, Send
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import confetti from 'canvas-confetti';

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
    attachedFile?: { name: string; size: string; content?: string }
  ) => void;
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
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<AssignmentSubmission | null>(null);

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
    setSubmittedSuccess(null);
    soundFx.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
      setAttachedFile({
        name: file.name,
        size: sizeStr
      });
      soundFx.playCorrect();
    }
  };

  const handleConfirmSubmit = () => {
    if (!activeAssignment) return;

    if (!unifiedAnswer.trim() && !attachedFile) {
      alert('Vui lòng nhập nội dung bài làm hoặc đính kèm tệp bài làm thực hành trước khi nộp!');
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
      attachedFile || undefined
    ) as any;

    setShowSubmitModal(false);
    setSubmittedSuccess(sub || {
      assignmentTitle: activeAssignment.title,
      submittedAt: new Date().toLocaleString('vi-VN')
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
      attachedFile || undefined
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
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '16px' }} className="animate-slide-up">
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
            Hệ thống đã chuyển bài làm của bạn đến <b>Giáo viên đứng lớp</b> để chấm điểm.
          </p>

          <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', margin: '20px 0', textAlign: 'left', fontSize: '0.85rem' }}>
            <div><b>Bài thi:</b> {submittedSuccess.assignmentTitle}</div>
            <div><b>Học viên:</b> {currentUser.name} ({currentUser.studentCode})</div>
            <div><b>Thời gian nộp:</b> {submittedSuccess.submittedAt}</div>
            {attachedFile && <div><b>Tệp đính kèm:</b> {attachedFile.name} ({attachedFile.size})</div>}
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

      {/* 2. Active Exam Session */}
      {activeAssignment && !submittedSuccess && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Active Exam Sticky Header */}
          <div
            className="card"
            style={{
              position: 'sticky',
              top: '70px',
              zIndex: 20,
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: 'var(--shadow-md)',
              border: '1.5px solid var(--accent-primary)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                Đang Làm Bài Thi • {activeAssignment.category}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {activeAssignment.title}
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* Countdown Timer */}
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

          {/* Exam Grid: Left Protected Viewer | Right Simplified Submission Sheet */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* Left: Secure Protected DRM Document Viewer */}
            <div>
              <div style={{ marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                1. Đề thi gốc từ Giáo viên (Bảo mật - Chống sao chép):
              </div>
              <SecureDocViewer
                content={activeAssignment.rawContent}
                sourceFileType={activeAssignment.sourceFileType}
                sourceFileName={activeAssignment.sourceFileName}
                studentName={currentUser.name}
                studentCode={currentUser.studentCode || 'THGZ01'}
                title={activeAssignment.title}
              />
            </div>

            {/* Right: Simplified Student Submission Sheet */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                2. Phiếu Làm Bài & Nộp Bài Trực Tiếp:
              </div>

              <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Text Area for Answers / Explanations */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Nhập câu trả lời, công thức hàm hoặc ghi chú bài làm của bạn:
                  </label>
                  <textarea
                    rows={8}
                    placeholder="Nhập phần trả lời bài làm của bạn tại đây (ví dụ: Câu 1: =VLOOKUP(...), Câu 2: ...)..."
                    value={unifiedAnswer}
                    onChange={e => setUnifiedAnswer(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'vertical',
                      lineHeight: '1.6'
                    }}
                  />
                </div>

                {/* Upload Homework / Practical Work File */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Đính kèm tệp bài làm thực hành (Excel .xlsx, Word .docx, Python .py, ZIP, PDF...):
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '24px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-primary)',
                      border: attachedFile ? '2px solid #10b981' : '2px dashed var(--border-color)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <UploadCloud size={28} color={attachedFile ? '#10b981' : 'var(--accent-primary)'} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {attachedFile ? (
                        <b style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={16} />
                          <span>Đã chọn: {attachedFile.name} ({attachedFile.size})</span>
                        </b>
                      ) : (
                        'Nhấp để chọn tệp bài làm thực hành từ máy tính của bạn'
                      )}
                    </span>
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {/* Big Action Submit Button */}
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '6px'
                  }}
                >
                  <Send size={18} />
                  <span>Xác Nhận & Nộp Bài Thi Lên Giáo Viên</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Normal View: Classroom Assignment List */}
      {!activeAssignment && !submittedSuccess && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Banner */}
          <div
            className="card"
            style={{
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0.02) 100%)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(37, 99, 235, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                <span>Cổng Học Viên • Khảo Thí Lớp Học</span>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                Đề Thi & Bài Tập Do Giáo Viên Giao
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Xem đề thi trực tiếp trên hệ thống, hoàn thành trong thời gian quy định và nộp bài để nhận điểm.
              </p>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Học viên: <b>{currentUser.name}</b> ({currentUser.studentCode}) • Lớp: <b>{currentUser.schoolOrClass || 'Tin Học Chuẩn'}</b>
            </div>
          </div>

          {/* List of Classroom Assignments */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {(() => {
              const allowedTracks = currentUser.enrolledTracks || (currentUser.programTrack ? [currentUser.programTrack] : ['mos-office']);
              const visibleList = assignments.filter(a =>
                allowedTracks.includes(a.category as any) ||
                (a.targetClass && currentUser.schoolOrClass && a.targetClass.toLowerCase().includes(currentUser.schoolOrClass.toLowerCase()))
              );

              if (visibleList.length === 0) {
                return (
                  <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                    Không có đề thi tài liệu nào được giao cho khóa học của bạn ({currentUser.schoolOrClass || 'Lớp của bạn'}).
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
                          🟢 Đang mở đề
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
                          🔒 Đã đóng đề
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {assign.title}
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
                      {assign.description}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      <div>⏱️ <b>Thời lượng:</b> {assign.durationMinutes} phút làm bài</div>
                      <div>📅 <b>Hạn nộp:</b> {new Date(assign.endTime).toLocaleString('vi-VN')}</div>
                      <div>👨‍🏫 <b>Giáo viên:</b> {assign.teacherName}</div>
                      <div>🔒 <b>Bảo mật:</b> Chống tải về & Chống sao chép</div>
                    </div>
                  </div>

                  {/* Action / Result */}
                  <div>
                    {hasSubmitted ? (
                      <div style={{ padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem' }}>
                        <div style={{ fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={16} />
                          <span>Đã nộp vào: {latestSub?.submittedAt}</span>
                        </div>
                        {latestSub?.status === 'graded' && (
                          <div style={{ marginTop: '4px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                            Điểm của giáo viên: {latestSub.score}/{latestSub.maxScore}
                            {latestSub.teacherFeedback && <p style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>Nhận xét: {latestSub.teacherFeedback}</p>}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartExam(assign)}
                        disabled={!isCurrentlyOpen}
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          padding: '11px',
                          opacity: isCurrentlyOpen ? 1 : 0.6,
                          cursor: isCurrentlyOpen ? 'pointer' : 'not-allowed'
                        }}
                      >
                        <Play size={16} />
                        <span>{isCurrentlyOpen ? 'Vào Xem Đề & Làm Bài' : 'Đề Thi Đang Khóa'}</span>
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

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div className="card animate-slide-up" style={{ maxWidth: '420px', width: '100%', padding: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Xác Nhận Nộp Bài Thi?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '10px 0 20px' }}>
              Sau khi nộp, hệ thống sẽ gửi bài làm và <b>bắn thông báo ngay cho Giáo viên {activeAssignment?.teacherName}</b> để chấm điểm.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Xem Lại Bài
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="btn btn-primary"
                style={{ flex: 1 }}
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
