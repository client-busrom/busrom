/**
 * CtaButtonComponent - WYSIWYG Preview Component
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import { useTranslation } from '@payloadcms/ui'
import { MousePointerClick as ClickIcon, Link as LinkIcon } from 'lucide-react'
import type { CtaButtonData } from './node'
import { $createCtaButtonNode, CtaButtonNode } from './node'
import { LinkPickerModal } from '../shared/LinkPickerModal'

interface CtaButtonComponentProps {
  nodeKey: string
  [key: string]: any
}

export const CtaButtonComponent: React.FC<CtaButtonComponentProps> = (props) => {
  const [editor] = useLexicalComposerContext()
  const [isEditing, setIsEditing] = useState(false)
  const [isLinkPickerOpen, setIsLinkPickerOpen] = useState(false)
  const { t, i18n } = useTranslation()

  const nodeData = (props as any).data || (props as any).node?.__data || (props as any).__data
  const nodeKey = props.nodeKey

  const [formData, setFormData] = useState<CtaButtonData>(
    nodeData || {
      text: '',
      url: '',
      style: 'primary',
      size: 'medium',
      openInNewTab: false,
    },
  )

  const data = isEditing ? formData : nodeData || formData

  useEffect(() => {
    if (!isEditing && nodeData) {
      setFormData(nodeData)
    }
  }, [nodeData, isEditing])

  const handleSave = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node && node instanceof CtaButtonNode) {
        const newNode = $createCtaButtonNode(formData)
        node.replace(newNode)
      }
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(nodeData || formData)
    setIsEditing(false)
  }

  const getStyleLabel = (style: string) => {
    const labels: Record<string, string> = {
      primary: i18n?.language === 'zh' ? '主要 (金色)' : 'Primary (Gold)',
      secondary: i18n?.language === 'zh' ? '次要 (灰色)' : 'Secondary (Gray)',
      outline: i18n?.language === 'zh' ? '轮廓' : 'Outline',
    }
    return labels[style] || style
  }

  const getSizeLabel = (size: string) => {
    const labels: Record<string, string> = {
      small: i18n?.language === 'zh' ? '小' : 'Small',
      medium: i18n?.language === 'zh' ? '中' : 'Medium',
      large: i18n?.language === 'zh' ? '大' : 'Large',
    }
    return labels[size] || size
  }

  const getButtonStyles = (style: string, size: string) => {
    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 500,
      borderRadius: '6px',
      textDecoration: 'none',
      transition: 'all 0.2s',
      cursor: 'pointer',
      border: 'none',
      fontFamily: 'inherit',
    }

    // 样式变体
    const styleVariants: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: '#A08745',
        color: 'white',
        border: '2px solid #A08745',
      },
      secondary: {
        backgroundColor: '#6b7280',
        color: 'white',
        border: '2px solid #6b7280',
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#A08745',
        border: '2px solid #A08745',
      },
    }

    // 尺寸变体
    const sizeVariants: Record<string, React.CSSProperties> = {
      small: {
        padding: '8px 16px',
        fontSize: '13px',
      },
      medium: {
        padding: '10px 24px',
        fontSize: '14px',
      },
      large: {
        padding: '12px 32px',
        fontSize: '16px',
      },
    }

    return {
      ...baseStyles,
      ...styleVariants[style],
      ...sizeVariants[size],
    }
  }

  const getButtonHoverStyles = (style: string) => {
    const hoverVariants: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: '#8a7339',
        borderColor: '#8a7339',
      },
      secondary: {
        backgroundColor: '#4b5563',
        borderColor: '#4b5563',
      },
      outline: {
        backgroundColor: '#A08745',
        color: 'white',
      },
    }
    return hoverVariants[style]
  }

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '16px',
        margin: '16px 0',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ClickIcon size={20} style={{ color: '#6b7280' }} />
          <strong style={{ color: '#374151', fontSize: '14px', fontWeight: 600 }}>
            {i18n?.language === 'zh' ? '行动按钮' : 'CTA Button'}
          </strong>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#A08745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                {i18n?.language === 'zh' ? '保存' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                {i18n?.language === 'zh' ? '取消' : 'Cancel'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              style={{
                padding: '6px 14px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              {i18n?.language === 'zh' ? '编辑' : 'Edit'}
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 按钮文字 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '按钮文字' : 'Button Text'}
              <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.text || ''}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder={i18n?.language === 'zh' ? '输入按钮文字' : 'Enter button text'}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>

          {/* 链接地址 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '链接地址' : 'URL'}
              <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com 或 /pages/about"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  paddingRight: '40px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
              <button
                type="button"
                onClick={() => setIsLinkPickerOpen(true)}
                title="选择站内链接"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '6px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <LinkIcon size={18} />
              </button>
            </div>
          </div>

          {/* 按钮样式 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '按钮样式' : 'Button Style'}
            </label>
            <select
              value={formData.style}
              onChange={(e) => setFormData({ ...formData, style: e.target.value as any })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="primary">{getStyleLabel('primary')}</option>
              <option value="secondary">{getStyleLabel('secondary')}</option>
              <option value="outline">{getStyleLabel('outline')}</option>
            </select>
          </div>

          {/* 按钮大小 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '按钮大小' : 'Button Size'}
            </label>
            <select
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value as any })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="small">{getSizeLabel('small')}</option>
              <option value="medium">{getSizeLabel('medium')}</option>
              <option value="large">{getSizeLabel('large')}</option>
            </select>
          </div>

          {/* 在新标签页打开 */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.openInNewTab}
                onChange={(e) => setFormData({ ...formData, openInNewTab: e.target.checked })}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                }}
              />
              <span>{i18n?.language === 'zh' ? '在新标签页打开' : 'Open in new tab'}</span>
            </label>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
          {data.text && data.url ? (
            <a
              href={data.url}
              target={data.openInNewTab ? '_blank' : '_self'}
              rel={data.openInNewTab ? 'noopener noreferrer' : undefined}
              style={getButtonStyles(data.style, data.size)}
              onMouseEnter={(e) => {
                const hoverStyles = getButtonHoverStyles(data.style)
                Object.assign(e.currentTarget.style, hoverStyles)
              }}
              onMouseLeave={(e) => {
                const originalStyles = getButtonStyles(data.style, data.size)
                Object.assign(e.currentTarget.style, originalStyles)
              }}
            >
              {data.text}
            </a>
          ) : (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: '#9ca3af',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '2px dashed #d1d5db',
              }}
            >
              <ClickIcon size={32} style={{ margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>
                {i18n?.language === 'zh' ? '未配置按钮' : 'Button not configured'}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                {i18n?.language === 'zh' ? '请填写按钮文字和链接地址' : 'Please enter button text and URL'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* LinkPickerModal */}
      <LinkPickerModal
        isOpen={isLinkPickerOpen}
        onClose={() => setIsLinkPickerOpen(false)}
        onSelect={(path) => {
          setFormData({ ...formData, url: path })
          setIsLinkPickerOpen(false)
        }}
      />
    </div>
  )
}
