/**
 * Assessment Service API Client — PH Digital Education
 * Connects with Django REST Framework /api/v1/assessments/ endpoints.
 */

import { api, ApiResponse } from './apiClient';

export interface BackendExam {
  id: string;
  code: string;
  title: string;
  description: string;
  course: string;
  duration_minutes: number;
  passing_score: number;
  is_published: boolean;
}

export interface BackendPublicQuestion {
  id: string;
  code: string;
  skill_id: string;
  module: string;
  prompt: string;
  options: Array<{
    id: string;
    text: string;
  }>;
  explanation_context?: string;
  shortcut_hint?: string;
  difficulty: number;
}

export interface ExamSubmitPayload {
  answers: Record<string, string>;
  switch_tab_count?: number;
}

export interface ExamSubmitResult {
  message: string;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  attempt_id: string;
}

export interface BackendExamAttempt {
  id: string;
  exam: string;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  switch_tab_count: number;
  submitted_at: string;
}

export const assessmentService = {
  /**
   * Lấy danh sách các đề thi được công bố
   */
  async getExams(): Promise<ApiResponse<BackendExam[]>> {
    return api.get<BackendExam[]>('/api/v1/assessments/exams/');
  },

  /**
   * Lấy thông tin chi tiết đề thi
   */
  async getExamDetail(examId: string): Promise<ApiResponse<BackendExam>> {
    return api.get<BackendExam>(`/api/v1/assessments/exams/${examId}/`);
  },

  /**
   * Lấy danh sách câu hỏi phục vụ luyện tập (đã ẩn đáp án đúng phía máy chủ)
   */
  async getQuestions(params?: { skill_id?: string; course_id?: string }): Promise<ApiResponse<BackendPublicQuestion[]>> {
    const query = new URLSearchParams();
    if (params?.skill_id) query.set('skill_id', params.skill_id);
    if (params?.course_id) query.set('course_id', params.course_id);
    const qs = query.toString();
    return api.get<BackendPublicQuestion[]>(`/api/v1/assessments/questions/${qs ? `?${qs}` : ''}`);
  },

  /**
   * Nộp bài thi và chấm điểm Server-side bảo mật
   */
  async submitExam(examId: string, payload: ExamSubmitPayload): Promise<ApiResponse<ExamSubmitResult>> {
    return api.post<ExamSubmitResult>(`/api/v1/assessments/exams/${examId}/submit/`, payload);
  },

  /**
   * Lấy lịch sử làm bài thi của học viên
   */
  async getAttempts(): Promise<ApiResponse<BackendExamAttempt[]>> {
    return api.get<BackendExamAttempt[]>('/api/v1/assessments/attempts/');
  }
};

