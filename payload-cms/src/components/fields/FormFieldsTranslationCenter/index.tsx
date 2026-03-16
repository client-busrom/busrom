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
  label: string
}

interface FormField {
  id?: string
  fieldName: string
  label: string
  placeholder?: string
  fieldType: string
  options?: FormFieldOption[]
  required?: boolean
  width?: string
  order?: number
}

interface LocaleDataEntry {
  fields: FormField[]
  displayName: string
  description: string
  submitButtonText: string
  submittingText: string
  successMessage: string
  errorRequiredFields: string
  errorNetworkMessage: string
  errorCaptchaMessage: string
  autoReplySubject: string
}

interface LocaleData {
  [locale: string]: LocaleDataEntry
}

const ROOT_LOCALIZED_FIELDS: (keyof LocaleDataEntry)[] = [
  'displayName', 'description', 'submitButtonText', 'submittingText',
  'successMessage', 'errorRequiredFields', 'errorNetworkMessage',
  'errorCaptchaMessage', 'autoReplySubject'
]

export const FormFieldsTranslationCenter: React.FC = () => {
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

      // Function to extract string value for a specific locale from potentially localized field
      const getVal = (field: any, locale: string) => {
        if (!field) return ''
        if (typeof field === 'string') return field
        if (typeof field === 'object' && field !== null) return field[locale] || ''
        return ''
      }

      // Build locale data structure - NORMALIZE to strings early
      const newLocaleData: LocaleData = {}
      for (const locale of SUPPORTED_LOCALES) {
        const code = locale.code
        newLocaleData[code] = {
          fields: (data.fields?.[code] || data.fields || []).map((f: any) => ({
            ...f,
            label: getVal(f.label, code),
            placeholder: getVal(f.placeholder, code),
            options: (f.options || []).map((o: any) => ({
              ...o,
              label: getVal(o.label, code)
            }))
          })),
          displayName: getVal(data.displayName, code),
          description: getVal(data.description, code),
          submitButtonText: getVal(data.submitButtonText, code),
          submittingText: getVal(data.submittingText, code),
          successMessage: getVal(data.successMessage, code),
          errorRequiredFields: getVal(data.errorRequiredFields, code),
          errorNetworkMessage: getVal(data.errorNetworkMessage, code),
          errorCaptchaMessage: getVal(data.errorCaptchaMessage, code),
          autoReplySubject: getVal(data.autoReplySubject, code),
        }
      }

      setLocaleData(newLocaleData)
      setIsLoading(false)
    } catch (error) {
      console.error('[FormFieldsTranslationCenter] Error loading data:', error)
      setStatusMessage({ type: 'error', text: t('custom:formFieldsTranslation:loadFailed' as any) as string || 'Failed to load form fields data' })
      setIsLoading(false)
    }
  }, [id, t])

  const handleOpenModal = () => {
    setIsModalOpen(true)
    loadAllLocalesData()
  }

  const updateRootFieldValue = useCallback((fieldName: keyof LocaleDataEntry, locale: string, newValue: string) => {
    setLocaleData(prev => ({
      ...prev,
      [locale]: {
        ...(prev[locale] as any),
        [fieldName]: newValue,
      }
    }))
  }, [])

  const updateFieldValue = useCallback((fieldIndex: number, fieldName: 'label' | 'placeholder', locale: string, newValue: string) => {
    setLocaleData(prev => {
      const newData = { ...prev }
      if (!newData[locale]) return prev // Shouldn't happen after normalization

      const fields = [...(newData[locale].fields || [])]
      if (fields[fieldIndex]) {
        fields[fieldIndex] = {
          ...fields[fieldIndex],
          [fieldName]: newValue,
        }
      }
      newData[locale] = { ...newData[locale], fields }
      return newData
    })
  }, [])

  const updateOptionLabel = useCallback((fieldIndex: number, optionIndex: number, locale: string, newValue: string) => {
    setLocaleData(prev => {
      const newData = { ...prev }
      if (!newData[locale]) return prev

      const fields = [...(newData[locale].fields || [])]
      if (fields[fieldIndex] && fields[fieldIndex].options) {
        const options = [...(fields[fieldIndex].options || [])]
        if (options[optionIndex]) {
          options[optionIndex] = {
            ...options[optionIndex],
            label: newValue,
          }
          fields[fieldIndex] = { ...fields[fieldIndex], options }
        }
      }
      newData[locale] = { ...newData[locale], fields }
      return newData
    })
  }, [])

  const handleTranslate = async () => {
    if (targetLocales.length === 0) {
      setStatusMessage({ type: 'error', text: t('custom:translationCenter:selectTargetLanguages' as any) as string || 'Please select target languages' })
      return
    }

    setIsTranslating(true)
    setStatusMessage(null)

    try {
      let totalTranslated = 0
      
      // Translate root fields
      for (const fieldName of ROOT_LOCALIZED_FIELDS) {
        const sourceVal = localeData[sourceLocale]?.[fieldName] as string
        if (!sourceVal || sourceVal.trim() === '') continue

        const localesToTranslate = targetLocales.filter(locale => {
          if (overwriteExisting) return true
          const currentVal = localeData[locale]?.[fieldName] as string
          return !currentVal || currentVal.trim() === ''
        })

        if (localesToTranslate.length > 0) {
          const res = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: sourceVal,
              sourceLang: sourceLocale,
              targetLangs: localesToTranslate,
            }),
          })
          const data = await res.json()
          for (const locale of localesToTranslate) {
            if (data.translations?.[locale]) {
              updateRootFieldValue(fieldName, locale, data.translations[locale])
              totalTranslated++
            }
          }
        }
      }

      // Translate array fields
      const sourceFields = localeData[sourceLocale]?.fields || []
      for (let fieldIdx = 0; fieldIdx < sourceFields.length; fieldIdx++) {
        const sourceField = sourceFields[fieldIdx]
        
        // Label
        if (sourceField.label) {
          const localesToTranslate = targetLocales.filter(locale => {
            if (overwriteExisting) return true
            return !localeData[locale]?.fields[fieldIdx]?.label
          })

          if (localesToTranslate.length > 0) {
            const res = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: sourceField.label,
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

        // Placeholder
        if (sourceField.placeholder) {
          const localesToTranslate = targetLocales.filter(locale => {
            if (overwriteExisting) return true
            return !localeData[locale]?.fields[fieldIdx]?.placeholder
          })

          if (localesToTranslate.length > 0) {
            const res = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: sourceField.placeholder,
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

        // Options
        const sourceOptions = sourceField.options || []
        for (let optIdx = 0; optIdx < sourceOptions.length; optIdx++) {
          const optLabel = sourceOptions[optIdx].label
          if (optLabel) {
            const localesToTranslate = targetLocales.filter(locale => {
              if (overwriteExisting) return true
              return !localeData[locale]?.fields[fieldIdx]?.options?.[optIdx]?.label
            })

            if (localesToTranslate.length > 0) {
              const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: optLabel,
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
  }

  const handleSave = async () => {
    if (!id) return
    setIsSaving(true)
    setStatusMessage(null)

    let successCount = 0
    let failCount = 0

    try {
      const sourceEntry = localeData[sourceLocale]
      if (!sourceEntry) throw new Error('Source data not found')

      for (const locale of SUPPORTED_LOCALES) {
        if (locale.code === currentLocale.code) continue
        
        const currentEntry = localeData[locale.code] || { fields: [] } as any
        
        // Prepare root data
        const payload: any = {}
        for (const rf of ROOT_LOCALIZED_FIELDS) {
          const val = (currentEntry[rf] || '').trim()
          payload[rf] = val || (sourceEntry[rf] || '')
        }

        // Prepare fields array
        payload.fields = sourceEntry.fields.map((sf, idx) => {
          const cf = currentEntry.fields[idx] || {}
          return {
            ...sf,
            label: (cf.label || '').trim() || (sf.label || ' '), // Fix: space as fallback for required
            placeholder: cf.placeholder || sf.placeholder || '',
            options: (sf.options || []).map((so, oIdx) => {
              const co = cf.options?.[oIdx] || {}
              return {
                ...so,
                label: (co.label || '').trim() || (so.label || ' ')
              }
            })
          }
        })

        const res = await fetch(`/api/form-configs/${id}?locale=${locale.code}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (res.ok) {
          successCount++
        } else {
          failCount++
          const errData = await res.json()
          console.error(`[FormFieldsTranslation] Save failed for ${locale.code}:`, errData)
        }
      }

      if (failCount === 0) {
        setStatusMessage({ type: 'success', text: `${t('custom:translationCenter:saveSuccess' as any) || 'Saved to'} ${successCount} languages` })
      } else {
        setStatusMessage({ type: 'warning', text: `${successCount} success, ${failCount} failed` })
      }
    } catch (error) {
      console.error('[FormFieldsTranslationCenter] Save error:', error)
      setStatusMessage({ type: 'error', text: 'Save failed' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectAllTargets = () => {
    setTargetLocales(SUPPORTED_LOCALES.filter(l => l.code !== sourceLocale).map(l => l.code))
  }

  const handleSelectEmptyTargets = () => {
    const emptyLocales = SUPPORTED_LOCALES.filter(l => {
      if (l.code === sourceLocale) return false
      const data = localeData[l.code]
      if (!data) return true
      // Check if any required field is empty
      const hasEmptyFields = data.fields.some(f => !f.label)
      const hasEmptyRoot = ROOT_LOCALIZED_FIELDS.some(f => !data[f])
      return hasEmptyFields || hasEmptyRoot
    }).map(l => l.code)
    setTargetLocales(emptyLocales)
  }

  const toggleField = (fieldIdx: number) => {
    setExpandedFields(prev => {
      const next = new Set(prev)
      const key = String(fieldIdx)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const sourceFields = localeData[sourceLocale]?.fields || []

  if (!id) return null

  return (
    <>
      <div className="fftc-trigger">
        <button type="button" className="fftc-trigger__btn" onClick={handleOpenModal}>
          {t('custom:formFieldsTranslation:triggerButton' as any) || 'Form Fields Translation'}
        </button>
        <span className="fftc-trigger__hint">{sourceFields.length} fields</span>
      </div>

      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fftc-modal-overlay">
          <div className="fftc-modal">
            <div className="fftc-modal__header">
              <h2>{t('custom:formFieldsTranslation:title' as any) || 'Form Fields Translation'}</h2>
              <button type="button" className="fftc-modal__close" onClick={() => setIsModalOpen(false)}>x</button>
            </div>

            {isLoading ? (
              <div className="fftc-modal__loading">Loading...</div>
            ) : (
              <>
                <div className="fftc-modal__controls">
                  <div className="fftc-control-row">
                    <label>Source Language</label>
                    <select value={sourceLocale} onChange={(e) => setSourceLocale(e.target.value as LocaleCode)}>
                      {SUPPORTED_LOCALES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                    </select>
                  </div>
                  <div className="fftc-control-row">
                    <label>Target Languages 
                      <span className="fftc-control-actions">
                        <button onClick={handleSelectAllTargets}>All</button>
                        <button onClick={handleSelectEmptyTargets}>Empty</button>
                        <button onClick={() => setTargetLocales([])}>Clear</button>
                      </span>
                    </label>
                    <div className="fftc-targets-grid">
                      {SUPPORTED_LOCALES.filter(l => l.code !== sourceLocale).map(l => (
                        <label key={l.code} className={`fftc-target-item ${targetLocales.includes(l.code) ? 'fftc-target-item--selected' : ''}`}>
                          <input type="checkbox" checked={targetLocales.includes(l.code)} 
                            onChange={(e) => e.target.checked ? setTargetLocales([...targetLocales, l.code]) : setTargetLocales(targetLocales.filter(x => x !== l.code))} />
                          <LocaleFlag localeCode={l.code} className="fftc-target-item__flag" />
                          <span>{l.code.toUpperCase()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="fftc-control-row fftc-control-row--actions">
                    <label><input type="checkbox" checked={overwriteExisting} onChange={(e) => setOverwriteExisting(e.target.checked)} /> Overwrite existing</label>
                    <div className="fftc-action-buttons">
                      <button className="fftc-btn fftc-btn--primary" onClick={handleTranslate} disabled={isTranslating || isSaving}>Translate</button>
                      <button className="fftc-btn fftc-btn--secondary" onClick={handleSave} disabled={isTranslating || isSaving}>Save All</button>
                    </div>
                  </div>
                  {statusMessage && <div className={`fftc-status fftc-status--${statusMessage.type}`}>{statusMessage.text}</div>}
                </div>

                <div className="fftc-modal__content">
                  {/* Root Fields Section */}
                  <div className="fftc-section">
                    <h3 className="fftc-section__title">General Information</h3>
                    {ROOT_LOCALIZED_FIELDS.map(rf => (
                      <div key={rf} className="fftc-root-field">
                        <label className="fftc-root-field__label">{t(`custom:fields:${rf}` as any) || rf}</label>
                        <div className="fftc-field-inputs">
                          {[sourceLocale, ...targetLocales].map(code => (
                            <div key={code} className="fftc-input-wrapper">
                              <span className="fftc-lang-tag">{code.toUpperCase()}</span>
                              <textarea rows={1} value={localeData[code]?.[rf] as string || ''} 
                                onChange={(e) => updateRootFieldValue(rf, code, e.target.value)} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Array Fields Section */}
                  <div className="fftc-section">
                    <h3 className="fftc-section__title">Form Fields</h3>
                    {sourceFields.map((field, idx) => (
                      <div key={idx} className="fftc-field-group">
                        <div className="fftc-field-header" onClick={() => toggleField(idx)}>
                          <span className="fftc-field-name">{field.fieldName} ({field.fieldType})</span>
                        </div>
                        {expandedFields.has(String(idx)) && (
                          <div className="fftc-field-details">
                            <div className="fftc-field-row">
                              <label>Label</label>
                              <div className="fftc-field-inputs">
                                {[sourceLocale, ...targetLocales].map(code => (
                                  <div key={code} className="fftc-input-wrapper">
                                    <span className="fftc-lang-tag">{code.toUpperCase()}</span>
                                    <textarea rows={1} value={localeData[code]?.fields[idx]?.label || ''} 
                                      onChange={(e) => updateFieldValue(idx, 'label', code, e.target.value)} />
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="fftc-field-row">
                              <label>Placeholder</label>
                              <div className="fftc-field-inputs">
                                {[sourceLocale, ...targetLocales].map(code => (
                                  <div key={code} className="fftc-input-wrapper">
                                    <span className="fftc-lang-tag">{code.toUpperCase()}</span>
                                    <textarea rows={1} value={localeData[code]?.fields[idx]?.placeholder || ''} 
                                      onChange={(e) => updateFieldValue(idx, 'placeholder', code, e.target.value)} />
                                  </div>
                                ))}
                              </div>
                            </div>
                            {field.options && field.options.length > 0 && (
                              <div className="fftc-field-row">
                                <label>Options</label>
                                <div className="fftc-options-list">
                                  {field.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="fftc-option-item">
                                      <span className="fftc-option-value">{opt.value}</span>
                                      <div className="fftc-field-inputs">
                                        {[sourceLocale, ...targetLocales].map(code => (
                                          <div key={code} className="fftc-input-wrapper">
                                            <span className="fftc-lang-tag">{code.toUpperCase()}</span>
                                            <input type="text" value={localeData[code]?.fields[idx]?.options?.[oIdx]?.label || ''} 
                                              onChange={(e) => updateOptionLabel(idx, oIdx, code, e.target.value)} />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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
