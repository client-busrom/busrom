'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDocumentInfo, useLocale, useTranslation } from '@payloadcms/ui'
import { SUPPORTED_LOCALES, type LocaleCode } from '../../../lib/locales'
import { LocaleFlag } from '../../ui/LocaleFlag'
import './styles.scss'

interface FormFieldOption {
  id?: string
  value: string
  label: string | Record<string, string>
}

interface FormField {
  id?: string
  fieldName: string
  label: string | Record<string, string>
  placeholder?: string | Record<string, string>
  fieldType: string
  options?: FormFieldOption[]
  required?: boolean
  width?: string
  order?: number
}

interface LocaleData {
  [locale: string]: {
    fields?: FormField[]
  }
}

interface FormFieldsTranslationCenterProps {
  path?: string
  field?: {
    name: string
    label?: string | Record<string, string>
  }
}

export const FormFieldsTranslationCenter: React.FC<FormFieldsTranslationCenterProps> = () => {
  const { id } = useDocumentInfo()
  const currentLocale = useLocale()
  const { t } = useTranslation()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [localeData, setLocaleData] = useState<LocaleData>({})
  const [sourceLocale, setSourceLocale] = useState<LocaleCode>('en')
  const [targetLocales, setTargetLocales] = useState<LocaleCode[]>([])
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null)
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set())

  // ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false)
      }
    }

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isModalOpen])

  // Load all locales data
  const loadAllLocalesData = useCallback(async () => {
    if (!id) return

    setIsLoading(true)
    setStatusMessage(null)

    try {
      const res = await fetch(`/api/form-configs/${id}/all-locales`)
      if (!res.ok) throw new Error('Failed to fetch')

      const data = await res.json()

      // Build locale data structure
      const newLocaleData: LocaleData = {}
      for (const locale of SUPPORTED_LOCALES) {
        newLocaleData[locale.code] = {
          fields: data.fields?.[locale.code] || data.fields || [],
        }
      }

      // If data is not in locale-keyed format, it's the current locale only
      // We need to fetch each locale separately
      if (!data.fields?.[SUPPORTED_LOCALES[0].code]) {
        for (const locale of SUPPORTED_LOCALES) {
          const localeRes = await fetch(`/api/form-configs/${id}?locale=${locale.code}&depth=0`)
          if (localeRes.ok) {
            const localeDoc = await localeRes.json()
            newLocaleData[locale.code] = {
              fields: localeDoc.fields || [],
            }
          }
        }
      }

      setLocaleData(newLocaleData)

      // Expand all fields by default
      const allFieldIds = new Set<string>()
      const sourceFields = newLocaleData[sourceLocale]?.fields || []
      sourceFields.forEach((field, idx) => {
        allFieldIds.add(field.id || `field-${idx}`)
      })
      setExpandedFields(allFieldIds)
    } catch (error) {
      console.error('[FormFieldsTranslationCenter] Error:', error)
      setStatusMessage({ type: 'error', text: t('custom:formFieldsTranslation:loadFailed' as any) as string || 'Failed to load data' })
    } finally {
      setIsLoading(false)
    }
  }, [id, sourceLocale, t])

  // Open modal
  const handleOpenModal = useCallback(async () => {
    if (!id) return
    setIsModalOpen(true)
    await loadAllLocalesData()
  }, [id, loadAllLocalesData])

  // Get field value for a specific locale
  const getFieldValue = useCallback((fieldIndex: number, fieldName: 'label' | 'placeholder', locale: string): string => {
    const fields = localeData[locale]?.fields || []
    const field = fields[fieldIndex]
    if (!field) return ''

    const value = field[fieldName]
    if (typeof value === 'string') return value
    if (typeof value === 'object' && value !== null) return value[locale] || ''
    return ''
  }, [localeData])

  // Get option label for a specific locale
  const getOptionLabel = useCallback((fieldIndex: number, optionIndex: number, locale: string): string => {
    const fields = localeData[locale]?.fields || []
    const field = fields[fieldIndex]
    if (!field?.options?.[optionIndex]) return ''

    const label = field.options[optionIndex].label
    if (typeof label === 'string') return label
    if (typeof label === 'object' && label !== null) return label[locale] || ''
    return ''
  }, [localeData])

  // Update field value
  const updateFieldValue = useCallback((fieldIndex: number, fieldName: 'label' | 'placeholder', locale: string, newValue: string) => {
    setLocaleData(prev => {
      const newData = { ...prev }
      if (!newData[locale]) {
        newData[locale] = { fields: [] }
      }

      const fields = [...(newData[locale].fields || [])]

      // Ensure field exists
      while (fields.length <= fieldIndex) {
        fields.push({
          fieldName: '',
          label: '',
          fieldType: 'text',
        })
      }

      fields[fieldIndex] = {
        ...fields[fieldIndex],
        [fieldName]: newValue,
      }

      newData[locale] = { ...newData[locale], fields }
      return newData
    })
  }, [])

  // Update option label
  const updateOptionLabel = useCallback((fieldIndex: number, optionIndex: number, locale: string, newValue: string) => {
    setLocaleData(prev => {
      const newData = { ...prev }
      if (!newData[locale]?.fields?.[fieldIndex]?.options) return prev

      const fields = [...(newData[locale].fields || [])]
      const options = [...(fields[fieldIndex].options || [])]

      options[optionIndex] = {
        ...options[optionIndex],
        label: newValue,
      }

      fields[fieldIndex] = {
        ...fields[fieldIndex],
        options,
      }

      newData[locale] = { ...newData[locale], fields }
      return newData
    })
  }, [])

  // Select all target locales
  const handleSelectAllTargets = useCallback(() => {
    setTargetLocales(
      SUPPORTED_LOCALES
        .filter(l => l.code !== sourceLocale)
        .map(l => l.code as LocaleCode)
    )
  }, [sourceLocale])

  // Select empty target locales
  const handleSelectEmptyTargets = useCallback(() => {
    const emptyLocales: LocaleCode[] = []
    const sourceFields = localeData[sourceLocale]?.fields || []

    for (const locale of SUPPORTED_LOCALES) {
      if (locale.code === sourceLocale) continue

      // Check if any field is empty
      let hasEmpty = false
      sourceFields.forEach((_, idx) => {
        if (!getFieldValue(idx, 'label', locale.code)) hasEmpty = true
        if (!getFieldValue(idx, 'placeholder', locale.code)) hasEmpty = true

        const options = localeData[locale.code]?.fields?.[idx]?.options || []
        options.forEach((_, optIdx) => {
          if (!getOptionLabel(idx, optIdx, locale.code)) hasEmpty = true
        })
      })

      if (hasEmpty) {
        emptyLocales.push(locale.code as LocaleCode)
      }
    }

    setTargetLocales(emptyLocales)
  }, [sourceLocale, localeData, getFieldValue, getOptionLabel])

  // Toggle field expansion
  const toggleFieldExpansion = useCallback((fieldId: string) => {
    setExpandedFields(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fieldId)) {
        newSet.delete(fieldId)
      } else {
        newSet.add(fieldId)
      }
      return newSet
    })
  }, [])

  // Translate
  const handleTranslate = useCallback(async () => {
    if (targetLocales.length === 0) {
      setStatusMessage({ type: 'warning', text: t('custom:translationCenter:selectTargetLanguages' as any) as string || 'Please select target languages' })
      return
    }

    setIsTranslating(true)
    setStatusMessage(null)

    try {
      const sourceFields = localeData[sourceLocale]?.fields || []
      let totalTranslated = 0

      for (let fieldIdx = 0; fieldIdx < sourceFields.length; fieldIdx++) {
        const sourceField = sourceFields[fieldIdx]

        // Translate label
        // Get user's personal translation settings
        const { getTranslationHeaders } = await import('@/lib/translation-client')
        const personalHeaders = getTranslationHeaders()

        const sourceLabel = getFieldValue(fieldIdx, 'label', sourceLocale)
        if (sourceLabel) {
          const localesToTranslate = targetLocales.filter(locale => {
            if (overwriteExisting) return true
            return !getFieldValue(fieldIdx, 'label', locale)
          })

          if (localesToTranslate.length > 0) {
            const res = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...personalHeaders },
              body: JSON.stringify({
                text: sourceLabel,
                sourceLang: sourceLocale,
                targetLangs: localesToTranslate,
              }),
            })
            const data = await res.json()

            for (const locale of localesToTranslate) {
              if (data.translations?.[locale]) {
                updateFieldValue(fieldIdx, 'label', locale, data.translations[locale])
                totalTranslated++
              }
            }
          }
        }

        // Translate placeholder
        const sourcePlaceholder = getFieldValue(fieldIdx, 'placeholder', sourceLocale)
        if (sourcePlaceholder) {
          const localesToTranslate = targetLocales.filter(locale => {
            if (overwriteExisting) return true
            return !getFieldValue(fieldIdx, 'placeholder', locale)
          })

          if (localesToTranslate.length > 0) {
            const res = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...personalHeaders },
              body: JSON.stringify({
                text: sourcePlaceholder,
                sourceLang: sourceLocale,
                targetLangs: localesToTranslate,
              }),
            })
            const data = await res.json()

            for (const locale of localesToTranslate) {
              if (data.translations?.[locale]) {
                updateFieldValue(fieldIdx, 'placeholder', locale, data.translations[locale])
                totalTranslated++
              }
            }
          }
        }

        // Translate options
        const sourceOptions = sourceField.options || []
        for (let optIdx = 0; optIdx < sourceOptions.length; optIdx++) {
          const sourceOptLabel = getOptionLabel(fieldIdx, optIdx, sourceLocale)
          if (sourceOptLabel) {
            const localesToTranslate = targetLocales.filter(locale => {
              if (overwriteExisting) return true
              return !getOptionLabel(fieldIdx, optIdx, locale)
            })

            if (localesToTranslate.length > 0) {
              const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...personalHeaders },
                body: JSON.stringify({
                  text: sourceOptLabel,
                  sourceLang: sourceLocale,
                  targetLangs: localesToTranslate,
                }),
              })
              const data = await res.json()

              for (const locale of localesToTranslate) {
                if (data.translations?.[locale]) {
                  updateOptionLabel(fieldIdx, optIdx, locale, data.translations[locale])
                  totalTranslated++
                }
              }
            }
          }
        }
      }

      setStatusMessage({ type: 'success', text: `${t('custom:translationCenter:translateSuccess' as any) || 'Translated'} ${totalTranslated} ${t('custom:formFieldsTranslation:items' as any) || 'items'}` })
    } catch (error) {
      console.error('[FormFieldsTranslationCenter] Translation error:', error)
      setStatusMessage({ type: 'error', text: t('custom:translationCenter:translateFailed' as any) as string || 'Translation failed' })
    } finally {
      setIsTranslating(false)
    }
  }, [localeData, sourceLocale, targetLocales, overwriteExisting, getFieldValue, getOptionLabel, updateFieldValue, updateOptionLabel, t])

  // Save all translations
  const handleSave = useCallback(async () => {
    if (!id) return

    setIsSaving(true)
    setStatusMessage(null)

    let successCount = 0
    let failCount = 0

    try {
      // Gather source fields for fallback
      const sourceFields = localeData[sourceLocale]?.fields || []

      // Save each locale (except current locale which will be saved by the form)
      for (const locale of SUPPORTED_LOCALES) {
        if (locale.code === currentLocale.code) continue

        const currentLocaleFields = localeData[locale.code]?.fields || []

        // Merge with source fields to ensure required fields have a value
        // Payload rejects empty 'required' fields even if they are localized
        const fieldsToSave = sourceFields.map((sourceField, idx) => {
          const targetField = currentLocaleFields[idx] || { ...sourceField }
          
          return {
            ...sourceField, // Copy non-localized fields (fieldName, fieldType, id, etc.)
            label: targetField.label && typeof targetField.label === 'string' && targetField.label.trim() 
              ? targetField.label 
              : (sourceField.label || ' '), // Fallback to source or a space to satisfy requirement
            placeholder: targetField.placeholder && typeof targetField.placeholder === 'string' && targetField.placeholder.trim()
              ? targetField.placeholder
              : targetField.placeholder, // Keep empty if it was empty
            options: (sourceField.options || []).map((sourceOpt, optIdx) => {
              const targetOpt = targetField.options?.[optIdx] || { ...sourceOpt }
              return {
                ...sourceOpt,
                label: targetOpt.label && typeof targetOpt.label === 'string' && targetOpt.label.trim()
                  ? targetOpt.label
                  : (sourceOpt.label || ' '),
              }
            }),
          }
        })

        const res = await fetch(`/api/form-configs/${id}?locale=${locale.code}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: fieldsToSave }),
        })

        if (res.ok) {
          successCount++
        } else {
          failCount++
        }
      }

      if (failCount === 0) {
        setStatusMessage({ type: 'success', text: `${t('custom:translationCenter:saveSuccess' as any) || 'Saved to'} ${successCount} ${t('custom:translationCenter:languages' as any) || 'languages'}` })
      } else {
        setStatusMessage({ type: 'warning', text: `${successCount} ${t('custom:formFieldsTranslation:success' as any) || 'success'}, ${failCount} ${t('custom:formFieldsTranslation:failed' as any) || 'failed'}` })
      }
    } catch (error) {
      console.error('[FormFieldsTranslationCenter] Save error:', error)
      setStatusMessage({ type: 'error', text: t('custom:translationCenter:saveFailed' as any) as string || 'Save failed' })
    } finally {
      setIsSaving(false)
    }
  }, [id, localeData, currentLocale.code, t])

  // Get source fields for rendering
  const sourceFields = localeData[sourceLocale]?.fields || []

  if (!id) {
    return (
      <div className="fftc-trigger fftc-trigger--disabled">
        <button type="button" disabled>
          {t('custom:formFieldsTranslation:triggerButton' as any) || 'Form Fields Translation'}
        </button>
        <span className="fftc-trigger__hint">
          {t('custom:translationCenter:saveFirst' as any) || 'Save first'}
        </span>
      </div>
    )
  }

  return (
    <>
      {/* Trigger Button */}
      <div className="fftc-trigger">
        <button
          type="button"
          className="fftc-trigger__btn"
          onClick={handleOpenModal}
        >
          {t('custom:formFieldsTranslation:triggerButton' as any) || 'Form Fields Translation'}
        </button>
        <span className="fftc-trigger__hint">
          {sourceFields.length} {t('custom:formFieldsTranslation:fields' as any) || 'fields'}
        </span>
      </div>

      {/* Modal */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fftc-modal-overlay">
          <div className="fftc-modal">
            {/* Header */}
            <div className="fftc-modal__header">
              <h2>{t('custom:formFieldsTranslation:title' as any) || 'Form Fields Translation Center'}</h2>
              <button
                type="button"
                className="fftc-modal__close"
                onClick={() => setIsModalOpen(false)}
              >
                x
              </button>
            </div>

            {isLoading ? (
              <div className="fftc-modal__loading">{t('custom:translationCenter:loading' as any) || 'Loading...'}</div>
            ) : (
              <>
                {/* Controls */}
                <div className="fftc-modal__controls">
                  <div className="fftc-control-row">
                    <div className="fftc-control-group">
                      <label>{t('custom:translationCenter:sourceLanguage' as any) || 'Source Language'}</label>
                      <select
                        value={sourceLocale}
                        onChange={(e) => setSourceLocale(e.target.value as LocaleCode)}
                      >
                        {SUPPORTED_LOCALES.map(l => (
                          <option key={l.code} value={l.code}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="fftc-control-row">
                    <label>
                      {t('custom:translationCenter:targetLanguages' as any) || 'Target Languages'}
                      <span className="fftc-control-actions">
                        <button type="button" onClick={handleSelectAllTargets}>
                          {t('custom:translationCenter:selectAll' as any) || 'All'}
                        </button>
                        <button type="button" onClick={handleSelectEmptyTargets}>
                          {t('custom:translationCenter:selectEmpty' as any) || 'Has Empty'}
                        </button>
                        <button type="button" onClick={() => setTargetLocales([])}>
                          {t('custom:translationCenter:clearSelection' as any) || 'Clear'}
                        </button>
                      </span>
                    </label>
                    <div className="fftc-targets-grid">
                      {SUPPORTED_LOCALES.filter(l => l.code !== sourceLocale).map(locale => {
                        const isSelected = targetLocales.includes(locale.code as LocaleCode)
                        return (
                          <label
                            key={locale.code}
                            className={`fftc-target-item ${isSelected ? 'fftc-target-item--selected' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTargetLocales([...targetLocales, locale.code as LocaleCode])
                                } else {
                                  setTargetLocales(targetLocales.filter(l => l !== locale.code))
                                }
                              }}
                            />
                            <LocaleFlag localeCode={locale.code} className="fftc-target-item__flag" />
                            <span className="fftc-target-item__code">{locale.code.toUpperCase()}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div className="fftc-control-row fftc-control-row--actions">
                    <label className="fftc-checkbox">
                      <input
                        type="checkbox"
                        checked={overwriteExisting}
                        onChange={(e) => setOverwriteExisting(e.target.checked)}
                      />
                      {t('custom:translationCenter:overwriteExisting' as any) || 'Overwrite existing content'}
                    </label>
                    <div className="fftc-action-buttons">
                      <button
                        type="button"
                        className="fftc-btn fftc-btn--primary"
                        onClick={handleTranslate}
                        disabled={isTranslating || isSaving || targetLocales.length === 0}
                      >
                        {isTranslating
                          ? (t('custom:translationCenter:translating' as any) || 'Translating...')
                          : `${t('custom:translationCenter:translate' as any) || 'Translate'} (${targetLocales.length})`
                        }
                      </button>
                      <button
                        type="button"
                        className="fftc-btn fftc-btn--secondary"
                        onClick={handleSave}
                        disabled={isTranslating || isSaving}
                      >
                        {isSaving ? (t('custom:translationCenter:saving' as any) || 'Saving...') : (t('custom:translationCenter:saveAll' as any) || 'Save All')}
                      </button>
                    </div>
                  </div>

                  {statusMessage && (
                    <div className={`fftc-status fftc-status--${statusMessage.type}`}>
                      {statusMessage.type === 'success' && '✅ '}
                      {statusMessage.type === 'error' && '❌ '}
                      {statusMessage.type === 'warning' && '⚠️ '}
                      {statusMessage.text}
                    </div>
                  )}
                </div>

                {/* Fields List */}
                <div className="fftc-modal__fields">
                  {sourceFields.length === 0 ? (
                    <div className="fftc-empty">
                      {t('custom:formFieldsTranslation:noFields' as any) || 'No form fields found. Add fields first.'}
                    </div>
                  ) : (
                    sourceFields.map((field, fieldIdx) => {
                      const fieldId = field.id || `field-${fieldIdx}`
                      const isExpanded = expandedFields.has(fieldId)
                      const hasOptions = ['select', 'radio', 'checkbox'].includes(field.fieldType) && field.options && field.options.length > 0

                      return (
                        <div key={fieldId} className="fftc-field">
                          <div
                            className="fftc-field__header"
                            onClick={() => toggleFieldExpansion(fieldId)}
                          >
                            <span className={`fftc-field__toggle ${isExpanded ? 'fftc-field__toggle--expanded' : ''}`}>
                              {isExpanded ? '▼' : '▶'}
                            </span>
                            <span className="fftc-field__icon">📋</span>
                            <span className="fftc-field__name">{field.fieldName}</span>
                            <span className="fftc-field__type">({field.fieldType})</span>
                            {hasOptions && (
                              <span className="fftc-field__options-count">
                                {field.options?.length} {t('custom:formFieldsTranslation:options' as any) || 'options'}
                              </span>
                            )}
                          </div>

                          {isExpanded && (
                            <div className="fftc-field__content">
                              {/* Label Row */}
                              <div className="fftc-field__row">
                                <div className="fftc-field__row-label">
                                  {t('custom:formFieldsTranslation:label' as any) || 'Label'}
                                </div>
                                <div className="fftc-field__row-inputs">
                                  {SUPPORTED_LOCALES.map(locale => (
                                    <div key={locale.code} className="fftc-field__input-group">
                                      <span className="fftc-field__locale"><LocaleFlag localeCode={locale.code} className="fftc-field__locale-flag" /> {locale.code.toUpperCase()}</span>
                                      <input
                                        type="text"
                                        value={getFieldValue(fieldIdx, 'label', locale.code)}
                                        onChange={(e) => updateFieldValue(fieldIdx, 'label', locale.code, e.target.value)}
                                        placeholder={t('custom:translationCenter:empty' as any) as string || 'Empty'}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Placeholder Row */}
                              <div className="fftc-field__row">
                                <div className="fftc-field__row-label">
                                  {t('custom:formFieldsTranslation:placeholder' as any) || 'Placeholder'}
                                </div>
                                <div className="fftc-field__row-inputs">
                                  {SUPPORTED_LOCALES.map(locale => (
                                    <div key={locale.code} className="fftc-field__input-group">
                                      <span className="fftc-field__locale"><LocaleFlag localeCode={locale.code} className="fftc-field__locale-flag" /> {locale.code.toUpperCase()}</span>
                                      <input
                                        type="text"
                                        value={getFieldValue(fieldIdx, 'placeholder', locale.code)}
                                        onChange={(e) => updateFieldValue(fieldIdx, 'placeholder', locale.code, e.target.value)}
                                        placeholder={t('custom:translationCenter:empty' as any) as string || 'Empty'}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Options */}
                              {hasOptions && (
                                <div className="fftc-field__options">
                                  <div className="fftc-field__options-header">
                                    {t('custom:formFieldsTranslation:options' as any) || 'Options'}
                                  </div>
                                  {field.options?.map((option, optIdx) => (
                                    <div key={option.id || `opt-${optIdx}`} className="fftc-field__option">
                                      <div className="fftc-field__option-value">
                                        <span className="fftc-field__option-bullet">•</span>
                                        <code>{option.value}</code>
                                      </div>
                                      <div className="fftc-field__row-inputs">
                                        {SUPPORTED_LOCALES.map(locale => (
                                          <div key={locale.code} className="fftc-field__input-group">
                                            <span className="fftc-field__locale"><LocaleFlag localeCode={locale.code} className="fftc-field__locale-flag" /> {locale.code.toUpperCase()}</span>
                                            <input
                                              type="text"
                                              value={getOptionLabel(fieldIdx, optIdx, locale.code)}
                                              onChange={(e) => updateOptionLabel(fieldIdx, optIdx, locale.code, e.target.value)}
                                              placeholder={t('custom:translationCenter:empty' as any) as string || 'Empty'}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default FormFieldsTranslationCenter
