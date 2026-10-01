/**
 * Multi-Language (i18n) Type Definitions — TINHOCGENZ LMS
 * Defines supported locales, language metadata, and dictionary structures.
 */

export type SupportedLocale = 'vi' | 'en' | 'zh' | 'ja' | 'ko';

export interface LocaleConfig {
  code: SupportedLocale;
  label: string;          // Name in its own native language (e.g. "Tiếng Việt", "English", "简体中文", "日本語", "한국어")
  englishName: string;
  flag: string;           // Country/Region flag emoji or code
  dateFormat: string;
}

export const SUPPORTED_LOCALES: LocaleConfig[] = [
  {
    code: 'vi',
    label: 'Tiếng Việt',
    englishName: 'Vietnamese',
    flag: '🇻🇳',
    dateFormat: 'dd/MM/yyyy'
  },
  {
    code: 'en',
    label: 'English',
    englishName: 'English',
    flag: '🇺🇸',
    dateFormat: 'MM/dd/yyyy'
  },
  {
    code: 'zh',
    label: '简体中文',
    englishName: 'Simplified Chinese',
    flag: '🇨🇳',
    dateFormat: 'yyyy-MM-dd'
  },
  {
    code: 'ja',
    label: '日本語',
    englishName: 'Japanese',
    flag: '🇯🇵',
    dateFormat: 'yyyy/MM/dd'
  },
  {
    code: 'ko',
    label: '한국어',
    englishName: 'Korean',
    flag: '🇰🇷',
    dateFormat: 'yyyy.MM.dd'
  }
];

export const DEFAULT_LOCALE: SupportedLocale = 'vi';

export const LOCALE_STORAGE_KEY = 'phtgz_locale';

export type TranslationDictionary = Record<string, string>;

