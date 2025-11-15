/**
 * Multiple Media Field - Custom field with filtered media selector
 *
 * 多个媒体选择字段 - 带筛选功能的媒体选择器
 *
 * Use this as a replacement for: relationship({ ref: 'Media', many: true })
 */

import React, { useState } from 'react'
import { FieldContainer, FieldLabel } from '@keystone-ui/fields'
import { FieldController, FieldProps } from '@keystone-6/core/types'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'
import { FilteredMediaSelector } from './FilteredMediaSelector'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// GraphQL query to get multiple media details
const GET_MEDIA_LIST_BY_IDS = gql`
  query GetMediaListByIds($ids: [ID!]!) {
    mediaFiles(where: { id: { in: $ids } }) {
      id
      filename
      file {
        url
      }
      variants
    }
  }
`

// Sortable Item Component
function SortableMediaItem({ id, media, onRemove }: { id: string; media: any; onRemove: () => void }) {
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
  }

  const thumbnailUrl = media.variants?.thumbnail || media.file?.url

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{
        position: 'relative',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'white',
        width: '120px',
      }}>
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            background: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'grab',
            fontSize: '12px',
            zIndex: 10,
          }}
        >
          ⋮⋮
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={onRemove}
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            width: '24px',
            height: '24px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          ×
        </button>

        {/* Thumbnail */}
        <div style={{
          width: '100%',
          paddingTop: '100%',
          position: 'relative',
          background: '#f3f4f6',
        }}>
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={media.filename}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          )}
        </div>

        {/* Filename */}
        <div style={{
          padding: '6px',
          fontSize: '11px',
          color: '#4b5563',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          background: '#f9fafb',
        }}>
          {media.filename}
        </div>
      </div>
    </div>
  )
}

export const Field = ({ field, value, onChange }: FieldProps<typeof controller>) => {
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false)

  // Parse value (array of {id} objects)
  const mediaIds = value || []
  const selectedIds = mediaIds.map((item: any) => item.id)

  // Fetch selected media details
  const { data, loading } = useQuery(GET_MEDIA_LIST_BY_IDS, {
    variables: { ids: selectedIds },
    skip: selectedIds.length === 0,
  })

  // Create a map for quick lookup and maintain order
  const mediaMap = new Map()
  data?.mediaFiles?.forEach((media: any) => {
    mediaMap.set(media.id, media)
  })

  const orderedMedia = selectedIds.map((id: string) => mediaMap.get(id)).filter(Boolean)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = selectedIds.indexOf(active.id as string)
      const newIndex = selectedIds.indexOf(over.id as string)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(mediaIds, oldIndex, newIndex)
        onChange?.(newOrder)
      }
    }
  }

  // Handle add media
  const handleAddMedia = (mediaId: string) => {
    if (!selectedIds.includes(mediaId)) {
      onChange?.([...mediaIds, { id: mediaId }])
    }
  }

  // Handle remove media
  const handleRemoveMedia = (mediaId: string) => {
    onChange?.(mediaIds.filter((item: any) => item.id !== mediaId))
  }

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>

      <div style={{ marginTop: '8px' }}>
        {/* Selected Media Grid with Drag & Drop */}
        {orderedMedia.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedIds}
              strategy={horizontalListSortingStrategy}
            >
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '12px',
              }}>
                {orderedMedia.map((media: any) => (
                  <SortableMediaItem
                    key={media.id}
                    id={media.id}
                    media={media}
                    onRemove={() => handleRemoveMedia(media.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Add Button */}
        <button
          type="button"
          onClick={() => setMediaSelectorOpen(true)}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            width: orderedMedia.length === 0 ? '100%' : 'auto',
          }}
        >
          + {orderedMedia.length === 0 ? 'Select Media' : 'Add More Media'}
        </button>

        {orderedMedia.length > 0 && (
          <div style={{
            marginTop: '8px',
            fontSize: '12px',
            color: '#6b7280',
          }}>
            {orderedMedia.length} media selected. Drag to reorder.
          </div>
        )}
      </div>

      {/* Media Selector Modal */}
      <FilteredMediaSelector
        isOpen={mediaSelectorOpen}
        onClose={() => setMediaSelectorOpen(false)}
        onSelect={handleAddMedia}
        multiple={true}
        selectedIds={selectedIds}
      />
    </FieldContainer>
  )
}

export const Cell = ({ item, field }: any) => {
  const value = item[field.path]

  if (!value || !Array.isArray(value) || value.length === 0) {
    return <div style={{ color: '#999', fontSize: '13px' }}>No media</div>
  }

  // Value is an array of media IDs (strings)
  const count = value.length

  return (
    <div style={{ fontSize: '13px', color: '#4a5568', fontWeight: 500 }}>
      {count} media item{count > 1 ? 's' : ''}
    </div>
  )
}

export const controller = (config: any): FieldController<any[], any[]> => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: [],
    deserialize: (data) => {
      const value = data[config.path]
      return value || []
    },
    serialize: (value) => {
      if (!value || !Array.isArray(value) || value.length === 0) {
        return { [config.path]: [] }
      }

      return { [config.path]: value }
    },
    validate: (value) => {
      return undefined
    },
  }
}
