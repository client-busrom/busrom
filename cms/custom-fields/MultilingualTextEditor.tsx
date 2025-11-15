/**
 * Multilingual Text Editor - Modal for editing text in multiple languages
 * Used for simple text fields (not rich text)
 */

import React, { useState } from 'react'

// 24 supported languages
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'pl', name: 'Polski' },
  { code: 'sv', name: 'Svenska' },
  { code: 'da', name: 'Dansk' },
  { code: 'fi', name: 'Suomi' },
  { code: 'no', name: 'Norsk' },
  { code: 'cs', name: 'Čeština' },
  { code: 'el', name: 'Ελληνικά' },
  { code: 'he', name: 'עברית' },
  { code: 'th', name: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt' },
]

type MultilingualTextEditorProps = {
  value: Record<string, string>
  onChange: (value: Record<string, string>) => void
  onClose: () => void
}

export const MultilingualTextEditor: React.FC<MultilingualTextEditorProps> = ({ value, onChange, onClose }) => {
  const [editingValues, setEditingValues] = useState<Record<string, string>>(value || {})
  const [translating, setTranslating] = useState(false)
  const [translateError, setTranslateError] = useState<string | null>(null)

  const handleSave = () => {
    onChange(editingValues)
    onClose()
  }

  const updateLanguage = (langCode: string, text: string) => {
    setEditingValues((prev) => ({
      ...prev,
      [langCode]: text,
    }))
  }

  // Auto-translate from source language
  const handleAutoTranslate = async () => {
    // Find the first non-empty language as source
    const sourceLang = LANGUAGES.find((lang) => editingValues[lang.code]?.trim())

    if (!sourceLang) {
      setTranslateError('Please enter text in at least one language first')
      setTimeout(() => setTranslateError(null), 3000)
      return
    }

    const sourceText = editingValues[sourceLang.code]
    const sourceCode = sourceLang.code

    setTranslating(true)
    setTranslateError(null)

    try {
      // Call translation API
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          sourceLang: sourceCode,
          targetLangs: LANGUAGES.map((lang) => lang.code).filter((code) => code !== sourceCode),
        }),
      })

      if (!response.ok) {
        throw new Error('Translation failed')
      }

      const translations = await response.json()

      // Update all language fields with translations
      setEditingValues((prev) => ({
        ...prev,
        ...translations.translations,
      }))

      setTranslateError(null)
    } catch (error) {
      console.error('Translation error:', error)
      setTranslateError('Translation failed. Please try again.')
      setTimeout(() => setTranslateError(null), 5000)
    } finally {
      setTranslating(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
        onClick={onClose}
      >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
            Edit Multilingual Text
          </h2>

          <button
            type="button"
            onClick={handleAutoTranslate}
            disabled={translating}
            style={{
              padding: '8px 16px',
              background: translating ? '#9ca3af' : '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: translating ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {translating ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                Translating...
              </>
            ) : (
              <>
                🌐 Auto-Translate All
              </>
            )}
          </button>
        </div>

        {translateError && (
          <div style={{
            padding: '12px',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#991b1b',
            fontSize: '14px',
            marginBottom: '16px',
          }}>
            {translateError}
          </div>
        )}

        <div style={{ display: 'grid', gap: '16px' }}>
          {LANGUAGES.map((lang) => (
            <div key={lang.code}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                {lang.name} ({lang.code})
              </label>
              <input
                type="text"
                value={editingValues[lang.code] || ''}
                onChange={(e) => updateLanguage(lang.code, e.target.value)}
                placeholder={`Enter ${lang.name} text...`}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
    </>
  )
}
