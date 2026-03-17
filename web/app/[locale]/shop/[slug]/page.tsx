import type { Locale } from "@/i18n.config"
import { ProductDetailClient } from "./ProductDetailClient"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getNonHomePageSeo, buildMetadata } from "@/lib/api/seo-settings"
import type { Metadata } from "next"

const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

// Generate metadata for SEO
// Strategy: seoPlugin's meta.title/meta.description as primary SEO (<title> + <meta description>)
// SeoSettings provides robots/canonical/og; its title/description/keywords are distributed
// as long-tail keywords via PageSeoInjector (same pattern as homepage)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const path = `/shop/${slug}`

  // Fetch product's seoPlugin meta fields + name from CMS
  let metaTitle: string | null = null
  let metaDescription: string | null = null
  let productName: string | null = null

  try {
    const res = await fetch(
      `${CMS_URL}/api/products?where[slug][equals]=${slug}&limit=1&locale=${locale}&depth=0`,
      { next: { revalidate: 60 } }
    )
    if (res.ok) {
      const data = await res.json()
      const product = data.docs?.[0]
      if (product) {
        metaTitle = product.meta?.title || null
        metaDescription = product.meta?.description || null
        productName = product.name || null
      }
    }
  } catch (error) {
    console.error('[Product SEO] Failed to fetch product metadata:', error)
  }

  // Primary SEO: seoPlugin meta > product name > slug
  const title = metaTitle || productName || slug
  const description = metaDescription || (productName ? `${productName} - Busrom` : undefined)

  const defaultMetadata: Metadata = {
    title,
    ...(description ? { description } : {}),
  }

  // Merge with SeoSettings for robots/canonical/og only
  // Strip SeoSettings' title/description so they don't override product's own SEO
  // (those values are distributed as long-tail keywords via PageSeoInjector instead)
  const { setting } = await getNonHomePageSeo(path, 'shop_detail', locale)
  if (setting) {
    setting.metaTitle = undefined
    setting.metaDescription = undefined
  }
  return buildMetadata(setting, defaultMetadata)
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  const path = `/shop/${slug}`

  return (
    <>
      <PageScripts path={path} pageType="shop_detail" position="header" />
      <PageScripts path={path} pageType="shop_detail" position="body_start" />
      <PageSeoInjector path={path} pageType="shop_detail" locale={locale} />
      <ProductDetailClient locale={locale} slug={slug} />
      <PageScripts path={path} pageType="shop_detail" position="footer" />
    </>
  )
}
