"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { DEFAULT_COUNTRY, DEFAULT_LANGUAGE, getCountryFromLocale } from "@/lib/countries-languages"
import { locales } from "@/i18n.config"

export interface UserPreferences {
  country: string
  language: string
}

const STORAGE_KEY = "user-preferences"

// 从 URL 路径中提取 locale
function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0 && locales.includes(segments[0] as any)) {
    return segments[0]
  }
  return DEFAULT_LANGUAGE
}

export function useUserPreferences() {
  const pathname = usePathname()

  // 从 URL 初始化语言，避免闪烁
  const initialLocale = typeof window !== 'undefined'
    ? getLocaleFromPath(window.location.pathname)
    : DEFAULT_LANGUAGE

  const [preferences, setPreferences] = useState<UserPreferences>({
    country: getCountryFromLocale(initialLocale),
    language: initialLocale,
  })

  const [isLoaded, setIsLoaded] = useState(false)

  // 从 localStorage 加载偏好设置，或从 URL 同步
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const urlLocale = getLocaleFromPath(pathname)

      if (stored) {
        const parsed = JSON.parse(stored)
        // 如果 localStorage 中的语言与 URL 不同，以 URL 为准
        if (parsed.language !== urlLocale) {
          const updated = {
            country: parsed.country || getCountryFromLocale(urlLocale),
            language: urlLocale,
          }
          setPreferences(updated)
          // 同步更新 localStorage 和 cookie
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
          document.cookie = `user-preferences=${encodeURIComponent(JSON.stringify(updated))}; path=/; max-age=31536000`
        } else {
          setPreferences({
            country: parsed.country || DEFAULT_COUNTRY,
            language: parsed.language || DEFAULT_LANGUAGE,
          })
        }
      } else {
        // 首次访问，从 URL 初始化
        const initial = {
          country: getCountryFromLocale(urlLocale),
          language: urlLocale,
        }
        setPreferences(initial)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
        document.cookie = `user-preferences=${encodeURIComponent(JSON.stringify(initial))}; path=/; max-age=31536000`
      }
    } catch (error) {
      console.error("Failed to load user preferences from localStorage:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [pathname])

  // 同时更新 localStorage 和 cookie
  const savePreferences = (updated: UserPreferences) => {
    setPreferences(updated)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

      document.cookie = `user-preferences=${encodeURIComponent(JSON.stringify(updated))}; path=/; max-age=31536000`
    } catch (error) {
      console.error("Failed to save user preferences:", error)
    }
  }

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    savePreferences({ ...preferences, ...newPrefs })
  }

  const updateCountry = (country: string) => {
    updatePreferences({ country })
  }

  const updateLanguage = (language: string) => {
    updatePreferences({ language })
  }

  return {
    preferences,
    isLoaded,
    updateCountry,
    updateLanguage,
    updatePreferences,
  }
}
