/**
 * Grouped Tags Field - Tag Selection with Type Grouping
 *
 * 分组标签字段 - 按类型分组的标签选择器
 *
 * Displays tags grouped by their type for easier selection
 */

import React from 'react'
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields'
import { FieldProps } from '@keystone-6/core/types'
import { gql, useQuery, useMutation } from '@keystone-6/core/admin-ui/apollo'

// Tag type labels
const TAG_TYPE_LABELS: Record<string, { en: string; zh: string }> = {
  PRODUCT_SERIES: { en: 'Product Series', zh: '产品系列' },
  FUNCTION_TYPE: { en: 'Function Type', zh: '功能类型' },
  SCENE_TYPE: { en: 'Scene Type', zh: '场景类型' },
  SPEC: { en: 'Specification', zh: '规格' },
  COLOR: { en: 'Color', zh: '颜色' },
  CUSTOM: { en: 'Custom', zh: '自定义' },
}

// GraphQL query to fetch all tags
const GET_TAGS_QUERY = gql`
  query GetAllMediaTags {
    mediaTags(orderBy: { order: asc }) {
      id
      slug
      name
      type
      order
    }
  }
`

// GraphQL mutation to create a new tag
const CREATE_TAG_MUTATION = gql`
  mutation CreateMediaTag($data: MediaTagCreateInput!) {
    createMediaTag(data: $data) {
      id
      slug
      name
      type
      order
    }
  }
`

interface MediaTag {
  id: string
  slug: string
  name: any
  type: string
  order: number
}

interface GroupedTags {
  [type: string]: MediaTag[]
}

export const Field = ({ field, value, onChange }: FieldProps<any>) => {
  const { data, loading, error, refetch } = useQuery(GET_TAGS_QUERY)
  const [createTag] = useMutation(CREATE_TAG_MUTATION)

  // State for new tag creation form
  const [creatingType, setCreatingType] = React.useState<string | null>(null)
  const [newTagNameZh, setNewTagNameZh] = React.useState('')
  const [newTagNameEn, setNewTagNameEn] = React.useState('')
  const [isCreating, setIsCreating] = React.useState(false)

  // Parse selected tag IDs from value
  const selectedIds = React.useMemo(() => {
    if (!value) return new Set<string>()
    const ids = Array.isArray(value) ? value : []
    return new Set(ids.map((item: any) => typeof item === 'object' ? item.id : item))
  }, [value])

  // Group tags by type
  const groupedTags: GroupedTags = React.useMemo(() => {
    if (!data?.mediaTags) return {}

    const groups: GroupedTags = {}
    data.mediaTags.forEach((tag: MediaTag) => {
      const type = tag.type || 'CUSTOM'
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(tag)
    })

    return groups
  }, [data])

  // Get tag name with both languages (try to parse JSON, fallback to slug)
  const getTagName = (tag: MediaTag): { zh: string; en: string } => {
    try {
      const nameObj = typeof tag.name === 'string' ? JSON.parse(tag.name) : tag.name
      return {
        zh: nameObj.zh || tag.slug,
        en: nameObj.en || tag.slug,
      }
    } catch {
      return {
        zh: tag.slug,
        en: tag.slug,
      }
    }
  }

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    const newSelectedIds = new Set(selectedIds)

    if (newSelectedIds.has(tagId)) {
      newSelectedIds.delete(tagId)
    } else {
      newSelectedIds.add(tagId)
    }

    // Convert to array format that Keystone expects
    const newValue = Array.from(newSelectedIds).map(id => ({ id }))
    console.log('[GroupedTagsField] toggleTag - calling onChange with:', newValue)

    // Force change detection by creating a new array reference
    onChange?.(newValue.length > 0 ? newValue : [])
  }

  // Select all tags in a group
  const selectAllInGroup = (tags: MediaTag[]) => {
    const newSelectedIds = new Set(selectedIds)
    tags.forEach(tag => newSelectedIds.add(tag.id))
    const newValue = Array.from(newSelectedIds).map(id => ({ id }))
    onChange?.(newValue)
  }

  // Deselect all tags in a group
  const deselectAllInGroup = (tags: MediaTag[]) => {
    const newSelectedIds = new Set(selectedIds)
    tags.forEach(tag => newSelectedIds.delete(tag.id))
    const newValue = Array.from(newSelectedIds).map(id => ({ id }))
    onChange?.(newValue)
  }

  // Check if all tags in a group are selected
  const isGroupFullySelected = (tags: MediaTag[]) => {
    return tags.every(tag => selectedIds.has(tag.id))
  }

  // Generate slug from type and English name
  const generateSlug = (type: string, nameEn: string): string => {
    const cleanName = nameEn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    if (type === 'CUSTOM') {
      return cleanName
    }

    // Map type to prefix
    const typePrefix: Record<string, string> = {
      'PRODUCT_SERIES': 'series',
      'FUNCTION_TYPE': 'func',
      'SCENE_TYPE': 'scene',
      'SPEC': 'spec',
      'COLOR': 'color',
    }

    const prefix = typePrefix[type] || type.toLowerCase()
    return `${prefix}-${cleanName}`
  }

  // Handle creating a new tag
  const handleCreateTag = async (type: string) => {
    if (!newTagNameZh.trim() || !newTagNameEn.trim()) {
      alert('请填写中文和英文名称')
      return
    }

    setIsCreating(true)
    try {
      // Generate slug from type and English name
      const slug = generateSlug(type, newTagNameEn)

      // Get the highest order number in this type
      const tagsInType = groupedTags[type] || []
      const maxOrder = tagsInType.length > 0 ? Math.max(...tagsInType.map(t => t.order)) : 0

      // Create the tag
      const result = await createTag({
        variables: {
          data: {
            name: JSON.stringify({ en: newTagNameEn, zh: newTagNameZh }),
            slug,
            type,
            order: maxOrder + 1,
          },
        },
      })

      // Refetch tags to update the list
      await refetch()

      // Auto-select the newly created tag
      const newTagId = result.data?.createMediaTag?.id
      if (newTagId) {
        const newSelectedIds = new Set(selectedIds)
        newSelectedIds.add(newTagId)
        const newValue = Array.from(newSelectedIds).map(id => ({ id }))
        onChange?.(newValue)
      }

      // Reset form
      setNewTagNameZh('')
      setNewTagNameEn('')
      setCreatingType(null)
    } catch (err: any) {
      alert(`创建失败: ${err.message}`)
    } finally {
      setIsCreating(false)
    }
  }

  if (loading) {
    return (
      <FieldContainer>
        <FieldLabel>{field.label}</FieldLabel>
        <div style={{ padding: '12px', color: '#666' }}>加载标签...</div>
      </FieldContainer>
    )
  }

  if (error) {
    return (
      <FieldContainer>
        <FieldLabel>{field.label}</FieldLabel>
        <div style={{ padding: '12px', color: '#e53e3e' }}>加载失败: {error.message}</div>
      </FieldContainer>
    )
  }

  const sortedTypes = Object.keys(groupedTags).sort((a, b) => {
    const order = ['PRODUCT_SERIES', 'FUNCTION_TYPE', 'SCENE_TYPE', 'SPEC', 'COLOR', 'CUSTOM']
    return order.indexOf(a) - order.indexOf(b)
  })

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>

      <div style={{ marginTop: '8px' }}>
        {/* Selected count */}
        <div style={{
          padding: '8px 12px',
          background: '#f7fafc',
          borderRadius: '6px',
          marginBottom: '12px',
          fontSize: '14px',
          color: '#4a5568',
        }}>
          已选择 <strong>{selectedIds.size}</strong> 个标签
        </div>

        {/* Tag groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sortedTypes.map(type => {
            const tags = groupedTags[type]
            const typeLabel = TAG_TYPE_LABELS[type] || { en: type, zh: type }
            const allSelected = isGroupFullySelected(tags)

            return (
              <div
                key={type}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                {/* Group header */}
                <div style={{
                  background: '#f7fafc',
                  padding: '10px 16px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#2d3748' }}>
                    {typeLabel.zh} ({typeLabel.en})
                    <span style={{ marginLeft: '8px', color: '#718096', fontWeight: 400 }}>
                      {tags.length} 个
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setCreatingType(creatingType === type ? null : type)}
                      style={{
                        padding: '4px 12px',
                        fontSize: '12px',
                        border: '1px solid #cbd5e0',
                        borderRadius: '4px',
                        background: creatingType === type ? '#e6fffa' : 'white',
                        cursor: 'pointer',
                        color: creatingType === type ? '#047857' : '#4a5568',
                      }}
                    >
                      + 新建标签
                    </button>
                    {!allSelected && (
                      <button
                        type="button"
                        onClick={() => selectAllInGroup(tags)}
                        style={{
                          padding: '4px 12px',
                          fontSize: '12px',
                          border: '1px solid #cbd5e0',
                          borderRadius: '4px',
                          background: 'white',
                          cursor: 'pointer',
                          color: '#4a5568',
                        }}
                      >
                        全选
                      </button>
                    )}
                    {allSelected && (
                      <button
                        type="button"
                        onClick={() => deselectAllInGroup(tags)}
                        style={{
                          padding: '4px 12px',
                          fontSize: '12px',
                          border: '1px solid #cbd5e0',
                          borderRadius: '4px',
                          background: 'white',
                          cursor: 'pointer',
                          color: '#4a5568',
                        }}
                      >
                        取消全选
                      </button>
                    )}
                  </div>
                </div>

                {/* Create tag form */}
                {creatingType === type && (
                  <div style={{
                    padding: '16px',
                    background: '#f0fdfa',
                    borderBottom: '1px solid #e2e8f0',
                  }}>
                    <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#047857' }}>
                      新建 {typeLabel.zh} 标签
                    </div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#4a5568' }}>
                          中文名称 *
                        </label>
                        <TextInput
                          value={newTagNameZh}
                          onChange={(e) => setNewTagNameZh(e.target.value)}
                          placeholder="例如：玻璃栏杆扶手连接件"
                          disabled={isCreating}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#4a5568' }}>
                          英文名称 *
                        </label>
                        <TextInput
                          value={newTagNameEn}
                          onChange={(e) => setNewTagNameEn(e.target.value)}
                          placeholder="例如：Glass Connected Fitting"
                          disabled={isCreating}
                        />
                        {newTagNameEn && (
                          <div style={{ fontSize: '12px', color: '#047857', marginTop: '4px' }}>
                            Slug 预览: <code style={{
                              background: '#e6fffa',
                              padding: '2px 6px',
                              borderRadius: '3px',
                              fontFamily: 'monospace'
                            }}>
                              {generateSlug(type, newTagNameEn)}
                            </code>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setCreatingType(null)
                            setNewTagNameZh('')
                            setNewTagNameEn('')
                          }}
                          disabled={isCreating}
                          style={{
                            padding: '6px 16px',
                            fontSize: '13px',
                            border: '1px solid #cbd5e0',
                            borderRadius: '4px',
                            background: 'white',
                            cursor: isCreating ? 'not-allowed' : 'pointer',
                            color: '#4a5568',
                            opacity: isCreating ? 0.5 : 1,
                          }}
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCreateTag(type)}
                          disabled={isCreating || !newTagNameZh.trim() || !newTagNameEn.trim()}
                          style={{
                            padding: '6px 16px',
                            fontSize: '13px',
                            border: 'none',
                            borderRadius: '4px',
                            background: isCreating || !newTagNameZh.trim() || !newTagNameEn.trim() ? '#cbd5e0' : '#047857',
                            cursor: isCreating || !newTagNameZh.trim() || !newTagNameEn.trim() ? 'not-allowed' : 'pointer',
                            color: 'white',
                          }}
                        >
                          {isCreating ? '创建中...' : '创建'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tag items */}
                <div style={{
                  padding: '12px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '8px',
                }}>
                  {tags.map(tag => {
                    const isSelected = selectedIds.has(tag.id)

                    return (
                      <label
                        key={tag.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 12px',
                          border: `2px solid ${isSelected ? '#3182ce' : '#e2e8f0'}`,
                          borderRadius: '6px',
                          background: isSelected ? '#ebf8ff' : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          fontSize: '14px',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = '#cbd5e0'
                            e.currentTarget.style.background = '#f7fafc'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = '#e2e8f0'
                            e.currentTarget.style.background = 'white'
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTag(tag.id)}
                          style={{
                            marginRight: '8px',
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                          }}
                        />
                        <span style={{
                          color: isSelected ? '#2c5282' : '#4a5568',
                          fontWeight: isSelected ? 500 : 400,
                        }}>
                          {(() => {
                            const tagName = getTagName(tag)
                            return `${tagName.zh} (${tagName.en})`
                          })()}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Help text */}
        <div style={{
          marginTop: '12px',
          fontSize: '13px',
          color: '#718096',
        }}>
          💡 提示：可以选择多个标签进行多维度分类
        </div>
      </div>
    </FieldContainer>
  )
}

// Cell component for list view (handles empty values gracefully)
export const Cell = ({ item, field }: any) => {
  const value = item[field.path]

  if (!value || !Array.isArray(value) || value.length === 0) {
    return <div style={{ color: '#999', fontSize: '13px' }}>未设置标签</div>
  }

  return (
    <div style={{ fontSize: '13px', color: '#4a5568' }}>
      {value.length} 个标签
    </div>
  )
}

/**
 * CardValue component for filter UI support
 * This enables the tags field to appear in the filter menu
 */
export const CardValue = ({ item, field }: any) => {
  const value = item[field.path]

  if (!value || !Array.isArray(value) || value.length === 0) {
    return <div style={{ color: '#999', fontSize: '14px' }}>未设置标签</div>
  }

  return (
    <div style={{ fontSize: '14px', color: '#4a5568' }}>
      {value.length} 个标签
    </div>
  )
}

// Export controller (required by Keystone)
export const controller = (config: any) => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: `${config.path} { id }`,
    defaultValue: [],
    deserialize: (data: any) => {
      const value = data[config.path]
      console.log('[GroupedTagsField] deserialize:', { data, value, path: config.path })
      return value || []
    },
    serialize: (value: any) => {
      console.log('[GroupedTagsField] serialize:', { value, path: config.path, type: typeof value })

      // For relationship many fields, we need to return { set: [...] } format
      // This tells Keystone to replace all relationships with the new set
      if (!value || !Array.isArray(value)) {
        return { [config.path]: { set: [] } }
      }

      // Use 'set' to replace all relationships
      return { [config.path]: { set: value.map((item: any) => ({ id: item.id })) } }
    },
    validate: (value: any) => {
      // No validation errors
      return undefined
    },
  }
}
