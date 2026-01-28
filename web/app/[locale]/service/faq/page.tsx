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
    title: "FAQ | Busrom",
    description: "Frequently asked questions about Busrom products and services",
  }

  return getPageMetadata('/service/faq', 'faq', locale, defaultMetadata)
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return (
    <>
      <PageScripts path="/service/faq" pageType="faq" position="header" />
      <PageScripts path="/service/faq" pageType="faq" position="body_start" />
      <PageSeoInjector path="/service/faq" pageType="faq" locale={locale} />
      <TemplatePage locale={locale} slug="faq" template="FAQ" />
      <PageScripts path="/service/faq" pageType="faq" position="footer" />
    </>
  )
}
