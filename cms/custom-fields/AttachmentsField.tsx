/**
 * Attachments Field - Display attachments with preview for images
 *
 * Features:
 * - Image preview with thumbnail
 * - Download link for non-image files
 * - File type icons
 * - File size display
 */

import React from 'react'
import { FieldContainer, FieldLabel } from '@keystone-ui/fields'
import { FieldController, FieldProps } from '@keystone-6/core/types'

interface Attachment {
  fieldName: string
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  uploadedAt: string
}

export const Field = ({ field, value }: FieldProps<typeof controller>) => {
  const attachments: Attachment[] = value ? JSON.parse(value) : []

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const isImage = (fileType: string): boolean => {
    return fileType.startsWith('image/')
  }

  const getFileIcon = (fileType: string): string => {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType === 'application/pdf') return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊'
    if (fileType.startsWith('text/')) return '📃'
    return '📎'
  }

  const [brokenFiles, setBrokenFiles] = React.useState<Set<string>>(new Set())

  const handleDownload = async (attachment: Attachment) => {
    try {
      // Check if file exists by making a HEAD request
      const response = await fetch(attachment.fileUrl, { method: 'HEAD' })
      if (!response.ok) {
        setBrokenFiles(prev => new Set([...prev, attachment.fileUrl]))
        alert(`File not found: ${attachment.fileName}\n\nThis file may have been deleted.`)
        return
      }

      // File exists, proceed with download
      const link = document.createElement('a')
      link.href = attachment.fileUrl
      link.download = attachment.fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      setBrokenFiles(prev => new Set([...prev, attachment.fileUrl]))
      alert(`Failed to download file: ${attachment.fileName}`)
    }
  }

  const isFileBroken = (fileUrl: string) => brokenFiles.has(fileUrl)

  if (attachments.length === 0) {
    return (
      <FieldContainer>
        <FieldLabel>{field.label}</FieldLabel>
        <div style={{
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '6px',
          border: '1px solid #e5e7eb',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          No attachments
        </div>
      </FieldContainer>
    )
  }

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '16px',
        marginTop: '8px'
      }}>
        {attachments.map((attachment, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden',
              background: 'white',
              transition: 'box-shadow 0.2s',
              cursor: isImage(attachment.fileType) ? 'default' : 'pointer',
            }}
            onClick={() => !isImage(attachment.fileType) && handleDownload(attachment)}
            onMouseEnter={(e) => {
              if (!isImage(attachment.fileType)) {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {/* Preview or Icon */}
            {isImage(attachment.fileType) ? (
              <div style={{
                width: '100%',
                height: '160px',
                background: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img
                  src={attachment.fileUrl}
                  alt={attachment.fileName}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = `
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #6b7280; gap: 8px;">
                          <div style="font-size: 48px">⚠️</div>
                          <div style="font-size: 12px; text-align: center; padding: 0 8px;">File Not Found</div>
                        </div>
                      `
                    }
                  }}
                />
              </div>
            ) : (
              <div style={{
                width: '100%',
                height: '120px',
                background: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px'
              }}>
                {getFileIcon(attachment.fileType)}
              </div>
            )}

            {/* File Info */}
            <div style={{ padding: '12px' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#111827',
                marginBottom: '4px',
                wordBreak: 'break-word',
                lineHeight: '1.4'
              }}>
                {attachment.fileName}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '8px'
              }}>
                {formatFileSize(attachment.fileSize)}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {isImage(attachment.fileType) && (
                  <a
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      padding: '6px 12px',
                      background: '#f3f4f6',
                      color: '#374151',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      fontSize: '13px',
                      textAlign: 'center',
                      fontWeight: 500,
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e5e7eb'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f3f4f6'
                    }}
                  >
                    🔍 View
                  </a>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(attachment)
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#059669'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#10b981'
                  }}
                >
                  ⬇️ Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </FieldContainer>
  )
}

export const controller = (
  config: FieldController<string, string>
): FieldController<string, string> => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: '[]',
    deserialize: (data) => {
      const value = data[config.path]
      if (!value) return '[]'
      return typeof value === 'string' ? value : JSON.stringify(value)
    },
    serialize: (value) => ({ [config.path]: value }),
    validate: () => true,
  }
}
