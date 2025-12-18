/**
 * CTA Button Block Preview Component
 */
'use client'

import React from 'react'

interface CtaButtonPreviewProps {
  data: {
    text?: string
    url?: string
    style?: 'primary' | 'secondary' | 'outline'
    size?: 'small' | 'medium' | 'large'
    alignment?: 'left' | 'center' | 'right'
  }
}

export const CtaButtonPreview: React.FC<CtaButtonPreviewProps> = ({ data }) => {
  if (!data) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>🔘 Loading...</p>
      </div>
    )
  }

  const { text, url, style = 'primary', size = 'medium', alignment = 'center' } = data

  if (!text) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>🔘 No button text provided</p>
      </div>
    )
  }

  const sizeStyles = {
    small: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    medium: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    large: { padding: '1rem 2rem', fontSize: '1.125rem' },
  }

  const buttonStyles = {
    primary: {
      background: '#0070f3',
      color: '#fff',
      border: 'none',
    },
    secondary: {
      background: '#666',
      color: '#fff',
      border: 'none',
    },
    outline: {
      background: 'transparent',
      color: '#0070f3',
      border: '2px solid #0070f3',
    },
  }

  return (
    <div style={{ textAlign: alignment, margin: '1rem 0' }}>
      <button
        style={{
          ...sizeStyles[size],
          ...buttonStyles[style],
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 600,
          transition: 'all 0.2s',
        }}
        type="button"
      >
        {text}
      </button>
      {url && (
        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#999' }}>
          → {url}
        </p>
      )}
    </div>
  )
}
