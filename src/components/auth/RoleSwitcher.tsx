import React from 'react';
import { GraduationCap, Briefcase, Shield, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n';
import { soundFx } from '../../utils/audio';
import { DetectedRole } from '../../utils/roleDetection';

export interface RoleSwitcherProps {
  currentRole: 'student' | 'teacher';
  onChangeRole: (role: 'student' | 'teacher') => void;
  disabled?: boolean;
  detectedRole?: DetectedRole;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  onChangeRole,
  disabled = false,
  detectedRole = null
}) => {
  const { t } = useLanguage();

  const handleSelect = (role: 'student' | 'teacher') => {
    if (disabled || role === currentRole) return;
    soundFx.playClick();
    onChangeRole(role);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <div
        role="tablist"
        aria-label="Cổng đăng nhập"
        style={{
          display: 'flex',
          background: '#F4F8FD',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box',
          gap: '4px'
        }}
      >
        {/* Student Tab */}
        <button
          type="button"
          role="tab"
          id="tab-student"
          aria-selected={currentRole === 'student'}
          aria-controls="panel-student"
          tabIndex={currentRole === 'student' ? 0 : -1}
          disabled={disabled}
          onClick={() => handleSelect('student')}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '9px',
            fontSize: '0.88rem',
            fontWeight: currentRole === 'student' ? 700 : 500,
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            background: currentRole === 'student' ? '#FFFFFF' : 'transparent',
            color: currentRole === 'student' ? '#0057B8' : '#64748B',
            boxShadow: currentRole === 'student' ? '0 2px 8px rgba(0, 63, 136, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)' : 'none',
            opacity: disabled ? 0.6 : 1
          }}
        >
          <GraduationCap size={18} />
          <span>{t('auth.roleStudent')}</span>
          {detectedRole === 'student' && (
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#16803C',
                display: 'inline-block'
              }}
              title="Đã tự động nhận diện"
            />
          )}
        </button>

        {/* Teacher Tab */}
        <button
          type="button"
          role="tab"
          id="tab-teacher"
          aria-selected={currentRole === 'teacher'}
          aria-controls="panel-teacher"
          tabIndex={currentRole === 'teacher' ? 0 : -1}
          disabled={disabled}
          onClick={() => handleSelect('teacher')}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '9px',
            fontSize: '0.88rem',
            fontWeight: currentRole === 'teacher' ? 700 : 500,
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            background: currentRole === 'teacher' ? '#FFFFFF' : 'transparent',
            color: currentRole === 'teacher' ? '#0057B8' : '#64748B',
            boxShadow: currentRole === 'teacher' ? '0 2px 8px rgba(0, 63, 136, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)' : 'none',
            opacity: disabled ? 0.6 : 1
          }}
        >
          {detectedRole === 'admin' ? <Shield size={17} /> : <Briefcase size={17} />}
          <span>{detectedRole === 'admin' ? 'Quản trị viên' : t('auth.roleTeacher')}</span>
          {(detectedRole === 'teacher' || detectedRole === 'admin') && (
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#0057B8',
                display: 'inline-block'
              }}
              title="Đã tự động nhận diện"
            />
          )}
        </button>
      </div>

      {/* Smart Auto-Detect Assist Hint */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
          fontSize: '0.74rem',
          color: '#64748B',
          padding: '2px 4px'
        }}
      >
        <Sparkles size={12} color="#0057B8" />
        <span>Hệ thống tự động nhận diện Học viên, Giảng viên & Quản trị viên</span>
      </div>
    </div>
  );
};
