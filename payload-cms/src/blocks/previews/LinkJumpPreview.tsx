/**
 * Link Jump Block Preview Component
 */
'use client'

import React from 'react'

interface LinkJumpPreviewProps {
  data: {
    title?: string
    links?: Array<{
      text?: string
      url?: string
      icon?: string
    }>
    layout?: 'grid' | 'list'
  }
}

export const LinkJumpPreview: React.FC<LinkJumpPreviewProps> = ({ data }) => {
  if (!data) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>🔗 Loading...</p>
      </div>
    )
  }

  const { title, links = [], layout = 'grid' } = data

  if (!links.length) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>🔗 No quick links added</p>
      </div>
    )
  }

  const gridStyles = layout === 'grid'
    ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }
    : { display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' }

  return (
    <div style={{ margin: '1rem 0' }}>
      {title && (
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 600 }}>
          {title}
        </h3>
      )}
      <div style={gridStyles}>
        {links.map((link, index) => (
          <div
            key={index}
            style={{
              background: '#f9f9f9',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {link.icon && (
              <span style={{ fontSize: '1.5rem' }}>{link.icon}</span>
            )}
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#0070f3' }}>
                {link.text || 'Untitled link'}
              </p>
              {link.url && (
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#999' }}>
                  {link.url}
                </p>
              )}
            </div>
            <span style={{ color: '#0070f3', fontSize: '1.25rem' }}>→</span>
          </div>
        ))}
      </div>
    </div>
  )
}
