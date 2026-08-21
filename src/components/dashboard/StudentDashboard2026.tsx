import React, { useState, useEffect } from 'react';
import { UserProfile, CurriculumTrack, TRACK_LABELS } from '../../types/auth';
import { MasteryService } from '../../services/masteryService';
import { SmartReviewService } from '../../services/smartReviewService';
import { AnalyticsService } from '../../services/analyticsService';
import {
  Flame, BookOpen, RotateCcw, Play, CheckCircle2,
  Sparkles, Bot, ChevronRight, ArrowRight
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface StudentDashboard2026Props {
  currentUser: UserProfile;
  onNavigateToCatalog: () => void;
  onNavigateToSmartReview: () => void;
  onNavigateToLearningPath: () => void;
  onNavigateToAITutor: () => void;
  onStartMiniTest: () => void;
}

export const StudentDashboard2026: React.FC<StudentDashboard2026Props> = ({
  currentUser,
  onNavigateToCatalog,
  onNavigateToSmartReview,
  onNavigateToLearningPath,
  onNavigateToAITutor,
  onStartMiniTest
}) => {
  const track: CurriculumTrack = currentUser.programTrack || 'office-fast-3in1';
  const trackName = TRACK_LABELS[track] || 'Office Cấp Tốc (3b)';

  const [masteryScore, setMasteryScore] = useState(0);
  const [dueReviewCount, setDueReviewCount] = useState(0);
  const [streakDays, setStreakDays] = useState(3);

  useEffect(() => {
    const score = MasteryService.getOverallMastery(currentUser.id, track);
    setMasteryScore(score || 68); // fallback seed for new accounts

    const dueReviews = SmartReviewService.getDueReviews(currentUser.id);
    setDueReviewCount(dueReviews.length > 0 ? dueReviews.length : 5);

    const summary = AnalyticsService.getStudyActivitySummary(currentUser.id);
    if (summary.activeDaysCount > 0) {
      setStreakDays(Math.max(summary.activeDaysCount, 3));
    }
  }, [currentUser.id, track]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '14px 16px' }} className="animate-slide-up">
      
      {/* ── 1. ACTION-FIRST HERO BANNER ── */}
      <div
        className="card"
        style={{
          padding: '24px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(79, 110, 247, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1.5px solid var(--brand)',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 8px 30px rgba(79, 110, 247, 0.12)'
        }}
      >
        {/* Left: Greeting & Current Track Progress */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', background: 'var(--brand)', color: '#fff', padding: '3px 10px', borderRadius: '999px', fontWeight: 800 }}>
              {trackName}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.78rem', fontWeight: 800 }}>
              <Flame size={15} />
              <span>{streakDays} Ngày Streak 🔥</span>
            </div>
          </div>

          <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Chào {currentUser.name || 'Học Viên'}, sẵn sàng bứt phá hôm nay!
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Mục tiêu tuần này: Hoàn thành <strong>Lộ trình Kỹ năng Nâng cao</strong> & đạt Mastery Score trên <strong>85%</strong>.
          </p>
        </div>

        {/* Center: Mastery Score Ring Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '12px 18px',
          borderRadius: '16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'conic-gradient(var(--brand) ' + (masteryScore * 3.6) + 'deg, var(--bg-secondary) 0deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.82rem',
              fontWeight: 900,
              color: 'var(--brand)'
            }}>
              {masteryScore}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Mastery Score
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {masteryScore >= 85 ? '🌟 Thành Thạo' : masteryScore >= 60 ? '⚡ Đang Tiến Bộ' : '⚠️ Cần Ôn Luyện'}
            </div>
          </div>
        </div>

        {/* Right: Big Single Primary Action Button */}
        <div>
          <button
            onClick={() => {
              onNavigateToCatalog();
              soundFx.playClick();
            }}
            className="btn btn-primary"
            style={{
              padding: '14px 28px',
              fontSize: '0.96rem',
              fontWeight: 900,
              borderRadius: '14px',
              gap: '8px',
              background: 'linear-gradient(135deg, var(--brand) 0%, #3b82f6 100%)',
              boxShadow: '0 8px 24px rgba(79, 110, 247, 0.35)',
              transform: 'scale(1.02)'
            }}
          >
            <Play size={18} fill="#fff" />
            <span>TIẾP TỤC HỌC NGAY</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* ── 2. "HÔM NAY TÔI CẦN HỌC GÌ?" (DAILY ACTION PLAN) ── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            📌 Hôm Nay Tôi Cần Học Gì?
          </h2>
          <span style={{ fontSize: '0.76rem', color: 'var(--brand)', fontWeight: 700 }}>
            3 Nhiệm Vụ Trọng Tâm
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
          {/* Task 1: Core Topic */}
          <div
            className="card card-interactive"
            onClick={onNavigateToLearningPath}
            style={{
              padding: '18px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              borderLeft: '5px solid #2563eb'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookOpen size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb' }}>BÀI HỌC TRỌNG TÂM</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>⏱️ 12 phút</span>
              </div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: '2px 0 4px', color: 'var(--text-primary)' }}>
                Học Hàm XLOOKUP & Ứng Dụng Thực Tế
              </h3>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Nắm vững cú pháp và tránh 3 lỗi sai phổ biến.
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>

          {/* Task 2: Smart Review Mistakes */}
          <div
            className="card card-interactive"
            onClick={onNavigateToSmartReview}
            style={{
              padding: '18px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              borderLeft: '5px solid #f59e0b'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <RotateCcw size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d97706' }}>ÔN TẬP THÔNG MINH</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>⏱️ 5 phút</span>
              </div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: '2px 0 4px', color: 'var(--text-primary)' }}>
                Ôn Lại {dueReviewCount} Câu Từng Làm Sai
              </h3>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Thuật toán Spaced Repetition nhắc đúng lúc quên.
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>

          {/* Task 3: Mini Test */}
          <div
            className="card card-interactive"
            onClick={onStartMiniTest}
            style={{
              padding: '18px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              borderLeft: '5px solid #10b981'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669' }}>MINI TEST 10 CÂU</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>⏱️ 10 phút</span>
              </div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: '2px 0 4px', color: 'var(--text-primary)' }}>
                Kiểm Tra Tiến Độ Nhanh
              </h3>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Đánh giá mức độ thành thạo và tích lũy XP.
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
        </div>
      </div>

      {/* ── 3. AI TUTOR COMPANION CARD ── */}
      <div
        className="card"
        style={{
          padding: '20px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(79, 110, 247, 0.04) 100%)',
          border: '1.5px solid rgba(139, 92, 246, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bot size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="#8b5cf6" />
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase' }}>
                TinHocGenZ AI Tutor 2026
              </span>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0' }}>
              Gặp khó khăn với bài tập hay công thức Office?
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              AI có sẵn 3 chế độ: Giải thích chi tiết, Gợi ý tư duy từng bước, và Đặt câu hỏi kiểm tra độ hiểu!
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            onNavigateToAITutor();
            soundFx.playClick();
          }}
          className="btn btn-secondary"
          style={{
            padding: '10px 18px',
            fontSize: '0.82rem',
            fontWeight: 800,
            borderRadius: '10px',
            color: '#8b5cf6',
            borderColor: 'rgba(139, 92, 246, 0.3)',
            background: 'var(--bg-card)',
            gap: '6px'
          }}
        >
          <Bot size={15} />
          <span>Mở AI Tutor</span>
        </button>
      </div>

    </div>
  );
};
