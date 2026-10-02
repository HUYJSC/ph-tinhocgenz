import React, { useState } from 'react';
import {
  Eye, EyeOff, ArrowRight, Loader2, Lock, User,
  AlertTriangle, WifiOff, CheckCircle2, Shield, Briefcase, GraduationCap
} from 'lucide-react';
import { useLanguage } from '../../i18n';
import { DetectedRole } from '../../utils/roleDetection';

export interface AuthFormProps {
  role: 'student' | 'teacher';
  accountValue: string;
  passwordValue: string;
  rememberMe: boolean;
  loginStatus: 'idle' | 'loading' | 'success' | 'failed';
  formError: string;
  lockoutSeconds: number;
  isOnline: boolean;
  detectedRole?: DetectedRole;
  onAccountChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onRememberMeChange: (val: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onOpenForgotPassword: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  role,
  accountValue,
  passwordValue,
  rememberMe,
  loginStatus,
  formError,
  lockoutSeconds,
  isOnline,
  detectedRole = null,
  onAccountChange,
  onPasswordChange,
  onRememberMeChange,
  onSubmit,
  onOpenForgotPassword
}) => {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [accountFocused, setAccountFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const isLocked = lockoutSeconds > 0;
  const isLoading = loginStatus === 'loading';
  const isSuccess = loginStatus === 'success';

  // Dynamic label based on detected role
  const getAccountLabel = () => {
    if (detectedRole === 'admin') return 'Tài khoản Quản trị viên';
    if (detectedRole === 'teacher') return t('auth.teacherAccountLabel');
    if (detectedRole === 'student') return t('auth.studentAccountLabel');
    return role === 'student'
      ? t('auth.studentAccountLabel')
      : t('auth.teacherAccountLabel');
  };

  const getSubmitButtonText = () => {
    if (detectedRole === 'admin') return 'Đăng nhập Quản trị viên';
    if (detectedRole === 'teacher' || role === 'teacher') return t('auth.signInTeacher');
    return t('auth.signIn');
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        width: '100%'
      }}
    >
      {/* Teacher / Admin Detected Role Banner */}
      {detectedRole === 'admin' ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'linear-gradient(90deg, rgba(0, 87, 184, 0.08) 0%, rgba(0, 63, 136, 0.04) 100%)',
            border: '1.5px solid rgba(0, 87, 184, 0.25)',
            color: '#0057B8',
            fontSize: '0.82rem',
            fontWeight: 600
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} />
            <span>Tự động nhận diện: <strong>Quản trị viên hệ thống</strong></span>
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#0057B8', color: '#FFFFFF', padding: '2px 8px', borderRadius: '6px' }}>
            Toàn quyền
          </span>
        </div>
      ) : (role === 'teacher' || detectedRole === 'teacher') ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '10px',
            background: 'rgba(0, 87, 184, 0.08)',
            border: '1px solid rgba(0, 87, 184, 0.2)',
            color: '#0057B8',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          <Briefcase size={15} />
          <span>{detectedRole === 'teacher' ? 'Tự động nhận diện: Giảng viên bộ môn' : t('auth.teacherBadge')}</span>
        </div>
      ) : null}

      {/* Offline Alert */}
      {!isOnline && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: '#FEF3F2',
            border: '1px solid #FECDCA',
            color: '#B42318',
            fontSize: '0.82rem'
          }}
        >
          <WifiOff size={16} />
          <span>{t('auth.offlineNotice')}</span>
        </div>
      )}

      {/* Locked Countdown Alert */}
      {isLocked && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: '#FEF3F2',
            border: '1px solid #FECDCA',
            color: '#B42318',
            fontSize: '0.82rem'
          }}
        >
          <AlertTriangle size={16} />
          <span>
            {t('auth.lockedNotice', { attempts: 5, seconds: lockoutSeconds })}
          </span>
        </div>
      )}

      {/* General Form Error */}
      {formError && !isLocked && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 14px',
            borderRadius: '10px',
            background: '#FEF3F2',
            border: '1px solid #FECDCA',
            color: '#B42318',
            fontSize: '0.84rem'
          }}
        >
          <AlertTriangle size={16} />
          <span>{formError}</span>
        </div>
      )}

      {/* Account Input Field */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
          <label
            htmlFor="auth-account-input"
            style={{
              fontSize: '0.86rem',
              fontWeight: 700,
              color: '#0B2545'
            }}
          >
            {getAccountLabel()} <span style={{ color: '#D92D20' }}>*</span>
          </label>

          {/* Real-time Role Chip Badge */}
          {detectedRole && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: detectedRole === 'admin' ? '#0057B8' : detectedRole === 'teacher' ? '#0284C7' : '#16803C',
                background: detectedRole === 'admin' ? '#EFF6FF' : detectedRole === 'teacher' ? '#F0F9FF' : '#F0FDF4',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid currentColor'
              }}
            >
              {detectedRole === 'admin' ? <Shield size={11} /> : detectedRole === 'teacher' ? <Briefcase size={11} /> : <GraduationCap size={11} />}
              {detectedRole === 'admin' ? 'Quản trị viên' : detectedRole === 'teacher' ? 'Giảng viên' : 'Học viên'}
            </span>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: accountFocused || detectedRole === 'admin' ? '#0057B8' : '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              transition: 'color 0.15s'
            }}
          >
            {detectedRole === 'admin' ? <Shield size={18} /> : <User size={18} />}
          </span>
          <input
            id="auth-account-input"
            type="text"
            required
            autoComplete="username"
            disabled={isLoading || isLocked}
            value={accountValue}
            onChange={(e) => onAccountChange(e.target.value)}
            onFocus={() => setAccountFocused(true)}
            onBlur={() => setAccountFocused(false)}
            placeholder="Mã học viên, email, SĐT hoặc admin..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '13px 14px 13px 44px',
              borderRadius: '12px',
              border: accountFocused
                ? '1.5px solid #0057B8'
                : detectedRole === 'admin'
                  ? '1.5px solid #0057B8'
                  : '1.5px solid #CBD5E1',
              background: isLoading || isLocked ? '#F8FAFC' : accountFocused ? '#FFFFFF' : '#F8FAFC',
              color: '#0B2545',
              fontSize: '0.94rem',
              fontWeight: 500,
              outline: 'none',
              boxShadow: accountFocused ? '0 0 0 4px rgba(0, 87, 184, 0.12)' : 'none',
              transition: 'all 0.15s ease'
            }}
          />
        </div>
      </div>

      {/* Password Input Field */}
      <div>
        <label
          htmlFor="auth-password-input"
          style={{
            display: 'block',
            fontSize: '0.86rem',
            fontWeight: 700,
            color: '#0B2545',
            marginBottom: '7px'
          }}
        >
          {t('auth.passwordLabel')} <span style={{ color: '#D92D20' }}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: passwordFocused ? '#0057B8' : '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              transition: 'color 0.15s'
            }}
          >
            <Lock size={18} />
          </span>
          <input
            id="auth-password-input"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            disabled={isLoading || isLocked}
            value={passwordValue}
            onChange={(e) => onPasswordChange(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            placeholder={t('auth.passwordPlaceholder')}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '13px 46px 13px 44px',
              borderRadius: '12px',
              border: passwordFocused ? '1.5px solid #0057B8' : '1.5px solid #CBD5E1',
              background: isLoading || isLocked ? '#F8FAFC' : passwordFocused ? '#FFFFFF' : '#F8FAFC',
              color: '#0B2545',
              fontSize: '0.94rem',
              fontWeight: 500,
              outline: 'none',
              boxShadow: passwordFocused ? '0 0 0 4px rgba(0, 87, 184, 0.12)' : 'none',
              transition: 'all 0.15s ease'
            }}
          />
          {/* Show / Hide Toggle Button */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#E2E8F0')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Options Row: Remember Me & Forgot Password */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem',
          padding: '2px 0'
        }}
      >
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#475569',
            cursor: 'pointer',
            userSelect: 'none',
            fontWeight: 500
          }}
        >
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => onRememberMeChange(e.target.checked)}
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              accentColor: '#0057B8',
              cursor: 'pointer'
            }}
          />
          <span>{t('auth.rememberMe')}</span>
        </label>

        <button
          type="button"
          onClick={() => {
            onOpenForgotPassword();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#0057B8',
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
            fontSize: '0.85rem',
            transition: 'color 0.15s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          {t('auth.forgotPassword')}
        </button>
      </div>

      {/* Primary Submit Button */}
      <button
        type="submit"
        disabled={isLoading || isLocked || !isOnline}
        style={{
          width: '100%',
          height: '48px',
          padding: '0 20px',
          borderRadius: '12px',
          background: isSuccess
            ? '#16803C'
            : isLoading || isLocked || !isOnline
              ? '#94A3B8'
              : 'linear-gradient(180deg, #0057B8 0%, #004BA0 100%)',
          color: '#FFFFFF',
          border: 'none',
          fontSize: '0.96rem',
          fontWeight: 700,
          cursor: isLoading || isLocked || !isOnline ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          transition: 'all 0.15s ease',
          boxShadow: isLoading || isLocked ? 'none' : '0 4px 14px rgba(0, 87, 184, 0.3)',
          marginTop: '4px'
        }}
        onMouseEnter={(e) => {
          if (!isLoading && !isLocked && isOnline && !isSuccess) {
            e.currentTarget.style.background = 'linear-gradient(180deg, #004BA0 0%, #003F88 100%)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 87, 184, 0.36)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading && !isLocked && isOnline && !isSuccess) {
            e.currentTarget.style.background = 'linear-gradient(180deg, #0057B8 0%, #004BA0 100%)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 87, 184, 0.3)';
          }
        }}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>{t('auth.authenticating')}</span>
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle2 size={18} />
            <span>Đăng nhập thành công!</span>
          </>
        ) : (
          <>
            <span>{getSubmitButtonText()}</span>
            <ArrowRight size={17} />
          </>
        )}
      </button>
    </form>
  );
};
