/**
 * Translation Service
 *
 * Provides translation functionality using Google Translate, DeepL, and Azure
 */

import {
  SUPPORTED_LANGUAGES,
  TRANSLATION_LANGUAGE_MAP,
  type LanguageCode,
} from './languages'

/**
 * Translation Request Interface
 */
export interface TranslationRequest {
  text: string
  from: LanguageCode
  to: LanguageCode[]
  service: 'google' | 'deepl' | 'azure'
  apiKey: string
}

/**
 * Translation Response Interface
 */
export interface TranslationResponse {
  translations: Record<LanguageCode, string>
  service: string
  usage?: {
    charactersTranslated: number
    cost?: number
  }
}

/**
 * Translation Service Configuration Interface
 */
export interface TranslationServiceConfig {
  service: 'google' | 'deepl' | 'azure'
  apiKey: string
  sourceLanguage: LanguageCode
  targetLanguages: LanguageCode[]
  overwriteExisting: boolean
  preserveHtml: boolean
  translateAltText: boolean
}

class TranslationService {
  /**
   * Translate text using Google Translate API
   */
  private async translateWithGoogle(request: TranslationRequest): Promise<TranslationResponse> {
    const { text, from, to, apiKey } = request
    const translations: Record<LanguageCode, string> = {} as Record<LanguageCode, string>

    try {
      const promises = to.map(async (targetLang) => {
        const sourceLang = TRANSLATION_LANGUAGE_MAP[from]
        const targetLangCode = TRANSLATION_LANGUAGE_MAP[targetLang]

        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: sourceLang,
            target: targetLangCode,
            format: 'html',
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error?.message || `Translation failed: ${response.statusText}`)
        }

        const data = await response.json()
        const translatedText = data.data?.translations?.[0]?.translatedText

        if (!translatedText) {
          throw new Error('No translation returned')
        }

        return { lang: targetLang, text: translatedText }
      })

      const results = await Promise.allSettled(promises)

      results.forEach((result, index) => {
        const targetLang = to[index]
        if (result.status === 'fulfilled') {
          translations[result.value.lang] = result.value.text
        } else {
          console.error(`Translation failed for ${targetLang}:`, result.reason)
          translations[targetLang] = text
        }
      })

      return {
        translations,
        service: 'google',
        usage: {
          charactersTranslated: text.length * to.length,
        },
      }
    } catch (error) {
      console.error('Google Translate error:', error)
      throw new Error(error instanceof Error ? error.message : 'Translation service error')
    }
  }

  /**
   * Translate text using DeepL API
   */
  private async translateWithDeepL(request: TranslationRequest): Promise<TranslationResponse> {
    const { text, from, to, apiKey } = request
    const translations: Record<LanguageCode, string> = {} as Record<LanguageCode, string>

    try {
      const baseUrl = apiKey.endsWith(':fx')
        ? 'https://api-free.deepl.com/v2/translate'
        : 'https://api.deepl.com/v2/translate'

      const promises = to.map(async (targetLang) => {
        const sourceLang = TRANSLATION_LANGUAGE_MAP[from]?.toUpperCase()
        const targetLangCode = TRANSLATION_LANGUAGE_MAP[targetLang]?.toUpperCase()

        if (!sourceLang || !targetLangCode) {
          throw new Error(`Unsupported language for DeepL: ${from} or ${targetLang}`)
        }

        const formData = new URLSearchParams()
        formData.append('text', text)
        formData.append('source_lang', sourceLang)
        formData.append('target_lang', targetLangCode)
        formData.append('tag_handling', 'html')

        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `DeepL-Auth-Key ${apiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || `DeepL translation failed: ${response.statusText}`)
        }

        const data = await response.json()
        const translatedText = data.translations?.[0]?.text

        if (!translatedText) {
          throw new Error('No translation returned from DeepL')
        }

        return { lang: targetLang, text: translatedText }
      })

      const results = await Promise.allSettled(promises)

      results.forEach((result, index) => {
        const targetLang = to[index]
        if (result.status === 'fulfilled') {
          translations[result.value.lang] = result.value.text
        } else {
          console.error(`DeepL translation failed for ${targetLang}:`, result.reason)
          translations[targetLang] = text
        }
      })

      return {
        translations,
        service: 'deepl',
        usage: {
          charactersTranslated: text.length * to.length,
        },
      }
    } catch (error) {
      console.error('DeepL error:', error)
      throw new Error(error instanceof Error ? error.message : 'DeepL translation service error')
    }
  }

  /**
   * Translate text using Azure Translator API
   */
  private async translateWithAzure(request: TranslationRequest): Promise<TranslationResponse> {
    const { text, from, to, apiKey } = request
    const translations: Record<LanguageCode, string> = {} as Record<LanguageCode, string>

    try {
      const endpoint = 'https://api.cognitive.microsofttranslator.com/translate'
      const region = 'global'

      const sourceLang = TRANSLATION_LANGUAGE_MAP[from]
      const targetLangs = to.map((lang) => TRANSLATION_LANGUAGE_MAP[lang])

      const url = `${endpoint}?api-version=3.0&from=${sourceLang}&to=${targetLangs.join('&to=')}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Ocp-Apim-Subscription-Region': region,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ text }]),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || `Azure translation failed: ${response.statusText}`)
      }

      const data = await response.json()
      const translationResults = data[0]?.translations

      if (!translationResults) {
        throw new Error('No translations returned from Azure')
      }

      translationResults.forEach((result: any, index: number) => {
        const targetLang = to[index]
        translations[targetLang] = result.text
      })

      return {
        translations,
        service: 'azure',
        usage: {
          charactersTranslated: text.length * to.length,
        },
      }
    } catch (error) {
      console.error('Azure Translator error:', error)
      throw new Error(error instanceof Error ? error.message : 'Azure translation service error')
    }
  }

  /**
   * Translate text based on service type
   */
  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    const { service } = request

    switch (service) {
      case 'google':
        return this.translateWithGoogle(request)
      case 'deepl':
        return this.translateWithDeepL(request)
      case 'azure':
        return this.translateWithAzure(request)
      default:
        throw new Error(`Unsupported translation service: ${service}`)
    }
  }

  /**
   * Get supported languages by service
   */
  getSupportedLanguages(service: 'google' | 'deepl' | 'azure' = 'google'): LanguageCode[] {
    const deepLUnsupported: LanguageCode[] = ['is', 'cs', 'hu', 'sk', 'ar', 'he', 'fa', 'az', 'ber', 'ku']

    switch (service) {
      case 'deepl':
        // Filter out languages not supported by DeepL
        return SUPPORTED_LANGUAGES.filter((lang) => !deepLUnsupported.includes(lang))
      case 'google':
      case 'azure':
      default:
        return [...SUPPORTED_LANGUAGES]
    }
  }
}

export const translationService = new TranslationService()
