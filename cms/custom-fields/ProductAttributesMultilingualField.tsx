/**
 * Product Attributes Field - Multilingual Key-Value Pairs with Show/Hide Control
 *
 * 产品属性字段(多语言版) - 支持24种语言的键值对属性
 *
 * Data structure:
 * {
 *   en: [
 *     { key: "Material", value: "Stainless Steel", isShow: true },
 *     { key: "Weight", value: "2.5kg", isShow: true }
 *   ],
 *   zh: [
 *     { key: "材质", value: "不锈钢", isShow: true },
 *     { key: "重量", value: "2.5公斤", isShow: true }
 *   ],
 *   ...
 * }
 */

import React, { useState, useEffect } from 'react'
import {
  FieldContainer,
  FieldLabel,
  TextInput,
} from '@keystone-ui/fields'
import { FieldController } from '@keystone-6/core/types'
import { FieldProps } from '@keystone-6/core/types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Language configuration (same as ProductSpecificationsField)
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

/**
 * Attribute Item Structure
 */
interface AttributeItem {
  key: string
  value: string
  isShow: boolean
}

/**
 * Full Attributes Structure (multilingual)
 */
type Attributes = Record<string, AttributeItem[]>

// Sortable Item Component
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
        <div
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            padding: '8px',
            background: '#f1f5f9',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '16px',
            userSelect: 'none',
          }}
        >
          ⋮⋮
        </div>
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </div>
  )
}

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
    LANGUAGES.filter(l => l.code !== 'en').map(l => l.code)
  )
  const [sourceLanguage, setSourceLanguage] = useState('en')
  const [overwriteExisting, setOverwriteExisting] = useState(false)

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Parse JSON value
  const attributes: Attributes = value ? JSON.parse(value) : {}

  // Load saved translation settings
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

  // Save translation settings
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

  // Auto-deselect source language from targets
  useEffect(() => {
    setSelectedLanguages(prev => prev.filter(lang => lang !== sourceLanguage))
  }, [sourceLanguage])

  // Get current language's attributes
  const currentAttrs = attributes[activeTab] || []

  // Update attributes for current language
  const updateCurrentAttrs = (newAttrs: AttributeItem[]) => {
    const newAttributes = { ...attributes, [activeTab]: newAttrs }
    onChange?.(JSON.stringify(newAttributes))
  }

  // Add attribute
  const addAttribute = () => {
    const newAttrs = [...currentAttrs, { key: '', value: '', isShow: true }]
    updateCurrentAttrs(newAttrs)
  }

  // Remove attribute
  const removeAttribute = (index: number) => {
    const newAttrs = currentAttrs.filter((_, i) => i !== index)
    updateCurrentAttrs(newAttrs)
  }

  // Update attribute
  const updateAttribute = (index: number, updates: Partial<AttributeItem>) => {
    const newAttrs = currentAttrs.map((attr, i) =>
      i === index ? { ...attr, ...updates } : attr
    )
    updateCurrentAttrs(newAttrs)
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = currentAttrs.findIndex((_, i) => `attr-${i}` === active.id)
      const newIndex = currentAttrs.findIndex((_, i) => `attr-${i}` === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newAttrs = arrayMove(currentAttrs, oldIndex, newIndex)
        updateCurrentAttrs(newAttrs)
      }
    }
  }

  // Toggle language selection
  const toggleLanguage = (langCode: string) => {
    setSelectedLanguages(prev =>
      prev.includes(langCode) ? prev.filter(code => code !== langCode) : [...prev, langCode]
    )
  }

  // Toggle all languages
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

    const sourceAttrs = attributes[sourceLanguage] || []
    if (sourceAttrs.length === 0) {
      setError(`Please add attributes in ${LANGUAGES.find(l => l.code === sourceLanguage)?.label} first`)
      return
    }

    if (selectedLanguages.length === 0) {
      setError('Please select at least one target language')
      return
    }

    const validTargets = selectedLanguages.filter(lang => lang !== sourceLanguage)

    if (validTargets.length === 0) {
      setError('Cannot translate to the same language as source')
      return
    }

    const targetLangs = overwriteExisting
      ? validTargets
      : validTargets.filter(lang => !attributes[lang] || attributes[lang].length === 0)

    if (targetLangs.length === 0) {
      setError('All selected languages already have attributes. Enable "Overwrite existing translations" to re-translate.')
      return
    }

    setIsTranslating(true)
    setError('')
    setStatus(`Translating attributes from ${sourceLanguage.toUpperCase()} to ${targetLangs.length} language${targetLangs.length > 1 ? 's' : ''}...`)

    try {
      const newAttributes = { ...attributes }

      for (const targetLang of targetLangs) {
        const translatedAttrs: AttributeItem[] = []

        // Translate each attribute's key and value separately
        for (const attr of sourceAttrs) {
          // Translate key
          const keyResponse = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: attr.key,
              sourceLang: sourceLanguage,
              service: translationService,
              apiKey,
              targetLangs: [targetLang],
            }),
          })

          if (!keyResponse.ok) {
            throw new Error('Failed to translate attribute key')
          }

          const keyData = await keyResponse.json()
          const translatedKey = keyData.translations[targetLang] || attr.key

          // Translate value
          const valueResponse = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: attr.value,
              sourceLang: sourceLanguage,
              service: translationService,
              apiKey,
              targetLangs: [targetLang],
            }),
          })

          if (!valueResponse.ok) {
            throw new Error('Failed to translate attribute value')
          }

          const valueData = await valueResponse.json()
          const translatedValue = valueData.translations[targetLang] || attr.value

          translatedAttrs.push({
            key: translatedKey,
            value: translatedValue,
            isShow: attr.isShow,
          })
        }

        newAttributes[targetLang] = translatedAttrs
      }

      onChange?.(JSON.stringify(newAttributes))

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
  const completedCount = LANGUAGES.filter(lang => {
    const attrs = attributes[lang.code]
    return attrs && attrs.length > 0
  }).length
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
                  const hasContent = attributes[lang.code]?.length > 0
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
              disabled={isTranslating || !apiKey || (attributes[sourceLanguage]?.length || 0) === 0 || selectedLanguages.length === 0}
              style={{
                width: '100%',
                padding: '10px',
                background: isTranslating || !apiKey || (attributes[sourceLanguage]?.length || 0) === 0 || selectedLanguages.length === 0 ? '#cbd5e1' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isTranslating || !apiKey || (attributes[sourceLanguage]?.length || 0) === 0 || selectedLanguages.length === 0 ? 'not-allowed' : 'pointer',
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
            const isCompleted = attributes[lang.code]?.length > 0
            const isActive = activeTab === lang.code

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
                {isCompleted && <span>✓</span>}
              </button>
            )
          })}
        </div>

        {/* Attributes Editor for Active Language with Drag & Drop */}
        <div style={{ marginTop: '16px' }}>
          {currentAttrs.length === 0 ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: '#999',
              background: '#f9f9f9',
              borderRadius: '8px',
              marginBottom: '12px',
            }}>
              No attributes for {LANGUAGES.find(l => l.code === activeTab)?.label}. Click "Add Attribute" to start.
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={currentAttrs.map((_, i) => `attr-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
                  {currentAttrs.map((attr, index) => (
                    <SortableItem key={`attr-${index}`} id={`attr-${index}`}>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr auto auto',
                          gap: '8px',
                          alignItems: 'center',
                          padding: '12px',
                          background: '#f9f9f9',
                          borderRadius: '8px',
                          border: '1px solid #e1e5e9',
                        }}
                      >
                        {/* Key Input */}
                        <div>
                          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500, color: '#666' }}>
                            Attribute Name
                          </label>
                          <TextInput
                            value={attr.key}
                            onChange={(e) => updateAttribute(index, { key: e.target.value })}
                            placeholder="e.g., Material"
                            style={{ fontSize: '14px' }}
                          />
                        </div>

                        {/* Value Input */}
                        <div>
                          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500, color: '#666' }}>
                            Attribute Value
                          </label>
                          <TextInput
                            value={attr.value}
                            onChange={(e) => updateAttribute(index, { value: e.target.value })}
                            placeholder="e.g., Stainless Steel"
                            style={{ fontSize: '14px' }}
                          />
                        </div>

                        {/* Show/Hide Toggle */}
                        <div style={{ paddingTop: '20px' }}>
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            userSelect: 'none',
                          }}>
                            <input
                              type="checkbox"
                              checked={attr.isShow}
                              onChange={(e) => updateAttribute(index, { isShow: e.target.checked })}
                              style={{
                                width: '16px',
                                height: '16px',
                                cursor: 'pointer',
                              }}
                            />
                            <span style={{ color: attr.isShow ? '#2563eb' : '#999' }}>
                              {attr.isShow ? 'Show' : 'Hide'}
                            </span>
                          </label>
                        </div>

                        {/* Remove Button */}
                        <div style={{ paddingTop: '20px' }}>
                          <button
                            type="button"
                            onClick={() => removeAttribute(index)}
                            style={{
                              padding: '6px 12px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: 500,
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Add Attribute Button */}
          <button
            type="button"
            onClick={addAttribute}
            style={{
              padding: '10px 16px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              width: '100%',
            }}
          >
            ➕ Add Attribute
          </button>
        </div>

        {/* Statistics */}
        {currentAttrs.length > 0 && (
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: '#f0f9ff',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#0369a1',
          }}>
            {currentAttrs.length} attribute{currentAttrs.length > 1 ? 's' : ''} total,{' '}
            {currentAttrs.filter(a => a.isShow).length} will be displayed on frontend
          </div>
        )}

        {/* JSON Preview */}
        {Object.keys(attributes).length > 0 && (
          <details style={{ marginTop: '16px' }}>
            <summary style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#666' }}>
              📋 View JSON Data
            </summary>
            <pre style={{
              marginTop: '8px',
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '6px',
              fontSize: '11px',
              overflow: 'auto',
              maxHeight: '300px',
            }}>
              {JSON.stringify(attributes, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </FieldContainer>
  )
}

/**
 * Cell Component - Display attributes in list view
 */
export const Cell = ({ item, field }: any) => {
  const value = item[field.path]

  if (!value || typeof value !== 'object') {
    return <div style={{ color: '#999', fontSize: '13px' }}>No attributes</div>
  }

  const attributes = value as Attributes
  const languages = Object.keys(attributes)

  if (languages.length === 0) {
    return <div style={{ color: '#999', fontSize: '13px' }}>No attributes</div>
  }

  const totalAttrs = languages.reduce((sum, lang) => sum + attributes[lang].length, 0)

  return (
    <div style={{ fontSize: '13px', color: '#4a5568' }}>
      <span style={{ fontWeight: 500 }}>{totalAttrs} attribute{totalAttrs > 1 ? 's' : ''}</span>
      <span style={{ color: '#999', marginLeft: '4px' }}>
        ({languages.length} language{languages.length > 1 ? 's' : ''})
      </span>
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
      const value = data[config.path]

      if (value === null || value === undefined) {
        return '{}'
      }

      if (typeof value === 'object') {
        return JSON.stringify(value)
      }

      if (typeof value === 'string') {
        return value
      }

      return '{}'
    },
    serialize: (value) => {
      let jsonValue
      if (!value || value === '{}') {
        jsonValue = {}
      } else if (typeof value === 'string') {
        try {
          jsonValue = JSON.parse(value)
        } catch {
          jsonValue = {}
        }
      } else if (typeof value === 'object') {
        jsonValue = value
      } else {
        jsonValue = {}
      }
      return { [config.path]: jsonValue }
    },
    validate: (value) => {
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value
        return undefined
      } catch {
        return 'Invalid JSON format'
      }
    },
  }
}
