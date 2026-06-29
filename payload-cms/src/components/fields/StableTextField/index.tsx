'use client'

/**
 * StableTextField
 *
 * A drop-in replacement for Payload's built-in text field that avoids the
 * cursor-jump-to-end bug which can happen with localized fields used as
 * document titles.
 *
 * The input is rendered as an uncontrolled field with `defaultValue`.  Form
 * state is still kept in sync via `useField`'s `setValue`, so validation and
 * `useAsTitle` continue to work normally.  The component only remounts when the
 * locale changes, ensuring that keystrokes (including Backspace) do not reset
 * the caret position.
 */

import React, { useEffect, useRef, useState } from 'react'
import { useField, useLocale, useTranslation } from '@payloadcms/ui'

interface StableTextFieldProps {
  path: string
  field: {
    name: string
    label?: string | Record<string, string>
    required?: boolean
    localized?: boolean
    admin?: {
      description?: string | Record<string, string>
      placeholder?: string
      width?: string
    }
  }
}

const getLocalizedText = (
  value: string | Record<string, string> | undefined,
  language: string,
): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[language] || value.en || value.zh || ''
}

export const StableTextField: React.FC<StableTextFieldProps> = ({ path, field }) => {
  const { value, setValue, showError } = useField<string>({ path })
  const currentLocale = useLocale()
  const { i18n } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  const [inputKey, setInputKey] = useState(`${path}-${currentLocale.code}`)

  // Remount the input when the active locale changes so it picks up the new
  // locale's initial value.  Keep it mounted during normal typing.
  useEffect(() => {
    setInputKey(`${path}-${currentLocale.code}-${Date.now()}`)
  }, [currentLocale.code, path])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const label = getLocalizedText(field.label, i18n.language)
  const description = getLocalizedText(field.admin?.description, i18n.language)
  const placeholder = getLocalizedText(field.admin?.placeholder, i18n.language)
  const width = field.admin?.width || '100%'

  return (
    <div className="field-type text" style={{ width }}>
      <label className="field-label" htmlFor={`field-${path}`}>
        {label}
        {field.required && <span className="required">*</span>}
        {field.localized && (
          <span className="field-localized-indicator" style={{ marginLeft: 6 }}>
            🌐
          </span>
        )}
      </label>
      <div className="field-type__wrap">
        <input
          key={inputKey}
          ref={inputRef}
          id={`field-${path}`}
          name={path}
          type="text"
          className={`${showError ? 'error' : ''}`}
          defaultValue={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          required={field.required}
          style={{ width: '100%' }}
        />
        {description && <p className="field-description">{description}</p>}
      </div>
    </div>
  )
}

export default StableTextField
