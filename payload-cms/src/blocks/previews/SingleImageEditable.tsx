/**
 * Single Image Block - WYSIWYG Style
 *
 * 默认显示预览，点击编辑按钮才显示表单
 */
'use client'

import React, { useState } from 'react'
import { useFormFields, RenderFields } from '@payloadcms/ui'

export const SingleImageEditable: React.FC<any> = (props) => {
  const [isEditing, setIsEditing] = useState(false)

  // 获取所有表单字段
  const fields = useFormFields(([fields]) => fields)

  // 从 props.path 提取当前 block 的数据
  const getBlockData = (): any => {
    try {
      const pathStr = props.path || ''
      const parts = pathStr.split('.')
      let data: any = fields

      for (const part of parts) {
        if (!data) break
        const match = part.match(/(\w+)\[(\d+)\]/)
        if (match) {
          const [, key, idx] = match
          data = data?.[key]?.[parseInt(idx)]
        } else {
          data = data?.[part]
        }
      }

      return data || {}
    } catch {
      return {}
    }
  }

  const blockData = getBlockData()
  const { image, caption, alignment = 'center', size = 'large' } = blockData

  const sizeStyles: Record<string, React.CSSProperties> = {
    small: { maxWidth: '300px' },
    medium: { maxWidth: '600px' },
    large: { maxWidth: '900px' },
    full: { maxWidth: '100%' },
  }

  // 如果正在编辑，显示表单
  if (isEditing) {
    return (
      <div
        style={{
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          padding: '1.5rem',
          background: '#f8fafc',
        }}
      >
        {/* 编辑模式标题栏 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>✏️</span>
            <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#1e40af' }}>
              编辑图片
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            style={{
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#2563eb'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#3b82f6'
            }}
          >
            ✓ 完成编辑
          </button>
        </div>

        {/* 表单字段 */}
        <div>
          {props.field && props.field.fields ? (
            <RenderFields
              fields={props.field.fields}
              parentIndexPath={props.path}
              parentPath={props.path}
              parentSchemaPath={props.schemaPath || props.path}
              permissions={props.permissions}
              readOnly={props.readOnly}
            />
          ) : (
            <div style={{ padding: '1rem', color: '#999' }}>
              <p>Debug Info 2:</p>
              <pre style={{ fontSize: '0.75rem', overflow: 'auto', maxHeight: '300px' }}>
                {JSON.stringify({
                  hasField: !!props.field,
                  fieldKeys: props.field ? Object.keys(props.field) : [],
                  hasFields: !!(props.field && props.field.fields),
                  fieldsLength: props.field?.fields?.length,
                  path: props.path,
                  allProps: Object.keys(props),
                  fieldPreview: props.field ? {
                    slug: props.field.slug,
                    fieldsCount: props.field.fields?.length,
                  } : null
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 默认显示预览模式（WYSIWYG）
  return (
    <div
      style={{
        position: 'relative',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '1.5rem',
        background: 'white',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#3b82f6'
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e5e7eb'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* 悬停时显示的编辑按钮 */}
      <div
        style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          opacity: 0,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => {
          if (e.currentTarget.parentElement) {
            const buttons = e.currentTarget.parentElement.querySelectorAll('[data-edit-button]')
            buttons.forEach((btn) => {
              ;(btn as HTMLElement).style.opacity = '1'
            })
          }
        }}
        data-edit-button
      >
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          style={{
            padding: '0.5rem 1rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#2563eb'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#3b82f6'
          }}
        >
          <span>✏️</span>
          编辑
        </button>
      </div>

      {/* 预览内容 */}
      {!image?.url ? (
        <div
          style={{
            padding: '3rem',
            background: '#f9fafb',
            borderRadius: '8px',
            textAlign: 'center',
            border: '2px dashed #d1d5db',
            cursor: 'pointer',
          }}
          onClick={() => setIsEditing(true)}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
          <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 500 }}>
            点击添加图片
          </p>
          <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.875rem' }}>
            或点击右上角的编辑按钮
          </p>
        </div>
      ) : (
        <div style={{ textAlign: alignment }}>
          <div style={{ display: 'inline-block', ...sizeStyles[size] }}>
            <img
              src={image.sizes?.card?.url || image.sizes?.thumbnail?.url || image.url}
              alt={image.alt || caption || 'Image'}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
              }}
              onClick={() => setIsEditing(true)}
            />
            {caption && (
              <p
                style={{
                  marginTop: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontStyle: 'italic',
                }}
              >
                {caption}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 显示当前设置（仅在有图片时显示） */}
      {image?.url && (
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f3f4f6',
            display: 'flex',
            gap: '1rem',
            fontSize: '0.75rem',
            color: '#9ca3af',
          }}
        >
          <span>
            <strong>对齐:</strong> {alignment === 'left' ? '左' : alignment === 'center' ? '中' : '右'}
          </span>
          <span>
            <strong>尺寸:</strong>{' '}
            {size === 'small' ? '小' : size === 'medium' ? '中' : size === 'large' ? '大' : '全宽'}
          </span>
        </div>
      )}

      {/* CSS 让悬停时显示编辑按钮 */}
      <style>{`
        div:hover [data-edit-button] {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  )
}
