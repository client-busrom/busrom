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

  return (
    <>
      <PageScripts path="/contact-us" pageType="contact_us" position="header" />
      <PageScripts path="/contact-us" pageType="contact_us" position="body_start" />
      <PageSeoInjector path="/contact-us" pageType="contact_us" locale={locale} />
      <TemplatePage locale={locale} slug="contact-us" template="CONTACT_US" />
      <PageScripts path="/contact-us" pageType="contact_us" position="footer" />
    </>
  )
}
