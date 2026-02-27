/**
 * Carousel Block Preview Component
 */
'use client'

import React from 'react'

interface CarouselPreviewProps {
  data: {
    slides?: Array<{
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
    autoplay?: boolean
    interval?: number
  }
}

export const CarouselPreview: React.FC<CarouselPreviewProps> = ({ data }) => {
  if (!data) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>🎠 Loading...</p>
      </div>
    )
  }

  const { slides = [], autoplay, interval } = data

  if (!slides.length) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>🎠 No carousel slides added</p>
      </div>
    )
  }

  return (
    <div style={{ margin: '1rem 0' }}>
      <div
        style={{
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#f5f5f5',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        {slides[0]?.image?.url ? (
          <img
            src={slides[0].image.sizes?.card?.url || slides[0].image.sizes?.thumbnail?.url || slides[0].image.url}
            alt={slides[0].image.alt || slides[0].caption || 'Slide'}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              paddingBottom: '56.25%',
              background: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <p style={{ color: '#999' }}>No image</p>
          </div>
        )}
        {slides[0]?.caption && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              color: '#fff',
              padding: '0.75rem',
              fontSize: '0.875rem',
            }}
          >
            {slides[0].caption}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: '0.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '0.5rem',
          }}
        >
          {slides.map((_, index) => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: index === 0 ? '#fff' : 'rgba(255, 255, 255, 0.5)',
              }}
            />
          ))}
        </div>
      </div>
      <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#666', textAlign: 'center' }}>
        {slides.length} slide{slides.length !== 1 ? 's' : ''}
        {autoplay && ` • Auto-play: ${interval || 5000}ms`}
      </p>
    </div>
  )
}
