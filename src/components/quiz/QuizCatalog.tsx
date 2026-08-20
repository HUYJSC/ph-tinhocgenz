import React, { useState } from 'react';
import { Quiz, SubjectCategory, Difficulty } from '../../types/quiz';
import { QuizMode } from '../../hooks/useQuizEngine';
import { Search, Timer, HelpCircle, Play, Sparkles, BookOpen, Trash2, Code2, Languages, Binary, ShieldCheck } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface QuizCatalogProps {
  quizzes: Quiz[];
  onStartQuiz: (quiz: Quiz, mode: QuizMode) => void;
  onDeleteCustomQuiz?: (quizId: string) => void;
}

const CATEGORIES: { id: SubjectCategory; label: string; icon: any }[] = [
  { id: 'all', label: 'Tất cả', icon: BookOpen },
  { id: 'programming', label: 'Lập Trình & CNTT', icon: Code2 },
  { id: 'english', label: 'Tiếng Anh', icon: Languages },
  { id: 'math', label: 'Toán & Logic', icon: Binary },
  { id: 'informatics', label: 'Tin Học Văn Phòng', icon: ShieldCheck },
  { id: 'science', label: 'Khoa Học', icon: Sparkles }
];

export const QuizCatalog: React.FC<QuizCatalogProps> = ({
  quizzes,
  onStartQuiz,
  onDeleteCustomQuiz
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredQuizzes = quizzes.filter(q => {
    const matchCat = selectedCategory === 'all' || q.category === selectedCategory;
    const matchDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    const matchSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchDiff && matchSearch;
  });

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case 'easy':
        return <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>Dễ</span>;
      case 'medium':
        return <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>Vừa</span>;
      case 'hard':
        return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>Khó</span>;
    }
  };

  const handleStart = (quiz: Quiz, mode: QuizMode) => {
    soundFx.playClick();
    onStartQuiz(quiz, mode);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '16px' }} className="animate-slide-up">
      {/* Hero Welcome Banner */}
      <div
        className="card"
        style={{
          padding: '30px 26px',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.07) 0%, rgba(219, 234, 254, 0.4) 100%)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
          border: '1px solid rgba(37, 99, 235, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ maxWidth: '650px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(37, 99, 235, 0.1)', color: '#1d4ed8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px' }}>
            <Sparkles size={14} />
            <span>Hệ thống Ôn luyện & Luyện thi Tin học Chuẩn Quốc tế</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1.3 }}>
            Nâng cao kiến thức cùng kho bài tập tương tác
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Chọn một bài kiểm tra để bắt đầu ngay. Bạn có thể chọn <b>Chế độ thi tính giờ</b> hoặc <b>Luyện tập có giải thích chi tiết</b>!
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Search Input & Difficulty Dropdown */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Tìm kiếm đề thi theo tên hoặc chủ đề..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          >
            <option value="all">Mọi độ khó</option>
            <option value="easy">Dễ (Cơ bản)</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó (Nâng cao)</option>
          </select>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  soundFx.playClick();
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  background: isSelected ? 'var(--accent-primary)' : 'var(--bg-card)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.18s ease'
                }}
              >
                <Icon size={15} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quizzes Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>Không tìm thấy đề thi phù hợp</p>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Hãy thử thay đổi từ khóa hoặc bộ lọc chủ đề</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredQuizzes.map(quiz => (
            <div
              key={quiz.id}
              className="card"
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                {/* Header tag & difficulty */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getDifficultyBadge(quiz.difficulty)}
                    {quiz.isCustom && (
                      <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                        Tự tạo ✍️
                      </span>
                    )}
                  </div>

                  {quiz.isCustom && onDeleteCustomQuiz && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Xóa đề thi "${quiz.title}"?`)) {
                          onDeleteCustomQuiz(quiz.id);
                        }
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      title="Xóa đề thi tự tạo"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Title and description */}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.4, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {quiz.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                  {quiz.description}
                </p>
              </div>

              <div>
                {/* Meta details (Questions count, time) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BookOpen size={14} />
                    <span>{quiz.questions.length} câu hỏi</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Timer size={14} />
                    <span>{quiz.timeLimitMinutes > 0 ? `${quiz.timeLimitMinutes} phút` : 'Tự do'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Tổng: {quiz.questions.reduce((sum, q) => sum + q.points, 0)} đ</span>
                  </div>
                </div>

                {/* Action Buttons: Exam & Practice Mode */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={() => handleStart(quiz, 'exam')}
                    className="btn btn-primary"
                    style={{ padding: '10px', fontSize: '0.85rem' }}
                  >
                    <Play size={15} />
                    <span>Thi tính giờ</span>
                  </button>

                  <button
                    onClick={() => handleStart(quiz, 'practice')}
                    className="btn btn-secondary"
                    style={{ padding: '10px', fontSize: '0.85rem' }}
                  >
                    <HelpCircle size={15} />
                    <span>Luyện tập</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
