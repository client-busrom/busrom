'use client'

import React, { useState } from 'react'
import { useField, useTranslation } from '@payloadcms/ui'
import { getIconSvgUrl, normalizeIconName } from './iconify-utils'
import { IconSearchGrid } from './IconSearchGrid'
import './index.scss'

interface IconPickerProps {
  path?: string
  field: {
    name: string
    label?: string | Record<string, string>
    required?: boolean
    admin?: {
      description?: string | Record<string, string>
    }
  }
  value?: string
  onChange?: (value: string) => void
}

export const IconPicker: React.FC<IconPickerProps> = (props) => {
  const { path, field, value: controlledValue, onChange } = props
  const fieldHook = useField<string>({ path: path || field.name })
  
  const value = controlledValue !== undefined ? controlledValue : fieldHook.value
  const setValue = onChange || fieldHook.setValue
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const isZh = i18n?.language === 'zh'

  // Normalize the current value (handle legacy PascalCase Lucide names)
  const displayValue = value ? normalizeIconName(value) : ''

  const handleSelect = (iconName: string) => {
    setValue(iconName)
    setIsOpen(false)
  }

  const handleClear = () => {
    setValue('')
  }

  const getLabel = (): string => {
    if (!field.label) return field.name
    if (typeof field.label === 'string') return field.label
    return (isZh ? field.label.zh : field.label.en) || field.name
  }

  const getDescription = (): string | undefined => {
    const desc = field.admin?.description
    if (!desc) return undefined
    if (typeof desc === 'string') return desc
    return isZh ? desc.zh : desc.en
  }

  return (
    <div className="icon-picker-field">
      <label className="icon-picker-field__label">
        {getLabel()}
        {field.required && <span className="icon-picker-field__required">*</span>}
      </label>

      {getDescription() && (
        <div className="icon-picker-field__description">{getDescription()}</div>
      )}

      <div className="icon-picker-field__control">
        {/* Current value preview */}
        <div
          className="icon-picker-field__preview"
          onClick={() => setIsOpen(true)}
        >
          {displayValue ? (
            <>
              <img
                src={getIconSvgUrl(displayValue, '#333')}
                alt={displayValue}
                className="icon-picker-field__icon"
              />
              <span className="icon-picker-field__name">{displayValue}</span>
            </>
          ) : (
            <span className="icon-picker-field__placeholder">
              {isZh ? '点击选择图标...' : 'Click to select icon...'}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="icon-picker-field__actions">
          <button
            type="button"
            className="icon-picker-field__btn icon-picker-field__btn--select"
            onClick={() => setIsOpen(true)}
          >
            {displayValue
              ? (isZh ? '更换' : 'Change')
              : (isZh ? '选择图标' : 'Select Icon')}
          </button>
          {displayValue && (
            <button
              type="button"
              className="icon-picker-field__btn icon-picker-field__btn--clear"
              onClick={handleClear}
            >
              {isZh ? '清除' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      {/* Search Modal */}
      {isOpen && (
        <div className="icon-picker-modal__overlay" onClick={() => setIsOpen(false)}>
          <div className="icon-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="icon-picker-modal__header">
              <h3 className="icon-picker-modal__title">
                {isZh ? '选择图标' : 'Select Icon'}
              </h3>
              <button
                type="button"
                className="icon-picker-modal__close"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="icon-picker-modal__body">
              <IconSearchGrid
                onSelect={handleSelect}
                selectedIcon={displayValue}
                isZh={isZh}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IconPicker
