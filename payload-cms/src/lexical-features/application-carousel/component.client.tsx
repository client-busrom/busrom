// @ts-nocheck
/**
 * Application Carousel Component - Client-side render component for ApplicationCarouselNode
 * Displays a carousel of applications with random images from their scene galleries
 */
'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import { useTranslation } from '@payloadcms/ui'
import { ApplicationCarouselNode, ApplicationCarouselData } from './node'
import { ChevronLeft, ChevronRight, Plus, Trash2, Image as ImageIcon, Search, X, Check } from 'lucide-react'

interface ApplicationCarouselComponentProps {
  nodeKey: string
  data: ApplicationCarouselData
}

interface Application {
  id: string
  slug: string
  name: string
  shortDescription?: string
  sceneGallery?: Array<{
    sceneName?: string
    images?: Array<{ id: string; url?: string; thumbnailURL?: string } | string>
  }>
}

export const ApplicationCarouselComponent: React.FC<ApplicationCarouselComponentProps> = ({ nodeKey, data }) => {
  const [editor] = useLexicalComposerContext()
  const { i18n } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [localData, setLocalData] = useState<ApplicationCarouselData>(data)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showApplicationPicker, setShowApplicationPicker] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [applicationImages, setApplicationImages] = useState<Record<string, string>>({})
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Fetch applications data
  useEffect(() => {
    const fetchApplications = async () => {
      const applicationIds = localData.applications.map((app) =>
        typeof app === 'string' ? app : app.id
      )
      if (applicationIds.length === 0) {
        setApplications([])
        return
      }

      try {
        // Fetch each application
        const fetchedApps: Application[] = []
        for (const id of applicationIds) {
          const res = await fetch(`/api/applications/${id}?depth=1`)
          if (res.ok) {
            const appData = await res.json()
            fetchedApps.push(appData)
          }
        }
        setApplications(fetchedApps)

        // Get random images for each application
        const images: Record<string, string> = {}
        for (const app of fetchedApps) {
          const randomImage = getRandomImageFromApplication(app)
          if (randomImage) {
            images[app.id] = randomImage
          }
        }
        setApplicationImages(images)
      } catch (error) {
        console.error('Failed to fetch applications:', error)
      }
    }
    fetchApplications()
  }, [localData.applications])

  // Get a random image from application's scene gallery
  const getRandomImageFromApplication = (app: Application): string | null => {
    if (!app.sceneGallery || app.sceneGallery.length === 0) return null

    // Collect all images from all scenes
    const allImages: string[] = []
    for (const scene of app.sceneGallery) {
      if (scene.images && scene.images.length > 0) {
        for (const img of scene.images) {
          if (typeof img === 'object' && img.thumbnailURL) {
            allImages.push(img.thumbnailURL)
          } else if (typeof img === 'object' && img.url) {
            allImages.push(img.url)
          }
        }
      }
    }

    if (allImages.length === 0) return null
    return allImages[Math.floor(Math.random() * allImages.length)]
  }

  // Auto-play functionality
  useEffect(() => {
    if (!isEditing && localData.autoplay && applications.length > (localData.itemsPerView || 3)) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => {
          const maxSlide = applications.length - (localData.itemsPerView || 3)
          return prev >= maxSlide ? 0 : prev + 1
        })
      }, localData.interval * 1000)
      return () => clearInterval(interval)
    }
  }, [isEditing, localData.autoplay, localData.interval, applications.length, localData.itemsPerView])

  const updateNode = useCallback(
    (newData: ApplicationCarouselData) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if (node instanceof ApplicationCarouselNode) {
          node.setData(newData)
        }
      })
    },
    [editor, nodeKey],
  )

  const handleSave = () => {
    updateNode(localData)
    setIsEditing(false)
  }

  const handleRemoveApplication = (appId: string) => {
    const newApplications = localData.applications.filter((app) => {
      const id = typeof app === 'string' ? app : app.id
      return id !== appId
    })
    setLocalData({ ...localData, applications: newApplications })
  }

  const handleApplicationsSelect = (selectedIds: string[]) => {
    setLocalData({
      ...localData,
      applications: selectedIds.map((id) => ({ id })),
    })
    setShowApplicationPicker(false)
  }

  // Drag and drop handlers for reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, overIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === overIndex) return

    // Real-time order adjustment
    const newApplications = [...localData.applications]
    const [draggedApp] = newApplications.splice(draggedIndex, 1)
    newApplications.splice(overIndex, 0, draggedApp)

    setLocalData({ ...localData, applications: newApplications })
    setDraggedIndex(overIndex)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const maxSlide = applications.length - (localData.itemsPerView || 3)
      return prev >= maxSlide ? 0 : prev + 1
    })
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const maxSlide = applications.length - (localData.itemsPerView || 3)
      return prev <= 0 ? maxSlide : prev - 1
    })
  }

  if (isEditing) {
    return (
      <div style={{ margin: '16px 0', padding: '16px', border: '2px solid #A08745', borderRadius: '8px', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
            {i18n?.language === 'zh' ? '编辑应用轮播' : 'Edit Application Carousel'}
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleSave}
              style={{ padding: '6px 12px', backgroundColor: '#A08745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
            >
              {i18n?.language === 'zh' ? '保存' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => {
                setLocalData(data)
                setIsEditing(false)
              }}
              style={{ padding: '6px 12px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
            >
              {i18n?.language === 'zh' ? '取消' : 'Cancel'}
            </button>
          </div>
        </div>

        {/* Application Selection */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '已选应用' : 'Selected Applications'} ({applications.length})
            </label>
            <button
              type="button"
              onClick={() => setShowApplicationPicker(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', backgroundColor: '#A08745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
            >
              <Plus size={14} /> {i18n?.language === 'zh' ? '选择应用' : 'Select Applications'}
            </button>
          </div>

          {/* Selected Applications Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {applications.map((app, index) => (
              <div
                key={app.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                style={{
                  padding: '8px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: draggedIndex === index ? '2px solid #A08745' : '1px solid #e5e7eb',
                  position: 'relative',
                  cursor: 'move',
                  opacity: draggedIndex === index ? 0.6 : 1,
                  transition: 'opacity 0.15s ease, border-color 0.15s ease',
                  transform: draggedIndex === index ? 'scale(0.98)' : 'scale(1)',
                }}
              >
                {/* Drag Indicator */}
                <div
                  style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    padding: '2px 6px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '3px',
                    fontSize: '10px',
                    color: '#6b7280',
                    cursor: 'move',
                    zIndex: 5,
                  }}
                >
                  ⋮⋮
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveApplication(app.id)}
                  style={{ position: 'absolute', top: '4px', right: '4px', padding: '4px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', zIndex: 10 }}
                  title={i18n?.language === 'zh' ? '删除' : 'Delete'}
                >
                  <Trash2 size={14} />
                </button>

                {/* Image Preview */}
                <div style={{ marginBottom: '8px' }}>
                  {applicationImages[app.id] ? (
                    <div style={{ position: 'relative', width: '100%', height: '100px', borderRadius: '4px', overflow: 'hidden' }}>
                      <img src={applicationImages[app.id]} alt={app.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%', height: '100px', backgroundColor: '#f3f4f6', border: '1px dashed #d1d5db', borderRadius: '4px', fontSize: '11px', color: '#6b7280' }}>
                      <ImageIcon size={20} />
                      <span>{i18n?.language === 'zh' ? '无图片' : 'No image'}</span>
                    </div>
                  )}
                </div>

                {/* Application Name */}
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {app.name || app.slug}
                </div>
              </div>
            ))}

            {applications.length === 0 && (
              <div style={{ gridColumn: 'span 3', padding: '32px', textAlign: 'center', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px dashed #d1d5db' }}>
                {i18n?.language === 'zh' ? '点击"选择应用"添加应用' : 'Click "Select Applications" to add applications'}
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>
              {i18n?.language === 'zh' ? '同屏显示' : 'Items per view'}
            </label>
            <select
              value={localData.itemsPerView || 3}
              onChange={(e) => setLocalData({ ...localData, itemsPerView: Number(e.target.value) })}
              style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }}
            >
              <option value={1}>{i18n?.language === 'zh' ? '1 个' : '1 item'}</option>
              <option value={2}>{i18n?.language === 'zh' ? '2 个' : '2 items'}</option>
              <option value={3}>{i18n?.language === 'zh' ? '3 个' : '3 items'}</option>
              <option value={4}>{i18n?.language === 'zh' ? '4 个' : '4 items'}</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>
              {i18n?.language === 'zh' ? '间隔（秒）' : 'Interval (seconds)'}
            </label>
            <input
              type="number"
              value={localData.interval}
              onChange={(e) => setLocalData({ ...localData, interval: Math.max(1, Math.min(30, Number(e.target.value))) })}
              onKeyDown={(e) => e.stopPropagation()}
              min={1}
              max={30}
              style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={localData.autoplay}
              onChange={(e) => setLocalData({ ...localData, autoplay: e.target.checked })}
            />
            {i18n?.language === 'zh' ? '自动播放' : 'Autoplay'}
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={localData.showTitle}
              onChange={(e) => setLocalData({ ...localData, showTitle: e.target.checked })}
            />
            {i18n?.language === 'zh' ? '显示标题' : 'Show Title'}
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={localData.showDescription}
              onChange={(e) => setLocalData({ ...localData, showDescription: e.target.checked })}
            />
            {i18n?.language === 'zh' ? '显示描述' : 'Show Description'}
          </label>
        </div>

        {/* Application Picker Modal */}
        {showApplicationPicker && (
          <ApplicationPickerModal
            isOpen={showApplicationPicker}
            onClose={() => setShowApplicationPicker(false)}
            onSelect={handleApplicationsSelect}
            selectedIds={localData.applications.map((app) => typeof app === 'string' ? app : app.id)}
          />
        )}
      </div>
    )
  }

  // Preview Mode
  const itemsPerView = localData.itemsPerView || 3
  const hasEnoughSlides = applications.length > itemsPerView

  return (
    <div
      onClick={() => setIsEditing(true)}
      style={{ margin: '16px 0', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'white', position: 'relative' }}
    >
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '6px' }}>
        {/* Carousel Container */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            transition: 'transform 0.5s ease-in-out',
            transform: `translateX(-${currentSlide * (100 / itemsPerView + 12 / itemsPerView)}%)`,
          }}
        >
          {applications.map((app) => (
            <div
              key={app.id}
              style={{
                minWidth: `calc(${100 / itemsPerView}% - ${(12 * (itemsPerView - 1)) / itemsPerView}px)`,
                borderRadius: '6px',
                overflow: 'hidden',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
              }}
            >
              {applicationImages[app.id] ? (
                <>
                  <img src={applicationImages[app.id]} alt={app.name || app.slug} style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
                  <div style={{ padding: '12px' }}>
                    {localData.showTitle && (
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                        {app.name || app.slug}
                      </h3>
                    )}
                    {localData.showDescription && app.shortDescription && (
                      <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: '1.5', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {app.shortDescription}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px', color: '#9ca3af' }}>
                  <ImageIcon size={32} />
                  <p style={{ marginTop: '8px', fontSize: '12px' }}>
                    {app.name || app.slug}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {hasEnoughSlides && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                prevSlide()
              }}
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '8px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 10,
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                nextSlide()
              }}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '8px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 10,
              }}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Info Bar */}
      <div style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
        {i18n?.language === 'zh' ? '应用轮播' : 'Application Carousel'} | {i18n?.language === 'zh' ? '同屏显示' : 'Showing'} {itemsPerView} {i18n?.language === 'zh' ? '个' : 'item(s)'} | {i18n?.language === 'zh' ? '共' : 'Total'} {applications.length} {i18n?.language === 'zh' ? '个应用' : 'application(s)'}
        {localData.autoplay && ` | ${i18n?.language === 'zh' ? '自动播放' : 'Autoplay'} ${localData.interval}${i18n?.language === 'zh' ? '秒' : 's'}`} | {i18n?.language === 'zh' ? '点击编辑' : 'Click to edit'}
      </div>

      {/* Dots Indicator */}
      {hasEnoughSlides && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
          {Array.from({ length: applications.length - itemsPerView + 1 }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setCurrentSlide(index)
              }}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: index === currentSlide ? '#A08745' : '#d1d5db',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'background-color 0.3s',
              }}
            />
          ))}
        </div>
      )}

      {applications.length === 0 && (
        <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
          {i18n?.language === 'zh' ? '点击编辑以添加应用' : 'Click to edit and add applications'}
        </div>
      )}
    </div>
  )
}

// Application Picker Modal Component
interface ApplicationPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (ids: string[]) => void
  selectedIds: string[]
}

const ApplicationPickerModal: React.FC<ApplicationPickerModalProps> = ({ isOpen, onClose, onSelect, selectedIds }) => {
  const { i18n } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [allApplications, setAllApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedIds)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)

  useEffect(() => {
    setLocalSelectedIds(selectedIds)
  }, [selectedIds])

  useEffect(() => {
    if (!isOpen) return

    const fetchApplications = async () => {
      setLoading(true)
      const params = new URLSearchParams({
        limit: '20',
        page: String(currentPage),
        sort: '-updatedAt',
        depth: '1',
        'where[status][equals]': 'published',
      })

      if (searchTerm) {
        params.append('where[or][0][name][contains]', searchTerm)
        params.append('where[or][1][slug][contains]', searchTerm)
      }

      try {
        const res = await fetch(`/api/applications?${params.toString()}`)
        const data = await res.json()
        setAllApplications(data.docs || [])
        setHasNextPage(data.hasNextPage || false)
      } catch (error) {
        console.error('Failed to fetch applications:', error)
        setAllApplications([])
      }
      setLoading(false)
    }

    fetchApplications()
  }, [isOpen, searchTerm, currentPage])

  const toggleApplication = (id: string) => {
    if (localSelectedIds.includes(id)) {
      setLocalSelectedIds(localSelectedIds.filter((i) => i !== id))
    } else {
      setLocalSelectedIds([...localSelectedIds, id])
    }
  }

  const handleConfirm = () => {
    onSelect(localSelectedIds)
  }

  // Get random image for preview
  const getPreviewImage = (app: Application): string | null => {
    if (!app.sceneGallery || app.sceneGallery.length === 0) return null
    for (const scene of app.sceneGallery) {
      if (scene.images && scene.images.length > 0) {
        const firstImg = scene.images[0]
        if (typeof firstImg === 'object' && firstImg.thumbnailURL) {
          return firstImg.thumbnailURL
        } else if (typeof firstImg === 'object' && firstImg.url) {
          return firstImg.url
        }
      }
    }
    return null
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>
            {i18n?.language === 'zh' ? '选择应用' : 'Select Applications'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '4px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder={i18n?.language === 'zh' ? '搜索应用...' : 'Search applications...'}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>

        {/* Selected Count */}
        <div style={{ marginBottom: '12px', fontSize: '13px', color: '#6b7280' }}>
          {i18n?.language === 'zh' ? '已选择' : 'Selected'}: {localSelectedIds.length} {i18n?.language === 'zh' ? '个应用' : 'application(s)'}
        </div>

        {/* Applications Grid */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            marginBottom: '16px',
          }}
        >
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              {i18n?.language === 'zh' ? '加载中...' : 'Loading...'}
            </div>
          ) : allApplications.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {allApplications.map((app) => {
                const isSelected = localSelectedIds.includes(app.id)
                const previewImage = getPreviewImage(app)

                return (
                  <div
                    key={app.id}
                    onClick={() => toggleApplication(app.id)}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: isSelected ? '2px solid #A08745' : '1px solid #e5e7eb',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#fef8e8' : 'white',
                      position: 'relative',
                      transition: 'all 0.2s',
                    }}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', backgroundColor: '#A08745', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={12} color="white" />
                      </div>
                    )}

                    {/* Preview Image */}
                    <div style={{ marginBottom: '8px' }}>
                      {previewImage ? (
                        <img src={previewImage} alt={app.name || app.slug} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '80px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                          <ImageIcon size={24} color="#9ca3af" />
                        </div>
                      )}
                    </div>

                    {/* Application Info */}
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {app.name || app.slug}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              {searchTerm ? (i18n?.language === 'zh' ? '未找到匹配的应用' : 'No applications found') : (i18n?.language === 'zh' ? '暂无应用' : 'No applications')}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '6px 12px',
              backgroundColor: currentPage === 1 ? '#e5e7eb' : '#3b82f6',
              color: currentPage === 1 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
            }}
          >
            {i18n?.language === 'zh' ? '上一页' : 'Previous'}
          </button>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            {i18n?.language === 'zh' ? '第' : 'Page'} {currentPage} {i18n?.language === 'zh' ? '页' : ''}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={!hasNextPage}
            style={{
              padding: '6px 12px',
              backgroundColor: !hasNextPage ? '#e5e7eb' : '#3b82f6',
              color: !hasNextPage ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: !hasNextPage ? 'not-allowed' : 'pointer',
              fontSize: '13px',
            }}
          >
            {i18n?.language === 'zh' ? '下一页' : 'Next'}
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {i18n?.language === 'zh' ? '取消' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={{
              padding: '8px 16px',
              backgroundColor: '#A08745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {i18n?.language === 'zh' ? '确认选择' : 'Confirm Selection'} ({localSelectedIds.length})
          </button>
        </div>
      </div>
    </div>
  )
}
