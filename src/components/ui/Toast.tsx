import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type?: ToastType;
  message: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type = 'info',
  message,
  description,
  duration = 4000,
  onClose
}) => {
  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} color="#10B981" />;
      case 'error': return <AlertCircle size={18} color="#EF4444" />;
      case 'warning': return <AlertTriangle size={18} color="#F59E0B" />;
      case 'info':
      default: return <Info size={18} color="#0057B8" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success': return '#A7F3D0';
      case 'error': return '#FECACA';
      case 'warning': return '#FDE68A';
      case 'info':
      default: return '#BFDBFE';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 16px',
        background: '#FFFFFF',
        borderRadius: '10px',
        border: `1px solid ${getBorderColor()}`,
        boxShadow: '0 8px 16px -4px rgba(11, 37, 69, 0.1)',
        minWidth: '280px',
        maxWidth: '380px',
        animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      role="alert"
    >
      <div style={{ marginTop: '2px', flexShrink: 0 }}>
        {getIcon()}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B2545' }}>{message}</div>
        {description && (
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{description}</div>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        style={{
          background: 'none',
          border: 'none',
          padding: '2px',
          color: '#94A3B8',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
};
