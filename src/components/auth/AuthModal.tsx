import React, { useState } from 'react';
import { UserProfile } from '../../types/auth';
import { User, Shield, KeyRound, School, Sparkles, X, CheckCircle, ArrowRight } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLoginStudent: (name: string, studentCode?: string, schoolOrClass?: string) => void;
  onLoginAdmin: (pin: string, name?: string) => { success: boolean; message?: string };
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginStudent,
  onLoginAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>(currentUser.role);
  
  // Student form state
  const [studentName, setStudentName] = useState(currentUser.name);
  const [studentCode, setStudentCode] = useState(currentUser.studentCode || '');
  const [schoolOrClass, setSchoolOrClass] = useState(currentUser.schoolOrClass || '');

  // Admin form state
  const [adminPin, setAdminPin] = useState('');
  const [adminName, setAdminName] = useState('Thầy Huy (Giảng Viên Trưởng)');
  const [adminError, setAdminError] = useState('');

  if (!isOpen) return null;

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    onLoginStudent(studentName, studentCode, schoolOrClass);
    soundFx.playCorrect();
    onClose();
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    const result = onLoginAdmin(adminPin, adminName);
    if (result.success) {
      soundFx.playCorrect();
      onClose();
    } else {
      soundFx.playIncorrect();
      setAdminError(result.message || 'Mã PIN quản trị không đúng!');
    }
  };

  const handleQuickDemoAdmin = () => {
    setAdminPin('admin123');
    const result = onLoginAdmin('admin123', 'Thầy Huy (Giảng Viên Trưởng)');
    if (result.success) {
      soundFx.playCorrect();
      onClose();
    }
  };

  const handleQuickDemoStudent = () => {
    onLoginStudent('Nguyễn Văn An', 'THGZ-2026-99', 'Lớp MOS Excel & Word K12');
    soundFx.playCorrect();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
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
          maxWidth: '480px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 24px',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              marginBottom: '10px'
            }}
          >
            <img src="/logo.png" alt="PH Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Hệ Thống Đào Tạo & Luyện Thi
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            PH DIGITAL EDUCATION • TIN HỌC GENZ
          </p>
        </div>

        {/* Dual Tab Role Selector */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-primary)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            border: '1px solid var(--border-color)'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('student');
              soundFx.playClick();
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'student' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'student' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'student' ? 700 : 500,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: activeTab === 'student' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.18s ease'
            }}
          >
            <User size={16} />
            <span>Cổng Học Viên</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              soundFx.playClick();
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'admin' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'admin' ? '#f59e0b' : 'var(--text-secondary)',
              fontWeight: activeTab === 'admin' ? 700 : 500,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: activeTab === 'admin' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.18s ease'
            }}
          >
            <Shield size={16} />
            <span>Giảng Viên / Admin</span>
          </button>
        </div>

        {/* 1. Student Form */}
        {activeTab === 'student' && (
          <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Họ và Tên Học Viên <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Mã Học Viên
                </label>
                <input
                  type="text"
                  placeholder="THGZ-2026"
                  value={studentCode}
                  onChange={e => setStudentCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Lớp / Trường
                </label>
                <div style={{ position: 'relative' }}>
                  <School size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Lớp MOS K12"
                    value={schoolOrClass}
                    onChange={e => setSchoolOrClass(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 10px 10px 34px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '12px' }}>
              <span>Vào Làm Bài Tập & Luyện Thi</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={handleQuickDemoStudent}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'center',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <Sparkles size={14} />
              <span>Đăng nhập nhanh với tài khoản Học Viên mẫu</span>
            </button>
          </form>
        )}

        {/* 2. Admin Form */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', fontSize: '0.8rem', color: '#b45309' }}>
              🔒 <b>Cổng dành riêng cho Giảng Viên & Quản Trị Viên</b>: Quản lý ngân hàng câu hỏi, tạo đề thi và theo dõi bảng điểm học sinh.
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Họ và Tên Giảng Viên
              </label>
              <input
                type="text"
                placeholder="Thầy Huy (Giảng Viên Trưởng)"
                value={adminName}
                onChange={e => setAdminName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Mật Khẩu Quản Trị / Mã PIN <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  placeholder="Nhập mã PIN (mặc định: admin123 hoặc 123456)"
                  value={adminPin}
                  onChange={e => setAdminPin(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-primary)',
                    border: adminError ? '1px solid #ef4444' : '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
              {adminError && (
                <p style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '4px' }}>{adminError}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: '8px',
                padding: '12px',
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)'
              }}
            >
              <Shield size={16} />
              <span>Xác Thực Vào Quản Trị Giảng Viên</span>
            </button>

            <button
              type="button"
              onClick={handleQuickDemoAdmin}
              style={{
                background: 'none',
                border: 'none',
                color: '#d97706',
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'center',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                fontWeight: 600
              }}
            >
              <CheckCircle size={14} />
              <span>1-Click Trải nghiệm ngay quyền Quản Trị Viên</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
