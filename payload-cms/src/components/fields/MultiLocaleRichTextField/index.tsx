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
  const handleSaveLocale = useCallback(async (locale: LocaleCode, content: LexicalContent) => {
    if (!id || locale === currentLocale.code) return

    const baseEndpoint = collectionSlug
      ? `/api/${collectionSlug}/${id}`
      : `/api/globals/${globalSlug}`

    try {
      // First, fetch the current document for this locale to get all required fields
      const getRes = await fetch(`${baseEndpoint}?locale=${locale}&depth=0`, {
        credentials: 'include',
      })

      if (!getRes.ok) {
        console.error(`Failed to fetch ${locale} data: ${getRes.status}`)
        return
      }

      const existingData = await getRes.json()

      // Merge the new description with existing data
      const updateData = {
        ...existingData,
        [field.name]: content,
      }

      // Remove fields that shouldn't be sent back
      delete updateData.id
      delete updateData.createdAt
      delete updateData.updatedAt

      // Now PATCH with the complete data
      const res = await fetch(`${baseEndpoint}?locale=${locale}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (!res.ok) {
        const errorBody = await res.text()
        console.error(`Failed to save ${locale}: ${res.status}`, errorBody)
      } else {
        console.log(`Successfully saved ${locale}`)
      }
    } catch (error) {
      console.error(`Failed to save ${locale}:`, error)
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
    if (!sourceValue) return

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

    // If document exists, save to API
    if (id) {
      await Promise.all(
        targetLocales.map(locale => {
          if (locale !== currentLocale.code) {
            const existing = localeValues.find(l => l.locale === locale)
            if (overwriteExisting || !hasRichTextContent(existing?.value)) {
              return handleSaveLocale(locale, sourceValue)
            }
          }
          return Promise.resolve()
        })
      )
      // Invalidate cache after saving
      invalidateCache(collectionSlug, globalSlug, id)
    }

    setTargetLocales([])
  }, [activeLocale, targetLocales, localeValues, overwriteExisting, id, currentLocale.code, handleSaveLocale, collectionSlug, globalSlug])

  // Translate content from current locale to selected locales
  const handleTranslateToLocales = useCallback(async () => {
    if (targetLocales.length === 0) return

    const sourceValue = localeValues.find(l => l.locale === activeLocale)?.value
    if (!sourceValue) return

    setIsTranslating(true)

    try {
      // Extract all text segments from the source content
      const segments = extractTextsFromLexical(sourceValue)
      if (segments.length === 0) {
        // No text to translate, just copy
        await handleCopyToLocales()
        return
      }

      const textsToTranslate = segments.map(s => s.text)

      // Translate to all target locales in parallel
      const translationResults = await Promise.all(
        targetLocales.map(async (targetLang) => {
          // Check if we should skip (has content and not overwriting)
          const existing = localeValues.find(l => l.locale === targetLang)
          if (!overwriteExisting && hasRichTextContent(existing?.value)) {
            return { locale: targetLang, content: null, skipped: true }
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
              return { locale: targetLang, content: null, skipped: false }
            }

            const data = await res.json()
            const translatedTexts = data.translations as string[]

            if (!translatedTexts || !Array.isArray(translatedTexts)) {
              console.error(`Invalid translation response for ${targetLang}:`, data)
              return { locale: targetLang, content: null, skipped: false }
            }

            // Reconstruct Lexical content with translated texts
            const translatedContent = replaceTextsInLexical(sourceValue, segments, translatedTexts)
            return { locale: targetLang, content: translatedContent, skipped: false }
          } catch (error) {
            console.error(`Translation to ${targetLang} error:`, error)
            return { locale: targetLang, content: null, skipped: false }
          }
        })
      )

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

      // If document exists, save to API
      if (id) {
        const successfulTranslations = translationResults.filter(r => r.content && !r.skipped)
        await Promise.all(
          successfulTranslations
            .filter(r => r.locale !== currentLocale.code)
            .map(r => handleSaveLocale(r.locale, r.content))
        )
        // Invalidate cache after saving
        invalidateCache(collectionSlug, globalSlug, id)
      }

      setTargetLocales([])
    } catch (error) {
      console.error('Translation error:', error)
    } finally {
      setIsTranslating(false)
    }
  }, [activeLocale, targetLocales, localeValues, overwriteExisting, id, currentLocale.code, handleSaveLocale, handleCopyToLocales, collectionSlug, globalSlug])

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
              {hasContent && <span className="locale-tab__dot">●</span>}
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
                  {hasContent && <span className="filled-dot">●</span>}
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
                  Translating...
                </>
              ) : translateMode === 'translate' ? (
                `🌐 Translate to ${targetLocales.length} locale(s)`
              ) : (
                `Copy to ${targetLocales.length} locale(s)`
              )}
            </button>
          </div>
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
