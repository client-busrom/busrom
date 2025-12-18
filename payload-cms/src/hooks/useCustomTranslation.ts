'use client'

/**
 * Custom Translation Hook
 *
 * Payload's built-in t() function only loads translations listed in clientTranslationKeys.
 * This hook provides access to our custom translations directly.
 *
 * Usage:
 *   import { useCustomTranslation } from '@/hooks/useCustomTranslation'
 *   const { t, lang } = useCustomTranslation()
 *   t('translationCenter.title') // returns "Translation Center" or "翻译中心"
 */

import { useTranslation } from '@payloadcms/ui'
import { customTranslationsEn, customTranslationsZh } from '../i18n/custom-translations'

type CustomTranslations = typeof customTranslationsEn.custom
type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}` | K
        : K
      : never
    }[keyof T]
  : never

type CustomTranslationKey = NestedKeyOf<CustomTranslations>

// Get nested value from object using dot notation
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return path // Return key if not found
    }
  }

  return typeof current === 'string' ? current : path
}

export function useCustomTranslation() {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'zh'

  // Select translations based on admin UI language
  const translations = lang === 'zh'
    ? customTranslationsZh.custom
    : customTranslationsEn.custom

  // Translation function
  const t = (key: CustomTranslationKey | string): string => {
    return getNestedValue(translations as Record<string, unknown>, key)
  }

  return { t, lang, translations }
}

export default useCustomTranslation
