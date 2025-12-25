/**
 * Home Page Content API
 *
 * Unified API for fetching all home page content from Payload CMS
 * Uses the new /api/home REST endpoint for better performance
 */

import type { HomeContent } from '@/lib/content-data'
import { convertToCDNUrl } from '@/lib/cdn-url'

// Use runtime environment variable for server-side API calls
// Prefer internal URL (from CMS_GRAPHQL_URL) over external CMS_URL for better performance in ECS
// For Payload CMS, default port is 3002 in development
const CMS_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || 'http://localhost:3002')

// Helper function to convert Media URL to CDN URL
function getMediaUrl(fileUrl: string | null | undefined): string {
  if (!fileUrl) return '/images/placeholder.jpg'
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
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch home content: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Helper function to convert media data to ImageObject
    // Supports both string URL (legacy) and object with url + variants + cropFocalPoint (new format)
    const toImageObject = (mediaData: string | { url: string; variants?: Record<string, string>; cropFocalPoint?: { x: number; y: number }; altText?: string } | null | undefined, alt: string = ''): { url: string; altText: string; variants?: Record<string, string>; cropFocalPoint?: { x: number; y: number } } => {
      if (!mediaData) {
        return { url: '/images/placeholder.jpg', altText: alt }
      }
      // Handle string URL (legacy format)
      if (typeof mediaData === 'string') {
        return {
          url: getMediaUrl(mediaData),
          altText: alt
        }
      }
      // Handle object with url, variants, and cropFocalPoint
      // Convert all variant URLs to CDN URLs
      const variants = mediaData.variants ? Object.fromEntries(
        Object.entries(mediaData.variants).map(([key, url]) => [key, getMediaUrl(url)])
      ) : undefined
      return {
        url: getMediaUrl(mediaData.url),
        altText: mediaData.altText || alt,
        variants,
        cropFocalPoint: mediaData.cropFocalPoint
      }
    }

    // Transform API response to match HomeContent type
    // Extract carousel items - backend may return items as array or as { [locale]: [...] }
    const carouselItemsData = data.productSeriesCarousel?.items
    // Handle both formats: direct array or locale-keyed object
    const rawCarouselItems = Array.isArray(carouselItemsData)
      ? carouselItemsData
      : (carouselItemsData?.[locale] || carouselItemsData?.en || [])

    // Helper to fix legacy /product/ URLs to /products/
    const fixProductUrl = (url: string | null | undefined): string => {
      if (!url) return '#'
      // Convert /product/xxx to /products/xxx
      return url.replace(/^\/product\//, '/products/')
    }

    const carouselItems = (Array.isArray(rawCarouselItems) ? rawCarouselItems : []).map((item: any, index: number) => ({
      key: item.linkUrl || `item-${index}`,
      order: index,
      name: item.title || '',
      image: toImageObject(item.image, item.title),
      sceneImage: toImageObject(item.sceneImage, item.title),
      buttonText: item.buttonText || 'Learn More',
      href: fixProductUrl(item.linkUrl),
    }))

    // Transform Brand Advantages from {advantages: [{text, icon}], image} to {advantages: string[], icons: string[], image}
    const brandAdvantages = {
      advantages: data.brandAdvantages?.advantages?.map((item: any) => item.text) || [],
      icons: data.brandAdvantages?.advantages?.map((item: any) => item.icon) || [],
      image: data.brandAdvantages?.image ? toImageObject(data.brandAdvantages.image, 'Brand Advantages') : { url: '', altText: '' },
    }

    // Transform SimpleCta images - now receives full objects with variants from CMS
    const simpleCta = data.simpleCta ? {
      ...data.simpleCta,
      images: (data.simpleCta.images || []).map((imgData: any) => toImageObject(imgData, data.simpleCta.title)),
    } : null

    // Transform OemOdm images from Media IDs to ImageObjects
    const oemOdm = {
      oem: {
        title: data.oemOdm?.oem?.title || '',
        bgImage: toImageObject(data.oemOdm?.oem?.bgImage, 'OEM Background'),
        image: toImageObject(data.oemOdm?.oem?.image, 'OEM'),
        description: data.oemOdm?.oem?.description || [],
      },
      odm: {
        title: data.oemOdm?.odm?.title || '',
        bgImage: toImageObject(data.oemOdm?.odm?.bgImage, 'ODM Background'),
        image: toImageObject(data.oemOdm?.odm?.image, 'ODM'),
        description: data.oemOdm?.odm?.description || [],
      },
    }

    // Transform SeriesIntro images - now receives full objects with variants from CMS
    const seriesIntro = (data.seriesIntro || []).map((item: any) => ({
      ...item,
      images: (item.images || []).map((imgData: any) => toImageObject(imgData, item.title)),
    }))

    // Transform WhyChooseBusrom images
    const whyChooseBusrom = data.whyChooseBusrom ? {
      ...data.whyChooseBusrom,
      reasons: (data.whyChooseBusrom.reasons || []).map((reason: any) => ({
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

    // Transform MainForm - map images array to image1/image2
    const mainForm = {
      placeholderName: data.mainForm?.labelName || data.mainForm?.placeholderName || 'Name',
      placeholderEmail: data.mainForm?.labelEmail || data.mainForm?.placeholderEmail || 'Email',
      placeholderWhatsapp: data.mainForm?.labelWhatsapp || data.mainForm?.placeholderWhatsapp || 'WhatsApp',
      placeholderCompany: data.mainForm?.labelCompany || data.mainForm?.placeholderCompany || 'Company',
      placeholderMessage: data.mainForm?.labelMessage || data.mainForm?.placeholderMessage || 'Message',
      placeholderVerify: data.mainForm?.placeholderVerify || 'Verify',
      buttonText: data.mainForm?.buttonText || 'Submit',
      submittingText: data.mainForm?.submittingText || 'Submitting...',
      successMessage: data.mainForm?.successMessage || 'Submitted successfully! We will contact you soon.',
      errorRequired: data.mainForm?.errorRequired || 'Please fill in name and email',
      errorNetwork: data.mainForm?.errorNetwork || 'Network error, please try again',
      errorCaptcha: data.mainForm?.errorCaptcha || 'Please complete the captcha verification',
      designTextLeft: data.mainForm?.designTextLeft || '',
      designTextRight: data.mainForm?.designTextRight || '',
      image1: data.mainForm?.images?.[0] ? toImageObject(data.mainForm.images[0], 'Main Form Left') : null,
      image2: data.mainForm?.images?.[1] ? toImageObject(data.mainForm.images[1], 'Main Form Right') : null,
    }

    // Transform BrandValue from items array to named properties
    const defaultValueItem = { title: '', description: '', image: { url: '', altText: '' } }
    const brandValue = {
      title: data.brandValue?.title || '',
      subtitle: data.brandValue?.subtitle || '',
      param1: data.brandValue?.items?.[0] ? {
        ...data.brandValue.items[0],
        image: toImageObject(data.brandValue.items[0].image, data.brandValue.items[0].title),
      } : defaultValueItem,
      param2: data.brandValue?.items?.[1] ? {
        ...data.brandValue.items[1],
        image: toImageObject(data.brandValue.items[1].image, data.brandValue.items[1].title),
      } : defaultValueItem,
      slogan: data.brandValue?.items?.[2] ? {
        ...data.brandValue.items[2],
        image: toImageObject(data.brandValue.items[2].image, data.brandValue.items[2].title),
      } : defaultValueItem,
      value: data.brandValue?.items?.[3] ? {
        ...data.brandValue.items[3],
        image: toImageObject(data.brandValue.items[3].image, data.brandValue.items[3].title),
      } : defaultValueItem,
      vision: data.brandValue?.items?.[4] ? {
        ...data.brandValue.items[4],
        image: toImageObject(data.brandValue.items[4].image, data.brandValue.items[4].title),
      } : defaultValueItem,
    }

    // Transform ServiceFeatures images - now receives full objects with variants from CMS
    const serviceFeatures = data.serviceFeatures ? {
      ...data.serviceFeatures,
      features: (data.serviceFeatures.features || []).map((feature: any) => ({
        ...feature,
        images: (feature.images || []).map((imgData: any) => toImageObject(imgData, feature.title)),
      })),
    } : null

    // Transform HeroBanner images (now receives { url, cropFocalPoint } objects from CMS)
    const heroBanner = (data.heroBanner || []).map((item: any) => ({
      ...item,
      images: (item.images || []).map((imgData: any) => toImageObject(imgData, item.title)),
    }))

    // Default empty structures for non-nullable fields
    const defaultFeaturedProducts = {
      title: '',
      description: '',
      viewAllButton: '',
      categories: '',
      series: []
    }
    const defaultCaseStudies = {
      title: '',
      description: '',
      applications: []
    }
    const defaultBrandAnalysis = {
      analysis: { title: '', title2: '', text: '', text2: '' },
      centers: []
    }
    const defaultServiceFeatures = {
      title: '',
      subtitle: '',
      features: []
    }
    const defaultSimpleCta = {
      title: '',
      title2: '',
      subtitle: '',
      description: '',
      buttonText: '',
      images: []
    }
    const defaultQuoteSteps = {
      title: '',
      title2: '',
      subtitle: '',
      description: '',
      steps: []
    }
    const defaultWhyChooseBusrom = {
      title: '',
      title2: '',
      reasons: []
    }
    // Transform Footer
    const footer = data.footer ? {
      form: {
        title: data.footer.form?.title || '',
        placeholders: {
          name: data.footer.form?.placeholders?.name || '',
          email: data.footer.form?.placeholders?.email || '',
          message: data.footer.form?.placeholders?.message || '',
        },
        buttonText: data.footer.form?.buttonText || '',
      },
      contact: {
        title: data.footer.contact?.title || '',
        emailLabel: 'Email', // Static label
        email: data.footer.contact?.email || '',
        afterSalesLabel: 'Phone', // Static label
        afterSales: data.footer.contact?.phone || '',
        whatsappLabel: 'WhatsApp', // Static label
        whatsapp: data.footer.contact?.whatsapp || '',
      },
      notice: {
        title: data.footer.notice?.title || '',
        lines: data.footer.notice?.text ? [data.footer.notice.text] : [],
      },
      column3Menus: [], // Navigation menus handled separately
      column4Menus: [], // Navigation menus handled separately
    } : {
      form: { title: '', placeholders: { name: '', email: '', message: '' }, buttonText: '' },
      contact: { title: '', emailLabel: '', email: '', afterSalesLabel: '', afterSales: '', whatsappLabel: '', whatsapp: '' },
      notice: { title: '', lines: [] },
      column3Menus: [],
      column4Menus: []
    }

    return {
      locale: data.locale,
      heroBanner,
      productSeriesCarousel: carouselItems,
      serviceFeatures: serviceFeatures || defaultServiceFeatures,
      sphere3d: {}, // Empty object as per spec
      simpleCta: simpleCta || defaultSimpleCta,
      seriesIntro,
      featuredProducts: data.featuredProducts || defaultFeaturedProducts,
      brandAdvantages,
      oemOdm,
      quoteSteps: quoteSteps || defaultQuoteSteps,
      mainForm,
      whyChooseBusrom: whyChooseBusrom || defaultWhyChooseBusrom,
      caseStudies: data.caseStudies || defaultCaseStudies,
      brandAnalysis: data.brandAnalysis ? {
        analysis: {
          title: data.brandAnalysis.brandNameAnalysis?.titlePart1 || '',
          title2: data.brandAnalysis.brandNameAnalysis?.titlePart2 || '',
          text: data.brandAnalysis.brandNameAnalysis?.textPart1 || '',
          text2: data.brandAnalysis.brandNameAnalysis?.textPart2 || '',
        },
        centers: (data.brandAnalysis.centers || []).map((center: any) => {
          const largeImg = toImageObject(center.largeImage, center.title)
          const smallImg = toImageObject(center.smallImage, center.title)
          return {
            title: center.title || '',
            description: center.description || '',
            // Keep full image objects for variant support, but also provide URL for backward compat
            largeImage: largeImg.url,
            smallImage: smallImg.url,
            largeImageData: largeImg,
            smallImageData: smallImg,
          }
        }),
      } : defaultBrandAnalysis,
      brandValue,
      footer,
    }
  } catch (error) {
    console.error('Error fetching home content:', error)
    throw error
  }
}
