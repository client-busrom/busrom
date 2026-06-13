import { SeoKeywordProvider } from "@/components/product-series/SeoKeywordProvider"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { Locale } from "@/i18n.config"
import { fetchPageData } from "@/lib/api/pages"
import { parseFaqData } from "@/lib/parsers/faq-parser"
import { FaqTemplate } from "@/components/templates/FaqTemplate"
import { PAGE_SLUGS } from "@/lib/constants"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getPageMetadata, getNonHomePageSeo } from "@/lib/api/seo-settings"

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

  return getPageMetadata('/faq', 'faq', locale, defaultMetadata)
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  // 1. Fetch raw page data from CMS
  const rawData = await fetchPageData(PAGE_SLUGS.FAQ, locale)
  
  if (!rawData) {
    return notFound()
  }

  // 2. Parse the data into structured sections
  const parsedData = parseFaqData(locale, rawData)

  
  let distribution = undefined;
  try {
    const { distributedKeywords } = await getNonHomePageSeo("/faq", "faq", locale);
    distribution = distributedKeywords;
  } catch (e) {
    console.error('Failed to fetch seo keywords for', "/faq", e);
  }

  return (
    <>
      <SeoKeywordProvider distribution={distribution}>
      <PageScripts path="/faq" pageType="faq" position="header" />
      <PageScripts path="/faq" pageType="faq" position="body_start" />
            
      <FaqTemplate locale={locale} data={parsedData} />
      
      <PageScripts path="/faq" pageType="faq" position="footer" />
          </SeoKeywordProvider>
    </>
  )
}
