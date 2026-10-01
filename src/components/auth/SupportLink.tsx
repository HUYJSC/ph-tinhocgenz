import React from 'react';
import { PhoneCall } from 'lucide-react';
import { useLanguage } from '../../i18n';
import { soundFx } from '../../utils/audio';

export interface SupportLinkProps {
  onOpenSupportModal: () => void;
}

export const SupportLink: React.FC<SupportLinkProps> = ({ onOpenSupportModal }) => {
  const { t } = useLanguage();

  return (
    <div
      style={{
        marginTop: '20px',
        textAlign: 'center',
        paddingTop: '16px',
        borderTop: '1px solid #F1F5F9',
        fontSize: '0.84rem',
        color: '#64748B'
      }}
    >
      <span>{t('auth.needHelp')}{' '}</span>
      <button
        type="button"
        onClick={() => {
          soundFx.playClick();
          onOpenSupportModal();
        }}
        style={{
          background: 'none',
          border: 'none',
          color: '#0057B8',
          fontWeight: 600,
          cursor: 'pointer',
          padding: 0,
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          verticalAlign: 'baseline'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
      >
        <PhoneCall size={13} />
        <span>{t('auth.contactAcademic')}</span>
      </button>
    </div>
  );
};
