"use client"

import { useState, useEffect, useMemo } from "react"
import type { Locale } from "@/i18n.config"
import { ProductCard } from "@/components/shop/ProductCard"
import { ProductFilters } from "@/components/shop/ProductFilters"
import { ProductSearch } from "@/components/shop/ProductSearch"
import { ShopPageSkeleton } from "@/components/shop/ShopPageSkeleton"
import { CustomSelect } from "@/components/shop/CustomSelect"
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

  // Filter & Search State - 从 URL 参数初始化 selectedSeries
  const initialSeries = searchParams.series
    ? (Array.isArray(searchParams.series) ? searchParams.series : [searchParams.series])
    : []
  const [selectedSeries, setSelectedSeries] = useState<string[]>(initialSeries)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<ProductSortField>("order")
  const [sortDirection, setSortDirection] = useState<ProductSortDirection>("ASC")

  // 监听 URL 参数变化，更新 selectedSeries
  useEffect(() => {
    const seriesFromUrl = searchParams.series
      ? (Array.isArray(searchParams.series) ? searchParams.series : [searchParams.series])
      : []
    setSelectedSeries(seriesFromUrl)
  }, [searchParams.series])

  // Fetch series for filters
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

        if (selectedSeries.length > 0) {
          params.append("series", selectedSeries[0]) // API only supports single series filter
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
  }, [locale, currentPage, selectedSeries, sortBy, sortDirection])

  // Client-side search filtering
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products

    const query = searchQuery.toLowerCase()
    return products.filter((product) => {
      // @ts-ignore - localizedName is added by API
      const name = product.localizedName?.toLowerCase() || product.name?.[locale]?.toLowerCase() || product.sku.toLowerCase()
      return name.includes(query) || product.sku.toLowerCase().includes(query)
    })
  }, [products, searchQuery, locale])

  // Note: Inquiry is handled via direct navigation to contact form
  // No cart functionality needed for B2B inquiry model

  // Show skeleton on initial load
  if (initialLoading) {
    return <ShopPageSkeleton />
  }

  return (
    <div className="min-h-screen bg-background pt-20" data-header-theme="light">
      {/* Main Content - Minimalist Layout */}
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-0 min-h-[calc(100vh-5rem)]">
          {/* Sidebar Filters - Desktop Only */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0 border-r border-brand-accent-border lg:pl-16 lg:pr-8">
            <ProductFilters
              series={series}
              selectedSeries={selectedSeries}
              onSeriesChange={setSelectedSeries}
              locale={locale}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSortChange={(field, direction) => {
                setSortBy(field)
                setSortDirection(direction)
              }}
            />
          </aside>

          {/* Products Grid */}
          <main className="flex-1 lg:px-8 lg:pl-8 lg:pr-16 lg:py-12">
            {/* Mobile Filters - Top Bar with Dropdowns */}
            <div className="lg:hidden -mx-6 md:-mx-8 px-6 md:px-8 mb-8 border-b border-brand-accent-border relative">
              <div className="flex gap-0 py-3">
                {/* Sort By Dropdown */}
                <div className="flex-1 pr-4">
                  <CustomSelect
                    value={`${sortBy}-${sortDirection}`}
                    onChange={(value) => {
                      const [field, direction] = value.split('-') as [typeof sortBy, typeof sortDirection]
                      setSortBy(field)
                      setSortDirection(direction)
                    }}
                    options={[
                      { value: "order-ASC", label: "Default Order" },
                      { value: "createdAt-DESC", label: "Newest First" },
                      { value: "createdAt-ASC", label: "Oldest First" },
                      { value: "updatedAt-DESC", label: "Recently Updated" },
                    ]}
                  />
                </div>

                {/* 中间竖线 - 贯穿整个高度 */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-brand-accent-border -translate-x-1/2 pointer-events-none"></div>

                {/* Product Series Dropdown */}
                <div className="flex-1 pl-4">
                  <CustomSelect
                    value={selectedSeries[0] || ''}
                    onChange={(value) => {
                      setSelectedSeries(value ? [value] : [])
                    }}
                    options={[
                      { value: "", label: "All Series" },
                      ...series.map((s) => ({
                        value: s.slug,
                        label: s.name?.[locale] || s.name?.["en"] || s.slug,
                      })),
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* 移动端内容区域需要恢复 padding */}
            <div className="px-6 md:px-8 lg:px-0">
              {/* Search - Clean Design */}
              <ProductSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                totalResults={filteredProducts.length}
              />

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <div className="w-12 h-12 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {/* No Results */}
              {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-20">
                  <div className="inline-block w-16 h-px bg-brand-accent-border mb-6"></div>
                  <p className="text-brand-text-black text-2xl font-anaheim font-extrabold mb-3">
                    No products found
                  </p>
                  <p className="text-brand-accent-gold text-base">
                    Try adjusting your filters or search query
                  </p>
                </div>
              )}

              {/* Products Grid - 2 Columns */}
              {!loading && filteredProducts.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      locale={locale}
                    />
                  ))}
                </div>

                {/* Pagination - Minimal Style */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-6 mt-16 pt-8 border-t border-brand-accent-border">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-0 py-2 border-b disabled:opacity-30 disabled:cursor-not-allowed border-transparent hover:border-brand-text-black transition-colors font-anaheim font-bold text-xs uppercase tracking-wider text-brand-text-black"
                    >
                      ← Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 transition-colors font-anaheim font-bold text-sm ${
                          page === currentPage
                            ? "border-b-2 border-brand-text-black text-brand-text-black"
                            : "text-brand-accent-gold hover:text-brand-text-black border-b-2 border-transparent"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-0 py-2 border-b disabled:opacity-30 disabled:cursor-not-allowed border-transparent hover:border-brand-text-black transition-colors font-anaheim font-bold text-xs uppercase tracking-wider text-brand-text-black"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
