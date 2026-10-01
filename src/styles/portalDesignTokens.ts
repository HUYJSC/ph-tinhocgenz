/**
 * LMS Tin Học Gen Z — Unified Design System Tokens
 * Strict adherence to brand palette and typography standards.
 * Eliminates rainbow styles, neon glows, glassmorphism, and non-functional gradients.
 */

export const PORTAL_TOKENS = {
  colors: {
    primary: '#0057B8',
    primaryHover: '#003F88',
    dark: '#003F88',
    text: '#0B2545',
    textSecondary: '#4A5568',
    textMuted: '#718096',
    background: '#F4F8FD',
    card: '#FFFFFF',
    border: '#D9E2F0',
    borderFocus: '#0057B8',
    success: '#16803C',
    successBg: '#E8F5E9',
    warning: '#B54708',
    warningBg: '#FFF4E5',
    error: '#D92D20',
    errorBg: '#FDE8E8',
    divider: '#E2E8F0'
  },
  typography: {
    fontFamily: "'Be Vietnam Pro', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sizes: {
      h1: '24px',
      h2: '20px',
      h3: '16px',
      body: '14px',
      small: '13px',
      caption: '12px'
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    full: '9999px'
  },
  shadows: {
    card: '0 1px 3px rgba(11, 37, 69, 0.05), 0 1px 2px rgba(11, 37, 69, 0.03)',
    hover: '0 4px 12px rgba(0, 87, 184, 0.08)',
    dropdown: '0 8px 24px rgba(11, 37, 69, 0.12)'
  }
} as const;
