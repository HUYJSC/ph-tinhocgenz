import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, X, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../i18n';
import { soundFx } from '../../utils/audio';

export interface OtpVerifyModalProps {
  isOpen: boolean;
  targetAccount: string;
  onVerifyOtp: (otp: string) => Promise<{ success: boolean; message?: string }> | { success: boolean; message?: string };
  onClose: () => void;
}

export const OtpVerifyModal: React.FC<OtpVerifyModalProps> = ({
  isOpen,
  targetAccount,
  onVerifyOtp,
  onClose
}) => {
  const { t } = useLanguage();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setErrorMsg('');
      setIsVerifying(false);
      setCountdown(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  const handleChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    const next = [...digits];
    // In case of paste
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        next[i] = chars[i] || '';
      }
      setDigits(next);
      const focusTarget = Math.min(chars.length, 5);
      inputRefs.current[focusTarget]?.focus();
      return;
    }

    next[index] = clean[0];
    setDigits(next);
    if (index < 5 && clean[0]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = digits.join('');
    if (fullCode.length < 6) {
      setErrorMsg('Vui lòng nhập đủ 6 chữ số mã OTP.');
      soundFx.playIncorrect();
      return;
    }

    setErrorMsg('');
    setIsVerifying(true);

    try {
      const res = await onVerifyOtp(fullCode);
      if (res.success) {
        soundFx.playVictory();
        onClose();
      } else {
        soundFx.playIncorrect();
        setErrorMsg(res.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
        setIsVerifying(false);
      }
    } catch {
      soundFx.playIncorrect();
      setErrorMsg('Xác thực thất bại. Vui lòng thử lại.');
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    soundFx.playClick();
    setCountdown(60);
    setErrorMsg('');
    setDigits(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(11, 37, 69, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 20px 40px rgba(0, 63, 136, 0.15)',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
          padding: '24px'
        }}
      >
        {/* Top Icon & Close */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(0, 87, 184, 0.1)',
              color: '#0057B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <h2 id="otp-modal-title" style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 700, color: '#0B2545' }}>
          {t('auth.otpTitle')}
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.86rem', color: '#64748B', lineHeight: 1.5 }}>
          {t('auth.otpSubtitle')} ({targetAccount})
        </p>

        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#FEE4E2',
              border: '1px solid #FECDCA',
              color: '#D92D20',
              fontSize: '0.84rem',
              marginBottom: '16px'
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleVerify}>
          {/* OTP 6 Boxes */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={el => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                style={{
                  width: '46px',
                  height: '52px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  textAlign: 'center',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: '#0B2545',
                  background: '#F8FAFC',
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s'
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#0057B8';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 87, 184, 0.15)';
                  e.target.style.background = '#FFFFFF';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#CBD5E1';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = '#F8FAFC';
                }}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <button
            type="submit"
            disabled={isVerifying || digits.join('').length < 6}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              background: '#0057B8',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: isVerifying ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: isVerifying || digits.join('').length < 6 ? 0.7 : 1,
              transition: 'background 0.15s'
            }}
          >
            {isVerifying ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Đang kiểm tra OTP…</span>
              </>
            ) : (
              <>
                <span>{t('auth.verifyOtpBtn')}</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Resend Countdown */}
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.82rem', color: '#64748B' }}>
          {countdown > 0 ? (
            <span>Gửi lại mã sau <strong>{countdown}s</strong></span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              style={{
                background: 'none',
                border: 'none',
                color: '#0057B8',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={13} />
              <span>{t('auth.resendOtp')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

