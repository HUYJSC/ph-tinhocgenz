import React, { useState } from 'react';
import { Quiz, QuizAttempt } from '../../types/quiz';
import { useQuizEngine, QuizMode } from '../../hooks/useQuizEngine';
import { QuestionCard } from './QuestionCard';
import { Timer, ArrowLeft, ArrowRight, Flag, Send, Grid, AlertCircle, X } from 'lucide-react';

interface QuizRunnerProps {
  quiz: Quiz;
  mode: QuizMode;
  onFinish: (attempt: QuizAttempt) => void;
  onExit: () => void;
  bookmarkedQuestionIds: string[];
  onToggleBookmark: (questionId: string) => void;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  quiz,
  mode,
  onFinish,
  onExit,
  bookmarkedQuestionIds,
  onToggleBookmark
}) => {
  const {
    currentIndex,
    currentQuestion,
    totalQuestions,
    answers,
    revealedHints,
    flaggedQuestions,
    remainingSeconds,
    answeredCount,
    setAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    toggleFlag,
    revealHint,
    submitQuiz
  } = useQuizEngine({ quiz, mode, onFinish });

  const [showDrawer, setShowDrawer] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  if (!currentQuestion) {
    return <div>Không tìm thấy câu hỏi</div>;
  }

  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isUrgent = mode === 'exam' && quiz.timeLimitMinutes > 0 && remainingSeconds < 60;

  const handleConfirmSubmit = () => {
    setShowConfirmSubmit(false);
    submitQuiz();
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%', padding: '16px' }}>
      {/* Top Header Bar */}
      <div
        className="card"
        style={{
          padding: '12px 18px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onExit}
            className="btn btn-secondary btn-icon"
            style={{ width: '36px', height: '36px' }}
            title="Thoát bài tập"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              {quiz.title}
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Chế độ: {mode === 'exam' ? 'Kiểm tra tính giờ ⏱️' : 'Luyện tập tự do 💡'}
            </div>
          </div>
        </div>

        {/* Timer & Question Grid Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {mode === 'exam' && quiz.timeLimitMinutes > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: isUrgent ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                border: isUrgent ? '1px solid var(--danger)' : '1px solid rgba(99, 102, 241, 0.4)',
                color: isUrgent ? 'var(--danger)' : 'var(--accent-primary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                animation: isUrgent ? 'pulseGlow 1s infinite' : 'none'
              }}
            >
              <Timer size={16} />
              <span>{formatTime(remainingSeconds)}</span>
            </div>
          )}

          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
          >
            <Grid size={15} />
            <span>Danh sách câu</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
          <span>Tiến độ đã làm: {answeredCount}/{totalQuestions} câu</span>
          <span>{progressPercent}%</span>
        </div>
        <div style={{ width: '100%', height: '6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'var(--accent-gradient)',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Question Card Display */}
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        totalQuestions={totalQuestions}
        userAnswer={answers[currentQuestion.id]}
        onAnswer={ans => setAnswer(currentQuestion.id, ans)}
        isPracticeMode={mode === 'practice'}
        isBookmarked={bookmarkedQuestionIds.includes(currentQuestion.id)}
        onToggleBookmark={() => onToggleBookmark(currentQuestion.id)}
        isHintRevealed={Boolean(revealedHints[currentQuestion.id])}
        onRevealHint={() => revealHint(currentQuestion.id)}
      />

      {/* Bottom Navigation & Submit Actions */}
      <div
        style={{
          marginTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className="btn btn-secondary"
          style={{ opacity: currentIndex === 0 ? 0.4 : 1, cursor: currentIndex === 0 ? 'not-allowed' : 'pointer' }}
        >
          <ArrowLeft size={16} />
          <span>Câu trước</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => toggleFlag(currentQuestion.id)}
            className="btn btn-secondary"
            style={{
              color: flaggedQuestions[currentQuestion.id] ? '#f59e0b' : 'var(--text-secondary)',
              borderColor: flaggedQuestions[currentQuestion.id] ? '#f59e0b' : 'var(--border-color)'
            }}
          >
            <Flag size={16} fill={flaggedQuestions[currentQuestion.id] ? '#f59e0b' : 'none'} />
            <span>{flaggedQuestions[currentQuestion.id] ? 'Đã ghim' : 'Ghim câu này'}</span>
          </button>

          {isLastQuestion ? (
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="btn btn-primary"
              style={{ background: 'var(--accent-gradient-emerald)' }}
            >
              <Send size={16} />
              <span>Nộp bài ngay</span>
            </button>
          ) : (
            <button onClick={nextQuestion} className="btn btn-primary">
              <span>Câu kế tiếp</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Questions Drawer / Quick Jump Grid Modal */}
      {showDrawer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowDrawer(false)}
        >
          <div
            className="card animate-slide-up"
            style={{ width: '100%', maxWidth: '480px', padding: '24px', background: 'var(--bg-secondary)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Danh sách toàn bộ câu hỏi</h3>
              <button
                onClick={() => setShowDrawer(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', maxHeight: '320px', overflowY: 'auto' }}>
              {quiz.questions.map((q, idx) => {
                const hasAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
                const isCurrent = idx === currentIndex;
                const isFlagged = flaggedQuestions[q.id];

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      goToQuestion(idx);
                      setShowDrawer(false);
                    }}
                    style={{
                      height: '46px',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      position: 'relative',
                      background: isCurrent
                        ? 'var(--accent-primary)'
                        : hasAnswered
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'var(--bg-card)',
                      color: isCurrent
                        ? '#fff'
                        : hasAnswered
                        ? '#10b981'
                        : 'var(--text-secondary)',
                      border: isCurrent
                        ? '2px solid #fff'
                        : isFlagged
                        ? '2px solid #f59e0b'
                        : '1px solid var(--border-color)'
                    }}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#f59e0b'
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowDrawer(false);
                  setShowConfirmSubmit(true);
                }}
                className="btn btn-primary"
                style={{ width: '100%', background: 'var(--accent-gradient-emerald)' }}
              >
                <Send size={16} />
                <span>Nộp bài ({answeredCount}/{totalQuestions})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Submit Dialog */}
      {showConfirmSubmit && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div className="card animate-slide-up" style={{ maxWidth: '420px', width: '100%', padding: '24px', textAlign: 'center', background: 'var(--bg-secondary)' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <AlertCircle size={32} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Xác nhận nộp bài?</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
              Bạn đã trả lời <b>{answeredCount}</b> trên tổng số <b>{totalQuestions}</b> câu hỏi.
              {answeredCount < totalQuestions && (
                <span style={{ color: '#f59e0b', display: 'block', marginTop: '6px' }}>
                  ⚠️ Còn {totalQuestions - answeredCount} câu chưa chọn đáp án!
                </span>
              )}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button onClick={() => setShowConfirmSubmit(false)} className="btn btn-secondary">
                Làm tiếp
              </button>
              <button onClick={handleConfirmSubmit} className="btn btn-primary" style={{ background: 'var(--accent-gradient-emerald)' }}>
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
