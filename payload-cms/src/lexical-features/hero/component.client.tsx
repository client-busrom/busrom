// @ts-nocheck
/**
 * HeroComponent - WYSIWYG Preview Component
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import { useTranslation } from '@payloadcms/ui'
import { Image as ImageIcon, Link as LinkIcon, Sparkles } from 'lucide-react'
import type { HeroData, HeroHeight } from './node'
import { $createHeroNode, HeroNode } from './node'
import { MediaPickerModal } from '../image-gallery/component.client'
import { LinkPickerModal } from '../shared/LinkPickerModal'

interface HeroComponentProps {
  nodeKey: string
  [key: string]: any
}

interface MediaData {
  id: number
  filename: string
  url: string
  thumbnailURL?: string
  alt?: string
  width?: number
  height?: number
}

export const HeroComponent: React.FC<HeroComponentProps> = (props) => {
  const [editor] = useLexicalComposerContext()
  const [isEditing, setIsEditing] = useState(false)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [isLinkPickerOpen, setIsLinkPickerOpen] = useState(false)
  const [imageData, setImageData] = useState<MediaData | null>(null)
  const { t, i18n } = useTranslation()

  const nodeData = (props as any).data || (props as any).node?.__data || (props as any).__data
  const nodeKey = props.nodeKey

  const [formData, setFormData] = useState<HeroData>(
    nodeData || {
      title: '',
      subtitle: '',
      height: 'medium',
    },
  )

  const data = isEditing ? formData : nodeData || formData

  const backgroundImageId =
    typeof data.backgroundImage === 'string' ? data.backgroundImage : data.backgroundImage?.id

  useEffect(() => {
    if (!isEditing && nodeData) {
      console.log('🎯 Hero nodeData:', nodeData)
      setFormData(nodeData)
    }
  }, [nodeData, isEditing])

  // Load media info
  useEffect(() => {
    const loadImageInfo = async () => {
      if (!backgroundImageId) {
        setImageData(null)
        return
      }

      try {
        const res = await fetch(`/api/media/${backgroundImageId}?depth=0`)
        if (res.ok) {
          const mediaData = await res.json()
          setImageData(mediaData)
        }
      } catch (error) {
        console.error('Failed to load image info:', error)
      }
    }

    loadImageInfo()
  }, [backgroundImageId])

  const handleSave = () => {
    if (!formData.title) {
      alert(i18n?.language === 'zh' ? '请输入标题' : 'Please enter a title')
      return
    }

    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node && node instanceof HeroNode) {
        const newNode = $createHeroNode(formData)
        node.replace(newNode)
      }
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(nodeData || formData)
    setIsEditing(false)
  }

  const handleImageSelect = (mediaId: string) => {
    setFormData({ ...formData, backgroundImage: { id: mediaId } })
    setShowMediaPicker(false)
  }

  const getHeightLabel = (height: HeroHeight) => {
    const labels = {
      small: i18n?.language === 'zh' ? '小' : 'Small',
      medium: i18n?.language === 'zh' ? '中' : 'Medium',
      large: i18n?.language === 'zh' ? '大' : 'Large',
      fullscreen: i18n?.language === 'zh' ? '全屏' : 'Full Screen',
    }
    return labels[height]
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
          <Sparkles size={20} style={{ color: '#6b7280' }} />
          <strong style={{ color: '#374151', fontSize: '14px', fontWeight: 600 }}>
            {i18n?.language === 'zh' ? '英雄横幅' : 'Hero Banner'}
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
              {i18n?.language === 'zh' ? '标题' : 'Title'}
              <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={i18n?.language === 'zh' ? '输入标题' : 'Enter title'}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>

          {/* 副标题 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '副标题' : 'Subtitle'}
            </label>
            <textarea
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder={i18n?.language === 'zh' ? '输入副标题' : 'Enter subtitle'}
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical',
              }}
            />
          </div>

          {/* 背景图片 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '背景图片' : 'Background Image'}
            </label>

            {/* 图片预览 */}
            {formData.backgroundImage && imageData && (
              <div style={{ marginBottom: '12px' }}>
                <img
                  src={imageData.thumbnailURL || imageData.url}
                  alt={imageData.alt || 'Background preview'}
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                  }}
                />
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
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ImageIcon size={16} />
              {formData.backgroundImage
                ? i18n?.language === 'zh'
                  ? '更换图片'
                  : 'Change Image'
                : i18n?.language === 'zh'
                  ? '选择图片'
                  : 'Select Image'}
            </button>
            {formData.backgroundImage && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280' }}>
                {i18n?.language === 'zh' ? '图片ID: ' : 'Image ID: '}
                {typeof formData.backgroundImage === 'string' ? formData.backgroundImage : formData.backgroundImage?.id}
              </div>
            )}
          </div>

          {/* CTA按钮文字 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '按钮文字' : 'CTA Button Text'}
            </label>
            <input
              type="text"
              value={formData.ctaText || ''}
              onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
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

          {/* CTA按钮链接 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '按钮链接' : 'CTA Button URL'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={formData.ctaUrl || ''}
                onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
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

          {/* 高度选择 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '高度' : 'Height'}
            </label>
            <select
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value as HeroHeight })}
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
              <option value="small">{getHeightLabel('small')}</option>
              <option value="medium">{getHeightLabel('medium')}</option>
              <option value="large">{getHeightLabel('large')}</option>
              <option value="fullscreen">{getHeightLabel('fullscreen')}</option>
            </select>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {data.title ? (
            <div style={{ width: '100%', maxWidth: 'none' }}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  minHeight: data.height === 'small' ? '200px' : data.height === 'medium' ? '300px' : data.height === 'large' ? '400px' : '500px',
                }}
              >
              {/* 背景图片 */}
              {backgroundImageId && imageData && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${imageData.url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(0.7)',
                  }}
                />
              )}

              {/* 内容区 */}
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: data.height === 'small' ? '200px' : data.height === 'medium' ? '300px' : data.height === 'large' ? '400px' : '500px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  background: backgroundImageId ? 'rgba(0,0,0,0.3)' : '#f9fafb',
                }}
              >
                {/* 标题 */}
                <h1
                  style={{
                    fontSize: data.height === 'small' ? '28px' : data.height === 'fullscreen' ? '48px' : '36px',
                    fontWeight: 700,
                    color: backgroundImageId ? '#ffffff' : '#111827',
                    marginBottom: '16px',
                    maxWidth: '800px',
                  }}
                >
                  {data.title}
                </h1>

                {/* 副标题 */}
                {data.subtitle && (
                  <p
                    style={{
                      fontSize: data.height === 'small' ? '14px' : '18px',
                      color: backgroundImageId ? 'rgba(255,255,255,0.9)' : '#6b7280',
                      marginBottom: data.ctaText ? '24px' : '0',
                      maxWidth: '600px',
                      lineHeight: '1.6',
                    }}
                  >
                    {data.subtitle}
                  </p>
                )}

                {/* CTA 按钮 */}
                {data.ctaText && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      backgroundColor: '#A08745',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '16px',
                      fontWeight: 600,
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {data.ctaText}
                    {data.ctaUrl && (
                      <span style={{ fontSize: '12px', opacity: 0.8 }}>
                        → {data.ctaUrl.length > 30 ? data.ctaUrl.substring(0, 30) + '...' : data.ctaUrl}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 信息标签 */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  display: 'flex',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    padding: '4px 8px',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '11px',
                  }}
                >
                  📏 {getHeightLabel(data.height)}
                </span>
                {backgroundImageId && (
                  <span
                    style={{
                      padding: '4px 8px',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '11px',
                    }}
                  >
                    🖼️ {i18n?.language === 'zh' ? '背景图' : 'BG'}
                  </span>
                )}
              </div>
              </div>
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
              <Sparkles size={32} style={{ margin: '0 auto 8px', color: '#9ca3af' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>
                {i18n?.language === 'zh' ? '未配置英雄横幅' : 'Hero banner not configured'}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                {i18n?.language === 'zh' ? '请添加标题和内容' : 'Please add title and content'}
              </p>
            </div>
          )}
        </div>
      )}

      <MediaPickerModal
        isOpen={showMediaPicker}
        onSelect={handleImageSelect}
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
          setFormData({ ...formData, ctaUrl: path })
          setIsLinkPickerOpen(false)
        }}
      />
    </div>
  )
}
