import { SeoKeywordProvider } from "@/components/product-series/SeoKeywordProvider"
import type { Locale } from "@/i18n.config"
import { ApplicationTemplate } from "@/components/templates/ApplicationTemplate"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getPageMetadata, getNonHomePageSeo } from "@/lib/api/seo-settings"
import type { Metadata } from "next"
import { fetchPageData } from "@/lib/api/pages"
import { parseApplicationData } from "@/lib/parsers/application-parser"
import { notFound } from "next/navigation"
import { PAGE_SLUGS } from "@/lib/constants"

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params

  const defaultMetadata: Metadata = {
    title: "Applications | Busrom",
    description: "Explore real-world applications and case studies of Busrom glass hardware solutions",
  }

  return getPageMetadata('/application', PAGE_SLUGS.APPLICATION, locale, defaultMetadata)
}

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const rawData = await fetchPageData(PAGE_SLUGS.APPLICATION, locale)

  if (!rawData) {
    return notFound()
  }

  const parsedData = parseApplicationData(locale, rawData)
  
  // Resolve applications data
  // The fetchPageData already returns basic application objects in 'applications' field
  // but we need to map them specifically for the template
  const allApplications = rawData.applications || []
  
  // Map application IDs to objects for the main cases section
  const applications = parsedData.applicationCases.applicationIds.map(id => {
    const app = allApplications.find((a: any) => String(a.id) === String(id))
    if (!app) return null
    // Use mediaData which contains the randomly selected image from the server
    const resolvedImage = rawData.mediaData?.[String(app.id)] || app.image
    
    return {
      id: app.id,
      title: app.name || "",
      image: resolvedImage,
      category: app.category || "Application"
    }
  }).filter(Boolean)

  // Map application IDs to objects for the 'more' section
  const moreApplications = parsedData.moreApplications.applicationIds.map(id => {
    const app = allApplications.find((a: any) => String(a.id) === String(id))
    if (!app) return null
    const resolvedImage = rawData.mediaData?.[String(app.id)] || app.image

    return {
      id: String(app.id),
      title: app.name || "",
      image: resolvedImage
    }
  }).filter(Boolean)

  
  let distribution = undefined;
  try {
    const { distributedKeywords } = await getNonHomePageSeo("/application", "application", locale);
    distribution = distributedKeywords;
  } catch (e) {
    console.error('Failed to fetch seo keywords for', "/application", e);
  }

  return (
    <>
      <SeoKeywordProvider distribution={distribution}>
      <PageScripts path="/application" pageType="application" position="header" />
      <PageScripts path="/application" pageType="application" position="body_start" />
            
      <ApplicationTemplate 
        locale={locale} 
        data={parsedData} 
        applications={applications as any[]}
        moreApplications={moreApplications}
      />
      
      <PageScripts path="/application" pageType="application" position="footer" />
          </SeoKeywordProvider>
    </>
  )
}
