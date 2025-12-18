/**
 * Hero Block Preview Component
 */
'use client'

import React from 'react'

interface HeroPreviewProps {
  data: {
    heading?: string
    subheading?: string
    backgroundImage?: {
      id: string
      url: string
      alt?: string
    }
    ctaText?: string
    ctaUrl?: string
    overlay?: boolean
  }
}

export const HeroPreview: React.FC<HeroPreviewProps> = ({ data }) => {
  if (!data) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>🎯 Loading...</p>
      </div>
    )
  }

  const { heading, subheading, backgroundImage, ctaText, ctaUrl, overlay = true } = data

  if (!heading) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>🎯 No hero heading provided</p>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '300px',
        borderRadius: '8px',
        overflow: 'hidden',
        margin: '1rem 0',
        backgroundImage: backgroundImage?.url ? `url(${backgroundImage.url})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
      }}
    >
      {overlay && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
          }}
        />
      )}
      <div style={{ position: 'relative', textAlign: 'center', padding: '2rem', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
          {heading}
        </h1>
        {subheading && (
          <p style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0', opacity: 0.9 }}>
            {subheading}
          </p>
        )}
        {ctaText && (
          <button
            style={{
              background: '#fff',
              color: '#333',
              padding: '0.75rem 2rem',
              borderRadius: '4px',
              border: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            type="button"
          >
            {ctaText}
          </button>
        )}
        {ctaUrl && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>
            → {ctaUrl}
          </p>
        )}
      </div>
    </div>
  )
}
