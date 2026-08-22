import React, { useState, useEffect } from 'react';
import { UserProfile, CurriculumTrack, TRACK_LABELS } from '../../types/auth';
import { MasteryService } from '../../services/masteryService';
import { SmartReviewService } from '../../services/smartReviewService';
import { ClassScheduleItem } from '../../types/schedule';
import {
  Play, BookOpen, RotateCcw, Award, CheckCircle2,
  Calendar, Layers, BookmarkCheck, ArrowRight, Bot, Send, Check
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface StudentOnePageDashboardProps {
  currentUser: UserProfile;
  streak: number;
  schedules?: ClassScheduleItem[];
  onContinueLearning: () => void;
  onStartSmartReview: () => void;
  onStartMiniTest: () => void;
  onOpenLearningPath: () => void;
  onOpenFlashcards: () => void;
  onOpenBookmarks: () => void;
  onOpenAssignments: () => void;
  onOpenAITutor: (prompt?: string) => void;
  onActiveSectionChange?: (sectionId: string) => void;
}

export const StudentOnePageDashboard: React.FC<StudentOnePageDashboardProps> = ({
  currentUser,
  streak,
  schedules = [],
  onContinueLearning,
  onStartSmartReview,
  onStartMiniTest,
  onOpenLearningPath,
  onOpenFlashcards,
  onOpenBookmarks,
  onOpenAssignments,
  onOpenAITutor,
  onActiveSectionChange
}) => {
  const track: CurriculumTrack = currentUser.programTrack || 'office-fast-3in1';
  const trackName = TRACK_LABELS[track] || 'Office Cấp Tốc (3b)';

  const [masteryScore, setMasteryScore] = useState(72);
  const [dueReviewCount, setDueReviewCount] = useState(5);
  const [activeSection, setActiveSection] = useState<'learn' | 'review' | 'exam' | 'progress'>('learn');
  const [aiInputText, setAiInputText] = useState('');

  // Find today's schedule if any
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySchedule = schedules.find(s => s.date === todayStr && s.track === track);

  useEffect(() => {
    const score = MasteryService.getOverallMastery(currentUser.id, track);
    setMasteryScore(score || 72);

    const dueReviews = SmartReviewService.getDueReviews(currentUser.id);
    setDueReviewCount(dueReviews.length > 0 ? dueReviews.length : 5);
  }, [currentUser.id, track]);

  // Scroll Spy via IntersectionObserver
  useEffect(() => {
    const sectionIds = ['section-learn', 'section-review', 'section-exam', 'section-progress'];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const secKey = id.replace('section-', '') as any;
              setActiveSection(secKey);
              if (onActiveSectionChange) onActiveSectionChange(secKey);
            }
          });
        },
        { threshold: 0.35, rootMargin: '-64px 0px -40% 0px' }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, [onActiveSectionChange]);

  // Contextual AI Placeholder
  const getAiPlaceholder = () => {
    switch (activeSection) {
      case 'learn':
        return 'Hỏi AI về bài Hàm XLOOKUP này...';
      case 'review':
        return 'Bạn chưa hiểu câu nào? Hỏi AI giải thích...';
      case 'exam':
        return 'Cần gợi ý phương pháp giải cho bài thi này?';
      case 'progress':
        return 'Hỏi AI cách cải thiện kỹ năng còn yếu...';
      default:
        return 'Hỏi TinHocGenZ AI về nội dung đang học...';
    }
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInputText.trim()) {
      onOpenAITutor(getAiPlaceholder().replace('Hỏi AI về ', '').replace('Hỏi TinHocGenZ AI về ', ''));
    } else {
      onOpenAITutor(aiInputText);
      setAiInputText('');
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', width: '100%', padding: '24px 20px 100px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* ── 1. ABOVE THE FOLD (CLEAN, MINIMAL, NO BIG HERO CARDS) ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Contextual schedule alert (ONLY if class is today) */}
        {todaySchedule && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              color: 'var(--warning)',
              fontSize: '13px',
              fontWeight: 600,
              width: 'fit-content'
            }}
          >
            <Calendar size={14} />
            <span>Hôm nay: {todaySchedule.startTime} • {todaySchedule.title}</span>
            {todaySchedule.onlineMeetingUrl && (
              <a
                href={todaySchedule.onlineMeetingUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--brand)', textDecoration: 'underline', marginLeft: '4px', fontWeight: 600 }}
              >
                Vào Meet
              </a>
            )}
          </div>
        )}

        {/* Greeting + Course + Streak */}
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Chào {currentUser.name || 'Học Viên'} 👋</span>
            {streak > 0 && <span style={{ color: 'var(--warning)', fontWeight: 600 }}>• 🔥 {streak} ngày liên tục</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {trackName}
            </h1>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brand)' }}>
              {masteryScore}% hoàn thành
            </span>
          </div>

          {/* Slim Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '6px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--border-muted)',
              marginTop: '8px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${masteryScore}%`,
                height: '100%',
                background: 'var(--brand)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.6s ease'
              }}
            />
          </div>
        </div>

        {/* Immediate Next Step Card */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 1px 3px rgba(16,24,40,.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
              BÀI TIẾP THEO
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              Hàm XLOOKUP & Ứng dụng thực tế
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              ⏱️ 12 phút • Nắm cú pháp tra cứu và tránh 3 lỗi dữ liệu phổ biến.
            </div>
          </div>

          {/* Single Dominant CTA Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              onContinueLearning();
            }}
            className="btn btn-primary"
            style={{
              padding: '10px 22px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              gap: '8px',
              boxShadow: 'var(--shadow-brand)',
              flexShrink: 0
            }}
          >
            <Play size={15} fill="#fff" />
            <span>TIẾP TỤC HỌC</span>
          </button>
        </div>
      </section>

      <div style={{ height: '1px', background: 'var(--border-color)' }} />

      {/* ── 2. SECTION 1: HỌC (SCROLL SPY TARGET) ── */}
      <section id="section-learn" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          ● 01. HỌC TẬP TRỌNG TÂM
        </div>

        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--brand-light)',
                color: 'var(--brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <BookOpen size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Hàm XLOOKUP & Ứng dụng thực tế
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Học lý thuyết, xem video trực quan và làm bài tập mẫu.
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onContinueLearning();
            }}
            className="btn btn-secondary"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              flexShrink: 0
            }}
          >
            <span>Tiếp tục</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* ── 3. SECTION 2: ÔN LUYỆN (SPACED REPETITION) ── */}
      <section id="section-review" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          ● 02. ÔN LUYỆN THÔNG MINH
        </div>

        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--warning-bg)',
                  color: 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <RotateCcw size={18} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {dueReviewCount} kiến thức bạn nên ôn hôm nay (5 phút)
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Thuật toán Spaced Repetition nhắc đúng thời điểm não bộ sắp quên.
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                onStartSmartReview();
              }}
              className="btn btn-primary"
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--warning)',
                borderColor: 'var(--warning)',
                color: '#fff',
                flexShrink: 0
              }}
            >
              <span>Ôn câu sai ngay</span>
            </button>
          </div>

          {/* Sub-tools (Clean inline links) */}
          <div
            style={{
              paddingTop: '10px',
              borderTop: '1px solid var(--border-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '13px'
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Tiện ích ôn tập:</span>
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenFlashcards();
              }}
              style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Layers size={14} />
              <span>Thẻ ghi nhớ (Flashcards)</span>
            </button>
            <span style={{ color: 'var(--border-color)' }}>•</span>
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenBookmarks();
              }}
              style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <BookmarkCheck size={14} />
              <span>Câu đã lưu</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 4. SECTION 3: THI & KIỂM TRA (ASSESSMENT) ── */}
      <section id="section-exam" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          ● 03. KHẢO THÍ & THỰC HÀNH
        </div>

        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--success-bg)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Mini Test 10 câu (8 phút)
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Kiểm tra kiến thức vừa học & cập nhật điểm Mastery.
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                onStartMiniTest();
              }}
              className="btn btn-primary"
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--success)',
                borderColor: 'var(--success)',
                color: '#fff',
                flexShrink: 0
              }}
            >
              <span>Bắt đầu Mini Test</span>
            </button>
          </div>

          {/* Sub-actions */}
          <div
            style={{
              paddingTop: '10px',
              borderTop: '1px solid var(--border-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '13px'
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Đề thi & Bài nộp:</span>
            <button
              onClick={() => {
                soundFx.playClick();
                onContinueLearning();
              }}
              style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Award size={14} />
              <span>Đề thi MOS thực chiến</span>
            </button>
            <span style={{ color: 'var(--border-color)' }}>•</span>
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenAssignments();
              }}
              style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Check size={14} />
              <span>Nộp bài thực hành</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 5. SECTION 4: TIẾN ĐỘ & NĂNG LỰC (PROGRESS) ── */}
      <section id="section-progress" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          ● 04. TIẾN ĐỘ & NĂNG LỰC
        </div>

        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Mức độ thành thạo kỹ năng nguyên tử
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand)' }}>
              Mastery: {masteryScore}%
            </span>
          </div>

          {/* Atomic skill bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SkillProgressBar label="Kiến thức nền tảng & Phím tắt" percent={100} color="#10b981" />
            <SkillProgressBar label="Công thức & Hàm tính toán" percent={82} color="#4f6ef7" />
            <SkillProgressBar label="Tra cứu dữ liệu XLOOKUP / VLOOKUP" percent={54} color="#f59e0b" />
            <SkillProgressBar label="Phân tích báo cáo PivotTable" percent={31} color="#8b5cf6" />
          </div>

          <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-muted)', textAlign: 'right' }}>
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenLearningPath();
              }}
              style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', padding: 0 }}
            >
              Xem toàn bộ Cây Lộ Trình →
            </button>
          </div>
        </div>
      </section>

      {/* ── 6. STICKY CONTEXTUAL AI INPUT (BOTTOM VIEWPORT, CLEAN & REFINED) ── */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '720px',
          zIndex: 80
        }}
      >
        <form
          onSubmit={handleAiSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 8px 6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
          }}
        >
          <Bot size={18} color="var(--purple-ai)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={aiInputText}
            onChange={(e) => setAiInputText(e.target.value)}
            placeholder={getAiPlaceholder()}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '13.5px',
              color: 'var(--text-primary)',
              outline: 'none',
              padding: '4px 0',
              fontWeight: 500
            }}
          />
          <button
            type="submit"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--purple-ai)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            title="Gửi câu hỏi cho AI Tutor"
          >
            <Send size={13} style={{ marginLeft: '1px' }} />
          </button>
        </form>
      </div>

    </div>
  );
};

const SkillProgressBar: React.FC<{ label: string; percent: number; color: string }> = ({ label, percent, color }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '3px' }}>
      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 600, color }}>{percent}%</span>
    </div>
    <div style={{ width: '100%', height: '5px', borderRadius: 'var(--radius-full)', background: 'var(--border-muted)', overflow: 'hidden' }}>
      <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: 'var(--radius-full)' }} />
    </div>
  </div>
);
