'use client'

import React, { useState, useCallback } from 'react'
import { TextFieldClientComponent } from 'payload'
import { useField, useTranslation } from '@payloadcms/ui'
import { LinkPickerModal } from '../../lexical-features/shared/LinkPickerModal'

export const PathSelectorField: TextFieldClientComponent = (props) => {
  const { path, field } = props
  const { value, setValue } = useField<string>({ path })
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'
  
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSelect = useCallback((selectedPath: string) => {
    setValue(selectedPath)
  }, [setValue])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }, [setValue])

  const getLabel = () => {
    if (!field.label) return field.name
    if (typeof field.label === 'string') return field.label
    return isZh ? (field.label.zh || field.label.en || field.name) : (field.label.en || field.label.zh || field.name)
  }

  return (
    <div className="field-type text" style={{ marginBottom: '1.5rem' }}>
      <label className="field-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
        {getLabel()}
      </label>

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={value || ''}
            onChange={handleInputChange}
            placeholder="/contact-us"
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '4px',
              background: 'var(--theme-input-bg)',
              color: 'var(--theme-text)',
              fontSize: '14px',
            }}
          />
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '4px',
              background: 'var(--theme-elevation-50)',
              color: 'var(--theme-text)',
              cursor: 'pointer',
              fontSize: '14px',
              whiteSpace: 'nowrap',
            }}
          >
            {isZh ? '选择站内链接' : 'Select Link'}
          </button>
        </div>

        {isModalOpen && (
          <LinkPickerModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSelect={handleSelect}
          />
        )}
      </div>

      {/* 描述信息 */}
      <div
        style={{
          marginTop: '0.5rem',
          fontSize: '12px',
          color: 'var(--theme-elevation-500)',
        }}
      >
        {isZh ? '输入精确的 URL 路径，如 /contact-us' : 'Enter exact URL path, e.g. /contact-us'}
      </div>
    </div>
  )
}

export default PathSelectorField
