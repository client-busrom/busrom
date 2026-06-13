import { SeoKeywordProvider } from "@/components/product-series/SeoKeywordProvider"
import type { Locale } from "@/i18n.config"
import { ProductSeriesDetailClient } from "./ProductSeriesDetailClient"
import { PageScripts } from "@/components/PageScripts"
import type { Metadata } from "next"
import { getProductSeriesBySlug } from "@/lib/api/product-series"
import { getNonHomePageSeo, buildMetadata } from "@/lib/api/seo-settings"
import { notFound } from "next/navigation"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const series = await getProductSeriesBySlug(slug, locale)
  const path = `/products/${slug}`
  
  // SEO Protection: If not translated, set to noindex
  let robots: any = undefined
  if (locale !== 'en') {
    const checkSeries = await getProductSeriesBySlug(slug, locale)
    if (!checkSeries || !checkSeries.name) {
      robots = { index: false, follow: true }
    }
  }

  if (!series) {
    return {
      title: 'Not Found | Busrom Products',
    }
  }

  const defaultMetadata: Metadata = {
    title: `${series.name} | Busrom Products`,
    description: series.description || `Explore ${series.name} - High-quality glass hardware solutions from Busrom`,
  }

  try {
    const { setting } = await getNonHomePageSeo(path, 'product_series_detail', locale)
    const metadata = buildMetadata(setting, defaultMetadata, 'https://www.busromhouse.com', path)
    if (robots) metadata.robots = robots
    return metadata
  } catch {
    if (robots) defaultMetadata.robots = robots
    return defaultMetadata
  }
}

export default async function ProductSeriesDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  const path = `/products/${slug}`

  const seriesData = await getProductSeriesBySlug(slug, locale)

  if (!seriesData) {
    notFound()
  }

  let distribution = undefined;
  try {
    const { distributedKeywords } = await getNonHomePageSeo(path, "product_series_detail", locale);
    distribution = distributedKeywords;
  } catch (e) {
    console.error('Failed to fetch seo keywords for', path, e);
  }

  return (
    <>
      <SeoKeywordProvider distribution={distribution}>
      <PageScripts path={path} pageType="product_series_detail" position="header" />
      <PageScripts path={path} pageType="product_series_detail" position="body_start" />
            <ProductSeriesDetailClient locale={locale} slug={slug} initialData={seriesData} seoKeywords={seoKeywords} />
      <PageScripts path={path} pageType="product_series_detail" position="footer" />
          </SeoKeywordProvider>
    </>
  )
}
