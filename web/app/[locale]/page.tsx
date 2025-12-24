import type { Locale } from "@/i18n.config"
import { Suspense } from "react"
import { HomeContent } from "@/lib/content-data"
import { getHomeContent } from "@/lib/api/home"
import { HomePageClient } from "./HomePageClient"

// Helper: 从 variant 提取 URL（可能是 string 或 { url: string }）
function getVariantUrl(variant: string | { url?: string } | undefined): string | null {
  if (!variant) return null
  if (typeof variant === 'string') return variant
  return variant.url || null
}

// 提取 LCP 图片 URLs 用于 preload
// Lighthouse 显示 LCP 元素是 HeroBanner 的装饰图，需要预加载多张关键图片
function getLCPImageUrls(content: HomeContent): string[] {
  const urls: string[] = []
  const firstBanner = content.heroBanner?.[0]
  if (!firstBanner?.images) return urls

  // 预加载前3张图片（背景图 + 两张装饰图）
  for (let i = 0; i < Math.min(3, firstBanner.images.length); i++) {
    const image = firstBanner.images[i]
    if (!image) continue

    // 优先使用 large (1920px) variant
    const url = getVariantUrl(image.variants?.large)
      || getVariantUrl(image.variants?.desktop)
      || image.url

    if (url) urls.push(url)
  }

  return urls
}

// 异步组件：获取首页数据
async function HomeContentLoader({ locale }: { locale: Locale }) {
  // URL 中的 locale 优先于 cookie，确保用户访问 /zh 时获取中文内容
  const content = await getHomeContent(locale) as HomeContent;

  // 获取 LCP 图片 URLs 并生成 preload links
  const lcpImageUrls = getLCPImageUrls(content)

  return (
    <>
      {/* Preload LCP images - 在 HTML head 中尽早开始加载首屏关键图片 */}
      {/* 注意: preload 只是告诉浏览器提前下载，实际的 <img> 元素仍需要 fetchpriority */}
      {lcpImageUrls.map((url, index) => (
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

// 首屏骨架屏 - 在数据加载时显示，避免空白导致 Speed Index 慢
function HomePageSkeleton() {
  return (
    <main className="min-h-screen">
      {/* Hero Banner 骨架 */}
      <div className="h-screen min-h-[700px] bg-gradient-to-br from-[#F6F4ED] to-[#E8E4D9] animate-pulse" />
    </main>
  )
}

export default async function Home({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params;

  // 使用 Suspense 实现流式渲染
  // 骨架屏先显示，首页内容异步加载
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomeContentLoader locale={locale} />
    </Suspense>
  )
}