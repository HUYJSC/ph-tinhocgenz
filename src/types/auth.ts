export type UserRole = 'student' | 'teacher' | 'admin';

export type CurriculumTrack =
  | 'cntt-basic'
  | 'cntt-advanced'
  | 'mos-office'
  | 'ic3-gs'
  | 'programming'
  | 'cyber-security';

export const TRACK_LABELS: Record<CurriculumTrack, string> = {
  'cntt-basic': '1. CNTT & Tin Học Cơ Bản',
  'mos-office': '2. Tin Học Văn Phòng MOS (Word, Excel, PPT)',
  'ic3-gs': '3. Chuẩn Tin Học Quốc Tế IC3 GS6',
  'cntt-advanced': '4. CNTT Nâng Cao & Xử Lý Dữ Liệu',
  'programming': '5. Lập Trình Python & Thuật Toán',
  'cyber-security': '6. Mạng Máy Tính & Bảo Mật IT'
};

export interface StudentAccount {
  id: string;
  name: string;
  studentCode: string;
  password?: string;
  schoolOrClass: string;
  programTrack: CurriculumTrack;
  enrolledTracks: CurriculumTrack[];
  role: 'student';
  createdAt: string;
}

export interface TeacherAccount {
  id: string;
  name: string;
  teacherCode: string;
  password?: string;
  phoneOrEmail?: string;
  assignedTracks: CurriculumTrack[];
  role: 'teacher';
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  studentCode?: string;
  role: UserRole;
  avatar?: string;
  schoolOrClass?: string;
  programTrack?: CurriculumTrack;
  enrolledTracks?: CurriculumTrack[];
  createdAt: string;
}

export interface AuthState {
  currentUser: UserProfile;
  isAuthenticated: boolean;
}
