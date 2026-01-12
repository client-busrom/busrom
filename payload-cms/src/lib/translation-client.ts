/**
 * Translation Client Helper
 *
 * Provides a unified way to make translation API calls with user's personal settings.
 * Settings are stored in localStorage and sent via headers.
 */

const STORAGE_KEY = 'busrom-translation-settings'

interface TranslationSettings {
  service: string
  apiKey: string
  apiEndpoint: string
  isEnabled: boolean
}

const defaultSettings: TranslationSettings = {
  service: 'google',
  apiKey: '',
  apiEndpoint: '',
  isEnabled: false,
}

/**
 * Get translation settings from localStorage
 */
export function getTranslationSettings(): TranslationSettings {
  if (typeof window === 'undefined') return defaultSettings

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error('Failed to read translation settings:', e)
  }
  return defaultSettings
}

/**
 * Get headers for translation API requests
 * Includes user's personal API key if configured
 */
export function getTranslationHeaders(): Record<string, string> {
  const settings = getTranslationSettings()

  if (!settings.isEnabled || !settings.apiKey) {
    return {}
  }

  const headers: Record<string, string> = {
    'x-translation-api-key': settings.apiKey,
    'x-translation-service': settings.service,
  }

  if (settings.apiEndpoint) {
    headers['x-translation-endpoint'] = settings.apiEndpoint
  }

  return headers
}

/**
 * Make a translation API request with user's personal settings
 */
export async function translateTexts(
  texts: string[],
  sourceLang: string,
  targetLang: string,
  isRichText: boolean = false
): Promise<{ success: boolean; translations: string[]; errors?: string[] }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getTranslationHeaders(),
  }

  const res = await fetch('/api/translate', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      texts,
      sourceLang,
      targetLang,
      isRichText,
    }),
  })

  return res.json()
}

/**
 * Make a single text translation API request
 */
export async function translateText(
  text: string,
  sourceLang: string,
  targetLangs: string[],
  isRichText: boolean = false
): Promise<{ success: boolean; translations: Record<string, string>; errors?: Record<string, string> }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getTranslationHeaders(),
  }

  const res = await fetch('/api/translate', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      text,
      sourceLang,
      targetLangs,
      isRichText,
    }),
  })

  return res.json()
}
