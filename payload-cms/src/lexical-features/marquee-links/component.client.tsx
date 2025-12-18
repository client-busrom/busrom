// @ts-nocheck
/**
 * MarqueeLinks Component - Client Side
 */

'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import React, { useState, useEffect } from 'react'
import { MarqueeLinksData, MarqueeLinksNode, MarqueeLink } from './node'
import { X, Plus, Link as LinkIcon, GripVertical, ExternalLink } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { MediaPickerModal } from '../image-gallery/component.client'
import { useTranslation } from '@payloadcms/ui'

interface MarqueeLinksComponentProps {
  nodeKey: string
  data: MarqueeLinksData
}

// LinkPickerModal component (embedded in same file)
interface LinkPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (path: string) => void
}

const LinkPickerModal: React.FC<LinkPickerModalProps> = ({ isOpen, onClose, onSelect }) => {
  const { i18n } = useTranslation()
  const [selectedCollection, setSelectedCollection] = useState<string>('products')
  const [searchQuery, setSearchQuery] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const collections = [
    { value: 'products', label: i18n?.language === 'zh' ? '产品' : 'Products', pathPrefix: '/products' },
    { value: 'productSeries', label: i18n?.language === 'zh' ? '产品系列' : 'Product Series', pathPrefix: '/series' },
    { value: 'pages', label: i18n?.language === 'zh' ? '页面' : 'Pages', pathPrefix: '/pages' },
    { value: 'blogs', label: i18n?.language === 'zh' ? '博客' : 'Blogs', pathPrefix: '/blog' },
  ]

  useEffect(() => {
    if (isOpen) {
      fetchItems()
    }
  }, [isOpen, selectedCollection, searchQuery, currentPage])

  const fetchItems = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '10',
        page: currentPage.toString(),
      })

      if (searchQuery) {
        params.append('where[title][like]', searchQuery)
      }

      const response = await fetch(`/api/${selectedCollection}?${params}`)
      const data = await response.json()

      setItems(data.docs || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (item: any) => {
    const collection = collections.find((c) => c.value === selectedCollection)
    if (!collection) return

    const path = `${collection.pathPrefix}/${item.slug || item.id}`
    onSelect(path)
    onClose()
  }

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
          padding: '20px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{i18n?.language === 'zh' ? '选择站内链接' : 'Select Internal Link'}</h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <select
            value={selectedCollection}
            onChange={(e) => {
              setSelectedCollection(e.target.value)
              setCurrentPage(1)
            }}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            {collections.map((col) => (
              <option key={col.value} value={col.value}>
                {col.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <input
            type="text"
            placeholder={i18n?.language === 'zh' ? '搜索...' : 'Search...'}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>

        {isLoading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>{i18n?.language === 'zh' ? '加载中...' : 'Loading...'}</div>
        ) : (
          <>
            <div style={{ marginBottom: '12px' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: '14px' }}>{item.title || item.name || item.id}</div>
                  {item.slug && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {collections.find((c) => c.value === selectedCollection)?.pathPrefix}/{item.slug}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {i18n?.language === 'zh' ? '上一页' : 'Previous'}
                </button>
                <span style={{ padding: '6px 12px', fontSize: '14px' }}>
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {i18n?.language === 'zh' ? '下一页' : 'Next'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

interface MediaData {
  id: string
  filename: string
  url: string
  thumbnailURL?: string
  alt?: string
}

export const MarqueeLinksComponent: React.FC<MarqueeLinksComponentProps> = ({ nodeKey, data }) => {
  const [editor] = useLexicalComposerContext()
  const { i18n } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [localData, setLocalData] = useState<MarqueeLinksData>(data)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null)
  const [isLinkPickerOpen, setIsLinkPickerOpen] = useState(false)
  const [linkPickerIndex, setLinkPickerIndex] = useState<number | null>(null)
  const [mediaDataCache, setMediaDataCache] = useState<Record<string, MediaData>>({})

  // Load media info for all icons
  useEffect(() => {
    const loadMediaInfo = async () => {
      const iconIds = localData.links
        .map((link) => (typeof link.icon === 'object' ? link.icon?.id : link.icon))
        .filter((id): id is string => !!id && !mediaDataCache[id])

      if (iconIds.length === 0) return

      for (const iconId of iconIds) {
        try {
          const res = await fetch(`/api/media/${iconId}?depth=0`)
          if (res.ok) {
            const mediaData = await res.json()
            setMediaDataCache((prev) => ({ ...prev, [iconId]: mediaData }))
          }
        } catch (error) {
          console.error('Failed to load media info:', error)
        }
      }
    }

    loadMediaInfo()
  }, [localData.links])

  const handleSave = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as MarqueeLinksNode
      if (node) {
        node.setData(localData)
      }
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setLocalData(data)
    setIsEditing(false)
  }

  const handleLinkChange = (index: number, field: keyof MarqueeLink, value: any) => {
    const newLinks = [...localData.links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setLocalData({ ...localData, links: newLinks })
  }

  const handleAddLink = () => {
    setLocalData({
      ...localData,
      links: [...localData.links, { title: i18n?.language === 'zh' ? '链接标题' : 'Link Title', url: '', icon: '' }],
    })
  }

  const handleRemoveLink = (index: number) => {
    const newLinks = localData.links.filter((_, i) => i !== index)
    setLocalData({ ...localData, links: newLinks })
  }

  const openMediaPicker = (index: number) => {
    setCurrentEditingIndex(index)
    setIsMediaPickerOpen(true)
  }

  const handleMediaSelect = (mediaId: string) => {
    if (currentEditingIndex !== null) {
      // When selecting an uploaded icon, clear the Lucide icon name / 选择上传图标时，清空 Lucide 图标名称
      const newLinks = [...localData.links]
      newLinks[currentEditingIndex] = {
        ...newLinks[currentEditingIndex],
        icon: { id: mediaId },
        iconName: undefined,
      }
      setLocalData({ ...localData, links: newLinks })
    }
    setIsMediaPickerOpen(false)
    setCurrentEditingIndex(null)
  }

  const openLinkPicker = (index: number) => {
    setLinkPickerIndex(index)
    setIsLinkPickerOpen(true)
  }

  const handleLinkSelect = (path: string) => {
    if (linkPickerIndex !== null) {
      handleLinkChange(linkPickerIndex, 'url', path)
    }
    setIsLinkPickerOpen(false)
    setLinkPickerIndex(null)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, overIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === overIndex) return

    // Real-time reordering - squeeze effect
    const newLinks = [...localData.links]
    const [draggedLink] = newLinks.splice(draggedIndex, 1)
    newLinks.splice(overIndex, 0, draggedLink)

    setLocalData({ ...localData, links: newLinks })
    setDraggedIndex(overIndex)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const getSpeedInSeconds = (speed: string): number => {
    switch (speed) {
      case 'slow':
        return 60
      case 'medium':
        return 30
      case 'fast':
        return 15
      default:
        return 30
    }
  }

  if (isEditing) {
    return (
      <div
        style={{
          border: '2px solid #A08745',
          borderRadius: '8px',
          padding: '16px',
          margin: '8px 0',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{i18n?.language === 'zh' ? '编辑滚动链接' : 'Edit Marquee Links'}</h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {i18n?.language === 'zh' ? '取消' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#A08745',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {i18n?.language === 'zh' ? '保存' : 'Save'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>{i18n?.language === 'zh' ? '滚动速度' : 'Scroll Speed'}</label>
          <select
            value={localData.speed}
            onChange={(e) => setLocalData({ ...localData, speed: e.target.value as 'slow' | 'medium' | 'fast' })}
            style={{
              width: '100%',
              padding: '6px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px',
            }}
          >
            <option value="slow">{i18n?.language === 'zh' ? '慢速' : 'Slow'}</option>
            <option value="medium">{i18n?.language === 'zh' ? '中速' : 'Medium'}</option>
            <option value="fast">{i18n?.language === 'zh' ? '快速' : 'Fast'}</option>
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 500 }}>{i18n?.language === 'zh' ? '链接列表' : 'Links'}</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {localData.links.map((link, index) => {
              const iconId = typeof link.icon === 'object' ? link.icon?.id : link.icon
              return (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    cursor: 'move',
                    opacity: draggedIndex === index ? 0.5 : 1,
                    transform: draggedIndex === index ? 'scale(0.98)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <GripVertical size={16} color="#9ca3af" />
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(index)}
                      style={{
                        marginLeft: 'auto',
                        padding: '4px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: '#ef4444',
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div style={{ marginBottom: '6px' }}>
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                      onMouseDown={(e) => e.stopPropagation()}
                      onDragStart={(e) => e.stopPropagation()}
                      placeholder={i18n?.language === 'zh' ? '链接标题' : 'Link Title'}
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        border: '1px solid #d1d5db',
                        borderRadius: '3px',
                        fontSize: '11px',
                      }}
                    />
                  </div>

                  <div style={{ position: 'relative', marginBottom: '6px' }}>
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                      onMouseDown={(e) => e.stopPropagation()}
                      onDragStart={(e) => e.stopPropagation()}
                      placeholder={i18n?.language === 'zh' ? '链接地址' : 'Link URL'}
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        paddingRight: '30px',
                        border: '1px solid #d1d5db',
                        borderRadius: '3px',
                        fontSize: '11px',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => openLinkPicker(index)}
                      title={i18n?.language === 'zh' ? '选择站内链接' : 'Select Internal Link'}
                      style={{
                        position: 'absolute',
                        right: '4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        padding: '4px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <LinkIcon size={14} />
                    </button>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 500 }}>{i18n?.language === 'zh' ? '上传图标' : 'Upload Icon'}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {iconId && mediaDataCache[iconId] && (
                        <img
                          src={mediaDataCache[iconId].thumbnailURL || mediaDataCache[iconId].url}
                          alt={mediaDataCache[iconId].alt || 'icon preview'}
                          style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '2px' }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => openMediaPicker(index)}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '3px',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          fontSize: '10px',
                        }}
                      >
                        {iconId ? (i18n?.language === 'zh' ? '更换图标' : 'Replace Icon') : (i18n?.language === 'zh' ? '选择图标' : 'Select Icon')}
                      </button>
                      {iconId && (
                        <button
                          type="button"
                          onClick={() => handleLinkChange(index, 'icon', '')}
                          style={{
                            padding: '4px',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                          }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 500 }}>{i18n?.language === 'zh' ? 'Lucide 图标名称（可选）' : 'Lucide Icon Name (Optional)'}</label>
                      <a
                        href="https://lucide.dev/icons/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          fontSize: '10px',
                          color: '#3b82f6',
                          textDecoration: 'none',
                        }}
                      >
                        {i18n?.language === 'zh' ? '选择图标' : 'Select Icon'} <ExternalLink size={10} />
                      </a>
                    </div>
                    <input
                      type="text"
                      value={link.iconName || ''}
                      onChange={(e) => {
                        const newValue = e.target.value
                        handleLinkChange(index, 'iconName', newValue)
                        // If a Lucide icon name is entered, clear the uploaded icon / 如果输入了 Lucide 图标名称，清空上传的图标
                        if (newValue && iconId) {
                          handleLinkChange(index, 'icon', '')
                        }
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onDragStart={(e) => e.stopPropagation()}
                      placeholder="ArrowRight, Check, Star..."
                      disabled={!!iconId}
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        border: '1px solid #d1d5db',
                        borderRadius: '3px',
                        fontSize: '11px',
                        backgroundColor: iconId ? '#f3f4f6' : 'white',
                        cursor: iconId ? 'not-allowed' : 'text',
                      }}
                    />
                    <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#6b7280' }}>
                      {iconId ? (i18n?.language === 'zh' ? '已使用上传图标，如需使用 Lucide 图标请先删除上传的图标' : 'Using uploaded icon. Delete it to use Lucide icon.') : (i18n?.language === 'zh' ? '输入 Lucide 图标名称' : 'Enter Lucide icon name')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            onClick={handleAddLink}
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              border: '1px dashed #d1d5db',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <Plus size={14} />
            {i18n?.language === 'zh' ? '添加链接' : 'Add Link'}
          </button>
        </div>

        <MediaPickerModal
          isOpen={isMediaPickerOpen}
          onClose={() => {
            setIsMediaPickerOpen(false)
            setCurrentEditingIndex(null)
          }}
          onSelect={handleMediaSelect}
        />

        <LinkPickerModal isOpen={isLinkPickerOpen} onClose={() => setIsLinkPickerOpen(false)} onSelect={handleLinkSelect} />
      </div>
    )
  }

  // Preview mode with horizontal scrolling
  return (
    <div
      onClick={() => setIsEditing(true)}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        margin: '8px 0',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
        maxWidth: '600px',
      }}
    >
      <div style={{ marginBottom: '8px', fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
        {i18n?.language === 'zh' ? '滚动链接' : 'Marquee Links'} ({localData.links.length} {i18n?.language === 'zh' ? '个链接' : 'links'}, {i18n?.language === 'zh' ? '速度' : 'speed'}: {localData.speed === 'slow' ? (i18n?.language === 'zh' ? '慢速' : 'Slow') : localData.speed === 'medium' ? (i18n?.language === 'zh' ? '中速' : 'Medium') : (i18n?.language === 'zh' ? '快速' : 'Fast')})
      </div>
      <div
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '16px',
            paddingBottom: '8px',
          }}
        >
          {localData.links.map((link, index) => {
            const iconId = typeof link.icon === 'object' ? link.icon?.id : link.icon

            // Render icon / 渲染图标
            const renderIcon = () => {
              // Prioritize uploaded icons / 优先使用上传的图标
              if (iconId && mediaDataCache[iconId]) {
                return (
                  <img
                    src={mediaDataCache[iconId].thumbnailURL || mediaDataCache[iconId].url}
                    alt={mediaDataCache[iconId].alt || 'icon'}
                    style={{ width: '20px', height: '20px', objectFit: 'cover', borderRadius: '2px' }}
                  />
                )
              }

              // Then use Lucide icons / 其次使用 Lucide 图标
              if (link.iconName) {
                const IconComponent = (LucideIcons as any)[link.iconName]
                if (IconComponent) {
                  return <IconComponent size={20} style={{ color: '#6b7280' }} />
                }
              }

              return null
            }

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                  border: '1px solid #e5e7eb',
                  flexShrink: 0,
                }}
              >
                {renderIcon()}
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{link.title}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
