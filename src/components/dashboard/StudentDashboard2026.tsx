import React, { useState, useEffect } from 'react';
import { UserProfile, CurriculumTrack, TRACK_LABELS } from '../../types/auth';
import { MasteryService } from '../../services/masteryService';
import { SmartReviewService } from '../../services/smartReviewService';
import { AnalyticsService } from '../../services/analyticsService';
import {
  Flame, BookOpen, RotateCcw, Play, CheckCircle2,
  Bot, ChevronRight, ArrowRight
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
    <div style={{ maxWidth: '1080px', margin: '0 auto', width: '100%', padding: '10px 14px' }} className="animate-slide-up">
      
      {/* ── 1. COMPACT HERO BANNER (BƯỚC 7: GIẢM CHIỀU CAO) ── */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(79, 110, 247, 0.1) 0%, rgba(16, 185, 129, 0.06) 100%)',
          border: '1.5px solid var(--brand)',
          marginBottom: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 18px rgba(79, 110, 247, 0.09)'
        }}
      >
        {/* Left: Greeting & Track Progress */}
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <span style={{ fontSize: '0.68rem', background: 'var(--brand)', color: '#fff', padding: '2px 8px', borderRadius: '999px', fontWeight: 800 }}>
              {trackName}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontSize: '0.72rem', fontWeight: 800 }}>
              <Flame size={13} />
              <span>{streakDays} Ngày Streak 🔥</span>
            </div>
          </div>

          <h1 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 2px', letterSpacing: '-0.01em' }}>
            Chào {currentUser.name || 'Học Viên'}, sẵn sàng bứt phá hôm nay!
          </h1>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>
            Mục tiêu: Đạt Mastery Score <strong>85%+</strong> trên toàn bộ kỹ năng.
          </p>
        </div>

        {/* Center: Compact Mastery Ring */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          borderRadius: '12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'conic-gradient(var(--brand) ' + (masteryScore * 3.6) + 'deg, var(--bg-secondary) 0deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.74rem',
              fontWeight: 900,
              color: 'var(--brand)'
            }}>
              {masteryScore}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Mastery Score
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {masteryScore >= 85 ? '🌟 Thành Thạo' : masteryScore >= 60 ? '⚡ Đang Tiến Bộ' : '⚠️ Cần Ôn Luyện'}
            </div>
          </div>
        </div>

        {/* Right: Primary Action Button */}
        <div>
          <button
            onClick={() => {
              onNavigateToCatalog();
              soundFx.playClick();
            }}
            className="btn btn-primary"
            style={{
              padding: '10px 18px',
              fontSize: '0.85rem',
              fontWeight: 800,
              borderRadius: '10px',
              gap: '6px',
              background: 'linear-gradient(135deg, var(--brand) 0%, #3b82f6 100%)',
              boxShadow: '0 4px 14px rgba(79, 110, 247, 0.3)'
            }}
          >
            <Play size={14} fill="#fff" />
            <span>TIẾP TỤC HỌC</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── 2. COMPACT 3 TASK CARDS (BƯỚC 8: GIẢM KÍCH THƯỚC) ── */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            📌 Hôm Nay Tôi Cần Học Gì?
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--brand)', fontWeight: 700 }}>
            3 Nhiệm Vụ Trọng Tâm
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
          {/* Task 1: Core Topic */}
          <div
            className="card card-interactive"
            onClick={onNavigateToLearningPath}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              borderLeft: '4px solid #2563eb'
            }}
          >
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookOpen size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#2563eb' }}>BÀI TRỌNG TÂM</span>
                <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>⏱️ 12p</span>
              </div>
              <h3 style={{ fontSize: '0.84rem', fontWeight: 800, margin: '1px 0', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Học Hàm XLOOKUP & Ứng Dụng
              </h3>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Nắm vững cú pháp và 3 lỗi thường gặp.
              </div>
            </div>
            <ChevronRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          </div>

          {/* Task 2: Smart Review Mistakes */}
          <div
            className="card card-interactive"
            onClick={onNavigateToSmartReview}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              borderLeft: '4px solid #f59e0b'
            }}
          >
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <RotateCcw size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#d97706' }}>ÔN TẬP THÔNG MINH</span>
                <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>⏱️ 5p</span>
              </div>
              <h3 style={{ fontSize: '0.84rem', fontWeight: 800, margin: '1px 0', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Ôn Lại {dueReviewCount} Câu Từng Làm Sai
              </h3>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Thuật toán Spaced Repetition nhắc nhở.
              </div>
            </div>
            <ChevronRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          </div>

          {/* Task 3: Mini Test */}
          <div
            className="card card-interactive"
            onClick={onStartMiniTest}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              borderLeft: '4px solid #10b981'
            }}
          >
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#059669' }}>MINI TEST</span>
                <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>⏱️ 10p</span>
              </div>
              <h3 style={{ fontSize: '0.84rem', fontWeight: 800, margin: '1px 0', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Kiểm Tra Tiến Độ Nhanh
              </h3>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Đánh giá mức độ thành thạo và nhận XP.
              </div>
            </div>
            <ChevronRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          </div>
        </div>
      </div>

      {/* ── 3. COMPACT AI TUTOR MINI-BAR (BƯỚC 9: THU NHỎ BANNER) ── */}
      <div
        className="card"
        style={{
          padding: '10px 14px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(79, 110, 247, 0.04) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.22)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bot size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase' }}>
                AI Tutor 2026
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Cần trợ giúp công thức Office hoặc giải thích câu khó? AI sẵn sàng 24/7!
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            onNavigateToAITutor();
            soundFx.playClick();
          }}
          className="btn btn-secondary"
          style={{
            padding: '6px 14px',
            fontSize: '0.76rem',
            fontWeight: 800,
            borderRadius: '8px',
            color: '#8b5cf6',
            borderColor: 'rgba(139, 92, 246, 0.3)',
            background: 'var(--bg-card)',
            gap: '4px',
            flexShrink: 0
          }}
        >
          <Bot size={13} />
          <span>Hỏi AI Tutor</span>
        </button>
      </div>

    </div>
  );
};
