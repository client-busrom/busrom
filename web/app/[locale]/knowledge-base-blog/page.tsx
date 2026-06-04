import type { Locale } from "@/i18n.config"
import { BlogListClient } from "./BlogListClient"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getPageMetadata } from "@/lib/api/seo-settings"
import { getBlogSettings, getInitialBlogs } from "@/lib/api/blog"
import { getMessages } from "@/i18n.config"
import type { Metadata } from "next"
import { Suspense } from "react"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params

  const defaultMetadata: Metadata = {
    title: "Blog | Busrom",
    description: "Latest news, insights, and updates from Busrom",
  }

  return getPageMetadata('/knowledge-base-blog', 'blog_list', locale, defaultMetadata)
}

async function BlogContentLoader({ locale }: { locale: Locale }) {
  const [config, blogs, messages] = await Promise.all([
    getBlogSettings(locale),
    getInitialBlogs(locale),
    getMessages(locale)
  ])

  const allLabel = messages?.blog?.all || "all"

  return (
    <BlogListClient 
      locale={locale} 
      initialConfig={config} 
      initialBlogs={blogs} 
      allLabel={allLabel}
    />
  )
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return (
    <>
      <PageScripts path="/knowledge-base-blog" pageType="blog_list" position="header" />
      <PageScripts path="/knowledge-base-blog" pageType="blog_list" position="body_start" />
      <PageSeoInjector path="/knowledge-base-blog" pageType="blog_list" locale={locale} />
      
      <Suspense fallback={
        <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-[#ff4848] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <BlogContentLoader locale={locale} />
      </Suspense>

      <PageScripts path="/knowledge-base-blog" pageType="blog_list" position="footer" />
    </>
  )
}
