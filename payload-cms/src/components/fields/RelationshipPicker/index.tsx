'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@payloadcms/ui'
import './styles.scss'

interface RelationshipItem {
  id: string | number
  [key: string]: any
}

interface RelationshipPickerProps {
  relationTo: string
  value?: string | number | (string | number)[] | null
  onChange: (value: string | number | (string | number)[] | null) => void
  label?: string
  hasMany?: boolean
  adminLabelField?: string // Field to show in labels (e.g. 'name' or 'title')
}

export const RelationshipPicker: React.FC<RelationshipPickerProps> = (props) => {
  const { relationTo, value, onChange, label, hasMany, adminLabelField = 'name' } = props
  const { t, i18n } = useTranslation()
  const adminLang = i18n.language

  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState<RelationshipItem[]>([])
  const [selectedItems, setSelectedItems] = useState<RelationshipItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch selected items when value changes
  useEffect(() => {
    const loadSelectedItems = async () => {
      if (value === null || value === undefined) {
        setSelectedItems([])
        return
      }

      const ids = Array.isArray(value) ? value : [value]
      if (ids.length === 0) {
        setSelectedItems([])
        return
      }

      try {
        const query = new URLSearchParams({
          limit: ids.length.toString(),
          'where[id][in]': ids.join(','),
          depth: '0',
        })
        const res = await fetch(`/api/${relationTo}?${query.toString()}`)
        const data = await res.json()
        setSelectedItems(data.docs || [])
      } catch (error) {
        console.error(`Failed to load selected ${relationTo}:`, error)
      }
    }
    loadSelectedItems()
  }, [value, relationTo])

  // Fetch items for the picker modal
  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '10',
        page: page.toString(),
        depth: '0',
        sort: adminLabelField,
      })

      if (search) {
        params.append(`where[${adminLabelField}][contains]`, search)
      }

      const res = await fetch(`/api/${relationTo}?${params.toString()}`)
      const data = await res.json()
      setItems(data.docs || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error(`Failed to fetch ${relationTo}:`, error)
    } finally {
      setLoading(false)
    }
  }, [relationTo, page, search, adminLabelField])

  useEffect(() => {
    if (isOpen) {
      fetchItems()
    }
  }, [isOpen, fetchItems])

  const handleSelect = (item: RelationshipItem) => {
    if (hasMany) {
      const currentIds = (Array.isArray(value) ? value : []).map(id => String(id))
      const itemIdStr = String(item.id)
      if (currentIds.includes(itemIdStr)) {
        const nextValue = currentIds.filter(id => id !== itemIdStr)
        onChange(nextValue.length > 0 ? nextValue : null)
      } else {
        onChange([...currentIds, itemIdStr])
      }
    } else {
      onChange(item.id)
      setIsOpen(false)
    }
  }

  const handleRemove = (id: string | number) => {
    if (hasMany) {
      const currentIds = (Array.isArray(value) ? value : []).map(v => String(v))
      const idStr = String(id)
      const nextValue = currentIds.filter(v => v !== idStr)
      onChange(nextValue.length > 0 ? nextValue : null)
    } else {
      onChange(null)
    }
  }

  const getDisplayLabel = (item: RelationshipItem) => {
    return item[adminLabelField] || item.name || item.title || `ID: ${item.id}`
  }

  return (
    <div className="relationship-picker">
      {label && <label className="relationship-picker__label">{label}</label>}
      
      <div className="relationship-picker__selected">
        {selectedItems.map((item) => (
          <div key={`selected-${relationTo}-${item.id}`} className="relationship-picker__tag">
            <span>{getDisplayLabel(item)}</span>
            <button type="button" onClick={() => handleRemove(item.id)}>✕</button>
          </div>
        ))}
        
        <button
          type="button"
          className="relationship-picker__add"
          onClick={() => setIsOpen(true)}
        >
          {selectedItems.length > 0 ? '+ Add' : `Select ${relationTo}`}
        </button>
      </div>

      {isOpen && (
        <div className="relationship-picker__modal" onClick={() => setIsOpen(false)}>
          <div className="relationship-picker__modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="relationship-picker__modal-header">
              <h3>Select {relationTo}</h3>
              <button type="button" onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <div className="relationship-picker__filters">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>

            <div className="relationship-picker__list">
              {loading ? (
                <div className="loading">Loading...</div>
              ) : items.length === 0 ? (
                <div className="empty">No items found</div>
              ) : (
                items.map((item) => {
                  const isSelected = Array.isArray(value) 
                    ? (value as any[]).some(v => String(v) === String(item.id))
                    : String(value) === String(item.id)
                  
                  return (
                    <div
                      key={`modal-${relationTo}-${item.id}`}
                      className={`relationship-picker__item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelect(item)}
                    >
                      {getDisplayLabel(item)}
                      {isSelected && <span className="check">✓</span>}
                    </div>
                  )
                })
              )}
            </div>

            {totalPages > 1 && (
              <div className="relationship-picker__pagination">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                <span>{page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
