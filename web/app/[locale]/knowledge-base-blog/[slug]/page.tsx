import { SeoKeywordProvider } from "@/components/product-series/SeoKeywordProvider"
import type { Locale } from "@/i18n.config"
import { BlogDetailClient } from "./BlogDetailClient"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getPageMetadata, getNonHomePageSeo } from "@/lib/api/seo-settings"
import { getBlogBySlug, getBlogSettings } from "@/lib/api/blog"
import { getAlternateLanguages } from "@/lib/seo-utils"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

const CMS_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002')

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const path = `/knowledge-base-blog/${slug}`

  // Format slug for display (e.g., "my-blog-post" -> "My Blog Post")
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const defaultMetadata: Metadata = {
    title: `${title} | Busrom Blog`,
    description: `Read ${title} on Busrom Blog - Industry insights and updates`,
    alternates: {
      languages: getAlternateLanguages(path),
    },
  }

  // Merge with CMS SEO settings
  return getPageMetadata(path, 'blog_detail', locale, defaultMetadata)
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  const path = `/knowledge-base-blog/${slug}`

  // 1. Fetch Blog Data server-side
  const blogData = await getBlogBySlug(slug, locale)
  
  if (!blogData) {
    notFound()
  }

  // 2. Fetch Settings Data server-side
  const configData = await getBlogSettings(locale)

  
  let seoKeywords: string[] = [];
  try {
    const { distributedKeywords } = await getNonHomePageSeo(path, "blog_detail", locale);
    seoKeywords = distributedKeywords?.imgAlts || [];
  } catch (e) {
    console.error('Failed to fetch seo keywords for', path, e);
  }

  return (
    <>
      <SeoKeywordProvider keywords={seoKeywords} startIndex={0} fallback="">
      <PageScripts path={path} pageType="blog_detail" position="header" />
      <PageScripts path={path} pageType="blog_detail" position="body_start" />
      <PageSeoInjector path={path} pageType="blog_detail" locale={locale} />
      <BlogDetailClient locale={locale} slug={slug} blog={blogData} config={configData} />
      <PageScripts path={path} pageType="blog_detail" position="footer" />
          </SeoKeywordProvider>
    </>
  )
}
