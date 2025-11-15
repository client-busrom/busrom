import type { Locale } from "@/i18n.config"
import { TemplatePage } from "@/components/templates/TemplatePage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Story | Busrom",
  description: "Learn about Busrom's journey and commitment to excellence",
}

export default async function OurStoryPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return <TemplatePage locale={locale} slug="our-story" template="OUR_STORY" />
}
