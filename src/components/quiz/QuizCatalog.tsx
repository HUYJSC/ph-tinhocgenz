import React, { useState } from 'react';
import { Quiz, SubjectCategory, Difficulty } from '../../types/quiz';
import { UserProfile, TRACK_LABELS, CurriculumTrack } from '../../types/auth';
import { QuizMode } from '../../hooks/useQuizEngine';
import {
  Search, Timer, HelpCircle, Play, BookOpen, Trash2,
  Code2, FileSpreadsheet, FileText, Presentation, Cpu,
  ChevronDown, ChevronUp, SlidersHorizontal, CheckCircle2, RotateCcw,
  Eye, BookOpenCheck, Printer, Check, X
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface QuizCatalogProps {
  quizzes: Quiz[];
  currentUser?: UserProfile;
  onStartQuiz: (quiz: Quiz, mode: QuizMode) => void;
  onDeleteCustomQuiz?: (quizId: string) => void;
}

export type SubjectFamily = 'all' | 'word' | 'excel' | 'powerpoint' | 'ai_cntt';

export const SUBJECT_FAMILY_TABS: {
  id: SubjectFamily;
  label: string;
  shortLabel: string;
  badgeColor: string;
  iconBg: string;
  tracks: CurriculumTrack[];
}[] = [
  {
    id: 'all',
    label: 'Tất Cả Phân Hệ (10 Khóa)',
    shortLabel: '🌟 Tất Cả (10)',
    badgeColor: 'var(--brand)',
    iconBg: 'rgba(79, 110, 247, 0.12)',
    tracks: []
  },
  {
    id: 'word',
    label: 'Microsoft Word (Soạn Thảo Chuẩn)',
    shortLabel: '📘 Word',
    badgeColor: '#2563eb',
    iconBg: 'rgba(37, 99, 235, 0.12)',
    tracks: ['word-6b', 'cntt-basic-we', 'cntt-adv-we', 'office-fast-3in1']
  },
  {
    id: 'excel',
    label: 'Microsoft Excel (Bảng Tính & Kế Toán)',
    shortLabel: '📗 Excel',
    badgeColor: '#10b981',
    iconBg: 'rgba(16, 185, 129, 0.12)',
    tracks: ['excel-6b', 'excel-accounting', 'cntt-basic-we', 'cntt-adv-we', 'office-fast-3in1']
  },
  {
    id: 'powerpoint',
    label: 'PowerPoint (Thiết Kế Thuyết Trình)',
    shortLabel: '📙 PowerPoint',
    badgeColor: '#f97316',
    iconBg: 'rgba(249, 115, 22, 0.12)',
    tracks: ['ppt-6b', 'office-fast-3in1', 'cc-cntt-basic']
  },
  {
    id: 'ai_cntt',
    label: 'AI Văn Phòng & CC CNTT',
    shortLabel: '🤖 AI & CNTT',
    badgeColor: '#8b5cf6',
    iconBg: 'rgba(139, 92, 246, 0.12)',
    tracks: ['ai-office', 'cc-cntt-basic', 'cc-cntt-advanced']
  }
];

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

  const [selectedFamily, setSelectedFamily] = useState<SubjectFamily>('all');
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'time_asc' | 'time_desc' | 'questions_desc' | 'name_asc'>('default');
  const [isFilterBoxOpen, setIsFilterBoxOpen] = useState(false);
  const [readingQuiz, setReadingQuiz] = useState<Quiz | null>(null);

  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  // Enforce access control
  const accessibleQuizzes = isStudent
    ? quizzes.filter(q => allowedTracks.includes(q.category as CurriculumTrack))
    : quizzes;

  const filteredQuizzes = accessibleQuizzes
    .filter(q => {
      // 1. Family filter (Word / Excel / PPT / AI & CNTT)
      if (selectedFamily !== 'all') {
        const familyMeta = SUBJECT_FAMILY_TABS.find(f => f.id === selectedFamily);
        if (familyMeta && familyMeta.tracks.length > 0) {
          const inFamilyTracks = familyMeta.tracks.includes(q.category as CurriculumTrack);
          const inFamilyText =
            (selectedFamily === 'word' && (q.title.toLowerCase().includes('word') || q.category.includes('word') || q.category === 'cntt-basic-we' || q.category === 'cntt-adv-we' || q.category === 'office-fast-3in1')) ||
            (selectedFamily === 'excel' && (q.title.toLowerCase().includes('excel') || q.category.includes('excel') || q.category === 'cntt-basic-we' || q.category === 'cntt-adv-we' || q.category === 'office-fast-3in1')) ||
            (selectedFamily === 'powerpoint' && (q.title.toLowerCase().includes('powerpoint') || q.title.toLowerCase().includes('ppt') || q.category.includes('ppt') || q.category === 'office-fast-3in1')) ||
            (selectedFamily === 'ai_cntt' && (q.category === 'ai-office' || q.category === 'cc-cntt-basic' || q.category === 'cc-cntt-advanced' || q.title.toLowerCase().includes('ai') || q.title.toLowerCase().includes('cntt')));
          if (!inFamilyTracks && !inFamilyText) return false;
        }
      }

      // 2. Specific category filter
      const matchCat = selectedCategory === 'all' || q.category === selectedCategory;

      // 3. Difficulty filter
      const matchDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;

      // 4. Search query filter
      const matchSearch =
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchDiff && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'time_asc') return a.timeLimitMinutes - b.timeLimitMinutes;
      if (sortBy === 'time_desc') return b.timeLimitMinutes - a.timeLimitMinutes;
      if (sortBy === 'questions_desc') return b.questions.length - a.questions.length;
      if (sortBy === 'name_asc') return a.title.localeCompare(b.title);
      return 0;
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

        {/* ── 1. FAST APP-FAMILY PILL TASKBAR (Word / Excel / PPT / AI & CNTT / All) ── */}
        <div className="horizontal-scroll" style={{ padding: '10px 14px 8px', display: 'flex', gap: '8px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
          {SUBJECT_FAMILY_TABS.map(tab => {
            const isSelected = selectedFamily === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedFamily(tab.id);
                  if (tab.id !== 'all') {
                    setSelectedCategory('all');
                  }
                  soundFx.playClick();
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: isSelected ? `2px solid ${tab.badgeColor}` : '1px solid var(--border-color)',
                  background: isSelected ? tab.iconBg : 'var(--bg-primary)',
                  color: isSelected ? tab.badgeColor : 'var(--text-secondary)',
                  fontWeight: isSelected ? 850 : 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* ── 2. SEARCH, DIFFICULTY & SORT 1-ROW TOOLBAR ── */}
        <div style={{ padding: '10px 14px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Tìm nhanh đề thi, kỹ năng, hàm Excel, thao tác Word..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '34px',
                paddingRight: '12px',
                minHeight: '36px',
                fontSize: '0.84rem',
                borderRadius: '10px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                width: '100%'
              }}
            />
          </div>

          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            style={{
              width: 'auto',
              minWidth: '110px',
              minHeight: '36px',
              fontSize: '0.8rem',
              padding: '6px 24px 6px 10px',
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

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            style={{
              width: 'auto',
              minWidth: '135px',
              minHeight: '36px',
              fontSize: '0.8rem',
              padding: '6px 24px 6px 10px',
              borderRadius: '10px',
              flexShrink: 0,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)'
            }}
          >
            <option value="default">Sắp xếp: Mặc định</option>
            <option value="time_asc">Thời gian: Ngắn ➔ Dài</option>
            <option value="time_desc">Thời gian: Dài ➔ Ngắn</option>
            <option value="questions_desc">Số câu: Nhiều ➔ Ít</option>
            <option value="name_asc">Tên đề: A ➔ Z</option>
          </select>

          {(searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedFamily !== 'all' || sortBy !== 'default') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSelectedFamily('all');
                setSortBy('default');
              }}
              title="Đặt lại toàn bộ bộ lọc"
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
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', flexWrap: 'wrap' }}>
                {isTeacherOrAdmin && (
                  <button
                    onClick={() => {
                      setReadingQuiz(quiz);
                      soundFx.playClick();
                    }}
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      background: 'rgba(217, 119, 6, 0.1)',
                      color: '#d97706',
                      border: '1.5px solid rgba(217, 119, 6, 0.25)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      marginBottom: '4px'
                    }}
                    title="Đọc toàn bộ câu hỏi, đáp án đúng và giải thích chi tiết của đề thi này"
                  >
                    <Eye size={14} />
                    <span>Đọc Đề & Xem Đáp Án Chuẩn 📖</span>
                  </button>
                )}

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

      {/* ── MODAL: ĐỌC ĐỀ THI & XEM ĐÁP ÁN DÀNH CHO GIẢNG VIÊN ── */}
      {readingQuiz && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          className="animate-fade-in"
        >
          <div
            className="card animate-slide-up"
            style={{
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '20px',
              padding: '24px',
              background: 'var(--bg-card)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--border-color)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '14px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '999px', background: 'rgba(217, 119, 6, 0.12)', color: '#d97706', fontSize: '0.74rem', fontWeight: 800, marginBottom: '6px' }}>
                  <BookOpenCheck size={14} />
                  <span>CHẾ ĐỘ ĐỌC ĐỀ THI & ĐÁP ÁN DÀNH CHO GIẢNG VIÊN</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                  {readingQuiz.title}
                </h3>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span>📚 Phân hệ: <strong>{TRACK_LABELS[readingQuiz.category as CurriculumTrack] || readingQuiz.category}</strong></span>
                  <span>•</span>
                  <span>⏱️ Thời gian: <strong>{readingQuiz.timeLimitMinutes} phút</strong></span>
                  <span>•</span>
                  <span>📝 Tổng số: <strong>{readingQuiz.questions.length} câu hỏi</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => window.print()}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.76rem', gap: '4px' }}
                  title="In hoặc xuất PDF đề thi"
                >
                  <Printer size={14} />
                  <span>In Đề</span>
                </button>

                <button
                  onClick={() => setReadingQuiz(null)}
                  className="btn btn-icon"
                  style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {readingQuiz.questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {/* Question Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--brand)', background: 'var(--brand-light)', padding: '2px 10px', borderRadius: '6px' }}>
                      Câu {idx + 1}/{readingQuiz.questions.length}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {q.points || 10} điểm
                    </span>
                  </div>

                  {/* Question Prompt */}
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {q.prompt}
                  </div>

                  {/* Options */}
                  {q.options && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                      {q.options.map((opt, oidx) => {
                        const isCorrect = Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(oidx) : q.correctAnswer === oidx;
                        return (
                          <div
                            key={oidx}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '10px',
                              background: isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
                              border: isCorrect ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                              color: isCorrect ? '#065f46' : 'var(--text-primary)',
                              fontWeight: isCorrect ? 800 : 500,
                              fontSize: '0.84rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '6px'
                            }}
                          >
                            <span><strong>{String.fromCharCode(65 + oidx)}.</strong> {opt}</span>
                            {isCorrect && (
                              <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.74rem', fontWeight: 900 }}>
                                <Check size={14} />
                                <span>ĐÁP ÁN ĐÚNG</span>
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation Box */}
                  {q.explanation && (
                    <div
                      style={{
                        marginTop: '4px',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'rgba(79, 110, 247, 0.08)',
                        borderLeft: '4px solid var(--brand)',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5
                      }}
                    >
                      <strong style={{ color: 'var(--brand)' }}>💡 Giải thích & Hướng dẫn thao tác chuẩn:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '14px', borderTop: '1px solid var(--border-color)', marginTop: '10px' }}>
              <button
                onClick={() => setReadingQuiz(null)}
                className="btn btn-primary"
                style={{ padding: '8px 24px', fontWeight: 800, borderRadius: '10px' }}
              >
                Đóng Đề Thi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
