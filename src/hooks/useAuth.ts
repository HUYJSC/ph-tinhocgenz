import { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types/auth';

const AUTH_USER_KEY = 'phtinhocgenz_auth_user_v1';

export const DEFAULT_STUDENT_USER: UserProfile = {
  id: 'std-demo-01',
  name: 'Học viên Tin Học GenZ',
  studentCode: 'THGZ-2026-88',
  role: 'student',
  schoolOrClass: 'Lớp Luyện Thi MOS & IC3',
  createdAt: '2026-08-20'
};

export const DEFAULT_ADMIN_USER: UserProfile = {
  id: 'admin-01',
  name: 'Thầy Huy (Giảng Viên Trưởng)',
  email: 'admin@tinhocgenz.io.vn',
  role: 'admin',
  schoolOrClass: 'PH Digital Education • Ban Giảng Huấn',
  createdAt: '2026-08-15'
};

export function useAuth() {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load auth user', e);
    }
    return DEFAULT_STUDENT_USER;
  });

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to persist auth user', e);
    }
  }, [user]);

  const loginAsStudent = (name: string, studentCode?: string, schoolOrClass?: string) => {
    const studentUser: UserProfile = {
      id: 'std-' + Date.now(),
      name: name.trim() || 'Học viên Tin Học GenZ',
      studentCode: studentCode?.trim() || `THGZ-${Math.floor(1000 + Math.random() * 9000)}`,
      schoolOrClass: schoolOrClass?.trim() || 'Lớp MOS / IC3 Quốc Tế',
      role: 'student',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUser(studentUser);
    return studentUser;
  };

  const loginAsAdmin = (passwordOrPin: string, adminName?: string) => {
    // Standard validation: PIN "123456", "9999", "admin" or "admin123"
    const validCodes = ['123456', '9999', 'admin', 'admin123', 'phtinhocgenz'];
    if (validCodes.includes(passwordOrPin.trim())) {
      const adminUser: UserProfile = {
        ...DEFAULT_ADMIN_USER,
        name: adminName?.trim() || DEFAULT_ADMIN_USER.name
      };
      setUser(adminUser);
      return { success: true, user: adminUser };
    }
    return { success: false, message: 'Mật khẩu hoặc mã PIN quản trị không chính xác!' };
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'admin') {
      setUser(DEFAULT_ADMIN_USER);
    } else {
      setUser(DEFAULT_STUDENT_USER);
    }
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updated }));
  };

  const logout = () => {
    setUser(DEFAULT_STUDENT_USER);
  };

  return {
    user,
    role: user.role,
    isAdmin: user.role === 'admin',
    isStudent: user.role === 'student',
    loginAsStudent,
    loginAsAdmin,
    switchRole,
    updateProfile,
    logout
  };
}
