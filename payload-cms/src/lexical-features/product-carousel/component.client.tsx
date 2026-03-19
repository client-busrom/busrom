// @ts-nocheck
/**
 * Product Carousel Component - Client-side render component for ProductCarouselNode
 *
 * Features:
 * - Manual product selection with fixed product
 * - Auto product selection from a product series (random at runtime)
 * - Per-item display settings (name, description, button, new tab)
 */
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import { useTranslation } from '@payloadcms/ui'
import { ProductCarouselNode, ProductCarouselData, ProductCarouselItem } from './node'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Image as ImageIcon,
  Search,
  X,
  Check,
  Settings,
  Shuffle,
  Package,
} from 'lucide-react'

interface ProductCarouselComponentProps {
  nodeKey: string
  data: ProductCarouselData
}

interface Product {
  id: string
  slug: string
  sku: string
  name: string
  shortDescription?: string
  showImage?: { url?: string; thumbnailURL?: string } | string
  series?: { id: string; name: string; slug: string } | string
  category?: { id: string; name: string; slug: string } | string
}

interface ProductSeries {
  id: string
  name: string
  slug: string
}

// Generate unique ID for items
const generateItemId = () => `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export const ProductCarouselComponent: React.FC<ProductCarouselComponentProps> = ({ nodeKey, data }) => {
  const [editor] = useLexicalComposerContext()
  const { i18n } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [localData, setLocalData] = useState<ProductCarouselData>(data)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Products & Series data
  const [products, setProducts] = useState<Record<string, Product>>({})
  const [productSeries, setProductSeries] = useState<Record<string, ProductSeries>>({})

  // Modal states
  const [showProductPicker, setShowProductPicker] = useState(false)
  const [showSeriesPicker, setShowSeriesPicker] = useState(false)
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [showItemSettings, setShowItemSettings] = useState<number | null>(null)

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Fetch products for manual items
  useEffect(() => {
    const fetchProducts = async () => {
      const manualItems = localData.items.filter(item => item.selectionMode === 'manual' && item.product)
      const productIds = manualItems.map(item => item.product!).filter(id => !products[id])

      if (productIds.length === 0) return

      try {
        for (const id of productIds) {
          const res = await fetch(`/api/products/${id}?depth=1`)
          if (res.ok) {
            const productData = await res.json()
            setProducts(prev => ({ ...prev, [id]: productData }))
          }
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
      }
    }
    fetchProducts()
  }, [localData.items])

  // Fetch product series for auto items
  useEffect(() => {
    const fetchSeries = async () => {
      const autoItems = localData.items.filter(item => item.selectionMode === 'auto' && item.productSeries)
      const seriesIds = autoItems.map(item => item.productSeries!).filter(id => !productSeries[id])

      if (seriesIds.length === 0) return

      try {
        for (const id of seriesIds) {
          const res = await fetch(`/api/product-series/${id}?depth=0`)
          if (res.ok) {
            const seriesData = await res.json()
            setProductSeries(prev => ({ ...prev, [id]: seriesData }))
          }
        }
      } catch (error) {
        console.error('Failed to fetch product series:', error)
      }
    }
    fetchSeries()
  }, [localData.items])

  const updateNode = useCallback(
    (newData: ProductCarouselData) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if (node instanceof ProductCarouselNode) {
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

  // Add new item
  const handleAddItem = (mode: 'manual' | 'auto') => {
    const newItem: ProductCarouselItem = {
      id: generateItemId(),
      selectionMode: mode,
      showName: true,
      showCategory: true,
      showDescription: true,
      showButton: true,
      showHighlights: true,
      highlightsCount: 4,
      buttonText: i18n?.language === 'zh' ? '查看全部' : 'See All',
      openInNewTab: false,
    }
    setLocalData({ ...localData, items: [...localData.items, newItem] })

    if (mode === 'manual') {
      setEditingItemIndex(localData.items.length)
      setShowProductPicker(true)
    } else {
      setEditingItemIndex(localData.items.length)
      setShowSeriesPicker(true)
    }
  }

  // Remove item
  const handleRemoveItem = (index: number) => {
    const newItems = localData.items.filter((_, i) => i !== index)
    setLocalData({ ...localData, items: newItems })
  }

  // Update item
  const handleUpdateItem = (index: number, updates: Partial<ProductCarouselItem>) => {
    const newItems = [...localData.items]
    newItems[index] = { ...newItems[index], ...updates }
    setLocalData({ ...localData, items: newItems })
  }

  // Select product for manual item
  const handleProductSelect = (productId: string) => {
    if (editingItemIndex !== null) {
      handleUpdateItem(editingItemIndex, { product: productId })
    }
    setShowProductPicker(false)
    setEditingItemIndex(null)
  }

  // Select series for auto item
  const handleSeriesSelect = (seriesId: string) => {
    if (editingItemIndex !== null) {
      handleUpdateItem(editingItemIndex, { productSeries: seriesId })
    }
    setShowSeriesPicker(false)
    setEditingItemIndex(null)
  }

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, overIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === overIndex) return

    const newItems = [...localData.items]
    const [draggedItem] = newItems.splice(draggedIndex, 1)
    newItems.splice(overIndex, 0, draggedItem)

    setLocalData({ ...localData, items: newItems })
    setDraggedIndex(overIndex)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // Get product image URL
  const getProductImage = (product: Product): string | null => {
    if (!product.showImage) return null
    if (typeof product.showImage === 'string') return null
    return product.showImage.thumbnailURL || product.showImage.url || null
  }

  // Carousel navigation
  const nextSlide = () => {
    const maxSlide = Math.max(0, localData.items.length - (localData.itemsPerView || 3))
    setCurrentSlide(prev => (prev >= maxSlide ? 0 : prev + 1))
  }

  const prevSlide = () => {
    const maxSlide = Math.max(0, localData.items.length - (localData.itemsPerView || 3))
    setCurrentSlide(prev => (prev <= 0 ? maxSlide : prev - 1))
  }

  // Auto-play
  useEffect(() => {
    if (!isEditing && localData.autoplay && localData.items.length > (localData.itemsPerView || 3)) {
      const interval = setInterval(() => {
        const maxSlide = Math.max(0, localData.items.length - (localData.itemsPerView || 3))
        setCurrentSlide(prev => (prev >= maxSlide ? 0 : prev + 1))
      }, localData.interval * 1000)
      return () => clearInterval(interval)
    }
  }, [isEditing, localData.autoplay, localData.interval, localData.items.length, localData.itemsPerView])

  if (isEditing) {
    return (
      <div style={{
        margin: '16px 0',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 20px rgba(160, 135, 69, 0.15)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #A08745 0%, #C4A862 100%)',
          borderBottom: '1px solid rgba(160, 135, 69, 0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Package size={20} color="white" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'white' }}>
                {i18n?.language === 'zh' ? '产品轮播' : 'Product Carousel'}
              </h3>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
                {localData.items.length} {i18n?.language === 'zh' ? '个产品' : 'items'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setLocalData(data)
                setIsEditing(false)
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              {i18n?.language === 'zh' ? '取消' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#A08745',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s',
              }}
            >
              <Check size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              {i18n?.language === 'zh' ? '保存' : 'Save'}
            </button>
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Add Item Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '20px',
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            border: '1px dashed #cbd5e1',
          }}>
            <button
              type="button"
              onClick={() => handleAddItem('manual')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 16px',
                backgroundColor: 'white',
                color: '#3b82f6',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              <Package size={18} /> {i18n?.language === 'zh' ? '手动选择产品' : 'Manual Select'}
            </button>
            <button
              type="button"
              onClick={() => handleAddItem('auto')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 16px',
                backgroundColor: 'white',
                color: '#10b981',
                border: '2px solid #10b981',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              <Shuffle size={18} /> {i18n?.language === 'zh' ? '自动随机产品' : 'Auto Random'}
            </button>
          </div>

          {/* Items List */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '20px',
          }}>
            {localData.items.map((item, index) => {
              const product = item.selectionMode === 'manual' && item.product ? products[item.product] : null
              const series = item.selectionMode === 'auto' && item.productSeries ? productSeries[item.productSeries] : null

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    border: draggedIndex === index ? '2px solid #A08745' : '1px solid #e2e8f0',
                    position: 'relative',
                    cursor: 'move',
                    opacity: draggedIndex === index ? 0.6 : 1,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden',
                  }}
                >
                  {/* Card Header with Mode Badge and Actions */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    backgroundColor: item.selectionMode === 'manual' ? '#eff6ff' : '#ecfdf5',
                    borderBottom: `1px solid ${item.selectionMode === 'manual' ? '#dbeafe' : '#d1fae5'}`,
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      backgroundColor: item.selectionMode === 'manual' ? '#3b82f6' : '#10b981',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}>
                      {item.selectionMode === 'manual' ? <Package size={12} /> : <Shuffle size={12} />}
                      {item.selectionMode === 'manual'
                        ? (i18n?.language === 'zh' ? '手动' : 'Manual')
                        : (i18n?.language === 'zh' ? '自动' : 'Auto')}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setShowItemSettings(showItemSettings === index ? null : index)}
                        style={{
                          padding: '6px',
                          backgroundColor: showItemSettings === index ? '#A08745' : 'white',
                          color: showItemSettings === index ? 'white' : '#64748b',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                        title={i18n?.language === 'zh' ? '设置' : 'Settings'}
                      >
                        <Settings size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        style={{
                          padding: '6px',
                          backgroundColor: 'white',
                          color: '#ef4444',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                        title={i18n?.language === 'zh' ? '删除' : 'Delete'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div style={{ padding: '12px' }}>
                    {item.selectionMode === 'manual' ? (
                      product ? (
                        <>
                          <div style={{ marginBottom: '10px', borderRadius: '6px', overflow: 'hidden' }}>
                            {getProductImage(product) ? (
                              <img
                                src={getProductImage(product)!}
                                alt={product.name || product.sku}
                                style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }}
                              />
                            ) : (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                height: '100px',
                                backgroundColor: '#f8fafc',
                                border: '1px dashed #e2e8f0',
                                borderRadius: '6px',
                              }}>
                                <ImageIcon size={28} color="#94a3b8" />
                              </div>
                            )}
                          </div>
                          <div style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#1e293b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginBottom: '8px',
                          }}>
                            {product.name || product.sku}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItemIndex(index)
                              setShowProductPicker(true)
                            }}
                            style={{
                              width: '100%',
                              padding: '8px',
                              fontSize: '12px',
                              backgroundColor: '#f1f5f9',
                              color: '#475569',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 500,
                              transition: 'all 0.2s',
                            }}
                          >
                            {i18n?.language === 'zh' ? '更换产品' : 'Change Product'}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItemIndex(index)
                            setShowProductPicker(true)
                          }}
                          style={{
                            width: '100%',
                            padding: '32px 16px',
                            textAlign: 'center',
                            color: '#64748b',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '2px dashed #cbd5e1',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 500,
                            transition: 'all 0.2s',
                          }}
                        >
                          <Plus size={24} style={{ marginBottom: '8px', opacity: 0.6 }} />
                          <br />
                          {i18n?.language === 'zh' ? '点击选择产品' : 'Click to select product'}
                        </button>
                      )
                    ) : (
                      series ? (
                        <div style={{
                          padding: '20px 12px',
                          textAlign: 'center',
                          backgroundColor: '#f0fdf4',
                          borderRadius: '8px',
                          border: '1px solid #bbf7d0',
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            margin: '0 auto 10px',
                            backgroundColor: '#dcfce7',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Shuffle size={20} color="#16a34a" />
                          </div>
                          <div style={{ fontSize: '11px', color: '#15803d', marginBottom: '4px', fontWeight: 500 }}>
                            {i18n?.language === 'zh' ? '随机抓取自' : 'Random from'}
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#166534', marginBottom: '10px' }}>
                            {series.name}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItemIndex(index)
                              setShowSeriesPicker(true)
                            }}
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              backgroundColor: '#dcfce7',
                              color: '#166534',
                              border: '1px solid #bbf7d0',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 500,
                            }}
                          >
                            {i18n?.language === 'zh' ? '更换系列' : 'Change Series'}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItemIndex(index)
                            setShowSeriesPicker(true)
                          }}
                          style={{
                            width: '100%',
                            padding: '32px 16px',
                            textAlign: 'center',
                            color: '#64748b',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '2px dashed #cbd5e1',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 500,
                            transition: 'all 0.2s',
                          }}
                        >
                          <Plus size={24} style={{ marginBottom: '8px', opacity: 0.6 }} />
                          <br />
                          {i18n?.language === 'zh' ? '点击选择产品系列' : 'Click to select series'}
                        </button>
                      )
                    )}
                  </div>

                  {/* Item Settings Panel */}
                  {showItemSettings === index && (
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#fefce8',
                      borderTop: '1px solid #fef08a',
                      fontSize: '12px',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '12px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid #fef08a',
                        fontWeight: 600,
                        color: '#854d0e',
                      }}>
                        <Settings size={14} />
                        {i18n?.language === 'zh' ? '显示设置' : 'Display Settings'}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid #fef08a',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}>
                          <input
                            type="checkbox"
                            checked={!!item.showName}
                            onChange={(e) => handleUpdateItem(index, { showName: e.target.checked })}
                            style={{ accentColor: '#A08745' }}
                          />
                          {i18n?.language === 'zh' ? '显示名称' : 'Show Name'}
                        </label>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid #fef08a',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}>
                          <input
                            type="checkbox"
                            checked={!!item.showCategory}
                            onChange={(e) => handleUpdateItem(index, { showCategory: e.target.checked })}
                            style={{ accentColor: '#A08745' }}
                          />
                          {i18n?.language === 'zh' ? '显示分类' : 'Show Category'}
                        </label>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid #fef08a',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}>
                          <input
                            type="checkbox"
                            checked={!!item.showDescription}
                            onChange={(e) => handleUpdateItem(index, { showDescription: e.target.checked })}
                            style={{ accentColor: '#A08745' }}
                          />
                          {i18n?.language === 'zh' ? '显示描述' : 'Description'}
                        </label>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid #fef08a',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}>
                          <input
                            type="checkbox"
                            checked={!!item.showButton}
                            onChange={(e) => handleUpdateItem(index, { showButton: e.target.checked })}
                            style={{ accentColor: '#A08745' }}
                          />
                          {i18n?.language === 'zh' ? '显示按钮' : 'Show Button'}
                        </label>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid #fef08a',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}>
                          <input
                            type="checkbox"
                            checked={!!item.openInNewTab}
                            onChange={(e) => handleUpdateItem(index, { openInNewTab: e.target.checked })}
                            style={{ accentColor: '#A08745' }}
                          />
                          {i18n?.language === 'zh' ? '新标签打开' : 'New Tab'}
                        </label>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid #fef08a',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}>
                          <input
                            type="checkbox"
                            checked={!!item.showHighlights}
                            onChange={(e) => handleUpdateItem(index, { showHighlights: e.target.checked })}
                            style={{ accentColor: '#A08745' }}
                          />
                          {i18n?.language === 'zh' ? '显示核心亮点' : 'Highlights'}
                        </label>
                      </div>

                      {item.showHighlights && (
                        <div style={{ marginTop: '10px' }}>
                          <label style={{ display: 'block', marginBottom: '4px', color: '#854d0e', fontWeight: 500 }}>
                            {i18n?.language === 'zh' ? '随机显示数量' : 'Random Count'}
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={item.highlightsCount || 4}
                            onChange={(e) => handleUpdateItem(index, { highlightsCount: Number(e.target.value) })}
                            onKeyDown={(e) => e.stopPropagation()}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              border: '1px solid #fef08a',
                              borderRadius: '6px',
                              fontSize: '12px',
                              backgroundColor: 'white',
                            }}
                          />
                        </div>
                      )}

                      {item.showButton && (
                        <div style={{ marginTop: '10px' }}>
                          <label style={{ display: 'block', marginBottom: '4px', color: '#854d0e', fontWeight: 500 }}>
                            {i18n?.language === 'zh' ? '按钮文案' : 'Button Text'}
                          </label>
                          <input
                            type="text"
                            value={item.buttonText}
                            onChange={(e) => handleUpdateItem(index, { buttonText: e.target.value })}
                            onKeyDown={(e) => e.stopPropagation()}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              border: '1px solid #fef08a',
                              borderRadius: '6px',
                              fontSize: '12px',
                              backgroundColor: 'white',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
              </div>
            )
          })}

            {localData.items.length === 0 && (
              <div style={{
                gridColumn: '1 / -1',
                padding: '48px 32px',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '2px dashed #cbd5e1',
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 16px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Package size={28} color="#94a3b8" />
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  {i18n?.language === 'zh' ? '暂无产品' : 'No products yet'}
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                  {i18n?.language === 'zh' ? '点击上方按钮添加产品到轮播中' : 'Click buttons above to add products'}
                </div>
              </div>
            )}
          </div>

          {/* Carousel Settings */}
          <div style={{
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '14px',
              paddingBottom: '10px',
              borderBottom: '1px solid #e2e8f0',
            }}>
              <Settings size={16} color="#64748b" />
              <span style={{ fontWeight: 600, fontSize: '14px', color: '#334155' }}>
                {i18n?.language === 'zh' ? '轮播设置' : 'Carousel Settings'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: '#64748b', fontWeight: 500 }}>
                  {i18n?.language === 'zh' ? '同屏显示' : 'Items per view'}
                </label>
                <select
                  value={localData.itemsPerView || 3}
                  onChange={(e) => setLocalData({ ...localData, itemsPerView: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                  }}
                >
                  <option value={1}>{i18n?.language === 'zh' ? '1 个' : '1 item'}</option>
                  <option value={2}>{i18n?.language === 'zh' ? '2 个' : '2 items'}</option>
                  <option value={3}>{i18n?.language === 'zh' ? '3 个' : '3 items'}</option>
                  <option value={4}>{i18n?.language === 'zh' ? '4 个' : '4 items'}</option>
                  <option value={5}>{i18n?.language === 'zh' ? '5 个' : '5 items'}</option>
                  <option value={6}>{i18n?.language === 'zh' ? '6 个' : '6 items'}</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: '#64748b', fontWeight: 500 }}>
                  {i18n?.language === 'zh' ? '切换间隔' : 'Interval'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={localData.interval}
                    onChange={(e) => setLocalData({ ...localData, interval: Math.max(1, Math.min(30, Number(e.target.value))) })}
                    onKeyDown={(e) => e.stopPropagation()}
                    min={1}
                    max={30}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      paddingRight: '36px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '13px',
                      backgroundColor: 'white',
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '12px',
                    color: '#94a3b8',
                  }}>
                    {i18n?.language === 'zh' ? '秒' : 's'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  backgroundColor: localData.autoplay ? '#f0fdf4' : 'white',
                  border: `1px solid ${localData.autoplay ? '#bbf7d0' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: localData.autoplay ? '#166534' : '#64748b',
                  width: '100%',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  <input
                    type="checkbox"
                    checked={!!localData.autoplay}
                    onChange={(e) => setLocalData({ ...localData, autoplay: e.target.checked })}
                    style={{ accentColor: '#16a34a' }}
                  />
                  {i18n?.language === 'zh' ? '自动播放' : 'Autoplay'}
                </label>
              </div>
            </div>
          </div>

        {/* Product Picker Modal */}
        {showProductPicker && (
          <ProductPickerModal
            isOpen={showProductPicker}
            onClose={() => {
              setShowProductPicker(false)
              setEditingItemIndex(null)
            }}
            onSelect={handleProductSelect}
          />
        )}

        {/* Series Picker Modal */}
        {showSeriesPicker && (
          <SeriesPickerModal
            isOpen={showSeriesPicker}
            onClose={() => {
              setShowSeriesPicker(false)
              setEditingItemIndex(null)
            }}
            onSelect={handleSeriesSelect}
          />
        )}
        </div>
      </div>
    )
  }

  // Preview Mode
  const itemsPerView = localData.itemsPerView || 3
  const hasEnoughSlides = localData.items.length > itemsPerView

  return (
    <div
      onClick={() => setIsEditing(true)}
      style={{ 
        margin: '16px auto', 
        padding: '16px', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        backgroundColor: 'white', 
        position: 'relative',
        maxWidth: '640px', // Adjusted to 640px for tighter, more proportional width
        width: '100%',
        boxSizing: 'border-box'
      }}
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
          {localData.items.map((item, index) => {
            const product = item.selectionMode === 'manual' && item.product ? products[item.product] : null
            const series = item.selectionMode === 'auto' && item.productSeries ? productSeries[item.productSeries] : null

            return (
              <div
                key={item.id}
                style={{
                  minWidth: `calc(${100 / itemsPerView}% - ${(12 * (itemsPerView - 1)) / itemsPerView}px)`,
                  borderRadius: '6px',
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                }}
              >
                {item.selectionMode === 'manual' && product ? (
                  <>
                    {getProductImage(product) ? (
                      <img src={getProductImage(product)!} alt={product.name || product.sku} style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', backgroundColor: '#f3f4f6' }}>
                        <ImageIcon size={32} color="#9ca3af" />
                      </div>
                    )}
                    <div style={{ padding: '12px' }}>
                      {item.showName && (
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
                          {product.name || product.sku}
                        </h4>
                      )}
                      {item.showDescription && product.shortDescription && (
                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {product.shortDescription}
                        </p>
                      )}
                      {item.showHighlights && (
                        <div style={{ marginBottom: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <span style={{ padding: '2px 6px', backgroundColor: '#fef9c3', color: '#854d0e', borderRadius: '4px', fontSize: '10px', fontWeight: 600, border: '1px solid #fef08a' }}>
                            ✨ {item.highlightsCount || 4} {i18n?.language === 'zh' ? '个亮点' : 'Highlights'}
                          </span>
                        </div>
                      )}
                      {item.showButton && (
                        <div style={{ fontSize: '11px', color: '#A08745', fontWeight: 500 }}>
                          {item.buttonText} →
                        </div>
                      )}
                    </div>
                  </>
                ) : item.selectionMode === 'auto' && series ? (
                  <div style={{ padding: '24px', textAlign: 'center', height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ecfdf5' }}>
                    <Shuffle size={32} color="#059669" style={{ marginBottom: '12px' }} />
                    <div style={{ fontSize: '11px', color: '#065f46', marginBottom: '4px' }}>
                      {i18n?.language === 'zh' ? '自动随机' : 'Auto Random'}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#047857', marginBottom: '8px' }}>
                      {series.name}
                    </div>
                    {item.showHighlights && (
                      <span style={{ padding: '2px 6px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '4px', fontSize: '10px', fontWeight: 600, border: '1px solid #bbf7d0' }}>
                        ✨ {item.highlightsCount || 4} {i18n?.language === 'zh' ? '个亮点' : 'Highlights'}
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#9ca3af' }}>
                    <Package size={32} />
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
              onClick={(e) => { e.stopPropagation(); prevSlide() }}
              style={{
                position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
                padding: '8px', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 10,
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); nextSlide() }}
              style={{
                position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                padding: '8px', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
              }}>
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Info Bar */}
      <div style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
        {i18n?.language === 'zh' ? '产品轮播' : 'Product Carousel'} |{' '}
        {i18n?.language === 'zh' ? '手动' : 'Manual'}: {localData.items.filter(i => i.selectionMode === 'manual').length},{' '}
        {i18n?.language === 'zh' ? '自动' : 'Auto'}: {localData.items.filter(i => i.selectionMode === 'auto').length} |{' '}
        {i18n?.language === 'zh' ? '点击编辑' : 'Click to edit'}
      </div>

      {localData.items.length === 0 && (
        <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
          {i18n?.language === 'zh' ? '点击编辑以添加产品' : 'Click to edit and add products'}
        </div>
      )}
    </div>
  )
}


// Product Picker Modal
interface ProductPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (productId: string) => void
}

const ProductPickerModal: React.FC<ProductPickerModalProps> = ({ isOpen, onClose, onSelect }) => {
  const { i18n } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const fetchProducts = async () => {
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
        params.append('where[or][1][sku][contains]', searchTerm)
      }

      try {
        const res = await fetch(`/api/products?${params.toString()}`)
        const data = await res.json()
        setAllProducts(data.docs || [])
        setHasNextPage(data.hasNextPage || false)
      } catch (error) {
        console.error('Failed to fetch products:', error)
        setAllProducts([])
      }
      setLoading(false)
    }

    fetchProducts()
  }, [isOpen, searchTerm, currentPage])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white', borderRadius: '8px', padding: '24px',
          maxWidth: '800px', width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>{i18n?.language === 'zh' ? '选择产品' : 'Select Product'}</h3>
          <button type="button" onClick={onClose} style={{ padding: '4px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder={i18n?.language === 'zh' ? '搜索产品...' : 'Search products...'}
            style={{ width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
          />
        </div>

        {/* Products Grid */}
        <div style={{ flex: 1, overflow: 'auto', marginBottom: '16px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              {i18n?.language === 'zh' ? '加载中...' : 'Loading...'}
            </div>
          ) : allProducts.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {allProducts.map((product) => {
                const imageUrl = product.showImage && typeof product.showImage === 'object'
                  ? (product.showImage.thumbnailURL || product.showImage.url)
                  : null

                return (
                  <div
                    key={product.id}
                    onClick={() => onSelect(product.id)}
                    style={{
                      padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb',
                      cursor: 'pointer', backgroundColor: 'white', transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A08745' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb' }}
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.name || product.sku} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '80px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                        <ImageIcon size={24} color="#9ca3af" />
                      </div>
                    )}
                    <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: 500, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.name || product.sku}
                    </div>
                    <div style={{ fontSize: '10px', color: '#6b7280' }}>{product.sku}</div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              {searchTerm ? (i18n?.language === 'zh' ? '未找到匹配的产品' : 'No products found') : (i18n?.language === 'zh' ? '暂无产品' : 'No products')}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '6px 12px', backgroundColor: currentPage === 1 ? '#e5e7eb' : '#3b82f6',
              color: currentPage === 1 ? '#9ca3af' : 'white', border: 'none', borderRadius: '4px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px',
            }}
          >
            {i18n?.language === 'zh' ? '上一页' : 'Previous'}
          </button>
          <span style={{ padding: '6px 12px', fontSize: '13px', color: '#6b7280' }}>
            {i18n?.language === 'zh' ? '第' : 'Page'} {currentPage}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={!hasNextPage}
            style={{
              padding: '6px 12px', backgroundColor: !hasNextPage ? '#e5e7eb' : '#3b82f6',
              color: !hasNextPage ? '#9ca3af' : 'white', border: 'none', borderRadius: '4px',
              cursor: !hasNextPage ? 'not-allowed' : 'pointer', fontSize: '13px',
            }}
          >
            {i18n?.language === 'zh' ? '下一页' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Series Picker Modal
interface SeriesPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (seriesId: string) => void
}

const SeriesPickerModal: React.FC<SeriesPickerModalProps> = ({ isOpen, onClose, onSelect }) => {
  const { i18n } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [allSeries, setAllSeries] = useState<ProductSeries[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const fetchSeries = async () => {
      setLoading(true)
      const params = new URLSearchParams({
        limit: '50',
        sort: 'name',
        depth: '0',
      })

      if (searchTerm) {
        params.append('where[name][contains]', searchTerm)
      }

      try {
        const res = await fetch(`/api/product-series?${params.toString()}`)
        const data = await res.json()
        setAllSeries(data.docs || [])
      } catch (error) {
        console.error('Failed to fetch product series:', error)
        setAllSeries([])
      }
      setLoading(false)
    }

    fetchSeries()
  }, [isOpen, searchTerm])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white', borderRadius: '8px', padding: '24px',
          maxWidth: '600px', width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>{i18n?.language === 'zh' ? '选择产品系列' : 'Select Product Series'}</h3>
          <button type="button" onClick={onClose} style={{ padding: '4px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#6b7280' }}>
          {i18n?.language === 'zh'
            ? '前端将从选择的系列中随机抓取一个产品显示'
            : 'Frontend will randomly fetch a product from the selected series'}
        </p>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder={i18n?.language === 'zh' ? '搜索系列...' : 'Search series...'}
            style={{ width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
          />
        </div>

        {/* Series List */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              {i18n?.language === 'zh' ? '加载中...' : 'Loading...'}
            </div>
          ) : allSeries.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {allSeries.map((series) => (
                <button
                  key={series.id}
                  type="button"
                  onClick={() => onSelect(series.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                    backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.backgroundColor = '#ecfdf5' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = 'white' }}
                >
                  <Shuffle size={20} color="#10b981" />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>{series.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{series.slug}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              {searchTerm ? (i18n?.language === 'zh' ? '未找到匹配的系列' : 'No series found') : (i18n?.language === 'zh' ? '暂无产品系列' : 'No product series')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
