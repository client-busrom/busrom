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

  // Payload's built-in focalPoint feature uses focalX/focalY fields
  // Convert to frontend format: { x: number, y: number }
  const cropFocalPoint = media.focalX !== undefined && media.focalX !== null &&
                         media.focalY !== undefined && media.focalY !== null
    ? {
        x: media.focalX,
        y: media.focalY,
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
    imageCropDataList: [
      item.imageCropData || null,
      item.sceneImageCropData || null,
    ],
  }))
}

/**
 * Helper function to safely fetch data from Payload and prevent Promise.all from failing
 */
const safeFetch = async (task: () => Promise<any>, fallback: any = null) => {
  try {
    return await task()
  } catch (error) {
    console.error(`[Home API] Fetch failed:`, error)
    return fallback
  }
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
      safeFetch(() => payload.find({
        collection: 'hero-banner-items',
        locale,
        depth: 2,
        where: {
          status: { equals: 'published' },
        },
        sort: 'order',
        limit: 100,
      }), { docs: [] }),

      // Globals
      safeFetch(() => payload.findGlobal({
        slug: 'product-series-carousel',
        locale,
        depth: 2,
      })),
      safeFetch(() => payload.findGlobal({
        slug: 'service-features',
        locale,
        depth: 2,
      })),
      // Sphere 3D
      safeFetch(() => payload.findGlobal({
        slug: 'sphere-3d',
        locale,
        depth: 2,
      })),
      safeFetch(() => payload.findGlobal({
        slug: 'simple-cta',
        locale,
        depth: 2,
      })),

      // Series Intro Items Collection
      safeFetch(() => payload.find({
        collection: 'series-intro-items',
        locale,
        depth: 2,
        where: {
          status: { equals: 'published' },
        },
        limit: 100,
      }), { docs: [] }),

      safeFetch(() => payload.findGlobal({
        slug: 'featured-products',
        locale,
        depth: 2,
      })),
      safeFetch(() => payload.findGlobal({
        slug: 'brand-advantages',
        locale,
        depth: 2,
      })),
      safeFetch(() => payload.findGlobal({
        slug: 'oem-odm',
        locale,
        depth: 2,
      })),
      safeFetch(() => payload.findGlobal({
        slug: 'quote-steps',
        locale,
        depth: 2,
      })),
      safeFetch(() => payload.findGlobal({
        slug: 'main-form',
        locale,
        depth: 2,
      })),
      safeFetch(() => payload.findGlobal({
        slug: 'why-choose-busrom',
        locale,
        depth: 2,
      })),
      safeFetch(() => payload.findGlobal({
        slug: 'case-studies',
        locale,
        depth: 2,
      })),
      safeFetch(() => payload.findGlobal({
        slug: 'brand-analysis',
        locale,
        depth: 2,
      })),
      safeFetch(() => payload.findGlobal({
        slug: 'brand-value',
        locale,
        depth: 2,
      })),
      safeFetch(() => payload.findGlobal({
        slug: 'footer',
        locale,
        depth: 2,
      })),
    ])

    // Transform data to match frontend expectations
    const response = {
      locale,

      // Hero Banner Items
      heroBanner: heroBannerItems.docs.map((item: any) => {
        const imagePairs = [
          { image: getMediaWithVariants(item.image1), cropData: item.image1CropData || null },
          { image: getMediaWithVariants(item.image2), cropData: item.image2CropData || null },
          { image: getMediaWithVariants(item.image3), cropData: item.image3CropData || null },
          { image: getMediaWithVariants(item.image4), cropData: item.image4CropData || null },
        ]

        return {
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
          images: imagePairs.map(p => p.image),
          imageCropDataList: imagePairs.map(p => p.cropData),
        }
      }),

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
        features: [1, 2, 3, 4, 5].map(num => {
          // 配对图片和裁剪数据
          const imagePairs = [
            { image: getMediaWithVariants(serviceFeatures[`feature0${num}Image1`]), cropData: serviceFeatures[`feature0${num}Image1CropData`] || null },
            { image: getMediaWithVariants(serviceFeatures[`feature0${num}Image2`]), cropData: serviceFeatures[`feature0${num}Image2CropData`] || null },
            // Feature 01 has 4 images, Feature 03 has 6 images
            {
              image: (num === 1 || num === 3) ? getMediaWithVariants(serviceFeatures[`feature0${num}Image3`]) : null,
              cropData: (num === 1 || num === 3) ? (serviceFeatures[`feature0${num}Image3CropData`] || null) : null
            },
            {
              image: (num === 1 || num === 3) ? getMediaWithVariants(serviceFeatures[`feature0${num}Image4`]) : null,
              cropData: (num === 1 || num === 3) ? (serviceFeatures[`feature0${num}Image4CropData`] || null) : null
            },
            {
              image: num === 3 ? getMediaWithVariants(serviceFeatures[`feature0${num}Image5`]) : null,
              cropData: num === 3 ? (serviceFeatures[`feature0${num}Image5CropData`] || null) : null
            },
            {
              image: num === 3 ? getMediaWithVariants(serviceFeatures[`feature0${num}Image6`]) : null,
              cropData: num === 3 ? (serviceFeatures[`feature0${num}Image6CropData`] || null) : null
            },
          ]

          return {
            title: serviceFeatures[`feature0${num}Title`],
            shortTitle: serviceFeatures[`feature0${num}ShortTitle`],
            description: serviceFeatures[`feature0${num}Description`],
            images: imagePairs.map(p => p.image),
            imageCropDataList: imagePairs.map(p => p.cropData),
          }
        }),
      } : null,

      // Sphere 3D (only if published)
      sphere3d: sphere3d?.status === 'published' ? {
        status: sphere3d?.status,
        title: sphere3d?.title || 'GLOBAL NETWORK',
        description: sphere3d?.description || '',
      } : null,

      // Simple CTA (only if published)
      simpleCta: simpleCta?.status === 'published' ? {
        status: simpleCta?.status,
        title: simpleCta?.title,
        subtitle: simpleCta?.subtitle,
        description: simpleCta?.description,
        ctaText: simpleCta?.ctaText,
        ctaUrl: simpleCta?.ctaLink, // Field name in DB is ctaLink
        marqueeContent: simpleCta?.marqueeContent,
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
        imageCropDataList: item.imageCropDataList || [],
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
                features: (() => {
                  const attrPage = product.attributePage as any;
                  if (!attrPage || !attrPage.productAttributes) return [];
                  
                  const attrs = attrPage.productAttributes;
                  let attrList: any[] = [];
                  
                  if (Array.isArray(attrs)) {
                    attrList = attrs;
                  } else if (typeof attrs === 'object') {
                    attrList = attrs[locale] || attrs['en'] || attrs['zh'] || [];
                  }
                  
                  return attrList
                    .filter((attr: any) => attr.showOnFrontEnd !== false)
                    .slice(0, 3)
                    .map((attr: any) => attr.value);
                })(),
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
      // Fetch selected applications for case studies
      caseStudies: caseStudies?.status === 'published' ? await (async () => {
        // Get selected application IDs from the global
        const selectedAppIds = (caseStudies.applications || []).map((app: any) =>
          typeof app === 'object' ? app.id : app
        )

        if (selectedAppIds.length === 0) {
          return {
            status: caseStudies?.status,
            title: caseStudies?.title,
            description: caseStudies?.description,
            applications: [],
          }
        }

        // Fetch selected applications with their scene galleries
        const applicationsResult = await payload.find({
          collection: 'applications',
          locale,
          depth: 2,
          where: {
            id: { in: selectedAppIds },
            status: { equals: 'published' },
          },
          limit: selectedAppIds.length,
        })

        // Maintain the order from selectedAppIds
        const appMap = new Map(applicationsResult.docs.map((app: any) => [app.id, app]))
        const orderedApps = selectedAppIds
          .map((id: any) => appMap.get(id))
          .filter(Boolean)

        /**
         * Select 3 display images from scene gallery:
         * - If groups >= 3: randomly pick 3 groups, then 1 random image from each
         * - If groups < 3: flatten all images and randomly pick 3
         *
         * Uses a seeded random based on app.id for consistent results across requests
         */
        const selectDisplayImages = (sceneGallery: any[]) => {
          if (!sceneGallery || sceneGallery.length === 0) return []

          // Simple seeded random function (for consistent results)
          const seededRandom = (seed: number) => {
            const x = Math.sin(seed) * 10000
            return x - Math.floor(x)
          }

          const groups = sceneGallery.filter((scene: any) =>
            scene.images && scene.images.length > 0
          )

          if (groups.length >= 3) {
            // Randomly pick 3 groups, then 1 image from each
            const shuffledGroups = [...groups]
              .map((g, i) => ({ g, sort: seededRandom(i + 1) }))
              .sort((a, b) => a.sort - b.sort)
              .map(({ g }) => g)
              .slice(0, 3)

            return shuffledGroups.map((group: any, idx: number) => {
              const images = group.images || []
              const randomIdx = Math.floor(seededRandom(idx + 100) * images.length)
              return getMediaWithVariants(images[randomIdx])
            }).filter(Boolean)
          } else {
            // Flatten all images and pick 3 randomly
            const allImages: any[] = []
            groups.forEach((scene: any) => {
              (scene.images || []).forEach((img: any) => {
                allImages.push(img)
              })
            })

            if (allImages.length === 0) return []

            const shuffledImages = [...allImages]
              .map((img, i) => ({ img, sort: seededRandom(i + 200) }))
              .sort((a, b) => a.sort - b.sort)
              .map(({ img }) => img)
              .slice(0, 3)

            return shuffledImages.map((img: any) => getMediaWithVariants(img)).filter(Boolean)
          }
        }

        const applications = orderedApps.map((app: any) => ({
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
          // Pre-selected display images (3 images per application)
          displayImages: selectDisplayImages(app.sceneGallery),
          // Also include full sceneGallery for backward compatibility
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
        backgroundImage: getMediaWithVariants(brandAnalysis?.backgroundImage),
        centers: [
          {
            title: brandAnalysis?.brandCenter?.title,
            description: brandAnalysis?.brandCenter?.description,
            backgroundImage: getMediaWithVariants(brandAnalysis?.brandCenter?.backgroundImage) || getMediaWithVariants(brandAnalysis?.backgroundImage),
            largeImage: getMediaWithVariants(brandAnalysis?.brandCenter?.largeImage),
            smallImage: getMediaWithVariants(brandAnalysis?.brandCenter?.smallImage),
          },
          {
            title: brandAnalysis?.projectCenter?.title,
            description: brandAnalysis?.projectCenter?.description,
            backgroundImage: getMediaWithVariants(brandAnalysis?.projectCenter?.backgroundImage) || getMediaWithVariants(brandAnalysis?.backgroundImage),
            largeImage: getMediaWithVariants(brandAnalysis?.projectCenter?.largeImage),
            smallImage: getMediaWithVariants(brandAnalysis?.projectCenter?.smallImage),
          },
          {
            title: brandAnalysis?.serviceCenter?.title,
            description: brandAnalysis?.serviceCenter?.description,
            backgroundImage: getMediaWithVariants(brandAnalysis?.serviceCenter?.backgroundImage) || getMediaWithVariants(brandAnalysis?.backgroundImage),
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
          title: footer?.formConfig?.displayName || '',
          placeholders: {
            name: footer?.formConfig?.fields?.find((f: any) => f.fieldName === 'name')?.placeholder || '',
            email: footer?.formConfig?.fields?.find((f: any) => f.fieldName === 'email')?.placeholder || '',
            message: footer?.formConfig?.fields?.find((f: any) => f.fieldName === 'message')?.placeholder || '',
          },
          buttonText: footer?.formConfig?.submitButtonText || '',
        },
        contact: {
          title: footer?.contactInfoGroup?.contactTitle,
          addressLabel: footer?.contactInfoGroup?.addressLabel,
          address: footer?.contactInfoGroup?.address,
          workingHoursLabel: footer?.contactInfoGroup?.workingHoursLabel,
          workingHours: footer?.contactInfoGroup?.workingHours,
          emailLabel: footer?.contactInfoGroup?.contactEmailLabel,
          email: footer?.contactInfoGroup?.contactEmail,
          afterSalesLabel: footer?.contactInfoGroup?.afterSalesLabel,
          afterSales: footer?.contactInfoGroup?.afterSalesEmail,
          whatsappLabel: footer?.contactInfoGroup?.whatsappLabel,
          whatsapp: footer?.contactInfoGroup?.whatsappNumber,
        },
        notice: {
          title: footer?.officialNoticeGroup?.officialNoticeTitle,
          // Support multi-line notice
          lines: [
            footer?.officialNoticeGroup?.officialNoticeLine1,
            footer?.officialNoticeGroup?.officialNoticeLine2,
            footer?.officialNoticeGroup?.officialNoticeLine3,
            footer?.officialNoticeGroup?.officialNoticeLine4,
          ].filter(Boolean),
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
