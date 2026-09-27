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
 * Handles logo variants, responsive sizing, and guarantees aspect-ratio preservation (object-fit: contain).
 * Sourced directly from master uploads:
 * - Horizontal: /logo.png (/logo-horizontal.png)
 * - Stacked: /logo-stacked.png (/LogoPH.png)
 * - Mark: /logo-icon.png
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'horizontal',
  height = 40,
  className = '',
  alt = 'Tin Học Gen Z — Học Thiệt, Thi Thật, Giá Trị Thật',
  onClick,
  style,
  loading = 'eager'
}) => {
  const getLogoSrc = (): string => {
    switch (variant) {
      case 'dark':
      case 'horizontal':
        return '/logo.png';
      case 'stacked':
        return '/logo-stacked.png';
      case 'mark':
        return '/logo-icon.png';
      default:
        return '/logo.png';
    }
  };

  const computedHeight = typeof height === 'number' ? `${height}px` : height;

  // For dark variant on dark background (like Admin sidebar), provide high-contrast presentation if needed
  if (variant === 'dark') {
    return (
      <div
        className={`brand-logo-dark-wrapper ${className}`}
        onClick={onClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.96)',
          borderRadius: '8px',
          padding: '4px 10px',
          cursor: onClick ? 'pointer' : 'default',
          userSelect: 'none',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
          ...style
        }}
      >
        <img
          src={getLogoSrc()}
          alt={alt}
          loading={loading}
          style={{
            display: 'block',
            height: computedHeight,
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain'
          }}
        />
      </div>
    );
  }

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
