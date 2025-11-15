/**
 * Sortable Application Categories Field
 *
 * Allows selecting multiple Categories (type=APPLICATION only) and sorting them with drag-and-drop.
 *
 * Data structure: ['category-id-1', 'category-id-2', 'category-id-3']
 */

import React, { useState } from 'react'
import { FieldContainer, FieldLabel } from '@keystone-ui/fields'
import { FieldController, FieldProps } from '@keystone-6/core/types'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// GraphQL query to get all APPLICATION Categories
const GET_APPLICATION_CATEGORIES = gql`
  query GetApplicationCategories {
    categories(where: { type: { equals: "APPLICATION" } }, orderBy: { order: asc }) {
      id
      slug
      name
      type
    }
  }
`

// GraphQL query to get Categories by IDs
const GET_CATEGORIES_BY_IDS = gql`
  query GetCategoriesByIds($ids: [ID!]!) {
    categories(where: { id: { in: $ids } }) {
      id
      slug
      name
      type
    }
  }
`

// Sortable Item Component
function SortableItem({
  id,
  category,
  onRemove,
  getCategoryName,
}: {
  id: string
  category: any
  onRemove: () => void
  getCategoryName: (category: any) => string
}) {
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

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        background: '#f9fafb',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        marginBottom: '8px',
      }}>
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            padding: '4px 8px',
            background: '#e5e7eb',
            borderRadius: '4px',
            fontSize: '18px',
            userSelect: 'none',
          }}
        >
          ⋮⋮
        </div>

        {/* Category Info */}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: '#1f2937' }}>
            {getCategoryName(category)}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Slug: {category.slug} | Type: {category.type}
          </div>
        </div>

        {/* Remove Button */}
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
    </div>
  )
}

// Selector Modal Component
function CategorySelectorModal({
  isOpen,
  onClose,
  onSelect,
  selectedIds,
}: {
  isOpen: boolean
  onClose: () => void
  onSelect: (categoryId: string) => void
  selectedIds: string[]
}) {
  const [searchTerm, setSearchTerm] = useState('')

  const { data, loading } = useQuery(GET_APPLICATION_CATEGORIES, {
    skip: !isOpen,
  })

  if (!isOpen) return null

  const allCategories = data?.categories || []

  // Parse name field helper
  const getCategoryName = (category: any): string => {
    try {
      const nameObj = typeof category.name === 'string' ? JSON.parse(category.name) : category.name
      return nameObj?.zh || nameObj?.en || category.slug
    } catch {
      return category.slug
    }
  }

  // Filter categories based on search term
  const filteredCategories = allCategories.filter((category: any) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    const categoryName = getCategoryName(category)
    return (
      category.slug?.toLowerCase().includes(searchLower) ||
      categoryName?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '2rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
          Select Application Categories
        </h2>

        {/* Search */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by slug or name..."
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid #cbd5e0',
            borderRadius: '6px',
            marginBottom: '16px',
          }}
        />

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Loading...
          </div>
        )}

        {/* Categories List */}
        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredCategories.map((category: any) => {
              const isSelected = selectedIds.includes(category.id)

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    onSelect(category.id)
                    onClose()
                  }}
                  disabled={isSelected}
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    border: `2px solid ${isSelected ? '#10b981' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    background: isSelected ? '#d1fae5' : 'white',
                    cursor: isSelected ? 'not-allowed' : 'pointer',
                    opacity: isSelected ? 0.6 : 1,
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#1f2937' }}>
                    {getCategoryName(category)}
                    {isSelected && ' ✓'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Slug: {category.slug}
                  </div>
                </button>
              )
            })}

            {filteredCategories.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                No application categories found
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export const Field = ({ field, value, onChange }: FieldProps<typeof controller>) => {
  const [selectorOpen, setSelectorOpen] = useState(false)

  // Parse value
  const categoryIds: string[] = Array.isArray(value) ? value : []

  // Fetch selected categories details
  const { data } = useQuery(GET_CATEGORIES_BY_IDS, {
    variables: { ids: categoryIds },
    skip: categoryIds.length === 0,
  })

  const selectedCategories = data?.categories || []

  // Parse name field helper
  const getCategoryName = (category: any): string => {
    try {
      const nameObj = typeof category.name === 'string' ? JSON.parse(category.name) : category.name
      return nameObj?.zh || nameObj?.en || category.slug
    } catch {
      return category.slug
    }
  }

  // Create ordered categories list
  const orderedCategories = categoryIds
    .map(id => selectedCategories.find((c: any) => c.id === id))
    .filter(Boolean)

  // Sensors for drag and drop
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
      const oldIndex = categoryIds.findIndex(id => id === active.id)
      const newIndex = categoryIds.findIndex(id => id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(categoryIds, oldIndex, newIndex)
        onChange?.(newOrder)
      }
    }
  }

  // Add category
  const addCategory = (categoryId: string) => {
    if (!categoryIds.includes(categoryId)) {
      onChange?.([...categoryIds, categoryId])
    }
  }

  // Remove category
  const removeCategory = (categoryId: string) => {
    onChange?.(categoryIds.filter(id => id !== categoryId))
  }

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>

      <div style={{ marginTop: '12px' }}>
        {/* Selected Categories with Drag & Drop */}
        {orderedCategories.length === 0 ? (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: '#999',
            background: '#f9f9f9',
            borderRadius: '8px',
            marginBottom: '12px',
          }}>
            No application categories selected. Click "Add Category" to start.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categoryIds}
              strategy={verticalListSortingStrategy}
            >
              <div style={{ marginBottom: '12px' }}>
                {orderedCategories.map((category: any) => (
                  <SortableItem
                    key={category.id}
                    id={category.id}
                    category={category}
                    onRemove={() => removeCategory(category.id)}
                    getCategoryName={getCategoryName}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Add Button */}
        <button
          type="button"
          onClick={() => setSelectorOpen(true)}
          style={{
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
          + Add Application Category ({orderedCategories.length} selected)
        </button>

        {/* Info */}
        {orderedCategories.length > 0 && (
          <div style={{
            marginTop: '12px',
            fontSize: '12px',
            color: '#6b7280',
            padding: '8px',
            background: '#f3f4f6',
            borderRadius: '4px',
          }}>
            💡 Drag the ⋮⋮ handle to reorder. Order will be preserved in the API.
          </div>
        )}

        {/* JSON Preview */}
        {categoryIds.length > 0 && (
          <details style={{ marginTop: '16px' }}>
            <summary style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#666' }}>
              📋 View Data
            </summary>
            <pre style={{
              marginTop: '8px',
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '6px',
              fontSize: '11px',
              overflow: 'auto',
              maxHeight: '200px',
            }}>
              {JSON.stringify(categoryIds, null, 2)}
            </pre>
          </details>
        )}
      </div>

      {/* Selector Modal */}
      <CategorySelectorModal
        isOpen={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={addCategory}
        selectedIds={categoryIds}
      />
    </FieldContainer>
  )
}

export const Cell = ({ item, field }: any) => {
  const value = item[field.path]

  if (!value || !Array.isArray(value) || value.length === 0) {
    return <div style={{ color: '#999', fontSize: '13px' }}>No categories</div>
  }

  return (
    <div style={{ fontSize: '13px', color: '#4a5568' }}>
      <span style={{ fontWeight: 500 }}>{value.length} categories</span>
    </div>
  )
}

export const controller = (config: any): FieldController<string[], string[]> => {
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
      if (!Array.isArray(value)) {
        return 'Must be an array'
      }
      return undefined
    },
  }
}
