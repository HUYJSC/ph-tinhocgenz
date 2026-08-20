import React, { useState } from 'react';
import { CurriculumTrack, TRACK_LABELS } from '../../types/auth';
import { QrCode, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface StudentCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentCode: string;
  programTrack?: CurriculumTrack;
  onCheckIn: (studentCode: string, studentName: string, pinOrToken: string, track: CurriculumTrack) => { success: boolean; message: string };
}

export const StudentCheckInModal: React.FC<StudentCheckInModalProps> = ({
  isOpen,
  onClose,
  studentName,
  studentCode,
  programTrack = 'office-fast-3in1',
  onCheckIn
}) => {
  const [pinInput, setPinInput] = useState('');
  const [resultMessage, setResultMessage] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      alert('Vui lòng nhập mã PIN hoặc Token điểm danh!');
      return;
    }

    const res = onCheckIn(studentCode, studentName, pinInput.trim(), programTrack);
    setResultMessage({ success: res.success, text: res.message });

    if (res.success) {
      soundFx.playVictory();
      setTimeout(() => {
        setResultMessage(null);
        setPinInput('');
        onClose();
      }, 2500);
    } else {
      soundFx.playIncorrect();
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
          maxWidth: '420px',
          padding: '24px',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="btn btn-ghost"
          style={{ position: 'absolute', top: '14px', right: '14px', padding: '6px' }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div style={{
            width: '50px', height: '50px', borderRadius: '14px',
            background: 'rgba(79, 110, 247, 0.1)', color: 'var(--brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 10px', boxShadow: '0 4px 12px rgba(79,110,247,0.2)'
          }}>
            <QrCode size={26} />
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Điểm Danh Buổi Học
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Học viên: <b>{studentName}</b> ({studentCode})
          </p>
          <div style={{ fontSize: '0.72rem', background: 'var(--brand-light)', color: 'var(--brand)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700, display: 'inline-block', marginTop: '6px' }}>
            {TRACK_LABELS[programTrack] || programTrack}
          </div>
        </div>

        {resultMessage ? (
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: resultMessage.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: resultMessage.success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            color: resultMessage.success ? '#10b981' : '#ef4444',
            textAlign: 'center',
            fontSize: '0.88rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {resultMessage.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span>{resultMessage.text}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                Nhập Mã PIN 6 Số (Từ màn hình của giáo viên)
              </label>
              <input
                type="text"
                placeholder="VD: 582109"
                value={pinInput}
                onChange={e => setPinInput(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                maxLength={12}
                autoFocus
                style={{
                  textAlign: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  letterSpacing: '0.15em',
                  fontFamily: 'var(--font-mono)'
                }}
              />
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '6px 0 0', textAlign: 'center' }}>
                Mã QR và PIN có hiệu lực 5 phút tự động xoay mã.
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 800 }}
            >
              <CheckCircle2 size={16} />
              <span>Xác Nhận Điểm Danh</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
