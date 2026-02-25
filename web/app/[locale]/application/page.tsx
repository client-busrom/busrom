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
    title: "Applications | Busrom",
    description: "Explore real-world applications and case studies of Busrom glass hardware solutions",
  }

  return getPageMetadata('/application', 'application', locale, defaultMetadata)
}

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return (
    <>
      <PageScripts path="/application" pageType="application" position="header" />
      <PageScripts path="/application" pageType="application" position="body_start" />
      <PageSeoInjector path="/application" pageType="application" locale={locale} />
      <TemplatePage locale={locale} slug="application" template="APPLICATION" />
      <PageScripts path="/application" pageType="application" position="footer" />
    </>
  )
}
