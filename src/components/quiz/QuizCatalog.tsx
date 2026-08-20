import React, { useState } from 'react';
import { Quiz, SubjectCategory, Difficulty } from '../../types/quiz';
import { UserProfile, TRACK_LABELS, CurriculumTrack } from '../../types/auth';
import { QuizMode } from '../../hooks/useQuizEngine';
import { Search, Timer, HelpCircle, Play, BookOpen, Trash2, Code2, FileSpreadsheet, FileText, Presentation, Cpu, Network, ShieldCheck } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface QuizCatalogProps {
  quizzes: Quiz[];
  currentUser?: UserProfile;
  onStartQuiz: (quiz: Quiz, mode: QuizMode) => void;
  onDeleteCustomQuiz?: (quizId: string) => void;
}

const ALL_CATEGORIES: { id: SubjectCategory; label: string; icon: any }[] = [
  { id: 'all', label: 'Tất cả phân hệ', icon: BookOpen },
  { id: 'cntt-basic', label: '1. CNTT Cơ Bản', icon: Cpu },
  { id: 'mos-office', label: '2. MOS Quốc Tế', icon: FileSpreadsheet },
  { id: 'ic3-gs', label: '3. IC3 GS6', icon: FileText },
  { id: 'cntt-advanced', label: '4. CNTT Nâng Cao', icon: Presentation },
  { id: 'programming', label: '5. Lập Trình Python', icon: Code2 },
  { id: 'cyber-security', label: '6. Mạng & Bảo Mật', icon: Network }
];

export const QuizCatalog: React.FC<QuizCatalogProps> = ({
  quizzes,
  currentUser,
  onStartQuiz,
  onDeleteCustomQuiz
}) => {
  const isStudent = currentUser?.role === 'student';
  const allowedTracks: CurriculumTrack[] = currentUser?.enrolledTracks ||
    (currentUser?.programTrack ? [currentUser.programTrack] : ['mos-office']);

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

  const currentTrackName = currentUser?.programTrack
    ? TRACK_LABELS[currentUser.programTrack]
    : 'Tin Học Văn Phòng MOS (Word, Excel, PowerPoint)';

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '16px' }} className="animate-slide-up">
      {/* Hero Welcome Banner with Enforced Course Track Badge */}
      <div
        className="card"
        style={{
          padding: '26px',
          background: isStudent
            ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(245, 158, 11, 0.03) 100%)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
          border: isStudent ? '1.5px solid rgba(37, 99, 235, 0.25)' : '1.5px solid rgba(217, 119, 6, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: isStudent ? '#2563eb' : '#d97706', textTransform: 'uppercase', marginBottom: '4px' }}>
            <ShieldCheck size={16} />
            <span>
              {isStudent
                ? `Chương Trình Cấp Quyền Riêng: ${currentTrackName}`
                : 'Cổng Giảng Viên • Toàn Bộ 6 Phân Hệ Đào Tạo'}
            </span>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {isStudent
              ? `Kho Trắc Nghiệm Dành Riêng Cho Bạn (${currentUser?.name})`
              : 'Ngân Hàng Trắc Nghiệm Tin Học 6 Phân Hệ'}
          </h2>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '780px', lineHeight: 1.5 }}>
            {isStudent
              ? `Hệ thống đã tự động khóa và chỉ hiển thị các đề thi thuộc môn học "${currentTrackName}" theo phân công của giáo viên. Các môn học khác đã được ẩn để bạn tập trung cao nhất.`
              : 'Nền tảng kiểm tra đánh giá kiến thức tin học chuẩn hóa theo từng phân hệ đào tạo.'}
          </p>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', overflowX: 'auto', paddingBottom: '4px' }}>
        {visibleCategories.map(cat => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
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
                gap: '8px',
                padding: '9px 16px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--bg-secondary)' : 'var(--bg-card)',
                border: isActive ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.18s ease'
              }}
            >
              <Icon size={16} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Difficulty Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '22px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Tìm kiếm đề thi trắc nghiệm theo tên hoặc nội dung..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
        </div>

        <select
          value={selectedDifficulty}
          onChange={e => setSelectedDifficulty(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.88rem',
            outline: 'none'
          }}
        >
          <option value="all">Tất cả mức độ</option>
          <option value="easy">Mức độ Dễ</option>
          <option value="medium">Mức độ Vừa</option>
          <option value="hard">Mức độ Khó</option>
        </select>
      </div>

      {/* Quizzes Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>Không tìm thấy đề thi phù hợp với bộ lọc.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
          {filteredQuizzes.map(quiz => (
            <div
              key={quiz.id}
              className="card card-interactive"
              style={{
                padding: '22px',
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
                      background: 'rgba(37, 99, 235, 0.1)',
                      color: 'var(--accent-primary)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: '0.72rem'
                    }}
                  >
                    {quiz.category}
                  </span>
                  {getDifficultyBadge(quiz.difficulty)}
                </div>

                <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.4 }}>
                  {quiz.title}
                </h3>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                  {quiz.description}
                </p>

                <div style={{ display: 'flex', gap: '14px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <HelpCircle size={14} />
                    <span>{quiz.questions.length} câu hỏi</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Timer size={14} />
                    <span>{quiz.timeLimitMinutes} phút</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <button
                  onClick={() => handleStart(quiz, 'practice')}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '9px 12px', fontSize: '0.82rem', justifyContent: 'center' }}
                >
                  <BookOpen size={14} />
                  <span>Luyện Tập</span>
                </button>

                <button
                  onClick={() => handleStart(quiz, 'exam')}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '9px 12px', fontSize: '0.82rem', justifyContent: 'center', fontWeight: 700 }}
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
