import React, { useState } from 'react';
import { Quiz, SubjectCategory, Difficulty } from '../../types/quiz';
import { UserProfile, TRACK_LABELS, CurriculumTrack } from '../../types/auth';
import { QuizMode } from '../../hooks/useQuizEngine';
import { Search, Timer, HelpCircle, Play, BookOpen, Trash2, Code2, FileSpreadsheet, FileText, Presentation, Cpu } from 'lucide-react';

interface QuizCatalogProps {
  quizzes: Quiz[];
  currentUser?: UserProfile;
  onStartQuiz: (quiz: Quiz, mode: QuizMode) => void;
  onDeleteCustomQuiz?: (quizId: string) => void;
}

const ALL_CATEGORIES: { id: SubjectCategory; label: string; icon: any }[] = [
  { id: 'all', label: 'Tất cả (10 môn)', icon: BookOpen },
  { id: 'office-fast-3in1', label: 'Office Cấp Tốc', icon: FileSpreadsheet },
  { id: 'cc-cntt-basic', label: 'CC CNTT Cơ bản', icon: Cpu },
  { id: 'cc-cntt-advanced', label: 'CC CNTT Nâng cao', icon: Presentation },
  { id: 'cntt-basic-we', label: 'CNTT Cơ bản (W+E)', icon: FileText },
  { id: 'cntt-adv-we', label: 'CNTT Nâng Cao (W+E)', icon: Presentation },
  { id: 'ai-office', label: 'Ứng dụng AI VP', icon: Code2 },
  { id: 'excel-accounting', label: 'Excel Kế toán', icon: FileSpreadsheet },
  { id: 'word-6b', label: 'Word', icon: FileText },
  { id: 'excel-6b', label: 'Excel', icon: FileSpreadsheet },
  { id: 'ppt-6b', label: 'PowerPoint', icon: Presentation }
];

export const QuizCatalog: React.FC<QuizCatalogProps> = ({
  quizzes,
  currentUser,
  onStartQuiz,
  onDeleteCustomQuiz
}) => {
  const isStudent = currentUser?.role === 'student';
  const allowedTracks: CurriculumTrack[] = currentUser?.enrolledTracks ||
    (currentUser?.programTrack ? [currentUser.programTrack] : ['office-fast-3in1']);

  // If student, filter categories and quizzes strictly to their enrolled track
  const visibleCategories = isStudent
    ? ALL_CATEGORIES.filter(c => c.id === 'all' || allowedTracks.includes(c.id as CurriculumTrack))
    : ALL_CATEGORIES;

  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Enforce access control
  const accessibleQuizzes = isStudent
    ? quizzes.filter(q => allowedTracks.includes(q.category as CurriculumTrack))
    : quizzes;

  const filteredQuizzes = accessibleQuizzes.filter(q => {
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
        return <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)' }}>Dễ</span>;
      case 'medium':
        return <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.25)' }}>Vừa</span>;
      case 'hard':
        return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)' }}>Khó</span>;
    }
  };

  const handleStart = (quiz: Quiz, mode: QuizMode) => {
    onStartQuiz(quiz, mode);
  };

  const currentTrackName = currentUser?.programTrack
    ? TRACK_LABELS[currentUser.programTrack]
    : 'Tin Học Văn Phòng MOS (Word, Excel, PowerPoint)';

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '14px 16px' }} className="animate-slide-up">
      {/* Sleek Compact Header */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          background: isStudent
            ? 'linear-gradient(135deg, rgba(79, 110, 247, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)'
            : 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(245, 158, 11, 0.04) 100%)',
          borderRadius: '16px',
          marginBottom: '14px',
          border: isStudent ? '1px solid rgba(79, 110, 247, 0.18)' : '1px solid rgba(217, 119, 6, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {isStudent ? `Luyện Đề: ${currentUser?.name || 'Học viên'}` : 'Kho Đề Khảo Thí'}
            </h2>
            <span style={{
              fontSize: '0.72rem',
              background: 'rgba(79, 110, 247, 0.1)',
              color: 'var(--brand)',
              padding: '2px 10px',
              borderRadius: '999px',
              fontWeight: 700
            }}>
              {currentTrackName}
            </span>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {filteredQuizzes.length} đề thi sẵn sàng • Chọn bài trắc nghiệm bên dưới để bắt đầu
          </p>
        </div>

        {isStudent && currentUser?.studentCode && (
          <span style={{ fontSize: '0.74rem', background: 'var(--bg-primary)', color: 'var(--brand)', padding: '4px 10px', borderRadius: '8px', fontWeight: 700, border: '1px solid var(--border-color)', fontFamily: 'monospace' }}>
            {currentUser.studentCode}
          </span>
        )}
      </div>

      {/* Categories Filter Tabs with Smooth Horizontal Scroll */}
      {(!isStudent || visibleCategories.length > 2) && (
        <div className="horizontal-scroll" style={{ marginBottom: '14px', paddingBottom: '4px' }}>
          {visibleCategories.map(cat => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  background: isActive ? 'var(--bg-card)' : 'transparent',
                  border: isActive ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Search & Difficulty Filter Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Tìm kiếm đề thi theo tên hoặc chủ đề..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: '36px',
              paddingRight: '12px',
              minHeight: '38px',
              fontSize: '0.86rem',
              borderRadius: '10px'
            }}
          />
        </div>

        <select
          value={selectedDifficulty}
          onChange={e => setSelectedDifficulty(e.target.value)}
          style={{
            width: 'auto',
            minWidth: '120px',
            minHeight: '38px',
            fontSize: '0.82rem',
            padding: '8px 28px 8px 10px',
            borderRadius: '10px',
            flexShrink: 0
          }}
        >
          <option value="all">Mọi độ khó</option>
          <option value="easy">Dễ</option>
          <option value="medium">Vừa</option>
          <option value="hard">Khó</option>
        </select>
      </div>

      {/* Quizzes Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>Không tìm thấy đề thi phù hợp với từ khóa.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredQuizzes.map(quiz => (
            <div
              key={quiz.id}
              className="card card-interactive"
              style={{
                padding: '20px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: `4px solid ${quiz.badgeColor || 'var(--accent-primary)'}`
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span
                    className="badge"
                    style={{
                      background: 'rgba(37, 99, 235, 0.08)',
                      color: 'var(--accent-primary)',
                      fontWeight: 700,
                      fontSize: '0.72rem'
                    }}
                  >
                    {TRACK_LABELS[quiz.category as CurriculumTrack] || quiz.category}
                  </span>
                  {getDifficultyBadge(quiz.difficulty)}
                </div>

                <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.4 }}>
                  {quiz.title}
                </h3>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
                  {quiz.description}
                </p>

                <div style={{ display: 'flex', gap: '14px', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <HelpCircle size={14} />
                    <span>{quiz.questions.length} câu</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Timer size={14} />
                    <span>{quiz.timeLimitMinutes} phút</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <button
                  onClick={() => handleStart(quiz, 'practice')}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '8px 10px', fontSize: '0.8rem', justifyContent: 'center', borderRadius: '8px' }}
                >
                  <BookOpen size={14} />
                  <span>Luyện Tập</span>
                </button>

                <button
                  onClick={() => handleStart(quiz, 'exam')}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '8px 10px', fontSize: '0.8rem', justifyContent: 'center', fontWeight: 700, borderRadius: '8px' }}
                >
                  <Play size={14} />
                  <span>Thi Tính Giờ</span>
                </button>

                {quiz.isCustom && onDeleteCustomQuiz && (
                  <button
                    onClick={() => onDeleteCustomQuiz(quiz.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', padding: '6px', cursor: 'pointer' }}
                    title="Xóa đề thi tự tạo này"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
