import type { Locale } from "@/i18n.config"
import { Suspense } from "react"
import { HomeContent } from "@/lib/content-data"
import { getUserPreferencesFromCookies } from "@/lib/server/user-preferences"
import { getHomeContent } from "@/lib/api/home"
import { HomePageClient } from "./HomePageClient"

// Helper: 从 variant 提取 URL（可能是 string 或 { url: string }）
function getVariantUrl(variant: string | { url?: string } | undefined): string | null {
  if (!variant) return null
  if (typeof variant === 'string') return variant
  return variant.url || null
}

// 提取 LCP 图片 URL 用于 preload
function getLCPImageUrl(content: HomeContent): string | null {
  // LCP 是第一个 HeroBanner 的背景图
  const firstBanner = content.heroBanner?.[0]
  if (!firstBanner?.images?.[0]) return null

  const image = firstBanner.images[0]
  // 优先使用 large (1920px) variant
  return getVariantUrl(image.variants?.large)
    || getVariantUrl(image.variants?.desktop)
    || image.url
}

// 异步组件：获取首页数据
async function HomeContentLoader({ locale }: { locale: Locale }) {
  const preferences = await getUserPreferencesFromCookies()
  const currentLanguage = (preferences.language as Locale) || locale
  const content = await getHomeContent(currentLanguage) as HomeContent;

  // 获取 LCP 图片 URL 并生成 preload link
  const lcpImageUrl = getLCPImageUrl(content)

  return (
    <>
      {/* Preload LCP image - 在 HTML head 中尽早开始加载 */}
      {lcpImageUrl && (
        <link
          rel="preload"
          as="image"
          href={lcpImageUrl}
          // @ts-expect-error - fetchpriority is valid but not in React types yet
          fetchpriority="high"
        />
      )}
      <HomePageClient
        initialContent={content}
        currentLanguage={currentLanguage}
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

  // 使用 Suspense 实现流式渲染
  // 页面框架（Preloader、Header）先渲染，首页内容异步加载
  return (
    <Suspense fallback={null}>
      <HomeContentLoader locale={locale} />
    </Suspense>
  )
}