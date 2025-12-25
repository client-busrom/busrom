/**
 * Home Content API Endpoint
 *
 * Provides all home page content in a single REST API call
 * GET /api/home?locale=en
 */
// @ts-nocheck

import type { PayloadHandler } from 'payload'

/**
 * Helper function to get media URL with variants
 *
 * Payload CMS stores image sizes in `sizes` field with structure:
 *   { thumbnail: { url, width, height }, card: { url, ... }, tablet: { url, ... }, desktop: { url, ... } }
 *
 * Frontend expects `variants` field with structure:
 *   { thumbnail: url, small: url, medium: url, large: url, xlarge: url, webp: url }
 *
 * Size mapping (Payload -> Frontend):
 *   thumbnail (400x300) -> thumbnail
 *   card (768x512) -> small
 *   tablet (1024w) -> medium
 *   desktop (1920w) -> large
 *   original url -> xlarge
 */
function getMediaWithVariants(media: any | string | null | undefined) {
  if (!media || typeof media === 'string') {
    return null
  }

  // Payload uses focalPointData instead of cropFocalPoint
  // Convert to frontend format: { x: number, y: number }
  const cropFocalPoint = media.focalPointData?.x !== undefined && media.focalPointData?.y !== undefined
    ? {
        x: media.focalPointData.x,
        y: media.focalPointData.y,
      }
    : undefined

  // Convert Payload's sizes to frontend's variants format
  const sizes = media.sizes || {}
  const originalUrl = media.url || ''

  // Build variants object with fallback chain
  // For each size, use the specific size URL if available, otherwise fallback to larger size or original
  const variants: Record<string, string> = {}

  // thumbnail (400x300) - smallest
  if (sizes.thumbnail?.url) {
    variants.thumbnail = sizes.thumbnail.url
  }

  // small (768x512) - from card size
  if (sizes.card?.url) {
    variants.small = sizes.card.url
  } else if (sizes.thumbnail?.url) {
    variants.small = sizes.thumbnail.url
  }

  // medium (1024w) - from tablet size
  if (sizes.tablet?.url) {
    variants.medium = sizes.tablet.url
  } else if (sizes.card?.url) {
    variants.medium = sizes.card.url
  } else {
    variants.medium = originalUrl
  }

  // large (1920w) - from desktop size
  if (sizes.desktop?.url) {
    variants.large = sizes.desktop.url
  } else if (sizes.tablet?.url) {
    variants.large = sizes.tablet.url
  } else {
    variants.large = originalUrl
  }

  // xlarge - always use original
  variants.xlarge = originalUrl

  return {
    id: media.id,
    url: originalUrl,
    filename: media.filename || '',
    mimeType: media.mimeType || '',
    width: media.width || 0,
    height: media.height || 0,
    variants,
    altText: media.altText || media.alt || '',
    cropFocalPoint,
  }
}

/**
 * Helper function to resolve media IDs in carousel items
 * JSON fields don't auto-populate relations, so we need to fetch media manually
 */
async function resolveCarouselItems(items: any[], payload: any) {
  if (!Array.isArray(items) || items.length === 0) {
    return []
  }

  // Collect all unique media IDs
  const mediaIds = new Set<number>()
  for (const item of items) {
    if (typeof item.image === 'number') mediaIds.add(item.image)
    if (typeof item.sceneImage === 'number') mediaIds.add(item.sceneImage)
  }

  // Fetch all media in one query
  const mediaMap = new Map<number, any>()
  if (mediaIds.size > 0) {
    try {
      const mediaResult = await payload.find({
        collection: 'media',
        where: {
          id: { in: Array.from(mediaIds) },
        },
        limit: mediaIds.size,
        depth: 0,
      })
      for (const media of mediaResult.docs) {
        mediaMap.set(media.id, media)
      }
    } catch (error) {
      console.error('Error fetching media for carousel items:', error)
    }
  }

  // Map items with resolved media
  return items.map((item: any) => ({
    title: item.title,
    buttonText: item.buttonText,
    linkUrl: item.linkUrl,
    isShow: item.isShow,
    image: getMediaWithVariants(
      typeof item.image === 'number' ? mediaMap.get(item.image) : item.image
    ),
    sceneImage: getMediaWithVariants(
      typeof item.sceneImage === 'number' ? mediaMap.get(item.sceneImage) : item.sceneImage
    ),
  }))
}

/**
 * Home Content Handler
 */
export const homeContentHandler: PayloadHandler = async (req) => {
  try {
    const locale = ((req.query.locale as string) || 'en') as any
    const { payload } = req


    // Fetch all globals in parallel with the specified locale
    const [
      heroBannerItems,
      productSeriesCarousel,
      serviceFeatures,
      sphere3d,
      simpleCta,
      seriesIntroItems,
      featuredProducts,
      brandAdvantages,
      oemOdm,
      quoteSteps,
      mainForm,
      whyChooseBusrom,
      caseStudies,
      brandAnalysis,
      brandValue,
      footer,
    ] = await Promise.all([
      // Collections
      payload.find({
        collection: 'hero-banner-items',
        locale,
        depth: 2,
        where: {
          status: { equals: 'published' },
        },
        sort: 'order',
        limit: 100,
      }),

      // Globals
      payload.findGlobal({
        slug: 'product-series-carousel',
        locale,
        depth: 2,
      }),
      payload.findGlobal({
        slug: 'service-features',
        locale,
        depth: 2,
      }),
      payload.findGlobal({
        slug: 'sphere-3d',
        locale,
        depth: 2,
      }),
      payload.findGlobal({
        slug: 'simple-cta',
        locale,
        depth: 2,
      }),

      // Series Intro Items Collection
      payload.find({
        collection: 'series-intro-items',
        locale,
        depth: 2,
        where: {
          status: { equals: 'published' },
        },
        limit: 100,
      }),

      payload.findGlobal({
        slug: 'featured-products',
        locale,
        depth: 2,
      }),
      payload.findGlobal({
        slug: 'brand-advantages',
        locale,
        depth: 2,
      }),
      payload.findGlobal({
        slug: 'oem-odm',
        locale,
        depth: 2,
      }),
      payload.findGlobal({
        slug: 'quote-steps',
        locale,
        depth: 2,
      }),
      payload.findGlobal({
        slug: 'main-form',
        locale,
        depth: 2,
      }),
      payload.findGlobal({
        slug: 'why-choose-busrom',
        locale,
        depth: 2,
      }),
      payload.findGlobal({
        slug: 'case-studies',
        locale,
        depth: 2,
      }),
      payload.findGlobal({
        slug: 'brand-analysis',
        locale,
        depth: 2,
      }),
      payload.findGlobal({
        slug: 'brand-value',
        locale,
        depth: 2,
      }),
      payload.findGlobal({
        slug: 'footer',
        locale,
        depth: 2,
      }),
    ])

    // Transform data to match frontend expectations
    const response = {
      locale,

      // Hero Banner Items
      heroBanner: heroBannerItems.docs.map((item: any) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        ctaText: item.ctaButton?.text || item.ctaText,
        ctaUrl: item.ctaButton?.link || item.ctaUrl,
        features: [
          item.feature1,
          item.feature2,
          item.feature3,
          item.feature4,
          item.feature5,
        ].filter(Boolean),
        images: [
          getMediaWithVariants(item.image1),
          getMediaWithVariants(item.image2),
          getMediaWithVariants(item.image3),
          getMediaWithVariants(item.image4),
        ].filter(Boolean),
      })),

      // Product Series Carousel (only if published)
      // Note: items is a JSON field, so media references are IDs that need to be resolved
      // JSON fields don't auto-fallback, so we manually fallback to 'en' if locale data is empty or incomplete
      productSeriesCarousel: productSeriesCarousel?.status === 'published' ? {
        title: productSeriesCarousel?.title || '',
        items: await (async () => {
          const localeItems = (productSeriesCarousel as any)?.items?.[locale] || []
          const enItems = (productSeriesCarousel as any)?.items?.['en'] || []

          // Check if locale items have actual content (not just empty shells)
          const hasValidContent = localeItems.some((item: any) => item.title || item.image)

          return resolveCarouselItems(
            hasValidContent ? localeItems : enItems,
            payload
          )
        })(),
      } : null,

      // Service Features (only if published)
      // Image counts per feature: [4, 2, 6, 2, 2]
      serviceFeatures: serviceFeatures?.status === 'published' ? {
        status: serviceFeatures?.status,
        title: serviceFeatures?.title,
        subtitle: serviceFeatures?.subtitle,
        features: [1, 2, 3, 4, 5].map(num => ({
          title: serviceFeatures[`feature0${num}Title`],
          shortTitle: serviceFeatures[`feature0${num}ShortTitle`],
          description: serviceFeatures[`feature0${num}Description`],
          images: [
            getMediaWithVariants(serviceFeatures[`feature0${num}Image1`]),
            getMediaWithVariants(serviceFeatures[`feature0${num}Image2`]),
            // Feature 01 has 4 images, Feature 03 has 6 images
            (num === 1 || num === 3) && getMediaWithVariants(serviceFeatures[`feature0${num}Image3`]),
            (num === 1 || num === 3) && getMediaWithVariants(serviceFeatures[`feature0${num}Image4`]),
            num === 3 && getMediaWithVariants(serviceFeatures[`feature0${num}Image5`]),
            num === 3 && getMediaWithVariants(serviceFeatures[`feature0${num}Image6`]),
          ].filter(Boolean),
        })),
      } : null,

      // Sphere 3D (only if published)
      sphere3d: sphere3d?.status === 'published' ? {
        status: sphere3d?.status,
        title: sphere3d?.title,
        description: sphere3d?.description,
      } : null,

      // Simple CTA (only if published)
      simpleCta: simpleCta?.status === 'published' ? {
        status: simpleCta?.status,
        title: simpleCta?.title,
        subtitle: simpleCta?.subtitle,
        ctaText: simpleCta?.ctaText,
        ctaUrl: simpleCta?.ctaLink, // Field name in DB is ctaLink
        images: [
          getMediaWithVariants(simpleCta.image1),
          getMediaWithVariants(simpleCta.image2),
          getMediaWithVariants(simpleCta.image3),
        ].filter(Boolean),
      } : null,

      // Series Intro
      seriesIntro: seriesIntroItems.docs.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        productSeries: item.productSeries,
        images: (item.resolvedImages || []).map((img: any) => getMediaWithVariants(img)),
      })),

      // Featured Products (only if published)
      // Fetch products for each selected series
      featuredProducts: await (async () => {
        if (featuredProducts?.status !== 'published') return null

        const categories = featuredProducts?.categories || []
        if (!Array.isArray(categories) || categories.length === 0) return null

        // For each series, fetch up to 3 products
        const seriesWithProducts = await Promise.all(
          categories.map(async (seriesItem: any) => {
            const seriesId = typeof seriesItem === 'object' ? seriesItem.id : seriesItem
            const seriesData = typeof seriesItem === 'object' ? seriesItem : null

            // Fetch products for this series
            const productsResult = await payload.find({
              collection: 'products',
              locale,
              depth: 2,
              where: {
                series: { equals: seriesId },
                status: { equals: 'published' },
              },
              limit: 3,
              sort: 'order',
            })

            return {
              seriesId,
              seriesTitle: seriesData?.name || seriesData?.localizedName || `Series ${seriesId}`,
              seriesSlug: seriesData?.slug || '',
              products: productsResult.docs.map((product: any) => ({
                id: product.id,
                slug: product.slug,
                title: product.name || product.localizedName || '',
                image: getMediaWithVariants(product.showImage),
                features: (product.attributes || [])
                  .filter((attr: any) => attr.isShow)
                  .slice(0, 3)
                  .map((attr: any) => `${attr.key}: ${attr.value}`),
              })),
            }
          })
        )

        return {
          status: featuredProducts?.status,
          title: featuredProducts?.title,
          description: featuredProducts?.description,
          viewAllButtonText: featuredProducts?.viewAllButtonText,
          viewAllButtonUrl: featuredProducts?.viewAllButtonUrl,
          series: seriesWithProducts.filter(s => s.products.length > 0),
        }
      })(),

      // Brand Advantages (only if published)
      brandAdvantages: brandAdvantages?.status === 'published' ? {
        status: brandAdvantages?.status,
        image: getMediaWithVariants(brandAdvantages?.image),
        advantages: [1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
          const text = brandAdvantages[`advantage0${num}Text`]
          const icon = brandAdvantages[`advantage0${num}Icon`]
          return text ? { text, icon } : null
        }).filter(Boolean),
      } : null,

      // OEM/ODM (only if published)
      oemOdm: oemOdm?.status === 'published' ? {
        status: oemOdm?.status,
        oem: {
          title: oemOdm?.oemTitle,
          description: [oemOdm?.oemDescription1, oemOdm?.oemDescription2].filter(Boolean),
          bgImage: getMediaWithVariants(oemOdm?.oemBgImage),
          image: getMediaWithVariants(oemOdm?.oemImage),
        },
        odm: {
          title: oemOdm?.odmTitle,
          description: [oemOdm?.odmDescription1, oemOdm?.odmDescription2].filter(Boolean),
          bgImage: getMediaWithVariants(oemOdm?.odmBgImage),
          image: getMediaWithVariants(oemOdm?.odmImage),
        },
      } : null,

      // Quote Steps (only if published)
      quoteSteps: quoteSteps?.status === 'published' ? {
        status: quoteSteps?.status,
        headerTitle: quoteSteps?.headerTitle,
        headerTitle2: quoteSteps?.headerTitle2,
        headerSubtitle: quoteSteps?.headerSubtitle,
        headerDescription: quoteSteps?.headerDescription,
        steps: [1, 2, 3, 4, 5].map(num => ({
          title: quoteSteps[`step0${num}Title`],
          text: quoteSteps[`step0${num}Text`],
          image: getMediaWithVariants(quoteSteps[`step0${num}Image`]),
        })),
      } : null,

      // Main Form (only if published)
      mainForm: mainForm?.status === 'published' ? {
        status: mainForm?.status,
        designTextLeft: mainForm?.designTextLeft,
        designTextRight: mainForm?.designTextRight,
        images: [
          getMediaWithVariants(mainForm?.image1),
          getMediaWithVariants(mainForm?.image2),
        ].filter(Boolean),
      } : null,

      // Why Choose Busrom (only if published)
      whyChooseBusrom: whyChooseBusrom?.status === 'published' ? {
        status: whyChooseBusrom?.status,
        title: whyChooseBusrom?.title,
        title2: whyChooseBusrom?.title2,
        viewMoreButtonText: whyChooseBusrom?.viewMoreButtonText,
        viewMoreButtonUrl: whyChooseBusrom?.viewMoreButtonUrl,
        reasons: [1, 2, 3, 4, 5].map(num => ({
          title: whyChooseBusrom[`reason0${num}Title`],
          description: whyChooseBusrom[`reason0${num}Description`],
          icon: whyChooseBusrom[`reason0${num}Icon`],
          image: getMediaWithVariants(whyChooseBusrom[`reason0${num}Image`]),
        })),
      } : null,

      // Case Studies (only if published)
      // Fetch applications for case studies
      caseStudies: caseStudies?.status === 'published' ? await (async () => {
        // Get all published applications with their scene galleries
        const applicationsResult = await payload.find({
          collection: 'applications',
          locale,
          depth: 2,
          where: {
            status: { equals: 'published' },
          },
          limit: 100,
        })

        const applications = applicationsResult.docs.map((app: any) => ({
          id: app.id,
          slug: app.slug,
          name: app.name,
          shortDescription: app.shortDescription,
          description: app.description,
          category: app.category ? {
            id: app.category.id,
            name: app.category.name,
            slug: app.category.slug,
          } : null,
          sceneGallery: (app.sceneGallery || []).map((scene: any) => ({
            sceneName: scene.sceneName,
            images: (scene.images || []).map((img: any) => getMediaWithVariants(img)),
          })),
        }))

        return {
          status: caseStudies?.status,
          title: caseStudies?.title,
          description: caseStudies?.description,
          applications,
        }
      })() : null,

      // Brand Analysis (only if published)
      brandAnalysis: brandAnalysis?.status === 'published' ? {
        status: brandAnalysis?.status,
        centers: [
          {
            title: brandAnalysis?.brandCenter?.title,
            description: brandAnalysis?.brandCenter?.description,
            largeImage: getMediaWithVariants(brandAnalysis?.brandCenter?.largeImage),
            smallImage: getMediaWithVariants(brandAnalysis?.brandCenter?.smallImage),
          },
          {
            title: brandAnalysis?.projectCenter?.title,
            description: brandAnalysis?.projectCenter?.description,
            largeImage: getMediaWithVariants(brandAnalysis?.projectCenter?.largeImage),
            smallImage: getMediaWithVariants(brandAnalysis?.projectCenter?.smallImage),
          },
          {
            title: brandAnalysis?.serviceCenter?.title,
            description: brandAnalysis?.serviceCenter?.description,
            largeImage: getMediaWithVariants(brandAnalysis?.serviceCenter?.largeImage),
            smallImage: getMediaWithVariants(brandAnalysis?.serviceCenter?.smallImage),
          },
        ],
      } : null,

      // Brand Value (only if published)
      brandValue: brandValue?.status === 'published' ? {
        status: brandValue?.status,
        title: brandValue?.title,
        subtitle: brandValue?.subtitle,
        items: [
          {
            title: brandValue?.param1Title,
            description: brandValue?.param1Description,
            image: getMediaWithVariants(brandValue?.param1Image),
          },
          {
            title: brandValue?.param2Title,
            description: brandValue?.param2Description,
            image: getMediaWithVariants(brandValue?.param2Image),
          },
          {
            title: brandValue?.sloganTitle,
            description: brandValue?.sloganDescription,
            image: getMediaWithVariants(brandValue?.sloganImage),
          },
          {
            title: brandValue?.valueTitle,
            description: brandValue?.valueDescription,
            image: getMediaWithVariants(brandValue?.valueImage),
          },
          {
            title: brandValue?.visionTitle,
            description: brandValue?.visionDescription,
            image: getMediaWithVariants(brandValue?.visionImage),
          },
        ],
      } : null,

      // Footer (only if published)
      footer: footer?.status === 'published' ? {
        status: footer?.status,
        form: {
          title: footer?.formTitle,
          placeholders: {
            name: footer?.formPlaceholderName,
            email: footer?.formPlaceholderEmail,
            message: footer?.formPlaceholderMessage,
          },
          buttonText: footer?.submitButtonText,
        },
        contact: {
          title: footer?.contactTitle,
          address: footer?.address,
          workingHours: footer?.workingHours,
          // New fields
          emailLabel: footer?.contactEmailLabel,
          email: footer?.contactEmail || footer?.email, // Fallback to old field
          afterSalesLabel: footer?.afterSalesLabel,
          afterSales: footer?.afterSalesEmail || footer?.phone, // Fallback to old field
          whatsappLabel: footer?.whatsappLabel,
          whatsapp: footer?.whatsappNumber || footer?.whatsapp, // Fallback to old field
        },
        notice: {
          title: footer?.officialNoticeTitle,
          // Support multi-line notice
          lines: [
            footer?.officialNoticeLine1,
            footer?.officialNoticeLine2,
            footer?.officialNoticeLine3,
            footer?.officialNoticeLine4,
          ].filter(Boolean),
          text: footer?.officialNoticeText, // Legacy field
        },
        copyright: footer?.copyrightText,
        socialLinks: footer?.socialLinks || [],
        // Navigation menus for non-home pages
        column3Menus: footer?.column3Menus || [],
        column4Menus: footer?.column4Menus || [],
      } : null,
    }

    return Response.json(response, { status: 200 })
  } catch (error) {
    console.error('Error fetching home content:', error)
    return Response.json({
      error: 'Failed to fetch home content',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
