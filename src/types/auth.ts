export type UserRole = 'student' | 'teacher' | 'admin';

export type CurriculumTrack =
  | 'office-fast-3in1'
  | 'cc-cntt-basic'
  | 'cc-cntt-advanced'
  | 'cntt-basic-we'
  | 'cntt-adv-we'
  | 'ai-office'
  | 'excel-accounting'
  | 'word-6b'
  | 'excel-6b'
  | 'ppt-6b';

export const TRACK_LABELS: Record<CurriculumTrack, string> = {
  'office-fast-3in1': '1. Word, Excel, PowerPoint (3 Buổi 1 môn)',
  'cc-cntt-basic': '2. CC CNTT Cơ bản (6 buổi)',
  'cc-cntt-advanced': '3. CC CNTT Nâng cao (6 buổi)',
  'cntt-basic-we': '4. CNTT Cơ bản: Word + Excel (10-12 buổi)',
  'cntt-adv-we': '5. CNTT Nâng Cao: Word + Excel (10-12 buổi)',
  'ai-office': '6. Ứng dụng AI vào công việc Văn phòng (5 buổi)',
  'excel-accounting': '7. Excel cho Kế toán',
  'word-6b': '8. Kỹ năng soạn thảo Word (6 buổi)',
  'excel-6b': '9. Xử lý bảng tính Excel (6 buổi)',
  'ppt-6b': '10. Thiết kế thuyết trình PowerPoint (6 buổi)'
};

export const TRACK_LIST: { id: CurriculumTrack; label: string }[] = Object.entries(TRACK_LABELS).map(
  ([id, label]) => ({ id: id as CurriculumTrack, label })
);

export interface StudentAccount {
  id: string;
  name: string;
  studentCode: string;
  classCode?: string;      // e.g. "K26-WE01", "K26-CC02", "K26-AI01"
  phone?: string;
  email?: string;
  password?: string;
  schoolOrClass: string;
  programTrack: CurriculumTrack;
  enrolledTracks: CurriculumTrack[];
  assignedTeacherId?: string;
  birthYear?: number;
  age?: number;
  parentName?: string;
  parentPhone?: string;
  parentZalo?: string;
  reminderSettings?: {
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
    preferredTime?: string;
  };
  mustChangePassword?: boolean;
  role: 'student';
  createdAt: string;
}

export interface TeacherAccount {
  id: string;
  name: string;
  teacherCode: string;
  phone?: string;
  email?: string;
  phoneOrEmail?: string;
  password?: string;
  assignedTracks: CurriculumTrack[];
  mustChangePassword?: boolean;
  role: 'teacher' | 'admin';
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  phoneOrEmail?: string;
  studentCode?: string;
  teacherCode?: string;
  classCode?: string;
  role: UserRole;
  avatar?: string;
  schoolOrClass?: string;
  programTrack?: CurriculumTrack;
  enrolledTracks?: CurriculumTrack[];
  assignedTracks?: CurriculumTrack[];
  mustChangePassword?: boolean;
  createdAt: string;
}

export interface AuthState {
  currentUser: UserProfile;
  isAuthenticated: boolean;
}
