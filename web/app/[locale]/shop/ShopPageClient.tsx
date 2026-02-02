"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import useSWR, { preload } from "swr"
import type { Locale } from "@/i18n.config"
import { ProductCard } from "@/components/shop/ProductCard"
import { ShopPageSkeleton } from "@/components/shop/ShopPageSkeleton"
import { cn, getLocalizedName } from "@/lib/utils"
import type {
  Product,
  ProductSeries,
  ProductListResponse,
  ProductSortField,
  ProductSortDirection,
} from "@/lib/types/product"

// SWR fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json())

// 构建产品列表 API URL
function buildProductsUrl(
  locale: string,
  series: string,
  sortBy: string,
  sortDirection: string,
  featuredOnly: boolean,
  page: number = 1,
  pageSize: number = 24
) {
  const params = new URLSearchParams({
    locale,
    page: page.toString(),
    pageSize: pageSize.toString(),
    sortBy,
    sortDir: sortDirection.toLowerCase(),
  })
  if (series) {
    params.append("series", series)
  }
  if (featuredOnly) {
    params.append("isFeatured", "true")
  }
  return `/api/products?${params}`
}

// Helper to extract URL from variant
function getVariantUrl(variant: string | { url?: string } | undefined): string | undefined {
  if (!variant) return undefined
  if (typeof variant === 'string') return variant
  return variant.url
}

// 获取产品图片 URL - 优先使用正方形的 tablet 变体
function getProductImageUrl(product: Product): string | undefined {
  const image = product.showImage
  if (!image) return undefined
  return getVariantUrl(image.variants?.tablet) ||
         getVariantUrl(image.variants?.card) ||
         getVariantUrl(image.variants?.medium) ||
         getVariantUrl(image.variants?.large) ||
         getVariantUrl(image.variants?.thumbnail) ||
         image.url
}

interface ShopPageClientProps {
  locale: Locale
  searchParams: { [key: string]: string | string[] | undefined }
}

export function ShopPageClient({ locale, searchParams }: ShopPageClientProps) {
  // Filter & Search State
  const initialSeries = searchParams.series
    ? (Array.isArray(searchParams.series) ? searchParams.series[0] : searchParams.series)
    : ""
  const [selectedSeries, setSelectedSeries] = useState<string>(initialSeries)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<ProductSortField>("order")
  const [sortDirection, setSortDirection] = useState<ProductSortDirection>("ASC")
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // UI State
  const [isFilterSortOpen, setIsFilterSortOpen] = useState(false)
  const filterSortRef = useRef<HTMLDivElement>(null)

  // 用于动画的 key，切换系列时改变
  const [animationKey, setAnimationKey] = useState(0)
  // 用于控制退出动画
  const [isExiting, setIsExiting] = useState(false)

  // Fetch series for navigation
  const { data: seriesData } = useSWR<{ series: ProductSeries[] }>(
    `/api/product-series?locale=${locale}`,
    fetcher,
    { revalidateOnFocus: false }
  )
  const series = seriesData?.series || []

  // Fetch products with SWR
  const productsUrl = buildProductsUrl(locale, selectedSeries, sortBy, sortDirection, featuredOnly, currentPage)
  const { data: productsData, isLoading, isValidating } = useSWR<ProductListResponse>(
    productsUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true, // 保持旧数据直到新数据加载完成
    }
  )

  const products = productsData?.products || []
  const totalPages = productsData?.totalPages || 1
  const totalResults = productsData?.total || 0

  // 预取：鼠标悬停时预加载该系列的数据
  const handleSeriesHover = useCallback((seriesSlug: string) => {
    const url = buildProductsUrl(locale, seriesSlug, sortBy, sortDirection, featuredOnly)
    preload(url, fetcher)
  }, [locale, sortBy, sortDirection, featuredOnly])

  // 切换系列 - 先触发退出动画，再切换数据
  const handleSeriesChange = useCallback((newSeries: string) => {
    if (newSeries === selectedSeries || isExiting) return

    // 先触发退出动画
    setIsExiting(true)

    // 等待退出动画完成后再切换数据
    setTimeout(() => {
      setSelectedSeries(newSeries)
      setCurrentPage(1)
      setAnimationKey(prev => prev + 1)
      setIsExiting(false)
    }, 400) // 退出动画时长
  }, [selectedSeries, isExiting])

  // 监听 URL 参数变化
  useEffect(() => {
    const seriesFromUrl = searchParams.series
      ? (Array.isArray(searchParams.series) ? searchParams.series[0] : searchParams.series)
      : ""
    if (seriesFromUrl !== selectedSeries) {
      setSelectedSeries(seriesFromUrl)
      setAnimationKey(prev => prev + 1)
    }
  }, [searchParams.series])

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

  // 预加载首屏产品图片
  useEffect(() => {
    if (products.length === 0) return

    const existingPreloads = document.querySelectorAll('link[data-product-preload]')
    existingPreloads.forEach(link => link.remove())

    const imagesToPreload = products.slice(0, 8)
    imagesToPreload.forEach((product, index) => {
      const imageUrl = getProductImageUrl(product)
      if (!imageUrl) return

      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = imageUrl
      link.setAttribute('data-product-preload', 'true')
      if (index < 4) {
        link.setAttribute('fetchpriority', 'high')
      }
      document.head.appendChild(link)
    })

    return () => {
      const preloads = document.querySelectorAll('link[data-product-preload]')
      preloads.forEach(link => link.remove())
    }
  }, [products])

  // Client-side search filtering
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products
    const query = searchQuery.toLowerCase()
    return products.filter((product) => {
      const name = (product as any).localizedName?.toLowerCase() || product.name?.[locale]?.toLowerCase() || product.sku.toLowerCase()
      return name.includes(query) || product.sku.toLowerCase().includes(query)
    })
  }, [products, searchQuery, locale])

  // Get current series name for title
  const currentSeriesName = useMemo(() => {
    if (!selectedSeries) return "All Products"
    const found = series.find(s => s.slug === selectedSeries)
    return found?.localizedName || getLocalizedName(found?.name, locale, selectedSeries)
  }, [selectedSeries, series, locale])

  // Sort options
  const sortOptions = [
    { label: "Default", value: "order", direction: "ASC" as const },
    { label: "Newest", value: "createdAt", direction: "DESC" as const },
    { label: "Oldest", value: "createdAt", direction: "ASC" as const },
    { label: "Updated", value: "updatedAt", direction: "DESC" as const },
  ]

  // 首次加载显示骨架屏
  if (isLoading && products.length === 0) {
    return <ShopPageSkeleton />
  }

  // 卡片动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.03,
        staggerDirection: 1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, x: -30, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      }
    },
    exit: {
      opacity: 0,
      x: 30,
      scale: 0.95,
      transition: {
        duration: 0.35,
      }
    },
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]" data-header-theme="light">
      {/* Series Title */}
      <div className="container mx-auto px-4 lg:px-8 pt-20 lg:pt-[78px] overflow-hidden">
        <div className="relative h-[52px] lg:h-[68px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.h1
              key={currentSeriesName}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="font-orbitron font-medium text-4xl lg:text-6xl text-brand-text-black uppercase tracking-wide text-center absolute"
            >
              {currentSeriesName}
            </motion.h1>
          </AnimatePresence>
        </div>
      </div>

      {/* Product Series Tabs Navigation */}
      <nav className="bg-[#F5F5F0] mt-2 lg:mt-3">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center py-3 lg:py-4">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 lg:gap-x-6 lg:gap-y-4 max-w-[calc(7*140px)]">
              {/* All Products Tab */}
              <button
                onClick={() => handleSeriesChange("")}
                onMouseEnter={() => handleSeriesHover("")}
                className={cn(
                  "text-sm font-medium transition-colors pb-1 whitespace-nowrap px-2",
                  !selectedSeries
                    ? "text-brand-text-black border-b-2 border-brand-text-black"
                    : "text-brand-accent-gold hover:text-brand-text-black"
                )}
              >
                All
              </button>

              {/* Series Tabs */}
              {series.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSeriesChange(s.slug)}
                  onMouseEnter={() => handleSeriesHover(s.slug)}
                  className={cn(
                    "text-sm font-medium transition-colors pb-1 whitespace-nowrap px-2",
                    selectedSeries === s.slug
                      ? "text-brand-text-black border-b-2 border-brand-text-black"
                      : "text-brand-accent-gold hover:text-brand-text-black"
                  )}
                >
                  {s.localizedName || getLocalizedName(s.name, locale, s.slug)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 pt-5 lg:pt-6 pb-8 lg:pb-12">

        {/* Filter Toolbar */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 mb-6 lg:mb-8 max-w-[1072px] mx-auto">
          <div className="flex items-center gap-4">
            {/* Left: Combined Filter & Sort */}
            <div className="relative" ref={filterSortRef}>
              <button
                onClick={() => setIsFilterSortOpen(!isFilterSortOpen)}
                className={cn(
                  "flex items-center gap-2 text-sm transition-colors whitespace-nowrap",
                  (featuredOnly || sortBy !== "order") ? "text-brand-secondary" : "text-brand-accent-gold hover:text-brand-text-black"
                )}
              >
                <span>Apply filter</span>
                <svg
                  className={cn("w-4 h-4 transition-transform", isFilterSortOpen && "rotate-180")}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {(featuredOnly || sortBy !== "order") && (
                  <span className="w-2 h-2 rounded-full bg-brand-secondary"></span>
                )}
              </button>

              {/* Combined Filter & Sort Dropdown */}
              {isFilterSortOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-brand-accent-border shadow-lg z-50 rounded-lg">
                  {/* Filter Section */}
                  <div className="p-3 border-b border-brand-accent-border">
                    <span className="text-xs font-semibold text-brand-accent-gold uppercase tracking-wider">Filter</span>
                    <label className="flex items-center gap-3 cursor-pointer group mt-2">
                      <input
                        type="checkbox"
                        checked={featuredOnly}
                        onChange={(e) => {
                          setFeaturedOnly(e.target.checked)
                          setAnimationKey(prev => prev + 1)
                        }}
                        className="w-4 h-4 accent-brand-secondary cursor-pointer"
                      />
                      <span className="text-sm text-brand-text-black group-hover:text-brand-secondary transition-colors">
                        Featured Only
                      </span>
                    </label>
                  </div>

                  {/* Sort Section */}
                  <div className="p-3">
                    <span className="text-xs font-semibold text-brand-accent-gold uppercase tracking-wider">Sort By</span>
                    <div className="mt-2 space-y-1">
                      {sortOptions.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSortBy(option.value as ProductSortField)
                            setSortDirection(option.direction)
                            setAnimationKey(prev => prev + 1)
                          }}
                          className={cn(
                            "block w-full text-left px-2 py-1.5 text-sm transition-colors rounded",
                            sortBy === option.value && sortDirection === option.direction
                              ? "bg-brand-secondary/10 text-brand-secondary"
                              : "text-brand-text-black hover:bg-gray-50"
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
                  placeholder="Search products..."
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

        {/* Products Grid with AnimatePresence */}
        <div className="relative min-h-[400px]">
          {/* Loading indicator - subtle, not blocking */}
          {isValidating && products.length > 0 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
              <div className="w-6 h-6 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {filteredProducts.length === 0 && !isExiting ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
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
                key={`products-${animationKey}-${isExiting ? 'exit' : 'enter'}`}
                className="flex flex-wrap justify-center gap-4 lg:gap-6 max-w-[1072px] mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate={isExiting ? "exit" : "visible"}
                exit="exit"
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    variants={cardVariants}
                  >
                    <ProductCard
                      product={product}
                      locale={locale}
                      index={index}
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
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1))
                setAnimationKey(prev => prev + 1)
              }}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed text-brand-text-black hover:text-brand-secondary transition-colors"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page)
                    setAnimationKey(prev => prev + 1)
                  }}
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
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1))
                setAnimationKey(prev => prev + 1)
              }}
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
