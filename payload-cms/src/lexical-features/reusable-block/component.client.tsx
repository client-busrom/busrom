/**
 * ReusableBlock Component - Client Side
 */

'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import React, { useState, useEffect } from 'react'
import { ReusableBlockData, ReusableBlockNode } from './node'
import { Recycle } from 'lucide-react'

interface ReusableBlockComponentProps {
  nodeKey: string
  data: ReusableBlockData
}

interface ReusableBlock {
  id: string | number
  slug: string
  title?: string | { en?: string; zh?: string; [key: string]: any }
  subtitle?: string | { en?: string; zh?: string; [key: string]: any }
  blockType?: string
  contentTranslation?: any // Lexical content
}

export const ReusableBlockComponent: React.FC<ReusableBlockComponentProps> = ({ nodeKey, data }) => {
  const [editor] = useLexicalComposerContext()
  const [isEditing, setIsEditing] = useState(false)
  const [localData, setLocalData] = useState<ReusableBlockData>(data)
  const [reusableBlocks, setReusableBlocks] = useState<ReusableBlock[]>([])
  const [selectedBlock, setSelectedBlock] = useState<ReusableBlock | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 获取多语言字段的显示文本
  const getDisplayText = (field: string | { en?: string; zh?: string; [key: string]: any } | undefined): string => {
    if (!field) return ''
    if (typeof field === 'string') return field
    return field.zh || field.en || Object.values(field)[0] || ''
  }

  // Load reusable blocks
  useEffect(() => {
    const loadReusableBlocks = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/reusable-blocks?limit=100')
        if (response.ok) {
          const data = await response.json()
          setReusableBlocks(data.docs || [])
        }
      } catch (error) {
        console.error('Failed to load reusable blocks:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadReusableBlocks()
  }, [])

  // Load selected block info
  useEffect(() => {
    const loadSelectedBlock = async () => {
      const blockId = typeof localData.reusableBlock === 'object' ? localData.reusableBlock?.id : localData.reusableBlock
      if (!blockId) {
        setSelectedBlock(null)
        return
      }

      try {
        const response = await fetch(`/api/reusable-blocks/${blockId}`)
        if (response.ok) {
          const data = await response.json()
          setSelectedBlock(data)
        }
      } catch (error) {
        console.error('Failed to load reusable block:', error)
      }
    }

    loadSelectedBlock()
  }, [localData.reusableBlock])

  const handleSave = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as ReusableBlockNode
      if (node) {
        node.setData(localData)
      }
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setLocalData(data)
    setIsEditing(false)
  }

  const handleBlockSelect = (blockId: string) => {
    setLocalData({ ...localData, reusableBlock: { id: blockId } })
  }

  // Get preview text from content
  const getContentPreview = (content: any): string => {
    if (!content) return ''

    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content
      const items: string[] = []

      // Extract content from Lexical nodes
      const extractContent = (node: any): void => {
        if (!node) return

        // Text node
        if (node.type === 'text' && node.text) {
          items.push(node.text)
          return
        }

        // Custom feature nodes
        const nodeTypeLabels: Record<string, string> = {
          'singleImage': '单张图片',
          'custom-image-gallery': '图片画廊',
          'ctaButton': '行动按钮',
          'notice': '提示框',
          'hero': '英雄横幅',
          'linkJump': '快速链接',
          'carousel': '轮播图',
          'marqueeLinks': '滚动链接',
          'formBlock': '表单块',
        }

        if (nodeTypeLabels[node.type]) {
          // Add custom feature label with data preview
          const label = nodeTypeLabels[node.type]
          const data = node.data || {}

          // Try to extract meaningful info from data
          let info = ''
          if (data.title) info = `: ${data.title}`
          else if (data.text) info = `: ${data.text}`
          else if (data.caption) info = `: ${data.caption}`
          else if (data.type) info = ` (${data.type})`

          items.push(`${label}${info}`)
          return
        }

        // Recurse into children
        if (node.children && Array.isArray(node.children)) {
          node.children.forEach(extractContent)
        }

        // Handle root
        if (node.root) {
          extractContent(node.root)
        }
      }

      extractContent(parsed)
      const preview = items.filter(item => item.trim()).join(' | ')
      return preview.substring(0, 200) + (preview.length > 200 ? '...' : '')
    } catch (error) {
      return '无法预览内容'
    }
  }

  if (isEditing) {
    return (
      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          margin: '8px 0',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>编辑可复用块</h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: '6px 14px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: '6px 14px',
                backgroundColor: '#A08745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              保存
            </button>
          </div>
        </div>

        {/* Block selection */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
            选择可复用块
          </label>
          {isLoading ? (
            <div style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>加载中...</div>
          ) : (
            <select
              value={typeof localData.reusableBlock === 'object' ? localData.reusableBlock?.id || '' : localData.reusableBlock || ''}
              onChange={(e) => handleBlockSelect(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onDragStart={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="">-- 选择可复用块 --</option>
              {reusableBlocks.map((block) => (
                <option key={block.id} value={block.id}>
                  {getDisplayText(block.title) || block.slug}
                </option>
              ))}
            </select>
          )}
          {reusableBlocks.length === 0 && !isLoading && (
            <p style={{ marginTop: '6px', fontSize: '12px', color: '#ef4444' }}>
              没有可用的可复用块，请先创建可复用块
            </p>
          )}
        </div>

        {/* Preview selected block */}
        {selectedBlock && (
          <div style={{
            marginTop: '12px',
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>
              内容预览
            </div>
            {selectedBlock.subtitle && (
              <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px', fontStyle: 'italic' }}>
                {getDisplayText(selectedBlock.subtitle)}
              </div>
            )}
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              lineHeight: '1.6',
              maxHeight: '120px',
              overflowY: 'auto',
            }}>
              {getContentPreview(selectedBlock.contentTranslation) || '无内容'}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Preview mode
  const blockId = typeof localData.reusableBlock === 'object' ? localData.reusableBlock?.id : localData.reusableBlock

  return (
    <div
      onClick={() => setIsEditing(true)}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        margin: '8px 0',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            backgroundColor: '#A08745',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Recycle size={24} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
            可复用块
          </div>
          {selectedBlock ? (
            <>
              <div style={{ fontSize: '14px', color: '#A08745', marginBottom: '6px', fontWeight: 500 }}>
                {getDisplayText(selectedBlock.title) || selectedBlock.slug}
              </div>
              {selectedBlock.subtitle && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontStyle: 'italic' }}>
                  {getDisplayText(selectedBlock.subtitle)}
                </div>
              )}
              <div
                style={{
                  fontSize: '12px',
                  color: '#4b5563',
                  backgroundColor: '#f9fafb',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  marginTop: '8px',
                  border: '1px solid #e5e7eb',
                  lineHeight: '1.6',
                  maxHeight: '100px',
                  overflowY: 'auto',
                }}
              >
                {getContentPreview(selectedBlock.contentTranslation) || '空内容'}
              </div>
            </>
          ) : (
            <div style={{ fontSize: '13px', color: '#ef4444', padding: '8px 0' }}>
              {blockId ? '⚠️ 可复用块未找到' : '⚠️ 未选择可复用块'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
