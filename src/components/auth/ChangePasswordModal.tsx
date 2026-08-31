import React, { useState } from 'react';
import {
  KeyRound, Lock, CheckCircle2, AlertCircle, X, Eye, EyeOff,
  ShieldCheck, Sparkles, Check, AlertTriangle
} from 'lucide-react';
import { UserProfile } from '../../types/auth';
import { soundFx } from '../../utils/audio';

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

  // Eye toggles for each individual field
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Password strength calculation
  const hasMinLength = newPassword.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword);
  const isNotDefault = newPassword !== '123' && newPassword !== 'admin123';
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  let strengthScore = 0;
  if (hasMinLength) strengthScore += 1;
  if (hasLetter) strengthScore += 1;
  if (hasNumber) strengthScore += 1;
  if (hasSpecial) strengthScore += 1;
  if (newPassword.length >= 10) strengthScore += 1;

  const getStrengthMeta = () => {
    if (!newPassword) return { label: 'Chưa nhập', color: '#94A3B8', width: '0%' };
    if (strengthScore <= 1) return { label: 'Yếu', color: '#EF4444', width: '25%' };
    if (strengthScore <= 2) return { label: 'Trung bình', color: '#F59E0B', width: '50%' };
    if (strengthScore <= 3) return { label: 'Khá', color: '#2563EB', width: '75%' };
    return { label: 'Rất mạnh', color: '#10B981', width: '100%' };
  };

  const strengthMeta = getStrengthMeta();

  // Generate strong suggested password
  const handleGenerateStrongPassword = () => {
    soundFx.playClick();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let generated = 'Tgz@';
    for (let i = 0; i < 6; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowNewPass(true);
    setShowConfirmPass(true);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có tối thiểu 6 ký tự để đảm bảo an toàn!');
      soundFx.playClick();
      return;
    }

    if (newPassword === '123' || newPassword === 'admin123') {
      setErrorMsg('Vui lòng không đặt lại mật khẩu mặc định (123). Hãy chọn mật khẩu riêng của bạn!');
      soundFx.playClick();
      return;
    }

    if (oldPassword && newPassword === oldPassword) {
      setErrorMsg('Mật khẩu mới không được trùng với mật khẩu hiện tại!');
      soundFx.playClick();
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp với mật khẩu mới!');
      soundFx.playClick();
      return;
    }

    const res = onChangePassword(oldPassword || '123', newPassword);
    if (res.success) {
      soundFx.playCorrect();
      setSuccessMsg(res.message || 'Đổi mật khẩu thành công!');
      setTimeout(() => {
        setSuccessMsg('');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      }, 1200);
    } else {
      soundFx.playClick();
      setErrorMsg(res.message || 'Không thể đổi mật khẩu, vui lòng kiểm tra lại mật khẩu hiện tại!');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
          maxWidth: '440px',
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          border: '1px solid #E2E8F0',
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
              top: '18px',
              right: '18px',
              padding: '6px',
              borderRadius: '50%',
              background: '#F1F5F9',
              border: 'none',
              cursor: 'pointer',
              color: '#64748B'
            }}
          >
            <X size={18} />
          </button>
        )}

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: isFirstTime ? '#EFF6FF' : '#F5F3FF',
            color: isFirstTime ? '#2563EB' : '#7C3AED',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            border: `1px solid ${isFirstTime ? '#BFDBFE' : '#DDD6FE'}`
          }}>
            {isFirstTime ? <ShieldCheck size={26} /> : <KeyRound size={26} />}
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            {isFirstTime ? 'Đổi Mật Khẩu Lần Đầu' : 'Đổi Mật Khẩu Tài Khoản'}
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '6px 0 0', lineHeight: 1.5 }}>
            {isFirstTime
              ? 'Để bảo vệ an toàn kết quả học tập và thông tin thi chứng chỉ Certiport, vui lòng đặt mật khẩu mới của bạn.'
              : `Tài khoản: ${currentUser.name} (${currentUser.studentCode || currentUser.teacherCode || 'THGZ'})`}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '12.5px',
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
              padding: '10px 14px',
              borderRadius: '10px',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#059669',
              fontSize: '12.5px',
              fontWeight: 700
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current Password */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Mật khẩu hiện tại (Mật khẩu được cấp ban đầu)
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type={showOldPass ? 'text' : 'password'}
                placeholder="Nhập mật khẩu ban đầu..."
                value={oldPassword}
                onChange={e => { setOldPassword(e.target.value); setErrorMsg(''); }}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  background: '#F8FAFC',
                  fontSize: '13.5px',
                  paddingLeft: '38px',
                  paddingRight: '42px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowOldPass(!showOldPass)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title={showOldPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                Mật khẩu mới
              </label>
              <button
                type="button"
                onClick={handleGenerateStrongPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0
                }}
              >
                <Sparkles size={13} color="#2563EB" />
                Gợi ý mật khẩu mạnh
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type={showNewPass ? 'text' : 'password'}
                placeholder="Tối thiểu 6 ký tự..."
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setErrorMsg(''); }}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  background: '#F8FAFC',
                  fontSize: '13.5px',
                  paddingLeft: '38px',
                  paddingRight: '42px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title={showNewPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password Strength Meter */}
            {newPassword.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                  <span style={{ color: '#64748B' }}>Độ bảo mật:</span>
                  <span style={{ fontWeight: 700, color: strengthMeta.color }}>{strengthMeta.label}</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: strengthMeta.width, height: '100%', background: strengthMeta.color, transition: 'all 0.25s ease' }} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Xác nhận mật khẩu mới
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type={showConfirmPass ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu mới..."
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setErrorMsg(''); }}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '10px',
                  border: `1.5px solid ${passwordsMatch ? '#10B981' : '#CBD5E1'}`,
                  background: '#F8FAFC',
                  fontSize: '13.5px',
                  paddingLeft: '38px',
                  paddingRight: '42px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title={showConfirmPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordsMatch && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
                <Check size={13} />
                <span>Mật khẩu xác nhận trùng khớp</span>
              </div>
            )}
          </div>

          {/* Realtime Safety Checklist */}
          <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '5px', border: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: hasMinLength ? '#059669' : '#64748B' }}>
              {hasMinLength ? <Check size={13} color="#059669" /> : <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#94A3B8' }} />}
              <span>Độ dài từ 6 ký tự trở lên</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: isNotDefault ? '#059669' : '#EF4444' }}>
              {isNotDefault ? <Check size={13} color="#059669" /> : <AlertTriangle size={13} color="#EF4444" />}
              <span>Không trùng mật khẩu mặc định (123)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            {!isFirstTime && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  height: '44px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Hủy Bỏ
              </button>
            )}
            <button
              type="submit"
              style={{
                flex: isFirstTime ? 1 : 2,
                height: '44px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
              }}
            >
              Lưu Mật Khẩu Mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
