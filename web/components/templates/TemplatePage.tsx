import { notFound } from "next/navigation"
import type { Locale } from "@/i18n.config"
import { fetchPageData } from "@/lib/api/pages"
import { TemplateSwitcher } from "./TemplateSwitcher"

interface TemplatePageProps {
  locale: Locale
  slug: string
  template?: string
}

/**
 * TemplatePage - Server-Side Generic Template Router (SSR)
 * Fetches data on the server and uses TemplateSwitcher to render the correct UI.
 */
export async function TemplatePage({ locale, slug, template: initialTemplate }: TemplatePageProps) {
  // Fetch data directly on the server
  const pageContent = await fetchPageData(slug, locale)

  if (!pageContent) {
    notFound()
  }

  // Ensure the data has the template property for the switcher
  const rawData = {
    ...pageContent,
    template: pageContent.template || initialTemplate
  }

  return (
    <>
      <TemplateSwitcher locale={locale} rawData={rawData} />
    </>
  )
}
