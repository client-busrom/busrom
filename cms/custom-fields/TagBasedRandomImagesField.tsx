/**
 * Tag-Based Random Images Field
 *
 * This field allows selecting MediaTags, then randomly picks 5 images
 * that match ALL selected tags.
 *
 * Data structure:
 * {
 *   tags: ['tag-id-1', 'tag-id-2'],
 *   images: ['media-id-1', 'media-id-2', 'media-id-3', 'media-id-4', 'media-id-5']
 * }
 */

import React, { useState, useEffect } from 'react'
import { FieldContainer, FieldLabel } from '@keystone-ui/fields'
import { FieldController, FieldProps } from '@keystone-6/core/types'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'
import { Button } from '@keystone-ui/button'
import { getCdnUrl } from '../lib/cdn-url'

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

// GraphQL query to get Media by tags
const GET_MEDIA_BY_TAGS = gql`
  query GetMediaByTags($tagIds: [ID!]!) {
    mediaFiles(
      where: {
        tags: {
          some: {
            id: { in: $tagIds }
          }
        }
      }
    ) {
      id
      filename
      file {
        url
      }
      variants
      tags {
        id
      }
    }
  }
`

// GraphQL query to get Media by IDs
const GET_MEDIA_BY_IDS = gql`
  query GetMediaByIds($ids: [ID!]!) {
    mediaFiles(where: { id: { in: $ids } }) {
      id
      filename
      file {
        url
      }
      variants
    }
  }
`

interface FieldValue {
  tags: string[]
  images: string[]
}

// Tag type labels
const TAG_TYPE_LABELS: Record<string, { en: string; zh: string }> = {
  PRODUCT_SERIES: { en: 'Product Series', zh: '产品系列' },
  FUNCTION_TYPE: { en: 'Function Type', zh: '功能类型' },
  SCENE_TYPE: { en: 'Scene Type', zh: '场景类型' },
  SPEC: { en: 'Specification', zh: '规格' },
  COLOR: { en: 'Color', zh: '颜色' },
  CUSTOM: { en: 'Custom', zh: '自定义' },
}

export const Field = ({ field, value, onChange }: FieldProps<typeof controller>) => {
  const [isGenerating, setIsGenerating] = useState(false)

  // Parse JSON value
  const fieldValue: FieldValue = value ? JSON.parse(value) : { tags: [], images: [] }

  // Fetch all tags
  const { data: tagsData } = useQuery(GET_MEDIA_TAGS)

  // Fetch media matching selected tags
  const { data: mediaData, refetch: refetchMedia } = useQuery(GET_MEDIA_BY_TAGS, {
    variables: { tagIds: fieldValue.tags },
    skip: fieldValue.tags.length === 0,
  })

  // Fetch selected images details
  const { data: selectedImagesData } = useQuery(GET_MEDIA_BY_IDS, {
    variables: { ids: fieldValue.images },
    skip: fieldValue.images.length === 0,
  })

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
    const newTags = fieldValue.tags.includes(tagId)
      ? fieldValue.tags.filter(id => id !== tagId)
      : [...fieldValue.tags, tagId]

    onChange?.(
      JSON.stringify({
        ...fieldValue,
        tags: newTags,
        // Clear images when tags change
        images: [],
      })
    )
  }

  // Generate random 5 images
  const generateRandomImages = async () => {
    if (fieldValue.tags.length === 0) {
      alert('Please select at least one tag first')
      return
    }

    setIsGenerating(true)

    try {
      // Refetch media to get latest
      const { data } = await refetchMedia()
      const allMedia = data?.mediaFiles || []

      // Filter media that has ALL selected tags
      const matchingMedia = allMedia.filter((media: any) => {
        const mediaTags = media.tags.map((t: any) => t.id)
        return fieldValue.tags.every(tagId => mediaTags.includes(tagId))
      })

      if (matchingMedia.length === 0) {
        alert('No images found matching all selected tags')
        setIsGenerating(false)
        return
      }

      // Randomly select up to 5 images
      const shuffled = [...matchingMedia].sort(() => Math.random() - 0.5)
      const selected = shuffled.slice(0, 5)
      const selectedIds = selected.map((m: any) => m.id)

      onChange?.(
        JSON.stringify({
          ...fieldValue,
          images: selectedIds,
        })
      )
    } catch (error) {
      console.error('Error generating random images:', error)
      alert('Failed to generate images')
    } finally {
      setIsGenerating(false)
    }
  }

  // Clear all
  const clearAll = () => {
    onChange?.(JSON.stringify({ tags: [], images: [] }))
  }

  const selectedImages = selectedImagesData?.mediaFiles || []
  const matchingMediaCount = mediaData?.mediaFiles?.filter((media: any) => {
    const mediaTags = media.tags.map((t: any) => t.id)
    return fieldValue.tags.every(tagId => mediaTags.includes(tagId))
  }).length || 0

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>

      <div style={{ marginTop: '12px' }}>
        {/* Tag Selection */}
        <div style={{
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          background: '#f9fafb',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
              Select Tags (选择标签) {fieldValue.tags.length > 0 && `- ${fieldValue.tags.length} selected`}
            </h3>
            {fieldValue.tags.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                style={{
                  padding: '4px 12px',
                  fontSize: '12px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Clear All
              </button>
            )}
          </div>

          <div style={{
            maxHeight: '280px',
            overflowY: 'auto',
            border: '1px solid #cbd5e0',
            borderRadius: '6px',
            padding: '8px',
            background: 'white',
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

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {tags.map((tag: any) => {
                          const isSelected = fieldValue.tags.includes(tag.id)
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

          {/* Generate Button */}
          {fieldValue.tags.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '8px',
              }}>
                Found {matchingMediaCount} image{matchingMediaCount !== 1 ? 's' : ''} matching all selected tags
              </div>
              <button
                type="button"
                onClick={generateRandomImages}
                disabled={isGenerating || matchingMediaCount === 0}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: isGenerating || matchingMediaCount === 0 ? '#cbd5e1' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isGenerating || matchingMediaCount === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                {isGenerating ? 'Generating...' : '🎲 Generate Random 5 Images'}
              </button>
            </div>
          )}
        </div>

        {/* Selected Images Preview */}
        {selectedImages.length > 0 && (
          <div style={{
            border: '2px solid #10b981',
            borderRadius: '8px',
            padding: '16px',
            background: '#f0fdf4',
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#065f46' }}>
              Selected Images ({selectedImages.length}/5)
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '12px',
            }}>
              {selectedImages.map((media: any) => {
                const thumbnailUrl = media.variants?.thumbnail || media.file?.url

                return (
                  <div
                    key={media.id}
                    style={{
                      border: '2px solid #10b981',
                      borderRadius: '8px',
                      padding: '8px',
                      background: 'white',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{
                      width: '100%',
                      paddingTop: '100%',
                      position: 'relative',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginBottom: '8px',
                    }}>
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
                    <div style={{
                      fontSize: '11px',
                      color: '#374151',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }} title={media.filename}>
                      {media.filename}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* JSON Preview */}
        {(fieldValue.tags.length > 0 || fieldValue.images.length > 0) && (
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
              maxHeight: '200px',
            }}>
              {JSON.stringify(fieldValue, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </FieldContainer>
  )
}

export const Cell = ({ item, field }: any) => {
  const value = item[field.path]

  if (!value) {
    return <div style={{ color: '#999', fontSize: '13px' }}>No data</div>
  }

  try {
    const fieldValue: FieldValue = typeof value === 'string' ? JSON.parse(value) : value

    return (
      <div style={{ fontSize: '13px', color: '#4a5568' }}>
        <span style={{ fontWeight: 500 }}>{fieldValue.images.length} images</span>
        {fieldValue.tags.length > 0 && (
          <span style={{ color: '#999', marginLeft: '4px' }}>
            ({fieldValue.tags.length} tags)
          </span>
        )}
      </div>
    )
  } catch {
    return <div style={{ color: '#ef4444', fontSize: '13px' }}>Invalid data</div>
  }
}

export const controller = (config: any): FieldController<string, string> => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: JSON.stringify({ tags: [], images: [] }),
    deserialize: (data) => {
      const value = data[config.path]

      if (value === null || value === undefined) {
        return JSON.stringify({ tags: [], images: [] })
      }

      if (typeof value === 'object') {
        return JSON.stringify(value)
      }

      if (typeof value === 'string') {
        return value
      }

      return JSON.stringify({ tags: [], images: [] })
    },
    serialize: (value) => {
      let jsonValue
      if (!value) {
        jsonValue = { tags: [], images: [] }
      } else if (typeof value === 'string') {
        try {
          jsonValue = JSON.parse(value)
        } catch {
          jsonValue = { tags: [], images: [] }
        }
      } else if (typeof value === 'object') {
        jsonValue = value
      } else {
        jsonValue = { tags: [], images: [] }
      }
      return { [config.path]: jsonValue }
    },
    validate: (value) => {
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value
        if (!parsed || typeof parsed !== 'object') {
          return 'Invalid format'
        }
        if (!Array.isArray(parsed.tags) || !Array.isArray(parsed.images)) {
          return 'Invalid format: tags and images must be arrays'
        }
        return undefined
      } catch {
        return 'Invalid JSON format'
      }
    },
  }
}
