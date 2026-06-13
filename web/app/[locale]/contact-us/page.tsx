import { SeoKeywordProvider } from "@/components/product-series/SeoKeywordProvider"
import type { Locale } from "@/i18n.config"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getPageMetadata, getNonHomePageSeo } from "@/lib/api/seo-settings"
import { fetchPageData } from "@/lib/api/pages"
import { parseContactUsData } from "@/lib/parsers/contact-us-parser"
import { ContactUsTemplate } from "@/components/templates/ContactUsTemplate"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PAGE_SLUGS } from "@/lib/constants"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params

  const defaultMetadata: Metadata = {
    title: "Contact Us | Busrom",
    description: "Get in touch with Busrom for high-quality stainless steel glass hardware solutions",
  }

  return getPageMetadata('/contact-us', PAGE_SLUGS.CONTACT_US, locale, defaultMetadata)
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  
  // SSR Data Fetching
  const pageData = await fetchPageData(PAGE_SLUGS.CONTACT_US, locale)
  
  if (!pageData) {
    notFound()
  }

  // Parse data for the template
  const parsedData = parseContactUsData(pageData.content || pageData.contentTranslation, pageData.mediaData)

  // Pass everything to the template
  const ssrData = {
    products: pageData.products,
    applications: pageData.applications,
    formConfig: pageData.formConfig
  }

  
  let distribution = undefined;
  try {
    const { distributedKeywords } = await getNonHomePageSeo("/contact-us", "contact_us", locale);
    distribution = distributedKeywords;
  } catch (e) {
    console.error('Failed to fetch seo keywords for', "/contact-us", e);
  }

  return (
    <>
      <SeoKeywordProvider distribution={distribution}>
      <PageScripts path="/contact-us" pageType="contact_us" position="header" />
      <PageScripts path="/contact-us" pageType="contact_us" position="body_start" />
            <ContactUsTemplate 
        locale={locale} 
        data={parsedData} 
        ssrData={ssrData}
      />
      <PageScripts path="/contact-us" pageType="contact_us" position="footer" />
          </SeoKeywordProvider>
    </>
  )
}
