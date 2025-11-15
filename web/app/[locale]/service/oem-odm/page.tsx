import type { Locale } from "@/i18n.config"
import { TemplatePage } from "@/components/templates/TemplatePage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "OEM/ODM Services | Busrom",
  description: "Custom OEM and ODM solutions for your glass hardware requirements",
}

export default async function OemOdmPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return <TemplatePage locale={locale} slug="oem-odm" template="OEM_ODM" />
}
