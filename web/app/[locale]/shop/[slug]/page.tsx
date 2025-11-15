import type { Locale } from "@/i18n.config"
import { ProductDetailClient } from "./ProductDetailClient"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params

  return <ProductDetailClient locale={locale} slug={slug} />
}
