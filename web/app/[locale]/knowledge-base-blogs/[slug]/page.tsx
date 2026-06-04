import type { Locale } from "@/i18n.config"
import { BlogListPageClient } from "../BlogListPageClient"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getPageMetadata } from "@/lib/api/seo-settings"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale, slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params

  const defaultMetadata: Metadata = {
    title: `Knowledge Base - ${slug} | Busrom`,
    description: `Browse Busrom's latest knowledge base and articles in ${slug}`,
  }

  // We could fetch category specific metadata if needed, for now use standard
  return getPageMetadata(`/knowledge-base-blogs/${slug}`, 'knowledge_base_category', locale, defaultMetadata)
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale, slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams

  return (
    <>
      <PageScripts path={`/knowledge-base-blogs`} pageType="knowledge_base_list" position="header" />
      <PageScripts path={`/knowledge-base-blogs`} pageType="knowledge_base_list" position="body_start" />
      <PageSeoInjector path={`/knowledge-base-blogs`} pageType="knowledge_base_list" locale={locale} />
      <BlogListPageClient locale={locale} searchParams={resolvedSearchParams} slugMode={true} />
      <PageScripts path={`/knowledge-base-blogs`} pageType="knowledge_base_list" position="footer" />
    </>
  )
}
