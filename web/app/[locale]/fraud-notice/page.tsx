import type { Locale } from "@/i18n.config"
import { TemplatePage } from "@/components/templates/TemplatePage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Fraud Notice | Busrom",
  description: "Important fraud prevention notice and security information",
}

export default async function FraudNoticePage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return <TemplatePage locale={locale} slug="fraud-notice" template="FRAUD_NOTICE" />
}
