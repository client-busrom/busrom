import type { Locale } from "@/i18n.config"
import { PageDetailClient } from "./PageDetailClient"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getPageMetadata } from "@/lib/api/seo-settings"
import type { Metadata } from "next"

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const path = `/page/${slug}`

  // Format slug for display (e.g., "custom-page" -> "Custom Page")
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const defaultMetadata: Metadata = {
    title: `${title} | Busrom`,
    description: `${title} - Busrom Industrial Glass Hardware Solutions`,
  }

  // Merge with CMS SEO settings
  return getPageMetadata(path, 'custom_page', locale, defaultMetadata)
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  const path = `/page/${slug}`

  return (
    <>
      <PageScripts path={path} pageType="custom_page" position="header" />
      <PageScripts path={path} pageType="custom_page" position="body_start" />
      <PageSeoInjector path={path} pageType="custom_page" locale={locale} />
      <PageDetailClient locale={locale} slug={slug} />
      <PageScripts path={path} pageType="custom_page" position="footer" />
    </>
  )
}
