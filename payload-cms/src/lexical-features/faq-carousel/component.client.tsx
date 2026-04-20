// @ts-nocheck
'use client'

import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $getNodeByKey } from '@payloadcms/richtext-lexical/lexical'
import { useTranslation } from '@payloadcms/ui'
import React, { useState, useEffect } from 'react'
import { FaqCarouselData, FaqCarouselNode, FaqCarouselItem } from './node'
import { 
  X, Plus, Search, Trash2, GripVertical, 
  Image as ImageIcon, HelpCircle, 
  ChevronLeft, ChevronRight, Sparkles 
} from 'lucide-react'
import { MediaPickerModal } from '../image-gallery/component.client'
import { ApplicationPickerModal } from '../application-carousel/component.client'

// --- Local Helpers ---

const getLocalizedString = (val: any, lang: string = 'en') => {
  if (!val) return ''
  if (typeof val === 'string') return val
  const pref = lang.split('-')[0]
  return val[pref] || val['en'] || val['zh'] || Object.values(val)[0] || ''
}

// --- GenericPickerModal (Shared Internal) ---

interface GenericPickerModalProps {
  title: string
  collection: string
  isZh: boolean
  onClose: () => void
  onSelect: (selected: any[]) => void
  selectedIds: any[]
  i18n: any
  multiple?: boolean
  filter?: Record<string, any>
}

const GenericPickerModal: React.FC<GenericPickerModalProps> = ({ 
  title, collection, isZh, onClose, onSelect, selectedIds, i18n, multiple = true, filter = {} 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [localSelected, setLocalSelected] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true)
      const params = new URLSearchParams({
        limit: '15',
        page: String(page),
        sort: '-createdAt',
        depth: '0',
        locale: i18n?.language?.split('-')[0] || 'zh'
      })
      
      Object.entries(filter).forEach(([key, val]: any) => {
        Object.entries(val).forEach(([op, opVal]: any) => {
          params.append(`where[${key}][${op}]`, opVal)
        })
      })

      if (searchTerm) {
        params.append('where[or][0][name][contains]', searchTerm)
        params.append('where[or][1][question][contains]', searchTerm)
      }

      try {
        const res = await fetch(`/api/${collection}?${params.toString()}`)
        const data = await res.json()
        setItems(data.docs || [])
        setHasNext(data.hasNextPage)
      } catch (e) {
        console.error('Fetch failed', e)
      }
      setLoading(false)
    }
    fetchItems()
  }, [searchTerm, page, collection])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: 'white', width: '90%', maxWidth: '700px', height: '80vh', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontWeight: 900 }}>{title}</h3>
          <button type="button" onClick={onClose} style={{ all: 'unset', cursor: 'pointer', color: '#9ca3af' }}><X size={24} /></button>
        </div>
        
        <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              placeholder={isZh ? '搜索...' : 'Search...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 42px', border: 'none', backgroundColor: '#f9fafb', borderRadius: '14px', outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Sparkles className="animate-spin" color="#111827" /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {items.map(item => {
                const isSel = localSelected.some(s => s.id === item.id)
                const alreadyGlobal = selectedIds.includes(item.id)
                return (
                  <div 
                    key={item.id}
                    onClick={() => {
                      if (alreadyGlobal) return
                      if (multiple) {
                        setLocalSelected(isSel ? localSelected.filter(s => s.id !== item.id) : [...localSelected, item])
                      } else {
                        setLocalSelected([item])
                      }
                    }}
                    style={{ 
                      padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px', cursor: alreadyGlobal ? 'not-allowed' : 'pointer',
                      backgroundColor: isSel ? '#f9fafb' : (alreadyGlobal ? '#f3f4f6' : 'white'),
                      border: isSel ? '2px solid #111827' : '1px solid #f3f4f6',
                      opacity: alreadyGlobal ? 0.6 : 1
                    }}
                  >
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: isSel ? '4px solid #111827' : '1.5px solid #d1d5db' }} />
                    <span style={{ flex: 1, fontSize: '14px', fontWeight: isSel || alreadyGlobal ? 800 : 500 }}>
                      {getLocalizedString(item.question || item.name || item.title, i18n?.language)}
                    </span>
                    {alreadyGlobal && <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 800 }}>{isZh ? '已添加' : 'ADDED'}</span>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}>{isZh ? '上页' : 'Prev'}</button>
              <button type="button" disabled={!hasNext} onClick={() => setPage(p => p + 1)} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}>{isZh ? '下页' : 'Next'}</button>
           </div>
           <button 
             type="button"
             onClick={() => onSelect(localSelected)}
             disabled={localSelected.length === 0}
             style={{ padding: '12px 30px', backgroundColor: '#111827', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer', opacity: localSelected.length === 0 ? 0.4 : 1 }}
           >
             {isZh ? `确认 (${localSelected.length})` : `CONFIRM (${localSelected.length})`}
           </button>
        </div>
      </div>
    </div>
  )
}

// --- Main Component ---

interface FaqCarouselComponentProps {
  nodeKey: string
  data: FaqCarouselData
}

export const FaqCarouselComponent: React.FC<FaqCarouselComponentProps> = ({ nodeKey, data }) => {
  const [editor] = useLexicalComposerContext()
  const { i18n, t } = useTranslation()
  const isZh = i18n?.language?.startsWith('zh')
  
  const [isEditing, setIsEditing] = useState(false)
  const [localData, setLocalData] = useState<FaqCarouselData>(data)
  
  const [showFaqPicker, setShowFaqPicker] = useState(false)
  const [showMediaPicker, setShowMediaPicker] = useState<number | null>(null)
  const [showAppPicker, setShowAppPicker] = useState<number | null>(null)
  const [mediaCache, setMediaCache] = useState<Record<string, any>>({})

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Update effect
  const updateNode = (newData: FaqCarouselData) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as FaqCarouselNode
      if (node) node.setData(newData)
    })
  }

  // Handle media caching for previews
  useEffect(() => {
    const fetchMedia = async () => {
      const idsToFetch = localData.items
        .map(it => it.image?.id || it.image)
        .filter(id => id && !mediaCache[id])
      
      if (idsToFetch.length === 0) return
      
      for (const id of idsToFetch) {
        try {
          // Check if it's an application or media via simple heuristic or try both
          // For now, let's try media first
          let res = await fetch(`/api/media/${id}?depth=0`)
          if (!res.ok) res = await fetch(`/api/applications/${id}?depth=0`)
          if (res.ok) {
            const data = await res.json()
            setMediaCache(prev => ({ ...prev, [id]: data }))
          }
        } catch (e) {}
      }
    }
    fetchMedia()
  }, [localData.items])

  const handleAddItem = (faqs: any[]) => {
    const newItems = faqs.map(f => ({ faq: f, image: null }))
    const updated = { ...localData, items: [...(localData.items || []), ...newItems] }
    setLocalData(updated)
    updateNode(updated)
    setShowFaqPicker(false)
  }

  const handleUpdateItem = (index: number, updates: Partial<FaqCarouselItem>) => {
    const newItems = [...localData.items]
    newItems[index] = { ...newItems[index], ...updates }
    const updated = { ...localData, items: newItems }
    setLocalData(updated)
    updateNode(updated)
  }

  const handleRemoveItem = (index: number) => {
    const newItems = localData.items.filter((_, i) => i !== index)
    const updated = { ...localData, items: newItems }
    setLocalData(updated)
    updateNode(updated)
  }

  const handleDragEnter = (toIndex: number) => {
    if (draggedIndex === null || draggedIndex === toIndex) return
    
    // Live reorder in local state
    const newItems = [...localData.items]
    const [moved] = newItems.splice(draggedIndex, 1)
    newItems.splice(toIndex, 0, moved)
    
    setLocalData({ ...localData, items: newItems })
    setDraggedIndex(toIndex) // Update tracked index to follow the item
  }

  const handleDragEnd = () => {
    // Only commit to Lexical node on drag end to avoid excessive history entries
    updateNode(localData)
    setDraggedIndex(null)
  }

  if (!isEditing) {
    const count = localData.items?.length || 0
    return (
      <div 
        onClick={() => setIsEditing(true)}
        style={{ margin: '16px 0 8px 0', padding: '30px', border: '2px solid #f3f4f6', borderRadius: '24px', backgroundColor: 'white', cursor: 'pointer', textAlign: 'center' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '20px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827' }}>
            <HelpCircle size={32} />
          </div>
        </div>
        <h4 style={{ margin: '0 0 8px 0', fontWeight: 900 }}>{isZh ? 'FAQ 轮播推荐' : 'FAQ Carousel'}</h4>
        <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{count} {isZh ? '个推荐项' : 'items recommended'}</p>
      </div>
    )
  }

  return (
    <div style={{ margin: '16px 0 8px 0', border: '2px solid #111827', borderRadius: '32px', backgroundColor: 'white', overflow: 'hidden', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
             <HelpCircle size={20} />
           </div>
           <h3 style={{ margin: 0, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>{isZh ? 'FAQ 轮播推荐' : 'FAQ CAROUSEL'}</h3>
        </div>
        <button 
          type="button"
          onClick={() => setIsEditing(false)} 
          style={{ padding: '8px 20px', borderRadius: '12px', border: '1px solid #111827', backgroundColor: 'white', fontWeight: 700, cursor: 'pointer' }}
        >
          {isZh ? '完成' : 'DONE'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        {localData.items?.map((item, idx) => {
          const faqTitle = getLocalizedString(item.faq?.question || item.faq?.name || item.faq?.title, i18n?.language) || (item.faq?.id ? `FAQ #${item.faq.id.slice(0,6)}` : 'Select FAQ Item')
          const imageObj = mediaCache[item.image?.id || item.image]
          const thumbUrl = imageObj?.thumbnailURL || imageObj?.url || imageObj?.coverImage?.url
          const isDragging = draggedIndex === idx
          
          return (
            <div 
              key={idx} 
              draggable 
              onDragStart={() => setDraggedIndex(idx)}
              onDragEnter={() => handleDragEnter(idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              style={{ 
                padding: '16px', borderRadius: '20px', border: '1px solid #f3f4f6', backgroundColor: 'white', display: 'flex', gap: '16px', alignItems: 'center',
                opacity: isDragging ? 0.5 : 1, transition: 'all 0.2s', cursor: 'move',
                boxShadow: isDragging ? '0 10px 25px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <GripVertical size={20} color="#d1d5db" />
              
              {/* Image Preview / Picker */}
              <div 
                onClick={() => setShowMediaPicker(idx)}
                style={{ width: '80px', height: '80px', borderRadius: '16px', backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
              >
                {thumbUrl ? (
                  <img src={thumbUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ImageIcon size={24} color="#d1d5db" />
                )}
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                  <Plus size={20} />
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>{faqTitle}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                   <button 
                     type="button"
                     onClick={() => setShowMediaPicker(idx)} 
                     style={{ all: 'unset', fontSize: '11px', fontWeight: 700, color: '#6b7280', cursor: 'pointer', textDecoration: 'underline' }}
                   >
                     {isZh ? '修改配图' : 'Change Image'}
                   </button>
                   <button 
                     type="button"
                     onClick={() => setShowAppPicker(idx)} 
                     style={{ all: 'unset', fontSize: '11px', fontWeight: 700, color: '#6b7280', cursor: 'pointer', textDecoration: 'underline' }}
                   >
                     {isZh ? '从案例选择' : 'From Gallery'}
                   </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button"
                  onClick={() => handleRemoveItem(idx)} 
                  style={{ all: 'unset', padding: '8px', cursor: 'pointer', color: '#ef4444' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )
        })}

        <button 
          type="button"
          onClick={() => setShowFaqPicker(true)}
          style={{ width: '100%', padding: '20px', borderRadius: '20px', border: '2px dashed #e5e7eb', backgroundColor: '#f9fafb', color: '#9ca3af', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <Plus size={24} />
          <span>{isZh ? '添加 FAQ 推荐项' : 'ADD FAQ ITEM'}</span>
        </button>
      </div>

      {/* Modals */}
      {showFaqPicker && (
        <GenericPickerModal 
          title={isZh ? '选择 FAQ 项目' : 'SELECT FAQ ITEMS'}
          collection="faq-items"
          isZh={isZh}
          i18n={i18n}
          selectedIds={localData.items.map(it => it.faq?.id || it.faq)}
          onClose={() => setShowFaqPicker(false)}
          onSelect={handleAddItem}
        />
      )}

      {showMediaPicker !== null && (
        <MediaPickerModal 
          isOpen={true}
          onClose={() => setShowMediaPicker(null)}
          onSelect={(id) => {
            handleUpdateItem(showMediaPicker, { image: id })
            setShowMediaPicker(null)
          }}
          t={t}
          i18n={i18n}
        />
      )}

      {showAppPicker !== null && (
        <ApplicationPickerModal 
          isOpen={true}
          onClose={() => setShowAppPicker(null)}
          multiple={false}
          onSelect={(items) => {
            if (items.length > 0) {
              handleUpdateItem(showAppPicker, { image: items[0] })
            }
            setShowAppPicker(null)
          }}
        />
      )}
    </div>
  )
}
