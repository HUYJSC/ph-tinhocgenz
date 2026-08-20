import { useState, useEffect } from 'react';
import { UserProfile, StudentAccount, CurriculumTrack } from '../types/auth';

const AUTH_USER_KEY = 'phtinhocgenz_auth_user_v2';
const STUDENT_ACCOUNTS_KEY = 'phtinhocgenz_student_accounts_v2';

export const INITIAL_STUDENT_ACCOUNTS: StudentAccount[] = [
  {
    id: 'std-101',
    name: 'Nguyễn Văn An',
    studentCode: 'THGZ01',
    password: '123',
    schoolOrClass: 'Lớp CNTT Cơ Bản K1',
    programTrack: 'cntt-basic',
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-102',
    name: 'Trần Thị Mai',
    studentCode: 'THGZ02',
    password: '123',
    schoolOrClass: 'Lớp Luyện Thi MOS Quốc Tế',
    programTrack: 'mos-office',
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-103',
    name: 'Lê Hoàng Long',
    studentCode: 'THGZ03',
    password: '123',
    schoolOrClass: 'Lớp Lập Trình Python K12',
    programTrack: 'programming',
    role: 'student',
    createdAt: '2026-08-20'
  }
];

export const DEFAULT_ADMIN_USER: UserProfile = {
  id: 'admin-01',
  name: 'Thầy Huy (Giảng Viên Trưởng)',
  email: 'admin@tinhocgenz.io.vn',
  role: 'admin',
  schoolOrClass: 'PH Digital Education • Ban Giảng Huấn',
  createdAt: '2026-08-15'
};

export function useAuth() {
  // 1. Student Accounts Directory (Managed by Teacher)
  const [studentAccounts, setStudentAccounts] = useState<StudentAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STUDENT_ACCOUNTS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load student accounts', e);
    }
    return INITIAL_STUDENT_ACCOUNTS;
  });

  // 2. Current Logged-in User Session
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load auth user', e);
    }
    return {
      id: INITIAL_STUDENT_ACCOUNTS[0].id,
      name: INITIAL_STUDENT_ACCOUNTS[0].name,
      studentCode: INITIAL_STUDENT_ACCOUNTS[0].studentCode,
      schoolOrClass: INITIAL_STUDENT_ACCOUNTS[0].schoolOrClass,
      programTrack: INITIAL_STUDENT_ACCOUNTS[0].programTrack,
      role: 'student',
      createdAt: INITIAL_STUDENT_ACCOUNTS[0].createdAt
    };
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STUDENT_ACCOUNTS_KEY, JSON.stringify(studentAccounts));
    } catch (e) {
      console.error('Failed to save student accounts', e);
    }
  }, [studentAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to persist auth user', e);
    }
  }, [user]);

  // Login as Student with Student Code & Password
  const loginWithStudentCode = (studentCodeInput: string, passwordInput?: string) => {
    const cleanCode = studentCodeInput.trim().toUpperCase();
    const cleanPass = passwordInput ? passwordInput.trim() : '';

    const found = studentAccounts.find(
      s => s.studentCode.toUpperCase() === cleanCode
    );

    if (found) {
      // Check password if set (default allow 123, 123456, or matching password)
      if (found.password && cleanPass && found.password !== cleanPass && cleanPass !== '123' && cleanPass !== '123456') {
        return { success: false, message: 'Mật khẩu học sinh không chính xác (Mặc định: 123)!' };
      }

      const loggedUser: UserProfile = {
        id: found.id,
        name: found.name,
        studentCode: found.studentCode,
        schoolOrClass: found.schoolOrClass,
        programTrack: found.programTrack,
        role: 'student',
        createdAt: found.createdAt
      };
      setUser(loggedUser);
      return { success: true, user: loggedUser };
    }

    // If code doesn't exist, allow auto quick create for instant onboarding
    const newStudent: StudentAccount = {
      id: `std-${Date.now()}`,
      name: studentCodeInput.trim(),
      studentCode: `THGZ${Math.floor(10 + Math.random() * 90)}`,
      password: '123',
      schoolOrClass: 'Lớp Tin Học Chuẩn',
      programTrack: 'cntt-basic',
      role: 'student',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setStudentAccounts(prev => [newStudent, ...prev]);

    const loggedUser: UserProfile = {
      id: newStudent.id,
      name: newStudent.name,
      studentCode: newStudent.studentCode,
      schoolOrClass: newStudent.schoolOrClass,
      programTrack: newStudent.programTrack,
      role: 'student',
      createdAt: newStudent.createdAt
    };
    setUser(loggedUser);
    return { success: true, user: loggedUser };
  };

  // Login as Admin / Teacher
  const loginAsAdmin = (passwordOrPin: string, adminName?: string) => {
    const validCodes = ['123456', '9999', 'admin', 'admin123', 'phtinhocgenz', '123'];
    if (validCodes.includes(passwordOrPin.trim())) {
      const adminUser: UserProfile = {
        ...DEFAULT_ADMIN_USER,
        name: adminName?.trim() || DEFAULT_ADMIN_USER.name
      };
      setUser(adminUser);
      return { success: true, user: adminUser };
    }
    return { success: false, message: 'Mã PIN hoặc mật khẩu quản trị không đúng!' };
  };

  // Teacher creates a new student account
  const createStudentAccount = (
    name: string,
    studentCode: string,
    password: string = '123',
    schoolOrClass: string = 'Lớp Tin Học',
    programTrack: CurriculumTrack = 'cntt-basic'
  ): StudentAccount => {
    const newAcc: StudentAccount = {
      id: `std-${Date.now()}`,
      name: name.trim(),
      studentCode: studentCode.trim().toUpperCase(),
      password: password.trim() || '123',
      schoolOrClass: schoolOrClass.trim() || 'Lớp Tin Học',
      programTrack,
      role: 'student',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setStudentAccounts(prev => [newAcc, ...prev]);
    return newAcc;
  };

  // Teacher deletes a student account
  const deleteStudentAccount = (studentId: string) => {
    setStudentAccounts(prev => prev.filter(s => s.id !== studentId));
  };

  // Logout / Switch
  const logout = () => {
    const defaultStd = studentAccounts[0] || INITIAL_STUDENT_ACCOUNTS[0];
    setUser({
      id: defaultStd.id,
      name: defaultStd.name,
      studentCode: defaultStd.studentCode,
      schoolOrClass: defaultStd.schoolOrClass,
      programTrack: defaultStd.programTrack,
      role: 'student',
      createdAt: defaultStd.createdAt
    });
  };

  return {
    user,
    role: user.role,
    isAdmin: user.role === 'admin',
    isStudent: user.role === 'student',
    studentAccounts,
    loginWithStudentCode,
    loginAsAdmin,
    createStudentAccount,
    deleteStudentAccount,
    logout
  };
}
