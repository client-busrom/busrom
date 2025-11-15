/**
 * Image Gallery Component Block
 *
 * Displays multiple images in various layout options (grid, carousel, masonry).
 * Uses FilteredMediaSelector for visual media selection.
 * Each image can have its own caption.
 */

import React, { useState } from 'react'
import { component, fields } from '@keystone-6/fields-document/component-blocks'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'
import { FilteredMediaSelector } from '../../custom-fields/FilteredMediaSelector'

// GraphQL query to get media details
const GET_MEDIA_DETAILS = gql`
  query GetMediaDetails($ids: [ID!]!) {
    mediaFiles(where: { id: { in: $ids } }) {
      id
      filename
      file {
        url
      }
      variants
      width
      height
    }
  }
`

// Custom field for gallery items (media ID + caption pairs)
function createGalleryItemsField() {
  return {
    kind: 'form' as const,
    Input({ value, onChange }: any) {
      const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false)

      // Parse gallery items from JSON string
      // Format: [{ mediaId: '123', caption: 'text' }, ...]
      let galleryItems: Array<{ mediaId: string; caption: string }> = []
      try {
        galleryItems = value ? JSON.parse(value) : []
      } catch (e) {
        galleryItems = []
      }

      const mediaIds = galleryItems.map(item => item.mediaId)

      // Fetch selected media details
      const { data } = useQuery(GET_MEDIA_DETAILS, {
        variables: { ids: mediaIds },
        skip: mediaIds.length === 0,
      })

      const mediaFilesById = (data?.mediaFiles || []).reduce((acc: any, media: any) => {
        acc[media.id] = media
        return acc
      }, {})

      const updateGalleryItems = (newItems: Array<{ mediaId: string; caption: string }>) => {
        onChange(JSON.stringify(newItems))
      }

      const removeImage = (mediaId: string) => {
        const newItems = galleryItems.filter(item => item.mediaId !== mediaId)
        updateGalleryItems(newItems)
      }

      const updateCaption = (mediaId: string, caption: string) => {
        const newItems = galleryItems.map(item =>
          item.mediaId === mediaId ? { ...item, caption } : item
        )
        updateGalleryItems(newItems)
      }

      return (
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
            Gallery Images ({galleryItems.length})
          </label>

          {galleryItems.length > 0 && (
            <div style={{
              marginBottom: '12px',
              padding: '12px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              background: '#f9fafb',
            }}>
              {galleryItems.map((item, index) => {
                const media = mediaFilesById[item.mediaId]
                if (!media) return null

                return (
                  <div
                    key={item.mediaId}
                    style={{
                      marginBottom: index < galleryItems.length - 1 ? '16px' : '0',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: '#fff',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                      {/* Thumbnail */}
                      <div style={{
                        position: 'relative',
                        width: '80px',
                        height: '80px',
                        flexShrink: 0,
                        borderRadius: '6px',
                        overflow: 'hidden',
                        background: '#e5e7eb',
                      }}>
                        <img
                          src={media.variants?.thumbnail || media.file?.url}
                          alt={media.filename}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </div>

                      {/* Info and Remove Button */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          marginBottom: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {media.filename}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {media.width} × {media.height}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeImage(item.mediaId)}
                        style={{
                          padding: '8px 12px',
                          fontSize: '14px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>

                    {/* Caption Input */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#4b5563',
                      }}>
                        Caption (可选)
                      </label>
                      <textarea
                        value={item.caption || ''}
                        onChange={(e) => updateCaption(item.mediaId, e.target.value)}
                        placeholder="Enter caption for this image..."
                        style={{
                          width: '100%',
                          padding: '8px',
                          fontSize: '14px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          minHeight: '60px',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setMediaSelectorOpen(true)}
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                flex: 1,
              }}
            >
              {galleryItems.length > 0 ? '+ Add More Images' : '+ Select Images'}
            </button>
            {galleryItems.length > 0 && (
              <button
                type="button"
                onClick={() => onChange('[]')}
                style={{
                  padding: '10px 16px',
                  fontSize: '14px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Clear All
              </button>
            )}
          </div>

          {/* Media Selector Modal */}
          <FilteredMediaSelector
            isOpen={mediaSelectorOpen}
            onClose={() => setMediaSelectorOpen(false)}
            onSelect={(mediaId) => {
              // Add to existing items if not already present
              if (!galleryItems.some(item => item.mediaId === mediaId)) {
                const newItems = [...galleryItems, { mediaId, caption: '' }]
                updateGalleryItems(newItems)
              }
            }}
            selectedIds={mediaIds}
            multiple={true}
          />
        </div>
      )
    },
    options: undefined,
    defaultValue: '[]',
    validate() {
      return true // Always valid
    },
  }
}

export const imageGallery = component({
  label: '🖼️ Image Gallery',
  schema: {
    galleryItems: createGalleryItemsField(),
    layout: fields.select({
      label: 'Layout',
      options: [
        { label: 'Grid (2 columns)', value: 'grid-2' },
        { label: 'Grid (3 columns)', value: 'grid-3' },
        { label: 'Grid (4 columns)', value: 'grid-4' },
        { label: 'Carousel', value: 'carousel' },
        { label: 'Masonry', value: 'masonry' },
      ],
      defaultValue: 'grid-3',
    }),
    showCaptions: fields.checkbox({
      label: 'Show Image Captions',
      defaultValue: false,
    }),
  },

  preview: function Preview(props) {
    const galleryItemsStr = props.fields.galleryItems.value
    const layout = props.fields.layout.value
    const showCaptions = props.fields.showCaptions.value

    // Parse gallery items from JSON string
    let galleryItems: Array<{ mediaId: string; caption: string }> = []
    try {
      galleryItems = galleryItemsStr ? JSON.parse(galleryItemsStr) : []
    } catch (e) {
      galleryItems = []
    }

    const mediaIds = galleryItems.map(item => item.mediaId)

    // Fetch media data for preview
    const { data } = useQuery(GET_MEDIA_DETAILS, {
      variables: { ids: mediaIds },
      skip: mediaIds.length === 0,
    })

    const mediaFilesById = (data?.mediaFiles || []).reduce((acc: any, media: any) => {
      acc[media.id] = media
      return acc
    }, {})

    const imageCount = galleryItems.length
    const columns = layout === 'grid-2' ? 2 : layout === 'grid-3' ? 3 : layout === 'grid-4' ? 4 : 3

    return (
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#f9f9f9',
      }}>
        <p style={{ margin: '0 0 12px', fontWeight: 'bold' }}>
          🖼️ Image Gallery ({imageCount} {imageCount === 1 ? 'image' : 'images'})
        </p>
        <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#666' }}>
          Layout: {layout}
        </p>
        {galleryItems.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: '12px'
          }}>
            {galleryItems.slice(0, 6).map((item) => {
              const media = mediaFilesById[item.mediaId]
              if (!media) return null

              return (
                <div key={item.mediaId} style={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #e0e0e0',
                }}>
                  <div style={{
                    aspectRatio: '1',
                    backgroundColor: '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    <img
                      src={media.variants?.thumbnail || media.file?.url}
                      alt={item.caption || media.filename}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  {showCaptions && item.caption && (
                    <div style={{
                      padding: '8px',
                      fontSize: '12px',
                      color: '#666',
                      backgroundColor: '#f9f9f9',
                    }}>
                      {item.caption}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{
            padding: '40px',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#9ca3af',
            background: '#fff',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
            <div style={{ fontSize: '14px' }}>Click "Edit" to select images</div>
          </div>
        )}
      </div>
    )
  },
  chromeless: false,
})
