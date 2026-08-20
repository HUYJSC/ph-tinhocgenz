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
  'office-fast-3in1': '1. Word, Excel, PowerPoint (3Buổi 1 môn)',
  'cc-cntt-basic': '2. CC CNTT Cơ bản (6 buổi)',
  'cc-cntt-advanced': '3. CC CNTT Nâng cao (6 buổi)',
  'cntt-basic-we': '4. CNTT Cơ bản: Word + Excel (10-12b)',
  'cntt-adv-we': '5. CNTT Nâng Cao: Word + Excel (10-12b)',
  'ai-office': '6. Ứng dụng AI vào công việc Văn phòng (5b)',
  'excel-accounting': '7. Excel cho Kế toán (Custom tuỳ nhu cầu)',
  'word-6b': '8. Word (6 buổi)',
  'excel-6b': '9. Excel (6 buổi)',
  'ppt-6b': '10. PPT (6 buổi)'
};

export interface StudentAccount {
  id: string;
  name: string;
  studentCode: string;
  classCode?: string;      // e.g. "K26-WE01", "K26-CC02", "K26-AI01"
  phone?: string;
  password?: string;
  schoolOrClass: string;
  programTrack: CurriculumTrack;
  enrolledTracks: CurriculumTrack[];
  assignedTeacherId?: string;
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
