import type { Locale } from "@/i18n.config"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getPageMetadata } from "@/lib/api/seo-settings"
import type { Metadata } from "next"
import { fetchPageData } from "@/lib/api/pages"
import { parseProductOverviewData } from "@/lib/parsers/product-overview-parser"
import { ProductOverviewTemplate } from "@/components/templates/ProductOverviewTemplate"
import { notFound } from "next/navigation"
import { PAGE_SLUGS } from "@/lib/constants"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params

  const defaultMetadata: Metadata = {
    title: "Product Overview | Busrom",
    description: "Explore our range of professional project solutions and products",
  }

  return getPageMetadata('/products', PAGE_SLUGS.PRODUCT_OVERVIEW, locale, defaultMetadata)
}

export default async function ProductOverviewPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  
  // Use the slug 'product-overview' as requested
  const rawData = await fetchPageData(PAGE_SLUGS.PRODUCT_OVERVIEW, locale)

  if (!rawData) {
    return notFound()
  }

  const parsedData = parseProductOverviewData(locale, rawData)

  return (
    <>
      <PageScripts path="/products" pageType="product_overview" position="header" />
      <PageScripts path="/products" pageType="product_overview" position="body_start" />
      <PageSeoInjector path="/products" pageType="product_overview" locale={locale} />
      
      <ProductOverviewTemplate 
        locale={locale} 
        data={parsedData} 
      />
      
      <PageScripts path="/products" pageType="product_overview" position="footer" />
    </>
  )
}
