/**
 * Hero Component Block
 *
 * Hero section with image, title, content, and optional CTA button.
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
            Hero Background Image
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
                width: '120px',
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
              + Select Background Image
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

export const hero = component({
  label: '🎯 Hero',
  schema: {
    mediaId: createMediaIdField(),
    title: fields.child({
      kind: 'inline',
      placeholder: 'Hero title...',
    }),
    content: fields.child({
      kind: 'block',
      placeholder: 'Hero content...',
      formatting: 'inherit',
      links: 'inherit',
    }),
    cta: fields.conditional(
      fields.checkbox({ label: 'Show Call to Action' }),
      {
        true: fields.object({
          text: fields.child({
            kind: 'inline',
            placeholder: 'CTA text...',
          }),
          href: fields.url({ label: 'Link' }),
        }),
        false: fields.empty(),
      }
    ),
  },

  preview: function Preview(props) {
    const mediaId = props.fields.mediaId.value

    // Fetch media data for preview
    const { data } = useQuery(GET_MEDIA_DETAIL, {
      variables: { id: mediaId },
      skip: !mediaId,
    })

    const media = data?.media
    const imageUrl = media?.variants?.large || media?.file?.url

    return (
      <div style={{
        border: '2px solid #007bff',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#f8f9fa',
        boxShadow: '0 4px 12px rgba(0,123,255,0.15)',
      }}>
        {imageUrl ? (
          <div style={{ position: 'relative' }}>
            <img
              src={imageUrl}
              alt="Hero"
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
            {media && (
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
              }}>
                {media.filename}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            height: '200px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
          }}>
            No image selected
          </div>
        )}
        <div style={{ padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px', color: '#007bff', fontSize: '24px' }}>
            {props.fields.title.element}
          </h2>
          <div style={{ marginBottom: '16px', color: '#495057' }}>
            {props.fields.content.element}
          </div>
          {props.fields.cta.discriminant && props.fields.cta.value && props.fields.cta.value.text && (
            <button style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,123,255,0.3)',
            }}>
              {props.fields.cta.value.text.element}
            </button>
          )}
        </div>
      </div>
    )
  },
  chromeless: false,
})
