/**
 * 简单的前端翻译工具
 * 从 /messages/*.json 文件读取静态 UI 翻译
 */

import enMessages from "@/messages/en.json"
import zhMessages from "@/messages/zh.json"

// 支持的翻译语言
const messages: Record<string, typeof enMessages> = {
  en: enMessages,
  zh: zhMessages,
}

/**
 * 获取指定语言的翻译对象
 * @param locale - 语言代码
 * @returns 翻译对象，如果语言不存在则返回英文
 */
export function getTranslations(locale: string) {
  return messages[locale] || messages.en
}

/**
 * 获取指定命名空间的翻译
 * @param locale - 语言代码
 * @param namespace - 命名空间（如 'shop', 'common', 'nav'）
 * @returns 该命名空间的翻译对象
 */
export function useTranslations<T extends keyof typeof enMessages>(
  locale: string,
  namespace: T
): (typeof enMessages)[T] {
  const allMessages = messages[locale] || messages.en
  return allMessages[namespace]
}
