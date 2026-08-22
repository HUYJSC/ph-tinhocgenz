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
  const trackName = TRACK_LABELS[track] || 'Tin học Văn phòng Cấp tốc';

  const [masteryScore, setMasteryScore] = useState(72);
  const [dueReviewCount, setDueReviewCount] = useState(5);
  const [activeSection, setActiveSection] = useState<'learn' | 'review' | 'exam' | 'progress'>('learn');
  const [aiInputText, setAiInputText] = useState('');

  // Lịch học hôm nay
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySchedule = schedules.find(s => s.date === todayStr && s.track === track);

  useEffect(() => {
    const score = MasteryService.getOverallMastery(currentUser.id, track);
    setMasteryScore(score || 72);

    const dueReviews = SmartReviewService.getDueReviews(currentUser.id);
    setDueReviewCount(dueReviews.length > 0 ? dueReviews.length : 5);
  }, [currentUser.id, track]);

  // Scroll Spy theo dõi phân mục đang hiển thị
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

  const getAiPlaceholder = () => {
    switch (activeSection) {
      case 'learn':
        return 'Đặt câu hỏi về cú pháp hàm XLOOKUP hoặc bài học...';
      case 'review':
        return 'Yêu cầu AI giải thích câu trắc nghiệm làm sai...';
      case 'exam':
        return 'Hỏi phương pháp giải và cấu trúc đề thi thực hành...';
      case 'progress':
        return 'Hỏi gợi ý cải thiện các kỹ năng chưa đạt chuẩn...';
      default:
        return 'Đặt câu hỏi học vụ cho Trợ lý Trực tuyến AI...';
    }
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInputText.trim()) {
      onOpenAITutor(getAiPlaceholder().replace('Đặt câu hỏi về ', '').replace('Yêu cầu AI ', ''));
    } else {
      onOpenAITutor(aiInputText);
      setAiInputText('');
    }
  };

  return (
    <div
      style={{
        maxWidth: '1180px',
        margin: '0 auto',
        width: '100%',
        padding: '24px 20px 80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        fontFamily: "'Times New Roman', Times, serif"
      }}
    >
      {/* ── 1. HEADER TIẾN ĐỘ & THỜI KHÓA BIỂU HÔM NAY ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
              color: '#D97706',
              fontSize: '13px',
              fontWeight: 600,
              width: 'fit-content'
            }}
          >
            <Calendar size={14} />
            <span>Lịch học hôm nay: {todaySchedule.startTime} • {todaySchedule.title}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Chào bạn, {currentUser.name || 'Học viên'}</span>
              {streak > 0 && <span style={{ color: '#D97706', fontWeight: 600 }}>• 🔥 {streak} ngày học liên tục</span>}
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '3px 0 0' }}>
              {trackName}
            </h1>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#2563EB' }}>
              Tiến độ hoàn thành: {masteryScore}%
            </span>
          </div>
        </div>

        {/* Thanh tiến độ học tập */}
        <div
          style={{
            width: '100%',
            height: '6px',
            borderRadius: 'var(--radius-full)',
            background: '#E2E8F0',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${masteryScore}%`,
              height: '100%',
              background: '#2563EB',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.6s ease'
            }}
          />
        </div>
      </section>

      {/* ── 2. BỐ CỤC 2 CỘT CHUẨN CỔNG HỌC VỤ (66% TRỌNG TÂM / 34% ÔN TẬP & NĂNG LỰC) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '20px', alignItems: 'start' }}>
        
        {/* ── CỘT TRÁI (66%): HỌC TẬP & KHẢO THÍ CHÍNH ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Khối 1: Thao tác học tập chính (Bài học kế tiếp) */}
          <div
            style={{
              padding: '18px 22px',
              borderRadius: '8px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                BÀI HỌC KẾ TIẾP
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                Chuyên đề: Tra cứu dữ liệu nâng cao với hàm XLOOKUP
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '3px' }}>
                Thời lượng 12 phút • Nắm vững cú pháp chuẩn và phương pháp xử lý lỗi thực tế.
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                onContinueLearning();
              }}
              style={{
                padding: '10px 22px',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '6px',
                background: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0,
                boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)'
              }}
            >
              <Play size={15} fill="#fff" />
              <span>Tiếp tục học ngay</span>
            </button>
          </div>

          {/* Khối 2: Giáo trình & Danh mục bài học */}
          <section id="section-learn" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              01. GIÁO TRÌNH & BÀI HỌC CHUYÊN ĐỀ
            </div>

            <div
              style={{
                padding: '16px 20px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '6px',
                    background: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <BookOpen size={18} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#0F172A' }}>
                    Hệ thống bài giảng lý thuyết & Video hướng dẫn
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                    Khám phá toàn bộ danh mục bài giảng, tài liệu tham khảo và file thực hành mẫu.
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenLearningPath();
                }}
                style={{
                  padding: '7px 14px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#1E293B',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0
                }}
              >
                <span>Mở giáo trình</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </section>

          {/* Khối 3: Khảo thí & Bài tập thực hành */}
          <section id="section-exam" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              02. KHẢO THÍ & BÀI TẬP THỰC HÀNH
            </div>

            <div
              style={{
                padding: '16px 20px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '6px',
                      background: '#DCFCE7',
                      color: '#16A34A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#0F172A' }}>
                      Bài kiểm tra củng cố (10 câu • 8 phút)
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                      Đánh giá mức độ tiếp thu kiến thức và cập nhật điểm tích lũy chuyên đề.
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    onStartMiniTest();
                  }}
                  style={{
                    padding: '7px 16px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    background: '#16A34A',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <span>Làm bài kiểm tra</span>
                </button>
              </div>

              {/* Nộp bài thực hành */}
              <div
                style={{
                  paddingTop: '10px',
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '12.5px',
                  flexWrap: 'wrap'
                }}
              >
                <span style={{ color: '#64748B', fontWeight: 500 }}>Khảo thí học phần:</span>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onContinueLearning();
                  }}
                  style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontWeight: 500, padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Award size={13} />
                  <span>Đề thi chuẩn kỹ năng ứng dụng</span>
                </button>
                <span style={{ color: '#CBD5E1' }}>•</span>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onOpenAssignments();
                  }}
                  style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontWeight: 500, padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Check size={13} />
                  <span>Nộp bài tập thực hành</span>
                </button>
              </div>
            </div>
          </section>

        </div>

        {/* ── CỘT PHẢI (34%): ÔN TẬP, NĂNG LỰC & TRỢ LÝ AI ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Widget 1: Ôn tập củng cố (Smart Review) */}
          <section id="section-review" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                padding: '16px 18px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 600, color: '#D97706' }}>
                  <RotateCcw size={15} />
                  <span>Ôn tập & Củng cố</span>
                </div>
                <span style={{ fontSize: '11.5px', background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                  {dueReviewCount} câu cần ôn
                </span>
              </div>

              <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                Hệ thống tự động nhắc lại các câu hỏi hay nhầm lẫn theo chu kỳ trí nhớ.
              </p>

              <button
                onClick={() => {
                  soundFx.playClick();
                  onStartSmartReview();
                }}
                style={{
                  width: '100%',
                  padding: '8px 0',
                  borderRadius: '6px',
                  background: '#D97706',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Ôn câu sai ngay
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '10px', fontSize: '12px' }}>
                <button
                  onClick={() => { soundFx.playClick(); onOpenFlashcards(); }}
                  style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontWeight: 500, padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Layers size={13} />
                  <span>Thẻ Flashcards</span>
                </button>
                <button
                  onClick={() => { soundFx.playClick(); onOpenBookmarks(); }}
                  style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontWeight: 500, padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <BookmarkCheck size={13} />
                  <span>Câu đã lưu</span>
                </button>
              </div>
            </div>
          </section>

          {/* Widget 2: Mức độ tích lũy kỹ năng chuyên môn */}
          <section id="section-progress" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                padding: '16px 18px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                  Kỹ năng chuyên môn
                </div>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#2563EB' }}>
                  {masteryScore}% chuẩn
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <SkillProgressBar label="Kiến thức nền tảng & Phím tắt" percent={100} color="#16A34A" />
                <SkillProgressBar label="Công thức & Hàm tính toán" percent={82} color="#2563EB" />
                <SkillProgressBar label="Tra cứu dữ liệu (XLOOKUP)" percent={54} color="#D97706" />
                <SkillProgressBar label="Phân tích báo cáo PivotTable" percent={31} color="#7C3AED" />
              </div>

              <div style={{ paddingTop: '6px', borderTop: '1px solid #F1F5F9', textAlign: 'right' }}>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onOpenLearningPath();
                  }}
                  style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontWeight: 600, fontSize: '12px', padding: 0 }}
                >
                  Xem toàn bộ lộ trình →
                </button>
              </div>
            </div>
          </section>

          {/* Widget 3: Trợ lý Học vụ AI nhanh */}
          <div
            style={{
              padding: '16px 18px',
              borderRadius: '8px',
              background: '#F5F3FF',
              border: '1px solid #DDD6FE',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 600, color: '#6D28D9' }}>
              <Bot size={16} />
              <span>Trợ lý Học vụ AI</span>
            </div>

            <form onSubmit={handleAiSubmit} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={aiInputText}
                onChange={(e) => setAiInputText(e.target.value)}
                placeholder="Hỏi AI về bài học..."
                style={{
                  flex: 1,
                  height: '34px',
                  borderRadius: '6px',
                  background: '#FFFFFF',
                  border: '1px solid #C4B5FD',
                  fontSize: '12.5px',
                  padding: '0 10px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '6px',
                  background: '#7C3AED',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Send size={13} />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

const SkillProgressBar: React.FC<{ label: string; percent: number; color: string }> = ({ label, percent, color }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
      <span style={{ color: '#475569', fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 600, color }}>{percent}%</span>
    </div>
    <div style={{ width: '100%', height: '5px', borderRadius: 'var(--radius-full)', background: '#E2E8F0', overflow: 'hidden' }}>
      <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: 'var(--radius-full)' }} />
    </div>
  </div>
);
