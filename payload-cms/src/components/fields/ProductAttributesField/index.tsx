'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useField, useDocumentInfo, useLocale, useTranslation } from '@payloadcms/ui'
import { SUPPORTED_LOCALES, type LocaleCode } from '../../../lib/locales'
import { fetchAllLocaleData, getFieldFromCache } from '../localeDataCache'
import './styles.scss'

interface AttributeItem {
  key: string
  value: string
  isShow: boolean
}

interface LocaleData {
  locale: LocaleCode
  attributes: AttributeItem[]
  isLoading: boolean
}

interface ProductAttributesFieldProps {
  path: string
  field: {
    name: string
    label?: string | Record<string, string>
    admin?: {
      description?: string | Record<string, string>
    }
  }
}

export const ProductAttributesField: React.FC<ProductAttributesFieldProps> = ({
  path,
  field,
}) => {
  const { value, setValue } = useField<AttributeItem[] | null>({ path })
  const currentLocale = useLocale()
  const { i18n } = useTranslation()
  const adminLang = i18n.language // Admin UI language (from account settings)
  const { id, collectionSlug } = useDocumentInfo()

  // Active locale for editing
  const [activeLocale, setActiveLocale] = useState<LocaleCode>(currentLocale.code as LocaleCode)

  // All locales data
  const [localeData, setLocaleData] = useState<LocaleData[]>(
    SUPPORTED_LOCALES.map(l => ({
      locale: l.code as LocaleCode,
      attributes: l.code === currentLocale.code ? (value || []) : [],
      isLoading: l.code !== currentLocale.code,
    }))
  )

  // Translation state
  const [showTranslatePanel, setShowTranslatePanel] = useState(false)
  const [sourceLocale, setSourceLocale] = useState<LocaleCode>('en')
  const [targetLocales, setTargetLocales] = useState<LocaleCode[]>([])
  const [isTranslating, setIsTranslating] = useState(false)
  const [overwriteExisting, setOverwriteExisting] = useState(false)

  // Track if we've loaded locale data
  const hasLoadedRef = useRef(false)

  // Load all locales data on mount using shared cache
  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true

    const loadFromCache = async () => {
      // For new documents without id, just set all locales to empty (not loading)
      if (!id) {
        setLocaleData(
          SUPPORTED_LOCALES.map(l => ({
            locale: l.code as LocaleCode,
            attributes: l.code === currentLocale.code ? (value || []) : [],
            isLoading: false,
          }))
        )
        return
      }

      // Fetch all locales via shared cache (deduplicates across all field components)
      await fetchAllLocaleData(collectionSlug, undefined, id)

      // Extract field values from cache
      const newData = SUPPORTED_LOCALES.map((locale) => {
        if (locale.code === currentLocale.code) {
          return {
            locale: locale.code as LocaleCode,
            attributes: value || [],
            isLoading: false,
          }
        }

        const fieldValue = getFieldFromCache(
          collectionSlug,
          undefined,
          id,
          field.name,
          locale.code as LocaleCode
        )

        return {
          locale: locale.code as LocaleCode,
          attributes: Array.isArray(fieldValue) ? fieldValue : [],
          isLoading: false,
        }
      })

      setLocaleData(newData)
    }

    loadFromCache()
  }, [id, collectionSlug, field.name, currentLocale.code, value])

  // Sync current locale value
  useEffect(() => {
    setLocaleData(prev =>
      prev.map(l =>
        l.locale === currentLocale.code
          ? { ...l, attributes: value || [] }
          : l
      )
    )
  }, [value, currentLocale.code])

  // Get active locale's data
  const activeData = localeData.find(l => l.locale === activeLocale)
  const currentAttrs = activeData?.attributes || []

  // Update attributes for a locale
  const updateLocaleAttributes = useCallback((locale: LocaleCode, newAttrs: AttributeItem[]) => {
    setLocaleData(prev =>
      prev.map(l => l.locale === locale ? { ...l, attributes: newAttrs } : l)
    )

    // If current Payload locale, update via setValue
    if (locale === currentLocale.code) {
      setValue(newAttrs)
    }
  }, [currentLocale.code, setValue])

  // Save to other locale via API
  const saveToLocale = useCallback(async (locale: LocaleCode, attrs: AttributeItem[]) => {
    if (!id || locale === currentLocale.code) return

    try {
      await fetch(`/api/${collectionSlug}/${id}?locale=${locale}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field.name]: attrs }),
      })
    } catch (error) {
      console.error(`Failed to save ${locale}:`, error)
    }
  }, [id, collectionSlug, currentLocale.code, field.name])

  // Add attribute
  const addAttribute = useCallback(() => {
    const newAttrs = [...currentAttrs, { key: '', value: '', isShow: true }]
    updateLocaleAttributes(activeLocale, newAttrs)
  }, [currentAttrs, activeLocale, updateLocaleAttributes])

  // Remove attribute
  const removeAttribute = useCallback((index: number) => {
    const newAttrs = currentAttrs.filter((_, i) => i !== index)
    updateLocaleAttributes(activeLocale, newAttrs)
  }, [currentAttrs, activeLocale, updateLocaleAttributes])

  // Update attribute
  const updateAttribute = useCallback((index: number, updates: Partial<AttributeItem>) => {
    const newAttrs = currentAttrs.map((attr, i) =>
      i === index ? { ...attr, ...updates } : attr
    )
    updateLocaleAttributes(activeLocale, newAttrs)
  }, [currentAttrs, activeLocale, updateLocaleAttributes])

  // Move attribute
  const moveAttribute = useCallback((index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= currentAttrs.length) return

    const newAttrs = [...currentAttrs]
    const [removed] = newAttrs.splice(index, 1)
    newAttrs.splice(newIndex, 0, removed)
    updateLocaleAttributes(activeLocale, newAttrs)
  }, [currentAttrs, activeLocale, updateLocaleAttributes])

  // Handle blur - save to API if not current locale
  const handleBlur = useCallback(() => {
    if (activeLocale !== currentLocale.code) {
      saveToLocale(activeLocale, currentAttrs)
    }
  }, [activeLocale, currentLocale.code, currentAttrs, saveToLocale])

  // Handle translation - batch mode for better performance
  const handleTranslate = useCallback(async () => {
    const sourceData = localeData.find(l => l.locale === sourceLocale)
    const sourceAttrs = sourceData?.attributes || []
    if (sourceAttrs.length === 0 || targetLocales.length === 0) return

    setIsTranslating(true)

    try {
      // Collect all texts to translate (keys and values alternating)
      const allTexts: string[] = []
      for (const attr of sourceAttrs) {
        allTexts.push(attr.key, attr.value)
      }

      // Translate to all target languages in parallel
      const translationPromises = targetLocales
        .filter(targetLang => {
          const targetData = localeData.find(l => l.locale === targetLang)
          return overwriteExisting || !targetData?.attributes || targetData.attributes.length === 0
        })
        .map(async (targetLang) => {
          // Get user's personal translation settings
          const { getTranslationHeaders } = await import('@/lib/translation-client')
          const personalHeaders = getTranslationHeaders()

          // Single batch request for all texts
          const res = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...personalHeaders },
            body: JSON.stringify({
              texts: allTexts,
              sourceLang: sourceLocale,
              targetLang: targetLang,
            }),
          })

          const data = await res.json()
          const translations = data.translations || allTexts

          // Reconstruct attributes from translated texts
          const translatedAttrs: AttributeItem[] = sourceAttrs.map((attr, i) => ({
            key: translations[i * 2] || attr.key,
            value: translations[i * 2 + 1] || attr.value,
            isShow: attr.isShow,
          }))

          return { targetLang, translatedAttrs }
        })

      const results = await Promise.all(translationPromises)

      // Update all locales and save
      for (const { targetLang, translatedAttrs } of results) {
        updateLocaleAttributes(targetLang, translatedAttrs)
        await saveToLocale(targetLang, translatedAttrs)
      }
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      setIsTranslating(false)
    }
  }, [localeData, sourceLocale, targetLocales, overwriteExisting, updateLocaleAttributes, saveToLocale])

  // Select helpers
  const handleSelectAllTargets = useCallback(() => {
    const allExceptSource = SUPPORTED_LOCALES
      .filter(l => l.code !== sourceLocale)
      .map(l => l.code as LocaleCode)
    setTargetLocales(allExceptSource)
  }, [sourceLocale])

  const handleSelectEmptyTargets = useCallback(() => {
    const emptyLocales = localeData
      .filter(l => l.locale !== sourceLocale && (!l.attributes || l.attributes.length === 0))
      .map(l => l.locale)
    setTargetLocales(emptyLocales)
  }, [sourceLocale, localeData])

  // Calculate completion stats
  const completedCount = localeData.filter(l => l.attributes && l.attributes.length > 0).length
  const completionPercentage = Math.round((completedCount / SUPPORTED_LOCALES.length) * 100)

  const label = typeof field.label === 'string'
    ? field.label
    : field.label?.[adminLang] || field.label?.en || field.label?.zh || field.name

  const description = typeof field.admin?.description === 'string'
    ? field.admin.description
    : field.admin?.description?.[adminLang] || field.admin?.description?.en || field.admin?.description?.zh || ''

  return (
    <div className="product-attributes-field">
      <div className="product-attributes-field__header">
        <label className="product-attributes-field__label">{label}</label>
        <button
          type="button"
          className="paf-btn paf-btn--translate"
          onClick={() => setShowTranslatePanel(!showTranslatePanel)}
        >
          {showTranslatePanel ? 'Hide Translate' : 'Auto-Translate'}
        </button>
      </div>

      {description && (
        <p className="product-attributes-field__description">{description}</p>
      )}

      {/* Progress Bar */}
      <div className="product-attributes-field__progress">
        <div className="progress-info">
          <span>{completedCount} of {SUPPORTED_LOCALES.length} languages ({completionPercentage}%)</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${completionPercentage}%` }} />
        </div>
      </div>

      {/* Translation Panel */}
      {showTranslatePanel && (
        <div className="product-attributes-field__translate-panel">
          <h4>Auto-Translate Settings</h4>

          <div className="translate-row">
            <div className="translate-col">
              <label>Source Language</label>
              <select
                value={sourceLocale}
                onChange={(e) => setSourceLocale(e.target.value as LocaleCode)}
                disabled={isTranslating}
              >
                {SUPPORTED_LOCALES.map(lang => {
                  const data = localeData.find(l => l.locale === lang.code)
                  const hasContent = data?.attributes && data.attributes.length > 0
                  return (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.label} {hasContent ? '✓' : '(empty)'}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          <div className="translate-row">
            <div className="translate-col">
              <div className="target-header">
                <label>Target Languages ({targetLocales.length} selected)</label>
                <div className="target-actions">
                  <button type="button" onClick={handleSelectAllTargets} disabled={isTranslating}>
                    Select All
                  </button>
                  <button type="button" onClick={handleSelectEmptyTargets} disabled={isTranslating}>
                    Select Empty
                  </button>
                </div>
              </div>
              <div className="target-locales">
                {SUPPORTED_LOCALES.filter(l => l.code !== sourceLocale).map(lang => (
                  <label key={lang.code} className="target-locale-checkbox">
                    <input
                      type="checkbox"
                      checked={targetLocales.includes(lang.code as LocaleCode)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTargetLocales([...targetLocales, lang.code as LocaleCode])
                        } else {
                          setTargetLocales(targetLocales.filter(l => l !== lang.code))
                        }
                      }}
                      disabled={isTranslating}
                    />
                    {lang.flag} {lang.code.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="translate-actions">
            <label className="overwrite-checkbox">
              <input
                type="checkbox"
                checked={overwriteExisting}
                onChange={(e) => setOverwriteExisting(e.target.checked)}
                disabled={isTranslating}
              />
              Overwrite existing content
            </label>
            <button
              type="button"
              className="paf-btn paf-btn--primary"
              onClick={handleTranslate}
              disabled={isTranslating || targetLocales.length === 0 || (localeData.find(l => l.locale === sourceLocale)?.attributes?.length || 0) === 0}
            >
              {isTranslating ? 'Translating...' : `Translate to ${targetLocales.length} languages`}
            </button>
          </div>
        </div>
      )}

      {/* Language Tabs */}
      <div className="product-attributes-field__locale-tabs">
        {SUPPORTED_LOCALES.map(lang => {
          const data = localeData.find(l => l.locale === lang.code)
          const isCompleted = data?.attributes && data.attributes.length > 0
          const isActive = activeLocale === lang.code
          const isCurrent = lang.code === currentLocale.code

          return (
            <button
              key={lang.code}
              type="button"
              className={`locale-tab ${isActive ? 'locale-tab--active' : ''} ${isCompleted ? 'locale-tab--completed' : ''} ${isCurrent ? 'locale-tab--current' : ''}`}
              onClick={() => setActiveLocale(lang.code as LocaleCode)}
              title={`${lang.label}${isCurrent ? ' (Current)' : ''}`}
            >
              <span className="locale-tab__flag">{lang.flag}</span>
              <span className="locale-tab__code">{lang.code.toUpperCase()}</span>
              {isCompleted && <span className="locale-tab__check">✓</span>}
              {isCurrent && <span className="locale-tab__current">●</span>}
            </button>
          )
        })}
      </div>

      {/* Attributes Editor */}
      <div className="product-attributes-field__editor">
        <div className="editor-header">
          <span className="editor-header__locale">
            {SUPPORTED_LOCALES.find(l => l.code === activeLocale)?.flag}{' '}
            {SUPPORTED_LOCALES.find(l => l.code === activeLocale)?.label}
            {activeLocale === currentLocale.code && <span className="current-badge">Current Locale</span>}
          </span>
          <span className="editor-header__count">
            {currentAttrs.length} attribute{currentAttrs.length !== 1 ? 's' : ''}
          </span>
        </div>

        {activeData?.isLoading ? (
          <div className="editor-loading">Loading...</div>
        ) : currentAttrs.length === 0 ? (
          <div className="editor-empty">
            No attributes for this language. Click "Add Attribute" to start.
          </div>
        ) : (
          <div className="editor-list">
            {currentAttrs.map((attr, index) => (
              <div key={index} className="attribute-item">
                <div className="attribute-item__move">
                  <button
                    type="button"
                    onClick={() => moveAttribute(index, 'up')}
                    disabled={index === 0}
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveAttribute(index, 'down')}
                    disabled={index === currentAttrs.length - 1}
                    title="Move down"
                  >
                    ▼
                  </button>
                </div>

                <div className="attribute-item__fields">
                  <div className="attribute-item__field">
                    <label>Attribute Name</label>
                    <input
                      type="text"
                      value={attr.key}
                      onChange={(e) => updateAttribute(index, { key: e.target.value })}
                      onBlur={handleBlur}
                      placeholder="e.g., Material"
                    />
                  </div>
                  <div className="attribute-item__field">
                    <label>Attribute Value</label>
                    <input
                      type="text"
                      value={attr.value}
                      onChange={(e) => updateAttribute(index, { value: e.target.value })}
                      onBlur={handleBlur}
                      placeholder="e.g., Stainless Steel"
                    />
                  </div>
                </div>

                <div className="attribute-item__actions">
                  <label className="attribute-item__show">
                    <input
                      type="checkbox"
                      checked={attr.isShow}
                      onChange={(e) => {
                        updateAttribute(index, { isShow: e.target.checked })
                        if (activeLocale !== currentLocale.code) {
                          setTimeout(() => saveToLocale(activeLocale, currentAttrs.map((a, i) =>
                            i === index ? { ...a, isShow: e.target.checked } : a
                          )), 0)
                        }
                      }}
                    />
                    <span className={attr.isShow ? 'show' : 'hide'}>
                      {attr.isShow ? 'Show' : 'Hide'}
                    </span>
                  </label>
                  <button
                    type="button"
                    className="paf-btn paf-btn--danger"
                    onClick={() => {
                      removeAttribute(index)
                      if (activeLocale !== currentLocale.code) {
                        const newAttrs = currentAttrs.filter((_, i) => i !== index)
                        setTimeout(() => saveToLocale(activeLocale, newAttrs), 0)
                      }
                    }}
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          className="paf-btn paf-btn--add"
          onClick={() => {
            addAttribute()
            if (activeLocale !== currentLocale.code) {
              const newAttrs = [...currentAttrs, { key: '', value: '', isShow: true }]
              setTimeout(() => saveToLocale(activeLocale, newAttrs), 0)
            }
          }}
        >
          + Add Attribute
        </button>

        {currentAttrs.length > 0 && (
          <div className="editor-stats">
            {currentAttrs.length} attribute{currentAttrs.length !== 1 ? 's' : ''} total,{' '}
            {currentAttrs.filter(a => a.isShow).length} will be displayed on frontend
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductAttributesField
