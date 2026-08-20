import React, { useState } from 'react';
import { Question } from '../../types/quiz';
import { Bookmark, Lightbulb, CheckCircle2, XCircle, HelpCircle, Check, Code } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  userAnswer: any;
  onAnswer: (ans: any) => void;
  isPracticeMode?: boolean;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  isHintRevealed: boolean;
  onRevealHint: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  userAnswer,
  onAnswer,
  isPracticeMode = false,
  isBookmarked,
  onToggleBookmark,
  isHintRevealed,
  onRevealHint
}) => {
  // Matching temporary selection state
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  // Single choice
  const handleSingleSelect = (idx: number) => {
    onAnswer(idx);
  };

  // Multiple choice
  const handleMultipleSelect = (idx: number) => {
    const currentList: number[] = Array.isArray(userAnswer) ? [...userAnswer] : [];
    const exists = currentList.includes(idx);
    const updated = exists ? currentList.filter(i => i !== idx) : [...currentList, idx];
    onAnswer(updated);
  };

  // True/False
  const handleTrueFalseSelect = (val: boolean) => {
    onAnswer(val);
  };

  // Matching pair handler
  const handleMatchingSelect = (type: 'left' | 'right', idOrValue: string) => {
    soundFx.playClick();
    if (type === 'left') {
      setSelectedLeft(idOrValue);
    } else if (type === 'right' && selectedLeft) {
      const currentMatches = typeof userAnswer === 'object' && userAnswer !== null ? { ...userAnswer } : {};
      currentMatches[selectedLeft] = idOrValue;
      onAnswer(currentMatches);
      setSelectedLeft(null);
    }
  };

  const removeMatchingPair = (pairId: string) => {
    if (typeof userAnswer === 'object' && userAnswer !== null) {
      const updated = { ...userAnswer };
      delete updated[pairId];
      onAnswer(updated);
      soundFx.playClick();
    }
  };

  return (
    <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
      {/* Top Meta Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent-primary)'
            }}
          >
            Câu {questionNumber} / {totalQuestions}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-secondary)'
            }}
          >
            +{question.points} điểm
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {question.hint && (
            <button
              onClick={onRevealHint}
              title="Xem gợi ý"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                background: isHintRevealed ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: isHintRevealed ? '#f59e0b' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Lightbulb size={14} />
              <span>Gợi ý</span>
            </button>
          )}

          <button
            onClick={onToggleBookmark}
            title={isBookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu câu hỏi'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              background: isBookmarked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: isBookmarked ? '#ef4444' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Bookmark size={15} fill={isBookmarked ? '#ef4444' : 'none'} />
          </button>
        </div>
      </div>

      {/* Question Prompt */}
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.5, marginBottom: '12px', color: 'var(--text-primary)' }}>
        {question.prompt}
      </h2>

      {/* Optional Code Snippet */}
      {question.codeSnippet && (
        <div className="code-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            <Code size={13} />
            <span>Đoạn mã tham chiếu:</span>
          </div>
          <code>{question.codeSnippet}</code>
        </div>
      )}

      {/* Hint Alert */}
      {isHintRevealed && question.hint && (
        <div
          style={{
            margin: '14px 0',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '0.85rem',
            color: '#f59e0b'
          }}
        >
          <HelpCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <span style={{ fontWeight: 700 }}>Gợi ý: </span>
            {question.hint}
          </div>
        </div>
      )}

      {/* Interactive Answer Area based on Question Type */}
      <div style={{ marginTop: '20px' }}>
        {/* 1. SINGLE CHOICE */}
        {question.type === 'single' && question.options && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {question.options.map((opt, idx) => {
              const isSelected = userAnswer === idx;
              const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
              return (
                <div
                  key={idx}
                  onClick={() => handleSingleSelect(idx)}
                  className={`option-item ${isSelected ? 'selected' : ''}`}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      background: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.06)',
                      color: isSelected ? '#fff' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      flexShrink: 0
                    }}
                  >
                    {optionLetters[idx] || idx + 1}
                  </div>
                  <span style={{ fontSize: '0.95rem', flex: 1, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isSelected ? 600 : 400 }}>
                    {opt}
                  </span>
                  {isSelected && <Check size={18} color="var(--accent-primary)" style={{ flexShrink: 0 }} />}
                </div>
              );
            })}
          </div>
        )}

        {/* 2. MULTIPLE CHOICE */}
        {question.type === 'multiple' && question.options && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              *(Có thể chọn nhiều hơn một đáp án)*
            </p>
            {question.options.map((opt, idx) => {
              const selectedList: number[] = Array.isArray(userAnswer) ? userAnswer : [];
              const isSelected = selectedList.includes(idx);
              return (
                <div
                  key={idx}
                  onClick={() => handleMultipleSelect(idx)}
                  className={`option-item ${isSelected ? 'selected' : ''}`}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      border: isSelected ? 'none' : '2px solid var(--border-color)',
                      background: isSelected ? 'var(--accent-primary)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      flexShrink: 0
                    }}
                  >
                    {isSelected && <Check size={16} />}
                  </div>
                  <span style={{ fontSize: '0.95rem', flex: 1, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isSelected ? 600 : 400 }}>
                    {opt}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. TRUE / FALSE */}
        {question.type === 'true-false' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <button
              onClick={() => handleTrueFalseSelect(true)}
              className="btn"
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                background: userAnswer === true ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-card)',
                border: userAnswer === true ? '2px solid var(--success)' : '1px solid var(--border-color)',
                color: userAnswer === true ? 'var(--success)' : 'var(--text-primary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1rem',
                fontWeight: 700
              }}
            >
              <CheckCircle2 size={28} />
              <span>ĐÚNG (TRUE)</span>
            </button>

            <button
              onClick={() => handleTrueFalseSelect(false)}
              className="btn"
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                background: userAnswer === false ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-card)',
                border: userAnswer === false ? '2px solid var(--danger)' : '1px solid var(--border-color)',
                color: userAnswer === false ? 'var(--danger)' : 'var(--text-primary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1rem',
                fontWeight: 700
              }}
            >
              <XCircle size={28} />
              <span>SAI (FALSE)</span>
            </button>
          </div>
        )}

        {/* 4. FILL IN THE BLANK */}
        {question.type === 'fill-blank' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Nhập câu trả lời của bạn vào đây..."
                value={userAnswer || ''}
                onChange={e => onAnswer(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent-primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-color)')}
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              *Lưu ý: Hệ thống không phân biệt chữ hoa hay chữ thường.
            </p>
          </div>
        )}

        {/* 5. MATCHING PAIRS */}
        {question.type === 'matching' && question.matchingPairs && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              👉 Hướng dẫn: Chọn 1 mục ở <b>Cột A</b>, sau đó chọn mục tương ứng ở <b>Cột B</b> để ghép nối.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Column A (Left) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '4px' }}>CỘT A</div>
                {question.matchingPairs.map(pair => {
                  const isMatched = userAnswer && userAnswer[pair.id];
                  const isCurSelected = selectedLeft === pair.id;
                  return (
                    <div
                      key={pair.id}
                      onClick={() => handleMatchingSelect('left', pair.id)}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        background: isCurSelected
                          ? 'rgba(99, 102, 241, 0.25)'
                          : isMatched
                          ? 'rgba(16, 185, 129, 0.12)'
                          : 'var(--bg-secondary)',
                        border: isCurSelected
                          ? '1.5px solid var(--accent-primary)'
                          : isMatched
                          ? '1px solid rgba(16, 185, 129, 0.4)'
                          : '1px solid var(--border-color)',
                        fontSize: '0.85rem',
                        fontWeight: isCurSelected ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {pair.left}
                    </div>
                  );
                })}
              </div>

              {/* Column B (Right) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#a855f7', marginBottom: '4px' }}>CỘT B</div>
                {/* Randomize / display right options */}
                {question.matchingPairs.map(pair => {
                  const isRightUsed = userAnswer && Object.values(userAnswer).includes(pair.right);
                  return (
                    <div
                      key={pair.id}
                      onClick={() => handleMatchingSelect('right', pair.right)}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        background: isRightUsed ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.85rem',
                        cursor: selectedLeft ? 'pointer' : 'default',
                        opacity: selectedLeft ? 1 : 0.85
                      }}
                    >
                      {pair.right}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Paired Results */}
            {userAnswer && Object.keys(userAnswer).length > 0 && (
              <div style={{ marginTop: '8px', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Các cặp đã ghép ({Object.keys(userAnswer).length}/{question.matchingPairs.length}):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.entries(userAnswer).map(([lId, rVal]) => {
                    const lObj = question.matchingPairs?.find(p => p.id === lId);
                    return (
                      <div
                        key={lId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.04)',
                          fontSize: '0.8rem'
                        }}
                      >
                        <span><b>{lObj?.left}</b> ➔ {String(rVal).substring(0, 35)}...</span>
                        <button
                          onClick={() => removeMatchingPair(lId)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: 700 }}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Practice Mode Explanation Box */}
      {isPracticeMode && userAnswer !== undefined && userAnswer !== '' && (
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-primary)', marginBottom: '6px' }}>
            <HelpCircle size={16} />
            <span>Giải thích đáp án chi tiết:</span>
          </div>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};
