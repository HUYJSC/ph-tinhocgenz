/**
 * LearnerDashboard — Portal học viên đầy đủ
 * Hiển thị: khóa học đã đăng ký, tiến độ, streak, lịch thi sắp tới
 * LMS EduQuest — PH Digital Education
 */
import { useState, useEffect } from 'react';
import {
  BookOpen, Award, ChevronRight, Play, BarChart3,
  Calendar, Flame, Target, Zap, Shield, Lock
} from 'lucide-react';
import type { Enrollment } from '../../types/course';

// ── Demo data (used when API not available) ──────────────────────────────────
const DEMO_ENROLLMENTS: Array<Enrollment & { course_title: string; course_track: string; progress: number }> = [
  {
    id: 'enr-1', student_id: 'std-101', course_id: 'course-office-fast',
    enrolled_at: '2026-09-01', status: 'active',
    course_title: 'Microsoft Office Cấp Tốc 3-in-1',
    course_track: 'office-fast-3in1', progress: 67
  },
  {
    id: 'enr-2', student_id: 'std-101', course_id: 'course-cc-cntt-basic',
    enrolled_at: '2026-09-05', status: 'active',
    course_title: 'Chứng Chỉ CNTT Cơ Bản (IC3)',
    course_track: 'cc-cntt-basic', progress: 33
  },
  {
    id: 'enr-3', student_id: 'std-101', course_id: 'course-ai-office',
    enrolled_at: '2026-09-10', status: 'active',
    course_title: 'Ứng Dụng AI Vào Văn Phòng',
    course_track: 'ai-office', progress: 10
  }
];

const TRACK_COLOR: Record<string, string> = {
  'office-fast-3in1': '#0057B8',
  'cc-cntt-basic': '#7C3AED',
  'ai-office': '#059669',
  'excel-accounting': '#D97706',
  'web-frontend': '#0284C7',
  'web-backend': '#0369A1',
};

interface LearnerStats {
  totalCourses: number;
  completedCourses: number;
  currentStreak: number;
  totalPoints: number;
  certificatesEarned: number;
  weeklyGoalHours: number;
  weeklyDoneHours: number;
}

interface LearnerDashboardProps {
  studentName?: string;
  onNavigateToCourse?: (courseId: string) => void;
  onNavigateToQuiz?: () => void;
  onNavigateToCertificates?: () => void;
}

function CircularProgress({ percentage, size = 80, strokeWidth = 6, color = '#0057B8' }: {
  percentage: number; size?: number; strokeWidth?: number; color?: string;
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth} />
      <circle
        cx={size/2} cy={size/2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text
        x={size/2} y={size/2}
        style={{ transform: `rotate(90deg) translate(0, -${size}px)`, transformOrigin: `${size/2}px ${size/2}px` }}
        textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={size / 5} fontWeight="700"
      >
        {percentage}%
      </text>
    </svg>
  );
}

function StatCard({ icon, label, value, color = '#0057B8', bg = '#EFF6FF' }: {
  icon: JSX.Element; label: string; value: string | number; color?: string; bg?: string;
}) {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '14px',
      padding: '20px', display: 'flex', alignItems: 'center', gap: '16px'
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>{value}</div>
        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{label}</div>
      </div>
    </div>
  );
}

export function LearnerDashboard({
  studentName = 'Học viên',
  onNavigateToCourse,
  onNavigateToQuiz,
  onNavigateToCertificates
}: LearnerDashboardProps) {
  const [enrollments] = useState(DEMO_ENROLLMENTS);
  const [stats] = useState<LearnerStats>({
    totalCourses: 3,
    completedCourses: 0,
    currentStreak: 7,
    totalPoints: 1240,
    certificatesEarned: 1,
    weeklyGoalHours: 10,
    weeklyDoneHours: 4.5
  });
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Chào buổi sáng');
    else if (h < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');
  }, []);

  const weeklyPercent = Math.round((stats.weeklyDoneHours / stats.weeklyGoalHours) * 100);

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Welcome Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0057B8 0%, #1D4ED8 60%, #2563EB 100%)',
          borderRadius: '20px', padding: '28px 32px', marginBottom: '24px',
          color: '#ffffff', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: '-30px', right: '-30px',
            width: '160px', height: '160px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)'
          }} />
          <div style={{
            position: 'absolute', bottom: '-20px', right: '80px',
            width: '100px', height: '100px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)'
          }} />
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '6px' }}>{greeting} 👋</div>
          <h1 style={{ margin: '0 0 6px', fontSize: '26px', fontWeight: '800' }}>
            {studentName}
          </h1>
          <div style={{ opacity: 0.85, fontSize: '14px' }}>
            Tiếp tục hành trình học tập của bạn hôm nay!
          </div>

          {/* Streak Badge */}
          <div style={{
            position: 'absolute', top: '24px', right: '28px',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            borderRadius: '12px', padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Flame size={20} color="#FCD34D" fill="#FCD34D" />
            <div>
              <div style={{ fontSize: '20px', fontWeight: '800' }}>{stats.currentStreak}</div>
              <div style={{ fontSize: '10px', opacity: 0.85 }}>ngày liên tiếp</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px', marginBottom: '24px'
        }}>
          <StatCard icon={<BookOpen size={22} />} label="Khóa học đang học" value={stats.totalCourses} />
          <StatCard icon={<Award size={22} />} label="Chứng chỉ đã đạt" value={stats.certificatesEarned} color="#059669" bg="#ECFDF5" />
          <StatCard icon={<Zap size={22} />} label="Tổng điểm tích lũy" value={`${stats.totalPoints.toLocaleString()}`} color="#D97706" bg="#FFFBEB" />
          <StatCard icon={<Target size={22} />} label="Mục tiêu tuần" value={`${stats.weeklyDoneHours}/${stats.weeklyGoalHours}h`} color="#7C3AED" bg="#F5F3FF" />
        </div>

        {/* Main Content: Courses + Progress */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>

          {/* Left: My Courses */}
          <div>
            <div style={{
              background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '16px',
              overflow: 'hidden', marginBottom: '20px'
            }}>
              <div style={{
                padding: '20px 24px', borderBottom: '1px solid #F1F5F9',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                  Khóa học của tôi
                </h2>
                <button
                  style={{ background: 'none', border: 'none', color: '#0057B8', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                  onClick={() => onNavigateToCourse?.('')}
                >
                  Xem tất cả <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
                </button>
              </div>

              <div style={{ padding: '8px 0' }}>
                {enrollments.map(enr => {
                  const color = TRACK_COLOR[enr.course_track] || '#0057B8';
                  return (
                    <div
                      key={enr.id}
                      onClick={() => onNavigateToCourse?.(enr.course_id)}
                      style={{
                        padding: '16px 24px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '16px',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Circular Progress */}
                      <div style={{ flexShrink: 0 }}>
                        <CircularProgress percentage={enr.progress} size={56} strokeWidth={5} color={color} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>
                          {enr.course_title}
                        </div>
                        <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${enr.progress}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.4s' }} />
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                          {enr.progress}% hoàn thành
                        </div>
                      </div>

                      <button style={{
                        flexShrink: 0, background: color, color: '#fff',
                        border: 'none', borderRadius: '8px',
                        padding: '6px 12px', fontSize: '12px', fontWeight: '600',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        <Play size={11} fill="currentColor" /> Tiếp tục
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'
            }}>
              <button
                onClick={onNavigateToQuiz}
                style={{
                  padding: '16px', background: '#ffffff', border: '1px solid #E2E8F0',
                  borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  transition: 'border-color 0.15s'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#0057B8')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: '#EFF6FF', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#0057B8', flexShrink: 0
                }}>
                  <BarChart3 size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>Luyện thi ngay</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Ngân hàng đề thi</div>
                </div>
              </button>

              <button
                onClick={onNavigateToCertificates}
                style={{
                  padding: '16px', background: '#ffffff', border: '1px solid #E2E8F0',
                  borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  transition: 'border-color 0.15s'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#059669')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: '#ECFDF5', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#059669', flexShrink: 0
                }}>
                  <Award size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>Chứng chỉ</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>{stats.certificatesEarned} đã đạt</div>
                </div>
              </button>
            </div>
          </div>

          {/* Right: Weekly Goal + Upcoming */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Weekly Goal */}
            <div style={{
              background: '#ffffff', border: '1px solid #E2E8F0',
              borderRadius: '16px', padding: '20px'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
                  Mục tiêu tuần này
                </h3>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>Thứ 2 – CN</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <CircularProgress percentage={weeklyPercent} size={100} strokeWidth={8} color="#0057B8" />
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
                <strong style={{ color: '#0F172A' }}>{stats.weeklyDoneHours}h</strong> / {stats.weeklyGoalHours}h đã học
              </div>

              {/* Day bars */}
              <div style={{
                display: 'flex', gap: '6px', marginTop: '16px',
                justifyContent: 'center', alignItems: 'flex-end', height: '40px'
              }}>
                {['T2','T3','T4','T5','T6','T7','CN'].map((day, i) => {
                  const heights = [80, 60, 100, 40, 70, 30, 0];
                  const isDone = heights[i] > 0;
                  return (
                    <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '24px',
                        height: `${Math.max(4, heights[i] * 0.36)}px`,
                        background: isDone ? '#0057B8' : '#E2E8F0',
                        borderRadius: '3px',
                        transition: 'height 0.3s'
                      }} />
                      <span style={{ fontSize: '9px', color: '#94A3B8' }}>{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Security Notice */}
            <div style={{
              background: '#F0FDF4', border: '1px solid #BBF7D0',
              borderRadius: '14px', padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Shield size={16} color="#16A34A" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#15803D' }}>
                  Thi cử được bảo mật
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#166534', lineHeight: '1.6' }}>
                Điểm số và chứng chỉ của bạn được lưu trên máy chủ — không thể can thiệp từ trình duyệt.
              </p>
            </div>

            {/* Upcoming Exams */}
            <div style={{
              background: '#ffffff', border: '1px solid #E2E8F0',
              borderRadius: '16px', padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Calendar size={16} color="#0057B8" />
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
                  Sắp tới
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { title: 'Đề thi MOS Excel', date: 'Thứ 5, 21/09', color: '#059669' },
                  { title: 'Bài kiểm tra Word', date: 'Thứ 6, 22/09', color: '#0057B8' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px', background: '#F8FAFC', borderRadius: '10px'
                  }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: item.color, flexShrink: 0
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#0F172A' }}>{item.title}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{item.date}</div>
                    </div>
                    <Lock size={12} color="#94A3B8" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
