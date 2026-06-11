import { SeoKeywordProvider } from "@/components/product-series/SeoKeywordProvider"
import type { Locale } from "@/i18n.config"
import { BlogListPageClient } from "./BlogListPageClient"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getPageMetadata, getNonHomePageSeo } from "@/lib/api/seo-settings"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params

  const defaultMetadata: Metadata = {
    title: "Knowledge Base | Busrom",
    description: "Browse Busrom's latest knowledge base and articles",
  }

  return getPageMetadata('/knowledge-base-blogs', 'knowledge_base_list', locale, defaultMetadata)
}

export default async function BlogsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams

  
  let seoKeywords: string[] = [];
  try {
    const { distributedKeywords } = await getNonHomePageSeo("/knowledge-base-blogs", "knowledge_base_list", locale);
    seoKeywords = distributedKeywords?.imgAlts || [];
  } catch (e) {
    console.error('Failed to fetch seo keywords for', "/knowledge-base-blogs", e);
  }

  return (
    <>
      <SeoKeywordProvider keywords={seoKeywords} startIndex={Math.floor(Math.random() * Math.max(1, seoKeywords.length))} fallback="">
      <PageScripts path="/knowledge-base-blogs" pageType="knowledge_base_list" position="header" />
      <PageScripts path="/knowledge-base-blogs" pageType="knowledge_base_list" position="body_start" />
      <PageSeoInjector path="/knowledge-base-blogs" pageType="knowledge_base_list" locale={locale} />
      <BlogListPageClient locale={locale} searchParams={resolvedSearchParams} slugMode={false} />
      <PageScripts path="/knowledge-base-blogs" pageType="knowledge_base_list" position="footer" />
          </SeoKeywordProvider>
    </>
  )
}
