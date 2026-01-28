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
    title: "Support | Busrom",
    description: "Technical support and assistance for Busrom products",
  }

  return getPageMetadata('/support', 'support', locale, defaultMetadata)
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return (
    <>
      <PageScripts path="/support" pageType="support" position="header" />
      <PageScripts path="/support" pageType="support" position="body_start" />
      <PageSeoInjector path="/support" pageType="support" locale={locale} />
      <TemplatePage locale={locale} slug="support" template="SUPPORT" />
      <PageScripts path="/support" pageType="support" position="footer" />
    </>
  )
}
