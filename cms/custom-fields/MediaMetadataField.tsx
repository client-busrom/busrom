/**
 * Media Metadata Field - Structured Form UI
 *
 * 媒体元数据字段 - 结构化表单UI
 *
 * Provides a user-friendly form interface for editing media metadata
 * instead of manually typing JSON.
 */

import React from 'react'
import {
  FieldContainer,
  FieldLabel,
  TextInput,
  Select,
} from '@keystone-ui/fields'
import { FieldProps } from '@keystone-6/core/types'
import { controller } from '@keystone-6/core/fields/types/json/views'

/**
 * Metadata Structure
 *
 * For organizing media files:
 * - group: Scene group number (场景分组编号)
 * - sceneNumber: Scene number within the group (场景编号)
 * - seriesNumber: Series number for white background images (白底图系列编号)
 * - imageNumber: Image number (图片编号)
 * - specs: Technical specifications (e.g., "12x25mm", "不锈钢")
 * - notes: Additional notes
 */
interface MediaMetadata {
  group?: number          // 场景分组编号
  sceneNumber?: number    // 场景编号
  seriesNumber?: number   // 白底图系列编号
  imageNumber?: number    // 图片编号
  specs?: string[]        // 规格信息
  notes?: string          // 备注
}

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => {
  // Parse JSON value
  const metadata: MediaMetadata = React.useMemo(() => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : (value || {})
    } catch {
      return {}
    }
  }, [value])

  // Update metadata
  const updateMetadata = (updates: Partial<MediaMetadata>) => {
    const newMetadata = { ...metadata, ...updates }
    onChange(JSON.stringify(newMetadata))
  }

  return (
    <FieldContainer>
      <FieldLabel>{`${field.label}（用于CMS筛选）`}</FieldLabel>

      <div style={{ display: 'grid', gap: '16px', marginTop: '8px' }}>
        {/* Group Number */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
            分组编号 (Group Number)
          </label>
          <TextInput
            type="number"
            value={metadata.group?.toString() || ''}
            onChange={(e) => updateMetadata({ group: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="例如: 1, 2, 3..."
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            这张图片属于哪个场景分组? (用于场景图)
          </div>
        </div>

        {/* Scene Number */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
            场景编号 (Scene Number)
          </label>
          <TextInput
            type="number"
            value={metadata.sceneNumber?.toString() || ''}
            onChange={(e) => updateMetadata({ sceneNumber: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="例如: 1, 2, 3, 4, 5..."
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            这是该分组中的第几个场景? (用于场景图)
          </div>
        </div>

        {/* Series Number */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
            系列编号 (Series Number)
          </label>
          <TextInput
            type="number"
            value={metadata.seriesNumber?.toString() || ''}
            onChange={(e) => updateMetadata({ seriesNumber: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="例如: 1, 2, 3..."
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            白底产品图的系列编号 (s-X)
          </div>
        </div>

        {/* Image Number */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
            图片编号 (Image Number)
          </label>
          <TextInput
            type="number"
            value={metadata.imageNumber?.toString() || ''}
            onChange={(e) => updateMetadata({ imageNumber: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="例如: 1, 2, 3..."
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            同一组图片中的序号
          </div>
        </div>

        {/* Specs */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
            规格 (Specifications)
          </label>
          <TextInput
            value={metadata.specs?.join(', ') || ''}
            onChange={(e) => {
              const specs = e.target.value
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
              updateMetadata({ specs: specs.length > 0 ? specs : undefined })
            }}
            placeholder="例如: 12x25mm, 不锈钢 (用逗号分隔)"
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            多个规格请用逗号分隔
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
            备注 (Notes)
          </label>
          <textarea
            value={metadata.notes || ''}
            onChange={(e) => updateMetadata({ notes: e.target.value || undefined })}
            placeholder="其他说明..."
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #e1e5e9',
              borderRadius: '6px',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* JSON Preview (read-only) */}
        <details style={{ marginTop: '8px' }}>
          <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#666' }}>
            📋 查看 JSON 数据
          </summary>
          <pre style={{
            marginTop: '8px',
            padding: '12px',
            background: '#f5f5f5',
            borderRadius: '6px',
            fontSize: '12px',
            overflow: 'auto',
          }}>
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </details>
      </div>
    </FieldContainer>
  )
}

/**
 * Cell Component - Display metadata in list view
 */
export const Cell = ({ item, field }: any) => {
  const value = item[field.path]

  if (!value || typeof value !== 'object') {
    return <div style={{ color: '#999', fontSize: '13px' }}>未设置</div>
  }

  const metadata = value as MediaMetadata
  const parts: string[] = []

  // Build display
  if (metadata.group) parts.push(`分组${metadata.group}`)
  if (metadata.sceneNumber) parts.push(`场景${metadata.sceneNumber}`)
  if (metadata.seriesNumber) parts.push(`系列${metadata.seriesNumber}`)
  if (metadata.imageNumber) parts.push(`图片${metadata.imageNumber}`)

  if (parts.length === 0) {
    return <div style={{ color: '#999', fontSize: '13px' }}>未设置</div>
  }

  return (
    <div style={{ fontSize: '13px', color: '#4a5568' }}>
      {parts.join(' - ')}
    </div>
  )
}
