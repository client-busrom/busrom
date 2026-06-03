import { NextRequest, NextResponse } from 'next/server'

// Payload CMS API 基础地址
const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

/**
 * GET /api/shop/config
 * 
 * Fetches the global Shop Page Configuration and populates the category tabs.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || 'en'

    // Fetch Shop Page Config
    const url = `${CMS_URL}/api/globals/shop-page-config?locale=${locale}&depth=2`
    
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 0 }, // 禁用缓存，确保后台排序立即生效
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch shop config' }, { status: response.status })
    }

    const data = await response.json()

    // Normalize slug: handle cases where CMS stores display names or messy slugs.
    const toUrlSlug = (s: string): string =>
      s.trim().toLowerCase().replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '').replace(/[^a-z0-9-]/g, '')

    // Transform categories
    const categories = (data.categoryTabs || []).map((cat: any) => {
      const rawSlug = cat.slug || ''
      // If slug contains spaces or uppercase, it's stored incorrectly — normalize it
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
    
    if (sortSettings.enableSortShopOrder) {
      sortOptions.push({ value: 'shopOrder', label: sortSettings.labelSortShopOrder || 'Recommended', isDefault: sortSettings.defaultSort === 'shopOrder' })
    }
    if (sortSettings.enableSortCreatedAt) {
      sortOptions.push({ value: 'createdAt', label: sortSettings.labelSortCreatedAt || 'Newest Arrivals', isDefault: sortSettings.defaultSort === 'createdAt' })
    }
    if (sortSettings.enableSortNameAsc) {
      sortOptions.push({ value: 'name_asc', label: sortSettings.labelSortNameAsc || 'Name (A to Z)', isDefault: sortSettings.defaultSort === 'name_asc' })
    }
    if (sortSettings.enableSortNameDesc) {
      sortOptions.push({ value: 'name_desc', label: sortSettings.labelSortNameDesc || 'Name (Z to A)', isDefault: sortSettings.defaultSort === 'name_desc' })
    }

    const sortGroupTitle = sortSettings.title || 'Sort By'

    // Map buttonLabels
    const rawButtonLabels = data.buttonLabels || {}
    const buttonLabels = {
      viewDetails: rawButtonLabels.viewDetails || 'View Details',
      sendInquiry: rawButtonLabels.sendInquiry || 'Send Inquiry',
    }

    // Map filterLabels
    const rawFilterLabels = data.filterLabels || {}
    const filterLabels = {
      applyFilterBtn: rawFilterLabels.applyFilterBtn || 'Apply filter',
      searchPlaceholder: rawFilterLabels.searchPlaceholder || 'Search products...',
      title: rawFilterLabels.title || 'Product Status',
      hotLabel: rawFilterLabels.hotLabel || 'Hot Items',
      enableHotFilter: rawFilterLabels.enableHotFilter !== false,
      newLabel: rawFilterLabels.newLabel || 'New Arrivals',
      enableNewFilter: rawFilterLabels.enableNewFilter !== false,
      featuredLabel: rawFilterLabels.featuredLabel || 'Featured',
      enableFeaturedFilter: rawFilterLabels.enableFeaturedFilter !== false,
    }

    return NextResponse.json({
      title: data.title || '',
      pageSize: data.pageSize || 24,
      showAllTab: data.showAllTab !== false,
      allTabLabel: data.allTabLabel || 'All',
      allProductsTitle: data.allProductsTitle || 'All Products',
      categories,
      sortGroupTitle,
      sortOptions,
      filterLabels,
      buttonLabels,
    })
  } catch (error) {
    console.error('[Shop Config API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
