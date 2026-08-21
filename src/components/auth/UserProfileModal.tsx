import React from 'react';
import { UserProfile, TRACK_LABELS, CurriculumTrack } from '../../types/auth';
import {
  Shield, Phone, Mail, BookOpen, KeyRound,
  LogOut, X, School, CheckCircle2, ChevronRight
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onOpenChangePassword: () => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenChangePassword,
  onLogout
}) => {
  if (!isOpen) return null;

  const isStaff = currentUser.role === 'admin' || currentUser.role === 'teacher';
  const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

  const userTracks: CurriculumTrack[] = isStaff
    ? (currentUser.assignedTracks || currentUser.enrolledTracks || ['office-fast-3in1'])
    : (currentUser.enrolledTracks || (currentUser.programTrack ? [currentUser.programTrack] : ['office-fast-3in1']));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--bg-overlay)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="card animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-card)',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn btn-ghost"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '6px',
            borderRadius: '50%'
          }}
        >
          <X size={18} />
        </button>

        {/* Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: isStaff
              ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
              : 'linear-gradient(135deg, #4f6ef7 0%, #3b55d9 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            fontWeight: 900,
            boxShadow: isStaff ? '0 6px 18px rgba(217, 119, 6, 0.35)' : '0 6px 18px rgba(79, 110, 247, 0.35)',
            flexShrink: 0
          }}>
            {isStaff ? <Shield size={26} /> : initial}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {currentUser.name}
              </h3>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: isStaff ? '#d97706' : '#10b981',
                background: isStaff ? 'rgba(217, 119, 6, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                padding: '2px 8px',
                borderRadius: '999px',
                border: isStaff ? '1px solid rgba(217, 119, 6, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)'
              }}>
                {isStaff ? (currentUser.role === 'admin' ? 'Quản Trị Viên' : 'Giảng Viên') : 'Học Viên'}
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px', fontFamily: 'monospace', fontWeight: 700 }}>
              {isStaff ? `MÃ GV: ${currentUser.teacherCode || currentUser.studentCode || 'GV01'}` : `MÃ HV: ${currentUser.studentCode || 'THGZ01'}`}
            </div>
          </div>
        </div>

        {/* Contact Info Card */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '16px',
          padding: '14px 16px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '16px'
        }}>
          {/* Phone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Phone size={15} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>SỐ ĐIỆN THOẠI</div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentUser.phone || (isStaff ? '0988 776 655' : '0912 345 678')}
              </div>
            </div>
          </div>

          {/* Email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(79, 110, 247, 0.1)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Mail size={15} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>EMAIL LIÊN HỆ</div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentUser.email || (isStaff ? 'thuminh@tinhocgenz.io.vn' : `${currentUser.studentCode?.toLowerCase() || 'hocvien'}@tinhocgenz.io.vn`)}
              </div>
            </div>
          </div>

          {/* School / Class (Student Only) */}
          {!isStaff && currentUser.schoolOrClass && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <School size={15} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>LỚP ĐÀO TẠO</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {currentUser.schoolOrClass}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Assigned / Enrolled Programs Section */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <BookOpen size={15} color="var(--brand)" />
            <span>{isStaff ? 'Chương Trình Phân Công Giảng Dạy' : 'Chương Trình Đào Tạo Đang Học'}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {userTracks.map(trk => (
              <div
                key={trk}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)'
                }}
              >
                <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: 600 }}>{TRACK_LABELS[trk] || trk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions (Change Password, Logout) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button
            onClick={() => {
              onClose();
              onOpenChangePassword();
            }}
            className="btn btn-secondary"
            style={{
              width: '100%',
              padding: '11px',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <KeyRound size={16} color="var(--brand)" />
              <span>Đổi Mật Khẩu Tài Khoản</span>
            </div>
            <ChevronRight size={15} color="var(--text-muted)" />
          </button>

          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            style={{
              width: '100%',
              padding: '11px',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              background: 'rgba(239, 68, 68, 0.06)',
              color: '#ef4444',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} />
            <span>Đăng Xuất Tài Khoản</span>
          </button>
        </div>
      </div>
    </div>
  );
};
