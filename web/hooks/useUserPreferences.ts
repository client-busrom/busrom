"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { DEFAULT_COUNTRY, DEFAULT_LANGUAGE, getCountryFromLocale } from "@/lib/countries-languages"
import { locales, defaultLocale } from "@/i18n.config"

export interface UserPreferences {
  country: string
  language: string
}

const STORAGE_KEY = "user-preferences"

// 从 URL 路径中提取 locale
// 新策略: 无前缀 = 默认语言(英文)，/zh = 中文
function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0 && locales.includes(segments[0] as any)) {
    return segments[0]
  }
  // 没有语言前缀 = 默认语言
  return defaultLocale
}

export function useUserPreferences() {
  const pathname = usePathname()

  // 从 URL 初始化语言，避免闪烁
  // usePathname() 在客户端和服务端都能正确返回当前路径
  const initialLocale = getLocaleFromPath(pathname)

  const [preferences, setPreferences] = useState<UserPreferences>({
    // 国家默认为美国，后续从 localStorage 读取用户选择
    country: DEFAULT_COUNTRY,
    // 语言跟着 URL 路由走
    language: initialLocale,
  })

  // 初始化时就基于 URL 设置为 true，避免 Loading 闪烁
  const [isLoaded, setIsLoaded] = useState(true)

  // 从 localStorage 加载偏好设置，或从 URL 同步
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const urlLocale = getLocaleFromPath(pathname)

      if (stored) {
        const parsed = JSON.parse(stored)
        // 如果 localStorage 中的语言与 URL 不同，以 URL 为准，但保留用户选择的国家
        if (parsed.language !== urlLocale) {
          const updated = {
            country: parsed.country || DEFAULT_COUNTRY,
            language: urlLocale,
          }
          setPreferences(updated)
          // 同步更新 localStorage 和 cookie
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
          document.cookie = `user-preferences=${encodeURIComponent(JSON.stringify(updated))}; path=/; max-age=31536000`
        } else {
          setPreferences({
            country: parsed.country || DEFAULT_COUNTRY,
            language: urlLocale,
          })
        }
      } else {
        // 首次访问，国家默认美国，语言跟 URL
        const initial = {
          country: DEFAULT_COUNTRY,
          language: urlLocale,
        }
        setPreferences(initial)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
        document.cookie = `user-preferences=${encodeURIComponent(JSON.stringify(initial))}; path=/; max-age=31536000`
      }
    } catch (error) {
      console.error("Failed to load user preferences from localStorage:", error)
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
