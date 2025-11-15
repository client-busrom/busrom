import type { Locale } from "@/i18n.config"
import { TemplatePage } from "@/components/templates/TemplatePage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Busrom",
  description: "Busrom's privacy policy and data protection practices",
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return <TemplatePage locale={locale} slug="privacy-policy" template="PRIVACY_POLICY" />
}
