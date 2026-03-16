import { NextRequest, NextResponse } from 'next/server'

// Payload CMS API 基础地址
const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3002'

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
      next: { revalidate: 60 }, // Cache for 60 seconds
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

    return NextResponse.json({
      pageSize: data.pageSize || 24,
      showAllTab: data.showAllTab !== false,
      categories: categories
    })
  } catch (error) {
    console.error('[Shop Config API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
