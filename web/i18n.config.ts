// i18n.config.ts

export const defaultLocale = "en"

// 所有支持的语言（与 Payload CMS localization 配置一致）
// CMS 会自动 fallback 到英文如果某语言没有翻译
export const locales = [
  "en",  // English
  "zh",  // 中文
  "es",  // Español
  "fr",  // Français
  "de",  // Deutsch
  "it",  // Italiano
  "pt",  // Português
  "nl",  // Nederlands
  "ru",  // Русский
  "ja",  // 日本語
  "ko",  // 한국어
  "ar",  // العربية
  "tr",  // Türkçe
  "pl",  // Polski
  "sv",  // Svenska
  "da",  // Dansk
  "no",  // Norsk
  "fi",  // Suomi
] as const

// 非默认语言（需要在 URL 中显示的语言）
export const nonDefaultLocales = locales.filter(l => l !== defaultLocale) as readonly Exclude<typeof locales[number], typeof defaultLocale>[]

export type Locale = (typeof locales)[number]

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

// 检查是否是非默认语言
export function isNonDefaultLocale(locale: string): boolean {
  return locale !== defaultLocale && isValidLocale(locale)
}

// This is used for static UI translations via next-intl
// 只有 en 和 zh 有完整的 UI 翻译，其他语言 fallback 到 en
export const getMessages = async (locale: Locale) => {
  // 只有这些语言有 UI 翻译文件
  const supportedUILocales = ["en", "zh"]
  const actualLocale = supportedUILocales.includes(locale) ? locale : "en"
  return (await import(`./messages/${actualLocale}.json`)).default
}