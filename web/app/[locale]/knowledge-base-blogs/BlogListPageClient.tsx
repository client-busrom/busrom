"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import type { Locale } from "@/i18n.config"
import { BlogCard } from "@/components/blog/BlogCard"
import { cn } from "@/lib/utils"

// SWR fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json())

interface BlogListPageClientProps {
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

export function BlogListPageClient({ locale, slugMode = false }: BlogListPageClientProps) {
  const router = useRouter()
  const searchParamsDict = useSearchParams()
  const pathname = usePathname()

  // ============================================================
  // URL is the SINGLE SOURCE OF TRUTH (Always normalized)
  // ============================================================
  const pathSlug = useMemo(() => {
    if (!slugMode) return ""
    const match = pathname.match(/\/knowledge-base-blogs\/([^/?]+)/)
    return match ? toUrlSlug(match[1]) : ""
  }, [pathname, slugMode])

  const rawCategory = slugMode ? pathSlug : (searchParamsDict.get('category') || "")
  const selectedCategory = useMemo(() => toUrlSlug(rawCategory), [rawCategory])

  // ============================================================
  // Data Fetching
  // ============================================================
  const { data: configData, isLoading: isConfigLoading } = useSWR<any>(
    `/api/knowledge-base-blogs/config?locale=${locale}`,
    fetcher,
    { revalidateOnFocus: false }
  )
  const categories = configData?.categories || []
  const showAllTab = configData?.showAllTab !== false
  const filterLabels = configData?.filterLabels || {
    applyFilterBtn: 'Apply filter',
    tagsTitle: 'Filter by Tags',
    searchPlaceholder: 'Search articles...',
    enableTagsFilter: true
  }

  // Fetch all tags for the filter
  const { data: tagsData } = useSWR<any>(
    filterLabels.enableTagsFilter ? `/api/payload/blog-tags?locale=${locale}&limit=200` : null,
    fetcher,
    { revalidateOnFocus: false }
  )
  const allTags = tagsData?.docs || []

  const apiSortOptions = useMemo(() => {
    if (!configData?.sortOptions?.length) {
      return [
        { label: "Newest", value: "publishedAt_desc", isDefault: true },
        { label: "Oldest", value: "publishedAt_asc" },
        { label: "Title (A to Z)", value: "title_asc" },
        { label: "Title (Z to A)", value: "title_desc" },
      ]
    }
    return configData.sortOptions
  }, [configData])

  const defaultSortOption = useMemo(() => {
    return apiSortOptions.find((opt: any) => opt.isDefault) || apiSortOptions[0]
  }, [apiSortOptions])

  const [sortBy, setSortBy] = useState<string>('publishedAt_desc')

  // Tag filters
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const isFromSessionRef = useRef(false)

  useEffect(() => {
    if (allTags.length > 0) {
      const tagParam = searchParamsDict.get('tag')
      const pendingTag = typeof window !== 'undefined' ? sessionStorage.getItem('pendingBlogTag') : null;

      if (pendingTag) {
        // 隐式传参：从 sessionStorage 加载
        isFromSessionRef.current = true
        const paramTags = pendingTag.split(',')
        const matchedTagIds = paramTags.map(param => {
          const matched = allTags.find((t: any) => t.slug === param || String(t.id) === param)
          return matched ? String(matched.id) : null
        }).filter(Boolean) as string[]

        if (matchedTagIds.length > 0) {
          setSelectedTags(matchedTagIds)
          // Update the URL immediately so the user knows a filter is active!
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.set('tag', pendingTag)
          window.history.replaceState(null, '', newUrl.toString())
        }
        sessionStorage.removeItem('pendingBlogTag')
      } else if (tagParam) {
        // URL 传参
        isFromSessionRef.current = false
        const paramTags = tagParam.split(',')
        const matchedTagIds = paramTags.map(param => {
          const matched = allTags.find((t: any) => t.slug === param || String(t.id) === param)
          return matched ? String(matched.id) : null
        }).filter(Boolean) as string[]

        if (matchedTagIds.length > 0) {
          setSelectedTags(matchedTagIds)
        }
      } else if (!isFromSessionRef.current) {
        // 仅当既不是从 session 来，也不是 URL 参数时，才清空
        setSelectedTags([])
      }
    }
  }, [searchParamsDict, allTags]) // 重点：移除了 selectedTags.length 避免无限重置

  // Local UI state
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterSortOpen, setIsFilterSortOpen] = useState(false)
  const filterSortRef = useRef<HTMLDivElement>(null)

  // Reset page when anything else changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, sortBy, selectedTags, searchQuery])

  // Fetch ALL blogs once (front-end filtering is fast, avoids round trips per tab click)
  // Only include blogs whose publishedAt has passed.
  const now = new Date()
  now.setSeconds(0, 0)
  const blogsUrl = `/api/payload/blogs?locale=${locale}&limit=1000&where[status][equals]=published&where[publishedAt][less_than_equal]=${encodeURIComponent(now.toISOString())}`
  const { data: blogsData, isLoading, isValidating } = useSWR<any>(
    blogsUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  )

  const allBlogs = blogsData?.docs || []

  // ============================================================
  // Front-end filtering (instant, no network round trip)
  // ============================================================
  const categoryFilteredBlogs = useMemo(() => {
    if (!selectedCategory) return allBlogs
    return allBlogs.filter((p: any) => {
      // blogs have 'categories' array
      return p.categories?.some((c: any) => {
        const catSlug = typeof c === 'object' ? c.slug : ''
        const catId = typeof c === 'object' ? c.id : String(c)
        return catSlug === selectedCategory || catId === selectedCategory
      })
    })
  }, [allBlogs, selectedCategory])

  const filteredBlogs = useMemo(() => {
    let result = categoryFilteredBlogs

    // Apply tag filters locally
    if (selectedTags.length > 0) {
      result = result.filter((p: any) => {
        return selectedTags.some(tagId =>
          p.tags?.some((t: any) => (typeof t === 'object' ? String(t.id) : String(t)) === tagId)
        )
      })
    }

    if (!searchQuery.trim()) return result

    const query = searchQuery.toLowerCase()
    return result.filter((blog: any) => {
      const name = blog?.title || ""
      return name.toLowerCase().includes(query)
    })
  }, [categoryFilteredBlogs, searchQuery, selectedTags])

  const sortedBlogs = useMemo(() => {
    const list = [...filteredBlogs]
    list.sort((a: any, b: any) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
      const aTitle = a.title || ""
      const bTitle = b.title || ""

      if (sortBy === 'publishedAt_desc') {
        return bTime - aTime
      } else if (sortBy === 'publishedAt_asc') {
        return aTime - bTime
      } else if (sortBy === 'title_asc') {
        return aTitle.localeCompare(bTitle)
      } else if (sortBy === 'title_desc') {
        return bTitle.localeCompare(aTitle)
      }
      return bTime - aTime
    })
    return list
  }, [filteredBlogs, sortBy])

  const pageSize = configData?.pageSize || 12
  const totalPages = Math.ceil(sortedBlogs.length / pageSize) || 1
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedBlogs.slice(start, start + pageSize)
  }, [sortedBlogs, currentPage, pageSize])

  // ============================================================
  // Navigation helpers
  // ============================================================
  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    if ('category' in updates) {
      const newSlug = updates.category
      const basePath = pathname.replace(/\/knowledge-base-blogs\/.*$/, '/knowledge-base-blogs')
      if (newSlug) {
        router.push(`${basePath}/${newSlug}`, { scroll: false })
      } else {
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

    params.delete('page')

    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }, [pathname, router, searchParamsDict, slugMode])

  const handleCategoryChange = useCallback((slug: string) => {
    updateUrl({ category: slug || null })
  }, [updateUrl])

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSortChange = useCallback((newSortBy: string) => {
    setSortBy(newSortBy)
  }, [])

  const toggleTag = (tagId: string) => {
    const next = selectedTags.includes(tagId)
      ? selectedTags.filter(t => t !== tagId)
      : [...selectedTags, tagId]
    
    setSelectedTags(next)

    // Sync with URL
    const nextSlugs = next.map(id => {
      const t = allTags.find((tag: any) => String(tag.id) === id)
      return t ? (t.slug || t.id) : id
    })
    updateUrl({ tag: nextSlugs.length > 0 ? nextSlugs.join(',') : null })
  }

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

  // Derived state for headers
  const categoryTitle = useMemo(() => {
    const defaultTitle = configData?.allArticlesTitle || "All Articles"
    if (!selectedCategory) return defaultTitle
    const found = categories.find((c: any) => c.slug === selectedCategory)
    return found?.name || defaultTitle
  }, [selectedCategory, categories, configData?.allArticlesTitle])

  // Animation variants
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

  if ((isLoading || isConfigLoading) && allBlogs.length === 0) {
    return (
      <div className="min-h-screen bg-[#F6F4ED] pt-32 pb-24 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#ff4848] rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F4ED] font-lexend-deca antialiased" data-header-theme="light">
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
              className="font-orbitron font-medium text-4xl lg:text-6xl text-brand-text-black tracking-wide text-center"
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
              {/* All Articles Tab */}
              {showAllTab && (
                <button
                  onClick={() => handleCategoryChange("")}
                  className={cn(
                    "text-sm font-medium transition-colors pb-1 whitespace-nowrap px-2 font-orbitron",
                    !selectedCategory
                      ? "text-brand-text-black border-b-2 border-[#ff4848]"
                      : "text-gray-500 hover:text-brand-text-black"
                  )}
                >
                  {configData?.allTabLabel || 'All'}
                </button>
              )}

              {/* Category Tabs */}
              {categories.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => handleCategoryChange(c.slug)}
                  className={cn(
                    "text-sm font-medium transition-colors pb-1 whitespace-nowrap px-2 font-orbitron",
                    selectedCategory === c.slug
                      ? "text-brand-text-black border-b-2 border-[#ff4848]"
                      : "text-gray-500 hover:text-brand-text-black"
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
                  (selectedTags.length > 0 || sortBy !== defaultSortOption.value) ? "text-[#ff4848]" : "text-gray-500 hover:text-brand-text-black"
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
                {(selectedTags.length > 0 || sortBy !== defaultSortOption.value) && (
                  <span className="w-2 h-2 rounded-full bg-[#ff4848]"></span>
                )}
              </button>

              {/* Dropdown */}
              {isFilterSortOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 shadow-xl z-50 rounded-xl overflow-hidden max-h-[80vh] flex flex-col">

                  {/* Filter Section (Tags) */}
                  {filterLabels.enableTagsFilter && allTags.length > 0 && (
                    <div className="p-4 border-b border-gray-100 flex-1 overflow-y-auto min-h-[150px]">
                      <span className="text-xs font-bold text-gray-400 tracking-wider">{filterLabels.tagsTitle}</span>
                      <div className="mt-3 space-y-3">
                        {allTags.map((tag: any) => (
                          <label key={tag.id} className="flex items-start gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedTags.includes(String(tag.id))}
                              onChange={() => toggleTag(String(tag.id))}
                              className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#ff4848] focus:ring-[#ff4848] cursor-pointer"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-[#ff4848] transition-colors leading-snug">
                              {tag.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sort Section */}
                  <div className="p-4 bg-gray-50/50">
                    <span className="text-xs font-bold text-gray-400 tracking-wider">{configData?.sortGroupTitle || 'Sort By'}</span>
                    <div className="mt-2 space-y-1">
                      {apiSortOptions.map((option: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => {
                            handleSortChange(option.value)
                            setIsFilterSortOpen(false)
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2.5 text-sm transition-all duration-200 rounded-md",
                            sortBy === option.value
                              ? "bg-white text-black font-semibold shadow-sm"
                              : "text-gray-500 hover:bg-white hover:text-black"
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
            <div className="w-px h-5 bg-gray-200"></div>

            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={filterLabels.searchPlaceholder || "Search articles..."}
                  className="w-full py-1 text-sm bg-transparent focus:outline-none placeholder:text-gray-400 text-brand-text-black"
                />
              </div>
            </div>

            {/* Search Icon */}
            <svg
              className="w-4 h-4 text-gray-400 flex-shrink-0"
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
          {isValidating && allBlogs.length > 0 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
              <div className="w-6 h-6 border-2 border-[#ff4848] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {filteredBlogs.length === 0 && !isLoading ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 w-full"
              >
                <p className="text-brand-text-black text-2xl font-prata mb-3">
                  No articles found
                </p>
                <p className="text-gray-500 text-base">
                  Try adjusting your filters or search query
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={`${selectedCategory}-${sortBy}-${selectedTags.join(',')}-${currentPage}-${searchQuery}`}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-[1072px] mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {paginatedBlogs.map((blog: any, index: number) => (
                  <motion.div
                    key={blog.id}
                    variants={cardVariants}
                    className="h-full"
                  >
                    <BlogCard
                      item={blog}
                      locale={locale}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-16 pt-8 border-t border-gray-200">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed text-brand-text-black hover:text-[#ff4848] transition-colors"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={cn(
                    "w-8 h-8 rounded-full text-sm transition-colors flex items-center justify-center",
                    page === currentPage
                      ? "bg-[#060C14] text-white"
                      : "text-gray-500 hover:bg-gray-100 hover:text-brand-text-black"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed text-brand-text-black hover:text-[#ff4848] transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
