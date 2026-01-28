import type { Locale } from "@/i18n.config"
import { TemplatePage } from "@/components/templates/TemplatePage"
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
    title: "Blog | Busrom",
    description: "Latest news, insights, and updates from Busrom",
  }

  return getPageMetadata('/blog', 'blog_list', locale, defaultMetadata)
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return (
    <>
      <PageScripts path="/blog" pageType="blog_list" position="header" />
      <PageScripts path="/blog" pageType="blog_list" position="body_start" />
      <PageSeoInjector path="/blog" pageType="blog_list" locale={locale} />
      <TemplatePage locale={locale} slug="blog" template="BLOG_LIST" />
      <PageScripts path="/blog" pageType="blog_list" position="footer" />
    </>
  )
}
