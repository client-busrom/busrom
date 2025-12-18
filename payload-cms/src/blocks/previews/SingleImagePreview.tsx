/**
 * Single Image Block Preview Component
 */
'use client'

import React from 'react'

interface SingleImagePreviewProps {
  data: {
    image?: {
      id: string
      url: string
      alt?: string
      width?: number
      height?: number
    }
    caption?: string
    alignment?: 'left' | 'center' | 'right'
    size?: 'small' | 'medium' | 'large' | 'full'
  }
}

export const SingleImagePreview: React.FC<SingleImagePreviewProps> = ({ data }) => {
  if (!data) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>📷 Loading...</p>
      </div>
    )
  }

  const { image, caption, alignment = 'center', size = 'large' } = data

  if (!image?.url) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>📷 No image selected</p>
      </div>
    )
  }

  const sizeStyles = {
    small: { maxWidth: '300px' },
    medium: { maxWidth: '600px' },
    large: { maxWidth: '900px' },
    full: { maxWidth: '100%' },
  }

  return (
    <div style={{ textAlign: alignment, margin: '1rem 0' }}>
      <div style={{ display: 'inline-block', ...sizeStyles[size] }}>
        <img
          src={image.url}
          alt={image.alt || caption || 'Image'}
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        />
        {caption && (
          <p
            style={{
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: '#666',
              fontStyle: 'italic',
            }}
          >
            {caption}
          </p>
        )}
      </div>
    </div>
  )
}
