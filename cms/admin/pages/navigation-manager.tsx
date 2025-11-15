/**
 * Navigation Manager - Drag-and-Drop Ordering Interface
 *
 * This custom admin page allows users to manage navigation menu items
 * with intuitive drag-and-drop reordering functionality.
 */

import React, { useState, useEffect } from 'react'
import { PageContainer } from '@keystone-6/core/admin-ui/components'
import { Heading } from '@keystone-ui/core'
import { useMutation, useQuery, gql } from '@keystone-6/core/admin-ui/apollo'
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
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// ==================================================================
// GraphQL Queries and Mutations
// ==================================================================

const GET_NAVIGATION_MENUS = gql`
  query GetNavigationMenus {
    navigationMenus(orderBy: { order: asc }) {
      id
      slug
      order
      visible
      type
      parent {
        id
        slug
      }
    }
  }
`

const UPDATE_NAVIGATION_ORDER = gql`
  mutation UpdateNavigationOrder($id: ID!, $order: Int!) {
    updateNavigationMenu(where: { id: $id }, data: { order: $order }) {
      id
      slug
      order
    }
  }
`

// ==================================================================
// Types
// ==================================================================

interface NavigationMenu {
  id: string
  slug: string
  order: number
  visible: boolean
  type: string
  parent: { id: string; slug: string } | null
}

// ==================================================================
// Sortable Item Component
// ==================================================================

interface SortableItemProps {
  item: NavigationMenu
}

function SortableItem({ item }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    padding: '16px',
    marginBottom: '8px',
    backgroundColor: 'white',
    border: '1px solid #e1e5e9',
    borderRadius: '8px',
    cursor: 'grab',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: 'bold' }}>
          {item.order}
        </span>
        <div>
          <div style={{ fontWeight: '600', color: '#1f2937' }}>{item.slug}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Type (类型): {item.type}
            {item.parent && ` | Parent (父级): ${item.parent.slug}`}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {item.visible ? (
          <span style={{ color: '#10b981', fontSize: '12px' }}>✓ Visible (显示)</span>
        ) : (
          <span style={{ color: '#ef4444', fontSize: '12px' }}>✗ Hidden (隐藏)</span>
        )}
      </div>
    </div>
  )
}

// ==================================================================
// Main Component
// ==================================================================

export default function NavigationManager() {
  const [items, setItems] = useState<NavigationMenu[]>([])
  const [updateOrder] = useMutation(UPDATE_NAVIGATION_ORDER)

  // Fetch navigation menus
  const { data, loading, error, refetch } = useQuery(GET_NAVIGATION_MENUS)

  // Set up drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Update local state when data is loaded
  useEffect(() => {
    if (data?.navigationMenus) {
      setItems(data.navigationMenus)
    }
  }, [data])

  // Create a drag handler for a specific group of items
  const createDragEndHandler = (groupItems: typeof items) => async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    // Find indices within this specific group
    const oldIndex = groupItems.findIndex(item => item.id === active.id)
    const newIndex = groupItems.findIndex(item => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Reorder only within this group
    const reorderedGroup = arrayMove(groupItems, oldIndex, newIndex)

    // Update the global items state
    const newItems = items.map(item => {
      const updatedItem = reorderedGroup.find(g => g.id === item.id)
      return updatedItem || item
    })
    setItems(newItems)

    // Update order values in database (only for this group)
    try {
      const updatePromises = reorderedGroup.map((item, index) => {
        const newOrder = index + 1
        if (item.order !== newOrder) {
          console.log(`Updating ${item.slug}: order ${item.order} → ${newOrder}`)
          return updateOrder({
            variables: {
              id: item.id,
              order: newOrder,
            },
          })
        }
        return Promise.resolve()
      })

      await Promise.all(updatePromises)

      console.log('✅ Navigation order updated successfully')

      // Refetch to ensure data consistency
      await refetch()
    } catch (err) {
      console.error('❌ Error updating navigation order:', err)
      // Revert to original order on error
      await refetch()
    }
  }

  // Separate top-level and child menus
  const topLevelMenus = items.filter(item => !item.parent)

  // Group child menus by parent
  const childMenusByParent = items
    .filter(item => item.parent)
    .reduce((acc, item) => {
      const parentSlug = item.parent.slug
      if (!acc[parentSlug]) {
        acc[parentSlug] = []
      }
      acc[parentSlug].push(item)
      return acc
    }, {} as Record<string, typeof items>)

  return (
    <PageContainer header="Navigation Menu Manager (导航菜单管理器)">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ color: '#6b7280', marginBottom: '32px' }}>
          Drag and drop menu items to reorder them. Changes are saved automatically. (拖拽菜单项以重新排序。更改会自动保存。)
        </p>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Loading navigation menus... (加载导航菜单中...)
          </div>
        )}

        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            marginBottom: '24px'
          }}>
            Error loading navigation menus (加载导航菜单时出错): {error.message}
          </div>
        )}

        {!loading && !error && topLevelMenus.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            No navigation menus found. Create some menu items first. (未找到导航菜单。请先创建一些菜单项。)
          </div>
        )}

        {!loading && !error && topLevelMenus.length > 0 && (
          <>
            {/* Top-level menus */}
            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ marginBottom: '16px', color: '#374151', fontSize: '16px', fontWeight: '600' }}>
                Top-Level Menus (顶级菜单)
              </h4>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={createDragEndHandler(topLevelMenus)}
              >
                <SortableContext
                  items={topLevelMenus.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {topLevelMenus.map(item => (
                    <SortableItem key={item.id} item={item} />
                  ))}
                </SortableContext>
              </DndContext>
            </div>

            {/* Child menus grouped by parent */}
            {Object.keys(childMenusByParent).length > 0 && (
              <div>
                <h4 style={{ marginBottom: '16px', color: '#374151', fontSize: '16px', fontWeight: '600' }}>
                  Child Menus (Grouped by Parent) (子菜单 - 按父级菜单分组)
                </h4>
                {Object.entries(childMenusByParent).map(([parentSlug, children]) => (
                  <div key={parentSlug} style={{ marginBottom: '32px' }}>
                    <h5 style={{
                      marginBottom: '12px',
                      color: '#6b7280',
                      fontSize: '14px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Parent (父级): {parentSlug}
                    </h5>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={createDragEndHandler(children)}
                    >
                      <SortableContext
                        items={children.map(item => item.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {children.map(item => (
                          <SortableItem key={item.id} item={item} />
                        ))}
                      </SortableContext>
                    </DndContext>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Instructions */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <h5 style={{ marginBottom: '12px', color: '#374151', fontWeight: '600' }}>
            💡 Tips:
          </h5>
          <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
            <li>Top-level menus and child menus are ordered separately</li>
            <li>Drag and drop items to change their order</li>
            <li>Changes are saved automatically to the database</li>
            <li>The order number determines the display position (lower = first)</li>
            <li>Hidden menus are marked with "✗ Hidden"</li>
          </ul>
        </div>
      </div>
    </PageContainer>
  )
}
