import { apiRequest } from './apiClient';
import type { ExamStartResponse, ExamSubmitRequest, ExamResult, ExamSession } from '../../types/exam';

export const ExamApiService = {
  /** Bắt đầu phiên thi — nhận session_id + deadline từ server (KHÔNG có correctAnswer) */
  async startExam(quizId: string, idempotencyKey?: string): Promise<{ data?: ExamStartResponse; error?: string }> {
    const result = await apiRequest<ExamStartResponse>('/api/exam/start', {
      method: 'POST',
      body: JSON.stringify({ quiz_id: quizId, idempotency_key: idempotencyKey })
    });
    if (!result.ok || !result.data) return { error: result.error || 'Không thể bắt đầu bài thi' };
    return { data: result.data };
  },

  /** Nộp bài — server chấm điểm, client KHÔNG tự tính điểm */
  async submitExam(request: ExamSubmitRequest): Promise<{ data?: ExamResult; error?: string }> {
    const result = await apiRequest<ExamResult>('/api/exam/submit', {
      method: 'POST',
      body: JSON.stringify(request)
    });
    if (!result.ok || !result.data) return { error: result.error || 'Không thể nộp bài thi' };
    return { data: result.data };
  },

  /** Kiểm tra trạng thái phiên thi từ server */
  async getExamStatus(sessionId: string): Promise<{ data?: ExamSession; error?: string }> {
    const result = await apiRequest<ExamSession>(`/api/exam/status?session_id=${encodeURIComponent(sessionId)}`);
    if (!result.ok || !result.data) return { error: result.error || 'Không thể lấy trạng thái bài thi' };
    return { data: result.data };
  }
};
