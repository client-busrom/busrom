/**
 * Marquee Links Block Preview Component
 */
'use client'

import React from 'react'

interface MarqueeLinksPreviewProps {
  data: {
    links?: Array<{
      text?: string
      url?: string
    }>
    speed?: 'slow' | 'normal' | 'fast'
    direction?: 'left' | 'right'
  }
}

export const MarqueeLinksPreview: React.FC<MarqueeLinksPreviewProps> = ({ data }) => {
  if (!data) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>🔄 Loading...</p>
      </div>
    )
  }

  const { links = [], speed = 'normal', direction = 'left' } = data

  if (!links.length) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>🔄 No marquee links added</p>
      </div>
    )
  }

  const speedValues = {
    slow: '60s',
    normal: '30s',
    fast: '15s',
  }

  return (
    <div
      style={{
        margin: '1rem 0',
        background: '#f9f9f9',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        padding: '1rem',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '2rem',
          whiteSpace: 'nowrap',
        }}
      >
        {links.map((link, index) => (
          <div
            key={index}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#0070f3',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            <span>{link.text || 'Untitled'}</span>
            {link.url && <span style={{ color: '#999', fontSize: '0.75rem' }}>→</span>}
          </div>
        ))}
      </div>
      <p
        style={{
          marginTop: '0.75rem',
          fontSize: '0.75rem',
          color: '#999',
          textAlign: 'center',
        }}
      >
        ⬅️ Scrolling {direction} • Speed: {speed} • {links.length} link{links.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
