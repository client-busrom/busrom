/**
 * Language Configuration
 *
 * This file defines all supported languages, their flags, and names.
 * Used throughout the CMS for multi-language field support.
 */

/**
 * Supported Language Codes (24 languages)
 *
 * Covers all major global markets excluding mainland China
 */
export const SUPPORTED_LANGUAGES = [
  'en', 'zh', 'es', 'pt', 'fr', 'de', 'it', 'nl', 'sv', 'da',
  'no', 'fi', 'is', 'cs', 'hu', 'pl', 'sk', 'ar', 'he', 'fa',
  'tr', 'az', 'ber', 'ku'
] as const

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]

/**
 * Language Names (English)
 */
export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  zh: 'Chinese (中文)',
  es: 'Spanish (Español)',
  pt: 'Portuguese (Português)',
  fr: 'French (Français)',
  de: 'German (Deutsch)',
  it: 'Italian (Italiano)',
  nl: 'Dutch (Nederlands)',
  sv: 'Swedish (Svenska)',
  da: 'Danish (Dansk)',
  no: 'Norwegian (Norsk)',
  fi: 'Finnish (Suomi)',
  is: 'Icelandic (Íslenska)',
  cs: 'Czech (Čeština)',
  hu: 'Hungarian (Magyar)',
  pl: 'Polish (Polski)',
  sk: 'Slovak (Slovenčina)',
  ar: 'Arabic (العربية)',
  he: 'Hebrew (עברית)',
  fa: 'Persian (فارسی)',
  tr: 'Turkish (Türkçe)',
  az: 'Azerbaijani (Azərbaycan)',
  ber: 'Berber (Tamazight)',
  ku: 'Kurdish (Kurdî)',
}

/**
 * Language Flags (Emoji)
 *
 * Using flag emojis for visual identification
 */
export const LANGUAGE_FLAGS: Record<LanguageCode, string> = {
  en: '🇬🇧',
  zh: '🇨🇳',
  es: '🇪🇸',
  pt: '🇵🇹',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
  nl: '🇳🇱',
  sv: '🇸🇪',
  da: '🇩🇰',
  no: '🇳🇴',
  fi: '🇫🇮',
  is: '🇮🇸',
  cs: '🇨🇿',
  hu: '🇭🇺',
  pl: '🇵🇱',
  sk: '🇸🇰',
  ar: '🇸🇦',
  he: '🇮🇱',
  fa: '🇮🇷',
  tr: '🇹🇷',
  az: '🇦🇿',
  ber: '🏴', // Berber flag
  ku: '🟡', // Kurdish symbol
}

/**
 * RTL (Right-to-Left) Languages
 */
export const RTL_LANGUAGES: LanguageCode[] = ['ar', 'he', 'fa']

/**
 * Check if a language is RTL
 */
export function isRTL(lang: LanguageCode): boolean {
  return RTL_LANGUAGES.includes(lang)
}

/**
 * Get language display name with flag
 */
export function getLanguageDisplay(lang: LanguageCode): string {
  return `${LANGUAGE_FLAGS[lang]} ${LANGUAGE_NAMES[lang]}`
}

/**
 * Generate field names for all languages
 *
 * @param baseName - Base field name (e.g., "name", "description")
 * @returns Array of field names (e.g., ["name_en", "name_zh", ...])
 */
export function generateMultilingualFieldNames(baseName: string): string[] {
  return SUPPORTED_LANGUAGES.map(lang => `${baseName}_${lang}`)
}

/**
 * Get completion statistics for multilingual content
 *
 * @param content - Object with language codes as keys
 * @returns Object with completed and total counts
 */
export function getCompletionStats(content: Record<string, any>): {
  completed: number
  total: number
  percentage: number
  missingLanguages: LanguageCode[]
} {
  const total = SUPPORTED_LANGUAGES.length
  const completed = SUPPORTED_LANGUAGES.filter(
    lang => content[lang] && String(content[lang]).trim() !== ''
  ).length
  const missingLanguages = SUPPORTED_LANGUAGES.filter(
    lang => !content[lang] || String(content[lang]).trim() === ''
  )

  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
    missingLanguages,
  }
}

/**
 * Translation Language Mapping
 *
 * Maps our language codes to translation service language codes
 */
export const TRANSLATION_LANGUAGE_MAP: Record<LanguageCode, string> = {
  en: 'en',
  zh: 'zh',
  es: 'es',
  pt: 'pt',
  fr: 'fr',
  de: 'de',
  it: 'it',
  nl: 'nl',
  sv: 'sv',
  da: 'da',
  no: 'no',
  fi: 'fi',
  is: 'is',
  cs: 'cs',
  hu: 'hu',
  pl: 'pl',
  sk: 'sk',
  ar: 'ar',
  he: 'he',
  fa: 'fa',
  tr: 'tr',
  az: 'az',
  ber: 'ber',
  ku: 'ku',
}
