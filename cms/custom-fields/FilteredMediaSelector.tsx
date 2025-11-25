/**
 * Filtered Media Selector Component
 *
 * A reusable media selector modal with filtering by category and tags.
 * Can be imported and used in any custom field that needs media selection.
 */

import React, { useState, useEffect } from 'react'
import { TextInput } from '@keystone-ui/fields'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'
import { getCdnUrl } from '../lib/cdn-url'

// GraphQL Queries
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
      metadata
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

const GET_MEDIA_CATEGORIES = gql`
  query GetMediaCategories {
    mediaCategories(orderBy: { order: asc }) {
      id
      slug
      displayName
    }
  }
`

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

// Tag type labels
const TAG_TYPE_LABELS: Record<string, { en: string; zh: string }> = {
  PRODUCT_SERIES: { en: 'Product Series', zh: '产品系列' },
  FUNCTION_TYPE: { en: 'Function Type', zh: '功能类型' },
  SCENE_TYPE: { en: 'Scene Type', zh: '场景类型' },
  SPEC: { en: 'Specification', zh: '规格' },
  COLOR: { en: 'Color', zh: '颜色' },
  CUSTOM: { en: 'Custom', zh: '自定义' },
}

interface FilteredMediaSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (mediaId: string) => void
  multiple?: boolean
  selectedIds?: string[]
}

export const FilteredMediaSelector: React.FC<FilteredMediaSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  selectedIds = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [metadataSearch, setMetadataSearch] = useState({
    seriesNumber: '',
    combinationNumber: '',
    sceneNumber: '',
    specs: '',
    colors: '',
    notes: '',
  })
  const [page, setPage] = useState(0)
  const pageSize = 20

  // Fetch categories and tags
  const { data: categoriesData } = useQuery(GET_MEDIA_CATEGORIES, { skip: !isOpen })
  const { data: tagsData } = useQuery(GET_MEDIA_TAGS, { skip: !isOpen })

  // Check if any metadata filters are active
  const hasMetadataFilters = !!(
    metadataSearch.seriesNumber ||
    metadataSearch.combinationNumber ||
    metadataSearch.sceneNumber ||
    metadataSearch.specs ||
    metadataSearch.colors ||
    metadataSearch.notes
  )

  // Build where clause dynamically (only for non-metadata filters)
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

    // Note: Metadata filters are handled client-side because Keystone doesn't support JSON path queries
    return conditions.length > 0 ? { AND: conditions } : {}
  }

  // When metadata filters are active, fetch all items; otherwise use server-side pagination
  const { data, loading, error, refetch } = useQuery(GET_MEDIA_LIST, {
    variables: {
      where: buildWhereClause(),
      take: hasMetadataFilters ? 1000 : pageSize,
      skip: hasMetadataFilters ? 0 : page * pageSize,
    },
    skip: !isOpen,
  })

  // Reset page to 0 when filters change
  useEffect(() => {
    setPage(0)
  }, [searchTerm, selectedCategory, selectedTags, metadataSearch])

  useEffect(() => {
    if (isOpen) {
      refetch()
    }
  }, [isOpen, searchTerm, selectedCategory, selectedTags, metadataSearch, page])

  // Client-side metadata filtering (Keystone doesn't support JSON path queries in GraphQL)
  const allFilteredItems = React.useMemo(() => {
    const items = data?.mediaFiles || []

    return items.filter((item: any) => {
      const metadata = item.metadata || {}

      // Filter by series number
      if (metadataSearch.seriesNumber) {
        const searchNum = parseInt(metadataSearch.seriesNumber)
        if (!isNaN(searchNum) && metadata.seriesNumber !== searchNum) {
          return false
        }
      }

      // Filter by combination number
      if (metadataSearch.combinationNumber) {
        const searchNum = parseInt(metadataSearch.combinationNumber)
        if (!isNaN(searchNum) && metadata.combinationNumber !== searchNum) {
          return false
        }
      }

      // Filter by scene number
      if (metadataSearch.sceneNumber) {
        const searchNum = parseInt(metadataSearch.sceneNumber)
        if (!isNaN(searchNum) && metadata.sceneNumber !== searchNum) {
          return false
        }
      }

      // Filter by specs
      if (metadataSearch.specs) {
        if (!metadata.specs || !Array.isArray(metadata.specs) || !metadata.specs.includes(metadataSearch.specs)) {
          return false
        }
      }

      // Filter by colors
      if (metadataSearch.colors) {
        if (!metadata.colors || !Array.isArray(metadata.colors) || !metadata.colors.includes(metadataSearch.colors)) {
          return false
        }
      }

      // Filter by notes
      if (metadataSearch.notes) {
        if (!metadata.notes || !metadata.notes.toLowerCase().includes(metadataSearch.notes.toLowerCase())) {
          return false
        }
      }

      return true
    })
  }, [data?.mediaFiles, metadataSearch])

  // Apply client-side pagination when metadata filters are active
  const filteredMediaItems = React.useMemo(() => {
    if (hasMetadataFilters) {
      const startIndex = page * pageSize
      const endIndex = startIndex + pageSize
      return allFilteredItems.slice(startIndex, endIndex)
    }
    return allFilteredItems
  }, [allFilteredItems, hasMetadataFilters, page, pageSize])

  // Calculate total pages based on filtered results
  const totalPages = hasMetadataFilters
    ? Math.ceil(allFilteredItems.length / pageSize)
    : Math.ceil((data?.mediaFilesCount || 0) / pageSize)

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

  // Sort tag types
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

  const mediaItems = filteredMediaItems

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

        {/* Metadata Filter */}
        <div style={{ marginBottom: '12px' }}>
          <details>
            <summary style={{
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              color: '#374151',
              padding: '8px',
              background: '#f9fafb',
              borderRadius: '6px',
              marginBottom: '8px',
            }}>
              🔍 Filter by Metadata (元数据筛选)
              {Object.values(metadataSearch).some(v => v !== '') && ' - Active'}
            </summary>
            <div style={{
              border: '1px solid #cbd5e0',
              borderRadius: '6px',
              padding: '12px',
              background: '#f9fafb',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: '#374151' }}>
                  Series Number (系列编号)
                </label>
                <input
                  type="number"
                  value={metadataSearch.seriesNumber}
                  onChange={(e) => setMetadataSearch({ ...metadataSearch, seriesNumber: e.target.value })}
                  placeholder="例如: 1, 2, 3..."
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: '13px',
                    border: '1px solid #cbd5e0',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: '#374151' }}>
                  Combination Number (组合编号)
                </label>
                <input
                  type="number"
                  value={metadataSearch.combinationNumber}
                  onChange={(e) => setMetadataSearch({ ...metadataSearch, combinationNumber: e.target.value })}
                  placeholder="例如: 1, 2, 3..."
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: '13px',
                    border: '1px solid #cbd5e0',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: '#374151' }}>
                  Scene Number (场景编号)
                </label>
                <input
                  type="number"
                  value={metadataSearch.sceneNumber}
                  onChange={(e) => setMetadataSearch({ ...metadataSearch, sceneNumber: e.target.value })}
                  placeholder="例如: 1, 2, 3..."
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: '13px',
                    border: '1px solid #cbd5e0',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: '#374151' }}>
                  Specs (规格)
                </label>
                <input
                  type="text"
                  value={metadataSearch.specs}
                  onChange={(e) => setMetadataSearch({ ...metadataSearch, specs: e.target.value })}
                  placeholder="例如: 50mm, 不锈钢"
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: '13px',
                    border: '1px solid #cbd5e0',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: '#374151' }}>
                  Colors (颜色)
                </label>
                <input
                  type="text"
                  value={metadataSearch.colors}
                  onChange={(e) => setMetadataSearch({ ...metadataSearch, colors: e.target.value })}
                  placeholder="例如: 黑色, 银色"
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: '13px',
                    border: '1px solid #cbd5e0',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: '#374151' }}>
                  Notes (备注)
                </label>
                <input
                  type="text"
                  value={metadataSearch.notes}
                  onChange={(e) => setMetadataSearch({ ...metadataSearch, notes: e.target.value })}
                  placeholder="搜索备注..."
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: '13px',
                    border: '1px solid #cbd5e0',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <button
                  type="button"
                  onClick={() => setMetadataSearch({
                    seriesNumber: '',
                    combinationNumber: '',
                    sceneNumber: '',
                    specs: '',
                    colors: '',
                    notes: '',
                  })}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Clear Metadata Filters
                </button>
              </div>
            </div>
          </details>
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
                const isSelected = selectedIds.includes(media.id)

                return (
                  <button
                    key={media.id}
                    type="button"
                    onClick={() => {
                      onSelect(media.id)
                      if (!multiple) {
                        onClose()
                      }
                    }}
                    style={{
                      border: `2px solid ${isSelected ? '#10b981' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      padding: '8px',
                      background: isSelected ? '#d1fae5' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#10b981'
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#e5e7eb'
                        e.currentTarget.style.transform = 'scale(1)'
                      }
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
                          src={getCdnUrl(thumbnailUrl)}
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
