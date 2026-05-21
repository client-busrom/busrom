'use client'

import React, { useState } from 'react'
import { TextFieldClientComponent } from 'payload'
import { useField, useTranslation } from '@payloadcms/ui'
import { LinkPickerModal } from '../../../lexical-features/shared/LinkPickerModal'
import { Link as LinkIcon, Search } from 'lucide-react'

export const ContactLinkField: TextFieldClientComponent = (props) => {
  const { path, field } = props
  const { value, setValue } = useField<string>({ path })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'

  // 获取同级的 linkType 字段值
  const linkTypePath = path.replace(/\.linkUrl$/, '.linkType')
  const { value: linkTypeValue } = useField<string>({ path: linkTypePath })
  const linkType = linkTypeValue || 'url'

  const getLabel = () => {
    if (!field.label) return field.name
    if (typeof field.label === 'string') return field.label
    const labelObj = field.label as { en?: string; zh?: string }
    return isZh ? (labelObj.zh || labelObj.en) : (labelObj.en || labelObj.zh)
  }

  const getPlaceholder = () => {
    switch (linkType) {
      case 'phone':
        return isZh ? '+86 138-0000-0000' : '+1 (555) 123-4567'
      case 'email':
        return isZh ? 'mailto:sales@example.com' : 'mailto:sales@example.com'
      case 'chat':
        return isZh ? '留空即可触发聊天组件' : 'Leave empty to trigger chat widget'
      default:
        return isZh ? '输入 URL 或点击选择...' : 'Enter URL or select...'
    }
  }

  const getDescription = () => {
    switch (linkType) {
      case 'phone':
        return isZh
          ? '格式: +86 138-0000-0000（自动添加 tel: 前缀）'
          : 'Format: +1 (555) 123-4567 (tel: prefix auto-added)'
      case 'email':
        return isZh
          ? '格式: mailto:email@example.com'
          : 'Format: mailto:email@example.com'
      case 'chat':
        return isZh
          ? '无需填写链接，点击后自动打开聊天窗口'
          : 'No link needed, click will open chat widget'
      default:
        return isZh
          ? '支持站内链接（产品、页面、分类等）或直接手写外部链接。'
          : 'Supports internal links (products, pages, categories, etc.) or external URLs.'
    }
  }

  const isChat = linkType === 'chat'

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
            placeholder={getPlaceholder()}
            disabled={isChat}
            style={{
              width: '100%',
              padding: '10px 10px 10px 36px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              background: isChat ? 'var(--theme-elevation-100)' : 'var(--theme-input-bg)',
              color: 'var(--theme-text)',
              opacity: isChat ? 0.6 : 1,
            }}
          />
        </div>

        {!isChat && (
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
        )}
      </div>

      <p style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
        {getDescription()}
      </p>

      <LinkPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(newPath) => setValue(newPath)}
      />
    </div>
  )
}

export default ContactLinkField
