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
    title: "Fraud Notice | Busrom",
    description: "Important fraud prevention notice and security information",
  }

  return getPageMetadata('/fraud-notice', 'fraud_notice', locale, defaultMetadata)
}

export default async function FraudNoticePage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return (
    <>
      <PageScripts path="/fraud-notice" pageType="fraud_notice" position="header" />
      <PageScripts path="/fraud-notice" pageType="fraud_notice" position="body_start" />
      <PageSeoInjector path="/fraud-notice" pageType="fraud_notice" locale={locale} />
      <TemplatePage locale={locale} slug="fraud-notice" template="FRAUD_NOTICE" />
      <PageScripts path="/fraud-notice" pageType="fraud_notice" position="footer" />
    </>
  )
}
