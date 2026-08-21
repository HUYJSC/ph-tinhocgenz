import React, { useState } from 'react';
import { Quiz, SubjectCategory, Difficulty } from '../../types/quiz';
import { UserProfile, TRACK_LABELS, CurriculumTrack } from '../../types/auth';
import { QuizMode } from '../../hooks/useQuizEngine';
import {
  Search, Timer, HelpCircle, Play, BookOpen, Trash2,
  Code2, FileSpreadsheet, FileText, Presentation, Cpu,
  ChevronDown, ChevronUp, SlidersHorizontal, CheckCircle2, RotateCcw
} from 'lucide-react';

interface QuizCatalogProps {
  quizzes: Quiz[];
  currentUser?: UserProfile;
  onStartQuiz: (quiz: Quiz, mode: QuizMode) => void;
  onDeleteCustomQuiz?: (quizId: string) => void;
}

const ALL_CATEGORIES: { id: SubjectCategory; label: string; icon: any }[] = [
  { id: 'all', label: 'Tất cả (10 phân hệ)', icon: BookOpen },
  { id: 'office-fast-3in1', label: 'Office Cấp Tốc (3b)', icon: FileSpreadsheet },
  { id: 'cc-cntt-basic', label: 'CC CNTT Cơ bản (6b)', icon: Cpu },
  { id: 'cc-cntt-advanced', label: 'CC CNTT Nâng cao (6b)', icon: Presentation },
  { id: 'cntt-basic-we', label: 'CNTT Cơ bản (W+E)', icon: FileText },
  { id: 'cntt-adv-we', label: 'CNTT Nâng Cao (W+E)', icon: Presentation },
  { id: 'ai-office', label: 'Ứng dụng AI Văn Phòng', icon: Code2 },
  { id: 'excel-accounting', label: 'Excel Kế toán', icon: FileSpreadsheet },
  { id: 'word-6b', label: 'MOS Word (6b)', icon: FileText },
  { id: 'excel-6b', label: 'MOS Excel (6b)', icon: FileSpreadsheet },
  { id: 'ppt-6b', label: 'PowerPoint (6b)', icon: Presentation }
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
  const [isFilterBoxOpen, setIsFilterBoxOpen] = useState(false);

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

  const currentCategoryLabel = ALL_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Tất cả';

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '14px 16px' }} className="animate-slide-up">
      
      {/* ── UNIFIED SLEEK COLLAPSIBLE FILTER BOX ── */}
      <div
        className="card"
        style={{
          borderRadius: '16px',
          marginBottom: '16px',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Box Top Header Bar */}
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            background: isStudent ? 'rgba(79, 110, 247, 0.04)' : 'rgba(217, 119, 6, 0.04)',
            borderBottom: isFilterBoxOpen ? '1px solid var(--border-color)' : 'none'
          }}
        >
          {/* Title & Subject Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {isStudent ? `Khảo Thí: ${currentUser?.name || 'Học viên'}` : 'Kho Đề Khảo Thí & Luyện Thi'}
            </h2>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--brand)',
              background: 'var(--brand-light)',
              padding: '2px 10px',
              borderRadius: '999px',
              border: '1px solid rgba(79, 110, 247, 0.2)'
            }}>
              {currentCategoryLabel}
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              • {filteredQuizzes.length} đề thi
            </span>
          </div>

          {/* Toggle Collapsible Box Button */}
          <button
            onClick={() => setIsFilterBoxOpen(!isFilterBoxOpen)}
            className="btn btn-secondary"
            style={{
              padding: '6px 12px',
              height: '32px',
              minHeight: '32px',
              borderRadius: '999px',
              fontSize: '0.76rem',
              fontWeight: 700,
              gap: '6px',
              background: isFilterBoxOpen ? 'var(--brand-light)' : 'var(--bg-secondary)',
              color: isFilterBoxOpen ? 'var(--brand)' : 'var(--text-secondary)',
              border: isFilterBoxOpen ? '1px solid var(--brand)' : '1px solid var(--border-color)'
            }}
          >
            <SlidersHorizontal size={13} />
            <span>{isFilterBoxOpen ? 'Thu Gọn Bộ Lọc' : 'Mở Rộng Phân Hệ'}</span>
            {isFilterBoxOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Search & Difficulty 1-Row Toolbar */}
        <div style={{ padding: '10px 14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Tìm kiếm nhanh tên đề thi hoặc kỹ năng..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '34px',
                paddingRight: '12px',
                minHeight: '36px',
                fontSize: '0.84rem',
                borderRadius: '10px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)'
              }}
            />
          </div>

          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            style={{
              width: 'auto',
              minWidth: '115px',
              minHeight: '36px',
              fontSize: '0.8rem',
              padding: '6px 26px 6px 10px',
              borderRadius: '10px',
              flexShrink: 0,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)'
            }}
          >
            <option value="all">Mọi độ khó</option>
            <option value="easy">Dễ</option>
            <option value="medium">Vừa</option>
            <option value="hard">Khó</option>
          </select>

          {(searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}
              title="Đặt lại bộ lọc"
              className="btn btn-icon"
              style={{ width: '36px', height: '36px', minHeight: '36px', borderRadius: '10px', color: 'var(--text-muted)' }}
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>

        {/* Collapsible Category Drawer (Smooth Accordion Expand/Collapse) */}
        {isFilterBoxOpen && (
          <div
            className="animate-slide-up"
            style={{
              padding: '12px 14px 14px',
              background: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-color)'
            }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Chọn Phân Hệ Đào Tạo Cần Luyện Tập:
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
              {visibleCategories.map(cat => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      background: isActive ? 'var(--bg-card)' : 'var(--bg-primary)',
                      border: isActive ? '1.5px solid var(--brand)' : '1px solid var(--border-color)',
                      color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
                      fontWeight: isActive ? 800 : 500,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: isActive ? '0 2px 8px rgba(79, 110, 247, 0.12)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={14} color={isActive ? 'var(--brand)' : 'var(--text-muted)'} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat.label}
                    </span>
                    {isActive && <CheckCircle2 size={13} color="var(--brand)" style={{ flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Quizzes Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '16px' }}>
          <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>Không tìm thấy đề thi phù hợp với từ khóa tìm kiếm.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedDifficulty('all');
            }}
            className="btn btn-secondary"
            style={{ marginTop: '8px', fontSize: '0.78rem', borderRadius: '8px' }}
          >
            Hiển thị lại tất cả đề thi
          </button>
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
