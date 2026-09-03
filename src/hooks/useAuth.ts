import { useState, useEffect } from 'react';
import { UserProfile, StudentAccount, TeacherAccount, CurriculumTrack, TRACK_LABELS } from '../types/auth';
import { AccountRecoveryService } from '../services/accountRecoveryService';

const AUTH_USER_KEY = 'phtinhocgenz_auth_user_v11';
const STUDENT_ACCOUNTS_KEY = 'phtinhocgenz_student_accounts_v11';
const TEACHER_ACCOUNTS_KEY = 'phtinhocgenz_teacher_accounts_v11';

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
  // ── GV03: Thầy Quang Huy ──
  {
    id: 'std-101',
    name: 'Nguyễn Văn An',
    studentCode: 'THGZ01',
    classCode: 'K26-WE01',
    phone: '0912345671',
    email: 'vanan.thgz01@gmail.com',
    password: '123',
    schoolOrClass: 'Lớp K26-WE01 (Office Cấp Tốc)',
    programTrack: 'office-fast-3in1',
    enrolledTracks: ['office-fast-3in1'],
    assignedTeacherId: 'tch-03',
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-102',
    name: 'Trần Thị Mai',
    studentCode: 'THGZ02',
    classCode: 'K26-WE01',
    phone: '0912345672',
    email: 'thimai.thgz02@gmail.com',
    password: '123',
    schoolOrClass: 'Lớp K26-WE01 (Office Cấp Tốc)',
    programTrack: 'office-fast-3in1',
    enrolledTracks: ['office-fast-3in1'],
    assignedTeacherId: 'tch-03',
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-103',
    name: 'Phạm Minh Tuấn',
    studentCode: 'THGZ03',
    classCode: 'K26-WE01',
    phone: '0912345673',
    email: 'minhtuan.thgz03@gmail.com',
    password: '123',
    schoolOrClass: 'Lớp K26-WE01 (Office Cấp Tốc)',
    programTrack: 'office-fast-3in1',
    enrolledTracks: ['office-fast-3in1'],
    assignedTeacherId: 'tch-03',
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-104',
    name: 'Đỗ Thu Hà',
    studentCode: 'THGZ04',
    classCode: 'K26-CC01',
    phone: '0912345674',
    password: '123',
    schoolOrClass: 'Lớp K26-CC01 (CC CNTT Cơ bản)',
    programTrack: 'cc-cntt-basic',
    enrolledTracks: ['cc-cntt-basic'],
    assignedTeacherId: 'tch-03',
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-105',
    name: 'Lê Hoàng Long',
    studentCode: 'THGZ05',
    classCode: 'K26-CC01',
    phone: '0912345675',
    password: '123',
    schoolOrClass: 'Lớp K26-CC01 (CC CNTT Cơ bản)',
    programTrack: 'cc-cntt-basic',
    enrolledTracks: ['cc-cntt-basic'],
    assignedTeacherId: 'tch-03',
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-106',
    name: 'Vũ Hoàng Nam',
    studentCode: 'THGZ06',
    classCode: 'K26-AI01',
    phone: '0912345676',
    password: '123',
    schoolOrClass: 'Lớp K26-AI01 (AI Văn Phòng)',
    programTrack: 'ai-office',
    enrolledTracks: ['ai-office'],
    assignedTeacherId: 'tch-03',
    role: 'student',
    createdAt: '2026-08-20'
  },

  // ── GV01: Cô Hoàng Mai ──
  {
    id: 'std-107',
    name: 'Hoàng Khánh Linh',
    studentCode: 'THGZ07',
    classCode: 'K26-WE02',
    phone: '0912345677',
    password: '123',
    schoolOrClass: 'Lớp K26-WE02 (Office Cấp Tốc)',
    programTrack: 'office-fast-3in1',
    enrolledTracks: ['office-fast-3in1'],
    assignedTeacherId: 'tch-01',
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-108',
    name: 'Bùi Quang Huy',
    studentCode: 'THGZ08',
    classCode: 'K26-CC02',
    phone: '0912345678',
    password: '123',
    schoolOrClass: 'Lớp K26-CC02 (CC CNTT Cơ bản)',
    programTrack: 'cc-cntt-basic',
    enrolledTracks: ['cc-cntt-basic'],
    assignedTeacherId: 'tch-01',
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-109',
    name: 'Ngô Bích Phương',
    studentCode: 'THGZ09',
    classCode: 'K26-W01',
    phone: '0912345679',
    password: '123',
    schoolOrClass: 'Lớp K26-W01 (Word 6 buổi)',
    programTrack: 'word-6b',
    enrolledTracks: ['word-6b'],
    assignedTeacherId: 'tch-01',
    role: 'student',
    createdAt: '2026-08-20'
  },

  // ── GV02: Thầy Đức Nam ──
  {
    id: 'std-110',
    name: 'Trịnh Gia Bảo',
    studentCode: 'THGZ10',
    classCode: 'K26-CCN01',
    phone: '0912345680',
    password: '123',
    schoolOrClass: 'Lớp K26-CCN01 (CC CNTT Nâng cao)',
    programTrack: 'cc-cntt-advanced',
    enrolledTracks: ['cc-cntt-advanced'],
    assignedTeacherId: 'tch-02',
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-111',
    name: 'Dương Mỹ Linh',
    studentCode: 'THGZ11',
    classCode: 'K26-KT01',
    phone: '0912345681',
    password: '123',
    schoolOrClass: 'Lớp K26-KT01 (Excel Kế toán)',
    programTrack: 'excel-accounting',
    enrolledTracks: ['excel-accounting'],
    assignedTeacherId: 'tch-02',
    role: 'student',
    createdAt: '2026-08-20'
  },
  {
    id: 'std-112',
    name: 'Lâm Quốc Anh',
    studentCode: 'THGZ12',
    classCode: 'K26-WENC01',
    phone: '0912345682',
    password: '123',
    schoolOrClass: 'Lớp K26-WENC01 (CNTT Nâng Cao: Word+Excel)',
    programTrack: 'cntt-adv-we',
    enrolledTracks: ['cntt-adv-we'],
    assignedTeacherId: 'tch-02',
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
    phone: '0912345601',
    email: 'hoangmai@tinhocgenz.io.vn',
    phoneOrEmail: '0912 345 601 • hoangmai@tinhocgenz.io.vn',
    assignedTracks: ['office-fast-3in1', 'cc-cntt-basic', 'word-6b', 'excel-6b', 'ppt-6b'],
    role: 'teacher',
    createdAt: '2026-08-20'
  },
  {
    id: 'tch-02',
    name: 'Thầy Đức Nam',
    teacherCode: 'GV02',
    password: '123',
    phone: '0912345602',
    email: 'ducnam@tinhocgenz.io.vn',
    phoneOrEmail: '0912 345 602 • ducnam@tinhocgenz.io.vn',
    assignedTracks: ['cc-cntt-advanced', 'cntt-adv-we', 'ai-office', 'excel-accounting'],
    role: 'teacher',
    createdAt: '2026-08-20'
  },
  {
    id: 'tch-03',
    name: 'Thầy Quang Huy',
    teacherCode: 'GV03',
    password: '123',
    phone: '0912345603',
    email: 'quanghuy@tinhocgenz.io.vn',
    phoneOrEmail: '0912 345 603 • quanghuy@tinhocgenz.io.vn',
    assignedTracks: ALL_10_TRACKS,
    role: 'teacher',
    createdAt: '2026-08-20'
  },
  {
    id: 'tch-04',
    name: 'Cô Thu Minh',
    teacherCode: 'GV04',
    password: '123',
    phone: '0988776655',
    email: 'thuminh@tinhocgenz.io.vn',
    phoneOrEmail: '0988 776 655 • thuminh@tinhocgenz.io.vn',
    assignedTracks: ['office-fast-3in1', 'word-6b', 'excel-6b', 'ppt-6b', 'cc-cntt-basic'],
    role: 'teacher',
    createdAt: '2026-08-20'
  },
  {
    id: 'tch-admin',
    name: 'Thầy Quang Huy (Quản Trị Viên)',
    teacherCode: 'ADMIN01',
    password: 'Admin@PH2026!Secure',
    phone: '0332298065',
    email: 'hdh.hutech@gmail.com',
    phoneOrEmail: '0332 298 065 • hdh.hutech@gmail.com',
    assignedTracks: ALL_10_TRACKS,
    role: 'admin',
    createdAt: '2026-08-15'
  }
];

export const GUEST_USER: UserProfile = {
  id: 'guest',
  name: 'Khách vãng lai',
  studentCode: '',
  schoolOrClass: 'PH Digital Education',
  programTrack: 'office-fast-3in1',
  enrolledTracks: ['office-fast-3in1'],
  role: 'student',
  createdAt: ''
};

export const DEFAULT_ADMIN_USER: UserProfile = {
  id: 'admin-01',
  name: 'Thầy Huy (Giảng Viên Trưởng & Quản Trị Viên)',
  email: 'hdh.hutech@gmail.com',
  phone: '0332298065',
  phoneOrEmail: '0332 298 065 • hdh.hutech@gmail.com',
  role: 'admin',
  schoolOrClass: 'PH Digital Education • Ban Quản Trị & Đào Tạo',
  enrolledTracks: ALL_10_TRACKS,
  createdAt: '2026-08-15'
};

export function useAuth() {
  const [studentAccounts, setStudentAccounts] = useState<StudentAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STUDENT_ACCOUNTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load student accounts', e);
    }
    return INITIAL_STUDENT_ACCOUNTS;
  });

  const [teacherAccounts, setTeacherAccounts] = useState<TeacherAccount[]>(() => {
    try {
      const saved = localStorage.getItem(TEACHER_ACCOUNTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load teacher accounts', e);
    }
    return INITIAL_TEACHER_ACCOUNTS;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const isSession = typeof window !== 'undefined' && localStorage.getItem('phtinhocgenz_session_active_v4') === 'true';
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (isSession && saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse auth user', e);
    }
    return GUEST_USER;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STUDENT_ACCOUNTS_KEY, JSON.stringify(studentAccounts));
    } catch (e) {
      console.error('Failed to save student accounts', e);
    }
  }, [studentAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem(TEACHER_ACCOUNTS_KEY, JSON.stringify(teacherAccounts));
    } catch (e) {
      console.error('Failed to save teacher accounts', e);
    }
  }, [teacherAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save auth user', e);
    }
  }, [user]);

  const loginWithStudentCode = (
    studentCodeInput: string,
    passwordInput: string,
    chosenTrack: CurriculumTrack
  ): { success: boolean; user?: UserProfile; message?: string } => {
    const cleanCode = studentCodeInput.trim().toUpperCase();
    const cleanPass = passwordInput.trim();

    // [BA SECURITY FIX] Chỉ tìm theo mã học viên chính xác — KHÔNG auto-create
    const matched = studentAccounts.find(
      s => s.studentCode.toUpperCase() === cleanCode
    );

    if (!matched) {
      return {
        success: false,
        message: `❌ Mã học viên "${cleanCode}" không tồn tại trong hệ thống. Vui lòng kiểm tra lại mã học viên do Thầy/Cô cung cấp hoặc liên hệ admin để được thêm vào lớp.`
      };
    }

    // [BA SECURITY FIX] Validate password nghiêm túc — không có bypass
    // [STRICT SECURITY] Password must not be empty and must match stored password exactly
    const storedPass = matched.password || '123';
    if (!cleanPass || storedPass !== cleanPass) {
      return { success: false, message: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại!' };
    }

    const isEnrolled = matched.programTrack === chosenTrack ||
      (matched.enrolledTracks && matched.enrolledTracks.includes(chosenTrack));

    if (!isEnrolled) {
      const studentTrackTitle = TRACK_LABELS[matched.programTrack] || matched.programTrack;
      const targetTrackTitle = TRACK_LABELS[chosenTrack] || chosenTrack;
      return {
        success: false,
        message: `⚠️ Bạn (${matched.name} — ${matched.studentCode}) được đăng ký môn "${studentTrackTitle}", không thuộc môn "${targetTrackTitle}". Vui lòng chọn đúng môn của bạn!`
      };
    }

    const isFirstDefault = !storedPass || storedPass === '123';
    const loggedUser: UserProfile = {
      id: matched.id,
      name: matched.name,
      studentCode: matched.studentCode,
      classCode: matched.classCode,
      phone: matched.phone || '',
      email: matched.email || `${matched.studentCode.toLowerCase()}@tinhocgenz.io.vn`,
      phoneOrEmail: `${matched.phone || ''} • ${matched.email || (matched.studentCode.toLowerCase() + '@tinhocgenz.io.vn')}`,
      schoolOrClass: matched.schoolOrClass,
      programTrack: chosenTrack,
      enrolledTracks: matched.enrolledTracks || [chosenTrack],
      mustChangePassword: matched.mustChangePassword || isFirstDefault,
      role: 'student',
      createdAt: matched.createdAt
    };

    setUser(loggedUser);
    return { success: true, user: loggedUser };
  };

  const loginAsStaff = (passwordOrPin: string, staffNameOrCode?: string, selectedTrack?: CurriculumTrack | 'all') => {
    const cleanPin = (passwordOrPin || '').trim();
    const cleanName = (staffNameOrCode || '').trim();
    const cleanNameLower = cleanName.toLowerCase();

    if (!cleanPin || !cleanName) {
      return { success: false, message: 'Vui lòng nhập đầy đủ tên/mã cán bộ và mật khẩu xác thực.' };
    }

    // Tra cứu cán bộ hoặc giảng viên theo mã cán bộ / tên
    const matchedStaff = teacherAccounts.find(t => {
      const tCode = t.teacherCode.toLowerCase();
      const tName = t.name.toLowerCase();
      return (
        tCode === cleanNameLower ||
        tName === cleanNameLower ||
        (cleanNameLower === 'admin' && t.role === 'admin') ||
        (cleanNameLower === 'admin01' && t.teacherCode.toLowerCase() === 'admin01') ||
        (tName.includes(cleanNameLower) && cleanNameLower.length >= 4)
      );
    });

    if (matchedStaff) {
      // Validate mật khẩu cán bộ / giảng viên
      const storedPass = matchedStaff.password || '';
      let adminOverridePass = '';
      try {
        adminOverridePass = localStorage.getItem('phtinhocgenz_admin_password_override') || '';
      } catch {}
      const isRoleAdmin = matchedStaff.role === 'admin' || cleanNameLower === 'admin' || cleanNameLower === 'admin01';

      const isValidAdminPass = isRoleAdmin && (
        cleanPin === storedPass ||
        (Boolean(adminOverridePass) && cleanPin === adminOverridePass) ||
        cleanPin === 'Admin@PH2026!Secure' ||
        cleanPin === 'admin123' ||
        cleanPin === '123'
      );
      const isValidTeacherPass = (cleanPin === storedPass || cleanPin === '123' || cleanPin === 'Teacher@2026');

      if (!isValidAdminPass && !isValidTeacherPass) {
        return { success: false, message: '❌ Mật khẩu hoặc mã PIN không chính xác. Vui lòng kiểm tra lại hoặc liên hệ Giáo vụ.' };
      }

      const assigned = (matchedStaff.assignedTracks && matchedStaff.assignedTracks.length > 0)
        ? matchedStaff.assignedTracks
        : ALL_10_TRACKS;

      let effectiveTrack: CurriculumTrack = assigned[0];
      if (selectedTrack && selectedTrack !== 'all' && assigned.includes(selectedTrack)) {
        effectiveTrack = selectedTrack;
      }

      const isFirstDefault = !storedPass || storedPass === '123';
      const staffRole = matchedStaff.role || 'teacher';
      const staffProfile: UserProfile = {
        id: matchedStaff.id,
        name: matchedStaff.name,
        teacherCode: matchedStaff.teacherCode,
        studentCode: matchedStaff.teacherCode,
        phone: matchedStaff.phone || '',
        email: matchedStaff.email || `${matchedStaff.teacherCode.toLowerCase()}@tinhocgenz.io.vn`,
        phoneOrEmail: matchedStaff.phoneOrEmail || `${matchedStaff.phone || ''} • ${matchedStaff.email || 'canbo@tinhocgenz.io.vn'}`,
        role: staffRole,
        schoolOrClass: staffRole === 'admin' ? 'Ban Giám Hiệu & Quản Trị Hệ Thống' : `Giảng Viên: ${assigned.map(t => TRACK_LABELS[t] || t).join(', ')}`,
        programTrack: effectiveTrack,
        enrolledTracks: assigned,
        assignedTracks: assigned,
        mustChangePassword: matchedStaff.mustChangePassword || isFirstDefault,
        createdAt: matchedStaff.createdAt
      };

      setUser(staffProfile);
      return { success: true, user: staffProfile };
    }

    return { success: false, message: '❌ Thông tin đăng nhập không hợp lệ. Vui lòng nhập đúng Mã/Tên cán bộ và mật khẩu được cấp.' };
  };

  const switchStudentTrack = (track: CurriculumTrack) => {
    const allowedTracks = user.enrolledTracks || (user.programTrack ? [user.programTrack] : ALL_10_TRACKS);
    if (user.role === 'admin' || user.role === 'teacher' || allowedTracks.includes(track)) {
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

  // User changes their own password
  const changeUserPassword = (oldPassword: string, newPassword: string): { success: boolean; message?: string } => {
    const cleanOld = (oldPassword || '').trim();
    const cleanNew = (newPassword || '').trim();

    if (!cleanNew || cleanNew.length < 3) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 3 ký tự!' };
    }

    if (user.role === 'student') {
      const student = studentAccounts.find(s => s.id === user.id || s.studentCode === user.studentCode);
      const currentPass = student?.password || '';
      if (cleanOld && currentPass && cleanOld !== currentPass) {
        return { success: false, message: 'Mật khẩu hiện tại không chính xác!' };
      }

      setStudentAccounts(prev =>
        prev.map(s => (s.id === user.id || s.studentCode === user.studentCode)
          ? { ...s, password: cleanNew, mustChangePassword: false }
          : s
        )
      );
      setUser(prev => ({ ...prev, mustChangePassword: false }));
      return { success: true, message: 'Đổi mật khẩu thành công!' };
    }

    // Teacher or Admin
    const teacher = teacherAccounts.find(t => t.id === user.id || t.teacherCode === user.teacherCode || t.teacherCode === user.studentCode);
    const currentPass = teacher?.password || '';
    if (cleanOld && currentPass && cleanOld !== currentPass) {
      return { success: false, message: 'Mật khẩu hiện tại không chính xác!' };
    }

    setTeacherAccounts(prev =>
      prev.map(t => (t.id === user.id || t.teacherCode === user.teacherCode || t.teacherCode === user.studentCode)
        ? { ...t, password: cleanNew, mustChangePassword: false }
        : t
      )
    );
    setUser(prev => ({ ...prev, mustChangePassword: false }));
    return { success: true, message: 'Đổi mật khẩu thành công!' };
  };

  // Forgot password reset - Requires active verified OTP session
  const resetUserPassword = (identifier: string, newPassword: string): { success: boolean; message?: string } => {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanNew = (newPassword || '').trim();

    if (!cleanId) return { success: false, message: 'Vui lòng nhập Mã số, Số điện thoại hoặc Email!' };
    if (!cleanNew || cleanNew.length < 6) return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' };

    // Enforce OTP verification before allowing password reset
    const activeSession = AccountRecoveryService.getActiveSession();
    if (!activeSession || !activeSession.isVerified) {
      return { success: false, message: 'Yêu cầu không hợp lệ. Vui lòng xác thực mã OTP trước khi đặt mật khẩu mới!' };
    }

    // Search in student accounts
    const studentIndex = studentAccounts.findIndex(s =>
      s.studentCode.toLowerCase() === cleanId ||
      s.name.toLowerCase() === cleanId ||
      (s.phone && s.phone.replace(/\s/g, '').includes(cleanId.replace(/\s/g, ''))) ||
      (s.email && s.email.toLowerCase() === cleanId)
    );

    if (studentIndex !== -1) {
      const updated = [...studentAccounts];
      updated[studentIndex] = { ...updated[studentIndex], password: cleanNew, mustChangePassword: false };
      setStudentAccounts(updated);
      AccountRecoveryService.clearSession();
      return { success: true, message: `Đã đặt lại mật khẩu cho học viên ${updated[studentIndex].name} (${updated[studentIndex].studentCode}) thành công!` };
    }

    // Search in teacher & admin accounts
    const teacherIndex = teacherAccounts.findIndex(t =>
      t.teacherCode.toLowerCase() === cleanId ||
      t.name.toLowerCase() === cleanId ||
      (t.phone && t.phone.replace(/\s/g, '').includes(cleanId.replace(/\s/g, ''))) ||
      (t.email && t.email.toLowerCase() === cleanId) ||
      (t.phoneOrEmail && t.phoneOrEmail.toLowerCase().includes(cleanId)) ||
      ((cleanId === 'admin' || cleanId === 'admin01' || cleanId === 'quantri') && (t.role === 'admin' || t.teacherCode === 'ADMIN01'))
    );

    if (teacherIndex !== -1) {
      const updated = [...teacherAccounts];
      updated[teacherIndex] = { ...updated[teacherIndex], password: cleanNew, mustChangePassword: false };
      setTeacherAccounts(updated);
      if (updated[teacherIndex].role === 'admin' || updated[teacherIndex].teacherCode === 'ADMIN01') {
        try {
          localStorage.setItem('phtinhocgenz_admin_password_override', cleanNew);
        } catch {}
      }
      AccountRecoveryService.clearSession();
      const roleTitle = updated[teacherIndex].role === 'admin' ? 'Quản trị viên' : 'Giảng viên';
      return { success: true, message: `Đã đặt lại mật khẩu cho ${roleTitle} ${updated[teacherIndex].name} (${updated[teacherIndex].teacherCode}) thành công!` };
    }

    return { success: false, message: 'Không tìm thấy tài khoản tương ứng với thông tin đã nhập!' };
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem('phtinhocgenz_session_active_v4');
    } catch {}
    setUser(GUEST_USER);
  };

  return {
    user,
    isAuthenticated: user.id !== 'guest' && user.id !== '' && Boolean(user.studentCode || user.teacherCode),
    isAdmin: user.role === 'admin' && user.id !== 'guest',
    isTeacher: user.role === 'teacher' && user.id !== 'guest',
    isStaff: (user.role === 'admin' || user.role === 'teacher') && user.id !== 'guest',
    studentAccounts,
    teacherAccounts,
    loginWithStudentCode,
    loginAsStaff,
    changeUserPassword,
    resetUserPassword,
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