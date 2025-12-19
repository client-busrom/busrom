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

  return {
    id: media.id,
    url: media.url || '',
    filename: media.filename || '',
    mimeType: media.mimeType || '',
    width: media.width || 0,
    height: media.height || 0,
    variants: media.variants || {},
    altText: media.altText || media.alt || '',
    cropFocalPoint,
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

      // Product Series Carousel
      productSeriesCarousel: {
        title: productSeriesCarousel?.title || '',
        items: (((productSeriesCarousel as any)?.items?.[locale] || []) as any[]).map((item: any) => ({
          title: item.title,
          buttonText: item.buttonText,
          linkUrl: item.linkUrl,
          image: getMediaWithVariants(item.productImage),
          sceneImage: getMediaWithVariants(item.sceneImage),
        })),
      },

      // Service Features
      serviceFeatures: serviceFeatures ? {
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
            num === 3 && getMediaWithVariants(serviceFeatures[`feature0${num}Image3`]),
            num === 3 && getMediaWithVariants(serviceFeatures[`feature0${num}Image4`]),
            num === 3 && getMediaWithVariants(serviceFeatures[`feature0${num}Image5`]),
            num === 3 && getMediaWithVariants(serviceFeatures[`feature0${num}Image6`]),
          ].filter(Boolean),
        })),
      } : null,

      // Sphere 3D
      sphere3d: sphere3d ? {
        status: sphere3d?.status,
      } : null,

      // Simple CTA
      simpleCta: simpleCta ? {
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
        images: item.populatedImages || [],
      })),

      // Featured Products
      featuredProducts: featuredProducts ? {
        status: featuredProducts?.status,
        title: featuredProducts?.title,
        description: featuredProducts?.description,
        viewAllButtonText: featuredProducts?.viewAllButtonText,
        viewAllButtonUrl: featuredProducts?.viewAllButtonUrl,
        series: featuredProducts?.series || [],
      } : null,

      // Brand Advantages
      brandAdvantages: brandAdvantages ? {
        status: brandAdvantages?.status,
        image: getMediaWithVariants(brandAdvantages?.image),
        advantages: [1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
          const text = brandAdvantages[`advantage0${num}Text`]
          const icon = brandAdvantages[`advantage0${num}Icon`]
          return text ? { text, icon } : null
        }).filter(Boolean),
      } : null,

      // OEM/ODM
      oemOdm: oemOdm ? {
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

      // Quote Steps
      quoteSteps: quoteSteps ? {
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

      // Main Form
      mainForm: mainForm ? {
        status: mainForm?.status,
        designTextLeft: mainForm?.designTextLeft,
        designTextRight: mainForm?.designTextRight,
        images: [
          getMediaWithVariants(mainForm?.image1),
          getMediaWithVariants(mainForm?.image2),
        ].filter(Boolean),
      } : null,

      // Why Choose Busrom
      whyChooseBusrom: whyChooseBusrom ? {
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

      // Case Studies
      caseStudies: caseStudies ? {
        status: caseStudies?.status,
        title: caseStudies?.title,
        description: caseStudies?.description,
        applications: caseStudies?.applications || [],
      } : null,

      // Brand Analysis
      brandAnalysis: brandAnalysis ? {
        status: brandAnalysis?.status,
        brandNameAnalysis: {
          titlePart1: brandAnalysis?.brandNameAnalysis?.titlePart1,
          titlePart2: brandAnalysis?.brandNameAnalysis?.titlePart2,
          textPart1: brandAnalysis?.brandNameAnalysis?.textPart1,
          textPart2: brandAnalysis?.brandNameAnalysis?.textPart2,
        },
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

      // Brand Value
      brandValue: brandValue ? {
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

      // Footer
      footer: footer ? {
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
