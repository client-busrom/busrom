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

    // Transform categories
    const categories = (data.categoryTabs || []).map((cat: any) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      // localizedName is already handled by Payload auto-localization if we pass locale
    }))

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
