import { SeoKeywordProvider } from "@/components/product-series/SeoKeywordProvider"
import type { Locale } from "@/i18n.config"
import { TemplatePage } from "@/components/templates/TemplatePage"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getPageMetadata, getNonHomePageSeo } from "@/lib/api/seo-settings"
import type { Metadata } from "next"
import { PAGE_TEMPLATES, PAGE_SLUGS } from "@/lib/constants"

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

  return getPageMetadata('/privacy-policy', PAGE_SLUGS.PRIVACY_POLICY, locale, defaultMetadata)
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  
  let distribution = undefined;
  try {
    const { distributedKeywords } = await getNonHomePageSeo("/privacy-policy", "privacy_policy", locale);
    distribution = distributedKeywords;
  } catch (e) {
    console.error('Failed to fetch seo keywords for', "/privacy-policy", e);
  }

  return (
    <>
      <SeoKeywordProvider distribution={distribution}>
      <PageScripts path="/privacy-policy" pageType="privacy_policy" position="header" />
      <PageScripts path="/privacy-policy" pageType="privacy_policy" position="body_start" />
            <TemplatePage locale={locale} slug={PAGE_SLUGS.PRIVACY_POLICY} template={PAGE_TEMPLATES.PRIVACY_POLICY} />
      <PageScripts path="/privacy-policy" pageType="privacy_policy" position="footer" />
          </SeoKeywordProvider>
    </>
  )
}
