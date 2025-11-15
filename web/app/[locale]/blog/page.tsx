import type { Locale } from "@/i18n.config"
import { TemplatePage } from "@/components/templates/TemplatePage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog | Busrom",
  description: "Latest news, insights, and updates from Busrom",
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return <TemplatePage locale={locale} slug="blog" template="BLOG_LIST" />
}
