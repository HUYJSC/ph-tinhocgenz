import React, { useState } from 'react';
import { Quiz, Question } from '../../types/quiz';
import { RotateCw, CheckCircle2, XCircle, Shuffle, RotateCcw, ArrowLeft, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { soundFx } from '../../utils/audio';

import { UserProfile, CurriculumTrack } from '../../types/auth';

interface FlashcardDeckProps {
  quizzes: Quiz[];
  currentUser?: UserProfile;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ quizzes, currentUser }) => {
  const isStudent = currentUser?.role === 'student';
  const allowedTracks: CurriculumTrack[] = currentUser?.enrolledTracks ||
    (currentUser?.programTrack ? [currentUser.programTrack] : ['mos-office']);

  const visibleQuizzes = isStudent
    ? quizzes.filter(q => allowedTracks.includes(q.category as CurriculumTrack))
    : quizzes;

  const [selectedQuizId, setSelectedQuizId] = useState<string>(visibleQuizzes[0]?.id || '');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>(() => {
    return visibleQuizzes[0]?.questions || [];
  });

  const currentQuiz = visibleQuizzes.find(q => q.id === selectedQuizId) || visibleQuizzes[0];

  const handleSelectQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    const q = quizzes.find(item => item.id === quizId);
    if (q) {
      setShuffledQuestions([...q.questions]);
      setCurrentIndex(0);
      setIsFlipped(false);
      setMasteredIds([]);
    }
    soundFx.playClick();
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    soundFx.playFlip();
  };

  const handleNext = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      soundFx.playClick();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      soundFx.playClick();
    }
  };

  const handleMarkMastered = () => {
    const curQ = shuffledQuestions[currentIndex];
    if (curQ && !masteredIds.includes(curQ.id)) {
      setMasteredIds([...masteredIds, curQ.id]);
      soundFx.playCorrect();
    }
    handleNext();
  };

  const handleMarkReview = () => {
    const curQ = shuffledQuestions[currentIndex];
    if (curQ) {
      setMasteredIds(masteredIds.filter(id => id !== curQ.id));
      soundFx.playIncorrect();
    }
    handleNext();
  };

  const handleShuffle = () => {
    const shuffled = [...shuffledQuestions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    soundFx.playClick();
  };

  const handleReset = () => {
    if (currentQuiz) {
      setShuffledQuestions([...currentQuiz.questions]);
      setCurrentIndex(0);
      setIsFlipped(false);
      setMasteredIds([]);
      soundFx.playClick();
    }
  };

  const currentCard = shuffledQuestions[currentIndex];
  const progressPercent = shuffledQuestions.length > 0
    ? Math.round((masteredIds.length / shuffledQuestions.length) * 100)
    : 0;

  if (!currentCard) {
    return <div>Không có thẻ nào</div>;
  }

  // Format display answer for flashcard back
  const getAnswerText = (q: Question) => {
    if (q.type === 'single' && q.options && typeof q.correctAnswer === 'number') {
      return `Đáp án: ${q.options[q.correctAnswer]}`;
    }
    if (q.type === 'true-false') {
      return `Đáp án: ${q.correctAnswer ? 'ĐÚNG (True)' : 'SAI (False)'}`;
    }
    if (q.type === 'fill-blank' || typeof q.correctAnswer === 'string') {
      return `Đáp án: ${q.correctAnswer}`;
    }
    if (q.type === 'multiple' && q.options && Array.isArray(q.correctAnswer)) {
      return `Đáp án: ${q.correctAnswer.map(idx => q.options?.[idx]).join(', ')}`;
    }
    if (q.type === 'matching' && q.matchingPairs) {
      return `Ghép đôi: ${q.matchingPairs.map(p => `${p.left} ➔ ${p.right}`).join(' | ')}`;
    }
    return 'Xem giải thích chi tiết';
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%', padding: '16px' }}>
      {/* Quiz Selector Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
          CHỌN BỘ ĐỀ FLASHCARD ĐỂ ÔN TẬP:
        </label>
        <select
          value={selectedQuizId}
          onChange={e => handleSelectQuiz(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            outline: 'none',
            fontWeight: 600
          }}
        >
          {visibleQuizzes.map(q => (
            <option key={q.id} value={q.id}>
              {q.title} ({q.questions.length} thẻ)
            </option>
          ))}
        </select>
      </div>

      {/* Progress & Card Counter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="var(--accent-primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            Thẻ {currentIndex + 1} / {shuffledQuestions.length}
          </span>
          {masteredIds.includes(currentCard.id) && (
            <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
              ✓ Đã thuộc
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={handleShuffle} title="Tráo thẻ ngẫu nhiên" className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
            <Shuffle size={14} />
            <span>Tráo thẻ</span>
          </button>
          <button onClick={handleReset} title="Học lại từ đầu" className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
            <RotateCcw size={14} />
            <span>Học lại</span>
          </button>
        </div>
      </div>

      {/* Mastery Progress Bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
          <span>Độ thành thục ({masteredIds.length}/{shuffledQuestions.length} thẻ)</span>
          <span>{progressPercent}%</span>
        </div>
        <div style={{ width: '100%', height: '6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent-gradient-emerald)', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* 3D Flip Flashcard */}
      <div className="flashcard-wrapper" onClick={handleFlip}>
        <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
          {/* Front of Card */}
          <div className="flashcard-front">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
                MẶT TRƯỚC: CÂU HỎI
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Chạm để lật mặt sau ↻</span>
            </div>

            <div style={{ margin: 'auto 0', padding: '16px 0' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.6, color: 'var(--text-primary)' }}>
                {currentCard.prompt}
              </h3>
              {currentCard.codeSnippet && (
                <div className="code-box" style={{ textAlign: 'left', marginTop: '14px' }}>
                  <code>{currentCard.codeSnippet}</code>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              <RotateCw size={14} />
              <span>Bấm để xem câu trả lời & giải thích</span>
            </div>
          </div>

          {/* Back of Card */}
          <div className="flashcard-back">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.25)', color: '#c084fc' }}>
                MẶT SAU: ĐÁP ÁN & GIẢI THÍCH
              </span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Chạm để lật lại ↻</span>
            </div>

            <div style={{ margin: 'auto 0', padding: '12px 0' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginBottom: '12px' }}>
                {getAnswerText(currentCard)}
              </div>
              <p style={{ fontSize: '0.92rem', color: '#e2e8f0', lineHeight: 1.6, textAlign: 'left', background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                💡 <b>Giải thích:</b> {currentCard.explanation}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.82rem', color: '#c084fc' }}>
              <Sparkles size={14} />
              <span>Ghi nhớ bằng phương pháp lặp lại ngắt quãng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (Mastered / Review / Prev / Next) */}
      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button
            onClick={handleMarkReview}
            className="btn"
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontWeight: 700
            }}
          >
            <XCircle size={18} />
            <span>Chưa nhớ / Cần ôn</span>
          </button>

          <button
            onClick={handleMarkMastered}
            className="btn"
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontWeight: 700
            }}
          >
            <CheckCircle2 size={18} />
            <span>Đã thuộc lòng</span>
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={handlePrev} disabled={currentIndex === 0} className="btn btn-secondary" style={{ opacity: currentIndex === 0 ? 0.4 : 1 }}>
            <ArrowLeft size={16} />
            <span>Thẻ trước</span>
          </button>

          <button onClick={handleNext} disabled={currentIndex === shuffledQuestions.length - 1} className="btn btn-secondary" style={{ opacity: currentIndex === shuffledQuestions.length - 1 ? 0.4 : 1 }}>
            <span>Thẻ kế tiếp</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
