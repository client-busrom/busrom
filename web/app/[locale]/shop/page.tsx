import type { Locale } from "@/i18n.config"
import { ShopPageClient } from "./ShopPageClient"

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams

  return <ShopPageClient locale={locale} searchParams={resolvedSearchParams} />
}
