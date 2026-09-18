import type { Enrollment } from '../../types/course';
import { apiRequest } from './apiClient';

export const EnrollmentService = {
  async getMyEnrollments(): Promise<Enrollment[]> {
    const result = await apiRequest<Enrollment[]>('/api/enrollments');
    return result.ok && Array.isArray(result.data) ? result.data : [];
  },

  async enrollInCourse(courseId: string): Promise<Enrollment | null> {
    const result = await apiRequest<Enrollment>('/api/enrollments', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId })
    });
    return result.ok && result.data ? result.data : null;
  },

  async checkEnrollment(courseId: string): Promise<boolean> {
    const result = await apiRequest<{ enrolled: boolean }>(`/api/enrollments/check?course_id=${encodeURIComponent(courseId)}`);
    return result.ok ? (result.data?.enrolled ?? false) : false;
  }
};
