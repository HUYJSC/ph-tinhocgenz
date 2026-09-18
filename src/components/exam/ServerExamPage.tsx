import React, { useEffect, useState } from 'react';
import { useServerExam } from '../../hooks/useServerExam';
import type { ExamResult } from '../../types/exam';
import { Clock, AlertCircle } from 'lucide-react';

interface ServerExamPageProps {
  quizId: string;
  quizTitle: string;
  onFinish: (result: ExamResult) => void;
  onCancel: () => void;
}

export const ServerExamPage: React.FC<ServerExamPageProps> = ({
  quizId,
  quizTitle,
  onFinish,
  onCancel
}) => {
  const [localError, setLocalError] = useState<string | null>(null);
  
  const {
    questions,
    answers,
    currentIndex,
    remainingSeconds,
    isLoading,
    isSubmitting,
    error,
    startExam,
    setAnswer,
    submitExam,
    goToQuestion
  } = useServerExam({
    quizId,
    onFinish,
    onError: (err) => setLocalError(err)
  });

  useEffect(() => {
    startExam();
  }, [startExam]);

  const currentQuestion = questions[currentIndex];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0057B8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang chuẩn bị đề thi...</p>
        </div>
      </div>
    );
  }

  if (error || localError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-gray-600 mb-6">{error || localError}</p>
          <button 
            onClick={onCancel}
            className="w-full py-2 bg-[#0057B8] text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!questions.length) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-[#0057B8] text-white py-4 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold truncate flex-1">{quizTitle}</h1>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-blue-800/50 px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5 text-blue-200" />
            <span className="font-mono text-xl font-medium">
              {formatTime(remainingSeconds)}
            </span>
          </div>
          <button
            onClick={submitExam}
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-lg font-bold shadow-sm transition-colors ${
              isSubmitting 
                ? 'bg-blue-400 cursor-not-allowed text-blue-100'
                : 'bg-white text-[#0057B8] hover:bg-gray-100'
            }`}
          >
            {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-semibold text-[#0057B8] bg-blue-50 px-3 py-1 rounded-full">
                  Câu hỏi {currentIndex + 1} / {questions.length}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  {currentQuestion.points} điểm
                </span>
              </div>
              
              <h2 className="text-lg font-medium text-gray-800 mb-6 leading-relaxed whitespace-pre-wrap">
                {currentQuestion.prompt}
              </h2>

              <div className="space-y-3">
                {(currentQuestion.options || []).map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (currentQuestion.type === 'single') {
                        setAnswer(currentQuestion.id, idx);
                      } else if (currentQuestion.type === 'multiple') {
                        const current = answers[currentQuestion.id] || [];
                        const updated = current.includes(idx)
                          ? current.filter((i: number) => i !== idx)
                          : [...current, idx];
                        setAnswer(currentQuestion.id, updated);
                      }
                    }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      (currentQuestion.type === 'single' && answers[currentQuestion.id] === idx) ||
                      (currentQuestion.type === 'multiple' && (answers[currentQuestion.id] || []).includes(idx))
                        ? 'border-[#0057B8] bg-blue-50'
                        : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                        (currentQuestion.type === 'single' && answers[currentQuestion.id] === idx) ||
                        (currentQuestion.type === 'multiple' && (answers[currentQuestion.id] || []).includes(idx))
                          ? 'border-[#0057B8] bg-[#0057B8]'
                          : 'border-gray-300'
                      }`}>
                        {((currentQuestion.type === 'single' && answers[currentQuestion.id] === idx) ||
                          (currentQuestion.type === 'multiple' && (answers[currentQuestion.id] || []).includes(idx))) && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-gray-700">{opt}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-72 bg-white border-l border-gray-200 flex flex-col hidden md:flex shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Danh sách câu hỏi</h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = currentIndex === idx;
                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(idx)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                      isCurrent 
                        ? 'ring-2 ring-offset-2 ring-[#0057B8] bg-blue-100 text-[#0057B8]' 
                        : isAnswered
                          ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                          : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="p-4 border-t border-gray-100 text-sm flex space-x-4">
            <div className="flex items-center text-gray-500">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded-sm mr-2"></div>
              Đã làm
            </div>
            <div className="flex items-center text-gray-500">
              <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded-sm mr-2"></div>
              Chưa làm
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
