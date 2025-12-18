'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { useField } from '@payloadcms/ui'
import { SUPPORTED_LOCALES, type LocaleCode } from '../../../lib/locales'
import MediaPicker from '../MediaPicker'
import './styles.scss'

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
      setError(`No items found in ${sourceLanguage.toUpperCase()}. Please add items first.`)
      return
    }

    if (selectedLanguages.length === 0) {
      setError('Please select at least one target language')
      return
    }

    setIsTranslating(true)
    setError('')
    setStatus(`Translating from ${sourceLanguage.toUpperCase()} to ${selectedLanguages.length} language(s)...`)

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

          // Translate title
          if (sourceItem.title) {
            try {
              const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                headers: { 'Content-Type': 'application/json' },
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
      setStatus('✅ Translation completed!')
      setTimeout(() => {
        setStatus('')
        setShowTranslationPanel(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed')
    } finally {
      setIsTranslating(false)
    }
  }, [value, sourceLanguage, selectedLanguages, overwriteExisting, setValue])

  return (
    <div className="multilingual-carousel-items">
      <div className="multilingual-carousel-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ margin: 0 }}>Carousel Items (Multilingual)</h3>
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
            🌐 {showTranslationPanel ? 'Hide' : 'Auto-Translate'}
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
                title={`${locale.label}${hasItems ? ` (${localeItems.length} items)` : ' (empty)'}`}
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
              🌐 Auto-Translate Settings
            </h4>

            {/* Source Language Selector */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                Source Language
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
                      {lang.flag} {lang.label} {hasContent ? `(${value[lang.code].length} items)` : '(empty)'}
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
                <span>Overwrite existing translations</span>
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
                  Target Languages ({selectedLanguages.length} selected)
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
                  {selectedLanguages.length === localeCodes.filter(l => l !== sourceLanguage).length ? 'Deselect All' : 'Select All'}
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
                          {isSourceLang && ' (source)'}
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
              {isTranslating ? 'Translating...' : `Translate from ${sourceLanguage.toUpperCase()} to ${selectedLanguages.length} Language${selectedLanguages.length > 1 ? 's' : ''}`}
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
            <p>No items yet. Click "Add Item" to create one.</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div key={index} className="carousel-item-card">
              <div className="carousel-item-header">
                <h4>
                  Item {index + 1} ({activeLocale.toUpperCase()})
                </h4>
                <button
                  type="button"
                  className="remove-item-btn"
                  onClick={() => removeItem(index)}
                  title="Remove this item from all languages"
                >
                  ×
                </button>
              </div>

              <div className="carousel-item-fields">
                <div className="field-row">
                  <label>Title</label>
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                    placeholder={`Enter title in ${activeLocale.toUpperCase()}`}
                  />
                </div>

                <div className="field-row">
                  <label>Button Text</label>
                  <input
                    type="text"
                    value={item.buttonText || ''}
                    onChange={(e) => updateItem(index, 'buttonText', e.target.value)}
                    placeholder={`Button text in ${activeLocale.toUpperCase()}`}
                  />
                </div>

                <div className="field-row">
                  <label>Link URL (Same for all languages)</label>
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
                    Show this item
                  </label>
                </div>

                <div className="field-row">
                  <MediaPicker
                    path={`items.${activeLocale}.${index}.image`}
                    field={{
                      name: 'image',
                      label: 'Product Image (Same for all languages)',
                      hasMany: false,
                      relationTo: 'media',
                    }}
                  />
                </div>

                <div className="field-row">
                  <MediaPicker
                    path={`items.${activeLocale}.${index}.sceneImage`}
                    field={{
                      name: 'sceneImage',
                      label: 'Scene Image (Same for all languages)',
                      hasMany: false,
                      relationTo: 'media',
                    }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="multilingual-carousel-actions">
        <button type="button" className="add-item-btn" onClick={addItem}>
          + Add Item (to all languages)
        </button>
        <p className="hint">
          Items are synchronized across all languages. Switch tabs to edit translations.
        </p>
      </div>
    </div>
  )
}

export default MultilingualCarouselItemsField
