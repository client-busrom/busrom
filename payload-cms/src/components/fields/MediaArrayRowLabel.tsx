'use client'

import React from 'react'
import { useRowLabel, useTranslation } from '@payloadcms/ui'

// i18n translations
const i18n = {
  image: { en: 'Image', zh: '图片' },
}

export const MediaArrayRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ image?: { filename?: string; url?: string; thumbnailURL?: string } | number }>()
  const { i18n: { language } } = useTranslation()
  const t = (obj: { en: string; zh: string }) => language === 'zh' ? obj.zh : obj.en

  // Handle both populated and non-populated image data
  const image = data?.image
  const isPopulated = typeof image === 'object' && image !== null

  if (isPopulated && image.thumbnailURL) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img
          src={image.thumbnailURL}
          alt={image.filename || `${t(i18n.image)} ${(rowNumber ?? 0) + 1}`}
          style={{
            width: '40px',
            height: '40px',
            objectFit: 'cover',
            borderRadius: '4px',
          }}
        />
        <span>{image.filename || `${t(i18n.image)} ${(rowNumber ?? 0) + 1}`}</span>
      </div>
    )
  }

  return <span>{t(i18n.image)} {(rowNumber ?? 0) + 1}</span>
}

export default MediaArrayRowLabel
