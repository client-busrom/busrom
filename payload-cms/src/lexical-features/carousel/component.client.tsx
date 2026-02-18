// @ts-nocheck
/**
 * Carousel Component - Client-side render component for CarouselNode
 */
// @ts-nocheck
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import { useTranslation } from '@payloadcms/ui'
import { CarouselNode, CarouselData, CarouselSlide } from './node'
import { ChevronLeft, ChevronRight, Plus, Trash2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react'
import { MediaPickerModal } from '../image-gallery/component.client'

interface CarouselComponentProps {
  nodeKey: string
  data: CarouselData
}

export const CarouselComponent: React.FC<CarouselComponentProps> = ({ nodeKey, data }) => {
  const [editor] = useLexicalComposerContext()
  const { t, i18n } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [localData, setLocalData] = useState<CarouselData>(data)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0)
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const [showLinkPicker, setShowLinkPicker] = useState(false)
  const [selectedLinkSlideIndex, setSelectedLinkSlideIndex] = useState<number>(0)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Fetch image URLs for all slides
  useEffect(() => {
    const fetchImageUrls = async () => {
      const urls: Record<string, string> = {}
      for (const slide of localData.slides) {
        if (slide.image && typeof slide.image === 'object' && 'id' in slide.image) {
          try {
            const res = await fetch(`/api/media/${slide.image.id}`)
            const imageData = await res.json()
            urls[slide.image.id] = imageData.thumbnailURL || imageData.url
          } catch (error) {
            console.error('Failed to fetch image:', error)
          }
        }
      }
      setImageUrls(urls)
    }
    fetchImageUrls()
  }, [localData.slides])

  // Auto-play functionality for carousel scrolling
  useEffect(() => {
    if (!isEditing && localData.autoplay && localData.slides.length > (localData.itemsPerView || 1)) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => {
          const maxSlide = localData.slides.length - (localData.itemsPerView || 1)
          return prev >= maxSlide ? 0 : prev + 1
        })
      }, localData.interval * 1000)
      return () => clearInterval(interval)
    }
  }, [isEditing, localData.autoplay, localData.interval, localData.slides.length, localData.itemsPerView])

  const updateNode = useCallback(
    (newData: CarouselData) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if (node instanceof CarouselNode) {
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

  const handleAddSlide = () => {
    setLocalData({
      ...localData,
      slides: [...localData.slides, { image: '', caption: '', link: '' }],
    })
  }

  const handleRemoveSlide = (index: number) => {
    if (localData.slides.length <= 1) return
    const newSlides = localData.slides.filter((_, i) => i !== index)
    setLocalData({ ...localData, slides: newSlides })
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(newSlides.length - 1)
    }
  }

  const handleSlideChange = (index: number, field: keyof CarouselSlide, value: any) => {
    const newSlides = [...localData.slides]
    newSlides[index] = { ...newSlides[index], [field]: value }
    setLocalData({ ...localData, slides: newSlides })
  }

  const handleMediaSelect = (mediaId: string) => {
    handleSlideChange(selectedSlideIndex, 'image', { id: mediaId })
    setShowMediaPicker(false)
  }

  const openMediaPicker = (index: number) => {
    setSelectedSlideIndex(index)
    setShowMediaPicker(true)
  }

  const openLinkPicker = (index: number) => {
    setSelectedLinkSlideIndex(index)
    setShowLinkPicker(true)
  }

  const handleLinkSelect = (path: string) => {
    handleSlideChange(selectedLinkSlideIndex, 'buttonLink', path)
    setShowLinkPicker(false)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, overIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === overIndex) return

    // Real-time order adjustment - compression effect
    const newSlides = [...localData.slides]
    const [draggedSlide] = newSlides.splice(draggedIndex, 1)
    newSlides.splice(overIndex, 0, draggedSlide)

    setLocalData({ ...localData, slides: newSlides })
    setDraggedIndex(overIndex)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const maxSlide = localData.slides.length - (localData.itemsPerView || 1)
      return prev >= maxSlide ? 0 : prev + 1
    })
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const maxSlide = localData.slides.length - (localData.itemsPerView || 1)
      return prev <= 0 ? maxSlide : prev - 1
    })
  }

  if (isEditing) {
    return (
      <div style={{ margin: '16px 0', padding: '16px', border: '2px solid #A08745', borderRadius: '8px', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
            {i18n?.language === 'zh' ? '编辑轮播图' : 'Edit Carousel'}
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

        {/* Slides Editor */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '图片列表' : 'Slides'}
            </label>
            <button
              type="button"
              onClick={handleAddSlide}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', backgroundColor: '#A08745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
            >
              <Plus size={14} /> {i18n?.language === 'zh' ? '添加' : 'Add'}
            </button>
          </div>

          {/* Horizontal grid layout - fixed 3 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {localData.slides.map((slide, index) => {
              const imageId = slide.image && typeof slide.image === 'object' && 'id' in slide.image ? slide.image.id : null
              const imageUrl = imageId ? imageUrls[imageId] : null

              return (
                <div
                  key={index}
                  onDragOver={(e) => handleDragOver(e, index)}
                  style={{
                    padding: '8px',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: draggedIndex === index ? '2px solid #A08745' : '1px solid #e5e7eb',
                    position: 'relative',
                    opacity: draggedIndex === index ? 0.6 : 1,
                    transition: 'opacity 0.15s ease',
                    transform: draggedIndex === index ? 'scale(0.98)' : 'scale(1)',
                  }}
                >
                  {/* Drag Handle - only this element is draggable */}
                  <div
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnd={handleDragEnd}
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
                  {localData.slides.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlide(index)}
                      style={{ position: 'absolute', top: '4px', right: '4px', padding: '4px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', zIndex: 10 }}
                      title={i18n?.language === 'zh' ? '删除' : 'Delete'}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}

                  {/* Image Preview */}
                  <div style={{ marginBottom: '8px' }}>
                    {imageUrl ? (
                      <div style={{ position: 'relative', width: '100%', height: '120px', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => openMediaPicker(index)}>
                        <img src={imageUrl} alt="Slide" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '4px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', textAlign: 'center' }}>
                          {i18n?.language === 'zh' ? '点击更换' : 'Click to change'}
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openMediaPicker(index)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%', height: '120px', backgroundColor: '#f3f4f6', border: '2px dashed #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', color: '#6b7280' }}
                      >
                        <ImageIcon size={20} />
                        <span>{i18n?.language === 'zh' ? '选择图片' : 'Select image'}</span>
                      </button>
                    )}
                  </div>

                  {/* Image Number */}
                  <div style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px', color: '#6b7280' }}>
                    {i18n?.language === 'zh' ? '图片' : 'Image'} {index + 1}
                  </div>

                  {/* Title */}
                  <input
                    type="text"
                    value={slide.title || ''}
                    onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    placeholder={i18n?.language === 'zh' ? '标题' : 'Title'}
                    style={{ width: '100%', padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: '3px', fontSize: '11px', marginBottom: '6px' }}
                  />

                  {/* Description */}
                  <textarea
                    value={slide.description || ''}
                    onChange={(e) => handleSlideChange(index, 'description', e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    placeholder={i18n?.language === 'zh' ? '描述' : 'Description'}
                    rows={2}
                    style={{ width: '100%', padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: '3px', fontSize: '11px', marginBottom: '6px', resize: 'vertical' }}
                  />

                  {/* Show Button Checkbox */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', marginBottom: '6px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={slide.showButton || false}
                      onChange={(e) => handleSlideChange(index, 'showButton', e.target.checked)}
                    />
                    {i18n?.language === 'zh' ? '显示按钮' : 'Show button'}
                  </label>

                  {/* Button Text */}
                  {slide.showButton && (
                    <>
                      <input
                        type="text"
                        value={slide.buttonText || ''}
                        onChange={(e) => handleSlideChange(index, 'buttonText', e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        placeholder={i18n?.language === 'zh' ? '按钮文本' : 'Button text'}
                        style={{ width: '100%', padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: '3px', fontSize: '11px', marginBottom: '6px' }}
                      />

                      {/* Button Link */}
                      <div style={{ position: 'relative', marginBottom: '6px' }}>
                        <input
                          type="text"
                          value={slide.buttonLink || ''}
                          onChange={(e) => handleSlideChange(index, 'buttonLink', e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          placeholder={i18n?.language === 'zh' ? '按钮链接' : 'Button link'}
                          style={{ width: '100%', padding: '4px 6px 4px 6px', paddingRight: '30px', border: '1px solid #d1d5db', borderRadius: '3px', fontSize: '11px' }}
                        />
                        <button
                          type="button"
                          onClick={() => openLinkPicker(index)}
                          title={i18n?.language === 'zh' ? '选择站内链接' : 'Select internal link'}
                          style={{
                            position: 'absolute',
                            right: '4px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            padding: '2px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: '#6b7280',
                          }}
                        >
                          <LinkIcon size={14} />
                        </button>
                      </div>

                      {/* Open in New Tab */}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={slide.openInNewTab || false}
                          onChange={(e) => handleSlideChange(index, 'openInNewTab', e.target.checked)}
                        />
                        {i18n?.language === 'zh' ? '新标签页打开' : 'Open in new tab'}
                      </label>
                    </>
                  )}
                </div>
              )
            })}
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
              <option value={1}>{i18n?.language === 'zh' ? '1 张' : '1 item'}</option>
              <option value={2}>{i18n?.language === 'zh' ? '2 张' : '2 items'}</option>
              <option value={3}>{i18n?.language === 'zh' ? '3 张' : '3 items'}</option>
              <option value={4}>{i18n?.language === 'zh' ? '4 张' : '4 items'}</option>
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
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={localData.autoplay}
              onChange={(e) => setLocalData({ ...localData, autoplay: e.target.checked })}
            />
            {i18n?.language === 'zh' ? '自动播放' : 'Autoplay'}
          </label>
        </div>

        {/* Media Picker Modal */}
        <MediaPickerModal
          isOpen={showMediaPicker}
          onClose={() => setShowMediaPicker(false)}
          onSelect={handleMediaSelect}
          imageIndex={selectedSlideIndex}
          t={t}
          i18n={i18n}
        />

        {/* Link Picker Modal */}
        {showLinkPicker && (
          <LinkPickerModal
            isOpen={showLinkPicker}
            onClose={() => setShowLinkPicker(false)}
            onSelect={handleLinkSelect}
          />
        )}
      </div>
    )
  }

  // Preview Mode - actual carousel effect
  const itemsPerView = localData.itemsPerView || 3
  const hasEnoughSlides = localData.slides.length > itemsPerView

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
          {localData.slides.map((slide, index) => {
            const imageId = slide.image && typeof slide.image === 'object' && 'id' in slide.image ? slide.image.id : null
            const imageUrl = imageId ? imageUrls[imageId] : null

            return (
              <div
                key={index}
                style={{
                  minWidth: `calc(${100 / itemsPerView}% - ${(12 * (itemsPerView - 1)) / itemsPerView}px)`,
                  borderRadius: '6px',
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                }}
              >
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt={slide.title || `Image ${index + 1}`} style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
                    <div style={{ padding: '12px' }}>
                      {slide.title && (
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                          {slide.title}
                        </h3>
                      )}
                      {slide.description && (
                        <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                          {slide.description}
                        </p>
                      )}
                      {slide.showButton && slide.buttonText && (
                        <a
                          href={slide.buttonLink || '#'}
                          target={slide.openInNewTab ? '_blank' : '_self'}
                          rel={slide.openInNewTab ? 'noopener noreferrer' : undefined}
                          style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            backgroundColor: '#A08745',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontWeight: 500,
                          }}
                        >
                          {slide.buttonText}
                        </a>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px', color: '#9ca3af' }}>
                    <ImageIcon size={32} />
                    <p style={{ marginTop: '8px', fontSize: '12px' }}>
                      {i18n?.language === 'zh' ? '图片' : 'Image'} {index + 1}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
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
        {i18n?.language === 'zh' ? '同屏显示' : 'Showing'} {itemsPerView} {i18n?.language === 'zh' ? '张' : 'item(s)'} {i18n?.language === 'zh' ? '·' : '|'} {i18n?.language === 'zh' ? '共' : 'Total'} {localData.slides.length} {i18n?.language === 'zh' ? '张' : 'item(s)'}
        {localData.autoplay && ` ${i18n?.language === 'zh' ? '·' : '|'} ${i18n?.language === 'zh' ? '自动播放' : 'Autoplay'} ${localData.interval}${i18n?.language === 'zh' ? '秒' : 's'}`} {i18n?.language === 'zh' ? '·' : '|'} {i18n?.language === 'zh' ? '点击编辑' : 'Click to edit'}
      </div>

      {/* Dots Indicator */}
      {hasEnoughSlides && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
          {Array.from({ length: localData.slides.length - itemsPerView + 1 }).map((_, index) => (
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
    </div>
  )
}

// Link Picker Modal Component
interface LinkPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (path: string) => void
}

export const LinkPickerModal: React.FC<LinkPickerModalProps> = ({ isOpen, onClose, onSelect }) => {
  const { i18n } = useTranslation()
  const [selectedCollection, setSelectedCollection] = useState('pages')
  const [searchTerm, setSearchTerm] = useState('')
  const [contentItems, setContentItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const fetchContent = async () => {
      setLoading(true)
      const params = new URLSearchParams({
        limit: '20',
        page: String(currentPage),
        sort: '-updatedAt',
      })

      if (searchTerm) {
        params.append('where[or][0][title][contains]', searchTerm)
        params.append('where[or][1][slug][contains]', searchTerm)
      }

      try {
        const res = await fetch(`/api/${selectedCollection}?${params.toString()}`)
        const data = await res.json()
        setContentItems(data.docs || [])
        setHasNextPage(data.hasNextPage || false)
      } catch (error) {
        console.error('Failed to fetch content:', error)
        setContentItems([])
      }
      setLoading(false)
    }

    fetchContent()
  }, [isOpen, selectedCollection, searchTerm, currentPage])

  const getPath = (item: any) => {
    const pathMap: Record<string, string> = {
      pages: '',
      products: '/products',
      'product-series': '/product-series',
      blogs: '/blog',
      applications: '/applications',
    }
    const prefix = pathMap[selectedCollection] || ''
    return `${prefix}/${item.slug}`
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
          maxWidth: '700px',
          width: '90%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>
          {i18n?.language === 'zh' ? '选择站内链接' : 'Select internal link'}
        </h3>

        {/* Collection Type Selector */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
            {i18n?.language === 'zh' ? '内容类型' : 'Content type'}
          </label>
          <select
            value={selectedCollection}
            onChange={(e) => {
              setSelectedCollection(e.target.value)
              setCurrentPage(1)
              setSearchTerm('')
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            <option value="pages">{i18n?.language === 'zh' ? '页面' : 'Pages'}</option>
            <option value="products">{i18n?.language === 'zh' ? '产品' : 'Products'}</option>
            <option value="product-series">{i18n?.language === 'zh' ? '产品系列' : 'Product Series'}</option>
            <option value="blogs">{i18n?.language === 'zh' ? '博客' : 'Blogs'}</option>
            <option value="applications">{i18n?.language === 'zh' ? '应用' : 'Applications'}</option>
          </select>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder={i18n?.language === 'zh' ? '搜索标题或 slug...' : 'Search by title or slug...'}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>

        {/* Content List */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            marginBottom: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
          }}
        >
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              {i18n?.language === 'zh' ? '加载中...' : 'Loading...'}
            </div>
          ) : contentItems.length > 0 ? (
            <div>
              {contentItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelect(getPath(item))}
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>{item.title || item.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{getPath(item)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              {searchTerm ? (i18n?.language === 'zh' ? '未找到匹配项' : 'No matches found') : (i18n?.language === 'zh' ? '暂无数据' : 'No data')}
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

        {/* Close Button */}
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
          {i18n?.language === 'zh' ? '关闭' : 'Close'}
        </button>
      </div>
    </div>
  )
}
