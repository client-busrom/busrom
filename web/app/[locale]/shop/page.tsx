import type { Locale } from "@/i18n.config"
import { ShopPageClient } from "./ShopPageClient"
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

  return (
    <>
      <PageScripts path="/shop" pageType="shop_list" position="header" />
      <PageScripts path="/shop" pageType="shop_list" position="body_start" />
      <PageSeoInjector path="/shop" pageType="shop_list" locale={locale} />
      <ShopPageClient locale={locale} searchParams={resolvedSearchParams} />
      <PageScripts path="/shop" pageType="shop_list" position="footer" />
    </>
  )
}
