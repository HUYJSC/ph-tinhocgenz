import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { RefreshCw, X, CheckCircle2, AlertCircle, Zap, ZapOff, UserCheck } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { getCurrentCoordinates } from '../../utils/securityUtils';

interface CameraQRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (scannedText: string, coords?: { latitude: number; longitude: number }) => Promise<{ success: boolean; message: string; isMakeup?: boolean }> | { success: boolean; message: string; isMakeup?: boolean };
  studentName: string;
  studentCode: string;
}

export const CameraQRScanner: React.FC<CameraQRScannerProps> = ({
  isOpen,
  onClose,
  onScanResult,
  studentName,
  studentCode
}) => {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanSuccessResult, setScanSuccessResult] = useState<string | null>(null);
  const [isMakeupNotice, setIsMakeupNotice] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'attendance-qr-reader-viewport';

  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode: Html5Qrcode | null = null;
    let isCancelled = false;

    const startScanner = async () => {
      try {
        setScannerError(null);
        setScanSuccessResult(null);
        setIsMakeupNotice(false);

        // Clean up previous instance
        if (scannerRef.current) {
          try {
            await scannerRef.current.stop();
            scannerRef.current.clear();
          } catch (e) {}
        }

        html5QrCode = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false
        });

        scannerRef.current = html5QrCode;

        // Config without hardcoded qrbox size to let full camera view scan smoothly
        const config = {
          fps: 24,
          aspectRatio: 1.0
        };

        await html5QrCode.start(
          { facingMode: facingMode },
          config,
          (decodedText) => {
            if (isCancelled) return;
            handleDecodedText(decodedText);
          },
          () => {}
        );

        if (!isCancelled) {
          setIsScanning(true);
          try {
            const capabilities = html5QrCode.getRunningTrackCameraCapabilities();
            if (capabilities && (capabilities as any).torchFeature && (capabilities as any).torchFeature().isSupported()) {
              setHasTorch(true);
            }
          } catch (e) {}
        }
      } catch (err: any) {
        console.error('QR Scanner init error:', err);
        if (!isCancelled) {
          setScannerError(
            err?.message || 'Không thể truy cập camera. Vui lòng cấp quyền Camera trong cài đặt trình duyệt của bạn.'
          );
          setIsScanning(false);
        }
      }
    };

    const timeout = setTimeout(startScanner, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timeout);
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().then(() => {
            scannerRef.current?.clear();
          }).catch(() => {});
        } catch (e) {}
      }
    };
  }, [isOpen, facingMode]);

  const handleDecodedText = async (text: string) => {
    let tokenOrPin = text.trim();
    try {
      if (text.includes('?') && text.includes('pin=')) {
        const url = new URL(text);
        tokenOrPin = url.searchParams.get('pin') || url.searchParams.get('token') || text;
      }
    } catch (e) {}

    let coords: { latitude: number; longitude: number } | undefined = undefined;
    try {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        coords = await getCurrentCoordinates().catch(() => undefined);
      }
    } catch (e) {}

    try {
      const result = await onScanResult(tokenOrPin, coords);

      if (result.success) {
        soundFx.playVictory();
        setScanSuccessResult(result.message);
        setIsMakeupNotice(!!result.isMakeup);
        setIsScanning(false);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }

        // Auto close after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3200);
      } else {
        soundFx.playIncorrect();
        setScannerError(result.message);
        setTimeout(() => {
          setScannerError(null);
        }, 4500);
      }
    } catch (err: any) {
      soundFx.playIncorrect();
      setScannerError(err?.message || 'Lỗi xác thực quét QR.');
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
    soundFx.playClick();
  };

  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      const nextTorch = !isTorchOn;
      await (scannerRef.current as any).applyVideoConstraints({
        advanced: [{ torch: nextTorch }]
      });
      setIsTorchOn(nextTorch);
      soundFx.playClick();
    } catch (e) {
      console.error('Torch error', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 15, 30, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          color: '#f8fafc',
          padding: '22px'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 30,
            transition: 'all 0.2s ease'
          }}
        >
          <X size={18} />
        </button>

        {/* HUD Scanner Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.72rem',
            color: '#38bdf8',
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '3px 12px',
            borderRadius: '999px',
            fontWeight: 800,
            letterSpacing: '0.05em',
            marginBottom: '8px'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#38bdf8', animation: 'pulse 1.5s infinite' }} />
            <span>CAMERA LIVE SCANNER</span>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
            Quét Mã QR Điểm Danh
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0' }}>
            Đưa khung camera về phía mã QR trên màn hình chiếu lớp học
          </p>
        </div>

        {/* High-Tech Viewport Window - Clean Single Frame (No white overlapping box) */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1',
          maxWidth: '340px',
          margin: '0 auto',
          background: '#020617',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '2px solid rgba(56, 189, 248, 0.35)',
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(0, 0, 0, 0.9)'
        }}>
          {/* HTML5 QR Video Element */}
          <div
            id={scannerContainerId}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Clean Single Cyan Reticle Frame */}
          {isScanning && !scanSuccessResult && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {/* 4 Corner Reticles */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', width: '36px', height: '36px', borderTop: '4px solid #38bdf8', borderLeft: '4px solid #38bdf8', borderTopLeftRadius: '10px' }} />
              <div style={{ position: 'absolute', top: '16px', right: '16px', width: '36px', height: '36px', borderTop: '4px solid #38bdf8', borderRight: '4px solid #38bdf8', borderTopRightRadius: '10px' }} />
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', width: '36px', height: '36px', borderBottom: '4px solid #38bdf8', borderLeft: '4px solid #38bdf8', borderBottomLeftRadius: '10px' }} />
              <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '36px', height: '36px', borderBottom: '4px solid #38bdf8', borderRight: '4px solid #38bdf8', borderBottomRightRadius: '10px' }} />

              {/* Glowing Laser Scan Bar */}
              <div style={{
                position: 'absolute',
                left: '16px',
                right: '16px',
                height: '3px',
                background: 'linear-gradient(90deg, transparent 0%, #38bdf8 20%, #10b981 50%, #38bdf8 80%, transparent 100%)',
                boxShadow: '0 0 16px #38bdf8, 0 0 8px #10b981',
                animation: 'cyberLaser 2.2s infinite ease-in-out',
                top: 0
              }} />
            </div>
          )}

          {/* Success Overlay Banner */}
          {scanSuccessResult && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: isMakeupNotice
                ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.96) 0%, rgba(180, 83, 9, 0.96) 100%)'
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.96) 0%, rgba(5, 150, 105, 0.96) 100%)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center',
              color: '#ffffff',
              zIndex: 40
            }} className="animate-fade-in">
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
              }}>
                <CheckCircle2 size={38} color="#ffffff" />
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '-0.01em' }}>
                {isMakeupNotice ? 'ĐÃ GHI NHẬN HỌC BÙ!' : 'ĐIỂM DANH THÀNH CÔNG!'}
              </div>
              <div style={{ fontSize: '0.82rem', marginTop: '8px', opacity: 0.95, lineHeight: 1.5 }}>
                {scanSuccessResult}
              </div>
            </div>
          )}
        </div>

        {/* Error Alert Bar */}
        {scannerError && (
          <div style={{
            marginTop: '14px',
            padding: '10px 14px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '12px',
            color: '#f87171',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }} className="animate-fade-in">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{scannerError}</span>
          </div>
        )}

        {/* Controls Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
          <button
            onClick={toggleCamera}
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#e2e8f0',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} />
            <span>Camera {facingMode === 'environment' ? 'Sau' : 'Trước'}</span>
          </button>

          {hasTorch && (
            <button
              onClick={toggleTorch}
              style={{
                padding: '8px 16px',
                borderRadius: '999px',
                background: isTorchOn ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                border: isTorchOn ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.15)',
                color: isTorchOn ? '#fbbf24' : '#e2e8f0',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              {isTorchOn ? <Zap size={14} fill="#f59e0b" /> : <ZapOff size={14} />}
              <span>{isTorchOn ? 'Tắt Đèn' : 'Bật Đèn'}</span>
            </button>
          )}
        </div>

        {/* Student Active Info Badge */}
        <div style={{
          marginTop: '14px',
          padding: '8px 12px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#94a3b8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserCheck size={14} color="#38bdf8" />
            <span>Học viên: <b style={{ color: '#f8fafc' }}>{studentName}</b></span>
          </div>
          <span style={{
            fontFamily: 'monospace',
            fontWeight: 800,
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            {studentCode}
          </span>
        </div>
      </div>

      <style>{`
        /* Remove internal html5-qrcode white box & shaded borders */
        #attendance-qr-reader-viewport {
          border: none !important;
        }
        #attendance-qr-reader-viewport__scan_region {
          border: none !important;
          box-shadow: none !important;
        }
        #attendance-qr-reader-viewport__scan_region svg,
        #attendance-qr-reader-viewport svg,
        #attendance-qr-reader-viewport img {
          display: none !important;
        }
        #attendance-qr-reader-viewport video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 18px !important;
        }

        @keyframes cyberLaser {
          0% { top: 8%; opacity: 0.6; }
          50% { top: 90%; opacity: 1; }
          100% { top: 8%; opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};
