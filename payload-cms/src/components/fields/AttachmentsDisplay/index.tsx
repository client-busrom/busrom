'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'

interface Attachment {
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
}

/**
 * AttachmentsDisplay Component
 *
 * Renders attachments in a readable format with download links
 */
export const AttachmentsDisplay: React.FC<{ path: string }> = () => {
  // Read from the actual 'attachments' field
  const { value } = useField<Attachment[]>({ path: 'attachments' })

  if (!value || !Array.isArray(value) || value.length === 0) {
    return (
      <div style={{ padding: '12px', color: '#666' }}>
        No attachments / 无附件
      </div>
    )
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get file icon based on type
  const getFileIcon = (fileType: string): string => {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦'
    if (fileType.startsWith('video/')) return '🎬'
    if (fileType.startsWith('audio/')) return '🎵'
    return '📎'
  }

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      {value.map((attachment, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            borderBottom:
              index < value.length - 1
                ? '1px solid var(--theme-elevation-100)'
                : 'none',
            gap: '12px',
          }}
        >
          {/* File Icon */}
          <span style={{ fontSize: '24px' }}>
            {getFileIcon(attachment.fileType || '')}
          </span>

          {/* File Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 500,
                marginBottom: '4px',
                wordBreak: 'break-word',
              }}
            >
              {attachment.fileName || 'Unknown file'}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--theme-elevation-500)',
              }}
            >
              {attachment.fileType || 'Unknown type'} • {formatFileSize(attachment.fileSize || 0)}
            </div>
          </div>

          {/* Download Link */}
          {attachment.fileUrl && (
            <a
              href={attachment.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '6px 12px',
                backgroundColor: 'var(--theme-elevation-100)',
                borderRadius: '4px',
                textDecoration: 'none',
                color: 'var(--theme-elevation-800)',
                fontSize: '13px',
                whiteSpace: 'nowrap',
              }}
            >
              Download / 下载
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

export default AttachmentsDisplay
