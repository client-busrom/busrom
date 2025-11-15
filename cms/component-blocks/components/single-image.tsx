/**
 * Enhanced Single Image Component Block
 *
 * This version stores media ID as text and uses a custom FormField
 * to provide visual media selector with FilteredMediaSelector.
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
function createMediaIdField() {
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
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
            Image
          </label>

          {selectedMedia ? (
            <div style={{
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#f9fafb',
            }}>
              {/* Thumbnail */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '6px',
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
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937', marginBottom: '4px' }}>
                  {selectedMedia.filename}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {selectedMedia.width} × {selectedMedia.height}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setMediaSelectorOpen(true)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
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
                padding: '12px 16px',
                fontSize: '14px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              + Select Media
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

export const singleImage = component({
  label: '📷 Single Image',
  schema: {
    mediaId: createMediaIdField(),
    text: fields.text({
      label: 'Caption',
      defaultValue: ''
    }),
    alignment: fields.select({
      label: 'Alignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
      defaultValue: 'center',
    }),
    size: fields.select({
      label: 'Size',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
        { label: 'Full Width', value: 'full' },
      ],
      defaultValue: 'large',
    }),
  },

  preview: function Preview(props) {
    const mediaId = props.fields.mediaId.value
    const alignment = props.fields.alignment.value
    const size = props.fields.size.value
    const caption = props.fields.text.value

    // Fetch media data for preview
    const { data } = useQuery(GET_MEDIA_DETAIL, {
      variables: { id: mediaId },
      skip: !mediaId,
    })

    const media = data?.media

    const sizeWidths = {
      small: '40%',
      medium: '60%',
      large: '80%',
      full: '100%',
    }

    return (
      <div style={{ textAlign: alignment, marginTop: '12px', marginBottom: '12px' }}>
        {media ? (
          <div style={{ display: 'inline-block', maxWidth: sizeWidths[size as keyof typeof sizeWidths] }}>
            <div style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <img
                src={media.variants?.medium || media.file?.url}
                alt={caption || media.filename}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              {/* Image info overlay */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                color: 'white',
                padding: '20px 12px 8px',
                fontSize: '11px',
              }}>
                <div style={{ fontWeight: 500 }}>{media.filename}</div>
                {media.width && media.height && (
                  <div style={{ opacity: 0.8, marginTop: '2px' }}>
                    {media.width} × {media.height}
                  </div>
                )}
              </div>
            </div>
            {caption && (
              <p style={{
                fontSize: '14px',
                color: '#666',
                marginTop: '8px',
                fontStyle: 'italic',
              }}>
                {caption}
              </p>
            )}
          </div>
        ) : mediaId ? (
          <div style={{
            padding: '40px',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            background: '#eff6ff',
            textAlign: 'center',
            display: 'inline-block',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
            <div style={{ fontSize: '14px', color: '#1e40af' }}>
              Loading image...
            </div>
          </div>
        ) : (
          <div style={{
            padding: '40px',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            display: 'inline-block',
            color: '#9ca3af',
            background: '#f9fafb',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
            <div style={{ fontSize: '14px' }}>Click "Edit" to select an image</div>
          </div>
        )}
      </div>
    )
  },
  chromeless: false,
})
