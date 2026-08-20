export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  studentCode?: string;
  role: UserRole;
  avatar?: string;
  schoolOrClass?: string;
  createdAt: string;
}

export interface AuthState {
  currentUser: UserProfile;
  isAuthenticated: boolean;
}
