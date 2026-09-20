import React, { useState, useEffect } from 'react';
import { UserProfile, CurriculumTrack, TRACK_LABELS } from '../../types/auth';
import { MasteryService } from '../../services/masteryService';
import { WeakSkillService } from '../../services/weakSkillService';
import { RecommendationService } from '../../services/recommendationService';
import { ClassScheduleItem } from '../../types/schedule';
import {
  Play, BookOpen, Calendar, CheckSquare, Award,
  Sparkles, QrCode, Users, Bell,
  ChevronRight, ArrowRight, Clock, ShieldCheck,
  Send, Bot, ListTodo, Flame, Zap, Star,
  ChevronDown, CheckCircle2
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
  onOpenQRScanner?: () => void;
  onOpenPracticeSkill?: (skillId?: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const StudentOnePageDashboard: React.FC<StudentOnePageDashboardProps> = ({
  currentUser,
  streak,
  schedules: _schedules = [],
  onContinueLearning,
  onStartSmartReview: _onStartSmartReview,
  onStartMiniTest,
  onOpenLearningPath,
  onOpenFlashcards: _onOpenFlashcards,
  onOpenBookmarks: _onOpenBookmarks,
  onOpenAssignments,
  onOpenAITutor,
  onOpenQRScanner,
  onOpenPracticeSkill,
  onNavigateTab
}) => {
  const track: CurriculumTrack = currentUser.programTrack || 'office-fast-3in1';
  const trackName = TRACK_LABELS[track] || 'Tin học Văn phòng Cấp tốc';

  const [masteryScore, setMasteryScore] = useState(72);
  const [activeCourseTab, setActiveCourseTab] = useState<'learning' | 'not_started' | 'completed'>('learning');
  const [aiInputText, setAiInputText] = useState('');
  const [weakSkillsData, setWeakSkillsData] = useState<ReturnType<typeof RecommendationService.generateDashboardRecommendations>>([]);

  useEffect(() => {
    const score = MasteryService.getOverallMastery(currentUser.id, track);
    setMasteryScore(score || 72);

    try {
      const masteryData = JSON.parse(localStorage.getItem(`phtgz_mastery_${currentUser.id}`) || '{}');
      const masteryRecords = Object.values(masteryData).filter((r: any) => r.skillId) as any[];
      if (masteryRecords.length > 0) {
        const recordsMap: Record<string, any> = {};
        masteryRecords.forEach((r: any) => { if (r.skillId) recordsMap[r.skillId] = r; });
        const weak = WeakSkillService.detectFromMasteryRecords(recordsMap);
        setWeakSkillsData(RecommendationService.generateDashboardRecommendations(weak));
      }
    } catch {}
  }, [currentUser.id, track]);

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInputText.trim()) {
      onOpenAITutor('Giải thích hàm XLOOKUP trong Excel thực chiến');
    } else {
      onOpenAITutor(aiInputText);
      setAiInputText('');
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    soundFx.playClick();
    onOpenAITutor(prompt);
  };

  return (
    <div
      className="student-dashboard-container"
      style={{
        fontFamily: 'var(--font-sans)',
        padding: '24px',
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}
    >
      {/* ── 1. WELCOME HERO BANNER (Design Source of Truth) ── */}
      <div
        className="student-hero-banner"
        style={{
          background: 'linear-gradient(135deg, #F0F7FF 0%, #E0F2FE 45%, #EFF6FF 100%)',
          borderRadius: '20px',
          border: '1px solid #BFDBFE',
          padding: '28px 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px -2px rgba(0, 87, 184, 0.08)'
        }}
      >
        {/* Left: User Welcome, Slogan, 5 KPIs, 2 Action CTAs */}
        <div style={{ zIndex: 2, flex: 1, maxWidth: '720px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0057B8' }}>Xin chào,</span>
            <span style={{ fontSize: '12px', background: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
              {trackName}
            </span>
          </div>

          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#0B2545',
            margin: '0 0 6px',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{currentUser.name || 'Nguyễn Văn A'}</span>
            <span role="img" aria-label="wave">👋</span>
          </h1>

          <p style={{
            fontSize: '15px',
            color: '#475569',
            margin: '0 0 20px',
            fontStyle: 'italic',
            fontWeight: 500
          }}>
            "Học hôm nay, cơ hội mai sau!"
          </p>

          {/* 5 KPI Metric Badges */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '24px'
          }}>
            {/* 1. Khóa đang học */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              padding: '6px 12px',
              borderRadius: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <BookOpen size={16} color="#0057B8" />
              <div>
                <span style={{ fontWeight: 800, fontSize: '14px', color: '#0B2545' }}>4</span>{' '}
                <span style={{ fontSize: '12px', color: '#64748B' }}>Khóa đang học</span>
              </div>
            </div>

            {/* 2. Bài hoàn thành */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              padding: '6px 12px',
              borderRadius: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <CheckCircle2 size={16} color="#10B981" />
              <div>
                <span style={{ fontWeight: 800, fontSize: '14px', color: '#0B2545' }}>12</span>{' '}
                <span style={{ fontSize: '12px', color: '#64748B' }}>Bài hoàn thành</span>
              </div>
            </div>

            {/* 3. Bài kiểm tra */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              padding: '6px 12px',
              borderRadius: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <CheckSquare size={16} color="#3B82F6" />
              <div>
                <span style={{ fontWeight: 800, fontSize: '14px', color: '#0B2545' }}>3</span>{' '}
                <span style={{ fontSize: '12px', color: '#64748B' }}>Bài kiểm tra</span>
              </div>
            </div>

            {/* 4. Chứng chỉ */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              padding: '6px 12px',
              borderRadius: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <Award size={16} color="#8B5CF6" />
              <div>
                <span style={{ fontWeight: 800, fontSize: '14px', color: '#0B2545' }}>1</span>{' '}
                <span style={{ fontSize: '12px', color: '#64748B' }}>Chứng chỉ</span>
              </div>
            </div>

            {/* 5. Chuỗi học tập (Streak) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FFF7ED',
              border: '1px solid #FED7AA',
              padding: '6px 12px',
              borderRadius: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <Flame size={16} color="#EA580C" />
              <div>
                <span style={{ fontWeight: 800, fontSize: '14px', color: '#C2410C' }}>{streak || 12} ngày</span>{' '}
                <span style={{ fontSize: '12px', color: '#EA580C' }}>Chuỗi học tập</span>
              </div>
            </div>
          </div>

          {/* Action CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                soundFx.playClick();
                onContinueLearning();
              }}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 700,
                borderRadius: '10px',
                background: '#0057B8',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0, 87, 184, 0.25)',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#003F88')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0057B8')}
            >
              <Play size={16} fill="#fff" />
              <span>Tiếp tục học</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onOpenLearningPath();
              }}
              style={{
                padding: '12px 22px',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '10px',
                background: '#FFFFFF',
                color: '#0057B8',
                border: '1px solid #0057B8',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
            >
              <Sparkles size={16} color="#0057B8" />
              <span>Xem lộ trình AI</span>
            </button>
          </div>
        </div>

        {/* Right: Graphic illustration & Motivational Quote */}
        <div style={{
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Quote Pill */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(191, 219, 254, 0.6)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#0057B8',
            marginBottom: '12px',
            boxShadow: '0 2px 8px rgba(0, 87, 184, 0.08)'
          }}>
            "Kiến tạo thế hệ công dân số tương lai"
          </div>

          {/* Student Graphic Avatar Circle */}
          <div style={{
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0057B8 0%, #38BDF8 100%)',
            padding: '4px',
            boxShadow: '0 10px 25px -5px rgba(0, 87, 184, 0.3)'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80"
                alt="Student Illustration"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.currentTarget as any).style.display = 'none';
                }}
              />
              <span style={{ fontSize: '48px', fontWeight: 800, color: '#0057B8' }}>A</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. HÀNH ĐỘNG NHANH (8 Quick Actions Grid) ── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
      }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#0B2545', marginBottom: '16px' }}>
          Hành động nhanh
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '12px'
        }}>
          {/* Action 1: Tiếp tục học */}
          <button
            onClick={() => { soundFx.playClick(); onContinueLearning(); }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 8px',
              borderRadius: '12px',
              border: '1px solid #F1F5F9',
              background: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Play size={20} fill="#10B981" />
            </div>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>Tiếp tục học</span>
          </button>

          {/* Action 2: Xem lịch học */}
          <button
            onClick={() => { soundFx.playClick(); if (onNavigateTab) onNavigateTab('schedule'); }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 8px',
              borderRadius: '12px',
              border: '1px solid #F1F5F9',
              background: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} />
            </div>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>Xem lịch học</span>
          </button>

          {/* Action 3: Nộp bài tập */}
          <button
            onClick={() => { soundFx.playClick(); onOpenAssignments(); }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 8px',
              borderRadius: '12px',
              border: '1px solid #F1F5F9',
              background: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#FFFBEB', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckSquare size={20} />
            </div>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>Nộp bài tập</span>
          </button>

          {/* Action 4: Làm bài kiểm tra */}
          <button
            onClick={() => { soundFx.playClick(); onStartMiniTest(); }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 8px',
              borderRadius: '12px',
              border: '1px solid #F1F5F9',
              background: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={20} />
            </div>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>Làm bài kiểm tra</span>
          </button>

          {/* Action 5: Điểm danh */}
          <button
            onClick={() => { soundFx.playClick(); if (onOpenQRScanner) onOpenQRScanner(); }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 8px',
              borderRadius: '12px',
              border: '1px solid #F1F5F9',
              background: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(236, 72, 153, 0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#FDF2F8', color: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={20} />
            </div>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>Điểm danh</span>
          </button>

          {/* Action 6: Xem chứng chỉ */}
          <button
            onClick={() => { soundFx.playClick(); if (onNavigateTab) onNavigateTab('certificates'); }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 8px',
              borderRadius: '12px',
              border: '1px solid #F1F5F9',
              background: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(20, 184, 166, 0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#F0FDFA', color: '#14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>Xem chứng chỉ</span>
          </button>

          {/* Action 7: Vào cộng đồng */}
          <button
            onClick={() => { soundFx.playClick(); if (onNavigateTab) onNavigateTab('community'); }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 8px',
              borderRadius: '12px',
              border: '1px solid #F1F5F9',
              background: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#EEF2FF', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>Vào cộng đồng</span>
          </button>

          {/* Action 8: Hỏi AI */}
          <button
            onClick={() => { soundFx.playClick(); onOpenAITutor(); }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 8px',
              borderRadius: '12px',
              border: '1px solid #F1F5F9',
              background: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(168, 85, 247, 0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#FAF5FF', color: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} />
            </div>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>Hỏi AI</span>
          </button>
        </div>
      </div>

      {/* ── 3. MAIN 2-COLUMN DASHBOARD BENTO GRID ── */}
      <div
        className="dashboard-bento-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'start'
        }}
      >
        {/* ── CỘT TRÁI (Lớn ~65%): KHÓA HỌC, LỘ TRÌNH, TIẾN ĐỘ, AI COPILOT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
          
          {/* Section: Khóa học của tôi (Tabs + 4 Cards) */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
          }}>
            {/* Header with Tabs and View All Link */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 700, color: '#0B2545' }}>
                  <BookOpen size={18} color="#0057B8" />
                  <span>Khóa học của tôi</span>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <button
                    onClick={() => setActiveCourseTab('learning')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: activeCourseTab === 'learning' ? '#0057B8' : 'transparent',
                      color: activeCourseTab === 'learning' ? '#FFFFFF' : '#64748B',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Đang học (4)
                  </button>
                  <button
                    onClick={() => setActiveCourseTab('not_started')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: activeCourseTab === 'not_started' ? '#0057B8' : 'transparent',
                      color: activeCourseTab === 'not_started' ? '#FFFFFF' : '#64748B',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Chưa bắt đầu (1)
                  </button>
                  <button
                    onClick={() => setActiveCourseTab('completed')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: activeCourseTab === 'completed' ? '#0057B8' : 'transparent',
                      color: activeCourseTab === 'completed' ? '#FFFFFF' : '#64748B',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Đã hoàn thành (3)
                  </button>
                </div>
              </div>

              <button
                onClick={() => { soundFx.playClick(); if (onNavigateTab) onNavigateTab('courses'); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0057B8',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>Xem tất cả</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* 4 Course Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {/* Card 1: Excel Ứng Dụng */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                transition: 'box-shadow 0.15s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#107C41', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px' }}>
                    X
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0B2545', lineHeight: 1.3 }}>
                      Excel Ứng Dụng Trong Công Việc
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', marginBottom: '6px' }}>
                    <span>28/39 bài học</span>
                    <span style={{ fontWeight: 700, color: '#0057B8' }}>72%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', borderRadius: '99px', background: '#F1F5F9', overflow: 'hidden' }}>
                    <div style={{ width: '72%', height: '100%', background: '#0057B8', borderRadius: '99px' }} />
                  </div>
                </div>

                <button
                  onClick={() => { soundFx.playClick(); onContinueLearning(); }}
                  style={{
                    width: '100%',
                    padding: '8px 0',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0057B8',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Tiếp tục học
                </button>
              </div>

              {/* Card 2: Word Chuyên Nghiệp */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#185ABD', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px' }}>
                    W
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0B2545', lineHeight: 1.3 }}>
                      Word Chuyên Nghiệp Cho Người Đi Làm
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', marginBottom: '6px' }}>
                    <span>18/40 bài học</span>
                    <span style={{ fontWeight: 700, color: '#185ABD' }}>45%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', borderRadius: '99px', background: '#F1F5F9', overflow: 'hidden' }}>
                    <div style={{ width: '45%', height: '100%', background: '#185ABD', borderRadius: '99px' }} />
                  </div>
                </div>

                <button
                  onClick={() => { soundFx.playClick(); onContinueLearning(); }}
                  style={{
                    width: '100%',
                    padding: '8px 0',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    color: '#0057B8',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Học tiếp
                </button>
              </div>

              {/* Card 3: PowerPoint */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#C43E1C', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px' }}>
                    P
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0B2545', lineHeight: 1.3 }}>
                      PowerPoint Thuyết Trình Hiệu Quả
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', marginBottom: '6px' }}>
                    <span>8/40 bài học</span>
                    <span style={{ fontWeight: 700, color: '#C43E1C' }}>20%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', borderRadius: '99px', background: '#F1F5F9', overflow: 'hidden' }}>
                    <div style={{ width: '20%', height: '100%', background: '#C43E1C', borderRadius: '99px' }} />
                  </div>
                </div>

                <button
                  onClick={() => { soundFx.playClick(); onContinueLearning(); }}
                  style={{
                    width: '100%',
                    padding: '8px 0',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    color: '#0057B8',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Học tiếp
                </button>
              </div>

              {/* Card 4: MOS */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#0B2545', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '11px' }}>
                    MOS
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0B2545', lineHeight: 1.3 }}>
                      Ôn Thi MOS (Word, Excel, PP)
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', marginBottom: '6px' }}>
                    <span>4/42 bài học</span>
                    <span style={{ fontWeight: 700, color: '#0B2545' }}>10%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', borderRadius: '99px', background: '#F1F5F9', overflow: 'hidden' }}>
                    <div style={{ width: '10%', height: '100%', background: '#0B2545', borderRadius: '99px' }} />
                  </div>
                </div>

                <button
                  onClick={() => { soundFx.playClick(); onContinueLearning(); }}
                  style={{
                    width: '100%',
                    padding: '8px 0',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    color: '#0057B8',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Học tiếp
                </button>
              </div>
            </div>
          </div>

          {/* Split Row: Lộ trình AI (50%) + Tiến độ học tập (50%) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {/* Left Card: Lộ trình học AI */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#0B2545' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#EFF6FF', color: '#0057B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={16} />
                    </div>
                    <span>Lộ trình học AI dành cho bạn</span>
                  </div>
                  <button
                    onClick={() => { soundFx.playClick(); onOpenLearningPath(); }}
                    style={{ background: 'none', border: 'none', color: '#0057B8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                  >
                    <span>Chi tiết</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '20px' }}>
                  Dựa trên mục tiêu và năng lực hiện tại
                </div>

                {/* 4-Step Stepper */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                  {/* Connecting Line */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '20px',
                    right: '20px',
                    height: '2px',
                    background: '#E2E8F0',
                    zIndex: 1
                  }} />

                  {/* Step 1: Hoàn thành */}
                  <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', maxWidth: '75px', textAlign: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={16} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', lineHeight: 1.2 }}>Tin học VP cơ bản</span>
                  </div>

                  {/* Step 2: Đang học */}
                  <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', maxWidth: '75px', textAlign: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0057B8', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                      2
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#0057B8', lineHeight: 1.2 }}>Ứng dụng nâng cao</span>
                  </div>

                  {/* Step 3: MOS Quốc tế */}
                  <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', maxWidth: '75px', textAlign: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', color: '#94A3B8', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '13px' }}>
                      3
                    </div>
                    <span style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.2 }}>MOS Quốc tế</span>
                  </div>

                  {/* Step 4: Kỹ năng bổ trợ */}
                  <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', maxWidth: '75px', textAlign: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', color: '#94A3B8', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '13px' }}>
                      4
                    </div>
                    <span style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.2 }}>Kỹ năng bổ trợ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Tiến độ học tập */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#0B2545' }}>
                  <Award size={18} color="#0057B8" />
                  <span>Tiến độ học tập</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', padding: '3px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <span>Tuần này</span>
                  <ChevronDown size={13} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Circular Donut Progress SVG */}
                <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
                  <svg width="90" height="90" viewBox="0 0 90 90">
                    <circle cx="45" cy="45" r="38" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                    <circle
                      cx="45"
                      cy="45"
                      r="38"
                      fill="none"
                      stroke="#0057B8"
                      strokeWidth="8"
                      strokeDasharray={`${(masteryScore / 100) * 238.76} 238.76`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      transform="rotate(-90 45 45)"
                    />
                  </svg>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#0B2545' }}>{masteryScore}%</span>
                    <span style={{ fontSize: '9px', color: '#64748B' }}>Hoàn thành</span>
                  </div>
                </div>

                {/* 3 Stats List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={15} color="#10B981" />
                    <div style={{ fontSize: '12.5px' }}>
                      <strong style={{ color: '#0B2545' }}>12 giờ</strong> <span style={{ color: '#64748B' }}>Thời gian học</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckSquare size={15} color="#0057B8" />
                    <div style={{ fontSize: '12.5px' }}>
                      <strong style={{ color: '#0B2545' }}>28</strong> <span style={{ color: '#64748B' }}>Bài đã hoàn thành</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={15} color="#8B5CF6" />
                    <div style={{ fontSize: '12.5px' }}>
                      <strong style={{ color: '#0B2545' }}>4</strong> <span style={{ color: '#64748B' }}>Chủ đề đã xong</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── AI Learning Copilot Widget ── */}
          <div style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            border: '1px solid #BFDBFE',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#0057B8',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={17} />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0B2545' }}>
                    AI Learning Copilot
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
                Hỏi đáp, tóm tắt bài học, gợi ý lộ trình và nhiều hơn nữa...
              </div>

              {/* Prompt Input Bar */}
              <form onSubmit={handleAiSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <input
                  type="text"
                  value={aiInputText}
                  onChange={e => setAiInputText(e.target.value)}
                  placeholder="Bạn muốn học gì hôm nay?"
                  style={{
                    flex: 1,
                    height: '42px',
                    padding: '0 16px',
                    borderRadius: '10px',
                    border: '1px solid #BFDBFE',
                    background: '#FFFFFF',
                    fontSize: '13px',
                    color: '#0B2545',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  aria-label="Gửi yêu cầu AI"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#0057B8',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Send size={16} />
                </button>
              </form>

              {/* 4 Quick Prompt Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleQuickPrompt('Giải thích hàm XLOOKUP')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #BFDBFE',
                    background: '#FFFFFF',
                    color: '#0057B8',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Giải thích hàm XLOOKUP
                </button>

                <button
                  onClick={() => handleQuickPrompt('Tạo bài tập luyện tập')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #BFDBFE',
                    background: '#FFFFFF',
                    color: '#0057B8',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Tạo bài tập luyện tập
                </button>

                <button
                  onClick={() => handleQuickPrompt('Gợi ý khóa học phù hợp')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #BFDBFE',
                    background: '#FFFFFF',
                    color: '#0057B8',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Gợi ý khóa học phù hợp
                </button>

                <button
                  onClick={() => handleQuickPrompt('Lên kế hoạch học 1 tháng')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #BFDBFE',
                    background: '#FFFFFF',
                    color: '#0057B8',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Lên kế hoạch học 1 tháng
                </button>
              </div>
            </div>

            {/* Mascot Robot TinHocGenZ with Speech Bubble */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative'
            }}>
              {/* Speech Bubble */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#0057B8',
                border: '1px solid #BFDBFE',
                boxShadow: '0 4px 12px rgba(0, 87, 184, 0.1)',
                marginBottom: '8px',
                whiteSpace: 'nowrap'
              }}>
                Học thông minh hơn cùng AI!
              </div>

              {/* 3D Robot Mascot Icon / Badge */}
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0057B8 0%, #38BDF8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(0, 87, 184, 0.25)'
              }}>
                <Bot size={38} color="#FFFFFF" />
              </div>
            </div>
          </div>
        </div>

        {/* ── CỘT PHẢI (~35%): LỊCH HÔM NAY, BÀI TẬP ĐẾN HẠN, THÀNH TÍCH & TO-DO ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          
          {/* Card 1: Lịch học hôm nay */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#0B2545' }}>
                  <Calendar size={17} color="#0057B8" />
                  <span>Lịch học hôm nay</span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                  Thứ 4, 26/08/2026
                </div>
              </div>

              <button
                onClick={() => { soundFx.playClick(); if (onNavigateTab) onNavigateTab('schedule'); }}
                style={{ background: 'none', border: 'none', color: '#0057B8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <span>Xem lịch</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Event 1: Excel Nâng Cao */}
              <div style={{
                padding: '12px',
                borderRadius: '10px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                    <span>10:00 - 11:30</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B2545', margin: '2px 0' }}>
                    Excel Nâng Cao
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                    Phòng Lab 3 - Cơ sở 1
                  </div>
                </div>

                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: '#FEF3C7',
                  color: '#D97706',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  Sắp diễn ra
                </span>
              </div>

              {/* Event 2: Lớp Ôn Thi MOS */}
              <div style={{
                padding: '12px',
                borderRadius: '10px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0057B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0057B8' }} />
                    <span>14:00 - 15:30</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B2545', margin: '2px 0' }}>
                    Lớp Ôn Thi MOS
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                    Online (Google Meet)
                  </div>
                </div>

                <button
                  onClick={() => { soundFx.playClick(); window.open('https://meet.google.com', '_blank'); }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: '1px solid #0057B8',
                    background: '#FFFFFF',
                    color: '#0057B8',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Tham gia
                </button>
              </div>

              {/* Event 3: Q&A cùng giảng viên */}
              <div style={{
                padding: '12px',
                borderRadius: '10px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#8B5CF6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6' }} />
                    <span>19:00 - 20:00</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B2545', margin: '2px 0' }}>
                    Q&A cùng giảng viên
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                    Cộng đồng học viên
                  </div>
                </div>

                <button
                  onClick={() => { soundFx.playClick(); }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Bell size={12} />
                  <span>Nhắc tôi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Bài tập & Kiểm tra sắp đến hạn */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#0B2545' }}>
                <CheckSquare size={17} color="#0057B8" />
                <span>Bài tập & Kiểm tra sắp đến hạn</span>
              </div>

              <button
                onClick={() => { soundFx.playClick(); onOpenAssignments(); }}
                style={{ background: 'none', border: 'none', color: '#0057B8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <span>Xem tất cả</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Task 1 */}
              <div style={{
                padding: '12px',
                borderRadius: '10px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#107C41', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
                    X
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B2545' }}>
                      Bài tập Excel - Hàm nâng cao
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      Hạn nộp: 28/08/2026
                    </div>
                  </div>
                </div>

                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: '#FEE2E2',
                  color: '#EF4444',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  Còn 2 ngày
                </span>
              </div>

              {/* Task 2 */}
              <div style={{
                padding: '12px',
                borderRadius: '10px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#185ABD', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
                    W
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B2545' }}>
                      Bài kiểm tra Word - Chương 3
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      Hạn nộp: 30/08/2026
                    </div>
                  </div>
                </div>

                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: '#FEF3C7',
                  color: '#D97706',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  Còn 4 ngày
                </span>
              </div>

              {/* Task 3 */}
              <div style={{
                padding: '12px',
                borderRadius: '10px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#C43E1C', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
                    P
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B2545' }}>
                      Bài thuyết trình nhóm
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      Hạn nộp: 02/09/2026
                    </div>
                  </div>
                </div>

                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: '#FEF3C7',
                  color: '#D97706',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  Còn 7 ngày
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Thành tích nổi bật */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#0B2545' }}>
                <Award size={17} color="#0057B8" />
                <span>Thành tích nổi bật</span>
              </div>

              <button
                onClick={() => { soundFx.playClick(); if (onNavigateTab) onNavigateTab('certificates'); }}
                style={{ background: 'none', border: 'none', color: '#0057B8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <span>Xem tất cả</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {/* Badge 1: Chăm chỉ */}
              <div style={{
                background: '#F0FDF4',
                border: '1px solid #DCFCE7',
                borderRadius: '12px',
                padding: '12px 6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '6px'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={18} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>Chăm chỉ</div>
                <div style={{ fontSize: '10px', color: '#15803D' }}>Học liên tục 7 ngày</div>
              </div>

              {/* Badge 2: Tốc độ */}
              <div style={{
                background: '#EFF6FF',
                border: '1px solid #DBEAFE',
                borderRadius: '12px',
                padding: '12px 6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '6px'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0057B8', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={18} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E40AF' }}>Tốc độ</div>
                <div style={{ fontSize: '10px', color: '#1D4ED8' }}>Hoàn thành 50 bài</div>
              </div>

              {/* Badge 3: Xuất sắc */}
              <div style={{
                background: '#FAF5FF',
                border: '1px solid #F3E8FF',
                borderRadius: '12px',
                padding: '12px 6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '6px'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#8B5CF6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={18} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#6B21A8' }}>Xuất sắc</div>
                <div style={{ fontSize: '10px', color: '#7E22CE' }}>Điểm KT &gt; 90%</div>
              </div>
            </div>
          </div>

          {/* ── CARD 4: VIỆC CẦN LÀM HÔM NAY (TEST INVARIANT ENFORCEMENT) ── */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14.5px', fontWeight: 700, color: '#0B2545' }}>
                <ListTodo size={17} color="#0057B8" />
                <span>Việc cần làm hôm nay</span>
              </div>
              <span style={{ fontSize: '11px', background: '#EFF6FF', color: '#0057B8', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                Hôm nay
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '12.5px', color: '#334155' }}>
                  Hoàn thành bài tập trắc nghiệm XLOOKUP
                </div>
                <button
                  onClick={() => { soundFx.playClick(); onContinueLearning(); }}
                  style={{ background: 'none', border: 'none', color: '#0057B8', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Làm ngay
                </button>
              </div>

              {weakSkillsData.length > 0 && (
                <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '12.5px', color: '#92400E' }}>
                    Ôn lại: {weakSkillsData[0].skillName}
                  </div>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      if (onOpenPracticeSkill) onOpenPracticeSkill(weakSkillsData[0].skillId);
                      else onStartMiniTest();
                    }}
                    style={{ background: 'none', border: 'none', color: '#D97706', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Luyện
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
