import React, { useState, useEffect } from 'react';
import { UserProfile, CurriculumTrack, TRACK_LABELS } from '../../types/auth';
import { MasteryService } from '../../services/masteryService';
import { SmartReviewService } from '../../services/smartReviewService';
import {
  Flame, BookOpen, RotateCcw, Play, CheckCircle2,
  Bot, ChevronRight, ArrowRight
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface StudentDashboard2026Props {
  currentUser: UserProfile;
  streak: number;
  onNavigateToCatalog: () => void;
  onNavigateToSmartReview: () => void;
  onNavigateToLearningPath: () => void;
  onNavigateToAITutor: () => void;
  onStartMiniTest: () => void;
}

export const StudentDashboard2026: React.FC<StudentDashboard2026Props> = ({
  currentUser,
  streak,
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

  useEffect(() => {
    const score = MasteryService.getOverallMastery(currentUser.id, track);
    setMasteryScore(score || 72);

    const dueReviews = SmartReviewService.getDueReviews(currentUser.id);
    setDueReviewCount(dueReviews.length > 0 ? dueReviews.length : 5);
  }, [currentUser.id, track]);

  return (
    <div
      style={{
        maxWidth: '1040px',
        margin: '0 auto',
        width: '100%',
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
      className="animate-slide-up"
    >
      {/* ── 1. COMPACT HERO BANNER (REDUCED 25-30% HEIGHT) ── */}
      <div
        className="card"
        style={{
          padding: '16px 24px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(79, 110, 247, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)',
          border: '1.5px solid var(--brand)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Left: Course + Greeting + Streak */}
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: 'var(--text-caption)',
                background: 'var(--brand)',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600
              }}
            >
              {trackName}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)', fontSize: '12px', fontWeight: 600 }}>
              <Flame size={14} fill="#f59e0b" color="#d97706" />
              <span>{streak || 1} ngày streak</span>
            </div>
          </div>

          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.25 }}>
            Chào {currentUser.name || 'Học Viên'}, sẵn sàng học hôm nay!
          </h1>
        </div>

        {/* Center: Mastery Score */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'conic-gradient(var(--brand) ' + (masteryScore * 3.6) + 'deg, var(--bg-secondary) 0deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'var(--bg-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--brand)'
              }}
            >
              {masteryScore}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Mastery Score
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {masteryScore >= 85 ? '🌟 Thành thạo' : masteryScore >= 60 ? '⚡ Tiến bộ' : '⚠️ Cần ôn'}
            </div>
          </div>
        </div>

        {/* Right: CTA Button */}
        <div>
          <button
            onClick={() => {
              onNavigateToCatalog();
              soundFx.playClick();
            }}
            className="btn btn-primary"
            style={{
              padding: '10px 20px',
              fontSize: 'var(--text-btn)',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              gap: '6px',
              boxShadow: 'var(--shadow-brand)'
            }}
          >
            <Play size={15} fill="#fff" />
            <span>Tiếp tục học</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* ── 2. "HÔM NAY TÔI CẦN HỌC GÌ?" (REDUCED 20-25% HEIGHT) ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Hôm nay tôi cần học gì?
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--brand)', fontWeight: 600 }}>
            3 nhiệm vụ chính
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {/* CTA 1: Học bài trọng tâm */}
          <div
            className="card card-interactive"
            onClick={onNavigateToLearningPath}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderLeft: '4px solid var(--brand)'
            }}
          >
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brand)' }}>BÀI HỌC</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>⏱️ 12 phút</span>
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '2px 0 1px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Học bài trọng tâm
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Nắm vững cú pháp hàm & phím tắt.
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          </div>

          {/* CTA 2: Ôn câu từng sai */}
          <div
            className="card card-interactive"
            onClick={onNavigateToSmartReview}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderLeft: '4px solid var(--warning)'
            }}
          >
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--warning)' }}>ÔN TẬP</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>⏱️ 5 phút</span>
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '2px 0 1px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Ôn câu từng sai ({dueReviewCount})
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Thuật toán Spaced Repetition nhắc nhở.
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          </div>

          {/* CTA 3: Mini Test */}
          <div
            className="card card-interactive"
            onClick={onStartMiniTest}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderLeft: '4px solid var(--success)'
            }}
          >
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--success)' }}>KIỂM TRA</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>⏱️ 10 phút</span>
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '2px 0 1px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Mini Test
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Đánh giá tiến độ nhanh & nhận XP.
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          </div>
        </div>
      </div>

      {/* ── 3. COMPACT AI TUTOR BANNER (HEIGHT 72-80px) ── */}
      <div
        className="card"
        style={{
          minHeight: '72px',
          maxHeight: '80px',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(79, 110, 247, 0.04) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--purple-ai)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Bot size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              AI Tutor — Giải đáp thắc mắc & giải thích câu hỏi khó
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              3 chế độ: Giải thích chi tiết, Gợi ý tư duy từng bước, và Đặt câu hỏi kiểm tra.
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
            padding: '8px 16px',
            fontSize: 'var(--text-btn)',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            color: 'var(--purple-ai)',
            borderColor: 'rgba(139, 92, 246, 0.3)',
            background: 'var(--bg-card)',
            gap: '6px',
            flexShrink: 0
          }}
        >
          <Bot size={15} />
          <span>Hỏi AI Tutor</span>
        </button>
      </div>
    </div>
  );
};
