import type { Course, Lesson, CourseProgress } from '../../types/course';
import { apiRequest } from './apiClient';

export const LessonService = {
  async getCourse(courseId: string): Promise<Course | null> {
    const result = await apiRequest<Course>(`/api/courses/${courseId}`);
    return result.ok && result.data ? result.data : null;
  },

  async getLessons(courseId: string): Promise<Lesson[]> {
    const result = await apiRequest<Lesson[]>(`/api/courses/${courseId}/lessons`);
    return result.ok && Array.isArray(result.data) ? result.data : [];
  },

  async getCourseProgress(courseId: string): Promise<CourseProgress | null> {
    const result = await apiRequest<CourseProgress>(`/api/progress/course/${courseId}`);
    return result.ok && result.data ? result.data : null;
  },

  async markLessonComplete(lessonId: string): Promise<void> {
    await apiRequest('/api/progress/lesson', {
      method: 'POST',
      body: JSON.stringify({ lesson_id: lessonId, is_completed: true, position_seconds: 0 })
    });
  },

  async updateProgress(lessonId: string, positionSeconds: number): Promise<void> {
    await apiRequest('/api/progress/lesson', {
      method: 'POST',
      body: JSON.stringify({ lesson_id: lessonId, is_completed: false, position_seconds: positionSeconds })
    });
  }
};
