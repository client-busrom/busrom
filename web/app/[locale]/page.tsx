import type { Locale } from "@/i18n.config"
import { Suspense } from "react"
import { HomeContent } from "@/lib/content-data"
import { getHomeContent } from "@/lib/api/home"

// 首页客户端组件 (带轮播)
import { HomePageClient } from "./HomePageClient"

// 强制动态渲染，避免构建时预渲染失败（CMS 不可用）
export const dynamic = 'force-dynamic'

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
          // @ts-expect-error - fetchpriority is valid but not in React types yet
          fetchpriority="high"
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
    <Suspense fallback={<HomePageSkeleton />}>
      <HomeContentLoader locale={locale} />
    </Suspense>
  )
}
