'use client'

import React, { useEffect, useState } from 'react'
import { useField } from '@payloadcms/ui'
import { ApplicationPickerModal } from '../lexical-features/application-carousel/component.client'
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

// A SortableItem component for Application
const SortableApplicationItem = ({ id, onRemove, i18n }: any) => {
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
  
  const [appData, setAppData] = useState<any>(null)
  
  useEffect(() => {
    if (!id || String(id).includes('[object')) return
    
    fetch(`/api/applications/${encodeURIComponent(id)}?depth=1`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(data => setAppData(data))
      .catch(err => {
        console.error('Error fetching application:', err)
      })
  }, [id])
  
  const previewImage = appData?.sceneGallery?.[0]?.images?.[0]
  const imageUrl = previewImage ? (previewImage.thumbnailURL || previewImage.url) : null

  return (
    <div ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners} style={{ cursor: 'grab', padding: '4px' }}>
        <GripVertical size={16} color="#9ca3af" />
      </div>
      {imageUrl ? (
        <img src={imageUrl} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
      ) : (
        <div style={{ width: '60px', height: '60px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
      )}
      <div style={{ flex: 1, overflow: 'hidden' }}>
         <div style={{ fontSize: '13px', fontWeight: 500 }}>{appData?.name || appData?.slug || 'Loading...'}</div>
         {appData?.shortDescription && <div style={{ fontSize: '11px', color: '#6b7280', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{appData.shortDescription}</div>}
      </div>
      <button type="button" onClick={onRemove} style={{ padding: '8px', cursor: 'pointer', background: 'none', border: 'none', color: '#ef4444' }}>
        <Trash2 size={16} />
      </button>
    </div>
  )
}

export const WaterfallApplicationPicker: React.FC<{ path: string }> = ({ path }) => {
  const { value = [], setValue } = useField<any[]>({ path })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { i18n } = useTranslation()
  
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
      // Parse back to numbers for Payload validation if they are numeric
      setValue(newValue.map(v => isNaN(Number(v)) ? v : Number(v)))
    }
  }
  
  const handleRemove = (id: string) => {
    const newValue = normalizedValue.filter(v => v !== String(id))
    setValue(newValue.map(v => isNaN(Number(v)) ? v : Number(v)))
  }
  
  const handleAddApplications = (selectedIds: string[]) => {
    setValue(selectedIds.map(v => isNaN(Number(v)) ? v : Number(v)))
    setIsModalOpen(false)
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <label className="field-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
        {i18n.language === 'zh' ? '应用案例 (将从中随机抽取5张图)' : 'Applications (Will randomly pick 5 images)'}
      </label>
      
      {normalizedValue.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={normalizedValue} strategy={verticalListSortingStrategy}>
              {normalizedValue.map(id => (
                <SortableApplicationItem 
                  key={id} 
                  id={id} 
                  onRemove={() => handleRemove(id)} 
                  i18n={i18n} 
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
      
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
        {i18n.language === 'zh' ? '选择案例图集' : 'Select Applications'}
      </button>
      
      {isModalOpen && (
        <ApplicationPickerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleAddApplications}
          selectedIds={normalizedValue}
          multiple={true}
        />
      )}
    </div>
  )
}
