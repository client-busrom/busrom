'use client'

import React, { useState } from 'react'
import { TextFieldClientComponent } from 'payload'
import { useField, useTranslation } from '@payloadcms/ui'
import { LinkPickerModal } from '../../../lexical-features/shared/LinkPickerModal'
import { Link as LinkIcon, Search } from 'lucide-react'

export const SmartLinkField: TextFieldClientComponent = (props) => {
  const { path, field } = props
  const { value, setValue } = useField<string>({ path })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'

  const getLabel = () => {
    if (!field.label) return field.name
    if (typeof field.label === 'string') return field.label
    const labelObj = field.label as { en?: string; zh?: string }
    return isZh ? (labelObj.zh || labelObj.en) : (labelObj.en || labelObj.zh)
  }

  return (
    <div className="field-type text" style={{ marginBottom: '1.5rem' }}>
      <label className="field-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
        {getLabel()}
      </label>

      <div style={{ position: 'relative', display: 'flex', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <LinkIcon size={16} />
          </div>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => setValue(e.target.value)}
            placeholder={isZh ? '输入 URL 或点击选择...' : 'Enter URL or select...'}
            style={{
              width: '100%',
              padding: '10px 10px 10px 36px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              background: 'var(--theme-input-bg)',
              color: 'var(--theme-text)',
            }}
          />
        </div>
        
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0 16px',
            background: 'var(--theme-elevation-100)',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--theme-text)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--theme-elevation-150)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--theme-elevation-100)'
          }}
        >
          <Search size={16} />
          {isZh ? '选择链接' : 'Select'}
        </button>
      </div>

      <p style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
        {isZh
          ? '支持站内链接（产品、页面、分类等）或直接手写外部链接。'
          : 'Supports internal links (products, pages, categories, etc.) or external URLs.'}
      </p>

      <LinkPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(newPath) => setValue(newPath)}
      />
    </div>
  )
}

export default SmartLinkField
