import type { Locale } from "@/i18n.config"
import { OemOdmTemplate } from "@/components/templates/OemOdmTemplate"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getPageMetadata } from "@/lib/api/seo-settings"
import { fetchPageData } from "@/lib/api/pages"
import { parseOemOdmData } from "@/lib/parsers/oem-odm-parser"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params

  const defaultMetadata: Metadata = {
    title: "OEM/ODM Services | Busrom",
    description: "Custom OEM and ODM solutions for your glass hardware requirements",
  }

  return getPageMetadata('/service/oem-odm', 'oem_odm', locale, defaultMetadata)
}

export default async function OemOdmPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  // SSR Data Fetching
  const pageContent = await fetchPageData("oem-odm", locale)

  if (!pageContent) {
    notFound()
  }

  // Server-side parsing
  const parsedData = parseOemOdmData(pageContent, locale)

  return (
    <>
      <PageScripts path="/service/oem-odm" pageType="oem_odm" position="header" />
      <PageScripts path="/service/oem-odm" pageType="oem_odm" position="body_start" />
      <PageSeoInjector path="/service/oem-odm" pageType="oem_odm" locale={locale} />
      <OemOdmTemplate locale={locale} data={parsedData} />
      <PageScripts path="/service/oem-odm" pageType="oem_odm" position="footer" />
    </>
  )
}
