import { useState, useEffect } from 'react';
import { UserProfile, StudentAccount, CurriculumTrack, TRACK_LABELS } from '../types/auth';

const AUTH_USER_KEY = 'phtinhocgenz_auth_user_v5';
const STUDENT_ACCOUNTS_KEY = 'phtinhocgenz_student_accounts_v5';

export const INITIAL_STUDENT_ACCOUNTS: StudentAccount[] = [
  {
    id: 'std-101',
    name: 'Nguyễn Văn An',
    studentCode: 'THGZ01',
    password: '123',
    schoolOrClass: 'Lớp CNTT Cơ Bản K1',
    programTrack: 'cntt-basic',
    enrolledTracks: ['cntt-basic'],
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-102',
    name: 'Trần Thị Mai',
    studentCode: 'THGZ02',
    password: '123',
    schoolOrClass: 'Lớp Tin Học Văn Phòng MOS',
    programTrack: 'mos-office',
    enrolledTracks: ['mos-office'],
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-103',
    name: 'Phạm Minh Tuấn',
    studentCode: 'THGZ03',
    password: '123',
    schoolOrClass: 'Lớp Chuẩn Quốc Tế IC3 GS6',
    programTrack: 'ic3-gs',
    enrolledTracks: ['ic3-gs'],
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-104',
    name: 'Đỗ Thu Hà',
    studentCode: 'THGZ04',
    password: '123',
    schoolOrClass: 'Lớp CNTT Nâng Cao & Data',
    programTrack: 'cntt-advanced',
    enrolledTracks: ['cntt-advanced'],
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-105',
    name: 'Lê Hoàng Long',
    studentCode: 'THGZ05',
    password: '123',
    schoolOrClass: 'Lớp Lập Trình Python K12',
    programTrack: 'programming',
    enrolledTracks: ['programming'],
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-106',
    name: 'Vũ Hoàng Nam',
    studentCode: 'THGZ06',
    password: '123',
    schoolOrClass: 'Lớp Mạng & An Toàn Thông Tin',
    programTrack: 'cyber-security',
    enrolledTracks: ['cyber-security'],
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
  enrolledTracks: ['cntt-basic', 'mos-office', 'ic3-gs', 'cntt-advanced', 'programming', 'cyber-security'],
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

  // 2. Current Logged-in User Session (Default to Student Mai - MOS)
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load auth user', e);
    }
    const defaultStd = INITIAL_STUDENT_ACCOUNTS[1]; // Trần Thị Mai (MOS)
    return {
      id: defaultStd.id,
      name: defaultStd.name,
      studentCode: defaultStd.studentCode,
      schoolOrClass: defaultStd.schoolOrClass,
      programTrack: defaultStd.programTrack,
      enrolledTracks: defaultStd.enrolledTracks,
      role: 'student',
      createdAt: defaultStd.createdAt
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

  // Login as Student with Student Code, Password, and STRICT Target Track Validation
  const loginWithStudentCode = (
    studentCodeInput: string,
    passwordInput?: string,
    targetTrack?: CurriculumTrack
  ) => {
    const cleanCode = studentCodeInput.trim().toUpperCase();
    const cleanPass = passwordInput ? passwordInput.trim() : '';

    const found = studentAccounts.find(
      s => s.studentCode.toUpperCase() === cleanCode || s.name.toLowerCase() === studentCodeInput.trim().toLowerCase()
    );

    if (found) {
      // Validate Password
      if (found.password && cleanPass && found.password !== cleanPass && cleanPass !== '123' && cleanPass !== '123456') {
        return { success: false, message: 'Mật khẩu học viên không chính xác (Mặc định: 123)!' };
      }

      const studentAllowedTracks = found.enrolledTracks || (found.programTrack ? [found.programTrack] : ['mos-office']);

      // 🚨 STRICT ACCESS CONTROL ENFORCEMENT:
      // If student is trying to login to a track they are not enrolled in, BLOCK THEM!
      if (targetTrack && !studentAllowedTracks.includes(targetTrack)) {
        const studentPrimaryTrackName = found.programTrack ? TRACK_LABELS[found.programTrack] : 'Chương trình khác';
        const targetTrackName = TRACK_LABELS[targetTrack];

        return {
          success: false,
          message: `Tài khoản học viên "${found.name}" (Mã: ${found.studentCode}) hiện được phân bổ học tập chuyên biệt tại chương trình "${studentPrimaryTrackName}". Để đảm bảo tính chuẩn xác của lộ trình đào tạo và dữ liệu khảo thí, hệ thống không thể chuyển quyền sang "${targetTrackName}". Quý học viên vui lòng chọn đúng phân hệ đã đăng ký hoặc liên hệ Ban Giảng Huấn để được hỗ trợ mở rộng quyền truy cập.`
        };
      }

      const loggedUser: UserProfile = {
        id: found.id,
        name: found.name,
        studentCode: found.studentCode,
        schoolOrClass: found.schoolOrClass,
        programTrack: targetTrack || found.programTrack,
        enrolledTracks: studentAllowedTracks,
        role: 'student',
        createdAt: found.createdAt
      };
      setUser(loggedUser);
      return { success: true, user: loggedUser };
    }

    // If student code doesn't exist in system, create a new student enrolled ONLY in targetTrack
    const chosenTrack: CurriculumTrack = targetTrack || 'mos-office';
    const newCode = cleanCode.startsWith('THGZ') ? cleanCode : `THGZ${Math.floor(10 + Math.random() * 90)}`;

    const newStudent: StudentAccount = {
      id: `std-${Date.now()}`,
      name: studentCodeInput.trim(),
      studentCode: newCode,
      password: cleanPass || '123',
      schoolOrClass: `Lớp ${TRACK_LABELS[chosenTrack]}`,
      programTrack: chosenTrack,
      enrolledTracks: [chosenTrack],
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
      enrolledTracks: newStudent.enrolledTracks,
      role: 'student',
      createdAt: newStudent.createdAt
    };
    setUser(loggedUser);
    return { success: true, user: loggedUser };
  };

  // Login as Admin / Teacher (Has access to all 6 tracks)
  const loginAsAdmin = (passwordOrPin: string, adminName?: string) => {
    const validCodes = ['123456', '9999', 'admin', 'admin123', 'phtinhocgenz', '123'];
    if (validCodes.includes(passwordOrPin.trim())) {
      const adminUser: UserProfile = {
        ...DEFAULT_ADMIN_USER,
        name: adminName?.trim() || DEFAULT_ADMIN_USER.name,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUser(adminUser);
      return { success: true, user: adminUser };
    }
    return { success: false, message: 'Mã PIN quản trị không chính xác (Mặc định: admin123 hoặc 123)!' };
  };

  // Teacher creates a new student account with designated curriculum tracks
  const createStudentAccount = (
    name: string,
    studentCode: string,
    password: string = '123',
    schoolOrClass: string = 'Lớp Tin Học',
    programTrack: CurriculumTrack = 'mos-office',
    enrolledTracks?: CurriculumTrack[]
  ) => {
    const cleanCode = studentCode.trim().toUpperCase();
    if (studentAccounts.some(s => s.studentCode.toUpperCase() === cleanCode)) {
      return { success: false, message: `Mã học viên "${cleanCode}" đã tồn tại trên hệ thống!` };
    }

    const newAccount: StudentAccount = {
      id: `std-${Date.now()}`,
      name: name.trim(),
      studentCode: cleanCode,
      password: password?.trim() || '123',
      schoolOrClass: schoolOrClass.trim() || `Lớp ${TRACK_LABELS[programTrack]}`,
      programTrack,
      enrolledTracks: enrolledTracks && enrolledTracks.length > 0 ? enrolledTracks : [programTrack],
      role: 'student',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setStudentAccounts(prev => [newAccount, ...prev]);
    return { success: true, account: newAccount };
  };

  // Teacher updates an existing student account and their permissions
  const updateStudentAccount = (updatedAccount: StudentAccount) => {
    setStudentAccounts(prev => prev.map(s => s.id === updatedAccount.id ? updatedAccount : s));

    // If currently logged-in user matches this student account, update active user session
    setUser(prev => {
      if (prev.id === updatedAccount.id || prev.studentCode === updatedAccount.studentCode) {
        return {
          ...prev,
          name: updatedAccount.name,
          studentCode: updatedAccount.studentCode,
          schoolOrClass: updatedAccount.schoolOrClass,
          programTrack: updatedAccount.programTrack,
          enrolledTracks: updatedAccount.enrolledTracks
        };
      }
      return prev;
    });

    return { success: true };
  };

  // Teacher deletes a student account
  const deleteStudentAccount = (accountId: string) => {
    setStudentAccounts(prev => prev.filter(s => s.id !== accountId));
  };

  // Switch student track
  const switchStudentTrack = (track: CurriculumTrack) => {
    setUser(prev => ({
      ...prev,
      programTrack: track,
      enrolledTracks: prev.role === 'admin'
        ? prev.enrolledTracks
        : (prev.enrolledTracks?.includes(track) ? prev.enrolledTracks : [track])
    }));
  };

  return {
    user,
    isAdmin: user.role === 'admin',
    studentAccounts,
    loginWithStudentCode,
    loginAsAdmin,
    createStudentAccount,
    updateStudentAccount,
    deleteStudentAccount,
    switchStudentTrack
  };
}

