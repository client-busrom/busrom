/**
 * Scene Gallery Field - Custom field for managing scene image groups
 *
 * 场景图组字段 - 支持管理多个场景图组，每个场景组包含多张图片
 *
 * Data Structure:
 * [
 *   { id: 'scene-1', name: 'Scene 1', images: [{ id: 'media-id-1' }, { id: 'media-id-2' }] },
 *   { id: 'scene-2', name: 'Scene 2', images: [{ id: 'media-id-3' }] },
 * ]
 */

import React, { useState } from 'react'
import { FieldContainer, FieldLabel } from '@keystone-ui/fields'
import { FieldController, FieldProps } from '@keystone-6/core/types'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'
import { FilteredMediaSelector } from './FilteredMediaSelector'
import { getCdnUrl } from '../lib/cdn-url'
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Types
interface SceneGroup {
  id: string
  name: string
  images: { id: string }[]
}

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

// Generate unique ID
const generateId = () => `scene-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Sortable Image Item Component (within a scene)
function SortableImageItem({ id, media, onRemove }: { id: string; media: any; onRemove: () => void }) {
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

  const thumbnailUrl = media?.variants?.thumbnail || media?.file?.url

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{
        position: 'relative',
        border: '2px solid #e5e7eb',
        borderRadius: '6px',
        overflow: 'hidden',
        background: 'white',
        width: '80px',
      }}>
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            background: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            padding: '2px 4px',
            borderRadius: '3px',
            cursor: 'grab',
            fontSize: '10px',
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
            top: '2px',
            right: '2px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            width: '18px',
            height: '18px',
            cursor: 'pointer',
            fontSize: '12px',
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
          {thumbnailUrl ? (
            <img
              src={getCdnUrl(thumbnailUrl)}
              alt={media?.filename || 'Image'}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              fontSize: '10px',
            }}>
              Loading...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Sortable Scene Group Component
function SortableSceneGroup({
  scene,
  mediaMap,
  onRemoveScene,
  onUpdateSceneName,
  onAddImages,
  onRemoveImage,
  onReorderImages,
}: {
  scene: SceneGroup
  mediaMap: Map<string, any>
  onRemoveScene: () => void
  onUpdateSceneName: (name: string) => void
  onAddImages: () => void
  onRemoveImage: (imageId: string) => void
  onReorderImages: (oldIndex: number, newIndex: number) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(scene.name)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const imageIds = scene.images.map(img => img.id)
      const oldIndex = imageIds.indexOf(active.id as string)
      const newIndex = imageIds.indexOf(over.id as string)
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderImages(oldIndex, newIndex)
      }
    }
  }

  const handleSaveName = () => {
    onUpdateSceneName(editName)
    setIsEditing(false)
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{
        border: '2px solid #d1d5db',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        background: '#fafafa',
      }}>
        {/* Scene Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px',
          gap: '12px',
        }}>
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            style={{
              background: '#6b7280',
              color: 'white',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'grab',
              fontSize: '14px',
            }}
          >
            ⋮⋮
          </div>

          {/* Scene Name */}
          {isEditing ? (
            <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName()
                  if (e.key === 'Escape') {
                    setEditName(scene.name)
                    setIsEditing(false)
                  }
                }}
              />
              <button
                type="button"
                onClick={handleSaveName}
                style={{
                  padding: '6px 12px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                fontSize: '16px',
                fontWeight: 600,
                color: '#374151',
                cursor: 'pointer',
              }}
              onClick={() => setIsEditing(true)}
              title="Click to edit name"
            >
              {scene.name}
              <span style={{ marginLeft: '8px', fontSize: '12px', color: '#9ca3af' }}>
                ({scene.images.length} images)
              </span>
            </div>
          )}

          {/* Delete Scene Button */}
          <button
            type="button"
            onClick={onRemoveScene}
            style={{
              padding: '6px 12px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Delete Scene
          </button>
        </div>

        {/* Images Grid with Drag & Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={scene.images.map(img => img.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              minHeight: '80px',
              padding: '12px',
              background: 'white',
              borderRadius: '8px',
              border: '1px dashed #d1d5db',
            }}>
              {scene.images.map((img) => {
                const media = mediaMap.get(img.id)
                return (
                  <SortableImageItem
                    key={img.id}
                    id={img.id}
                    media={media}
                    onRemove={() => onRemoveImage(img.id)}
                  />
                )
              })}

              {/* Add Image Button */}
              <button
                type="button"
                onClick={onAddImages}
                style={{
                  width: '80px',
                  height: '80px',
                  border: '2px dashed #10b981',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                  fontSize: '24px',
                }}
              >
                +
                <span style={{ fontSize: '10px', marginTop: '4px' }}>Add</span>
              </button>
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}

export const Field = ({ field, value, onChange }: FieldProps<typeof controller>) => {
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false)
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null)

  // Parse value (array of scene groups)
  const scenes: SceneGroup[] = value || []

  // Collect all image IDs for fetching
  const allImageIds = scenes.flatMap(scene => scene.images.map(img => img.id))

  // Fetch all media details
  const { data } = useQuery(GET_MEDIA_LIST_BY_IDS, {
    variables: { ids: allImageIds },
    skip: allImageIds.length === 0,
  })

  // Create a map for quick lookup
  const mediaMap = new Map<string, any>()
  data?.mediaFiles?.forEach((media: any) => {
    mediaMap.set(media.id, media)
  })

  // Drag and drop sensors for scenes
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle scene drag end
  const handleSceneDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const sceneIds = scenes.map(s => s.id)
      const oldIndex = sceneIds.indexOf(active.id as string)
      const newIndex = sceneIds.indexOf(over.id as string)
      if (oldIndex !== -1 && newIndex !== -1) {
        const newScenes = arrayMove(scenes, oldIndex, newIndex)
        onChange?.(newScenes)
      }
    }
  }

  // Add new scene
  const handleAddScene = () => {
    const newScene: SceneGroup = {
      id: generateId(),
      name: `Scene ${scenes.length + 1}`,
      images: [],
    }
    onChange?.([...scenes, newScene])
  }

  // Remove scene
  const handleRemoveScene = (sceneId: string) => {
    if (window.confirm('Are you sure you want to delete this scene group? All images in it will be removed.')) {
      onChange?.(scenes.filter(s => s.id !== sceneId))
    }
  }

  // Update scene name
  const handleUpdateSceneName = (sceneId: string, name: string) => {
    onChange?.(scenes.map(s => s.id === sceneId ? { ...s, name } : s))
  }

  // Open media selector for a scene
  const handleOpenMediaSelector = (sceneId: string) => {
    setActiveSceneId(sceneId)
    setMediaSelectorOpen(true)
  }

  // Add image to scene
  const handleAddImage = (mediaId: string) => {
    if (!activeSceneId) return
    onChange?.(scenes.map(s => {
      if (s.id === activeSceneId && !s.images.some(img => img.id === mediaId)) {
        return { ...s, images: [...s.images, { id: mediaId }] }
      }
      return s
    }))
  }

  // Remove image from scene
  const handleRemoveImage = (sceneId: string, imageId: string) => {
    onChange?.(scenes.map(s => {
      if (s.id === sceneId) {
        return { ...s, images: s.images.filter(img => img.id !== imageId) }
      }
      return s
    }))
  }

  // Reorder images in scene
  const handleReorderImages = (sceneId: string, oldIndex: number, newIndex: number) => {
    onChange?.(scenes.map(s => {
      if (s.id === sceneId) {
        return { ...s, images: arrayMove(s.images, oldIndex, newIndex) }
      }
      return s
    }))
  }

  // Get currently selected image IDs for the active scene
  const activeScene = scenes.find(s => s.id === activeSceneId)
  const activeSceneImageIds = activeScene?.images.map(img => img.id) || []

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
        Manage scene image groups. Each scene can contain multiple images. | 管理场景图组，每个场景可包含多张图片
      </div>

      <div style={{ marginTop: '8px' }}>
        {/* Scene Groups with Drag & Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleSceneDragEnd}
        >
          <SortableContext
            items={scenes.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {scenes.map((scene) => (
              <SortableSceneGroup
                key={scene.id}
                scene={scene}
                mediaMap={mediaMap}
                onRemoveScene={() => handleRemoveScene(scene.id)}
                onUpdateSceneName={(name) => handleUpdateSceneName(scene.id, name)}
                onAddImages={() => handleOpenMediaSelector(scene.id)}
                onRemoveImage={(imageId) => handleRemoveImage(scene.id, imageId)}
                onReorderImages={(oldIndex, newIndex) => handleReorderImages(scene.id, oldIndex, newIndex)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Add Scene Button */}
        <button
          type="button"
          onClick={handleAddScene}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            width: '100%',
            fontWeight: 500,
          }}
        >
          + Add New Scene Group | 新增场景组
        </button>

        {scenes.length > 0 && (
          <div style={{
            marginTop: '12px',
            fontSize: '12px',
            color: '#6b7280',
          }}>
            {scenes.length} scene group{scenes.length > 1 ? 's' : ''}, {allImageIds.length} total images. Drag to reorder scenes and images.
          </div>
        )}
      </div>

      {/* Media Selector Modal */}
      <FilteredMediaSelector
        isOpen={mediaSelectorOpen}
        onClose={() => {
          setMediaSelectorOpen(false)
          setActiveSceneId(null)
        }}
        onSelect={handleAddImage}
        multiple={true}
        selectedIds={activeSceneImageIds}
      />
    </FieldContainer>
  )
}

export const Cell = ({ item, field }: any) => {
  const value = item[field.path]

  if (!value || !Array.isArray(value) || value.length === 0) {
    return <div style={{ color: '#999', fontSize: '13px' }}>No scenes</div>
  }

  const totalImages = value.reduce((sum: number, scene: SceneGroup) => sum + (scene.images?.length || 0), 0)

  return (
    <div style={{ fontSize: '13px', color: '#4a5568', fontWeight: 500 }}>
      {value.length} scene{value.length > 1 ? 's' : ''} ({totalImages} images)
    </div>
  )
}

export const CardValue = ({ item, field }: any) => {
  const value = item[field.path]

  if (!value || !Array.isArray(value) || value.length === 0) {
    return <div style={{ color: '#999' }}>No scenes</div>
  }

  // Show preview thumbnails from first few scenes
  const allImageIds = value.slice(0, 3).flatMap((scene: SceneGroup) => scene.images.slice(0, 2).map(img => img.id))

  return (
    <div>
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
        {value.length} scene{value.length > 1 ? 's' : ''}
      </div>
      {/* Preview will be rendered when we have the media data */}
    </div>
  )
}

export const controller = (config: any): FieldController<SceneGroup[], SceneGroup[]> => {
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
    validate: () => undefined,
  }
}
