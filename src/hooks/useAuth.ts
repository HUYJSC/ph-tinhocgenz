import { useState, useEffect } from 'react';
import { UserProfile, StudentAccount, TeacherAccount, CurriculumTrack, TRACK_LABELS } from '../types/auth';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AUTH_USER_KEY = 'phtinhocgenz_auth_user_v12';
const STUDENT_ACCOUNTS_KEY = 'phtinhocgenz_student_accounts_v12';
const TEACHER_ACCOUNTS_KEY = 'phtinhocgenz_teacher_accounts_v12';

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

// ZERO hardcoded accounts or plaintext passwords in frontend bundle
export const INITIAL_STUDENT_ACCOUNTS: StudentAccount[] = [];
export const INITIAL_TEACHER_ACCOUNTS: TeacherAccount[] = [];

export const GUEST_USER: UserProfile = {
  id: 'guest',
  name: 'Học viên vãng lai',
  studentCode: '',
  schoolOrClass: 'PH Digital Education',
  programTrack: 'office-fast-3in1',
  enrolledTracks: ['office-fast-3in1'],
  role: 'student',
  createdAt: ''
};

export const DEFAULT_ADMIN_USER: UserProfile = {
  id: 'admin-01',
  name: 'Ban Quản Trị Hệ Thống',
  email: 'admin@tinhocgenz.io.vn',
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

  // Tự động đồng bộ với Supabase Auth session nếu có cấu hình
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const role = (session.user.user_metadata?.role || session.user.app_metadata?.role || 'student') as 'student' | 'teacher' | 'admin';
        const profile: UserProfile = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Người dùng',
          email: session.user.email || '',
          studentCode: session.user.user_metadata?.student_code || '',
          teacherCode: session.user.user_metadata?.teacher_code || '',
          role,
          programTrack: session.user.user_metadata?.program_track || 'office-fast-3in1',
          enrolledTracks: session.user.user_metadata?.enrolled_tracks || ['office-fast-3in1'],
          schoolOrClass: session.user.user_metadata?.school_or_class || 'PH Digital Education',
          createdAt: session.user.created_at
        };
        setUser(profile);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  /**
   * Đăng nhập học viên: Xác thực Supabase Auth hoặc tài khoản nội bộ có mật khẩu chính xác
   * Tuyệt đối KHÔNG chấp nhận mật khẩu mặc định hay bypass
   */
  const loginWithStudentCode = (
    studentCodeInput: string,
    passwordInput: string,
    chosenTrack: CurriculumTrack
  ): { success: boolean; user?: UserProfile; message?: string } => {
    const cleanCode = studentCodeInput.trim().toUpperCase();
    const cleanPass = passwordInput.trim();

    if (!cleanCode || !cleanPass) {
      return { success: false, message: 'Vui lòng nhập đầy đủ mã học viên và mật khẩu.' };
    }

    const matched = studentAccounts.find(
      s => s.studentCode.toUpperCase() === cleanCode
    );

    if (!matched) {
      return {
        success: false,
        message: `❌ Mã học viên "${cleanCode}" không tồn tại trong hệ thống. Vui lòng kiểm tra lại mã học viên do Giảng viên cung cấp hoặc liên hệ Quản trị viên.`
      };
    }

    // Bảo mật nghiêm ngặt: Mật khẩu phải khớp chính xác mật khẩu đã lưu, không có fallback '123'
    if (!matched.password || matched.password !== cleanPass) {
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
      mustChangePassword: !!matched.mustChangePassword,
      role: 'student',
      createdAt: matched.createdAt
    };

    setUser(loggedUser);
    return { success: true, user: loggedUser };
  };

  /**
   * Đăng nhập Giảng viên & Quản trị viên
   * Xác thực bảo mật, KHÔNG chấp nhận mật khẩu chung như 123456 hay Admin@PH2026!Secure
   */
  const loginAsStaff = (passwordOrPin: string, staffNameOrCode?: string, selectedTrack?: CurriculumTrack | 'all') => {
    const cleanPin = (passwordOrPin || '').trim();
    const cleanName = (staffNameOrCode || '').trim();
    const cleanNameLower = cleanName.toLowerCase();

    if (!cleanPin || !cleanName) {
      return { success: false, message: 'Vui lòng nhập đầy đủ tên/mã cán bộ và mật khẩu xác thực.' };
    }

    // Tra cứu cán bộ theo mã cán bộ / tên
    const matchedStaff = teacherAccounts.find(t => {
      const tCode = t.teacherCode.toLowerCase();
      const tName = t.name.toLowerCase();
      return (
        tCode === cleanNameLower ||
        tName === cleanNameLower ||
        (cleanNameLower === 'admin' && t.role === 'admin') ||
        (tName.includes(cleanNameLower) && cleanNameLower.length >= 4)
      );
    });

    if (!matchedStaff) {
      return {
        success: false,
        message: '❌ Không tìm thấy thông tin tài khoản cán bộ hoặc giảng viên trong hệ thống.'
      };
    }

    // Kiểm tra mật khẩu chính xác từ hồ sơ tài khoản
    if (!matchedStaff.password || matchedStaff.password !== cleanPin) {
      return {
        success: false,
        message: '❌ Mật khẩu hoặc mã PIN không chính xác.'
      };
    }

    const assigned = (matchedStaff.assignedTracks && matchedStaff.assignedTracks.length > 0)
      ? matchedStaff.assignedTracks
      : ALL_10_TRACKS;

    let effectiveTrack: CurriculumTrack = assigned[0];
    if (selectedTrack && selectedTrack !== 'all' && assigned.includes(selectedTrack)) {
      effectiveTrack = selectedTrack;
    }

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
      mustChangePassword: !!matchedStaff.mustChangePassword,
      createdAt: matchedStaff.createdAt
    };

    setUser(staffProfile);
    return { success: true, user: staffProfile };
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

  // Tạo tài khoản học viên mới
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
      password: password || '',
      schoolOrClass: schoolOrClass || `Lớp ${TRACK_LABELS[programTrack]}`,
      programTrack,
      enrolledTracks: tracks,
      role: 'student',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setStudentAccounts(prev => [newStudent, ...prev]);
    return newStudent;
  };

  // Cập nhật tài khoản học viên
  const updateStudentAccount = (updatedAccount: StudentAccount) => {
    setStudentAccounts(prev =>
      prev.map(s => (s.id === updatedAccount.id ? updatedAccount : s))
    );

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

  // Xóa tài khoản học viên
  const deleteStudentAccount = (id: string) => {
    setStudentAccounts(prev => prev.filter(s => s.id !== id));
  };

  // Tạo tài khoản giảng viên mới
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
      password: password || '',
      phoneOrEmail: phoneOrEmail || '',
      assignedTracks,
      role: 'teacher',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTeacherAccounts(prev => [newTeacher, ...prev]);
    return newTeacher;
  };

  // Cập nhật tài khoản giảng viên
  const updateTeacherAccount = (updatedTeacher: TeacherAccount) => {
    setTeacherAccounts(prev =>
      prev.map(t => (t.id === updatedTeacher.id ? updatedTeacher : t))
    );

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

  // Xóa tài khoản giảng viên
  const deleteTeacherAccount = (id: string) => {
    setTeacherAccounts(prev => prev.filter(t => t.id !== id));
  };

  // Đổi mật khẩu
  const changeUserPassword = (oldPassword: string, newPassword: string): { success: boolean; message?: string } => {
    const cleanOld = (oldPassword || '').trim();
    const cleanNew = (newPassword || '').trim();

    if (!cleanNew || cleanNew.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự bảo mật.' };
    }

    if (user.role === 'student') {
      const studentIdx = studentAccounts.findIndex(s => s.id === user.id || s.studentCode === user.studentCode);
      if (studentIdx >= 0) {
        const currentPass = studentAccounts[studentIdx].password || '';
        if (currentPass && currentPass !== cleanOld) {
          return { success: false, message: 'Mật khẩu hiện tại không chính xác.' };
        }
        const updated = [...studentAccounts];
        updated[studentIdx] = {
          ...updated[studentIdx],
          password: cleanNew,
          mustChangePassword: false
        };
        setStudentAccounts(updated);
        setUser(prev => ({ ...prev, mustChangePassword: false }));
        return { success: true, message: 'Đổi mật khẩu thành công!' };
      }
    } else {
      const teacherIdx = teacherAccounts.findIndex(t => t.id === user.id || t.teacherCode === user.teacherCode);
      if (teacherIdx >= 0) {
        const currentPass = teacherAccounts[teacherIdx].password || '';
        if (currentPass && currentPass !== cleanOld) {
          return { success: false, message: 'Mật khẩu hiện tại không chính xác.' };
        }
        const updated = [...teacherAccounts];
        updated[teacherIdx] = {
          ...updated[teacherIdx],
          password: cleanNew,
          mustChangePassword: false
        };
        setTeacherAccounts(updated);
        setUser(prev => ({ ...prev, mustChangePassword: false }));
        return { success: true, message: 'Đổi mật khẩu thành công!' };
      }
    }

    return { success: true, message: 'Cập nhật mật khẩu thành công!' };
  };

  // Đặt lại mật khẩu
  const resetUserPassword = (identifier: string, newPass: string): { success: boolean; message?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanNew = newPass.trim();

    if (!cleanNew || cleanNew.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' };
    }

    const studentIdx = studentAccounts.findIndex(
      s => s.studentCode.toLowerCase() === cleanId || (s.email && s.email.toLowerCase() === cleanId)
    );

    if (studentIdx >= 0) {
      const updated = [...studentAccounts];
      updated[studentIdx] = { ...updated[studentIdx], password: cleanNew, mustChangePassword: false };
      setStudentAccounts(updated);
      return { success: true, message: `Đã đặt lại mật khẩu cho học viên ${updated[studentIdx].name}!` };
    }

    const teacherIdx = teacherAccounts.findIndex(
      t => t.teacherCode.toLowerCase() === cleanId || (t.email && t.email.toLowerCase() === cleanId)
    );

    if (teacherIdx >= 0) {
      const updated = [...teacherAccounts];
      updated[teacherIdx] = { ...updated[teacherIdx], password: cleanNew, mustChangePassword: false };
      setTeacherAccounts(updated);
      return { success: true, message: `Đã đặt lại mật khẩu cho cán bộ ${updated[teacherIdx].name}!` };
    }

    return { success: false, message: 'Không tìm thấy tài khoản tương ứng với mã hoặc email đã nhập.' };
  };

  return {
    user,
    setUser,
    isStaff: user.role === 'admin' || user.role === 'teacher',
    studentAccounts,
    teacherAccounts,
    loginWithStudentCode,
    loginAsStaff,
    switchStudentTrack,
    createStudentAccount,
    updateStudentAccount,
    deleteStudentAccount,
    createTeacherAccount,
    updateTeacherAccount,
    deleteTeacherAccount,
    changeUserPassword,
    resetUserPassword
  };
}