import React from 'react';
import { UserStats } from '../../types/quiz';
import { DEFAULT_BADGES } from '../../data/badges';
import { Trophy, Flame, Target, BookOpen, Clock, Zap, RotateCcw } from 'lucide-react';
import { formatTime } from '../quiz/QuizRunner';

interface DashboardProps {
  stats: UserStats;
  onResetProgress: () => void;
}

export function getUserLevelInfo(points: number) {
  if (points < 100) return { level: 1, name: 'Tân Binh Học Tập', min: 0, max: 100, color: '#94a3b8' };
  if (points < 300) return { level: 2, name: 'Học Viên Năng Động', min: 100, max: 300, color: '#38bdf8' };
  if (points < 600) return { level: 3, name: 'Học Giả Siêu Cấp', min: 300, max: 600, color: '#818cf8' };
  if (points < 1000) return { level: 4, name: 'Bậc Thầy Tri Thức', min: 600, max: 1000, color: '#f59e0b' };
  return { level: 5, name: 'Huyền Thoại EduQuest', min: 1000, max: 2500, color: '#ec4899' };
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, onResetProgress }) => {
  const levelInfo = getUserLevelInfo(stats.totalPoints);
  const xpInCurrentLevel = stats.totalPoints - levelInfo.min;
  const xpNeeded = levelInfo.max - levelInfo.min;
  const levelProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100));

  // Calculate average accuracy
  const totalAttempts = stats.history.length;
  const avgPercentage = totalAttempts > 0
    ? Math.round(stats.history.reduce((sum, h) => sum + h.percentage, 0) / totalAttempts)
    : 0;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '16px' }} className="animate-slide-up">
      {/* Top Banner: Level & XP */}
      <div
        className="card"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge" style={{ background: levelInfo.color, color: '#000', fontWeight: 800 }}>
                LEVEL {levelInfo.level}
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {levelInfo.name}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Xin chào, <b>{stats.studentName}</b>! Hãy hoàn thành thêm bài tập để thăng cấp.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
              {stats.totalPoints} XP
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Cần {levelInfo.max - stats.totalPoints > 0 ? levelInfo.max - stats.totalPoints : 0} XP nữa để lên cấp tiếp
            </div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div>
          <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(0, 0, 0, 0.3)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${levelProgressPercent}%`,
                height: '100%',
                background: 'var(--accent-gradient)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {/* Streak */}
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <Flame size={20} fill="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chuỗi Ngày Học</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b' }}>{stats.currentStreak} ngày</div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Kỷ lục: {stats.bestStreak} ngày liên tiếp</div>
        </div>

        {/* Total Quizzes */}
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bài Đã Hoàn Thành</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.totalQuizzesTaken}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Đã làm {stats.history.length} lượt thi</div>
        </div>

        {/* Average Accuracy */}
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Target size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tỷ Lệ Chính Xác TB</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>{avgPercentage}%</div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Độ chính xác các bài kiểm tra</div>
        </div>

        {/* Badges Unlocked */}
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
              <Trophy size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Huy Hiệu Đạt Được</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#a855f7' }}>
                {stats.unlockedBadgeIds.length} / {DEFAULT_BADGES.length}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Thành tích Gamification</div>
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={20} color="var(--accent-primary)" />
          <span>Bộ Sưu Tập Huy Hiệu & Thành Tích</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {DEFAULT_BADGES.map(badge => {
            const isUnlocked = stats.unlockedBadgeIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: isUnlocked ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-secondary)',
                  border: isUnlocked ? '1.5px solid rgba(99, 102, 241, 0.4)' : '1px dashed var(--border-color)',
                  opacity: isUnlocked ? 1 : 0.45,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ fontSize: '1.8rem', filter: isUnlocked ? 'none' : 'grayscale(100%)' }}>
                  {badge.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {badge.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {badge.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Test History */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="var(--accent-primary)" />
            <span>Lịch Sử Làm Bài Gần Đây</span>
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stats.history.length} lượt thi</span>
        </div>

        {stats.history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            Chưa có bài thi nào được ghi nhận. Hãy chọn một bài tập để bắt đầu nhé!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.history.slice(0, 10).map(attempt => (
              <div
                key={attempt.id}
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {attempt.quizTitle}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '10px', marginTop: '2px' }}>
                    <span>{new Date(attempt.completedAt).toLocaleDateString('vi-VN')} {new Date(attempt.completedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>•</span>
                    <span>Thời gian: {formatTime(attempt.timeSpentSeconds)}</span>
                    <span>•</span>
                    <span style={{ textTransform: 'capitalize' }}>Chế độ: {attempt.mode === 'exam' ? 'Kiểm tra ⏱️' : 'Luyện tập 💡'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: attempt.percentage >= 70 ? '#10b981' : '#f59e0b' }}>
                      {attempt.score} / {attempt.maxScore} đ
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {attempt.percentage}% ({attempt.correctCount}/{attempt.totalQuestions} đúng)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone: Reset Data */}
      <div style={{ textAlign: 'center', padding: '16px' }}>
        <button
          onClick={onResetProgress}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--danger)',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RotateCcw size={14} />
          <span>Đặt lại toàn bộ điểm số & tiến độ học tập</span>
        </button>
      </div>
    </div>
  );
};
