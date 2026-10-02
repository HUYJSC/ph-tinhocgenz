import React, { useState } from 'react';

export interface MascotChatbotButtonProps {
  onClick: () => void;
  isOpen?: boolean;
  isThinking?: boolean;
  hasNewMessage?: boolean;
  tooltipText?: string;
  size?: number; // Default 60px desktop, 54px mobile
  className?: string;
}

/**
 * MascotChatbotButton
 * Nút kích hoạt chatbot sử dụng chính xác hình ảnh robot mascot từ file /chatbot.ai.png
 * Đảm bảo:
 * - Giữ nguyên 100% hình dáng, nhận diện robot giáo dục (mặt xanh đậm, tai xanh, mắt cười, pixel trên đầu)
 * - Nền trắng/xanh rất nhạt, viền xanh thương hiệu mảnh (#0057B8)
 * - Object-fit: contain, không cắt tay, tai hay khối pixel
 * - Scale 1.04 khi hover, tooltip "Bạn cần hỗ trợ?"
 * - Hỗ trợ bàn phím, z-index chuẩn không che modal
 */
export const MascotChatbotButton: React.FC<MascotChatbotButtonProps> = ({
  onClick,
  isOpen = false,
  isThinking = false,
  hasNewMessage = false,
  tooltipText = 'Bạn cần hỗ trợ?',
  size,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Kích thước chuẩn: desktop 60px, mobile 54px
  const defaultSize = typeof window !== 'undefined' && window.innerWidth < 768 ? 54 : 60;
  const btnSize = size || defaultSize;

  return (
    <div
      className={`mascot-chatbot-button-wrapper ${className}`}
      style={{
        position: 'fixed',
        bottom: '22px',
        right: '22px',
        zIndex: 920,
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip khi hover */}
      {isHovered && !isOpen && (
        <div
          role="tooltip"
          style={{
            backgroundColor: '#0B2545',
            color: '#FFFFFF',
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(11, 37, 69, 0.18)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            animation: 'mascotFadeIn 0.18s ease-out',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <span>{tooltipText}</span>
          <span style={{ fontSize: '14px' }}>✨</span>
        </div>
      )}

      {/* Nút bấm Mascot chính */}
      <button
        type="button"
        onClick={onClick}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label="Mở Trợ lý Gen Z"
        aria-expanded={isOpen}
        title={tooltipText}
        style={{
          position: 'relative',
          width: `${btnSize}px`,
          height: `${btnSize}px`,
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          border: isFocused ? '2px solid #0057B8' : '1.5px solid rgba(0, 87, 184, 0.35)',
          outline: isFocused ? '3px solid rgba(0, 87, 184, 0.25)' : 'none',
          boxShadow: isHovered
            ? '0 8px 24px rgba(0, 87, 184, 0.22), 0 2px 6px rgba(0, 0, 0, 0.06)'
            : '0 4px 16px rgba(0, 87, 184, 0.14), 0 2px 4px rgba(0, 0, 0, 0.04)',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease',
          transform: isHovered ? 'scale(1.04)' : isThinking ? 'scale(1.02)' : 'scale(1)',
          animation: isThinking ? 'mascotGentlePulse 2s infinite ease-in-out' : 'mascotGentleFloat 4s infinite ease-in-out',
          userSelect: 'none'
        }}
      >
        {/* Hình ảnh robot mascot nguyên bản từ chatbot.ai.png */}
        <img
          src="/chatbot.ai.png"
          alt="Mascot Trợ lý Gen Z"
          loading="eager"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            pointerEvents: 'none',
            filter: 'drop-shadow(0 2px 4px rgba(0, 87, 184, 0.1))'
          }}
          onError={(e) => {
            // Fallback đến /assets/chatbot.ai.png nếu cần
            const target = e.currentTarget;
            if (!target.src.includes('/assets/')) {
              target.src = '/assets/chatbot.ai.png';
            }
          }}
        />

        {/* Chấm trạng thái tin nhắn mới hoặc trạng thái AI */}
        {hasNewMessage && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '11px',
              height: '11px',
              borderRadius: '50%',
              backgroundColor: '#0057B8',
              border: '2px solid #FFFFFF',
              boxShadow: '0 0 0 1px rgba(0, 87, 184, 0.2)'
            }}
          />
        )}

        {/* Chấm xanh đang trực tuyến khi bình thường */}
        {!hasNewMessage && (
          <span
            style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: isThinking ? '#F59E0B' : '#16803C',
              border: '2px solid #FFFFFF',
              boxShadow: '0 0 0 1px rgba(22, 128, 60, 0.2)'
            }}
            title={isThinking ? 'AI đang suy nghĩ...' : 'Sẵn sàng hỗ trợ'}
          />
        )}
      </button>

      {/* Animation Styles */}
      <style>{`
        @keyframes mascotGentleFloat {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-3px) scale(1.01);
          }
        }
        @keyframes mascotGentlePulse {
          0%, 100% {
            transform: scale(1.02);
            box-shadow: 0 4px 16px rgba(0, 87, 184, 0.16);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 8px 24px rgba(0, 87, 184, 0.28);
          }
        }
        @keyframes mascotFadeIn {
          from {
            opacity: 0;
            transform: translateX(4px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
