'use client'

import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useField, useDocumentInfo, useLocale, useTranslation } from '@payloadcms/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import { SUPPORTED_LOCALES, type LocaleCode } from '../../../lib/locales'
import { LocaleFlag } from '../../ui/LocaleFlag'
import { fetchAllLocaleData, getFieldFromCache, invalidateCache } from '../localeDataCache'
import './styles.scss'

// Lexical content type
type LexicalContent = {
  root: {
    children: unknown[]
    direction: string | null
    format: string
    indent: number
    type: string
    version: number
  }
} | null

interface LocaleValue {
  locale: LocaleCode
  value: LexicalContent
  isLoading: boolean
}

interface MultiLocaleRichTextFieldProps {
  path: string
  field: {
    name: string
    label?: string | Record<string, string>
    required?: boolean
    admin?: {
      description?: string | Record<string, string>
    }
  }
  schemaPath: string
}

/**
 * MultiLocaleRichTextField - beforeInput component for rich text with multi-locale support
 *
 * This component adds locale tabs above Payload's native rich text editor.
 * Switching locale tabs will change the page locale (requires reload).
 * This preserves all Payload rich text features (slash commands, toolbar, etc.)
 */
export const MultiLocaleRichTextField: React.FC<MultiLocaleRichTextFieldProps> = ({
  path,
  field,
}) => {
  const { value } = useField<LexicalContent>({ path })
  const currentLocale = useLocale()
  const { i18n } = useTranslation()
  const adminLang = i18n.language // Admin UI language (from account settings)
  const { id, collectionSlug, globalSlug } = useDocumentInfo()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Active locale is always the current Payload locale
  const activeLocale = currentLocale.code as LocaleCode

  // Store all locale values in memory (for showing filled status)
  const [localeValues, setLocaleValues] = useState<LocaleValue[]>(
    SUPPORTED_LOCALES.map(l => ({
      locale: l.code as LocaleCode,
      value: l.code === currentLocale.code ? value : null,
      isLoading: l.code !== currentLocale.code && !!id,
    }))
  )

  // Copy/translate state
  const [targetLocales, setTargetLocales] = useState<LocaleCode[]>([])
  const [showCopyPanel, setShowCopyPanel] = useState(false)
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translateMode, setTranslateMode] = useState<'copy' | 'translate'>('translate')

  // Translation progress tracking
  const [translationProgress, setTranslationProgress] = useState<{
    completed: number
    total: number
    currentLocale: string
    results: { locale: string; success: boolean }[]
  } | null>(null)

  // Track if we've loaded other locales
  const hasLoadedRef = useRef(false)

  // Load all locale values for existing documents using shared cache
  useEffect(() => {
    if (!id || hasLoadedRef.current) return
    hasLoadedRef.current = true

    const loadFromCache = async () => {
      // Invalidate and fetch fresh data
      invalidateCache(collectionSlug, globalSlug, id)
      await fetchAllLocaleData(collectionSlug, globalSlug, id)

      // Extract field values from cache
      const newValues = SUPPORTED_LOCALES.map((locale) => {
        if (locale.code === currentLocale.code) {
          return {
            locale: locale.code as LocaleCode,
            value: value,
            isLoading: false,
          }
        }

        const fieldValue = getFieldFromCache(
          collectionSlug,
          globalSlug,
          id,
          field.name,
          locale.code as LocaleCode
        ) as LexicalContent

        return {
          locale: locale.code as LocaleCode,
          value: fieldValue ?? null,
          isLoading: false,
        }
      })

      setLocaleValues(newValues)
    }

    loadFromCache()
  }, [id, collectionSlug, globalSlug, field.name, currentLocale.code, value])

  // Sync current locale value from editor to state
  useEffect(() => {
    setLocaleValues(prev =>
      prev.map(l =>
        l.locale === activeLocale ? { ...l, value: value } : l
      )
    )
  }, [value, activeLocale])

  // Save content to a specific locale (for non-current locales, needs API call)
  // Sends the rich text field + any required localized text fields from cache
  // to avoid Payload validation errors (e.g. required `title` field)
  const handleSaveLocale = useCallback(async (locale: LocaleCode, content: LexicalContent) => {
    if (!id || locale === currentLocale.code) return

    const baseEndpoint = collectionSlug
      ? `/api/${collectionSlug}/${id}`
      : `/api/globals/${globalSlug}`

    try {
      // Build PATCH body: start with the rich text field
      const patchBody: Record<string, unknown> = { [field.name]: content }

      // Include required localized text fields from cache to pass Payload validation.
      // Without this, PATCH fails with 400 if e.g. `title` is required but empty for this locale.
      // We only include simple string fields — no relations or arrays — to avoid race conditions.
      const requiredFields: Record<string, string[]> = {
        pages: ['title'],
        products: ['name'],
        'product-series': ['name'],
        'faq-items': ['question'],
      }

      const fieldsToInclude = collectionSlug ? (requiredFields[collectionSlug] || []) : []
      for (const reqField of fieldsToInclude) {
        if (reqField === field.name) continue // Already in the body
        // Try to get from cache
        const cachedValue = getFieldFromCache(collectionSlug, globalSlug, id, reqField, locale)
        if (cachedValue && typeof cachedValue === 'string') {
          patchBody[reqField] = cachedValue
        } else {
          // Fallback: get from source locale (current locale)
          const sourceCachedValue = getFieldFromCache(collectionSlug, globalSlug, id, reqField, currentLocale.code as LocaleCode)
          if (sourceCachedValue && typeof sourceCachedValue === 'string') {
            patchBody[reqField] = sourceCachedValue
          }
        }
      }

      const res = await fetch(`${baseEndpoint}?locale=${locale}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchBody),
      })

      if (!res.ok) {
        const errorBody = await res.text()
        console.error(`Failed to save ${locale}: ${res.status}`, errorBody)
        throw new Error(`Failed to save ${locale}: ${res.status}`)
      }
    } catch (error) {
      console.error(`Failed to save ${locale}:`, error)
      throw error
    }
  }, [id, collectionSlug, globalSlug, currentLocale.code, field.name])

  // Handle locale tab click - switch page locale via URL
  const handleLocaleChange = useCallback((newLocale: LocaleCode) => {
    if (newLocale === activeLocale) return

    // Build new URL with the selected locale
    const params = new URLSearchParams(searchParams.toString())
    params.set('locale', newLocale)

    // Preserve hash (tab state) when changing locale
    const hash = window.location.hash
    const newUrl = `${window.location.pathname}?${params.toString()}${hash}`

    // Use window.location.href to preserve hash
    window.location.href = newUrl
  }, [activeLocale, searchParams])

  // Copy content from current locale to selected locales
  const handleCopyToLocales = useCallback(async () => {
    if (targetLocales.length === 0) return

    const sourceValue = localeValues.find(l => l.locale === activeLocale)?.value
    if (!sourceValue || !hasRichTextContent(sourceValue)) {
      const localeLabel = SUPPORTED_LOCALES.find(l => l.code === activeLocale)?.label || activeLocale
      const isZh = i18n?.language === 'zh'
      window.alert(isZh
        ? `当前语言（${localeLabel}）的此字段没有内容。从空的源语言复制将产生空结果，并可能覆盖已有的翻译内容。\n\n请先切换到有内容的语言。`
        : `The current locale (${localeLabel}) has no content in this field. Copying from an empty source will produce empty results and may overwrite existing translations.\n\nPlease switch to a locale that has content first.`)
      return
    }

    setIsTranslating(true)
    setTranslationProgress({ completed: 0, total: targetLocales.length, currentLocale: '', results: [] })

    // Update state
    setLocaleValues(prev =>
      prev.map(l => {
        if (targetLocales.includes(l.locale)) {
          if (!overwriteExisting && hasRichTextContent(l.value)) {
            return l
          }
          return { ...l, value: sourceValue }
        }
        return l
      })
    )

    // If document exists, save to API sequentially (one at a time).
    // Payload internally does read-modify-write on the full document,
    // so parallel PATCHes to the same document will overwrite each other.
    const results: { locale: string; success: boolean }[] = []
    if (id) {
      const localesToSave = targetLocales.filter(locale => {
        if (locale === currentLocale.code) return false
        const existing = localeValues.find(l => l.locale === locale)
        return overwriteExisting || !hasRichTextContent(existing?.value)
      })
      for (const locale of localesToSave) {
        try {
          await handleSaveLocale(locale, sourceValue)
          results.push({ locale, success: true })
        } catch {
          results.push({ locale, success: false })
        }
        setTranslationProgress(prev => prev ? {
          ...prev,
          completed: results.length,
          results: [...results],
          currentLocale: '',
        } : null)
      }
      // Invalidate cache after saving
      invalidateCache(collectionSlug, globalSlug, id)
    } else {
      // No API call needed (new document), all succeed
      results.push(...targetLocales.map(l => ({ locale: l, success: true })))
    }

    // Show final results
    setTranslationProgress({
      completed: targetLocales.length,
      total: targetLocales.length,
      currentLocale: '',
      results,
    })
    setTargetLocales([])
    setIsTranslating(false)

    // Auto-hide progress after 5 seconds
    setTimeout(() => {
      setTranslationProgress(null)
    }, 5000)
  }, [activeLocale, targetLocales, localeValues, overwriteExisting, id, currentLocale.code, handleSaveLocale, collectionSlug, globalSlug, i18n])

  // Translate content from current locale to selected locales
  const handleTranslateToLocales = useCallback(async () => {
    if (targetLocales.length === 0) return

    const sourceValue = localeValues.find(l => l.locale === activeLocale)?.value
    if (!sourceValue || !hasRichTextContent(sourceValue)) {
      const localeLabel = SUPPORTED_LOCALES.find(l => l.code === activeLocale)?.label || activeLocale
      const isZh = i18n?.language === 'zh'
      window.alert(isZh
        ? `当前语言（${localeLabel}）的此字段没有内容。从空的源语言翻译将产生空结果，并可能覆盖已有的翻译内容。\n\n请先切换到有内容的语言。`
        : `The current locale (${localeLabel}) has no content in this field. Translating from an empty source will produce empty results and may overwrite existing translations.\n\nPlease switch to a locale that has content first.`)
      return
    }

    setIsTranslating(true)
    setTranslationProgress({ completed: 0, total: targetLocales.length, currentLocale: '', results: [] })

    try {
      // Extract all text segments from the source content
      const segments = extractTextsFromLexical(sourceValue)
      if (segments.length === 0) {
        // No text to translate, just copy
        await handleCopyToLocales()
        return
      }

      const textsToTranslate = segments.map(s => s.text)
      const results: { locale: string; success: boolean }[] = []

      // Translate to all target locales sequentially with progress tracking
      const translationResults: { locale: LocaleCode; content: LexicalContent | null; skipped: boolean }[] = []

      for (const targetLang of targetLocales) {
        setTranslationProgress(prev => prev ? { ...prev, currentLocale: targetLang } : null)

        // Check if we should skip (has content and not overwriting)
        const existing = localeValues.find(l => l.locale === targetLang)
        if (!overwriteExisting && hasRichTextContent(existing?.value)) {
          translationResults.push({ locale: targetLang, content: null, skipped: true })
          results.push({ locale: targetLang, success: true })
          setTranslationProgress(prev => prev ? {
            ...prev,
            completed: prev.completed + 1,
            results: [...prev.results, { locale: targetLang, success: true }],
          } : null)
          continue
        }

        try {
          // Get user's personal translation settings
          const { getTranslationHeaders } = await import('@/lib/translation-client')
          const personalHeaders = getTranslationHeaders()

          const res = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...personalHeaders },
            body: JSON.stringify({
              texts: textsToTranslate,
              sourceLang: activeLocale,
              targetLang: targetLang,
            }),
          })

          if (!res.ok) {
            console.error(`Translation to ${targetLang} failed`)
            translationResults.push({ locale: targetLang, content: null, skipped: false })
            results.push({ locale: targetLang, success: false })
          } else {
            const data = await res.json()
            const translatedTexts = data.translations as string[]

            if (!translatedTexts || !Array.isArray(translatedTexts)) {
              console.error(`Invalid translation response for ${targetLang}:`, data)
              translationResults.push({ locale: targetLang, content: null, skipped: false })
              results.push({ locale: targetLang, success: false })
            } else {
              // Reconstruct Lexical content with translated texts
              const translatedContent = replaceTextsInLexical(sourceValue, segments, translatedTexts)
              translationResults.push({ locale: targetLang, content: translatedContent, skipped: false })
              results.push({ locale: targetLang, success: true })
            }
          }
        } catch (error) {
          console.error(`Translation to ${targetLang} error:`, error)
          translationResults.push({ locale: targetLang, content: null, skipped: false })
          results.push({ locale: targetLang, success: false })
        }

        setTranslationProgress(prev => prev ? {
          ...prev,
          completed: prev.completed + 1,
          results: [...results],
        } : null)
      }

      // Update state with translated content
      setLocaleValues(prev =>
        prev.map(l => {
          const result = translationResults.find(r => r.locale === l.locale)
          if (result && result.content && !result.skipped) {
            return { ...l, value: result.content }
          }
          return l
        })
      )

      // If document exists, save to API one at a time (sequential).
      // Payload internally does read-modify-write on the full document,
      // so parallel PATCHes to the same document will overwrite each other.
      if (id) {
        const toSave = translationResults.filter(r => r.content && !r.skipped && r.locale !== currentLocale.code)
        for (const r of toSave) {
          try {
            await handleSaveLocale(r.locale, r.content!)
          } catch {
            // Mark as failed in results if save fails
            const idx = results.findIndex(res => res.locale === r.locale)
            if (idx !== -1) results[idx].success = false
          }
        }
        // Invalidate cache after saving
        invalidateCache(collectionSlug, globalSlug, id)
      }

      // Show final results for 5 seconds
      setTranslationProgress({
        completed: targetLocales.length,
        total: targetLocales.length,
        currentLocale: '',
        results,
      })

      setTargetLocales([])

      // Auto-hide progress after 5 seconds
      setTimeout(() => {
        setTranslationProgress(null)
      }, 5000)
    } catch (error) {
      console.error('Translation error:', error)
      setTranslationProgress(null)
    } finally {
      setIsTranslating(false)
    }
  }, [activeLocale, targetLocales, localeValues, overwriteExisting, id, currentLocale.code, handleSaveLocale, handleCopyToLocales, collectionSlug, globalSlug, i18n])

  // Select helpers
  const handleSelectAllTargets = useCallback(() => {
    const allExceptActive = SUPPORTED_LOCALES
      .filter(l => l.code !== activeLocale)
      .map(l => l.code as LocaleCode)
    setTargetLocales(allExceptActive)
  }, [activeLocale])

  const handleSelectEmptyTargets = useCallback(() => {
    const emptyLocales = localeValues
      .filter(l => l.locale !== activeLocale && !hasRichTextContent(l.value))
      .map(l => l.locale)
    setTargetLocales(emptyLocales)
  }, [activeLocale, localeValues])

  const label = typeof field.label === 'string'
    ? field.label
    : field.label?.[adminLang] || field.label?.en || field.label?.zh || field.name

  const description = typeof field.admin?.description === 'string'
    ? field.admin.description
    : field.admin?.description?.[adminLang] || field.admin?.description?.en || field.admin?.description?.zh || ''

  const activeLocaleInfo = SUPPORTED_LOCALES.find(l => l.code === activeLocale)
  const filledCount = localeValues.filter(l => hasRichTextContent(l.value)).length

  return (
    <div className="ml-richtext-field">
      {/* Header */}
      <div className="ml-richtext-field__header">
        <label className="ml-richtext-field__label">
          {label}
          {field.required && <span className="required">*</span>}
        </label>
        <div className="ml-richtext-field__actions">
          <span className="ml-richtext-field__count">
            {filledCount}/{SUPPORTED_LOCALES.length}
          </span>
          <button
            type="button"
            className="ml-btn ml-btn--secondary"
            onClick={() => setShowCopyPanel(!showCopyPanel)}
          >
            {showCopyPanel ? 'Hide' : 'Copy to Locales'}
          </button>
        </div>
      </div>

      {description && (
        <p className="ml-richtext-field__description">{description}</p>
      )}

      {/* Locale tabs */}
      <div className="ml-richtext-field__locale-tabs">
        {SUPPORTED_LOCALES.map(locale => {
          const localeData = localeValues.find(l => l.locale === locale.code)
          const hasContent = hasRichTextContent(localeData?.value)
          const isActive = activeLocale === locale.code
          const isPayloadCurrent = locale.code === currentLocale.code

          return (
            <button
              key={locale.code}
              type="button"
              className={`locale-tab ${isActive ? 'locale-tab--active' : ''} ${hasContent ? 'locale-tab--has-content' : ''} ${isPayloadCurrent ? 'locale-tab--payload-current' : ''}`}
              onClick={() => handleLocaleChange(locale.code as LocaleCode)}
              title={`${locale.label}${hasContent ? ' (has content)' : ' (empty)'}${isPayloadCurrent ? ' - Current locale' : ''}`}
            >
              <LocaleFlag localeCode={locale.code} className="locale-tab__flag" />
              <span className="locale-tab__code">{locale.code.toUpperCase()}</span>
              {hasContent && <span className="locale-tab__dot">✓</span>}
            </button>
          )
        })}
      </div>

      {/* Copy/Translate panel */}
      {showCopyPanel && (
        <div className="ml-richtext-field__copy-panel">
          <div className="copy-panel__header">
            <span>
              {translateMode === 'translate' ? 'Translate' : 'Copy'} from <LocaleFlag localeCode={activeLocale} className="inline-flag" /> {activeLocale.toUpperCase()} to:
            </span>
            <div className="copy-panel__quick-select">
              <button type="button" className="ml-btn ml-btn--text" onClick={handleSelectAllTargets}>All</button>
              <button type="button" className="ml-btn ml-btn--text" onClick={handleSelectEmptyTargets}>Empty</button>
              <button type="button" className="ml-btn ml-btn--text" onClick={() => setTargetLocales([])}>Clear</button>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="copy-panel__mode-toggle">
            <button
              type="button"
              className={`mode-btn ${translateMode === 'translate' ? 'mode-btn--active' : ''}`}
              onClick={() => setTranslateMode('translate')}
            >
              🌐 Translate
            </button>
            <button
              type="button"
              className={`mode-btn ${translateMode === 'copy' ? 'mode-btn--active' : ''}`}
              onClick={() => setTranslateMode('copy')}
            >
              📋 Copy
            </button>
          </div>

          <div className="copy-panel__locales">
            {SUPPORTED_LOCALES.filter(l => l.code !== activeLocale).map(locale => {
              const localeData = localeValues.find(l => l.locale === locale.code)
              const isSelected = targetLocales.includes(locale.code as LocaleCode)
              const hasContent = hasRichTextContent(localeData?.value)

              return (
                <label
                  key={locale.code}
                  className={`copy-panel__locale ${hasContent ? 'copy-panel__locale--filled' : ''} ${isSelected ? 'copy-panel__locale--selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isTranslating}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTargetLocales([...targetLocales, locale.code as LocaleCode])
                      } else {
                        setTargetLocales(targetLocales.filter(l => l !== locale.code))
                      }
                    }}
                  />
                  <LocaleFlag localeCode={locale.code} className="inline-flag" />
                  <span>{locale.code.toUpperCase()}</span>
                  {hasContent && <span className="filled-dot">✓</span>}
                </label>
              )
            })}
          </div>
          <div className="copy-panel__actions">
            <label className="copy-panel__overwrite">
              <input
                type="checkbox"
                checked={overwriteExisting}
                disabled={isTranslating}
                onChange={(e) => setOverwriteExisting(e.target.checked)}
              />
              Overwrite existing
            </label>
            <button
              type="button"
              className={`ml-btn ${translateMode === 'translate' ? 'ml-btn--translate' : 'ml-btn--primary'}`}
              onClick={translateMode === 'translate' ? handleTranslateToLocales : handleCopyToLocales}
              disabled={targetLocales.length === 0 || isTranslating}
            >
              {isTranslating ? (
                <>
                  <span className="spinner"></span>
                  {translationProgress
                    ? `${translationProgress.completed}/${translationProgress.total} ${translationProgress.currentLocale ? `(${translationProgress.currentLocale.toUpperCase()})` : ''}`
                    : 'Translating...'}
                </>
              ) : translateMode === 'translate' ? (
                `🌐 Translate to ${targetLocales.length} locale(s)`
              ) : (
                `Copy to ${targetLocales.length} locale(s)`
              )}
            </button>
          </div>

          {/* Translation progress & results */}
          {translationProgress && (
            <div className="copy-panel__progress">
              <div className="progress-bar">
                <div
                  className="progress-bar__fill"
                  style={{ width: `${(translationProgress.completed / translationProgress.total) * 100}%` }}
                />
              </div>
              {!isTranslating && translationProgress.completed === translationProgress.total && (
                <div className="progress-result">
                  {(() => {
                    const successCount = translationProgress.results.filter(r => r.success).length
                    const failCount = translationProgress.results.filter(r => !r.success).length
                    if (failCount === 0) {
                      return <span className="progress-result--success">✓ {successCount} locale(s) translated successfully</span>
                    }
                    return (
                      <span className="progress-result--partial">
                        ✓ {successCount} succeeded, ✗ {failCount} failed
                        ({translationProgress.results.filter(r => !r.success).map(r => r.locale.toUpperCase()).join(', ')})
                      </span>
                    )
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Current editing locale indicator */}
      <div className="ml-richtext-field__editing-indicator">
        <LocaleFlag localeCode={activeLocale} className="editing-flag" />
        <span>Editing: <strong>{activeLocaleInfo?.label}</strong></span>
      </div>
    </div>
  )
}

function hasRichTextContent(value: LexicalContent | undefined): boolean {
  if (!value) return false
  if (!value.root?.children || !Array.isArray(value.root.children)) return false
  if (value.root.children.length === 0) return false

  // Check for empty paragraph
  const firstChild = value.root.children[0] as { children?: Array<{ text?: string }> }
  if (value.root.children.length === 1 && firstChild?.children) {
    const textContent = firstChild.children.map(c => c.text || '').join('')
    return textContent.trim().length > 0
  }
  return true
}

/**
 * Extract all text segments from Lexical content
 * Returns array of texts and their paths for later replacement
 *
 * Handles:
 * - Regular text nodes
 * - Custom feature nodes (hero, carousel, marquee links, etc.)
 * - Layout block nodes (TwoColumns, ThreeColumns, Sidebar, Container) and their nested richText fields
 */
interface TextSegment {
  text: string
  path: (string | number)[]
}

function extractTextsFromLexical(node: unknown, path: (string | number)[] = []): TextSegment[] {
  const segments: TextSegment[] = []

  if (!node || typeof node !== 'object') return segments

  const obj = node as Record<string, unknown>

  // Skip code blocks entirely (type === 'code')
  if (obj.type === 'code') {
    return segments
  }

  // If this node has a text property (text node)
  if (typeof obj.text === 'string' && obj.text.trim()) {
    const text = obj.text

    // Check if this text node has code format
    // In Lexical, format is a bitmask: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code, 32=subscript, 64=superscript
    const textFormat = typeof obj.format === 'number' ? obj.format : 0
    const isCodeFormat = (textFormat & 16) !== 0

    // Skip if text is in code format - these are component keys (e.g., hero-carousel, hero-carousel-title)
    if (!isCodeFormat) {
      segments.push({ text: obj.text, path: [...path, 'text'] })
    }
  }

  // Handle Lexical Block nodes (layout blocks like TwoColumns, ThreeColumns, etc.)
  if (typeof obj.type === 'string' && obj.type === 'block' && obj.fields && typeof obj.fields === 'object') {
    const fields = obj.fields as Record<string, unknown>

    // Recursively process all richText fields in the block
    Object.keys(fields).forEach((fieldKey) => {
      const fieldValue = fields[fieldKey]

      // Check if this field looks like Lexical content (has root with children)
      if (fieldValue && typeof fieldValue === 'object') {
        const fieldObj = fieldValue as Record<string, unknown>
        if (fieldObj.root && typeof fieldObj.root === 'object') {
          // This is a richText field, process it recursively
          segments.push(...extractTextsFromLexical(fieldValue, [...path, 'fields', fieldKey]))
        }
      }
    })
  }

  // Handle custom feature nodes (nodes with type and data)
  if (typeof obj.type === 'string' && obj.data && typeof obj.data === 'object') {
    const nodeType = obj.type
    const nodeData = obj.data as Record<string, unknown>

    // Import translation config
    const { extractTranslatableTexts: extractCustomFeatureTexts } = require('@/lib/lexical-translation-config')

    try {
      const customTexts = extractCustomFeatureTexts(nodeType, nodeData)

      // Add custom feature texts with their paths
      customTexts.forEach((text: string, index: number) => {
        segments.push({
          text,
          path: [...path, 'data', '__customFeatureText__', index]
        })
      })
    } catch (error) {
      // Silently skip if custom feature extraction fails
      console.warn(`Failed to extract texts from custom feature ${nodeType}:`, error)
    }
  }

  // Recursively process children
  if (Array.isArray(obj.children)) {
    obj.children.forEach((child, index) => {
      segments.push(...extractTextsFromLexical(child, [...path, 'children', index]))
    })
  }

  // Process root
  if (obj.root && typeof obj.root === 'object') {
    segments.push(...extractTextsFromLexical(obj.root, [...path, 'root']))
  }

  return segments
}

/**
 * Replace text segments in Lexical content with translated texts
 * Handles:
 * - Regular text nodes
 * - Custom feature nodes (hero, carousel, etc.)
 * - Layout block nodes (TwoColumns, ThreeColumns, etc.) and their nested richText fields
 */
function replaceTextsInLexical(
  content: LexicalContent,
  segments: TextSegment[],
  translatedTexts: string[]
): LexicalContent {
  if (!content) return content

  // Deep clone the content
  const newContent = JSON.parse(JSON.stringify(content)) as LexicalContent

  // Group custom feature texts by their node path
  const customFeatureTexts = new Map<string, string[]>()

  // Replace each text segment
  segments.forEach((segment, index) => {
    if (index >= translatedTexts.length) return

    // Check if this is a custom feature text
    const isCustomFeature = segment.path.includes('__customFeatureText__')

    if (isCustomFeature) {
      // Extract node path (everything before 'data')
      const dataIndex = segment.path.indexOf('data')
      if (dataIndex === -1) return

      const nodePath = segment.path.slice(0, dataIndex).join('.')
      if (!customFeatureTexts.has(nodePath)) {
        customFeatureTexts.set(nodePath, [])
      }
      customFeatureTexts.get(nodePath)!.push(translatedTexts[index])
    } else {
      // Regular text node - replace directly
      let current: unknown = newContent
      const pathToParent = segment.path.slice(0, -1)
      const lastKey = segment.path[segment.path.length - 1]

      // Navigate to parent
      for (const key of pathToParent) {
        if (current && typeof current === 'object') {
          current = (current as Record<string | number, unknown>)[key]
        }
      }

      // Set the translated text
      if (current && typeof current === 'object') {
        (current as Record<string | number, unknown>)[lastKey] = translatedTexts[index]
      }
    }
  })

  // Replace custom feature texts
  const { replaceTranslatableTexts } = require('@/lib/lexical-translation-config')

  customFeatureTexts.forEach((texts, nodePath) => {
    let current: unknown = newContent
    const pathParts = nodePath.split('.').filter(p => p)

    // Navigate to the node
    for (const key of pathParts) {
      if (current && typeof current === 'object') {
        current = (current as Record<string | number, unknown>)[key]
      }
    }

    // Replace texts in the custom feature node
    if (current && typeof current === 'object') {
      const node = current as Record<string, unknown>
      if (node.type && node.data && typeof node.data === 'object') {
        try {
          node.data = replaceTranslatableTexts(
            node.type as string,
            node.data,
            texts
          )
        } catch (error) {
          console.warn(`Failed to replace texts in custom feature ${node.type}:`, error)
        }
      }
    }
  })

  return newContent
}

export default MultiLocaleRichTextField
