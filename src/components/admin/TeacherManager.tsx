import React, { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Lock,
  Unlock,
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit3,
  Trash2,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  CheckSquare,
  Square,
  ShieldCheck
} from 'lucide-react';

import {
  TeacherAccount,
  CurriculumTrack,
  TRACK_LABELS,
  UserProfile
} from '../../types/auth';
import { ALL_TRACK_OPTIONS } from './AdminPortal';
import { AuditLogService } from '../../services/auditLogService';
import { soundFx } from '../../utils/audio';
import { AdminAssistantMascot } from './AdminAssistantMascot';
import { PermissionManagerModal } from './PermissionManagerModal';

interface TeacherManagerProps {
  currentUser: UserProfile;
  teacherAccounts: TeacherAccount[];
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
}

export const TeacherManager: React.FC<TeacherManagerProps> = ({
  currentUser,
  teacherAccounts,
  onCreateTeacherAccount,
  onUpdateTeacherAccount,
  onDeleteTeacherAccount,
  onResetPassword
}) => {
  const isSuperAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';

  // ── FILTER & PAGINATION STATE ──
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'teacher' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'locked'>('all');
  const [trackFilter, setTrackFilter] = useState<string>('all');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // ── ACTIVE ACTION MENU ──
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // ── MODAL STATES ──
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherAccount | null>(null);
  const [detailTeacher, setDetailTeacher] = useState<TeacherAccount | null>(null);
  const [resetPassTeacher, setResetPassTeacher] = useState<TeacherAccount | null>(null);
  const [deleteTeacherTarget, setDeleteTeacherTarget] = useState<TeacherAccount | null>(null);
  const [permissionTarget, setPermissionTarget] = useState<UserProfile | null>(null);

  // ── ADD FORM STATE ──
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState(`GV0${teacherAccounts.length + 1}`);
  const [newContact, setNewContact] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTracks, setNewTracks] = useState<CurriculumTrack[]>(['office-fast-3in1']);
  const [newRole, setNewRole] = useState<TeacherAccount['role']>('teacher');

  // ── EDIT FORM STATE ──
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editTracks, setEditTracks] = useState<CurriculumTrack[]>([]);
  const [editRole, setEditRole] = useState<TeacherAccount['role']>('teacher');
  const [editStatus, setEditStatus] = useState<'active' | 'locked'>('active');

  // ── RESET PASS STATE ──
  const [resetPassMode, setResetPassMode] = useState<'generate' | 'custom'>('generate');
  const [customNewPass, setCustomNewPass] = useState('');
  const [generatedPass, setGeneratedPass] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  // ── STATS COMPUTATION ──
  const stats = useMemo(() => {
    const total = teacherAccounts.length;
    const active = teacherAccounts.filter(t => t.status !== 'locked').length;
    const locked = teacherAccounts.filter(t => t.status === 'locked').length;
    return { total, active, locked };
  }, [teacherAccounts]);

  // ── FILTERED DATA ──
  const filteredTeachers = useMemo(() => {
    return teacherAccounts.filter(teacher => {
      // Search by name, code, contact/email/phone
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        teacher.name.toLowerCase().includes(q) ||
        teacher.teacherCode.toLowerCase().includes(q) ||
        (teacher.phoneOrEmail && teacher.phoneOrEmail.toLowerCase().includes(q)) ||
        (teacher.email && teacher.email.toLowerCase().includes(q)) ||
        (teacher.phone && teacher.phone.toLowerCase().includes(q));

      // Filter by role
      const matchRole =
        roleFilter === 'all' ||
        (roleFilter === 'admin' ? teacher.role === 'admin' : teacher.role !== 'admin');

      // Filter by status
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? teacher.status !== 'locked' : teacher.status === 'locked');

      // Filter by track
      const matchTrack =
        trackFilter === 'all' ||
        (teacher.assignedTracks && teacher.assignedTracks.includes(trackFilter as CurriculumTrack));

      return matchSearch && matchRole && matchStatus && matchTrack;
    });
  }, [teacherAccounts, searchQuery, roleFilter, statusFilter, trackFilter]);

  // ── PAGINATION COMPUTATION ──
  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / pageSize));
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTeachers.slice(start, start + pageSize);
  }, [filteredTeachers, currentPage, pageSize]);

  // Adjust page if out of bounds
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  // ── HANDLERS: ADD TEACHER ──
  const handleOpenAddModal = () => {
    setNewName('');
    setNewCode(`GV0${teacherAccounts.length + 1}`);
    setNewContact('');
    setNewEmail('');
    setNewPhone('');
    setNewTracks(['office-fast-3in1']);
    setNewRole('teacher');
    setShowAddModal(true);
    soundFx.playClick();
  };

  const handleSaveAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) {
      alert('Vui lòng nhập họ tên và mã tài khoản!');
      return;
    }

    const contactVal = newEmail.trim() || newPhone.trim() || newContact.trim();

    if (onCreateTeacherAccount) {
      onCreateTeacherAccount(
        newName.trim(),
        newCode.trim().toUpperCase(),
        undefined, // Secure: Do not supply plain password, auth service assigns secure hash
        contactVal,
        newTracks
      );
    }

    // Audit Log
    AuditLogService.log({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'CREATE_TEACHER_ACCOUNT',
      entityType: 'TeacherAccount',
      entityId: newCode.trim().toUpperCase(),
      after: { name: newName.trim(), code: newCode.trim(), role: newRole }
    });

    soundFx.playVictory();
    setShowAddModal(false);
  };

  // ── HANDLERS: EDIT TEACHER ──
  const handleOpenEdit = (teacher: TeacherAccount) => {
    setEditingTeacher(teacher);
    setEditName(teacher.name);
    setEditCode(teacher.teacherCode);
    setEditContact(teacher.phoneOrEmail || '');
    setEditEmail(teacher.email || (teacher.phoneOrEmail?.includes('@') ? teacher.phoneOrEmail : ''));
    setEditPhone(teacher.phone || (!teacher.phoneOrEmail?.includes('@') ? teacher.phoneOrEmail || '' : ''));
    setEditTracks(teacher.assignedTracks && teacher.assignedTracks.length > 0 ? [...teacher.assignedTracks] : ['office-fast-3in1']);
    setEditRole(teacher.role || 'teacher');
    setEditStatus(teacher.status || 'active');
    setActiveMenuId(null);
    soundFx.playClick();
  };

  const handleSaveEditTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    if (!editName.trim() || !editCode.trim()) {
      alert('Vui lòng nhập họ tên và mã tài khoản!');
      return;
    }

    const updated: TeacherAccount = {
      ...editingTeacher,
      name: editName.trim(),
      teacherCode: editCode.trim().toUpperCase(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      phoneOrEmail: editEmail.trim() || editPhone.trim() || editContact.trim(),
      assignedTracks: editTracks.length > 0 ? editTracks : ['office-fast-3in1'],
      role: editRole,
      status: editStatus
    };

    if (onUpdateTeacherAccount) {
      onUpdateTeacherAccount(updated);
    }

    // Update Detail modal if open
    if (detailTeacher && detailTeacher.id === updated.id) {
      setDetailTeacher(updated);
    }

    // Audit Log
    AuditLogService.log({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'UPDATE_TEACHER_ACCOUNT',
      entityType: 'TeacherAccount',
      entityId: updated.id,
      before: { name: editingTeacher.name, status: editingTeacher.status },
      after: { name: updated.name, status: updated.status }
    });

    soundFx.playVictory();
    setEditingTeacher(null);
  };

  // ── HANDLERS: TOGGLE LOCK STATUS ──
  const handleToggleLockStatus = (teacher: TeacherAccount) => {
    const newStatus = teacher.status === 'locked' ? 'active' : 'locked';
    const actionLabel = newStatus === 'locked' ? 'khóa' : 'mở khóa';

    const confirmMsg = `Bạn có chắc chắn muốn ${actionLabel} tài khoản "${teacher.name}" (${teacher.teacherCode})?`;
    if (!window.confirm(confirmMsg)) return;

    const updated: TeacherAccount = {
      ...teacher,
      status: newStatus
    };

    if (onUpdateTeacherAccount) {
      onUpdateTeacherAccount(updated);
    }

    if (detailTeacher && detailTeacher.id === teacher.id) {
      setDetailTeacher(updated);
    }

    // Audit Log
    AuditLogService.log({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: newStatus === 'locked' ? 'LOCK_TEACHER_ACCOUNT' : 'UNLOCK_TEACHER_ACCOUNT',
      entityType: 'TeacherAccount',
      entityId: teacher.id,
      before: { status: teacher.status },
      after: { status: newStatus }
    });

    soundFx.playClick();
    setActiveMenuId(null);
  };

  // ── HANDLERS: RESET PASSWORD ──
  const handleOpenResetPassword = (teacher: TeacherAccount) => {
    setResetPassTeacher(teacher);
    setResetPassMode('generate');
    // Generate a strong temporary password (e.g. THGZ@2026)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setGeneratedPass(`THGZ@${randomSuffix}`);
    setCustomNewPass('');
    setResetSuccessMsg('');
    setActiveMenuId(null);
    soundFx.playClick();
  };

  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassTeacher) return;

    const targetPass = resetPassMode === 'generate' ? generatedPass : customNewPass.trim();
    if (!targetPass) {
      alert('Vui lòng nhập mật khẩu mới!');
      return;
    }

    if (onResetPassword) {
      const res = onResetPassword(resetPassTeacher.teacherCode, targetPass);
      if (res && !res.success) {
        alert(res.message || 'Không thể đặt lại mật khẩu!');
        return;
      }
    }

    // Audit Log
    AuditLogService.log({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'RESET_TEACHER_PASSWORD',
      entityType: 'TeacherAccount',
      entityId: resetPassTeacher.id,
      after: { teacherCode: resetPassTeacher.teacherCode, resetMode: resetPassMode }
    });

    soundFx.playVictory();
    setResetSuccessMsg(`Đã đặt lại mật khẩu cho tài khoản ${resetPassTeacher.teacherCode} thành công!`);
    setTimeout(() => {
      setResetPassTeacher(null);
      setResetSuccessMsg('');
    }, 1800);
  };

  // ── HANDLERS: DELETE TEACHER ──
  const handleConfirmDelete = () => {
    if (!deleteTeacherTarget) return;

    if (onDeleteTeacherAccount) {
      onDeleteTeacherAccount(deleteTeacherTarget.id);
    }

    // Audit Log
    AuditLogService.log({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'DELETE_TEACHER_ACCOUNT',
      entityType: 'TeacherAccount',
      entityId: deleteTeacherTarget.id,
      before: { name: deleteTeacherTarget.name, code: deleteTeacherTarget.teacherCode }
    });

    soundFx.playIncorrect();
    setDeleteTeacherTarget(null);
    if (detailTeacher && detailTeacher.id === deleteTeacherTarget.id) {
      setDetailTeacher(null);
    }
  };

  // ── HANDLERS: TRACK SELECTION TOGGLE ──
  const toggleTrackSelection = (trackId: CurriculumTrack, isEdit: boolean) => {
    if (isEdit) {
      setEditTracks(prev => {
        if (prev.includes(trackId)) {
          if (prev.length === 1) return prev;
          return prev.filter(t => t !== trackId);
        }
        return [...prev, trackId];
      });
    } else {
      setNewTracks(prev => {
        if (prev.includes(trackId)) {
          if (prev.length === 1) return prev;
          return prev.filter(t => t !== trackId);
        }
        return [...prev, trackId];
      });
    }
    soundFx.playClick();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        color: '#0B2545',
        fontFamily: 'inherit'
      }}
    >
      {/* ── 1. BREADCRUMBS & HEADER ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: '#64748B'
          }}
        >
          <span style={{ cursor: 'pointer', color: '#0057B8', fontWeight: 600 }}>Trang chủ</span>
          <span>/</span>
          <span style={{ cursor: 'pointer', color: '#0057B8', fontWeight: 600 }}>Quản trị hệ thống</span>
          <span>/</span>
          <span style={{ color: '#0B2545', fontWeight: 700 }}>Quản lý giảng viên & nhân sự</span>
        </nav>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#0B2545',
                margin: 0,
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Users size={26} color="#0057B8" />
              <span>Quản lý giảng viên & nhân sự</span>
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#64748B' }}>
              Quản lý danh sách giảng viên đứng lớp, trợ giảng và phân quyền phân hệ đào tạo
            </p>
          </div>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0057B8 0%, #003F88 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 87, 184, 0.28)',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={16} />
              <span>Thêm Giảng Viên / Nhân Sự</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. STAT KPI CARDS (3 CARDS) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px'
        }}
      >
        {/* Card 1: Tổng cộng */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 2px 8px rgba(11, 37, 69, 0.04)'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#F4F8FD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0057B8'
            }}
          >
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>
              Tổng giảng viên & nhân sự
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0B2545', lineHeight: 1.2 }}>
              {stats.total}
            </div>
          </div>
        </div>

        {/* Card 2: Đang hoạt động */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 2px 8px rgba(11, 37, 69, 0.04)'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(22, 163, 74, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16a34a'
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>
              Đang hoạt động
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a', lineHeight: 1.2 }}>
              {stats.active}
            </div>
          </div>
        </div>

        {/* Card 3: Đã tạm khóa */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 2px 8px rgba(11, 37, 69, 0.04)'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: stats.locked > 0 ? 'rgba(239, 68, 68, 0.1)' : '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: stats.locked > 0 ? '#ef4444' : '#94a3b8'
            }}
          >
            <Lock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>
              Đã tạm khóa
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stats.locked > 0 ? '#ef4444' : '#64748B', lineHeight: 1.2 }}>
              {stats.locked}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. TOOLBAR: SEARCH & FILTERS ── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          padding: '14px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 6px rgba(11, 37, 69, 0.02)'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            placeholder="Tìm theo tên giảng viên, mã tài khoản, email, SĐT..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              color: '#0B2545',
              fontSize: '0.85rem',
              outline: 'none',
              transition: 'border-color 0.15s ease'
            }}
          />
        </div>

        {/* Filter Dropdowns */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={e => {
              setRoleFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#0B2545',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="teacher">Giảng viên đứng lớp</option>
            <option value="admin">Quản trị viên (Admin)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#0B2545',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="locked">Đã tạm khóa</option>
          </select>

          {/* Track Filter */}
          <select
            value={trackFilter}
            onChange={e => {
              setTrackFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#0B2545',
              outline: 'none',
              cursor: 'pointer',
              maxWidth: '220px'
            }}
          >
            <option value="all">Tất cả môn/phân hệ</option>
            {ALL_TRACK_OPTIONS.map(trk => (
              <option key={trk.id} value={trk.id}>
                {trk.short}
              </option>
            ))}
          </select>

          {/* Page Size Selector */}
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#0B2545',
              outline: 'none',
              cursor: 'pointer'
            }}
            title="Số dòng mỗi trang"
          >
            <option value={10}>10 dòng / trang</option>
            <option value={25}>25 dòng / trang</option>
            <option value={50}>50 dòng / trang</option>
          </select>
        </div>
      </div>

      {/* ── 4. DATA TABLE (DESKTOP & TABLET) / CARDS (MOBILE) ── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(11, 37, 69, 0.04)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.85rem',
              textAlign: 'left'
            }}
          >
            <thead>
              <tr
                style={{
                  background: '#F4F8FD',
                  borderBottom: '1px solid #E2E8F0',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                <th style={{ padding: '12px 16px' }}>Mã tài khoản</th>
                <th style={{ padding: '12px 16px' }}>Giảng viên</th>
                <th style={{ padding: '12px 16px' }}>Môn/phân hệ</th>
                <th style={{ padding: '12px 16px' }}>Vai trò</th>
                <th style={{ padding: '12px 16px' }}>Trạng thái</th>
                <th style={{ padding: '12px 16px' }}>Đăng nhập cuối</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTeachers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: '40px 16px',
                      textAlign: 'center',
                      color: '#64748B',
                      fontSize: '0.9rem'
                    }}
                  >
                    Không tìm thấy giảng viên hoặc nhân sự nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                paginatedTeachers.map(teacher => {
                  const isLocked = teacher.status === 'locked';
                  const tracks = teacher.assignedTracks || [];
                  const visibleTracks = tracks.slice(0, 2);
                  const hiddenTrackCount = Math.max(0, tracks.length - 2);

                  return (
                    <tr
                      key={teacher.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* 1. Mã tài khoản */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontWeight: 800,
                            color: '#0057B8',
                            background: '#F4F8FD',
                            border: '1px solid rgba(0, 87, 184, 0.2)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.8rem'
                          }}
                        >
                          {teacher.teacherCode}
                        </span>
                      </td>

                      {/* 2. Giảng viên (Name & Contact) */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: isLocked ? '#94A3B8' : 'linear-gradient(135deg, #0057B8 0%, #003F88 100%)',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              flexShrink: 0
                            }}
                          >
                            {teacher.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div
                              onClick={() => setDetailTeacher(teacher)}
                              style={{
                                fontWeight: 700,
                                color: '#0B2545',
                                cursor: 'pointer',
                                transition: 'color 0.15s'
                              }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#0057B8')}
                              onMouseLeave={e => (e.currentTarget.style.color = '#0B2545')}
                            >
                              {teacher.name}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>{teacher.email || teacher.phoneOrEmail || teacher.phone || 'Chưa cập nhật liên hệ'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 3. Môn/phân hệ (Truncated +N badge) */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                          {visibleTracks.map(trk => {
                            const opt = ALL_TRACK_OPTIONS.find(o => o.id === trk);
                            return (
                              <span
                                key={trk}
                                style={{
                                  fontSize: '0.72rem',
                                  background: '#F4F8FD',
                                  color: '#0057B8',
                                  border: '1px solid rgba(0, 87, 184, 0.2)',
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                  fontWeight: 600
                                }}
                              >
                                {opt ? opt.short : trk}
                              </span>
                            );
                          })}
                          {hiddenTrackCount > 0 && (
                            <span
                              onClick={() => setDetailTeacher(teacher)}
                              style={{
                                fontSize: '0.72rem',
                                background: '#E2E8F0',
                                color: '#475569',
                                padding: '2px 6px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                              title="Nhấn để xem toàn bộ môn phụ trách"
                            >
                              +{hiddenTrackCount}
                            </span>
                          )}
                          {tracks.length === 0 && (
                            <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontStyle: 'italic' }}>
                              Chưa phân công
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Vai trò */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        {teacher.role === 'admin' ? (
                          <span
                            style={{
                              fontSize: '0.74rem',
                              background: 'rgba(0, 63, 136, 0.1)',
                              color: '#003F88',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <ShieldCheck size={13} />
                            <span>Quản trị viên</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.74rem',
                              background: '#F4F8FD',
                              color: '#0057B8',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <UserCheck size={13} />
                            <span>Giảng viên đứng lớp</span>
                          </span>
                        )}
                      </td>

                      {/* 5. Trạng thái */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        {isLocked ? (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              background: '#FEF2F2',
                              color: '#EF4444',
                              border: '1px solid #FECACA',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Lock size={12} />
                            <span>Đã tạm khóa</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              background: '#F0FDF4',
                              color: '#16A34A',
                              border: '1px solid #BBF7D0',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <CheckCircle2 size={12} />
                            <span>Đang hoạt động</span>
                          </span>
                        )}
                      </td>

                      {/* 6. Đăng nhập cuối */}
                      <td style={{ padding: '14px 16px', fontSize: '0.78rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                        {teacher.lastLogin || 'Chưa đăng nhập'}
                      </td>

                      {/* 7. Hành động (View Detail + 3-Dots Menu) */}
                      <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
                          <button
                            type="button"
                            onClick={() => setDetailTeacher(teacher)}
                            style={{
                              background: '#F4F8FD',
                              border: '1px solid rgba(0, 87, 184, 0.2)',
                              color: '#0057B8',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Xem chi tiết giảng viên"
                          >
                            <Eye size={13} />
                            <span>Chi tiết</span>
                          </button>

                          {/* 3-Dots Button */}
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(activeMenuId === teacher.id ? null : teacher.id)}
                            style={{
                              background: activeMenuId === teacher.id ? '#E2E8F0' : '#F8FAFC',
                              border: '1px solid #CBD5E1',
                              color: '#475569',
                              padding: '5px 7px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Thao tác khác"
                          >
                            <MoreVertical size={14} />
                          </button>

                          {/* 3-Dots Dropdown Menu */}
                          {activeMenuId === teacher.id && (
                            <div
                              style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                marginTop: '4px',
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '10px',
                                boxShadow: '0 10px 25px -5px rgba(11, 37, 69, 0.15)',
                                zIndex: 30,
                                minWidth: '180px',
                                padding: '6px 0',
                                display: 'flex',
                                flexDirection: 'column'
                              }}
                            >
                              {/* Option: Phân quyền RBAC (Super Admin Only) */}
                              {isSuperAdmin && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPermissionTarget({
                                      id: teacher.id,
                                      name: teacher.name,
                                      role: teacher.role,
                                      teacherCode: teacher.teacherCode,
                                      createdAt: teacher.createdAt,
                                      permissions: []
                                    });
                                    setActiveMenuId(null);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 14px',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: '#0057B8',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                  }}
                                  onMouseEnter={e => (e.currentTarget.style.background = '#F4F8FD')}
                                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                >
                                  <Shield size={14} />
                                  <span>Phân quyền RBAC</span>
                                </button>
                              )}

                              {/* Option: Chỉnh sửa thông tin */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(teacher)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 14px',
                                  background: 'none',
                                  border: 'none',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  color: '#0B2545',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                              >
                                <Edit3 size={14} />
                                <span>Chỉnh sửa thông tin</span>
                              </button>

                              {/* Option: Đặt lại mật khẩu */}
                              <button
                                type="button"
                                onClick={() => handleOpenResetPassword(teacher)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 14px',
                                  background: 'none',
                                  border: 'none',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  color: '#0B2545',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                              >
                                <KeyRound size={14} />
                                <span>Đặt lại mật khẩu</span>
                              </button>

                              {/* Option: Khóa / Mở khóa */}
                              <button
                                type="button"
                                onClick={() => handleToggleLockStatus(teacher)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 14px',
                                  background: 'none',
                                  border: 'none',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  color: isLocked ? '#16A34A' : '#D97706',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = isLocked ? '#F0FDF4' : '#FFFBEB')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                              >
                                {isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                                <span>{isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}</span>
                              </button>

                              <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />

                              {/* Option: Xóa tài khoản (Dangerous - RED) */}
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteTeacherTarget(teacher);
                                  setActiveMenuId(null);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 14px',
                                  background: 'none',
                                  border: 'none',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  color: '#EF4444',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                              >
                                <Trash2 size={14} />
                                <span>Xóa tài khoản</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── 5. PAGINATION CONTROLS ── */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid #E2E8F0',
            background: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
            Hiển thị{' '}
            <strong style={{ color: '#0B2545' }}>
              {filteredTeachers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </strong>{' '}
            -{' '}
            <strong style={{ color: '#0B2545' }}>
              {Math.min(currentPage * pageSize, filteredTeachers.length)}
            </strong>{' '}
            trên tổng số <strong style={{ color: '#0B2545' }}>{filteredTeachers.length}</strong> giảng viên
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                background: currentPage <= 1 ? '#F8FAFC' : '#FFFFFF',
                color: currentPage <= 1 ? '#94A3B8' : '#0B2545',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ChevronLeft size={14} />
              <span>Trước</span>
            </button>

            <span style={{ fontSize: '0.8rem', color: '#0B2545', fontWeight: 700, padding: '0 8px' }}>
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                background: currentPage >= totalPages ? '#F8FAFC' : '#FFFFFF',
                color: currentPage >= totalPages ? '#94A3B8' : '#0B2545',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Sau</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 6. DETAIL MODAL (REQUIREMENT 6) ── */}
      {detailTeacher && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 37, 69, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 24px 48px -12px rgba(11, 37, 69, 0.3)',
              border: '1px solid #E2E8F0'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #E2E8F0',
                background: '#F4F8FD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0057B8 0%, #003F88 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    fontWeight: 800
                  }}
                >
                  {detailTeacher.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0B2545', margin: 0 }}>
                    {detailTeacher.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#0057B8',
                        background: '#FFFFFF',
                        border: '1px solid rgba(0, 87, 184, 0.25)',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      {detailTeacher.teacherCode}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Tạo ngày: {detailTeacher.createdAt || 'Hệ thống'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailTeacher(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Contact Information */}
              <div>
                <h4 style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 800, margin: '0 0 8px' }}>
                  Thông tin liên hệ & Trạng thái
                </h4>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '12px',
                    background: '#F8FAFC',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Email / SĐT:</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0B2545', marginTop: '2px' }}>
                      {detailTeacher.email || detailTeacher.phoneOrEmail || detailTeacher.phone || 'Chưa cập nhật'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Trạng thái tài khoản:</div>
                    <div style={{ marginTop: '2px' }}>
                      {detailTeacher.status === 'locked' ? (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#EF4444' }}>
                          🔒 Đã tạm khóa
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16A34A' }}>
                          ✓ Đang hoạt động
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Vai trò hệ thống:</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0057B8', marginTop: '2px' }}>
                      {detailTeacher.role === 'admin' ? 'Quản trị viên (Admin)' : 'Giảng viên đứng lớp'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Đăng nhập cuối cùng:</div>
                    <div style={{ fontSize: '0.85rem', color: '#0B2545', marginTop: '2px' }}>
                      {detailTeacher.lastLogin || 'Chưa ghi nhận'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Tracks */}
              <div>
                <h4 style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 800, margin: '0 0 8px' }}>
                  Phân công môn/phân hệ giảng dạy ({detailTeacher.assignedTracks?.length || 0} môn)
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(detailTeacher.assignedTracks || []).map(trk => (
                    <span
                      key={trk}
                      style={{
                        fontSize: '0.78rem',
                        background: '#F4F8FD',
                        color: '#0057B8',
                        border: '1px solid rgba(0, 87, 184, 0.25)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: 600
                      }}
                    >
                      ✓ {TRACK_LABELS[trk] || trk}
                    </span>
                  ))}
                  {(!detailTeacher.assignedTracks || detailTeacher.assignedTracks.length === 0) && (
                    <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontStyle: 'italic' }}>
                      Chưa được phân công môn học nào.
                    </span>
                  )}
                </div>
              </div>

              {/* Activity / Audit Log for this teacher */}
              <div>
                <h4 style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 800, margin: '0 0 8px' }}>
                  Lịch sử hoạt động & Kiểm toán (Audit Trail)
                </h4>
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    maxHeight: '140px',
                    overflowY: 'auto',
                    fontSize: '0.78rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  {AuditLogService.getLogs()
                    .filter(l => l.entityId === detailTeacher.id || l.entityId === detailTeacher.teacherCode)
                    .slice(0, 5)
                    .map(log => (
                      <div
                        key={log.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid #E2E8F0',
                          paddingBottom: '4px'
                        }}
                      >
                        <div>
                          <strong style={{ color: '#0B2545' }}>{log.action}</strong>
                          <span style={{ color: '#64748B', marginLeft: '6px' }}>bởi {log.actorName || log.actorRole}</span>
                        </div>
                        <span style={{ color: '#94A3B8', fontSize: '0.72rem' }}>
                          {new Date(log.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    ))}
                  {AuditLogService.getLogs().filter(
                    l => l.entityId === detailTeacher.id || l.entityId === detailTeacher.teacherCode
                  ).length === 0 && (
                    <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>
                      Chưa có ghi nhận kiểm toán đặc biệt cho tài khoản này.
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '1px solid #E2E8F0',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}
              >
                <button
                  type="button"
                  onClick={() => handleToggleLockStatus(detailTeacher)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: detailTeacher.status === 'locked' ? '1px solid #16A34A' : '1px solid #CBD5E1',
                    background: detailTeacher.status === 'locked' ? '#F0FDF4' : '#FFFFFF',
                    color: detailTeacher.status === 'locked' ? '#16A34A' : '#475569',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {detailTeacher.status === 'locked' ? <Unlock size={14} /> : <Lock size={14} />}
                  <span>{detailTeacher.status === 'locked' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}</span>
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const t = detailTeacher;
                      setDetailTeacher(null);
                      handleOpenResetPassword(t);
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 87, 184, 0.3)',
                      background: '#F4F8FD',
                      color: '#0057B8',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <KeyRound size={14} />
                    <span>Đặt lại mật khẩu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const t = detailTeacher;
                      setDetailTeacher(null);
                      handleOpenEdit(t);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #0057B8 0%, #003F88 100%)',
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Edit3 size={14} />
                    <span>Chỉnh sửa</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. ADD TEACHER MODAL ── */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 37, 69, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 24px 48px -12px rgba(11, 37, 69, 0.3)',
              border: '1.5px solid #0057B8'
            }}
          >
            <div
              style={{
                padding: '16px 22px',
                borderBottom: '1px solid #E2E8F0',
                background: '#F4F8FD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#0057B8',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Plus size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0B2545', margin: 0 }}>
                    Thêm Giảng Viên / Nhân Sự Mới
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                    Tạo tài khoản và phân công môn học phụ trách cho giảng viên
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAddTeacher} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0B2545', marginBottom: '6px' }}>
                    Họ và Tên Giảng Viên <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Thầy Đình Huy"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      color: '#0B2545'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0B2545', marginBottom: '6px' }}>
                    Mã Tài Khoản Đăng Nhập <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: GV05"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: '#0057B8',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0B2545', marginBottom: '6px' }}>
                    Email Liên Hệ
                  </label>
                  <input
                    type="email"
                    placeholder="email@tinhocgenz.io.vn"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      color: '#0B2545'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0B2545', marginBottom: '6px' }}>
                    Số Điện Thoại Liên Hệ
                  </label>
                  <input
                    type="tel"
                    placeholder="0912 345 678"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      color: '#0B2545'
                    }}
                  />
                </div>
              </div>

              {/* Track Assignment */}
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0B2545' }}>
                    PHÂN CÔNG MÔN/PHÂN HỆ GIẢNG DẠY ({newTracks.length} / {ALL_TRACK_OPTIONS.length} môn)
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setNewTracks(ALL_TRACK_OPTIONS.map(o => o.id))}
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        borderRadius: '4px',
                        border: '1px solid rgba(0, 87, 184, 0.3)',
                        background: '#F4F8FD',
                        color: '#0057B8',
                        cursor: 'pointer'
                      }}
                    >
                      Chọn tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTracks(['office-fast-3in1'])}
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        color: '#64748B',
                        cursor: 'pointer'
                      }}
                    >
                      Mặc định
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                  {ALL_TRACK_OPTIONS.map(trk => {
                    const isChecked = newTracks.includes(trk.id);
                    return (
                      <div
                        key={trk.id}
                        onClick={() => toggleTrackSelection(trk.id, false)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: isChecked ? '#F4F8FD' : '#FFFFFF',
                          border: isChecked ? '1.5px solid #0057B8' : '1px solid #CBD5E1',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          userSelect: 'none'
                        }}
                      >
                        {isChecked ? <CheckSquare size={16} color="#0057B8" /> : <Square size={16} color="#94A3B8" />}
                        <span style={{ fontSize: '0.78rem', fontWeight: isChecked ? 700 : 500, color: isChecked ? '#0057B8' : '#475569' }}>
                          {trk.short}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Security Hint */}
              <div style={{ fontSize: '0.75rem', color: '#64748B', background: '#F4F8FD', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0, 87, 184, 0.15)' }}>
                🛡️ <strong>Bảo mật:</strong> Hệ thống sẽ tự động khởi tạo mật khẩu băm mã hóa an toàn và yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên. Không lưu trữ mật khẩu ở dạng văn bản rõ.
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#64748B',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0057B8 0%, #003F88 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 87, 184, 0.25)'
                  }}
                >
                  Lưu & Cấp Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 8. EDIT TEACHER MODAL ── */}
      {editingTeacher && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 37, 69, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 24px 48px -12px rgba(11, 37, 69, 0.3)',
              border: '1px solid #E2E8F0'
            }}
          >
            <div
              style={{
                padding: '16px 22px',
                borderBottom: '1px solid #E2E8F0',
                background: '#F4F8FD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#0057B8',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0B2545', margin: 0 }}>
                    Chỉnh Sửa Thông Tin Giảng Viên
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                    Cập nhật thông tin giảng viên và điều chỉnh phân công môn học
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditTeacher} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0B2545', marginBottom: '6px' }}>
                    Họ và Tên Giảng Viên <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      color: '#0B2545'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0B2545', marginBottom: '6px' }}>
                    Mã Tài Khoản <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editCode}
                    onChange={e => setEditCode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: '#0057B8',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0B2545', marginBottom: '6px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      color: '#0B2545'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0B2545', marginBottom: '6px' }}>
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      color: '#0B2545'
                    }}
                  />
                </div>
              </div>

              {/* Track Assignment */}
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0B2545' }}>
                    PHÂN CÔNG MÔN/PHÂN HỆ GIẢNG DẠY ({editTracks.length} môn)
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setEditTracks(ALL_TRACK_OPTIONS.map(o => o.id))}
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        borderRadius: '4px',
                        border: '1px solid rgba(0, 87, 184, 0.3)',
                        background: '#F4F8FD',
                        color: '#0057B8',
                        cursor: 'pointer'
                      }}
                    >
                      Chọn tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditTracks(['office-fast-3in1'])}
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        color: '#64748B',
                        cursor: 'pointer'
                      }}
                    >
                      Mặc định
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                  {ALL_TRACK_OPTIONS.map(trk => {
                    const isChecked = editTracks.includes(trk.id);
                    return (
                      <div
                        key={trk.id}
                        onClick={() => toggleTrackSelection(trk.id, true)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: isChecked ? '#F4F8FD' : '#FFFFFF',
                          border: isChecked ? '1.5px solid #0057B8' : '1px solid #CBD5E1',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          userSelect: 'none'
                        }}
                      >
                        {isChecked ? <CheckSquare size={16} color="#0057B8" /> : <Square size={16} color="#94A3B8" />}
                        <span style={{ fontSize: '0.78rem', fontWeight: isChecked ? 700 : 500, color: isChecked ? '#0057B8' : '#475569' }}>
                          {trk.short}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#64748B',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0057B8 0%, #003F88 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cập Nhật Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 9. SEPARATE RESET PASSWORD MODAL ── */}
      {resetPassTeacher && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 37, 69, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 24px 48px -12px rgba(11, 37, 69, 0.3)',
              border: '1.5px solid #0057B8'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(0, 87, 184, 0.1)',
                  color: '#0057B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <KeyRound size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0B2545', margin: 0 }}>
                  Đặt Lại Mật Khẩu An Toàn
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                  Tài khoản: <strong>{resetPassTeacher.name}</strong> ({resetPassTeacher.teacherCode})
                </p>
              </div>
            </div>

            {resetSuccessMsg ? (
              <div
                style={{
                  padding: '16px',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '10px',
                  color: '#16A34A',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  textAlign: 'center'
                }}
              >
                ✓ {resetSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleConfirmResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      color: '#0B2545',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="resetMode"
                      checked={resetPassMode === 'generate'}
                      onChange={() => setResetPassMode('generate')}
                    />
                    <span>Khởi tạo mật khẩu ngẫu nhiên an toàn (Được khuyến nghị)</span>
                  </label>

                  {resetPassMode === 'generate' && (
                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#F4F8FD',
                        borderRadius: '8px',
                        border: '1px solid rgba(0, 87, 184, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Mật khẩu mới:</span>
                      <code style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0057B8' }}>
                        {generatedPass}
                      </code>
                    </div>
                  )}

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      color: '#0B2545',
                      cursor: 'pointer',
                      marginTop: '4px'
                    }}
                  >
                    <input
                      type="radio"
                      name="resetMode"
                      checked={resetPassMode === 'custom'}
                      onChange={() => setResetPassMode('custom')}
                    />
                    <span>Nhập mật khẩu mới tùy chọn</span>
                  </label>

                  {resetPassMode === 'custom' && (
                    <input
                      type="text"
                      required
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                      value={customNewPass}
                      onChange={e => setCustomNewPass(e.target.value)}
                      style={{
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.85rem',
                        outline: 'none',
                        color: '#0B2545'
                      }}
                    />
                  )}
                </div>

                <div style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.4 }}>
                  ⚠️ Hành động này sẽ ghi nhận vào <strong>Audit Log</strong> của hệ thống. Giảng viên sẽ phải đổi mật khẩu ở lần đăng nhập tiếp theo.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setResetPassTeacher(null)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      color: '#64748B',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #0057B8 0%, #003F88 100%)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Xác Nhận Đặt Lại
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── 10. DELETE CONFIRMATION MODAL (DANGER - RED) ── */}
      {deleteTeacherTarget && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 37, 69, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 24px 48px -12px rgba(11, 37, 69, 0.3)',
              border: '1.5px solid #EF4444'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#FEF2F2',
                  color: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#EF4444', margin: 0 }}>
                  Xác Nhận Xóa Tài Khoản
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                  Hành động nguy hiểm không thể hoàn tác
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#0B2545', lineHeight: 1.5, margin: '0 0 16px' }}>
              Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản giảng viên <strong>{deleteTeacherTarget.name}</strong> (Mã tài khoản: <code>{deleteTeacherTarget.teacherCode}</code>)?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setDeleteTeacherTarget(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#64748B',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                }}
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 11. RBAC PERMISSION MODAL ── */}
      {permissionTarget && (
        <PermissionManagerModal
          isOpen={true}
          onClose={() => setPermissionTarget(null)}
          targetUser={permissionTarget}
          currentUser={currentUser}
          onSavePermissions={(_userId, _perms) => {
            setPermissionTarget(null);
            soundFx.playVictory();
          }}
        />
      )}


      {/* ── 12. MASCOT AI CHATBOT INTEGRATION ── */}
      <AdminAssistantMascot
        currentUser={currentUser}
        teacherAccounts={teacherAccounts}
        onOpenAddTeacher={handleOpenAddModal}
        onFilterTeachers={(q) => setSearchQuery(q)}
        onFilterLocked={() => setStatusFilter('locked')}
      />
    </div>
  );
};
