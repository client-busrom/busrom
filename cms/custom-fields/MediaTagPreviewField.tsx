/**
 * Media Tag Preview Field - Preview media filtered by selected tags
 *
 * 媒体标签预览字段 - 预览选中标签下的所有图片
 *
 * This is a read-only preview field shown below the heroMediaTags relationship field.
 * It queries all media that have ANY of the selected tags and displays them in a gallery.
 */

import React, { useState } from 'react'
import { FieldContainer, FieldLabel } from '@keystone-ui/fields'
import { FieldController, FieldProps } from '@keystone-6/core/types'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'
import { getCdnUrl } from '../lib/cdn-url'

// GraphQL query to get media by tag IDs
const GET_MEDIA_BY_TAGS = gql`
  query GetMediaByTags($tagIds: [ID!]!) {
    mediaFiles(where: { tags: { some: { id: { in: $tagIds } } } }, take: 100) {
      id
      filename
      file {
        url
      }
      variants
      altText
      tags {
        id
        name
      }
    }
  }
`

interface MediaTagPreviewFieldProps extends FieldProps<typeof controller> {}

export function Field({ field, value }: MediaTagPreviewFieldProps) {
  const [showPreview, setShowPreview] = useState(false)

  // Parse the tag IDs from the relationship field value
  // The value comes from the heroMediaTags relationship field
  const tagIds = value?.value || []

  // Query media files with the selected tags
  const { data, loading, error } = useQuery(GET_MEDIA_BY_TAGS, {
    variables: { tagIds },
    skip: !showPreview || tagIds.length === 0,
  })

  const mediaFiles = data?.mediaFiles || []

  return (
    <FieldContainer>
      <FieldLabel>
        {field.label} {field.description && <span style={{ color: '#666', fontSize: '0.875rem' }}>({field.description})</span>}
      </FieldLabel>

      {tagIds.length === 0 ? (
        <div style={{
          padding: '16px',
          background: '#f9fafb',
          border: '1px dashed #d1d5db',
          borderRadius: '6px',
          color: '#6b7280',
          fontSize: '14px',
        }}>
          ℹ️ 请先在上方选择媒体标签，然后点击预览查看入选图片
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '12px',
            }}
          >
            {showPreview ? '隐藏预览' : `预览入选图片 (${tagIds.length}个标签)`}
          </button>

          {showPreview && (
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              background: 'white',
            }}>
              {loading && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  加载中...
                </div>
              )}

              {error && (
                <div style={{
                  padding: '16px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  color: '#991b1b',
                  fontSize: '14px',
                }}>
                  ❌ 加载失败: {error.message}
                </div>
              )}

              {!loading && !error && mediaFiles.length === 0 && (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontSize: '14px',
                }}>
                  😔 没有找到符合条件的图片
                </div>
              )}

              {!loading && !error && mediaFiles.length > 0 && (
                <>
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
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '12px',
                  }}>
                    {mediaFiles.map((media: any) => {
                      const thumbnailUrl = media.variants?.thumbnail || media.file?.url
                      const altText = typeof media.altText === 'string'
                        ? media.altText
                        : media.altText?.en || media.filename

                      return (
                        <div
                          key={media.id}
                          style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: 'white',
                          }}
                        >
                          <div style={{
                            width: '100%',
                            paddingTop: '100%',
                            position: 'relative',
                            background: '#f3f4f6',
                          }}>
                            <img
                              src={getCdnUrl(thumbnailUrl)}
                              alt={altText}
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
                            padding: '8px',
                            fontSize: '12px',
                            color: '#6b7280',
                            borderTop: '1px solid #f3f4f6',
                          }}>
                            <div style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              marginBottom: '4px',
                            }}>
                              {media.filename}
                            </div>
                            {media.tags && media.tags.length > 0 && (
                              <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '4px',
                              }}>
                                {media.tags.map((tag: any) => (
                                  <span
                                    key={tag.id}
                                    style={{
                                      fontSize: '10px',
                                      padding: '2px 6px',
                                      background: '#e0e7ff',
                                      color: '#4338ca',
                                      borderRadius: '4px',
                                    }}
                                  >
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </FieldContainer>
  )
}

// Controller for the custom field
export const controller = (config: FieldController<any>): FieldController<any> => {
  return {
    ...config,
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: { value: [] },

    deserialize: (data) => {
      // This field gets its value from the heroMediaTags relationship
      // We need to extract the tag IDs from the parent item
      return { value: [] }
    },

    serialize: (value) => {
      // This is a read-only field, no serialization needed
      return undefined
    },

    validate: (value) => {
      return undefined // No validation needed for preview field
    },
  }
}
