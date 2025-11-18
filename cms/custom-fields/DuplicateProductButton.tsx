/**
 * Duplicate Product Button
 *
 * A custom field view that displays a button to duplicate the current product
 * along with all its content translations.
 */

import React, { useState } from 'react'
import { useRouter } from '@keystone-6/core/admin-ui/router'

export const Field = ({ value, itemId }: { value: any; itemId: string }) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDuplicate = async () => {
    if (!itemId) {
      setError('Product ID not found')
      return
    }

    const confirmed = window.confirm(
      '确定要复制这个产品吗？\nAre you sure you want to duplicate this product?\n\n这将会复制产品的所有信息，包括所有内容翻译。\nThis will copy all product information including all content translations.'
    )

    if (!confirmed) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/duplicate-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: itemId }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to duplicate product')
      }

      // Navigate to the new product's edit page
      router.push(`/products/${result.duplicatedProduct.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to duplicate product')
      setIsLoading(false)
    }
  }

  // Don't show the button if no item ID (new product being created)
  if (!itemId) {
    return (
      <div style={{ color: '#94a3b8', fontSize: '13px' }}>
        保存产品后可使用复制功能 / Save product first to enable duplication
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={handleDuplicate}
        disabled={isLoading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          backgroundColor: isLoading ? '#94a3b8' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 500,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseOver={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = '#2563eb'
          }
        }}
        onMouseOut={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = '#3b82f6'
          }
        }}
      >
        {isLoading ? (
          <>
            <span style={{
              display: 'inline-block',
              width: '14px',
              height: '14px',
              border: '2px solid white',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            复制中... / Duplicating...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            复制产品 / Duplicate Product
          </>
        )}
      </button>

      {error && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          borderRadius: '4px',
          fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

/**
 * Cell Component - Display duplicate button in list view
 */
export const Cell = ({ item }: { item: { id: string } }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!item?.id) return

    const confirmed = window.confirm(
      '确定要复制这个产品吗？\nAre you sure you want to duplicate this product?'
    )

    if (!confirmed) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/duplicate-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: item.id }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to duplicate product')
      }

      // Navigate to the new product's edit page
      window.location.href = `/products/${result.duplicatedProduct.id}`
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate product')
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={isLoading}
      title="复制产品 / Duplicate Product"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 10px',
        backgroundColor: isLoading ? '#94a3b8' : '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 500,
        cursor: isLoading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        minWidth: '32px',
      }}
      onMouseOver={(e) => {
        if (!isLoading) {
          e.currentTarget.style.backgroundColor = '#2563eb'
        }
      }}
      onMouseOut={(e) => {
        if (!isLoading) {
          e.currentTarget.style.backgroundColor = '#3b82f6'
        }
      }}
    >
      {isLoading ? (
        <span style={{
          display: 'inline-block',
          width: '12px',
          height: '12px',
          border: '2px solid white',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  )
}

/**
 * CardValue Component - Not displayed in card view
 */
export const CardValue = () => null

export const controller = (config: any) => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: '',
    defaultValue: null,
    deserialize: () => null,
    serialize: () => ({}),
    validate: () => undefined,
  }
}
