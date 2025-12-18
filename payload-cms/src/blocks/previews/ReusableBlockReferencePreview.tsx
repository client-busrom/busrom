/**
 * Reusable Block Reference Preview Component
 */
'use client'

import React from 'react'

interface ReusableBlockReferencePreviewProps {
  data: {
    reusableBlock?: {
      id: string
      title?: string
      blockType?: string
    }
  }
}

export const ReusableBlockReferencePreview: React.FC<ReusableBlockReferencePreviewProps> = ({ data }) => {
  if (!data) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>♻️ Loading...</p>
      </div>
    )
  }

  const { reusableBlock } = data

  if (!reusableBlock) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>♻️ No reusable block selected</p>
      </div>
    )
  }

  return (
    <div
      style={{
        border: '2px dashed #52c41a',
        borderRadius: '8px',
        padding: '1.5rem',
        margin: '1rem 0',
        background: '#f6ffed',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '2rem' }}>♻️</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#237804' }}>
            Reusable Block Reference
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#52c41a' }}>
            {reusableBlock.title || `ID: ${reusableBlock.id}`}
          </p>
          {reusableBlock.blockType && (
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#999' }}>
              Type: {reusableBlock.blockType}
            </p>
          )}
        </div>
      </div>
      <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#666' }}>
        This reusable block content will be loaded dynamically on the frontend
      </p>
    </div>
  )
}
