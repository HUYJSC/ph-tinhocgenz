import React, { useRef, useState, useEffect } from 'react';
import { DigitalCertificate } from '../../types/edtech';
import { CertificateTemplate, TemplateFieldConfig } from '../../types/certificateTemplate';
import { Download, Printer, ShieldCheck, Check, Copy } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface CertificateCanvasRendererProps {
  certificate: DigitalCertificate;
  template: CertificateTemplate;
  showActions?: boolean;
  scale?: number; // Tỷ lệ thu phóng (mặc định 1)
  onDownloaded?: () => void;
}

export const CertificateCanvasRenderer: React.FC<CertificateCanvasRendererProps> = ({
  certificate,
  template,
  showActions = true,
  scale = 1,
  onDownloaded
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrImageDataUrl, setQrImageDataUrl] = useState<string>('');

  // Tạo URL mã QR xác thực online hoặc fallback SVG
  const verificationUrl = certificate.verificationUrl || `https://hoctructuyen.tinhocgenz.io.vn/verify/${certificate.certificateId}`;

  useEffect(() => {
    // Tải mã QR dạng ảnh từ API công khai, hoặc dùng SVG fallback
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          setQrImageDataUrl(canvas.toDataURL('image/png'));
        }
      } catch {
        setQrImageDataUrl(qrUrl);
      }
    };
    img.onerror = () => {
      setQrImageDataUrl(qrUrl);
    };
    img.src = qrUrl;
  }, [verificationUrl]);

  // Xuất file ảnh PNG độ nét cao (Canvas 1754 x 1240 px - A4 Landscape @ 150-300 DPI)
  const handleDownloadPNG = async () => {
    setIsExporting(true);
    soundFx.playClick();
    try {
      const canvas = document.createElement('canvas');
      const width = 1754; // A4 ngang
      const height = 1240;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Vẽ nền (Background image hoặc default vector)
      if (template.backgroundImageUrl) {
        await new Promise<void>((resolve) => {
          const bgImg = new Image();
          bgImg.crossOrigin = 'anonymous';
          bgImg.onload = () => {
            ctx.drawImage(bgImg, 0, 0, width, height);
            resolve();
          };
          bgImg.onerror = () => {
            drawFallbackVectorBackground(ctx, width, height, template.id);
            resolve();
          };
          bgImg.src = template.backgroundImageUrl!;
        });
      } else {
        drawFallbackVectorBackground(ctx, width, height, template.id);
      }

      // 2. Hàm vẽ text trường dữ liệu
      const renderField = (field: TemplateFieldConfig, text: string) => {
        if (!field.visible || !text) return;
        const fontScale = width / 1200; // Tỷ lệ theo chuẩn 1200px
        const finalFontSize = Math.round(field.fontSize * fontScale);
        const weight = field.fontWeight || 'bold';
        const family = field.fontFamily || 'Inter, sans-serif';
        ctx.font = `${weight} ${finalFontSize}px ${family}`;
        ctx.fillStyle = field.color || '#0f172a';
        ctx.textAlign = (field.align || 'center') as CanvasTextAlign;
        ctx.textBaseline = 'middle';

        const posX = (field.x / 100) * width;
        const posY = (field.y / 100) * height;

        let content = `${field.prefix || ''}${text}${field.suffix || ''}`;
        if (field.uppercase) content = content.toUpperCase();

        ctx.fillText(content, posX, posY);
      };

      const f = template.fields;
      renderField(f.organization, certificate.organization || 'CÔNG TY TNHH PH – TIN HỌC GEN Z');
      renderField(f.title, f.title.prefix || 'GIẤY CHỨNG NHẬN');
      renderField(f.subtitle, f.subtitle.prefix || 'Chứng nhận học viên:');
      renderField(f.studentName, certificate.studentName);
      renderField(f.studentCode, certificate.studentCode);
      renderField(f.courseTitle, certificate.courseTitle);
      renderField(f.finalScore, `${certificate.finalScore}`);
      if (certificate.honorsTitle) {
        renderField(f.honorsTitle, certificate.honorsTitle);
      }
      renderField(f.issueDate, certificate.issueDate);
      renderField(f.certificateId, certificate.certificateId);
      renderField(f.signatoryLeftTitle, f.signatoryLeftTitle.prefix || 'HỘI ĐỒNG KHẢO THÍ');
      renderField(f.signatoryLeftName, f.signatoryLeftName.prefix || 'Ban Đào Tạo');
      renderField(f.signatoryRightTitle, certificate.signatoryTitle || f.signatoryRightTitle.prefix || 'GIÁM ĐỐC TRUNG TÂM');
      renderField(f.signatoryRightName, certificate.signatoryName || f.signatoryRightName.prefix || 'ThS. Đinh Huy');

      // 3. Vẽ mã QR
      if (f.qrCode.visible && qrImageDataUrl) {
        await new Promise<void>((resolve) => {
          const qrImg = new Image();
          qrImg.crossOrigin = 'anonymous';
          qrImg.onload = () => {
            const qrScale = width / 1200;
            const qrSize = Math.round(f.qrCode.size * qrScale);
            const qrX = (f.qrCode.x / 100) * width - qrSize / 2;
            const qrY = (f.qrCode.y / 100) * height - qrSize / 2;

            // Nền trắng cho QR
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8);
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
            resolve();
          };
          qrImg.onerror = () => resolve();
          qrImg.src = qrImageDataUrl;
        });
      }

      // 4. Nếu chứng chỉ bị thu hồi, in watermark chéo
      if (certificate.status === 'revoked') {
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.font = 'bold 80px sans-serif';
        ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ĐÃ THU HỒI / REVOKED', 0, 0);
        ctx.restore();
      }

      // Xuất file tải về
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ChungChi-${certificate.certificateId}-${certificate.studentCode}.png`;
      link.href = dataUrl;
      link.click();
      soundFx.playCorrect();
      if (onDownloaded) onDownloaded();
    } catch (e) {
      console.error('Lỗi xuất ảnh chứng chỉ:', e);
      soundFx.playIncorrect();
    } finally {
      setIsExporting(false);
    }
  };

  // In ấn trực tiếp qua trình duyệt
  const handlePrint = () => {
    soundFx.playClick();
    window.print();
  };

  // Sao chép liên kết xác thực
  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl).catch(() => {});
    setCopiedLink(true);
    soundFx.playClick();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const f = template.fields;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* ── ACTION TOOLBAR ── */}
      {showActions && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '850px',
          marginBottom: '14px',
          padding: '8px 12px',
          background: 'rgba(255, 255, 255, 0.85)',
          borderRadius: '12px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              background: certificate.status === 'valid' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              color: certificate.status === 'valid' ? '#059669' : '#dc2626'
            }}>
              <ShieldCheck size={14} />
              {certificate.status === 'valid' ? 'Chứng chỉ Hợp lệ' : 'ĐÃ THU HỒI'}
            </span>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              Khung: <strong>{template.name}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopyLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Sao chép liên kết tra cứu công khai"
            >
              {copiedLink ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copiedLink ? 'Đã sao chép' : 'Sao chép link'}</span>
            </button>

            <button
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Printer size={14} />
              <span>In A4 / PDF</span>
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={isExporting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: isExporting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)'
              }}
            >
              <Download size={14} />
              <span>{isExporting ? 'Đang xuất ảnh...' : 'Tải Ảnh Gốc (PNG)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── CERTIFICATE CONTAINER (A4 Landscape 1.414 ratio) ── */}
      <div
        ref={containerRef}
        id={`cert-frame-${certificate.certificateId}`}
        style={{
          width: '100%',
          maxWidth: '850px',
          aspectRatio: '1.414 / 1',
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.15)',
          background: '#ffffff',
          userSelect: 'none',
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center'
        }}
      >
        {/* Background Image Frame hoặc Default Vector */}
        {template.backgroundImageUrl ? (
          <img
            src={template.backgroundImageUrl}
            alt="Khung mẫu chứng chỉ"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1
            }}
          />
        ) : (
          <DefaultVectorBackground templateId={template.id} />
        )}

        {/* CÁC LỚP CHỮ ĐƯỢC CĂN THEO TỌA ĐỘ PHẦN TRĂM CỦA TEMPLATE */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}>
          {/* Đơn vị cấp */}
          {f.organization.visible && (
            <FieldText
              config={f.organization}
              text={certificate.organization || f.organization.prefix || 'CÔNG TY TNHH PH – TIN HỌC GEN Z'}
            />
          )}

          {/* Tiêu đề chứng chỉ */}
          {f.title.visible && (
            <FieldText
              config={f.title}
              text={f.title.prefix || 'GIẤY CHỨNG NHẬN'}
            />
          )}

          {/* Phụ đề */}
          {f.subtitle.visible && (
            <FieldText
              config={f.subtitle}
              text={f.subtitle.prefix || 'Chứng nhận học viên hoàn thành:'}
            />
          )}

          {/* Họ và tên học viên */}
          {f.studentName.visible && (
            <FieldText
              config={f.studentName}
              text={certificate.studentName}
            />
          )}

          {/* Mã học viên */}
          {f.studentCode.visible && (
            <FieldText
              config={f.studentCode}
              text={certificate.studentCode}
            />
          )}

          {/* Tên khóa học / Môn */}
          {f.courseTitle.visible && (
            <FieldText
              config={f.courseTitle}
              text={certificate.courseTitle}
            />
          )}

          {/* Điểm số */}
          {f.finalScore.visible && (
            <FieldText
              config={f.finalScore}
              text={`${certificate.finalScore}`}
            />
          )}

          {/* Danh hiệu / Xếp loại */}
          {f.honorsTitle.visible && certificate.honorsTitle && (
            <FieldText
              config={f.honorsTitle}
              text={certificate.honorsTitle}
            />
          )}

          {/* Ngày cấp */}
          {f.issueDate.visible && (
            <FieldText
              config={f.issueDate}
              text={certificate.issueDate}
            />
          )}

          {/* Số hiệu chứng chỉ */}
          {f.certificateId.visible && (
            <FieldText
              config={f.certificateId}
              text={certificate.certificateId}
            />
          )}

          {/* Mã QR xác thực */}
          {f.qrCode.visible && (
            <div
              style={{
                position: 'absolute',
                left: `${f.qrCode.x}%`,
                top: `${f.qrCode.y}%`,
                transform: 'translate(-50%, -50%)',
                width: `${(f.qrCode.size / 850) * 100}%`,
                aspectRatio: '1/1',
                background: '#ffffff',
                padding: '4px',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {qrImageDataUrl ? (
                <img
                  src={qrImageDataUrl}
                  alt="QR Code"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ fontSize: '9px', textAlign: 'center', color: '#64748b' }}>QR</div>
              )}
            </div>
          )}

          {/* Người ký bên trái */}
          {f.signatoryLeftTitle.visible && (
            <FieldText config={f.signatoryLeftTitle} text={f.signatoryLeftTitle.prefix || 'PHÒNG KHẢO THÍ'} />
          )}
          {f.signatoryLeftName.visible && (
            <FieldText config={f.signatoryLeftName} text={f.signatoryLeftName.prefix || 'Ban Đào Tạo'} />
          )}

          {/* Người ký bên phải */}
          {f.signatoryRightTitle.visible && (
            <FieldText
              config={f.signatoryRightTitle}
              text={certificate.signatoryTitle || f.signatoryRightTitle.prefix || 'GIÁM ĐỐC TRUNG TÂM'}
            />
          )}
          {f.signatoryRightName.visible && (
            <FieldText
              config={f.signatoryRightName}
              text={certificate.signatoryName || f.signatoryRightName.prefix || 'ThS. Đinh Huy'}
            />
          )}
        </div>

        {/* WATERMARK NẾU BỊ THU HỒI */}
        {certificate.status === 'revoked' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            background: 'rgba(239, 68, 68, 0.12)',
            pointerEvents: 'none'
          }}>
            <div style={{
              transform: 'rotate(-25deg)',
              border: '4px solid #dc2626',
              color: '#dc2626',
              padding: '12px 36px',
              borderRadius: '12px',
              fontSize: '28px',
              fontWeight: 900,
              letterSpacing: '0.15em',
              background: 'rgba(255, 255, 255, 0.92)',
              boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)'
            }}>
              CHỨNG CHỈ ĐÃ BỊ THU HỒI
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── HELPER COMPONENT RENDER TỪNG TRƯỜNG CHỮ ──────────────────────────────
const FieldText: React.FC<{ config: TemplateFieldConfig; text: string }> = ({ config, text }) => {
  if (!config.visible || !text) return null;
  const content = `${config.prefix || ''}${text}${config.suffix || ''}`;

  let textAlign = config.align || 'center';
  let transform = 'translate(-50%, -50%)';
  if (textAlign === 'left') transform = 'translate(0, -50%)';
  if (textAlign === 'right') transform = 'translate(-100%, -50%)';

  return (
    <div
      style={{
        position: 'absolute',
        left: `${config.x}%`,
        top: `${config.y}%`,
        transform,
        fontSize: `calc(${config.fontSize}px * 0.72)`, // Scale tỷ lệ xem trên màn hình chuẩn
        fontWeight: config.fontWeight || 'normal',
        color: config.color || '#0f172a',
        fontFamily: config.fontFamily || 'Inter, sans-serif',
        textAlign,
        letterSpacing: config.letterSpacing || 'normal',
        textTransform: config.uppercase ? 'uppercase' : 'none',
        whiteSpace: 'nowrap'
      }}
    >
      {content}
    </div>
  );
};

// ─── KHUNG VECTOR NỀN DỰ PHÒNG CHUYÊN NGHIỆP ───────────────────────────────
const DefaultVectorBackground: React.FC<{ templateId: string }> = ({ templateId }) => {
  const isBlue = templateId === 'tpl-global-blue';
  const isMinimal = templateId === 'tpl-modern-minimal';

  if (isMinimal) {
    return (
      <div style={{ position: 'absolute', inset: 0, background: '#fafaf9', border: '8px solid #f1f5f9', padding: '16px', boxSizing: 'border-box' }}>
        <div style={{ width: '100%', height: '100%', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
      </div>
    );
  }

  const primaryColor = isBlue ? '#1e40af' : '#b45309';
  const secondaryColor = isBlue ? '#3b82f6' : '#d97706';

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1200 850"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, zIndex: 1 }}
    >
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor={isBlue ? '#f0f7ff' : '#fffbeb'} />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="50%" stopColor={secondaryColor} />
          <stop offset="100%" stopColor={primaryColor} />
        </linearGradient>
      </defs>

      {/* Nền giấy hoa văn nhẹ */}
      <rect width="1200" height="850" fill="url(#bgGrad)" />

      {/* Khung viền ngoài */}
      <rect x="24" y="24" width="1152" height="802" fill="none" stroke="url(#goldBorder)" strokeWidth="6" rx="8" />

      {/* Khung viền trong */}
      <rect x="36" y="36" width="1128" height="778" fill="none" stroke={secondaryColor} strokeWidth="1.5" strokeDasharray="6 3" rx="6" />

      {/* Hoa văn 4 góc */}
      {[
        { x: 30, y: 30, rot: 0 },
        { x: 1170, y: 30, rot: 90 },
        { x: 1170, y: 820, rot: 180 },
        { x: 30, y: 820, rot: 270 }
      ].map((pos, idx) => (
        <g key={idx} transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rot})`}>
          <path d="M 0 0 L 40 0 L 40 8 L 8 8 L 8 40 L 0 40 Z" fill={primaryColor} />
          <circle cx="16" cy="16" r="4" fill={secondaryColor} />
        </g>
      ))}

      {/* Dấu mộc số nổi PH DIGITAL EDUCATION */}
      <g transform="translate(1030, 710)" opacity="0.85">
        <circle cx="0" cy="0" r="54" fill="none" stroke={primaryColor} strokeWidth="3" />
        <circle cx="0" cy="0" r="48" fill="none" stroke={secondaryColor} strokeWidth="1" strokeDasharray="3 2" />
        <circle cx="0" cy="0" r="38" fill="none" stroke={primaryColor} strokeWidth="1.5" />
        <text x="0" y="-8" textAnchor="middle" fill={primaryColor} fontSize="11" fontWeight="bold" fontFamily="Inter">
          ★ TIN HỌC GEN Z ★
        </text>
        <text x="0" y="8" textAnchor="middle" fill={secondaryColor} fontSize="9" fontWeight="bold" fontFamily="Inter">
          CHỨNG NHẬN
        </text>
        <text x="0" y="22" textAnchor="middle" fill={primaryColor} fontSize="8" fontWeight="bold" fontFamily="Inter">
          KHẢO THÍ CHUẨN
        </text>
      </g>
    </svg>
  );
};

// ─── HÀM VẼ KHUNG NỀN LÊN CANVAS EXPORT PNG ─────────────────────────────────
function drawFallbackVectorBackground(ctx: CanvasRenderingContext2D, width: number, height: number, templateId: string) {
  const isBlue = templateId === 'tpl-global-blue';
  const isMinimal = templateId === 'tpl-modern-minimal';

  if (isMinimal) {
    ctx.fillStyle = '#fafaf9';
    ctx.fillRect(0, 0, width, height);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#cbd5e1';
    ctx.strokeRect(30, 30, width - 60, height - 60);
    return;
  }

  const primary = isBlue ? '#1e40af' : '#b45309';
  const secondary = isBlue ? '#3b82f6' : '#d97706';

  // Nền
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.5, isBlue ? '#f0f7ff' : '#fffbeb');
  grad.addColorStop(1, '#ffffff');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Viền ngoài
  ctx.lineWidth = 10;
  ctx.strokeStyle = primary;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  // Viền trong
  ctx.lineWidth = 2;
  ctx.strokeStyle = secondary;
  ctx.strokeRect(52, 52, width - 104, height - 104);

  // Dấu mộc đỏ khảo thí
  ctx.save();
  ctx.translate(width - 240, height - 190);
  ctx.strokeStyle = primary;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 80, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = secondary;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 72, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = primary;
  ctx.font = 'bold 15px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★ TIN HỌC GEN Z ★', 0, -12);
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.fillStyle = secondary;
  ctx.fillText('CHỨNG NHẬN', 0, 10);
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = primary;
  ctx.fillText('KHẢO THÍ CHUẨN 2026', 0, 30);
  ctx.restore();
}

