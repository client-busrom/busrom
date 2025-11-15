/**
 * Carousel Items Field - Custom field for managing carousel items
 *
 * Features:
 * - Drag and drop to reorder items
 * - Toggle visibility (isShow checkbox)
 * - Each item contains: title (multilingual), image, scene image, button text (multilingual), link URL
 */

import React, { useState } from 'react'
import { FieldContainer, FieldLabel } from '@keystone-ui/fields'
import { FieldController, FieldProps } from '@keystone-6/core/types'
import { Button } from '@keystone-ui/button'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FilteredMediaSelector } from './FilteredMediaSelector'
import { MultilingualTextEditor } from './MultilingualTextEditor'

// Type definition for carousel item
type CarouselItem = {
  id: string
  isShow: boolean
  title: Record<string, string> // Multilingual title
  image: string | null // Media ID
  sceneImage: string | null // Media ID for hover background
  buttonText: Record<string, string> // Multilingual button text
  linkUrl: string
}

// Sortable item component
const SortableCarouselItem = ({
  item,
  onUpdate,
  onRemove,
}: {
  item: CarouselItem
  onUpdate: (updates: Partial<CarouselItem>) => void
  onRemove: () => void
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState<'image' | 'sceneImage' | null>(null)
  const [titleEditorOpen, setTitleEditorOpen] = useState(false)
  const [buttonTextEditorOpen, setButtonTextEditorOpen] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="carousel-item"
    >
      <div style={{
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        background: item.isShow ? '#ffffff' : '#f3f4f6',
      }}>
        {/* Header: Drag handle + Visibility toggle + Remove button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          {/* Drag handle */}
          <div
            {...listeners}
            style={{
              cursor: 'grab',
              padding: '4px 8px',
              background: '#e5e7eb',
              borderRadius: '4px',
              fontSize: '18px',
            }}
          >
            ⋮⋮
          </div>

          {/* Visibility checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={item.isShow}
              onChange={(e) => onUpdate({ isShow: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>
              {item.isShow ? 'Visible (显示)' : 'Hidden (隐藏)'}
            </span>
          </label>

          <div style={{ flex: 1 }} />

          {/* Remove button */}
          <button
            type="button"
            onClick={onRemove}
            style={{
              padding: '6px 12px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Remove
          </button>
        </div>

        {/* Fields */}
        <div style={{ display: 'grid', gap: '12px' }}>
          {/* Title (Multilingual) */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Title (系列名称) - Multilingual
            </label>
            <button
              type="button"
              onClick={() => setTitleEditorOpen(true)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: '#f9fafb',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {Object.keys(item.title || {}).length > 0
                ? `${Object.keys(item.title).length} languages configured`
                : 'Click to edit multilingual title'}
            </button>
            {titleEditorOpen && (
              <MultilingualTextEditor
                value={item.title || {}}
                onChange={(value) => onUpdate({ title: value })}
                onClose={() => setTitleEditorOpen(false)}
              />
            )}
          </div>

          {/* Image */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Image (产品系列单图)
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setMediaSelectorOpen('image')}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                {item.image ? 'Change Image' : 'Select Image'}
              </button>
              {item.image && (
                <button
                  type="button"
                  onClick={() => onUpdate({ image: null })}
                  style={{
                    padding: '8px 12px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  Remove
                </button>
              )}
              {item.image && (
                <span style={{ fontSize: '12px', color: '#6b7280' }}>ID: {item.image}</span>
              )}
            </div>
          </div>

          {/* Scene Image (Hover background) */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Scene Image (场景图 - 悬停背景)
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setMediaSelectorOpen('sceneImage')}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                {item.sceneImage ? 'Change Scene Image' : 'Select Scene Image'}
              </button>
              {item.sceneImage && (
                <button
                  type="button"
                  onClick={() => onUpdate({ sceneImage: null })}
                  style={{
                    padding: '8px 12px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  Remove
                </button>
              )}
              {item.sceneImage && (
                <span style={{ fontSize: '12px', color: '#6b7280' }}>ID: {item.sceneImage}</span>
              )}
            </div>
          </div>

          {/* Button Text (Multilingual) */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Button Text (按钮文本) - Multilingual
            </label>
            <button
              type="button"
              onClick={() => setButtonTextEditorOpen(true)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: '#f9fafb',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {Object.keys(item.buttonText || {}).length > 0
                ? `${Object.keys(item.buttonText).length} languages configured`
                : 'Click to edit multilingual button text'}
            </button>
            {buttonTextEditorOpen && (
              <MultilingualTextEditor
                value={item.buttonText || {}}
                onChange={(value) => onUpdate({ buttonText: value })}
                onClose={() => setButtonTextEditorOpen(false)}
              />
            )}
          </div>

          {/* Link URL */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Link URL (跳转链接)
            </label>
            <input
              type="text"
              value={item.linkUrl || ''}
              onChange={(e) => onUpdate({ linkUrl: e.target.value })}
              placeholder="/product-series/example"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            />
          </div>
        </div>

        {/* Media Selector Modal */}
        {mediaSelectorOpen && (
          <FilteredMediaSelector
            isOpen={true}
            onClose={() => setMediaSelectorOpen(null)}
            onSelect={(mediaId) => {
              if (mediaSelectorOpen === 'image') {
                onUpdate({ image: mediaId })
              } else if (mediaSelectorOpen === 'sceneImage') {
                onUpdate({ sceneImage: mediaId })
              }
              setMediaSelectorOpen(null)
            }}
            selectedIds={
              mediaSelectorOpen === 'image' && item.image
                ? [item.image]
                : mediaSelectorOpen === 'sceneImage' && item.sceneImage
                ? [item.sceneImage]
                : []
            }
          />
        )}
      </div>
    </div>
  )
}

// Main field component
export const Field = ({ field, value, onChange }: FieldProps<typeof controller>) => {
  const items: CarouselItem[] = Array.isArray(value) ? value : []

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      onChange?.(arrayMove(items, oldIndex, newIndex))
    }
  }

  const addItem = () => {
    const newItem: CarouselItem = {
      id: `item-${Date.now()}`,
      isShow: true,
      title: {},
      image: null,
      sceneImage: null,
      buttonText: {},
      linkUrl: '',
    }
    onChange?.([...items, newItem])
  }

  const updateItem = (index: number, updates: Partial<CarouselItem>) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], ...updates }
    onChange?.(newItems)
  }

  const removeItem = (index: number) => {
    onChange?.(items.filter((_, i) => i !== index))
  }

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>

      <div style={{ marginTop: '12px' }}>
        {items.length === 0 ? (
          <div style={{
            padding: '24px',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#6b7280',
          }}>
            No carousel items yet. Click "Add Item" to create one.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              {items.map((item, index) => (
                <SortableCarouselItem
                  key={item.id}
                  item={item}
                  onUpdate={(updates) => updateItem(index, updates)}
                  onRemove={() => removeItem(index)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}

        <button
          type="button"
          onClick={addItem}
          style={{
            marginTop: '12px',
            padding: '10px 20px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            width: '100%',
          }}
        >
          + Add Carousel Item
        </button>
      </div>
    </FieldContainer>
  )
}

// Controller
export const controller = (config: any): FieldController<CarouselItem[], CarouselItem[]> => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: [],
    deserialize: (data) => {
      const value = data[config.path]
      return Array.isArray(value) ? value : []
    },
    serialize: (value) => {
      return { [config.path]: Array.isArray(value) ? value : [] }
    },
    validate: (value) => {
      return undefined
    },
  }
}
