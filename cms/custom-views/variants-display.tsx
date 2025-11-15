/**
 * Image Variants Display - Custom Field View
 *
 * This custom view provides a beautiful UI for displaying and managing image variants
 * in the Keystone Admin UI.
 *
 * Features:
 * - Visual preview of all variants
 * - One-click URL copying
 * - Size information
 * - Responsive layout
 */

import React from 'react'
import { FieldProps } from '@keystone-6/core/types'
import { controller } from '@keystone-6/core/fields/types/json/views'

// Variant metadata
const VARIANT_INFO = {
  thumbnail: { label: 'Thumbnail', size: '150×150', icon: '🖼️', description: '缩略图' },
  small: { label: 'Small', size: '400px', icon: '📱', description: '移动端' },
  medium: { label: 'Medium', size: '800px', icon: '💻', description: '平板' },
  large: { label: 'Large', size: '1200px', icon: '🖥️', description: '桌面' },
  xlarge: { label: 'XLarge', size: '1920px', icon: '📺', description: '全屏' },
  webp: { label: 'WebP', size: 'Optimized', icon: '⚡', description: 'WebP格式' },
}

type VariantKey = keyof typeof VARIANT_INFO

interface ImageVariants {
  thumbnail?: string
  small?: string
  medium?: string
  large?: string
  xlarge?: string
  webp?: string
}

function VariantCard({ variantKey, url }: { variantKey: VariantKey; url: string }) {
  const [copied, setCopied] = React.useState(false)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const info = VARIANT_INFO[variantKey]

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div
        style={{
          background: 'white',
          border: '1px solid #e1e8ed',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
          e.currentTarget.style.borderColor = '#3b82f6'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.borderColor = '#e1e8ed'
        }}
      >
        {/* Icon */}
        <div
          style={{
            fontSize: '32px',
            lineHeight: '1',
          }}
        >
          {info.icon}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 600,
              color: '#1f2937',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {info.label}
            <span
              style={{
                fontSize: '12px',
                color: '#6b7280',
                fontWeight: 400,
              }}
            >
              ({info.description})
            </span>
          </div>
          <div
            style={{
              fontSize: '13px',
              color: '#6b7280',
              fontFamily: 'monospace',
            }}
          >
            {info.size}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setPreviewOpen(true)}
            style={{
              padding: '8px 16px',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              color: '#374151',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e5e7eb'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f3f4f6'
            }}
          >
            预览
          </button>
          <button
            onClick={copyToClipboard}
            style={{
              padding: '8px 16px',
              background: copied ? '#10b981' : '#3b82f6',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              color: 'white',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!copied) {
                e.currentTarget.style.background = '#2563eb'
              }
            }}
            onMouseLeave={(e) => {
              if (!copied) {
                e.currentTarget.style.background = '#3b82f6'
              }
            }}
          >
            {copied ? '✓ 已复制' : '复制URL'}
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '40px',
          }}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '90%',
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewOpen(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
            <img
              src={url}
              alt={`${info.label} preview`}
              style={{
                maxWidth: '100%',
                maxHeight: 'calc(90vh - 80px)',
                display: 'block',
                margin: '0 auto',
              }}
            />
            <div
              style={{
                marginTop: '16px',
                fontSize: '13px',
                color: '#6b7280',
                textAlign: 'center',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
              }}
            >
              {url}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export const Field = ({ field, value }: FieldProps<typeof controller>) => {
  // Parse variants from JSON
  const variants: ImageVariants = React.useMemo(() => {
    if (!value) return {}
    try {
      return typeof value === 'string' ? JSON.parse(value) : value
    } catch {
      return {}
    }
  }, [value])

  // Check if variants exist
  const hasVariants = Object.keys(variants).length > 0
  const variantCount = Object.values(variants).filter(Boolean).length

  return (
    <div style={{ marginTop: '8px' }}>
      {/* Header */}
      <div
        style={{
          background: hasVariants ? '#eff6ff' : '#fef2f2',
          border: `1px solid ${hasVariants ? '#bfdbfe' : '#fecaca'}`,
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: hasVariants ? '4px' : '0',
          }}
        >
          <span style={{ fontSize: '20px' }}>{hasVariants ? '✅' : '⏳'}</span>
          <span
            style={{
              fontWeight: 600,
              color: hasVariants ? '#1e40af' : '#991b1b',
            }}
          >
            {hasVariants
              ? `已生成 ${variantCount} 个图片变体`
              : '图片变体生成中...'}
          </span>
        </div>
        {!hasVariants && (
          <div
            style={{
              fontSize: '13px',
              color: '#991b1b',
              marginLeft: '28px',
            }}
          >
            上传后会自动生成缩略图、多尺寸版本和WebP格式。请稍候刷新页面查看。
          </div>
        )}
      </div>

      {/* Variants Grid */}
      {hasVariants && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '12px',
          }}
        >
          {(Object.keys(VARIANT_INFO) as VariantKey[]).map((key) => {
            const url = variants[key]
            if (!url) return null
            return <VariantCard key={key} variantKey={key} url={url} />
          })}
        </div>
      )}

      {/* Empty state or JSON fallback */}
      {!hasVariants && (
        <div
          style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖼️</div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px',
            }}
          >
            暂无图片变体
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            上传图片后，系统会自动生成多个尺寸的优化版本
          </div>
          <div
            style={{
              fontSize: '13px',
              color: '#9ca3af',
              fontFamily: 'monospace',
              background: '#f3f4f6',
              padding: '8px 12px',
              borderRadius: '4px',
              display: 'inline-block',
            }}
          >
            {JSON.stringify(variants, null, 2)}
          </div>
        </div>
      )}

      {/* Help text */}
      {hasVariants && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#15803d',
          }}
        >
          💡 <strong>使用提示:</strong> 在前端使用这些变体可以大幅提升加载速度。
          点击"复制URL"按钮获取变体链接，或查看{' '}
          <a
            href="/docs/07-图片变体使用指南.md"
            target="_blank"
            style={{ color: '#15803d', textDecoration: 'underline' }}
          >
            使用指南
          </a>
          。
        </div>
      )}
    </div>
  )
}

// Export the Cell view (for list view)
export const Cell = ({ field, item }: any) => {
  const variants = item[field.path]
  const variantCount = variants ? Object.keys(variants).length : 0

  if (variantCount === 0) {
    return (
      <div style={{ fontSize: '13px', color: '#9ca3af' }}>
        ⏳ 生成中...
      </div>
    )
  }

  return (
    <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 500 }}>
      ✓ {variantCount} 个变体
    </div>
  )
}
