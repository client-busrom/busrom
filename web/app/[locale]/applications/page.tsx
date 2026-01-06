import type { Locale } from "@/i18n.config"
import { TemplatePage } from "@/components/templates/TemplatePage"
import { PageScripts } from "@/components/PageScripts"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Applications | Busrom",
  description: "Explore real-world applications and case studies of Busrom glass hardware solutions",
}

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return (
    <>
      <PageScripts path="/applications" pageType="applications" position="header" />
      <PageScripts path="/applications" pageType="applications" position="body_start" />
      <TemplatePage locale={locale} slug="applications" template="APPLICATION_LIST" />
      <PageScripts path="/applications" pageType="applications" position="footer" />
    </>
  )
}
