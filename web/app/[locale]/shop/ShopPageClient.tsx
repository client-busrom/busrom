"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import type { Locale } from "@/i18n.config"
import { ProductCard } from "@/components/shop/ProductCard"
import { ShopPageSkeleton } from "@/components/shop/ShopPageSkeleton"
import { cn } from "@/lib/utils"
import type {
  Product,
  ProductListResponse,
  ProductSortField,
  ProductSortDirection,
} from "@/lib/types/product"

// SWR fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json())

interface ShopPageClientProps {
  locale: Locale
  searchParams: { [key: string]: string | string[] | undefined }
  slugMode?: boolean
}

// Helper to normalize slugs in the UI
function toUrlSlug(s: string): string {
  if (!s) return ''
  return s
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/[^a-z0-9-]/g, '')
}

export function ShopPageClient({ locale, slugMode = false }: ShopPageClientProps) {
  const router = useRouter()
  const searchParamsDict = useSearchParams()
  const pathname = usePathname()

  // ============================================================
  // URL is the SINGLE SOURCE OF TRUTH (Always normalized)
  // ============================================================
  // In slugMode, the category comes from the URL path /shop/[slug]
  // Otherwise it comes from ?category=xxx query param
  const pathSlug = useMemo(() => {
    if (!slugMode) return ""
    const match = pathname.match(/\/shop\/([^/?]+)/)
    return match ? toUrlSlug(match[1]) : ""
  }, [pathname, slugMode])

  const rawCategory = slugMode ? pathSlug : (searchParamsDict.get('category') || "")
  const selectedCategory = useMemo(() => toUrlSlug(rawCategory), [rawCategory])

  // ============================================================
  // Data Fetching
  // ============================================================
  const { data: configData } = useSWR<{ categories: any[], showAllTab: boolean, allTabLabel?: string, allProductsTitle?: string, title: string, pageSize: number, sortOptions: any[], filterLabels?: any, sortGroupTitle?: string, buttonLabels?: any }>(
    `/api/shop/config?locale=${locale}`,
    fetcher,
    { revalidateOnFocus: false }
  )
  const categories = configData?.categories || []
  const showAllTab = configData?.showAllTab !== false
  const filterLabels = configData?.filterLabels || {
    applyFilterBtn: 'Apply filter',
    title: 'Product Status',
    hotLabel: 'Hot Items',
    newLabel: 'New Arrivals',
    featuredLabel: 'Featured'
  }

  const apiSortOptions = useMemo(() => {
    if (!configData?.sortOptions?.length) {
      return [
        { label: "Recommended", value: "shopOrder", direction: "DESC" as const, isDefault: true },
        { label: "Newest Arrivals", value: "createdAt", direction: "DESC" as const },
        { label: "Name (A to Z)", value: "name_asc", direction: "ASC" as const },
      ]
    }
    return configData.sortOptions.map((opt: any) => {
      let dir = 'DESC'
      if (opt.value === 'name_asc') dir = 'ASC'
      else if (opt.value === 'name_desc') dir = 'DESC'
      
      return {
        label: opt.label,
        value: opt.value,
        direction: dir,
        isDefault: opt.isDefault
      }
    })
  }, [configData])

  const defaultSortOption = useMemo(() => {
    return apiSortOptions.find((opt: any) => opt.isDefault) || apiSortOptions[0]
  }, [apiSortOptions])

  const [sortBy, setSortBy] = useState<ProductSortField>('shopOrder')
  const [sortDirection, setSortDirection] = useState<ProductSortDirection>('DESC')
  
  // Status filters
  const [hotOnly, setHotOnly] = useState(false)
  const [newOnly, setNewOnly] = useState(false)
  const [featuredOnly, setFeaturedOnly] = useState(false)

  // Local UI state
  const [currentPage, setCurrentPage] = useState(1) // No longer in URL
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterSortOpen, setIsFilterSortOpen] = useState(false)
  const filterSortRef = useRef<HTMLDivElement>(null)

  // Reset page when anything else changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, sortBy, sortDirection, hotOnly, newOnly, featuredOnly, searchQuery])

  // Fetch ALL products once (front-end filtering is fast, avoids round trips per tab click)
  const productsUrl = `/api/products?locale=${locale}&pageSize=1000&sortBy=shopOrder&sortDir=desc`
  const { data: productsData, isLoading, isValidating } = useSWR<ProductListResponse>(
    productsUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  )

  const allProducts = productsData?.products || []

  // ============================================================
  // Front-end filtering (instant, no network round trip)
  // ============================================================
  const categoryFilteredProducts = useMemo(() => {
    if (!selectedCategory) return allProducts
    return allProducts.filter(p => {
      const pany = p as any
      const catId = String(pany.category?.id || pany.category || '')
      const seriesId = String(pany.series?.id || pany.series || '')
      const catSlug = pany.category?.slug
      const seriesSlug = pany.series?.slug
      
      return catSlug === selectedCategory ||
             seriesSlug === selectedCategory ||
             catId === selectedCategory ||
             seriesId === selectedCategory
    })
  }, [allProducts, selectedCategory])

  const filteredProducts = useMemo(() => {
    let result = categoryFilteredProducts

    // Apply status filters locally
    if (hotOnly) result = result.filter((p: any) => p.isHot)
    if (newOnly) result = result.filter((p: any) => p.isNew)
    if (featuredOnly) result = result.filter((p: any) => p.isFeatured)

    if (!searchQuery.trim()) return result
    
    const query = searchQuery.toLowerCase()
    return result.filter((product: any) => {
      const name = product?.localizedName || product?.name?.[locale] || product?.name || ""
      const sku = product?.sku || ""
      return name.toLowerCase().includes(query) || sku.toLowerCase().includes(query)
    })
  }, [categoryFilteredProducts, searchQuery, locale, hotOnly, newOnly, featuredOnly])

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts]
    list.sort((a: any, b: any) => {
      if (sortBy === 'shopOrder') {
        // 1. 置顶优先级：isHot(3) > isNew(2) > isFeatured(1) > 普通(0)
        const getPinWeight = (p: any) => (p.isHot ? 3 : p.isNew ? 2 : p.isFeatured ? 1 : 0)
        const aPinned = getPinWeight(a)
        const bPinned = getPinWeight(b)
        if (aPinned !== bPinned) {
          return bPinned - aPinned // 权重大的在前
        }

        // 2. 内部按照 shopOrder > order > updatedAt 排序
        const aShop = a.shopOrder || 0
        const bShop = b.shopOrder || 0
        if (aShop !== bShop) {
          return sortDirection.toUpperCase() === 'DESC' ? bShop - aShop : aShop - bShop
        }
        const aOrder = a.order || 0
        const bOrder = b.order || 0
        if (aOrder !== bOrder) {
          return sortDirection.toUpperCase() === 'DESC' ? bOrder - aOrder : aOrder - bOrder
        }
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
        return sortDirection.toUpperCase() === 'DESC' ? bTime - aTime : aTime - bTime
      } else if (sortBy === 'order') {
        const aOrder = a.order || 0
        const bOrder = b.order || 0
        if (aOrder !== bOrder) {
          return sortDirection.toUpperCase() === 'DESC' ? bOrder - aOrder : aOrder - bOrder
        }
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
        return sortDirection.toUpperCase() === 'DESC' ? bTime - aTime : aTime - bTime
      } else {
        const prop = sortBy === 'createdAt' ? 'createdAt' : sortBy === 'updatedAt' ? 'updatedAt' : 'createdAt'
        const aTime = a[prop] ? new Date(a[prop]).getTime() : 0
        const bTime = b[prop] ? new Date(b[prop]).getTime() : 0
        return sortDirection.toUpperCase() === 'DESC' ? bTime - aTime : aTime - bTime
      }
    })
    return list
  }, [filteredProducts, sortBy, sortDirection])

  const pageSize = configData?.pageSize || 24
  const totalPages = Math.ceil(sortedProducts.length / pageSize) || 1
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedProducts.slice(start, start + pageSize)
  }, [sortedProducts, currentPage, pageSize])

  // ============================================================
  // Navigation helpers — ALL URL updates go through one function
  // ============================================================
  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    // Category changes always navigate to /[locale]/shop/[slug] for clean URLs
    if ('category' in updates) {
      const newSlug = updates.category
      // pathname already includes locale, e.g. /en/shop or /en/shop/bathroom-glass-clip
      const basePath = pathname.replace(/\/shop\/.*$/, '/shop')
      if (newSlug) {
        router.push(`${basePath}/${newSlug}`, { scroll: false })
      } else {
        // "All" tab clicked → go to /[locale]/shop
        router.push(basePath, { scroll: false })
      }
      return
    }

    const params = new URLSearchParams(searchParamsDict.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    // Remove page from URL just in case some old links have it
    params.delete('page')

    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }, [pathname, router, searchParamsDict, slugMode, locale])

  const handleCategoryChange = useCallback((slug: string) => {
    updateUrl({ category: slug || null })
  }, [updateUrl])

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSortChange = useCallback((newSortBy: ProductSortField, newSortDir: ProductSortDirection) => {
    setSortBy(newSortBy)
    setSortDirection(newSortDir)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterSortRef.current && !filterSortRef.current.contains(event.target as Node)) {
        setIsFilterSortOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // ============================================================
  // Display helpers
  // ============================================================
  // Derived state for headers
  const categoryTitle = useMemo(() => {
    const defaultTitle = configData?.allProductsTitle || "All Products"
    if (!selectedCategory) return defaultTitle
    const found = categories.find((c: any) => c.slug === selectedCategory)
    return found?.name || defaultTitle
  }, [selectedCategory, categories, configData?.allProductsTitle])

  // ============================================================
  // Animation variants
  // ============================================================
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
    exit: {
      opacity: 0,
      transition: { staggerChildren: 0.03 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, x: -30, scale: 0.95 },
    visible: {
      opacity: 1, x: 0, scale: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
    exit: {
      opacity: 0, x: 30, scale: 0.95,
      transition: { duration: 0.35 },
    },
  }

  // 首次加载显示骨架屏
  if (isLoading && allProducts.length === 0) {
    return <ShopPageSkeleton />
  }

  return (
    <div className="min-h-screen bg-[#F6F4ED]" data-header-theme="light">
      {/* Series Title */}
      <div className="container mx-auto px-4 lg:px-8 pt-[78px] lg:pt-[130px] overflow-hidden">
        <div className="relative min-h-[52px] lg:min-h-[68px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.h1
              key={categoryTitle}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="font-orbitron font-medium text-4xl lg:text-6xl text-brand-text-black uppercase tracking-wide text-center"
            >
              {categoryTitle}
            </motion.h1>
          </AnimatePresence>
        </div>
      </div>

      {/* Product Series Tabs Navigation */}
      <nav className="bg-[#F6F4ED] mt-2 lg:mt-3">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center py-3 lg:py-4">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 lg:gap-x-6 lg:gap-y-4 max-w-[calc(7*140px)]">
              {/* All Products Tab */}
              {showAllTab && (
                <button
                  onClick={() => handleCategoryChange("")}
                  className={cn(
                    "text-sm font-medium transition-colors pb-1 whitespace-nowrap px-2 font-orbitron",
                    !selectedCategory
                      ? "text-brand-text-black border-b-2 border-brand-text-black"
                      : "text-brand-accent-gold hover:text-brand-text-black"
                  )}
                >
                  {configData?.allTabLabel || 'All'}
                </button>
              )}

              {/* Category Tabs */}
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCategoryChange(c.slug)}
                  className={cn(
                    "text-sm font-medium transition-colors pb-1 whitespace-nowrap px-2 font-orbitron",
                    selectedCategory === c.slug
                      ? "text-brand-text-black border-b-2 border-brand-text-black"
                      : "text-brand-accent-gold hover:text-brand-text-black"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 pt-[60px] lg:pt-[100px] pb-8 lg:pb-12">

        {/* Filter Toolbar */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 mb-[39px] lg:mb-[65px] max-w-[1072px] mx-auto">
          <div className="flex items-center gap-4">
            {/* Left: Combined Filter & Sort */}
            <div className="relative" ref={filterSortRef}>
              <button
                onClick={() => setIsFilterSortOpen(!isFilterSortOpen)}
                className={cn(
                  "flex items-center gap-2 text-sm transition-colors whitespace-nowrap",
                  (hotOnly || newOnly || featuredOnly || sortBy !== defaultSortOption.value) ? "text-brand-secondary" : "text-brand-accent-gold hover:text-brand-text-black"
                )}
              >
                <span>{filterLabels.applyFilterBtn}</span>
                <svg
                  className={cn("w-4 h-4 transition-transform", isFilterSortOpen && "rotate-180")}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {(hotOnly || newOnly || featuredOnly || sortBy !== defaultSortOption.value) && (
                  <span className="w-2 h-2 rounded-full bg-brand-secondary"></span>
                )}
              </button>

              {/* Dropdown */}
              {isFilterSortOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-brand-accent-border shadow-lg z-50 rounded-lg">
                  {/* Filter Section */}
                  <div className="p-3 border-b border-brand-accent-border">
                    <span className="text-xs font-semibold text-brand-accent-gold tracking-wider">{filterLabels.title}</span>
                    <div className="mt-2 space-y-2">
                      {filterLabels.enableHotFilter && (
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={hotOnly}
                            onChange={(e) => setHotOnly(e.target.checked)}
                            className="w-4 h-4 accent-[#B91C1C] cursor-pointer"
                          />
                          <span className="text-sm text-brand-text-black group-hover:text-[#B91C1C] transition-colors">
                            {filterLabels.hotLabel}
                          </span>
                        </label>
                      )}
                      {filterLabels.enableNewFilter && (
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={newOnly}
                            onChange={(e) => setNewOnly(e.target.checked)}
                            className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
                          />
                          <span className="text-sm text-brand-text-black group-hover:text-[#D4AF37] transition-colors">
                            {filterLabels.newLabel}
                          </span>
                        </label>
                      )}
                      {filterLabels.enableFeaturedFilter && (
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={featuredOnly}
                            onChange={(e) => setFeaturedOnly(e.target.checked)}
                            className="w-4 h-4 accent-brand-secondary cursor-pointer"
                          />
                          <span className="text-sm text-brand-text-black group-hover:text-brand-secondary transition-colors">
                            {filterLabels.featuredLabel}
                          </span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Sort Section */}
                  <div className="p-3">
                    <span className="text-xs font-semibold text-brand-accent-gold tracking-wider">{configData?.sortGroupTitle || 'Sort By'}</span>
                    <div className="mt-2 space-y-1">
                      {apiSortOptions.map((option: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => {
                            handleSortChange(option.value, option.direction)
                            setIsFilterSortOpen(false)
                          }}
                          className={cn(
                            "w-full text-left px-4 py-3 text-sm transition-colors duration-200",
                            sortBy === option.value
                              ? "bg-[#F4F1ED] text-black font-medium"
                              : "text-[#8A8A8A] hover:bg-[#F4F1ED]/50 hover:text-black"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-brand-accent-border"></div>

            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={filterLabels.searchPlaceholder || "Search products..."}
                  className="w-full py-1 text-sm bg-transparent focus:outline-none placeholder:text-brand-accent-gold"
                />
              </div>
            </div>

            {/* Search Icon */}
            <svg
              className="w-4 h-4 text-brand-accent-gold flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Products Grid */}
        <div className="relative min-h-[400px]">
          {/* Subtle loading indicator */}
          {isValidating && allProducts.length > 0 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
              <div className="w-6 h-6 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {filteredProducts.length === 0 && !isLoading ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 w-full"
              >
                <p className="text-brand-text-black text-2xl font-anaheim font-extrabold mb-3">
                  No products found
                </p>
                <p className="text-brand-accent-gold text-base">
                  Try adjusting your filters or search query
                </p>
              </motion.div>
            ) : (
              <motion.div
                // Key changes whenever the visible product set changes — this is the correct trigger
                key={`${selectedCategory}-${sortBy}-${sortDirection}-${hotOnly}-${newOnly}-${featuredOnly}-${currentPage}-${searchQuery}`}
                className="flex flex-wrap justify-center gap-4 lg:gap-6 max-w-[1072px] mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {paginatedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    variants={cardVariants}
                  >
                    <ProductCard
                      product={product}
                      locale={locale}
                      index={index}
                      buttonLabels={configData?.buttonLabels}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-brand-accent-border">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed text-brand-text-black hover:text-brand-secondary transition-colors"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={cn(
                    "w-8 h-8 text-sm transition-colors",
                    page === currentPage
                      ? "bg-brand-text-black text-white"
                      : "text-brand-accent-gold hover:text-brand-text-black"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed text-brand-text-black hover:text-brand-secondary transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
