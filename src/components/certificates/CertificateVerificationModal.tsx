import React from 'react';
import { DigitalCertificate } from '../../types/edtech';
import { Printer, X, ShieldCheck } from 'lucide-react';

interface CertificateVerificationModalProps {
  certificate: DigitalCertificate;
  onClose: () => void;
}

export const CertificateVerificationModal: React.FC<CertificateVerificationModalProps> = ({
  certificate,
  onClose
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      className="animate-fade-in"
    >
      <div
        className="card animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '24px',
          padding: '32px',
          background: 'var(--bg-card)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
          border: '2px solid #d97706',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn btn-icon"
          style={{ position: 'absolute', right: '18px', top: '18px', width: '34px', height: '34px', borderRadius: '50%' }}
        >
          <X size={18} />
        </button>

        {/* Certificate Frame Inner */}
        <div style={{
          border: '3px double #d97706',
          borderRadius: '16px',
          padding: '28px 24px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
          position: 'relative'
        }}>
          {/* Badge & Security Icon */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', fontSize: '0.76rem', fontWeight: 800, marginBottom: '14px' }}>
            <ShieldCheck size={15} />
            <span>CHỨNG NHẬN SỐ HỢP LỆ • PH DIGITAL EDUCATION</span>
          </div>

          <div style={{ fontSize: '0.86rem', letterSpacing: '0.15em', fontWeight: 900, color: '#d97706', textTransform: 'uppercase', marginBottom: '8px' }}>
            HỆ THỐNG ĐÀO TẠO & KHẢO THÍ TIN HỌC PH DIGITAL EDUCATION
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            GIẤY CHỨNG NHẬN HOÀN THÀNH
          </h1>

          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Chứng nhận học viên xuất sắc:
          </div>

          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--brand)', margin: '0 0 6px' }}>
            {certificate.studentName}
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Mã định danh học viên: <strong>{certificate.studentCode}</strong>
          </div>

          <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', maxWidth: '520px', margin: '0 auto 18px', lineHeight: 1.6 }}>
            Đã hoàn thành xuất sắc toàn bộ nội dung chương trình đào tạo & vượt qua kỳ khảo thí chuẩn hóa:
            <br />
            <strong style={{ fontSize: '1.05rem', color: '#d97706' }}>{certificate.courseTitle}</strong>
          </p>

          {certificate.honorsTitle && (
            <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: '999px', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#fff', fontSize: '0.82rem', fontWeight: 800, marginBottom: '20px' }}>
              🎖️ {certificate.honorsTitle} • Điểm tổng kết: {certificate.finalScore}/100
            </div>
          )}

          {/* Footer details & Verification Key */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderTop: '1px dashed var(--border-color)', paddingTop: '16px', marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <div>
              <div>MÃ TRA CỨU: <strong>{certificate.certificateId}</strong></div>
              <div>NGÀY CẤP: <strong>{certificate.issueDate}</strong></div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#059669', fontWeight: 800 }}>✓ ĐÃ XÁC THỰC MÃ QR SỐ</div>
              <div style={{ fontSize: '0.72rem' }}>Hội đồng khảo thí TinHocGenZ</div>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
          <button
            onClick={() => window.print()}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, gap: '6px' }}
          >
            <Printer size={15} />
            <span>In / Tải PDF</span>
          </button>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ padding: '8px 24px', fontSize: '0.82rem', fontWeight: 800 }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
