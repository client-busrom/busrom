/**
 * Home Page Content API
 *
 * Unified API for fetching all home page content from Keystone CMS
 * Uses the new /api/home REST endpoint for better performance
 */

import type { HomeContent } from '@/lib/content-data'
import { convertToCDNUrl } from '@/lib/cdn-url'

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'

// Helper function to convert Media URL to CDN URL
function getMediaUrl(fileUrl: string | null | undefined): string {
  if (!fileUrl) return ''
  // Convert the fileUrl to CDN URL (handles both MinIO and S3)
  return convertToCDNUrl(fileUrl)
}

/**
 * Fetch all home page content for a specific locale
 *
 * @param locale - Language code (e.g., 'en', 'zh', 'es')
 * @returns Complete home page content
 *
 * @example
 * ```typescript
 * const homeContent = await getHomeContent('en')
 * ```
 */
export async function getHomeContent(locale: string = 'en'): Promise<HomeContent> {
  try {
    const response = await fetch(`${CMS_URL}/api/home?locale=${locale}`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch home content: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Helper function to convert media ID to ImageObject
    const toImageObject = (mediaId: string | null | undefined, alt: string = ''): { url: string; altText: string } => {
      return {
        url: getMediaUrl(mediaId),
        altText: alt
      }
    }

    // Transform API response to match HomeContent type
    // Extract carousel items from the locale-specific items object
    const rawCarouselItems = data.productSeriesCarousel?.items?.[locale] || []
    const carouselItems = rawCarouselItems.map((item: any, index: number) => ({
      key: item.linkUrl || `item-${index}`,
      order: index,
      name: item.title || '',
      image: toImageObject(item.image, item.title),
      sceneImage: toImageObject(item.sceneImage, item.title),
      buttonText: item.buttonText || 'Learn More',
      href: item.linkUrl || '#',
    }))

    // Transform Brand Advantages from {advantages: [{text, icon}]} to {advantages: string[], icons: string[], image}
    const brandAdvantages = data.brandAdvantages ? {
      advantages: data.brandAdvantages.advantages?.map((item: any) => item.text) || [],
      icons: data.brandAdvantages.advantages?.map((item: any) => item.icon) || [],
      image: { url: '', altText: '' }, // Backend doesn't provide this yet
    } : null

    // Transform SimpleCta images from Media ID[] to ImageObject[]
    const simpleCta = data.simpleCta ? {
      ...data.simpleCta,
      images: (data.simpleCta.images || []).map((id: string) => toImageObject(id, data.simpleCta.title)),
    } : null

    // Transform OemOdm images from Media IDs to ImageObjects
    const oemOdm = data.oemOdm ? {
      oem: {
        title: data.oemOdm.oem.title,
        bgImage: toImageObject(data.oemOdm.oem.bgImage, 'OEM Background'),
        image: toImageObject(data.oemOdm.oem.image, 'OEM'),
        description: data.oemOdm.oem.description || [],
      },
      odm: {
        title: data.oemOdm.odm.title,
        bgImage: toImageObject(data.oemOdm.odm.bgImage, 'ODM Background'),
        image: toImageObject(data.oemOdm.odm.image, 'ODM'),
        description: data.oemOdm.odm.description || [],
      },
    } : null

    // Transform SeriesIntro images
    // Backend already returns URLs in the images array, just need to wrap them in ImageObject
    const seriesIntro = (data.seriesIntro || []).map((item: any) => ({
      ...item,
      images: (item.images || []).map((url: string) => ({
        url: url,
        altText: item.title
      })),
    }))

    // Transform WhyChooseBusrom images
    const whyChooseBusrom = data.whyChoose ? {
      ...data.whyChoose,
      reasons: (data.whyChoose.reasons || []).map((reason: any) => ({
        ...reason,
        image: toImageObject(reason.image, reason.title),
      })),
    } : null

    // Transform QuoteSteps images
    const quoteSteps = data.quoteSteps ? {
      ...data.quoteSteps,
      steps: (data.quoteSteps.steps || []).map((step: any) => ({
        ...step,
        image: toImageObject(step.image, step.text),
      })),
    } : null

    // Transform MainForm - map images array to image1/image2 and placeholders to flat fields
    const mainForm = data.mainForm ? {
      placeholderName: data.mainForm.placeholders?.name || '',
      placeholderEmail: data.mainForm.placeholders?.email || '',
      placeholderWhatsapp: data.mainForm.placeholders?.whatsapp || '',
      placeholderCompany: data.mainForm.placeholders?.company || '',
      placeholderMessage: data.mainForm.placeholders?.message || '',
      placeholderVerify: data.mainForm.placeholders?.verify || '',
      buttonText: data.mainForm.buttonText || '',
      designTextLeft: data.mainForm.designText?.left || '',
      designTextRight: data.mainForm.designText?.right || '',
      image1: data.mainForm.images?.[0] ? toImageObject(data.mainForm.images[0], 'Main Form Left') : null,
      image2: data.mainForm.images?.[1] ? toImageObject(data.mainForm.images[1], 'Main Form Right') : null,
    } : null

    // Transform BrandValue from items array to named properties
    const brandValue = data.brandValue ? {
      title: data.brandValue.title || '',
      subtitle: data.brandValue.subtitle || '',
      param1: data.brandValue.items?.[0] ? {
        ...data.brandValue.items[0],
        image: toImageObject(data.brandValue.items[0].image, data.brandValue.items[0].title),
      } : { title: '', description: '', image: { url: '', altText: '' } },
      param2: data.brandValue.items?.[1] ? {
        ...data.brandValue.items[1],
        image: toImageObject(data.brandValue.items[1].image, data.brandValue.items[1].title),
      } : { title: '', description: '', image: { url: '', altText: '' } },
      slogan: data.brandValue.items?.[2] ? {
        ...data.brandValue.items[2],
        image: toImageObject(data.brandValue.items[2].image, data.brandValue.items[2].title),
      } : { title: '', description: '', image: { url: '', altText: '' } },
      value: data.brandValue.items?.[3] ? {
        ...data.brandValue.items[3],
        image: toImageObject(data.brandValue.items[3].image, data.brandValue.items[3].title),
      } : { title: '', description: '', image: { url: '', altText: '' } },
      vision: data.brandValue.items?.[4] ? {
        ...data.brandValue.items[4],
        image: toImageObject(data.brandValue.items[4].image, data.brandValue.items[4].title),
      } : { title: '', description: '', image: { url: '', altText: '' } },
    } : null

    // Transform ServiceFeatures images
    const serviceFeatures = data.serviceFeatures ? {
      ...data.serviceFeatures,
      features: (data.serviceFeatures.features || []).map((feature: any) => ({
        ...feature,
        images: (feature.images || []).map((id: string) => toImageObject(id, feature.title)),
      })),
    } : null

    // Transform HeroBanner images
    const heroBanner = (data.heroBanner || []).map((item: any) => ({
      ...item,
      images: (item.images || []).map((id: string) => toImageObject(id, item.title)),
    }))

    return {
      locale: data.locale,
      heroBanner,
      productSeriesCarousel: carouselItems,
      serviceFeatures,
      sphere3d: {}, // Empty object as per spec
      simpleCta,
      seriesIntro,
      featuredProducts: data.featuredProducts || null,
      brandAdvantages,
      oemOdm,
      quoteSteps,
      mainForm,
      whyChooseBusrom,
      caseStudies: data.caseStudies || null,
      brandAnalysis: data.brandAnalysis ? {
        analysis: {
          title: data.brandAnalysis.analysisTitle || '',
          title2: data.brandAnalysis.analysisTitle2 || '',
          text: data.brandAnalysis.analysisText || '',
          text2: data.brandAnalysis.analysisText2 || '',
        },
        centers: (data.brandAnalysis.centers || []).map((center: any) => ({
          title: center.title || '',
          description: center.description || '',
          largeImage: getMediaUrl(center.largeImage),
          smallImage: getMediaUrl(center.smallImage),
        })),
      } : null,
      brandValue,
      // TODO: Add Footer API
      footer: {
        logo: { url: '', altText: '' },
        description: '',
        columns: [],
        bottomLinks: [],
        certifications: [],
        contact: {
          address: '',
          email: '',
          phone: '',
          whatsapp: '',
        },
        copyright: '',
        locale,
      },
    }
  } catch (error) {
    console.error('Error fetching home content:', error)
    throw error
  }
}
