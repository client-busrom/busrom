import type { Metadata } from "next"
import type { Locale } from "@/i18n.config"
import { isValidLocale } from "@/i18n.config"
import { Suspense } from "react"
import { HomeContent } from "@/lib/content-data"
import { getHomeRawData } from "@/lib/api/home"
import { parseHomeData } from "@/lib/parsers/home-parser"
import { getHomePageSeo, buildMetadata } from "@/lib/api/seo-settings"
import { getVariantUrl, getCropImageUrl } from "@/lib/utils"
import { PageScripts } from "@/components/PageScripts"
import { SeoKeywordProvider } from "@/components/product-series/SeoKeywordProvider"
import { HomePageClient } from "./HomePageClient"
import { cookies } from "next/headers"
import { getMessages } from "@/i18n.config"

// Force dynamic rendering to ensure fresh content and cookie-based strategy support
export const dynamic = 'force-dynamic'

// Generate SEO Metadata
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  
  if (!isValidLocale(locale as any)) {
    return { title: '404 Not Found' }
  }

  const defaultMetadata: Metadata = {
    title: locale === 'zh' ? 'Busrom - 专业玻璃五金制造商' : 'Busrom - Professional Glass Hardware Manufacturer',
    description: locale === 'zh'
      ? '领先的优质玻璃五金产品制造商，专业生产门把手、铰链和建筑五金。'
      : 'Leading manufacturer of premium glass hardware products for global markets.',
  }

  try {
    const { setting } = await getHomePageSeo(locale)
    return buildMetadata(setting, defaultMetadata)
  } catch {
    return defaultMetadata
  }
}

// Helper: Extract LCP image URLs for preloading
function getLCPImageUrls(content: HomeContent, strategy?: string): string[] {
  const urls: string[] = []
  const firstBanner = content.heroBanner?.[0]
  if (!firstBanner?.images) return urls

  // Preload first 3 images (background + decorative elements)
  for (let i = 0; i < Math.min(3, firstBanner.images.length); i++) {
    const image = firstBanner.images[i]
    // 添加显式类型断言以修复 IDE 中 "never" 的类型推断错误
    const cropData = firstBanner.imageCropDataList?.[i] as any
    if (!image) continue
    
    let url: string | undefined
    
    if (cropData) {
      url = getCropImageUrl(image, cropData)
    } else {
      // 如果没有裁剪数据，默认加载 large 尺寸的原图变体
      url = getVariantUrl(image, 'large', strategy)
    }

    if (url) urls.push(url)
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
  
  // 1. Fetch Raw Data (current locale)
  const rawData = await getHomeRawData(locale)
  
  if (!rawData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Service Temporarily Unavailable</p>
      </div>
    )
  }

  // 1b. Fetch EN data for line-break reference (non-EN locales only)
  const enRawData = locale !== 'en' ? await getHomeRawData('en') : null

  // 2. Fetch SEO Keywords for SSR distribution
  const { distributedKeywords } = await getHomePageSeo(locale)
  const seoKeywords = distributedKeywords.imgAlts || []

  // 3. Parse Data on Server with SEO Keywords + EN reference for auto line-breaking
  const content = parseHomeData(rawData, locale, strategy, seoKeywords, enRawData)
  const lcpImageUrls = getLCPImageUrls(content, strategy)

  // 4. Get Globe Translations
  const messages = await getMessages(locale)
  if (!content.sphere3d) {
    content.sphere3d = {
      title: messages.Sphere3D?.title || "GLOBAL NETWORK",
      description: messages.Sphere3D?.description || "Serving Customers Worldwide From Guangdong, China"
    }
  }

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

      <SeoKeywordProvider distribution={distributedKeywords}>
        <HomePageClient
          initialContent={content}
          currentLanguage={locale}
        />
      </SeoKeywordProvider>
    </>
  )
}

export default async function Home({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  if (!isValidLocale(locale as any)) {
    return null;
  }

  return (
    <>
      <PageScripts path="/" pageType="home" position="header" />
      <PageScripts path="/" pageType="home" position="body_start" />
      
      <Suspense fallback={<HomePageSkeleton />}>
        <HomeContentLoader locale={locale} />
      </Suspense>

      <PageScripts path="/" pageType="home" position="footer" />
    </>
  )
}
