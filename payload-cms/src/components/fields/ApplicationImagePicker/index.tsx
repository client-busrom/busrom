'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useField, useTranslation } from '@payloadcms/ui'
import MediaPicker from '../MediaPicker'
import './styles.scss'

interface ApplicationImagePickerProps {
  path: string
  field: {
    name: string
    label?: string | Record<string, string>
  }
}

interface StoredValue {
  mode: 'manual' | 'application'
  manualImage?: number | null
  applicationId?: string | number | null
}

const i18n = {
  manualSelect: { en: 'Manual Select', zh: '手动选择' },
  randomFromApp: { en: 'Random from Application', zh: '案例图集随机' },
  selectImage: { en: 'Select Image', zh: '选择图片' },
  selectApp: { en: '-- Select an Application --', zh: '-- 选择一个案例图集 --' },
  searchPlaceholder: { en: 'Search slug or name...', zh: '搜索 slug 或名称...' },
  noMatch: { en: 'No matching results', zh: '无匹配结果' },
  noApps: { en: 'No applications found', zh: '暂无案例图集' },
  loading: { en: 'Loading...', zh: '加载中...' },
  loadMore: { en: 'Scroll to load more', zh: '滚动加载更多' },
  totalPrefix: { en: 'Total ', zh: '共 ' },
  totalSuffix: { en: ' items', zh: ' 条' },
  hint1: { en: 'The system will randomly select an image from the scenes of the selected application gallery each time.', zh: '系统将每次从所选案例图集的场景中随机选择一张图片。' },
  previewTitle: { en: 'Preview (Random Example)', zh: '预览（随机示例）' },
  selectToPreview: { en: 'Please select an application gallery to view preview', zh: '请选择一个案例图集以查看预览' },
  noImages: { en: 'No images available in this application gallery', zh: '该案例图集暂无图片' },
  hint2: { en: 'Note: The preview is a random example, the actual display will re-select randomly each time.', zh: '注：预览为随机示例，实际展示时每次都会重新随机选择。' },
}

export const ApplicationImagePicker: React.FC<ApplicationImagePickerProps> = ({ path, field }) => {
  const { value, setValue } = useField<StoredValue>({ path })
  const { i18n: { language } } = useTranslation()
  const t = (obj: { en: string; zh: string }) => language === 'zh' ? obj.zh : obj.en

  const [mode, setMode] = useState<'manual' | 'application'>(value?.mode || 'manual')
  const [selectedImage, setSelectedImage] = useState<number | null>(value?.manualImage || null)
  const [selectedApplication, setSelectedApplication] = useState<string | number | null>(value?.applicationId || null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [applications, setApplications] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalDocs, setTotalDocs] = useState(0)

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [previewImage, setPreviewImage] = useState<any | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  // Search applications via API
  const searchApplications = useCallback(async (query: string, pageNum: number = 1, append: boolean = false) => {
    setIsSearching(true)
    try {
      const whereClauses: string[] = ['where[status][equals]=published']

      if (query.trim()) {
        // Use 'or' to search slug or name
        whereClauses.push(
          `where[or][0][slug][contains]=${encodeURIComponent(query)}`,
          `where[or][1][name][contains]=${encodeURIComponent(query)}`
        )
      }

      const res = await fetch(
        `/api/applications?limit=20&page=${pageNum}&depth=0&${whereClauses.join('&')}`
      )
      if (res.ok) {
        const data = await res.json()
        const docs = data.docs || []
        setTotalDocs(data.totalDocs || 0)
        setHasMore(data.hasNextPage || false)

        if (append) {
          setApplications(prev => {
            const existingIds = new Set(prev.map(a => a.id))
            const newDocs = docs.filter((d: any) => !existingIds.has(d.id))
            return [...prev, ...newDocs]
          })
        } else {
          setApplications(docs)
        }
      }
    } catch (error) {
      console.error('Error searching applications:', error)
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounced search
  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1)
      searchApplications(query, 1, false)
    }, 300)
  }, [searchApplications])

  // Load when dropdown opens - always refresh on open
  const wasOpenRef = useRef(false)
  useEffect(() => {
    if (isDropdownOpen && !wasOpenRef.current) {
      wasOpenRef.current = true
      // Keep selected app, load fresh data around it
      searchApplications(searchQuery, 1, false)
    } else if (!isDropdownOpen) {
      wasOpenRef.current = false
    }
  }, [isDropdownOpen, searchApplications])

  // Load selected application info for display
  useEffect(() => {
    if (selectedApplication && !applications.find(a => String(a.id) === String(selectedApplication))) {
      // Fetch the selected app to show its name
      const loadSelected = async () => {
        try {
          const res = await fetch(`/api/applications/${selectedApplication}?depth=0`)
          if (res.ok) {
            const app = await res.json()
            setApplications(prev => {
              if (prev.find(a => a.id === app.id)) return prev
              return [app, ...prev]
            })
          }
        } catch (e) {
          console.error('Error loading selected application:', e)
        }
      }
      loadSelected()
    }
  }, [selectedApplication, applications])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setSearchQuery('')
        // Keep selected app in list, clear the rest
        setApplications(prev => {
          const selected = prev.find(a => String(a.id) === String(selectedApplication))
          return selected ? [selected] : []
        })
        setPage(1)
        setHasMore(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectedApplication])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Sync form value when state changes
  useEffect(() => {
    const newValue: StoredValue = {
      mode,
      manualImage: mode === 'manual' ? selectedImage : null,
      applicationId: mode === 'application' ? selectedApplication : null,
    }
    setValue(newValue)
  }, [mode, selectedImage, selectedApplication, setValue])

  // Load preview for application mode
  const loadPreview = useCallback(async () => {
    if (mode !== 'application' || !selectedApplication) {
      setPreviewImage(null)
      return
    }

    setIsLoadingPreview(true)
    try {
      const res = await fetch(`/api/applications/${selectedApplication}?depth=1`)
      if (res.ok) {
        const app = await res.json()
        const allImages = (app.sceneGallery || []).flatMap((scene: any) => scene.images || [])
        const uniqueImages = Array.from(new Map(allImages.map((img: any) => [img.id, img])).values())

        if (uniqueImages.length > 0) {
          const randomIndex = Math.floor(Math.random() * uniqueImages.length)
          const img = uniqueImages[randomIndex] as any
          setPreviewImage({
            ...img,
            thumbnailURL: img.sizes?.thumbnail?.url || img.sizes?.card?.url || img.url,
          })
        } else {
          setPreviewImage(null)
        }
      }
    } catch (error) {
      console.error('Error loading preview:', error)
    } finally {
      setIsLoadingPreview(false)
    }
  }, [mode, selectedApplication])

  useEffect(() => {
    if (mode === 'application') {
      loadPreview()
    }
  }, [mode, selectedApplication, loadPreview])

  const getLabel = () => {
    if (typeof field.label === 'object') {
      const lang = language;
      return field.label[lang] || 'Image'
    }
    if (typeof field.label === 'string') return field.label
    return 'Image'
  }

  const selectedApp = applications.find((app) => String(app.id) === String(selectedApplication))

  // Handle scroll to load more
  const handleListScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20 && hasMore && !isSearching) {
      const nextPage = page + 1
      setPage(nextPage)
      searchApplications(searchQuery, nextPage, true)
    }
  }, [hasMore, isSearching, page, searchQuery, searchApplications])

  return (
    <div className="application-image-picker">
      <label className="application-image-picker__label">
        {getLabel()}
      </label>

      {/* Mode selector */}
      <div className="application-image-picker__mode-selector">
        <button
          type="button"
          className={mode === 'manual' ? 'active' : ''}
          onClick={() => setMode('manual')}
        >
          {t(i18n.manualSelect)}
        </button>
        <button
          type="button"
          className={mode === 'application' ? 'active' : ''}
          onClick={() => setMode('application')}
        >
          {t(i18n.randomFromApp)}
        </button>
      </div>

      {/* Manual mode: single image picker */}
      {mode === 'manual' && (
        <div className="application-image-picker__manual">
          <MediaPicker
            path={`${path}.manualImage`}
            field={{
              name: 'manualImage',
              label: t(i18n.selectImage),
              hasMany: false,
              relationTo: 'media',
            }}
            value={selectedImage}
            onChange={(val) => setSelectedImage(val as number | null)}
          />
        </div>
      )}

      {/* Application mode: select from applications */}
      {mode === 'application' && (
        <div className="application-image-picker__application">
          <div className="application-image-picker__select-wrapper" ref={dropdownRef}>
            <div
              className="application-image-picker__dropdown-trigger"
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen)
                if (!isDropdownOpen) {
                  setTimeout(() => searchInputRef.current?.focus(), 50)
                }
              }}
            >
              <span className={selectedApp ? '' : 'placeholder'}>
                {selectedApp ? selectedApp.slug : t(i18n.selectApp)}
              </span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={isDropdownOpen ? 'open' : ''}>
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {isDropdownOpen && (
              <div className="application-image-picker__dropdown-menu">
                <div className="application-image-picker__dropdown-search">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t(i18n.searchPlaceholder)}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      debouncedSearch(e.target.value)
                    }}
                    autoFocus
                  />
                  {isSearching && (
                    <span className="application-image-picker__search-spinner" />
                  )}
                </div>
                <div
                  className="application-image-picker__dropdown-list"
                  onScroll={handleListScroll}
                >
                  {applications.length === 0 && !isSearching ? (
                    <div className="application-image-picker__dropdown-empty">
                      {searchQuery ? t(i18n.noMatch) : t(i18n.noApps)}
                    </div>
                  ) : (
                    <>
                      {applications.map((app) => (
                        <div
                          key={app.id}
                          className={`application-image-picker__dropdown-item ${String(app.id) === String(selectedApplication) ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedApplication(app.id)
                            setIsDropdownOpen(false)
                            setSearchQuery('')
                            // Keep selected app in list for next open
                            setApplications([app])
                            setPage(1)
                            setHasMore(false)
                          }}
                        >
                          <span className="application-image-picker__dropdown-item-slug">{app.slug}</span>
                          {app.name && app.name !== app.slug && (
                            <span className="application-image-picker__dropdown-item-name">{app.name}</span>
                          )}
                        </div>
                      ))}
                      {isSearching && (
                        <div className="application-image-picker__dropdown-loading">{t(i18n.loading)}</div>
                      )}
                      {!isSearching && hasMore && (
                        <div className="application-image-picker__dropdown-more">{t(i18n.loadMore)}</div>
                      )}
                    </>
                  )}
                </div>
                {totalDocs > 0 && (
                  <div className="application-image-picker__dropdown-footer">
                    {t(i18n.totalPrefix)}{totalDocs}{t(i18n.totalSuffix)}
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="application-image-picker__hint">
            {t(i18n.hint1)}
          </p>

          {/* Preview */}
          <div className="application-image-picker__preview">
            <h5>{t(i18n.previewTitle)}</h5>
            {isLoadingPreview ? (
              <p className="application-image-picker__loading">{t(i18n.loading)}</p>
            ) : !selectedApplication ? (
              <p className="application-image-picker__empty">{t(i18n.selectToPreview)}</p>
            ) : previewImage ? (
              <div className="application-image-picker__preview-item">
                <img
                  src={previewImage.thumbnailURL || previewImage.url}
                  alt={previewImage.alt || previewImage.filename}
                />
                <p>{previewImage.filename}</p>
              </div>
            ) : (
              <p className="application-image-picker__empty">{t(i18n.noImages)}</p>
            )}
            <p className="application-image-picker__hint">
              {t(i18n.hint2)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplicationImagePicker
