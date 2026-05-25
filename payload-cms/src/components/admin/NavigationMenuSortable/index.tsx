'use client'

/**
 * NavigationMenu Sortable Component
 *
 * Custom admin view component for drag-drop sorting of navigation menus.
 * Uses @dnd-kit for smooth drag animations like Keystone.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useCustomTranslation } from '@/hooks/useCustomTranslation'
import './styles.scss'

interface NavigationMenuItem {
  id: string
  slug: string
  name: string
  type: string
  parent?: { id: string; type?: string } | null
  order: number
  visible: boolean
  gridSpan?: number
}

interface SortableItemProps {
  item: NavigationMenuItem
  level: number
  isDragOverlay?: boolean
}

// Sortable Item Component
const SortableItem: React.FC<SortableItemProps> = ({ item, level, isDragOverlay }) => {
  const { t } = useCustomTranslation()
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
    marginLeft: `${level * 24}px`,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={isDragOverlay ? { marginLeft: `${level * 24}px` } : style}
      className={`nav-menu-sortable__item ${isDragging ? 'nav-menu-sortable__item--dragging' : ''} ${isDragOverlay ? 'nav-menu-sortable__item--overlay' : ''}`}
    >
      <div
        className="nav-menu-sortable__drag-handle"
        {...attributes}
        {...listeners}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 4h2v2H4V4zm0 3h2v2H4V7zm0 3h2v2H4v-2zm3-6h2v2H7V4zm0 3h2v2H7V7zm0 3h2v2H7v-2z" />
        </svg>
      </div>

      <div className="nav-menu-sortable__content">
        <span className="nav-menu-sortable__slug">{item.slug}</span>
        <span className="nav-menu-sortable__name">{item.name || t('navManager.noName')}</span>
        <span className={`nav-menu-sortable__type nav-menu-sortable__type--${item.type}`}>
          {item.type}
        </span>
        {item.parent?.type === 'product_cards' && typeof item.gridSpan === 'number' && (
          <span className="nav-menu-sortable__grid-span">{t('navManager.span')}{item.gridSpan}</span>
        )}
        <span className="nav-menu-sortable__order">#{item.order}</span>
        {!item.visible && (
          <span className="nav-menu-sortable__hidden">{t('navManager.hidden')}</span>
        )}
      </div>

      <a
        href={`/admin/collections/navigation-menus/${item.id}`}
        className="nav-menu-sortable__edit-link"
        onClick={(e) => e.stopPropagation()}
      >
        {t('navManager.edit')}
      </a>
    </div>
  )
}

export const NavigationMenuSortable: React.FC = () => {
  const { t } = useCustomTranslation()
  const [menus, setMenus] = useState<NavigationMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Fetch all navigation menus
  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/navigation-menus?limit=100&sort=order&depth=1')
      if (!response.ok) throw new Error('Failed to fetch menus')
      const data = await response.json()
      setMenus(data.docs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : t('navManager.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  // Group menus by parent
  const groupedMenus = useMemo(() => {
    const grouped: { [key: string]: NavigationMenuItem[] } = { root: [] }

    menus.forEach((item) => {
      const parentId = item.parent?.id || 'root'
      if (!grouped[parentId]) {
        grouped[parentId] = []
      }
      grouped[parentId].push(item)
    })

    // Sort each group by order
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => a.order - b.order)
    })

    return grouped
  }, [menus])

  // Get the active item for drag overlay
  const activeItem = useMemo(() => {
    if (!activeId) return null
    return menus.find((m) => m.id === activeId) || null
  }, [activeId, menus])

  // Get the level of an item
  const getItemLevel = useCallback((item: NavigationMenuItem): number => {
    if (!item.parent?.id) return 0
    const parent = menus.find((m) => m.id === item.parent?.id)
    if (!parent) return 0
    return 1 + getItemLevel(parent)
  }, [menus])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const activeItem = menus.find((m) => m.id === active.id)
    const overItem = menus.find((m) => m.id === over.id)

    if (!activeItem || !overItem) return

    // Only allow reordering within same parent
    const activeParentId = activeItem.parent?.id || 'root'
    const overParentId = overItem.parent?.id || 'root'

    if (activeParentId !== overParentId) {
      setError(t('navManager.sameLevelOnly'))
      setTimeout(() => setError(null), 3000)
      return
    }

    // Get items in this group
    const groupItems = groupedMenus[activeParentId] || []
    const oldIndex = groupItems.findIndex((m) => m.id === active.id)
    const newIndex = groupItems.findIndex((m) => m.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    // Reorder the group
    const reorderedGroup = arrayMove(groupItems, oldIndex, newIndex)

    // Update local state immediately (optimistic update)
    const updatedMenus = menus.map((menu) => {
      const newOrderIndex = reorderedGroup.findIndex((r) => r.id === menu.id)
      if (newOrderIndex !== -1) {
        return { ...menu, order: newOrderIndex + 1 }
      }
      return menu
    })
    setMenus(updatedMenus)

    // Save to server
    setSaving(true)
    setError(null)

    try {
      await Promise.all(
        reorderedGroup.map((item, index) =>
          fetch(`/api/navigation-menus/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: index + 1 }),
          })
        )
      )

      setSuccessMessage(t('navManager.orderSaved'))
      setTimeout(() => setSuccessMessage(null), 2000)
    } catch (err) {
      setError(t('navManager.saveFailed'))
      await fetchMenus() // Revert on error
    } finally {
      setSaving(false)
    }
  }

  // Build hierarchical display - render each item with its children immediately below
  const renderMenuTree = () => {
    const rootItems = groupedMenus.root || []

    // Recursively render an item and its children
    const renderItemWithChildren = (item: NavigationMenuItem, level: number): React.ReactNode => {
      const children = groupedMenus[item.id] || []

      return (
        <div key={item.id} className="nav-menu-sortable__tree-node">
          <div className="nav-menu-sortable__item-wrapper">
            <SortableItem item={item} level={level} />
          </div>
          {children.length > 0 && (
            <div className="nav-menu-sortable__children">
              <SortableContext items={children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                {children.map((child) => renderItemWithChildren(child, level + 1))}
              </SortableContext>
            </div>
          )}
        </div>
      )
    }

    return (
      <SortableContext items={rootItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {rootItems.map((item) => renderItemWithChildren(item, 0))}
      </SortableContext>
    )
  }

  return (
    <div className="nav-menu-sortable">
      <div className="nav-menu-sortable__header">
        <h1>{t('navManager.title')}</h1>
        <p className="nav-menu-sortable__description">
          {t('navManager.description')}
        </p>
      </div>

      {error && (
        <div className="nav-menu-sortable__error">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="nav-menu-sortable__success">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="nav-menu-sortable__loading">{t('navManager.loading')}</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className={`nav-menu-sortable__list ${saving ? 'nav-menu-sortable__list--saving' : ''}`}>
            {menus.length > 0 ? (
              renderMenuTree()
            ) : (
              <div className="nav-menu-sortable__empty">
                {t('navManager.noMenus')}
              </div>
            )}
          </div>

          <DragOverlay>
            {activeItem ? (
              <SortableItem
                item={activeItem}
                level={getItemLevel(activeItem)}
                isDragOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <div className="nav-menu-sortable__footer">
        <a href="/admin/collections/navigation-menus" className="nav-menu-sortable__back-link">
          {t('navManager.backToList')}
        </a>
        <a href="/admin/collections/navigation-menus/create" className="nav-menu-sortable__create-link">
          {t('navManager.createNew')}
        </a>
      </div>
    </div>
  )
}

export default NavigationMenuSortable
