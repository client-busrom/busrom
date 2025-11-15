/**
 * Localization Utilities
 *
 * This module provides utilities for handling multilingual content
 * from Keystone CMS, which stores translations in JSON format.
 *
 * @module lib/localization
 */

/**
 * Multilingual field type
 *
 * Represents a JSON field containing translations in multiple languages
 * Example: { "en": "Hello", "zh": "你好", "es": "Hola" }
 */
export type MultilingualField = Record<string, string> | null | undefined

/**
 * Get localized content from a multilingual JSON field
 *
 * Extraction priority:
 * 1. Try specified locale
 * 2. Fallback to English ('en')
 * 3. Return first available value
 * 4. Return fallback text
 *
 * @param field - Multilingual JSON object from Keystone
 * @param locale - Language code (e.g., 'en', 'zh', 'es')
 * @param fallback - Fallback text if no translation found (default: '')
 * @returns Localized text
 *
 * @example
 * ```typescript
 * const name = { en: "Product", zh: "产品", es: "Producto" }
 * getLocalizedContent(name, 'zh')  // Returns: "产品"
 * getLocalizedContent(name, 'fr')  // Returns: "Product" (fallback to English)
 * getLocalizedContent(null, 'en', 'Untitled')  // Returns: "Untitled"
 * ```
 */
export function getLocalizedContent(
  field: MultilingualField,
  locale: string,
  fallback: string = ''
): string {
  // Check if field is valid
  if (!field || typeof field !== 'object') {
    return fallback
  }

  // 1. Try specified locale
  if (field[locale]) {
    return field[locale]
  }

  // 2. Fallback to English
  if (field['en']) {
    return field['en']
  }

  // 3. Return first available value
  const values = Object.values(field).filter(Boolean)
  if (values.length > 0 && values[0]) {
    return values[0]
  }

  // 4. Return fallback text
  return fallback
}

/**
 * Extract localized content from multiple fields
 *
 * Useful for processing multiple multilingual fields at once
 *
 * @param obj - Object containing multilingual fields
 * @param fields - Array of field names to extract
 * @param locale - Language code
 * @returns Object with localized values
 *
 * @example
 * ```typescript
 * const product = {
 *   name: { en: "Glass Door", zh: "玻璃门" },
 *   description: { en: "High quality", zh: "高质量" }
 * }
 * const localized = getLocalizedObject(product, ['name', 'description'], 'zh')
 * // Returns: { name: "玻璃门", description: "高质量" }
 * ```
 */
export function getLocalizedObject<T extends Record<string, any>>(
  obj: T,
  fields: Array<keyof T>,
  locale: string
): Record<string, string> {
  const result: Record<string, string> = {}

  fields.forEach((field) => {
    const key = String(field)
    result[key] = getLocalizedContent(obj[field], locale)
  })

  return result
}

/**
 * Check if a multilingual field has content for a specific locale
 *
 * @param field - Multilingual JSON object
 * @param locale - Language code
 * @returns true if content exists for the locale
 *
 * @example
 * ```typescript
 * const name = { en: "Product", zh: "产品" }
 * hasLocalizedContent(name, 'zh')  // Returns: true
 * hasLocalizedContent(name, 'fr')  // Returns: false
 * ```
 */
export function hasLocalizedContent(
  field: MultilingualField,
  locale: string
): boolean {
  if (!field || typeof field !== 'object') {
    return false
  }

  return Boolean(field[locale])
}

/**
 * Get all available locales in a multilingual field
 *
 * @param field - Multilingual JSON object
 * @returns Array of locale codes that have content
 *
 * @example
 * ```typescript
 * const name = { en: "Product", zh: "产品", es: "Producto" }
 * getAvailableLocales(name)  // Returns: ['en', 'zh', 'es']
 * ```
 */
export function getAvailableLocales(field: MultilingualField): string[] {
  if (!field || typeof field !== 'object') {
    return []
  }

  return Object.keys(field).filter((key) => Boolean(field[key]))
}

/**
 * Merge multiple multilingual fields into one
 *
 * Useful for combining translations from different sources
 *
 * @param fields - Array of multilingual fields
 * @returns Merged multilingual field
 *
 * @example
 * ```typescript
 * const field1 = { en: "Hello" }
 * const field2 = { zh: "你好" }
 * const merged = mergeMultilingualFields([field1, field2])
 * // Returns: { en: "Hello", zh: "你好" }
 * ```
 */
export function mergeMultilingualFields(
  fields: MultilingualField[]
): Record<string, string> {
  const merged: Record<string, string> = {}

  fields.forEach((field) => {
    if (field && typeof field === 'object') {
      Object.assign(merged, field)
    }
  })

  return merged
}

/**
 * Validate if a multilingual field is complete
 *
 * Checks if all required locales have content
 *
 * @param field - Multilingual JSON object
 * @param requiredLocales - Array of required locale codes
 * @returns true if all required locales have content
 *
 * @example
 * ```typescript
 * const name = { en: "Product", zh: "产品" }
 * isMultilingualComplete(name, ['en', 'zh'])  // Returns: true
 * isMultilingualComplete(name, ['en', 'zh', 'es'])  // Returns: false
 * ```
 */
export function isMultilingualComplete(
  field: MultilingualField,
  requiredLocales: string[]
): boolean {
  if (!field || typeof field !== 'object') {
    return false
  }

  return requiredLocales.every((locale) => Boolean(field[locale]))
}

/**
 * Get missing locales in a multilingual field
 *
 * @param field - Multilingual JSON object
 * @param requiredLocales - Array of required locale codes
 * @returns Array of missing locale codes
 *
 * @example
 * ```typescript
 * const name = { en: "Product", zh: "产品" }
 * getMissingLocales(name, ['en', 'zh', 'es'])  // Returns: ['es']
 * ```
 */
export function getMissingLocales(
  field: MultilingualField,
  requiredLocales: string[]
): string[] {
  if (!field || typeof field !== 'object') {
    return requiredLocales
  }

  return requiredLocales.filter((locale) => !field[locale])
}

/**
 * Localize an array of items
 *
 * Applies localization to specific fields in an array of objects
 *
 * @param items - Array of items to localize
 * @param fields - Array of field names to localize
 * @param locale - Language code
 * @returns Array of items with localized fields
 *
 * @example
 * ```typescript
 * const products = [
 *   { name: { en: "Door", zh: "门" }, price: 100 },
 *   { name: { en: "Window", zh: "窗" }, price: 200 }
 * ]
 * const localized = localizeArray(products, ['name'], 'zh')
 * // Returns: [{ name: "门", price: 100 }, { name: "窗", price: 200 }]
 * ```
 */
export function localizeArray<T extends Record<string, any>>(
  items: T[],
  fields: Array<keyof T>,
  locale: string
): T[] {
  return items.map((item) => {
    const localized = { ...item }

    fields.forEach((field) => {
      const value = item[field]
      if (value && typeof value === 'object') {
        localized[field] = getLocalizedContent(value, locale) as any
      }
    })

    return localized
  })
}

/**
 * Default locale configuration
 */
export const DEFAULT_LOCALE = 'en'

/**
 * All supported locales (24 languages as per project requirements)
 */
export const SUPPORTED_LOCALES = [
  'en',  // English
  'zh',  // Chinese
  'es',  // Spanish
  'fr',  // French
  'de',  // German
  'ja',  // Japanese
  'ko',  // Korean
  'ar',  // Arabic
  'ru',  // Russian
  'pt',  // Portuguese
  'it',  // Italian
  'nl',  // Dutch
  'pl',  // Polish
  'tr',  // Turkish
  'vi',  // Vietnamese
  'th',  // Thai
  'id',  // Indonesian
  'ms',  // Malay
  'hi',  // Hindi
  'bn',  // Bengali
  'ur',  // Urdu
  'fa',  // Persian
  'uk',  // Ukrainian
  'ro',  // Romanian
] as const

/**
 * Locale type
 */
export type Locale = typeof SUPPORTED_LOCALES[number]

/**
 * Check if a locale is supported
 *
 * @param locale - Locale code to check
 * @returns true if locale is supported
 */
export function isSupportedLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale)
}

/**
 * Get locale display name
 *
 * @param locale - Locale code
 * @returns Human-readable locale name
 */
export function getLocaleDisplayName(locale: string): string {
  const displayNames: Record<string, string> = {
    en: 'English',
    zh: '中文',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    ja: '日本語',
    ko: '한국어',
    ar: 'العربية',
    ru: 'Русский',
    pt: 'Português',
    it: 'Italiano',
    nl: 'Nederlands',
    pl: 'Polski',
    tr: 'Türkçe',
    vi: 'Tiếng Việt',
    th: 'ภาษาไทย',
    id: 'Bahasa Indonesia',
    ms: 'Bahasa Melayu',
    hi: 'हिन्दी',
    bn: 'বাংলা',
    ur: 'اردو',
    fa: 'فارسی',
    uk: 'Українська',
    ro: 'Română',
  }

  return displayNames[locale] || locale.toUpperCase()
}

/**
 * Normalize locale code
 *
 * Converts locale variations to standard format (e.g., 'zh-CN' -> 'zh')
 *
 * @param locale - Locale code (may include region)
 * @returns Normalized locale code
 */
export function normalizeLocale(locale: string): string {
  const normalized = locale.toLowerCase().split('-')[0].split('_')[0]
  return isSupportedLocale(normalized) ? normalized : DEFAULT_LOCALE
}
