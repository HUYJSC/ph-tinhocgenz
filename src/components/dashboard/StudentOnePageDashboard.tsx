import React, { useState, useEffect } from 'react';
import { UserProfile, CurriculumTrack, TRACK_LABELS } from '../../types/auth';
import { MasteryService } from '../../services/masteryService';
import { SmartReviewService } from '../../services/smartReviewService';
import { ClassScheduleItem } from '../../types/schedule';
import {
  Play, BookOpen, RotateCcw, Award,
  Calendar, Layers, BookmarkCheck, ArrowRight, Bot, Send,
  Camera, QrCode, KeyRound, ListTodo, Flame, Clock, TrendingUp,
  FileText, ExternalLink
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
  onOpenQRScanner?: () => void;
  onOpenCheckInModal?: () => void;
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
  onOpenQRScanner,
  onOpenCheckInModal
}) => {
  const track: CurriculumTrack = currentUser.programTrack || 'office-fast-3in1';
  const trackName = TRACK_LABELS[track] || 'Tin học Văn phòng Cấp tốc';

  const [masteryScore, setMasteryScore] = useState(72);
  const [dueReviewCount, setDueReviewCount] = useState(5);
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

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInputText.trim()) {
      onOpenAITutor('Hướng dẫn tôi cách dùng hàm XLOOKUP trong Excel thực chiến');
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
      style={{
        maxWidth: '1240px',
        margin: '0 auto',
        width: '100%',
        padding: '24px 20px 80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        fontFamily: 'var(--font-sans)'
      }}
    >
      {/* ── 1. PREMIUM HERO BANNER (Học viện số hiện đại) ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 55%, #0A2540 100%)',
          borderRadius: '20px',
          padding: '28px 32px',
          color: '#FFFFFF',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px'
        }}
      >
        {/* Glow ambient background decoration */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.35) 0%, rgba(37, 99, 235, 0) 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Left: User Welcome & Course Track info */}
        <div style={{ zIndex: 2, minWidth: 0, flex: 1, maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: 'rgba(59, 130, 246, 0.25)',
                color: '#93C5FD',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(96, 165, 250, 0.3)'
              }}
            >
              PH DIGITAL EDUCATION • LMS
            </span>

            {todaySchedule && (
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#FBBF24',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Calendar size={13} />
                <span>Lớp hôm nay: {todaySchedule.startTime} ({todaySchedule.title})</span>
              </span>
            )}
          </div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '0 0 8px',
              letterSpacing: '-0.02em',
              lineHeight: 1.3
            }}
          >
            Chào bạn, {currentUser.name || 'Học viên'} 👋
          </h1>

          <p
            style={{
              fontSize: '14.5px',
              color: '#CBD5E1',
              margin: '0 0 16px',
              lineHeight: 1.5,
              fontWeight: 500
            }}
          >
            Chương trình: <strong style={{ color: '#60A5FA' }}>{trackName}</strong>
          </p>

          {/* Progress Bar & Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94A3B8', fontWeight: 600 }}>
              <span>Tiến độ tích lũy kỹ năng</span>
              <span style={{ color: '#38BDF8', fontWeight: 700 }}>{masteryScore}% Hoàn thành</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.15)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${masteryScore}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #2563EB 0%, #38BDF8 100%)',
                  borderRadius: '999px',
                  transition: 'width 0.6s ease'
                }}
              />
            </div>
          </div>
        </div>

        {/* Right: Quick Action CTA + Streak Counter */}
        <div
          style={{
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '12px',
            flexShrink: 0
          }}
        >
          {/* Streak pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#FBBF24',
              fontSize: '13px',
              fontWeight: 700
            }}
          >
            <Flame size={16} fill="#F59E0B" color="#D97706" />
            <span>{streak || 1} Ngày học liên tục</span>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              onContinueLearning();
            }}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              fontSize: '14.5px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.5)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(37, 99, 235, 0.6)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(37, 99, 235, 0.5)';
            }}
          >
            <Play size={16} fill="#fff" />
            <span>Tiếp tục học chuyên đề</span>
          </button>
        </div>
      </div>

      {/* ── 2. QUICK SMART CHECK-IN BAR (Điểm danh lớp học) ── */}
      {(onOpenQRScanner || onOpenCheckInModal) && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid #BFDBFE'
              }}
            >
              <QrCode size={22} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                Điểm danh trực tiếp tại lớp học
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                Bật Camera quét mã QR trên màn hình giảng viên hoặc nhập mã PIN 6 số để ghi nhận chuyên cần.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {onOpenQRScanner && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenQRScanner();
                }}
                style={{
                  padding: '9px 18px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  borderRadius: '8px',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2563EB')}
              >
                <Camera size={16} />
                <span>Quét Mã QR</span>
              </button>
            )}

            {onOpenCheckInModal && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenCheckInModal();
                }}
                style={{
                  padding: '9px 16px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  color: '#1E293B',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#94A3B8')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#CBD5E1')}
              >
                <KeyRound size={15} />
                <span>Nhập Mã PIN</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 3. MAIN 2-COLUMN DASHBOARD BENTO GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '24px', alignItems: 'start' }}>
        
        {/* ── CỘT TRÁI (65%): CÁC MODULE HỌC TẬP & KHẢO THÍ CHÍNH ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card 1: Bài học kế tiếp nổi bật */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '22px 24px',
              boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563EB', marginBottom: '4px' }}>
                BÀI HỌC KẾ TIẾP ĐANG CHỜ
              </div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
                Chuyên đề: Tra cứu dữ liệu nâng cao với hàm XLOOKUP
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={14} color="#94A3B8" />
                <span>Thời lượng 12 phút • Nắm vững cú pháp chuẩn và xử lý lỗi thực tế</span>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                onContinueLearning();
              }}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 700,
                borderRadius: '8px',
                background: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2563EB')}
            >
              <Play size={15} fill="#fff" />
              <span>Học ngay</span>
            </button>
          </div>

          {/* Module Grid: 2 Cards song song */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* Module 1: Giáo trình bài giảng */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}
                >
                  <BookOpen size={20} />
                </div>
                <div style={{ fontSize: '15.5px', fontWeight: 700, color: '#0F172A' }}>
                  Giáo trình & Bài học
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', lineHeight: 1.45 }}>
                  Kho video bài giảng lý thuyết, tài liệu thực hành mẫu và giáo trình tương tác.
                </div>
              </div>

              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenLearningPath();
                }}
                style={{
                  width: '100%',
                  padding: '9px 0',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  color: '#2563EB',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>Xem lộ trình giáo trình</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Module 2: Khảo thí trắc nghiệm */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#ECFDF5',
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}
                >
                  <Award size={20} />
                </div>
                <div style={{ fontSize: '15.5px', fontWeight: 700, color: '#0F172A' }}>
                  Khảo thí chuẩn hóa
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', lineHeight: 1.45 }}>
                  Thi thử trắc nghiệm tính giờ chuẩn MOS, IC3 GS6 và đánh giá năng lực tức thì.
                </div>
              </div>

              <button
                onClick={() => {
                  soundFx.playClick();
                  onStartMiniTest();
                }}
                style={{
                  width: '100%',
                  padding: '9px 0',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  background: '#10B981',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
                }}
              >
                <span>Vào phòng thi thử</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Module 3: Nộp bài thực hành & Google Drive connection */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '20px 24px',
              boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <FileText size={20} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                  Bài tập thực hành & Nộp bài trực tuyến
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                  Tải lên file Word, Excel, PowerPoint bài tập để giảng viên chấm và phản hồi điểm trực tiếp.
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                onOpenAssignments();
              }}
              style={{
                padding: '9px 18px',
                fontSize: '13.5px',
                fontWeight: 600,
                borderRadius: '8px',
                background: '#F8FAFC',
                border: '1.5px solid #CBD5E1',
                color: '#1E293B',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Nộp bài tập</span>
              <ExternalLink size={14} />
            </button>
          </div>

        </div>

        {/* ── CỘT PHẢI (35%): TO-DO HUB & THÔNG MINH (INTELLIGENCE HUB) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Widget 1: Việc cần làm hôm nay (To-Do Hub) */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14.5px', fontWeight: 700, color: '#0F172A' }}>
                <ListTodo size={17} color="#2563EB" />
                <span>Việc cần làm hôm nay</span>
              </div>
              <span style={{ fontSize: '12px', background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                Hôm nay
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Task 1 */}
              <div
                onClick={() => { soundFx.playClick(); onContinueLearning(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
                      Học bài: Hàm tra cứu XLOOKUP
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                      Giáo trình • 12 phút
                    </div>
                  </div>
                </div>
                <ArrowRight size={14} color="#94A3B8" />
              </div>

              {/* Task 2 */}
              <div
                onClick={() => { soundFx.playClick(); onOpenAssignments(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
                      Nộp bài tập thực hành số 2
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                      Google Drive bài nộp
                    </div>
                  </div>
                </div>
                <ArrowRight size={14} color="#94A3B8" />
              </div>
            </div>
          </div>

          {/* Widget 2: Ôn tập củng cố (Spaced Repetition) */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14.5px', fontWeight: 700, color: '#D97706' }}>
                <RotateCcw size={17} />
                <span>Ôn tập & Củng cố</span>
              </div>
              <span style={{ fontSize: '12px', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                {dueReviewCount} câu cần ôn
              </span>
            </div>

            <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
              Thuật toán lặp lại ngắt quãng (Spaced Repetition) giúp ghi nhớ sâu các câu làm sai.
            </p>

            <button
              onClick={() => {
                soundFx.playClick();
                onStartSmartReview();
              }}
              style={{
                width: '100%',
                padding: '9px 0',
                borderRadius: '8px',
                background: '#D97706',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(217, 119, 6, 0.25)'
              }}
            >
              Ôn câu làm sai ngay
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '10px', fontSize: '12.5px' }}>
              <button
                onClick={() => { soundFx.playClick(); onOpenFlashcards(); }}
                style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Layers size={14} />
                <span>Thẻ Flashcards</span>
              </button>
              <button
                onClick={() => { soundFx.playClick(); onOpenBookmarks(); }}
                style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <BookmarkCheck size={14} />
                <span>Câu đã ghim</span>
              </button>
            </div>
          </div>

          {/* Widget 3: Kỹ năng chuyên môn (Skill Mastery) */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} color="#2563EB" />
                <span>Kỹ năng chuyên môn</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#2563EB' }}>
                {masteryScore}% chuẩn
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <SkillProgressBar label="Kiến thức nền tảng & Phím tắt" percent={100} color="#10B981" />
              <SkillProgressBar label="Công thức & Hàm tính toán" percent={82} color="#2563EB" />
              <SkillProgressBar label="Tra cứu dữ liệu (XLOOKUP)" percent={54} color="#F59E0B" />
              <SkillProgressBar label="Phân tích báo cáo PivotTable" percent={31} color="#8B5CF6" />
            </div>

            <div style={{ paddingTop: '8px', borderTop: '1px solid #F1F5F9', textAlign: 'right' }}>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenLearningPath();
                }}
                style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontWeight: 700, fontSize: '12.5px', padding: 0 }}
              >
                Xem chi tiết kỹ năng →
              </button>
            </div>
          </div>

          {/* Widget 4: Trợ lý Học vụ AI nhanh */}
          <div
            style={{
              background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
              border: '1px solid #DDD6FE',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 4px 16px -2px rgba(139, 92, 246, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14.5px', fontWeight: 700, color: '#6D28D9' }}>
              <Bot size={18} />
              <span>Trợ lý Học vụ AI (24/7)</span>
            </div>

            {/* Quick prompt pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleQuickPrompt('Giải thích sự khác nhau giữa VLOOKUP và XLOOKUP trong Excel')}
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid #C4B5FD',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  color: '#5B21B6',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                💡 So sánh VLOOKUP vs XLOOKUP?
              </button>

              <button
                type="button"
                onClick={() => handleQuickPrompt('Mẹo làm bài thi trắc nghiệm Tin học đạt điểm tối đa')}
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid #C4B5FD',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  color: '#5B21B6',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                🎯 Mẹo làm bài thi trắc nghiệm MOS?
              </button>
            </div>

            <form onSubmit={handleAiSubmit} style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <input
                type="text"
                value={aiInputText}
                onChange={(e) => setAiInputText(e.target.value)}
                placeholder="Nhập câu hỏi học vụ..."
                style={{
                  flex: 1,
                  height: '38px',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  border: '1px solid #C4B5FD',
                  fontSize: '13px',
                  padding: '0 12px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
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
                <Send size={15} />
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
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
      <span style={{ color: '#475569', fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 700, color }}>{percent}%</span>
    </div>
    <div style={{ width: '100%', height: '6px', borderRadius: '999px', background: '#F1F5F9', overflow: 'hidden' }}>
      <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: '999px' }} />
    </div>
  </div>
);
