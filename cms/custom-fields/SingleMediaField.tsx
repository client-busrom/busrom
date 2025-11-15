/**
 * Single Media Field - Custom field with filtered media selector
 *
 * 单个媒体选择字段 - 带筛选功能的媒体选择器
 *
 * Use this as a replacement for: relationship({ ref: 'Media', many: false })
 */

import React, { useState } from 'react'
import { FieldContainer, FieldLabel } from '@keystone-ui/fields'
import { FieldController, FieldProps } from '@keystone-6/core/types'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'
import { FilteredMediaSelector } from './FilteredMediaSelector'

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
    }
  }
`

export const Field = ({ field, value, onChange }: FieldProps<typeof controller>) => {
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false)

  // Fetch selected media details
  const { data, loading } = useQuery(GET_MEDIA_DETAIL, {
    variables: { id: value },
    skip: !value,
  })

  const selectedMedia = data?.media

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>

      <div style={{ marginTop: '8px' }}>
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
                ID: {selectedMedia.id}
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
                onClick={() => onChange?.(null)}
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
      </div>

      {/* Media Selector Modal */}
      <FilteredMediaSelector
        isOpen={mediaSelectorOpen}
        onClose={() => setMediaSelectorOpen(false)}
        onSelect={(mediaId) => {
          onChange?.(mediaId)
        }}
        selectedIds={value ? [value] : []}
      />
    </FieldContainer>
  )
}

export const Cell = ({ item, field }: any) => {
  const value = item[field.path]

  // Value is just a media ID string
  const mediaId = typeof value === 'string' ? value : value?.id

  // Fetch media details
  const { data, loading } = useQuery(GET_MEDIA_DETAIL, {
    variables: { id: mediaId },
    skip: !mediaId,
  })

  if (!mediaId) {
    return <div style={{ color: '#999', fontSize: '13px' }}>No media</div>
  }

  if (loading) {
    return <div style={{ color: '#999', fontSize: '13px' }}>Loading...</div>
  }

  const media = data?.media

  if (!media) {
    return <div style={{ color: '#999', fontSize: '13px' }}>Media not found</div>
  }

  // Show thumbnail if available
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {(media.variants?.thumbnail || media.file?.url) && (
        <img
          src={media.variants?.thumbnail || media.file?.url}
          alt={media.filename}
          style={{
            width: '40px',
            height: '40px',
            objectFit: 'cover',
            borderRadius: '4px',
          }}
        />
      )}
      <span style={{ fontSize: '13px', color: '#4a5568' }}>
        {media.filename}
      </span>
    </div>
  )
}

export const controller = (config: any): FieldController<string | null, string | null> => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: null,
    deserialize: (data) => {
      const value = data[config.path]
      // Handle different data formats
      if (!value) return null
      if (typeof value === 'string') return value
      if (typeof value === 'object' && value.id) return value.id
      return null
    },
    serialize: (value) => {
      // Store just the media ID as a string in JSON field
      return { [config.path]: value || null }
    },
    validate: (value) => {
      return undefined
    },
  }
}
