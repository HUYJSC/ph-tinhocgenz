import React, { useState } from 'react';
import { DigitalCertificate } from '../../types/edtech';
import { Printer, X, ShieldCheck, Link2, Database, Copy, Check, ChevronDown, ChevronUp, ExternalLink, Cpu } from 'lucide-react';

interface CertificateVerificationModalProps {
  certificate: DigitalCertificate;
  onClose: () => void;
}

export const CertificateVerificationModal: React.FC<CertificateVerificationModalProps> = ({
  certificate,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'certificate' | 'blockchain'>('certificate');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showRawLeaf, setShowRawLeaf] = useState(false);

  const proof = certificate.blockchainProof;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyBtn: React.FC<{ text: string; field: string }> = ({ text, field }) => (
    <button
      onClick={() => handleCopy(text, field)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', color: copiedField === field ? '#10B981' : '#6B7280', display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 600, transition: 'color 0.15s' }}
      title="Sao chép"
    >
      {copiedField === field ? <Check size={12} /> : <Copy size={12} />}
      {copiedField === field ? 'Đã sao chép' : 'Sao chép'}
    </button>
  );

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      className="animate-fade-in"
    >
      <div
        style={{
          width: '100%', maxWidth: '760px', maxHeight: '94vh', overflowY: 'auto',
          borderRadius: '24px', background: 'var(--bg-card)',
          boxShadow: '0 30px 70px rgba(0,0,0,0.45)', position: 'relative',
          border: '1.5px solid rgba(217,119,6,0.35)'
        }}
        className="animate-slide-up"
      >
        {/* ── HEADER BAR ── */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Tab: Chứng chỉ */}
            <button
              onClick={() => setActiveTab('certificate')}
              style={{
                padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === 'certificate' ? 700 : 500,
                background: activeTab === 'certificate' ? 'rgba(217,119,6,0.1)' : 'transparent',
                color: activeTab === 'certificate' ? '#d97706' : 'var(--text-secondary)',
                display: 'inline-flex', alignItems: 'center', gap: '5px'
              }}
            >
              <ShieldCheck size={14} /> Chứng nhận số
            </button>
            {/* Tab: Blockchain */}
            {proof && (
              <button
                onClick={() => setActiveTab('blockchain')}
                style={{
                  padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === 'blockchain' ? 700 : 500,
                  background: activeTab === 'blockchain' ? 'rgba(37,99,235,0.1)' : 'transparent',
                  color: activeTab === 'blockchain' ? '#2563EB' : 'var(--text-secondary)',
                  display: 'inline-flex', alignItems: 'center', gap: '5px'
                }}
              >
                <Database size={14} /> Sổ cái Blockchain
              </button>
            )}
          </div>
          <button onClick={onClose} className="btn btn-icon" style={{ width: '34px', height: '34px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 24px 28px' }}>
          {/* ══ TAB 1: CERTIFICATE ══ */}
          {activeTab === 'certificate' && (
            <div>
              {/* Certificate Frame */}
              <div style={{ border: '3px double #d97706', borderRadius: '16px', padding: '28px 24px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(217,119,6,0.04) 0%, transparent 100%)', position: 'relative', marginBottom: '20px' }}>
                {/* Status Badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '999px', background: 'rgba(16,185,129,0.12)', color: '#059669', fontSize: '0.76rem', fontWeight: 800, marginBottom: '14px' }}>
                  <ShieldCheck size={15} />
                  <span>CHỨNG NHẬN SỐ HỢP LỆ • PH DIGITAL EDUCATION</span>
                  {proof && (
                    <span style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB', padding: '1px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, marginLeft: '4px' }}>
                      ⛓ BLOCKCHAIN
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.82rem', letterSpacing: '0.14em', fontWeight: 900, color: '#d97706', textTransform: 'uppercase', marginBottom: '8px' }}>
                  HỆ THỐNG ĐÀO TẠO & KHẢO THÍ TIN HỌC PH DIGITAL EDUCATION
                </div>

                <h1 style={{ fontSize: '1.7rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  GIẤY CHỨNG NHẬN HOÀN THÀNH
                </h1>

                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Chứng nhận học viên xuất sắc:
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--brand)', margin: '0 0 5px' }}>
                  {certificate.studentName}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Mã định danh học viên: <strong>{certificate.studentCode}</strong>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', maxWidth: '520px', margin: '0 auto 18px', lineHeight: 1.6 }}>
                  Đã hoàn thành xuất sắc toàn bộ nội dung chương trình đào tạo & vượt qua kỳ khảo thí chuẩn hóa:<br />
                  <strong style={{ fontSize: '1.04rem', color: '#d97706' }}>{certificate.courseTitle}</strong>
                </p>

                {certificate.honorsTitle && (
                  <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: '999px', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#fff', fontSize: '0.82rem', fontWeight: 800, marginBottom: '20px' }}>
                    🎖️ {certificate.honorsTitle} • Điểm tổng kết: {certificate.finalScore}/100
                  </div>
                )}

                {/* Footer: IDs + Verification */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px dashed var(--border-color)', paddingTop: '14px', marginTop: '8px', fontSize: '0.77rem', color: 'var(--text-muted)' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div>MÃ TRA CỨU: <strong>{certificate.certificateId}</strong></div>
                    <div>NGÀY CẤP: <strong>{certificate.issueDate}</strong></div>
                    {proof && <div>BLOCK: <strong>#{proof.blockHeight.toLocaleString()}</strong></div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#059669', fontWeight: 800 }}>✓ ĐÃ XÁC THỰC MÃ QR SỐ</div>
                    {proof && <div style={{ color: '#2563EB', fontWeight: 700, fontSize: '0.72rem' }}>⛓ Anchored on {proof.network}</div>}
                    <div style={{ fontSize: '0.71rem' }}>Hội đồng khảo thí TinHocGenZ</div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {proof && (
                    <button
                      onClick={() => setActiveTab('blockchain')}
                      className="btn btn-secondary"
                      style={{ padding: '8px 14px', fontSize: '0.82rem', fontWeight: 700, gap: '6px', display: 'inline-flex', alignItems: 'center', color: '#2563EB', borderColor: '#2563EB' }}
                    >
                      <Database size={14} />
                      <span>Xem Sổ cái Blockchain</span>
                    </button>
                  )}
                  <a href={certificate.verificationUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}
                  >
                    <ExternalLink size={13} /> Tra cứu trực tuyến
                  </a>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => window.print()} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem', fontWeight: 700, gap: '6px', display: 'inline-flex', alignItems: 'center' }}>
                    <Printer size={14} /> In / Tải PDF
                  </button>
                  <button onClick={onClose} className="btn btn-primary" style={{ padding: '8px 22px', fontSize: '0.82rem', fontWeight: 800 }}>
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══ TAB 2: BLOCKCHAIN LEDGER ══ */}
          {activeTab === 'blockchain' && proof && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Status Banner */}
              <div style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E40AF' }}>⛓ Chứng chỉ đã được xác thực & ghi vào Sổ cái Blockchain</div>
                  <div style={{ fontSize: '12px', color: '#3B82F6', marginTop: '2px' }}>Dữ liệu bất biến — không thể làm giả, không thể chỉnh sửa sau khi phát hành</div>
                </div>
              </div>

              {/* Proof Fields Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { icon: <Link2 size={14} />, label: 'Transaction Hash', value: proof.txHash, field: 'txHash', mono: true, color: '#2563EB' },
                  { icon: <Database size={14} />, label: 'Block Height', value: `#${proof.blockHeight.toLocaleString()}`, field: 'blockHeight', mono: false, color: '#059669' },
                  { icon: <Cpu size={14} />, label: 'Smart Contract (SBT)', value: proof.contractAddress, field: 'contract', mono: true, color: '#7C3AED' },
                  { icon: <ShieldCheck size={14} />, label: 'Issuer Public Key', value: proof.issuerKey, field: 'issuerKey', mono: true, color: '#D97706' },
                  { icon: <Database size={14} />, label: 'Certificate Hash (SHA-256)', value: proof.certHash, field: 'certHash', mono: true, color: '#374151' },
                ].map(item => (
                  <div key={item.field} style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '12px 14px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 700, color: item.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {item.icon} {item.label}
                      </div>
                      <CopyBtn text={item.value} field={item.field} />
                    </div>
                    <div style={{ fontSize: item.mono ? '11.5px' : '13px', fontFamily: item.mono ? 'monospace' : 'inherit', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all', lineHeight: 1.5 }}>
                      {item.value}
                    </div>
                  </div>
                ))}

                {/* Network Info */}
                <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '12px 14px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>🌐 Network</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{proof.network}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>📅 Anchored At</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {new Date(proof.anchoredAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>

                {/* Merkle Leaf toggle */}
                <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => setShowRawLeaf(v => !v)}
                    style={{ width: '100%', padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 700 }}
                  >
                    <span>🌿 Merkle Leaf (Payload đã băm)</span>
                    {showRawLeaf ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {showRawLeaf && (
                    <div style={{ padding: '0 14px 12px', fontSize: '11.5px', fontFamily: 'monospace', color: 'var(--text-primary)', wordBreak: 'break-all', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                      {proof.merkleLeaf}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer note */}
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                Dữ liệu được ghi vào Polygon PoS (EduChain Layer) theo chuẩn SBT (Soulbound Token) — không thể chuyển nhượng, không thể xóa.
                <br />Mọi bên thứ ba có thể xác minh bằng mã tra cứu hoặc quét QR trên chứng chỉ.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
