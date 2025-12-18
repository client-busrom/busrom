import type { Locale } from "@/i18n.config"
import { PageDetailClient } from "./PageDetailClient"
import type { Metadata } from "next"

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  // Format slug for display (e.g., "custom-page" -> "Custom Page")
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return {
    title: `${title} | Busrom`,
    description: `${title} - Busrom Industrial Glass Hardware Solutions`,
  }
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params

  return <PageDetailClient locale={locale} slug={slug} />
}
