import { SeoKeywordProvider } from "@/components/product-series/SeoKeywordProvider"
import type { Locale } from "@/i18n.config"
import { BlogListClient } from "./BlogListClient"
import { PageScripts } from "@/components/PageScripts"
import { getPageMetadata, getNonHomePageSeo } from "@/lib/api/seo-settings"
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

async function BlogContentLoader({ locale, pageTitle }: { locale: Locale, pageTitle: string }) {
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
      pageTitle={pageTitle}
    />
  )
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  let distribution = undefined;
  let pageTitle = "Blog | Busrom";
  try {
    const { setting, distributedKeywords } = await getNonHomePageSeo("/knowledge-base-blog", "blog_list", locale);
    distribution = distributedKeywords;
    if (setting?.metaTitle) {
      pageTitle = setting.metaTitle;
    }
  } catch (e) {
    console.error('Failed to fetch seo keywords for', "/knowledge-base-blog", e);
  }

  return (
    <>
      <SeoKeywordProvider distribution={distribution}>
      <PageScripts path="/knowledge-base-blog" pageType="blog_list" position="header" />
      <PageScripts path="/knowledge-base-blog" pageType="blog_list" position="body_start" />
            
      <Suspense fallback={
        <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-[#ff4848] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <BlogContentLoader locale={locale} pageTitle={pageTitle} />
      </Suspense>

      <PageScripts path="/knowledge-base-blog" pageType="blog_list" position="footer" />
          </SeoKeywordProvider>
    </>
  )
}
