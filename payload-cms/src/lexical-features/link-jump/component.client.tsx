// @ts-nocheck
/**
 * LinkJumpComponent - WYSIWYG Preview Component
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import { useTranslation } from '@payloadcms/ui'
import { Link as LinkIcon, ExternalLink } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import type { LinkJumpData } from './node'
import { $createLinkJumpNode, LinkJumpNode } from './node'
import { MediaPickerModal } from '../image-gallery/component.client'
import { LinkPickerModal } from '../shared/LinkPickerModal'

interface LinkJumpComponentProps {
  nodeKey: string
  [key: string]: any
}

interface MediaData {
  id: number
  filename: string
  url: string
  thumbnailURL?: string
  alt?: string
}

export const LinkJumpComponent: React.FC<LinkJumpComponentProps> = (props) => {
  const [editor] = useLexicalComposerContext()
  const [isEditing, setIsEditing] = useState(false)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [isLinkPickerOpen, setIsLinkPickerOpen] = useState(false)
  const [iconData, setIconData] = useState<MediaData | null>(null)
  const { t, i18n } = useTranslation()

  const nodeData = (props as any).data || (props as any).node?.__data || (props as any).__data
  const nodeKey = props.nodeKey

  const [formData, setFormData] = useState<LinkJumpData>(
    nodeData || {
      title: '',
      url: '',
      openInNewTab: false,
    },
  )

  const data = isEditing ? formData : nodeData || formData

  const iconId = typeof data.icon === 'string' ? data.icon : data.icon?.id

  useEffect(() => {
    if (!isEditing && nodeData) {
      setFormData(nodeData)
    }
  }, [nodeData, isEditing])

  // Load icon info
  useEffect(() => {
    const loadIconInfo = async () => {
      if (!iconId) {
        setIconData(null)
        return
      }

      try {
        const res = await fetch(`/api/media/${iconId}?depth=0`)
        if (res.ok) {
          const mediaData = await res.json()
          setIconData(mediaData)
        }
      } catch (error) {
        console.error('Failed to load icon info:', error)
      }
    }

    loadIconInfo()
  }, [iconId])

  const handleSave = () => {
    if (!formData.title || !formData.url) {
      alert(i18n?.language === 'zh' ? '请输入标题和链接地址' : 'Please enter title and URL')
      return
    }

    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node && node instanceof LinkJumpNode) {
        const newNode = $createLinkJumpNode(formData)
        node.replace(newNode)
      }
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(nodeData || formData)
    setIsEditing(false)
  }

  const handleIconSelect = (mediaId: string) => {
    setFormData({ ...formData, icon: { id: mediaId } })
    setShowMediaPicker(false)
  }

  const handleRemoveIcon = () => {
    setFormData({ ...formData, icon: undefined })
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
          <LinkIcon size={20} style={{ color: '#6b7280' }} />
          <strong style={{ color: '#374151', fontSize: '14px', fontWeight: 600 }}>
            {i18n?.language === 'zh' ? '快速链接' : 'Link Jump'}
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
          {/* 标题 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '标题' : 'Title'} *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={i18n?.language === 'zh' ? '输入链接标题' : 'Enter link title'}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>

          {/* 描述 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '描述' : 'Description'}
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={i18n?.language === 'zh' ? '输入链接描述' : 'Enter link description'}
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical',
              }}
            />
          </div>

          {/* URL 输入 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '链接地址' : 'URL'} *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com 或 /pages/about"
                style={{
                  width: '100%',
                  padding: '10px 12px',
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

          {/* 图标 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '图标（可选）' : 'Icon (Optional)'}
            </label>

            {formData.icon && iconData && (
              <div style={{ marginBottom: '12px', position: 'relative', display: 'inline-block' }}>
                <img
                  src={iconData.thumbnailURL || iconData.url}
                  alt={iconData.alt || 'Icon'}
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveIcon}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowMediaPicker(true)}
              style={{
                padding: '10px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {formData.icon
                ? (i18n?.language === 'zh' ? '更换图标' : 'Change Icon')
                : (i18n?.language === 'zh' ? '选择图标' : 'Select Icon')
              }
            </button>
          </div>

          {/* Lucide 图标名称 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? 'Lucide 图标名称（可选）' : 'Lucide Icon Name (Optional)'}
            </label>
            <input
              type="text"
              value={formData.iconName || ''}
              onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
              placeholder="ArrowRight, Check, Star..."
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
              {i18n?.language === 'zh'
                ? '输入 Lucide React 图标名称，如 ArrowRight、Check、Star 等。优先使用图片图标。'
                : 'Enter Lucide React icon name like ArrowRight, Check, Star, etc. Image icon takes priority.'
              }
            </p>
          </div>

          {/* 新标签打开 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="openInNewTab"
              checked={formData.openInNewTab}
              onChange={(e) => setFormData({ ...formData, openInNewTab: e.target.checked })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="openInNewTab" style={{ fontSize: '14px', cursor: 'pointer' }}>
              {i18n?.language === 'zh' ? '在新标签页打开' : 'Open in New Tab'}
            </label>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6'
            e.currentTarget.style.borderColor = '#A08745'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb'
            e.currentTarget.style.borderColor = '#e5e7eb'
          }}
        >
          {/* 图标 */}
          {(() => {
            // 优先使用图片图标
            if (iconId && iconData) {
              return (
                <img
                  src={iconData.thumbnailURL || iconData.url}
                  alt={iconData.alt || 'Icon'}
                  style={{
                    width: '48px',
                    height: '48px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                  }}
                />
              )
            }

            // 其次使用 Lucide 图标
            if (data.iconName) {
              const IconComponent = (LucideIcons as any)[data.iconName]
              if (IconComponent) {
                return (
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '6px',
                      backgroundColor: '#A08745',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    <IconComponent size={24} />
                  </div>
                )
              }
            }

            // 默认图标
            return (
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '6px',
                  backgroundColor: '#A08745',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <LinkIcon size={24} />
              </div>
            )
          })()}

          {/* 内容 */}
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
              {data.title || (i18n?.language === 'zh' ? '未命名链接' : 'Untitled Link')}
            </h3>
            {data.description && (
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                {data.description}
              </p>
            )}
            {data.url && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                {data.isInternalLink && (
                  <span
                    style={{
                      padding: '2px 6px',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#059669',
                      backgroundColor: '#d1fae5',
                      borderRadius: '4px',
                    }}
                  >
                    {i18n?.language === 'zh' ? '站内' : 'Internal'}
                  </span>
                )}
                <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                  {data.url}
                </p>
              </div>
            )}
          </div>

          {/* 新标签图标 */}
          {data.openInNewTab && (
            <ExternalLink size={20} style={{ color: '#6b7280', flexShrink: 0 }} />
          )}
        </div>
      )}

      <MediaPickerModal
        isOpen={showMediaPicker}
        onSelect={handleIconSelect}
        onClose={() => setShowMediaPicker(false)}
        imageIndex={0}
        t={t}
        i18n={i18n}
      />

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
