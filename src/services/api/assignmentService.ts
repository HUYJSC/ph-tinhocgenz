/**
 * Assignment Service API Client — PH Digital Education
 * Connects with Django REST Framework /api/v1/assignments/ endpoints.
 */

import { api, ApiResponse } from './apiClient';

export interface BackendAssignment {
  id: string;
  course: string;
  title: string;
  description: string;
  module_type: 'word' | 'excel' | 'ppt' | 'all';
  due_date: string;
  max_score: number;
  attachment_url?: string;
  is_active: boolean;
  teacher?: string;
  created_at: string;
}

export interface BackendSubmission {
  id: string;
  assignment: string;
  student: string;
  submission_file_url: string;
  student_notes?: string;
  submitted_at: string;
  score?: number;
  feedback?: string;
  is_graded: boolean;
  graded_by?: string;
  graded_at?: string;
}

export const assignmentService = {
  /**
   * Lấy danh sách các bài tập thực hành
   */
  async getAssignments(): Promise<ApiResponse<BackendAssignment[]>> {
    return api.get<BackendAssignment[]>('/api/v1/assignments/tasks/');
  },

  /**
   * Lấy chi tiết một bài tập
   */
  async getAssignmentDetail(id: string): Promise<ApiResponse<BackendAssignment>> {
    return api.get<BackendAssignment>(`/api/v1/assignments/tasks/${id}/`);
  },

  /**
   * Tạo bài tập thực hành mới (Giảng viên / Admin)
   */
  async createAssignment(data: Partial<BackendAssignment>): Promise<ApiResponse<BackendAssignment>> {
    return api.post<BackendAssignment>('/api/v1/assignments/tasks/', data);
  },

  /**
   * Cập nhật bài tập
   */
  async updateAssignment(id: string, data: Partial<BackendAssignment>): Promise<ApiResponse<BackendAssignment>> {
    return api.patch<BackendAssignment>(`/api/v1/assignments/tasks/${id}/`, data);
  },

  /**
   * Xóa bài tập
   */
  async deleteAssignment(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/api/v1/assignments/tasks/${id}/`);
  },

  /**
   * Lấy danh sách bài nộp của học viên
   */
  async getSubmissions(assignmentId?: string): Promise<ApiResponse<BackendSubmission[]>> {
    const qs = assignmentId ? `?assignment_id=${assignmentId}` : '';
    return api.get<BackendSubmission[]>(`/api/v1/assignments/submissions/${qs}`);
  },

  /**
   * Học viên nộp bài tập thực hành
   */
  async submitAssignment(data: {
    assignment: string;
    submission_file_url: string;
    student_notes?: string;
  }): Promise<ApiResponse<BackendSubmission>> {
    return api.post<BackendSubmission>('/api/v1/assignments/submissions/', data);
  },

  /**
   * Giảng viên chấm điểm bài nộp
   */
  async gradeSubmission(submissionId: string, data: {
    score: number;
    feedback: string;
  }): Promise<ApiResponse<BackendSubmission>> {
    return api.post<BackendSubmission>(`/api/v1/assignments/submissions/${submissionId}/grade/`, data);
  }
};

