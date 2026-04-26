import type { Metadata } from "next"
import type { Locale } from "@/i18n.config"
import { Suspense } from "react"
import { HomeContent } from "@/lib/content-data"
import { getHomeRawData } from "@/lib/api/home"
import { parseHomeData } from "@/lib/parsers/home-parser"
import { getHomePageSeo, buildMetadata } from "@/lib/api/seo-settings"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { HomePageClient } from "./HomePageClient"
import { cookies } from "next/headers"

// Force dynamic rendering to ensure fresh content and cookie-based strategy support
export const dynamic = 'force-dynamic'

// Generate SEO Metadata
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params

  const defaultMetadata: Metadata = {
    title: locale === 'zh' ? 'Busrom - 专业玻璃五金制造商' : 'Busrom - Professional Glass Hardware Manufacturer',
    description: locale === 'zh'
      ? '领先的优质玻璃五金产品制造商，专业生产门把手、铰链和建筑五金。'
      : 'Leading manufacturer of premium glass hardware products for global markets.',
  }

  const { setting } = await getHomePageSeo(locale)
  return buildMetadata(setting, defaultMetadata)
}

// Helper: Extract LCP image URLs for preloading
function getLCPImageUrls(content: HomeContent): string[] {
  const urls: string[] = []
  const firstBanner = content.heroBanner?.[0]
  if (!firstBanner?.images) return urls

  // Preload first 3 images (background + decorative elements)
  for (let i = 0; i < Math.min(3, firstBanner.images.length); i++) {
    const image = firstBanner.images[i]
    if (!image) continue
    const url = image.variants?.large || image.variants?.desktop || image.url
    if (typeof url === 'string') urls.push(url)
  }

  return urls
}

// Skeleton loading state
function HomePageSkeleton() {
  return (
    <main className="min-h-screen">
      <div className="h-screen min-h-[700px] bg-gradient-to-br from-[#F6F4ED] to-[#E8E4D9] animate-pulse" />
    </main>
  )
}

// Home content loader with SSR Parser
async function HomeContentLoader({ locale }: { locale: Locale }) {
  const cookieStore = await cookies()
  const strategy = cookieStore.get('cdn_strategy')?.value
  
  // 1. Fetch Raw Data
  const rawData = await getHomeRawData(locale)
  
  if (!rawData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Service Temporarily Unavailable</p>
      </div>
    )
  }

  // 2. Fetch SEO Keywords for SSR distribution
  const { distributedKeywords } = await getHomePageSeo(locale)
  const seoKeywords = distributedKeywords.imgAlts || []

  // 3. Parse Data on Server with SEO Keywords
  const content = parseHomeData(rawData, locale, strategy, seoKeywords)
  const lcpImageUrls = getLCPImageUrls(content)

  return (
    <>
      {/* Preload critical LCP images */}
      {lcpImageUrls.map((url) => (
        <link
          key={url}
          rel="preload"
          as="image"
          href={url}
          fetchPriority="high"
        />
      ))}

      <HomePageClient
        initialContent={content}
        currentLanguage={locale}
      />
    </>
  )
}

export default async function Home({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return (
    <>
      <PageScripts path="/" pageType="home" position="header" />
      <PageScripts path="/" pageType="home" position="body_start" />
      <PageSeoInjector path="/" pageType="home" locale={locale} isHomePage={true} />

      <Suspense fallback={<HomePageSkeleton />}>
        <HomeContentLoader locale={locale} />
      </Suspense>

      <PageScripts path="/" pageType="home" position="footer" />
    </>
  )
}
