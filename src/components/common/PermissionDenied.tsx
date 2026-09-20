import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export interface PermissionDeniedProps {
  moduleName?: string;
  onBack?: () => void;
}

export const PermissionDenied: React.FC<PermissionDeniedProps> = ({
  moduleName = 'chức năng này',
  onBack
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px',
      textAlign: 'center',
      minHeight: '420px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: '#FEF2F2',
        border: '1px solid #FEE2E2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#DC2626',
        marginBottom: '16px'
      }}>
        <ShieldAlert size={32} />
      </div>

      <h3 style={{
        fontSize: '18px',
        fontWeight: 700,
        color: '#0F172A',
        margin: '0 0 8px'
      }}>
        Bạn không có quyền truy cập {moduleName}.
      </h3>

      <p style={{
        fontSize: '13.5px',
        color: '#64748B',
        maxWidth: '440px',
        lineHeight: 1.6,
        margin: '0 0 24px'
      }}>
        Tài khoản của bạn chưa được cấp quyền quản trị để xem hoặc thao tác trên phân hệ này. Vui lòng liên hệ Quản Trị Viên Cấp Cao nếu bạn cần được phân quyền bổ sung.
      </p>

      <button
        onClick={handleBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          background: '#0057B8',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '13.5px',
          cursor: 'pointer',
          transition: 'background 0.15s ease'
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#004494')}
        onMouseLeave={e => (e.currentTarget.style.background = '#0057B8')}
      >
        <ArrowLeft size={16} />
        <span>Quay lại</span>
      </button>
    </div>
  );
};
