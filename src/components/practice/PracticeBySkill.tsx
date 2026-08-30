import React, { useState, useMemo } from 'react';
import { Quiz, Question } from '../../types/quiz';
import { WeakSkill } from '../../types/skill';
import {
  Dumbbell, Filter, ChevronRight, X, BookOpen,
  CheckCircle2, XCircle, ArrowRight, ArrowLeft, RotateCcw, Target
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface PracticeBySkillProps {
  quizzes: Quiz[];
  weakSkills?: WeakSkill[];
  initialSkillId?: string;
  onBack: () => void;
}

// Group questions by skillId across all quizzes
function groupQuestionsBySkill(quizzes: Quiz[]): Record<string, { skill: string; topic: string; subject: string; questions: Question[] }> {
  const skillMap: Record<string, { skill: string; topic: string; subject: string; questions: Question[] }> = {};

  quizzes.forEach(quiz => {
    quiz.questions.forEach(q => {
      if (!q.skillId) return;
      if (!skillMap[q.skillId]) {
        skillMap[q.skillId] = {
          skill: q.skillId.replace(/skill-/g, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          topic: q.topicId ? q.topicId.replace(/topic-/g, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Chung',
          subject: q.subjectId || '',
          questions: []
        };
      }
      skillMap[q.skillId].questions.push(q);
    });
  });

  return skillMap;
}

interface SessionResult {
  questionId: string;
  isCorrect: boolean;
  userAnswer: any;
}

export const PracticeBySkill: React.FC<PracticeBySkillProps> = ({
  quizzes,
  weakSkills = [],
  initialSkillId,
  onBack
}) => {
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(initialSkillId || null);
  const [filterMode, setFilterMode] = useState<'all' | 'weak'>('all');
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, any>>({});
  const [sessionRevealed, setSessionRevealed] = useState<Record<string, boolean>>({});
  const [sessionFinished, setSessionFinished] = useState(false);
  const [results, setResults] = useState<SessionResult[]>([]);

  // Update selectedSkillId if initialSkillId changes
  React.useEffect(() => {
    if (initialSkillId) {
      setSelectedSkillId(initialSkillId);
      setSessionIndex(0);
      setSessionAnswers({});
      setSessionRevealed({});
      setSessionFinished(false);
      setResults([]);
    }
  }, [initialSkillId]);

  const skillMap = useMemo(() => groupQuestionsBySkill(quizzes), [quizzes]);
  const weakSkillIds = useMemo(() => new Set(weakSkills.map(w => w.skillId)), [weakSkills]);

  const displayedSkills = useMemo(() => {
    return Object.entries(skillMap)
      .filter(([id]) => filterMode === 'all' || weakSkillIds.has(id))
      .sort((a, b) => {
        // Sort: weak skills first
        const aWeak = weakSkillIds.has(a[0]) ? 0 : 1;
        const bWeak = weakSkillIds.has(b[0]) ? 0 : 1;
        return aWeak - bWeak;
      });
  }, [skillMap, filterMode, weakSkillIds]);

  const sessionQuestions = selectedSkillId ? (skillMap[selectedSkillId]?.questions || []) : [];
  const currentQ = sessionQuestions[sessionIndex];

  const handleSelectSkill = (skillId: string) => {
    setSelectedSkillId(skillId);
    setSessionIndex(0);
    setSessionAnswers({});
    setSessionRevealed({});
    setSessionFinished(false);
    setResults([]);
    soundFx.playClick();
  };

  const handleAnswer = (questionId: string, answer: any) => {
    if (sessionRevealed[questionId]) return;
    setSessionAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleReveal = (question: Question) => {
    if (sessionAnswers[question.id] === undefined) return;
    const userAns = sessionAnswers[question.id];
    let isCorrect = false;

    if (question.type === 'single') {
      isCorrect = Number(userAns) === Number(question.correctAnswer);
    } else if (question.type === 'true-false') {
      isCorrect = Boolean(userAns) === Boolean(question.correctAnswer);
    }

    if (isCorrect) soundFx.playCorrect();
    else soundFx.playIncorrect();

    setSessionRevealed(prev => ({ ...prev, [question.id]: true }));
    setResults(prev => [...prev.filter(r => r.questionId !== question.id), { questionId: question.id, isCorrect, userAnswer: userAns }]);
  };

  const handleNext = () => {
    if (sessionIndex < sessionQuestions.length - 1) {
      setSessionIndex(i => i + 1);
    } else {
      setSessionFinished(true);
    }
  };

  const handleRestart = () => {
    setSessionIndex(0);
    setSessionAnswers({});
    setSessionRevealed({});
    setSessionFinished(false);
    setResults([]);
    soundFx.playClick();
  };

  const correctCount = results.filter(r => r.isCorrect).length;

  // ── FINISHED SCREEN ──
  if (sessionFinished && selectedSkillId) {
    const skillInfo = skillMap[selectedSkillId];
    const accuracy = sessionQuestions.length > 0 ? Math.round((correctCount / sessionQuestions.length) * 100) : 0;
    const color = accuracy >= 75 ? '#10b981' : accuracy >= 50 ? '#f59e0b' : '#ef4444';

    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 16px' }}>
        <div className="card animate-slide-up" style={{ padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: `${color}20`, border: `2px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color }}>
            <Target size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
            {accuracy >= 75 ? 'Tốt lắm! 🎉' : accuracy >= 50 ? 'Khá ổn 👍' : 'Cần luyện thêm 💪'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Kỹ năng: <strong>{skillInfo.skill}</strong>
          </p>

          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '28px' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color }}>{accuracy}%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Độ chính xác</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>{correctCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Câu đúng</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-muted)' }}>{sessionQuestions.length - correctCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Câu sai</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleRestart} className="btn btn-secondary">
              <RotateCcw size={16} /> Luyện lại
            </button>
            <button onClick={() => setSelectedSkillId(null)} className="btn btn-primary">
              <Filter size={16} /> Chọn kỹ năng khác
            </button>
            <button onClick={onBack} className="btn btn-secondary">
              <ArrowLeft size={16} /> Về Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PRACTICE SESSION ──
  if (selectedSkillId && currentQ) {
    const skillInfo = skillMap[selectedSkillId];
    const isRevealed = sessionRevealed[currentQ.id];
    const userAnswer = sessionAnswers[currentQ.id];
    const hasAnswered = userAnswer !== undefined;
    const isCorrect = results.find(r => r.questionId === currentQ.id)?.isCorrect;

    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '16px' }}>
        {/* Header */}
        <div className="card" style={{ padding: '12px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setSelectedSkillId(null)} className="btn btn-secondary btn-icon" style={{ width: '36px', height: '36px' }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{skillInfo.skill}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Câu {sessionIndex + 1}/{sessionQuestions.length} · {skillInfo.topic}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {sessionQuestions.map((_, i) => (
              <div key={i} style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: i < sessionIndex
                  ? (results[i]?.isCorrect ? '#10b981' : '#ef4444')
                  : i === sessionIndex ? 'var(--accent-primary)' : 'var(--border-color)'
              }} />
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.6, marginBottom: '20px' }}>
            {currentQ.prompt}
          </p>

          {/* Options */}
          {currentQ.type === 'single' && currentQ.options && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentQ.options.map((opt, i) => {
                const isSelected = userAnswer === i;
                const isRightAnswer = Number(currentQ.correctAnswer) === i;
                let bg = 'var(--bg-secondary)';
                let border = 'var(--border-color)';
                if (isRevealed) {
                  if (isRightAnswer) { bg = 'rgba(16,185,129,0.1)'; border = '#10b981'; }
                  else if (isSelected && !isRightAnswer) { bg = 'rgba(239,68,68,0.1)'; border = '#ef4444'; }
                } else if (isSelected) {
                  bg = 'rgba(79,110,247,0.1)'; border = 'var(--accent-primary)';
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(currentQ.id, i)}
                    disabled={isRevealed}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
                      background: bg, border: `1px solid ${border}`,
                      textAlign: 'left', cursor: isRevealed ? 'default' : 'pointer',
                      fontSize: '0.9rem', fontWeight: isSelected ? 600 : 400,
                      display: 'flex', alignItems: 'center', gap: '10px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: isSelected ? 'var(--accent-primary)' : 'var(--bg-base)', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: isSelected ? '#fff' : 'var(--text-muted)', flexShrink: 0 }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                    {isRevealed && isRightAnswer && <CheckCircle2 size={16} color="#10b981" style={{ marginLeft: 'auto' }} />}
                    {isRevealed && isSelected && !isRightAnswer && <XCircle size={16} color="#ef4444" style={{ marginLeft: 'auto' }} />}
                  </button>
                );
              })}
            </div>
          )}

          {/* True/False */}
          {currentQ.type === 'true-false' && (
            <div style={{ display: 'flex', gap: '10px' }}>
              {[true, false].map(val => {
                const isSelected = userAnswer === val;
                const isRight = Boolean(currentQ.correctAnswer) === val;
                return (
                  <button
                    key={String(val)}
                    onClick={() => handleAnswer(currentQ.id, val)}
                    disabled={isRevealed}
                    style={{
                      flex: 1, padding: '14px', borderRadius: 'var(--radius-md)', fontWeight: 700,
                      background: isRevealed ? (isRight ? 'rgba(16,185,129,0.1)' : isSelected ? 'rgba(239,68,68,0.1)' : 'var(--bg-secondary)') : isSelected ? 'rgba(79,110,247,0.1)' : 'var(--bg-secondary)',
                      border: `2px solid ${isRevealed ? (isRight ? '#10b981' : isSelected ? '#ef4444' : 'var(--border-color)') : isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      cursor: isRevealed ? 'default' : 'pointer'
                    }}
                  >
                    {val ? '✅ Đúng' : '❌ Sai'}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Explanation */}
        {isRevealed && (
          <div style={{
            padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px',
            background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: isCorrect ? '#10b981' : '#ef4444' }}>
              {isCorrect ? '✅ Chính xác!' : '❌ Chưa đúng.'}
            </div>
            <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {currentQ.explanation}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
          <button onClick={() => setSelectedSkillId(null)} className="btn btn-secondary">
            <X size={15} /> Thoát
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isRevealed && hasAnswered && (
              <button onClick={() => handleReveal(currentQ)} className="btn btn-primary" style={{ background: 'var(--accent-gradient)' }}>
                <BookOpen size={15} /> Xem đáp án
              </button>
            )}
            {isRevealed && (
              <button onClick={handleNext} className="btn btn-primary" style={{ background: 'var(--accent-gradient-emerald)' }}>
                {sessionIndex < sessionQuestions.length - 1 ? (
                  <><span>Câu tiếp</span> <ArrowRight size={15} /></>
                ) : (
                  <><span>Xem kết quả</span> <Target size={15} /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── SKILL SELECTOR ──
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={onBack} className="btn btn-secondary btn-icon" style={{ width: '36px', height: '36px' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Luyện tập theo kỹ năng</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            Chọn kỹ năng cần luyện tập — câu hỏi sẽ được lọc tự động
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => { setFilterMode('all'); soundFx.playClick(); }}
          className={filterMode === 'all' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ padding: '7px 16px', fontSize: '0.85rem' }}
        >
          Tất cả kỹ năng ({displayedSkills.length})
        </button>
        {weakSkills.length > 0 && (
          <button
            onClick={() => { setFilterMode('weak'); soundFx.playClick(); }}
            className={filterMode === 'weak' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ padding: '7px 16px', fontSize: '0.85rem', background: filterMode === 'weak' ? 'rgba(239,68,68,0.85)' : undefined, border: filterMode !== 'weak' ? '1px solid rgba(239,68,68,0.4)' : undefined }}
          >
            ⚠️ Kỹ năng yếu ({weakSkills.length})
          </button>
        )}
      </div>

      {/* Skill grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
        {displayedSkills.map(([skillId, info]) => {
          const isWeak = weakSkillIds.has(skillId);
          const weakData = weakSkills.find(w => w.skillId === skillId);

          return (
            <button
              key={skillId}
              onClick={() => handleSelectSkill(skillId)}
              style={{
                padding: '18px 20px', borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-card)',
                border: `1px solid ${isWeak ? 'rgba(239,68,68,0.35)' : 'var(--border-color)'}`,
                textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', gap: '8px',
                boxShadow: isWeak ? '0 0 0 1px rgba(239,68,68,0.1)' : 'none'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isWeak ? '0 0 0 1px rgba(239,68,68,0.1)' : 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{info.skill}</div>
                {isWeak && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '100px', border: '1px solid rgba(239,68,68,0.25)' }}>
                    Cần luyện
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{info.topic}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Dumbbell size={13} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{info.questions.length} câu hỏi</span>
                </div>
                {weakData && (
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>
                    {weakData.accuracy}% đúng
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                Bắt đầu luyện <ChevronRight size={14} />
              </div>
            </button>
          );
        })}
      </div>

      {displayedSkills.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
          <Dumbbell size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <p>Không có kỹ năng nào phù hợp với bộ lọc này.</p>
        </div>
      )}
    </div>
  );
};
