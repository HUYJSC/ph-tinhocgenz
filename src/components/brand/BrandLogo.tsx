import React from 'react';

export type BrandLogoVariant = 'horizontal' | 'stacked' | 'dark' | 'mark';

export interface BrandLogoProps {
  variant?: BrandLogoVariant;
  height?: number | string;
  className?: string;
  alt?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
}

/**
 * BrandLogo — Single Source of Truth for TINHOCGENZ branding.
 * Handles logo variants, responsive sizing, and prevents any distortion (object-fit: contain).
 * When a new master logo is provided, this is the only component requiring source update.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'horizontal',
  height = 40,
  className = '',
  alt = 'Tin Học Gen Z — Nền tảng Đào tạo & Khảo thí',
  onClick,
  style,
  loading = 'eager'
}) => {
  // Map variant to master asset paths
  const getLogoSrc = (): string => {
    switch (variant) {
      case 'dark':
        return '/logo-dark.png';
      case 'stacked':
        return '/LogoPH.png';
      case 'mark':
        return '/logo-icon.png';
      case 'horizontal':
      default:
        return '/logo.png';
    }
  };

  const computedHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <img
      src={getLogoSrc()}
      alt={alt}
      className={`brand-logo brand-logo--${variant} ${className}`}
      onClick={onClick}
      loading={loading}
      style={{
        display: 'inline-block',
        height: computedHeight,
        width: 'auto',
        maxWidth: '100%',
        objectFit: 'contain',
        verticalAlign: 'middle',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        ...style
      }}
    />
  );
};

