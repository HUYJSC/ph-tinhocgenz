import React, { useState } from 'react';
import { Quiz, QuizAttempt } from '../../types/quiz';
import { UserProfile, StudentAccount, TeacherAccount, CurriculumTrack } from '../../types/auth';
import { Assignment, AssignmentSubmission, TeacherNotification, GoogleDriveConfig } from '../../types/assignment';
import { ClassScheduleItem } from '../../types/schedule';
import { AdminPortal, AdminPortalSubTab } from './AdminPortal';
import {
  Shield, Users, UserCheck, Calendar, CheckSquare, BookOpen,
  FileSpreadsheet, AlertTriangle, Video, Globe, LogOut, ArrowLeft,
  ExternalLink, Key, Menu, X, ChevronRight,
  Server, BarChart3, Bot, Eye, EyeOff
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface MenuItem {
  id: AdminPortalSubTab;
  label: string;
  icon: any;
  badge?: string | number | null;
}

interface MenuSection {
  group: string;
  items: MenuItem[];
}

interface StandaloneAdminAppProps {
  currentUser: UserProfile;
  isSessionActive: boolean;
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  studentAccounts: StudentAccount[];
  teacherAccounts?: TeacherAccount[];
  schedules?: ClassScheduleItem[];
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
  onUpdateTeacherAccount?: (updatedAccount: TeacherAccount) => void;
  onDeleteTeacherAccount?: (id: string) => void;
  onCreateSchedule?: (data: Omit<ClassScheduleItem, 'id' | 'createdAt'>) => void;
  onUpdateSchedule?: (updated: ClassScheduleItem) => void;
  onDeleteSchedule?: (id: string) => void;
  onLoginAsAdmin: (passwordOrPin: string, staffName?: string) => { success: boolean; message?: string };
  onLogout: () => void;
  onBackToStudentPortal: () => void;
}

export const StandaloneAdminApp: React.FC<StandaloneAdminAppProps> = (props) => {
  const {
    currentUser,
    isSessionActive,
    studentAccounts,
    teacherAccounts = [],
    onLoginAsAdmin,
    onLogout,
    onBackToStudentPortal
  } = props;

  const isAdmin = isSessionActive && currentUser.role === 'admin';

  // Admin Login State
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<AdminPortalSubTab>('overview');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = onLoginAsAdmin(adminPassword, adminUsername);
    if (!res.success) {
      setLoginError(res.message || 'Mật khẩu quản trị không chính xác.');
      soundFx.playIncorrect();
    } else {
      soundFx.playCorrect();
    }
  };

  // ── 1. NẾU CHƯA ĐĂNG NHẬP ADMIN: RENDER GIAO DIỆN LOGIN BIỆT LẬP ──
  if (!isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}>
        {/* Top Navbar */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 50
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo-dark.png" alt="PH Digital Education" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              CỔNG QUẢN TRỊ /ADMIN
            </span>
          </div>

          <button
            onClick={onBackToStudentPortal}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#94a3b8',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <ArrowLeft size={14} />
            <span>Về Website Học Viên</span>
          </button>
        </div>

        {/* Dedicated Admin Login Card */}
        <div style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(30, 41, 59, 0.95)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '36px 32px',
          marginTop: '60px'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(217, 119, 6, 0.3)',
              marginBottom: '16px'
            }}>
              <Shield size={28} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px', color: '#ffffff', letterSpacing: '-0.02em' }}>
              CỔNG QUẢN TRỊ HỆ THỐNG
            </h1>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0 }}>
              PH Digital Education • Ban Giám Hiệu & Quản Trị Viên
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Tài khoản Quản trị / Mã cán bộ
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Nhập mã cán bộ hoặc tài khoản quản trị..."
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(15, 23, 42, 0.6)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Mật khẩu xác thực Quản trị
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Nhập mã PIN hoặc mật khẩu admin..."
                  required
                  style={{
                    width: '100%',
                    padding: '11px 42px 11px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(15, 23, 42, 0.6)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div style={{ padding: '10px 12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', fontSize: '0.82rem' }}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px'
              }}
            >
              <Key size={16} />
              <span>Đăng Nhập Cổng Quản Trị</span>
            </button>
          </form>
        </div>

        {/* Footer Notice */}
        <div style={{ marginTop: '24px', fontSize: '0.74rem', color: '#64748b', textAlign: 'center' }}>
          PH DIGITAL EDUCATION LMS • BẢN QUYỀN HỆ THỐNG KHẢO THÍ CHÍNH THỨC 2026
        </div>
      </div>
    );
  }

  // ── 2. NẾU ĐÃ LÀ SUPER ADMIN: RENDER TOÀN BỘ GIAO DIỆN QUẢN TRỊ RIÊNG BIỆT ──
  const menuSections: MenuSection[] = [
    {
      group: 'QUẢN TRỊ ĐÀO TẠO',
      items: [
        { id: 'overview', label: 'Tổng Quan Hệ Thống', icon: BarChart3, badge: null },
        { id: 'student_directory', label: 'Quản Lý Học Viên', icon: Users, badge: studentAccounts.length },
        { id: 'teachers', label: 'Quản Lý Giảng Viên', icon: UserCheck, badge: teacherAccounts.length },
        { id: 'schedules', label: 'Lịch Dạy & Phòng Học', icon: Calendar, badge: (props.schedules || []).length },
        { id: 'grading_assignments', label: 'Khảo Thí & Chấm Điểm', icon: CheckSquare, badge: (props.assignments || []).length },
      ]
    },
    {
      group: 'KHẢO THÍ & NỘI DUNG',
      items: [
        { id: 'exams', label: 'Kho Đề Thi Chuẩn', icon: BookOpen, badge: props.quizzes.length },
        { id: 'question_bank', label: 'Ngân Hàng Câu Hỏi', icon: FileSpreadsheet, badge: null },
        { id: 'early_warning', label: 'Cảnh Báo Học Vụ Sớm', icon: AlertTriangle, badge: '🚨' },
        { id: 'zalo_notifications', label: 'Tổng Đài Zalo AI', icon: Bot, badge: 'AI' },
        { id: 'meet_hub', label: 'Phòng Google Meet', icon: Video, badge: '10' },
        { id: 'seo_center', label: 'Cấu Hình SEO & Web', icon: Globe, badge: null },
      ]
    }
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg-primary, #f8fafc)',
      color: 'var(--text-primary, #0f172a)',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* ── LEFT STANDALONE ADMIN SIDEBAR ── */}
      <aside style={{
        width: sidebarOpen ? '260px' : '72px',
        minWidth: sidebarOpen ? '260px' : '72px',
        background: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid #1e293b',
        transition: 'width 0.2s ease, min-width 0.2s ease',
        zIndex: 100
      }}>
        {/* Top Branding */}
        <div>
          <div style={{
            padding: '18px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b'
          }}>
            {sidebarOpen ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/logo-dark.png" alt="PH Digital Education" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.04em' }}>ADMIN PORTAL</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Phân Hệ Quản Trị</div>
                </div>
              </div>
            ) : (
              <div style={{ width: '100%', textAlign: 'center' }}>
                <Shield size={24} color="#f59e0b" />
              </div>
            )}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title={sidebarOpen ? 'Thu gọn menu' : 'Mở rộng menu'}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '12px 8px' }}>
            {menuSections.map((sec, idx) => (
              <div key={idx} style={{ marginBottom: '16px' }}>
                {sidebarOpen && (
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', padding: '6px 12px', letterSpacing: '0.05em' }}>
                    {sec.group}
                  </div>
                )}
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSubTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSubTab(item.id as any);
                        soundFx.playClick();
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: sidebarOpen ? 'space-between' : 'center',
                        padding: '10px 12px',
                        marginBottom: '4px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isActive ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : 'transparent',
                        color: isActive ? '#ffffff' : '#94a3b8',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      title={item.label}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={18} color={isActive ? '#ffffff' : '#64748b'} />
                        {sidebarOpen && <span>{item.label}</span>}
                      </div>
                      {sidebarOpen && item.badge && (
                        <span style={{
                          background: isActive ? 'rgba(255,255,255,0.25)' : '#1e293b',
                          color: isActive ? '#ffffff' : '#f59e0b',
                          padding: '1px 6px',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* External Link to Django Admin */}
            <a
              href="https://tinhocgenz.io.vn/admin"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarOpen ? 'space-between' : 'center',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                color: '#38bdf8',
                fontSize: '0.82rem',
                fontWeight: 600,
                textDecoration: 'none',
                boxSizing: 'border-box'
              }}
              title="Mở Cổng Django Admin"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Server size={18} color="#38bdf8" />
                {sidebarOpen && <span>Django Admin Live</span>}
              </div>
              {sidebarOpen && <ExternalLink size={14} />}
            </a>
          </nav>
        </div>

        {/* Sidebar Footer: Current User & Quick Switcher */}
        <div style={{ padding: '14px', borderTop: '1px solid #1e293b' }}>
          {sidebarOpen ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>
                  H
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {currentUser.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 600 }}>
                    Super Admin
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={onBackToStudentPortal}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#94a3b8',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <ArrowLeft size={13} />
                  <span>Về Website Học Viên</span>
                </button>

                <button
                  onClick={onLogout}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#f87171',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <LogOut size={13} />
                  <span>Đăng Xuất Admin</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onLogout}
              style={{ width: '100%', padding: '8px', background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* ── MAIN ADMIN VIEWPORT ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        {/* Topbar */}
        <header style={{
          height: '56px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card, #ffffff)',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
            <span style={{ color: 'var(--text-muted, #64748b)' }}>Cổng Quản Trị</span>
            <ChevronRight size={14} color="#94a3b8" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
              {(menuSections.flatMap((s: MenuSection) => s.items).find((i: MenuItem) => i.id === activeSubTab)?.label) || 'Bảng Điều Khiển'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Live System Indicator */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#047857',
              fontSize: '0.74rem',
              fontWeight: 700
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <span>Production Live</span>
            </div>

            {/* Quick Link to Student Website */}
            <button
              onClick={onBackToStudentPortal}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color, #e2e8f0)',
                color: 'var(--text-secondary, #475569)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>Xem Website Học Viên</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </header>

        {/* Admin Content Area */}
        <main style={{ padding: '24px', maxWidth: '1400px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <AdminPortal
            {...props}
            initialSubTab={activeSubTab}
            hideInternalNav={true}
            onSubTabChange={(tab) => setActiveSubTab(tab)}
          />
        </main>
      </div>
    </div>
  );
};
