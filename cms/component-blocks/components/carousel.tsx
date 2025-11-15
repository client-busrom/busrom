/**
 * Carousel Component Block
 *
 * Carousel of items with title, image, and description.
 * Uses FilteredMediaSelector for visual media selection.
 */

import React, { useState } from 'react'
import { component, fields } from '@keystone-6/fields-document/component-blocks'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'
import { FilteredMediaSelector } from '../../custom-fields/FilteredMediaSelector'

// GraphQL query to get media details
const GET_MEDIA_DETAIL = gql`
  query GetMediaDetail($id: ID!) {
    media(where: { id: $id }) {
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

// Custom field for media ID with visual selector
function createCarouselMediaField() {
  return {
    kind: 'form' as const,
    Input({ value, onChange, autoFocus }: any) {
      const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false)

      // Fetch selected media details
      const { data } = useQuery(GET_MEDIA_DETAIL, {
        variables: { id: value },
        skip: !value,
      })

      const selectedMedia = data?.media

      return (
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>
            Image
          </label>

          {selectedMedia ? (
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f9fafb',
            }}>
              {/* Thumbnail */}
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '4px',
                overflow: 'hidden',
                background: '#e5e7eb',
                flexShrink: 0,
              }}>
                {(selectedMedia.variants?.thumbnail || selectedMedia.file?.url) && (
                  <img
                    src={selectedMedia.variants?.thumbnail || selectedMedia.file?.url}
                    alt={selectedMedia.filename}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedMedia.filename}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  {selectedMedia.width} × {selectedMedia.height}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setMediaSelectorOpen(true)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setMediaSelectorOpen(true)}
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              + Select Image
            </button>
          )}

          {/* Media Selector Modal */}
          <FilteredMediaSelector
            isOpen={mediaSelectorOpen}
            onClose={() => setMediaSelectorOpen(false)}
            onSelect={(mediaId) => {
              onChange(mediaId)
              setMediaSelectorOpen(false)
            }}
            selectedIds={value ? [value] : []}
          />
        </div>
      )
    },
    options: undefined,
    defaultValue: '',
    validate(value: any) {
      return true // Always valid
    },
  }
}

export const carousel = component({
  label: '🎠 Carousel',
  schema: {
    items: fields.array(
      fields.object({
        title: fields.text({ label: 'Title' }),
        mediaId: createCarouselMediaField(),
        text: fields.text({
          label: 'Description',
          multiline: true,
        }),
        showButton: fields.checkbox({
          label: 'Show Button / 显示按钮',
          defaultValue: false,
        }),
        buttonText: fields.text({
          label: 'Button Text / 按钮文本',
          defaultValue: 'Learn More',
        }),
        buttonLink: fields.url({
          label: 'Button Link / 按钮链接',
        }),
        buttonOpenInNewTab: fields.checkbox({
          label: 'Open in new tab / 新标签页打开',
          defaultValue: false,
        }),
      })
    ),
  },

  preview: function Preview(props) {
    const itemCount = props.fields.items.elements.length

    return (
      <div style={{
        border: '2px solid #6c757d',
        borderRadius: '12px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflow: 'auto',
      }}>
        <p style={{ margin: '0 0 12px', fontWeight: 'bold' }}>
          🎠 Carousel ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </p>
        <div style={{
          display: 'flex',
          gap: '12px',
          paddingBottom: '8px',
        }}>
          {props.fields.items.elements.map((item, idx) => {
            const mediaId = item.fields.mediaId.value
            return <CarouselItemPreview key={idx} item={item} mediaId={mediaId} />
          })}
        </div>
      </div>
    )
  },
  chromeless: false,
})

// Separate component for carousel item preview to use hooks
function CarouselItemPreview({ item, mediaId }: any) {
  const { data } = useQuery(GET_MEDIA_DETAIL, {
    variables: { id: mediaId },
    skip: !mediaId,
  })

  const media = data?.media

  return (
    <div style={{
      minWidth: '200px',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: 'white',
    }}>
      {media ? (
        <img
          src={media.variants?.small || media.file?.url}
          alt={item.fields.title.value}
          style={{ width: '100%', height: '120px', objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          width: '100%',
          height: '120px',
          background: '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
        }}>
          No image
        </div>
      )}
      <div style={{ padding: '12px' }}>
        <strong style={{ display: 'block', marginBottom: '8px' }}>
          {item.fields.title.value || 'Item Title'}
        </strong>
        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
          {item.fields.text.value || 'Description...'}
        </p>

        {/* Button preview */}
        {item.fields.showButton.value && (
          <div style={{ marginTop: '12px', textAlign: 'left' }}>
            <button style={{
              padding: '8px 16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}>
              {item.fields.buttonText.value || 'Button'}
            </button>
            <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
              → {item.fields.buttonLink.value || '(no link)'}
              {item.fields.buttonOpenInNewTab.value && ' (new tab)'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
