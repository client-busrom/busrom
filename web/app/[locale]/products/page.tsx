import type { Locale } from "@/i18n.config"
import { ProductsPageClient } from "./ProductsPageClient"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getPageMetadata } from "@/lib/api/seo-settings"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params

  const defaultMetadata: Metadata = {
    title: "Products | Busrom",
    description: "Explore Busrom's comprehensive range of high-quality stainless steel glass hardware solutions",
  }

  return getPageMetadata('/products', 'product_series_list', locale, defaultMetadata)
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  // Page ID from CMS
  const pageId = "be2d59b9-dc31-4298-9d33-a956eadd52de"

  return (
    <>
      <PageScripts path="/products" pageType="product_series_list" position="header" />
      <PageScripts path="/products" pageType="product_series_list" position="body_start" />
      <PageSeoInjector path="/products" pageType="product_series_list" locale={locale} />
      <ProductsPageClient locale={locale} pageId={pageId} />
      <PageScripts path="/products" pageType="product_series_list" position="footer" />
    </>
  )
}
