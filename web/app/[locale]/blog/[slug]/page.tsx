import type { Locale } from "@/i18n.config"
import { BlogDetailClient } from "./BlogDetailClient"
import { PageScripts } from "@/components/PageScripts"
import type { Metadata } from "next"

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  // Format slug for display (e.g., "my-blog-post" -> "My Blog Post")
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return {
    title: `${title} | Busrom Blog`,
    description: `Read ${title} on Busrom Blog - Industry insights and updates`,
  }
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
      <BlogDetailClient locale={locale} slug={slug} />
      <PageScripts path={path} pageType="blog_detail" position="footer" />
    </>
  )
}
