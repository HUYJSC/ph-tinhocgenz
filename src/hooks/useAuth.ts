import { useState, useEffect } from 'react';
import { UserProfile, StudentAccount, TeacherAccount, CurriculumTrack, TRACK_LABELS } from '../types/auth';

const AUTH_USER_KEY = 'phtinhocgenz_auth_user_v6';
const STUDENT_ACCOUNTS_KEY = 'phtinhocgenz_student_accounts_v6';
const TEACHER_ACCOUNTS_KEY = 'phtinhocgenz_teacher_accounts_v6';

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

export const INITIAL_TEACHER_ACCOUNTS: TeacherAccount[] = [
  {
    id: 'tch-01',
    name: 'Cô Hoàng Mai',
    teacherCode: 'GV01',
    password: '123',
    phoneOrEmail: 'hoangmai@tinhocgenz.io.vn',
    assignedTracks: ['mos-office', 'ic3-gs'],
    role: 'teacher',
    createdAt: '2026-08-20'
  },
  {
    id: 'tch-02',
    name: 'Thầy Đức Nam',
    teacherCode: 'GV02',
    password: '123',
    phoneOrEmail: 'ducnam@tinhocgenz.io.vn',
    assignedTracks: ['programming', 'cntt-advanced'],
    role: 'teacher',
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
  // 1. Student Accounts Directory
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

  // 2. Teacher Accounts Directory (Managed exclusively by Admin)
  const [teacherAccounts, setTeacherAccounts] = useState<TeacherAccount[]>(() => {
    try {
      const saved = localStorage.getItem(TEACHER_ACCOUNTS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load teacher accounts', e);
    }
    return INITIAL_TEACHER_ACCOUNTS;
  });

  // 3. Current Logged-in User Session
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse auth user', e);
    }
    const starterStudent = INITIAL_STUDENT_ACCOUNTS[1]; // Tran Thi Mai - MOS
    return {
      id: starterStudent.id,
      name: starterStudent.name,
      studentCode: starterStudent.studentCode,
      schoolOrClass: starterStudent.schoolOrClass,
      programTrack: starterStudent.programTrack,
      enrolledTracks: starterStudent.enrolledTracks,
      role: 'student',
      createdAt: starterStudent.createdAt
    };
  });

  // Persist student accounts
  useEffect(() => {
    try {
      localStorage.setItem(STUDENT_ACCOUNTS_KEY, JSON.stringify(studentAccounts));
    } catch (e) {
      console.error('Failed to save student accounts', e);
    }
  }, [studentAccounts]);

  // Persist teacher accounts
  useEffect(() => {
    try {
      localStorage.setItem(TEACHER_ACCOUNTS_KEY, JSON.stringify(teacherAccounts));
    } catch (e) {
      console.error('Failed to save teacher accounts', e);
    }
  }, [teacherAccounts]);

  // Persist active user session
  useEffect(() => {
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user session', e);
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
      if (targetTrack && !studentAllowedTracks.includes(targetTrack)) {
        const studentPrimaryTrackName = found.programTrack ? TRACK_LABELS[found.programTrack] : 'Chương trình khác';

        return {
          success: false,
          message: `Chương trình học không khớp. Tài khoản của bạn hiện thuộc lớp "${studentPrimaryTrackName}". Vui lòng chọn đúng môn này để vào học.`
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

  // Unified Staff Authentication: Checks for Admin PIN or Teacher Account
  const loginAsStaff = (passwordOrPin: string, staffNameOrCode?: string, selectedTrack?: CurriculumTrack | 'all') => {
    const cleanInput = (staffNameOrCode || '').trim();
    const cleanPass = passwordOrPin.trim();

    // 1. Check if matches Super Admin PIN
    const adminPins = ['admin123', 'admin', '123456', '9999', 'phtinhocgenz'];
    if (adminPins.includes(cleanPass) || cleanInput.toLowerCase().includes('admin') || cleanInput.toLowerCase().includes('thầy huy')) {
      const adminUser: UserProfile = {
        ...DEFAULT_ADMIN_USER,
        name: cleanInput || DEFAULT_ADMIN_USER.name,
        programTrack: selectedTrack && selectedTrack !== 'all' ? selectedTrack : undefined,
        role: 'admin',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUser(adminUser);
      return { success: true, user: adminUser };
    }

    // 2. Check if matches a Teacher Account (Giảng Viên)
    const foundTeacher = teacherAccounts.find(
      t => t.teacherCode.toUpperCase() === cleanInput.toUpperCase() ||
           t.name.toLowerCase() === cleanInput.toLowerCase() ||
           t.phoneOrEmail?.toLowerCase() === cleanInput.toLowerCase()
    );

    if (foundTeacher) {
      if (foundTeacher.password && cleanPass && foundTeacher.password !== cleanPass && cleanPass !== '123') {
        return { success: false, message: 'Mật khẩu giảng viên không chính xác (Mặc định: 123)!' };
      }

      const teacherUser: UserProfile = {
        id: foundTeacher.id,
        name: foundTeacher.name,
        studentCode: foundTeacher.teacherCode,
        role: 'teacher',
        schoolOrClass: `Giảng Viên: ${foundTeacher.assignedTracks.map(t => TRACK_LABELS[t]).join(', ')}`,
        programTrack: selectedTrack && selectedTrack !== 'all' ? selectedTrack : foundTeacher.assignedTracks[0],
        enrolledTracks: foundTeacher.assignedTracks,
        createdAt: foundTeacher.createdAt
      };
      setUser(teacherUser);
      return { success: true, user: teacherUser };
    }

    // 3. Fallback: if PIN is default '123' and no specific teacher matched, log in as Admin
    if (cleanPass === '123' || cleanPass === '123456') {
      const adminUser: UserProfile = {
        ...DEFAULT_ADMIN_USER,
        name: cleanInput || DEFAULT_ADMIN_USER.name,
        role: 'admin',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUser(adminUser);
      return { success: true, user: adminUser };
    }

    return { success: false, message: 'Mã giảng viên hoặc mật khẩu quản trị không chính xác!' };
  };

  // Student Account CRUD
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

  const updateStudentAccount = (updatedAccount: StudentAccount) => {
    setStudentAccounts(prev => prev.map(s => s.id === updatedAccount.id ? updatedAccount : s));

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

  const deleteStudentAccount = (accountId: string) => {
    setStudentAccounts(prev => prev.filter(s => s.id !== accountId));
  };

  // Teacher Account CRUD (Exclusively by Admin)
  const createTeacherAccount = (
    name: string,
    teacherCode: string,
    password: string = '123',
    phoneOrEmail?: string,
    assignedTracks: CurriculumTrack[] = ['mos-office']
  ) => {
    const cleanCode = teacherCode.trim().toUpperCase();
    if (teacherAccounts.some(t => t.teacherCode.toUpperCase() === cleanCode)) {
      return { success: false, message: `Mã giảng viên "${cleanCode}" đã tồn tại!` };
    }

    const newTeacher: TeacherAccount = {
      id: `tch-${Date.now()}`,
      name: name.trim(),
      teacherCode: cleanCode,
      password: password?.trim() || '123',
      phoneOrEmail: phoneOrEmail?.trim(),
      assignedTracks: assignedTracks.length > 0 ? assignedTracks : ['mos-office'],
      role: 'teacher',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTeacherAccounts(prev => [newTeacher, ...prev]);
    return { success: true, account: newTeacher };
  };

  const updateTeacherAccount = (updatedTeacher: TeacherAccount) => {
    setTeacherAccounts(prev => prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));

    setUser(prev => {
      if (prev.id === updatedTeacher.id || prev.studentCode === updatedTeacher.teacherCode) {
        return {
          ...prev,
          name: updatedTeacher.name,
          studentCode: updatedTeacher.teacherCode,
          enrolledTracks: updatedTeacher.assignedTracks
        };
      }
      return prev;
    });

    return { success: true };
  };

  const deleteTeacherAccount = (teacherId: string) => {
    setTeacherAccounts(prev => prev.filter(t => t.id !== teacherId));
  };

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
    isTeacher: user.role === 'teacher',
    isStaff: user.role === 'admin' || user.role === 'teacher',
    studentAccounts,
    teacherAccounts,
    loginWithStudentCode,
    loginAsAdmin: loginAsStaff,
    loginAsStaff,
    createStudentAccount,
    updateStudentAccount,
    deleteStudentAccount,
    createTeacherAccount,
    updateTeacherAccount,
    deleteTeacherAccount,
    switchStudentTrack
  };
}
