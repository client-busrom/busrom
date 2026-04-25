'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { useField } from '@payloadcms/ui'
import MediaPicker from '../MediaPicker'
import './styles.scss'

interface TagBasedRandomImagesProps {
  path: string
  field: {
    name: string
    label?: string | Record<string, string>
  }
}

export const TagBasedRandomImages: React.FC<TagBasedRandomImagesProps> = ({ path }) => {
  const { value, setValue } = useField<any>({ path })

  // 获取裁剪数据列表字段 (同级字段)
  const cropDataListPath = path.replace(/(\.)?images$/, (match, p1) => (p1 ? '.imageCropDataList' : 'imageCropDataList'))
  const { value: cropDataList, setValue: setCropDataList } = useField<any[]>({ path: cropDataListPath })

  const [mode, setMode] = useState<'manual' | 'auto' | 'application'>(value?.mode || 'manual')
  const [selectedImages, setSelectedImages] = useState<number[]>(value?.manualImages || [])
  const [selectedCategories, setSelectedCategories] = useState<number[]>(value?.categories || [])
  const [selectedTags, setSelectedTags] = useState<number[]>(value?.tags || [])
  const [selectedApplication, setSelectedApplication] = useState<string | number>(value?.applicationId || '')
  const [metadataGroup, setMetadataGroup] = useState<string>(value?.metadataGroup || '')
  const [metadataSceneNumber, setMetadataSceneNumber] = useState<string>(value?.metadataSceneNumber || '')
  const [seriesNumber, setSeriesNumber] = useState<string>(value?.seriesNumber || '')
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [previewImages, setPreviewImages] = useState<any[]>([])
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  // Load categories and tags
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [categoriesRes, tagsRes, applicationsRes] = await Promise.all([
          fetch('/api/media-categories?limit=100'),
          fetch('/api/media-tags?limit=100'),
          fetch('/api/applications?limit=100&depth=0'),
        ])

        if (categoriesRes.ok) {
          const catData = await categoriesRes.json()
          setCategories(catData.docs || [])
        }

        if (tagsRes.ok) {
          const tagData = await tagsRes.json()
          setTags(tagData.docs || [])
        }

        if (applicationsRes.ok) {
          const appData = await applicationsRes.json()
          setApplications(appData.docs || [])
        }
      } catch (error) {
        console.error('Error loading filters:', error)
      }
    }

    loadFilters()
  }, [])

  useEffect(() => {
    const newValue = {
      mode,
      manualImages: mode === 'manual' ? selectedImages : [],
      categories: mode === 'auto' ? selectedCategories : [],
      tags: mode === 'auto' ? selectedTags : [],
      applicationId: mode === 'application' ? selectedApplication : '',
      metadataGroup: mode === 'auto' ? metadataGroup : '',
      metadataSceneNumber: mode === 'auto' ? metadataSceneNumber : '',
      seriesNumber: mode === 'auto' ? seriesNumber : '',
    }
    setValue(newValue)
  }, [mode, selectedImages, selectedCategories, selectedTags, selectedApplication, metadataGroup, metadataSceneNumber, seriesNumber, setValue])

  // Preview auto-selected images
  const loadPreview = useCallback(async () => {
    const hasAutoFilters =
      selectedCategories.length > 0 ||
      selectedTags.length > 0 ||
      metadataGroup ||
      metadataSceneNumber ||
      seriesNumber

    if (mode === 'manual') {
      setPreviewImages([])
      return
    }

    if (mode === 'auto' && !hasAutoFilters) {
      setPreviewImages([])
      return
    }

    if (mode === 'application' && !selectedApplication) {
      setPreviewImages([])
      return
    }

    setIsLoadingPreview(true)
    try {
      if (mode === 'auto') {
        const params = new URLSearchParams()
        params.append('limit', '5')
        params.append('sort', '-createdAt')

        if (selectedCategories.length > 0) {
          params.append('where[primaryCategory][in]', selectedCategories.join(','))
        }

        if (selectedTags.length > 0) {
          params.append('where[tags][in]', selectedTags.join(','))
        }

        if (metadataGroup) {
          params.append('where[metadataGroup][equals]', metadataGroup)
        }

        if (metadataSceneNumber) {
          params.append('where[metadataSceneNumber][equals]', metadataSceneNumber)
        }

        if (seriesNumber) {
          // Search in metadata.specs array for series key
          params.append('where[metadataSpecs.key][equals]', 'series')
          params.append('where[metadataSpecs.value][equals]', seriesNumber)
        }

        const response = await fetch(`/api/media?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          const docs = data.docs || []
          if (docs.length > 0) {
            const shuffled = [...docs].sort(() => Math.random() - 0.5)
            const final = []
            for (let i = 0; i < 5; i++) {
              final.push(shuffled[i % shuffled.length])
            }
            setPreviewImages(final)
          } else {
            setPreviewImages([])
          }
        }
      } else if (mode === 'application' && selectedApplication) {
        // Fetch application specifically to get its scene gallery images
        const response = await fetch(`/api/applications/${selectedApplication}?depth=1`)
        if (response.ok) {
          const app = await response.json()
          // Flatten all images from all scenes
          const allImages = (app.sceneGallery || []).flatMap((scene: any) => scene.images || [])
          // De-duplicate if same image used in multiple scenes
          const uniqueImages = Array.from(new Map(allImages.map((img: any) => [img.id, img])).values())
          
          if (uniqueImages.length > 0) {
            // Normalize image URLs (Payload objects often have URLs in 'sizes')
            const normalizedImages = uniqueImages.map((img: any) => ({
              ...img,
              thumbnailURL: img.sizes?.thumbnail?.url || img.sizes?.card?.url || img.url,
            }))

            // Option B: Cycle for preview consistency
            const shuffled = [...normalizedImages].sort(() => Math.random() - 0.5)
            const final = []
            for (let i = 0; i < 5; i++) {
              final.push(shuffled[i % shuffled.length])
            }
            setPreviewImages(final)
          } else {
            setPreviewImages([])
          }
        } else {
          setPreviewImages([])
        }
      }
    } catch (error) {
      console.error('Error loading preview:', error)
    } finally {
      setIsLoadingPreview(false)
    }
  }, [mode, selectedCategories, selectedTags, selectedApplication, metadataGroup, metadataSceneNumber, seriesNumber])

  useEffect(() => {
    if (mode === 'auto' || mode === 'application') {
      loadPreview()
    }
  }, [mode, selectedCategories, selectedTags, selectedApplication, metadataGroup, metadataSceneNumber, seriesNumber, loadPreview])

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const toggleTag = (id: number) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  return (
    <div className="tag-based-random-images">
      <div className="mode-selector">
        <h4>Image Selection Mode | 图片选择模式</h4>
        <div className="mode-buttons">
          <button
            type="button"
            className={mode === 'manual' ? 'active' : ''}
            onClick={() => setMode('manual')}
          >
            📋 Manual Selection | 手动选择
          </button>
          <button
            type="button"
            className={mode === 'application' ? 'active' : ''}
            onClick={() => setMode('application')}
          >
            📂 Case Gallery (Random) | 案例图集 (随机)
          </button>
          <button
            type="button"
            className={mode === 'auto' ? 'active' : ''}
            onClick={() => setMode('auto')}
          >
            🎲 Tags Random (5 images) | 标签随机 (5张)
          </button>
        </div>
      </div>

      {mode === 'application' && (
        <div className="application-mode">
          <h4>Select Case Gallery | 选择案例图集</h4>
          <div className="filter-section">
            <select
              value={selectedApplication}
              onChange={(e) => setSelectedApplication(e.target.value)}
              className="application-select"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            >
              <option value="">-- Select an Application | 选择一个案例 --</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.slug} ({app.name})
                </option>
              ))}
            </select>
          </div>
          <p className="hint">
            System will randomly pick 5 images from the selected case gallery's scene groups.
          </p>
        </div>
      )}

      {mode === 'manual' && (
        <div className="manual-mode">
          <h4>Manually Select Images | 手动选择图片</h4>
          <MediaPicker
            path={`${path}.manualImages`}
            field={{
              name: 'manualImages',
              label: 'Select Images (up to 5)',
              hasMany: true,
              relationTo: 'media',
            }}
            showCropButton={true}
            cropDataList={cropDataList}
            onCropDataListChange={setCropDataList}
          />
          <p className="hint">
            Click "Select Media" to choose up to 5 images manually.
          </p>
        </div>
      )}

      {mode === 'auto' && (
        <div className="auto-mode">
          <h4>Filter by Category, Tags & Metadata | 按分类、标签和元数据筛选</h4>
          <p className="hint">
            Select any combination of filters below. System will randomly pick 5 matching images.<br />
            <strong>Logic:</strong> (Category OR Tag) AND Metadata Filters
          </p>

          {/* Categories */}
          <div className="filter-section">
            <h5>📁 Media Categories</h5>
            <div className="filter-grid">
              {categories.map((cat) => (
                <label key={cat.id} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                  />
                  <span>{cat.displayName || cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="filter-section">
            <h5>🏷️ Media Tags</h5>
            <div className="filter-grid">
              {tags.map((tag) => (
                <label key={tag.id} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                  />
                  <span>{tag.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Metadata Filters */}
          <div className="filter-section">
            <h5>📊 Metadata Filters</h5>
            <div className="metadata-inputs">
              <div className="input-group">
                <label>Group Number | 组号</label>
                <input
                  type="number"
                  value={metadataGroup}
                  onChange={(e) => setMetadataGroup(e.target.value)}
                  placeholder="e.g., 1, 2, 3..."
                />
              </div>
              <div className="input-group">
                <label>Scene Number | 场景号</label>
                <input
                  type="number"
                  value={metadataSceneNumber}
                  onChange={(e) => setMetadataSceneNumber(e.target.value)}
                  placeholder="e.g., 1, 2, 3..."
                />
              </div>
              <div className="input-group">
                <label>Series Number | 系列号</label>
                <input
                  type="text"
                  value={seriesNumber}
                  onChange={(e) => setSeriesNumber(e.target.value)}
                  placeholder="e.g., BRS-001, BRS-002..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview - Show for Auto and Application modes */}
      {(mode === 'auto' || mode === 'application') && (
        <div className="preview-section" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <h5>Preview (Random 5 Images) | 预览（随机5张）</h5>
          {isLoadingPreview ? (
            <p>Loading preview...</p>
          ) : previewImages.length === 0 ? (
            <p className="no-preview">
              {mode === 'auto' 
                ? 'No images found matching selected filters. Please select categories or tags.'
                : 'Please select an application to see preview.'}
            </p>
          ) : (
            <div className="preview-grid">
              {previewImages.map((img) => (
                <div key={img.id} className="preview-item">
                  <img
                    src={img.thumbnailURL || img.url}
                    alt={img.alt || img.filename}
                  />
                  <p>{img.filename}</p>
                </div>
              ))}
            </div>
          )}
          <p className="hint">
            ⚠️ Note: Preview shows current matching images. Actual random selection happens at render time.
          </p>
        </div>
      )}
    </div>
  )
}

export default TagBasedRandomImages
