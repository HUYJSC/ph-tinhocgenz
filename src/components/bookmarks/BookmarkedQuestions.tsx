import React, { useState } from 'react';
import { Quiz, Question } from '../../types/quiz';
import { Bookmark, Trash2 } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface BookmarkedQuestionsProps {
  allQuizzes: Quiz[];
  bookmarkedQuestionIds: string[];
  onToggleBookmark: (questionId: string) => void;
}

export const BookmarkedQuestions: React.FC<BookmarkedQuestionsProps> = ({
  allQuizzes,
  bookmarkedQuestionIds,
  onToggleBookmark
}) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Find all bookmarked questions across all quizzes
  const bookmarkedItems: { question: Question; quizTitle: string }[] = [];

  allQuizzes.forEach(quiz => {
    quiz.questions.forEach(q => {
      if (bookmarkedQuestionIds.includes(q.id)) {
        bookmarkedItems.push({ question: q, quizTitle: quiz.title });
      }
    });
  });

  const toggleExpand = (qId: string) => {
    setExpandedIds(prev => ({ ...prev, [qId]: !prev[qId] }));
    soundFx.playClick();
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%', padding: '16px' }} className="animate-slide-up">
      <div className="card" style={{ padding: '20px', marginBottom: '20px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bookmark size={20} fill="#ef4444" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Các Câu Hỏi Đã Đánh Dấu</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Ôn tập lại các câu hỏi khó, câu quan trọng bạn đã ghim lại trong khi làm bài
            </p>
          </div>
        </div>
      </div>

      {bookmarkedItems.length === 0 ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Bookmark size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>Chưa có câu hỏi nào được đánh dấu</p>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            Trong lúc làm bài tập, bấm vào biểu tượng Bookmark trên câu hỏi để lưu vào đây nhé!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {bookmarkedItems.map(({ question: q, quizTitle }, idx) => {
            const isExpanded = Boolean(expandedIds[q.id]);
            return (
              <div key={q.id} className="card" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                      {quizTitle}
                    </span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '6px', lineHeight: 1.5 }}>
                      #{idx + 1}. {q.prompt}
                    </h3>
                  </div>

                  <button
                    onClick={() => onToggleBookmark(q.id)}
                    className="btn btn-secondary btn-icon"
                    style={{ width: '32px', height: '32px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    title="Bỏ đánh dấu"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {q.codeSnippet && (
                  <div className="code-box">
                    <code>{q.codeSnippet}</code>
                  </div>
                )}

                {/* Options Preview */}
                {q.type === 'single' && q.options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '10px 0' }}>
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          background: isExpanded && Number(q.correctAnswer) === oIdx ? 'var(--success-bg)' : 'var(--bg-secondary)',
                          border: isExpanded && Number(q.correctAnswer) === oIdx ? '1px solid var(--success)' : '1px solid var(--border-color)',
                          color: isExpanded && Number(q.correctAnswer) === oIdx ? '#10b981' : 'var(--text-secondary)'
                        }}
                      >
                        <span>{opt}</span>
                        {isExpanded && Number(q.correctAnswer) === oIdx && <span style={{ float: 'right', fontWeight: 700 }}>✓ Đáp án đúng</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Toggle Answer Button */}
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => toggleExpand(q.id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    {isExpanded ? 'Ẩn lời giải' : 'Xem đáp án & Lời giải'}
                  </button>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{q.points} điểm</span>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '12px', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '4px' }}>
                      💡 Lời giải chi tiết:
                    </div>
                    <div>{q.explanation}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
