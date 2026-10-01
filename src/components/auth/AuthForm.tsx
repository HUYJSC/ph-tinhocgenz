import React, { useState } from 'react';
import {
  Eye, EyeOff, ArrowRight, Loader2, Lock, User,
  AlertTriangle, WifiOff, CheckCircle2, Shield
} from 'lucide-react';
import { useLanguage } from '../../i18n';
import { soundFx } from '../../utils/audio';

export interface AuthFormProps {
  role: 'student' | 'teacher';
  accountValue: string;
  passwordValue: string;
  rememberMe: boolean;
  loginStatus: 'idle' | 'loading' | 'success' | 'failed';
  formError: string;
  lockoutSeconds: number;
  isOnline: boolean;
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
  onAccountChange,
  onPasswordChange,
  onRememberMeChange,
  onSubmit,
  onOpenForgotPassword
}) => {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);

  const isLocked = lockoutSeconds > 0;
  const isLoading = loginStatus === 'loading';
  const isSuccess = loginStatus === 'success';

  const accountLabel = role === 'student'
    ? t('auth.studentAccountLabel')
    : t('auth.teacherAccountLabel');

  const submitButtonText = role === 'student'
    ? t('auth.signIn')
    : t('auth.signInTeacher');

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%'
      }}
    >
      {/* Teacher Role Badge */}
      {role === 'teacher' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            background: 'rgba(0, 87, 184, 0.08)',
            border: '1px solid rgba(0, 87, 184, 0.2)',
            color: '#0057B8',
            fontSize: '0.78rem',
            fontWeight: 600
          }}
        >
          <Shield size={14} />
          <span>{t('auth.teacherBadge')}</span>
        </div>
      )}

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
          <WifiOff size={16} flex-shrink="0" />
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
            padding: '10px 14px',
            borderRadius: '10px',
            background: '#FEF3F2',
            border: '1px solid #FECDCA',
            color: '#B42318',
            fontSize: '0.82rem',
            animation: 'shake 0.3s ease'
          }}
        >
          <AlertTriangle size={16} />
          <span>{formError}</span>
        </div>
      )}

      {/* Account Input Field */}
      <div>
        <label
          htmlFor="auth-account-input"
          style={{
            display: 'block',
            fontSize: '0.84rem',
            fontWeight: 600,
            color: '#0B2545',
            marginBottom: '6px'
          }}
        >
          {accountLabel} <span style={{ color: '#D92D20' }}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
            <User size={18} />
          </span>
          <input
            id="auth-account-input"
            type="text"
            required
            autoComplete="username"
            disabled={isLoading || isLocked}
            value={accountValue}
            onChange={(e) => onAccountChange(e.target.value)}
            placeholder={t('auth.accountPlaceholder')}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '11px 14px 11px 42px',
              borderRadius: '10px',
              border: '1.5px solid #CBD5E1',
              background: isLoading || isLocked ? '#F8FAFC' : '#FFFFFF',
              color: '#0B2545',
              fontSize: '0.92rem',
              outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0057B8';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 87, 184, 0.12)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#CBD5E1';
              e.target.style.boxShadow = 'none';
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
            fontSize: '0.84rem',
            fontWeight: 600,
            color: '#0B2545',
            marginBottom: '6px'
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
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none'
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
            placeholder={t('auth.passwordPlaceholder')}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '11px 44px 11px 42px',
              borderRadius: '10px',
              border: '1.5px solid #CBD5E1',
              background: isLoading || isLocked ? '#F8FAFC' : '#FFFFFF',
              color: '#0B2545',
              fontSize: '0.92rem',
              outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0057B8';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 87, 184, 0.12)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#CBD5E1';
              e.target.style.boxShadow = 'none';
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
              right: '10px',
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
              borderRadius: '6px'
            }}
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
          fontSize: '0.84rem'
        }}
      >
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#475569',
            cursor: 'pointer',
            userSelect: 'none'
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
            soundFx.playClick();
            onOpenForgotPassword();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#0057B8',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            fontSize: '0.84rem'
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
          padding: '12px 18px',
          borderRadius: '10px',
          background: isSuccess
            ? '#16803C'
            : isLoading || isLocked || !isOnline
              ? '#94A3B8'
              : '#0057B8',
          color: '#FFFFFF',
          border: 'none',
          fontSize: '0.94rem',
          fontWeight: 700,
          cursor: isLoading || isLocked || !isOnline ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.15s ease',
          boxShadow: isLoading || isLocked ? 'none' : '0 4px 12px rgba(0, 87, 184, 0.25)',
          marginTop: '6px'
        }}
        onMouseEnter={(e) => {
          if (!isLoading && !isLocked && isOnline && !isSuccess) {
            e.currentTarget.style.background = '#003F88';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading && !isLocked && isOnline && !isSuccess) {
            e.currentTarget.style.background = '#0057B8';
            e.currentTarget.style.transform = 'translateY(0)';
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
            <span>{submitButtonText}</span>
            <ArrowRight size={17} />
          </>
        )}
      </button>
    </form>
  );
};
