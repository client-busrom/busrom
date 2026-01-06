import type { Locale } from "@/i18n.config"
import { TemplatePage } from "@/components/templates/TemplatePage"
import { PageScripts } from "@/components/PageScripts"
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

  return (
    <>
      <PageScripts path="/blog" pageType="blog_list" position="header" />
      <PageScripts path="/blog" pageType="blog_list" position="body_start" />
      <TemplatePage locale={locale} slug="blog" template="BLOG_LIST" />
      <PageScripts path="/blog" pageType="blog_list" position="footer" />
    </>
  )
}
