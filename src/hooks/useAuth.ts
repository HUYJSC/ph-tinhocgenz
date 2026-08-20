import { useState, useEffect } from 'react';
import { UserProfile, StudentAccount, TeacherAccount, CurriculumTrack, TRACK_LABELS } from '../types/auth';

const AUTH_USER_KEY = 'phtinhocgenz_auth_user_v10';
const STUDENT_ACCOUNTS_KEY = 'phtinhocgenz_student_accounts_v10';
const TEACHER_ACCOUNTS_KEY = 'phtinhocgenz_teacher_accounts_v10';

export const ALL_10_TRACKS: CurriculumTrack[] = [
  'office-fast-3in1',
  'cc-cntt-basic',
  'cc-cntt-advanced',
  'cntt-basic-we',
  'cntt-adv-we',
  'ai-office',
  'excel-accounting',
  'word-6b',
  'excel-6b',
  'ppt-6b'
];

export const INITIAL_STUDENT_ACCOUNTS: StudentAccount[] = [
  {
    id: 'std-101',
    name: 'Nguyễn Văn An',
    studentCode: 'THGZ01',
    password: '123',
    schoolOrClass: 'Lớp Word, Excel, PowerPoint (3b/môn)',
    programTrack: 'office-fast-3in1',
    enrolledTracks: ['office-fast-3in1'],
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-102',
    name: 'Trần Thị Mai',
    studentCode: 'THGZ02',
    password: '123',
    schoolOrClass: 'Lớp CC CNTT Cơ bản (6 buổi)',
    programTrack: 'cc-cntt-basic',
    enrolledTracks: ['cc-cntt-basic'],
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-103',
    name: 'Phạm Minh Tuấn',
    studentCode: 'THGZ03',
    password: '123',
    schoolOrClass: 'Lớp CC CNTT Nâng cao (6 buổi)',
    programTrack: 'cc-cntt-advanced',
    enrolledTracks: ['cc-cntt-advanced'],
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-104',
    name: 'Đỗ Thu Hà',
    studentCode: 'THGZ04',
    password: '123',
    schoolOrClass: 'Lớp CNTT Cơ bản: Word + Excel (10-12b)',
    programTrack: 'cntt-basic-we',
    enrolledTracks: ['cntt-basic-we'],
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-105',
    name: 'Lê Hoàng Long',
    studentCode: 'THGZ05',
    password: '123',
    schoolOrClass: 'Lớp CNTT Nâng Cao: Word + Excel (10-12b)',
    programTrack: 'cntt-adv-we',
    enrolledTracks: ['cntt-adv-we'],
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-106',
    name: 'Vũ Hoàng Nam',
    studentCode: 'THGZ06',
    password: '123',
    schoolOrClass: 'Lớp Ứng dụng AI vào công việc Văn phòng (5b)',
    programTrack: 'ai-office',
    enrolledTracks: ['ai-office'],
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-107',
    name: 'Hoàng Khánh Linh',
    studentCode: 'THGZ07',
    password: '123',
    schoolOrClass: 'Lớp Excel cho Kế toán',
    programTrack: 'excel-accounting',
    enrolledTracks: ['excel-accounting'],
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-108',
    name: 'Bùi Quang Huy',
    studentCode: 'THGZ08',
    password: '123',
    schoolOrClass: 'Lớp Word (6 buổi)',
    programTrack: 'word-6b',
    enrolledTracks: ['word-6b'],
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
    assignedTracks: ['office-fast-3in1', 'cc-cntt-basic', 'word-6b', 'excel-6b', 'ppt-6b'],
    role: 'teacher',
    createdAt: '2026-08-20'
  },
  {
    id: 'tch-02',
    name: 'Thầy Đức Nam',
    teacherCode: 'GV02',
    password: '123',
    phoneOrEmail: 'ducnam@tinhocgenz.io.vn',
    assignedTracks: ['cc-cntt-advanced', 'cntt-adv-we', 'ai-office', 'excel-accounting'],
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
  enrolledTracks: ALL_10_TRACKS,
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
    const starterStudent = INITIAL_STUDENT_ACCOUNTS[0]; // Nguyen Van An - Word, Excel, PPT
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

      const studentAllowedTracks = found.enrolledTracks || (found.programTrack ? [found.programTrack] : ['office-fast-3in1']);

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
    const chosenTrack: CurriculumTrack = targetTrack || 'office-fast-3in1';
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
      programTrack: chosenTrack,
      enrolledTracks: [chosenTrack],
      role: 'student',
      createdAt: newStudent.createdAt
    };

    setUser(loggedUser);
    return { success: true, user: loggedUser };
  };

  // Login as Staff (Admin or Teacher)
  const loginAsStaff = (passwordOrPin: string, staffNameOrCode?: string, selectedTrack?: CurriculumTrack | 'all') => {
    const cleanPin = passwordOrPin.trim();
    const cleanName = staffNameOrCode ? staffNameOrCode.trim() : '';

    // Check Super Admin PIN: 'admin123' or '123'
    if (cleanPin === 'admin123' || cleanPin === '123' || cleanPin === '123456') {
      if (!cleanName || cleanName.toLowerCase().includes('huy') || cleanName.toLowerCase().includes('admin')) {
        const adminProfile: UserProfile = {
          ...DEFAULT_ADMIN_USER,
          name: cleanName || DEFAULT_ADMIN_USER.name,
          programTrack: selectedTrack === 'all' ? undefined : selectedTrack,
          enrolledTracks: ALL_10_TRACKS
        };
        setUser(adminProfile);
        return { success: true, user: adminProfile };
      }
    }

    // Check Teacher Accounts
    const matchedTeacher = teacherAccounts.find(
      t =>
        (cleanName && (t.teacherCode.toUpperCase() === cleanName.toUpperCase() || t.name.toLowerCase() === cleanName.toLowerCase())) ||
        (t.password && t.password === cleanPin) ||
        (t.teacherCode.toUpperCase() === cleanPin.toUpperCase())
    );

    if (matchedTeacher) {
      if (matchedTeacher.password && cleanPin && matchedTeacher.password !== cleanPin && cleanPin !== '123') {
        return { success: false, message: 'Mật khẩu Giảng viên không chính xác (Mặc định: 123)!' };
      }

      // Check track permissions for teacher
      if (selectedTrack && selectedTrack !== 'all' && !matchedTeacher.assignedTracks.includes(selectedTrack)) {
        return {
          success: false,
          message: `Giảng viên ${matchedTeacher.name} không được phân công giảng dạy môn "${TRACK_LABELS[selectedTrack]}".`
        };
      }

      const teacherProfile: UserProfile = {
        id: matchedTeacher.id,
        name: matchedTeacher.name,
        email: matchedTeacher.phoneOrEmail,
        studentCode: matchedTeacher.teacherCode,
        role: 'teacher',
        schoolOrClass: `Giảng Viên: ${matchedTeacher.assignedTracks.map(t => TRACK_LABELS[t]).join(', ')}`,
        programTrack: selectedTrack === 'all' ? matchedTeacher.assignedTracks[0] : selectedTrack,
        enrolledTracks: matchedTeacher.assignedTracks,
        createdAt: matchedTeacher.createdAt
      };

      setUser(teacherProfile);
      return { success: true, user: teacherProfile };
    }

    return { success: false, message: 'Thông tin đăng nhập Giảng viên/Admin không hợp lệ!' };
  };

  // Quick switch between active student tracks (if student is enrolled in multiple tracks)
  const switchStudentTrack = (track: CurriculumTrack) => {
    const studentAllowedTracks = user.enrolledTracks || (user.programTrack ? [user.programTrack] : ['office-fast-3in1']);
    if (user.role === 'admin' || studentAllowedTracks.includes(track)) {
      setUser(prev => ({
        ...prev,
        programTrack: track
      }));
      return { success: true };
    }
    return {
      success: false,
      message: `Bạn chưa đăng ký môn học "${TRACK_LABELS[track]}". Vui lòng liên hệ Thầy Cô quản trị để cấp quyền.`
    };
  };

  // Create new student account (Admin/Teacher Action)
  const createStudentAccount = (
    name: string,
    studentCode: string,
    password?: string,
    schoolOrClass?: string,
    programTrack: CurriculumTrack = 'office-fast-3in1',
    enrolledTracks?: CurriculumTrack[]
  ) => {
    const tracks = enrolledTracks && enrolledTracks.length > 0 ? enrolledTracks : [programTrack];
    const newStudent: StudentAccount = {
      id: `std-${Date.now()}`,
      name: name.trim(),
      studentCode: studentCode.trim().toUpperCase(),
      password: password || '123',
      schoolOrClass: schoolOrClass || `Lớp ${TRACK_LABELS[programTrack]}`,
      programTrack,
      enrolledTracks: tracks,
      role: 'student',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setStudentAccounts(prev => [newStudent, ...prev]);
    return newStudent;
  };

  // Update existing student account (Admin/Teacher Action)
  const updateStudentAccount = (updatedAccount: StudentAccount) => {
    setStudentAccounts(prev =>
      prev.map(s => (s.id === updatedAccount.id ? updatedAccount : s))
    );

    // If currently logged in as this student, update session
    if (user.id === updatedAccount.id) {
      setUser(prev => ({
        ...prev,
        name: updatedAccount.name,
        studentCode: updatedAccount.studentCode,
        schoolOrClass: updatedAccount.schoolOrClass,
        programTrack: updatedAccount.programTrack,
        enrolledTracks: updatedAccount.enrolledTracks
      }));
    }
  };

  // Delete student account (Admin Action)
  const deleteStudentAccount = (id: string) => {
    setStudentAccounts(prev => prev.filter(s => s.id !== id));
  };

  // Create new teacher account (Admin Action Only)
  const createTeacherAccount = (
    name: string,
    teacherCode: string,
    password?: string,
    phoneOrEmail?: string,
    assignedTracks: CurriculumTrack[] = ['office-fast-3in1']
  ) => {
    const newTeacher: TeacherAccount = {
      id: `tch-${Date.now()}`,
      name: name.trim(),
      teacherCode: teacherCode.trim().toUpperCase(),
      password: password || '123',
      phoneOrEmail: phoneOrEmail || '',
      assignedTracks,
      role: 'teacher',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTeacherAccounts(prev => [newTeacher, ...prev]);
    return newTeacher;
  };

  // Update teacher account (Admin Action Only)
  const updateTeacherAccount = (updatedTeacher: TeacherAccount) => {
    setTeacherAccounts(prev =>
      prev.map(t => (t.id === updatedTeacher.id ? updatedTeacher : t))
    );

    // If currently logged in as this teacher, update session
    if (user.id === updatedTeacher.id) {
      setUser(prev => ({
        ...prev,
        name: updatedTeacher.name,
        studentCode: updatedTeacher.teacherCode,
        email: updatedTeacher.phoneOrEmail,
        enrolledTracks: updatedTeacher.assignedTracks,
        schoolOrClass: `Giảng Viên: ${updatedTeacher.assignedTracks.map(t => TRACK_LABELS[t]).join(', ')}`
      }));
    }
  };

  // Delete teacher account (Admin Action Only)
  const deleteTeacherAccount = (id: string) => {
    setTeacherAccounts(prev => prev.filter(t => t.id !== id));
  };

  const logout = () => {
    const defaultStudent = INITIAL_STUDENT_ACCOUNTS[0];
    const loggedOutUser: UserProfile = {
      id: defaultStudent.id,
      name: defaultStudent.name,
      studentCode: defaultStudent.studentCode,
      schoolOrClass: defaultStudent.schoolOrClass,
      programTrack: defaultStudent.programTrack,
      enrolledTracks: defaultStudent.enrolledTracks,
      role: 'student',
      createdAt: defaultStudent.createdAt
    };
    setUser(loggedOutUser);
  };

  return {
    user,
    isAuthenticated: true,
    isAdmin: user.role === 'admin',
    isTeacher: user.role === 'teacher',
    isStaff: user.role === 'admin' || user.role === 'teacher',
    studentAccounts,
    teacherAccounts,
    loginWithStudentCode,
    loginAsStaff,
    createStudentAccount,
    updateStudentAccount,
    deleteStudentAccount,
    createTeacherAccount,
    updateTeacherAccount,
    deleteTeacherAccount,
    switchStudentTrack,
    logout
  };
}
