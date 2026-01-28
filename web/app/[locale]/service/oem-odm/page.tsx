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

  return (
    <>
      <PageScripts path="/service/oem-odm" pageType="oem_odm" position="header" />
      <PageScripts path="/service/oem-odm" pageType="oem_odm" position="body_start" />
      <PageSeoInjector path="/service/oem-odm" pageType="oem_odm" locale={locale} />
      <TemplatePage locale={locale} slug="oem-odm" template="OEM_ODM" />
      <PageScripts path="/service/oem-odm" pageType="oem_odm" position="footer" />
    </>
  )
}
