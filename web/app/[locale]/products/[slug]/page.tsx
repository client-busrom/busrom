import type { Locale } from "@/i18n.config"
import { ProductSeriesDetailClient } from "./ProductSeriesDetailClient"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import type { Metadata } from "next"
import { getAlternateLanguages } from "@/lib/seo-utils"
import { getProductSeriesBySlug } from "@/lib/api/product-series"
import { notFound } from "next/navigation"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const series = await getProductSeriesBySlug(slug, locale)
  
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

  return {
    title: `${series.name} | Busrom Products`,
    description: series.description || `Explore ${series.name} - High-quality glass hardware solutions from Busrom`,
    alternates: {
      languages: getAlternateLanguages(`/products/${slug}`),
    },
    ...(robots ? { robots } : {})
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

  return (
    <>
      <PageScripts path={path} pageType="product_series_detail" position="header" />
      <PageScripts path={path} pageType="product_series_detail" position="body_start" />
      <PageSeoInjector path={path} pageType="product_series_detail" locale={locale} />
      <ProductSeriesDetailClient locale={locale} slug={slug} initialData={seriesData} />
      <PageScripts path={path} pageType="product_series_detail" position="footer" />
    </>
  )
}
