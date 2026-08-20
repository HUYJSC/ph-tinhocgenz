export type UserRole = 'student' | 'admin';

export type CurriculumTrack =
  | 'cntt-basic'
  | 'cntt-advanced'
  | 'mos-office'
  | 'ic3-gs'
  | 'programming'
  | 'cyber-security';

export interface StudentAccount {
  id: string;
  name: string;
  studentCode: string;
  password?: string;
  schoolOrClass: string;
  programTrack: CurriculumTrack;
  role: 'student';
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
  createdAt: string;
}

export interface AuthState {
  currentUser: UserProfile;
  isAuthenticated: boolean;
}
