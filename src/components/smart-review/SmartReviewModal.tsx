import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types/auth';
import { SmartReviewItem } from '../../types/edtech';
import { SmartReviewService } from '../../services/smartReviewService';
import { MasteryService } from '../../services/masteryService';
import { RotateCcw, Check, X, Bot, ArrowRight, Award } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface SmartReviewModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onAskAITutor: (questionPrompt: string) => void;
}

export const SmartReviewModal: React.FC<SmartReviewModalProps> = ({
  currentUser,
  onClose,
  onAskAITutor
}) => {
  const [reviewItems, setReviewItems] = useState<SmartReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [resolvedCount, setResolvedCount] = useState(0);

  useEffect(() => {
    const due = SmartReviewService.getDueReviews(currentUser.id);
    if (due.length > 0) {
      setReviewItems(due);
    } else {
      // Fallback seed for demo / practice
      const sampleMistakes = SmartReviewService.getReviewVault(currentUser.id);
      if (sampleMistakes.length > 0) {
        setReviewItems(sampleMistakes);
      } else {
        // Seed initial sample review items
        const seeded = [
          SmartReviewService.recordMistake(currentUser.id, {
            questionId: 'seed_err_1',
            skillId: 'excel_lookup',
            skillName: 'Hàm VLOOKUP & XLOOKUP',
            category: 'office-fast-3in1',
            prompt: 'Trong Excel, điều kiện bắt buộc nào đúng đối với cột tìm kiếm khi sử dụng hàm VLOOKUP?',
            options: [
              'Cột tìm kiếm phải là cột đầu tiên bên trái vùng dữ liệu',
              'Cột tìm kiếm có thể nằm ở bất kỳ vị trí nào',
              'Cột tìm kiếm phải được sắp xếp theo thứ tự giảm dần',
              'Không cần cố định vùng dữ liệu bằng F4'
            ],
            correctAnswer: 0,
            userAnswer: 1,
            explanation: 'VLOOKUP chỉ tìm kiếm từ trái sang phải, do đó cột chứa giá trị dò tìm bắt buộc phải là cột đầu tiên bên trái của bảng dữ liệu.'
          }),
          SmartReviewService.recordMistake(currentUser.id, {
            questionId: 'seed_err_2',
            skillId: 'excel_f4',
            skillName: 'Tham Chiếu Tuyệt Đối',
            category: 'office-fast-3in1',
            prompt: 'Địa chỉ ô $B5 trong Excel có ý nghĩa là gì?',
            options: [
              'Cố định cột B, dòng 5 thay đổi khi sao chép công thức',
              'Cố định dòng 5, cột B thay đổi',
              'Cố định cả dòng 5 và cột B',
              'Địa chỉ tương đối thông thường'
            ],
            correctAnswer: 0,
            userAnswer: 2,
            explanation: 'Dấu $ đứng trước ký tự nào thì khóa cứng phần tử đó: $B5 là cố định cột B (hỗn hợp), dòng 5 tự do.'
          })
        ];
        setReviewItems(seeded);
      }
    }
  }, [currentUser.id]);

  const currentItem = reviewItems[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentItem.correctAnswer;
    if (isCorrect) {
      soundFx.playCorrect();
      setResolvedCount(prev => prev + 1);
      SmartReviewService.recordCorrectReview(currentUser.id, currentItem.id);
      MasteryService.recordSkillAttempt(currentUser.id, currentItem.skillId, currentItem.skillName, currentItem.category, true);
    } else {
      soundFx.playIncorrect();
      MasteryService.recordSkillAttempt(currentUser.id, currentItem.skillId, currentItem.skillName, currentItem.category, false);
    }
  };

  const handleNext = () => {
    if (currentIndex < reviewItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      soundFx.playClick();
    } else {
      setIsCompleted(true);
      soundFx.playVictory();
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
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '24px',
          padding: '26px',
          background: 'var(--bg-card)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
          border: '1.5px solid var(--border-color)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RotateCcw size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                Ôn Tập Thông Minh (Smart Review)
              </h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Thuật toán Spaced Repetition củng cố các câu từng làm sai
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-icon"
            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {!isCompleted && currentItem ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Progress indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#d97706', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 10px', borderRadius: '999px' }}>
                CÂU {currentIndex + 1} / {reviewItems.length}
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                ⚠️ Bạn từng làm sai {currentItem.mistakeCount} lần
              </span>
            </div>

            {/* Prompt */}
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {currentItem.prompt}
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentItem.options.map((opt, oidx) => {
                const isCorrect = oidx === currentItem.correctAnswer;
                const isSelected = selectedOption === oidx;

                let btnBg = 'var(--bg-secondary)';
                let btnBorder = '1px solid var(--border-color)';
                let btnColor = 'var(--text-primary)';

                if (isAnswered) {
                  if (isCorrect) {
                    btnBg = 'rgba(16, 185, 129, 0.15)';
                    btnBorder = '2px solid #10b981';
                    btnColor = '#065f46';
                  } else if (isSelected) {
                    btnBg = 'rgba(239, 68, 68, 0.15)';
                    btnBorder = '2px solid #ef4444';
                    btnColor = '#991b1b';
                  }
                }

                return (
                  <button
                    key={oidx}
                    onClick={() => handleSelectOption(oidx)}
                    disabled={isAnswered}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: btnBg,
                      border: btnBorder,
                      color: btnColor,
                      fontWeight: isAnswered && isCorrect ? 800 : 500,
                      fontSize: '0.86rem',
                      textAlign: 'left',
                      cursor: isAnswered ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}
                  >
                    <span><strong>{String.fromCharCode(65 + oidx)}.</strong> {opt}</span>
                    {isAnswered && isCorrect && <Check size={16} color="#10b981" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation & AI Button */}
            {isAnswered && (
              <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(79, 110, 247, 0.06)', borderLeft: '4px solid var(--brand)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--brand)' }}>💡 Giải thích chuẩn:</strong> {currentItem.explanation}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    onClick={() => onAskAITutor(currentItem.prompt)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.76rem', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.3)', gap: '4px' }}
                  >
                    <Bot size={14} />
                    <span>Hỏi AI Tutor Về Câu Này</span>
                  </button>

                  <button
                    onClick={handleNext}
                    className="btn btn-primary"
                    style={{ padding: '8px 20px', fontWeight: 800, fontSize: '0.82rem', borderRadius: '10px', gap: '6px' }}
                  >
                    <span>{currentIndex === reviewItems.length - 1 ? 'HOÀN TẤT ÔN TẬP' : 'CÂU TIẾP THEO'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Completion Summary */
          <div style={{ textAlign: 'center', padding: '20px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '58px', height: '58px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              Tuyệt Vời! Đã Hoàn Thành Ôn Tập Hôm Nay
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: 0 }}>
              Bạn đã xử lý thành công <strong>{resolvedCount} / {reviewItems.length}</strong> câu hỏi lỗi sai. Hệ thống đã nâng điểm <strong>Mastery Score</strong> của bạn!
            </p>
            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{ padding: '10px 28px', fontWeight: 800, borderRadius: '12px' }}
            >
              QUAY LẠI DASHBOARD
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
