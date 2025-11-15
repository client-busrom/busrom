/**
 * Link Jump Component Block
 *
 * Displays a link with icon (lucide or media image) and optional title.
 * Structure:
 * [Icon] Title Text (optional)
 * [Icon] Link Text → URL
 */

import React, { useState } from 'react'
import { component, fields } from '@keystone-6/fields-document/component-blocks'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'
import { FilteredMediaSelector } from '../../custom-fields/FilteredMediaSelector'
import * as LucideIcons from 'lucide-react'

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

// Helper function to get Lucide icon component
function getLucideIcon(iconName: string) {
  const Icon = (LucideIcons as any)[iconName]
  return Icon || LucideIcons.ExternalLink
}

// Custom field for media ID with visual selector
function createMediaIconField() {
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
            Icon Image / 图标图片
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
                width: '40px',
                height: '40px',
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
                <div style={{ fontSize: '11px', fontWeight: 500, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedMedia.filename}
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
              + Select Icon Image
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
      return true
    },
  }
}

export const linkJump = component({
  label: '🔗 Link Jump / 链接跳转',
  schema: {
    iconType: fields.select({
      label: 'Icon Type / 图标类型',
      options: [
        { label: 'Lucide Icon / Lucide图标', value: 'lucide' },
        { label: 'Media Image / 媒体图片', value: 'media' },
      ],
      defaultValue: 'lucide',
    }),

    lucideIconName: fields.text({
      label: 'Lucide Icon Name / Lucide图标名称',
      defaultValue: 'ExternalLink',
    }),

    mediaIconId: createMediaIconField(),

    title: fields.text({
      label: 'Title (Optional) / 标题(可选)',
      defaultValue: '',
    }),

    linkText: fields.text({
      label: 'Link Display Text / 链接显示文本',
      defaultValue: 'Learn More',
    }),

    linkUrl: fields.url({
      label: 'Link URL / 链接地址',
    }),

    openInNewTab: fields.checkbox({
      label: 'Open in new tab / 新标签页打开',
      defaultValue: false,
    }),
  },

  preview: function Preview(props) {
    const iconType = props.fields.iconType.value
    const lucideIconName = props.fields.lucideIconName.value
    const mediaIconId = props.fields.mediaIconId.value
    const title = props.fields.title.value
    const linkText = props.fields.linkText.value
    const linkUrl = props.fields.linkUrl.value
    const openInNewTab = props.fields.openInNewTab.value

    return (
      <div style={{
        border: '2px solid #3b82f6',
        borderRadius: '12px',
        padding: '16px',
        backgroundColor: '#eff6ff',
      }}>
        <p style={{ margin: '0 0 12px', fontWeight: 'bold', fontSize: '13px', color: '#1e40af' }}>
          🔗 Link Jump
        </p>

        {/* Main container with icon on left */}
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '12px',
          background: 'white',
          borderRadius: '6px',
          border: '1px solid #bfdbfe',
          alignItems: 'center',
        }}>
          {/* Left side: Icon (vertically centered) */}
          <div>
            <IconPreview iconType={iconType} lucideIconName={lucideIconName} mediaIconId={mediaIconId} size={24} />
          </div>

          {/* Right side: Title and Link */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* Title row */}
            {title && (
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e40af' }}>
                {title}
              </div>
            )}

            {/* Link row */}
            <div>
              <a
                href={linkUrl || '#'}
                style={{
                  color: '#2563eb',
                  textDecoration: 'underline',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                {linkText || 'Link Text'}
              </a>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                → {linkUrl || '(no URL set)'}
                {openInNewTab && ' (new tab)'}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  chromeless: false,
})

// Icon preview component (handles both lucide and media)
function IconPreview({ iconType, lucideIconName, mediaIconId, size }: any) {
  if (iconType === 'lucide') {
    const IconComponent = getLucideIcon(lucideIconName)
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <IconComponent size={size} />
      </div>
    )
  } else {
    return <MediaIconPreview mediaIconId={mediaIconId} size={size} />
  }
}

// Media icon preview with GraphQL query
function MediaIconPreview({ mediaIconId, size }: any) {
  const { data } = useQuery(GET_MEDIA_DETAIL, {
    variables: { id: mediaIconId },
    skip: !mediaIconId,
  })

  const media = data?.media

  if (!media) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        background: '#e5e7eb',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        color: '#9ca3af',
        flexShrink: 0,
      }}>
        ?
      </div>
    )
  }

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '4px',
      overflow: 'hidden',
      flexShrink: 0,
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
  )
}
