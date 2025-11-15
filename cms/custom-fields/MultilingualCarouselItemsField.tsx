/**
 * Multilingual Carousel Items Field
 *
 * This field manages carousel items with multilingual support.
 * Data structure:
 * {
 *   en: [
 *     {
 *       isShow: true,
 *       title: "Title",
 *       image: "media-id",
 *       sceneImage: "media-id",
 *       buttonText: "Click me",
 *       linkUrl: "/link"
 *     }
 *   ],
 *   zh: [...],
 *   ...
 * }
 *
 * Features:
 * - Multilingual support (24 languages)
 * - Drag and drop to reorder items within each language
 * - Add/Remove/Edit items per language
 * - Visibility toggle (isShow)
 * - Media selector for images
 * - Auto-translation support
 */

import React, { useState, useEffect } from 'react'
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields'
import { FieldController, FieldProps } from '@keystone-6/core/types'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'
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

// Language configuration
const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'da', label: 'Dansk', flag: '🇩🇰' },
  { code: 'no', label: 'Norsk', flag: '🇳🇴' },
  { code: 'fi', label: 'Suomi', flag: '🇫🇮' },
  { code: 'is', label: 'Íslenska', flag: '🇮🇸' },
  { code: 'cs', label: 'Čeština', flag: '🇨🇿' },
  { code: 'hu', label: 'Magyar', flag: '🇭🇺' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'sk', label: 'Slovenčina', flag: '🇸🇰' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'he', label: 'עברית', flag: '🇮🇱' },
  { code: 'fa', label: 'فارسی', flag: '🇮🇷' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'ber', label: 'Tamazight', flag: '🏴' },
  { code: 'ku', label: 'Kurdî', flag: '🟡' },
]

// GraphQL query to get all Media items with filtering
const GET_MEDIA_LIST = gql`
  query GetMediaList($where: MediaWhereInput, $take: Int, $skip: Int) {
    mediaFiles(
      where: $where
      take: $take
      skip: $skip
      orderBy: { createdAt: desc }
    ) {
      id
      filename
      file {
        url
      }
      variants
      primaryCategory {
        id
        displayName
      }
      tags {
        id
        slug
        name
      }
    }
    mediaFilesCount(where: $where)
  }
`

// GraphQL query to get all MediaCategories
const GET_MEDIA_CATEGORIES = gql`
  query GetMediaCategories {
    mediaCategories(orderBy: { order: asc }) {
      id
      slug
      displayName
    }
  }
`

// GraphQL query to get all MediaTags
const GET_MEDIA_TAGS = gql`
  query GetMediaTags {
    mediaTags(orderBy: { order: asc }) {
      id
      slug
      name
      type
    }
  }
`

// GraphQL query to get a single media item
const GET_MEDIA_BY_ID = gql`
  query GetMediaById($id: ID!) {
    media(where: { id: $id }) {
      id
      filename
      file {
        url
      }
      variants
    }
  }
`

// Carousel Item Structure
interface CarouselItem {
  isShow: boolean
  title: string
  image: string // Media ID
  sceneImage: string // Media ID
  buttonText: string
  linkUrl: string
}

// Full data structure (multilingual)
type MultilingualCarouselItems = Record<string, CarouselItem[]>

// Media Selector Modal Component
interface MediaSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (mediaId: string) => void
}

const MediaSelectorModal: React.FC<MediaSelectorProps> = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const pageSize = 20

  // Fetch categories and tags
  const { data: categoriesData } = useQuery(GET_MEDIA_CATEGORIES, { skip: !isOpen })
  const { data: tagsData } = useQuery(GET_MEDIA_TAGS, { skip: !isOpen })

  // Build where clause dynamically
  const buildWhereClause = () => {
    const conditions: any[] = []

    if (searchTerm) {
      conditions.push({ filename: { contains: searchTerm, mode: 'insensitive' } })
    }

    if (selectedCategory) {
      conditions.push({ primaryCategory: { id: { equals: selectedCategory } } })
    }

    if (selectedTags.length > 0) {
      conditions.push({ tags: { some: { id: { in: selectedTags } } } })
    }

    return conditions.length > 0 ? { AND: conditions } : {}
  }

  const { data, loading, error, refetch } = useQuery(GET_MEDIA_LIST, {
    variables: {
      where: buildWhereClause(),
      take: pageSize,
      skip: page * pageSize,
    },
    skip: !isOpen,
  })

  useEffect(() => {
    if (isOpen) {
      refetch()
    }
  }, [isOpen, searchTerm, selectedCategory, selectedTags, page])

  // Tag type labels
  const TAG_TYPE_LABELS: Record<string, { en: string; zh: string }> = {
    PRODUCT_SERIES: { en: 'Product Series', zh: '产品系列' },
    FUNCTION_TYPE: { en: 'Function Type', zh: '功能类型' },
    SCENE_TYPE: { en: 'Scene Type', zh: '场景类型' },
    SPEC: { en: 'Specification', zh: '规格' },
    COLOR: { en: 'Color', zh: '颜色' },
    CUSTOM: { en: 'Custom', zh: '自定义' },
  }

  // Parse tag names
  const getTagName = (tag: any): string => {
    try {
      const nameObj = typeof tag.name === 'string' ? JSON.parse(tag.name) : tag.name
      return nameObj.zh || nameObj.en || tag.slug
    } catch {
      return tag.slug
    }
  }

  // Group tags by type
  const groupedTags = React.useMemo(() => {
    if (!tagsData?.mediaTags) return {}

    const groups: Record<string, any[]> = {}
    tagsData.mediaTags.forEach((tag: any) => {
      const type = tag.type || 'CUSTOM'
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(tag)
    })

    return groups
  }, [tagsData])

  // Sort tag types in preferred order
  const sortedTagTypes = Object.keys(groupedTags).sort((a, b) => {
    const order = ['PRODUCT_SERIES', 'FUNCTION_TYPE', 'SCENE_TYPE', 'SPEC', 'COLOR', 'CUSTOM']
    return order.indexOf(a) - order.indexOf(b)
  })

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
    setPage(0)
  }

  if (!isOpen) return null

  const mediaItems = data?.mediaFiles || []
  const totalCount = data?.mediaFilesCount || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '2rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '1000px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
            Select Media / 选择媒体
          </h2>

          {/* Search */}
          <TextInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(0)
            }}
            placeholder="Search by filename..."
            style={{ marginBottom: '12px' }}
          />

          {/* Category Filter */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
              Filter by Category / 按分类筛选
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setPage(0)
              }}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #cbd5e0',
                borderRadius: '6px',
                fontSize: '13px',
                background: 'white',
              }}
            >
              <option value="">All Categories / 全部分类</option>
              {(categoriesData?.mediaCategories || []).map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.displayName || category.slug}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Filter - Grouped by Type */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                Filter by Tags / 按标签筛选 {selectedTags.length > 0 && `(${selectedTags.length} selected)`}
              </label>
              {selectedTags.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTags([])
                    setPage(0)
                  }}
                  style={{
                    padding: '2px 8px',
                    fontSize: '11px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            <div style={{
              maxHeight: '280px',
              overflowY: 'auto',
              border: '1px solid #cbd5e0',
              borderRadius: '6px',
              padding: '8px',
              background: '#f9fafb',
            }}>
              {sortedTagTypes.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', padding: '8px' }}>
                  No tags available
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {sortedTagTypes.map(type => {
                    const tags = groupedTags[type]
                    const typeLabel = TAG_TYPE_LABELS[type] || { en: type, zh: type }

                    return (
                      <div key={type}>
                        {/* Type Header */}
                        <div style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#6b7280',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          {typeLabel.zh} / {typeLabel.en}
                        </div>

                        {/* Tags in this type */}
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '4px',
                        }}>
                          {tags.map((tag: any) => {
                            const isSelected = selectedTags.includes(tag.id)
                            const tagName = getTagName(tag)

                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => toggleTag(tag.id)}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '11px',
                                  border: `1px solid ${isSelected ? '#10b981' : '#d1d5db'}`,
                                  borderRadius: '12px',
                                  background: isSelected ? '#d1fae5' : 'white',
                                  color: isSelected ? '#065f46' : '#4b5563',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s',
                                  whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.borderColor = '#9ca3af'
                                    e.currentTarget.style.background = '#f3f4f6'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.borderColor = '#d1d5db'
                                    e.currentTarget.style.background = 'white'
                                  }
                                }}
                              >
                                {tagName}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Loading media...
          </div>
        )}
        {error && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
            Error loading media: {error.message}
          </div>
        )}

        {/* Media Grid */}
        {!loading && !error && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              {mediaItems.map((media: any) => {
                const thumbnailUrl = media.variants?.thumbnail || media.file?.url

                return (
                  <button
                    key={media.id}
                    type="button"
                    onClick={() => {
                      onSelect(media.id)
                      onClose()
                    }}
                    style={{
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px',
                      background: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#10b981'
                      e.currentTarget.style.transform = 'scale(1.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        paddingTop: '100%',
                        position: 'relative',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      {thumbnailUrl && (
                        <img
                          src={thumbnailUrl}
                          alt={media.filename}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#374151',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={media.filename}
                    >
                      {media.filename}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '12px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e5e7eb',
                }}
              >
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{
                    padding: '8px 16px',
                    background: page === 0 ? '#e5e7eb' : '#10b981',
                    color: page === 0 ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: page === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  style={{
                    padding: '8px 16px',
                    background: page >= totalPages - 1 ? '#e5e7eb' : '#10b981',
                    color: page >= totalPages - 1 ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Next
                </button>
              </div>
            )}

            {/* No Results */}
            {mediaItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                No media found. Try a different search term.
              </div>
            )}
          </>
        )}

        {/* Close Button */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// Image Preview Component
const ImagePreview: React.FC<{ mediaId: string }> = ({ mediaId }) => {
  const { data, loading } = useQuery(GET_MEDIA_BY_ID, {
    variables: { id: mediaId },
    skip: !mediaId,
  })

  if (!mediaId) return null
  if (loading) {
    return (
      <div style={{
        width: '80px',
        height: '80px',
        background: '#f3f4f6',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        color: '#9ca3af'
      }}>
        Loading...
      </div>
    )
  }

  const media = data?.media
  if (!media) return null

  const thumbnailUrl = media.variants?.thumbnail || media.file?.url

  return (
    <div style={{
      width: '80px',
      height: '80px',
      borderRadius: '6px',
      overflow: 'hidden',
      border: '2px solid #e5e7eb',
      background: '#f3f4f6'
    }}>
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt={media.filename}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )}
    </div>
  )
}

// Sortable Item Component
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
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
    <div ref={setNodeRef} style={style}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
        <div
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            padding: '8px',
            background: '#f1f5f9',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '16px',
            userSelect: 'none',
          }}
        >
          ⋮⋮
        </div>
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </div>
  )
}

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => {
  const [activeTab, setActiveTab] = useState('en')
  const [isTranslating, setIsTranslating] = useState(false)
  const [showTranslationPanel, setShowTranslationPanel] = useState(false)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [translationService, setTranslationService] = useState<'google' | 'deepl' | 'azure'>('google')
  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    LANGUAGES.filter(l => l.code !== 'en').map(l => l.code)
  )
  const [sourceLanguage, setSourceLanguage] = useState('en')
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false)
  const [currentMediaTarget, setCurrentMediaTarget] = useState<{ itemIdx: number; field: 'image' | 'sceneImage' } | null>(null)

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Parse JSON value
  const items: MultilingualCarouselItems = value ? JSON.parse(value) : {}

  // Load saved translation settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedApiKey = localStorage.getItem('keystoneTranslatorApiKey')
      const savedService = localStorage.getItem('keystoneTranslatorService')
      const savedLanguages = localStorage.getItem('keystoneTranslatorLanguages')
      const savedSourceLang = localStorage.getItem('keystoneTranslatorSourceLang')
      const savedOverwrite = localStorage.getItem('keystoneTranslatorOverwrite')

      if (savedApiKey) setApiKey(savedApiKey)
      if (savedService) setTranslationService(savedService as 'google' | 'deepl' | 'azure')
      if (savedSourceLang) setSourceLanguage(savedSourceLang)
      if (savedOverwrite) setOverwriteExisting(savedOverwrite === 'true')

      if (savedLanguages) {
        try {
          const parsedLanguages = JSON.parse(savedLanguages)
          if (Array.isArray(parsedLanguages) && parsedLanguages.length > 0) {
            setSelectedLanguages(parsedLanguages)
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, [])

  // Save translation settings
  useEffect(() => {
    if (typeof window !== 'undefined' && apiKey) {
      localStorage.setItem('keystoneTranslatorApiKey', apiKey)
    }
  }, [apiKey])

  useEffect(() => {
    if (typeof window !== 'undefined' && translationService) {
      localStorage.setItem('keystoneTranslatorService', translationService)
    }
  }, [translationService])

  useEffect(() => {
    if (typeof window !== 'undefined' && selectedLanguages.length > 0) {
      localStorage.setItem('keystoneTranslatorLanguages', JSON.stringify(selectedLanguages))
    }
  }, [selectedLanguages])

  useEffect(() => {
    if (typeof window !== 'undefined' && sourceLanguage) {
      localStorage.setItem('keystoneTranslatorSourceLang', sourceLanguage)
    }
  }, [sourceLanguage])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('keystoneTranslatorOverwrite', String(overwriteExisting))
    }
  }, [overwriteExisting])

  // Auto-deselect source language from targets
  useEffect(() => {
    setSelectedLanguages(prev => prev.filter(lang => lang !== sourceLanguage))
  }, [sourceLanguage])

  // Get current language's items
  const currentItems = items[activeTab] || []

  // Update items for current language
  const updateCurrentItems = (newItems: CarouselItem[]) => {
    const newData = { ...items, [activeTab]: newItems }
    onChange?.(JSON.stringify(newData))
  }

  // Add item
  const addItem = () => {
    const newItem: CarouselItem = {
      isShow: true,
      title: '',
      image: '',
      sceneImage: '',
      buttonText: '',
      linkUrl: '',
    }
    updateCurrentItems([...currentItems, newItem])
  }

  // Remove item
  const removeItem = (itemIdx: number) => {
    const newItems = currentItems.filter((_, i) => i !== itemIdx)
    updateCurrentItems(newItems)
  }

  // Update item
  const updateItem = (itemIdx: number, updates: Partial<CarouselItem>) => {
    const newItems = currentItems.map((item, i) =>
      i === itemIdx ? { ...item, ...updates } : item
    )
    updateCurrentItems(newItems)
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = currentItems.findIndex((_, i) => `item-${i}` === active.id)
      const newIndex = currentItems.findIndex((_, i) => `item-${i}` === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(currentItems, oldIndex, newIndex)
        updateCurrentItems(newItems)
      }
    }
  }

  // Toggle language selection
  const toggleLanguage = (langCode: string) => {
    setSelectedLanguages(prev =>
      prev.includes(langCode) ? prev.filter(code => code !== langCode) : [...prev, langCode]
    )
  }

  // Toggle all languages
  const toggleAllLanguages = () => {
    const availableLanguages = LANGUAGES.filter(l => l.code !== sourceLanguage).map(l => l.code)
    if (selectedLanguages.length === availableLanguages.length) {
      setSelectedLanguages([])
    } else {
      setSelectedLanguages(availableLanguages)
    }
  }

  // Handle auto-translate
  const handleTranslate = async () => {
    if (!apiKey) {
      setError('Please enter an API key')
      return
    }

    const sourceItems = items[sourceLanguage] || []
    if (sourceItems.length === 0) {
      setError(`Please add items in ${LANGUAGES.find(l => l.code === sourceLanguage)?.label} first`)
      return
    }

    if (selectedLanguages.length === 0) {
      setError('Please select at least one target language')
      return
    }

    const validTargets = selectedLanguages.filter(lang => lang !== sourceLanguage)

    if (validTargets.length === 0) {
      setError('Cannot translate to the same language as source')
      return
    }

    const targetLangs = overwriteExisting
      ? validTargets
      : validTargets.filter(lang => !items[lang] || items[lang].length === 0)

    if (targetLangs.length === 0) {
      setError('All selected languages already have items. Enable "Overwrite existing translations" to re-translate.')
      return
    }

    setIsTranslating(true)
    setError('')
    setStatus(`Translating items from ${sourceLanguage.toUpperCase()} to ${targetLangs.length} language${targetLangs.length > 1 ? 's' : ''}...`)

    try {
      const newItems = { ...items }

      for (const targetLang of targetLangs) {
        const translatedItems: CarouselItem[] = []

        for (const item of sourceItems) {
          // Translate title
          const titleResponse = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: item.title,
              sourceLang: sourceLanguage,
              service: translationService,
              apiKey,
              targetLangs: [targetLang],
            }),
          })

          if (!titleResponse.ok) {
            throw new Error('Failed to translate title')
          }

          const titleData = await titleResponse.json()
          const translatedTitle = titleData.translations[targetLang] || item.title

          // Translate button text
          const buttonTextResponse = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: item.buttonText,
              sourceLang: sourceLanguage,
              service: translationService,
              apiKey,
              targetLangs: [targetLang],
            }),
          })

          if (!buttonTextResponse.ok) {
            throw new Error('Failed to translate button text')
          }

          const buttonTextData = await buttonTextResponse.json()
          const translatedButtonText = buttonTextData.translations[targetLang] || item.buttonText

          translatedItems.push({
            isShow: item.isShow,
            title: translatedTitle,
            image: item.image,
            sceneImage: item.sceneImage,
            buttonText: translatedButtonText,
            linkUrl: item.linkUrl,
          })
        }

        newItems[targetLang] = translatedItems
      }

      onChange?.(JSON.stringify(newItems))

      setStatus('✅ Translation completed!')
      setTimeout(() => {
        setStatus('')
        setShowTranslationPanel(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed')
    } finally {
      setIsTranslating(false)
    }
  }

  // Calculate completion stats
  const completedCount = LANGUAGES.filter(lang => {
    const langItems = items[lang.code]
    return langItems && langItems.length > 0
  }).length
  const totalCount = LANGUAGES.length
  const completionPercentage = Math.round((completedCount / totalCount) * 100)

  return (
    <FieldContainer>
      <div style={{ marginBottom: '8px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <FieldLabel>{field.label}</FieldLabel>
          <button
            type="button"
            onClick={() => setShowTranslationPanel(!showTranslationPanel)}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            🌐 {showTranslationPanel ? 'Hide' : 'Auto-Translate'}
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px'
          }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {completedCount} of {totalCount} languages ({completionPercentage}%)
            </span>
          </div>
          <div style={{
            background: '#e2e8f0',
            borderRadius: '4px',
            height: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#10b981',
              height: '100%',
              width: `${completionPercentage}%`,
              transition: 'width 0.3s'
            }} />
          </div>
        </div>

        {/* Translation Panel */}
        {showTranslationPanel && (
          <div style={{
            background: '#f8f9fa',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
              🌐 Auto-Translate Settings
            </h4>

            {/* Source Language Selector */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                Source Language
              </label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                disabled={isTranslating}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '13px',
                  background: 'white'
                }}
              >
                {LANGUAGES.map(lang => {
                  const hasContent = items[lang.code]?.length > 0
                  return (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.label} {hasContent ? '✓' : '(empty)'}
                    </option>
                  )
                })}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  Service
                </label>
                <select
                  value={translationService}
                  onChange={(e) => setTranslationService(e.target.value as 'google' | 'deepl' | 'azure')}
                  disabled={isTranslating}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontSize: '13px',
                    background: 'white'
                  }}
                >
                  <option value="google">Google Translate</option>
                  <option value="deepl">DeepL API</option>
                  <option value="azure">Azure Translator</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isTranslating}
                  placeholder="Enter your API key"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            {/* Overwrite Option */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isTranslating ? 'not-allowed' : 'pointer',
                fontSize: '13px'
              }}>
                <input
                  type="checkbox"
                  checked={overwriteExisting}
                  onChange={(e) => setOverwriteExisting(e.target.checked)}
                  disabled={isTranslating}
                  style={{ cursor: isTranslating ? 'not-allowed' : 'pointer' }}
                />
                <span>Overwrite existing translations</span>
              </label>
            </div>

            {/* Language Selector */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500 }}>
                  Target Languages ({selectedLanguages.length} selected)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={toggleAllLanguages}
                    disabled={isTranslating}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      background: 'white',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      cursor: isTranslating ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {selectedLanguages.length === LANGUAGES.filter(l => l.code !== sourceLanguage).length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                    disabled={isTranslating}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isTranslating ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {showLanguageSelector ? 'Hide' : 'Show'} Languages
                  </button>
                </div>
              </div>

              {showLanguageSelector && (
                <div style={{
                  background: 'white',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '12px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '8px'
                  }}>
                    {LANGUAGES.map(lang => {
                      const isSourceLang = lang.code === sourceLanguage
                      const isDisabled = isTranslating || isSourceLang

                      return (
                        <label
                          key={lang.code}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            background: selectedLanguages.includes(lang.code) ? '#d1fae5' : 'transparent',
                            opacity: isSourceLang ? 0.5 : 1
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedLanguages.includes(lang.code)}
                            onChange={() => toggleLanguage(lang.code)}
                            disabled={isDisabled}
                            style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                          />
                          <span style={{ fontSize: '12px' }}>
                            {lang.flag} {lang.code.toUpperCase()}
                            {isSourceLang && ' (source)'}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleTranslate}
              disabled={isTranslating || !apiKey || (items[sourceLanguage]?.length || 0) === 0 || selectedLanguages.length === 0}
              style={{
                width: '100%',
                padding: '10px',
                background: isTranslating || !apiKey || (items[sourceLanguage]?.length || 0) === 0 || selectedLanguages.length === 0 ? '#cbd5e1' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isTranslating || !apiKey || (items[sourceLanguage]?.length || 0) === 0 || selectedLanguages.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                fontSize: '14px'
              }}
            >
              {isTranslating ? 'Translating...' : `Translate from ${sourceLanguage.toUpperCase()} to ${selectedLanguages.length} Language${selectedLanguages.length > 1 ? 's' : ''}`}
            </button>

            {(status || error) && (
              <div style={{
                marginTop: '12px',
                padding: '8px 12px',
                background: error ? '#fee2e2' : '#d1fae5',
                color: error ? '#991b1b' : '#065f46',
                borderRadius: '4px',
                fontSize: '13px'
              }}>
                {error || status}
              </div>
            )}
          </div>
        )}

        {/* Language Tabs */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '16px',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '8px'
        }}>
          {LANGUAGES.map(lang => {
            const isCompleted = items[lang.code]?.length > 0
            const isActive = activeTab === lang.code

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setActiveTab(lang.code)}
                style={{
                  background: isActive ? '#10b981' : '#f1f5f9',
                  color: isActive ? 'white' : '#475569',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{lang.flag}</span>
                <span>{lang.code.toUpperCase()}</span>
                {isCompleted && <span>✓</span>}
              </button>
            )
          })}
        </div>

        {/* Items Editor for Active Language with Drag & Drop */}
        <div style={{ marginTop: '16px' }}>
          {currentItems.length === 0 ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: '#999',
              background: '#f9f9f9',
              borderRadius: '8px',
              marginBottom: '12px',
            }}>
              No items for {LANGUAGES.find(l => l.code === activeTab)?.label}. Click "Add Item" to start.
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={currentItems.map((_, i) => `item-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
                  {currentItems.map((item, itemIdx) => (
                    <SortableItem key={`item-${itemIdx}`} id={`item-${itemIdx}`}>
                      <div
                        style={{
                          background: item.isShow ? '#ffffff' : '#f3f4f6',
                          border: '2px solid #e1e5e9',
                          borderRadius: '8px',
                          padding: '16px',
                        }}
                      >
                        {/* Item Header */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '12px'
                        }}>
                          {/* Visibility checkbox */}
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={item.isShow}
                              onChange={(e) => updateItem(itemIdx, { isShow: e.target.checked })}
                              style={{ width: '18px', height: '18px' }}
                            />
                            <span style={{ fontSize: '14px', fontWeight: 500 }}>
                              {item.isShow ? 'Visible (显示)' : 'Hidden (隐藏)'}
                            </span>
                          </label>

                          <div style={{ flex: 1 }} />

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => removeItem(itemIdx)}
                            style={{
                              padding: '6px 12px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: 500,
                            }}
                          >
                            Delete Item
                          </button>
                        </div>

                        {/* Fields */}
                        <div style={{ display: 'grid', gap: '12px' }}>
                          {/* Title */}
                          <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600, color: '#333' }}>
                              Title (系列名称)
                            </label>
                            <TextInput
                              value={item.title}
                              onChange={(e) => updateItem(itemIdx, { title: e.target.value })}
                              placeholder="Enter title"
                              style={{ fontSize: '14px' }}
                            />
                          </div>

                          {/* Image */}
                          <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600, color: '#333' }}>
                              Image (产品系列单图)
                            </label>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                              {item.image && <ImagePreview mediaId={item.image} />}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCurrentMediaTarget({ itemIdx, field: 'image' })
                                      setMediaSelectorOpen(true)
                                    }}
                                    style={{
                                      padding: '8px 16px',
                                      background: '#3b82f6',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                    }}
                                  >
                                    {item.image ? 'Change Image' : 'Select Image'}
                                  </button>
                                  {item.image && (
                                    <button
                                      type="button"
                                      onClick={() => updateItem(itemIdx, { image: '' })}
                                      style={{
                                        padding: '8px 12px',
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                      }}
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                                {item.image && (
                                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>ID: {item.image}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Scene Image */}
                          <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600, color: '#333' }}>
                              Scene Image (场景图 - 悬停背景)
                            </label>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                              {item.sceneImage && <ImagePreview mediaId={item.sceneImage} />}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCurrentMediaTarget({ itemIdx, field: 'sceneImage' })
                                      setMediaSelectorOpen(true)
                                    }}
                                    style={{
                                      padding: '8px 16px',
                                      background: '#3b82f6',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                    }}
                                  >
                                    {item.sceneImage ? 'Change Scene Image' : 'Select Scene Image'}
                                  </button>
                                  {item.sceneImage && (
                                    <button
                                      type="button"
                                      onClick={() => updateItem(itemIdx, { sceneImage: '' })}
                                      style={{
                                        padding: '8px 12px',
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                      }}
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                                {item.sceneImage && (
                                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>ID: {item.sceneImage}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Button Text */}
                          <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600, color: '#333' }}>
                              Button Text (按钮文本)
                            </label>
                            <TextInput
                              value={item.buttonText}
                              onChange={(e) => updateItem(itemIdx, { buttonText: e.target.value })}
                              placeholder="e.g., Learn More"
                              style={{ fontSize: '14px' }}
                            />
                          </div>

                          {/* Link URL */}
                          <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600, color: '#333' }}>
                              Link URL (跳转链接)
                            </label>
                            <TextInput
                              value={item.linkUrl}
                              onChange={(e) => updateItem(itemIdx, { linkUrl: e.target.value })}
                              placeholder="/product-series/example"
                              style={{ fontSize: '14px' }}
                            />
                          </div>
                        </div>
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Add Item Button */}
          <button
            type="button"
            onClick={addItem}
            style={{
              padding: '10px 16px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              width: '100%',
            }}
          >
            ➕ Add Carousel Item
          </button>
        </div>

        {/* JSON Preview */}
        {Object.keys(items).length > 0 && (
          <details style={{ marginTop: '16px' }}>
            <summary style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#666' }}>
              📋 View JSON Data
            </summary>
            <pre style={{
              marginTop: '8px',
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '6px',
              fontSize: '11px',
              overflow: 'auto',
              maxHeight: '300px',
            }}>
              {JSON.stringify(items, null, 2)}
            </pre>
          </details>
        )}
      </div>

      {/* Media Selector Modal */}
      <MediaSelectorModal
        isOpen={mediaSelectorOpen}
        onClose={() => {
          setMediaSelectorOpen(false)
          setCurrentMediaTarget(null)
        }}
        onSelect={(mediaId) => {
          if (currentMediaTarget) {
            updateItem(currentMediaTarget.itemIdx, { [currentMediaTarget.field]: mediaId })
          }
          setCurrentMediaTarget(null)
        }}
      />
    </FieldContainer>
  )
}

/**
 * Cell Component - Display items in list view
 */
export const Cell = ({ item, field }: any) => {
  const value = item[field.path]

  if (!value || typeof value !== 'object') {
    return <div style={{ color: '#999', fontSize: '13px' }}>No items</div>
  }

  const items = value as MultilingualCarouselItems
  const languages = Object.keys(items)

  if (languages.length === 0) {
    return <div style={{ color: '#999', fontSize: '13px' }}>No items</div>
  }

  const totalItems = languages.reduce((sum, lang) => sum + items[lang].length, 0)

  return (
    <div style={{ fontSize: '13px', color: '#4a5568' }}>
      <span style={{ fontWeight: 500 }}>{totalItems} items</span>
      <span style={{ color: '#999', marginLeft: '4px' }}>
        ({languages.length} languages)
      </span>
    </div>
  )
}

export const controller = (config: any): FieldController<string, string> => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: '{}',
    deserialize: (data) => {
      const value = data[config.path]

      if (value === null || value === undefined) {
        return '{}'
      }

      if (typeof value === 'object') {
        return JSON.stringify(value)
      }

      if (typeof value === 'string') {
        return value
      }

      return '{}'
    },
    serialize: (value) => {
      let jsonValue
      if (!value) {
        jsonValue = null
      } else if (typeof value === 'string') {
        try {
          jsonValue = JSON.parse(value)
        } catch {
          jsonValue = null
        }
      } else if (typeof value === 'object') {
        jsonValue = value
      } else {
        jsonValue = null
      }
      return { [config.path]: jsonValue }
    },
    validate: (value) => {
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value
        return undefined
      } catch {
        return 'Invalid JSON format'
      }
    },
  }
}
