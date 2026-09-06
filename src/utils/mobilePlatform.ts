/**
 * Mobile Platform Engine for EduQuest / PH Digital Education
 * Calibrates UI/UX specifically for iOS (Apple HIG) and Android (Material 3).
 */

export type MobileOS = 'ios' | 'android' | 'desktop';

export interface PlatformDetails {
  os: MobileOS;
  isMobile: boolean;
  isTablet: boolean;
  isStandalone: boolean;
  hasNotch: boolean;
  supportsTouch: boolean;
}

/**
 * Detect client operating system accurately across Safari, Chrome, WebKit, and PWAs
 */
export function detectMobilePlatform(): MobileOS {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'desktop';
  }

  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';

  // Detect iOS (iPhone, iPad, iPod - including iPadOS desktop safari spoofing)
  const isIOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isIOS) return 'ios';

  // Detect Android
  if (/android/i.test(ua)) {
    return 'android';
  }

  return 'desktop';
}

/**
 * Check if the application is running in installed standalone PWA / WebApp mode
 */
export function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Check if device supports fine or coarse touch input
 */
export function supportsTouchInput(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get full platform diagnostics
 */
export function getPlatformDetails(): PlatformDetails {
  const os = detectMobilePlatform();
  const isStandalone = isStandalonePWA();
  const supportsTouch = supportsTouchInput();

  if (typeof window === 'undefined') {
    return {
      os: 'desktop',
      isMobile: false,
      isTablet: false,
      isStandalone: false,
      hasNotch: false,
      supportsTouch: false
    };
  }

  const width = window.innerWidth;
  const isMobile = os !== 'desktop' || width <= 768;
  const isTablet = width > 768 && width <= 1024 && supportsTouch;

  // Check if device likely has a notch or safe area insets
  const hasNotch =
    typeof window !== 'undefined' &&
    window.CSS &&
    window.CSS.supports &&
    window.CSS.supports('padding-top: env(safe-area-inset-top)') &&
    os === 'ios';

  return {
    os,
    isMobile,
    isTablet,
    isStandalone,
    hasNotch,
    supportsTouch
  };
}

/**
 * Trigger subtle haptic vibration calibrated for mobile devices
 */
export function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(8);
        break;
      case 'medium':
        navigator.vibrate(16);
        break;
      case 'heavy':
        navigator.vibrate([24, 40, 24]);
        break;
    }
  } catch (e) {
    // Vibration ignored if not permitted by user interaction
  }
}

/**
 * Initialize platform classes on <html> and <body> and configure dynamic viewport heights
 */
export function initMobilePlatform(): PlatformDetails {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      os: 'desktop',
      isMobile: false,
      isTablet: false,
      isStandalone: false,
      hasNotch: false,
      supportsTouch: false
    };
  }

  const details = getPlatformDetails();
  const root = document.documentElement;
  const body = document.body;

  // Set OS classes
  root.classList.remove('platform-ios', 'platform-android', 'platform-desktop');
  body.classList.remove('platform-ios', 'platform-android', 'platform-desktop');

  if (details.os === 'ios') {
    root.classList.add('platform-ios');
    body.classList.add('platform-ios');
  } else if (details.os === 'android') {
    root.classList.add('platform-android');
    body.classList.add('platform-android');
  } else {
    root.classList.add('platform-desktop');
    body.classList.add('platform-desktop');
  }

  // Set Touch and Standalone flags
  if (details.isMobile) {
    root.classList.add('is-mobile');
    body.classList.add('is-mobile');
  } else {
    root.classList.remove('is-mobile');
    body.classList.remove('is-mobile');
  }

  if (details.isStandalone) {
    root.classList.add('is-standalone');
    body.classList.add('is-standalone');
  }

  // Configure Dynamic Viewport Height (fixes mobile browser address bar jumps)
  const updateViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    root.style.setProperty('--vh', `${vh}px`);
    root.style.setProperty('--app-height', `${window.innerHeight}px`);
  };

  updateViewportHeight();
  window.addEventListener('resize', updateViewportHeight, { passive: true });
  window.addEventListener('orientationchange', updateViewportHeight, { passive: true });

  return details;
}
