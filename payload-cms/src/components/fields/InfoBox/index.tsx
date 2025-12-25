'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale } from '@payloadcms/ui'

interface LocalizedString {
  en: string
  zh: string
}

interface InfoBoxProps {
  message: LocalizedString | string
  linkHref?: string
  linkText?: LocalizedString | string
}

export const InfoBox: React.FC<InfoBoxProps> = ({ message, linkHref, linkText }) => {
  const { code: locale } = useLocale()

  const getMessage = (text: LocalizedString | string): string => {
    if (typeof text === 'string') return text
    return text[locale as keyof LocalizedString] || text.en
  }

  return (
    <div
      style={{
        padding: '12px 16px',
        backgroundColor: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        marginBottom: '16px',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '14px',
          color: 'var(--theme-elevation-800)',
          lineHeight: '1.5',
        }}
      >
        {getMessage(message)}
      </p>
      {linkHref && linkText && (
        <Link
          href={linkHref}
          style={{
            display: 'inline-block',
            marginTop: '8px',
            fontSize: '14px',
            color: 'var(--theme-text)',
            textDecoration: 'underline',
          }}
        >
          {getMessage(linkText)} &rarr;
        </Link>
      )}
    </div>
  )
}

export default InfoBox
