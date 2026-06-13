import { SeoKeywordProvider } from "@/components/product-series/SeoKeywordProvider"
import type { Locale } from "@/i18n.config"
import { notFound } from "next/navigation"
import { PageScripts } from "@/components/PageScripts"
import { getPageMetadata, getNonHomePageSeo } from "@/lib/api/seo-settings"
import { fetchPageData } from "@/lib/api/pages"
import { TemplateSwitcher } from "@/components/templates/TemplateSwitcher"
import type { Metadata } from "next"

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const path = `/page/${slug}`
  
  const pageData = await fetchPageData(slug, locale)
  
  if (!pageData) {
    return {
      title: "Page Not Found | Busrom",
    }
  }

  const title = pageData.title || slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const defaultMetadata: Metadata = {
    title: `${title} | Busrom`,
    description: `${title} - Busrom Industrial Glass Hardware Solutions`,
  }

  return getPageMetadata(path, 'custom_page', locale, defaultMetadata)
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  const path = `/page/${slug}`
  
  // SSR Data Fetching
  const rawData = await fetchPageData(slug, locale)
  
  if (!rawData) {
    notFound()
  }

  const pageType = rawData.template?.toLowerCase() || "custom_page"

  
  let distribution = undefined;
  try {
    const { distributedKeywords } = await getNonHomePageSeo(path, pageType, locale);
    distribution = distributedKeywords;
  } catch (e) {
    console.error('Failed to fetch seo keywords for', path, e);
  }

  return (
    <>
      <SeoKeywordProvider distribution={distribution}>
      <PageScripts path={path} pageType={pageType} position="header" />
      <PageScripts path={path} pageType={pageType} position="body_start" />
            
      {/* Universal Template Switcher with SSR Data */}
      <TemplateSwitcher locale={locale} rawData={rawData} />
      
      <PageScripts path={path} pageType={pageType} position="footer" />
          </SeoKeywordProvider>
    </>
  )
}
