import { Badge } from '../types/quiz';

export const DEFAULT_BADGES: Badge[] = [
  {
    id: 'first_quiz',
    title: 'Khởi Đầu Mới',
    description: 'Hoàn thành bài tập đầu tiên',
    icon: '🎯',
    requirementType: 'quizzes',
    requirementValue: 1
  },
  {
    id: 'quiz_master_5',
    title: 'Học Viên Chăm Chỉ',
    description: 'Hoàn thành 5 bài kiểm tra',
    icon: '📚',
    requirementType: 'quizzes',
    requirementValue: 5
  },
  {
    id: 'perfect_score',
    title: 'Điểm Tuyệt Đối',
    description: 'Đạt điểm tối đa (100%) trong một bài kiểm tra',
    icon: '🏆',
    requirementType: 'perfect',
    requirementValue: 1
  },
  {
    id: 'streak_3',
    title: 'Ngọn Lửa Bền Bỉ',
    description: 'Duy trì chuỗi học 3 ngày liên tiếp',
    icon: '🔥',
    requirementType: 'streak',
    requirementValue: 3
  },
  {
    id: 'streak_7',
    title: 'Chiến Binh Học Tập',
    description: 'Duy trì chuỗi học 7 ngày liên tiếp',
    icon: '⚡',
    requirementType: 'streak',
    requirementValue: 7
  },
  {
    id: 'creator_badge',
    title: 'Nhà Sáng Tạo Đề',
    description: 'Tự tạo ít nhất 1 bộ đề thi cho riêng mình',
    icon: '✍️',
    requirementType: 'custom_quiz',
    requirementValue: 1
  },
  {
    id: 'point_master',
    title: 'Vua Điểm Thưởng',
    description: 'Tích lũy đạt mốc 1000 điểm XP',
    icon: '👑',
    requirementType: 'score',
    requirementValue: 1000
  }
];
