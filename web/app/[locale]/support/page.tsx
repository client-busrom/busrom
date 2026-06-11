import { SeoKeywordProvider } from "@/components/product-series/SeoKeywordProvider"
import type { Locale } from "@/i18n.config"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getPageMetadata, getNonHomePageSeo } from "@/lib/api/seo-settings"
import type { Metadata } from "next"
import { fetchPageData } from "@/lib/api/pages"
import { parseSupportData } from "@/lib/parsers/support-parser"
import { SupportTemplate } from "@/components/templates/SupportTemplate"
import { notFound } from "next/navigation"
import { PAGE_SLUGS } from "@/lib/constants"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params

  const defaultMetadata: Metadata = {
    title: "Support | Busrom",
    description: "Technical support and assistance for Busrom products",
  }

  return getPageMetadata('/support', PAGE_SLUGS.SUPPORT, locale, defaultMetadata)
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const rawData = await fetchPageData(PAGE_SLUGS.SUPPORT, locale)

  if (!rawData) {
    return notFound()
  }

  const parsedData = parseSupportData(locale, rawData)

  // Resolve applications data for the support applications section
  const allApplications = rawData.applications || []
  const resolvedApplications = parsedData.applications.applicationIds.map(id => {
    const app = allApplications.find((a: any) => String(a.id || a) === String(id))
    if (!app) return null

    // Image priority: slim image -> mainImage -> sceneGallery fallback
    let appImage = app.image || app.mainImage
    if (!appImage && app.sceneGallery?.length > 0) {
      const firstGroup = app.sceneGallery.find((g: any) => g.images?.length > 0)
      if (firstGroup) appImage = firstGroup.images[0]
    }

    return {
      id: app.id,
      title: app.title || app.name || "",
      image: appImage,
      description: app.subtitle || app.shortDescription || ""
    }
  }).filter(Boolean)

  
  let seoKeywords: string[] = [];
  try {
    const { distributedKeywords } = await getNonHomePageSeo("/support", "support", locale);
    seoKeywords = distributedKeywords?.imgAlts || [];
  } catch (e) {
    console.error('Failed to fetch seo keywords for', "/support", e);
  }

  return (
    <>
      <SeoKeywordProvider keywords={seoKeywords} startIndex={Math.floor(Math.random() * Math.max(1, seoKeywords.length))} fallback="">
      <PageScripts path="/support" pageType="support" position="header" />
      <PageScripts path="/support" pageType="support" position="body_start" />
      <PageSeoInjector path="/support" pageType="support" locale={locale} />
      
      <SupportTemplate 
        locale={locale} 
        data={parsedData} 
        resolvedApplications={resolvedApplications as any[]} 
      />
      
      <PageScripts path="/support" pageType="support" position="footer" />
          </SeoKeywordProvider>
    </>
  )
}
