import { SeoKeywordProvider } from "@/components/product-series/SeoKeywordProvider"
import type { Locale } from "@/i18n.config"
import { ShopPageClient } from "./ShopPageClient"
import { PageScripts } from "@/components/PageScripts"
import { getPageMetadata, getNonHomePageSeo } from "@/lib/api/seo-settings"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params

  const defaultMetadata: Metadata = {
    title: "Shop | Busrom",
    description: "Browse and shop Busrom's premium glass hardware products",
  }

  return getPageMetadata('/shop', 'shop_list', locale, defaultMetadata)
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams

  
  let distribution = undefined;
  try {
    const { distributedKeywords } = await getNonHomePageSeo("/shop", "shop_list", locale);
    distribution = distributedKeywords;
  } catch (e) {
    console.error('Failed to fetch seo keywords for', "/shop", e);
  }

  return (
    <>
      <SeoKeywordProvider distribution={distribution}>
      <PageScripts path="/shop" pageType="shop_list" position="header" />
      <PageScripts path="/shop" pageType="shop_list" position="body_start" />
            <ShopPageClient locale={locale} searchParams={resolvedSearchParams} slugMode={false} />
      <PageScripts path="/shop" pageType="shop_list" position="footer" />
          </SeoKeywordProvider>
    </>
  )
}
