/**
 * Notice Block Preview Component
 */
'use client'

import React from 'react'

interface NoticePreviewProps {
  data: {
    type?: 'info' | 'success' | 'warning' | 'error'
    title?: string
    message?: string
  }
}

export const NoticePreview: React.FC<NoticePreviewProps> = ({ data }) => {
  if (!data) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>ℹ️ Loading...</p>
      </div>
    )
  }

  const { type = 'info', title, message } = data

  if (!message && !title) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>ℹ️ No notice content provided</p>
      </div>
    )
  }

  const typeStyles = {
    info: {
      background: '#e6f7ff',
      borderColor: '#1890ff',
      color: '#0050b3',
      icon: 'ℹ️',
    },
    success: {
      background: '#f6ffed',
      borderColor: '#52c41a',
      color: '#237804',
      icon: '✅',
    },
    warning: {
      background: '#fffbe6',
      borderColor: '#faad14',
      color: '#ad6800',
      icon: '⚠️',
    },
    error: {
      background: '#fff2f0',
      borderColor: '#ff4d4f',
      color: '#a8071a',
      icon: '❌',
    },
  }

  const style = typeStyles[type]

  return (
    <div
      style={{
        background: style.background,
        borderLeft: `4px solid ${style.borderColor}`,
        borderRadius: '4px',
        padding: '1rem',
        margin: '1rem 0',
      }}
    >
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '1.25rem' }}>{style.icon}</span>
        <div style={{ flex: 1 }}>
          {title && (
            <h4 style={{ margin: '0 0 0.5rem 0', color: style.color, fontWeight: 600 }}>
              {title}
            </h4>
          )}
          {message && (
            <p style={{ margin: 0, color: style.color, fontSize: '0.875rem', lineHeight: 1.5 }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
