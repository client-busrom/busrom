// @ts-nocheck
/**
 * SingleImageComponent - WYSIWYG Preview Component
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import { useTranslation } from '@payloadcms/ui'
import { Image as ImageIcon } from 'lucide-react'
import type { SingleImageData } from './node'
import { $createSingleImageNode, SingleImageNode } from './node'

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

// MediaPicker Modal Component
interface MediaPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (mediaId: string) => void
}

const MediaPickerModal: React.FC<MediaPickerModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [categories, setCategories] = useState<MediaCategory[]>([])
  const [tags, setTags] = useState<MediaTag[]>([])
  const [mimeTypeFilter, setMimeTypeFilter] = useState<string>('image')

  const [groupNumber, setGroupNumber] = useState<string>('')
  const [sceneNumber, setSceneNumber] = useState<string>('')
  const [imageNumber, setImageNumber] = useState<string>('')
  const [seriesNumber, setSeriesNumber] = useState<string>('')

  const fetchCategories = React.useCallback(async () => {
    try {
      const res = await fetch('/api/media-categories?limit=100&sort=name')
      const data = await res.json()
      setCategories(data.docs || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }, [])

  const fetchTags = React.useCallback(async () => {
    try {
      const res = await fetch('/api/media-tags?limit=100&sort=name')
      const data = await res.json()
      setTags(data.docs || [])
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }, [])

  const fetchMedia = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '12',
        page: page.toString(),
        sort: '-createdAt',
        depth: '0',
        'where[status][equals]': 'active',
      })

      if (mimeTypeFilter) {
        params.append('where[mimeType][contains]', mimeTypeFilter)
      }

      if (search) {
        params.append('where[filename][contains]', search)
      }

      if (selectedCategory) {
        params.append('where[primaryCategory][equals]', selectedCategory)
      }

      if (selectedTag) {
        params.append('where[tags][in]', selectedTag)
      }

      if (groupNumber) {
        params.append('where[metadata.group][equals]', groupNumber)
      }
      if (sceneNumber) {
        params.append('where[metadata.sceneNumber][equals]', sceneNumber)
      }
      if (imageNumber) {
        params.append('where[metadata.imageNumber][equals]', imageNumber)
      }
      if (seriesNumber) {
        params.append('where[metadata.specs.value][contains]', seriesNumber)
      }

      const res = await fetch(`/api/media?${params.toString()}`)
      const data = await res.json()

      setMedia(data.docs || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch media:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, selectedCategory, selectedTag, mimeTypeFilter, groupNumber, sceneNumber, imageNumber, seriesNumber])

  React.useEffect(() => {
    if (isOpen) {
      fetchMedia()
      fetchCategories()
      fetchTags()
    }
  }, [isOpen, fetchMedia, fetchCategories, fetchTags])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '1200px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#1f2937' }}>
          选择图片
        </h3>

        {/* 筛选器区域 */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="搜索图片文件名..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              marginBottom: '12px',
            }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setPage(1)
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="">全部分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={selectedTag}
              onChange={(e) => {
                setSelectedTag(e.target.value)
                setPage(1)
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="">全部标签</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>

            <select
              value={mimeTypeFilter}
              onChange={(e) => {
                setMimeTypeFilter(e.target.value)
                setPage(1)
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="">全部类型</option>
              <option value="image">图片</option>
              <option value="video">视频</option>
              <option value="pdf">PDF</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <input
              type="number"
              placeholder="分组编号"
              value={groupNumber}
              onChange={(e) => {
                setGroupNumber(e.target.value)
                setPage(1)
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />

            <input
              type="number"
              placeholder="场景编号"
              value={sceneNumber}
              onChange={(e) => {
                setSceneNumber(e.target.value)
                setPage(1)
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />

            <input
              type="number"
              placeholder="图片编号"
              value={imageNumber}
              onChange={(e) => {
                setImageNumber(e.target.value)
                setPage(1)
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />

            <input
              type="text"
              placeholder="系列编号"
              value={seriesNumber}
              onChange={(e) => {
                setSeriesNumber(e.target.value)
                setPage(1)
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>
        </div>

        {/* 图片网格 */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            marginBottom: '16px',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              加载中...
            </div>
          ) : media.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              未找到图片
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '12px',
              }}
            >
              {media.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelect(String(item.id))}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '2px solid #e5e7eb',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#A08745'
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  {item.thumbnailURL || item.url ? (
                    <img
                      src={item.thumbnailURL || item.url}
                      alt={item.alt || item.filename}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#6b7280',
                      }}
                    >
                      {item.filename}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '4px 12px',
                backgroundColor: page === 1 ? '#e5e7eb' : '#A08745',
                color: page === 1 ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              上一页
            </button>
            <span style={{ padding: '4px 12px', fontSize: '14px', color: '#6b7280' }}>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: '4px 12px',
                backgroundColor: page === totalPages ? '#e5e7eb' : '#A08745',
                color: page === totalPages ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              下一页
            </button>
          </div>
        )}

        {/* 底部按钮 */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
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
        />
      )}
    </div>
  )
}
