import type { Locale } from "@/i18n.config"
import { TemplatePage } from "@/components/templates/TemplatePage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ | Busrom",
  description: "Frequently asked questions about Busrom products and services",
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return <TemplatePage locale={locale} slug="faq" template="FAQ" />
}
