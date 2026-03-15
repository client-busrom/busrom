'use client'

import React, { useEffect, useState } from 'react'
import { useTranslation } from '@payloadcms/ui'
import { fetchMediaItems } from '../../lib/media-cache'

interface MediaItem {
  id: number
  filename: string
  url: string
  thumbnailURL?: string
}

export const MediaThumbnailCell: React.FC<any> = (props) => {
  const { cellData } = props
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  
  const ids = Array.isArray(cellData) ? cellData : (cellData ? [cellData] : [])
  const hasMultiple = ids.length > 1

  useEffect(() => {
    if (ids.length === 0) {
      setItems([])
      return
    }

    let isMounted = true

    // Only fetch if data is not already populated (it's often just IDs in list view)
    const firstItem = ids[0]
    if (typeof firstItem === 'object' && firstItem !== null && (firstItem.url || firstItem.thumbnailURL)) {
      setItems(ids.map(id => ({
        id: id.id,
        filename: id.filename,
        url: id.url,
        thumbnailURL: id.sizes?.thumbnail?.url || id.sizes?.card?.url || id.url
      })))
      return
    }

    // Otherwise fetch
    setLoading(true)
    fetchMediaItems(ids.map(id => typeof id === 'object' ? id.id : id)).then(results => {
      if (isMounted) {
        setItems(results)
        setLoading(false)
      }
    }).catch(() => {
      if (isMounted) setLoading(false)
    })

    return () => { isMounted = false }
  }, [cellData])

  if (ids.length === 0) return null

  if (loading && items.length === 0) {
    return <span style={{ fontSize: '12px', color: '#999' }}>...</span>
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      flexWrap: 'wrap',
      gap: '4px' 
    }}>
      {items.slice(0, 5).map((item) => (
        <div 
          key={item.id} 
          style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '4px',
            overflow: 'hidden',
            border: '1px solid var(--theme-elevation-200)',
            position: 'relative'
          }}
          title={item.filename}
        >
          <img
            src={item.thumbnailURL || item.url}
            alt={item.filename}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
      ))}
      {ids.length > 5 && (
        <span style={{ 
          fontSize: '11px', 
          color: 'var(--theme-elevation-500)',
          fontWeight: '500'
        }}>
          +{ids.length - 5}
        </span>
      )}
    </div>
  )
}

export default MediaThumbnailCell
