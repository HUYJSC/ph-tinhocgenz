import React from 'react';
import type { ExamResult } from '../../types/exam';
import { Award, CheckCircle, XCircle, Clock, RotateCcw, Home } from 'lucide-react';

interface ExamResultPageProps {
  result: ExamResult;
  onRetry: () => void;
  onGoHome: () => void;
}

export const ExamResultPage: React.FC<ExamResultPageProps> = ({
  result,
  onRetry,
  onGoHome
}) => {
  const isPassed = result.percentage >= 80;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      
      {/* Result Card */}
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className={`p-8 text-center text-white ${isPassed ? 'bg-green-600' : 'bg-[#0057B8]'}`}>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isPassed ? 'Chúc mừng bạn đã vượt qua!' : 'Cố gắng lên nhé!'}
          </h1>
          <p className="text-white/80 font-medium">
            Hoàn thành bài thi với kết quả {result.percentage}%
          </p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-3 gap-6 mb-8 text-center">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm text-gray-500 font-medium mb-1">Điểm số</div>
              <div className="text-2xl font-bold text-gray-800">{result.score} <span className="text-lg text-gray-500 font-normal">/ {result.max_score}</span></div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm text-gray-500 font-medium mb-1">Số câu đúng</div>
              <div className="text-2xl font-bold text-gray-800">{result.correct_count} <span className="text-lg text-gray-500 font-normal">/ {result.total_questions}</span></div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm text-gray-500 font-medium mb-1">Thời gian</div>
              <div className="text-2xl font-bold text-gray-800 flex items-center justify-center">
                <Clock className="w-5 h-5 mr-2 text-gray-400" />
                {formatTime(result.time_spent_seconds)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 text-lg border-b pb-2">Chi tiết kết quả</h3>
            {result.question_results.map((qr, idx) => (
              <div key={qr.question_id} className="flex items-center p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4 bg-white shadow-sm border border-gray-100 text-gray-600 font-medium">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500">
                    Câu {idx + 1}
                  </div>
                </div>
                <div className="flex items-center font-medium">
                  {qr.is_correct ? (
                    <span className="text-green-600 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-1.5" /> Đúng
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center">
                      <XCircle className="w-5 h-5 mr-1.5" /> Sai
                    </span>
                  )}
                  <span className="ml-4 w-12 text-right text-gray-500 text-sm">
                    +{qr.score_earned}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 max-w-2xl w-full">
        <button
          onClick={onRetry}
          className="flex-1 flex items-center justify-center py-3 px-4 bg-white text-[#0057B8] border-2 border-[#0057B8] rounded-xl font-bold hover:bg-blue-50 transition-colors"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Làm lại (Luyện tập)
        </button>
        <button
          onClick={onGoHome}
          className="flex-1 flex items-center justify-center py-3 px-4 bg-[#0057B8] text-white rounded-xl font-bold hover:bg-blue-700 shadow-md transition-colors"
        >
          <Home className="w-5 h-5 mr-2" />
          Về trang chủ
        </button>
      </div>

    </div>
  );
};
