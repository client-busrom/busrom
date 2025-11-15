// i18n.config.ts (推荐修改版)

export const defaultLocale = "en"

// 只包含当前有完整内容和 UI 翻译的语言
export const locales = ["en", "zh"] as const

export type Locale = (typeof locales)[number]

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

// This is used for static UI translations via next-intl
export const getMessages = async (locale: Locale) => {
  // 现在 locale 的类型是 'en' | 'zh'，逻辑更简单
  return (await import(`./messages/${locale}.json`)).default
}