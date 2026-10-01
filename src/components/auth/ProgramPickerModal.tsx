import React from 'react';
import { CurriculumTrack, TRACK_LABELS } from '../../types/auth';
import { BookOpen, ArrowRight, X } from 'lucide-react';
import { useLanguage } from '../../i18n';
import { soundFx } from '../../utils/audio';

export interface ProgramPickerModalProps {
  isOpen: boolean;
  tracks: CurriculumTrack[];
  onSelectTrack: (track: CurriculumTrack) => void;
  onClose: () => void;
  studentName?: string;
}

export const ProgramPickerModal: React.FC<ProgramPickerModalProps> = ({
  isOpen,
  tracks,
  onSelectTrack,
  onClose,
  studentName
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="program-picker-title"
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
          maxWidth: '480px',
          boxShadow: '0 20px 40px rgba(0, 63, 136, 0.15)',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
          animation: 'fade-scale 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: '#F4F8FD'
          }}
        >
          <div>
            <h2
              id="program-picker-title"
              style={{
                margin: 0,
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#0B2545'
              }}
            >
              {t('auth.selectProgramTitle')}
            </h2>
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '0.84rem',
                color: '#64748B'
              }}
            >
              {studentName ? `Chào mừng ${studentName}! ` : ''}{t('auth.selectProgramSubtitle')}
            </p>
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
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Track List */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto' }}>
          {tracks.map((track) => {
            const label = TRACK_LABELS[track] || track;
            return (
              <button
                key={track}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onSelectTrack(track);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #E2E8F0',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0057B8';
                  e.currentTarget.style.background = '#F4F8FD';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(0, 87, 184, 0.1)',
                      color: '#0057B8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0B2545' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      Mã phân hệ: {track}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#0057B8',
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                >
                  <span>Vào học</span>
                  <ArrowRight size={16} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
