/**
 * Sortable Product Series Field
 *
 * Allows selecting multiple ProductSeries and sorting them with drag-and-drop.
 *
 * Data structure: ['series-id-1', 'series-id-2', 'series-id-3']
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

// GraphQL query to get all ProductSeries
const GET_PRODUCT_SERIES = gql`
  query GetProductSeries {
    productSeriesItems(orderBy: { order: asc }) {
      id
      slug
      name
    }
  }
`

// GraphQL query to get ProductSeries by IDs
const GET_PRODUCT_SERIES_BY_IDS = gql`
  query GetProductSeriesByIds($ids: [ID!]!) {
    productSeriesItems(where: { id: { in: $ids } }) {
      id
      slug
      name
    }
  }
`

// Sortable Item Component
function SortableItem({
  id,
  series,
  onRemove,
  getSeriesName,
}: {
  id: string
  series: any
  onRemove: () => void
  getSeriesName: (series: any) => string
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

        {/* Series Info */}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: '#1f2937' }}>
            {getSeriesName(series)}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Slug: {series.slug}
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
function SeriesSelectorModal({
  isOpen,
  onClose,
  onSelect,
  selectedIds,
}: {
  isOpen: boolean
  onClose: () => void
  onSelect: (seriesId: string) => void
  selectedIds: string[]
}) {
  const [searchTerm, setSearchTerm] = useState('')

  const { data, loading } = useQuery(GET_PRODUCT_SERIES, {
    skip: !isOpen,
  })

  if (!isOpen) return null

  const allSeries = data?.productSeriesItems || []

  // Parse name field helper
  const getSeriesName = (series: any): string => {
    try {
      const nameObj = typeof series.name === 'string' ? JSON.parse(series.name) : series.name
      return nameObj?.zh || nameObj?.en || series.slug
    } catch {
      return series.slug
    }
  }

  // Filter series based on search term
  const filteredSeries = allSeries.filter((series: any) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    const seriesName = getSeriesName(series)
    return (
      series.slug?.toLowerCase().includes(searchLower) ||
      seriesName?.toLowerCase().includes(searchLower)
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
          Select Product Series
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

        {/* Series List */}
        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredSeries.map((series: any) => {
              const isSelected = selectedIds.includes(series.id)

              return (
                <button
                  key={series.id}
                  type="button"
                  onClick={() => {
                    onSelect(series.id)
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
                    {getSeriesName(series)}
                    {isSelected && ' ✓'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Slug: {series.slug}
                  </div>
                </button>
              )
            })}

            {filteredSeries.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                No series found
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
  const seriesIds: string[] = Array.isArray(value) ? value : []

  // Fetch selected series details
  const { data } = useQuery(GET_PRODUCT_SERIES_BY_IDS, {
    variables: { ids: seriesIds },
    skip: seriesIds.length === 0,
  })

  const selectedSeries = data?.productSeriesItems || []

  // Parse name field helper
  const getSeriesName = (series: any): string => {
    try {
      const nameObj = typeof series.name === 'string' ? JSON.parse(series.name) : series.name
      return nameObj?.zh || nameObj?.en || series.slug
    } catch {
      return series.slug
    }
  }

  // Create ordered series list
  const orderedSeries = seriesIds
    .map(id => selectedSeries.find((s: any) => s.id === id))
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
      const oldIndex = seriesIds.findIndex(id => id === active.id)
      const newIndex = seriesIds.findIndex(id => id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(seriesIds, oldIndex, newIndex)
        onChange?.(newOrder)
      }
    }
  }

  // Add series
  const addSeries = (seriesId: string) => {
    if (!seriesIds.includes(seriesId)) {
      onChange?.([...seriesIds, seriesId])
    }
  }

  // Remove series
  const removeSeries = (seriesId: string) => {
    onChange?.(seriesIds.filter(id => id !== seriesId))
  }

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>

      <div style={{ marginTop: '12px' }}>
        {/* Selected Series with Drag & Drop */}
        {orderedSeries.length === 0 ? (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: '#999',
            background: '#f9f9f9',
            borderRadius: '8px',
            marginBottom: '12px',
          }}>
            No product series selected. Click "Add Series" to start.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={seriesIds}
              strategy={verticalListSortingStrategy}
            >
              <div style={{ marginBottom: '12px' }}>
                {orderedSeries.map((series: any) => (
                  <SortableItem
                    key={series.id}
                    id={series.id}
                    series={series}
                    onRemove={() => removeSeries(series.id)}
                    getSeriesName={getSeriesName}
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
          + Add Product Series ({orderedSeries.length} selected)
        </button>

        {/* Info */}
        {orderedSeries.length > 0 && (
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
        {seriesIds.length > 0 && (
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
              {JSON.stringify(seriesIds, null, 2)}
            </pre>
          </details>
        )}
      </div>

      {/* Selector Modal */}
      <SeriesSelectorModal
        isOpen={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={addSeries}
        selectedIds={seriesIds}
      />
    </FieldContainer>
  )
}

export const Cell = ({ item, field }: any) => {
  const value = item[field.path]

  if (!value || !Array.isArray(value) || value.length === 0) {
    return <div style={{ color: '#999', fontSize: '13px' }}>No series</div>
  }

  return (
    <div style={{ fontSize: '13px', color: '#4a5568' }}>
      <span style={{ fontWeight: 500 }}>{value.length} series</span>
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
