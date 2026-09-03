/**
 * Auth Service — PH Digital Education
 * Interacts with Django REST Framework /api/v1/accounts/ endpoints.
 */

import { api, ApiResponse } from './apiClient';
import { UserProfile } from '../../types/auth';

export interface BackendUser {
  id: string;
  username: string;
  email: string | null;
  full_name: string;
  phone: string;
  role: 'student' | 'teacher' | 'academic' | 'admin';
  student_code?: string;
  teacher_code?: string;
  class_code?: string;
  school_or_class?: string;
  program_track?: string;
  birth_year?: number;
  parent_name?: string;
  parent_phone?: string;
  must_change_password?: boolean;
}

export interface LoginResult {
  message: string;
  tokens: {
    access: string;
    refresh: string;
  };
  user: BackendUser;
}

export const authService = {
  /**
   * Đăng nhập người dùng qua Backend API
   */
  async login(username: string, password: string): Promise<ApiResponse<LoginResult>> {
    return api.post<LoginResult>('/api/v1/accounts/login/', {
      username: username.trim().toUpperCase(),
      password
    });
  },

  /**
   * Lấy thông tin tài khoản hiện tại từ phiên đăng nhập
   */
  async getCurrentUser(): Promise<ApiResponse<BackendUser>> {
    return api.get<BackendUser>('/api/v1/accounts/me/');
  },

  /**
   * Đăng xuất khỏi hệ thống
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    return api.post<{ message: string }>('/api/v1/accounts/logout/');
  },

  /**
   * Đổi mật khẩu tài khoản
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return api.post<{ message: string }>('/api/v1/accounts/change-password/', {
      current_password: currentPassword,
      new_password: newPassword
    });
  },

  /**
   * Chuyển đổi BackendUser sang UserProfile của Frontend
   */
  mapBackendUserToProfile(u: BackendUser): UserProfile {
    return {
      id: u.id,
      name: u.full_name,
      studentCode: u.student_code || u.username,
      teacherCode: u.teacher_code,
      classCode: u.class_code,
      phone: u.phone,
      email: u.email || `${u.username.toLowerCase()}@tinhocgenz.io.vn`,
      phoneOrEmail: `${u.phone || ''} • ${u.email || u.username}`,
      schoolOrClass: u.school_or_class || '',
      programTrack: (u.program_track as any) || 'office-fast-3in1',
      enrolledTracks: u.program_track ? [u.program_track as any] : ['office-fast-3in1'],
      mustChangePassword: !!u.must_change_password,
      role: u.role === 'admin' ? 'admin' : (u.role === 'teacher' ? 'teacher' : 'student'),
      createdAt: ''
    };
  }
};
