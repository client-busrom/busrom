import { NextRequest, NextResponse } from 'next/server'

const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

/**
 * GET /api/blogs/config
 * 
 * Fetches the global Knowledge Base List Page Configuration and populates the category tabs.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || 'en'

    // Fetch Blog List Page Config
    const url = `${CMS_URL}/api/globals/knowledge-base-list-page-config?locale=${locale}&depth=2`
    
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch blogs list config' }, { status: response.status })
    }

    const data = await response.json()

    const toUrlSlug = (s: string): string =>
      s.trim().toLowerCase().replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '').replace(/[^a-z0-9-]/g, '')

    // Transform categories
    const categories = (data.categoryTabs || []).map((cat: any) => {
      const rawSlug = cat.slug || ''
      const slug = (rawSlug.includes(' ') || rawSlug !== rawSlug.toLowerCase())
        ? toUrlSlug(rawSlug)
        : rawSlug

      return {
        id: cat.id,
        slug,
        name: cat.name,
      }
    })

    // Map flattened sortSettings into the array format expected by the frontend
    const sortSettings = data.sortSettings || {}
    const sortOptions = []
    
    if (sortSettings.enableSortPublishedDesc) {
      sortOptions.push({ value: 'publishedAt_desc', label: sortSettings.labelSortPublishedDesc || 'Newest', isDefault: sortSettings.defaultSort === 'publishedAt_desc' })
    }
    if (sortSettings.enableSortPublishedAsc) {
      sortOptions.push({ value: 'publishedAt_asc', label: sortSettings.labelSortPublishedAsc || 'Oldest', isDefault: sortSettings.defaultSort === 'publishedAt_asc' })
    }
    if (sortSettings.enableSortTitleAsc) {
      sortOptions.push({ value: 'title_asc', label: sortSettings.labelSortTitleAsc || 'Title (A to Z)', isDefault: sortSettings.defaultSort === 'title_asc' })
    }
    if (sortSettings.enableSortTitleDesc) {
      sortOptions.push({ value: 'title_desc', label: sortSettings.labelSortTitleDesc || 'Title (Z to A)', isDefault: sortSettings.defaultSort === 'title_desc' })
    }

    const sortGroupTitle = sortSettings.title || 'Sort By'

    // Map buttonLabels
    const rawButtonLabels = data.buttonLabels || {}
    const buttonLabels = {
      readMore: rawButtonLabels.readMore || 'Read More',
    }

    // Map filterLabels
    const rawFilterLabels = data.filterLabels || {}
    const filterLabels = {
      applyFilterBtn: rawFilterLabels.applyFilterBtn || 'Apply filter',
      searchPlaceholder: rawFilterLabels.searchPlaceholder || 'Search articles...',
      tagsTitle: rawFilterLabels.tagsTitle || 'Filter by Tags',
      enableTagsFilter: rawFilterLabels.enableTagsFilter !== false,
    }

    return NextResponse.json({
      pageSize: data.pageSize || 12,
      showAllTab: data.showAllTab !== false,
      allTabLabel: data.allTabLabel || 'All',
      allProductsTitle: data.allProductsTitle || 'All Articles', // We map it directly to allProductsTitle or a new prop, let's use allArticlesTitle
      allArticlesTitle: data.allProductsTitle || 'All Articles',
      categories,
      sortGroupTitle,
      sortOptions,
      filterLabels,
      buttonLabels,
    })
  } catch (error) {
    console.error('[Blogs Config API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
