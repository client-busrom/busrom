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
    title: "Service Overview | Busrom",
    description: "Explore Busrom's comprehensive service offerings and solutions",
  }

  return getPageMetadata('/service/overview', 'service_overview', locale, defaultMetadata)
}

export default async function ServiceOverviewPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return (
    <>
      <PageScripts path="/service/overview" pageType="service_overview" position="header" />
      <PageScripts path="/service/overview" pageType="service_overview" position="body_start" />
      <PageSeoInjector path="/service/overview" pageType="service_overview" locale={locale} />
      <TemplatePage locale={locale} slug="service-overview" template="SERVICE_OVERVIEW" />
      <PageScripts path="/service/overview" pageType="service_overview" position="footer" />
    </>
  )
}
