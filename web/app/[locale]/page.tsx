import type { Locale } from "@/i18n.config"
import { HomeContent } from "@/lib/content-data"
import { getUserPreferencesFromCookies } from "@/lib/server/user-preferences"
import { getHomeContent } from "@/lib/api/home"
// 👈 1. 导入新的客户端组件
import { HomePageClient } from "./HomePageClient"

export default async function Home({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params;
  // 2. 从真实后端 API 获取数据
  const preferences = await getUserPreferencesFromCookies()
  const currentLanguage = (preferences.language as Locale) || locale
  const content = await getHomeContent(currentLanguage) as HomeContent;

  // 3. 将所有渲染工作交给 HomePageClient
  //    我们把服务端获取的初始数据和语言传递给它
  return (
    <HomePageClient 
      initialContent={content} 
      currentLanguage={currentLanguage} 
    />
  )
}