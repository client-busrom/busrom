// @ts-nocheck
/**
 * ImageGalleryComponent - WYSIWYG Preview Component
 * 简化版本 - 先显示基本预览，后续优化编辑功能
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import { ZoomIn, GripVertical, X, Image as ImageIcon, Plus, Trash2, Grid, List, Link as LinkIcon } from 'lucide-react'
import { useTranslation } from '@payloadcms/ui'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ImageGalleryData } from './node.tsx'
import { $createImageGalleryNode, ImageGalleryNode } from './node.tsx'
import { LinkPickerModal } from '../carousel/component.client'

// 翻译辅助函数
const getTranslation = (key: string, t: any, i18n: any) => {
  // i18n.language 返回 'en' 或 'zh'
  const lang = i18n?.language || 'zh'
  // Debug: 临时添加日志查看实际语言值
  // console.log('[getTranslation] i18n:', i18n, 'language:', lang, 'key:', key)
  const translations: Record<string, Record<string, string>> = {
    zh: {
      title: '图片画廊',
      images: '张图片',
      edit: '编辑',
      save: '保存',
      cancel: '取消',
      layout: '布局',
      spacing: '间距',
      enableLightbox: '启用灯箱效果',
      addImage: '添加图片',
      noImages: '暂无图片',
      clickEditToAdd: '点击"编辑"按钮添加图片',
      imageCaption: '图片说明（可选）',
      delete: '删除',
      clickToSelect: '点击选择',
      clickToChange: '点击更换',
      loading: '加载中...',
      grid2: '2列网格',
      grid3: '3列网格',
      grid4: '4列网格',
      masonry: '瀑布流',
      small: '小',
      normal: '中',
      large: '大',
      currentImages: '当前',
      // MediaPicker 弹窗翻译
      selectImage: '选择图片',
      gridView: '网格',
      listView: '列表',
      searchPlaceholder: '搜索图片文件名...',
      allCategories: '全部分类',
      allTags: '全部标签',
      allTypes: '全部类型',
      imageType: '图片',
      videoType: '视频',
      pdfType: 'PDF',
      groupNumber: '分组编号',
      sceneNumber: '场景编号',
      imageNumber: '图片编号',
      seriesNumber: '系列编号',
      category: '分类',
      tag: '标签',
      type: '类型',
      group: '分组',
      scene: '场景',
      image: '图片',
      series: '系列',
      noImagesFound: '未找到图片',
      select: '选择',
      firstPage: '首页',
      lastPage: '末页',
      prevPage: '上一页',
      nextPage: '下一页',
      jumpTo: '跳至',
      page: '页',
      totalPages: '共 {total} 页',
      switch: '切换',
      escClose: 'ESC 关闭',
      enableLink: '启用链接',
      linkUrl: '链接地址',
      linkUrlPlaceholder: '输入链接地址',
      openInNewTab: '新标签页打开',
      selectInternalLink: '选择站内链接',
    },
    en: {
      title: 'Image Gallery',
      images: 'images',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      layout: 'Layout',
      spacing: 'Spacing',
      enableLightbox: 'Enable Lightbox',
      addImage: 'Add Image',
      noImages: 'No images',
      clickEditToAdd: 'Click "Edit" button to add images',
      imageCaption: 'Image Caption (Optional)',
      delete: 'Delete',
      clickToSelect: 'Click to select',
      clickToChange: 'Click to change',
      loading: 'Loading...',
      grid2: '2 Columns Grid',
      grid3: '3 Columns Grid',
      grid4: '4 Columns Grid',
      masonry: 'Masonry',
      small: 'Small',
      normal: 'Normal',
      large: 'Large',
      currentImages: 'Current',
      // MediaPicker modal translations
      selectImage: 'Select Image',
      gridView: 'Grid',
      listView: 'List',
      searchPlaceholder: 'Search image filename...',
      allCategories: 'All Categories',
      allTags: 'All Tags',
      allTypes: 'All Types',
      imageType: 'Image',
      videoType: 'Video',
      pdfType: 'PDF',
      groupNumber: 'Group Number',
      sceneNumber: 'Scene Number',
      imageNumber: 'Image Number',
      seriesNumber: 'Series Number',
      category: 'Category',
      tag: 'Tag',
      type: 'Type',
      group: 'Group',
      scene: 'Scene',
      image: 'Image',
      series: 'Series',
      noImagesFound: 'No images found',
      select: 'Select',
      firstPage: 'First',
      lastPage: 'Last',
      prevPage: 'Previous',
      nextPage: 'Next',
      jumpTo: 'Go to',
      page: 'page',
      totalPages: '({total} pages)',
      switch: 'Switch',
      escClose: 'ESC to close',
      enableLink: 'Enable Link',
      linkUrl: 'Link URL',
      linkUrlPlaceholder: 'Enter link URL',
      openInNewTab: 'Open in New Tab',
      selectInternalLink: 'Select internal link',
    }
  }
  return translations[lang]?.[key] || translations.zh[key] || key
}

// 可拖拽的图片项组件
interface SortableImageItemProps {
  id: string
  index: number
  item: { image: string | { id: string }, caption?: string, enableLink?: boolean, linkUrl?: string, openInNewTab?: boolean }
  imageData: MediaItem | null
  onEdit: () => void
  onRemove: () => void
  onCaptionChange: (value: string) => void
  onFieldChange: (field: string, value: any) => void
  onOpenLinkPicker: () => void
  t: any
  i18n: any
}

const SortableImageItem: React.FC<SortableImageItemProps> = ({
  id,
  index,
  item,
  imageData,
  onEdit,
  onRemove,
  onCaptionChange,
  onFieldChange,
  onOpenLinkPicker,
  t,
  i18n,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="sortable-image-item"
    >
      <div
        style={{
          display: 'flex',
          gap: '12px',
          padding: '16px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: isDragging ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
          transition: 'box-shadow 0.2s',
        }}
      >
        {/* 拖拽手柄 */}
        <div
          {...attributes}
          {...listeners}
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'grab',
            color: '#9ca3af',
            padding: '4px',
          }}
          onMouseDown={(e) => {
            const target = e.currentTarget as HTMLDivElement
            target.style.cursor = 'grabbing'
          }}
          onMouseUp={(e) => {
            const target = e.currentTarget as HTMLDivElement
            target.style.cursor = 'grab'
          }}
        >
          <GripVertical size={20} />
        </div>

        {/* 图片预览 */}
        <div
          onClick={onEdit}
          style={{
            width: '100px',
            height: '100px',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
            border: item.image ? '2px solid #A08745' : '2px solid #d1d5db',
            overflow: 'hidden',
            position: 'relative',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#A08745'
            e.currentTarget.style.transform = 'scale(1.02)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = item.image ? '#A08745' : '#d1d5db'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          {item.image && imageData ? (
            <>
              <img
                src={imageData.thumbnailURL || imageData.url}
                alt={imageData.alt || ''}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(160, 135, 69, 0.9), transparent)',
                  color: 'white',
                  fontSize: '10px',
                  padding: '4px',
                  textAlign: 'center',
                  fontWeight: 500,
                }}
              >
                {getTranslation('clickToChange', t, i18n)}
              </div>
            </>
          ) : item.image ? (
            <div style={{ textAlign: 'center', fontSize: '11px', color: '#6b7280' }}>
              {getTranslation('loading', t, i18n)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#9ca3af' }}>
              <ImageIcon size={32} strokeWidth={1.5} style={{ marginBottom: '4px' }} />
              <div style={{ fontSize: '11px' }}>{getTranslation('clickToSelect', t, i18n)}</div>
            </div>
          )}
        </div>

        {/* 图片信息和操作 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#374151',
              backgroundColor: '#f3f4f6',
              padding: '2px 8px',
              borderRadius: '4px',
            }}>
              #{index + 1}
            </span>
            {imageData && (
              <span style={{ fontSize: '11px', color: '#6b7280' }}>
                {imageData.width} × {imageData.height}
              </span>
            )}
          </div>

          <input
            type="text"
            placeholder={getTranslation('imageCaption', t, i18n)}
            value={item.caption || ''}
            onChange={(e) => onCaptionChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#A08745'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(160, 135, 69, 0.1)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />

          {/* 启用链接 */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={item.enableLink || false}
              onChange={(e) => onFieldChange('enableLink', e.target.checked)}
            />
            {getTranslation('enableLink', t, i18n)}
          </label>

          {item.enableLink && (
            <>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={item.linkUrl || ''}
                  onChange={(e) => onFieldChange('linkUrl', e.target.value)}
                  placeholder={getTranslation('linkUrlPlaceholder', t, i18n)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    paddingRight: '30px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={onOpenLinkPicker}
                  title={getTranslation('selectInternalLink', t, i18n)}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: '2px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#6b7280',
                  }}
                >
                  <LinkIcon size={14} />
                </button>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={item.openInNewTab || false}
                  onChange={(e) => onFieldChange('openInNewTab', e.target.checked)}
                />
                {getTranslation('openInNewTab', t, i18n)}
              </label>
            </>
          )}
        </div>

        {/* 删除按钮 - 小图标 */}
        <button
          type="button"
          onClick={onRemove}
          title={getTranslation('delete', t, i18n)}
          style={{
            alignSelf: 'flex-start',
            padding: '6px',
            backgroundColor: 'transparent',
            color: '#9ca3af',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fee2e2'
            e.currentTarget.style.color = '#ef4444'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#9ca3af'
          }}
        >
          <Trash2 size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

// MediaPicker Modal Component
interface MediaPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (mediaId: string) => void
  imageIndex: number
  t: any
  i18n: any
}

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

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({ isOpen, onClose, onSelect, imageIndex, t, i18n }) => {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // 视图模式: 'grid' | 'list'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // 筛选状态
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [categories, setCategories] = useState<MediaCategory[]>([])
  const [tags, setTags] = useState<MediaTag[]>([])
  const [mimeTypeFilter, setMimeTypeFilter] = useState<string>('image')

  // Metadata 筛选
  const [groupNumber, setGroupNumber] = useState<string>('')
  const [sceneNumber, setSceneNumber] = useState<string>('')
  const [imageNumber, setImageNumber] = useState<string>('')
  const [seriesNumber, setSeriesNumber] = useState<string>('')

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/media-categories?limit=100&sort=name')
      const data = await res.json()
      setCategories(data.docs || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }, [])

  // 获取标签列表
  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch('/api/media-tags?limit=100&sort=name')
      const data = await res.json()
      setTags(data.docs || [])
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }, [])

  // 获取图片列表
  const fetchMedia = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '12',
        page: page.toString(),
        sort: '-createdAt',
        depth: '0',
        'where[status][equals]': 'active',
      })

      // MIME类型筛选
      if (mimeTypeFilter) {
        params.append('where[mimeType][contains]', mimeTypeFilter)
      }

      // 搜索
      if (search) {
        params.append('where[filename][contains]', search)
      }

      // 分类筛选
      if (selectedCategory) {
        params.append('where[primaryCategory][equals]', selectedCategory)
      }

      // 标签筛选
      if (selectedTag) {
        params.append('where[tags][in]', selectedTag)
      }

      // Metadata 筛选
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

  useEffect(() => {
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#1f2937' }}>
            {getTranslation('selectImage', t, i18n)} #{imageIndex + 1}
          </h3>
          {/* 视图模式切换 */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f3f4f6', padding: '4px', borderRadius: '6px' }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 10px',
                backgroundColor: viewMode === 'grid' ? '#A08745' : 'transparent',
                color: viewMode === 'grid' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                transition: 'all 0.2s',
              }}
            >
              <Grid size={16} />
              {getTranslation('gridView', t, i18n)}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 10px',
                backgroundColor: viewMode === 'list' ? '#A08745' : 'transparent',
                color: viewMode === 'list' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                transition: 'all 0.2s',
              }}
            >
              <List size={16} />
              {getTranslation('listView', t, i18n)}
            </button>
          </div>
        </div>

        {/* 筛选器区域 */}
        <div style={{ marginBottom: '16px' }}>
          {/* 搜索框 */}
          <input
            type="text"
            placeholder={getTranslation('searchPlaceholder', t, i18n)}
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

          {/* 第一行筛选器 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
            {/* 分类筛选 */}
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
              <option value="">{getTranslation('allCategories', t, i18n)}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* 标签筛选 */}
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
              <option value="">{getTranslation('allTags', t, i18n)}</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>

            {/* 文件类型筛选 */}
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
              <option value="">{getTranslation('allTypes', t, i18n)}</option>
              <option value="image">{getTranslation('imageType', t, i18n)}</option>
              <option value="video">{getTranslation('videoType', t, i18n)}</option>
              <option value="pdf">{getTranslation('pdfType', t, i18n)}</option>
            </select>
          </div>

          {/* 第二行筛选器 - Metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {/* 分组编号 */}
            <input
              type="number"
              placeholder={getTranslation('groupNumber', t, i18n)}
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

            {/* 场景编号 */}
            <input
              type="number"
              placeholder={getTranslation('sceneNumber', t, i18n)}
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

            {/* 图片编号 */}
            <input
              type="number"
              placeholder={getTranslation('imageNumber', t, i18n)}
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

            {/* 系列编号 */}
            <input
              type="text"
              placeholder={getTranslation('seriesNumber', t, i18n)}
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

          {/* 已选筛选器标签 */}
          {(selectedCategory || selectedTag || (mimeTypeFilter && mimeTypeFilter !== 'image') || groupNumber || sceneNumber || imageNumber || seriesNumber) && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {selectedCategory && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    backgroundColor: '#F6F4ED',
                    color: '#A08745',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  {getTranslation('category', t, i18n)}: {categories.find(c => String(c.id) === selectedCategory)?.name}
                  <button
                    onClick={() => {
                      setSelectedCategory('')
                      setPage(1)
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#A08745',
                      cursor: 'pointer',
                      padding: 0,
                      marginLeft: '4px',
                      fontSize: '14px',
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedTag && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    backgroundColor: '#F6F4ED',
                    color: '#A08745',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  {getTranslation('tag', t, i18n)}: {tags.find(tag => String(tag.id) === selectedTag)?.name}
                  <button
                    onClick={() => {
                      setSelectedTag('')
                      setPage(1)
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#A08745',
                      cursor: 'pointer',
                      padding: 0,
                      marginLeft: '4px',
                      fontSize: '14px',
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </span>
              )}
              {mimeTypeFilter && mimeTypeFilter !== 'image' && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    backgroundColor: '#F6F4ED',
                    color: '#A08745',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  {getTranslation('type', t, i18n)}: {mimeTypeFilter === 'video' ? getTranslation('videoType', t, i18n) : mimeTypeFilter === 'pdf' ? getTranslation('pdfType', t, i18n) : mimeTypeFilter}
                  <button
                    onClick={() => {
                      setMimeTypeFilter('image')
                      setPage(1)
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#A08745',
                      cursor: 'pointer',
                      padding: 0,
                      marginLeft: '4px',
                      fontSize: '14px',
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </span>
              )}
              {groupNumber && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    backgroundColor: '#F6F4ED',
                    color: '#A08745',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  {getTranslation('group', t, i18n)}: {groupNumber}
                  <button
                    onClick={() => {
                      setGroupNumber('')
                      setPage(1)
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#A08745',
                      cursor: 'pointer',
                      padding: 0,
                      marginLeft: '4px',
                      fontSize: '14px',
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </span>
              )}
              {sceneNumber && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    backgroundColor: '#F6F4ED',
                    color: '#A08745',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  {getTranslation('scene', t, i18n)}: {sceneNumber}
                  <button
                    onClick={() => {
                      setSceneNumber('')
                      setPage(1)
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#A08745',
                      cursor: 'pointer',
                      padding: 0,
                      marginLeft: '4px',
                      fontSize: '14px',
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </span>
              )}
              {imageNumber && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    backgroundColor: '#F6F4ED',
                    color: '#A08745',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  {getTranslation('image', t, i18n)}: {imageNumber}
                  <button
                    onClick={() => {
                      setImageNumber('')
                      setPage(1)
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#A08745',
                      cursor: 'pointer',
                      padding: 0,
                      marginLeft: '4px',
                      fontSize: '14px',
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </span>
              )}
              {seriesNumber && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    backgroundColor: '#F6F4ED',
                    color: '#A08745',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  {getTranslation('series', t, i18n)}: {seriesNumber}
                  <button
                    onClick={() => {
                      setSeriesNumber('')
                      setPage(1)
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#A08745',
                      cursor: 'pointer',
                      padding: 0,
                      marginLeft: '4px',
                      fontSize: '14px',
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
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
              {getTranslation('loading', t, i18n)}
            </div>
          ) : media.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              {getTranslation('noImagesFound', t, i18n)}
            </div>
          ) : viewMode === 'grid' ? (
            /* 网格视图 */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '12px',
              }}
            >
              {media.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelect(String(item.id))}
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '2px solid #e5e7eb',
                    transition: 'all 0.2s',
                    backgroundColor: '#ffffff',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#A08745'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(160, 135, 69, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* 图片区域 */}
                  <div style={{ aspectRatio: '1', position: 'relative', backgroundColor: '#f9fafb' }}>
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
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#9ca3af',
                        }}
                      >
                        <ImageIcon size={32} />
                      </div>
                    )}
                  </div>
                  {/* 文件名区域 */}
                  <div
                    style={{
                      padding: '8px',
                      borderTop: '1px solid #f3f4f6',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#374151',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={item.filename}
                    >
                      {item.filename}
                    </div>
                    {item.width && item.height && (
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                        {item.width} × {item.height}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 列表视图 */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {media.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelect(String(item.id))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: '#ffffff',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#A08745'
                    e.currentTarget.style.backgroundColor = '#FFFBEB'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.backgroundColor = '#ffffff'
                  }}
                >
                  {/* 缩略图 */}
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      backgroundColor: '#f9fafb',
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
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#9ca3af',
                        }}
                      >
                        <ImageIcon size={24} />
                      </div>
                    )}
                  </div>
                  {/* 文件信息 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#1f2937',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={item.filename}
                    >
                      {item.filename}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'flex', gap: '12px' }}>
                      {item.width && item.height && (
                        <span>{item.width} × {item.height}</span>
                      )}
                      {item.mimeType && (
                        <span>{item.mimeType.split('/')[1]?.toUpperCase()}</span>
                      )}
                    </div>
                    {item.alt && (
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                          marginTop: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Alt: {item.alt}
                      </div>
                    )}
                  </div>
                  {/* 选择指示 */}
                  <div
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#A08745',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 500,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                    className="select-indicator"
                  >
                    {getTranslation('select', t, i18n)}
                  </div>
                </div>
              ))}
              <style>{`
                div:hover > .select-indicator {
                  opacity: 1 !important;
                }
              `}</style>
            </div>
          )}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {/* 首页 */}
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={page === 1}
              title={getTranslation('firstPage', t, i18n)}
              style={{
                padding: '6px 10px',
                backgroundColor: page === 1 ? '#f3f4f6' : '#ffffff',
                color: page === 1 ? '#9ca3af' : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontSize: '13px',
              }}
            >
              «
            </button>
            {/* 上一页 */}
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '6px 12px',
                backgroundColor: page === 1 ? '#f3f4f6' : '#ffffff',
                color: page === 1 ? '#9ca3af' : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontSize: '13px',
              }}
            >
              {getTranslation('prevPage', t, i18n)}
            </button>

            {/* 页码按钮 */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {(() => {
                const pages: (number | string)[] = []
                const showPages = 5 // 最多显示的页码数
                let start = Math.max(1, page - Math.floor(showPages / 2))
                let end = Math.min(totalPages, start + showPages - 1)

                // 调整 start 如果 end 到达边界
                if (end - start + 1 < showPages) {
                  start = Math.max(1, end - showPages + 1)
                }

                // 添加第一页
                if (start > 1) {
                  pages.push(1)
                  if (start > 2) pages.push('...')
                }

                // 添加中间页码
                for (let i = start; i <= end; i++) {
                  pages.push(i)
                }

                // 添加最后一页
                if (end < totalPages) {
                  if (end < totalPages - 1) pages.push('...')
                  pages.push(totalPages)
                }

                return pages.map((p, idx) => (
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: '#9ca3af' }}>...</span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p as number)}
                      style={{
                        minWidth: '32px',
                        padding: '6px 10px',
                        backgroundColor: page === p ? '#A08745' : '#ffffff',
                        color: page === p ? 'white' : '#374151',
                        border: page === p ? '1px solid #A08745' : '1px solid #e5e7eb',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: page === p ? 600 : 400,
                        transition: 'all 0.15s',
                      }}
                    >
                      {p}
                    </button>
                  )
                ))
              })()}
            </div>

            {/* 下一页 */}
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: '6px 12px',
                backgroundColor: page === totalPages ? '#f3f4f6' : '#ffffff',
                color: page === totalPages ? '#9ca3af' : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '13px',
              }}
            >
              {getTranslation('nextPage', t, i18n)}
            </button>
            {/* 末页 */}
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              title={getTranslation('lastPage', t, i18n)}
              style={{
                padding: '6px 10px',
                backgroundColor: page === totalPages ? '#f3f4f6' : '#ffffff',
                color: page === totalPages ? '#9ca3af' : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '13px',
              }}
            >
              »
            </button>

            {/* 跳转输入 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>{getTranslation('jumpTo', t, i18n)}</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                defaultValue={page}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = parseInt((e.target as HTMLInputElement).value)
                    if (value >= 1 && value <= totalPages) {
                      setPage(value)
                    }
                  }
                }}
                onBlur={(e) => {
                  const value = parseInt(e.target.value)
                  if (value >= 1 && value <= totalPages && value !== page) {
                    setPage(value)
                  } else {
                    e.target.value = String(page)
                  }
                }}
                style={{
                  width: '50px',
                  padding: '6px 8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  fontSize: '13px',
                  textAlign: 'center',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '13px', color: '#6b7280' }}>{getTranslation('page', t, i18n)}</span>
              <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '4px' }}>
                {getTranslation('totalPages', t, i18n).replace('{total}', String(totalPages))}
              </span>
            </div>
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
            {getTranslation('cancel', t, i18n)}
          </button>
        </div>
      </div>
    </div>
  )
}

interface ImageGalleryComponentProps {
  className?: string
  format?: string
  nodeKey: string
  [key: string]: any
}

export const ImageGalleryComponent: React.FC<ImageGalleryComponentProps> = (props) => {
  const [editor] = useLexicalComposerContext()
  const [isEditing, setIsEditing] = useState(false)
  const { t, i18n } = useTranslation()

  // 尝试从不同的 props 获取数据
  const nodeData = (props as any).data || (props as any).node?.__data || (props as any).__data
  const nodeKey = props.nodeKey

  // 提供默认值，使用 useState 管理编辑状态
  const [formData, setFormData] = useState<ImageGalleryData>(
    nodeData || {
      images: [],
      layout: 'grid-3',
      spacing: 'normal',
      lightbox: true,
    },
  )

  // 添加图片状态
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null)
  const [tempImageId, setTempImageId] = useState<string>('')

  // 图片信息缓存
  const [imageCache, setImageCache] = useState<Record<string, MediaItem>>({})

  // 链接选择器状态
  const [showLinkPicker, setShowLinkPicker] = useState(false)
  const [linkPickerImageIndex, setLinkPickerImageIndex] = useState<number>(0)

  // 灯箱状态
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // 拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )


  // 当前显示的数据（编辑时用 formData，否则用原始 data）
  const data = isEditing ? formData : nodeData || formData

  // 同步外部 nodeData 变化到 formData（当不在编辑模式时）
  useEffect(() => {
    if (!isEditing && nodeData) {
      setFormData(nodeData)
    }
  }, [nodeData, isEditing])

  // 灯箱键盘事件
  useEffect(() => {
    if (!lightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false)
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex(prev => (prev > 0 ? prev - 1 : data.images.length - 1))
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex(prev => (prev < data.images.length - 1 ? prev + 1 : 0))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, data.images.length])

  // 打开灯箱
  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  // 加载图片信息
  useEffect(() => {
    const loadImageInfo = async () => {
      const imageIds = data.images
        .map(img => img.image)
        .filter(id => typeof id === 'string' && id && !imageCache[id])

      if (imageIds.length === 0) return

      try {
        const results = await Promise.all(
          imageIds.map(async (id) => {
            const res = await fetch(`/api/media/${id}?depth=0`)
            if (res.ok) {
              const mediaData = await res.json()
              return { id, data: mediaData }
            }
            return null
          })
        )

        const newCache = { ...imageCache }
        results.forEach(result => {
          if (result) {
            newCache[result.id] = result.data
          }
        })
        setImageCache(newCache)
      } catch (error) {
        console.error('Failed to load image info:', error)
      }
    }

    loadImageInfo()
  }, [data.images])

  // 保存编辑
  const handleSave = () => {
    console.log('💾 [handleSave] 保存数据:', formData)

    // 更新 Lexical node 的数据
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node && node instanceof ImageGalleryNode) {
        // 创建新的 node 替换旧的
        const newNode = $createImageGalleryNode(formData)
        node.replace(newNode)
        console.log('✅ [handleSave] Node 已更新')
      } else {
        console.error('❌ [handleSave] 找不到 node 或 node 类型错误', node)
      }
    })

    setIsEditing(false)
  }

  // 取消编辑
  const handleCancel = () => {
    setFormData(nodeData || formData)
    setIsEditing(false)
  }

  const handleAddImage = () => {
    // 先添加一个占位符
    const newIndex = formData.images.length
    setFormData({
      ...formData,
      images: [
        ...formData.images,
        {
          image: '', // 空字符串表示待选择
          caption: '',
        },
      ],
    })
    // 打开 picker 选择这个图片
    setEditingImageIndex(newIndex)
  }

  const handleSelectImage = (imageId: string) => {
    if (editingImageIndex !== null) {
      const newImages = [...formData.images]
      newImages[editingImageIndex] = {
        ...newImages[editingImageIndex],
        image: { id: imageId },
      }
      setFormData({ ...formData, images: newImages })
      setEditingImageIndex(null)
    }
  }

  const handleCancelSelectImage = () => {
    if (editingImageIndex !== null && !formData.images[editingImageIndex].image) {
      // 如果是新添加的空图片，取消时删除
      const newImages = formData.images.filter((_, i) => i !== editingImageIndex)
      setFormData({ ...formData, images: newImages })
    }
    setEditingImageIndex(null)
    setTempImageId('')
  }

  const handleConfirmSelectImage = () => {
    if (tempImageId.trim()) {
      handleSelectImage(tempImageId.trim())
      setTempImageId('')
    }
  }

  // 删除图片
  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    })
  }

  // 拖拽排序处理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = formData.images.findIndex((_, i) => `image-${i}` === active.id)
      const newIndex = formData.images.findIndex((_, i) => `image-${i}` === over.id)

      const newImages = arrayMove(formData.images, oldIndex, newIndex)
      setFormData({ ...formData, images: newImages })
    }
  }

  // 更新图片说明
  const handleUpdateCaption = (index: number, caption: string) => {
    const newImages = [...formData.images]
    newImages[index] = { ...newImages[index], caption }
    setFormData({ ...formData, images: newImages })
  }

  // 更新图片的任意字段
  const handleUpdateImageField = (index: number, field: string, value: any) => {
    const newImages = [...formData.images]
    newImages[index] = { ...newImages[index], [field]: value }
    setFormData({ ...formData, images: newImages })
  }

  // 打开链接选择器
  const openLinkPickerForImage = (index: number) => {
    setLinkPickerImageIndex(index)
    setShowLinkPicker(true)
  }

  // 链接选择回调
  const handleLinkSelect = (path: string) => {
    handleUpdateImageField(linkPickerImageIndex, 'linkUrl', path)
    setShowLinkPicker(false)
  }

  // 先显示简单的预览
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
          <strong style={{ color: '#374151', fontSize: '14px', fontWeight: 600 }}>{getTranslation('title', t, i18n)}</strong>
          <span style={{
            fontSize: '11px',
            color: '#9ca3af',
            backgroundColor: '#f3f4f6',
            padding: '2px 8px',
            borderRadius: '9999px',
          }}>
            {data.images.length} {getTranslation('images', t, i18n)}
          </span>
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
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8B7539'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A08745'}
              >
                {getTranslation('save', t, i18n)}
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
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              >
                {getTranslation('cancel', t, i18n)}
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
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#374151'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.color = '#374151'
              }}
            >
              {getTranslation('edit', t, i18n)}
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div
          style={{
            backgroundColor: 'white',
            padding: '16px',
            borderRadius: '4px',
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
              {getTranslation('layout', t, i18n)}
            </label>
            <select
              value={formData.layout}
              onChange={(e) =>
                setFormData({ ...formData, layout: e.target.value as ImageGalleryData['layout'] })
              }
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
              }}
            >
              <option value="grid-2">{getTranslation('grid2', t, i18n)}</option>
              <option value="grid-3">{getTranslation('grid3', t, i18n)}</option>
              <option value="grid-4">{getTranslation('grid4', t, i18n)}</option>
              <option value="masonry">{getTranslation('masonry', t, i18n)}</option>
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
              {getTranslation('spacing', t, i18n)}
            </label>
            <select
              value={formData.spacing}
              onChange={(e) =>
                setFormData({ ...formData, spacing: e.target.value as ImageGalleryData['spacing'] })
              }
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
              }}
            >
              <option value="small">{getTranslation('small', t, i18n)}</option>
              <option value="normal">{getTranslation('normal', t, i18n)}</option>
              <option value="large">{getTranslation('large', t, i18n)}</option>
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={formData.lightbox}
                onChange={(e) => setFormData({ ...formData, lightbox: e.target.checked })}
              />
              {getTranslation('enableLightbox', t, i18n)}
            </label>
          </div>

          {/* 图片列表 */}
          {formData.images.length > 0 && (
            <div style={{ marginTop: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                {getTranslation('addImage', t, i18n)}（{formData.images.length}{getTranslation('images', t, i18n)}）
              </div>
              {formData.images.map((item, index) => {
                const imageId = typeof item.image === 'string' ? item.image : item.image?.id || `temp-${index}`
                return (
                  <div
                    key={`edit-image-${imageId}-${index}`}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '12px',
                      marginBottom: '8px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '4px',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                  <div
                    onClick={() => setEditingImageIndex(index)}
                    style={{
                      width: '80px',
                      height: '80px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: '#6b7280',
                      flexShrink: 0,
                      cursor: 'pointer',
                      border: item.image ? '2px solid #A08745' : '2px solid #d1d5db',
                      transition: 'all 0.2s',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                    title={getTranslation('clickToSelect', t, i18n)}
                  >
                    {item.image && imageCache[item.image as string] ? (
                      <>
                        <img
                          src={imageCache[item.image as string].thumbnailURL || imageCache[item.image as string].url}
                          alt={imageCache[item.image as string].alt || ''}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'rgba(160, 135, 69, 0.9)',
                          color: 'white',
                          fontSize: '9px',
                          padding: '2px 4px',
                          textAlign: 'center',
                        }}>
                          {getTranslation('clickToChange', t, i18n)}
                        </div>
                      </>
                    ) : item.image ? (
                      <div style={{ textAlign: 'center', fontSize: '10px', padding: '4px' }}>
                        {getTranslation('loading', t, i18n)}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <ImageIcon size={20} style={{ color: '#9ca3af' }} />
                        <span style={{ fontSize: '10px' }}>{getTranslation('clickToSelect', t, i18n)}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder={getTranslation('imageCaption', t, i18n)}
                      value={item.caption || ''}
                      onChange={(e) => handleUpdateCaption(index, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px',
                      }}
                    />

                    {/* 启用链接 */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={item.enableLink || false}
                        onChange={(e) => handleUpdateImageField(index, 'enableLink', e.target.checked)}
                      />
                      {getTranslation('enableLink', t, i18n)}
                    </label>

                    {item.enableLink && (
                      <>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            value={item.linkUrl || ''}
                            onChange={(e) => handleUpdateImageField(index, 'linkUrl', e.target.value)}
                            placeholder={getTranslation('linkUrlPlaceholder', t, i18n)}
                            style={{
                              width: '100%',
                              padding: '6px 10px',
                              paddingRight: '30px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '13px',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => openLinkPickerForImage(index)}
                            title={getTranslation('selectInternalLink', t, i18n)}
                            style={{
                              position: 'absolute',
                              right: '6px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              padding: '2px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              color: '#6b7280',
                            }}
                          >
                            <LinkIcon size={14} />
                          </button>
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={item.openInNewTab || false}
                            onChange={(e) => handleUpdateImageField(index, 'openInNewTab', e.target.checked)}
                          />
                          {getTranslation('openInNewTab', t, i18n)}
                        </label>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    title={getTranslation('delete', t, i18n)}
                    style={{
                      padding: '6px',
                      backgroundColor: 'transparent',
                      color: '#9ca3af',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fee2e2'
                      e.currentTarget.style.color = '#ef4444'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#9ca3af'
                    }}
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              )
            })}
            </div>
          )}

          {/* 添加图片按钮 */}
          <button
            type="button"
            onClick={handleAddImage}
            style={{
              width: '100%',
              padding: '32px',
              backgroundColor: '#f9fafb',
              border: '2px dashed #A08745',
              borderRadius: '4px',
              textAlign: 'center',
              color: '#A08745',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F6F4ED'
              e.currentTarget.style.borderColor = '#8B7539'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb'
              e.currentTarget.style.borderColor = '#A08745'
            }}
          >
            <div>➕ {getTranslation('addImage', t, i18n)}</div>
            <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
              {getTranslation('currentImages', t, i18n)} {formData.images.length} {getTranslation('images', t, i18n)}
            </div>
          </button>
        </div>
      ) : (
        <div
          style={{
            ...(data.layout === 'masonry'
              ? {
                  // 真正的瀑布流 - 使用 CSS columns
                  columnCount: 3,
                  columnGap: data.spacing === 'small' ? '8px' : data.spacing === 'large' ? '24px' : '16px',
                }
              : {
                  // 网格布局
                  display: 'grid',
                  gridTemplateColumns:
                    data.layout === 'grid-2'
                      ? 'repeat(2, 1fr)'
                      : data.layout === 'grid-3'
                        ? 'repeat(3, 1fr)'
                        : 'repeat(4, 1fr)',
                  gap: data.spacing === 'small' ? '8px' : data.spacing === 'large' ? '24px' : '16px',
                }),
          }}
        >
          {data.images.length === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                padding: '40px',
                textAlign: 'center',
                color: '#9ca3af',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '2px dashed #d1d5db',
              }}
            >
              <p style={{ margin: 0, fontSize: '14px' }}>{getTranslation('noImages', t, i18n)}</p>
              <p style={{ fontSize: '12px', marginTop: '8px', margin: 0 }}>{getTranslation('clickEditToAdd', t, i18n)}</p>
            </div>
          ) : (
            data.images.map((item, index) => {
              const imageData = item.image ? imageCache[item.image as string] : null
              const imageId = typeof item.image === 'string' ? item.image : item.image?.id || `temp-${index}`
              return (
                <div
                  key={`preview-image-${imageId}-${index}`}
                  onClick={() => imageData && data.lightbox && openLightbox(index)}
                  style={{
                    position: 'relative',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    cursor: imageData && data.lightbox ? 'pointer' : 'default',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    // 瀑布流专用样式
                    ...(data.layout === 'masonry'
                      ? {
                          breakInside: 'avoid',
                          marginBottom: data.spacing === 'small' ? '8px' : data.spacing === 'large' ? '24px' : '16px',
                          display: 'inline-block',
                          width: '100%',
                        }
                      : {
                          // 网格布局使用固定宽高比
                          aspectRatio: '1',
                        }),
                  }}
                  onMouseEnter={(e) => {
                    if (imageData && data.lightbox) {
                      e.currentTarget.style.transform = 'scale(1.02)'
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (imageData && data.lightbox) {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }
                  }}
                >
                  {imageData ? (
                    <>
                      <img
                        src={imageData.url}
                        alt={item.caption || imageData.alt || `图片 ${index + 1}`}
                        style={{
                          width: '100%',
                          height: data.layout === 'masonry' ? 'auto' : '100%',
                          objectFit: data.layout === 'masonry' ? 'contain' : 'cover',
                          display: 'block',
                        }}
                      />
                      {item.caption && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                            color: 'white',
                            padding: '12px 16px',
                            fontSize: '13px',
                            lineHeight: 1.4,
                          }}
                        >
                          {item.caption}
                        </div>
                      )}
                      {data.lightbox && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            borderRadius: '4px',
                            padding: '6px',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ZoomIn size={16} strokeWidth={2.5} />
                        </div>
                      )}
                    </>
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9ca3af',
                        fontSize: '12px',
                        padding: '20px',
                      }}
                    >
                      <ImageIcon size={24} style={{ marginBottom: '8px', color: '#9ca3af' }} />
                      <div>{getTranslation('loading', t, i18n)}</div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* MediaPicker 集成弹窗 */}
      {editingImageIndex !== null && (
        <MediaPickerModal
          isOpen={true}
          onClose={handleCancelSelectImage}
          onSelect={(mediaId: string) => {
            const updatedImages = [...formData.images]
            updatedImages[editingImageIndex] = {
              ...updatedImages[editingImageIndex],
              image: mediaId,
            }
            setFormData({ ...formData, images: updatedImages })
            setEditingImageIndex(null)
            setTempImageId('')
          }}
          imageIndex={editingImageIndex}
          t={t}
          i18n={i18n}
        />
      )}

      {/* 链接选择器弹窗 */}
      {showLinkPicker && (
        <LinkPickerModal
          isOpen={showLinkPicker}
          onClose={() => setShowLinkPicker(false)}
          onSelect={handleLinkSelect}
        />
      )}

      {/* 灯箱弹窗 */}
      {lightboxOpen && data.images[lightboxIndex] && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}
          onClick={() => setLightboxOpen(false)}
        >
          {/* 关闭按钮 */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          >
            ×
          </button>

          {/* 左箭头 */}
          {data.images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex(prev => (prev > 0 ? prev - 1 : data.images.length - 1))
              }}
              style={{
                position: 'absolute',
                left: '20px',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                fontSize: '30px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            >
              ‹
            </button>
          )}

          {/* 右箭头 */}
          {data.images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex(prev => (prev < data.images.length - 1 ? prev + 1 : 0))
              }}
              style={{
                position: 'absolute',
                right: '20px',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                fontSize: '30px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            >
              ›
            </button>
          )}

          {/* 图片容器 */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            {(() => {
              const currentImage = data.images[lightboxIndex]
              const imageData = currentImage?.image ? imageCache[currentImage.image as string] : null

              return (
                <>
                  {imageData && (
                    <img
                      src={imageData.url}
                      alt={currentImage.caption || imageData.alt || `图片 ${lightboxIndex + 1}`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: 'calc(90vh - 100px)',
                        objectFit: 'contain',
                        borderRadius: '8px',
                      }}
                    />
                  )}

                  {/* 图片信息 */}
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    {currentImage?.caption && (
                      <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                        {currentImage.caption}
                      </div>
                    )}
                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                      {lightboxIndex + 1} / {data.images.length}
                    </div>
                    {imageData && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                        {imageData.width} × {imageData.height}
                        {imageData.filesize && ` • ${Math.round(imageData.filesize / 1024)} KB`}
                      </div>
                    )}
                  </div>
                </>
              )
            })()}
          </div>

          {/* 键盘提示 */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '12px',
              color: '#9ca3af',
              display: 'flex',
              gap: '20px',
            }}
          >
            <span>← → {getTranslation('switch', t, i18n)}</span>
            <span>{getTranslation('escClose', t, i18n)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
