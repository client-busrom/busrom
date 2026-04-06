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
    title: "One-Stop Solution | Busrom",
    description: "Complete one-stop solution for all your glass hardware needs",
  }

  return getPageMetadata('/service/one-stop-solution', 'one_stop_solution', locale, defaultMetadata)
}

export default async function OneStopSolutionPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return (
    <>
      <PageScripts path="/service/one-stop-solution" pageType="one_stop_solution" position="header" />
      <PageScripts path="/service/one-stop-solution" pageType="one_stop_solution" position="body_start" />
      <PageSeoInjector path="/service/one-stop-solution" pageType="one_stop_solution" locale={locale} />
      <TemplatePage locale={locale} slug="one-stop-solution" template="ONE_STOP_SOLUTION" />
      <PageScripts path="/service/one-stop-solution" pageType="one_stop_solution" position="footer" />
    </>
  )
}
