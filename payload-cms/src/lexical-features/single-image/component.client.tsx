// @ts-nocheck
/**
 * SingleImageComponent - WYSIWYG Preview Component
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import { useTranslation } from '@payloadcms/ui'
import { Image as ImageIcon, Link as LinkIcon } from 'lucide-react'
import type { SingleImageData } from './node'
import { $createSingleImageNode, SingleImageNode } from './node'
import { MediaPickerModal } from '../image-gallery/component.client'
import { LinkPickerModal } from '../carousel/component.client'

interface MediaItem {
  id: number
  filename: string
  url: string
  thumbnailURL?: string
  alt?: string
  width?: number
  height?: number
  mimeType?: string
  categories?: Array<{ id: number | string; name: string }>
  tags?: Array<{ id: number | string; name: string }>
}

interface MediaCategory {
  id: number | string
  name: string
}

interface MediaTag {
  id: number | string
  name: string
}

interface SingleImageComponentProps {
  nodeKey: string
  [key: string]: any
}

export const SingleImageComponent: React.FC<SingleImageComponentProps> = (props) => {
  const [editor] = useLexicalComposerContext()
  const [isEditing, setIsEditing] = useState(false)
  const { t, i18n } = useTranslation()

  const nodeData = (props as any).data || (props as any).node?.__data || (props as any).__data
  const nodeKey = props.nodeKey

  const [formData, setFormData] = useState<SingleImageData>(
    nodeData || {
      image: '',
      caption: '',
      alignment: 'center',
      size: 'large',
    },
  )

  const [imageData, setImageData] = useState<MediaItem | null>(null)
  const [isSelectingImage, setIsSelectingImage] = useState(false)
  const [showLinkPicker, setShowLinkPicker] = useState(false)

  const data = isEditing ? formData : nodeData || formData

  useEffect(() => {
    if (!isEditing && nodeData) {
      setFormData(nodeData)
    }
  }, [nodeData, isEditing])

  // 加载图片信息
  useEffect(() => {
    const loadImageInfo = async () => {
      const imageId = typeof data.image === 'string' ? data.image : data.image?.id
      if (!imageId) return

      try {
        const res = await fetch(`/api/media/${imageId}?depth=0`)
        if (res.ok) {
          const mediaData = await res.json()
          setImageData(mediaData)
        }
      } catch (error) {
        console.error('Failed to load image info:', error)
      }
    }

    loadImageInfo()
  }, [data.image])

  const handleSave = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node && node instanceof SingleImageNode) {
        const newNode = $createSingleImageNode(formData)
        node.replace(newNode)
      }
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(nodeData || formData)
    setIsEditing(false)
  }

  const handleSelectImage = (imageId: string) => {
    setFormData({ ...formData, image: { id: imageId } })
    setIsSelectingImage(false)
  }

  const getAlignmentLabel = (alignment: string) => {
    const labels: Record<string, string> = {
      left: i18n?.language === 'zh' ? '左对齐' : 'Left',
      center: i18n?.language === 'zh' ? '居中' : 'Center',
      right: i18n?.language === 'zh' ? '右对齐' : 'Right',
    }
    return labels[alignment] || alignment
  }

  const getSizeLabel = (size: string) => {
    const labels: Record<string, string> = {
      small: i18n?.language === 'zh' ? '小' : 'Small',
      medium: i18n?.language === 'zh' ? '中' : 'Medium',
      large: i18n?.language === 'zh' ? '大' : 'Large',
      full: i18n?.language === 'zh' ? '全宽' : 'Full Width',
    }
    return labels[size] || size
  }

  const getSizeStyle = (size: string) => {
    const sizes: Record<string, string> = {
      small: '300px',
      medium: '600px',
      large: '900px',
      full: '100%',
    }
    return sizes[size] || '900px'
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
          <ImageIcon size={20} style={{ color: '#6b7280' }} />
          <strong style={{ color: '#374151', fontSize: '14px', fontWeight: 600 }}>
            {i18n?.language === 'zh' ? '单张图片' : 'Single Image'}
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
          {/* 图片选择 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '图片' : 'Image'}
            </label>
            <div
              onClick={() => setIsSelectingImage(true)}
              style={{
                width: '200px',
                height: '200px',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: formData.image ? '2px solid #A08745' : '2px dashed #d1d5db',
                overflow: 'hidden',
              }}
            >
              {formData.image && imageData ? (
                <img
                  src={imageData.thumbnailURL || imageData.url}
                  alt={imageData.alt || ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                  <ImageIcon size={32} />
                  <div style={{ fontSize: '12px', marginTop: '8px' }}>
                    {i18n?.language === 'zh' ? '点击选择图片' : 'Click to select'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 图片说明 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '图片说明' : 'Caption'}
            </label>
            <input
              type="text"
              value={formData.caption || ''}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder={i18n?.language === 'zh' ? '输入图片说明（可选）' : 'Enter caption (optional)'}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>

          {/* 对齐方式 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '对齐方式' : 'Alignment'}
            </label>
            <select
              value={formData.alignment}
              onChange={(e) => setFormData({ ...formData, alignment: e.target.value as any })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            >
              <option value="left">{getAlignmentLabel('left')}</option>
              <option value="center">{getAlignmentLabel('center')}</option>
              <option value="right">{getAlignmentLabel('right')}</option>
            </select>
          </div>

          {/* 尺寸 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '尺寸' : 'Size'}
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
              }}
            >
              <option value="small">{getSizeLabel('small')}</option>
              <option value="medium">{getSizeLabel('medium')}</option>
              <option value="large">{getSizeLabel('large')}</option>
              <option value="full">{getSizeLabel('full')}</option>
            </select>
          </div>

          {/* 启用链接 */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.enableLink || false}
                onChange={(e) => setFormData({ ...formData, enableLink: e.target.checked })}
              />
              {i18n?.language === 'zh' ? '启用链接' : 'Enable Link'}
            </label>
          </div>

          {formData.enableLink && (
            <>
              {/* 链接地址 */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                  {i18n?.language === 'zh' ? '链接地址' : 'Link URL'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={formData.linkUrl || ''}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    placeholder={i18n?.language === 'zh' ? '输入链接地址' : 'Enter link URL'}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      paddingRight: '36px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLinkPicker(true)}
                    title={i18n?.language === 'zh' ? '选择站内链接' : 'Select internal link'}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '4px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      color: '#6b7280',
                    }}
                  >
                    <LinkIcon size={16} />
                  </button>
                </div>
              </div>

              {/* 新标签页打开 */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.openInNewTab || false}
                    onChange={(e) => setFormData({ ...formData, openInNewTab: e.target.checked })}
                  />
                  {i18n?.language === 'zh' ? '新标签页打开' : 'Open in New Tab'}
                </label>
              </div>
            </>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: data.alignment === 'left' ? 'flex-start' : data.alignment === 'right' ? 'flex-end' : 'center',
          }}
        >
          {data.image && imageData ? (
            <div style={{ maxWidth: getSizeStyle(data.size) }}>
              <img
                src={imageData.url}
                alt={data.caption || imageData.alt || ''}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              />
              {data.caption && (
                <p style={{
                  marginTop: '8px',
                  fontSize: '14px',
                  color: '#6b7280',
                  textAlign: data.alignment,
                }}>
                  {data.caption}
                </p>
              )}
            </div>
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
              <ImageIcon size={32} style={{ margin: '0 auto' }} />
              <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                {i18n?.language === 'zh' ? '未选择图片' : 'No image selected'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 图片选择器模态框 */}
      {isSelectingImage && (
        <MediaPickerModal
          isOpen={isSelectingImage}
          onClose={() => setIsSelectingImage(false)}
          onSelect={handleSelectImage}
          imageIndex={0}
          t={t}
          i18n={i18n}
        />
      )}

      {/* 链接选择器模态框 */}
      {showLinkPicker && (
        <LinkPickerModal
          isOpen={showLinkPicker}
          onClose={() => setShowLinkPicker(false)}
          onSelect={(path: string) => {
            setFormData({ ...formData, linkUrl: path })
            setShowLinkPicker(false)
          }}
        />
      )}
    </div>
  )
}
