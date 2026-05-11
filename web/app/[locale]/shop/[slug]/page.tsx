import type { Locale } from "@/i18n.config"
import { ProductDetailClient } from "./ProductDetailClient"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getNonHomePageSeo, buildMetadata } from "@/lib/api/seo-settings"
import { getAlternateLanguages } from "@/lib/seo-utils"
import { getProductBySlug } from "@/lib/api/products"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const path = `/shop/${slug}`

  const product = await getProductBySlug(slug, locale)

  if (!product) {
    return {
      title: 'Product Not Found | Busrom',
    }
  }

  const metaTitle = product.meta?.title || product.name || slug
  const metaDescription = product.meta?.description || (product.name ? `${product.name} - High-quality glass hardware from Busrom` : undefined)

  const defaultMetadata: Metadata = {
    title: metaTitle,
    ...(metaDescription ? { description: metaDescription } : {}),
    alternates: {
      languages: getAlternateLanguages(path),
    },
  }

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

  const productData = await getProductBySlug(slug, locale)

  if (!productData) {
    notFound()
  }
  
  // Load localized messages for SSR
  const messages = (await import(`@/messages/${locale}.json`)).default
  const footerHint = messages.shop?.inquiryFooterHint

  return (
    <>
      <PageScripts path={path} pageType="shop_detail" position="header" />
      <PageScripts path={path} pageType="shop_detail" position="body_start" />
      <PageSeoInjector path={path} pageType="shop_detail" locale={locale} />
      <ProductDetailClient locale={locale} slug={slug} initialData={productData} footerHint={footerHint} />
      <PageScripts path={path} pageType="shop_detail" position="footer" />
    </>
  )
}
