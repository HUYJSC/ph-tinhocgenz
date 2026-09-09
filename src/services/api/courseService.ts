/**
 * Course Service API Client — PH Digital Education
 * Connects with Django REST Framework /api/v1/courses/ endpoints.
 */

import { api, ApiResponse } from './apiClient';

export interface BackendCourseTrack {
  id: string;
  code: string;
  name: string;
  description: string;
  target_audience: string;
  total_modules: number;
  is_active: boolean;
}

export interface BackendClassGroup {
  id: string;
  code: string;
  name: string;
  track: string;
  teacher: string | null;
  meet_url?: string;
  schedule_text?: string;
  is_active: boolean;
  max_students: number;
  enrolled_count: number;
}

export interface BackendEnrollment {
  id: string;
  student: string;
  class_group: string;
  enrolled_at: string;
  status: string;
}

export const courseService = {
  /**
   * Lấy danh sách các chương trình đào tạo
   */
  async getCourses(): Promise<ApiResponse<BackendCourseTrack[]>> {
    return api.get<BackendCourseTrack[]>('/api/v1/courses/');
  },

  /**
   * Lấy thông tin chi tiết một khóa học
   */
  async getCourseDetail(courseId: string): Promise<ApiResponse<BackendCourseTrack>> {
    return api.get<BackendCourseTrack>(`/api/v1/courses/${courseId}/`);
  },

  /**
   * Lấy danh sách các lớp học
   */
  async getClassGroups(): Promise<ApiResponse<BackendClassGroup[]>> {
    return api.get<BackendClassGroup[]>('/api/v1/courses/api/classes/');
  },

  /**
   * Lấy danh sách ghi danh học viên
   */
  async getEnrollments(): Promise<ApiResponse<BackendEnrollment[]>> {
    return api.get<BackendEnrollment[]>('/api/v1/courses/api/enrollments/');
  }
};

