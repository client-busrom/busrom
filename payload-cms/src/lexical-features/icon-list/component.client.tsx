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
import { Plus, Trash2, GripVertical, Link as LinkIcon, ListOrdered } from 'lucide-react'
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
      <div style={{ margin: '24px 0', padding: '24px', border: '2px solid #A08745', borderRadius: '24px', backgroundColor: '#ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#A08745', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
               <ListOrdered size={20} />
             </div>
             <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
               {isZh ? '编辑图标展示列表' : 'EDIT ICON LIST'}
             </h3>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleSave}
              style={{ padding: '10px 24px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}
            >
              {isZh ? '完成保存' : 'SAVE CHANGES'}
            </button>
            <button
              type="button"
              onClick={() => { setLocalData(data); setIsEditing(false) }}
              style={{ padding: '10px 24px', backgroundColor: 'white', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}
            >
              {isZh ? '取消' : 'CANCEL'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
          {localData.items.map((item, index) => (
            <div
              key={`edit-item-${index}`}
              onDragOver={(e) => handleDragOver(e, index)}
              style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'stretch',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '20px',
                border: draggedIndex === index ? '2px solid #A08745' : '1px solid #f3f4f6',
                boxShadow: draggedIndex === index ? '0 10px 25px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.02)',
                opacity: draggedIndex === index ? 0.6 : 1,
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnd={handleDragEnd}
                style={{ cursor: 'move', display: 'flex', alignItems: 'center', color: '#d1d5db', flexShrink: 0 }}
              >
                <GripVertical size={20} />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Row 1: Icon & Style */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                   <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px', color: '#A08745' }}>
                        {isZh ? '搜索图标' : 'SEARCH ICON'}
                      </label>
                      <InlineIconSearch
                        value={item.icon || ''}
                        onChange={(iconName) => handleItemChange(index, 'icon', iconName)}
                        isZh={isZh}
                      />
                   </div>
                   <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px', color: '#A08745' }}>
                        {isZh ? '边框样式' : 'BORDER STYLE'}
                      </label>
                      <select
                        value={item.borderStyle || 'none'}
                        onChange={(e) => handleItemChange(index, 'borderStyle', e.target.value)}
                        style={{ width: '100%', padding: '10px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <option value="none">{isZh ? '无边框' : 'No Border'}</option>
                        <option value="circle">{isZh ? '圆形背景' : 'Circle'}</option>
                        <option value="square">{isZh ? '圆角矩形' : 'Rounded Rect'}</option>
                      </select>
                   </div>
                </div>

                {/* Row 2: Text Content */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px', color: '#6b7280' }}>
                      {isZh ? '主标题内容' : 'MAIN TITLE'}
                    </label>
                    <textarea
                      value={item.title || ''}
                      onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder={isZh ? '例如: 100K+' : 'e.g. 100K+'}
                      rows={2}
                      style={{ width: '100%', padding: '12px', border: '1px solid #f3f4f6', borderRadius: '12px', fontSize: '14px', fontWeight: 700, lineHeight: 1.5, resize: 'none', backgroundColor: '#fafafa' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px', color: '#6b7280' }}>
                      {isZh ? '副标题说明' : 'SUBTITLE'}
                    </label>
                    <textarea
                      value={item.subtitle || ''}
                      onChange={(e) => handleItemChange(index, 'subtitle', e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder={isZh ? '底部说明文字...' : 'Description content...'}
                      rows={2}
                      style={{ width: '100%', padding: '12px', border: '1px solid #f3f4f6', borderRadius: '12px', fontSize: '13px', lineHeight: 1.5, resize: 'none', backgroundColor: '#fafafa' }}
                    />
                  </div>
                </div>

                {/* Row 3: Link Config */}
                <div style={{ padding: '16px', backgroundColor: '#111827', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <LinkIcon size={16} color="#A08745" />
                       <span style={{ fontSize: '12px', fontWeight: 800, color: 'white', letterSpacing: '0.5px' }}>{isZh ? '交互链接配置' : 'INTERACTIVE LINK'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>{item.enableLink ? (isZh ? '已开启' : 'ENABLED') : (isZh ? '已关闭' : 'DISABLED')}</span>
                      <button
                        type="button"
                        onClick={() => handleItemChange(index, 'enableLink', !item.enableLink)}
                        style={{
                          width: '40px', height: '22px', borderRadius: '11px', backgroundColor: item.enableLink ? '#A08745' : '#374151', 
                          position: 'relative', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s'
                        }}
                      >
                        <div style={{ position: 'absolute', top: '3px', left: item.enableLink ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'white', transition: 'left 0.2s' }} />
                      </button>
                    </div>
                  </div>

                  {item.enableLink && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          value={item.url || ''}
                          onChange={(e) => handleItemChange(index, 'url', e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          placeholder={isZh ? '点击右侧图标选择链接或输入' : 'Select link or enter URL'}
                          style={{ width: '100%', padding: '10px 40px 10px 14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '13px', color: 'white' }}
                        />
                        <button
                          type="button"
                          onClick={() => openLinkPicker(index)}
                          style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#A08745' }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', alignSelf: 'flex-start' }}>
                        <input
                          type="checkbox"
                          checked={item.openInNewTab}
                          onChange={(e) => handleItemChange(index, 'openInNewTab', e.target.checked)}
                          style={{ width: '14px', height: '14px', accentColor: '#A08745' }}
                        />
                        <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>{isZh ? '在新标签页打开' : 'OPEN IN NEW TAB'}</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {localData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  style={{ position: 'absolute', top: '20px', right: '20px', padding: '8px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ef4444' + '22'}
                  title={isZh ? '删除' : 'Delete'}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          style={{
            width: '100%', padding: '24px', backgroundColor: '#f9fafb', border: '2px dashed #e5e7eb', borderRadius: '24px', 
            color: '#9ca3af', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#A08745'; e.currentTarget.style.color = '#A08745'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#9ca3af'; }}
        >
          <Plus size={24} /> 
          <span>{isZh ? '继续添加图标项' : 'ADD NEW ICON ITEM'}</span>
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
        margin: '24px 0',
        padding: '32px',
        border: '1px solid #f3f4f6',
        borderRadius: '32px',
        cursor: 'pointer',
        backgroundColor: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        transition: 'all 0.3s'
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#e5e7eb'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#f3f4f6'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', gap: '32px', flexWrap: 'wrap' }}>
        {localData.items.map((item, index) => {
          const normalizedIcon = item.icon ? normalizeIconName(item.icon) : ''
          return (
            <div key={`preview-item-${index}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minWidth: '120px', flex: '1 1 0' }}>
              <div style={{
                width: '64px', height: '64px',
                borderRadius: item.borderStyle === 'circle' ? '50%' : item.borderStyle === 'square' ? '16px' : '0',
                backgroundColor: item.borderStyle !== 'none' ? '#e8e4d9' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px', position: 'relative'
              }}>
                {normalizedIcon ? (
                  <img
                    src={getIconSvgUrl(normalizedIcon, '#5d6b4a')}
                    alt={item.icon}
                    style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ fontSize: '24px', color: '#5d6b4a' }}>?</span>
                )}
                {item.enableLink && (
                  <div style={{
                    position: 'absolute',
                    right: '-2px',
                    top: '-2px',
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#A08745',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(160,135,69,0.3)',
                    flexShrink: 0
                  }}>
                    <LinkIcon size={10} strokeWidth={3} />
                  </div>
                )}
              </div>
              {item.title && (
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#111827', lineHeight: 1.4, whiteSpace: 'pre-line', marginBottom: '4px' }}>
                  {item.title}
                </div>
              )}
              {item.subtitle && (
                <div style={{ fontSize: '13px', color: '#9ca3af', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                  {item.subtitle}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#d1d5db' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#f3f4f6' }} />
        <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
          {isZh ? '图标列表展示' : 'ICON LIST PREVIEW'} ({localData.items.length})
        </span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#f3f4f6' }} />
      </div>
      {modal}
    </div>
  )
}
