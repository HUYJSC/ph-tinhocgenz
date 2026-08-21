import React, { useState } from 'react';
import { UserProfile, StudentAccount } from '../../types/auth';
import { User, Shield, KeyRound, X, ArrowRight, Lock } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  studentAccounts?: StudentAccount[];
  onLoginStudent: (studentCode: string, password?: string) => { success: boolean; message?: string };
  onLoginAdmin: (pin: string, name?: string) => { success: boolean; message?: string };
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginStudent,
  onLoginAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>(currentUser.role === 'student' ? 'student' : 'admin');
  
  // Student form state
  const [studentCode, setStudentCode] = useState(currentUser.studentCode || '');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentError, setStudentError] = useState('');

  // Admin form state
  const [adminPin, setAdminPin] = useState('');
  const [adminName, setAdminName] = useState(currentUser.role === 'admin' ? currentUser.name : '');
  const [adminError, setAdminError] = useState('');

  if (!isOpen) return null;

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');
    if (!studentCode.trim()) {
      setStudentError('Vui lòng nhập Mã Học Viên!');
      return;
    }

    const res = onLoginStudent(studentCode.trim(), studentPassword.trim() || '123');
    if (res.success) {
      soundFx.playVictory();
      onClose();
    } else {
      soundFx.playIncorrect();
      setStudentError(res.message || 'Mã học viên hoặc mật khẩu không chính xác!');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    if (!adminName.trim()) {
      setAdminError('Vui lòng nhập họ tên giảng viên!');
      return;
    }

    const result = onLoginAdmin(adminPin.trim(), adminName.trim());
    if (result.success) {
      soundFx.playVictory();
      onClose();
    } else {
      soundFx.playIncorrect();
      setAdminError(result.message || 'Mã PIN quản trị không chính xác!');
    }
  };

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
          maxWidth: '440px',
          background: 'var(--bg-card)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
          border: '1px solid var(--border-color)',
          position: 'relative'
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

        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
              marginBottom: '10px'
            }}
          >
            <img src="/logo.png" alt="PH Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            Đổi Tài Khoản Đăng Nhập
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            PH - TIN HỌC GENZ
          </p>
        </div>

        {/* Symmetrical Segmented Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-secondary)',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '18px',
            border: '1px solid var(--border-color)'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('student');
              setStudentError('');
              soundFx.playClick();
            }}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'student' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'student' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'student' ? 800 : 600,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: activeTab === 'student' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <User size={15} />
            <span>Học Viên</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setAdminError('');
              soundFx.playClick();
            }}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'admin' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'admin' ? '#d97706' : 'var(--text-muted)',
              fontWeight: activeTab === 'admin' ? 800 : 600,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: activeTab === 'admin' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Shield size={15} />
            <span>Giảng Viên</span>
          </button>
        </div>

        {/* 1. Student Login Form */}
        {activeTab === 'student' && (
          <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Mã Học Viên / Họ Tên
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  placeholder="VD: THGZ01 hoặc Nguyễn Văn An"
                  value={studentCode}
                  onChange={e => setStudentCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '8px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Mật Khẩu
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  placeholder="Mật khẩu tài khoản (Mặc định: 123)"
                  value={studentPassword}
                  onChange={e => setStudentPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '8px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.86rem',
                    outline: 'none'
                  }}
                />
              </div>
              {studentError && (
                <p style={{ fontSize: '0.76rem', color: '#ef4444', marginTop: '4px' }}>{studentError}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '4px', padding: '11px', fontWeight: 800, fontSize: '0.88rem' }}
            >
              <span>Xác Nhận Đăng Nhập</span>
              <ArrowRight size={15} />
            </button>
          </form>
        )}

        {/* 2. Admin Form */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Họ Tên Giảng Viên
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  placeholder="VD: Thầy Quang Huy / Thầy Đức Nam"
                  value={adminName}
                  onChange={e => setAdminName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '8px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Mật Khẩu Quản Trị
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  placeholder="Nhập mã PIN hoặc mật khẩu quản trị"
                  value={adminPin}
                  onChange={e => setAdminPin(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '8px',
                    background: 'var(--bg-primary)',
                    border: adminError ? '1px solid #ef4444' : '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.86rem',
                    outline: 'none'
                  }}
                />
              </div>
              {adminError && (
                <p style={{ fontSize: '0.76rem', color: '#ef4444', marginTop: '4px' }}>{adminError}</p>
              )}
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                marginTop: '4px',
                padding: '11px',
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)'
              }}
            >
              <Shield size={15} />
              <span>Đăng Nhập Cổng Giảng Viên</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
