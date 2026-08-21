import React, { useState } from 'react';
import { KeyRound, Lock, CheckCircle2, AlertCircle, X, Eye, EyeOff } from 'lucide-react';
import { UserProfile } from '../../types/auth';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  isFirstTime?: boolean;
  onChangePassword: (oldPass: string, newPass: string) => { success: boolean; message?: string };
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  isFirstTime = false,
  onChangePassword
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword || newPassword.length < 3) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 3 ký tự!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp với mật khẩu mới!');
      return;
    }

    const res = onChangePassword(oldPassword || '123', newPassword);
    if (res.success) {
      setSuccessMsg(res.message || 'Đổi mật khẩu thành công!');
      setTimeout(() => {
        setSuccessMsg('');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      }, 1200);
    } else {
      setErrorMsg(res.message || 'Không thể đổi mật khẩu, vui lòng thử lại!');
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
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={() => {
        if (!isFirstTime) onClose();
      }}
    >
      <div
        className="card animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--bg-card)',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {!isFirstTime && (
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
        )}

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'rgba(79, 110, 247, 0.12)',
            color: 'var(--brand)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px'
          }}>
            <KeyRound size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {isFirstTime ? 'Đổi Mật Khẩu Lần Đầu' : 'Đổi Mật Khẩu Tài Khoản'}
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {isFirstTime
              ? 'Để bảo mật tài khoản cá nhân, vui lòng đặt mật khẩu mới của bạn.'
              : `Tài khoản: ${currentUser.name} (${currentUser.studentCode || currentUser.teacherCode || 'THGZ'})`}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              Mật khẩu hiện tại (Mặc định: 123)
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Nhập mật khẩu hiện tại..."
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px', paddingRight: '40px', minHeight: '40px', borderRadius: '10px' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              Mật khẩu mới
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Nhập mật khẩu mới..."
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px', paddingRight: '40px', minHeight: '40px', borderRadius: '10px' }}
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              Xác nhận mật khẩu mới
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu mới..."
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px', paddingRight: '40px', minHeight: '40px', borderRadius: '10px' }}
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            {!isFirstTime && (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '10px', borderRadius: '10px' }}
              >
                Hủy Bỏ
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: isFirstTime ? 1 : 2, padding: '10px', fontWeight: 700, borderRadius: '10px' }}
            >
              Lưu Mật Khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
