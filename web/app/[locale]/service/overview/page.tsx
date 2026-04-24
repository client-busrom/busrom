import type { Locale } from "@/i18n.config"
import { ServiceOverviewTemplate } from "@/components/templates/ServiceOverviewTemplate"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getPageMetadata } from "@/lib/api/seo-settings"
import { fetchPageData } from "@/lib/api/pages"
import { parseServiceOverviewData } from "@/lib/parsers/service-overview-parser"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PAGE_SLUGS } from "@/lib/constants"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params

  const defaultMetadata: Metadata = {
    title: "Service Overview | Busrom",
    description: "Explore Busrom's comprehensive service offerings and solutions",
  }

  return getPageMetadata('/service/overview', PAGE_SLUGS.SERVICE_OVERVIEW, locale, defaultMetadata)
}

/**
 * ServiceOverviewPage - High-Performance SSR Entry Point
 */
export default async function ServiceOverviewPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  // 1. 服务端获取数据
  const pageData = await fetchPageData(PAGE_SLUGS.SERVICE_OVERVIEW, locale)
  
  if (!pageData) {
    notFound()
  }

  // 2. 服务端运行解析逻辑 (原本在 Template 里的 useMemo)
  const parsedData = parseServiceOverviewData(pageData)

  return (
    <>
      <PageScripts path="/service/overview" pageType="service_overview" position="header" />
      <PageScripts path="/service/overview" pageType="service_overview" position="body_start" />
      <PageSeoInjector path="/service/overview" pageType="service_overview" locale={locale} />
      
      {/* 直接渲染模板，不再经过 CSR 的 TemplatePage */}
      <ServiceOverviewTemplate locale={locale} data={parsedData} />
      
      <PageScripts path="/service/overview" pageType="service_overview" position="footer" />
    </>
  )
}
