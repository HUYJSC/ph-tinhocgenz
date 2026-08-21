import React, { useState } from 'react';
import { UserProfile, CurriculumTrack } from '../../types/auth';
import { DiagnosticQuestion, DiagnosticResult } from '../../types/edtech';
import { Target, CheckCircle2, Award, ArrowRight, Sparkles, X } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface DiagnosticOnboardingModalProps {
  currentUser: UserProfile;
  onCompleteOnboarding: (result: DiagnosticResult) => void;
  onClose: () => void;
}

const SAMPLE_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'diag_1',
    skillId: 'excel_formula',
    skillName: 'Công thức & Hàm Excel Cơ bản',
    category: 'office-fast-3in1',
    prompt: 'Trong Excel, công thức nào sau đây tính trung bình cộng của vùng dữ liệu từ ô B2 đến B10?',
    options: ['=AVG(B2:B10)', '=AVERAGE(B2:B10)', '=MEAN(B2..B10)', '=SUM(B2:B10)/COUNT(B2)'],
    correctAnswer: 1,
    explanation: 'Hàm =AVERAGE(range) là cú pháp chuẩn để tính giá trị trung bình cộng trong Excel.',
    difficulty: 'easy'
  },
  {
    id: 'diag_2',
    skillId: 'excel_lookup',
    skillName: 'Hàm Tra Cứu (VLOOKUP / XLOOKUP)',
    category: 'office-fast-3in1',
    prompt: 'Khi sử dụng hàm VLOOKUP để tìm kiếm chính xác tuyệt đối, tham số thứ 4 (range_lookup) phải nhận giá trị gì?',
    options: ['1 hoặc TRUE', '0 hoặc FALSE', '-1', 'Bỏ trống'],
    correctAnswer: 1,
    explanation: 'Giá trị 0 hoặc FALSE đại diện cho chế độ Exact Match (tìm kiếm chính xác từng ký tự).',
    difficulty: 'medium'
  },
  {
    id: 'diag_3',
    skillId: 'word_formatting',
    skillName: 'Định dạng Văn bản & Canh lề Word',
    category: 'word-6b',
    prompt: 'Tổ hợp phím tắt nào dùng để căn lề đều hai bên (Justify) cho đoạn văn bản trong Microsoft Word?',
    options: ['Ctrl + E', 'Ctrl + L', 'Ctrl + J', 'Ctrl + R'],
    correctAnswer: 2,
    explanation: 'Ctrl + J dùng để căn lề hai bên (Justify), Ctrl + E căn giữa, Ctrl + L căn trái, Ctrl + R căn phải.',
    difficulty: 'easy'
  },
  {
    id: 'diag_4',
    skillId: 'excel_f4',
    skillName: 'Tham Chiếu Tuyệt Đối & Địa Chỉ Ô',
    category: 'office-fast-3in1',
    prompt: 'Phím tắt nào giúp nhanh chóng chuyển đổi qua lại giữa địa chỉ tương đối (A1) và địa chỉ tuyệt đối ($A$1)?',
    options: ['F2', 'F4', 'F9', 'Ctrl + F4'],
    correctAnswer: 1,
    explanation: 'Phím F4 (hoặc Fn + F4 trên một số dòng laptop) dùng để khóa địa chỉ tuyệt đối trong Excel.',
    difficulty: 'easy'
  },
  {
    id: 'diag_5',
    skillId: 'ppt_presentation',
    skillName: 'Thiết Kế Slide & Hiệu Ứng PowerPoint',
    category: 'ppt-6b',
    prompt: 'Để bắt đầu trình chiếu toàn màn hình từ Slide đầu tiên trong PowerPoint, bạn nhấn phím nào?',
    options: ['F5', 'Shift + F5', 'Ctrl + P', 'F11'],
    correctAnswer: 0,
    explanation: 'F5 bắt đầu trình chiếu từ slide đầu, Shift + F5 bắt đầu từ slide hiện tại.',
    difficulty: 'easy'
  }
];

export const DiagnosticOnboardingModal: React.FC<DiagnosticOnboardingModalProps> = ({
  currentUser,
  onCompleteOnboarding,
  onClose
}) => {
  const [step, setStep] = useState<'goal_select' | 'test_runner' | 'result_summary'>('goal_select');
  const [selectedGoal, setSelectedGoal] = useState<string>('Ôn thi chứng chỉ chuẩn quốc tế (MOS / IC3 / CNTT)');
  const selectedTrack: CurriculumTrack = currentUser.programTrack || 'office-fast-3in1';
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIndex: number]: number }>({});
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);

  const handleSelectGoalAndStartTest = () => {
    soundFx.playClick();
    setStep('test_runner');
  };

  const handleSelectAnswer = (optIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQIndex]: optIndex }));
    soundFx.playClick();
  };

  const handleNextOrFinish = () => {
    if (currentQIndex < SAMPLE_DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      soundFx.playClick();
    } else {
      // Calculate Diagnostic Score
      let correct = 0;
      const skillBreakdown: { [skillId: string]: { name: string; score: number } } = {};
      const strengths: string[] = [];
      const weaknesses: string[] = [];

      SAMPLE_DIAGNOSTIC_QUESTIONS.forEach((q, idx) => {
        const isRight = selectedAnswers[idx] === q.correctAnswer;
        if (isRight) correct++;
        const skillScore = isRight ? 100 : 35;
        skillBreakdown[q.skillId] = { name: q.skillName, score: skillScore };
        if (isRight) strengths.push(q.skillName);
        else weaknesses.push(q.skillName);
      });

      const totalPct = Math.round((correct / SAMPLE_DIAGNOSTIC_QUESTIONS.length) * 100);

      const result: DiagnosticResult = {
        studentId: currentUser.id,
        track: selectedTrack,
        targetGoal: selectedGoal,
        totalScore: totalPct,
        skillBreakdown,
        strengths: strengths.length > 0 ? strengths : ['Kỹ năng nhận diện giao diện'],
        weaknesses: weaknesses.length > 0 ? weaknesses : ['Công thức nâng cao'],
        recommendedStartNodeId: totalPct >= 80 ? 'node_adv' : 'node_core',
        completedAt: new Date().toISOString()
      };

      setDiagnosticResult(result);
      setStep('result_summary');
      soundFx.playVictory();
    }
  };

  const handleFinishOnboarding = () => {
    if (diagnosticResult) {
      onCompleteOnboarding(diagnosticResult);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      className="animate-fade-in"
    >
      <div
        className="card animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '650px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '24px',
          padding: '28px',
          background: 'var(--bg-card)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
          border: '1.5px solid var(--border-color)'
        }}
      >
        {/* ── STEP 1: GOAL SELECTION ── */}
        {step === 'goal_select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}>
            <button
              onClick={onClose}
              className="btn btn-icon"
              style={{ position: 'absolute', right: 0, top: 0, width: '32px', height: '32px', borderRadius: '50%' }}
            >
              <X size={16} />
            </button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'var(--brand-light)', color: 'var(--brand)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <Target size={26} />
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                Chào mừng bạn đến với TinHocGenZ!
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                Hãy chọn mục tiêu học tập và làm bài kiểm tra đầu vào 3 phút để hệ thống tối ưu hóa lộ trình riêng cho bạn.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
                1. Mục Tiêu Học Tập Chính Của Bạn:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  'Ôn thi chứng chỉ chuẩn quốc tế (MOS / IC3 / CNTT)',
                  'Thành thạo kỹ năng tin học để đi làm văn phòng / doanh nghiệp',
                  'Nâng cao hiệu suất với hàm Excel nâng cao & AI Văn phòng',
                  'Học cấp tốc 3 buổi để phục vụ công việc và học tập'
                ].map(goal => (
                  <div
                    key={goal}
                    onClick={() => {
                      setSelectedGoal(goal);
                      soundFx.playClick();
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: selectedGoal === goal ? 'var(--brand-light)' : 'var(--bg-secondary)',
                      border: selectedGoal === goal ? '2px solid var(--brand)' : '1px solid var(--border-color)',
                      color: selectedGoal === goal ? 'var(--brand)' : 'var(--text-primary)',
                      fontWeight: selectedGoal === goal ? 800 : 500,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <CheckCircle2 size={16} color={selectedGoal === goal ? 'var(--brand)' : 'var(--text-muted)'} />
                    <span>{goal}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={handleSelectGoalAndStartTest}
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontSize: '0.88rem', fontWeight: 900, borderRadius: '12px', gap: '8px' }}
              >
                <span>BẮT ĐẦU KIỂM TRA ĐẦU VÀO (5 CÂU)</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: DIAGNOSTIC TEST RUNNER ── */}
        {step === 'test_runner' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--brand)', background: 'var(--brand-light)', padding: '3px 10px', borderRadius: '999px' }}>
                ĐÁNH GIÁ ĐẦU VÀO • CÂU {currentQIndex + 1}/{SAMPLE_DIAGNOSTIC_QUESTIONS.length}
              </span>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                {SAMPLE_DIAGNOSTIC_QUESTIONS[currentQIndex].skillName}
              </span>
            </div>

            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {SAMPLE_DIAGNOSTIC_QUESTIONS[currentQIndex].prompt}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {SAMPLE_DIAGNOSTIC_QUESTIONS[currentQIndex].options.map((opt, oidx) => {
                const isSelected = selectedAnswers[currentQIndex] === oidx;
                return (
                  <button
                    key={oidx}
                    onClick={() => handleSelectAnswer(oidx)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: isSelected ? 'var(--brand-light)' : 'var(--bg-secondary)',
                      border: isSelected ? '2px solid var(--brand)' : '1px solid var(--border-color)',
                      color: isSelected ? 'var(--brand)' : 'var(--text-primary)',
                      fontWeight: isSelected ? 800 : 500,
                      fontSize: '0.86rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: isSelected ? 'var(--brand)' : 'var(--bg-card)', color: isSelected ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.76rem', fontWeight: 800 }}>
                      {String.fromCharCode(65 + oidx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={handleNextOrFinish}
                disabled={selectedAnswers[currentQIndex] === undefined}
                className="btn btn-primary"
                style={{ padding: '10px 22px', fontWeight: 800, borderRadius: '10px', opacity: selectedAnswers[currentQIndex] === undefined ? 0.5 : 1 }}
              >
                {currentQIndex === SAMPLE_DIAGNOSTIC_QUESTIONS.length - 1 ? 'XEM KẾT QUẢ ĐẦU VÀO' : 'CÂU TIẾP THEO ➔'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: RESULT & PERSONALIZED ROADMAP SUMMARY ── */}
        {step === 'result_summary' && diagnosticResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <Award size={30} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                Hoàn Thành Khảo Sát Đầu Vào!
              </h2>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Điểm Đánh Giá Ban Đầu: <strong style={{ color: 'var(--brand)', fontSize: '1.1rem' }}>{diagnosticResult.totalScore}%</strong>
              </div>
            </div>

            {/* Skill Breakdown */}
            <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                📊 Phân Tích Kỹ Năng Nguyên Tử:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.values(diagnosticResult.skillBreakdown).map((skill, sidx) => (
                  <div key={sidx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{skill.name}</span>
                    <span style={{ fontWeight: 800, color: skill.score >= 80 ? '#10b981' : '#f59e0b' }}>
                      {skill.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#059669', marginBottom: '4px' }}>
                  ✓ ĐIỂM MẠNH:
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                  {diagnosticResult.strengths.join(', ')}
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#dc2626', marginBottom: '4px' }}>
                  ⚠️ CẦN TẬP TRUNG ÔN:
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                  {diagnosticResult.weaknesses.join(', ')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
              <button
                onClick={handleFinishOnboarding}
                className="btn btn-primary"
                style={{ padding: '12px 26px', fontSize: '0.88rem', fontWeight: 900, borderRadius: '12px', gap: '8px' }}
              >
                <Sparkles size={16} />
                <span>KÍCH HOẠT LỘ TRÌNH CÁ NHÂN HÓA</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
