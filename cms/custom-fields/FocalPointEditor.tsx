/**
 * Focal Point Editor
 *
 * 焦点编辑器
 *
 * Visual editor for setting the focal point of an image.
 * The focal point determines which part of the image remains visible when cropped to different aspect ratios.
 */

import React, { useState, useRef, useEffect } from 'react'
import { FieldProps } from '@keystone-6/core/types'
import { controller } from '@keystone-6/core/fields/types/json/views'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'
import { useRouter } from '@keystone-6/core/admin-ui/router'
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields'

// GraphQL query to get Media file URL
const GET_MEDIA_FILE = gql`
  query GetMediaFile($id: ID!) {
    media(where: { id: $id }) {
      id
      file {
        url
      }
    }
  }
`

type FocalPoint = {
  x: number
  y: number
}

// ==================================================================
// Visual Editor Modal Component
// ==================================================================

type EditorProps = {
  isOpen: boolean
  imageUrl?: string
  initialFocalPoint: FocalPoint
  onSave: (focalPoint: FocalPoint) => void
  onClose: () => void
}

const FocalPointModal: React.FC<EditorProps> = ({
  isOpen,
  imageUrl,
  initialFocalPoint,
  onSave,
  onClose,
}) => {
  const [focalX, setFocalX] = useState(initialFocalPoint.x)
  const [focalY, setFocalY] = useState(initialFocalPoint.y)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    updatePosition(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    updatePosition(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const updatePosition = (clientX: number, clientY: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 100
    const y = ((clientY - rect.top) / rect.height) * 100

    setFocalX(Math.round(Math.max(0, Math.min(100, x))))
    setFocalY(Math.round(Math.max(0, Math.min(100, y))))
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  const handleSave = () => {
    onSave({ x: focalX, y: focalY })
    onClose()
  }

  const handleReset = () => {
    setFocalX(50)
    setFocalY(50)
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '2rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '1200px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '2px solid #e5e7eb',
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              图片焦点编辑器 / Focal Point Editor
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              点击或拖拽设置图片的焦点位置，裁剪时会优先保留焦点区域
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '1.5rem',
              color: '#6b7280',
            }}
          >
            ✕
          </button>
        </div>

        {/* Preview Area */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
          {/* Image Container */}
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              width: '700px',
              height: '500px',
              backgroundColor: '#f0f0f0',
              border: '2px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: isDragging ? 'grabbing' : 'crosshair',
            }}
            onMouseDown={handleMouseDown}
          >
            {/* Image */}
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Preview"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              />
            ) : (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '0.875rem',
                pointerEvents: 'none',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🖼️</div>
                <div>图片预览</div>
              </div>
            )}

            {/* Focal Point Marker */}
            <div
              style={{
                position: 'absolute',
                left: `${focalX}%`,
                top: `${focalY}%`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
              }}
            >
              {/* Outer ring */}
              <div style={{
                position: 'absolute',
                width: '40px',
                height: '40px',
                border: '3px solid white',
                borderRadius: '50%',
                boxShadow: '0 0 8px rgba(0, 0, 0, 0.5)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }} />

              {/* Inner circle */}
              <div style={{
                position: 'absolute',
                width: '16px',
                height: '16px',
                backgroundColor: '#ef4444',
                border: '3px solid white',
                borderRadius: '50%',
                boxShadow: '0 0 8px rgba(0, 0, 0, 0.5)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }} />

              {/* Crosshair */}
              <div style={{
                position: 'absolute',
                width: '60px',
                height: '2px',
                backgroundColor: 'white',
                boxShadow: '0 0 4px rgba(0, 0, 0, 0.5)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }} />
              <div style={{
                position: 'absolute',
                width: '2px',
                height: '60px',
                backgroundColor: 'white',
                boxShadow: '0 0 4px rgba(0, 0, 0, 0.5)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }} />
            </div>

            {/* Grid lines (optional, for reference) */}
            {[33.33, 66.66].map((pos) => (
              <React.Fragment key={pos}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: `${pos}%`,
                  height: '1px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${pos}%`,
                  width: '1px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  pointerEvents: 'none',
                }} />
              </React.Fragment>
            ))}
          </div>

          {/* Info Panel */}
          <div style={{ flex: '1', minWidth: '250px' }}>
            <div style={{
              padding: '1rem',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              marginBottom: '1rem',
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong>焦点坐标:</strong>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  X 坐标（横向）
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                  {focalX}%
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Y 坐标（纵向）
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                  {focalY}%
                </div>
              </div>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: '#f0f9ff',
              border: '1px solid #0ea5e9',
              borderRadius: '6px',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              marginBottom: '1rem',
            }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>💡 使用说明：</div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>点击或拖拽红色标记到重要内容上</li>
                <li>焦点位置会在任意比例裁剪时优先保留</li>
                <li>适用于横版、竖版、方形等所有展示场景</li>
              </ul>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '6px',
              fontSize: '0.875rem',
              lineHeight: '1.5',
            }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>📌 常见用法：</div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>人物照片：焦点设在脸部</li>
                <li>产品图片：焦点设在产品中心</li>
                <li>风景照片：焦点设在主体景物</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          paddingTop: '2rem',
          borderTop: '2px solid #e5e7eb',
        }}>
          <button
            onClick={handleReset}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            🔄 重置居中
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            取消
          </button>

          <button
            onClick={handleSave}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            💾 保存焦点
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================================================================
// Field Component
// ==================================================================

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const itemId = router.query?.id as string | undefined

  // Fetch image URL
  const { data, loading } = useQuery(GET_MEDIA_FILE, {
    variables: { id: itemId },
    skip: !itemId,
  })

  const imageUrl = data?.media?.file?.url

  // Parse current focal point value
  const currentFocalPoint: FocalPoint = React.useMemo(() => {
    try {
      if (typeof value === 'string') {
        return JSON.parse(value)
      }
      return value || { x: 50, y: 50 }
    } catch {
      return { x: 50, y: 50 }
    }
  }, [value])

  const handleSave = (focalPoint: FocalPoint) => {
    onChange(JSON.stringify(focalPoint))
  }

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {/* X Input */}
        <div style={{ width: '120px' }}>
          <TextInput
            type="number"
            value={currentFocalPoint.x.toString()}
            onChange={(e) => {
              const num = parseInt(e.target.value) || 0
              onChange(JSON.stringify({ ...currentFocalPoint, x: Math.max(0, Math.min(100, num)) }))
            }}
            autoFocus={autoFocus}
            placeholder="0-100"
          />
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            X坐标 (0-100)
          </div>
        </div>

        {/* Y Input */}
        <div style={{ width: '120px' }}>
          <TextInput
            type="number"
            value={currentFocalPoint.y.toString()}
            onChange={(e) => {
              const num = parseInt(e.target.value) || 0
              onChange(JSON.stringify({ ...currentFocalPoint, y: Math.max(0, Math.min(100, num)) }))
            }}
            placeholder="0-100"
          />
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Y坐标 (0-100)
          </div>
        </div>

        {/* Visual Editor Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={loading && !!itemId}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ef4444',
            backgroundColor: 'white',
            color: '#ef4444',
            borderRadius: '4px',
            cursor: loading ? 'wait' : 'pointer',
            fontSize: '0.75rem',
            fontWeight: '500',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '⏳ 加载中...' : '🎯 可视化编辑'}
        </button>
      </div>

      {!itemId && (
        <div style={{
          padding: '0.5rem',
          backgroundColor: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '4px',
          fontSize: '0.75rem',
          marginTop: '0.5rem',
        }}>
          💡 请先上传图片并保存后再使用可视化编辑
        </div>
      )}

      {itemId && (
        <div style={{
          padding: '0.5rem',
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '4px',
          fontSize: '0.75rem',
          marginTop: '0.5rem',
        }}>
          💡 <strong>提示：</strong>点击"可视化编辑"可在图片上直接设置焦点
        </div>
      )}

      <FocalPointModal
        isOpen={isModalOpen}
        imageUrl={imageUrl}
        initialFocalPoint={currentFocalPoint}
        onSave={handleSave}
        onClose={() => setIsModalOpen(false)}
      />
    </FieldContainer>
  )
}
