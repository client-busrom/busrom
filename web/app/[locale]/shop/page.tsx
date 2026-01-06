import type { Locale } from "@/i18n.config"
import { ShopPageClient } from "./ShopPageClient"
import { PageScripts } from "@/components/PageScripts"

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
      <ShopPageClient locale={locale} searchParams={resolvedSearchParams} />
      <PageScripts path="/shop" pageType="shop_list" position="footer" />
    </>
  )
}
