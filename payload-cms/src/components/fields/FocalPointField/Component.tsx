'use client'

/**
 * Focal Point Visual Editor for Payload CMS
 *
 * 焦点可视化编辑器
 *
 * Provides a visual interface for setting image focal points,
 * similar to Keystone CMS FocalPointEditor.
 */

import React, { useState, useRef, useEffect } from 'react'
import { useField, FieldLabel, useFormFields, useTranslation } from '@payloadcms/ui'

// i18n translations
const i18n = {
  title: { en: 'Focal Point Editor', zh: '图片焦点编辑器' },
  description: { en: 'Click or drag to set the focal point. The focal area will be preserved when cropping.', zh: '点击或拖拽设置图片的焦点位置，裁剪时会优先保留焦点区域' },
  imagePreview: { en: 'Image Preview', zh: '图片预览' },
  focalCoordinates: { en: 'Focal Coordinates:', zh: '焦点坐标:' },
  xCoord: { en: 'X Coordinate (Horizontal)', zh: 'X 坐标（横向）' },
  yCoord: { en: 'Y Coordinate (Vertical)', zh: 'Y 坐标（纵向）' },
  usageTips: { en: 'Usage Tips:', zh: '使用说明：' },
  tip1: { en: 'Click or drag the red marker to important content', zh: '点击或拖拽红色标记到重要内容上' },
  tip2: { en: 'Focal point will be preserved in any aspect ratio crop', zh: '焦点位置会在任意比例裁剪时优先保留' },
  tip3: { en: 'Works for landscape, portrait, square and all display scenarios', zh: '适用于横版、竖版、方形等所有展示场景' },
  commonUsage: { en: 'Common Usage:', zh: '常见用法：' },
  usage1: { en: 'Portrait photos: Set focal point on face', zh: '人物照片：焦点设在脸部' },
  usage2: { en: 'Product images: Set focal point at product center', zh: '产品图片：焦点设在产品中心' },
  usage3: { en: 'Landscape photos: Set focal point on main subject', zh: '风景照片：焦点设在主体景物' },
  resetCenter: { en: 'Reset to Center', zh: '重置居中' },
  cancel: { en: 'Cancel', zh: '取消' },
  saveFocalPoint: { en: 'Save Focal Point', zh: '保存焦点' },
  xCoordLabel: { en: 'X (0-100)', zh: 'X坐标 (0-100)' },
  yCoordLabel: { en: 'Y (0-100)', zh: 'Y坐标 (0-100)' },
  visualEdit: { en: 'Visual Edit', zh: '可视化编辑' },
  uploadFirst: { en: 'Please upload an image and save first before using visual editor', zh: '请先上传图片并保存后再使用可视化编辑' },
  tipVisualEdit: { en: 'Tip: Click "Visual Edit" to set focal point directly on the image', zh: '提示：点击"可视化编辑"可在图片上直接设置焦点' },
}

type FocalPoint = {
  x: number
  y: number
}

type FocalPointModalProps = {
  isOpen: boolean
  imageUrl?: string | null
  initialFocalPoint: FocalPoint
  onSave: (focalPoint: FocalPoint) => void
  onClose: () => void
  t: (obj: { en: string; zh: string }) => string
}

const FocalPointModal: React.FC<FocalPointModalProps> = ({
  isOpen,
  imageUrl,
  initialFocalPoint,
  onSave,
  onClose,
  t,
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
              {t(i18n.title)}
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              {t(i18n.description)}
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
                <div>{t(i18n.imagePreview)}</div>
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

            {/* Grid lines */}
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
                <strong>{t(i18n.focalCoordinates)}</strong>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  {t(i18n.xCoord)}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                  {focalX}%
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  {t(i18n.yCoord)}
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
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>💡 {t(i18n.usageTips)}</div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>{t(i18n.tip1)}</li>
                <li>{t(i18n.tip2)}</li>
                <li>{t(i18n.tip3)}</li>
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
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>📌 {t(i18n.commonUsage)}</div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>{t(i18n.usage1)}</li>
                <li>{t(i18n.usage2)}</li>
                <li>{t(i18n.usage3)}</li>
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
            🔄 {t(i18n.resetCenter)}
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
            {t(i18n.cancel)}
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
            💾 {t(i18n.saveFocalPoint)}
          </button>
        </div>
      </div>
    </div>
  )
}

export const FocalPointFieldComponent: React.FC<any> = ({ path, label }) => {
  const { value, setValue } = useField<{ x?: number | null; y?: number | null }>({ path })
  const { i18n: { language } } = useTranslation()
  const t = (obj: { en: string; zh: string }) => language === 'zh' ? obj.zh : obj.en
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Get image URL from form fields
  const urlField = useFormFields(([fields]) => fields.url)
  const imageUrl = urlField?.value as string | undefined

  // Parse current focal point value
  const currentFocalPoint: FocalPoint = React.useMemo(() => {
    if (value && typeof value === 'object' && value.x !== undefined && value.y !== undefined) {
      return {
        x: value.x ?? 50,
        y: value.y ?? 50,
      }
    }
    return { x: 50, y: 50 }
  }, [value])

  const handleSave = (focalPoint: FocalPoint) => {
    setValue(focalPoint)
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <FieldLabel label={label} />

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginTop: '0.5rem' }}>
        {/* X Input */}
        <div style={{ width: '120px' }}>
          <input
            type="number"
            value={currentFocalPoint.x}
            onChange={(e) => {
              const num = parseInt(e.target.value) || 0
              setValue({ ...currentFocalPoint, x: Math.max(0, Math.min(100, num)) })
            }}
            placeholder="0-100"
            min="0"
            max="100"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '0.875rem',
            }}
          />
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {t(i18n.xCoordLabel)}
          </div>
        </div>

        {/* Y Input */}
        <div style={{ width: '120px' }}>
          <input
            type="number"
            value={currentFocalPoint.y}
            onChange={(e) => {
              const num = parseInt(e.target.value) || 0
              setValue({ ...currentFocalPoint, y: Math.max(0, Math.min(100, num)) })
            }}
            placeholder="0-100"
            min="0"
            max="100"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '0.875rem',
            }}
          />
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {t(i18n.yCoordLabel)}
          </div>
        </div>

        {/* Visual Editor Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ef4444',
            backgroundColor: 'white',
            color: '#ef4444',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: '500',
            marginTop: '0px',
          }}
        >
          🎯 {t(i18n.visualEdit)}
        </button>
      </div>

      {!imageUrl && (
        <div style={{
          padding: '0.5rem',
          backgroundColor: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '4px',
          fontSize: '0.75rem',
          marginTop: '0.5rem',
        }}>
          💡 {t(i18n.uploadFirst)}
        </div>
      )}

      {imageUrl && (
        <div style={{
          padding: '0.5rem',
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '4px',
          fontSize: '0.75rem',
          marginTop: '0.5rem',
        }}>
          💡 {t(i18n.tipVisualEdit)}
        </div>
      )}

      <FocalPointModal
        isOpen={isModalOpen}
        imageUrl={imageUrl}
        initialFocalPoint={currentFocalPoint}
        onSave={handleSave}
        onClose={() => setIsModalOpen(false)}
        t={t}
      />
    </div>
  )
}
