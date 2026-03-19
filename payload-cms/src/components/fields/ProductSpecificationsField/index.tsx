'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useField, useDocumentInfo, useLocale, useTranslation } from '@payloadcms/ui'
import { SUPPORTED_LOCALES, type LocaleCode } from '../../../lib/locales'
import { fetchAllLocaleData, getFieldFromCache } from '../localeDataCache'
import { MediaPicker } from '../MediaPicker'
import { LocaleFlag } from '../../ui/LocaleFlag'
import './styles.scss'

interface SpecificationItem {
  text: string
  url?: string
  image?: string
  color?: string
}

interface SpecificationGroup {
  text: string
  items: SpecificationItem[]
}

interface LocaleData {
  locale: LocaleCode
  specifications: SpecificationGroup[]
  isLoading: boolean
}

interface ProductSpecificationsFieldProps {
  path: string
  field: {
    name: string
    label?: string | Record<string, string>
    admin?: {
      description?: string | Record<string, string>
    }
  }
}

export const ProductSpecificationsField: React.FC<ProductSpecificationsFieldProps> = ({
  path,
  field,
}) => {
  const { value, setValue } = useField<SpecificationGroup[] | null>({ path })
  const currentLocale = useLocale()
  const { i18n } = useTranslation()
  const adminLang = i18n.language // Admin UI language (from account settings)
  const isZh = adminLang === 'zh'
  const { id, collectionSlug } = useDocumentInfo()

  // Active locale for editing
  const [activeLocale, setActiveLocale] = useState<LocaleCode>(currentLocale.code as LocaleCode)

  // All locales data
  const [localeData, setLocaleData] = useState<LocaleData[]>(
    SUPPORTED_LOCALES.map(l => ({
      locale: l.code as LocaleCode,
      specifications: l.code === currentLocale.code ? (value || []) : [],
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
            specifications: l.code === currentLocale.code ? (value || []) : [],
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
            specifications: value || [],
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
          specifications: Array.isArray(fieldValue) ? fieldValue : [],
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
          ? { ...l, specifications: value || [] }
          : l
      )
    )
  }, [value, currentLocale.code])

  // Get active locale's data
  const activeData = localeData.find(l => l.locale === activeLocale)
  const currentSpecs = activeData?.specifications || []

  // Update specifications for a locale
  const updateLocaleSpecs = useCallback((locale: LocaleCode, newSpecs: SpecificationGroup[]) => {
    setLocaleData(prev =>
      prev.map(l => l.locale === locale ? { ...l, specifications: newSpecs } : l)
    )

    if (locale === currentLocale.code) {
      setValue(newSpecs)
    }
  }, [currentLocale.code, setValue])

  // Save to other locale via API
  const saveToLocale = useCallback(async (locale: LocaleCode, specs: SpecificationGroup[]) => {
    if (!id || locale === currentLocale.code) return

    try {
      await fetch(`/api/${collectionSlug}/${id}?locale=${locale}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field.name]: specs }),
      })
    } catch (error) {
      console.error(`Failed to save ${locale}:`, error)
    }
  }, [id, collectionSlug, currentLocale.code, field.name])

  // Add group
  const addGroup = useCallback(() => {
    const newSpecs = [...currentSpecs, { text: '', items: [] }]
    updateLocaleSpecs(activeLocale, newSpecs)
  }, [currentSpecs, activeLocale, updateLocaleSpecs])

  // Remove group
  const removeGroup = useCallback((groupIdx: number) => {
    const newSpecs = currentSpecs.filter((_, i) => i !== groupIdx)
    updateLocaleSpecs(activeLocale, newSpecs)
  }, [currentSpecs, activeLocale, updateLocaleSpecs])

  // Update group text
  const updateGroupText = useCallback((groupIdx: number, text: string) => {
    const newSpecs = currentSpecs.map((group, i) =>
      i === groupIdx ? { ...group, text } : group
    )
    updateLocaleSpecs(activeLocale, newSpecs)
  }, [currentSpecs, activeLocale, updateLocaleSpecs])

  // Add item to group
  const addItem = useCallback((groupIdx: number) => {
    const newSpecs = currentSpecs.map((group, i) =>
      i === groupIdx
        ? { ...group, items: [...group.items, { text: '', url: '', image: '', color: '' }] }
        : group
    )
    updateLocaleSpecs(activeLocale, newSpecs)
  }, [currentSpecs, activeLocale, updateLocaleSpecs])

  // Remove item from group
  const removeItem = useCallback((groupIdx: number, itemIdx: number) => {
    const newSpecs = currentSpecs.map((group, i) =>
      i === groupIdx
        ? { ...group, items: group.items.filter((_, j) => j !== itemIdx) }
        : group
    )
    updateLocaleSpecs(activeLocale, newSpecs)
  }, [currentSpecs, activeLocale, updateLocaleSpecs])

  // Update item
  const updateItem = useCallback((groupIdx: number, itemIdx: number, updates: Partial<SpecificationItem>) => {
    const newSpecs = currentSpecs.map((group, i) =>
      i === groupIdx
        ? {
            ...group,
            items: group.items.map((item, j) =>
              j === itemIdx ? { ...item, ...updates } : item
            ),
          }
        : group
    )
    updateLocaleSpecs(activeLocale, newSpecs)
  }, [currentSpecs, activeLocale, updateLocaleSpecs])

  // Move group
  const moveGroup = useCallback((index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= currentSpecs.length) return

    const newSpecs = [...currentSpecs]
    const [removed] = newSpecs.splice(index, 1)
    newSpecs.splice(newIndex, 0, removed)
    updateLocaleSpecs(activeLocale, newSpecs)
  }, [currentSpecs, activeLocale, updateLocaleSpecs])

  // Move item
  const moveItem = useCallback((groupIdx: number, itemIdx: number, direction: 'up' | 'down') => {
    const group = currentSpecs[groupIdx]
    const newIndex = direction === 'up' ? itemIdx - 1 : itemIdx + 1
    if (newIndex < 0 || newIndex >= group.items.length) return

    const newItems = [...group.items]
    const [removed] = newItems.splice(itemIdx, 1)
    newItems.splice(newIndex, 0, removed)

    const newSpecs = currentSpecs.map((g, i) =>
      i === groupIdx ? { ...g, items: newItems } : g
    )
    updateLocaleSpecs(activeLocale, newSpecs)
  }, [currentSpecs, activeLocale, updateLocaleSpecs])

  // Handle blur - save to API if not current locale
  const handleBlur = useCallback(() => {
    if (activeLocale !== currentLocale.code) {
      saveToLocale(activeLocale, currentSpecs)
    }
  }, [activeLocale, currentLocale.code, currentSpecs, saveToLocale])

  // Handle translation - batch mode for better performance
  const handleTranslate = useCallback(async () => {
    const sourceData = localeData.find(l => l.locale === sourceLocale)
    const sourceSpecs = sourceData?.specifications || []
    if (sourceSpecs.length === 0 || targetLocales.length === 0) return

    setIsTranslating(true)

    try {
      // Collect all texts to translate (group names and item texts)
      // Format: [group1.text, group1.item1.text, group1.item2.text, group2.text, ...]
      const allTexts: string[] = []
      const structure: { groupIndex: number; itemIndex: number | null }[] = []

      for (let gi = 0; gi < sourceSpecs.length; gi++) {
        const group = sourceSpecs[gi]
        allTexts.push(group.text)
        structure.push({ groupIndex: gi, itemIndex: null })

        for (let ii = 0; ii < group.items.length; ii++) {
          allTexts.push(group.items[ii].text)
          structure.push({ groupIndex: gi, itemIndex: ii })
        }
      }

      // Translate to all target languages in parallel
      const translationPromises = targetLocales
        .filter(targetLang => {
          const targetData = localeData.find(l => l.locale === targetLang)
          return overwriteExisting || !targetData?.specifications || targetData.specifications.length === 0
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

          // Reconstruct specifications from translated texts
          const translatedSpecs: SpecificationGroup[] = sourceSpecs.map(group => ({
            text: '',
            items: group.items.map(item => ({ ...item, text: '' })),
          }))

          for (let i = 0; i < structure.length; i++) {
            const { groupIndex, itemIndex } = structure[i]
            const translatedText = translations[i] || allTexts[i]

            if (itemIndex === null) {
              translatedSpecs[groupIndex].text = translatedText
            } else {
              translatedSpecs[groupIndex].items[itemIndex].text = translatedText
            }
          }

          return { targetLang, translatedSpecs }
        })

      const results = await Promise.all(translationPromises)

      // Update all locales and save
      for (const { targetLang, translatedSpecs } of results) {
        updateLocaleSpecs(targetLang, translatedSpecs)
        await saveToLocale(targetLang, translatedSpecs)
      }
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      setIsTranslating(false)
    }
  }, [localeData, sourceLocale, targetLocales, overwriteExisting, updateLocaleSpecs, saveToLocale])

  // Select helpers
  const handleSelectAllTargets = useCallback(() => {
    const allExceptSource = SUPPORTED_LOCALES
      .filter(l => l.code !== sourceLocale)
      .map(l => l.code as LocaleCode)
    setTargetLocales(allExceptSource)
  }, [sourceLocale])

  const handleSelectEmptyTargets = useCallback(() => {
    const emptyLocales = localeData
      .filter(l => l.locale !== sourceLocale && (!l.specifications || l.specifications.length === 0))
      .map(l => l.locale)
    setTargetLocales(emptyLocales)
  }, [sourceLocale, localeData])

  // Calculate completion stats
  const completedCount = localeData.filter(l => l.specifications && l.specifications.length > 0).length
  const completionPercentage = Math.round((completedCount / SUPPORTED_LOCALES.length) * 100)

  const label = typeof field.label === 'string'
    ? field.label
    : field.label?.[adminLang] || field.label?.en || field.label?.zh || field.name

  const description = typeof field.admin?.description === 'string'
    ? field.admin.description
    : field.admin?.description?.[adminLang] || field.admin?.description?.en || field.admin?.description?.zh || ''

  return (
    <div className="product-specs-field">
      <div className="product-specs-field__header">
        <label className="product-specs-field__label">{label}</label>
        <button
          type="button"
          className="psf-btn psf-btn--translate"
          onClick={() => setShowTranslatePanel(!showTranslatePanel)}
        >
          {showTranslatePanel ? (isZh ? '隐藏翻译' : 'Hide Translate') : (isZh ? '自动翻译' : 'Auto-Translate')}
        </button>
      </div>

      {description && (
        <p className="product-specs-field__description">{description}</p>
      )}

      {/* Progress Bar */}
      <div className="product-specs-field__progress">
        <div className="progress-info">
          <span>{isZh ? `已完成 ${completedCount} / ${SUPPORTED_LOCALES.length} 种语言 (${completionPercentage}%)` : `${completedCount} of ${SUPPORTED_LOCALES.length} languages (${completionPercentage}%)`}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${completionPercentage}%` }} />
        </div>
      </div>

      {/* Translation Panel */}
      {showTranslatePanel && (
        <div className="product-specs-field__translate-panel">
          <h4>{isZh ? '自动翻译设置' : 'Auto-Translate Settings'}</h4>

          <div className="translate-row">
            <div className="translate-col">
              <label>{isZh ? '源语言' : 'Source Language'}</label>
              <select
                value={sourceLocale}
                onChange={(e) => setSourceLocale(e.target.value as LocaleCode)}
                disabled={isTranslating}
              >
                {SUPPORTED_LOCALES.map(lang => {
                  const data = localeData.find(l => l.locale === lang.code)
                  const hasContent = data?.specifications && data.specifications.length > 0
                  return (
                    <option key={lang.code} value={lang.code}>
                      {lang.label} {hasContent ? '✓' : '(empty)'}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          <div className="translate-row">
            <div className="translate-col">
              <div className="target-header">
                <label>{isZh ? `目标语言 (${targetLocales.length} 已选择)` : `Target Languages (${targetLocales.length} selected)`}</label>
                <div className="target-actions">
                  <button type="button" onClick={handleSelectAllTargets} disabled={isTranslating}>
                    {isZh ? '全选' : 'Select All'}
                  </button>
                  <button type="button" onClick={handleSelectEmptyTargets} disabled={isTranslating}>
                    {isZh ? '选空' : 'Select Empty'}
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
                    <LocaleFlag localeCode={lang.code} className="target-locale-flag" /> {lang.code.toUpperCase()}
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
              {isZh ? '覆盖已有内容' : 'Overwrite existing content'}
            </label>
            <button
              type="button"
              className="psf-btn psf-btn--primary"
              onClick={handleTranslate}
              disabled={isTranslating || targetLocales.length === 0 || (localeData.find(l => l.locale === sourceLocale)?.specifications?.length || 0) === 0}
            >
              {isTranslating ? (isZh ? '翻译中...' : 'Translating...') : (isZh ? `翻译至 ${targetLocales.length} 种语言` : `Translate to ${targetLocales.length} languages`)}
            </button>
          </div>
        </div>
      )}

      {/* Language Tabs */}
      <div className="product-specs-field__locale-tabs">
        {SUPPORTED_LOCALES.map(lang => {
          const data = localeData.find(l => l.locale === lang.code)
          const isCompleted = data?.specifications && data.specifications.length > 0
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
              <LocaleFlag localeCode={lang.code} className="locale-tab__flag" />
              <span className="locale-tab__code">{lang.code.toUpperCase()}</span>
              {isCompleted && <span className="locale-tab__check">✓</span>}
              {isCurrent && <span className="locale-tab__current">●</span>}
            </button>
          )
        })}
      </div>

      {/* Specifications Editor */}
      <div className="product-specs-field__editor">
        <div className="editor-header">
          <span className="editor-header__locale">
            <LocaleFlag localeCode={activeLocale} className="editor-header__flag" />{' '}
            {SUPPORTED_LOCALES.find(l => l.code === activeLocale)?.label}
            {activeLocale === currentLocale.code && <span className="current-badge">Current Locale</span>}
          </span>
          <span className="editor-header__count">
            {currentSpecs.length} group{currentSpecs.length !== 1 ? 's' : ''}
          </span>
        </div>

        {activeData?.isLoading ? (
          <div className="editor-loading">Loading...</div>
        ) : currentSpecs.length === 0 ? (
          <div className="editor-empty">
            No specifications for this language. Click "Add Specification Group" to start.
          </div>
        ) : (
          <div className="editor-list">
            {currentSpecs.map((group, groupIdx) => (
              <div key={groupIdx} className="spec-group">
                <div className="spec-group__header">
                  <div className="spec-group__move">
                    <button
                      type="button"
                      onClick={() => moveGroup(groupIdx, 'up')}
                      disabled={groupIdx === 0}
                    >▲</button>
                    <button
                      type="button"
                      onClick={() => moveGroup(groupIdx, 'down')}
                      disabled={groupIdx === currentSpecs.length - 1}
                    >▼</button>
                  </div>
                  <div className="spec-group__name">
                    <label>Group Name (e.g., Color, Size)</label>
                    <textarea
                      value={group.text}
                      onChange={(e) => updateGroupText(groupIdx, e.target.value)}
                      onBlur={handleBlur}
                      placeholder="e.g., Color"
                      rows={1}
                    />
                  </div>
                  <button
                    type="button"
                    className="psf-btn psf-btn--danger"
                    onClick={() => {
                      removeGroup(groupIdx)
                      if (activeLocale !== currentLocale.code) {
                        const newSpecs = currentSpecs.filter((_, i) => i !== groupIdx)
                        setTimeout(() => saveToLocale(activeLocale, newSpecs), 0)
                      }
                    }}
                  >
                    Delete Group
                  </button>
                </div>

                <div className="spec-group__items">
                  {group.items.length === 0 ? (
                    <div className="items-empty">
                      No items in this group. Click "Add Item" below.
                    </div>
                  ) : (
                    group.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="spec-item">
                        <div className="spec-item__move">
                          <button
                            type="button"
                            onClick={() => moveItem(groupIdx, itemIdx, 'up')}
                            disabled={itemIdx === 0}
                          >▲</button>
                          <button
                            type="button"
                            onClick={() => moveItem(groupIdx, itemIdx, 'down')}
                            disabled={itemIdx === group.items.length - 1}
                          >▼</button>
                        </div>
                        <div className="spec-item__fields">
                          {/* Item Name + 3D URL on the left */}
                          <div className="spec-item__col spec-item__col--info">
                            <div className="spec-item__field">
                              <label>Item Name</label>
                              <textarea
                                value={item.text}
                                onChange={(e) => updateItem(groupIdx, itemIdx, { text: e.target.value })}
                                onBlur={handleBlur}
                                placeholder="e.g., Red"
                                rows={1}
                              />
                            </div>
                            <div className="spec-item__field">
                              <label>3D URL (Optional)</label>
                              <input
                                type="text"
                                value={item.url || ''}
                                onChange={(e) => updateItem(groupIdx, itemIdx, { url: e.target.value })}
                                onBlur={handleBlur}
                                placeholder="https://..."
                              />
                            </div>
                          </div>

                          {/* Image in the middle */}
                          <div className="spec-item__col spec-item__col--media">
                            <div className="spec-item__field spec-item__field--media">
                              <label>Image (Optional)</label>
                              <MediaPicker
                                field={{
                                  name: `spec-image-${groupIdx}-${itemIdx}`,
                                  label: 'Image',
                                  hasMany: false,
                                }}
                                value={item.image ? Number(item.image) : null}
                                onChange={(newValue) => {
                                  updateItem(groupIdx, itemIdx, { image: newValue ? String(newValue) : '' })
                                  if (activeLocale !== currentLocale.code) {
                                    const newSpecs = currentSpecs.map((g, i) =>
                                      i === groupIdx
                                        ? {
                                            ...g,
                                            items: g.items.map((it, j) =>
                                              j === itemIdx ? { ...it, image: newValue ? String(newValue) : '' } : it
                                            ),
                                          }
                                        : g
                                    )
                                    setTimeout(() => saveToLocale(activeLocale, newSpecs), 0)
                                  }
                                }}
                              />
                            </div>
                          </div>

                          {/* Color Swatch on the right */}
                          <div className="spec-item__col spec-item__col--swatch">
                            <div className="spec-item__field">
                              <label>Swatch (Optional)</label>
                              <div className="spec-item__color-picker-wrap">
                                <div className="spec-item__color-preview-trigger">
                                  <div 
                                    className="spec-item__color-preview-box"
                                    style={{ backgroundColor: item.color || 'transparent' }}
                                    onClick={() => {
                                      const input = document.getElementById(`color-pick-${groupIdx}-${itemIdx}`) as HTMLInputElement;
                                      if (input) input.click();
                                    }}
                                    data-has-color={!!item.color}
                                  >
                                    {!item.color && <span className="spec-item__color-add-icon">+</span>}
                                  </div>
                                  
                                  <input
                                    id={`color-pick-${groupIdx}-${itemIdx}`}
                                    type="color"
                                    value={item.color || '#ffffff'}
                                    onChange={(e) => updateItem(groupIdx, itemIdx, { color: e.target.value })}
                                    className="spec-item__color-hidden-input"
                                  />
                                  
                                  {item.color && (
                                    <button
                                      type="button"
                                      className="spec-item__color-clear-btn"
                                      onClick={() => updateItem(groupIdx, itemIdx, { color: '' })}
                                      title="Clear color"
                                    >
                                      &times;
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  value={item.color || ''}
                                  onChange={(e) => updateItem(groupIdx, itemIdx, { color: e.target.value })}
                                  onBlur={handleBlur}
                                  placeholder="#HEX"
                                  className="spec-item__hex-input"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="psf-btn psf-btn--danger-sm"
                          onClick={() => {
                            removeItem(groupIdx, itemIdx)
                            if (activeLocale !== currentLocale.code) {
                              const newSpecs = currentSpecs.map((g, i) =>
                                i === groupIdx
                                  ? { ...g, items: g.items.filter((_, j) => j !== itemIdx) }
                                  : g
                              )
                              setTimeout(() => saveToLocale(activeLocale, newSpecs), 0)
                            }
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                  <button
                    type="button"
                    className="psf-btn psf-btn--add-item"
                    onClick={() => {
                      addItem(groupIdx)
                      if (activeLocale !== currentLocale.code) {
                        const newSpecs = currentSpecs.map((g, i) =>
                          i === groupIdx
                            ? { ...g, items: [...g.items, { text: '', url: '', image: '', color: '' }] }
                            : g
                        )
                        setTimeout(() => saveToLocale(activeLocale, newSpecs), 0)
                      }
                    }}
                  >
                    + Add Item
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          className="psf-btn psf-btn--add-group"
          onClick={() => {
            addGroup()
            if (activeLocale !== currentLocale.code) {
              const newSpecs = [...currentSpecs, { text: '', items: [] }]
              setTimeout(() => saveToLocale(activeLocale, newSpecs), 0)
            }
          }}
        >
          + Add Specification Group
        </button>
      </div>
    </div>
  )
}

export default ProductSpecificationsField
