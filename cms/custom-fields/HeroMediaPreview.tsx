/**
 * Hero Media Preview - Display preview of media filtered by selected tags
 *
 * 顶部图片预览 - 显示选中标签下的所有图片预览
 */

import React from 'react'
import { FieldContainer, FieldLabel } from '@keystone-ui/fields'
import { FieldController, FieldProps } from '@keystone-6/core/types'

interface MediaPreviewItem {
  id: string
  url: string
  filename: string
}

interface HeroMediaPreviewProps extends FieldProps<typeof controller> {
  value: MediaPreviewItem[]
}

export function Field({ field, value }: HeroMediaPreviewProps) {
  const mediaFiles = value || []

  if (mediaFiles.length === 0) {
    return (
      <FieldContainer>
        <FieldLabel>{field.label}</FieldLabel>
        <div style={{
          padding: '16px',
          background: '#f9fafb',
          border: '1px dashed #d1d5db',
          borderRadius: '6px',
          color: '#6b7280',
          fontSize: '14px',
        }}>
          ℹ️ 请先在上方选择媒体标签，保存后即可预览入选图片
        </div>
      </FieldContainer>
    )
  }

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>

      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        background: 'white',
      }}>
        <div style={{
          marginBottom: '12px',
          padding: '8px 12px',
          background: '#f0f9ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#1e40af',
        }}>
          ✅ 找到 <strong>{mediaFiles.length}</strong> 张图片，这些图片将用于顶部瀑布流动效
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '12px',
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '4px',
        }}>
          {mediaFiles.map((media) => (
            <div
              key={media.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
                background: 'white',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                width: '100%',
                paddingTop: '100%',
                position: 'relative',
                background: '#f3f4f6',
              }}>
                <img
                  src={media.url}
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
              </div>
              <div style={{
                padding: '6px',
                fontSize: '11px',
                color: '#6b7280',
                borderTop: '1px solid #f3f4f6',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {media.filename}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#92400e',
        }}>
          💡 前端将查询这些 MediaTag 下的所有图片用于瀑布流动效
        </div>
      </div>
    </FieldContainer>
  )
}

// Controller for the virtual field
export const controller = (config: FieldController<any>): FieldController<MediaPreviewItem[]> => {
  return {
    ...config,
    path: config.path,
    label: config.label || 'Hero Media Preview (顶部图片预览)',
    description: config.description,
    graphqlSelection: `${config.path} { id url filename }`,
    defaultValue: [],

    deserialize: (data) => {
      const value = data[config.path]
      return Array.isArray(value) ? value : []
    },

    serialize: () => {
      // Virtual field, no serialization
      return undefined
    },

    validate: () => {
      // Virtual field, no validation
      return undefined
    },
  }
}
