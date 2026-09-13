import React, { useState } from 'react';
import { DigitalCertificate } from '../../types/edtech';
import { CertificateService } from '../../services/certificateService';
import { CertificateCanvasRenderer } from './CertificateCanvasRenderer';
import { X, Database, ShieldCheck, Sliders } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface CertificateViewerModalProps {
  certificate: DigitalCertificate;
  onClose: () => void;
  onUpdateCertificateTemplate?: (certId: string, templateId: string) => void;
}

export const CertificateViewerModal: React.FC<CertificateViewerModalProps> = ({
  certificate,
  onClose,
  onUpdateCertificateTemplate
}) => {
  const allTemplates = CertificateService.getAllTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    certificate.templateId || CertificateService.getDefaultTemplate().id
  );
  const [activeTab, setActiveTab] = useState<'preview' | 'blockchain'>('preview');

  const currentTemplate = allTemplates.find(t => t.id === selectedTemplateId) || allTemplates[0];
  const proof = certificate.blockchainProof;

  const handleTemplateChange = (newTemplateId: string) => {
    setSelectedTemplateId(newTemplateId);
    soundFx.playClick();
    if (onUpdateCertificateTemplate) {
      onUpdateCertificateTemplate(certificate.certificateId, newTemplateId);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '94vh',
          overflowY: 'auto',
          borderRadius: '20px',
          background: '#ffffff',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* ── HEADER MODAL ── */}
        <div style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9',
          background: '#f8fafc',
          borderRadius: '20px 20px 0 0',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('preview')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'preview' ? '#d97706' : 'transparent',
                color: activeTab === 'preview' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ShieldCheck size={15} />
              <span>Chứng Nhận Khung Mẫu</span>
            </button>

            {proof && (
              <button
                onClick={() => setActiveTab('blockchain')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'blockchain' ? '#2563eb' : 'transparent',
                  color: activeTab === 'blockchain' ? '#ffffff' : '#64748b',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Database size={15} />
                <span>Bằng Chứng Sổ Cái Blockchain</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Bộ chọn khung mẫu nhanh */}
            {activeTab === 'preview' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={14} color="#64748b" />
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Mẫu khung:</span>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#1e293b',
                    outline: 'none',
                    maxWidth: '220px'
                  }}
                >
                  {allTemplates.map(tpl => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} {tpl.isDefault ? '(Mặc định)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(226, 232, 240, 0.6)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── BODY MODAL ── */}
        <div style={{ padding: '20px 24px', flex: 1 }}>
          {activeTab === 'preview' ? (
            <CertificateCanvasRenderer
              certificate={certificate}
              template={currentTemplate}
              showActions={true}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Banner Sổ cái */}
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0
                }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e40af' }}>
                    Chứng chỉ đã được neo chuỗi xác thực trên Sổ Cái (EduChain / Polygon Layer)
                  </div>
                  <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '2px' }}>
                    Mỗi lần cấp phát hoặc chỉnh sửa đều tạo chuỗi khối hash bảo mật bất biến.
                  </div>
                </div>
              </div>

              {/* Thông số kỹ thuật Blockchain */}
              {proof && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '10px',
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '13px'
                }}>
                  <div>
                    <strong style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Transaction Hash</strong>
                    <code style={{ color: '#2563eb', wordBreak: 'break-all', fontFamily: 'monospace' }}>{proof.txHash}</code>
                  </div>
                  <div>
                    <strong style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Certificate Hash (SHA-256)</strong>
                    <code style={{ color: '#0f172a', wordBreak: 'break-all', fontFamily: 'monospace' }}>{proof.certHash}</code>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div>
                      <strong style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Khối Block</strong>
                      <span style={{ fontWeight: 700, color: '#059669' }}>#{proof.blockHeight.toLocaleString()}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Mạng Lưới</strong>
                      <span style={{ fontWeight: 700, color: '#1e40af' }}>{proof.network}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Thời Gian Neo</strong>
                      <span style={{ fontWeight: 600, color: '#475569' }}>{proof.anchoredAt}</span>
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Merkle Leaf Payload</strong>
                    <code style={{ background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'block', color: '#64748b', fontSize: '12px' }}>
                      {proof.merkleLeaf}
                    </code>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
