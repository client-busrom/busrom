/**
 * File Size Field - Display file size in human-readable format
 *
 * Converts bytes to KB, MB, GB with proper formatting
 */

import React from 'react'
import { FieldContainer, FieldLabel } from '@keystone-ui/fields'
import { FieldController, FieldProps } from '@keystone-6/core/types'

// Format bytes to human-readable size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export const Field = ({ field, value }: FieldProps<typeof controller>) => {
  const bytes = typeof value === 'number' ? value : parseInt(value || '0', 10)
  const formattedSize = formatFileSize(bytes)

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <div
        style={{
          marginTop: '8px',
          padding: '12px 16px',
          background: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '6px',
          display: 'inline-block',
        }}
      >
        <span
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#495057',
          }}
        >
          {formattedSize}
        </span>
        <span
          style={{
            marginLeft: '12px',
            fontSize: '13px',
            color: '#6c757d',
          }}
        >
          ({bytes.toLocaleString()} bytes)
        </span>
      </div>
    </FieldContainer>
  )
}

export const Cell = ({ item, field }: any) => {
  const value = item[field.path]
  const bytes = typeof value === 'number' ? value : parseInt(value || '0', 10)
  const formattedSize = formatFileSize(bytes)

  return (
    <div style={{ fontSize: '13px', color: '#4a5568' }}>
      <span style={{ fontWeight: 500 }}>{formattedSize}</span>
    </div>
  )
}

export const controller = (
  config: FieldController<number, number>
): FieldController<number, number> => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: 0,
    deserialize: (data) => {
      const value = data[config.path]
      return typeof value === 'number' ? value : 0
    },
    serialize: (value) => ({ [config.path]: value }),
    validate: () => true,
  }
}
