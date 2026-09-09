/**
 * Certificate Service API Client — PH Digital Education
 * Connects with Django REST Framework /api/v1/certificates/ endpoints.
 */

import { api, ApiResponse } from './apiClient';

export interface BackendCertificate {
  id: string;
  certificate_code: string;
  student: string;
  course: string;
  student_name: string;
  course_name: string;
  score_percentage: number;
  grade: string;
  issue_date: string;
  verification_url: string;
  qr_code_image_url?: string;
  is_revoked: boolean;
}

export const certificateApiService = {
  /**
   * Tra cứu công khai chứng chỉ theo mã hash duy nhất (không cần đăng nhập)
   */
  async verifyCertificate(certificateCode: string): Promise<ApiResponse<BackendCertificate>> {
    return api.get<BackendCertificate>(`/api/v1/certificates/verify/${certificateCode}/`);
  },

  /**
   * Lấy danh sách các chứng chỉ đã đạt của học viên đang đăng nhập
   */
  async getMyCertificates(): Promise<ApiResponse<BackendCertificate[]>> {
    return api.get<BackendCertificate[]>('/api/v1/certificates/my-certificates/');
  }
};

