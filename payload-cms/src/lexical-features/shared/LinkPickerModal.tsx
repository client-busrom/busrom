// @ts-nocheck
/**
 * Shared LinkPickerModal Component
 *
 * Used by custom features to select internal links (products, pages, blogs, etc.)
 */

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { X, Search, Loader2 } from 'lucide-react'

interface LinkPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (path: string) => void
}

interface CollectionConfig {
  value: string
  label: string
  pathPrefix: string
  categoryType?: string
  isFaq?: boolean
  searchFields: string[]
  apiCollection: string
  depth?: number
  isStatic?: boolean
  staticItems?: any[]
}

interface FetchResult {
  docs: any[]
  totalPages?: number
  totalDocs?: number
}

const collections: CollectionConfig[] = [
  {
    value: 'pages',
    label: '网站页面',
    pathPrefix: '',
    searchFields: ['title', 'slug'],
    apiCollection: 'pages',
    staticItems: [
      { id: 'static-shop', title: 'Shop List Page', slug: 'shop', path: '/shop' },
      { id: 'static-kb-list', title: 'Knowledge Base List Page', slug: 'knowledge-base-blogs', path: '/knowledge-base-blogs' },
    ],
  },
  { value: 'product-series', label: '产品详解页', pathPrefix: '/products', searchFields: ['name', 'slug'], apiCollection: 'product-series' },
  { value: 'products', label: '产品链接页', pathPrefix: '/shop', searchFields: ['name', 'slug', 'sku', 'adminLabel'], apiCollection: 'products' },
  { value: 'categories-product', label: 'shop列表页分类', pathPrefix: '/shop', categoryType: 'PRODUCT', searchFields: ['name', 'slug', 'adminLabel'], apiCollection: 'categories' },
  {
    value: 'shop-filters',
    label: 'shop列表页标签',
    pathPrefix: '/shop',
    searchFields: ['title'],
    apiCollection: 'static',
    isStatic: true,
    staticItems: [
      { id: 'shop-hot', title: 'Hot Items', slug: 'hot', path: '/shop?hot=1' },
      { id: 'shop-new', title: 'New Arrivals', slug: 'new', path: '/shop?new=1' },
      { id: 'shop-featured', title: 'Featured', slug: 'featured', path: '/shop?featured=1' },
    ],
  },
  { value: 'categories-blog', label: '知识库列表页分类', pathPrefix: '/knowledge-base-blogs', categoryType: 'BLOG', searchFields: ['name', 'slug', 'adminLabel'], apiCollection: 'categories' },
  { value: 'blog-tags', label: '知识库标签', pathPrefix: '/knowledge-base-blogs', searchFields: ['name', 'slug'], apiCollection: 'blog-tags' },
  { value: 'blogs', label: '知识库', pathPrefix: '/knowledge-base-blog', searchFields: ['title', 'slug', 'adminLabel'], apiCollection: 'blogs' },
  { value: 'categories-faq', label: 'FAQ 分类', pathPrefix: '/faq-frequently-asked-questions', categoryType: 'FAQ', isFaq: true, searchFields: ['name', 'slug', 'adminLabel'], apiCollection: 'categories' },
  { value: 'faq', label: 'FAQ', pathPrefix: '/faq-frequently-asked-questions', searchFields: ['question', 'slug', 'adminLabel'], apiCollection: 'faq-items', depth: 1 },
  { value: 'categories', label: '所有分类', pathPrefix: '/category', searchFields: ['name', 'slug', 'adminLabel'], apiCollection: 'categories' },
]

const PAGE_SIZE = 10

export const LinkPickerModal: React.FC<LinkPickerModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [selectedCollection, setSelectedCollection] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)
  const prevItemsRef = useRef<any[]>([])

  const activeCollections = React.useMemo(() =>
    selectedCollection === 'all'
      ? collections
      : collections.filter(c => c.value === selectedCollection),
    [selectedCollection]
  )

  const isAllMode = selectedCollection === 'all'

  const buildSearchParams = useCallback((config: CollectionConfig, page: number, query: string) => {
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      page: String(page),
    })

    if (query) {
      config.searchFields.forEach((field, index) => {
        params.append(`where[or][${index}][${field}][contains]`, query)
      })
    }

    if (config.categoryType) {
      params.append('where[type][equals]', config.categoryType)
    }

    if (config.depth) {
      params.append('depth', String(config.depth))
    }

    return params
  }, [])

  const applyCollectionMeta = useCallback((doc: any, config: CollectionConfig) => ({
    ...doc,
    _collectionValue: config.value,
    _collectionLabel: config.label,
    _pathPrefix: config.pathPrefix,
    _isFaq: config.isFaq,
    _categoryType: config.categoryType,
  }), [])

  const getStaticItems = useCallback((config: CollectionConfig, query: string) => {
    if (!config.staticItems?.length) return []
    const items = config.staticItems.map((doc) => applyCollectionMeta(doc, config))
    if (!query) return items
    const q = query.toLowerCase()
    return items.filter((item) => {
      const name = (item.adminLabel || item.title || item.name || '').toLowerCase()
      return name.includes(q)
    })
  }, [applyCollectionMeta])

  const sortByRelevance = useCallback((items: any[], query: string) => {
    if (!query) return items
    const q = query.toLowerCase()
    return [...items].sort((a, b) => {
      const aName = (a.adminLabel || a.title || a.name || '').toLowerCase()
      const bName = (b.adminLabel || b.title || b.name || '').toLowerCase()
      const aExact = aName === q ? 3 : aName.startsWith(q) ? 2 : aName.includes(q) ? 1 : 0
      const bExact = bName === q ? 3 : bName.startsWith(q) ? 2 : bName.includes(q) ? 1 : 0
      return bExact - aExact
    })
  }, [])

  const fetchItems = useCallback(async () => {
    // 优化：all 模式下无搜索词时不自动加载，避免 9 个并发请求拖垮首屏
    if (isAllMode && !debouncedSearchQuery.trim()) {
      setItems([])
      setTotalPages(1)
      setHasInitialLoaded(false)
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    const { signal } = abortControllerRef.current

    setIsLoading(true)
    try {
      let allResults: any[] = []
      let calculatedTotalPages = 1

      if (isAllMode) {
        // all 模式：串行请求，避免并发爆炸；前端分页
        for (const config of activeCollections) {
          if (signal.aborted) return
          let docs: any[] = []
          if (config.isStatic) {
            docs = getStaticItems(config, debouncedSearchQuery)
          } else {
            const params = buildSearchParams(config, 1, debouncedSearchQuery)
            const response = await fetch(`/api/${config.apiCollection}?${params}`, { signal })
            const data: FetchResult = await response.json()
            docs = (data.docs || []).map((doc: any) => applyCollectionMeta(doc, config))
            if (config.staticItems?.length) {
              docs = docs.concat(getStaticItems(config, debouncedSearchQuery))
            }
          }
          allResults = allResults.concat(docs)
        }

        // 相关性排序
        allResults = sortByRelevance(allResults, debouncedSearchQuery)

        // 前端分页
        calculatedTotalPages = Math.max(1, Math.ceil(allResults.length / PAGE_SIZE))
        const start = (currentPage - 1) * PAGE_SIZE
        allResults = allResults.slice(start, start + PAGE_SIZE)
      } else {
        // 单分类模式：后端分页，正常请求
        const config = activeCollections[0]
        if (!config) {
          setItems([])
          setTotalPages(1)
          return
        }

        if (config.isStatic) {
          // 纯静态分类：本地过滤 + 本地分页
          const items = sortByRelevance(getStaticItems(config, debouncedSearchQuery), debouncedSearchQuery)
          calculatedTotalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
          const start = (currentPage - 1) * PAGE_SIZE
          allResults = items.slice(start, start + PAGE_SIZE)
        } else if (config.staticItems?.length) {
          // 混合静态项：拉取全部后合并再本地分页
          const params = buildSearchParams(config, 1, debouncedSearchQuery)
          params.set('limit', '1000')
          params.set('page', '1')
          const response = await fetch(`/api/${config.apiCollection}?${params}`, { signal })
          const data: FetchResult = await response.json()
          let docs = (data.docs || []).map((doc: any) => applyCollectionMeta(doc, config))
          docs = docs.concat(getStaticItems(config, debouncedSearchQuery))
          docs = sortByRelevance(docs, debouncedSearchQuery)
          calculatedTotalPages = Math.max(1, Math.ceil(docs.length / PAGE_SIZE))
          const start = (currentPage - 1) * PAGE_SIZE
          allResults = docs.slice(start, start + PAGE_SIZE)
        } else {
          const params = buildSearchParams(config, currentPage, debouncedSearchQuery)
          const response = await fetch(`/api/${config.apiCollection}?${params}`, { signal })
          const data: FetchResult = await response.json()
          allResults = (data.docs || []).map((doc: any) => applyCollectionMeta(doc, config))
          calculatedTotalPages = data.totalPages || 1
        }
      }

      if (signal.aborted) return

      prevItemsRef.current = allResults
      setItems(allResults)
      setTotalPages(calculatedTotalPages)
      setHasInitialLoaded(true)
    } catch (error) {
      if ((error as Error).name === 'AbortError') return
      console.error('Failed to fetch items:', error)
    } finally {
      setIsLoading(false)
    }
  }, [activeCollections, debouncedSearchQuery, currentPage, buildSearchParams, isAllMode, applyCollectionMeta, getStaticItems, sortByRelevance])

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  useEffect(() => {
    if (isOpen) {
      fetchItems()
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [isOpen, fetchItems])

  // 重置状态当 modal 关闭时
  useEffect(() => {
    if (!isOpen) {
      setItems([])
      setHasInitialLoaded(false)
      setCurrentPage(1)
      prevItemsRef.current = []
    }
  }, [isOpen])

  const handleSelect = (item: any) => {
    const config = collections.find((c) => c.value === item._collectionValue)
    if (!config) return

    const itemPath = item.path || item.url
    let path = ''

    if (config.categoryType) {
      const slugValue = item.slug || item.id
      if (config.isFaq) {
        path = `${config.pathPrefix}#faq-detail-${slugValue}`
      } else if (config.value === 'categories-product' || config.value === 'categories-blog') {
        path = `${config.pathPrefix}/${slugValue}`
      } else {
        path = `${config.pathPrefix}?category=${slugValue}`
      }
    } else if (config.value === 'blog-tags') {
      const slugValue = item.slug || item.id
      path = `${config.pathPrefix}?tag=${slugValue}`
    } else if (config.value === 'faq') {
      const category = item.category
      const slugValue =
        category && typeof category === 'object' && category.slug
          ? category.slug
          : (item.slug || item.id)
      path = `${config.pathPrefix}#faq-detail-${slugValue}`
    } else if (itemPath && typeof itemPath === 'string') {
      path = itemPath.startsWith('/') ? itemPath : `/${itemPath}`
    } else {
      const slugValue = item.slug || item.id
      path = `${config.pathPrefix}/${slugValue}`
    }

    path = path.replace(/\/+/g, '/')

    onSelect(path)
    onClose()
  }

  const getItemUrl = (item: any) => {
    const config = collections.find((c) => c.value === item._collectionValue)
    if (!config) return ''

    // Static items may carry a full path (e.g. /shop?hot=1)
    if (item.path && typeof item.path === 'string') {
      return item.path
    }
    if (item.url && typeof item.url === 'string') {
      return item.url
    }

    const slugValue = item.slug || item.id
    if (config.categoryType) {
      if (config.isFaq) {
        return `${config.pathPrefix}#faq-detail-${slugValue}`
      }
      if (config.value === 'categories-product' || config.value === 'categories-blog') {
        return `${config.pathPrefix}/${slugValue}`
      }
      return `${config.pathPrefix}?category=${slugValue}`
    }
    if (config.value === 'blog-tags') {
      return `${config.pathPrefix}?tag=${slugValue}`
    }
    if (config.value === 'faq') {
      const category = item.category
      const categorySlug =
        category && typeof category === 'object' && category.slug
          ? category.slug
          : slugValue
      return `${config.pathPrefix}#faq-detail-${categorySlug}`
    }
    return `${config.pathPrefix}/${slugValue}`
  }

  // 显示的数据：loading 时保留旧数据，避免闪烁
  const displayItems = isLoading && prevItemsRef.current.length > 0 ? prevItemsRef.current : items
  const showLoadingOverlay = isLoading && displayItems.length > 0

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
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '1024px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>选择站内链接</h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#9ca3af',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Search + Filter Row */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="搜索所有内容..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              onKeyDown={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '10px 10px 10px 38px',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <select
            value={selectedCollection}
            onChange={(e) => {
              setSelectedCollection(e.target.value)
              setCurrentPage(1)
              setSearchQuery('')
              setDebouncedSearchQuery('')
              setItems([])
              setHasInitialLoaded(false)
              prevItemsRef.current = []
            }}
            style={{
              padding: '10px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer',
              minWidth: '140px',
            }}
          >
            <option value="all">全部</option>
            {collections.map((col) => (
              <option key={col.value} value={col.value}>
                {col.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content Area */}
        <div style={{ position: 'relative', minHeight: '120px' }}>
          {/* Loading overlay for subsequent loads (keeps old data visible) */}
          {showLoadingOverlay && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              borderRadius: '8px',
            }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#6b7280' }} />
            </div>
          )}

          {!hasInitialLoaded && isLoading && displayItems.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span>加载中...</span>
            </div>
          )}

          {!isLoading && !hasInitialLoaded && isAllMode && !debouncedSearchQuery && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ fontSize: '14px', marginBottom: '8px' }}>👇 请选择一个分类或输入关键词开始搜索</div>
              <div style={{ fontSize: '12px', color: '#d1d5db' }}>直接搜全部数据量太大，建议先筛选分类</div>
            </div>
          )}

          {hasInitialLoaded && displayItems.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
              {debouncedSearchQuery ? '没有找到匹配的项目' : '暂无数据'}
            </div>
          )}

          {displayItems.length > 0 && (
            <div>
              {displayItems.map((item) => (
                <div
                  key={`${item._collectionValue}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                    borderRadius: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                      {item._collectionValue === 'products'
                        ? ((typeof item.name === 'object' ? item.name?.en || item.name?.zh : item.name) || item.adminLabel || item.slug)
                        : item._collectionValue === 'faq'
                          ? (item.adminLabel || (typeof item.question === 'object' ? item.question?.en || item.question?.zh : item.question) || item.slug)
                          : item._collectionValue === 'blogs'
                            ? ((typeof item.title === 'object' ? item.title?.en || item.title?.zh : item.title) || item.adminLabel || item.slug)
                            : (item.adminLabel || item.title || (typeof item.name === 'object' ? item.name?.en || item.name?.zh : item.name) || item.slug)}
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      fontSize: '13px',
                      fontWeight: 700,
                      backgroundColor: '#f3f4f6',
                      borderRadius: '6px',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                    }}>
                      {item._collectionLabel}
                    </span>
                    {item._collectionValue === 'categories' && item.type && (
                      <span style={{
                        padding: '2px 6px',
                        fontSize: '10px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                      }}>
                        {item.type}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>
                    {getItemUrl(item)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && hasInitialLoaded && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isLoading}
              style={{
                padding: '8px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: currentPage === 1 ? '#f9fafb' : 'white',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              上一页
            </button>
            <span style={{ padding: '8px 16px', fontSize: '14px', color: '#6b7280' }}>
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || isLoading}
              style={{
                padding: '8px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: currentPage === totalPages ? '#f9fafb' : 'white',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              下一页
            </button>
          </div>
        )}
      </div>

      {/* Inline keyframes for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
