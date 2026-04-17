// @ts-nocheck
/**
 * IconList Component - Client-side render component for IconListNode
 * 图标列表编辑器组件
 */

'use client'

import React, { useState, useCallback } from 'react'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $getNodeByKey } from '@payloadcms/richtext-lexical/lexical'
import { useTranslation } from '@payloadcms/ui'
import { IconListNode, IconListData, IconListItem } from './node'
import { Plus, Trash2, GripVertical, Link as LinkIcon } from 'lucide-react'
import { InlineIconSearch } from '../../components/fields/IconPicker/InlineIconSearch'
import { getIconSvgUrl, normalizeIconName } from '../../components/fields/IconPicker/iconify-utils'
import { LinkPickerModal } from '../shared/LinkPickerModal'

interface IconListComponentProps {
  nodeKey: string
  data: IconListData
}

export const IconListComponent: React.FC<IconListComponentProps> = ({ nodeKey, data }) => {
  const [editor] = useLexicalComposerContext()
  const { i18n } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [localData, setLocalData] = useState<IconListData>(data)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isLinkPickerOpen, setIsLinkPickerOpen] = useState(false)
  const [pickingLinkIndex, setPickingLinkIndex] = useState<number | null>(null)

  const isZh = i18n?.language === 'zh'

  const updateNode = useCallback(
    (newData: IconListData) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if (node instanceof IconListNode) {
          node.setData(newData)
        }
      })
    },
    [editor, nodeKey],
  )

  const handleSave = () => {
    updateNode(localData)
    setIsEditing(false)
  }

  const handleAddItem = () => {
    setLocalData({
      ...localData,
      items: [...localData.items, {
        icon: 'lucide:star',
        title: '',
        subtitle: '',
        enableLink: false,
        url: '',
        openInNewTab: false,
        borderStyle: 'circle'
      }],
    })
  }

  const handleRemoveItem = (index: number) => {
    if (localData.items.length <= 1) return
    const newItems = localData.items.filter((_, i) => i !== index)
    setLocalData({ ...localData, items: newItems })
  }

  const handleItemChange = (index: number, field: keyof IconListItem, value: any) => {
    const newItems = [...localData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setLocalData({ ...localData, items: newItems })
  }

  const openLinkPicker = (index: number) => {
    setPickingLinkIndex(index)
    setIsLinkPickerOpen(true)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, overIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === overIndex) return
    const newItems = [...localData.items]
    const [draggedItem] = newItems.splice(draggedIndex, 1)
    newItems.splice(overIndex, 0, draggedItem)
    setLocalData({ ...localData, items: newItems })
    setDraggedIndex(overIndex)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const modal = (
    <LinkPickerModal
      isOpen={isLinkPickerOpen}
      onClose={() => setIsLinkPickerOpen(false)}
      onSelect={(path) => {
        if (pickingLinkIndex !== null) {
          handleItemChange(pickingLinkIndex, 'url', path)
        }
        setIsLinkPickerOpen(false)
      }}
    />
  )

  // Edit Mode
  if (isEditing) {
    return (
      <div style={{ margin: '16px 0', padding: '16px', border: '2px solid #A08745', borderRadius: '8px', backgroundColor: '#ffffff' }}>
        {/* ... Rest of Edit Mode UI ... */}
        {/* (Existing Edit UI code remains) */}
        {/* I will use a Fragment to include the modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
            {isZh ? '编辑图标列表' : 'Edit Icon List'}
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleSave}
              style={{ padding: '6px 12px', backgroundColor: '#A08745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
            >
              {isZh ? '保存' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => { setLocalData(data); setIsEditing(false) }}
              style={{ padding: '6px 12px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
            >
              {isZh ? '取消' : 'Cancel'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
          {localData.items.map((item, index) => (
            <div
              key={index}
              onDragOver={(e) => handleDragOver(e, index)}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                padding: '12px',
                backgroundColor: '#fafafa',
                borderRadius: '6px',
                border: draggedIndex === index ? '2px solid #A08745' : '1px solid #e5e7eb',
                opacity: draggedIndex === index ? 0.6 : 1,
                transition: 'opacity 0.15s ease',
              }}
            >
              <div
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnd={handleDragEnd}
                style={{ cursor: 'move', paddingTop: '4px', color: '#9ca3af', flexShrink: 0 }}
              >
                <GripVertical size={16} />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '4px', color: '#6b7280' }}>
                    {isZh ? '图标' : 'Icon'}
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ flex: 1 }}>
                      <InlineIconSearch
                        value={item.icon || ''}
                        onChange={(iconName) => handleItemChange(index, 'icon', iconName)}
                        isZh={isZh}
                      />
                    </div>
                    <div style={{ width: '120px' }}>
                      <select
                        value={item.borderStyle || 'none'}
                        onChange={(e) => handleItemChange(index, 'borderStyle', e.target.value)}
                        style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                      >
                        <option value="none">{isZh ? '无边框' : 'No Border'}</option>
                        <option value="circle">{isZh ? '圆形' : 'Circle'}</option>
                        <option value="square">{isZh ? '圆角矩形' : 'Rounded Rect'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '4px', color: '#6b7280' }}>
                      {isZh ? '标题（支持回车换行）' : 'Title (Enter for newline)'}
                    </label>
                    <textarea
                      value={item.title || ''}
                      onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onDragStart={(e) => e.stopPropagation()}
                      placeholder={isZh ? '如: 100K+' : 'e.g. 100K+'}
                      rows={2}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '4px', color: '#6b7280' }}>
                      {isZh ? '副标题（支持回车换行）' : 'Subtitle (Enter for newline)'}
                    </label>
                    <textarea
                      value={item.subtitle || ''}
                      onChange={(e) => handleItemChange(index, 'subtitle', e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onDragStart={(e) => e.stopPropagation()}
                      placeholder={isZh ? '如: Happy Customers' : 'e.g. Happy Customers'}
                      rows={2}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleItemChange(index, 'enableLink', !item.enableLink)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: item.enableLink ? '#A08745' : '#d1d5db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {item.enableLink
                        ? (isZh ? '开启链接' : 'Link Enabled')
                        : (isZh ? '关闭链接' : 'Link Disabled')
                      }
                    </button>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                      {isZh ? '点击切换链接状态' : 'Toggle to enable/disable link'}
                    </span>
                  </div>

                  {item.enableLink && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <input
                            type="text"
                            value={item.url || ''}
                            onChange={(e) => handleItemChange(index, 'url', e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onDragStart={(e) => e.stopPropagation()}
                            placeholder={isZh ? '输入链接地址' : 'Enter URL'}
                            style={{
                              width: '100%',
                              padding: '6px 32px 6px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '12px',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => openLinkPicker(index)}
                            onMouseDown={(e) => e.stopPropagation()}
                            style={{
                              position: 'absolute',
                              right: '4px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              padding: '4px',
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              color: '#6b7280',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <LinkIcon size={14} />
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="checkbox"
                          id={`newTab-${index}`}
                          checked={item.openInNewTab || false}
                          onChange={(e) => handleItemChange(index, 'openInNewTab', e.target.checked)}
                          style={{ width: '13px', height: '13px', cursor: 'pointer' }}
                        />
                        <label
                          htmlFor={`newTab-${index}`}
                          style={{ fontSize: '11px', color: '#4b5563', cursor: 'pointer', userSelect: 'none' }}
                        >
                          {isZh ? '在新标签页打开' : 'Open in New Tab'}
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {localData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  style={{ padding: '4px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flexShrink: 0, marginTop: '4px' }}
                  title={isZh ? '删除' : 'Delete'}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', backgroundColor: '#A08745', color: 'white',
            border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px',
          }}
        >
          <Plus size={16} /> {isZh ? '添加项目' : 'Add Item'}
        </button>
        {modal}
      </div>
    )
  }

  // Preview Mode
  return (
    <div
      onClick={() => setIsEditing(true)}
      style={{
        margin: '16px 0',
        padding: '16px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        cursor: 'pointer',
        backgroundColor: 'white',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        {localData.items.map((item, index) => {
          const normalizedIcon = item.icon ? normalizeIconName(item.icon) : ''
          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minWidth: '80px', flex: '1 1 0' }}>
              <div style={{
                width: '48px', height: '48px',
                borderRadius: item.borderStyle === 'circle' ? '50%' : item.borderStyle === 'square' ? '12px' : '0',
                backgroundColor: item.borderStyle !== 'none' ? '#e8e4d9' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '8px', position: 'relative'
              }}>
                {normalizedIcon ? (
                  <img
                    src={getIconSvgUrl(normalizedIcon, '#5d6b4a')}
                    alt={item.icon}
                    style={{ width: '24px', height: '24px' }}
                  />
                ) : (
                  <span style={{ fontSize: '20px', color: '#5d6b4a' }}>?</span>
                )}
                {item.enableLink && (
                  <div style={{
                    position: 'absolute',
                    right: '-4px',
                    top: '-4px',
                    backgroundColor: '#A08745',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '3px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    <LinkIcon size={10} />
                  </div>
                )}
              </div>
              {item.title && (
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', lineHeight: 1.3, whiteSpace: 'pre-line' }}>
                  {item.title}
                </div>
              )}
              {item.subtitle && (
                <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.3, marginTop: '2px', whiteSpace: 'pre-line' }}>
                  {item.subtitle}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
        {isZh ? '图标列表' : 'Icon List'} ({localData.items.length} {isZh ? '项' : 'items'}) {isZh ? '· 点击编辑' : '· Click to edit'}
      </div>
      {modal}
    </div>
  )
}
