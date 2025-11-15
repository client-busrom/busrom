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
 */
interface MediaMetadata {
  sceneNumber?: number
  sceneType?: string
  seriesNumber?: number
  specs?: string[]
  colors?: string[]
  notes?: string
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
    onChange(newMetadata)
  }

  // Scene type options
  const sceneTypeOptions = [
    { label: '请选择', value: '' },
    { label: '单独', value: '单独' },
    { label: '组合', value: '组合' },
    { label: '系列', value: '系列' },
  ]

  return (
    <FieldContainer>
      <FieldLabel>{`${field.label}（用于CMS筛选）`}</FieldLabel>

      <div style={{ display: 'grid', gap: '16px', marginTop: '8px' }}>
        {/* Scene Number */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
            场景编号 (Scene Number)
          </label>
          <TextInput
            type="number"
            value={metadata.sceneNumber?.toString() || ''}
            onChange={(e) => updateMetadata({ sceneNumber: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="例如: 1, 2, 3..."
          />
        </div>

        {/* Scene Type */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
            场景类型 (Scene Type)
          </label>
          <Select
            value={sceneTypeOptions.find(opt => opt.value === metadata.sceneType)}
            onChange={(option) => updateMetadata({ sceneType: option?.value })}
            options={sceneTypeOptions}
          />
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
            placeholder="例如: 50mm, 不锈钢, 拉丝 (用逗号分隔)"
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            多个规格请用逗号分隔
          </div>
        </div>

        {/* Colors */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
            颜色 (Colors)
          </label>
          <TextInput
            value={metadata.colors?.join(', ') || ''}
            onChange={(e) => {
              const colors = e.target.value
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
              updateMetadata({ colors: colors.length > 0 ? colors : undefined })
            }}
            placeholder="例如: 黑色, 银色, 金色 (用逗号分隔)"
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            多个颜色请用逗号分隔
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

  if (metadata.sceneNumber) parts.push(`场景${metadata.sceneNumber}`)
  if (metadata.sceneType) parts.push(metadata.sceneType)
  if (metadata.seriesNumber) parts.push(`系列${metadata.seriesNumber}`)

  if (parts.length === 0) {
    return <div style={{ color: '#999', fontSize: '13px' }}>未设置</div>
  }

  return (
    <div style={{ fontSize: '13px', color: '#4a5568' }}>
      {parts.join(' · ')}
    </div>
  )
}
