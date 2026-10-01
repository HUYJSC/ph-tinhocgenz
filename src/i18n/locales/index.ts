import { SupportedLocale, TranslationDictionary } from '../types';
import { vi } from './vi';
import { en } from './en';
import { zh } from './zh';
import { ja } from './ja';
import { ko } from './ko';

export const DICTIONARIES: Record<SupportedLocale, TranslationDictionary> = {
  vi,
  en,
  zh,
  ja,
  ko
};

/**
 * Resolves a translation string with fallback to Vietnamese ('vi')
 * and variable parameter replacement (e.g. {name} -> 'Huy').
 */
export function getTranslation(
  locale: SupportedLocale,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict = DICTIONARIES[locale] || DICTIONARIES.vi;
  let text = dict[key];

  // Fallback to Vietnamese if missing in selected language
  if (!text && locale !== 'vi') {
    text = DICTIONARIES.vi[key];
  }

  // If still missing, return the key as fallback
  if (!text) {
    return key;
  }

  // Replace variable placeholders like {name}
  if (params) {
    Object.entries(params).forEach(([paramKey, val]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
    });
  }

  return text;
}

