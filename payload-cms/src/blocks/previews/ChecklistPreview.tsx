/**
 * Checklist Block Preview Component
 */
'use client'

import React from 'react'

interface ChecklistPreviewProps {
  data: {
    title?: string
    items?: Array<{
      text?: string
      checked?: boolean
    }>
    style?: 'default' | 'bordered' | 'minimal'
  }
}

export const ChecklistPreview: React.FC<ChecklistPreviewProps> = ({ data }) => {
  if (!data) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>☑️ Loading...</p>
      </div>
    )
  }

  const { title, items = [], style = 'default' } = data

  if (!items.length) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>☑️ No checklist items added</p>
      </div>
    )
  }

  const containerStyles = {
    default: {
      background: '#f9f9f9',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      padding: '1rem',
    },
    bordered: {
      background: '#fff',
      border: '2px solid #0070f3',
      borderRadius: '8px',
      padding: '1.5rem',
    },
    minimal: {
      background: 'transparent',
      border: 'none',
      padding: '0.5rem',
    },
  }

  return (
    <div style={{ margin: '1rem 0', ...containerStyles[style] }}>
      {title && (
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 600 }}>
          {title}
        </h3>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                border: '2px solid #0070f3',
                background: item.checked ? '#0070f3' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {item.checked && (
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
              )}
            </div>
            <span
              style={{
                fontSize: '0.875rem',
                color: item.checked ? '#666' : '#333',
                textDecoration: item.checked ? 'line-through' : 'none',
              }}
            >
              {item.text || 'Untitled item'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
