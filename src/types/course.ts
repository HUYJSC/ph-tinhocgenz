export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  instructor_id?: string;
  instructor_name?: string;
  track?: string;
  thumbnail_url?: string;
  price_vnd: number;
  status: 'draft' | 'published' | 'archived';
  sort_order: number;
  created_at: string;
  lesson_count?: number;
  enrolled_count?: number;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content_type: 'video' | 'pdf' | 'slide' | 'quiz' | 'interactive' | 'text';
  content_url?: string;
  sort_order: number;
  duration_minutes: number;
  is_preview: boolean;
  created_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  status: 'active' | 'completed' | 'suspended';
  course?: Course;
}

export interface LessonProgress {
  student_id: string;
  lesson_id: string;
  is_completed: boolean;
  last_position_seconds: number;
  completed_at?: string;
}

export interface CourseProgress {
  course_id: string;
  total_lessons: number;
  completed_lessons: number;
  percentage: number;
  last_lesson_id?: string;
}
