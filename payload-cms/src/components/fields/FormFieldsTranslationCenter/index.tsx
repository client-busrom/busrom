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
      const res = await fetch(`/api/form-configs/${id}?locale=all&depth=0`)
      if (!res.ok) throw new Error('Failed to fetch')

      const data = await res.json()
      const rawFields = data.fields || []

      // Build locale data structure by extracting strings for each locale
      const newLocaleData: LocaleData = {}
      for (const locale of SUPPORTED_LOCALES) {
        newLocaleData[locale.code] = {
          fields: rawFields.map((field: any) => ({
            ...field,
            label: typeof field.label === 'object' && field.label !== null ? (field.label[locale.code] || '') : (typeof field.label === 'string' ? field.label : ''),
            placeholder: typeof field.placeholder === 'object' && field.placeholder !== null ? (field.placeholder[locale.code] || '') : (typeof field.placeholder === 'string' ? field.placeholder : ''),
            options: (field.options || []).map((opt: any) => ({
              ...opt,
              label: typeof opt.label === 'object' && opt.label !== null ? (opt.label[locale.code] || '') : (typeof opt.label === 'string' ? opt.label : ''),
            }))
          }))
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

      // Check if any field is empty (only if it has content in the source locale)
      let hasEmpty = false
      sourceFields.forEach((_, idx) => {
        if (getFieldValue(idx, 'label', sourceLocale) && !getFieldValue(idx, 'label', locale.code)) hasEmpty = true
        if (getFieldValue(idx, 'placeholder', sourceLocale) && !getFieldValue(idx, 'placeholder', locale.code)) hasEmpty = true

        const options = sourceFields[idx].options || []
        options.forEach((_, optIdx) => {
          if (getOptionLabel(idx, optIdx, sourceLocale) && !getOptionLabel(idx, optIdx, locale.code)) hasEmpty = true
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

      // Get user's personal translation settings
      const { getTranslationHeaders } = await import('@/lib/translation-client')
      const personalHeaders = getTranslationHeaders()

      // Gather all strings
      interface TextItem {
        fieldIdx: number
        type: 'label' | 'placeholder' | 'option'
        optIdx?: number
        sourceValue: string
      }

      const itemsToTranslate: TextItem[] = []

      for (let fieldIdx = 0; fieldIdx < sourceFields.length; fieldIdx++) {
        const sourceField = sourceFields[fieldIdx]

        const sourceLabel = getFieldValue(fieldIdx, 'label', sourceLocale)
        if (sourceLabel) itemsToTranslate.push({ fieldIdx, type: 'label', sourceValue: sourceLabel })

        const sourcePlaceholder = getFieldValue(fieldIdx, 'placeholder', sourceLocale)
        if (sourcePlaceholder) itemsToTranslate.push({ fieldIdx, type: 'placeholder', sourceValue: sourcePlaceholder })

        const sourceOptions = sourceField.options || []
        for (let optIdx = 0; optIdx < sourceOptions.length; optIdx++) {
          const sourceOptLabel = getOptionLabel(fieldIdx, optIdx, sourceLocale)
          if (sourceOptLabel) itemsToTranslate.push({ fieldIdx, type: 'option', optIdx, sourceValue: sourceOptLabel })
        }
      }

      for (const targetLang of targetLocales) {
        // Filter items that need translation for THIS targetLang
        const validItems = itemsToTranslate.filter(item => {
          if (overwriteExisting) return true
          if (item.type === 'label') return !getFieldValue(item.fieldIdx, 'label', targetLang)
          if (item.type === 'placeholder') return !getFieldValue(item.fieldIdx, 'placeholder', targetLang)
          if (item.type === 'option') return !getOptionLabel(item.fieldIdx, item.optIdx!, targetLang)
          return false
        })

        if (validItems.length === 0) continue

        const texts = validItems.map(i => i.sourceValue)

        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...personalHeaders },
          body: JSON.stringify({
            texts,
            sourceLang: sourceLocale,
            targetLang,
          }),
        })

        if (!res.ok) throw new Error(`Translation to ${targetLang} failed`)

        const data = await res.json()
        const translations = data.translations as string[]

        if (translations && Array.isArray(translations)) {
          // Update the fields for this language
          for (let i = 0; i < validItems.length; i++) {
            const item = validItems[i]
            const translatedText = translations[i]
            if (!translatedText) continue

            if (item.type === 'label') {
              updateFieldValue(item.fieldIdx, 'label', targetLang, translatedText)
            } else if (item.type === 'placeholder') {
              updateFieldValue(item.fieldIdx, 'placeholder', targetLang, translatedText)
            } else if (item.type === 'option') {
              updateOptionLabel(item.fieldIdx, item.optIdx!, targetLang, translatedText)
            }
            totalTranslated++
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

        // Merge and ensure we send STRINGS for localized fields
        // We use getFieldValue/getOptionLabel to handle both string and object data formats
        const fieldsToSave = sourceFields.map((sourceField, idx) => {
          const currentLabel = getFieldValue(idx, 'label', locale.code)
          const sourceLabel = getFieldValue(idx, 'label', sourceLocale)
          const currentPlaceholder = getFieldValue(idx, 'placeholder', locale.code)
          const sourcePlaceholder = getFieldValue(idx, 'placeholder', sourceLocale)

          return {
            ...sourceField, // Copy stable non-localized fields (fieldName, fieldType, id, etc.)
            // IMPORTANT: Overwrite localized fields with STRING values
            // Preserve raw values to maintain intentional whitespace and indentation
            label: (currentLabel !== undefined && currentLabel !== null && currentLabel !== '') ? currentLabel : (sourceLabel || ' '),
            placeholder: (currentPlaceholder !== undefined && currentPlaceholder !== null && currentPlaceholder !== '') ? currentPlaceholder : (sourcePlaceholder || ''),
            options: (sourceField.options || []).map((sourceOpt, optIdx) => {
              const currentOptLabel = getOptionLabel(idx, optIdx, locale.code)
              const sourceOptLabel = getOptionLabel(idx, optIdx, sourceLocale)
              return {
                ...sourceOpt,
                label: (currentOptLabel !== undefined && currentOptLabel !== null && currentOptLabel !== '') ? currentOptLabel : (sourceOptLabel || ' '),
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
          try {
            const errData = await res.json()
            console.error(`[FormFieldsTranslationCenter] Save failed for ${locale.code}:`, errData)
          } catch (e) {
            console.error(`[FormFieldsTranslationCenter] Save failed for ${locale.code}: ${res.status}`)
          }
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
  }, [id, localeData, sourceLocale, currentLocale.code, getFieldValue, getOptionLabel, t])

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
                        const sourceFields = localeData[sourceLocale]?.fields || []
                        const allFilled = sourceFields.length > 0 && !sourceFields.some((_, idx) => {
                          let empty = false
                          if (getFieldValue(idx, 'label', sourceLocale) && !getFieldValue(idx, 'label', locale.code)) empty = true
                          if (getFieldValue(idx, 'placeholder', sourceLocale) && !getFieldValue(idx, 'placeholder', locale.code)) empty = true
                          const options = sourceFields[idx].options || []
                          options.forEach((_, optIdx) => {
                            if (getOptionLabel(idx, optIdx, sourceLocale) && !getOptionLabel(idx, optIdx, locale.code)) empty = true
                          })
                          return empty
                        })

                        return (
                          <label
                            key={locale.code}
                            className={`fftc-target-item ${isSelected ? 'fftc-target-item--selected' : ''} ${allFilled ? 'fftc-target-item--filled' : ''}`}
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
                            {allFilled && <span className="fftc-target-item__check">✓</span>}
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
                                      <textarea
                                        value={getFieldValue(fieldIdx, 'label', locale.code)}
                                        onChange={(e) => updateFieldValue(fieldIdx, 'label', locale.code, e.target.value)}
                                        placeholder={getFieldValue(fieldIdx, 'label', sourceLocale)}
                                        rows={1}
                                        className="tc-field-input"
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
                                      <textarea
                                        value={getFieldValue(fieldIdx, 'placeholder', locale.code)}
                                        onChange={(e) => updateFieldValue(fieldIdx, 'placeholder', locale.code, e.target.value)}
                                        placeholder={getFieldValue(fieldIdx, 'placeholder', sourceLocale)}
                                        rows={1}
                                        className="tc-field-input"
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
                                            <textarea
                                              value={getOptionLabel(fieldIdx, optIdx, locale.code)}
                                              onChange={(e) => updateOptionLabel(fieldIdx, optIdx, locale.code, e.target.value)}
                                              placeholder={getOptionLabel(fieldIdx, optIdx, sourceLocale)}
                                              rows={1}
                                              className="tc-option-input"
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
