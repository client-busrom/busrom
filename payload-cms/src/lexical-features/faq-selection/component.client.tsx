
// @ts-nocheck
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $getNodeByKey } from '@payloadcms/richtext-lexical/lexical'
import { useTranslation } from '@payloadcms/ui'
import { FaqSelectionNode, FaqSelectionData, $isFaqSelectionNode } from './node'
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  Search, 
  X, 
  Check, 
  HelpCircle,
  Cloud,
  ChevronRight,
  GripVertical,
  Link as LinkIcon,
  Settings,
  ListOrdered,
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  Layers,
  FileImage,
  FolderOpen
} from 'lucide-react'
import { InlineIconSearch } from '../../components/fields/IconPicker/InlineIconSearch'
import { getIconSvgUrl, normalizeIconName } from '../../components/fields/IconPicker/iconify-utils'
import { LinkPickerModal } from '../shared/LinkPickerModal'
import { MediaPickerModal } from '../image-gallery/component.client'
import { ApplicationPickerModal } from '../application-carousel/component.client'

const stopPropagation = (e: any) => e.stopPropagation()

const getLocalizedString = (field: any, locale: string) => {
  if (!field) return ''
  if (typeof field === 'string') return field
  if (typeof field === 'object') {
    return field[locale] || field.en || field.zh || Object.values(field)[0] || ''
  }
  return String(field)
}

// --- Internal Helper Components for Media Preview ---

const MediaPreviewThumbnail: React.FC<{ mediaId: string; isZh: boolean; onRemove: () => void }> = ({ mediaId, isZh, onRemove }) => {
  const [mediaInfo, setMediaInfo] = useState<any>(null)
  
  useEffect(() => {
    if (!mediaId) return
    const fetchMedia = async () => {
      try {
        const res = await fetch(`/api/media/${mediaId}`)
        const data = await res.json()
        setMediaInfo(data)
      } catch (e) {
        console.error('Failed to fetch media preview', e)
      }
    }
    fetchMedia()
  }, [mediaId])

  return (
    <div style={{ 
      marginTop: '8px', padding: '12px 16px', backgroundColor: 'white', borderRadius: '14px', 
      border: '1px solid #e5e7eb', boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
        <div style={{ 
          width: '48px', height: '48px', backgroundColor: '#fff8e8', borderRadius: '10px', 
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          border: '1px solid #fff2d9' 
        }}>
          {mediaInfo?.thumbnailURL || mediaInfo?.url ? (
            <img src={mediaInfo.thumbnailURL || mediaInfo.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <FileImage size={24} color="#A08745" />
          )}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '11px', fontWeight: 900, color: '#A08745', letterSpacing: '0.05em' }}>
            {isZh ? '当前单图预览' : 'IMAGE PREVIEW'}
          </div>
          <div style={{ fontSize: '12px', color: '#374151', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontWeight: 600 }}>
            {mediaInfo ? mediaInfo.filename : (isZh ? '加载中...' : 'Loading...')}
          </div>
        </div>
      </div>
      <button 
        type="button" 
        onClick={(e) => { e.stopPropagation(); onRemove(); }} 
        style={{ all: 'unset', cursor: 'pointer', color: '#d1d5db', padding: '6px', borderRadius: '50%', transition: 'all 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
        onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
      >
        <X size={18} />
      </button>
    </div>
  )
}

const GalleryPreviewThumbnail: React.FC<{ galleryId: string; isZh: boolean; onRemove: () => void }> = ({ galleryId, isZh, onRemove }) => {
  const [galleryInfo, setGalleryInfo] = useState<any>(null)
  
  useEffect(() => {
    if (!galleryId) return
    const fetchGallery = async () => {
      try {
        const res = await fetch(`/api/applications/${galleryId}`)
        const data = await res.json()
        setGalleryInfo(data)
      } catch (e) {
        console.error('Failed to fetch gallery info', e)
      }
    }
    fetchGallery()
  }, [galleryId])

  return (
    <div style={{ 
      marginTop: '8px', padding: '12px 16px', backgroundColor: 'white', borderRadius: '14px', 
      border: '1px solid #e5e7eb', boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
        <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #dbeafe' }}>
          <Layers size={26} color="#3b82f6" />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '11px', fontWeight: 900, color: '#3b82f6', letterSpacing: '0.05em' }}>
            {isZh ? '已关联案例图集' : 'LINKED CASE GALLERY'}
          </div>
          <div style={{ fontSize: '12px', color: '#374151', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontWeight: 600 }}>
            {galleryInfo ? galleryInfo.name : (isZh ? '加载图集详情...' : 'Loading...')}
          </div>
        </div>
      </div>
      <button 
        type="button" 
        onClick={(e) => { e.stopPropagation(); onRemove(); }} 
        style={{ all: 'unset', cursor: 'pointer', color: '#d1d5db', padding: '6px', borderRadius: '50%', transition: 'all 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
        onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
      >
        <X size={18} />
      </button>
    </div>
  )
}

// --- Main Component ---

export const FaqSelectionComponent: React.FC<{ nodeKey: string; data: FaqSelectionData }> = ({ nodeKey, data }) => {
  const [editor] = useLexicalComposerContext()
  const { t, i18n } = useTranslation()
  const isZh = i18n?.language === 'zh'
  
  const [isEditing, setIsEditing] = useState(false)
  const [localData, setLocalData] = useState<FaqSelectionData>({
    categories: data.categories || []
  })
  
  const [isLinkPickerOpen, setIsLinkPickerOpen] = useState(false)
  const [pickingLinkCatIndex, setPickingLinkCatIndex] = useState<number | null>(null)
  
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [showFaqPicker, setShowFaqPicker] = useState<{ catIndex: number } | null>(null)
  const [showImagePicker, setShowImagePicker] = useState<{ catIdx: number; faqIdx?: number } | null>(null)
  const [showGalleryPicker, setShowGalleryPicker] = useState<{ catIdx: number; faqIdx?: number } | null>(null)
  
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<{ catIdx: number; faqIdx: number } | null>(null)
  const [draggedCatIndex, setDraggedCatIndex] = useState<number | null>(null)
  const [draggedFaqIndex, setDraggedFaqIndex] = useState<{ catIdx: number; faqIdx: number } | null>(null)

  const updateNodeData = useCallback((newData: Partial<FaqSelectionData>) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isFaqSelectionNode(node)) {
        node.setData({ ...node.getData(), ...newData })
      }
    })
  }, [editor, nodeKey])

  useEffect(() => {
    setLocalData({ categories: data.categories || [] })
  }, [data.categories])

  const handleUpdateCategory = (idx: number, updates: Partial<any>) => {
    const newCats = [...localData.categories]
    newCats[idx] = { ...newCats[idx], ...updates }
    const updated = { ...localData, categories: newCats }
    setLocalData(updated)
    updateNodeData(updated)
  }

  const handleRemoveCategory = (idx: number) => {
    const newCats = localData.categories.filter((_, i) => i !== idx)
    const updated = { ...localData, categories: newCats }
    setLocalData(updated)
    updateNodeData(updated)
    if (expandedCategory === idx) setExpandedCategory(null)
  }

  const handleUpdateCTA = (catIdx: number, updates: any) => {
    const cat = localData.categories[catIdx]
    const currentCTA = cat.cta || { label: '', url: '' }
    handleUpdateCategory(catIdx, { cta: { ...currentCTA, ...updates } })
  }

  const handleUpdateMedia = (catIdx: number, updates: { image?: any; gallery?: any }, faqIdx?: number) => {
    const newCats = [...localData.categories]
    const cat = newCats[catIdx]

    if (faqIdx !== undefined) {
      const questions = [...(cat.questions || [])]
      const q = { ...questions[faqIdx], ...updates }
      // Clear alternative when one is picked
      if (updates.hasOwnProperty('image')) delete q.gallery
      if (updates.hasOwnProperty('gallery')) delete q.image
      questions[faqIdx] = q
      newCats[catIdx] = { ...cat, questions }
    } else {
      const updatedCat = { ...cat, ...updates }
      if (updates.hasOwnProperty('image')) delete updatedCat.gallery
      if (updates.hasOwnProperty('gallery')) delete updatedCat.image
      newCats[catIdx] = updatedCat
    }

    const updated = { categories: newCats }
    setLocalData(updated)
    updateNodeData(updated)
  }

  const handleAddFaqItems = (catIdx: number, faqItems: any[]) => {
    const newCats = [...localData.categories]
    const cat = newCats[catIdx]
    const questions = [...(cat.questions || [])]
    
    faqItems.forEach(item => {
      questions.push({ faqItem: item })
    })
    
    newCats[catIdx] = { ...cat, questions }
    const updated = { categories: newCats }
    setLocalData(updated)
    updateNodeData(updated)
  }

  const handleRemoveFaq = (catIdx: number, faqIdx: number) => {
    const newCats = [...localData.categories]
    const cat = newCats[catIdx]
    const questions = (cat.questions || []).filter((_, i) => i !== faqIdx)
    newCats[catIdx] = { ...cat, questions }
    const updated = { categories: newCats }
    setLocalData(updated)
    updateNodeData(updated)
  }

  const handleCatDragOver = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedCatIndex === null || draggedCatIndex === dropIndex) return
    const newCats = [...localData.categories]
    const draggedItem = newCats[draggedCatIndex]
    newCats.splice(draggedCatIndex, 1)
    newCats.splice(dropIndex, 0, draggedItem)
    setDraggedCatIndex(dropIndex)
    const updated = { categories: newCats }
    setLocalData(updated)
    updateNodeData(updated)
  }

  const handleFaqDragOver = (e: React.DragEvent, catIdx: number, dropIndex: number) => {
    e.preventDefault()
    if (!draggedFaqIndex || (draggedFaqIndex.catIdx !== catIdx) || (draggedFaqIndex.faqIdx === dropIndex)) return
    const newCats = [...localData.categories]
    const questions = [...(newCats[catIdx].questions || [])]
    const draggedItem = questions[draggedFaqIndex.faqIdx]
    questions.splice(draggedFaqIndex.faqIdx, 1)
    questions.splice(dropIndex, 0, draggedItem)
    newCats[catIdx] = { ...newCats[catIdx], questions }
    setDraggedFaqIndex({ catIdx, faqIdx: dropIndex })
    const updated = { categories: newCats }
    setLocalData(updated)
    updateNodeData(updated)
  }

  // --- Rendering Helpers ---

  if (!isEditing) {
    const hasData = localData.categories && localData.categories.length > 0
    return (
      <div 
        onClick={() => setIsEditing(true)}
        style={{ margin: '24px 0', padding: '32px', border: '1px solid #f3f4f6', borderRadius: '24px', cursor: 'pointer', backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', position: 'relative' }}
      >
        {!hasData ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <HelpCircle size={40} color="#A08745" style={{ marginBottom: '16px' }} />
            <h4 style={{ margin: 0, fontWeight: 800 }}>{isZh ? 'FAQ 精选组件' : 'FAQ Selection'}</h4>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>{isZh ? '点击开始配置常见问题' : 'Click to configure FAQs'}</p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#A08745' }}>
              <Settings size={20} />
              <span style={{ fontWeight: 800 }}>{isZh ? 'FAQ 内容概览' : 'FAQ OVERVIEW'}</span>
              <span style={{ fontSize: '12px', opacity: 0.6 }}>({localData.categories.length} {isZh ? '分类' : 'cats'})</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {localData.categories.map((c, i) => (
                <div key={i} style={{ padding: '8px 16px', backgroundColor: '#f9fafb', borderRadius: '10px', fontSize: '13px', fontWeight: 700, border: '1px solid #f3f4f6' }}>
                  {typeof c.category === 'object' ? getLocalizedString(c.category.name, i18n?.language) : 'Category'}
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', right: '20px', bottom: '20px', color: '#A08745' }}>
              <ChevronRight size={20} />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="faq-selection-wrapper" style={{ margin: '20px 0', border: '2px solid #A08745', borderRadius: '20px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 20px 50px rgba(160, 135, 69, 0.1)' }}>
      {/* Admin Header */}
      <div style={{ backgroundColor: '#111827', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ backgroundColor: '#A08745', padding: '8px', borderRadius: '10px' }}>
            <HelpCircle size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '14px', letterSpacing: '0.05em' }}>{isZh ? 'FAQ 精选高级编辑器' : 'FAQ SELECTION EDITOR'}</div>
            <div style={{ fontSize: '11px', opacity: 0.6, fontWeight: 600 }}>BUILDING HIGH-FIDELITY FAQ SECTIONS</div>
          </div>
        </div>
        <button 
          type="button"
          onClick={() => setIsEditing(false)}
          style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 800, transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
        >
          {isZh ? '保存预览' : 'FINISH'}
        </button>
      </div>

      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {localData.categories.map((cat, idx) => {
            const isExpanded = expandedCategory === idx
            const catName = typeof cat.category === 'object' ? getLocalizedString(cat.category.name, i18n?.language) : 'Category'
            
            return (
              <div key={idx} style={{ border: isExpanded ? '2px solid #A08745' : '1px solid #f3f4f6', borderRadius: '18px', overflow: 'hidden', transition: 'all 0.3s' }}>
                {/* Category Header */}
                <div 
                  onClick={() => setExpandedCategory(isExpanded ? null : idx)}
                  style={{ padding: '18px 24px', backgroundColor: isExpanded ? '#fffcf5' : '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '42px', height: '42px', backgroundColor: isExpanded ? '#A08745' : '#f9fafb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={getIconSvgUrl(normalizeIconName(cat.icon || 'lucide:help-circle'), isExpanded ? 'white' : '#A08745')} style={{ width: '22px', height: '22px' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '16px', color: '#111827' }}>{catName}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{cat.questions?.length || 0} {isZh ? '个精选问答' : 'Items linked'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={e => { e.stopPropagation(); handleRemoveCategory(idx); }} style={{ all: 'unset', cursor: 'pointer', color: '#d1d5db' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}>
                      <Trash2 size={18} />
                    </button>
                    {isExpanded ? <ChevronUp size={22} color="#A08745" /> : <ChevronDown size={22} color="#d1d5db" />}
                  </div>
                </div>

                {/* Configuration Content */}
                {isExpanded && (
                  <div style={{ padding: '24px', borderTop: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
                    {/* Row 1: Design & CTA */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                       <div style={{ backgroundColor: 'white', padding: '18px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                          <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: '#A08745', marginBottom: '12px', display: 'block' }}>{isZh ? '分类图标样式' : 'ICON STYLE'}</label>
                          <InlineIconSearch value={cat.icon || ''} onChange={val => handleUpdateCategory(idx, { icon: val })} isZh={isZh} />
                       </div>
                       <div style={{ backgroundColor: 'white', padding: '18px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                          <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: '#A08745', marginBottom: '12px', display: 'block' }}>{isZh ? '引导链接配置' : 'CTA ACTION'}</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                             <input placeholder={isZh ? 'SEE ALL' : 'SEE ALL'} value={cat.cta?.label || ''} onChange={e => handleUpdateCTA(idx, { label: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px' }} onKeyDown={stopPropagation} />
                             <div style={{ position: 'relative' }}>
                                <input placeholder={isZh ? '链接 URL' : 'Link URL'} value={cat.cta?.url || ''} onChange={e => handleUpdateCTA(idx, { url: e.target.value })} style={{ width: '100%', padding: '10px 36px 10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px' }} onKeyDown={stopPropagation} />
                                <LinkIcon size={16} color="#A08745" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} onClick={() => { setPickingLinkCatIndex(idx); setIsLinkPickerOpen(true); }} />
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Row 2: Media Asset Preview */}
                    <div style={{ backgroundColor: '#111827', padding: '20px', borderRadius: '18px', marginBottom: '24px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#E5E7EB' }}>
                          <ImageIcon size={18} color="#A08745" />
                          <span style={{ fontSize: '13px', fontWeight: 800 }}>{isZh ? '预览媒体资源配置' : 'PREVIEW MEDIA ASSETS'}</span>
                       </div>
                       <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                             <button type="button" onClick={() => setShowImagePicker({ catIdx: idx })} style={{ padding: '10px 18px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                               <FileImage size={14} /> {isZh ? '挑选单图' : 'Single Image'}
                             </button>
                             <button type="button" onClick={() => setShowGalleryPicker({ catIdx: idx })} style={{ padding: '10px 18px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                               <Layers size={14} /> {isZh ? '关联图集' : 'Case Gallery'}
                             </button>
                          </div>
                          <div style={{ flex: 1 }}>
                             {cat.image?.id ? (
                               <MediaPreviewThumbnail mediaId={cat.image.id} isZh={isZh} onRemove={() => handleUpdateMedia(idx, { image: null })} />
                             ) : cat.gallery?.id ? (
                               <GalleryPreviewThumbnail galleryId={cat.gallery.id} isZh={isZh} onRemove={() => handleUpdateMedia(idx, { gallery: null })} />
                             ) : (
                               <div style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
                                 {isZh ? '尚未配置预览资源，前端将以紧凑文字模式展示' : 'No preview asset configured. Only text list will be shown.'}
                               </div>
                             )}
                          </div>
                       </div>
                    </div>

                    {/* Question List Area */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111827' }}>
                          <ListOrdered size={16} />
                          <span style={{ fontSize: '14px', fontWeight: 900 }}>{isZh ? '精选问答库清单' : 'CURATED QUESTION LIST'}</span>
                       </div>
                       <button type="button" onClick={() => setShowFaqPicker({ catIndex: idx })} style={{ backgroundColor: '#A08745', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>+ {isZh ? '批量挑选' : 'PICK FAQS'}</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                       {(cat.questions || []).map((q, qIdx) => {
                          const qName = typeof q.faqItem === 'object' ? getLocalizedString(q.faqItem.question, i18n?.language) : 'Untitled Question'
                          const isFaqExpanded = expandedFaq?.catIdx === idx && expandedFaq?.faqIdx === qIdx
                          
                          return (
                            <div key={qIdx} style={{ backgroundColor: isFaqExpanded ? '#ffffff' : 'transparent', border: '1px solid #f3f4f6', borderRadius: '14px', overflow: 'hidden', transition: 'all 0.2s' }}>
                               <div 
                                 onClick={() => setExpandedFaq(isFaqExpanded ? null : { catIdx: idx, faqIdx: qIdx })}
                                 style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                               >
                                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: isFaqExpanded ? '#A08745' : '#f3f4f6', color: isFaqExpanded ? 'white' : '#A08745', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>{qIdx + 1}</div>
                                  <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{qName}</span>
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                     {(q.image?.id || q.gallery?.id) && <FileImage size={14} color="#A08745" />}
                                     <Settings size={14} color="#d1d5db" />
                                     <button type="button" onClick={e => { e.stopPropagation(); handleRemoveFaq(idx, qIdx); }} style={{ all: 'unset', cursor: 'pointer', color: '#d1d5db' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}>
                                        <X size={16} />
                                     </button>
                                  </div>
                               </div>
                               {isFaqExpanded && (
                                 <div style={{ padding: '16px', borderTop: '1px dashed #f3f4f6', backgroundColor: '#fafafa' }}>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                       <button type="button" onClick={() => setShowImagePicker({ catIdx: idx, faqIdx: qIdx })} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: q.image ? '#fffcf5' : 'white', color: '#111827', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                                         <ImageIcon size={14} /> {isZh ? '单图' : 'Image'}
                                       </button>
                                       <button type="button" onClick={() => setShowGalleryPicker({ catIdx: idx, faqIdx: qIdx })} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: q.gallery ? '#eff6ff' : 'white', color: '#111827', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                                         <Layers size={14} /> {isZh ? '图集' : 'Gallery'}
                                       </button>
                                    </div>
                                    {q.image?.id && <MediaPreviewThumbnail mediaId={q.image.id} isZh={isZh} onRemove={() => handleUpdateMedia(idx, { image: null }, qIdx)} />}
                                    {q.gallery?.id && <GalleryPreviewThumbnail galleryId={q.gallery.id} isZh={isZh} onRemove={() => handleUpdateMedia(idx, { gallery: null }, qIdx)} />}
                                 </div>
                               )}
                            </div>
                          )
                       })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <button 
          type="button" 
          onClick={() => setShowCategoryPicker(true)}
          style={{ width: '100%', padding: '24px', border: '2px dashed #e5e7eb', borderRadius: '20px', backgroundColor: '#f9fafb', color: '#9ca3af', fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#A08745'; e.currentTarget.style.color = '#A08745'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#9ca3af'; }}
        >
          <Plus size={32} />
          <span>{isZh ? '添加一个 FAQ 分类展示块' : 'ADD A NEW FAQ CATEGORY'}</span>
        </button>
      </div>

      {/* Standard Modals Container */}
      
      {showCategoryPicker && (
        <GenericPickerModal 
          title={isZh ? '选择展示分类' : 'SELECT CATEGORIES'}
          collection="faq-categories"
          isZh={isZh}
          onClose={() => setShowCategoryPicker(false)}
          onSelect={(items) => {
            const currentIds = localData.categories.map(c => typeof c.category === 'object' ? c.category.id : c.category)
            const newItems = items.filter(it => !currentIds.includes(it.id))
            if (newItems.length > 0) {
              const updated = { 
                categories: [...localData.categories, ...newItems.map(it => ({ 
                  category: it, 
                  questions: [],
                  cta: { label: 'SEE ALL', url: '' }
                }))] 
              }
              setLocalData(updated)
              updateNodeData(updated)
            }
            setShowCategoryPicker(false)
          }}
          selectedIds={localData.categories.map(c => typeof c.category === 'object' ? c.category.id : c.category)}
          i18n={i18n}
        />
      )}

      {showFaqPicker && (
        <GenericPickerModal 
          title={isZh ? '挑选精选问答' : 'PICK FAQS'}
          collection="faq-items"
          isZh={isZh}
          filter={{ category: { equals: typeof localData.categories[showFaqPicker.catIndex].category === 'object' ? localData.categories[showFaqPicker.catIndex].category.id : localData.categories[showFaqPicker.catIndex].category } }}
          onClose={() => setShowFaqPicker(null)}
          onSelect={(items) => {
            handleAddFaqItems(showFaqPicker.catIndex, items)
            setShowFaqPicker(null)
          }}
          selectedIds={(localData.categories[showFaqPicker.catIndex].questions || []).map(q => typeof q.faqItem === 'object' ? q.faqItem.id : q.faqItem)}
          i18n={i18n}
        />
      )}

      {showImagePicker && (
        <MediaPickerModal 
          isOpen={true}
          onClose={() => setShowImagePicker(null)}
          imageIndex={0}
          onSelect={(id) => {
            handleUpdateMedia(showImagePicker.catIdx, { image: { id } }, showImagePicker.faqIdx)
            setShowImagePicker(null)
          }}
          t={t}
          i18n={i18n}
        />
      )}

      {showGalleryPicker && (
        <ApplicationPickerModal 
          isOpen={true}
          onClose={() => setShowGalleryPicker(null)}
          selectedIds={[]}
          multiple={false}
          onSelect={(ids) => {
            const pickerId = Array.isArray(ids) ? ids[0] : ids
            if (pickerId) {
              handleUpdateMedia(showGalleryPicker.catIdx, { gallery: { id: pickerId } }, showGalleryPicker.faqIdx)
            }
            setShowGalleryPicker(null)
          }}
          i18n={i18n}
        />
      )}

      <LinkPickerModal 
        isOpen={isLinkPickerOpen}
        onClose={() => setIsLinkPickerOpen(false)}
        onSelect={(path) => {
          if (pickingLinkCatIndex !== null) {
            handleUpdateCTA(pickingLinkCatIndex, { url: path })
          }
          setIsLinkPickerOpen(false)
        }}
      />
    </div>
  )
}

// --- Unified GenericPickerModal ---

const GenericPickerModal = ({ title, collection, isZh, onClose, onSelect, selectedIds, i18n, multiple = true, filter = {} }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [localSelected, setLocalSelected] = useState([])
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
        locale: i18n?.language || 'en'
      })
      
      // Add filters
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: 'white', width: '90%', maxWidth: '700px', height: '80vh', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontWeight: 900, color: '#111827' }}>{title}</h3>
          <button onClick={onClose} style={{ all: 'unset', cursor: 'pointer', color: '#9ca3af' }}><X size={24} /></button>
        </div>
        
        <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              placeholder={isZh ? '搜索关键字...' : 'Search...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 42px', border: 'none', backgroundColor: '#f9fafb', borderRadius: '14px', fontSize: '15px', outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Sparkles className="animate-spin" color="#A08745" /></div>
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
                      backgroundColor: isSel ? '#fffcf5' : (alreadyGlobal ? '#f9fafb' : 'white'),
                      border: isSel ? '2px solid #A08745' : '1px solid #f3f4f6',
                      opacity: alreadyGlobal ? 0.6 : 1
                    }}
                  >
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: isSel ? '4px solid #A08745' : '1.5px solid #d1d5db' }} />
                    <span style={{ flex: 1, fontSize: '14px', fontWeight: isSel || alreadyGlobal ? 800 : 500, color: alreadyGlobal ? '#9ca3af' : '#111827' }}>
                      {getLocalizedString(item.name || item.question || item.displayName || item.title, i18n?.language)}
                    </span>
                    {alreadyGlobal && <span style={{ fontSize: '11px', color: '#A08745', fontWeight: 800 }}>{isZh ? '已添加' : 'ADDED'}</span>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div style={{ display: 'flex', gap: '10px' }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}>{isZh ? '上页' : 'Prev'}</button>
              <button disabled={!hasNext} onClick={() => setPage(p => p + 1)} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}>{isZh ? '下页' : 'Next'}</button>
           </div>
           <button 
             onClick={() => onSelect(localSelected)}
             disabled={localSelected.length === 0}
             style={{ padding: '12px 30px', backgroundColor: '#111827', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer', opacity: localSelected.length === 0 ? 0.4 : 1 }}
           >
             {isZh ? `确认选中 (${localSelected.length})` : `CONFIRM (${localSelected.length})`}
           </button>
        </div>
      </div>
    </div>
  )
}
