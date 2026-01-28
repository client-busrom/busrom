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
    title: "Privacy Policy | Busrom",
    description: "Busrom's privacy policy and data protection practices",
  }

  return getPageMetadata('/privacy-policy', 'privacy_policy', locale, defaultMetadata)
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return (
    <>
      <PageScripts path="/privacy-policy" pageType="privacy_policy" position="header" />
      <PageScripts path="/privacy-policy" pageType="privacy_policy" position="body_start" />
      <PageSeoInjector path="/privacy-policy" pageType="privacy_policy" locale={locale} />
      <TemplatePage locale={locale} slug="privacy-policy" template="PRIVACY_POLICY" />
      <PageScripts path="/privacy-policy" pageType="privacy_policy" position="footer" />
    </>
  )
}
