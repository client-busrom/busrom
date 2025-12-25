'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslation } from '@payloadcms/ui'

// i18n translations
const i18n = {
  dragSort: { en: 'Drag to Sort', zh: '拖拽排序' },
  description: { en: 'Use visual interface to drag and adjust menu order', zh: '使用可视化界面拖拽调整菜单顺序' },
  openManager: { en: 'Open Sort Manager', zh: '打开排序管理器' },
}

export const NavigationManagerLink: React.FC = () => {
  const { i18n: { language } } = useTranslation()
  const t = (obj: { en: string; zh: string }) => language === 'zh' ? obj.zh : obj.en

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        marginBottom: '16px',
        backgroundColor: 'var(--theme-elevation-100)',
        borderRadius: '4px',
        border: '1px solid var(--theme-elevation-200)',
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
        <line x1="10" y1="3" x2="8" y2="21" />
        <line x1="16" y1="3" x2="14" y2="21" />
      </svg>
      <div style={{ flex: 1 }}>
        <strong>{t(i18n.dragSort)}</strong>
        <span style={{ marginLeft: '8px', opacity: 0.7 }}>
          {t(i18n.description)}
        </span>
      </div>
      <Link
        href="/admin/navigation-manager"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          backgroundColor: 'var(--theme-elevation-500)',
          color: 'var(--theme-elevation-0)',
          borderRadius: '4px',
          textDecoration: 'none',
          fontWeight: 500,
          fontSize: '14px',
        }}
      >
        {t(i18n.openManager)}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="M12 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}

export default NavigationManagerLink
