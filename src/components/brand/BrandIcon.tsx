import React from 'react';

export interface BrandIconProps {
  size?: number;
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
}

/**
 * BrandIcon — Single Source of Truth for square brand mark / icon.
 * Used for avatars, tab marks, mobile app icons, and compact headers.
 */
export const BrandIcon: React.FC<BrandIconProps> = ({
  size = 32,
  className = '',
  alt = 'Tin Học Gen Z Icon',
  style
}) => {
  return (
    <img
      src="/logo-icon.png"
      alt={alt}
      width={size}
      height={size}
      className={`brand-icon ${className}`}
      style={{
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '8px',
        objectFit: 'contain',
        verticalAlign: 'middle',
        userSelect: 'none',
        ...style
      }}
    />
  );
};

