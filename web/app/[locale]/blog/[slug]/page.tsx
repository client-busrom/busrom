import type { Locale } from "@/i18n.config"
import { BlogDetailClient } from "./BlogDetailClient"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getPageMetadata } from "@/lib/api/seo-settings"
import type { Metadata } from "next"

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const path = `/blog/${slug}`

  // Format slug for display (e.g., "my-blog-post" -> "My Blog Post")
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const defaultMetadata: Metadata = {
    title: `${title} | Busrom Blog`,
    description: `Read ${title} on Busrom Blog - Industry insights and updates`,
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
  const path = `/blog/${slug}`

  return (
    <>
      <PageScripts path={path} pageType="blog_detail" position="header" />
      <PageScripts path={path} pageType="blog_detail" position="body_start" />
      <PageSeoInjector path={path} pageType="blog_detail" locale={locale} />
      <BlogDetailClient locale={locale} slug={slug} />
      <PageScripts path={path} pageType="blog_detail" position="footer" />
    </>
  )
}
