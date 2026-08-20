import React from 'react';
import { Apple, CheckCircle2, X } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="card animate-slide-up"
        style={{ width: '100%', maxWidth: '520px', padding: '28px', background: 'var(--bg-secondary)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', flexShrink: 0 }}>
              <img src="/logo.png" alt="PH Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Cài đặt PH- TINHOCGENZ trên Điện thoại</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Sử dụng như ứng dụng di động mượt mà & offline</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 0' }}>
          {/* iOS Instructions */}
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              <Apple size={18} />
              <span>Dành cho iPhone / iPad (Safari):</span>
            </div>
            <ol style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li>Mở trình duyệt <b>Safari</b> và truy cập đường link trang web.</li>
              <li>Bấm vào nút <b>Chia sẻ (Share icon 📤)</b> ở thanh dưới cùng.</li>
              <li>Cuộn xuống và chọn <b>"Thêm vào Màn hình chính" (Add to Home Screen)</b>.</li>
              <li>Bấm <b>Thêm (Add)</b> để hoàn tất.</li>
            </ol>
          </div>

          {/* Android Instructions */}
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              <CheckCircle2 size={18} color="#10b981" />
              <span>Dành cho Android (Google Chrome):</span>
            </div>
            <ol style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li>Mở trình duyệt <b>Chrome</b> trên điện thoại Android.</li>
              <li>Bấm vào biểu tượng <b>3 dấu chấm (⋮)</b> ở góc trên bên phải.</li>
              <li>Chọn <b>"Cài đặt ứng dụng" (Install app)</b> hoặc <b>"Thêm vào màn hình chính"</b>.</li>
            </ol>
          </div>
        </div>

        <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>
          Đã hiểu, đóng hướng dẫn
        </button>
      </div>
    </div>
  );
};
