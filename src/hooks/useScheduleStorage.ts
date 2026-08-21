import { useState, useEffect } from 'react';
import { ClassScheduleItem } from '../types/schedule';

const SCHEDULE_STORAGE_KEY = 'phtinhocgenz_schedules_v2';

export const INITIAL_SCHEDULE_DATA: ClassScheduleItem[] = [
  // ── 1. Office Cấp Tốc (K26-WE01) - Thầy Quang Huy ──
  {
    id: 'sch-01',
    title: 'Buổi 1: Kỹ Năng Soạn Thảo Văn Bản Word Chuẩn Công Sở',
    track: 'office-fast-3in1',
    classCode: 'K26-WE01',
    teacherId: 'tch-03',
    teacherName: 'Thầy Quang Huy',
    dayOfWeek: 1, // Thứ 2
    date: '2026-08-24',
    startTime: '18:30',
    endTime: '20:30',
    shift: 'evening',
    room: 'Phòng LAB 01 (Tầng 2)',
    onlineMeetingUrl: 'https://meet.google.com/sja-vcpy-rsu',
    lessonNumber: 1,
    totalLessons: 3,
    notes: 'Mang theo tài liệu Word mẫu và chuẩn bị câu hỏi thực hành.',
    status: 'upcoming',
    createdAt: '2026-08-20'
  },
  {
    id: 'sch-02',
    title: 'Buổi 2: Xử Lý Bảng Tính & 20 Hàm Excel Thực Chiến',
    track: 'office-fast-3in1',
    classCode: 'K26-WE01',
    teacherId: 'tch-03',
    teacherName: 'Thầy Quang Huy',
    dayOfWeek: 3, // Thứ 4
    date: '2026-08-26',
    startTime: '18:30',
    endTime: '20:30',
    shift: 'evening',
    room: 'Phòng LAB 01 (Tầng 2)',
    onlineMeetingUrl: 'https://meet.google.com/sja-vcpy-rsu',
    lessonNumber: 2,
    totalLessons: 3,
    notes: 'Thực hành các hàm VLOOKUP, IF lồng, SUMIFS, PivotTable.',
    status: 'upcoming',
    createdAt: '2026-08-20'
  },
  {
    id: 'sch-03',
    title: 'Buổi 3: Thiết Kế Slide Thuyết Trình PowerPoint & Tổng Kết',
    track: 'office-fast-3in1',
    classCode: 'K26-WE01',
    teacherId: 'tch-03',
    teacherName: 'Thầy Quang Huy',
    dayOfWeek: 5, // Thứ 6
    date: '2026-08-28',
    startTime: '18:30',
    endTime: '20:30',
    shift: 'evening',
    room: 'Phòng LAB 01 (Tầng 2)',
    onlineMeetingUrl: 'https://meet.google.com/sja-vcpy-rsu',
    lessonNumber: 3,
    totalLessons: 3,
    notes: 'Kiểm tra cuối khóa và trao chứng chỉ hoàn thành.',
    status: 'upcoming',
    createdAt: '2026-08-20'
  },

  // ── 2. MOS Word Chuyên Sâu (Word 6b) - Cô Thu Minh ──
  {
    id: 'sch-04',
    title: 'Buổi 1: Định Dạng Ký Tự Đặc Biệt, Symbol & Find & Replace',
    track: 'word-6b',
    classCode: 'K26-MOSW01',
    teacherId: 'tch-04',
    teacherName: 'Cô Thu Minh',
    dayOfWeek: 2, // Thứ 3
    date: '2026-08-25',
    startTime: '14:00',
    endTime: '16:00',
    shift: 'afternoon',
    room: 'Phòng LAB 02 (Tầng 3)',
    onlineMeetingUrl: 'https://meet.google.com/sja-vcpy-rsu',
    lessonNumber: 1,
    totalLessons: 6,
    notes: 'Theo chuẩn đề thi Certiport MO-100 Objective 2.1.',
    status: 'upcoming',
    createdAt: '2026-08-20'
  },
  {
    id: 'sch-05',
    title: 'Buổi 2: Quản Lý Styles, Text Effects & Khoảng Cách Paragraph',
    track: 'word-6b',
    classCode: 'K26-MOSW01',
    teacherId: 'tch-04',
    teacherName: 'Cô Thu Minh',
    dayOfWeek: 4, // Thứ 5
    date: '2026-08-27',
    startTime: '14:00',
    endTime: '16:00',
    shift: 'afternoon',
    room: 'Phòng LAB 02 (Tầng 3)',
    onlineMeetingUrl: 'https://meet.google.com/sja-vcpy-rsu',
    lessonNumber: 2,
    totalLessons: 6,
    notes: 'Thực hành Word_2-2 và Format Painter.',
    status: 'upcoming',
    createdAt: '2026-08-20'
  },
  {
    id: 'sch-06',
    title: 'Buổi 3: Chia Cột Báo Columns & Ngắt Phân Vùng Section Breaks',
    track: 'word-6b',
    classCode: 'K26-MOSW01',
    teacherId: 'tch-04',
    teacherName: 'Cô Thu Minh',
    dayOfWeek: 6, // Thứ 7
    date: '2026-08-29',
    startTime: '14:00',
    endTime: '16:00',
    shift: 'afternoon',
    room: 'Phòng LAB 02 (Tầng 3)',
    onlineMeetingUrl: 'https://meet.google.com/sja-vcpy-rsu',
    lessonNumber: 3,
    totalLessons: 6,
    notes: 'Thiết lập trang ngang Landscape độc lập.',
    status: 'upcoming',
    createdAt: '2026-08-20'
  },

  // ── 3. CC CNTT Nâng Cao & Excel Kế Toán - Thầy Đức Nam ──
  {
    id: 'sch-07',
    title: 'Buổi 1: Hàm Tra Cứu Đa Điều Kiện (INDEX/MATCH & XLOOKUP)',
    track: 'cc-cntt-advanced',
    classCode: 'K26-CCN01',
    teacherId: 'tch-02',
    teacherName: 'Thầy Đức Nam',
    dayOfWeek: 2, // Thứ 3
    date: '2026-08-25',
    startTime: '08:00',
    endTime: '10:00',
    shift: 'morning',
    room: 'Phòng LAB 03 (Tầng 4)',
    onlineMeetingUrl: 'https://meet.google.com/sja-vcpy-rsu',
    lessonNumber: 1,
    totalLessons: 6,
    notes: 'Chuẩn bị dữ liệu bảng tra cứu lớn.',
    status: 'upcoming',
    createdAt: '2026-08-20'
  },
  {
    id: 'sch-08',
    title: 'Buổi 1: Lập Sổ Kế Toán Tự Động Với Hàm SUMIFS & IFERROR',
    track: 'excel-accounting',
    classCode: 'K26-KT01',
    teacherId: 'tch-02',
    teacherName: 'Thầy Đức Nam',
    dayOfWeek: 4, // Thứ 5
    date: '2026-08-27',
    startTime: '08:00',
    endTime: '10:00',
    shift: 'morning',
    room: 'Phòng LAB 03 (Tầng 4)',
    onlineMeetingUrl: 'https://meet.google.com/sja-vcpy-rsu',
    lessonNumber: 1,
    totalLessons: 6,
    notes: 'Thiết lập bảng cân đối số phát sinh.',
    status: 'upcoming',
    createdAt: '2026-08-20'
  },

  // ── 4. Ứng Dụng AI Văn Phòng - Cô Hoàng Mai ──
  {
    id: 'sch-09',
    title: 'Buổi 1: Tối Ưu Hóa Công Việc Bằng Prompt AI & ChatGPT Cho Word/Excel',
    track: 'ai-office',
    classCode: 'K26-AI01',
    teacherId: 'tch-01',
    teacherName: 'Cô Hoàng Mai',
    dayOfWeek: 6, // Thứ 7
    date: '2026-08-29',
    startTime: '08:00',
    endTime: '10:00',
    shift: 'morning',
    room: 'Trực Tuyến (Google Meet Toàn Khóa)',
    onlineMeetingUrl: 'https://meet.google.com/sja-vcpy-rsu',
    lessonNumber: 1,
    totalLessons: 5,
    notes: 'Thực hành tạo macro tự động hóa bằng AI.',
    status: 'upcoming',
    createdAt: '2026-08-20'
  }
];

export function useScheduleStorage() {
  const [schedules, setSchedules] = useState<ClassScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem(SCHEDULE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load schedules', e);
    }
    return INITIAL_SCHEDULE_DATA;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedules));
    } catch (e) {
      console.error('Failed to save schedules', e);
    }
  }, [schedules]);

  // Create new schedule item (Teacher / Admin Action)
  const createSchedule = (data: Omit<ClassScheduleItem, 'id' | 'createdAt'>) => {
    const newItem: ClassScheduleItem = {
      ...data,
      id: `sch-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setSchedules(prev => [newItem, ...prev]);
    return newItem;
  };

  // Update schedule item
  const updateSchedule = (updatedItem: ClassScheduleItem) => {
    setSchedules(prev => prev.map(s => (s.id === updatedItem.id ? updatedItem : s)));
  };

  // Delete schedule item
  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  // Reset to default sample schedule
  const resetToDefault = () => {
    setSchedules(INITIAL_SCHEDULE_DATA);
  };

  return {
    schedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    resetToDefault
  };
}
