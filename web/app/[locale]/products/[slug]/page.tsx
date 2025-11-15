import type { Locale } from "@/i18n.config"
import { ProductSeriesPage } from "@/components/products/ProductSeriesPage"
import type { Metadata } from "next"

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
  }
}

export default async function ProductSeriesDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params

  return <ProductSeriesPage locale={locale} slug={slug} />
}
