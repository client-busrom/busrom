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

export const translateHandler: PayloadHandler = async (req) => {
  const { payload, user } = req

  // Check authentication
  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    // Get translation config
    const config = await payload.findGlobal({
      slug: 'translation-config',
    })

    if (!config.isEnabled) {
      return Response.json({ error: 'Translation service is not enabled' }, { status: 400 })
    }

    if (!config.apiKey) {
      return Response.json({ error: 'Translation API key is not configured' }, { status: 400 })
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

          translatedTexts.push(translatedText)
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

        translations[lang] = translatedText
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
 */
export const testTranslationHandler: PayloadHandler = async (req) => {
  const { payload, user } = req

  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return Response.json({ error: 'Permission denied' }, { status: 403 })
  }

  try {
    const config = await payload.findGlobal({
      slug: 'translation-config',
    })

    if (!config.apiKey) {
      return Response.json({ error: 'API key is not configured' }, { status: 400 })
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
      translatedText = await translateWithAzure(testText, 'en', 'zh', apiKey, false, config.apiEndpoint as string | undefined)
    } else {
      throw new Error('Invalid translation service')
    }

    // Update test result
    await payload.updateGlobal({
      slug: 'translation-config',
      data: {
        lastTestedAt: new Date().toISOString(),
        lastTestResult: 'success',
      },
    })

    return Response.json({
      success: true,
      message: 'Translation test successful',
      originalText: testText,
      translatedText,
    })
  } catch (error) {
    // Update test result as failed
    await payload.updateGlobal({
      slug: 'translation-config',
      data: {
        lastTestedAt: new Date().toISOString(),
        lastTestResult: 'failed',
      },
    })

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
