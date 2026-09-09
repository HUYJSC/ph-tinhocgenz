/**
 * Analytics & Warning Service API Client — PH Digital Education
 * Connects with Django REST Framework /api/v1/analytics/ endpoints.
 */

import { api, ApiResponse } from './apiClient';

export interface BackendAcademicWarning {
  id: string;
  student: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  trigger_reason: string;
  is_resolved: boolean;
  notes?: string;
  created_at: string;
}

export interface BackendStudentReminder {
  id: string;
  student: string;
  daily: boolean;
  weekly: boolean;
  monthly: boolean;
  preferred_time: string;
  parent_name?: string;
  parent_phone?: string;
  birth_year?: number;
}

export const analyticsApiService = {
  /**
   * Giảng viên / Quản trị tra cứu danh sách cảnh báo học vụ
   */
  async getWarnings(params?: { risk_level?: string; is_resolved?: boolean }): Promise<ApiResponse<BackendAcademicWarning[]>> {
    const query = new URLSearchParams();
    if (params?.risk_level) query.set('risk_level', params.risk_level);
    if (params?.is_resolved !== undefined) query.set('is_resolved', String(params.is_resolved));
    const qs = query.toString();
    return api.get<BackendAcademicWarning[]>(`/api/v1/analytics/warnings/${qs ? `?${qs}` : ''}`);
  },

  /**
   * Cập nhật trạng thái xử lý cảnh báo học vụ
   */
  async updateWarning(warningId: string, data: Partial<BackendAcademicWarning>): Promise<ApiResponse<BackendAcademicWarning>> {
    return api.patch<BackendAcademicWarning>(`/api/v1/analytics/warnings/${warningId}/`, data);
  },

  /**
   * Tra cứu cài đặt chu kỳ nhắc nhở học tập
   */
  async getReminders(studentId?: string): Promise<ApiResponse<BackendStudentReminder[]>> {
    const qs = studentId ? `?student_id=${studentId}` : '';
    return api.get<BackendStudentReminder[]>(`/api/v1/analytics/reminders/${qs}`);
  },

  /**
   * Cập nhật hoặc lưu cài đặt nhắc nhở
   */
  async saveReminder(data: Partial<BackendStudentReminder>): Promise<ApiResponse<BackendStudentReminder>> {
    return api.post<BackendStudentReminder>('/api/v1/analytics/reminders/', data);
  }
};

