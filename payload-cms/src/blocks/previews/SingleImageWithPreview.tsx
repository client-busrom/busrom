/**
 * Single Image Block with Inline Preview
 *
 * 显示表单字段 + 实时预览
 */
'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

export const SingleImageWithPreview: React.FC<any> = (props) => {
  // 获取所有表单字段
  const fields = useFormFields(([fields]) => fields)

  // 从 props.path 提取当前 block 的数据
  // path 格式类似: "content.root.children[0].fields"
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
    large: { maxWidth: '100%' },
    full: { maxWidth: '100%' },
  }

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      {/* 左侧：表单字段（Payload 自动渲染） */}
      <div style={{ flex: 1 }}>
        {props.children}
      </div>

      {/* 右侧：实时预览 */}
      <div
        style={{
          flex: 1,
          borderLeft: '2px solid #e5e5e5',
          paddingLeft: '2rem',
          position: 'sticky',
          top: '20px',
          alignSelf: 'start',
          maxHeight: 'calc(100vh - 100px)',
          overflow: 'auto',
        }}
      >
        {/* 预览标题 */}
        <div
          style={{
            background: '#f0f9ff',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid #bae6fd',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📺</span>
            <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#0369a1' }}>
              Live Preview
            </h4>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#0c4a6e' }}>
            实时预览将在您编辑时自动更新
          </p>
        </div>

        {/* 预览内容 */}
        <div
          style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '1.5rem',
            minHeight: '200px',
          }}
        >
          {!image?.url ? (
            <div
              style={{
                padding: '2rem',
                background: '#f9fafb',
                borderRadius: '8px',
                textAlign: 'center',
                border: '2px dashed #d1d5db',
              }}
            >
              <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.875rem' }}>
                📷 上传图片后将在此处显示预览
              </p>
            </div>
          ) : (
            <div style={{ textAlign: alignment }}>
              <div style={{ display: 'inline-block', ...sizeStyles[size] }}>
                <img
                  src={image.sizes?.card?.url || image.sizes?.thumbnail?.url || image.url}
                  alt={image.alt || caption || 'Preview'}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
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

          {/* 显示当前设置 */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div>
                <strong style={{ color: '#6b7280' }}>Alignment:</strong>{' '}
                <span style={{ color: '#111827' }}>{alignment}</span>
              </div>
              <div>
                <strong style={{ color: '#6b7280' }}>Size:</strong>{' '}
                <span style={{ color: '#111827' }}>{size}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
