import React, { useState, useEffect } from 'react';
import { Quiz, QuizAttempt } from '../../types/quiz';
import { UserProfile, StudentAccount, TeacherAccount, CurriculumTrack, TRACK_LABELS } from '../../types/auth';
import { Assignment, AssignmentSubmission, TeacherNotification, GoogleDriveConfig } from '../../types/assignment';
import { ClassScheduleItem } from '../../types/schedule';
import { TeacherAssignmentManager } from './TeacherAssignmentManager';
import { ScheduleCalendar } from '../schedule/ScheduleCalendar';
import { EarlyWarningDashboard } from './EarlyWarningDashboard';
import { ZaloNotificationManager } from './ZaloNotificationManager';
import { EarlyWarningService } from '../../services/earlyWarningService';
import {
  Shield, BookOpen, Users, BarChart3, PlusCircle, Trash2,
  Search, FileSpreadsheet, Sparkles, UserCheck, Edit3, CheckSquare, Square, X, GraduationCap,
  Globe, ExternalLink, Copy, Check, TrendingUp, CheckCircle2, Video, Settings,
  Eye, BookOpenCheck, Printer, Calendar, AlertTriangle, Clock, Bot
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export type AdminPortalSubTab =
  | 'overview'
  | 'schedules'
  | 'grading_assignments'
  | 'student_directory'
  | 'teachers'
  | 'early_warning'
  | 'zalo_notifications'
  | 'exams'
  | 'question_bank'
  | 'meet_hub'
  | 'seo_center';

interface AdminPortalProps {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  studentAccounts: StudentAccount[];
  teacherAccounts?: TeacherAccount[];
  assignments?: Assignment[];
  submissions?: AssignmentSubmission[];
  notifications?: TeacherNotification[];
  googleDriveConfig?: GoogleDriveConfig;
  onUpdateGoogleDriveConfig?: (config: GoogleDriveConfig) => void;
  onCreateAssignment?: (data: Omit<Assignment, 'id' | 'createdAt'>) => void;
  onDeleteAssignment?: (id: string) => void;
  onToggleOpen?: (id: string) => void;
  onGradeSubmission?: (submissionId: string, score: number, maxScore: number, feedback: string) => void;
  onMarkNotificationAsRead?: (id: string) => void;
  onAddQuiz: (quiz: Quiz) => void;
  onDeleteCustomQuiz: (quizId: string) => void;
  onNavigateToCreator: () => void;
  onCreateStudentAccount: (name: string, studentCode: string, password?: string, schoolOrClass?: string, programTrack?: CurriculumTrack, enrolledTracks?: CurriculumTrack[]) => void;
  onUpdateStudentAccount?: (updatedAccount: StudentAccount) => void;
  onDeleteStudentAccount: (id: string) => void;
  onCreateTeacherAccount?: (name: string, teacherCode: string, password?: string, phoneOrEmail?: string, assignedTracks?: CurriculumTrack[]) => void;
  onUpdateTeacherAccount?: (updatedTeacher: TeacherAccount) => void;
  onDeleteTeacherAccount?: (id: string) => void;
  schedules?: ClassScheduleItem[];
  onCreateSchedule?: (data: Omit<ClassScheduleItem, 'id' | 'createdAt'>) => void;
  onUpdateSchedule?: (item: ClassScheduleItem) => void;
  onDeleteSchedule?: (id: string) => void;
  initialSubTab?: AdminPortalSubTab;
  onNavigateToAttendance?: () => void;
  currentUser: UserProfile;
}

export const ALL_TRACK_OPTIONS: { id: CurriculumTrack; label: string; short: string }[] = [
  { id: 'office-fast-3in1', label: '1. Word, Excel, PowerPoint (3 Buổi 1 môn)', short: 'Office 3b' },
  { id: 'cc-cntt-basic',    label: '2. CC CNTT Cơ bản (6 buổi)', short: 'CC Cơ bản' },
  { id: 'cc-cntt-advanced', label: '3. CC CNTT Nâng cao (6 buổi)', short: 'CC Nâng cao' },
  { id: 'cntt-basic-we',    label: '4. CNTT Cơ bản: Word + Excel (10-12 buổi)', short: 'CNTT CB' },
  { id: 'cntt-adv-we',      label: '5. CNTT Nâng Cao: Word + Excel (10-12 buổi)', short: 'CNTT NC' },
  { id: 'ai-office',        label: '6. Ứng dụng AI vào công việc Văn phòng (5 buổi)', short: 'AI Văn phòng' },
  { id: 'excel-accounting', label: '7. Excel cho Kế toán', short: 'Excel Kế toán' },
  { id: 'word-6b',          label: '8. Kỹ năng soạn thảo Word (6 buổi)', short: 'Word 6b' },
  { id: 'excel-6b',         label: '9. Xử lý bảng tính Excel (6 buổi)', short: 'Excel 6b' },
  { id: 'ppt-6b',           label: '10. Thiết kế PowerPoint (6 buổi)', short: 'PPT 6b' }
];

export const AdminPortal: React.FC<AdminPortalProps> = ({
  quizzes,
  attempts,
  studentAccounts,
  teacherAccounts = [],
  assignments = [],
  submissions = [],
  notifications = [],
  googleDriveConfig,
  onUpdateGoogleDriveConfig,
  onCreateAssignment,
  onDeleteAssignment,
  onToggleOpen,
  onGradeSubmission,
  onMarkNotificationAsRead,
  onDeleteCustomQuiz,
  onNavigateToCreator,
  onCreateStudentAccount,
  onUpdateStudentAccount,
  onDeleteStudentAccount,
  onCreateTeacherAccount,
  onUpdateTeacherAccount,
  onDeleteTeacherAccount,
  schedules = [],
  onCreateSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  initialSubTab = 'overview',
  onNavigateToAttendance,
  currentUser
}) => {
  const isSuperAdmin = currentUser.role === 'admin';
  const [activeSubTab, setActiveSubTab] = useState<AdminPortalSubTab>(initialSubTab);

  // Sync initialSubTab if passed externally
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [examFamilyFilter, setExamFamilyFilter] = useState<'all' | 'word' | 'excel' | 'powerpoint' | 'ai_cntt'>('all');
  const [readingQuiz, setReadingQuiz] = useState<Quiz | null>(null);

  // Master Google Meet Hub State (Admin Only) - Synced with schedules
  const [masterMeetUrlInput, setMasterMeetUrlInput] = useState('https://meet.google.com/tgz-master-live');
  const [copiedMeetIndex, setCopiedMeetIndex] = useState<number | null>(null);
  const [meetHubRooms, setMeetHubRooms] = useState(() => {
    const saved = localStorage.getItem('phtinhocgenz_admin_meet_rooms_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { track: 'office-fast-3in1', classCode: 'K26-WE01', className: '1. Word, Excel, PowerPoint (3b/môn)', teacher: 'Thầy Quang Huy', room: 'Phòng LAB 01 (Tầng 2)', meetUrl: 'https://meet.google.com/tgz-we01-live' },
      { track: 'cc-cntt-basic', classCode: 'K26-CC01', className: '2. CC CNTT Cơ bản (6 buổi)', teacher: 'Thầy Quang Huy', room: 'Phòng LAB 01 (Tầng 2)', meetUrl: 'https://meet.google.com/tgz-cc01-live' },
      { track: 'cc-cntt-advanced', classCode: 'K26-CCN01', className: '3. CC CNTT Nâng cao (6 buổi)', teacher: 'Thầy Đức Nam', room: 'Phòng LAB 03 (Tầng 4)', meetUrl: 'https://meet.google.com/tgz-ccn01-room' },
      { track: 'cntt-basic-we', classCode: 'K26-WE-CB', className: '4. CNTT Cơ bản: Word + Excel (10-12b)', teacher: 'Cô Hoàng Mai', room: 'Phòng LAB 02 (Tầng 3)', meetUrl: 'https://meet.google.com/tgz-wecb-room' },
      { track: 'cntt-adv-we', classCode: 'K26-WENC01', className: '5. CNTT Nâng Cao: Word + Excel (10-12b)', teacher: 'Thầy Đức Nam', room: 'Phòng LAB 03 (Tầng 4)', meetUrl: 'https://meet.google.com/tgz-wenc-room' },
      { track: 'ai-office', classCode: 'K26-AI01', className: '6. Ứng dụng AI vào công việc Văn phòng (5b)', teacher: 'Thầy Quang Huy', room: 'Trực Tuyến Toàn Khóa', meetUrl: 'https://meet.google.com/tgz-ai01-live' },
      { track: 'excel-accounting', classCode: 'K26-KT01', className: '7. Excel cho Kế toán', teacher: 'Thầy Đức Nam', room: 'Phòng LAB 03 (Tầng 4)', meetUrl: 'https://meet.google.com/tgz-kt01-room' },
      { track: 'word-6b', classCode: 'K26-MOSW01', className: '8. Kỹ năng soạn thảo Word (6 buổi)', teacher: 'Cô Thu Minh', room: 'Phòng LAB 02 (Tầng 3)', meetUrl: 'https://meet.google.com/tgz-mosw-room' },
      { track: 'excel-6b', classCode: 'K26-EX01', className: '9. Xử lý bảng tính Excel (6 buổi)', teacher: 'Cô Hoàng Mai', room: 'Phòng LAB 02 (Tầng 3)', meetUrl: 'https://meet.google.com/tgz-ex01-live' },
      { track: 'ppt-6b', classCode: 'K26-PPT01', className: '10. Thiết kế PowerPoint (6 buổi)', teacher: 'Cô Hoàng Mai', room: 'Phòng LAB 01 (Tầng 2)', meetUrl: 'https://meet.google.com/tgz-ppt01-live' }
    ];
  });

  const generateRandomMeetCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const r1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const r2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const r3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `https://meet.google.com/${r1}-${r2}-${r3}`;
  };

  const handleAutoGenerateUniqueMeets = () => {
    const updated = meetHubRooms.map((r: any) => ({
      ...r,
      meetUrl: generateRandomMeetCode()
    }));
    setMeetHubRooms(updated);
    localStorage.setItem('phtinhocgenz_admin_meet_rooms_v3', JSON.stringify(updated));

    // Sync to schedules if callback exists
    if (onUpdateSchedule && schedules.length > 0) {
      updated.forEach((room: any) => {
        schedules.filter(s => s.track === room.track || s.classCode === room.classCode).forEach(s => {
          onUpdateSchedule({ ...s, onlineMeetingUrl: room.meetUrl });
        });
      });
    }

    soundFx.playVictory();
    alert('🎉 Đã tự động sinh 10 Link Google Meet hoàn toàn độc lập cho 10 lớp học và đồng bộ vào Thời Khóa Biểu!');
  };

  const handleGenerateSingleMeet = (track: string) => {
    const newMeet = generateRandomMeetCode();
    handleUpdateSingleRoomMeet(track, newMeet);
    soundFx.playClick();
  };

  const handleBatchUpdateMeetUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterMeetUrlInput.trim()) return;
    const updated = meetHubRooms.map((r: any) => ({ ...r, meetUrl: masterMeetUrlInput.trim() }));
    setMeetHubRooms(updated);
    localStorage.setItem('phtinhocgenz_admin_meet_rooms_v3', JSON.stringify(updated));

    if (onUpdateSchedule && schedules.length > 0) {
      schedules.forEach(s => {
        onUpdateSchedule({ ...s, onlineMeetingUrl: masterMeetUrlInput.trim() });
      });
    }

    soundFx.playVictory();
    alert('✓ Đã cập nhật và đồng bộ link Google Meet cho toàn bộ lớp học thành công!');
  };

  const handleUpdateSingleRoomMeet = (track: string, newUrl: string, newRoom?: string) => {
    const updated = meetHubRooms.map((r: any) => {
      if (r.track === track) {
        return { ...r, meetUrl: newUrl.trim(), ...(newRoom ? { room: newRoom.trim() } : {}) };
      }
      return r;
    });
    setMeetHubRooms(updated);
    localStorage.setItem('phtinhocgenz_admin_meet_rooms_v3', JSON.stringify(updated));

    if (onUpdateSchedule && schedules.length > 0) {
      schedules.filter(s => s.track === track).forEach(s => {
        onUpdateSchedule({ ...s, onlineMeetingUrl: newUrl.trim(), ...(newRoom ? { room: newRoom.trim() } : {}) });
      });
    }
  };

  // SEO State
  const [googleVerificationCode, setGoogleVerificationCode] = useState(() => localStorage.getItem('phtinhocgenz_google_verification') || 'F0YlMxxac86DrPlxEzNaOWlngIDCknlTW5BfpyP9FZo');
  const [ga4Id, setGa4Id] = useState(() => localStorage.getItem('phtinhocgenz_ga4_id') || '');
  const [isCopiedSitemap, setIsCopiedSitemap] = useState(false);
  const [seoSavedSuccess, setSeoSavedSuccess] = useState(false);

  // Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentCode, setNewStudentCode] = useState(`THGZ${String(studentAccounts.length + 1).padStart(2, '0')}`);
  const [newStudentPass, setNewStudentPass] = useState('123');
  const [newStudentClass, setNewStudentClass] = useState('Lớp Word, Excel, PowerPoint (3b/môn)');
  const [newStudentTrack, setNewStudentTrack] = useState<CurriculumTrack>('office-fast-3in1');
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);

  // Edit Student State
  const [editingStudent, setEditingStudent] = useState<StudentAccount | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editPass, setEditPass] = useState('123');
  const [editClass, setEditClass] = useState('');
  const [editTrack, setEditTrack] = useState<CurriculumTrack>('office-fast-3in1');
  const [editEnrolledTracks, setEditEnrolledTracks] = useState<CurriculumTrack[]>(['office-fast-3in1']);

  // Teacher Form State (Admin Only)
  const [showAddTeacherForm, setShowAddTeacherForm] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherCode, setNewTeacherCode] = useState(`GV0${teacherAccounts.length + 1}`);
  const [newTeacherPass, setNewTeacherPass] = useState('123');
  const [newTeacherContact, setNewTeacherContact] = useState('');
  const [newTeacherTracks, setNewTeacherTracks] = useState<CurriculumTrack[]>(['office-fast-3in1']);

  // Edit Teacher State
  const [editingTeacher, setEditingTeacher] = useState<TeacherAccount | null>(null);
  const [editTeacherName, setEditTeacherName] = useState('');
  const [editTeacherCode, setEditTeacherCode] = useState('');
  const [editTeacherPass, setEditTeacherPass] = useState('123');
  const [editTeacherContact, setEditTeacherContact] = useState('');
  const [editTeacherTracks, setEditTeacherTracks] = useState<CurriculumTrack[]>(['office-fast-3in1']);

  // Stats computation
  const totalQuizzes = quizzes.length;
  const totalQuestions = quizzes.reduce((sum, q) => sum + q.questions.length, 0);
  const totalSubmissions = attempts.length;
  const avgScore = totalSubmissions > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalSubmissions)
    : 0;
  const passRate = totalSubmissions > 0
    ? Math.round((attempts.filter(a => a.percentage >= 70).length / totalSubmissions) * 100)
    : 0;

  // Filtered lists
  const filteredStudents = studentAccounts.filter(s =>
    s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.studentCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.schoolOrClass.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredTeachers = teacherAccounts.filter(t =>
    t.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    t.teacherCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (t.phoneOrEmail && t.phoneOrEmail.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const filteredQuizzes = quizzes.filter(q => {
    const matchSearch = q.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      q.description.toLowerCase().includes(searchFilter.toLowerCase());
    const matchCat = categoryFilter === 'all' || q.category === categoryFilter;
    if (examFamilyFilter === 'word') {
      const isWord = q.title.toLowerCase().includes('word') || q.category.includes('word') || q.category === 'cntt-basic-we' || q.category === 'cntt-adv-we' || q.category === 'office-fast-3in1';
      if (!isWord) return false;
    }
    if (examFamilyFilter === 'excel') {
      const isExcel = q.title.toLowerCase().includes('excel') || q.category.includes('excel') || q.category === 'cntt-basic-we' || q.category === 'cntt-adv-we' || q.category === 'office-fast-3in1';
      if (!isExcel) return false;
    }
    if (examFamilyFilter === 'powerpoint') {
      const isPpt = q.title.toLowerCase().includes('powerpoint') || q.title.toLowerCase().includes('ppt') || q.category.includes('ppt') || q.category === 'office-fast-3in1';
      if (!isPpt) return false;
    }
    if (examFamilyFilter === 'ai_cntt') {
      const isAi = q.category === 'ai-office' || q.category === 'cc-cntt-basic' || q.category === 'cc-cntt-advanced' || q.title.toLowerCase().includes('ai') || q.title.toLowerCase().includes('cntt');
      if (!isAi) return false;
    }
    return matchSearch && matchCat;
  });

  // Student Actions
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentCode.trim()) {
      alert('Vui lòng nhập đầy đủ họ tên và mã học viên!');
      return;
    }

    onCreateStudentAccount(
      newStudentName,
      newStudentCode,
      newStudentPass,
      newStudentClass,
      newStudentTrack
    );

    soundFx.playVictory();
    setNewStudentName('');
    setNewStudentCode(`THGZ${String(studentAccounts.length + 2).padStart(2, '0')}`);
    setShowAddStudentForm(false);
  };

  const handleOpenEdit = (student: StudentAccount) => {
    setEditingStudent(student);
    setEditName(student.name);
    setEditCode(student.studentCode);
    setEditPass(student.password || '123');
    setEditClass(student.schoolOrClass || '');
    setEditTrack(student.programTrack || 'mos-office');
    setEditEnrolledTracks(
      student.enrolledTracks && student.enrolledTracks.length > 0
        ? [...student.enrolledTracks]
        : [student.programTrack || 'mos-office']
    );
    soundFx.playClick();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (!editName.trim() || !editCode.trim()) {
      alert('Vui lòng nhập họ tên và mã học viên!');
      return;
    }

    const updated: StudentAccount = {
      ...editingStudent,
      name: editName.trim(),
      studentCode: editCode.trim().toUpperCase(),
      password: editPass.trim() || '123',
      schoolOrClass: editClass.trim() || `Lớp ${TRACK_LABELS[editTrack]}`,
      programTrack: editTrack,
      enrolledTracks: editEnrolledTracks.length > 0 ? editEnrolledTracks : [editTrack]
    };

    if (onUpdateStudentAccount) {
      onUpdateStudentAccount(updated);
    }
    setEditingStudent(null);
    soundFx.playVictory();
  };

  const toggleEnrolledTrack = (trackId: CurriculumTrack) => {
    setEditEnrolledTracks(prev => {
      if (prev.includes(trackId)) {
        if (prev.length === 1) return prev;
        return prev.filter(t => t !== trackId);
      } else {
        return [...prev, trackId];
      }
    });
    soundFx.playClick();
  };

  // Teacher Actions (Admin Only)
  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim() || !newTeacherCode.trim()) {
      alert('Vui lòng nhập họ tên và mã giảng viên!');
      return;
    }

    if (onCreateTeacherAccount) {
      onCreateTeacherAccount(
        newTeacherName,
        newTeacherCode,
        newTeacherPass,
        newTeacherContact,
        newTeacherTracks
      );
    }

    soundFx.playVictory();
    setNewTeacherName('');
    setNewTeacherCode(`GV0${teacherAccounts.length + 2}`);
    setNewTeacherContact('');
    setShowAddTeacherForm(false);
  };

  const handleOpenEditTeacher = (teacher: TeacherAccount) => {
    setEditingTeacher(teacher);
    setEditTeacherName(teacher.name);
    setEditTeacherCode(teacher.teacherCode);
    setEditTeacherPass(teacher.password || '123');
    setEditTeacherContact(teacher.phoneOrEmail || '');
    setEditTeacherTracks(teacher.assignedTracks && teacher.assignedTracks.length > 0 ? [...teacher.assignedTracks] : ['office-fast-3in1']);
    soundFx.playClick();
  };

  const handleSaveEditTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    if (!editTeacherName.trim() || !editTeacherCode.trim()) {
      alert('Vui lòng nhập họ tên và mã giảng viên!');
      return;
    }

    const updated: TeacherAccount = {
      ...editingTeacher,
      name: editTeacherName.trim(),
      teacherCode: editTeacherCode.trim().toUpperCase(),
      password: editTeacherPass.trim() || '123',
      phoneOrEmail: editTeacherContact.trim(),
      assignedTracks: editTeacherTracks.length > 0 ? editTeacherTracks : ['office-fast-3in1']
    };

    if (onUpdateTeacherAccount) {
      onUpdateTeacherAccount(updated);
    }
    setEditingTeacher(null);
    soundFx.playVictory();
  };

  const toggleTeacherTrack = (trackId: CurriculumTrack, isEdit: boolean = false) => {
    if (isEdit) {
      setEditTeacherTracks(prev => {
        if (prev.includes(trackId)) {
          if (prev.length === 1) return prev;
          return prev.filter(t => t !== trackId);
        } else {
          return [...prev, trackId];
        }
      });
    } else {
      setNewTeacherTracks(prev => {
        if (prev.includes(trackId)) {
          if (prev.length === 1) return prev;
          return prev.filter(t => t !== trackId);
        } else {
          return [...prev, trackId];
        }
      });
    }
    soundFx.playClick();
  };

  const exportGradebookExcel = () => {
    if (attempts.length === 0) {
      alert('Chưa có dữ liệu bài thi nào để xuất bảng điểm!');
      return;
    }

    const headers = [
      'STT',
      'Tên Đề Thi / Khảo Thí',
      'Phân Hệ Khóa Học',
      'Chế Độ Làm Bài',
      'Số Câu Đúng',
      'Tổng Số Câu',
      'Điểm Đạt Được',
      'Điểm Tối Đa',
      'Tỷ Lệ Đạt (%)',
      'Xếp Loại Kết Quả',
      'Thời Gian Làm Bài',
      'Thời Điểm Hoàn Thành'
    ];

    const escapeCsv = (val: any) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = attempts.map((a, index) => {
      const trackName = TRACK_LABELS[a.category as CurriculumTrack] || a.category;
      const modeName = a.mode === 'exam' ? 'Thi Tính Giờ' : a.mode === 'practice' ? 'Luyện Tập Tự Do' : 'Thẻ Ghi Nhớ';
      const rank = a.percentage >= 90 ? 'Xuất Sắc' : a.percentage >= 75 ? 'Giỏi' : a.percentage >= 60 ? 'Khá' : a.percentage >= 50 ? 'Đạt' : 'Chưa Đạt';
      const minutes = Math.floor((a.timeSpentSeconds || 0) / 60);
      const seconds = (a.timeSpentSeconds || 0) % 60;
      const durationStr = `${minutes}p ${seconds < 10 ? '0' : ''}${seconds}s`;

      return [
        index + 1,
        escapeCsv(a.quizTitle),
        escapeCsv(trackName),
        escapeCsv(modeName),
        a.correctCount,
        a.totalQuestions,
        a.score,
        a.maxScore,
        `${a.percentage}%`,
        escapeCsv(rank),
        escapeCsv(durationStr),
        escapeCsv(a.completedAt)
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BangDiem_HocVien_PH_TINHOCGENZ_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    soundFx.playVictory();
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '16px' }} className="animate-slide-up">
      {/* Header Banner */}
      <div
        className="card"
        style={{
          padding: '22px 24px',
          background: isSuperAdmin
            ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.09) 0%, rgba(245, 158, 11, 0.04) 100%)'
            : 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '20px',
          border: isSuperAdmin ? '1px solid rgba(245, 158, 11, 0.28)' : '1px solid rgba(37, 99, 235, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
              border: '1.5px solid rgba(37, 99, 235, 0.18)'
            }}
          >
            <img src="/logo-icon.png" alt="PH Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                {isSuperAdmin ? 'Cổng Quản Trị Hệ Thống' : 'Cổng Khảo Thí & Giảng Dạy'}
              </h2>
              <span
                style={{
                  fontSize: '0.72rem',
                  background: isSuperAdmin ? '#d97706' : '#2563eb',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                {isSuperAdmin ? <Shield size={11} /> : <GraduationCap size={11} />}
                <span>{isSuperAdmin ? '👑 ADMIN TOÀN QUYỀN' : '👨‍🏫 GIẢNG VIÊN'}</span>
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              {isSuperAdmin
                ? `Quản trị viên: ${currentUser.name} • Toàn quyền 10 phân hệ khóa học`
                : `Giảng viên: ${currentUser.name} • Quản lý các phân hệ được phân công`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={exportGradebookExcel}
            className="btn btn-secondary"
            style={{
              padding: '8px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              background: 'rgba(16, 185, 129, 0.08)',
              color: '#059669'
            }}
            title="Xuất bảng điểm toàn bộ học viên sang file Excel (.CSV UTF-8 chuẩn)"
          >
            <FileSpreadsheet size={16} />
            <span>Xuất Bảng Điểm Excel</span>
          </button>

          <button
            onClick={onNavigateToCreator}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 800 }}
          >
            <PlusCircle size={16} />
            <span>Soạn Đề Thi Mới</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Navigation - Clean Responsive Pill Grid (Zero horizontal scrollbar on Desktop) */}
      <nav
        aria-label="Admin Sub Navigation"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '6px 0 16px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '20px'
        }}
      >
        {[
          { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
          { id: 'schedules', label: 'Lịch dạy & Phòng học', count: schedules.length, icon: Calendar },
          { id: 'grading_assignments', label: 'Khảo thí & Chấm điểm', count: assignments.length, icon: CheckSquare },
          { id: 'student_directory', label: 'Hồ sơ học viên', count: studentAccounts.length, icon: Users },
          ...(isSuperAdmin ? [{ id: 'teachers', label: 'Giảng viên', count: teacherAccounts.length, icon: UserCheck }] : []),
          { id: 'early_warning', label: 'Cảnh báo học vụ', count: EarlyWarningService.evaluateAllStudents(studentAccounts).filter(s => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH').length || undefined, isAlert: true, icon: AlertTriangle },
          { id: 'zalo_notifications', label: 'Tổng đài Zalo AI', count: studentAccounts.length || undefined, icon: Bot },
          ...(isSuperAdmin ? [{ id: 'meet_hub', label: 'Phòng Google Meet', count: meetHubRooms.length, icon: Video }] : []),
          { id: 'exams', label: 'Kho đề thi', count: totalQuizzes, icon: BookOpen },
          { id: 'question_bank', label: 'Ngân hàng câu hỏi', count: totalQuestions, icon: FileSpreadsheet },
          ...(isSuperAdmin ? [{ id: 'seo_center', label: 'Cấu hình SEO', icon: Globe }] : [])
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                soundFx.playClick();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: `1px solid ${isActive ? 'var(--brand)' : 'var(--border-color)'}`,
                background: isActive ? 'var(--brand)' : 'var(--bg-primary)',
                color: isActive ? '#ffffff' : 'var(--text-primary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={15} color={isActive ? '#ffffff' : (tab.isAlert && tab.count ? '#dc2626' : 'var(--text-secondary)')} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  style={{
                    background: isActive ? 'rgba(255, 255, 255, 0.25)' : (tab.isAlert ? '#fee2e2' : 'var(--bg-tertiary)'),
                    color: isActive ? '#ffffff' : (tab.isAlert ? '#dc2626' : 'var(--text-secondary)'),
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── 0A. THỜI KHÓA BIỂU & LỊCH DẠY SUB-TAB (ĐÃ GỘP HỢP NHẤT) ── */}
      {activeSubTab === 'schedules' && (
        <ScheduleCalendar
          currentUser={currentUser}
          schedules={schedules}
          onCreateSchedule={onCreateSchedule || (() => {})}
          onUpdateSchedule={onUpdateSchedule || (() => {})}
          onDeleteSchedule={onDeleteSchedule || (() => {})}
          onNavigateToAttendance={onNavigateToAttendance}
        />
      )}

      {/* ── 0B. KHẢO THÍ & CHẤM BÀI THỰC HÀNH SUB-TAB (ĐÃ GỘP HỢP NHẤT) ── */}
      {activeSubTab === 'grading_assignments' && (
        <TeacherAssignmentManager
          assignments={assignments}
          submissions={submissions}
          notifications={notifications}
          googleDriveConfig={googleDriveConfig}
          onUpdateGoogleDriveConfig={onUpdateGoogleDriveConfig}
          currentUser={currentUser}
          onCreateAssignment={onCreateAssignment || (() => {})}
          onDeleteAssignment={onDeleteAssignment || (() => {})}
          onToggleOpen={onToggleOpen || (() => {})}
          onGradeSubmission={onGradeSubmission || (() => {})}
          onMarkNotificationAsRead={onMarkNotificationAsRead || (() => {})}
        />
      )}

      {/* ── 0C. CẢNH BÁO HỌC VỤ SỚM SUB-TAB (ĐÃ GỘP HỢP NHẤT) ── */}
      {activeSubTab === 'early_warning' && (
        <EarlyWarningDashboard
          studentAccounts={studentAccounts}
        />
      )}

      {/* ── 0D. TỔNG ĐÀI ZALO AI & NHẮC NHỞ ĐỊNH KỲ (PHÂN THEO ĐỘ TUỔI) ── */}
      {activeSubTab === 'zalo_notifications' && (
        <ZaloNotificationManager
          studentAccounts={studentAccounts}
          onUpdateStudent={onUpdateStudentAccount}
        />
      )}

      {/* 1. OVERVIEW TAB */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Operational Header Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Trung Tâm Điều Hành Học Vụ & Khảo Thí
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Hệ thống dữ liệu học viên, ca học và ngân hàng đề thi chuẩn hóa • 10 Chương trình đào tạo
              </p>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <Clock size={13} color="var(--accent-primary)" />
              <span>Đồng bộ: <strong>Thời gian thực</strong></span>
            </div>
          </div>

          {/* Key Metrics Cards with Drill-down & Explicit Empty States */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {/* 1. Học viên */}
            <div
              className="card"
              onClick={() => { setActiveSubTab('student_directory'); soundFx.playClick(); }}
              style={{ padding: '18px', borderLeft: '4px solid #2563eb', cursor: 'pointer', transition: 'transform 0.15s ease' }}
              title="Nhấn để xem Danh sách Học viên chi tiết"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tổng Số Học Viên</span>
                <Users size={16} color="#2563eb" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>{studentAccounts.length}</div>
              <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Đã cấp mã đăng nhập • Xem chi tiết →</span>
              </div>
            </div>

            {/* 2. Giảng viên */}
            {isSuperAdmin && (
              <div
                className="card"
                onClick={() => { setActiveSubTab('teachers'); soundFx.playClick(); }}
                style={{ padding: '18px', borderLeft: '4px solid #d97706', cursor: 'pointer', transition: 'transform 0.15s ease' }}
                title="Nhấn để xem Danh sách Giảng viên chi tiết"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Giảng Viên Đứng Lớp</span>
                  <UserCheck size={16} color="#d97706" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>{teacherAccounts.length}</div>
                <div style={{ fontSize: '0.74rem', color: '#d97706', fontWeight: 600 }}>Phụ trách 10 chương trình →</div>
              </div>
            )}

            {/* 3. Kho đề thi & câu hỏi */}
            <div
              className="card"
              onClick={() => { setActiveSubTab('exams'); soundFx.playClick(); }}
              style={{ padding: '18px', borderLeft: '4px solid #10b981', cursor: 'pointer', transition: 'transform 0.15s ease' }}
              title="Nhấn để mở Kho Đề Thi"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Kho Đề Thi & Khảo Thí</span>
                <BookOpen size={16} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>{totalQuizzes}</div>
              <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600 }}>{totalQuestions} câu hỏi chuẩn quốc tế →</div>
            </div>

            {/* 4. Tỷ lệ đạt chuẩn */}
            <div
              className="card"
              onClick={() => { setActiveSubTab('grading_assignments'); soundFx.playClick(); }}
              style={{ padding: '18px', borderLeft: '4px solid #8b5cf6', cursor: 'pointer', transition: 'transform 0.15s ease' }}
              title="Nhấn để xem Bảng Chấm Điểm & Khảo Thí"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tỷ Lệ Đạt Chuẩn (≥70%)</span>
                <GraduationCap size={16} color="#8b5cf6" />
              </div>
              {attempts.length > 0 ? (
                <>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>{passRate}%</div>
                  <div style={{ fontSize: '0.74rem', color: '#8b5cf6', fontWeight: 600 }}>Điểm TB: {avgScore}% ({attempts.length} lượt thi)</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-muted)', margin: '8px 0 4px' }}>Chưa có bài nộp</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Sẵn sàng tính điểm khi học viên nộp bài</div>
                </>
              )}
            </div>
          </div>

          {/* Structured Curriculum Tracks Summary */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Sparkles size={18} color="#d97706" />
                <span>10 Chương Trình Đào Tạo Chuẩn Hóa Tại PH Digital Education</span>
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Cam kết chuẩn đầu ra Certiport & Bộ GD&ĐT</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', fontSize: '0.84rem' }}>
              {ALL_TRACK_OPTIONS.map((track, idx) => {
                const trackQuizzes = quizzes.filter(q => q.category === track.id);
                const trackStudents = studentAccounts.filter(s => s.programTrack === track.id || (s.enrolledTracks && s.enrolledTracks.includes(track.id)));
                const borderColors = ['#2563eb', '#10b981', '#7c3aed', '#0284c7', '#ea580c', '#059669', '#d97706', '#dc2626', '#4f46e5', '#0891b2'];
                const color = borderColors[idx % borderColors.length];

                return (
                  <div
                    key={track.id}
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: `3px solid ${color}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '6px'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                      {track.label}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      <span>{trackStudents.length} học viên theo học</span>
                      <span style={{ color: color, fontWeight: 700 }}>{trackQuizzes.length} đề thi sẵn sàng</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. STUDENT DIRECTORY TAB */}
      {activeSubTab === 'student_directory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Tìm học viên theo tên, mã THGZ, lớp..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            <button
              onClick={() => setShowAddStudentForm(!showAddStudentForm)}
              className="btn btn-primary"
            >
              <UserCheck size={16} />
              <span>{showAddStudentForm ? 'Đóng Biểu Mẫu' : 'Tạo Tài Khoản Học Viên Mới'}</span>
            </button>
          </div>

          {/* Add Student Form */}
          {showAddStudentForm && (
            <form onSubmit={handleCreateStudent} className="card animate-slide-up" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1.5px solid var(--accent-primary)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Tạo & Cấp Mã Đăng Nhập Cho Học Viên Mới
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Họ và Tên Học Sinh *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Hoàng Văn Nam"
                    value={newStudentName}
                    onChange={e => setNewStudentName(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Mã Học Viên (Tài Khoản) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: THGZ04"
                    value={newStudentCode}
                    onChange={e => setNewStudentCode(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 800, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Mật Khẩu Đăng Nhập (Mặc định: 123)
                  </label>
                  <input
                    type="text"
                    value={newStudentPass}
                    onChange={e => setNewStudentPass(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Lớp Học Phân Công
                  </label>
                  <input
                    type="text"
                    value={newStudentClass}
                    onChange={e => setNewStudentClass(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Phân Hệ Chương Trình Học
                  </label>
                  <select
                    value={newStudentTrack}
                    onChange={e => setNewStudentTrack(e.target.value as CurriculumTrack)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                  >
                    {ALL_TRACK_OPTIONS.map(trk => (
                      <option key={trk.id} value={trk.id}>
                        {trk.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '9px 18px', fontWeight: 800 }}>
                  Lưu & Cấp Tài Khoản
                </button>
                <button type="button" onClick={() => setShowAddStudentForm(false)} className="btn btn-secondary">
                  Hủy
                </button>
              </div>
            </form>
          )}

          {/* Student Accounts Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px' }}>Họ và Tên</th>
                  <th style={{ padding: '12px 14px' }}>Mã Học Viên (Tài Khoản)</th>
                  <th style={{ padding: '12px 14px' }}>Mật Khẩu</th>
                  <th style={{ padding: '12px 14px' }}>Lớp Học</th>
                  <th style={{ padding: '12px 14px' }}>Phân Hệ Đào Tạo</th>
                  <th style={{ padding: '12px 14px' }}>Quyền Hạn Môn Học</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(s => {
                  const allowedTracks = s.enrolledTracks && s.enrolledTracks.length > 0 ? s.enrolledTracks : [s.programTrack || 'mos-office'];
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {s.name}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--accent-primary)', background: 'rgba(37, 99, 235, 0.1)', padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>
                          {s.studentCode}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                        <code>{s.password || '123'}</code>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {s.schoolOrClass || `Lớp ${TRACK_LABELS[s.programTrack || 'office-fast-3in1']}`}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        <div>{TRACK_LABELS[s.programTrack || 'office-fast-3in1']}</div>
                        <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>🔒 Phân hệ chính</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {allowedTracks.map(trk => (
                            <span
                              key={trk}
                              style={{
                                fontSize: '0.72rem',
                                background: 'rgba(37, 99, 235, 0.12)',
                                color: '#2563eb',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                fontWeight: 700
                              }}
                            >
                              ✓ {TRACK_LABELS[trk] ? TRACK_LABELS[trk].split('(')[0].replace(/^\d+\.\s*/, '').trim() : trk}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            style={{
                              background: 'rgba(37, 99, 235, 0.08)',
                              border: '1px solid rgba(37, 99, 235, 0.25)',
                              color: 'var(--accent-primary)',
                              padding: '5px 9px',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Chỉnh sửa thông tin & phân quyền môn học"
                          >
                            <Edit3 size={13} />
                            <span>Sửa & Cấp Quyền</span>
                          </button>

                          <button
                            onClick={() => onDeleteStudentAccount(s.id)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.08)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              color: '#ef4444',
                              padding: '5px 7px',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                            title="Xóa học viên này"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* EDIT STUDENT MODAL */}
          {editingStudent && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '16px',
                backdropFilter: 'blur(4px)'
              }}
              className="animate-fade-in"
            >
              <div
                className="card"
                style={{
                  maxWidth: '620px',
                  width: '100%',
                  padding: '24px',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  background: 'var(--bg-card)',
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Edit3 size={18} color="var(--accent-primary)" />
                    <span>Chỉnh Sửa Thông Tin & Phân Quyền Học Viên</span>
                  </h3>
                  <button
                    onClick={() => setEditingStudent(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                        Họ và Tên Học Viên *
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                        Mã Học Viên (Tài Khoản) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editCode}
                        onChange={e => setEditCode(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 800, outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                        Mật Khẩu Đăng Nhập
                      </label>
                      <input
                        type="text"
                        value={editPass}
                        onChange={e => setEditPass(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                        Lớp Học Phân Công
                      </label>
                      <input
                        type="text"
                        value={editClass}
                        onChange={e => setEditClass(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                      Phân Hệ Đào Tạo Trọng Tâm (Mặc Định):
                    </label>
                    <select
                      value={editTrack}
                      onChange={e => {
                        const trk = e.target.value as CurriculumTrack;
                        setEditTrack(trk);
                        if (!editEnrolledTracks.includes(trk)) {
                          setEditEnrolledTracks(prev => [...prev, trk]);
                        }
                      }}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                    >
                      {ALL_TRACK_OPTIONS.map(trk => (
                        <option key={trk.id} value={trk.id}>
                          {trk.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '3px' }}>
                      CẤP QUYỀN TRUY CẬP CÁC PHÂN HỆ ĐÀO TẠO (Tích chọn để mở quyền):
                    </label>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                      Học viên chỉ có thể đăng nhập vào những phân hệ được thầy cô tích chọn bên dưới.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                      {ALL_TRACK_OPTIONS.map(trk => {
                        const isChecked = editEnrolledTracks.includes(trk.id);
                        return (
                          <div
                            key={trk.id}
                            onClick={() => toggleEnrolledTrack(trk.id)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: 'var(--radius-sm)',
                              background: isChecked ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-card)',
                              border: isChecked ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '0.8rem',
                              fontWeight: isChecked ? 700 : 500,
                              color: isChecked ? 'var(--accent-primary)' : 'var(--text-secondary)'
                            }}
                          >
                            {isChecked ? <CheckSquare size={15} color="var(--accent-primary)" /> : <Square size={15} />}
                            <span>{trk.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setEditingStudent(null)}
                      className="btn btn-secondary"
                      style={{ padding: '9px 16px' }}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ padding: '9px 20px', fontWeight: 800 }}
                    >
                      Lưu Thay Đổi & Cập Nhật Quyền
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TEACHERS MANAGEMENT TAB (ADMIN ONLY) */}
      {isSuperAdmin && activeSubTab === 'teachers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Tìm giảng viên theo tên, mã GV, liên hệ..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            <button
              onClick={() => setShowAddTeacherForm(!showAddTeacherForm)}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}
            >
              <UserCheck size={16} />
              <span>{showAddTeacherForm ? 'Đóng Biểu Mẫu' : 'Thêm Giảng Viên / Trợ Giảng Mới'}</span>
            </button>
          </div>

          {/* Add Teacher Form */}
          {showAddTeacherForm && (
            <form onSubmit={handleCreateTeacher} className="card animate-slide-up" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1.5px solid #d97706' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Tạo Tài Khoản Giảng Viên / Trợ Giảng Đứng Lớp
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Họ và Tên Giảng Viên *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Cô Thu Hằng"
                    value={newTeacherName}
                    onChange={e => setNewTeacherName(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Mã Giảng Viên (Tài Khoản Đăng Nhập) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: GV03"
                    value={newTeacherCode}
                    onChange={e => setNewTeacherCode(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 800, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Mật Khẩu (Mặc định: 123)
                  </label>
                  <input
                    type="text"
                    value={newTeacherPass}
                    onChange={e => setNewTeacherPass(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Email Hoặc SĐT Liên Hệ
                  </label>
                  <input
                    type="text"
                    placeholder="thuhang@tinhocgenz.io.vn"
                    value={newTeacherContact}
                    onChange={e => setNewTeacherContact(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Tracks Assignment Checkboxes */}
              <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  PHÂN CÔNG PHÂN HỆ GIẢNG DẠY (Giảng viên chỉ có quyền soạn đề & chấm bài ở các môn được tích):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', marginTop: '8px' }}>
                  {ALL_TRACK_OPTIONS.map(trk => {
                    const isChecked = newTeacherTracks.includes(trk.id);
                    return (
                      <div
                        key={trk.id}
                        onClick={() => toggleTeacherTrack(trk.id, false)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: isChecked ? 'rgba(217, 119, 6, 0.1)' : 'var(--bg-card)',
                          border: isChecked ? '1.5px solid #d97706' : '1px solid var(--border-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.8rem',
                          fontWeight: isChecked ? 700 : 500,
                          color: isChecked ? '#d97706' : 'var(--text-secondary)'
                        }}
                      >
                        {isChecked ? <CheckSquare size={15} color="#d97706" /> : <Square size={15} />}
                        <span>{trk.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '9px 18px', fontWeight: 800, background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}>
                  Lưu & Cấp Tài Khoản Giảng Viên
                </button>
                <button type="button" onClick={() => setShowAddTeacherForm(false)} className="btn btn-secondary">
                  Hủy
                </button>
              </div>
            </form>
          )}

          {/* Teacher Accounts Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px' }}>Họ và Tên Giảng Viên</th>
                  <th style={{ padding: '12px 14px' }}>Mã GV (Tài Khoản)</th>
                  <th style={{ padding: '12px 14px' }}>Mật Khẩu</th>
                  <th style={{ padding: '12px 14px' }}>Liên Hệ</th>
                  <th style={{ padding: '12px 14px' }}>Phân Hệ Phụ Trách</th>
                  <th style={{ padding: '12px 14px' }}>Cấp Bậc</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#d97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{t.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontWeight: 800, color: '#d97706', background: 'rgba(217, 119, 6, 0.1)', padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>
                        {t.teacherCode}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                      <code>{t.password || '123'}</code>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {t.phoneOrEmail || 'Chưa cập nhật'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {t.assignedTracks.map(trk => (
                          <span
                            key={trk}
                            style={{
                              fontSize: '0.72rem',
                              background: 'rgba(37, 99, 235, 0.1)',
                              color: 'var(--accent-primary)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              fontWeight: 700
                            }}
                          >
                            ✓ {TRACK_LABELS[trk] ? TRACK_LABELS[trk].split('(')[0].replace(/^\d+\.\s*/, '').trim() : trk}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(217, 119, 6, 0.12)', color: '#d97706', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 800 }}>
                        👨‍🏫 Giảng Viên Đứng Lớp
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEditTeacher(t)}
                          style={{
                            background: 'rgba(217, 119, 6, 0.08)',
                            border: '1px solid rgba(217, 119, 6, 0.25)',
                            color: '#d97706',
                            padding: '5px 9px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Sửa thông tin & phân hệ giảng dạy"
                        >
                          <Edit3 size={13} />
                          <span>Sửa Quyền</span>
                        </button>

                        <button
                          onClick={() => onDeleteTeacherAccount && onDeleteTeacherAccount(t.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            color: '#ef4444',
                            padding: '5px 7px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                          title="Xóa giảng viên này"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* EDIT TEACHER MODAL */}
          {editingTeacher && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '16px',
                backdropFilter: 'blur(4px)'
              }}
              className="animate-fade-in"
            >
              <div
                className="card"
                style={{
                  maxWidth: '620px',
                  width: '100%',
                  padding: '24px',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  background: 'var(--bg-card)',
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Edit3 size={18} color="#d97706" />
                    <span>Chỉnh Sửa Giảng Viên & Phân Công Môn Học</span>
                  </h3>
                  <button
                    onClick={() => setEditingTeacher(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveEditTeacher} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                        Họ và Tên Giảng Viên *
                      </label>
                      <input
                        type="text"
                        required
                        value={editTeacherName}
                        onChange={e => setEditTeacherName(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                        Mã Giảng Viên (Tài Khoản) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editTeacherCode}
                        onChange={e => setEditTeacherCode(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 800, outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                        Mật Khẩu
                      </label>
                      <input
                        type="text"
                        value={editTeacherPass}
                        onChange={e => setEditTeacherPass(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                        Email / SĐT Liên Hệ
                      </label>
                      <input
                        type="text"
                        value={editTeacherContact}
                        onChange={e => setEditTeacherContact(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                    </div>
                  </div>

                  {/* Tracks Assignment Checkboxes */}
                  <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      PHÂN CÔNG PHÂN HỆ GIẢNG DẠY (Tích chọn để mở quyền):
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', marginTop: '8px' }}>
                      {ALL_TRACK_OPTIONS.map(trk => {
                        const isChecked = editTeacherTracks.includes(trk.id);
                        return (
                          <div
                            key={trk.id}
                            onClick={() => toggleTeacherTrack(trk.id, true)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: 'var(--radius-sm)',
                              background: isChecked ? 'rgba(217, 119, 6, 0.1)' : 'var(--bg-card)',
                              border: isChecked ? '1.5px solid #d97706' : '1px solid var(--border-color)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '0.8rem',
                              fontWeight: isChecked ? 700 : 500,
                              color: isChecked ? '#d97706' : 'var(--text-secondary)'
                            }}
                          >
                            {isChecked ? <CheckSquare size={15} color="#d97706" /> : <Square size={15} />}
                            <span>{trk.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setEditingTeacher(null)}
                      className="btn btn-secondary"
                      style={{ padding: '9px 16px' }}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ padding: '9px 20px', fontWeight: 800, background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}
                    >
                      Lưu Thay Đổi & Cập Nhật Giảng Viên
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. EXAMS TAB */}
      {activeSubTab === 'exams' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Subject Family Taskbar */}
          <div className="horizontal-scroll" style={{ display: 'flex', gap: '8px', paddingBottom: '2px' }}>
            {[
              { id: 'all', label: '🌟 Tất Cả (10 Phân Hệ)', color: 'var(--brand)', bg: 'rgba(79, 110, 247, 0.12)' },
              { id: 'word', label: '📘 Word', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)' },
              { id: 'excel', label: '📗 Excel', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
              { id: 'powerpoint', label: '📙 PowerPoint', color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)' },
              { id: 'ai_cntt', label: '🤖 AI & CNTT', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' }
            ].map(tab => {
              const isSelected = examFamilyFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setExamFamilyFilter(tab.id as any);
                    if (tab.id !== 'all') setCategoryFilter('all');
                    soundFx.playClick();
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    border: isSelected ? `2px solid ${tab.color}` : '1px solid var(--border-color)',
                    background: isSelected ? tab.bg : 'var(--bg-card)',
                    color: isSelected ? tab.color : 'var(--text-secondary)',
                    fontWeight: isSelected ? 850 : 600,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Tìm kiếm đề thi..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' }}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' }}
            >
              <option value="all">Chi tiết 10 phân hệ đào tạo</option>
              {ALL_TRACK_OPTIONS.map(trk => (
                <option key={trk.id} value={trk.id}>
                  {trk.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {filteredQuizzes.map(q => (
              <div key={q.id} className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                      {TRACK_LABELS[q.category as CurriculumTrack] || q.category}
                    </span>
                    {q.isCustom && (
                      <button
                        onClick={() => onDeleteCustomQuiz(q.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        title="Xóa đề thi tự tạo"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    {q.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {q.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>{q.questions.length} câu hỏi trắc nghiệm</span>
                  <span>{q.timeLimitMinutes > 0 ? `${q.timeLimitMinutes} phút` : 'Tự do'}</span>
                </div>

                <button
                  onClick={() => {
                    setReadingQuiz(q);
                    soundFx.playClick();
                  }}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    background: 'rgba(217, 119, 6, 0.1)',
                    color: '#d97706',
                    border: '1.5px solid rgba(217, 119, 6, 0.25)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  title="Đọc toàn bộ câu hỏi, đáp án chuẩn & giải thích chi tiết của đề này"
                >
                  <Eye size={14} />
                  <span>Đọc Đề & Xem Đáp Án Chuẩn 📖</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. QUESTION BANK TAB */}
      {activeSubTab === 'question_bank' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card" style={{ padding: '18px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '6px' }}>
              Ngân Hàng Toàn Bộ {totalQuestions} Câu Hỏi Khảo Thí
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Danh sách chi tiết câu hỏi, đáp án đúng và phần giải thích chi tiết đã được chuẩn hóa theo chương trình tin học.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {quizzes.flatMap(q => q.questions.map((ques, idx) => ({ ...ques, quizTitle: q.title, cat: q.category, quesIdx: idx + 1 }))).slice(0, 50).map((ques, qidx) => (
              <div key={ques.id || qidx} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                    {ques.quizTitle} • Câu {ques.quesIdx}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ques.points || 10} điểm</span>
                </div>

                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {ques.prompt}
                </div>

                {ques.options && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px', fontSize: '0.82rem' }}>
                    {ques.options.map((opt, oidx) => {
                      const isCorrect = Array.isArray(ques.correctAnswer) ? ques.correctAnswer.includes(oidx) : ques.correctAnswer === oidx;
                      return (
                        <div
                          key={oidx}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-primary)',
                            border: isCorrect ? '1px solid #10b981' : '1px solid var(--border-color)',
                            color: isCorrect ? '#059669' : 'var(--text-secondary)',
                            fontWeight: isCorrect ? 700 : 400
                          }}
                        >
                          {String.fromCharCode(65 + oidx)}. {opt} {isCorrect && '✓'}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. SEO & GOOGLE TOP RANKING CENTER */}
      {activeSubTab === 'seo_center' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-slide-up">
          {/* Top Banner */}
          <div
            className="card"
            style={{
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
              border: '1.5px solid var(--accent-primary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={24} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                  Trung Tâm Tối Ưu SEO & Đẩy Top 1 Google
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
                Kiểm tra chỉ mục tìm kiếm, khai báo sitemap và cấu hình thẻ xác minh Google Search Console cho tên miền <b>hoctructuyen.tinhocgenz.io.vn</b>.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px 14px', borderRadius: 'var(--radius-full)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#059669', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} />
                <span>SEO Score: 100/100 Chuẩn Google</span>
              </div>
            </div>
          </div>

          {/* Quick Action Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* 1. Google Site Search Test */}
            <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Search size={18} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>1. Kiểm Tra Trên Google Search</h4>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Mở lệnh tìm kiếm <code>site:hoctructuyen.tinhocgenz.io.vn</code> trực tiếp trên Google để xem các trang đã được lập chỉ mục.
                </p>
              </div>
              <a
                href="https://www.google.com/search?q=site:hoctructuyen.tinhocgenz.io.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <span>Kiểm Tra Trên Google Ngay</span>
                <ExternalLink size={14} />
              </a>
            </div>

            {/* 2. Google Search Console */}
            <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <TrendingUp size={18} color="#d97706" />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>2. Google Search Console</h4>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Mở công cụ quản trị chính thức của Google để gửi sitemap và yêu cầu Googlebot quét website trong 24 giờ.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('https://hoctructuyen.tinhocgenz.io.vn/sitemap.xml');
                    setIsCopiedSitemap(true);
                    soundFx.playClick();
                    setTimeout(() => setIsCopiedSitemap(false), 2500);
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '8px 10px', fontSize: '0.78rem', fontWeight: 700 }}
                >
                  {isCopiedSitemap ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{isCopiedSitemap ? 'Đã Copy!' : 'Copy Sitemap'}</span>
                </button>
                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ padding: '8px 12px', fontSize: '0.78rem', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}
                >
                  <span>Mở GSC</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* 3. Google Rich Results Test */}
            <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Sparkles size={18} color="#8b5cf6" />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>3. Google Rich Results Test</h4>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Kiểm tra tính hợp lệ của dữ liệu cấu trúc Schema.org (EducationalOrganization, WebApplication).
                </p>
              </div>
              <a
                href="https://search.google.com/test/rich-results?url=https://hoctructuyen.tinhocgenz.io.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <span>Kiểm Tra Schema.org</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Configuration Form for Site Verification */}
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
              Cài Đặt Mã Xác Minh Google & Đo Lường Lưu Lượng
            </h4>

            {seoSavedSuccess && (
              <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#059669', fontSize: '0.85rem', fontWeight: 700, marginBottom: '14px' }}>
                ✓ Đã lưu cài đặt SEO thành công! Mã xác minh đã được kích hoạt.
              </div>
            )}

            <form
              onSubmit={e => {
                e.preventDefault();
                localStorage.setItem('phtinhocgenz_google_verification', googleVerificationCode.trim());
                localStorage.setItem('phtinhocgenz_ga4_id', ga4Id.trim());
                setSeoSavedSuccess(true);
                soundFx.playVictory();
                setTimeout(() => setSeoSavedSuccess(false), 3000);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  Mã Xác Minh Google Search Console (google-site-verification):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: google-site-verification=abc123xyz... hoặc mã thẻ meta"
                  value={googleVerificationCode}
                  onChange={e => setGoogleVerificationCode(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' }}
                />
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Lấy trong Google Search Console ➔ Cài đặt ➔ Xác minh quyền sở hữu bằng Thẻ HTML.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  Mã Google Analytics 4 (GA4 Tracking ID):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: G-XXXXXXXXXX"
                  value={ga4Id}
                  onChange={e => setGa4Id(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontWeight: 800 }}>
                  Lưu Cài Đặt SEO Google
                </button>
              </div>
            </form>
          </div>

          {/* Keyword Ranking Strategy Table */}
          <div className="card" style={{ padding: '22px' }}>
            <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Danh Sách Từ Khóa Vàng Đang Được Đẩy Lên Top 1 Google
            </h4>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px 14px' }}>Từ Khóa Tìm Kiếm</th>
                    <th style={{ padding: '10px 14px' }}>Loại Từ Khóa</th>
                    <th style={{ padding: '10px 14px' }}>Mục Tiêu Ranking</th>
                    <th style={{ padding: '10px 14px' }}>Trạng Thái Tối Ưu</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { kw: 'tin học genz', type: 'Thương hiệu độc quyền', rank: 'Top 1 Google', status: '✓ Đã tối ưu Schema & Meta' },
                    { kw: 'học trực tuyến tinhocgenz', type: 'Truy cập trực tiếp', rank: 'Top 1 Google', status: '✓ Khai báo Canonical' },
                    { kw: 'hoctructuyen.tinhocgenz.io.vn', type: 'Tên miền chính xác', rank: 'Top 1 Google', status: '✓ Khai báo Sitemap' },
                    { kw: 'luyện thi mos online', type: 'Từ khóa tìm kiếm cao', rank: 'Top 1 - 3 Google', status: '✓ Tối ưu 300+ câu hỏi' },
                    { kw: 'học tin học văn phòng cấp tốc', type: 'Xu hướng sinh viên', rank: 'Top 1 - 5 Google', status: '✓ Tối ưu đề thi thực hành' },
                    { kw: 'chứng chỉ tin học ic3 gs6', type: 'Chuẩn quốc tế', rank: 'Top 1 - 3 Google', status: '✓ Tối ưu phân hệ 3' }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                        "{row.kw}"
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{row.type}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ color: '#10b981', fontWeight: 800 }}>{row.rank}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#059669', fontWeight: 600 }}>{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. GOOGLE MEET MASTER HUB (SUPER ADMIN ONLY) ── */}
      {activeSubTab === 'meet_hub' && isSuperAdmin && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Master Controller Card */}
          <div
            className="card"
            style={{
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(16, 185, 129, 0.06) 100%)',
              border: '1.5px solid rgba(37, 99, 235, 0.25)',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', background: '#2563EB', color: '#fff', fontSize: '0.72rem', fontWeight: 800, marginBottom: '8px' }}>
                  <Video size={13} />
                  <span>TRUNG TÂM ĐIỀU PHỐI GOOGLE MEET & THANH TRA GIÁO VỤ</span>
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                  Tổng Đài Google Meet Đa Kênh (10 Lớp Học)
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '6px 0 0', maxWidth: '640px', lineHeight: 1.5 }}>
                  Hệ thống tự động sinh link riêng biệt cho từng môn/lớp để <strong>2-3 giáo viên dạy cùng ngày, cùng ca học</strong> không bị trùng phòng. Ban Giám Hiệu & Thanh Tra có quyền truy cập trực tiếp giám sát dự giờ mà không cần đợi giáo viên duyệt.
                </p>
              </div>

              {/* Master Actions Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleAutoGenerateUniqueMeets}
                  className="btn btn-secondary"
                  style={{
                    padding: '10px 16px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    borderRadius: '10px',
                    background: '#FEF3C7',
                    border: '1px solid #F59E0B',
                    color: '#92400E',
                    cursor: 'pointer'
                  }}
                  title="Tự động tạo 10 link Google Meet hoàn toàn khác nhau cho 10 lớp học"
                >
                  <span>🎲 Tự Động Sinh 10 Link Meet Độc Lập</span>
                </button>

                <a
                  href="https://meet.google.com/sja-vcpy-rsu"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{
                    padding: '10px 18px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    borderRadius: '10px',
                    background: '#2563EB',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  <Video size={16} />
                  <span>Phòng Họp Tổng (Admin & Thanh Tra)</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* Batch Update Form */}
            <form onSubmit={handleBatchUpdateMeetUrl} style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ⚡ Gán 1 Link Chung Cho Toàn Hệ Thống (Khi Có Hội Thảo / Họp Toàn Trường):
                </label>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Mặc định: Các lớp nên dùng 10 link độc lập bên dưới
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="url"
                  required
                  value={masterMeetUrlInput}
                  onChange={e => setMasterMeetUrlInput(e.target.value)}
                  placeholder="https://meet.google.com/sja-vcpy-rsu"
                  style={{
                    flex: 1,
                    minWidth: '280px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    fontWeight: 600
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '0.86rem', fontWeight: 800, whiteSpace: 'nowrap' }}
                >
                  Đồng Bộ Cho Tất Cả 10 Lớp
                </button>
              </div>
            </form>
          </div>

          {/* Grid of 10 Dedicated Class Rooms */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
            {meetHubRooms.map((roomItem: any, idx: number) => {
              const isCopied = copiedMeetIndex === idx;
              return (
                <div
                  key={roomItem.track}
                  className="card"
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1.5px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)'
                  }}
                >
                  {/* Top: Class & Lecturer */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: '#EFF6FF',
                        color: '#2563EB',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        border: '1px solid #BFDBFE'
                      }}>
                        LỚP {roomItem.classCode}
                      </span>

                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: '#10b981',
                        fontSize: '0.72rem',
                        fontWeight: 800
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                        PHÒNG RIÊNG SẴN SÀNG
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.35 }}>
                      {roomItem.className}
                    </h4>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: '10px' }}>
                      <div>👨‍🏫 <strong>Giảng viên:</strong> {roomItem.teacher}</div>
                      <div>📍 <strong>Địa điểm / Ca học:</strong> {roomItem.room}</div>
                    </div>
                  </div>

                  {/* Middle: Meet Link Input/Display */}
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <Video size={15} color="#2563EB" />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 700, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                        {roomItem.meetUrl}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(roomItem.meetUrl);
                        setCopiedMeetIndex(idx);
                        soundFx.playClick();
                        setTimeout(() => setCopiedMeetIndex(null), 2000);
                      }}
                      className="btn btn-secondary"
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.74rem',
                        height: '26px',
                        minHeight: '26px',
                        borderRadius: '6px',
                        background: isCopied ? '#10b981' : undefined,
                        color: isCopied ? '#fff' : undefined,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Sao chép link Google Meet cho lớp này"
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{isCopied ? 'Đã chép' : 'Chép'}</span>
                    </button>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href={roomItem.meetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                        background: '#2563EB',
                        borderRadius: '10px'
                      }}
                      title="Admin / Thanh tra vào dự giờ lớp trực tiếp không cần đợi duyệt"
                    >
                      <Video size={14} />
                      <span>Vào Dự Giờ Thanh Tra 🎥</span>
                      <ExternalLink size={12} />
                    </a>

                    <button
                      onClick={() => handleGenerateSingleMeet(roomItem.track)}
                      className="btn btn-secondary"
                      style={{ padding: '8px 10px', fontSize: '0.78rem', borderRadius: '10px' }}
                      title="Tự động sinh link Meet ngẫu nhiên mới cho lớp này"
                    >
                      <span>🎲</span>
                    </button>

                    <button
                      onClick={() => {
                        const newUrl = prompt(`Nhập link Google Meet tùy chỉnh cho lớp ${roomItem.classCode}:`, roomItem.meetUrl);
                        if (newUrl && newUrl.trim()) {
                          handleUpdateSingleRoomMeet(roomItem.track, newUrl);
                          soundFx.playVictory();
                        }
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '8px 10px', fontSize: '0.78rem', borderRadius: '10px' }}
                      title="Tùy chỉnh link Meet riêng cho lớp này"
                    >
                      <Settings size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* ── MODAL: ĐỌC ĐỀ THI & XEM ĐÁP ÁN DÀNH CHO GIẢNG VIÊN / ADMIN ── */}
      {readingQuiz && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          className="animate-fade-in"
        >
          <div
            className="card animate-slide-up"
            style={{
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '20px',
              padding: '24px',
              background: 'var(--bg-card)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--border-color)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '14px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '999px', background: 'rgba(217, 119, 6, 0.12)', color: '#d97706', fontSize: '0.74rem', fontWeight: 800, marginBottom: '6px' }}>
                  <BookOpenCheck size={14} />
                  <span>CHẾ ĐỘ ĐỌC ĐỀ & ĐÁP ÁN GIẢNG VIÊN</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                  {readingQuiz.title}
                </h3>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span>📚 Phân hệ: <strong>{TRACK_LABELS[readingQuiz.category as CurriculumTrack] || readingQuiz.category}</strong></span>
                  <span>•</span>
                  <span>⏱️ Thời gian: <strong>{readingQuiz.timeLimitMinutes} phút</strong></span>
                  <span>•</span>
                  <span>📝 Tổng số: <strong>{readingQuiz.questions.length} câu hỏi</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => window.print()}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.76rem', gap: '4px' }}
                  title="In hoặc xuất PDF đề thi"
                >
                  <Printer size={14} />
                  <span>In Đề</span>
                </button>

                <button
                  onClick={() => setReadingQuiz(null)}
                  className="btn btn-icon"
                  style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {readingQuiz.questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {/* Question Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--brand)', background: 'var(--brand-light)', padding: '2px 10px', borderRadius: '6px' }}>
                      Câu {idx + 1}/{readingQuiz.questions.length}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {q.points || 10} điểm
                    </span>
                  </div>

                  {/* Question Prompt */}
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {q.prompt}
                  </div>

                  {/* Options */}
                  {q.options && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                      {q.options.map((opt, oidx) => {
                        const isCorrect = Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(oidx) : q.correctAnswer === oidx;
                        return (
                          <div
                            key={oidx}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '10px',
                              background: isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
                              border: isCorrect ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                              color: isCorrect ? '#065f46' : 'var(--text-primary)',
                              fontWeight: isCorrect ? 800 : 500,
                              fontSize: '0.84rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '6px'
                            }}
                          >
                            <span><strong>{String.fromCharCode(65 + oidx)}.</strong> {opt}</span>
                            {isCorrect && (
                              <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.74rem', fontWeight: 900 }}>
                                <Check size={14} />
                                <span>ĐÁP ÁN ĐÚNG</span>
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation Box */}
                  {q.explanation && (
                    <div
                      style={{
                        marginTop: '4px',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'rgba(79, 110, 247, 0.08)',
                        borderLeft: '4px solid var(--brand)',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5
                      }}
                    >
                      <strong style={{ color: 'var(--brand)' }}>💡 Giải thích & Hướng dẫn thao tác chuẩn:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '14px', borderTop: '1px solid var(--border-color)', marginTop: '10px' }}>
              <button
                onClick={() => setReadingQuiz(null)}
                className="btn btn-primary"
                style={{ padding: '8px 24px', fontWeight: 800, borderRadius: '10px' }}
              >
                Đóng Đề Thi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
