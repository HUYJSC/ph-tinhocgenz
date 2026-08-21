import React, { useState } from 'react';
import { HelpCircle, Lock, User, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetPassword: (identifier: string, newPass: string) => { success: boolean; message?: string };
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onResetPassword
}) => {
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Vui lòng nhập Mã học viên, Mã giảng viên, SĐT hoặc Email!');
      return;
    }

    if (!newPassword || newPassword.length < 3) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 3 ký tự!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    const res = onResetPassword(identifier.trim(), newPassword);
    if (res.success) {
      setSuccessMsg(res.message || 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
      setTimeout(() => {
        setSuccessMsg('');
        setIdentifier('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      }, 2000);
    } else {
      setErrorMsg(res.message || 'Không tìm thấy thông tin tài khoản hợp lệ!');
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
        zIndex: 1200,
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

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'rgba(245, 158, 11, 0.12)',
            color: '#f59e0b',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px'
          }}>
            <HelpCircle size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Quên Mật Khẩu
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Nhập Mã số (HV/GV), SĐT hoặc Email để đặt lại mật khẩu mới
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

          {/* Identifier Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              Mã Học Viên / Mã GV / SĐT / Email
            </label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="VD: THGZ01, GV04, 0988776655..."
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', minHeight: '40px', borderRadius: '10px' }}
                required
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              Mật khẩu mới muốn đặt
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="Nhập mật khẩu mới..."
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', minHeight: '40px', borderRadius: '10px' }}
                required
              />
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              Xác nhận mật khẩu mới
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="Nhập lại mật khẩu mới..."
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', minHeight: '40px', borderRadius: '10px' }}
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '10px', borderRadius: '10px' }}
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2, padding: '10px', fontWeight: 700, borderRadius: '10px' }}
            >
              Xác Nhận Đổi Mật Khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
