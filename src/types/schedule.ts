import { CurriculumTrack } from './auth';

export type ShiftTimeSlot = 'morning' | 'afternoon' | 'evening';

export interface ClassScheduleItem {
  id: string;
  title: string;                 // e.g. "Buổi 1: Định dạng văn bản hành chính & Styles"
  track: CurriculumTrack;        // e.g. "office-fast-3in1", "word-6b"
  classCode: string;             // e.g. "K26-WE01", "K26-MOS02"
  teacherId: string;
  teacherName: string;           // e.g. "Cô Thu Minh"
  dayOfWeek: number;             // 1 = Thứ 2, 2 = Thứ 3, ..., 6 = Thứ 7, 0 = Chủ Nhật
  date: string;                  // YYYY-MM-DD
  startTime: string;             // e.g. "18:30"
  endTime: string;               // e.g. "20:30"
  shift: ShiftTimeSlot;          // morning (08:00-10:00), afternoon (14:00-16:00), evening (18:30-20:30)
  room: string;                  // e.g. "Phòng LAB 02 (Tầng 3)" or "Trực Tuyến (Google Meet)"
  onlineMeetingUrl?: string;     // e.g. "https://meet.google.com/xyz-abcd-efg"
  lessonNumber: number;          // e.g. 1, 2, 3 ...
  totalLessons: number;          // e.g. 3, 6, 12
  notes?: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  createdAt: string;
}
