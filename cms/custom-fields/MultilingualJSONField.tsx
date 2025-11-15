/**
 * Multilingual JSON Field with Translation
 *
 * A custom Keystone field component for JSON fields that:
 * 1. Stores all 24 languages in a single JSON field
 * 2. Provides tabbed UI for language switching
 * 3. Integrates third-party translation APIs
 * 4. No hydration errors (pure JSON storage)
 *
 * Usage in schema:
 * ```typescript
 * import { json } from '@keystone-6/core/fields'
 *
 * name: json({
 *   label: 'Product Name',
 *   ui: {
 *     views: './custom-fields/MultilingualJSONField',
 *   },
 * }),
 * ```
 */

import React, { useState, useEffect } from 'react'
import {
  FieldContainer,
  FieldLabel,
  TextInput,
} from '@keystone-ui/fields'
import { FieldController } from '@keystone-6/core/types'
import { FieldProps } from '@keystone-6/core/types'

// Language configuration
const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'da', label: 'Dansk', flag: '🇩🇰' },
  { code: 'no', label: 'Norsk', flag: '🇳🇴' },
  { code: 'fi', label: 'Suomi', flag: '🇫🇮' },
  { code: 'is', label: 'Íslenska', flag: '🇮🇸' },
  { code: 'cs', label: 'Čeština', flag: '🇨🇿' },
  { code: 'hu', label: 'Magyar', flag: '🇭🇺' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'sk', label: 'Slovenčina', flag: '🇸🇰' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'he', label: 'עברית', flag: '🇮🇱' },
  { code: 'fa', label: 'فارسی', flag: '🇮🇷' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'ber', label: 'Tamazight', flag: '🏴' },
  { code: 'ku', label: 'Kurdî', flag: '🟡' },
]

const RTL_LANGUAGES = ['ar', 'he', 'fa']

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => {
  const [activeTab, setActiveTab] = useState('en')
  const [isTranslating, setIsTranslating] = useState(false)
  const [showTranslationPanel, setShowTranslationPanel] = useState(false)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [translationService, setTranslationService] = useState<'google' | 'deepl' | 'azure'>('google')
  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    LANGUAGES.filter(l => l.code !== 'en').map(l => l.code)  // Initially exclude EN, but user can select it later
  )
  const [sourceLanguage, setSourceLanguage] = useState('en')
  const [overwriteExisting, setOverwriteExisting] = useState(false)

  // Parse JSON value
  const translations: Record<string, string> = value ? JSON.parse(value) : {}

  // Load saved settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedApiKey = localStorage.getItem('keystoneTranslatorApiKey')
      const savedService = localStorage.getItem('keystoneTranslatorService')
      const savedLanguages = localStorage.getItem('keystoneTranslatorLanguages')
      const savedSourceLang = localStorage.getItem('keystoneTranslatorSourceLang')
      const savedOverwrite = localStorage.getItem('keystoneTranslatorOverwrite')

      if (savedApiKey) setApiKey(savedApiKey)
      if (savedService) setTranslationService(savedService as 'google' | 'deepl' | 'azure')
      if (savedSourceLang) setSourceLanguage(savedSourceLang)
      if (savedOverwrite) setOverwriteExisting(savedOverwrite === 'true')

      if (savedLanguages) {
        try {
          const parsedLanguages = JSON.parse(savedLanguages)
          if (Array.isArray(parsedLanguages) && parsedLanguages.length > 0) {
            setSelectedLanguages(parsedLanguages)
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, [])

  // Save settings
  useEffect(() => {
    if (typeof window !== 'undefined' && apiKey) {
      localStorage.setItem('keystoneTranslatorApiKey', apiKey)
    }
  }, [apiKey])

  useEffect(() => {
    if (typeof window !== 'undefined' && translationService) {
      localStorage.setItem('keystoneTranslatorService', translationService)
    }
  }, [translationService])

  useEffect(() => {
    if (typeof window !== 'undefined' && selectedLanguages.length > 0) {
      localStorage.setItem('keystoneTranslatorLanguages', JSON.stringify(selectedLanguages))
    }
  }, [selectedLanguages])

  useEffect(() => {
    if (typeof window !== 'undefined' && sourceLanguage) {
      localStorage.setItem('keystoneTranslatorSourceLang', sourceLanguage)
    }
  }, [sourceLanguage])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('keystoneTranslatorOverwrite', String(overwriteExisting))
    }
  }, [overwriteExisting])

  // Automatically deselect source language from targets when source changes
  useEffect(() => {
    setSelectedLanguages(prev => prev.filter(lang => lang !== sourceLanguage))
  }, [sourceLanguage])

  // Update translation value
  const updateTranslation = (lang: string, text: string) => {
    const newTranslations = { ...translations, [lang]: text }
    const serialized = JSON.stringify(newTranslations)
    // console.log('[MultilingualJSONField] updateTranslation:', { lang, text, newTranslations, serialized })
    onChange?.(serialized)
  }

  // Toggle language selection
  const toggleLanguage = (langCode: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(langCode)) {
        return prev.filter(code => code !== langCode)
      } else {
        return [...prev, langCode]
      }
    })
  }

  // Select/Deselect all languages (except source language to prevent same-to-same translation)
  const toggleAllLanguages = () => {
    const availableLanguages = LANGUAGES.filter(l => l.code !== sourceLanguage).map(l => l.code)
    if (selectedLanguages.length === availableLanguages.length) {
      setSelectedLanguages([])
    } else {
      setSelectedLanguages(availableLanguages)
    }
  }

  // Handle auto-translate
  const handleTranslate = async () => {
    if (!apiKey) {
      setError('Please enter an API key')
      return
    }

    const sourceText = translations[sourceLanguage] || ''
    if (!sourceText.trim()) {
      setError(`Please enter ${LANGUAGES.find(l => l.code === sourceLanguage)?.label} text first`)
      return
    }

    if (selectedLanguages.length === 0) {
      setError('Please select at least one target language')
      return
    }

    // Filter out source language (can't translate from same to same)
    const validTargets = selectedLanguages.filter(lang => lang !== sourceLanguage)

    if (validTargets.length === 0) {
      setError('Cannot translate to the same language as source')
      return
    }

    // Filter out languages that already have translations if overwrite is disabled
    const targetLangs = overwriteExisting
      ? validTargets
      : validTargets.filter(lang => !translations[lang]?.trim())

    if (targetLangs.length === 0) {
      setError('All selected languages already have translations. Enable "Overwrite existing translations" to re-translate.')
      return
    }

    setIsTranslating(true)
    setError('')
    setStatus(`Translating from ${sourceLanguage.toUpperCase()} to ${targetLangs.length} language${targetLangs.length > 1 ? 's' : ''}...`)

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLang: sourceLanguage,
          service: translationService,
          apiKey,
          targetLangs: targetLangs,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Translation failed')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error('Translation failed')
      }

      // Update translations
      const newTranslations = { ...translations, ...data.translations }
      onChange?.(JSON.stringify(newTranslations))

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
  }

  // Calculate completion stats
  const completedCount = LANGUAGES.filter(lang => translations[lang.code]?.trim()).length
  const totalCount = LANGUAGES.length
  const completionPercentage = Math.round((completedCount / totalCount) * 100)

  return (
    <FieldContainer>
      <div style={{ marginBottom: '8px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <FieldLabel>{field.label}</FieldLabel>
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

        {/* Progress Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px'
          }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {completedCount} of {totalCount} languages ({completionPercentage}%)
            </span>
          </div>
          <div style={{
            background: '#e2e8f0',
            borderRadius: '4px',
            height: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#10b981',
              height: '100%',
              width: `${completionPercentage}%`,
              transition: 'width 0.3s'
            }} />
          </div>
        </div>

        {/* Translation Panel */}
        {showTranslationPanel && (
          <div style={{
            background: '#f8f9fa',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
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
                onChange={(e) => setSourceLanguage(e.target.value)}
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
                {LANGUAGES.map(lang => {
                  const hasContent = translations[lang.code]?.trim()
                  return (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.label} {hasContent ? '✓' : '(empty)'}
                    </option>
                  )
                })}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  Service
                </label>
                <select
                  value={translationService}
                  onChange={(e) => setTranslationService(e.target.value as 'google' | 'deepl' | 'azure')}
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
                  <option value="google">Google Translate</option>
                  <option value="deepl">DeepL API</option>
                  <option value="azure">Azure Translator</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isTranslating}
                  placeholder="Enter your API key"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />
              </div>
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
              <div style={{ fontSize: '12px', color: '#64748b', marginLeft: '24px', marginTop: '4px' }}>
                {overwriteExisting
                  ? 'Will re-translate all selected languages, even if they already have content'
                  : 'Will only translate languages that are currently empty'}
              </div>
            </div>

            {/* Language Selector */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500 }}>
                  Target Languages ({selectedLanguages.length} selected)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
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
                    {selectedLanguages.length === LANGUAGES.filter(l => l.code !== sourceLanguage).length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                    disabled={isTranslating}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isTranslating ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {showLanguageSelector ? 'Hide' : 'Show'} Languages
                  </button>
                </div>
              </div>

              {showLanguageSelector && (
                <div style={{
                  background: 'white',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '12px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '8px'
                  }}>
                    {LANGUAGES.map(lang => {
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
                            opacity: isSourceLang ? 0.5 : 1
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedLanguages.includes(lang.code)}
                            onChange={() => toggleLanguage(lang.code)}
                            disabled={isDisabled}
                            style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                          />
                          <span style={{ fontSize: '12px' }}>
                            {lang.flag} {lang.code.toUpperCase()}
                            {isSourceLang && ' (source)'}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleTranslate}
              disabled={isTranslating || !apiKey || !translations[sourceLanguage] || selectedLanguages.length === 0}
              style={{
                width: '100%',
                padding: '10px',
                background: isTranslating || !apiKey || !translations[sourceLanguage] || selectedLanguages.length === 0 ? '#cbd5e1' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isTranslating || !apiKey || !translations[sourceLanguage] || selectedLanguages.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                fontSize: '14px'
              }}
            >
              {isTranslating ? 'Translating...' : `Translate from ${sourceLanguage.toUpperCase()} to ${selectedLanguages.length} Language${selectedLanguages.length > 1 ? 's' : ''}`}
            </button>

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

        {/* Language Tabs */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '16px',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '8px'
        }}>
          {LANGUAGES.map(lang => {
            const isCompleted = translations[lang.code]?.trim()
            const isActive = activeTab === lang.code
            const isRequired = lang.code === 'en'

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setActiveTab(lang.code)}
                style={{
                  background: isActive ? '#10b981' : '#f1f5f9',
                  color: isActive ? 'white' : '#475569',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{lang.flag}</span>
                <span>{lang.code.toUpperCase()}</span>
                {isRequired && <span style={{ color: '#ef4444' }}>*</span>}
                {isCompleted && <span>✓</span>}
              </button>
            )
          })}
        </div>

        {/* Active Language Input */}
        {LANGUAGES.map(lang => {
          if (activeTab !== lang.code) return null

          return (
            <div key={lang.code}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
                color: '#334155'
              }}>
                {lang.flag} {lang.label} {lang.code === 'en' && <span style={{ color: '#ef4444' }}>*</span>}
              </label>
              <TextInput
                value={translations[lang.code] || ''}
                onChange={(e) => updateTranslation(lang.code, e.target.value)}
                placeholder={`Enter text in ${lang.label}`}
                autoFocus={lang.code === 'en' && autoFocus}
                style={{
                  direction: RTL_LANGUAGES.includes(lang.code) ? 'rtl' : 'ltr',
                }}
              />
              {translations[lang.code] && (
                <div style={{
                  fontSize: '12px',
                  color: '#64748b',
                  marginTop: '4px'
                }}>
                  {translations[lang.code].length} characters
                </div>
              )}
            </div>
          )
        })}
      </div>
    </FieldContainer>
  )
}

/**
 * Cell Component - Display multilingual content in list view
 */
export const Cell = ({ item, field }: any) => {
  const value = item[field.path]

  if (!value) {
    return <div style={{ color: '#999', fontSize: '13px' }}>未设置</div>
  }

  // Parse value if it's a string
  let translations: Record<string, string> = {}

  try {
    if (typeof value === 'string') {
      translations = JSON.parse(value)
    } else if (typeof value === 'object') {
      translations = value
    } else {
      return <div style={{ color: '#999', fontSize: '13px' }}>未设置</div>
    }
  } catch {
    return <div style={{ color: '#999', fontSize: '13px' }}>未设置</div>
  }

  const enText = translations['en']
  const zhText = translations['zh']

  // Show English or Chinese if available
  const displayText = enText || zhText || Object.values(translations).find(v => v?.trim())

  if (!displayText) {
    return <div style={{ color: '#999', fontSize: '13px' }}>未设置</div>
  }

  // Count non-empty translations
  const completedCount = Object.values(translations).filter(v => v?.trim()).length

  return (
    <div style={{ fontSize: '13px', color: '#4a5568' }}>
      <div>{displayText.length > 30 ? displayText.slice(0, 30) + '...' : displayText}</div>
      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
        {completedCount}/{LANGUAGES.length} 种语言
      </div>
    </div>
  )
}

export const controller = (config: any): FieldController<string, string> => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: '{}',
    deserialize: (data) => {
      // Extract the field value from the data object
      const value = data[config.path]
      // console.log('[MultilingualJSONField] deserialize input:', { data, value, path: config.path, type: typeof value })

      // null is equivalent to Prisma.DbNull, show as empty object
      if (value === null || value === undefined) {
        // console.log('[MultilingualJSONField] deserialize output: {}')
        return '{}'
      }

      // If it's already an object, stringify it
      if (typeof value === 'object') {
        const result = JSON.stringify(value)
        // console.log('[MultilingualJSONField] deserialize output:', result)
        return result
      }

      // If it's a string, return as-is
      if (typeof value === 'string') {
        // console.log('[MultilingualJSONField] deserialize output:', value)
        return value
      }

      // console.log('[MultilingualJSONField] deserialize output: {} (fallback)')
      return '{}'
    },
    serialize: (value) => {
      // Convert string back to object for GraphQL mutation
      // IMPORTANT: Must return { [fieldPath]: jsonObject } not just jsonObject
      // console.log('[MultilingualJSONField] serialize input:', { value, type: typeof value, path: config.path })
      let jsonValue
      if (!value) {
        jsonValue = null
      } else if (typeof value === 'string') {
        try {
          jsonValue = JSON.parse(value)
        } catch {
          jsonValue = null
        }
      } else if (typeof value === 'object') {
        jsonValue = value
      } else {
        jsonValue = null
      }
      const result = { [config.path]: jsonValue }
      // console.log('[MultilingualJSONField] serialize output:', result)
      return result
    },
    validate: (value) => {
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value
        // Validate that English is provided (optional for altText)
        // Uncomment below if English is required
        // if (!parsed.en || !parsed.en.trim()) {
        //   return 'English translation is required'
        // }
        return undefined
      } catch {
        return 'Invalid JSON format'
      }
    },
  }
}
