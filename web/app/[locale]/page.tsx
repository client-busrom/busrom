import type { Locale } from "@/i18n.config"
import { Suspense } from "react"
import { HomeContent } from "@/lib/content-data"
import { getUserPreferencesFromCookies } from "@/lib/server/user-preferences"
import { getHomeContent } from "@/lib/api/home"
import { HomePageClient } from "./HomePageClient"

// 异步组件：获取首页数据
async function HomeContentLoader({ locale }: { locale: Locale }) {
  const preferences = await getUserPreferencesFromCookies()
  const currentLanguage = (preferences.language as Locale) || locale
  const content = await getHomeContent(currentLanguage) as HomeContent;

  return (
    <HomePageClient
      initialContent={content}
      currentLanguage={currentLanguage}
    />
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