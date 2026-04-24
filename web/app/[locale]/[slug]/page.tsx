import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { Locale } from "@/i18n.config"
import { fetchPageData } from "@/lib/api/pages"
import { getPageMetadata } from "@/lib/api/seo-settings"
import { TemplateSwitcher } from "@/components/templates/TemplateSwitcher"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"

interface DynamicPageProps {
  params: Promise<{ locale: Locale; slug: string }>
}

/**
 * Universal Dynamic Route - Handles any slug by matching its template in the CMS
 */
export async function generateMetadata({
  params,
}: DynamicPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  
  // Try to fetch page data to get title/SEO info
  const pageData = await fetchPageData(slug, locale)
  
  if (!pageData) {
    return {
      title: "Page Not Found | Busrom",
    }
  }

  const defaultMetadata: Metadata = {
    title: `${pageData.title || pageData.name} | Busrom`,
    description: "Busrom Industrial Glass Hardware Solutions",
  }

  return getPageMetadata(`/${slug}`, slug, locale, defaultMetadata)
}

export default async function UniversalDynamicPage({
  params,
}: DynamicPageProps) {
  const { locale, slug } = await params
  
  // Fetch page data from CMS
  const rawData = await fetchPageData(slug, locale)
  
  if (!rawData) {
    notFound()
  }

  // Common scripts and SEO injection
  const path = `/${slug}`
  const pageType = rawData.template?.toLowerCase() || "custom_page"

  return (
    <>
      <PageScripts path={path} pageType={pageType} position="header" />
      <PageScripts path={path} pageType={pageType} position="body_start" />
      <PageSeoInjector path={path} pageType={pageType} locale={locale} />
      
      <TemplateSwitcher locale={locale} rawData={rawData} />
      
      <PageScripts path={path} pageType={pageType} position="footer" />
    </>
  )
}
