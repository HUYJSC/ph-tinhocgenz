import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, RefreshCw, X, CheckCircle2, AlertCircle, Zap, ZapOff, ShieldCheck } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface CameraQRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (scannedText: string) => { success: boolean; message: string };
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

        const config = {
          fps: 15,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0
        };

        await html5QrCode.start(
          { facingMode: facingMode },
          config,
          (decodedText) => {
            if (isCancelled) return;
            handleDecodedText(decodedText);
          },
          () => {
            // Scanning in progress, ignore frame errors
          }
        );

        if (!isCancelled) {
          setIsScanning(true);
          // Check torch capability
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
            err?.message || 'Không thể truy cập camera. Vui lòng cấp quyền camera trong trình duyệt của bạn.'
          );
          setIsScanning(false);
        }
      }
    };

    // Small delay to ensure DOM element is mounted
    const timeout = setTimeout(startScanner, 200);

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

  const handleDecodedText = (text: string) => {
    // Parse PIN or token from URL params if full URL
    let tokenOrPin = text.trim();
    try {
      if (text.includes('?') && text.includes('pin=')) {
        const url = new URL(text);
        tokenOrPin = url.searchParams.get('pin') || url.searchParams.get('token') || text;
      }
    } catch (e) {}

    const result = onScanResult(tokenOrPin);

    if (result.success) {
      soundFx.playVictory();
      setScanSuccessResult(result.message);
      setIsScanning(false);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }

      // Auto close after 2.5s
      setTimeout(() => {
        onClose();
      }, 2500);
    } else {
      soundFx.playIncorrect();
      setScannerError(result.message);
      setTimeout(() => {
        setScannerError(null);
      }, 3500);
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
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="card animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '20px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          border: '1px solid var(--border-color)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn btn-ghost"
          style={{
            position: 'absolute', top: '14px', right: '14px',
            padding: '6px', zIndex: 10,
            background: 'var(--bg-glass)', borderRadius: '50%'
          }}
        >
          <X size={18} />
        </button>

        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--brand)', background: 'var(--brand-light)', padding: '2px 10px', borderRadius: 'var(--radius-full)', fontWeight: 800, marginBottom: '6px' }}>
            <ShieldCheck size={13} />
            <span>QUÉT CAMERA TRỰC TIẾP CHỐNG GIAN LẬN</span>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Quét Mã QR Điểm Danh
          </h3>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>
            Hướng camera về phía mã QR trên màn hình chiếu của giáo viên
          </p>
        </div>

        {/* Camera Scanner Viewport Container */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1',
          maxHeight: '300px',
          background: '#000000',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
        }}>
          {/* HTML5 QR Container */}
          <div
            id={scannerContainerId}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Scanner Overlay Laser & Corner Frame */}
          {isScanning && !scanSuccessResult && (
            <div style={{
              position: 'absolute',
              inset: '20px',
              border: '2px dashed rgba(79, 110, 247, 0.6)',
              borderRadius: '16px',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Laser Animation Bar */}
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '2.5px',
                background: 'linear-gradient(90deg, transparent 0%, #10b981 50%, transparent 100%)',
                boxShadow: '0 0 12px #10b981',
                animation: 'scanLaser 2s infinite ease-in-out',
                top: 0
              }} />

              {/* Viewfinder Target Icon */}
              <Camera size={36} color="rgba(255,255,255,0.4)" />
            </div>
          )}

          {/* Success Overlay Banner */}
          {scanSuccessResult && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(16, 185, 129, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              textAlign: 'center',
              color: '#ffffff',
              zIndex: 20
            }}>
              <CheckCircle2 size={54} color="#ffffff" style={{ marginBottom: '10px' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>ĐIỂM DANH THÀNH CÔNG!</div>
              <div style={{ fontSize: '0.82rem', marginTop: '6px', opacity: 0.95 }}>{scanSuccessResult}</div>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {scannerError && (
          <div style={{
            marginTop: '12px',
            padding: '10px 14px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#ef4444',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{scannerError}</span>
          </div>
        )}

        {/* Camera Control Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '14px' }}>
          <button
            onClick={toggleCamera}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.78rem', fontWeight: 700, gap: '6px' }}
          >
            <RefreshCw size={14} />
            <span>Đổi Camera ({facingMode === 'environment' ? 'Sau' : 'Trước'})</span>
          </button>

          {hasTorch && (
            <button
              onClick={toggleTorch}
              className="btn btn-secondary"
              style={{
                padding: '8px 14px', fontSize: '0.78rem', fontWeight: 700, gap: '6px',
                color: isTorchOn ? '#f59e0b' : 'var(--text-secondary)'
              }}
            >
              {isTorchOn ? <Zap size={14} fill="#f59e0b" /> : <ZapOff size={14} />}
              <span>{isTorchOn ? 'Tắt Đèn' : 'Bật Đèn'}</span>
            </button>
          )}
        </div>

        {/* Student info badge */}
        <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          Tài khoản điểm danh: <b>{studentName}</b> ({studentCode})
        </div>
      </div>

      <style>{`
        @keyframes scanLaser {
          0% { top: 5%; opacity: 0.8; }
          50% { top: 95%; opacity: 1; }
          100% { top: 5%; opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};
