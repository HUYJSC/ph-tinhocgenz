/**
 * Attendance Service API Client — PH Digital Education
 * Connects with Django REST Framework /api/v1/attendance/ endpoints.
 */

import { api, ApiResponse } from './apiClient';

export interface BackendAttendanceSession {
  id: string;
  course: string;
  session_title: string;
  class_code: string;
  date: string;
  start_time: string;
  end_time: string;
  qr_token: string;
  pin_code?: string;
  is_open: boolean;
  teacher: string;
}

export interface BackendAttendanceRecord {
  id: string;
  session: string;
  student: string;
  status: 'present' | 'absent' | 'late' | 'makeup';
  checked_in_at: string;
  verified_ip?: string;
  verified_location?: string;
}

export interface CheckInPayload {
  pin_code?: string;
  qr_token?: string;
  location?: string;
}

export interface CheckInResponse {
  message: string;
  session_title: string;
  status: string;
}

export const attendanceService = {
  /**
   * Lấy danh sách các ca điểm danh (học viên: ca đang mở, giảng viên: ca phụ trách)
   */
  async getSessions(): Promise<ApiResponse<BackendAttendanceSession[]>> {
    return api.get<BackendAttendanceSession[]>('/api/v1/attendance/sessions/');
  },

  /**
   * Tạo ca điểm danh mới (Giảng viên / Quản trị)
   */
  async createSession(data: Partial<BackendAttendanceSession>): Promise<ApiResponse<BackendAttendanceSession>> {
    return api.post<BackendAttendanceSession>('/api/v1/attendance/sessions/', data);
  },

  /**
   * Học viên thực hiện điểm danh (quét QR / nhập PIN / vị trí GPS)
   */
  async checkIn(sessionId: string, payload: CheckInPayload): Promise<ApiResponse<CheckInResponse>> {
    return api.post<CheckInResponse>(`/api/v1/attendance/sessions/${sessionId}/checkin/`, payload);
  },

  /**
   * Giảng viên / Admin xem danh sách học viên điểm danh của ca học
   */
  async getSessionRecords(sessionId: string): Promise<ApiResponse<BackendAttendanceRecord[]>> {
    return api.get<BackendAttendanceRecord[]>(`/api/v1/attendance/sessions/${sessionId}/records/`);
  }
};

