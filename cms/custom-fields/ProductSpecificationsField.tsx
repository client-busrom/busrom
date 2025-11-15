/**
 * Product Specifications Field - Multilingual Specifications with Media Support
 *
 * 产品规格字段 - 支持多语言的产品规格(带图片支持)
 *
 * Data structure:
 * {
 *   en: [
 *     {
 *       text: "Color",
 *       items: [
 *         { text: "Red", url: "https://...", image: "media-id" },
 *         { text: "Blue", url: "https://...", image: "media-id" }
 *       ]
 *     },
 *     {
 *       text: "Size",
 *       items: [
 *         { text: "Small", url: "https://...", image: "media-id" }
 *       ]
 *     }
 *   ],
 *   zh: [...],
 *   ...
 * }
 */

import React, { useState, useEffect } from 'react'
import {
  FieldContainer,
  FieldLabel,
  TextInput,
} from '@keystone-ui/fields'
import { FieldController } from '@keystone-6/core/types'
import { FieldProps } from '@keystone-6/core/types'
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

// Language configuration (same as MultilingualJSONField)
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

const RTL_LANGUAGES = ['ar', 'he', 'fa']

/**
 * Specification Item Structure
 */
interface SpecificationItem {
  text: string
  url?: string
  image?: string // Media ID
}

/**
 * Specification Group Structure
 */
interface SpecificationGroup {
  text: string
  items: SpecificationItem[]
}

/**
 * Full Specifications Structure (multilingual)
 */
type Specifications = Record<string, SpecificationGroup[]>

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

  // Tag type labels (same as GroupedTagsField)
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
                // 优先使用缩略图,如果没有则使用原图
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
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={media.id}
                    >
                      ID: {media.id}
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
  const [currentMediaTarget, setCurrentMediaTarget] = useState<{ groupIdx: number; itemIdx: number } | null>(null)

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Parse JSON value
  const specifications: Specifications = value ? JSON.parse(value) : {}

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

  // Get current language's specifications
  const currentSpecs = specifications[activeTab] || []

  // Update specifications for current language
  const updateCurrentSpecs = (newSpecs: SpecificationGroup[]) => {
    const newSpecifications = { ...specifications, [activeTab]: newSpecs }
    onChange?.(JSON.stringify(newSpecifications))
  }

  // Add specification group
  const addGroup = () => {
    const newSpecs = [...currentSpecs, { text: '', items: [] }]
    updateCurrentSpecs(newSpecs)
  }

  // Remove specification group
  const removeGroup = (groupIdx: number) => {
    const newSpecs = currentSpecs.filter((_, i) => i !== groupIdx)
    updateCurrentSpecs(newSpecs)
  }

  // Update group text
  const updateGroupText = (groupIdx: number, text: string) => {
    const newSpecs = currentSpecs.map((group, i) =>
      i === groupIdx ? { ...group, text } : group
    )
    updateCurrentSpecs(newSpecs)
  }

  // Add item to group
  const addItem = (groupIdx: number) => {
    const newSpecs = currentSpecs.map((group, i) =>
      i === groupIdx
        ? { ...group, items: [...group.items, { text: '', url: '', image: '' }] }
        : group
    )
    updateCurrentSpecs(newSpecs)
  }

  // Remove item from group
  const removeItem = (groupIdx: number, itemIdx: number) => {
    const newSpecs = currentSpecs.map((group, i) =>
      i === groupIdx
        ? { ...group, items: group.items.filter((_, j) => j !== itemIdx) }
        : group
    )
    updateCurrentSpecs(newSpecs)
  }

  // Update item
  const updateItem = (groupIdx: number, itemIdx: number, updates: Partial<SpecificationItem>) => {
    const newSpecs = currentSpecs.map((group, i) =>
      i === groupIdx
        ? {
            ...group,
            items: group.items.map((item, j) =>
              j === itemIdx ? { ...item, ...updates } : item
            ),
          }
        : group
    )
    updateCurrentSpecs(newSpecs)
  }

  // Handle group drag end
  const handleGroupDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = currentSpecs.findIndex((_, i) => `group-${i}` === active.id)
      const newIndex = currentSpecs.findIndex((_, i) => `group-${i}` === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newSpecs = arrayMove(currentSpecs, oldIndex, newIndex)
        updateCurrentSpecs(newSpecs)
      }
    }
  }

  // Handle item drag end
  const handleItemDragEnd = (groupIdx: number) => (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const group = currentSpecs[groupIdx]
      const oldIndex = group.items.findIndex((_, i) => `item-${groupIdx}-${i}` === active.id)
      const newIndex = group.items.findIndex((_, i) => `item-${groupIdx}-${i}` === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(group.items, oldIndex, newIndex)
        const newSpecs = currentSpecs.map((g, i) =>
          i === groupIdx ? { ...g, items: newItems } : g
        )
        updateCurrentSpecs(newSpecs)
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

  // Handle auto-translate (FIXED: 修复翻译对位问题)
  const handleTranslate = async () => {
    if (!apiKey) {
      setError('Please enter an API key')
      return
    }

    const sourceSpecs = specifications[sourceLanguage] || []
    if (sourceSpecs.length === 0) {
      setError(`Please add specifications in ${LANGUAGES.find(l => l.code === sourceLanguage)?.label} first`)
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
      : validTargets.filter(lang => !specifications[lang] || specifications[lang].length === 0)

    if (targetLangs.length === 0) {
      setError('All selected languages already have specifications. Enable "Overwrite existing translations" to re-translate.')
      return
    }

    setIsTranslating(true)
    setError('')
    setStatus(`Translating specifications from ${sourceLanguage.toUpperCase()} to ${targetLangs.length} language${targetLangs.length > 1 ? 's' : ''}...`)

    try {
      // 为每个规格组和项目分别翻译,保持结构对位
      const newSpecifications = { ...specifications }

      for (const targetLang of targetLangs) {
        const translatedSpecs: SpecificationGroup[] = []

        // 逐个翻译规格组
        for (const group of sourceSpecs) {
          // 翻译组名
          const groupNameResponse = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: group.text,
              sourceLang: sourceLanguage,
              service: translationService,
              apiKey,
              targetLangs: [targetLang],
            }),
          })

          if (!groupNameResponse.ok) {
            throw new Error('Failed to translate group name')
          }

          const groupNameData = await groupNameResponse.json()
          const translatedGroupName = groupNameData.translations[targetLang] || group.text

          // 翻译该组的所有项目
          const translatedItems: SpecificationItem[] = []

          for (const item of group.items) {
            const itemResponse = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: item.text,
                sourceLang: sourceLanguage,
                service: translationService,
                apiKey,
                targetLangs: [targetLang],
              }),
            })

            if (!itemResponse.ok) {
              throw new Error('Failed to translate item')
            }

            const itemData = await itemResponse.json()
            const translatedItemText = itemData.translations[targetLang] || item.text

            translatedItems.push({
              text: translatedItemText,
              url: item.url,
              image: item.image,
            })
          }

          translatedSpecs.push({
            text: translatedGroupName,
            items: translatedItems,
          })
        }

        newSpecifications[targetLang] = translatedSpecs
      }

      onChange?.(JSON.stringify(newSpecifications))

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
    const specs = specifications[lang.code]
    return specs && specs.length > 0
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
                  const hasContent = specifications[lang.code]?.length > 0
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
              disabled={isTranslating || !apiKey || (specifications[sourceLanguage]?.length || 0) === 0 || selectedLanguages.length === 0}
              style={{
                width: '100%',
                padding: '10px',
                background: isTranslating || !apiKey || (specifications[sourceLanguage]?.length || 0) === 0 || selectedLanguages.length === 0 ? '#cbd5e1' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isTranslating || !apiKey || (specifications[sourceLanguage]?.length || 0) === 0 || selectedLanguages.length === 0 ? 'not-allowed' : 'pointer',
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
            const isCompleted = specifications[lang.code]?.length > 0
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

        {/* Specifications Editor for Active Language with Drag & Drop */}
        <div style={{ marginTop: '16px' }}>
          {currentSpecs.length === 0 ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: '#999',
              background: '#f9f9f9',
              borderRadius: '8px',
              marginBottom: '12px',
            }}>
              No specifications for {LANGUAGES.find(l => l.code === activeTab)?.label}. Click "Add Specification Group" to start.
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleGroupDragEnd}>
              <SortableContext
                items={currentSpecs.map((_, i) => `group-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
                  {currentSpecs.map((group, groupIdx) => (
                    <SortableItem key={`group-${groupIdx}`} id={`group-${groupIdx}`}>
                      <div
                        style={{
                          background: '#f9f9f9',
                          border: '2px solid #e1e5e9',
                          borderRadius: '8px',
                          padding: '16px',
                        }}
                      >
                        {/* Group Header */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px'
                        }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600, color: '#333' }}>
                              Specification Group Name
                            </label>
                            <TextInput
                              value={group.text}
                              onChange={(e) => updateGroupText(groupIdx, e.target.value)}
                              placeholder="e.g., Color, Size, Material"
                              style={{ fontSize: '14px', fontWeight: 500 }}
                            />
                          </div>
                          <div style={{ paddingTop: '20px' }}>
                            <button
                              type="button"
                              onClick={() => removeGroup(groupIdx)}
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
                              Delete Group
                            </button>
                          </div>
                        </div>

                        {/* Group Items with Drag & Drop */}
                        {group.items.length === 0 ? (
                          <div style={{
                            padding: '16px',
                            textAlign: 'center',
                            color: '#999',
                            background: 'white',
                            borderRadius: '6px',
                            marginBottom: '8px',
                          }}>
                            No items in this group. Click "Add Item" below.
                          </div>
                        ) : (
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleItemDragEnd(groupIdx)}
                          >
                            <SortableContext
                              items={group.items.map((_, i) => `item-${groupIdx}-${i}`)}
                              strategy={verticalListSortingStrategy}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                                {group.items.map((item, itemIdx) => (
                                  <SortableItem key={`item-${groupIdx}-${itemIdx}`} id={`item-${groupIdx}-${itemIdx}`}>
                                    <div
                                      style={{
                                        background: 'white',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        border: '1px solid #e1e5e9',
                                      }}
                                    >
                                      <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1.5fr auto',
                                        gap: '8px',
                                        alignItems: 'end',
                                        marginBottom: '8px',
                                      }}>
                                        <div>
                                          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500, color: '#666' }}>
                                            Item Name
                                          </label>
                                          <TextInput
                                            value={item.text}
                                            onChange={(e) => updateItem(groupIdx, itemIdx, { text: e.target.value })}
                                            placeholder="e.g., Red"
                                            style={{ fontSize: '13px' }}
                                          />
                                        </div>

                                        <div>
                                          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500, color: '#666' }}>
                                            3D Customization URL (Optional)
                                          </label>
                                          <TextInput
                                            value={item.url || ''}
                                            onChange={(e) => updateItem(groupIdx, itemIdx, { url: e.target.value })}
                                            placeholder="https://..."
                                            style={{ fontSize: '13px' }}
                                          />
                                        </div>

                                        <div>
                                          <button
                                            type="button"
                                            onClick={() => removeItem(groupIdx, itemIdx)}
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
                                            Delete
                                          </button>
                                        </div>
                                      </div>

                                      {/* Image Preview/Selector */}
                                      <div>
                                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500, color: '#666' }}>
                                          Image (Optional)
                                        </label>
                                        {item.image ? (
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '13px', color: '#64748b' }}>Media ID: {item.image}</span>
                                            <button
                                              type="button"
                                              onClick={() => updateItem(groupIdx, itemIdx, { image: '' })}
                                              style={{
                                                padding: '4px 8px',
                                                background: '#94a3b8',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                              }}
                                            >
                                              Remove Image
                                            </button>
                                          </div>
                                        ) : (
                                          <div style={{ display: 'flex', gap: '8px' }}>
                                            <TextInput
                                              value={item.image || ''}
                                              onChange={(e) => updateItem(groupIdx, itemIdx, { image: e.target.value })}
                                              placeholder="Enter Media ID or use selector"
                                              style={{ fontSize: '13px', flex: 1 }}
                                            />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setCurrentMediaTarget({ groupIdx, itemIdx })
                                                setMediaSelectorOpen(true)
                                              }}
                                              style={{
                                                padding: '6px 12px',
                                                background: '#3b82f6',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                fontWeight: 500,
                                              }}
                                            >
                                              Select Media
                                            </button>
                                          </div>
                                        )}
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
                          onClick={() => addItem(groupIdx)}
                          style={{
                            padding: '8px 14px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 500,
                            width: '100%',
                          }}
                        >
                          ➕ Add Item
                        </button>
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Add Group Button */}
          <button
            type="button"
            onClick={addGroup}
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
            ➕ Add Specification Group
          </button>
        </div>

        {/* JSON Preview */}
        {Object.keys(specifications).length > 0 && (
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
              {JSON.stringify(specifications, null, 2)}
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
            updateItem(currentMediaTarget.groupIdx, currentMediaTarget.itemIdx, { image: mediaId })
          }
          setCurrentMediaTarget(null)
        }}
      />
    </FieldContainer>
  )
}

/**
 * Cell Component - Display specifications in list view
 */
export const Cell = ({ item, field }: any) => {
  const value = item[field.path]

  if (!value || typeof value !== 'object') {
    return <div style={{ color: '#999', fontSize: '13px' }}>No specifications</div>
  }

  const specifications = value as Specifications
  const languages = Object.keys(specifications)

  if (languages.length === 0) {
    return <div style={{ color: '#999', fontSize: '13px' }}>No specifications</div>
  }

  const totalGroups = languages.reduce((sum, lang) => sum + specifications[lang].length, 0)

  return (
    <div style={{ fontSize: '13px', color: '#4a5568' }}>
      <span style={{ fontWeight: 500 }}>{totalGroups} groups</span>
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
