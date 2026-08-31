import React, { useEffect, useState, useMemo } from 'react';
import { Quiz, QuizAttempt } from '../../types/quiz';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle2, XCircle, RotateCcw, Home, Award, ChevronDown, ChevronUp, Share2, Check, Download, BarChart3, AlertTriangle, BookOpen, Dumbbell } from 'lucide-react';
import { formatTime } from './QuizRunner';
import { soundFx } from '../../utils/audio';
import { WeakSkillService } from '../../services/weakSkillService';

interface QuizResultProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  studentName: string;
  onRetry: () => void;
  onGoHome: () => void;
  onPracticeSkill?: (skillId: string) => void;
}

export const QuizResult: React.FC<QuizResultProps> = ({
  quiz,
  attempt,
  studentName,
  onRetry,
  onGoHome,
  onPracticeSkill
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [showCertificate, setShowCertificate] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showSkillBreakdown, setShowSkillBreakdown] = useState(true);

  // [BA Section 13 & 15] Compute skill breakdown and detect weak skills
  const skillBreakdown = useMemo(() => WeakSkillService.computeSkillBreakdown(quiz, attempt), [quiz, attempt]);
  const weakSkills = useMemo(() => WeakSkillService.detectFromAttempt(quiz, attempt), [quiz, attempt]);
  const hasSkillData = skillBreakdown.some(s => !s.skillId.startsWith('no-skill-'));

  useEffect(() => {
    if (attempt.percentage >= 60) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // fallback
      }
    }
  }, [attempt.percentage]);

  const toggleExpand = (qId: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
    soundFx.playClick();
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    quiz.questions.forEach(q => (all[q.id] = true));
    setExpandedQuestions(all);
    soundFx.playClick();
  };

  const collapseAll = () => {
    setExpandedQuestions({});
    soundFx.playClick();
  };

  const handleShare = () => {
    const text = `🎉 Tôi vừa đạt ${attempt.score}/${attempt.maxScore} điểm (${attempt.percentage}%) trong bài thi "${quiz.title}" trên PH- TINHOCGENZ!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      soundFx.playClick();
    }
  };

  const getGradeEvaluation = (percentage: number) => {
    if (percentage >= 90) return { title: 'Xuất Sắc! 🌟', desc: 'Bạn đã làm chủ hoàn toàn các kiến thức này.', color: '#10b981' };
    if (percentage >= 70) return { title: 'Giỏi! 👏', desc: 'Kết quả rất ấn tượng! Hãy tiếp tục phát huy.', color: '#3b82f6' };
    if (percentage >= 50) return { title: 'Đạt Yêu Cầu 👍', desc: 'Khá tốt, hãy ôn lại những câu còn sai nhé.', color: '#f59e0b' };
    return { title: 'Cần Luyện Thêm 💪', desc: 'Đừng nản lòng, hãy xem lại giải thích và thử lại!', color: '#ef4444' };
  };

  const grade = getGradeEvaluation(attempt.percentage);

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%', padding: '16px' }} className="animate-slide-up">
      {/* Score Summary Card */}
      <div
        className="card"
        style={{
          padding: '32px 24px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'var(--accent-primary)',
            filter: 'blur(80px)',
            opacity: 0.3
          }}
        />

        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#fff',
            boxShadow: 'var(--shadow-glow)'
          }}
        >
          <Trophy size={36} />
        </div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: grade.color, marginBottom: '6px' }}>
          {grade.title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
          {grade.desc}
        </p>

        {/* Big Score Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px', marginBottom: '24px' }}>
          <span style={{ fontSize: '3.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {attempt.score}
          </span>
          <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>
            / {attempt.maxScore} điểm ({attempt.percentage}%)
          </span>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', maxWidth: '600px', margin: '0 auto 24px' }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Số câu đúng</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>
              {attempt.correctCount} / {attempt.totalQuestions}
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Thời gian làm</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {formatTime(attempt.timeSpentSeconds)}
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>XP Tích Lũy</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b' }}>
              +{attempt.score} XP
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <button onClick={onRetry} className="btn btn-secondary">
            <RotateCcw size={16} />
            <span>Làm lại bài</span>
          </button>

          <button onClick={() => setShowCertificate(true)} className="btn btn-primary" style={{ background: 'var(--accent-gradient)' }}>
            <Award size={16} />
            <span>Xem Giấy Chứng Nhận</span>
          </button>

          <button onClick={handleShare} className="btn btn-secondary">
            {copiedLink ? <Check size={16} color="#10b981" /> : <Share2 size={16} />}
            <span>{copiedLink ? 'Đã sao chép kết quả!' : 'Chia sẻ kết quả'}</span>
          </button>

          <button onClick={onGoHome} className="btn btn-secondary">
            <Home size={16} />
            <span>Về trang chủ</span>
          </button>
        </div>
      </div>

      {/* [BA Section 13] SKILL BREAKDOWN SECTION */}
      {hasSkillData && (
        <div className="card" style={{ marginBottom: '24px', padding: '20px 24px', borderRadius: 'var(--radius-xl)' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showSkillBreakdown ? '20px' : 0, cursor: 'pointer' }}
            onClick={() => setShowSkillBreakdown(prev => !prev)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(79,110,247,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                <BarChart3 size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>Phân tích kết quả theo kỹ năng</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{skillBreakdown.length} kỹ năng được phân tích</div>
              </div>
            </div>
            {showSkillBreakdown ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {showSkillBreakdown && (
            <div>
              {/* Skill bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: weakSkills.length > 0 ? '20px' : 0 }}>
                {skillBreakdown.map(skill => {
                  const color = skill.status === 'strong' ? '#10b981' : skill.status === 'average' ? '#f59e0b' : '#ef4444';
                  const label = skill.status === 'strong' ? 'Tốt ✅' : skill.status === 'average' ? 'Trung bình ⚠️' : 'Cần cải thiện 💪';
                  return (
                    <div key={skill.skillId}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{skill.skillName}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{skill.topicName}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: color, fontWeight: 700 }}>{label}</span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{skill.correctCount}/{skill.totalQuestions} ({skill.accuracy}%)</span>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '6px', borderRadius: '4px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                        <div style={{ width: `${skill.accuracy}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* [BA Section 15] Weak Skill Recommendations */}
              {weakSkills.length > 0 && (
                <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <AlertTriangle size={16} color="#ef4444" />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ef4444' }}>Kỹ năng cần cải thiện</span>
                  </div>
                  {weakSkills.slice(0, 3).map(ws => (
                    <div key={ws.skillId} style={{ marginBottom: '12px', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.06)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '3px' }}>{ws.skillName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{ws.reason}</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            if (onPracticeSkill) {
                              onPracticeSkill(ws.skillId);
                            } else {
                              onRetry();
                            }
                          }}
                          style={{ padding: '5px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Dumbbell size={13} /> Luyện lại
                        </button>
                        <button
                          onClick={() => { soundFx.playClick(); onGoHome(); }}
                          style={{ padding: '5px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(79,110,247,0.1)', border: '1px solid rgba(79,110,247,0.3)', color: 'var(--accent-primary)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <BookOpen size={13} /> Xem bài học
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Question by Question Review Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Xem lại chi tiết đáp án &amp; lời giải</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={expandAll} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            Mở tất cả
          </button>
          <button onClick={collapseAll} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            Thu gọn
          </button>
        </div>
      </div>

      {/* Questions Review List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {quiz.questions.map((q, idx) => {
          const res = attempt.questionResults.find(r => r.questionId === q.id);
          const isCorrect = res?.isCorrect ?? false;
          const isExpanded = Boolean(expandedQuestions[q.id]);

          return (
            <div
              key={q.id}
              className="card"
              style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                borderLeft: `4px solid ${isCorrect ? 'var(--success)' : 'var(--danger)'}`
              }}
            >
              {/* Header Accordion Bar */}
              <div
                onClick={() => toggleExpand(q.id)}
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {isCorrect ? (
                    <CheckCircle2 size={22} color="var(--success)" style={{ flexShrink: 0 }} />
                  ) : (
                    <XCircle size={22} color="var(--danger)" style={{ flexShrink: 0 }} />
                  )}
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', marginRight: '8px' }}>
                      Câu {idx + 1}:
                    </span>
                    <span style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                      {q.prompt.length > 70 ? `${q.prompt.substring(0, 70)}...` : q.prompt}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isCorrect ? 'var(--success)' : 'var(--danger)' }}>
                    {isCorrect ? `+${q.points} đ` : '0 đ'}
                  </span>
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '14px' }}>{q.prompt}</p>

                  {/* Options List */}
                  {q.type === 'single' && q.options && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                      {q.options.map((opt, oIdx) => {
                        const isCorrectOption = Number(q.correctAnswer) === oIdx;
                        const isUserOption = Number(res?.userAnswer) === oIdx;
                        return (
                          <div
                            key={oIdx}
                            style={{
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-md)',
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: isCorrectOption
                                ? 'var(--success-bg)'
                                : isUserOption && !isCorrectOption
                                ? 'var(--danger-bg)'
                                : 'var(--bg-secondary)',
                              border: isCorrectOption
                                ? '1px solid var(--success)'
                                : isUserOption && !isCorrectOption
                                ? '1px solid var(--danger)'
                                : '1px solid var(--border-color)',
                              color: isCorrectOption
                                ? '#10b981'
                                : isUserOption && !isCorrectOption
                                ? '#ef4444'
                                : 'var(--text-secondary)'
                            }}
                          >
                            <span>{opt}</span>
                            {isCorrectOption && <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>✓ Đáp án đúng</span>}
                            {isUserOption && !isCorrectOption && <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>✗ Bạn đã chọn</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation Box */}
                  <div
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      fontSize: '0.88rem',
                      lineHeight: 1.6
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '4px' }}>
                      💡 Lời giải chi tiết:
                    </div>
                    <div>{q.explanation}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowCertificate(false)}
        >
          <div
            className="card animate-slide-up"
            style={{
              width: '100%',
              maxWidth: '620px',
              padding: '36px 28px',
              textAlign: 'center',
              background: '#090d16',
              border: '3px solid #d97706',
              position: 'relative',
              boxShadow: '0 0 50px rgba(217, 119, 6, 0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.4)',
                  border: '2px solid #fbbf24'
                }}
              >
                <img
                  src="/logo-icon.png"
                  alt="PH Digital Education"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '10px' }}
                />
              </div>
            </div>
            <div style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.85rem', color: '#f59e0b', fontWeight: 800 }}>
              GIẤY CHỨNG NHẬN HOÀN THÀNH
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '10px 0 4px', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              PH DIGITAL EDUCATION
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', letterSpacing: '0.04em' }}>PH- TINHOCGENZ • Certificate of Achievement</p>

            <div style={{ margin: '28px 0', borderTop: '1px dashed rgba(255, 255, 255, 0.2)', borderBottom: '1px dashed rgba(255, 255, 255, 0.2)', padding: '20px 0' }}>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Trao tặng cho học viên:</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: '6px 0 12px' }}>
                {studentName}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                Đã hoàn thành xuất sắc bài kiểm tra chuyên đề:
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
                {quiz.title}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981', marginTop: '8px' }}>
                Điểm số: {attempt.score}/{attempt.maxScore} ({attempt.percentage}%)
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748b' }}>
              <div>Ngày cấp: {new Date().toLocaleDateString('vi-VN')}</div>
              <div>Mã xác thực: EQ-{attempt.id.slice(-8).toUpperCase()}</div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button onClick={() => window.print()} className="btn btn-primary" style={{ background: '#d97706' }}>
                <Download size={16} />
                <span>In / Lưu PDF</span>
              </button>
              <button onClick={() => setShowCertificate(false)} className="btn btn-secondary">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
