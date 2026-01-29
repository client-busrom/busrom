"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
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

interface ShopPageClientProps {
  locale: Locale
  searchParams: { [key: string]: string | string[] | undefined }
}

export function ShopPageClient({ locale, searchParams }: ShopPageClientProps) {
  // State
  const [products, setProducts] = useState<Product[]>([])
  const [series, setSeries] = useState<ProductSeries[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Filter & Search State
  const initialSeries = searchParams.series
    ? (Array.isArray(searchParams.series) ? searchParams.series[0] : searchParams.series)
    : ""
  const [selectedSeries, setSelectedSeries] = useState<string>(initialSeries)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<ProductSortField>("order")
  const [sortDirection, setSortDirection] = useState<ProductSortDirection>("ASC")
  const [featuredOnly, setFeaturedOnly] = useState(false)

  // UI State
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  // 监听 URL 参数变化
  useEffect(() => {
    const seriesFromUrl = searchParams.series
      ? (Array.isArray(searchParams.series) ? searchParams.series[0] : searchParams.series)
      : ""
    setSelectedSeries(seriesFromUrl)
  }, [searchParams.series])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false)
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch series for navigation
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const res = await fetch(`/api/product-series?locale=${locale}`)
        if (res.ok) {
          const data = await res.json()
          setSeries(data.series || [])
        }
      } catch (error) {
        console.error("Failed to fetch series:", error)
      }
    }
    fetchSeries()
  }, [locale])

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          locale,
          page: currentPage.toString(),
          pageSize: "12",
          sortBy,
          sortDir: sortDirection.toLowerCase(),
        })

        if (selectedSeries) {
          params.append("series", selectedSeries)
        }

        if (featuredOnly) {
          params.append("isFeatured", "true")
        }

        const res = await fetch(`/api/products?${params}`)
        if (res.ok) {
          const data: ProductListResponse = await res.json()
          setProducts(data.products)
          setTotalResults(data.total)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
        setInitialLoading(false)
      }
    }
    fetchProducts()
  }, [locale, currentPage, selectedSeries, sortBy, sortDirection, featuredOnly])

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

  const currentSortLabel = sortOptions.find(
    opt => opt.value === sortBy && opt.direction === sortDirection
  )?.label || "Default"

  if (initialLoading) {
    return <ShopPageSkeleton />
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]" data-header-theme="light">
      {/* Series Title - At the very top */}
      <div className="container mx-auto px-4 lg:px-8 pt-20 lg:pt-12">
        <h1 className="font-anaheim font-black text-4xl lg:text-6xl text-brand-text-black uppercase tracking-wide text-center">
          {currentSeriesName}
        </h1>
      </div>

      {/* Product Series Tabs Navigation */}
      <nav className="bg-[#F5F5F0] mt-6 lg:mt-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center py-4">
            {/* Series Tabs - Wrap to multiple lines */}
            <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6">
              {/* All Products Tab */}
              <button
                onClick={() => setSelectedSeries("")}
                className={cn(
                  "text-sm font-medium transition-colors pb-1",
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
                  onClick={() => setSelectedSeries(s.slug)}
                  className={cn(
                    "text-sm font-medium transition-colors pb-1",
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
      <main className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">

        {/* Filter Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          {/* Left: Apply Filter */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "flex items-center gap-2 text-sm transition-colors",
                featuredOnly ? "text-brand-secondary" : "text-brand-accent-gold hover:text-brand-text-black"
              )}
            >
              <span>Apply filter</span>
              <svg
                className={cn("w-4 h-4 transition-transform", isFilterOpen && "rotate-180")}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {featuredOnly && (
                <span className="w-2 h-2 rounded-full bg-brand-secondary"></span>
              )}
            </button>

            {/* Filter Dropdown */}
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-brand-accent-border shadow-lg z-50">
                <div className="p-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={featuredOnly}
                      onChange={(e) => setFeaturedOnly(e.target.checked)}
                      className="w-4 h-4 accent-brand-secondary cursor-pointer"
                    />
                    <span className="text-sm text-brand-text-black group-hover:text-brand-secondary transition-colors">
                      Featured Only
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 text-sm bg-white/50 focus:bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 transition-all placeholder:text-brand-accent-gold"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-accent-gold group-focus-within:text-brand-secondary transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Right: Sort By */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 text-sm text-brand-accent-gold hover:text-brand-text-black transition-colors"
            >
              <span>Sort by: {currentSortLabel}</span>
              <svg
                className={cn("w-4 h-4 transition-transform", isSortOpen && "rotate-180")}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Sort Dropdown */}
            {isSortOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-brand-accent-border shadow-lg z-50">
                {sortOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSortBy(option.value as ProductSortField)
                      setSortDirection(option.direction)
                      setIsSortOpen(false)
                    }}
                    className={cn(
                      "block w-full text-left px-4 py-2 text-sm transition-colors",
                      sortBy === option.value && sortDirection === option.direction
                        ? "bg-brand-secondary/10 text-brand-secondary"
                        : "text-brand-text-black hover:bg-gray-50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-brand-accent-gold mb-6">
          {filteredProducts.length} Products
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-brand-text-black text-2xl font-anaheim font-extrabold mb-3">
              No products found
            </p>
            <p className="text-brand-accent-gold text-base">
              Try adjusting your filters or search query
            </p>
          </div>
        )}

        {/* Products Grid - 3 Columns */}
        {!loading && filteredProducts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-brand-accent-border">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed text-brand-text-black hover:text-brand-secondary transition-colors"
                >
                  ← Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
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
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed text-brand-text-black hover:text-brand-secondary transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
