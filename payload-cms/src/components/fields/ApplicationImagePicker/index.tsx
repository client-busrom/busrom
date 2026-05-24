'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useField } from '@payloadcms/ui'
import MediaPicker from '../MediaPicker'
import './styles.scss'

interface ApplicationImagePickerProps {
  path: string
  field: {
    name: string
    label?: string | Record<string, string>
  }
}

interface StoredValue {
  mode: 'manual' | 'application'
  manualImage?: number | null
  applicationId?: string | number | null
}

export const ApplicationImagePicker: React.FC<ApplicationImagePickerProps> = ({ path, field }) => {
  const { value, setValue } = useField<StoredValue>({ path })

  const [mode, setMode] = useState<'manual' | 'application'>(value?.mode || 'manual')
  const [selectedImage, setSelectedImage] = useState<number | null>(value?.manualImage || null)
  const [selectedApplication, setSelectedApplication] = useState<string | number | null>(value?.applicationId || null)
  const [applications, setApplications] = useState<any[]>([])
  const [previewImage, setPreviewImage] = useState<any | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  // Load applications list
  useEffect(() => {
    const loadApplications = async () => {
      try {
        const res = await fetch('/api/applications?limit=200&depth=0&where[status][equals]=published')
        if (res.ok) {
          const data = await res.json()
          setApplications(data.docs || [])
        }
      } catch (error) {
        console.error('Error loading applications:', error)
      }
    }
    loadApplications()
  }, [])

  // Sync form value when state changes
  useEffect(() => {
    const newValue: StoredValue = {
      mode,
      manualImage: mode === 'manual' ? selectedImage : null,
      applicationId: mode === 'application' ? selectedApplication : null,
    }
    setValue(newValue)
  }, [mode, selectedImage, selectedApplication, setValue])

  // Load preview for application mode
  const loadPreview = useCallback(async () => {
    if (mode !== 'application' || !selectedApplication) {
      setPreviewImage(null)
      return
    }

    setIsLoadingPreview(true)
    try {
      const res = await fetch(`/api/applications/${selectedApplication}?depth=1`)
      if (res.ok) {
        const app = await res.json()
        const allImages = (app.sceneGallery || []).flatMap((scene: any) => scene.images || [])
        const uniqueImages = Array.from(new Map(allImages.map((img: any) => [img.id, img])).values())

        if (uniqueImages.length > 0) {
          const randomIndex = Math.floor(Math.random() * uniqueImages.length)
          const img = uniqueImages[randomIndex] as any
          setPreviewImage({
            ...img,
            thumbnailURL: img.sizes?.thumbnail?.url || img.sizes?.card?.url || img.url,
          })
        } else {
          setPreviewImage(null)
        }
      }
    } catch (error) {
      console.error('Error loading preview:', error)
    } finally {
      setIsLoadingPreview(false)
    }
  }, [mode, selectedApplication])

  useEffect(() => {
    if (mode === 'application') {
      loadPreview()
    }
  }, [mode, selectedApplication, loadPreview])

  const getLabel = () => {
    if (typeof field.label === 'object') {
      const lang = Object.keys(field.label)[0]
      return field.label[lang] || 'Image'
    }
    if (typeof field.label === 'string') return field.label
    return 'Image'
  }

  return (
    <div className="application-image-picker">
      <label className="application-image-picker__label">
        {getLabel()}
      </label>

      {/* Mode selector */}
      <div className="application-image-picker__mode-selector">
        <button
          type="button"
          className={mode === 'manual' ? 'active' : ''}
          onClick={() => setMode('manual')}
        >
          手动选择
        </button>
        <button
          type="button"
          className={mode === 'application' ? 'active' : ''}
          onClick={() => setMode('application')}
        >
          案例图集随机
        </button>
      </div>

      {/* Manual mode: single image picker */}
      {mode === 'manual' && (
        <div className="application-image-picker__manual">
          <MediaPicker
            path={`${path}.manualImage`}
            field={{
              name: 'manualImage',
              label: '选择图片',
              hasMany: false,
              relationTo: 'media',
            }}
            value={selectedImage}
            onChange={(val) => setSelectedImage(val as number | null)}
          />
        </div>
      )}

      {/* Application mode: select from applications */}
      {mode === 'application' && (
        <div className="application-image-picker__application">
          <div className="application-image-picker__select-wrapper">
            <select
              value={selectedApplication || ''}
              onChange={(e) => setSelectedApplication(e.target.value || null)}
            >
              <option value="">-- 选择一个案例图集 --</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.slug}
                </option>
              ))}
            </select>
          </div>

          <p className="application-image-picker__hint">
            系统将每次从所选案例图集的场景中随机选择一张图片。
          </p>

          {/* Preview */}
          <div className="application-image-picker__preview">
            <h5>预览（随机示例）</h5>
            {isLoadingPreview ? (
              <p className="application-image-picker__loading">加载中...</p>
            ) : !selectedApplication ? (
              <p className="application-image-picker__empty">请选择一个案例图集以查看预览</p>
            ) : previewImage ? (
              <div className="application-image-picker__preview-item">
                <img
                  src={previewImage.thumbnailURL || previewImage.url}
                  alt={previewImage.alt || previewImage.filename}
                />
                <p>{previewImage.filename}</p>
              </div>
            ) : (
              <p className="application-image-picker__empty">该案例图集暂无图片</p>
            )}
            <p className="application-image-picker__hint">
              注：预览为随机示例，实际展示时每次都会重新随机选择。
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplicationImagePicker
