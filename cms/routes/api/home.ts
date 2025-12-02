/**
 * Home Content API
 *
 * Provides all home page content in a single API call
 * Transforms CMS data to match frontend expectations
 */

import { Request, Response } from 'express'

/**
 * GET /api/home?locale=en
 *
 * Returns all home page content for the specified locale
 */
export async function homeContentHandler(req: Request, res: Response) {
  try {
    const locale = (req.query.locale as string) || 'en'
    const context = (req as any).context.sudo()

    // Helper function to extract localized value
    const getLocalized = (field: any, fallback = '') => {
      if (!field) return fallback
      if (typeof field === 'string') return field
      return field[locale] || field['en'] || fallback
    }

    // Helper to fetch Media URL by ID
    const fetchMediaUrl = async (mediaId: string): Promise<string | null> => {
      if (!mediaId) return null
      // If already a URL, return as-is
      if (mediaId.startsWith('http://') || mediaId.startsWith('https://')) return mediaId

      try {
        const media = await context.query.Media.findOne({
          where: { id: mediaId },
          query: 'fileUrl file { url }',
        })
        return media?.fileUrl || media?.file?.url || null
      } catch (error) {
        console.error(`Failed to fetch media ${mediaId}:`, error)
        return null
      }
    }

    // Helper to extract Media ID from JSON field
    const getMediaId = (field: any): string | null => {
      if (!field) return null
      if (typeof field === 'string') return field
      return field.id || field.mediaId || null
    }

    // 1. Fetch Hero Banner Items
    const heroBannerItems = await context.query.HeroBannerItem.findMany({
      where: {
        status: { equals: 'PUBLISHED' },
        enabled: { equals: true },
      },
      orderBy: { order: 'asc' },
      query: `
        id
        title
        feature1
        feature2
        feature3
        feature4
        feature5
        image1
        image2
        image3
        image4
      `,
    })

    // Convert HeroBanner with Media URL resolution
    const heroBanner = await Promise.all(
      heroBannerItems.map(async (item: any) => {
        const imageIds = [item.image1, item.image2, item.image3, item.image4]
          .map(getMediaId)
          .filter(Boolean)

        const imageUrls = await Promise.all(
          imageIds.map(id => fetchMediaUrl(id!))
        )

        return {
          id: item.id,
          title: getLocalized(item.title),
          features: [
            getLocalized(item.feature1),
            getLocalized(item.feature2),
            getLocalized(item.feature3),
            getLocalized(item.feature4),
            getLocalized(item.feature5),
          ].filter(Boolean),
          images: imageUrls.filter(Boolean),
        }
      })
    )

    // 2. Fetch Product Series Carousel
    const carouselData = await context.query.ProductSeriesCarousel.findOne({
      where: { internalLabel: 'Product Series Carousel Configuration' },
      query: `
        internalLabel
        items
        autoPlay
        autoPlaySpeed
        status
      `,
    })

    const productSeriesCarousel = carouselData ? await (async () => {
      const items = carouselData.items || {}
      const processedItems: any = {}

      // Process each locale
      for (const [locale, carouselItems] of Object.entries(items)) {
        if (!Array.isArray(carouselItems)) continue

        // Process each carousel item in parallel
        const processedCarouselItems = await Promise.all(
          carouselItems.map(async (item: any) => {
            // Fetch URLs for image and sceneImage
            const [imageUrl, sceneImageUrl] = await Promise.all([
              fetchMediaUrl(getMediaId(item.image)),
              fetchMediaUrl(getMediaId(item.sceneImage)),
            ])

            return {
              ...item,
              image: imageUrl,
              sceneImage: sceneImageUrl,
            }
          })
        )

        processedItems[locale] = processedCarouselItems
      }

      return {
        items: processedItems,
        autoPlay: carouselData.autoPlay,
        autoPlaySpeed: carouselData.autoPlaySpeed,
      }
    })() : null

    // 3. Fetch Service Features Config
    const serviceFeaturesData = await context.query.ServiceFeaturesConfig.findMany({
      where: { status: { equals: 'PUBLISHED' } },
      take: 1,
      query: `
        title
        subtitle
        feature1Title
        feature1ShortTitle
        feature1Description
        feature1Image1
        feature1Image2
        feature1Image3
        feature1Image4
        feature2Title
        feature2ShortTitle
        feature2Description
        feature2Image1
        feature2Image2
        feature3Title
        feature3ShortTitle
        feature3Description
        feature3Image1
        feature3Image2
        feature3Image3
        feature3Image4
        feature3Image5
        feature3Image6
        feature4Title
        feature4ShortTitle
        feature4Description
        feature4Image1
        feature4Image2
        feature5Title
        feature5ShortTitle
        feature5Description
        feature5Image1
        feature5Image2
      `,
    })

    const serviceFeatures = serviceFeaturesData[0] ? await (async () => {
      const data = serviceFeaturesData[0]

      // Collect all image IDs for batch resolution
      const feature1ImageIds = [data.feature1Image1, data.feature1Image2, data.feature1Image3, data.feature1Image4]
        .map(getMediaId).filter(Boolean)
      const feature2ImageIds = [data.feature2Image1, data.feature2Image2]
        .map(getMediaId).filter(Boolean)
      const feature3ImageIds = [data.feature3Image1, data.feature3Image2, data.feature3Image3, data.feature3Image4, data.feature3Image5, data.feature3Image6]
        .map(getMediaId).filter(Boolean)
      const feature4ImageIds = [data.feature4Image1, data.feature4Image2]
        .map(getMediaId).filter(Boolean)
      const feature5ImageIds = [data.feature5Image1, data.feature5Image2]
        .map(getMediaId).filter(Boolean)

      // Batch fetch all URLs
      const [feature1Urls, feature2Urls, feature3Urls, feature4Urls, feature5Urls] = await Promise.all([
        Promise.all(feature1ImageIds.map(id => fetchMediaUrl(id!))),
        Promise.all(feature2ImageIds.map(id => fetchMediaUrl(id!))),
        Promise.all(feature3ImageIds.map(id => fetchMediaUrl(id!))),
        Promise.all(feature4ImageIds.map(id => fetchMediaUrl(id!))),
        Promise.all(feature5ImageIds.map(id => fetchMediaUrl(id!))),
      ])

      return {
        title: getLocalized(data.title),
        subtitle: getLocalized(data.subtitle),
        features: [
          {
            title: getLocalized(data.feature1Title),
            shortTitle: getLocalized(data.feature1ShortTitle),
            description: getLocalized(data.feature1Description),
            images: feature1Urls.filter(Boolean),
          },
          {
            title: getLocalized(data.feature2Title),
            shortTitle: getLocalized(data.feature2ShortTitle),
            description: getLocalized(data.feature2Description),
            images: feature2Urls.filter(Boolean),
          },
          {
            title: getLocalized(data.feature3Title),
            shortTitle: getLocalized(data.feature3ShortTitle),
            description: getLocalized(data.feature3Description),
            images: feature3Urls.filter(Boolean),
          },
          {
            title: getLocalized(data.feature4Title),
            shortTitle: getLocalized(data.feature4ShortTitle),
            description: getLocalized(data.feature4Description),
            images: feature4Urls.filter(Boolean),
          },
          {
            title: getLocalized(data.feature5Title),
            shortTitle: getLocalized(data.feature5ShortTitle),
            description: getLocalized(data.feature5Description),
            images: feature5Urls.filter(Boolean),
          },
        ],
      }
    })() : null

    // 4. Fetch Simple CTA
    const simpleCtaData = await context.query.SimpleCta.findMany({
      where: { status: { equals: 'PUBLISHED' } },
      take: 1,
      query: `
        title
        title2
        subtitle
        description
        buttonText
        image1
        image2
        image3
      `,
    })

    const simpleCta = simpleCtaData[0] ? await (async () => {
      const data = simpleCtaData[0]

      // Collect all image IDs
      const imageIds = [data.image1, data.image2, data.image3]
        .map(getMediaId).filter(Boolean)

      // Batch fetch URLs
      const imageUrls = await Promise.all(
        imageIds.map(id => fetchMediaUrl(id!))
      )

      return {
        title: getLocalized(data.title),
        title2: getLocalized(data.title2),
        subtitle: getLocalized(data.subtitle),
        description: getLocalized(data.description),
        buttonText: getLocalized(data.buttonText),
        images: imageUrls.filter(Boolean),
      }
    })() : null

    // 5. Fetch Series Intro
    const seriesIntroData = await context.query.SeriesIntro.findMany({
      where: { status: { equals: 'PUBLISHED' } },
      query: `
        id
        internalLabel
        title
        description
        images
        productSeries {
          id
          slug
        }
      `,
    })

    const seriesIntro = await Promise.all(
      seriesIntroData.map(async (item: any) => {
        // Extract Media IDs from images field
        const imageIds = (item.images?.images || []).map(getMediaId).filter(Boolean)

        // Convert Media IDs to URLs
        const imageUrls = await Promise.all(
          imageIds.map(id => fetchMediaUrl(id!))
        )

        return {
          id: item.id,
          title: getLocalized(item.title),
          description: getLocalized(item.description),
          images: imageUrls.filter(Boolean),
          productSeriesSlug: item.productSeries?.slug,
        }
      })
    )

    // 6. Fetch Featured Products
    const featuredProductsData = await context.query.FeaturedProducts.findMany({
      where: { status: { equals: 'PUBLISHED' } },
      take: 1,
      query: `
        title
        description
        viewAllButtonText
        categories
      `,
    })

    const featuredProducts = featuredProductsData[0] ? {
      title: getLocalized(featuredProductsData[0].title),
      description: getLocalized(featuredProductsData[0].description),
      viewAllButtonText: getLocalized(featuredProductsData[0].viewAllButtonText),
      categories: featuredProductsData[0].categories || [],
    } : null

    // 7. Fetch Brand Advantages
    const brandAdvantagesData = await context.query.BrandAdvantages.findMany({
      where: { status: { equals: 'PUBLISHED' } },
      take: 1,
      query: `
        advantage1
        icon1
        advantage2
        icon2
        advantage3
        icon3
        advantage4
        icon4
        advantage5
        icon5
        advantage6
        icon6
        advantage7
        icon7
        advantage8
        icon8
        advantage9
        icon9
      `,
    })

    const brandAdvantages = brandAdvantagesData[0] ? await (async () => {
      const data = brandAdvantagesData[0]

      // Collect all icon IDs
      const iconIds = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        .map(i => getMediaId(data[`icon${i}`]))
        .filter(Boolean)

      // Batch fetch icon URLs
      const iconUrls = await Promise.all(
        iconIds.map(id => fetchMediaUrl(id!))
      )

      // Map icons back to their positions
      let iconIndex = 0
      const advantages = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
        const text = getLocalized(data[`advantage${i}`])
        const hasIcon = getMediaId(data[`icon${i}`])
        return {
          text,
          icon: hasIcon ? iconUrls[iconIndex++] : null,
        }
      }).filter(item => item.text)

      return { advantages }
    })() : null

    // 8. Fetch OEM/ODM
    const oemOdmData = await context.query.OemOdm.findMany({
      where: { status: { equals: 'PUBLISHED' } },
      take: 1,
      query: `
        oemTitle
        oemBgImage
        oemImage
        oemDescription1
        oemDescription2
        odmTitle
        odmBgImage
        odmImage
        odmDescription1
        odmDescription2
      `,
    })

    const oemOdm = oemOdmData[0] ? await (async () => {
      const data = oemOdmData[0]

      // Collect all image IDs
      const imageIds = [data.oemBgImage, data.oemImage, data.odmBgImage, data.odmImage]
        .map(getMediaId).filter(Boolean)

      // Batch fetch URLs
      const imageUrls = await Promise.all(
        imageIds.map(id => fetchMediaUrl(id!))
      )

      // Map URLs back (maintaining order)
      const urlMap: Record<string, string | null> = {}
      let urlIndex = 0
      ;[data.oemBgImage, data.oemImage, data.odmBgImage, data.odmImage].forEach(field => {
        const id = getMediaId(field)
        if (id) {
          urlMap[id] = imageUrls[urlIndex++]
        }
      })

      return {
        oem: {
          title: getLocalized(data.oemTitle),
          bgImage: urlMap[getMediaId(data.oemBgImage)!] || null,
          image: urlMap[getMediaId(data.oemImage)!] || null,
          description: [
            getLocalized(data.oemDescription1),
            getLocalized(data.oemDescription2),
          ].filter(Boolean),
        },
        odm: {
          title: getLocalized(data.odmTitle),
          bgImage: urlMap[getMediaId(data.odmBgImage)!] || null,
          image: urlMap[getMediaId(data.odmImage)!] || null,
          description: [
            getLocalized(data.odmDescription1),
            getLocalized(data.odmDescription2),
          ].filter(Boolean),
        },
      }
    })() : null

    // 9. Fetch Quote Steps
    const quoteStepsData = await context.query.QuoteSteps.findMany({
      where: { status: { equals: 'PUBLISHED' } },
      take: 1,
      query: `
        title
        title2
        subtitle
        description
        step1Text
        step1Image
        step2Text
        step2Image
        step3Text
        step3Image
        step4Text
        step4Image
        step5Text
        step5Image
      `,
    })

    const quoteSteps = quoteStepsData[0] ? await (async () => {
      const data = quoteStepsData[0]

      // Collect all step image IDs
      const stepImageIds = [1, 2, 3, 4, 5]
        .map(i => getMediaId(data[`step${i}Image`]))
        .filter(Boolean)

      // Batch fetch step image URLs
      const stepImageUrls = await Promise.all(
        stepImageIds.map(id => fetchMediaUrl(id!))
      )

      // Map images back to their positions
      let imageIndex = 0
      const steps = [1, 2, 3, 4, 5].map(i => {
        const text = getLocalized(data[`step${i}Text`])
        const hasImage = getMediaId(data[`step${i}Image`])
        return {
          text,
          image: hasImage ? stepImageUrls[imageIndex++] : null,
        }
      }).filter(step => step.text)

      return {
        title: getLocalized(data.title),
        title2: getLocalized(data.title2),
        subtitle: getLocalized(data.subtitle),
        description: getLocalized(data.description),
        steps,
      }
    })() : null

    // 10. Fetch Main Form
    const mainFormData = await context.query.MainForm.findMany({
      where: { status: { equals: 'PUBLISHED' } },
      take: 1,
      query: `
        placeholderName
        placeholderEmail
        placeholderWhatsapp
        placeholderCompany
        placeholderMessage
        placeholderVerify
        buttonText
        designTextLeft
        designTextRight
        image1
        image2
      `,
    })

    const mainForm = mainFormData[0] ? await (async () => {
      const data = mainFormData[0]

      // Collect all image IDs
      const imageIds = [data.image1, data.image2]
        .map(getMediaId).filter(Boolean)

      // Batch fetch URLs
      const imageUrls = await Promise.all(
        imageIds.map(id => fetchMediaUrl(id!))
      )

      return {
        placeholders: {
          name: getLocalized(data.placeholderName),
          email: getLocalized(data.placeholderEmail),
          whatsapp: getLocalized(data.placeholderWhatsapp),
          company: getLocalized(data.placeholderCompany),
          message: getLocalized(data.placeholderMessage),
          verify: getLocalized(data.placeholderVerify),
        },
        buttonText: getLocalized(data.buttonText),
        designText: {
          left: getLocalized(data.designTextLeft),
          right: getLocalized(data.designTextRight),
        },
        images: imageUrls.filter(Boolean),
      }
    })() : null

    // 11. Fetch Why Choose Busrom
    const whyChooseData = await context.query.WhyChooseBusrom.findMany({
      where: { status: { equals: 'PUBLISHED' } },
      take: 1,
      query: `
        title
        title2
        viewMoreButtonText
        viewMoreButtonUrl
        reason1Title
        reason1Description
        reason1Image
        reason2Title
        reason2Description
        reason2Image
        reason3Title
        reason3Description
        reason3Image
        reason4Title
        reason4Description
        reason4Image
        reason5Title
        reason5Description
        reason5Image
      `,
    })

    const whyChoose = whyChooseData[0] ? await (async () => {
      const data = whyChooseData[0]

      // Collect all reason image IDs
      const reasonImageIds = [1, 2, 3, 4, 5]
        .map(i => getMediaId(data[`reason${i}Image`]))
        .filter(Boolean)

      // Batch fetch reason image URLs
      const reasonImageUrls = await Promise.all(
        reasonImageIds.map(id => fetchMediaUrl(id!))
      )

      // Map images back to their positions
      let imageIndex = 0
      const reasons = [1, 2, 3, 4, 5].map(i => {
        const title = getLocalized(data[`reason${i}Title`])
        const description = getLocalized(data[`reason${i}Description`])
        const hasImage = getMediaId(data[`reason${i}Image`])
        return {
          title,
          description,
          image: hasImage ? reasonImageUrls[imageIndex++] : null,
        }
      }).filter(reason => reason.title)

      return {
        title: getLocalized(data.title),
        title2: getLocalized(data.title2),
        viewMoreButtonText: getLocalized(data.viewMoreButtonText),
        viewMoreButtonUrl: data.viewMoreButtonUrl,
        reasons,
      }
    })() : null

    // 12. Fetch Case Studies with Applications
    const caseStudiesData = await context.query.CaseStudies.findMany({
      where: { status: { equals: 'PUBLISHED' } },
      take: 1,
      query: `
        title
        description
        categories
      `,
    })

    const caseStudies = caseStudiesData[0] ? await (async () => {
      const data = caseStudiesData[0]
      const categoryIds: string[] = data.categories || []

      if (categoryIds.length === 0) {
        return {
          title: getLocalized(data.title),
          description: getLocalized(data.description),
          applications: [],
        }
      }

      // Fetch applications for each category
      const applications = await Promise.all(
        categoryIds.map(async (categoryId: string) => {
          try {
            // Get category info
            const category = await context.query.Category.findOne({
              where: { id: categoryId },
              query: 'id name slug',
            })

            // Get applications for this category
            const apps = await context.query.Application.findMany({
              where: {
                category: { id: { equals: categoryId } },
                status: { equals: 'PUBLISHED' },
              },
              take: 3,
              query: 'id slug name mainImage images',
            })

            if (!apps || apps.length === 0) return null

            // Build items array with images
            const items = await Promise.all(
              apps.map(async (app: any) => {
                // Try mainImage first, then first image from images array
                let imageId = app.mainImage
                if (!imageId && Array.isArray(app.images) && app.images.length > 0) {
                  imageId = app.images[0]
                }

                const imageUrl = imageId ? await fetchMediaUrl(imageId) : null

                return {
                  series: getLocalized(category?.name) || '',
                  slug: app.slug,
                  image: imageUrl ? {
                    url: imageUrl,
                    altText: getLocalized(app.name) || app.slug,
                  } : null,
                }
              })
            )

            const validItems = items.filter((item: any) => item.image && item.image.url)
            return validItems.length > 0 ? { items: validItems } : null
          } catch (error) {
            console.error(`Error fetching applications for category ${categoryId}:`, error)
            return null
          }
        })
      )

      // Filter out null results
      const validApplications = applications.filter((app): app is { items: any[] } => app !== null)

      return {
        title: getLocalized(data.title),
        description: getLocalized(data.description),
        applications: validApplications,
      }
    })() : null

    // 13. Fetch Brand Analysis
    const brandAnalysisData = await context.query.BrandAnalysis.findMany({
      where: { status: { equals: 'PUBLISHED' } },
      take: 1,
      query: `
        analysisTitle
        analysisTitle2
        analysisText
        analysisText2
        brandCenterTitle
        brandCenterDescription
        brandCenterLargeImage
        brandCenterSmallImage
        projectCenterTitle
        projectCenterDescription
        projectCenterLargeImage
        projectCenterSmallImage
        serviceCenterTitle
        serviceCenterDescription
        serviceCenterLargeImage
        serviceCenterSmallImage
      `,
    })

    const brandAnalysis = brandAnalysisData[0] ? await (async () => {
      const data = brandAnalysisData[0]

      // Collect all image IDs
      const imageIds = [
        data.brandCenterLargeImage,
        data.brandCenterSmallImage,
        data.projectCenterLargeImage,
        data.projectCenterSmallImage,
        data.serviceCenterLargeImage,
        data.serviceCenterSmallImage,
      ].map(getMediaId).filter(Boolean)

      // Batch fetch URLs
      const imageUrls = await Promise.all(
        imageIds.map(id => fetchMediaUrl(id!))
      )

      // Map URLs back to their positions
      let imageIndex = 0
      const getImageUrl = (field: any) => {
        const id = getMediaId(field)
        return id ? imageUrls[imageIndex++] : null
      }

      return {
        analysisTitle: getLocalized(data.analysisTitle),
        analysisTitle2: getLocalized(data.analysisTitle2),
        analysisText: getLocalized(data.analysisText),
        analysisText2: getLocalized(data.analysisText2),
        centers: [
          {
            title: getLocalized(data.brandCenterTitle),
            description: getLocalized(data.brandCenterDescription),
            largeImage: getImageUrl(data.brandCenterLargeImage),
            smallImage: getImageUrl(data.brandCenterSmallImage),
          },
          {
            title: getLocalized(data.projectCenterTitle),
            description: getLocalized(data.projectCenterDescription),
            largeImage: getImageUrl(data.projectCenterLargeImage),
            smallImage: getImageUrl(data.projectCenterSmallImage),
          },
          {
            title: getLocalized(data.serviceCenterTitle),
            description: getLocalized(data.serviceCenterDescription),
            largeImage: getImageUrl(data.serviceCenterLargeImage),
            smallImage: getImageUrl(data.serviceCenterSmallImage),
          },
        ],
      }
    })() : null

    // 14. Fetch Brand Value
    const brandValueData = await context.query.BrandValue.findMany({
      where: { status: { equals: 'PUBLISHED' } },
      take: 1,
      query: `
        title
        subtitle
        param1Title
        param1Description
        param1Image
        param2Title
        param2Description
        param2Image
        sloganTitle
        sloganDescription
        sloganImage
        valueTitle
        valueDescription
        valueImage
        visionTitle
        visionDescription
        visionImage
      `,
    })

    const brandValue = brandValueData[0] ? await (async () => {
      const data = brandValueData[0]

      // Collect all image IDs
      const imageIds = [
        data.param1Image,
        data.param2Image,
        data.sloganImage,
        data.valueImage,
        data.visionImage,
      ].map(getMediaId).filter(Boolean)

      // Batch fetch URLs
      const imageUrls = await Promise.all(
        imageIds.map(id => fetchMediaUrl(id!))
      )

      // Map URLs back to their positions
      let imageIndex = 0
      const items = [
        {
          title: getLocalized(data.param1Title),
          description: getLocalized(data.param1Description),
          image: getMediaId(data.param1Image) ? imageUrls[imageIndex++] : null,
        },
        {
          title: getLocalized(data.param2Title),
          description: getLocalized(data.param2Description),
          image: getMediaId(data.param2Image) ? imageUrls[imageIndex++] : null,
        },
        {
          title: getLocalized(data.sloganTitle),
          description: getLocalized(data.sloganDescription),
          image: getMediaId(data.sloganImage) ? imageUrls[imageIndex++] : null,
        },
        {
          title: getLocalized(data.valueTitle),
          description: getLocalized(data.valueDescription),
          image: getMediaId(data.valueImage) ? imageUrls[imageIndex++] : null,
        },
        {
          title: getLocalized(data.visionTitle),
          description: getLocalized(data.visionDescription),
          image: getMediaId(data.visionImage) ? imageUrls[imageIndex++] : null,
        },
      ].filter(item => item.title || item.description)

      return {
        title: getLocalized(data.title),
        subtitle: getLocalized(data.subtitle),
        items,
      }
    })() : null

    // Return complete home content
    const homeContent = {
      locale,
      heroBanner,
      productSeriesCarousel,
      serviceFeatures,
      simpleCta,
      seriesIntro,
      featuredProducts,
      brandAdvantages,
      oemOdm,
      quoteSteps,
      mainForm,
      whyChoose,
      caseStudies,
      brandAnalysis,
      brandValue,
    }

    res.json(homeContent)
  } catch (error: any) {
    console.error('Home Content API Error:', error)
    res.status(500).json({ error: 'Failed to fetch home content', message: error.message })
  }
}
