import type { Locale } from "@/i18n.config"
import { ProductSeriesPage } from "@/components/products/ProductSeriesPage"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import type { Metadata } from "next"
import { getAlternateLanguages } from "@/lib/seo-utils"

// This will be used for generating static params if needed
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  // Format slug for display (e.g., "glass-standoff" -> "Glass Standoff")
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return {
    title: `${title} | Busrom Products`,
    description: `Explore ${title} - High-quality glass hardware solutions from Busrom`,
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

  return (
    <>
      <PageScripts path={path} pageType="product_series_detail" position="header" />
      <PageScripts path={path} pageType="product_series_detail" position="body_start" />
      <PageSeoInjector path={path} pageType="product_series_detail" locale={locale} />
      <ProductSeriesPage locale={locale} slug={slug} />
      <PageScripts path={path} pageType="product_series_detail" position="footer" />
    </>
  )
}
