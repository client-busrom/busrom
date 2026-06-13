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
    title: "Fraud Notice | Busrom",
    description: "Important fraud prevention notice and security information",
  }

  return getPageMetadata('/fraud-notice', PAGE_SLUGS.FRAUD_NOTICE, locale, defaultMetadata)
}

export default async function FraudNoticePage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  
  let distribution = undefined;
  try {
    const { distributedKeywords } = await getNonHomePageSeo("/fraud-notice", "fraud_notice", locale);
    distribution = distributedKeywords;
  } catch (e) {
    console.error('Failed to fetch seo keywords for', "/fraud-notice", e);
  }

  return (
    <>
      <SeoKeywordProvider distribution={distribution}>
      <PageScripts path="/fraud-notice" pageType="fraud_notice" position="header" />
      <PageScripts path="/fraud-notice" pageType="fraud_notice" position="body_start" />
            <TemplatePage locale={locale} slug={PAGE_SLUGS.FRAUD_NOTICE} template={PAGE_TEMPLATES.FRAUD_NOTICE} />
      <PageScripts path="/fraud-notice" pageType="fraud_notice" position="footer" />
          </SeoKeywordProvider>
    </>
  )
}
