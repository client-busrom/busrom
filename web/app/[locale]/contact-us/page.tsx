import type { Locale } from "@/i18n.config"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getPageMetadata } from "@/lib/api/seo-settings"
import { fetchPageData } from "@/lib/api/pages"
import { parseContactUsData } from "@/lib/parsers/contact-us-parser"
import { ContactUsTemplate } from "@/components/templates/ContactUsTemplate"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

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

  return getPageMetadata('/contact-us', 'contact_us', locale, defaultMetadata)
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  
  // SSR Data Fetching
  const pageData = await fetchPageData('contact-us', locale)
  
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

  return (
    <>
      <PageScripts path="/contact-us" pageType="contact_us" position="header" />
      <PageScripts path="/contact-us" pageType="contact_us" position="body_start" />
      <PageSeoInjector path="/contact-us" pageType="contact_us" locale={locale} />
      <ContactUsTemplate 
        locale={locale} 
        data={parsedData} 
        ssrData={ssrData}
      />
      <PageScripts path="/contact-us" pageType="contact_us" position="footer" />
    </>
  )
}
