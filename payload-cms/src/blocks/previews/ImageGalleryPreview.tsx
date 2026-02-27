/**
 * Image Gallery Block Preview Component
 */
'use client'

import React from 'react'

interface ImageGalleryPreviewProps {
  data: {
    images?: Array<{
      image?: {
        id: string
        url: string
        alt?: string
        sizes?: {
          thumbnail?: { url: string }
          card?: { url: string }
        }
      }
      caption?: string
    }>
    columns?: number
    spacing?: 'tight' | 'normal' | 'loose'
  }
}

export const ImageGalleryPreview: React.FC<ImageGalleryPreviewProps> = ({ data }) => {
  if (!data) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>🖼️ Loading...</p>
      </div>
    )
  }

  const { images = [], columns = 3, spacing = 'normal' } = data

  if (!images.length) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>🖼️ No images in gallery</p>
      </div>
    )
  }

  const spacingValues = {
    tight: '0.5rem',
    normal: '1rem',
    loose: '1.5rem',
  }

  return (
    <div style={{ margin: '1rem 0' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: spacingValues[spacing],
        }}
      >
        {images.map((item, index) => (
          <div key={index}>
            {item.image?.url ? (
              <>
                <img
                  src={item.image.sizes?.card?.url || item.image.sizes?.thumbnail?.url || item.image.url}
                  alt={item.image.alt || item.caption || `Image ${index + 1}`}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                />
                {item.caption && (
                  <p
                    style={{
                      marginTop: '0.25rem',
                      fontSize: '0.75rem',
                      color: '#666',
                      textAlign: 'center',
                    }}
                  >
                    {item.caption}
                  </p>
                )}
              </>
            ) : (
              <div
                style={{
                  aspectRatio: '1',
                  background: '#f5f5f5',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                }}
              >
                No image
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
