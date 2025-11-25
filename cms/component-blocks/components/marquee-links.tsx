/**
 * Marquee Links Component Block
 *
 * Auto-scrolling marquee of link items with icons.
 * Each item contains icon (lucide or media) + link text + URL.
 * Supports add/remove/reorder items and configurable scroll speed.
 */

import React, { useState } from 'react'
import { component, fields } from '@keystone-6/fields-document/component-blocks'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'
import { FilteredMediaSelector } from '../../custom-fields/FilteredMediaSelector'
import { getCdnUrl } from '../../lib/cdn-url'
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
  return Icon || LucideIcons.Link
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
                    src={getCdnUrl(selectedMedia.variants?.thumbnail || selectedMedia.file?.url)}
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

export const marqueeLinks = component({
  label: '🎪 Marquee Links / 走马灯链接条',
  schema: {
    speed: fields.select({
      label: 'Scroll Speed / 滚动速度',
      options: [
        { label: 'Slow / 慢', value: 'slow' },
        { label: 'Medium / 中', value: 'medium' },
        { label: 'Fast / 快', value: 'fast' },
      ],
      defaultValue: 'medium',
    }),

    items: fields.array(
      fields.object({
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
          defaultValue: 'Link',
        }),

        mediaIconId: createMediaIconField(),

        linkText: fields.text({
          label: 'Link Text / 链接文本',
          defaultValue: 'Link Item',
        }),

        linkUrl: fields.url({
          label: 'Link URL / 链接地址',
        }),

        openInNewTab: fields.checkbox({
          label: 'Open in new tab / 新标签页打开',
          defaultValue: false,
        }),
      }),
      {
        label: 'Marquee Items / 走马灯项目',
        itemLabel: (props) => props.fields.linkText.value || 'Link Item',
      }
    ),
  },

  preview: function Preview(props) {
    const itemCount = props.fields.items.elements.length
    const speed = props.fields.speed.value

    const speedLabels = {
      slow: '慢 (30s)',
      medium: '中 (20s)',
      fast: '快 (10s)',
    }

    return (
      <div style={{
        border: '2px solid #8b5cf6',
        borderRadius: '12px',
        padding: '16px',
        backgroundColor: '#faf5ff',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}>
        <p style={{ margin: '0 0 12px', fontWeight: 'bold', fontSize: '13px', color: '#6b21a8' }}>
          🎪 Marquee Links ({itemCount} {itemCount === 1 ? 'item' : 'items'}, Speed: {speedLabels[speed as keyof typeof speedLabels]})
        </p>

        {/* Marquee preview container */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e9d5ff',
          padding: '12px',
          overflow: 'auto',
        }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            paddingBottom: '8px',
          }}>
            {props.fields.items.elements.map((item, idx) => (
              <MarqueeItemPreview key={idx} item={item} />
            ))}
          </div>

          {/* Marquee hint */}
          <div style={{
            marginTop: '8px',
            fontSize: '11px',
            color: '#9333ea',
            textAlign: 'center',
            fontStyle: 'italic',
          }}>
            ← Items will auto-scroll left continuously on frontend
          </div>
        </div>
      </div>
    )
  },
  chromeless: false,
})

// Marquee item preview component
function MarqueeItemPreview({ item }: any) {
  const iconType = item.fields.iconType.value
  const lucideIconName = item.fields.lucideIconName.value
  const mediaIconId = item.fields.mediaIconId.value
  const linkText = item.fields.linkText.value
  const linkUrl = item.fields.linkUrl.value
  const openInNewTab = item.fields.openInNewTab.value

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      paddingRight: '16px',
      borderRight: '2px solid #e9d5ff',
      flexShrink: 0,
    }}>
      {/* Icon */}
      <IconPreview iconType={iconType} lucideIconName={lucideIconName} mediaIconId={mediaIconId} size={20} />

      {/* Link info */}
      <div style={{ minWidth: 0 }}>
        <a
          href={linkUrl || '#'}
          style={{
            color: '#7c3aed',
            textDecoration: 'underline',
            fontSize: '13px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          {linkText || 'Link Item'}
        </a>
        <span style={{
          fontSize: '10px',
          color: '#9ca3af',
          marginLeft: '6px',
          whiteSpace: 'nowrap',
        }}>
          ({linkUrl || 'no URL'}{openInNewTab && ' ↗'})
        </span>
      </div>
    </div>
  )
}

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
        color: '#7c3aed',
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
        src={getCdnUrl(media.variants?.thumbnail || media.file?.url)}
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
