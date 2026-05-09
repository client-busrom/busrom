/**
 * Translation API Endpoint
 *
 * POST /api/translate
 *
 * Supports two modes:
 * 1. Document Editor mode: Multiple texts to single language
 *    Request: { texts: ['text1', 'text2'], sourceLang, targetLang }
 *    Response: { success, translations: ['translated1', 'translated2'] }
 *
 * 2. Legacy mode: Single text to multiple languages
 *    Request: { text, sourceLang, targetLangs }
 *    Response: { success, translations: { en: '...', zh: '...', ... } }
 */
// @ts-nocheck

import type { PayloadHandler } from 'payload'

// Language code mapping for translation APIs
const LANG_MAP: Record<string, string> = {
  en: 'en', zh: 'zh', es: 'es', pt: 'pt', fr: 'fr', de: 'de',
  it: 'it', nl: 'nl', sv: 'sv', da: 'da', no: 'no', fi: 'fi',
  ja: 'ja', ko: 'ko', ru: 'ru', ar: 'ar', th: 'th', vi: 'vi',
  id: 'id', ms: 'ms', tr: 'tr', hi: 'hi', bn: 'bn', pl: 'pl',
}

interface TranslateRequest {
  text?: string
  texts?: string[]
  sourceLang?: string
  targetLang?: string
  targetLangs?: string[]
  isRichText?: boolean
}

/**
 * Match the casing style of the source text to the target text.
 * Especially useful for Title Case or ALL CAPS preservation.
 */
function matchTextCasing(source: string, target: string, targetLang?: string): string {
  if (!source || !target) return target

  // Skip for languages without casing (Chinese, Japanese, Korean, Arabic, Thai, etc.)
  const noCasingLangs = ['zh', 'ja', 'ko', 'ar', 'th', 'hi', 'bn']
  if (targetLang && noCasingLangs.includes(targetLang)) return target

  // 1. Check for ALL CAPS (exclude numbers/special chars)
  const isAllCaps = source === source.toUpperCase() && source !== source.toLowerCase()
  if (isAllCaps) return target.toUpperCase()

  // 2. Check for Title Case
  const sourceWords = source.trim().split(/\s+/).filter(w => w.length > 0)
  if (sourceWords.length === 0) return target

  // Count words starting with uppercase
  const capitalizedWords = sourceWords.filter(w => /^\p{Lu}/u.test(w))
  const capitalizationRatio = capitalizedWords.length / sourceWords.length

  // If source is Title Case (majority of words start with uppercase)
  // or it's a short string starting with uppercase
  const looksLikeTitle = (capitalizationRatio >= 0.5) || (sourceWords.length <= 3 && /^\p{Lu}/u.test(sourceWords[0]))

  if (looksLikeTitle) {
    return target
      .split(/\s+/)
      .map(word => {
        if (word.length === 0) return word
        
        // Find the first alphabetic character to capitalize
        // This handles cases like "(glass)" -> "(Glass)"
        const firstLetterMatch = word.match(/\p{L}/u)
        if (!firstLetterMatch) return word
        
        const firstLetterIndex = firstLetterMatch.index!
        
        // Capitalize the first letter found, and potentially lowercase the rest if it's all lowercase
        // but we keep the rest as is to protect tech terms like "iPhone" or "LCD"
        return (
          word.slice(0, firstLetterIndex) +
          word.charAt(firstLetterIndex).toUpperCase() +
          word.slice(firstLetterIndex + 1)
        )
      })
      .join(' ')
  }

  return target
}

/**
 * Google Translate API
 */
async function translateWithGoogle(
  text: string,
  sourceLang: string,
  targetLang: string,
  apiKey: string,
  isRichText: boolean = false
): Promise<string> {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: sourceLang === 'auto' ? undefined : LANG_MAP[sourceLang],
      target: LANG_MAP[targetLang],
      format: isRichText ? 'html' : 'text',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Google Translate API error: ${error}`)
  }

  const data = await response.json()
  return data.data?.translations?.[0]?.translatedText || text
}

/**
 * DeepL API
 */
async function translateWithDeepL(
  text: string,
  sourceLang: string,
  targetLang: string,
  apiKey: string,
  isRichText: boolean = false
): Promise<string> {
  const deeplLangMap: Record<string, string> = {
    en: 'EN', zh: 'ZH', es: 'ES', pt: 'PT', fr: 'FR', de: 'DE',
    it: 'IT', nl: 'NL', sv: 'SV', da: 'DA', fi: 'FI', pl: 'PL',
    ja: 'JA', ko: 'KO', ru: 'RU', tr: 'TR',
  }

  const targetCode = deeplLangMap[targetLang]
  if (!targetCode) {
    console.warn(`DeepL doesn't support language: ${targetLang}`)
    return text
  }

  const url = 'https://api-free.deepl.com/v2/translate'

  const params = new URLSearchParams({
    auth_key: apiKey,
    text: text,
    target_lang: targetCode,
  })

  if (sourceLang !== 'auto') {
    params.append('source_lang', deeplLangMap[sourceLang] || 'EN')
  }

  if (isRichText) {
    params.append('tag_handling', 'html')
  }

  const response = await fetch(`${url}?${params.toString()}`, {
    method: 'POST',
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DeepL API error: ${error}`)
  }

  const data = await response.json()
  return data.translations?.[0]?.text || text
}

/**
 * Azure Translator API
 */
async function translateWithAzure(
  text: string,
  sourceLang: string,
  targetLang: string,
  apiKey: string,
  isRichText: boolean = false,
  endpoint?: string
): Promise<string> {
  const baseUrl = endpoint || 'https://api.cognitive.microsofttranslator.com'
  const url = `${baseUrl}/translate?api-version=3.0`

  const params = new URLSearchParams({
    to: LANG_MAP[targetLang],
  })

  if (sourceLang !== 'auto') {
    params.append('from', LANG_MAP[sourceLang])
  }

  if (isRichText) {
    params.append('textType', 'html')
  }

  const response = await fetch(`${url}&${params.toString()}`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{ text }]),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Azure Translator API error: ${error}`)
  }

  const data = await response.json()
  return data[0]?.translations?.[0]?.text || text
}

/**
 * Get translation config
 * Supports per-request override from headers (for user personal settings stored in localStorage)
 * Falls back to global config
 */
async function getTranslationConfig(payload: any, user: any, headers?: Headers) {
  // Check for per-request override from headers (user's personal settings from localStorage)
  if (headers) {
    const personalService = headers.get('x-translation-service')
    const personalApiKey = headers.get('x-translation-api-key')
    const personalEndpoint = headers.get('x-translation-endpoint')

    if (personalApiKey) {
      return {
        service: personalService || 'google',
        apiKey: personalApiKey,
        apiEndpoint: personalEndpoint || undefined,
        isEnabled: true,
        source: 'user' as const,
      }
    }
  }

  // Fall back to global config
  const globalConfig = await payload.findGlobal({
    slug: 'translation-config',
  })

  return {
    service: globalConfig.service as string,
    apiKey: globalConfig.apiKey as string,
    apiEndpoint: globalConfig.apiEndpoint as string | undefined,
    isEnabled: globalConfig.isEnabled as boolean,
    source: 'global' as const,
  }
}

export const translateHandler: PayloadHandler = async (req) => {
  const { payload, user, headers } = req

  // Check authentication
  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    // Get translation config (check headers for user settings, then fall back to global)
    const config = await getTranslationConfig(payload, user, headers)

    if (!config.isEnabled) {
      return Response.json({ error: 'Translation service is not enabled. Please configure your API key in user settings.' }, { status: 400 })
    }

    if (!config.apiKey) {
      return Response.json({ error: 'Translation API key is not configured. Please set your API key in user settings.' }, { status: 400 })
    }

    const service = config.service as 'google' | 'deepl' | 'azure'
    const apiKey = config.apiKey as string
    const apiEndpoint = config.apiEndpoint as string | undefined

    // Parse request
    const body = (await req.json?.()) as TranslateRequest | undefined
    if (!body) {
      return Response.json({ error: 'Request body is required' }, { status: 400 })
    }

    const { text, texts, sourceLang = 'en', targetLang, targetLangs, isRichText } = body

    // Mode 1: Multiple texts to single language
    if (texts && Array.isArray(texts)) {
      if (!targetLang) {
        return Response.json(
          { error: 'targetLang is required when using texts array' },
          { status: 400 }
        )
      }

      const translatedTexts: string[] = []
      const errors: string[] = []

      for (let i = 0; i < texts.length; i++) {
        const sourceText = texts[i]

        if (!sourceText || !sourceText.trim()) {
          translatedTexts.push(sourceText)
          continue
        }

        try {
          let translatedText: string

          if (service === 'google') {
            translatedText = await translateWithGoogle(sourceText, sourceLang, targetLang, apiKey, isRichText)
          } else if (service === 'deepl') {
            translatedText = await translateWithDeepL(sourceText, sourceLang, targetLang, apiKey, isRichText)
          } else if (service === 'azure') {
            translatedText = await translateWithAzure(sourceText, sourceLang, targetLang, apiKey, isRichText, apiEndpoint)
          } else {
            translatedText = sourceText
          }

          // Use casing preservation if it's not rich text or if it doesn't look like HTML
          const shouldMatchCasing = !isRichText || !translatedText.includes('<')
          translatedTexts.push(shouldMatchCasing ? matchTextCasing(sourceText, translatedText, targetLang) : translatedText)
        } catch (error) {
          payload.logger.error(`Translation failed for text ${i}:`, error)
          errors.push(`Text ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          translatedTexts.push(sourceText)
        }
      }

      return Response.json({
        success: errors.length === 0,
        translations: translatedTexts,
        errors: errors.length > 0 ? errors : undefined,
      })
    }

    // Mode 2: Single text to multiple languages
    if (!text || !text.trim()) {
      return Response.json({ error: 'text or texts is required' }, { status: 400 })
    }

    const langsToTranslate = targetLangs && targetLangs.length > 0
      ? targetLangs
      : Object.keys(LANG_MAP).filter(lang => lang !== sourceLang)

    const translations: Record<string, string> = {}
    const errors: Record<string, string> = {}

    for (const lang of langsToTranslate) {
      try {
        let translatedText: string

        if (service === 'google') {
          translatedText = await translateWithGoogle(text, sourceLang, lang, apiKey, isRichText)
        } else if (service === 'deepl') {
          translatedText = await translateWithDeepL(text, sourceLang, lang, apiKey, isRichText)
        } else if (service === 'azure') {
          translatedText = await translateWithAzure(text, sourceLang, lang, apiKey, isRichText, apiEndpoint)
        } else {
          translatedText = text
        }

        // Use casing preservation if it's not rich text or if it doesn't look like HTML
        const shouldMatchCasing = !isRichText || !translatedText.includes('<')
        translations[lang] = shouldMatchCasing ? matchTextCasing(text, translatedText, lang) : translatedText
      } catch (error) {
        payload.logger.error(`Translation failed for ${lang}:`, error)
        errors[lang] = error instanceof Error ? error.message : 'Unknown error'
        translations[lang] = text
      }
    }

    return Response.json({
      success: true,
      translations,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
    })
  } catch (error) {
    payload.logger.error('Translation handler error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Translation failed' },
      { status: 500 }
    )
  }
}

/**
 * Test translation connection
 * Tests user's personal translation settings
 */
export const testTranslationHandler: PayloadHandler = async (req) => {
  const { payload, user, headers } = req

  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    // Get config from headers (user settings) or global
    const config = await getTranslationConfig(payload, user, headers)

    if (!config.apiKey) {
      return Response.json({ error: 'API key is not configured. Please set your API key first.' }, { status: 400 })
    }

    const service = config.service as 'google' | 'deepl' | 'azure'
    const apiKey = config.apiKey as string
    const testText = 'Hello, this is a test.'

    let translatedText: string

    if (service === 'google') {
      translatedText = await translateWithGoogle(testText, 'en', 'zh', apiKey)
    } else if (service === 'deepl') {
      translatedText = await translateWithDeepL(testText, 'en', 'zh', apiKey)
    } else if (service === 'azure') {
      translatedText = await translateWithAzure(testText, 'en', 'zh', apiKey, false, config.apiEndpoint)
    } else {
      throw new Error('Invalid translation service')
    }

    // If using global config, update global test result
    if (config.source === 'global') {
      await payload.updateGlobal({
        slug: 'translation-config',
        data: {
          lastTestedAt: new Date().toISOString(),
          lastTestResult: 'success',
        },
      })
    }

    return Response.json({
      success: true,
      message: 'Translation test successful',
      originalText: testText,
      translatedText,
      configSource: config.source,
    })
  } catch (error) {
    // Update global test result as failed (only if using global config)
    try {
      const config = await getTranslationConfig(payload, user)
      if (config.source === 'global') {
        await payload.updateGlobal({
          slug: 'translation-config',
          data: {
            lastTestedAt: new Date().toISOString(),
            lastTestResult: 'failed',
          },
        })
      }
    } catch (e) {
      // Ignore error updating global
    }

    payload.logger.error('Translation test failed:', error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Translation test failed',
      },
      { status: 500 }
    )
  }
}

/**
 * Get global translation settings info
 * User's personal settings are stored in localStorage and sent via headers
 */
export const getUserTranslationSettingsHandler: PayloadHandler = async (req) => {
  const { payload, user, headers } = req

  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    // Check if user has personal settings in headers
    const personalApiKey = headers?.get('x-translation-api-key')
    const personalService = headers?.get('x-translation-service')

    if (personalApiKey) {
      return Response.json({
        success: true,
        settings: {
          service: personalService || 'google',
          hasApiKey: true,
          apiKeyPreview: `${personalApiKey.substring(0, 8)}...`,
          isEnabled: true,
          source: 'user',
        },
      })
    }

    // Return global config info
    const globalConfig = await payload.findGlobal({
      slug: 'translation-config',
    })

    return Response.json({
      success: true,
      settings: {
        service: globalConfig.service || 'google',
        hasApiKey: !!globalConfig.apiKey,
        apiKeyPreview: globalConfig.apiKey ? `${(globalConfig.apiKey as string).substring(0, 8)}...` : '',
        isEnabled: globalConfig.isEnabled || false,
        source: 'global',
      },
    })
  } catch (error) {
    payload.logger.error('Failed to get translation settings:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to get settings' },
      { status: 500 }
    )
  }
}

/**
 * Placeholder for save - settings are stored in localStorage on client side
 */
export const saveUserTranslationSettingsHandler: PayloadHandler = async (req) => {
  return Response.json({
    success: true,
    message: 'Settings should be saved in localStorage on the client side',
  })
}
