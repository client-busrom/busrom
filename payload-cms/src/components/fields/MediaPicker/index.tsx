'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useField, useLocale, useTranslation } from '@payloadcms/ui'
import { fetchMediaCategories, fetchMediaTags } from '../../../lib/media-filters-cache'
import { fetchMediaItems } from '../../../lib/media-cache'
import './styles.scss'

interface MediaItem {
  id: number
  filename: string
  url: string
  thumbnailURL?: string
  alt?: string
  width?: number
  height?: number
  mimeType?: string
  filesize?: number
  createdAt?: string
  primaryCategory?: {
    id: number
    name: string
    displayName?: string
  }
  tags?: Array<{
    id: number
    name: string
  }>
}

interface MediaCategory {
  id: number
  name: string
  displayName?: string
}

interface MediaTag {
  id: number
  name: string
  type?: string
}

interface MediaPickerProps {
  path: string
  field: {
    name: string
    label?: string | Record<string, string>
    hasMany?: boolean
    relationTo?: string
    required?: boolean
  }
}

// Format file size
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const MediaPicker: React.FC<MediaPickerProps> = ({ path, field }) => {
  const { value, setValue } = useField<number | number[] | null>({ path })
  const locale = useLocale()
  const { t, i18n } = useTranslation()
  const adminLang = i18n.language // Admin UI language (from account settings)

  const [isOpen, setIsOpen] = useState(false)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [tagFilter, setTagFilter] = useState<string>('')
  const [mimeTypeFilter, setMimeTypeFilter] = useState<string>('')
  const [groupFilter, setGroupFilter] = useState<string>('')
  const [sceneNumberFilter, setSceneNumberFilter] = useState<string>('')
  const [seriesNumberFilter, setSeriesNumberFilter] = useState<string>('')
  const [categories, setCategories] = useState<MediaCategory[]>([])
  const [tags, setTags] = useState<MediaTag[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDocs, setTotalDocs] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortField, setSortField] = useState<string>('-createdAt')

  const hasMany = field.hasMany ?? false

  // Fetch categories and tags on mount (using shared cache)
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [categories, tags] = await Promise.all([
          fetchMediaCategories(),
          fetchMediaTags(),
        ])
        setCategories(categories)
        setTags(tags)
      } catch (error) {
        console.error('Failed to load filters:', error)
      }
    }
    loadFilters()
  }, [])

  // Fetch selected media when value changes (using shared cache)
  useEffect(() => {
    const loadSelectedMedia = async () => {
      if (!value) {
        setSelectedMedia([])
        return
      }

      const ids = Array.isArray(value) ? value : [value]
      if (ids.length === 0) {
        setSelectedMedia([])
        return
      }

      try {
        const items = await fetchMediaItems(ids)
        setSelectedMedia(items)
      } catch (error) {
        console.error('Failed to load selected media:', error)
        setSelectedMedia([])
      }
    }
    loadSelectedMedia()
  }, [value])

  // Fetch media with filters
  const fetchMedia = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '24',
        page: page.toString(),
        sort: sortField,
        depth: '1',
      })

      // Build where query
      const whereConditions: string[] = []

      if (search) {
        whereConditions.push(`where[filename][contains]=${encodeURIComponent(search)}`)
      }

      if (categoryFilter) {
        whereConditions.push(`where[primaryCategory][equals]=${categoryFilter}`)
      }

      if (tagFilter) {
        whereConditions.push(`where[tags][in]=${tagFilter}`)
      }

      if (mimeTypeFilter) {
        whereConditions.push(`where[mimeType][contains]=${encodeURIComponent(mimeTypeFilter)}`)
      }

      if (groupFilter) {
        whereConditions.push(`where[metadata.group][equals]=${groupFilter}`)
      }

      if (sceneNumberFilter) {
        whereConditions.push(`where[metadata.sceneNumber][equals]=${sceneNumberFilter}`)
      }

      if (seriesNumberFilter) {
        whereConditions.push(`where[metadata.specs.key][equals]=series`)
        whereConditions.push(`where[metadata.specs.value][equals]=${encodeURIComponent(seriesNumberFilter)}`)
      }

      // Only show active media
      whereConditions.push(`where[status][equals]=active`)

      const queryString = whereConditions.length > 0
        ? `${params.toString()}&${whereConditions.join('&')}`
        : params.toString()

      const res = await fetch(`/api/media?${queryString}`)
      const data = await res.json()

      setMedia(data.docs || [])
      setTotalPages(data.totalPages || 1)
      setTotalDocs(data.totalDocs || 0)
    } catch (error) {
      console.error('Failed to fetch media:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, categoryFilter, tagFilter, mimeTypeFilter, groupFilter, sceneNumberFilter, seriesNumberFilter, sortField])

  // Fetch media when modal opens or filters change
  useEffect(() => {
    if (isOpen) {
      fetchMedia()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, page, search, categoryFilter, tagFilter, mimeTypeFilter, groupFilter, sceneNumberFilter, seriesNumberFilter, sortField])

  const handleSelect = (item: MediaItem) => {
    if (hasMany) {
      const isSelected = selectedMedia.some(m => m.id === item.id)
      if (isSelected) {
        const newSelected = selectedMedia.filter(m => m.id !== item.id)
        setSelectedMedia(newSelected)
        setValue(newSelected.map(m => m.id))
      } else {
        const newSelected = [...selectedMedia, item]
        setSelectedMedia(newSelected)
        setValue(newSelected.map(m => m.id))
      }
    } else {
      setSelectedMedia([item])
      setValue(item.id)
      setIsOpen(false)
    }
  }

  const handleRemove = (id: number) => {
    const newSelected = selectedMedia.filter(m => m.id !== id)
    setSelectedMedia(newSelected)
    if (hasMany) {
      setValue(newSelected.length > 0 ? newSelected.map(m => m.id) : null)
    } else {
      setValue(null)
    }
  }

  const handleConfirm = () => {
    setIsOpen(false)
  }

  const handleClearFilters = () => {
    setSearch('')
    setCategoryFilter('')
    setTagFilter('')
    setMimeTypeFilter('')
    setGroupFilter('')
    setSceneNumberFilter('')
    setSeriesNumberFilter('')
    setPage(1)
  }

  const getLabel = () => {
    if (typeof field.label === 'string') return field.label
    if (typeof field.label === 'object') return field.label[adminLang] || field.label['en'] || field.name
    return field.name
  }

  return (
    <div className="media-picker">
      <label className="media-picker__label">
        {getLabel()}
        {field.required && <span className="required">*</span>}
      </label>

      {/* Selected Media Preview */}
      <div className="media-picker__selected">
        {selectedMedia.map((item) => (
          <div key={item.id} className="media-picker__selected-item">
            <img
              src={item.thumbnailURL || item.url}
              alt={item.alt || item.filename}
            />
            <div className="media-picker__selected-info">
              <span className="filename" title={item.filename}>{item.filename}</span>
              {item.width && item.height && (
                <span className="dimensions">{item.width}×{item.height}</span>
              )}
            </div>
            <button
              type="button"
              className="media-picker__remove"
              onClick={() => handleRemove(item.id)}
              title={t('custom:mediaPicker:removeMedia' as any) as string}
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          className="media-picker__add"
          onClick={() => setIsOpen(true)}
        >
          {selectedMedia.length > 0
            ? (hasMany ? `+ ${t('custom:mediaPicker:addMore' as any)}` : t('custom:mediaPicker:changeImage' as any))
            : `+ ${t('custom:mediaPicker:selectImage' as any)}`}
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="media-picker__modal" onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}>
          <div className="media-picker__modal-content">
            <div className="media-picker__modal-header">
              <h3>{t('custom:mediaPicker:selectMediaFiles' as any)}</h3>
              <div className="media-picker__header-actions">
                <button
                  type="button"
                  className={`media-picker__view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title={t('custom:mediaPicker:gridView' as any) as string}
                >
                  ▦
                </button>
                <button
                  type="button"
                  className={`media-picker__view-toggle ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title={t('custom:mediaPicker:listView' as any) as string}
                >
                  ☰
                </button>
                <button
                  type="button"
                  className="media-picker__close"
                  onClick={() => setIsOpen(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="media-picker__filters">
              <input
                type="text"
                placeholder="搜索文件名..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="media-picker__search"
              />

              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setPage(1)
                }}
                className="media-picker__filter-select"
              >
                <option value="">所有分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.displayName || cat.name}
                  </option>
                ))}
              </select>

              <select
                value={tagFilter}
                onChange={(e) => {
                  setTagFilter(e.target.value)
                  setPage(1)
                }}
                className="media-picker__filter-select"
              >
                <option value="">所有标签</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name} {tag.type ? `(${tag.type})` : ''}
                  </option>
                ))}
              </select>

              <select
                value={mimeTypeFilter}
                onChange={(e) => {
                  setMimeTypeFilter(e.target.value)
                  setPage(1)
                }}
                className="media-picker__filter-select"
              >
                <option value="">所有类型</option>
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
                <option value="image/svg">SVG</option>
                <option value="image/gif">GIF</option>
              </select>

              <select
                value={sortField}
                onChange={(e) => {
                  setSortField(e.target.value)
                  setPage(1)
                }}
                className="media-picker__filter-select"
              >
                <option value="-createdAt">最新上传</option>
                <option value="createdAt">最早上传</option>
                <option value="filename">文件名 A-Z</option>
                <option value="-filename">文件名 Z-A</option>
                <option value="-filesize">文件大小 ↓</option>
                <option value="filesize">文件大小 ↑</option>
              </select>

              <input
                type="number"
                placeholder="场景分组..."
                value={groupFilter}
                onChange={(e) => {
                  setGroupFilter(e.target.value)
                  setPage(1)
                }}
                className="media-picker__filter-input"
              />

              <input
                type="number"
                placeholder="场景编号..."
                value={sceneNumberFilter}
                onChange={(e) => {
                  setSceneNumberFilter(e.target.value)
                  setPage(1)
                }}
                className="media-picker__filter-input"
              />

              <input
                type="text"
                placeholder="产品系列编号..."
                value={seriesNumberFilter}
                onChange={(e) => {
                  setSeriesNumberFilter(e.target.value)
                  setPage(1)
                }}
                className="media-picker__filter-input"
              />

              {(search || categoryFilter || tagFilter || mimeTypeFilter || groupFilter || sceneNumberFilter || seriesNumberFilter) && (
                <button
                  type="button"
                  className="media-picker__clear-filters"
                  onClick={handleClearFilters}
                >
                  {t('custom:mediaPicker:clearFilters' as any)}
                </button>
              )}
            </div>

            {/* Stats bar */}
            <div className="media-picker__stats">
              <span>共 {totalDocs} 个文件</span>
              {hasMany && selectedMedia.length > 0 && (
                <span className="media-picker__stats-selected">
                  已选择 {selectedMedia.length} 个
                </span>
              )}
            </div>

            {/* Media Grid/List */}
            <div className={`media-picker__content ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
              {loading ? (
                <div className="media-picker__loading">加载中...</div>
              ) : media.length === 0 ? (
                <div className="media-picker__empty">没有找到媒体文件</div>
              ) : viewMode === 'grid' ? (
                <div className="media-picker__grid">
                  {media.map((item) => {
                    const isSelected = selectedMedia.some(m => m.id === item.id)
                    return (
                      <div
                        key={item.id}
                        className={`media-picker__item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelect(item)}
                      >
                        <img
                          src={item.thumbnailURL || item.url}
                          alt={item.alt || item.filename}
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="media-picker__check">✓</div>
                        )}
                        <div className="media-picker__item-name">
                          {item.filename}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <table className="media-picker__table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}></th>
                      <th style={{ width: '60px' }}>预览</th>
                      <th>文件名</th>
                      <th style={{ width: '100px' }}>尺寸</th>
                      <th style={{ width: '80px' }}>大小</th>
                      <th style={{ width: '120px' }}>分类</th>
                      <th style={{ width: '100px' }}>类型</th>
                    </tr>
                  </thead>
                  <tbody>
                    {media.map((item) => {
                      const isSelected = selectedMedia.some(m => m.id === item.id)
                      return (
                        <tr
                          key={item.id}
                          className={isSelected ? 'selected' : ''}
                          onClick={() => handleSelect(item)}
                        >
                          <td>
                            <div className={`media-picker__checkbox ${isSelected ? 'checked' : ''}`}>
                              {isSelected && '✓'}
                            </div>
                          </td>
                          <td>
                            <img
                              src={item.thumbnailURL || item.url}
                              alt={item.filename}
                              className="media-picker__table-thumb"
                            />
                          </td>
                          <td className="media-picker__table-filename" title={item.filename}>
                            {item.filename}
                          </td>
                          <td>{item.width && item.height ? `${item.width}×${item.height}` : '-'}</td>
                          <td>{formatFileSize(item.filesize)}</td>
                          <td>{item.primaryCategory?.displayName || item.primaryCategory?.name || '-'}</td>
                          <td>{item.mimeType?.split('/')[1]?.toUpperCase() || '-'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="media-picker__pagination">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                >
                  {t('custom:mediaPicker:firstPage' as any)}
                </button>
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  {t('custom:mediaPicker:prevPage' as any)}
                </button>
                <span>{t('custom:mediaPicker:page' as any)} {page} / {totalPages} {t('custom:mediaPicker:of' as any)}</span>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  {t('custom:mediaPicker:nextPage' as any)}
                </button>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage(totalPages)}
                >
                  {t('custom:mediaPicker:lastPage' as any)}
                </button>
              </div>
            )}

            {/* Footer */}
            {hasMany && (
              <div className="media-picker__footer">
                <span>{t('custom:mediaPicker:selected' as any)} {selectedMedia.length} {t('custom:mediaPicker:files' as any)}</span>
                <button
                  type="button"
                  className="media-picker__confirm"
                  onClick={handleConfirm}
                >
                  {t('custom:mediaPicker:confirm' as any)}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MediaPicker
