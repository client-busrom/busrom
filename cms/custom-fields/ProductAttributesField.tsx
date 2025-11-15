/**
 * Product Attributess Field - Key-Value Pairs with Show/Hide Control
 *
 * 产品属性字段 - 带显示/隐藏控制的键值对
 *
 * Allows operators to manage product attributes as key-value pairs,
 * with control over which attributes are displayed on the frontend.
 */

import React from 'react'
import {
  FieldContainer,
  FieldLabel,
  TextInput,
} from '@keystone-ui/fields'
import { FieldProps } from '@keystone-6/core/types'
import { controller } from '@keystone-6/core/fields/types/json/views'

/**
 * Attributes Item Structure
 */
interface AttributesItem {
  key: string
  value: string
  isShow: boolean
}

/**
 * Attributes Array Type
 */
type Attributes = AttributesItem[]

export const Field = ({ field, value, onChange }: FieldProps<typeof controller>) => {
  // Parse JSON value
  const attributes: Attributes = React.useMemo(() => {
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : (value || [])
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [value])

  // Add new specification
  const addAttributes = () => {
    const newAttrs = [...attributes, { key: '', value: '', isShow: true }]
    onChange?.(newAttrs)
  }

  // Remove specification
  const removeAttributes = (index: number) => {
    const newAttrs = attributes.filter((_, i) => i !== index)
    onChange?.(newAttrs)
  }

  // Update specification field
  const updateAttributes = (index: number, updates: Partial<AttributesItem>) => {
    const newAttrs = attributes.map((spec, i) =>
      i === index ? { ...spec, ...updates } : spec
    )
    onChange?.(newAttrs)
  }

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>

      <div style={{ marginTop: '12px' }}>
        {/* Attributess List */}
        {attributes.length === 0 ? (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: '#999',
            background: '#f9f9f9',
            borderRadius: '8px',
            marginBottom: '12px',
          }}>
            暂无产品属性，点击下方按钮添加（填充至少3个，首页抓取到产品时使用）
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
            {attributes.map((spec, index) => (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr auto auto',
                  gap: '8px',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f9f9f9',
                  borderRadius: '8px',
                  border: '1px solid #e1e5e9',
                }}
              >
                {/* Key Input */}
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500, color: '#666' }}>
                    属性名称
                  </label>
                  <TextInput
                    value={spec.key}
                    onChange={(e) => updateAttributes(index, { key: e.target.value })}
                    placeholder="例如: 材质"
                    style={{ fontSize: '14px' }}
                  />
                </div>

                {/* Value Input */}
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500, color: '#666' }}>
                    属性值
                  </label>
                  <TextInput
                    value={spec.value}
                    onChange={(e) => updateAttributes(index, { value: e.target.value })}
                    placeholder="例如: 不锈钢"
                    style={{ fontSize: '14px' }}
                  />
                </div>

                {/* Show/Hide Toggle */}
                <div style={{ paddingTop: '20px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    userSelect: 'none',
                  }}>
                    <input
                      type="checkbox"
                      checked={spec.isShow}
                      onChange={(e) => updateAttributes(index, { isShow: e.target.checked })}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                      }}
                    />
                    <span style={{ color: spec.isShow ? '#2563eb' : '#999' }}>
                      {spec.isShow ? '显示' : '隐藏'}
                    </span>
                  </label>
                </div>

                {/* Remove Button */}
                <div style={{ paddingTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => removeAttributes(index)}
                    style={{
                      padding: '6px 12px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Button */}
        <button
          type="button"
          onClick={addAttributes}
          style={{
            padding: '10px 16px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            width: '100%',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
        >
          ➕ 添加属性
        </button>

        {/* Statistics */}
        {attributes.length > 0 && (
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: '#f0f9ff',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#0369a1',
          }}>
            共 {attributes.length} 个属性，
            其中 {attributes.filter(s => s.isShow).length} 个将在前端显示
          </div>
        )}

        {/* JSON Preview */}
        {attributes.length > 0 && (
          <details style={{ marginTop: '12px' }}>
            <summary style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#666' }}>
              📋 查看 JSON 数据
            </summary>
            <pre style={{
              marginTop: '8px',
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '6px',
              fontSize: '12px',
              overflow: 'auto',
              maxHeight: '300px',
            }}>
              {JSON.stringify(attributes, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </FieldContainer>
  )
}

/**
 * Cell Component - Display attributes in list view
 */
export const Cell = ({ item, field }: any) => {
  const value = item[field.path]

  if (!value || !Array.isArray(value)) {
    return <div style={{ color: '#999', fontSize: '13px' }}>未设置</div>
  }

  const attributes = value as Attributes
  const visibleSpecs = attributes.filter(s => s.isShow)

  if (attributes.length === 0) {
    return <div style={{ color: '#999', fontSize: '13px' }}>未设置</div>
  }

  return (
    <div style={{ fontSize: '13px', color: '#4a5568' }}>
      <span style={{ fontWeight: 500 }}>{attributes.length} 个属性</span>
      {visibleSpecs.length < attributes.length && (
        <span style={{ color: '#999', marginLeft: '4px' }}>
          ({visibleSpecs.length} 个显示)
        </span>
      )}
    </div>
  )
}
