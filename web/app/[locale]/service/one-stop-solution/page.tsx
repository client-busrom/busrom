import { SeoKeywordProvider } from "@/components/product-series/SeoKeywordProvider"
import type { Locale } from "@/i18n.config"
import { OneStopSolutionTemplate } from "@/components/templates/OneStopSolutionTemplate"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getPageMetadata, getNonHomePageSeo } from "@/lib/api/seo-settings"
import { fetchPageData } from "@/lib/api/pages"
import { parseOneStopData } from "@/lib/parsers/one-stop-solution-parser"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params

  const defaultMetadata: Metadata = {
    title: "One-Stop Solution | Busrom",
    description: "Complete one-stop solution for all your glass hardware needs",
  }

  return getPageMetadata('/service/one-stop-solution', 'one_stop_solution', locale, defaultMetadata)
}

/**
 * OneStopSolutionPage - High-Performance SSR Entry Point
 */
export default async function OneStopSolutionPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  // 1. 服务端获取多维数据 (应用了 ISR 缓存)
  const pageData = await fetchPageData("one-stop-solution", locale)
  
  if (!pageData) {
    notFound()
  }

  // 2. 服务端数据映射与脱水逻辑
  const parsedData = parseOneStopData(pageData, locale)

  
  let seoKeywords: string[] = [];
  try {
    const { distributedKeywords } = await getNonHomePageSeo("/service/one-stop-solution", "one_stop_solution", locale);
    seoKeywords = distributedKeywords?.imgAlts || [];
  } catch (e) {
    console.error('Failed to fetch seo keywords for', "/service/one-stop-solution", e);
  }

  return (
    <>
      <SeoKeywordProvider keywords={seoKeywords} startIndex={Math.floor(Math.random() * Math.max(1, seoKeywords.length))} fallback="">
      <PageScripts path="/service/one-stop-solution" pageType="one_stop_solution" position="header" />
      <PageScripts path="/service/one-stop-solution" pageType="one_stop_solution" position="body_start" />
      <PageSeoInjector path="/service/one-stop-solution" pageType="one_stop_solution" locale={locale} />
      
      {/* 渲染 SSR 模板 */}
      <OneStopSolutionTemplate locale={locale} data={parsedData} />
      
      <PageScripts path="/service/one-stop-solution" pageType="one_stop_solution" position="footer" />
          </SeoKeywordProvider>
    </>
  )
}
