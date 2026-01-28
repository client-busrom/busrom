/**
 * Locale Configuration
 *
 * 24种支持的语言配置
 * 注意：flag 字段已弃用，请使用 LocaleFlag 组件显示国旗图标
 */

export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'pt', label: 'Português' },
  { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pl', label: 'Polski' },
  { code: 'ru', label: 'Русский' },
  { code: 'ar', label: 'العربية' },
  { code: 'th', label: 'ไทย' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'sv', label: 'Svenska' },
  { code: 'da', label: 'Dansk' },
  { code: 'no', label: 'Norsk' },
  { code: 'fi', label: 'Suomi' },
] as const

export type LocaleCode = typeof SUPPORTED_LOCALES[number]['code']

// Simple array of locale codes for iteration
export const LOCALE_CODES: LocaleCode[] = SUPPORTED_LOCALES.map(l => l.code)

export const DEFAULT_LOCALE: LocaleCode = 'en'

export const getLocaleLabel = (code: string): string => {
  const locale = SUPPORTED_LOCALES.find(l => l.code === code)
  return locale ? locale.label : code
}
