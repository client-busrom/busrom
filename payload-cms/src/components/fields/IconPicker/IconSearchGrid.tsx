'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { searchIcons, getIconSvgUrl, POPULAR_PREFIXES } from './iconify-utils'

interface IconSearchGridProps {
  onSelect: (iconName: string) => void
  selectedIcon?: string
  isZh: boolean
}

export const IconSearchGrid: React.FC<IconSearchGridProps> = ({ onSelect, selectedIcon, isZh }) => {
  const [query, setQuery] = useState('')
  const [prefix, setPrefix] = useState('')
  const [icons, setIcons] = useState<string[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const doSearch = useCallback(async (searchQuery: string, searchPrefix: string) => {
    if (!searchQuery.trim()) {
      setIcons([])
      setTotal(0)
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    setHasSearched(true)
    try {
      const result = await searchIcons(searchQuery, 80, searchPrefix || undefined)
      setIcons(result.icons)
      setTotal(result.total)
    } catch (error) {
      console.warn('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced search on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      doSearch(query, prefix)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, prefix, doSearch])

  return (
    <div>
      {/* Search input */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isZh ? '搜索图标...' : 'Search icons...'}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: 'var(--theme-input-bg, #fff)',
            color: 'var(--theme-text, #000)',
          }}
          autoFocus
        />
        <select
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          style={{
            padding: '8px',
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: '4px',
            fontSize: '13px',
            backgroundColor: 'var(--theme-input-bg, #fff)',
            color: 'var(--theme-text, #000)',
            minWidth: '140px',
          }}
        >
          {POPULAR_PREFIXES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results info */}
      {hasSearched && !isLoading && (
        <div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--theme-elevation-500)' }}>
          {icons.length > 0
            ? `${icons.length}${total > icons.length ? ` / ${total}` : ''} ${isZh ? '个结果' : 'results'}`
            : isZh ? '没有找到图标' : 'No icons found'}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--theme-elevation-500)' }}>
          {isZh ? '搜索中...' : 'Searching...'}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !hasSearched && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--theme-elevation-500)', fontSize: '14px' }}>
          {isZh ? '输入关键词搜索 200,000+ 图标' : 'Type to search 200,000+ icons'}
        </div>
      )}

      {/* Icon Grid */}
      {!isLoading && icons.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
            gap: '4px',
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '4px',
          }}
        >
          {icons.map((icon) => {
            const isSelected = selectedIcon === icon
            return (
              <button
                key={icon}
                type="button"
                onClick={() => onSelect(icon)}
                title={icon}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '8px 4px',
                  border: isSelected ? '2px solid #A08745' : '1px solid var(--theme-elevation-150)',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? 'rgba(160, 135, 69, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--theme-elevation-50)'
                    e.currentTarget.style.borderColor = 'var(--theme-elevation-300)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.borderColor = 'var(--theme-elevation-150)'
                  }
                }}
              >
                <img
                  src={getIconSvgUrl(icon, '#333')}
                  alt={icon}
                  width={28}
                  height={28}
                  style={{
                    width: '28px',
                    height: '28px',
                    filter: 'var(--theme-icon-filter, none)',
                  }}
                  loading="lazy"
                />
                <span
                  style={{
                    fontSize: '9px',
                    color: 'var(--theme-elevation-500)',
                    textAlign: 'center',
                    lineHeight: '1.2',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {icon.split(':')[1] || icon}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
