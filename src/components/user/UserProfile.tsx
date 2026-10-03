import React, { useEffect, useState, useRef } from 'react';
import { X, ArrowLeft, User, BookOpen, Clock, Settings, ShieldCheck } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { ProfileHeader } from './ProfileHeader';
import { UserStats } from './UserStats';
import { AIInsight } from './AIInsight';
import { ProfileAccordion } from './ProfileAccordion';
import { CourseProgressItem, DigitalCertificateSummary } from './LearningProgress';
import { TeachingClassItem } from './TeachingStats';
import { TimelineEventItem } from './ActivityTimeline';

export interface UserUnifiedProfile {
  id: string;
  name: string;
  code?: string;
  role: 'STUDENT' | 'TEACHER' | 'STAFF' | 'ADMIN' | string;
  status: 'active' | 'locked';
  avatar?: string;
  departmentOrClass?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  createdAt?: string;
  permissions?: string[];
  studentData?: {
    totalCourses?: number;
    overallProgress?: number;
    totalTests?: number;
    totalCertificates?: number;
    courses?: CourseProgressItem[];
    certificates?: DigitalCertificateSummary[];
  };
  teacherData?: {
    totalSubjects?: number;
    totalStudents?: number;
    averageRating?: number;
    totalHours?: number;
    totalClasses?: number;
    classes?: TeachingClassItem[];
  };
  timelineEvents?: TimelineEventItem[];
}

export interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserUnifiedProfile | null;
  onResetPassword?: (userId: string) => void;
  onToggleLockAccount?: (userId: string) => void;
  onSendMessage?: (userId: string) => void;
  onEditProfile?: (user: UserUnifiedProfile) => void;
  onUploadAvatar?: (file: File) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  isOpen,
  onClose,
  user,
  onResetPassword,
  onToggleLockAccount,
  onSendMessage,
  onEditProfile,
  onUploadAvatar
}) => {
  const [activeMobileTab, setActiveMobileTab] = useState<'personal' | 'learning_teaching' | 'activity' | 'settings'>('personal');
  const contentContainerRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer/fullscreen is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const normalizedRole = (user.role || 'STUDENT').toUpperCase();

  const handleMobileNavClick = (tab: 'personal' | 'learning_teaching' | 'activity' | 'settings') => {
    soundFx.playClick();
    setActiveMobileTab(tab);
    if (contentContainerRef.current) {
      contentContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'stretch'
      }}
    >
      {/* ── BACKDROP OVERLAY ── */}
      <div
        onClick={() => { soundFx.playClick(); onClose(); }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(11, 37, 69, 0.45)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          transition: 'opacity 0.2s ease'
        }}
      />

      {/* ── PROFILE PANEL / FULLSCREEN MOBILE ── */}
      <div
        className="user-profile-engine-panel"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '760px',
          height: '100%',
          background: '#F4F8FD',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(11, 37, 69, 0.16)',
          zIndex: 1051,
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Top Navbar */}
        <div style={{
          padding: '16px 24px',
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => { soundFx.playClick(); onClose(); }}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#0B2545',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Quay lại danh sách"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0B2545' }}>
                Hồ Sơ Định Danh Người Dùng
              </h3>
              <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={13} color="#16A34A" />
                <span>✓ Hồ sơ đã xác thực • Dữ liệu được bảo vệ • Lịch sử được ghi nhận</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { soundFx.playClick(); onClose(); }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: 'none',
              background: '#F1F5F9',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Đóng (ESC)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div
          ref={contentContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* 1. Header Profile */}
          <ProfileHeader
            id={user.id}
            name={user.name}
            code={user.code}
            role={user.role}
            status={user.status}
            avatar={user.avatar}
            departmentOrClass={user.departmentOrClass}
            onSendMessage={onSendMessage ? () => onSendMessage(user.id) : undefined}
            onEdit={onEditProfile ? () => onEditProfile(user) : undefined}
            onAdd={() => soundFx.playClick()}
            onResetPassword={onResetPassword ? () => onResetPassword(user.id) : undefined}
            onToggleLock={onToggleLockAccount ? () => onToggleLockAccount(user.id) : undefined}
            onUploadAvatar={onUploadAvatar}
          />

          {/* 2. User Stats Summary */}
          <UserStats
            role={user.role}
            data={{
              totalCourses: user.studentData?.totalCourses,
              overallProgress: user.studentData?.overallProgress,
              totalTests: user.studentData?.totalTests,
              totalCertificates: user.studentData?.totalCertificates,
              totalSubjects: user.teacherData?.totalSubjects,
              totalStudents: user.teacherData?.totalStudents,
              averageRating: user.teacherData?.averageRating,
              totalHours: user.teacherData?.totalHours
            }}
          />

          {/* 3. AI Assistant Insight Bar */}
          <AIInsight
            role={user.role}
            userName={user.name}
          />

          {/* 4. 5-Section Accordion Profile */}
          <ProfileAccordion
            role={user.role}
            personalDetails={{
              fullName: user.name,
              email: user.email || 'user@tinhocgenz.edu.vn',
              phone: user.phone || '0988 123 456',
              birthDate: user.birthDate || '2004',
              address: user.address || 'Hà Nội (Toàn quốc)',
              createdAt: user.createdAt || '01/09/2026',
              departmentOrSchool: user.departmentOrClass
            }}
            isAccountLocked={user.status === 'locked'}
            studentData={user.studentData}
            teacherData={user.teacherData}
            timelineEvents={user.timelineEvents}
            onResetPassword={onResetPassword ? () => onResetPassword(user.id) : undefined}
            onToggleLockAccount={onToggleLockAccount ? () => onToggleLockAccount(user.id) : undefined}
            defaultExpandedSection={activeMobileTab}
          />
        </div>

        {/* ── MOBILE BOTTOM ACTION BAR (4 Core Buttons) ── */}
        <div
          className="user-profile-mobile-nav"
          style={{
            background: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            padding: '8px 16px',
            display: 'none', // Controlled via CSS media query
            justifyContent: 'space-around',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          <button
            type="button"
            onClick={() => handleMobileNavClick('personal')}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: activeMobileTab === 'personal' ? '#0057B8' : '#64748B',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <User size={18} />
            <span>Chi tiết</span>
          </button>

          <button
            type="button"
            onClick={() => handleMobileNavClick('learning_teaching')}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: activeMobileTab === 'learning_teaching' ? '#0057B8' : '#64748B',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <BookOpen size={18} />
            <span>{normalizedRole === 'STUDENT' ? 'Học tập' : 'Giảng dạy'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleMobileNavClick('activity')}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: activeMobileTab === 'activity' ? '#0057B8' : '#64748B',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Clock size={18} />
            <span>Hoạt động</span>
          </button>

          <button
            type="button"
            onClick={() => handleMobileNavClick('settings')}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: activeMobileTab === 'settings' ? '#0057B8' : '#64748B',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Settings size={18} />
            <span>Cài đặt</span>
          </button>
        </div>

        {/* Media Query Styles for Mobile Drawer to Full Screen */}
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @media (max-width: 768px) {
            .user-profile-engine-panel {
              max-width: 100% !important;
            }
            .user-profile-mobile-nav {
              display: flex !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

