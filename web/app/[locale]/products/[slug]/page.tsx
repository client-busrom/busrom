import type { Locale } from "@/i18n.config"
import { ProductSeriesPage } from "@/components/products/ProductSeriesPage"
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
      <ProductSeriesPage locale={locale} slug={slug} initialData={seriesData} />
      <PageScripts path={path} pageType="product_series_detail" position="footer" />
    </>
  )
}
