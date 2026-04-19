// @ts-nocheck
/**
 * Shared LinkPickerModal Component
 *
 * Used by custom features to select internal links (products, pages, blogs, etc.)
 */

'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface LinkPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (path: string) => void
}

export const LinkPickerModal: React.FC<LinkPickerModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [selectedCollection, setSelectedCollection] = useState<string>('products')
  const [searchQuery, setSearchQuery] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const collections = [
    { value: 'products', label: '产品链接页', pathPrefix: '/shop' },
    { value: 'product-series', label: '产品详解页', pathPrefix: '/products' },
    { value: 'categories-product', label: 'shop列表页分类', pathPrefix: '/shop', categoryType: 'PRODUCT' },
    { value: 'categories-blog', label: '知识库列表页分类', pathPrefix: '/blog', categoryType: 'BLOG' },
    { value: 'pages', label: '其他子页', pathPrefix: '' },
    { value: 'blogs', label: '知识库', pathPrefix: '/blog' },
    { value: 'blog-tags', label: '知识库标签', pathPrefix: '/blog' },
    { value: 'applications', label: '应用案例', pathPrefix: '/applications' },
    { value: 'categories-faq', label: 'FAQ 分类 (锚点跳转)', pathPrefix: '/faq', categoryType: 'FAQ', isFaq: true },
    { value: 'categories', label: '所有分类 (通用)', pathPrefix: '/category' },
  ]

  useEffect(() => {
    if (isOpen) {
      fetchItems()
    }
  }, [isOpen, selectedCollection, searchQuery, currentPage])

  const fetchItems = async () => {
    setIsLoading(true)
    try {
      const collectionConfig = collections.find(c => c.value === selectedCollection)
      if (!collectionConfig) return

      // Determine actual collection name for API
      const apiCollection = selectedCollection.startsWith('categories-') ? 'categories' : selectedCollection
      
      const params = new URLSearchParams({
        limit: '10',
        page: currentPage.toString(),
      })

      if (searchQuery) {
        params.append('where[or][0][title][contains]', searchQuery)
        params.append('where[or][1][name][contains]', searchQuery)
        params.append('where[or][2][slug][contains]', searchQuery)
      }

      // Add type filtering for categories
      if (collectionConfig.categoryType) {
        params.append('where[type][equals]', collectionConfig.categoryType)
      }

      const response = await fetch(`/api/${apiCollection}?${params}`)
      const data = await response.json()

      setItems(data.docs || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (item: any) => {
    const collection = collections.find((c) => c.value === selectedCollection)
    if (!collection) return

    // Priority 1: Use specific fields from the document itself if they exist
    const itemPath = item.path || item.url
    
    let path = ''
    
    // Check if it's a category
    if (collection.categoryType) {
      const slugValue = item.slug || item.id
      if (collection.isFaq) {
        path = `${collection.pathPrefix}#faq-${slugValue}`
      } else {
        path = `${collection.pathPrefix}?category=${slugValue}`
      }
    } else if (selectedCollection === 'blog-tags') {
      const slugValue = item.slug || item.id
      path = `${collection.pathPrefix}?tag=${slugValue}`
    } else if (itemPath && typeof itemPath === 'string') {
      path = itemPath.startsWith('/') ? itemPath : `/${itemPath}`
    } else {
      // Priority 2: Fallback to collection prefix + slug
      const slugValue = item.slug || item.id
      path = `${collection.pathPrefix}/${slugValue}`
    }

    // Clean up potential double slashes
    path = path.replace(/\/+/g, '/')
    
    onSelect(path)
    onClose()
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
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>选择站内链接</h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <select
            value={selectedCollection}
            onChange={(e) => {
              setSelectedCollection(e.target.value)
              setCurrentPage(1)
            }}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            {collections.map((col) => (
              <option key={col.value} value={col.value}>
                {col.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="搜索..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            onKeyDown={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>

        {isLoading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>加载中...</div>
        ) : (
          <>
            <div style={{ marginBottom: '12px' }}>
              {items.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>没有找到项目</div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    style={{
                      padding: '10px',
                      borderBottom: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
                      {item.title || item.name || item.slug}
                    </div>
                    {item.slug && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                        {(() => {
                          const col = collections.find((c) => c.value === selectedCollection)
                          return col?.categoryType 
                            ? `${col.pathPrefix}?category=${item.slug}`
                            : col?.value === 'blog-tags'
                            ? `${col.pathPrefix}?tag=${item.slug}`
                            : `${col?.pathPrefix || ''}/${item.slug}`
                        })()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                  }}
                >
                  上一页
                </button>
                <span style={{ padding: '6px 12px', fontSize: '14px', color: '#6b7280' }}>
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                  }}
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
