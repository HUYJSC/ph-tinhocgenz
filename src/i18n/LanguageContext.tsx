import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  SupportedLocale,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  LocaleConfig
} from './types';
import { getTranslation } from './locales';

interface LanguageContextValue {
  currentLocale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: Date | string | number) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  locales: LocaleConfig[];
  currentConfig: LocaleConfig;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const BROWSER_LOCALE_MAP: Record<string, SupportedLocale> = {
  vi: 'vi',
  'vi-vn': 'vi',
  en: 'en',
  'en-us': 'en',
  'en-gb': 'en',
  zh: 'zh',
  'zh-cn': 'zh',
  'zh-tw': 'zh',
  'zh-hk': 'zh',
  ja: 'ja',
  'ja-jp': 'ja',
  ko: 'ko',
  'ko-kr': 'ko'
};

const INTL_LOCALE_TAGS: Record<SupportedLocale, string> = {
  vi: 'vi-VN',
  en: 'en-US',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR'
};

function detectInitialLocale(): SupportedLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  // 1. Explicit user choice from localStorage takes highest priority
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as SupportedLocale;
    if (saved && SUPPORTED_LOCALES.some(l => l.code === saved)) {
      return saved;
    }
  } catch {}

  // 2. User browser language detection
  try {
    const browserLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
    if (browserLang) {
      if (BROWSER_LOCALE_MAP[browserLang]) {
        return BROWSER_LOCALE_MAP[browserLang];
      }
      const prefix = browserLang.split('-')[0];
      if (BROWSER_LOCALE_MAP[prefix]) {
        return BROWSER_LOCALE_MAP[prefix];
      }
    }
  } catch {}

  // 3. Fallback to Vietnamese
  return DEFAULT_LOCALE;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocale, setCurrentLocaleState] = useState<SupportedLocale>(detectInitialLocale);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    if (!SUPPORTED_LOCALES.some(l => l.code === newLocale)) return;
    setCurrentLocaleState(newLocale);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
        document.documentElement.lang = newLocale;

        // Sync with user profile storage if exists
        const userRaw = localStorage.getItem('phtgz_user_profile_v2');
        if (userRaw) {
          const user = JSON.parse(userRaw);
          user.preferredLocale = newLocale;
          localStorage.setItem('phtgz_user_profile_v2', JSON.stringify(user));
        }
      } catch {}
    }
  }, []);

  // Update document language attribute on mount and change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLocale;
    }
  }, [currentLocale]);

  // Translation helper function
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      return getTranslation(currentLocale, key, params);
    },
    [currentLocale]
  );

  // Date formatting by locale
  const formatDate = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
      try {
        const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
        if (isNaN(d.getTime())) return '';
        const tag = INTL_LOCALE_TAGS[currentLocale] || 'vi-VN';
        const defaultOptions: Intl.DateTimeFormatOptions = options || {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        };
        return new Intl.DateTimeFormat(tag, defaultOptions).format(d);
      } catch {
        return String(date);
      }
    },
    [currentLocale]
  );

  // Time formatting by locale
  const formatTime = useCallback(
    (date: Date | string | number): string => {
      try {
        const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
        if (isNaN(d.getTime())) return '';
        const tag = INTL_LOCALE_TAGS[currentLocale] || 'vi-VN';
        return new Intl.DateTimeFormat(tag, {
          hour: '2-digit',
          minute: '2-digit'
        }).format(d);
      } catch {
        return '';
      }
    },
    [currentLocale]
  );

  // Number formatting by locale
  const formatNumber = useCallback(
    (num: number, options?: Intl.NumberFormatOptions): string => {
      try {
        const tag = INTL_LOCALE_TAGS[currentLocale] || 'vi-VN';
        return new Intl.NumberFormat(tag, options).format(num);
      } catch {
        return String(num);
      }
    },
    [currentLocale]
  );

  const currentConfig = useMemo(() => {
    return SUPPORTED_LOCALES.find(l => l.code === currentLocale) || SUPPORTED_LOCALES[0];
  }, [currentLocale]);

  const value = useMemo(
    () => ({
      currentLocale,
      setLocale,
      t,
      formatDate,
      formatTime,
      formatNumber,
      locales: SUPPORTED_LOCALES,
      currentConfig
    }),
    [currentLocale, setLocale, t, formatDate, formatTime, formatNumber, currentConfig]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback for components used outside Provider in isolated unit tests
    return {
      currentLocale: 'vi',
      setLocale: () => {},
      t: (key: string, params?: Record<string, string | number>) => getTranslation('vi', key, params),
      formatDate: (d: any) => String(d),
      formatTime: (d: any) => String(d),
      formatNumber: (n: number) => String(n),
      locales: SUPPORTED_LOCALES,
      currentConfig: SUPPORTED_LOCALES[0]
    };
  }
  return context;
}
