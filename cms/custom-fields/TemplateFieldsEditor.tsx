/**
 * Template Fields Editor - Multilingual Template Content with Auto-Translation
 *
 * 模板字段编辑器 - 支持多语言的模板内容(带自动翻译)
 *
 * Data structure:
 * {
 *   en: { ...template-specific fields },
 *   zh: { ...template-specific fields },
 *   ...
 * }
 *
 * Features:
 * - Multi-language tabs
 * - JSON editor with syntax highlighting
 * - Auto-translate from one language to all others
 * - Language progress indicator
 */

import React, { useState, useEffect } from 'react'
import { FieldContainer, FieldLabel } from '@keystone-ui/fields'
import { FieldController } from '@keystone-6/core/types'
import { FieldProps } from '@keystone-6/core/types'

// Supported languages (24 languages)
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'es', name: 'Español' },
  { code: 'ar', name: 'العربية' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'ja', name: '日本語' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'it', name: 'Italiano' },
  { code: 'ko', name: '한국어' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'pl', name: 'Polski' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'th', name: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'uk', name: 'Українська' },
  { code: 'ro', name: 'Română' },
  { code: 'el', name: 'Ελληνικά' },
  { code: 'cs', name: 'Čeština' },
  { code: 'sv', name: 'Svenska' },
  { code: 'hu', name: 'Magyar' },
]

export const controller = (
  config: FieldController<Record<string, any>, Record<string, any>>
): FieldController<Record<string, any>, string> => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: '{}',
    deserialize: (data) => {
      const value = data[config.path]
      if (!value) return '{}'
      if (typeof value === 'string') return value
      return JSON.stringify(value, null, 2)
    },
    serialize: (value) => {
      if (!value || value === '{}') return { [config.path]: {} }
      try {
        const parsed = JSON.parse(value)
        return { [config.path]: parsed }
      } catch {
        return { [config.path]: {} }
      }
    },
    validate: (value) => {
      if (!value || value === '{}') return true
      try {
        JSON.parse(value)
        return true
      } catch (e) {
        return false
      }
    },
  }
}

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => {
  const [activeTab, setActiveTab] = useState('en')
  const [isTranslating, setIsTranslating] = useState(false)
  const [showTranslationPanel, setShowTranslationPanel] = useState(false)
  const [translationService, setTranslationService] = useState<'google' | 'deepl' | 'azure'>('google')
  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState('en')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    LANGUAGES.filter(l => l.code !== 'en').map(l => l.code)
  )
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)

  // Parse template fields
  let templateFields: Record<string, any> = {}
  try {
    templateFields = value ? JSON.parse(value) : {}
  } catch {
    templateFields = {}
  }

  // Load saved settings
  useEffect(() => {
    const savedService = localStorage.getItem('keystoneTranslatorService')
    const savedApiKey = localStorage.getItem('keystoneTranslatorApiKey')
    const savedLanguages = localStorage.getItem('keystoneTranslatorLanguages')
    const savedSourceLang = localStorage.getItem('keystoneTranslatorSourceLang')
    const savedOverwrite = localStorage.getItem('keystoneTranslatorOverwrite')

    if (savedApiKey) setApiKey(savedApiKey)
    if (savedService) setTranslationService(savedService as 'google' | 'deepl' | 'azure')
    if (savedSourceLang) setSourceLanguage(savedSourceLang)
    if (savedOverwrite) setOverwriteExisting(savedOverwrite === 'true')

    if (savedLanguages) {
      try {
        const parsed = JSON.parse(savedLanguages)
        if (Array.isArray(parsed)) setSelectedLanguages(parsed)
      } catch {}
    }
  }, [])

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('keystoneTranslatorService', translationService)
    localStorage.setItem('keystoneTranslatorApiKey', apiKey)
    localStorage.setItem('keystoneTranslatorSourceLang', sourceLanguage)
    localStorage.setItem('keystoneTranslatorOverwrite', String(overwriteExisting))
    localStorage.setItem('keystoneTranslatorLanguages', JSON.stringify(selectedLanguages))
  }, [translationService, apiKey, sourceLanguage, overwriteExisting, selectedLanguages])

  // Calculate progress
  const totalLanguages = LANGUAGES.length
  const completedLanguages = LANGUAGES.filter(
    (lang) => templateFields[lang.code] && Object.keys(templateFields[lang.code]).length > 0
  ).length
  const progressPercentage = (completedLanguages / totalLanguages) * 100

  // Handle tab change
  const handleTabChange = (langCode: string) => {
    setActiveTab(langCode)
  }

  // Handle content change
  const handleContentChange = (langCode: string, content: string) => {
    try {
      const parsed = JSON.parse(content)
      const newFields = {
        ...templateFields,
        [langCode]: parsed,
      }
      onChange?.(JSON.stringify(newFields, null, 2))
    } catch {
      // Invalid JSON, still update to show syntax error
      const newFields = {
        ...templateFields,
        [langCode]: content,
      }
      onChange?.(JSON.stringify(newFields, null, 2))
    }
  }

  // Deep translate object recursively
  const deepTranslate = async (
    obj: any,
    sourceLang: string,
    targetLang: string,
    service: string,
    key: string
  ): Promise<any> => {
    if (typeof obj === 'string') {
      // Translate string
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: obj,
          sourceLang,
          service,
          apiKey: key,
          targetLangs: [targetLang],
        }),
      })

      if (!response.ok) {
        throw new Error('Translation failed')
      }

      const data = await response.json()
      return data.translations[targetLang] || obj
    } else if (Array.isArray(obj)) {
      // Translate array items
      const translated = []
      for (const item of obj) {
        translated.push(await deepTranslate(item, sourceLang, targetLang, service, key))
      }
      return translated
    } else if (typeof obj === 'object' && obj !== null) {
      // Translate object values (keep keys unchanged)
      const translated: any = {}
      for (const [k, v] of Object.entries(obj)) {
        // Skip media/image objects (they contain id/url)
        if (k === 'image' || k === 'backgroundImage' || k === 'featuredImage') {
          translated[k] = v // Keep image references unchanged
        } else if (typeof v === 'string' || Array.isArray(v) || typeof v === 'object') {
          translated[k] = await deepTranslate(v, sourceLang, targetLang, service, key)
        } else {
          translated[k] = v // Keep non-translatable values (numbers, booleans, etc.)
        }
      }
      return translated
    } else {
      // Return other types unchanged (numbers, booleans, null)
      return obj
    }
  }

  // Handle auto-translate
  const handleTranslate = async () => {
    if (!apiKey) {
      setError('Please enter an API key')
      return
    }

    const sourceFields = templateFields[sourceLanguage]
    if (!sourceFields || Object.keys(sourceFields).length === 0) {
      setError(`No content found in ${sourceLanguage.toUpperCase()} to translate`)
      return
    }

    const validTargets = selectedLanguages.filter(lang => lang !== sourceLanguage)

    if (validTargets.length === 0) {
      setError('Cannot translate to the same language as source')
      return
    }

    const targetLangs = overwriteExisting
      ? validTargets
      : validTargets.filter(
          lang => !templateFields[lang] || Object.keys(templateFields[lang]).length === 0
        )

    if (targetLangs.length === 0) {
      setError(
        'All selected languages already have content. Enable "Overwrite existing translations" to re-translate.'
      )
      return
    }

    setIsTranslating(true)
    setError('')
    setStatus(
      `Translating template fields from ${sourceLanguage.toUpperCase()} to ${targetLangs.length} language${targetLangs.length > 1 ? 's' : ''}...`
    )

    try {
      const newFields = { ...templateFields }

      for (const targetLang of targetLangs) {
        setStatus(`Translating to ${targetLang.toUpperCase()}...`)

        // Deep translate the entire source object
        const translated = await deepTranslate(
          sourceFields,
          sourceLanguage,
          targetLang,
          translationService,
          apiKey
        )

        newFields[targetLang] = translated
      }

      onChange?.(JSON.stringify(newFields, null, 2))

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

  // Toggle language selection
  const toggleLanguage = (langCode: string) => {
    if (selectedLanguages.includes(langCode)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== langCode))
    } else {
      setSelectedLanguages([...selectedLanguages, langCode])
    }
  }

  // Select/Deselect all languages
  const toggleAllLanguages = () => {
    const availableLanguages = LANGUAGES.filter(l => l.code !== sourceLanguage).map(l => l.code)
    if (selectedLanguages.length === availableLanguages.length) {
      setSelectedLanguages([])
    } else {
      setSelectedLanguages(availableLanguages)
    }
  }

  return (
    <FieldContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
          <span style={{ color: '#64748b' }}>Translation Progress</span>
          <span style={{ color: '#64748b', fontWeight: 500 }}>
            {completedLanguages} / {totalLanguages} languages
          </span>
        </div>
        <div style={{ background: '#e2e8f0', borderRadius: '8px', overflow: 'hidden', height: '8px' }}>
          <div
            style={{
              background: progressPercentage === 100 ? '#10b981' : '#3b82f6',
              height: '100%',
              width: `${progressPercentage}%`,
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>

      {/* Translation Panel */}
      {showTranslationPanel && (
        <div
          style={{
            background: '#f8f9fa',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #e2e8f0',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600 }}>
            Auto-Translation Settings
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {/* Service Selection */}
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
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              >
                <option value="google">Google Translate</option>
                <option value="deepl">DeepL</option>
                <option value="azure">Azure Translator</option>
              </select>
            </div>

            {/* API Key Input */}
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
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>

          {/* Source Language */}
          <div style={{ marginBottom: '16px' }}>
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
                borderRadius: '6px',
                fontSize: '13px',
              }}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.code})
                </option>
              ))}
            </select>
          </div>

          {/* Target Languages */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500 }}>Target Languages</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                  disabled={isTranslating}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  {showLanguageSelector ? 'Hide' : 'Select Languages'} ({selectedLanguages.length})
                </button>
                <button
                  type="button"
                  onClick={toggleAllLanguages}
                  disabled={isTranslating}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  {selectedLanguages.length === LANGUAGES.length - 1 ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>

            {showLanguageSelector && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '8px',
                  padding: '12px',
                  background: 'white',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                {LANGUAGES.filter((l) => l.code !== sourceLanguage).map((lang) => (
                  <label
                    key={lang.code}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLanguages.includes(lang.code)}
                      onChange={() => toggleLanguage(lang.code)}
                      disabled={isTranslating}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>{lang.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Overwrite Option */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={overwriteExisting}
              onChange={(e) => setOverwriteExisting(e.target.checked)}
              disabled={isTranslating}
              style={{ cursor: 'pointer' }}
            />
            <span>Overwrite existing translations</span>
          </label>

          {/* Translate Button */}
          <button
            type="button"
            onClick={handleTranslate}
            disabled={isTranslating || !apiKey || selectedLanguages.length === 0}
            style={{
              width: '100%',
              padding: '10px',
              background: isTranslating ? '#94a3b8' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isTranslating ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {isTranslating ? 'Translating...' : '🚀 Start Translation'}
          </button>

          {/* Status/Error Messages */}
          {status && (
            <div
              style={{
                marginTop: '12px',
                padding: '8px 12px',
                background: '#dbeafe',
                color: '#1e40af',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            >
              {status}
            </div>
          )}
          {error && (
            <div
              style={{
                marginTop: '12px',
                padding: '8px 12px',
                background: '#fee2e2',
                color: '#991b1b',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            >
              ❌ {error}
            </div>
          )}
        </div>
      )}

      {/* Language Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px',
          flexWrap: 'wrap',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '8px',
        }}
      >
        {LANGUAGES.map((lang) => {
          const hasContent = templateFields[lang.code] && Object.keys(templateFields[lang.code]).length > 0
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleTabChange(lang.code)}
              style={{
                padding: '6px 12px',
                background: activeTab === lang.code ? '#3b82f6' : hasContent ? '#e0f2fe' : '#f1f5f9',
                color: activeTab === lang.code ? 'white' : hasContent ? '#0369a1' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === lang.code ? 600 : 400,
                position: 'relative',
              }}
            >
              {lang.code.toUpperCase()}
              {hasContent && activeTab !== lang.code && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '6px',
                    height: '6px',
                    background: '#10b981',
                    borderRadius: '50%',
                  }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* JSON Editor */}
      <div>
        <div style={{ marginBottom: '8px', fontSize: '13px', color: '#64748b' }}>
          <strong>{LANGUAGES.find((l) => l.code === activeTab)?.name}</strong> - Edit JSON structure below
        </div>
        <textarea
          value={JSON.stringify(templateFields[activeTab] || {}, null, 2)}
          onChange={(e) => handleContentChange(activeTab, e.target.value)}
          autoFocus={autoFocus}
          style={{
            width: '100%',
            minHeight: '400px',
            padding: '12px',
            fontFamily: 'monospace',
            fontSize: '13px',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            resize: 'vertical',
          }}
          placeholder={`Enter JSON for ${activeTab.toUpperCase()}...`}
        />
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
          💡 Tip: Edit the JSON structure according to your template requirements. Images/media should use{' '}
          <code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '3px' }}>
            {`{ "id": "...", "url": "..." }`}
          </code>{' '}
          format.
        </div>
      </div>
    </FieldContainer>
  )
}
