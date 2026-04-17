// @ts-nocheck
/**
 * SeriesReusableBlock Component - Client Side
 *
 * Dedicated for series detail templates.
 */

'use client'

import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $getNodeByKey } from '@payloadcms/richtext-lexical/lexical'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from '@payloadcms/ui'
import { SeriesReusableBlockData, SeriesReusableBlockNode } from './node'
import { Package, ExternalLink, Search, X } from 'lucide-react'

interface SeriesReusableBlockComponentProps {
  nodeKey: string
  data: SeriesReusableBlockData
}

interface SeriesReusableBlock {
  id: string | number
  slug: string
  title?: string | { en?: string; zh?: string; [key: string]: any }
  status?: string
  contentTranslation?: any
  updatedAt?: string
}

const STATUS_OPTIONS = [
  { value: '', label: { en: 'All Status', zh: '全部状态' } },
  { value: 'published', label: { en: 'Published', zh: '已发布' } },
  { value: 'draft', label: { en: 'Draft', zh: '草稿' } },
  { value: 'archived', label: { en: 'Archived', zh: '归档' } },
]

export const SeriesReusableBlockComponent: React.FC<SeriesReusableBlockComponentProps> = ({ nodeKey, data }) => {
  const [editor] = useLexicalComposerContext()
  const { i18n } = useTranslation()
  const lang = i18n?.language === 'zh' ? 'zh' : 'en'

  const [isEditing, setIsEditing] = useState(false)
  const [localData, setLocalData] = useState<SeriesReusableBlockData>(data)
  const [reusableBlocks, setReusableBlocks] = useState<SeriesReusableBlock[]>([])
  const [selectedBlock, setSelectedBlock] = useState<SeriesReusableBlock | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Filters
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const t = useCallback((en: string, zh: string) => lang === 'zh' ? zh : en, [lang])

  const getDisplayText = (field: string | { en?: string; zh?: string; [key: string]: any } | undefined): string => {
    if (!field) return ''
    if (typeof field === 'string') return field
    return field[lang] || field.en || field.zh || Object.values(field)[0] || ''
  }

  // Load series reusable blocks
  useEffect(() => {
    const loadReusableBlocks = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/series-reusable-blocks?limit=100&sort=-updatedAt')
        if (response.ok) {
          const data = await response.json()
          setReusableBlocks(data.docs || [])
        }
      } catch (error) {
        console.error('Failed to load series reusable blocks:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadReusableBlocks()
  }, [])

  // Load selected block info
  useEffect(() => {
    const loadSelectedBlock = async () => {
      const blockId = typeof localData.seriesReusableBlock === 'object' ? localData.seriesReusableBlock?.id : localData.seriesReusableBlock
      if (!blockId) {
        setSelectedBlock(null)
        return
      }

      try {
        const response = await fetch(`/api/series-reusable-blocks/${blockId}`)
        if (response.ok) {
          const data = await response.json()
          setSelectedBlock(data)
        }
      } catch (error) {
        console.error('Failed to load series reusable block:', error)
      }
    }

    loadSelectedBlock()
  }, [localData.seriesReusableBlock])

  // Filtered blocks
  const filteredBlocks = useMemo(() => {
    return reusableBlocks.filter((block) => {
      // Search filter
      if (searchText) {
        const search = searchText.toLowerCase()
        const title = getDisplayText(block.title).toLowerCase()
        const slug = (block.slug || '').toLowerCase()
        if (!title.includes(search) && !slug.includes(search)) return false
      }
      // Status filter
      if (statusFilter && block.status !== statusFilter) return false
      return true
    })
  }, [reusableBlocks, searchText, statusFilter, lang])

  const handleSave = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as SeriesReusableBlockNode
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
    setLocalData({ ...localData, seriesReusableBlock: { id: blockId } })
  }

  const getBlockEditUrl = (blockId: string | number): string => {
    return `/admin/collections/series-reusable-blocks/${blockId}`
  }

  const getStatusLabel = (status: string): string => {
    const found = STATUS_OPTIONS.find((s) => s.value === status)
    return found ? found.label[lang] : status
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'published': return '#16a34a'
      case 'draft': return '#d97706'
      case 'archived': return '#6b7280'
      default: return '#6b7280'
    }
  }

  // Get preview text from content
  const getContentPreview = (content: any): string => {
    if (!content) return ''

    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content
      const items: string[] = []

      const extractContent = (node: any): void => {
        if (!node) return

        if (node.type === 'text' && node.text) {
          items.push(node.text)
          return
        }

        const nodeTypeLabels: Record<string, { en: string; zh: string }> = {
          'singleImage': { en: 'Image', zh: '单张图片' },
          'custom-image-gallery': { en: 'Gallery', zh: '图片画廊' },
          'ctaButton': { en: 'CTA Button', zh: '行动按钮' },
          'notice': { en: 'Notice', zh: '提示框' },
          'hero': { en: 'Hero', zh: '英雄横幅' },
          'linkJump': { en: 'Quick Links', zh: '快速链接' },
          'carousel': { en: 'Carousel', zh: '轮播图' },
          'marqueeLinks': { en: 'Marquee Links', zh: '滚动链接' },
          'formBlock': { en: 'Form', zh: '表单块' },
        }

        if (nodeTypeLabels[node.type]) {
          const label = nodeTypeLabels[node.type][lang]
          const data = node.data || {}
          let info = ''
          if (data.title) info = `: ${data.title}`
          else if (data.text) info = `: ${data.text}`
          else if (data.caption) info = `: ${data.caption}`
          else if (data.type) info = ` (${data.type})`
          items.push(`[${label}${info}]`)
          return
        }

        if (node.children && Array.isArray(node.children)) {
          node.children.forEach(extractContent)
        }
        if (node.root) {
          extractContent(node.root)
        }
      }

      extractContent(parsed)
      const preview = items.filter((item) => item.trim()).join(' ')
      return preview.substring(0, 200) + (preview.length > 200 ? '...' : '')
    } catch (error) {
      return t('Cannot preview content', '无法预览内容')
    }
  }

  const hasFilters = searchText || statusFilter

  const clearFilters = () => {
    setSearchText('')
    setStatusFilter('')
  }

  const selectedBlockId = typeof localData.seriesReusableBlock === 'object' ? localData.seriesReusableBlock?.id : localData.seriesReusableBlock

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
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
            {t('Edit Series Block', '编辑产品详解页复用块')}
          </h4>
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
              {t('Cancel', '取消')}
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
              {t('Save', '保存')}
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Search input */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder={t('Search by slug or title...', '搜索标识或标题...')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '13px',
                backgroundColor: 'white',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Filter row */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                padding: '6px 10px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '13px',
                backgroundColor: 'white',
                cursor: 'pointer',
                color: statusFilter ? '#1e293b' : '#6b7280',
              }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label[lang]}</option>
              ))}
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px',
                  backgroundColor: '#fef2f2',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <X size={12} />
                {t('Clear', '清除')}
              </button>
            )}
          </div>
        </div>

        {/* Block list */}
        <div style={{
          maxHeight: '300px',
          overflowY: 'auto',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
        }}>
          {isLoading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
              {t('Loading...', '加载中...')}
            </div>
          ) : filteredBlocks.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
              {hasFilters
                ? t('No blocks match the filters', '没有匹配筛选条件的区块')
                : t('No series blocks available', '没有可用的产品详解页区块')
              }
            </div>
          ) : (
            filteredBlocks.map((block, index) => {
              const isSelected = String(selectedBlockId) === String(block.id)
              return (
                <div
                  key={block.id}
                  onClick={() => handleBlockSelect(String(block.id))}
                  style={{
                    padding: '10px 14px',
                    borderBottom: index < filteredBlocks.length - 1 ? '1px solid #f3f4f6' : 'none',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#fffbf0' : 'white',
                    borderLeft: isSelected ? '3px solid #A08745' : '3px solid transparent',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#f9fafb'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? '#A08745' : '#1e293b' }}>
                      {getDisplayText(block.title) || block.slug}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {block.status && (
                        <span style={{
                          fontSize: '11px',
                          padding: '1px 6px',
                          borderRadius: '3px',
                          backgroundColor: block.status === 'published' ? '#f0fdf4' : block.status === 'draft' ? '#fffbeb' : '#f9fafb',
                          color: getStatusColor(block.status),
                        }}>
                          {getStatusLabel(block.status)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {block.slug}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Result count */}
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {t(`${filteredBlocks.length} block(s)`, `${filteredBlocks.length} 个区块`)}
            {hasFilters && ` / ${t(`${reusableBlocks.length} total`, `共 ${reusableBlocks.length} 个`)}`}
          </span>
        </div>

        {/* Preview selected block */}
        {selectedBlock && (
          <div style={{
            marginTop: '12px',
            padding: '14px',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>
                {t('Preview', '内容预览')}
              </div>
              <a
                href={getBlockEditUrl(selectedBlock.id)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  fontSize: '12px',
                  color: '#A08745',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
                onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
              >
                <ExternalLink size={12} />
                {t('Edit Block', '编辑详解页块')}
              </a>
            </div>
            <div style={{ fontSize: '13px', color: '#A08745', fontWeight: 500, marginBottom: '4px' }}>
              {getDisplayText(selectedBlock.title) || selectedBlock.slug}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              lineHeight: '1.6',
              maxHeight: '80px',
              overflowY: 'auto',
            }}>
              {getContentPreview(selectedBlock.contentTranslation) || t('No content', '无内容')}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ===========================
  // Preview mode (not editing)
  // ===========================
  const blockId = typeof localData.seriesReusableBlock === 'object' ? localData.seriesReusableBlock?.id : localData.seriesReusableBlock

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
          <Package size={24} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
              {t('Series Detail Block', '产品详解页复用块')}
            </div>
            {selectedBlock && (
              <a
                href={getBlockEditUrl(selectedBlock.id)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  fontSize: '12px',
                  color: '#A08745',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#fffbf0',
                  border: '1px solid #f0e6cc',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef3c7'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fffbf0'
                }}
              >
                <ExternalLink size={12} />
                {t('Edit', '编辑')}
              </a>
            )}
          </div>
          {selectedBlock ? (
            <>
              <div style={{ fontSize: '14px', color: '#A08745', marginBottom: '4px', fontWeight: 500 }}>
                {getDisplayText(selectedBlock.title) || selectedBlock.slug}
              </div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                {selectedBlock.status && (
                  <span style={{
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '3px',
                    backgroundColor: selectedBlock.status === 'published' ? '#f0fdf4' : '#fffbeb',
                    color: getStatusColor(selectedBlock.status),
                  }}>
                    {getStatusLabel(selectedBlock.status)}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#4b5563',
                  backgroundColor: '#f9fafb',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  marginTop: '4px',
                  border: '1px solid #e5e7eb',
                  lineHeight: '1.6',
                  maxHeight: '100px',
                  overflowY: 'auto',
                }}
              >
                {getContentPreview(selectedBlock.contentTranslation) || t('Empty content', '空内容')}
              </div>
            </>
          ) : (
            <div style={{ fontSize: '13px', color: '#ef4444', padding: '8px 0' }}>
              {blockId
                ? `⚠️ ${t('Series block not found', '详解页内容块未找到')}`
                : `⚠️ ${t('No series block selected', '未选择详解页内容块')}`
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
