'use client'

import React from 'react'
import Link from 'next/link'

export const NavigationManagerLink: React.FC = () => {
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
        <strong>拖拽排序</strong>
        <span style={{ marginLeft: '8px', opacity: 0.7 }}>
          使用可视化界面拖拽调整菜单顺序
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
        打开排序管理器
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
