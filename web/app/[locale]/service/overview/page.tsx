import type { Locale } from "@/i18n.config"
import { TemplatePage } from "@/components/templates/TemplatePage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Service Overview | Busrom",
  description: "Explore Busrom's comprehensive service offerings and solutions",
}

export default async function ServiceOverviewPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return <TemplatePage locale={locale} slug="service-overview" template="SERVICE_OVERVIEW" />
}
