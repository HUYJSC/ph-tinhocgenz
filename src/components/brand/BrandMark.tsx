import React from 'react';

export interface BrandMarkProps {
  size?: number | string;
  className?: string;
  alt?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

/**
 * BrandMark — Official Brand Mark (Monogram PH with digital nodes).
 * Single Source of Truth for avatars, badges, compact navigation, and icons.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 40,
  className = '',
  alt = 'Tin Học Gen Z Brand Mark',
  onClick,
  style
}) => {
  const computedSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <img
      src="/logo-icon.png"
      alt={alt}
      className={`brand-mark ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-block',
        width: computedSize,
        height: computedSize,
        objectFit: 'contain',
        verticalAlign: 'middle',
        userSelect: 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
    />
  );
};

