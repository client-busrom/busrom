// @ts-nocheck
/**
 * Block With Preview Wrapper
 *
 * 这个组件同时显示表单字段和预览
 * 表单在左边，预览在右边
 */
'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

interface BlockWithPreviewProps {
  PreviewComponent: React.ComponentType<{ data: any }>
  path: string
  fieldSchema: any
}

export const createBlockWithPreview = (
  PreviewComponent: React.ComponentType<{ data: any }>
) => {
  return (props: any) => {
    // 获取当前 block 的所有字段值
    const fieldPath = props.path || ''

    // 使用 Payload 的 useFormFields hook 获取表单数据
    const allFields = useFormFields(([fields]) => fields)

    // 从路径中提取当前 block 的数据
    const getBlockData = () => {
      try {
        // 路径格式通常是: content.root.children[0].fields
        const pathParts = fieldPath.split('.')
        let data: any = allFields

        for (const part of pathParts) {
          if (!data) break

          // 处理数组索引，例如 children[0]
          const arrayMatch = part.match(/(\w+)\[(\d+)\]/)
          if (arrayMatch) {
            const [, key, index] = arrayMatch
            data = data?.[key]?.[parseInt(index)]
          } else {
            data = data?.[part]
          }
        }

        return data || {}
      } catch (error) {
        console.error('Error extracting block data:', error)
        return {}
      }
    }

    const blockData = getBlockData()

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%' }}>
        {/* 左侧：默认表单字段 */}
        <div>
          {/* Payload 会自动渲染表单字段到这里 */}
          {props.children}
        </div>

        {/* 右侧：实时预览 */}
        <div
          style={{
            borderLeft: '2px solid #e5e5e5',
            paddingLeft: '20px',
            position: 'sticky',
            top: '20px',
            alignSelf: 'start',
            maxHeight: 'calc(100vh - 100px)',
            overflow: 'auto',
          }}
        >
          <div style={{
            background: '#f9f9f9',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#666' }}>
              📺 Live Preview
            </h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#999' }}>
              实时预览将在您编辑时更新
            </p>
          </div>

          <div style={{
            background: 'white',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            padding: '1.5rem',
            minHeight: '200px',
          }}>
            <PreviewComponent data={blockData} />
          </div>
        </div>
      </div>
    )
  }
}
