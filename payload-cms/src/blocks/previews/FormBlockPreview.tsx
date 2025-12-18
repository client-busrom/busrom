/**
 * Form Block Preview Component
 */
'use client'

import React from 'react'

interface FormBlockPreviewProps {
  data: {
    form?: {
      id: string
      name?: string
    }
    title?: string
    description?: string
  }
}

export const FormBlockPreview: React.FC<FormBlockPreviewProps> = ({ data }) => {
  if (!data) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>📝 Loading...</p>
      </div>
    )
  }

  const { form, title, description } = data

  if (!form) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>📝 No form selected</p>
      </div>
    )
  }

  return (
    <div
      style={{
        border: '2px dashed #d0d0d0',
        borderRadius: '8px',
        padding: '1.5rem',
        margin: '1rem 0',
        background: '#fafafa',
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📝</span>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
            {title || 'Form Block'}
          </h3>
        </div>
        {description && (
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>
            {description}
          </p>
        )}
      </div>
      <div
        style={{
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '1rem',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#0070f3', fontWeight: 600 }}>
          Form: {form.name || `ID: ${form.id}`}
        </p>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#999' }}>
          This form will be dynamically loaded on the frontend
        </p>
      </div>
    </div>
  )
}
