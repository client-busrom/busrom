import type { Metadata } from "next"
import type { Locale } from "@/i18n.config"
import { Suspense } from "react"
import { HomeContent } from "@/lib/content-data"
import { getHomeContent } from "@/lib/api/home"
import { getPageMetadata } from "@/lib/api/seo-settings"
import { PageScripts } from "@/components/PageScripts"

// 首页客户端组件 (带轮播)
import { HomePageClient } from "./HomePageClient"

// 强制动态渲染，避免构建时预渲染失败（CMS 不可用）
export const dynamic = 'force-dynamic'

// 动态 SEO 元数据
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params

  // 默认首页元数据
  const defaultMetadata: Metadata = {
    title: locale === 'zh' ? 'Busrom - 专业玻璃五金制造商' : 'Busrom - Professional Glass Hardware Manufacturer',
    description: locale === 'zh'
      ? '领先的优质玻璃五金产品制造商，专业生产门把手、铰链和建筑五金。'
      : 'Leading manufacturer of premium glass hardware products for global markets.',
  }

  // 从 CMS 获取 SEO 设置并合并
  return getPageMetadata('/', 'home', locale, defaultMetadata)
}

// Helper: 从 variant 提取 URL
function getVariantUrl(variant: string | { url?: string } | undefined): string | null {
  if (!variant) return null
  if (typeof variant === 'string') return variant
  return variant.url || null
}

// 提取 LCP 图片 URLs 用于 preload
function getLCPImageUrls(content: HomeContent): string[] {
  const urls: string[] = []
  const firstBanner = content.heroBanner?.[0]
  if (!firstBanner?.images) return urls

  // 预加载前3张图片（背景图 + 两张装饰图）
  for (let i = 0; i < Math.min(3, firstBanner.images.length); i++) {
    const image = firstBanner.images[i]
    if (!image) continue

    const url = getVariantUrl(image.variants?.large)
      || getVariantUrl(image.variants?.desktop)
      || image.url

    if (url) urls.push(url)
  }

  return urls
}

// 首屏骨架屏
function HomePageSkeleton() {
  return (
    <main className="min-h-screen">
      <div className="h-screen min-h-[700px] bg-gradient-to-br from-[#F6F4ED] to-[#E8E4D9] animate-pulse" />
    </main>
  )
}

// 首页内容加载器
async function HomeContentLoader({ locale }: { locale: Locale }) {
  const content = await getHomeContent(locale) as HomeContent;
  const lcpImageUrls = getLCPImageUrls(content)

  return (
    <>
      {/* Preload LCP images */}
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
  const { locale } = await params;

  return (
    <>
      {/* Page-specific scripts for homepage */}
      <PageScripts path="/" pageType="home" position="header" />
      <PageScripts path="/" pageType="home" position="body_start" />

      <Suspense fallback={<HomePageSkeleton />}>
        <HomeContentLoader locale={locale} />
      </Suspense>

      <PageScripts path="/" pageType="home" position="footer" />
    </>
  )
}
