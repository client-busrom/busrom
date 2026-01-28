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
    title: "Our Story | Busrom",
    description: "Learn about Busrom's journey and commitment to excellence",
  }

  return getPageMetadata('/about/story', 'our_story', locale, defaultMetadata)
}

export default async function OurStoryPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return (
    <>
      <PageScripts path="/about/story" pageType="our_story" position="header" />
      <PageScripts path="/about/story" pageType="our_story" position="body_start" />
      <PageSeoInjector path="/about/story" pageType="our_story" locale={locale} />
      <TemplatePage locale={locale} slug="our-story" template="OUR_STORY" />
      <PageScripts path="/about/story" pageType="our_story" position="footer" />
    </>
  )
}
