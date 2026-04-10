import type { Locale } from "@/i18n.config"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getPageMetadata } from "@/lib/api/seo-settings"
import type { Metadata } from "next"
import { fetchPageData } from "@/lib/api/pages"
import { parseOurStoryData } from "@/lib/parsers/our-story-parser"
import { OurStoryTemplate } from "@/components/templates/OurStoryTemplate"
import { notFound } from "next/navigation"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params

  const defaultMetadata: Metadata = {
    title: "Our Story | Busrom",
    description: "Learn about Busrom's journey and commitment to excellence",
  }

  return getPageMetadata('/about/story', 'our_story', locale, defaultMetadata)
}

export default async function OurStoryPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const rawData = await fetchPageData("our-story", locale)

  if (!rawData) {
    return notFound()
  }

  const parsedData = parseOurStoryData(locale, rawData)

  // Resolve applications data for the story applications section
  const allApplications = rawData.applications || []
  const applications = parsedData.applications.applicationIds.map(id => {
    const app = allApplications.find((a: any) => String(a.id) === String(id))
    if (!app) return null

    // Image priority: slim image -> mainImage -> sceneGallery fallback
    let appImage = app.image || app.mainImage
    if (!appImage && app.sceneGallery?.length > 0) {
      const firstGroup = app.sceneGallery.find((g: any) => g.images?.length > 0)
      if (firstGroup) appImage = firstGroup.images[0]
    }

    return {
      id: app.id,
      title: app.title || app.name || "",
      image: appImage,
      description: app.subtitle || app.shortDescription || ""
    }
  }).filter(Boolean)

  return (
    <>
      <PageScripts path="/about/story" pageType="our_story" position="header" />
      <PageScripts path="/about/story" pageType="our_story" position="body_start" />
      <PageSeoInjector path="/about/story" pageType="our_story" locale={locale} />
      
      <OurStoryTemplate 
        locale={locale} 
        data={parsedData} 
        applications={applications as any[]} 
      />
      
      <PageScripts path="/about/story" pageType="our_story" position="footer" />
    </>
  )
}
