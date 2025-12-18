import type { Locale } from "@/i18n.config"
import { BlogDetailClient } from "./BlogDetailClient"
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

  return <BlogDetailClient locale={locale} slug={slug} />
}
