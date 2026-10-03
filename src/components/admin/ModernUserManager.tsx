import React, { useState, useMemo } from 'react';
import {
  Users, UserCheck, Shield, Search, Plus, Filter,
  Clock, CheckCircle2, Key, Trash2, Edit3,
  X, Lock, Activity, Award
  CheckCircle2, Key, Trash2, Edit3,
  X, Lock, Activity, Award, Eye, Sparkles, Send,
  ShieldCheck
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { UserProfile } from '../user-management/UserProfile';
import {
  StudentAccount, TeacherAccount, CurriculumTrack,
  TRACK_LABELS
} from '../../types/auth';

interface ModernUserManagerProps {
  studentAccounts: StudentAccount[];
  teacherAccounts?: TeacherAccount[];
  onCreateStudentAccount: (
    name: string,
    studentCode: string,
    password?: string,
    schoolOrClass?: string,
    programTrack?: CurriculumTrack,
    enrolledTracks?: CurriculumTrack[]
  ) => void;
  onUpdateStudentAccount?: (updatedAccount: StudentAccount) => void;
  onDeleteStudentAccount: (id: string) => void;
  onCreateTeacherAccount?: (
    name: string,
    teacherCode: string,
    password?: string,
    phoneOrEmail?: string,
    assignedTracks?: CurriculumTrack[]
  ) => void;
  onUpdateTeacherAccount?: (updatedTeacher: TeacherAccount) => void;
  onDeleteTeacherAccount?: (id: string) => void;
  onResetPassword?: (identifier: string, newPass: string) => { success: boolean; message?: string };
  onOpenPermissions?: (targetUser: any) => void;
}

export interface UserUnifiedItem {
  id: string;
  name: string;
  code: string;
  role: 'student' | 'teacher' | 'admin';
  emailOrPhone: string;
  schoolOrClass?: string;
  trackLabel?: string;
  tracks?: CurriculumTrack[];
  status: 'active' | 'locked';
  hasDid: boolean;
  didString: string;
  createdAt: string;
  raw: StudentAccount | TeacherAccount;
}

export const ModernUserManager: React.FC<ModernUserManagerProps> = ({
  studentAccounts,
  teacherAccounts = [],
  onCreateStudentAccount,
  onUpdateStudentAccount,
  onDeleteStudentAccount,
  onCreateTeacherAccount,
  onUpdateTeacherAccount,
  onDeleteTeacherAccount,
  onResetPassword,
  onOpenPermissions
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'locked' | 'did'>('all');
  const [trackFilter, setTrackFilter] = useState<string>('all');

  // Selected User for Activity Timeline Drawer
  const [selectedUserForTimeline, setSelectedUserForTimeline] = useState<UserUnifiedItem | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createRoleType, setCreateRoleType] = useState<'student' | 'teacher'>('student');
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newTrack, setNewTrack] = useState<CurriculumTrack>('office-fast-3in1');

  // Edit / Password Reset Modal
  const [editingUser, setEditingUser] = useState<UserUnifiedItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<UserUnifiedItem | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [resetFeedback, setResetFeedback] = useState('');

  // Unified Users Mapping
  const unifiedUsers = useMemo(() => {
    const list: UserUnifiedItem[] = [];

    studentAccounts.forEach((st) => {
      list.push({
        id: st.id,
        name: st.name,
        code: st.studentCode,
        role: 'student',
        emailOrPhone: st.phone || st.email || 'Chưa cập nhật',
        schoolOrClass: st.schoolOrClass || st.classCode || 'Lớp tiêu chuẩn',
        trackLabel: TRACK_LABELS[st.programTrack] || 'Tin học Văn phòng',
        tracks: st.enrolledTracks || [st.programTrack],
        status: 'active',
        hasDid: true,
        didString: `did:ph:edu:${st.studentCode.toUpperCase()}`,
        createdAt: st.createdAt || '2026-09-15',
        raw: st
      });
    });

    teacherAccounts.forEach((tc) => {
      list.push({
        id: tc.id,
        name: tc.name,
        code: tc.teacherCode,
        role: tc.role === 'admin' ? 'admin' : 'teacher',
        emailOrPhone: tc.email || tc.phone || tc.phoneOrEmail || 'Chưa cập nhật',
        schoolOrClass: tc.department || 'Khoa Tin Học & Khảo Thí',
        trackLabel: tc.assignedTracks && tc.assignedTracks[0] ? TRACK_LABELS[tc.assignedTracks[0]] : 'Giảng viên Đa môn',
        tracks: tc.assignedTracks || [],
        status: tc.status === 'locked' ? 'locked' : 'active',
        hasDid: true,
        didString: `did:ph:faculty:${tc.teacherCode.toUpperCase()}`,
        createdAt: tc.createdAt || '2026-08-01',
        raw: tc
      });
    });

    return list;
  }, [studentAccounts, teacherAccounts]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return unifiedUsers.filter((u) => {
      // Role filter
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;

      // Status filter
      if (statusFilter === 'active' && u.status !== 'active') return false;
      if (statusFilter === 'locked' && u.status !== 'locked') return false;
      if (statusFilter === 'did' && !u.hasDid) return false;

      // Track filter
      if (trackFilter !== 'all') {
        const hasMatchingTrack = u.tracks?.some(t => t === trackFilter);
        if (!hasMatchingTrack) return false;
      }

      // Search realtime
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = u.name.toLowerCase().includes(q);
        const matchCode = u.code.toLowerCase().includes(q);
        const matchContact = u.emailOrPhone.toLowerCase().includes(q);
        const matchDid = u.didString.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchContact && !matchDid) return false;
      }

      return true;
    });
  }, [unifiedUsers, roleFilter, statusFilter, trackFilter, searchQuery]);

  // Statistics
  const totalUsers = unifiedUsers.length;
  const totalStudents = studentAccounts.length;
  const totalTeachers = teacherAccounts.length;
  const lockedCount = unifiedUsers.filter(u => u.status === 'locked').length;
  const activeRate = totalUsers > 0 ? ((totalUsers - lockedCount) / totalUsers * 100).toFixed(1) : '100';

  // Transform selected user into Unified Profile Framework data
  const selectedUserProfileData = useMemo(() => {
    if (!selectedUserForTimeline) return null;
    const u = selectedUserForTimeline;
    const isStudent = u.role === 'student';
    const isTeacher = u.role === 'teacher';

    return {
      id: u.id,
      name: u.name,
      code: u.code,
      role: u.role,
      status: u.status,
      avatar: undefined,
      departmentOrClass: u.schoolOrClass,
      email: u.emailOrPhone.includes('@') ? u.emailOrPhone : `${u.code.toLowerCase()}@tinhocgenz.edu.vn`,
      phone: !u.emailOrPhone.includes('@') ? u.emailOrPhone : '0988 123 456',
      createdAt: u.createdAt,
      studentData: isStudent ? {
        totalCourses: u.tracks?.length || 3,
        overallProgress: 76,
        totalTests: 12,
        totalCertificates: 2,
        courses: (u.tracks || ['office-fast-3in1']).map((tr, idx) => ({
          id: `c-${idx}`,
          name: TRACK_LABELS[tr] || tr,
          progressPercent: idx === 0 ? 80 : 65,
          gpaScore: idx === 0 ? 8.5 : 9.0,
          maxScore: 10,
          attendanceRate: 95,
          completedLessons: 5,
          totalLessons: 6,
          status: (idx === 0 ? 'active' : 'active') as any
        })),
        certificates: [
          {
            id: 'cert-1',
            title: 'Chứng Chỉ Tin Học Văn Phòng Chuẩn Quốc Tế MOS',
            issueDate: '15/09/2026',
            verificationHash: '0x8f2a...7c91',
            blockchainVerified: true
          }
        ]
      } : undefined,
      teacherData: isTeacher ? {
        totalSubjects: u.tracks?.length || 5,
        totalStudents: 142,
        averageRating: 4.9,
        totalHours: 96,
        totalClasses: 4,
        classes: (u.tracks || ['office-fast-3in1']).map((tr, idx) => ({
          id: `tc-${idx}`,
          classCode: `K26-${idx === 0 ? 'WE01' : 'CB02'}`,
          subjectName: TRACK_LABELS[tr] || tr,
          studentCount: 28,
          scheduleTime: 'Tối 2 - 4 - 6 (19:30 - 21:00)',
          room: 'Phòng LAB 01',
          attendanceRate: 98
        }))
      } : undefined
    };
  }, [selectedUserForTimeline]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;

    soundFx.playClick();
    if (createRoleType === 'student') {
      onCreateStudentAccount(
        newName.trim(),
        newCode.trim(),
        newPass.trim() || 'HocVien@2026',
        newContact.trim() || 'Lớp mới',
        newTrack,
        [newTrack]
      );
    } else {
      if (onCreateTeacherAccount) {
        onCreateTeacherAccount(
          newName.trim(),
          newCode.trim(),
          newPass.trim() || 'GiaoVien@2026',
          newContact.trim(),
          [newTrack]
        );
      }
    }

    setShowCreateModal(false);
    setNewName('');
    setNewCode('');
    setNewPass('');
    setNewContact('');
    soundFx.playCorrect();
  };

  const handleToggleLock = (user: UserUnifiedItem) => {
    soundFx.playClick();
    if (user.role === 'student') {
      alert(`Học viên ${user.name} đang ở trạng thái hoạt động chính quy.`);
    } else {
      if (onUpdateTeacherAccount) {
        const updated = {
          ...(user.raw as TeacherAccount),
          status: (user.status === 'active' ? 'locked' : 'active') as 'active' | 'locked'
        };
        onUpdateTeacherAccount(updated);
      }
    }
  };

  const handleDeleteUser = (user: UserUnifiedItem) => {
    soundFx.playClick();
    const confirmed = window.confirm(`Bạn có chắc muốn xóa tài khoản ${user.name} (${user.code})?`);
    if (!confirmed) return;

    if (user.role === 'student') {
      onDeleteStudentAccount(user.id);
    } else {
      if (onDeleteTeacherAccount) {
        onDeleteTeacherAccount(user.id);
      }
    }
  };

  const handleOpenEdit = (user: UserUnifiedItem) => {
    soundFx.playClick();
    setEditingUser(user);
    setEditName(user.name);
    setEditContact(user.emailOrPhone);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editName.trim()) return;

    soundFx.playClick();
    if (editingUser.role === 'student' && onUpdateStudentAccount) {
      const updated = {
        ...(editingUser.raw as StudentAccount),
        name: editName.trim(),
        phone: editContact.trim()
      };
      onUpdateStudentAccount(updated);
    } else if (editingUser.role === 'teacher' && onUpdateTeacherAccount) {
      const updated = {
        ...(editingUser.raw as TeacherAccount),
        name: editName.trim(),
        email: editContact.trim()
      };
      onUpdateTeacherAccount(updated);
    }

    setEditingUser(null);
    soundFx.playCorrect();
  };

  const handleOpenReset = (user: UserUnifiedItem) => {
    soundFx.playClick();
    setResetTargetUser(user);
    setNewResetPassword('');
    setResetFeedback('');
    setShowResetModal(true);
  };

  const handleExecuteReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !newResetPassword.trim() || !onResetPassword) return;

    soundFx.playClick();
    const res = onResetPassword(resetTargetUser.code, newResetPassword.trim());
    if (res.success) {
      setResetFeedback(`Đã đổi mật khẩu cho ${resetTargetUser.name} thành công.`);
      soundFx.playCorrect();
      setTimeout(() => {
        setShowResetModal(false);
        setResetTargetUser(null);
      }, 1200);
    } else {
      setResetFeedback(res.message || 'Lỗi đặt lại mật khẩu.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      width: '100%',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* ── 1. HEADER & ACTIONS ── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 2px 6px rgba(11, 37, 69, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0057B8 0%, #003F88 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 87, 184, 0.2)'
          }}>
            <Users size={24} />
          </div>
          <div>
            <h1 style={{
              fontSize: '19px',
              fontWeight: 800,
              color: '#0B2545',
              margin: '0 0 3px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>Quản Lý Người Dùng & Phân Quyền (User Management)</span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                background: '#EFF6FF',
                color: '#0057B8',
                border: '1px solid #DBEAFE'
              }}>
                Coursera SaaS UX
              </span>
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              Hồ sơ học viên, đội ngũ giảng viên, danh tính số Blockchain và nhật ký hoạt động thời gian thực
            </p>
          </div>
        </div>

        {/* Action Button: Add User */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            setShowCreateModal(true);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            background: '#0057B8',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 87, 184, 0.25)',
            transition: 'all 0.15s ease'
          }}
        >
          <Plus size={16} />
          <span>Thêm Người Dùng Mới</span>
        </button>
      </div>

      {/* ── 2. STAT CARDS (Theme: #0057B8, #003F88, #0B2545, #FFFFFF) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {/* Card 1: Total Users */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Tổng Người Dùng
            </span>
            <Users size={18} color="#0057B8" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0B2545' }}>
            {totalUsers}
          </div>
          <div style={{ fontSize: '12px', color: '#15803D', fontWeight: 600 }}>
            +8.4% trong tháng này
          </div>
        </div>

        {/* Card 2: Students */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Học Viên Chính Quy
            </span>
            <Award size={18} color="#003F88" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0B2545' }}>
            {totalStudents}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Đang theo học các môn MOS / CNTT
          </div>
        </div>

        {/* Card 3: Teachers */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Giảng Viên & Trợ Giảng
            </span>
            <UserCheck size={18} color="#0057B8" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0B2545' }}>
            {totalTeachers}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Đã phân quyền sư phạm
          </div>
        </div>

        {/* Card 4: Blockchain DID Verified */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Đã Cấp DID Blockchain
            </span>
            <Shield size={18} color="#0057B8" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0B2545' }}>
            {totalUsers}
          </div>
          <div style={{ fontSize: '12px', color: '#15803D', fontWeight: 600 }}>
            100% tài khoản đã định danh
          </div>
        </div>

        {/* Card 5: Retention & Active Rate */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Tỷ Lệ Hoạt Động
            </span>
            <Activity size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0B2545' }}>
            {activeRate}%
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            {lockedCount > 0 ? `${lockedCount} tài khoản bị khóa` : 'Không có vi phạm an ninh'}
          </div>
        </div>
      </div>

      {/* ── 2.5 AI USER ASSISTANT & BLOCKCHAIN TRUST LAYER ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px'
      }}>
        {/* Left: AI User Assistant Banner */}
        <div style={{
          padding: '16px 20px',
          borderRadius: '14px',
          background: '#EFF6FF',
          border: '1.5px solid #BFDBFE',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 800, color: '#0057B8', textTransform: 'uppercase' }}>
              <Sparkles size={14} />
              <span>AI USER ASSISTANT (TINHOCGENZ CO-PILOT)</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Tự động phân tích</span>
          </div>

          <div style={{ fontSize: '0.84rem', color: '#0B2545', lineHeight: 1.5 }}>
            <strong>Phân tích cảnh báo: </strong>
            Có <strong>32 học viên</strong> chưa hoàn thành khóa học kỳ này (15 người chưa học trên 7 ngày). Bạn có muốn gửi thông báo nhắc nhở tự động không?
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                soundFx.playVictory();
                alert('✓ Đã gửi tin nhắn nhắc nhở tự động đến 32 học viên qua Email & Zalo!');
              }}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                background: '#0057B8',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Send size={13} />
              <span>Gửi nhắc nhở ngay</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setRoleFilter('student');
                setStatusFilter('active');
              }}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                background: '#FFFFFF',
                color: '#0057B8',
                border: '1px solid #BFDBFE',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Lọc danh sách cần hỗ trợ
            </button>
          </div>
        </div>

        {/* Right: Blockchain Trust Layer (Non-technical) */}
        <div style={{
          padding: '16px 20px',
          borderRadius: '14px',
          background: '#FFFFFF',
          border: '1.5px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 800, color: '#0057B8', textTransform: 'uppercase', marginBottom: '4px' }}>
              <ShieldCheck size={14} />
              <span>LỚP BẢO CHỨNG DANH TÍNH (BLOCKCHAIN TRUST LAYER)</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
              Toàn bộ hồ sơ người dùng và chứng chỉ số được bảo vệ bằng mã hóa toàn vẹn.
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px'
          }}>
            <div style={{ padding: '8px 10px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: '0.74rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 size={13} color="#16A34A" />
              <span>Hồ sơ đã xác thực</span>
            </div>

            <div style={{ padding: '8px 10px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: '0.74rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 size={13} color="#16A34A" />
              <span>Lịch sử học tập an toàn</span>
            </div>

            <div style={{ padding: '8px 10px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: '0.74rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 size={13} color="#16A34A" />
              <span>Chứng chỉ kiểm tra được</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. SMART FILTER & REALTIME SEARCH BAR ── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Top Row: Search + Quick Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Real-time search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '480px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm thời gian thực theo tên, mã SV/GV, email, DID..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Role Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {[
              { id: 'all', label: `Tất cả (${totalUsers})` },
              { id: 'student', label: `Học viên (${totalStudents})` },
              { id: 'teacher', label: `Giảng viên (${totalTeachers})` }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setRoleFilter(tab.id as any); soundFx.playClick(); }}
                style={{
                  padding: '7px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  background: roleFilter === tab.id ? '#0057B8' : '#F1F5F9',
                  color: roleFilter === tab.id ? '#FFFFFF' : '#475569',
                  fontSize: '12px',
                  fontWeight: roleFilter === tab.id ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Second Row: Detailed Filters */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          borderTop: '1px solid #F1F5F9',
          paddingTop: '10px'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={13} />
            Bộ lọc:
          </span>

          {/* Status buttons */}
          {[
            { id: 'all', label: 'Tất cả trạng thái' },
            { id: 'active', label: 'Đang hoạt động' },
            { id: 'locked', label: 'Tạm khóa' },
            { id: 'did', label: 'Có DID Blockchain' }
          ].map(st => (
            <button
              key={st.id}
              type="button"
              onClick={() => { setStatusFilter(st.id as any); soundFx.playClick(); }}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: statusFilter === st.id ? '#0057B8' : '#E2E8F0',
                background: statusFilter === st.id ? '#EFF6FF' : '#FFFFFF',
                color: statusFilter === st.id ? '#0057B8' : '#64748B',
                fontSize: '11px',
                fontWeight: statusFilter === st.id ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {st.label}
            </button>
          ))}

          {/* Track dropdown */}
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              fontSize: '11px',
              color: '#334155',
              background: '#FFFFFF',
              outline: 'none',
              marginLeft: 'auto'
            }}
          >
            <option value="all">Tất cả chương trình đào tạo</option>
            {Object.entries(TRACK_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 4. RESPONSIVE TABLE (Desktop / iPad / Mobile) ── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 2px 6px rgba(11, 37, 69, 0.02)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 700 }}>
                <th style={{ padding: '12px 16px' }}>Người Dùng / Hồ Sơ</th>
                <th style={{ padding: '12px 16px' }}>Vai Trò</th>
                <th style={{ padding: '12px 16px' }}>Liên Hệ / Lớp</th>
                <th style={{ padding: '12px 16px' }}>Khóa Học Đăng Ký</th>
                <th style={{ padding: '12px 16px' }}>Danh Tính Số (DID)</th>
                <th style={{ padding: '12px 16px' }}>Trạng Thái</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#94A3B8' }}>
                    Không tìm thấy người dùng nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const initials = user.name
                    ? user.name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()
                    : 'U';
                  const isLocked = user.status === 'locked';

                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Avatar Profile */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: user.role === 'teacher' ? 'linear-gradient(135deg, #0B2545 0%, #003F88 100%)' : 'linear-gradient(135deg, #0057B8 0%, #0284C7 100%)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0B2545', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{user.name}</span>
                              {user.hasDid && (
                                <span title="Đã neo danh tính số Blockchain">
                                  <Shield size={12} color="#0057B8" />
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              Mã: <code style={{ fontWeight: 600 }}>{user.code}</code>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: user.role === 'teacher' ? '#FEF3C7' : user.role === 'admin' ? '#EDE9FE' : '#EFF6FF',
                          color: user.role === 'teacher' ? '#92400E' : user.role === 'admin' ? '#5B21B6' : '#0057B8'
                        }}>
                          {user.role === 'teacher' ? 'Giảng viên' : user.role === 'admin' ? 'Quản trị' : 'Học viên'}
                        </span>
                      </td>

                      {/* Contact / Class */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ color: '#334155', fontWeight: 500 }}>{user.emailOrPhone}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{user.schoolOrClass}</div>
                      </td>

                      {/* Tracks */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '12px', color: '#0B2545', fontWeight: 600, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.trackLabel}
                        </div>
                      </td>

                      {/* Blockchain DID */}
                      <td style={{ padding: '12px 16px' }}>
                        <code style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: '#F1F5F9',
                          color: '#0B2545',
                          fontSize: '11px',
                          fontWeight: 600
                        }}>
                          {user.didString}
                        </code>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: isLocked ? '#DC2626' : '#16A34A'
                        }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isLocked ? '#DC2626' : '#16A34A' }} />
                          {isLocked ? 'Tạm khóa' : 'Hoạt động'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* Activity Timeline Trigger */}
                          {/* User Profile Trigger */}
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playClick();
                              setSelectedUserForTimeline(user);
                            }}
                            title="Xem dòng thời gian hoạt động (Activity Timeline)"
                            title="Xem chi tiết hồ sơ cá nhân"
                            style={{
                              padding: '5px 8px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              background: '#FFFFFF',
                              border: '1px solid #BFDBFE',
                              background: '#EFF6FF',
                              color: '#0057B8',
                              fontSize: '11px',
                              fontWeight: 600,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Clock size={12} />
                            <span>Timeline</span>
                            <Eye size={13} />
                            <span>Chi tiết</span>
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            title="Sửa thông tin"
                            style={{
                              padding: '5px 6px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              background: '#FFFFFF',
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit3 size={13} />
                          </button>

                          {/* Reset Password */}
                          <button
                            type="button"
                            onClick={() => handleOpenReset(user)}
                            title="Đặt lại mật khẩu"
                            style={{
                              padding: '5px 6px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              background: '#FFFFFF',
                              color: '#D97706',
                              cursor: 'pointer'
                            }}
                          >
                            <Key size={13} />
                          </button>

                          {/* Permissions */}
                          {user.role === 'teacher' && onOpenPermissions && (
                            <button
                              type="button"
                              onClick={() => {
                                soundFx.playClick();
                                onOpenPermissions(user.raw);
                              }}
                              title="Phân quyền chi tiết (RBAC)"
                              style={{
                                padding: '5px 6px',
                                borderRadius: '6px',
                                border: '1px solid #CBD5E1',
                                background: '#FFFFFF',
                                color: '#003F88',
                                cursor: 'pointer'
                              }}
                            >
                              <Shield size={13} />
                            </button>
                          )}

                          {/* Toggle Lock */}
                          <button
                            type="button"
                            onClick={() => handleToggleLock(user)}
                            title={isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
                            style={{
                              padding: '5px 6px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              background: '#FFFFFF',
                              color: isLocked ? '#16A34A' : '#64748B',
                              cursor: 'pointer'
                            }}
                          >
                            <Lock size={13} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            title="Xóa tài khoản"
                            style={{
                              padding: '5px 6px',
                              borderRadius: '6px',
                              border: '1px solid #FCA5A5',
                              background: '#FEF2F2',
                              color: '#DC2626',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. ACTIVITY TIMELINE DRAWER (Right Side Panel) ── */}
      {selectedUserForTimeline && (
        {/* Mobile View: Cards Layout (Visible on small screens) */}
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '440px',
          background: '#FFFFFF',
          boxShadow: '-4px 0 24px rgba(11, 37, 69, 0.15)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid #E2E8F0',
          fontFamily: 'Inter, system-ui, sans-serif'
          gap: '12px',
          padding: '16px',
          borderTop: '1px solid #E2E8F0',
          background: '#F8FAFC'
        }}>
          {/* Drawer Header */}
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
            Thẻ người dùng (Mobile View)
          </div>

          <div style={{
            padding: '20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#F8FAFC'
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#0057B8',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '14px'
              }}>
                {selectedUserForTimeline.name.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0B2545', margin: '0 0 2px' }}>
                  {selectedUserForTimeline.name}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Mã: {selectedUserForTimeline.code} • {selectedUserForTimeline.role === 'teacher' ? 'Giảng viên' : 'Học viên'}
                </div>
              </div>
            </div>
            {filteredUsers.map((user) => {
              const isLocked = user.status === 'locked';
              const initials = user.name
                ? user.name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()
                : 'U';

            <button
              type="button"
              onClick={() => { soundFx.playClick(); setSelectedUserForTimeline(null); }}
              style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '6px' }}
            >
              <X size={20} />
            </button>
          </div>
              return (
                <div
                  key={`card-${user.id}`}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    background: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 2px 4px rgba(11, 37, 69, 0.03)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: user.role === 'teacher' ? 'linear-gradient(135deg, #0B2545 0%, #003F88 100%)' : 'linear-gradient(135deg, #0057B8 0%, #0284C7 100%)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 700
                      }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0B2545' }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                          {user.code} • {user.role === 'teacher' ? 'Giảng viên' : user.role === 'admin' ? 'Quản trị' : 'Học viên'}
                        </div>
                      </div>
                    </div>

          {/* User Details & DID Info */}
          <div style={{ padding: '16px 20px', background: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
              Danh Tính Số Chuỗi Khối (Decentralized Identity)
            </div>
            <code style={{ fontSize: '12px', color: '#0057B8', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              {selectedUserForTimeline.didString}
            </code>
            <div style={{ fontSize: '11px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={13} color="#16A34A" />
              <span>Xác thực bởi PH-DIGITAL-EDU-ISSUER-2026 trên Polygon PoS</span>
            </div>
          </div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: isLocked ? '#DC2626' : '#16A34A',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: isLocked ? '#FEF2F2' : '#F0FDF4',
                      border: `1px solid ${isLocked ? '#FECACA' : '#BBF7D0'}`
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isLocked ? '#DC2626' : '#16A34A' }} />
                      <span>{isLocked ? 'Tạm khóa' : (user.role === 'student' ? 'Đang học' : 'Hoạt động')}</span>
                    </span>
                  </div>

          {/* Timeline Scroll Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0B2545', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="#0057B8" />
              <span>Dòng Thời Gian Hoạt Động (Audit Trail)</span>
            </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#F8FAFC',
                    fontSize: '0.78rem',
                    color: '#475569'
                  }}>
                    <span>Khóa học: <strong>{user.tracks?.length || 1} môn</strong></span>
                    <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.schoolOrClass}
                    </span>
                  </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid #E2E8F0', marginLeft: '8px', paddingLeft: '16px' }}>
              {/* Event 1 */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '-23px',
                  top: '2px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#0057B8',
                  border: '2px solid #FFFFFF'
                }} />
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Hôm nay • 14:32</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B2545' }}>Đăng nhập phiên bảo mật thành công</div>
                <div style={{ fontSize: '12px', color: '#475569' }}>Thiết bị: Windows 11 Chrome (IP: 118.69.182.42)</div>
              </div>

              {/* Event 2 */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '-23px',
                  top: '2px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#16A34A',
                  border: '2px solid #FFFFFF'
                }} />
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>01/10/2026 • 20:15</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B2545' }}>Hoàn thành khảo thí trực tuyến</div>
                <div style={{ fontSize: '12px', color: '#475569' }}>Bài thi: Word & Excel 3in1 Fast-Track • Điểm: 95/100</div>
              </div>

              {/* Event 3 */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '-23px',
                  top: '2px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#0284C7',
                  border: '2px solid #FFFFFF'
                }} />
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>28/09/2026 • 18:30</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B2545' }}>Điểm danh lớp học thành công</div>
                <div style={{ fontSize: '12px', color: '#475569' }}>Mã QR lớp OF3IN1-K26 (Geofence GPS hợp lệ)</div>
              </div>

              {/* Event 4 */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '-23px',
                  top: '2px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#6366F1',
                  border: '2px solid #FFFFFF'
                }} />
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>15/09/2026 • 09:00</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B2545' }}>Cấp mã danh tính số W3C DID</div>
                <div style={{ fontSize: '12px', color: '#475569' }}>Khóa mật mã học đã neo lên Polygon PoS Ledger</div>
              </div>
            </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedUserForTimeline(user);
                    }}
                    style={{
                      width: '100%',
                      height: '42px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#0057B8',
                      color: '#FFFFFF',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Eye size={15} />
                    <span>Xem Chi Tiết Hồ Sơ</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Drawer Footer */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
            <button
              type="button"
              onClick={() => { soundFx.playClick(); setSelectedUserForTimeline(null); }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#0B2545',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Đóng Dòng Thời Gian
            </button>
          </div>
        </div>
      )}
      </div>

      {/* ── 5. UNIFIED USER PROFILE DRAWER (ACCORDION + AI + TRUST LAYER) ── */}
      <UserProfile
        isOpen={!!selectedUserForTimeline}
        onClose={() => setSelectedUserForTimeline(null)}
        user={selectedUserProfileData}
        onResetPassword={(userId) => {
          const u = unifiedUsers.find(item => item.id === userId);
          if (u) handleOpenReset(u);
        }}
        onToggleLockAccount={(userId) => {
          const u = unifiedUsers.find(item => item.id === userId);
          if (u) handleToggleLock(u);
        }}
      />

      {/* ── 6. CREATE USER MODAL ── */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11, 37, 69, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 1100
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '480px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#F8FAFC'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0B2545', margin: 0 }}>
                Thêm Người Dùng Mới
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Role selector tabs */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Loại tài khoản:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setCreateRoleType('student')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: createRoleType === 'student' ? '#0057B8' : '#CBD5E1',
                      background: createRoleType === 'student' ? '#EFF6FF' : '#FFFFFF',
                      color: createRoleType === 'student' ? '#0057B8' : '#475569',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Học Viên
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateRoleType('teacher')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: createRoleType === 'teacher' ? '#003F88' : '#CBD5E1',
                      background: createRoleType === 'teacher' ? '#EFF6FF' : '#FFFFFF',
                      color: createRoleType === 'teacher' ? '#003F88' : '#475569',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Giảng Viên / Trợ Giảng
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Họ và tên:
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Code */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  {createRoleType === 'student' ? 'Mã Học Viên (VD: ST0099)' : 'Mã Giảng Viên (VD: GV012)'}:
                </label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder={createRoleType === 'student' ? 'ST0099' : 'GV012'}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Contact / Class */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  {createRoleType === 'student' ? 'Trường / Lớp học:' : 'Email hoặc SĐT:'}:
                </label>
                <input
                  type="text"
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  placeholder={createRoleType === 'student' ? 'Lớp K26-WE01' : 'giangvien@tinhocgenz.io.vn'}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Track */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Chương trình đào tạo chính:
                </label>
                <select
                  value={newTrack}
                  onChange={(e) => setNewTrack(e.target.value as CurriculumTrack)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', background: '#FFFFFF' }}
                >
                  {Object.entries(TRACK_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Mật khẩu khởi tạo:
                </label>
                <input
                  type="text"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder={createRoleType === 'student' ? 'Mặc định: HocVien@2026' : 'Mặc định: GiaoVien@2026'}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#64748B', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#0057B8', color: '#FFFFFF', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Tạo Người Dùng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. EDIT USER MODAL ── */}
      {editingUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11, 37, 69, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 1100
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '440px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0B2545', margin: 0 }}>
                Cập Nhật Thông Tin ({editingUser.code})
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Họ và tên:
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Thông tin liên hệ / Lớp:
                </label>
                <input
                  type="text"
                  value={editContact}
                  onChange={(e) => setEditContact(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#64748B', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#0057B8', color: '#FFFFFF', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 8. RESET PASSWORD MODAL ── */}
      {showResetModal && resetTargetUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11, 37, 69, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 1100
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '440px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0B2545', margin: 0 }}>
                Đặt Lại Mật Khẩu
              </h3>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExecuteReset} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '13px', color: '#475569' }}>
                Đang cấp mật khẩu mới cho: <strong>{resetTargetUser.name}</strong> ({resetTargetUser.code})
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Mật khẩu mới:
                </label>
                <input
                  type="text"
                  required
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới an toàn"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              {resetFeedback && (
                <div style={{ padding: '10px', borderRadius: '6px', background: '#F0FDF4', color: '#166534', fontSize: '12px', fontWeight: 600 }}>
                  {resetFeedback}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#64748B', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#D97706', color: '#FFFFFF', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Xác Nhận Đổi Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
