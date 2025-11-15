/**
 * Translation API Route
 *
 * Provides translation endpoint for Keystone Admin UI
 * Supports Google Translate, DeepL, and Azure Translator
 */

import type { Request, Response } from 'express'

// Language code mapping for translation APIs
const LANG_MAP: Record<string, string> = {
  en: 'en', zh: 'zh', es: 'es', pt: 'pt', fr: 'fr', de: 'de',
  it: 'it', nl: 'nl', sv: 'sv', da: 'da', no: 'no', fi: 'fi',
  is: 'is', cs: 'cs', hu: 'hu', pl: 'pl', sk: 'sk', ar: 'ar',
  he: 'he', fa: 'fa', tr: 'tr', az: 'az', ber: 'ber', ku: 'ku',
}

const TARGET_LANGS = Object.keys(LANG_MAP).filter(lang => lang !== 'en')

interface TranslateRequestBody {
  text?: string // Single text (legacy support)
  texts?: string[] // Multiple texts (for Document Editor)
  sourceLang?: string
  targetLang?: string // Single target language (for Document Editor)
  service?: 'google' | 'deepl' | 'azure'
  apiKey?: string
  targetLangs?: string[] // Optional: specific target languages (for JSON fields)
  isRichText?: boolean // Optional: indicates if text contains HTML/rich formatting
}

interface TranslationResult {
  [lang: string]: string
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
      format: isRichText ? 'html' : 'text', // Use 'html' format for rich text
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
  // DeepL language code mapping
  const deeplLangMap: Record<string, string> = {
    en: 'EN', zh: 'ZH', es: 'ES', pt: 'PT', fr: 'FR', de: 'DE',
    it: 'IT', nl: 'NL', sv: 'SV', da: 'DA', fi: 'FI', cs: 'CS',
    hu: 'HU', pl: 'PL', sk: 'SK', tr: 'TR'
  }

  const targetCode = deeplLangMap[targetLang]
  if (!targetCode) {
    console.warn(`DeepL doesn't support language: ${targetLang}, returning original text`)
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

  // DeepL supports tag_handling parameter for HTML
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
  isRichText: boolean = false
): Promise<string> {
  const url = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0'

  const params = new URLSearchParams({
    to: LANG_MAP[targetLang],
  })

  if (sourceLang !== 'auto') {
    params.append('from', LANG_MAP[sourceLang])
  }

  // Azure supports textType parameter for HTML
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
 * Main translation handler
 *
 * Supports two modes:
 * 1. Legacy mode (JSON fields): Single text to multiple languages
 *    Request: { text, sourceLang, service, apiKey, targetLangs }
 *    Response: { success, translations: { en: '...', zh: '...', ... } }
 *
 * 2. Document Editor mode: Multiple texts to single language
 *    Request: { texts: ['text1', 'text2'], sourceLang, targetLang, service, apiKey }
 *    Response: { success, translations: ['translated1', 'translated2'] }
 */
export async function translateHandler(req: Request, res: Response) {
  try {
    const { text, texts, sourceLang = 'en', targetLang, service = 'google', apiKey, targetLangs, isRichText } = req.body as TranslateRequestBody

    // Validation
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' })
    }

    if (!['google', 'deepl', 'azure'].includes(service)) {
      return res.status(400).json({ error: 'Invalid translation service' })
    }

    // ================================================================
    // Mode 1: Document Editor mode (multiple texts to single language)
    // ================================================================
    if (texts && Array.isArray(texts)) {
      if (!targetLang) {
        return res.status(400).json({ error: 'targetLang is required when using texts array' })
      }

      if (texts.length === 0) {
        return res.status(400).json({ error: 'texts array cannot be empty' })
      }

      const translatedTexts: string[] = []
      const errors: string[] = []

      for (let i = 0; i < texts.length; i++) {
        const sourceText = texts[i]

        // Skip empty texts
        if (!sourceText || !sourceText.trim()) {
          translatedTexts.push(sourceText)
          continue
        }

        try {
          let translatedText: string

          if (service === 'google') {
            translatedText = await translateWithGoogle(sourceText, sourceLang, targetLang, apiKey, isRichText || false)
          } else if (service === 'deepl') {
            translatedText = await translateWithDeepL(sourceText, sourceLang, targetLang, apiKey, isRichText || false)
          } else if (service === 'azure') {
            translatedText = await translateWithAzure(sourceText, sourceLang, targetLang, apiKey, isRichText || false)
          } else {
            translatedText = sourceText
          }

          translatedTexts.push(translatedText)
        } catch (error) {
          console.error(`Translation failed for text ${i}:`, error)
          errors.push(`Text ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          translatedTexts.push(sourceText) // Fallback to original text
        }
      }

      // Return array response
      return res.json({
        success: errors.length === 0,
        translations: translatedTexts,
        errors: errors.length > 0 ? errors : undefined,
      })
    }

    // ================================================================
    // Mode 2: Legacy mode (single text to multiple languages)
    // ================================================================
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'text or texts is required' })
    }

    // Determine target languages
    const langsToTranslate = targetLangs && targetLangs.length > 0
      ? targetLangs
      : TARGET_LANGS

    // Translate to all target languages
    const translations: TranslationResult = {}
    const errors: Record<string, string> = {}

    for (const targetLang of langsToTranslate) {
      try {
        let translatedText: string

        if (service === 'google') {
          translatedText = await translateWithGoogle(text, sourceLang, targetLang, apiKey, isRichText || false)
        } else if (service === 'deepl') {
          translatedText = await translateWithDeepL(text, sourceLang, targetLang, apiKey, isRichText || false)
        } else if (service === 'azure') {
          translatedText = await translateWithAzure(text, sourceLang, targetLang, apiKey, isRichText || false)
        } else {
          translatedText = text
        }

        translations[targetLang] = translatedText
      } catch (error) {
        console.error(`Translation failed for ${targetLang}:`, error)
        errors[targetLang] = error instanceof Error ? error.message : 'Unknown error'
        translations[targetLang] = text // Fallback to original text
      }
    }

    // Return object response
    return res.json({
      success: true,
      translations,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
    })

  } catch (error) {
    console.error('Translation handler error:', error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Translation failed',
    })
  }
}
