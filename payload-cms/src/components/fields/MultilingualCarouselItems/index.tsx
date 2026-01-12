'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { useField, useTranslation } from '@payloadcms/ui'
import { SUPPORTED_LOCALES, type LocaleCode } from '../../../lib/locales'
import MediaPicker from '../MediaPicker'
import './styles.scss'

// i18n translations
const i18n = {
  title: { en: 'Carousel Items (Multilingual)', zh: '轮播项目（多语言）' },
  autoTranslate: { en: 'Auto-Translate', zh: '自动翻译' },
  hide: { en: 'Hide', zh: '隐藏' },
  autoTranslateSettings: { en: 'Auto-Translate Settings', zh: '自动翻译设置' },
  sourceLanguage: { en: 'Source Language', zh: '源语言' },
  empty: { en: 'empty', zh: '空' },
  items: { en: 'items', zh: '项' },
  overwriteExisting: { en: 'Overwrite existing translations', zh: '覆盖已有翻译' },
  targetLanguages: { en: 'Target Languages', zh: '目标语言' },
  selected: { en: 'selected', zh: '已选' },
  deselectAll: { en: 'Deselect All', zh: '取消全选' },
  selectAll: { en: 'Select All', zh: '全选' },
  source: { en: 'source', zh: '源' },
  translating: { en: 'Translating...', zh: '翻译中...' },
  translateTo: { en: 'Translate from', zh: '从' },
  to: { en: 'to', zh: '翻译到' },
  language: { en: 'Language', zh: '种语言' },
  languages: { en: 'Languages', zh: '种语言' },
  noItems: { en: 'No items yet. Click "Add Item" to create one.', zh: '暂无项目。点击"添加项目"创建一个。' },
  item: { en: 'Item', zh: '项目' },
  removeItem: { en: 'Remove this item from all languages', zh: '从所有语言中删除此项' },
  fieldTitle: { en: 'Title', zh: '标题' },
  enterTitle: { en: 'Enter title in', zh: '输入标题' },
  buttonText: { en: 'Button Text', zh: '按钮文字' },
  buttonTextPlaceholder: { en: 'Button text in', zh: '按钮文字' },
  linkUrl: { en: 'Link URL (Same for all languages)', zh: '链接URL（所有语言相同）' },
  showItem: { en: 'Show this item', zh: '显示此项' },
  productImage: { en: 'Product Image (Same for all languages)', zh: '产品图片（所有语言相同）' },
  sceneImage: { en: 'Scene Image (Same for all languages)', zh: '场景图片（所有语言相同）' },
  addItem: { en: '+ Add Item (to all languages)', zh: '+ 添加项目（到所有语言）' },
  hint: { en: 'Items are synchronized across all languages. Switch tabs to edit translations.', zh: '项目在所有语言间同步。切换标签编辑翻译。' },
  noItemsError: { en: 'No items found in', zh: '未找到项目于' },
  addItemsFirst: { en: 'Please add items first.', zh: '请先添加项目。' },
  selectTargetError: { en: 'Please select at least one target language', zh: '请至少选择一个目标语言' },
  translationCompleted: { en: 'Translation completed!', zh: '翻译完成！' },
  translationFailed: { en: 'Translation failed', zh: '翻译失败' },
}

interface CarouselItem {
  title?: string
  image?: number | string
  sceneImage?: number | string
  buttonText?: string
  linkUrl?: string
  isShow?: boolean
}

interface MultilingualItems {
  [key: string]: CarouselItem[] // locale -> items array
}

export const MultilingualCarouselItemsField: React.FC<any> = ({ path }) => {
  const { value, setValue } = useField<MultilingualItems>({ path })
  const { i18n: { language } } = useTranslation()
  const t = (obj: { en: string; zh: string }) => language === 'zh' ? obj.zh : obj.en
  const [activeLocale, setActiveLocale] = useState<LocaleCode>('en')
  const [showTranslationPanel, setShowTranslationPanel] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [sourceLanguage, setSourceLanguage] = useState<LocaleCode>('en')
  const [selectedLanguages, setSelectedLanguages] = useState<LocaleCode[]>([])
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const localeCodes = SUPPORTED_LOCALES.map(l => l.code)
  const items = (value?.[activeLocale] || []) as CarouselItem[]

  // Load saved settings from localStorage on mount only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSourceLang = localStorage.getItem('payloadTranslatorSourceLang')
      const savedOverwrite = localStorage.getItem('payloadTranslatorOverwrite')
      const savedLanguages = localStorage.getItem('payloadTranslatorLanguages')

      if (savedSourceLang) setSourceLanguage(savedSourceLang as LocaleCode)
      if (savedOverwrite) setOverwriteExisting(savedOverwrite === 'true')
      if (savedLanguages) {
        try {
          const parsed = JSON.parse(savedLanguages)
          if (Array.isArray(parsed)) {
            setSelectedLanguages(parsed)
          }
        } catch {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save settings to localStorage (debounced to avoid excessive updates)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Mark as initialized after first render
    const timer = setTimeout(() => setIsInitialized(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined' && sourceLanguage) {
      localStorage.setItem('payloadTranslatorSourceLang', sourceLanguage)
    }
  }, [sourceLanguage, isInitialized])

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('payloadTranslatorOverwrite', String(overwriteExisting))
    }
  }, [overwriteExisting, isInitialized])

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined' && selectedLanguages.length > 0) {
      localStorage.setItem('payloadTranslatorLanguages', JSON.stringify(selectedLanguages))
    }
  }, [selectedLanguages, isInitialized])

  // Auto-deselect source language from targets (only after initialization)
  useEffect(() => {
    if (isInitialized) {
      setSelectedLanguages(prev => prev.filter(lang => lang !== sourceLanguage))
    }
  }, [sourceLanguage, isInitialized])

  const addItem = useCallback(() => {
    const newValue = { ...value }
    localeCodes.forEach((locale) => {
      if (!newValue[locale]) {
        newValue[locale] = []
      }
      newValue[locale].push({
        title: '',
        buttonText: '',
        linkUrl: '',
        isShow: true,
      })
    })
    setValue(newValue)
  }, [value, setValue, localeCodes])

  const removeItem = useCallback(
    (index: number) => {
      const newValue = { ...value }
      localeCodes.forEach((locale) => {
        if (newValue[locale]) {
          newValue[locale] = newValue[locale].filter((_, i) => i !== index)
        }
      })
      setValue(newValue)
    },
    [value, setValue, localeCodes],
  )

  const updateItem = useCallback(
    (index: number, field: keyof CarouselItem, fieldValue: any) => {
      const newValue = { ...value }
      if (!newValue[activeLocale]) {
        newValue[activeLocale] = []
      }
      const items = [...newValue[activeLocale]]
      items[index] = {
        ...items[index],
        [field]: fieldValue,
      }
      newValue[activeLocale] = items
      setValue(newValue)
    },
    [value, activeLocale, setValue],
  )

  // Toggle language selection
  const toggleLanguage = useCallback((lang: LocaleCode) => {
    setSelectedLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    )
  }, [])

  // Select/Deselect all languages
  const toggleAllLanguages = useCallback(() => {
    const availableLanguages = localeCodes.filter(l => l !== sourceLanguage)
    if (selectedLanguages.length === availableLanguages.length) {
      setSelectedLanguages([])
    } else {
      setSelectedLanguages(availableLanguages)
    }
  }, [localeCodes, sourceLanguage, selectedLanguages.length])

  // Handle auto-translate
  const handleTranslate = useCallback(async () => {
    const sourceItems = value?.[sourceLanguage]
    if (!sourceItems || sourceItems.length === 0) {
      setError(`${t(i18n.noItemsError)} ${sourceLanguage.toUpperCase()}. ${t(i18n.addItemsFirst)}`)
      return
    }

    if (selectedLanguages.length === 0) {
      setError(t(i18n.selectTargetError))
      return
    }

    setIsTranslating(true)
    setError('')
    setStatus(`${t(i18n.translateTo)} ${sourceLanguage.toUpperCase()} ${t(i18n.to)} ${selectedLanguages.length} ${selectedLanguages.length > 1 ? t(i18n.languages) : t(i18n.language)}...`)

    try {
      const newValue = { ...value }

      for (const targetLang of selectedLanguages) {
        // Skip if overwrite is disabled and target already has items
        if (!overwriteExisting && newValue[targetLang]?.length > 0) {
          continue
        }

        // Translate each item
        const translatedItems: CarouselItem[] = []

        for (const sourceItem of sourceItems) {
          const translatedItem: CarouselItem = {
            ...sourceItem, // Keep non-text fields (image, sceneImage, linkUrl, isShow)
          }

          // Get user's personal translation settings
          const { getTranslationHeaders } = await import('@/lib/translation-client')
          const personalHeaders = getTranslationHeaders()

          // Translate title
          if (sourceItem.title) {
            try {
              const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...personalHeaders },
                credentials: 'include',
                body: JSON.stringify({
                  text: sourceItem.title,
                  sourceLang: sourceLanguage,
                  targetLangs: [targetLang],
                }),
              })

              if (response.ok) {
                const data = await response.json()
                translatedItem.title = data.translations?.[targetLang] || sourceItem.title
              }
            } catch (err) {
              console.error('Translation error for title:', err)
            }
          }

          // Translate buttonText
          if (sourceItem.buttonText) {
            try {
              const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...personalHeaders },
                credentials: 'include',
                body: JSON.stringify({
                  text: sourceItem.buttonText,
                  sourceLang: sourceLanguage,
                  targetLangs: [targetLang],
                }),
              })

              if (response.ok) {
                const data = await response.json()
                translatedItem.buttonText = data.translations?.[targetLang] || sourceItem.buttonText
              }
            } catch (err) {
              console.error('Translation error for buttonText:', err)
            }
          }

          translatedItems.push(translatedItem)
        }

        newValue[targetLang] = translatedItems
      }

      setValue(newValue)
      setStatus(`✅ ${t(i18n.translationCompleted)}`)
      setTimeout(() => {
        setStatus('')
        setShowTranslationPanel(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : t(i18n.translationFailed))
    } finally {
      setIsTranslating(false)
    }
  }, [value, sourceLanguage, selectedLanguages, overwriteExisting, setValue])

  return (
    <div className="multilingual-carousel-items">
      <div className="multilingual-carousel-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ margin: 0 }}>{t(i18n.title)}</h3>
          <button
            type="button"
            onClick={() => setShowTranslationPanel(!showTranslationPanel)}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            🌐 {showTranslationPanel ? t(i18n.hide) : t(i18n.autoTranslate)}
          </button>
        </div>
        <div className="multilingual-carousel-locale-tabs">
          {SUPPORTED_LOCALES.map((locale) => {
            const localeItems = value?.[locale.code]
            const hasItems = Array.isArray(localeItems) &&
                            localeItems.length > 0 &&
                            localeItems.some(item => item.title?.trim())
            const isActive = activeLocale === locale.code

            return (
              <button
                key={locale.code}
                type="button"
                className={`locale-tab ${isActive ? 'active' : ''}`}
                onClick={() => setActiveLocale(locale.code)}
                title={`${locale.label}${hasItems ? ` (${localeItems.length} ${t(i18n.items)})` : ` (${t(i18n.empty)})`}`}
              >
                <span className="locale-flag">{locale.flag}</span>
                <span className="locale-code">{locale.code.toUpperCase()}</span>
                {hasItems && <span className="locale-check">✓</span>}
              </button>
            )
          })}
        </div>

        {/* Translation Panel */}
        {showTranslationPanel && (
          <div style={{
            background: '#f8f9fa',
            padding: '16px',
            borderRadius: '8px',
            marginTop: '1rem',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
              🌐 {t(i18n.autoTranslateSettings)}
            </h4>

            {/* Source Language Selector */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                {t(i18n.sourceLanguage)}
              </label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value as LocaleCode)}
                disabled={isTranslating}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '13px',
                  background: 'white'
                }}
              >
                {SUPPORTED_LOCALES.map(lang => {
                  const hasContent = value?.[lang.code]?.length > 0
                  return (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.label} {hasContent ? `(${value[lang.code].length} ${t(i18n.items)})` : `(${t(i18n.empty)})`}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Overwrite Option */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isTranslating ? 'not-allowed' : 'pointer',
                fontSize: '13px'
              }}>
                <input
                  type="checkbox"
                  checked={overwriteExisting}
                  onChange={(e) => setOverwriteExisting(e.target.checked)}
                  disabled={isTranslating}
                  style={{ cursor: isTranslating ? 'not-allowed' : 'pointer' }}
                />
                <span>{t(i18n.overwriteExisting)}</span>
              </label>
            </div>

            {/* Target Languages Selection */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <label style={{ fontSize: '13px', fontWeight: 500 }}>
                  {t(i18n.targetLanguages)} ({selectedLanguages.length} {t(i18n.selected)})
                </label>
                <button
                  type="button"
                  onClick={toggleAllLanguages}
                  disabled={isTranslating}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    background: 'white',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    cursor: isTranslating ? 'not-allowed' : 'pointer'
                  }}
                >
                  {selectedLanguages.length === localeCodes.filter(l => l !== sourceLanguage).length ? t(i18n.deselectAll) : t(i18n.selectAll)}
                </button>
              </div>

              <div style={{
                background: 'white',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '12px',
                maxHeight: '150px',
                overflowY: 'auto'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '8px'
                }}>
                  {SUPPORTED_LOCALES.map(lang => {
                    const isSourceLang = lang.code === sourceLanguage
                    const isDisabled = isTranslating || isSourceLang

                    return (
                      <label
                        key={lang.code}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          background: selectedLanguages.includes(lang.code) ? '#d1fae5' : 'transparent',
                          opacity: isSourceLang ? 0.5 : 1,
                          fontSize: '12px'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedLanguages.includes(lang.code)}
                          onChange={() => toggleLanguage(lang.code)}
                          disabled={isDisabled}
                          style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                        />
                        <span>
                          {lang.flag} {lang.code.toUpperCase()}
                          {isSourceLang && ` (${t(i18n.source)})`}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Translate Button */}
            <button
              type="button"
              onClick={handleTranslate}
              disabled={isTranslating || !value?.[sourceLanguage]?.length || selectedLanguages.length === 0}
              style={{
                width: '100%',
                padding: '10px',
                background: isTranslating || !value?.[sourceLanguage]?.length || selectedLanguages.length === 0 ? '#cbd5e1' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isTranslating || !value?.[sourceLanguage]?.length || selectedLanguages.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                fontSize: '14px'
              }}
            >
              {isTranslating ? t(i18n.translating) : `${t(i18n.translateTo)} ${sourceLanguage.toUpperCase()} ${t(i18n.to)} ${selectedLanguages.length} ${selectedLanguages.length > 1 ? t(i18n.languages) : t(i18n.language)}`}
            </button>

            {/* Status/Error Messages */}
            {(status || error) && (
              <div style={{
                marginTop: '12px',
                padding: '8px 12px',
                background: error ? '#fee2e2' : '#d1fae5',
                color: error ? '#991b1b' : '#065f46',
                borderRadius: '4px',
                fontSize: '13px'
              }}>
                {error || status}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="multilingual-carousel-items-list">
        {items.length === 0 ? (
          <div className="no-items">
            <p>{t(i18n.noItems)}</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div key={index} className="carousel-item-card">
              <div className="carousel-item-header">
                <h4>
                  {t(i18n.item)} {index + 1} ({activeLocale.toUpperCase()})
                </h4>
                <button
                  type="button"
                  className="remove-item-btn"
                  onClick={() => removeItem(index)}
                  title={t(i18n.removeItem)}
                >
                  ×
                </button>
              </div>

              <div className="carousel-item-fields">
                <div className="field-row">
                  <label>{t(i18n.fieldTitle)}</label>
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                    placeholder={`${t(i18n.enterTitle)} ${activeLocale.toUpperCase()}`}
                  />
                </div>

                <div className="field-row">
                  <label>{t(i18n.buttonText)}</label>
                  <input
                    type="text"
                    value={item.buttonText || ''}
                    onChange={(e) => updateItem(index, 'buttonText', e.target.value)}
                    placeholder={`${t(i18n.buttonTextPlaceholder)} ${activeLocale.toUpperCase()}`}
                  />
                </div>

                <div className="field-row">
                  <label>{t(i18n.linkUrl)}</label>
                  <input
                    type="text"
                    value={item.linkUrl || ''}
                    onChange={(e) => updateItem(index, 'linkUrl', e.target.value)}
                    placeholder="/product/..."
                  />
                </div>

                <div className="field-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={item.isShow !== false}
                      onChange={(e) => updateItem(index, 'isShow', e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    {t(i18n.showItem)}
                  </label>
                </div>

                <div className="field-row">
                  <MediaPicker
                    field={{
                      name: 'image',
                      label: t(i18n.productImage),
                      hasMany: false,
                      relationTo: 'media',
                    }}
                    value={item.image as number | null}
                    onChange={(newValue) => updateItem(index, 'image', newValue)}
                  />
                </div>

                <div className="field-row">
                  <MediaPicker
                    field={{
                      name: 'sceneImage',
                      label: t(i18n.sceneImage),
                      hasMany: false,
                      relationTo: 'media',
                    }}
                    value={item.sceneImage as number | null}
                    onChange={(newValue) => updateItem(index, 'sceneImage', newValue)}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="multilingual-carousel-actions">
        <button type="button" className="add-item-btn" onClick={addItem}>
          {t(i18n.addItem)}
        </button>
        <p className="hint">
          {t(i18n.hint)}
        </p>
      </div>
    </div>
  )
}

export default MultilingualCarouselItemsField
