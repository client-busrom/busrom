import type { Locale } from "@/i18n.config"
import { TemplatePage } from "@/components/templates/TemplatePage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "One-Stop Shop | Busrom",
  description: "Complete one-stop solution for all your glass hardware needs",
}

export default async function OneStopShopPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return <TemplatePage locale={locale} slug="one-stop-shop" template="ONE_STOP_SHOP" />
}
