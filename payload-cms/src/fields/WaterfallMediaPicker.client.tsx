'use client'

import React, { useEffect, useState } from 'react'
import { useField } from '@payloadcms/ui'
import { MediaPickerModal } from '../lexical-features/image-gallery/component.client'
import { Plus, GripVertical, Trash2 } from 'lucide-react'
import { useTranslation } from '@payloadcms/ui'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// A SortableItem component for Media
const SortableMediaItem = ({ id, onRemove, t, i18n }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    padding: '8px',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  }
  
  const [mediaData, setMediaData] = useState<any>(null)
  
  useEffect(() => {
    if (!id || String(id).includes('[object')) return

    fetch(`/api/media/${encodeURIComponent(id)}?depth=0`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(data => setMediaData(data))
      .catch(err => {
        console.error('Error fetching media:', err)
      })
  }, [id])

  return (
    <div ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners} style={{ cursor: 'grab', padding: '4px' }}>
        <GripVertical size={16} color="#9ca3af" />
      </div>
      {mediaData ? (
        <img src={mediaData.thumbnailURL || mediaData.url} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
      ) : (
        <div style={{ width: '60px', height: '60px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
      )}
      <div style={{ flex: 1, overflow: 'hidden' }}>
         <div style={{ fontSize: '13px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{mediaData?.filename || 'Loading...'}</div>
      </div>
      <button type="button" onClick={onRemove} style={{ padding: '8px', cursor: 'pointer', background: 'none', border: 'none', color: '#ef4444' }}>
        <Trash2 size={16} />
      </button>
    </div>
  )
}

export const WaterfallMediaPicker: React.FC<{ path: string }> = ({ path }) => {
  const { value = [], setValue } = useField<any[]>({ path })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { i18n } = useTranslation()
  const t = (key: string) => key // Dummy t since MediaPickerModal uses its own translation internally but expects t as prop
  
  const normalizedValue = (value || []).map(v => typeof v === 'object' && v !== null && 'id' in v ? String(v.id) : String(v))

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = normalizedValue.indexOf(String(active.id))
      const newIndex = normalizedValue.indexOf(String(over.id))
      const newValue = arrayMove(normalizedValue, oldIndex, newIndex)
      setValue(newValue.map(v => isNaN(Number(v)) ? v : Number(v)))
    }
  }
  
  const handleRemove = (id: string) => {
    const newValue = normalizedValue.filter(v => v !== String(id))
    setValue(newValue.map(v => isNaN(Number(v)) ? v : Number(v)))
  }
  
  const handleAddMedia = (mediaId: string) => {
    if (!normalizedValue.includes(String(mediaId))) {
      const newValue = [...normalizedValue, String(mediaId)]
      setValue(newValue.map(v => isNaN(Number(v)) ? v : Number(v)))
    }
    setIsModalOpen(false)
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <label className="field-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
        {i18n.language === 'zh' ? '瀑布流媒体 (最多5个)' : 'Waterfall Media (Up to 5)'}
      </label>
      
      {normalizedValue.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={normalizedValue} strategy={verticalListSortingStrategy}>
              {normalizedValue.map(id => (
                <SortableMediaItem 
                  key={id} 
                  id={id} 
                  onRemove={() => handleRemove(id)} 
                  t={t} 
                  i18n={i18n} 
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
      
      {normalizedValue.length < 5 && (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#A08745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <Plus size={16} />
          {i18n.language === 'zh' ? '添加图片/视频' : 'Add Image/Video'}
        </button>
      )}
      
      {isModalOpen && (
        <MediaPickerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleAddMedia}
          imageIndex={normalizedValue.length}
          t={t}
          i18n={i18n}
        />
      )}
    </div>
  )
}
