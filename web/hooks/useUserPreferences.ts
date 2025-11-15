"use client"

import { useState, useEffect } from "react"
import { DEFAULT_COUNTRY, DEFAULT_LANGUAGE } from "@/lib/countries-languages"

export interface UserPreferences {
  country: string
  language: string
}

const STORAGE_KEY = "user-preferences"

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    country: DEFAULT_COUNTRY,
    language: DEFAULT_LANGUAGE,
  })

  const [isLoaded, setIsLoaded] = useState(false)

  // 从 localStorage 加载偏好设置（仅客户端运行）
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setPreferences({
          country: parsed.country || DEFAULT_COUNTRY,
          language: parsed.language || DEFAULT_LANGUAGE,
        })
      }
    } catch (error) {
      console.error("Failed to load user preferences from localStorage:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

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
