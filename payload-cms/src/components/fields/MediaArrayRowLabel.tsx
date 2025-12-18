'use client'

import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

export const MediaArrayRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ image?: { filename?: string; url?: string; thumbnailURL?: string } | number }>()

  // Handle both populated and non-populated image data
  const image = data?.image
  const isPopulated = typeof image === 'object' && image !== null

  if (isPopulated && image.thumbnailURL) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img
          src={image.thumbnailURL}
          alt={image.filename || `Image ${(rowNumber ?? 0) + 1}`}
          style={{
            width: '40px',
            height: '40px',
            objectFit: 'cover',
            borderRadius: '4px',
          }}
        />
        <span>{image.filename || `Image ${(rowNumber ?? 0) + 1}`}</span>
      </div>
    )
  }

  return <span>Image {(rowNumber ?? 0) + 1}</span>
}

export default MediaArrayRowLabel
