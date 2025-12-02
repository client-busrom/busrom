/**
 * Home Content Seed Manager
 *
 * Usage:
 *   node scripts/seed-home-content.js --all              # Seed all modules
 *   node scripts/seed-home-content.js --module hero      # Seed specific module
 *   node scripts/seed-home-content.js --list             # List available modules
 *
 * Environment:
 *   KEYSTONE_URL - Keystone GraphQL endpoint (default: http://localhost:3000)
 */

const fetch = require('node-fetch')
const { seedApplications } = require('./seed-applications')

const KEYSTONE_URL = process.env.KEYSTONE_URL || 'http://localhost:3000'

// Parse command line arguments
const args = process.argv.slice(2)
const flags = {
  all: args.includes('--all'),
  module: args.includes('--module') ? args[args.indexOf('--module') + 1] : null,
  list: args.includes('--list'),
}

// Available seed modules
const SEED_MODULES = {
  applicationCategories: 'Application Categories (10 series)',
  applications: 'Application Items (10 items with translations)',
  hero: 'HeroBannerItem',
  carousel: 'ProductSeriesCarousel',
  serviceFeatures: 'ServiceFeaturesConfig',
  simpleCta: 'SimpleCta',
  seriesIntro: 'SeriesIntro',
  featuredProducts: 'FeaturedProducts',
  brandAdvantages: 'BrandAdvantages',
  oemOdm: 'OemOdm',
  quoteSteps: 'QuoteSteps',
  mainForm: 'MainForm',
  whyChoose: 'WhyChooseBusrom',
  caseStudies: 'CaseStudies',
  brandAnalysis: 'BrandAnalysis',
  brandValue: 'BrandValue',
}

async function graphqlRequest(query, variables = {}) {
  try {
    const response = await fetch(`${KEYSTONE_URL}/api/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    })
    const json = await response.json()
    if (json.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(json.errors, null, 2)}`)
    }
    return json.data
  } catch (error) {
    console.error('❌ GraphQL Request Failed:', error.message)
    throw error
  }
}

async function getPlaceholderMedia() {
  const query = `
    query {
      mediaFiles(take: 1) {
        id
        filename
      }
    }
  `
  const data = await graphqlRequest(query)
  if (!data.mediaFiles || data.mediaFiles.length === 0) {
    throw new Error('No media found! Please upload at least one media file first.')
  }
  return data.mediaFiles[0]
}

async function seedApplicationCategories() {
  console.log('\n📋 Seeding APPLICATION Categories (10 series)...')

  const categoriesData = require('./seed-data/application-categories-data.json')

  const createdIds = []
  let created = 0

  for (const category of categoriesData) {
    const mutation = `
      mutation CreateCategory($data: CategoryCreateInput!) {
        createCategory(data: $data) {
          id
          name
          slug
        }
      }
    `

    try {
      const result = await graphqlRequest(mutation, { data: category })
      createdIds.push(result.createCategory.id)
      created++
      console.log(`  ✅ ${created}/10: ${category.name.en}`)
    } catch (error) {
      console.error(`  ❌ Failed: ${category.name.en}`, error.message)
    }
  }

  console.log(`\n  📝 Created ${created} APPLICATION categories`)
  return { count: created, ids: createdIds }
}

async function seedHeroBannerItems(placeholderMedia) {
  console.log('\n📋 Seeding HeroBannerItem (9 items)...')

  const heroBannerData = require('./seed-data/hero-banner-data.json')

  let created = 0
  for (const item of heroBannerData) {
    const mutation = `
      mutation CreateHeroBannerItem($data: HeroBannerItemCreateInput!) {
        createHeroBannerItem(data: $data) {
          id
          title
        }
      }
    `
    const data = {
      ...item,
      image1: placeholderMedia.id,
      image2: placeholderMedia.id,
      image3: placeholderMedia.id,
      image4: placeholderMedia.id,
      status: 'PUBLISHED',
      enabled: true,
      publishedAt: new Date().toISOString(),
    }

    try {
      await graphqlRequest(mutation, { data })
      created++
      console.log(`  ✅ ${created}/9: ${item.title.en}`)
    } catch (error) {
      console.error(`  ❌ Failed: ${item.title.en}`, error.message)
    }
  }

  return created
}

async function seedProductSeriesCarousel(placeholderMedia) {
  console.log('\n📋 Seeding ProductSeriesCarousel (singleton)...')

  const carouselData = require('./seed-data/product-series-carousel-data.json')

  // Add placeholder media IDs to each item
  const itemsWithMedia = {}
  for (const [lang, items] of Object.entries(carouselData.items)) {
    itemsWithMedia[lang] = items.map(item => ({
      ...item,
      image: placeholderMedia.id,
      sceneImage: placeholderMedia.id,
    }))
  }

  const mutation = `
    mutation CreateProductSeriesCarousel($data: ProductSeriesCarouselCreateInput!) {
      createProductSeriesCarousel(data: $data) {
        id
        internalLabel
      }
    }
  `

  const data = {
    internalLabel: carouselData.internalLabel,
    autoPlay: carouselData.autoPlay,
    autoPlaySpeed: carouselData.autoPlaySpeed,
    status: carouselData.status,
    items: itemsWithMedia,
  }

  try {
    await graphqlRequest(mutation, { data })
    console.log(`  ✅ Created ProductSeriesCarousel (9 items in EN + ZH)`)
    return 1
  } catch (error) {
    console.error(`  ❌ Failed:`, error.message)
    return 0
  }
}

async function seedServiceFeaturesConfig(placeholderMedia) {
  console.log('\n📋 Seeding ServiceFeaturesConfig (singleton)...')

  const featuresData = require('./seed-data/service-features-data.json')

  const mutation = `
    mutation CreateServiceFeaturesConfig($data: ServiceFeaturesConfigCreateInput!) {
      createServiceFeaturesConfig(data: $data) {
        id
        internalLabel
      }
    }
  `

  const data = {
    internalLabel: featuresData.internalLabel,
    title: featuresData.title,
    subtitle: featuresData.subtitle,
    // Feature 1 (4 images)
    feature1Title: featuresData.feature1Title,
    feature1ShortTitle: featuresData.feature1ShortTitle,
    feature1Description: featuresData.feature1Description,
    feature1Image1: placeholderMedia.id,
    feature1Image2: placeholderMedia.id,
    feature1Image3: placeholderMedia.id,
    feature1Image4: placeholderMedia.id,
    // Feature 2 (2 images)
    feature2Title: featuresData.feature2Title,
    feature2ShortTitle: featuresData.feature2ShortTitle,
    feature2Description: featuresData.feature2Description,
    feature2Image1: placeholderMedia.id,
    feature2Image2: placeholderMedia.id,
    // Feature 3 (6 images)
    feature3Title: featuresData.feature3Title,
    feature3ShortTitle: featuresData.feature3ShortTitle,
    feature3Description: featuresData.feature3Description,
    feature3Image1: placeholderMedia.id,
    feature3Image2: placeholderMedia.id,
    feature3Image3: placeholderMedia.id,
    feature3Image4: placeholderMedia.id,
    feature3Image5: placeholderMedia.id,
    feature3Image6: placeholderMedia.id,
    // Feature 4 (2 images)
    feature4Title: featuresData.feature4Title,
    feature4ShortTitle: featuresData.feature4ShortTitle,
    feature4Description: featuresData.feature4Description,
    feature4Image1: placeholderMedia.id,
    feature4Image2: placeholderMedia.id,
    // Feature 5 (2 images)
    feature5Title: featuresData.feature5Title,
    feature5ShortTitle: featuresData.feature5ShortTitle,
    feature5Description: featuresData.feature5Description,
    feature5Image1: placeholderMedia.id,
    feature5Image2: placeholderMedia.id,
    status: featuresData.status,
  }

  try {
    await graphqlRequest(mutation, { data })
    console.log(`  ✅ Created ServiceFeaturesConfig (5 features with 16 total images)`)
    return 1
  } catch (error) {
    console.error(`  ❌ Failed:`, error.message)
    return 0
  }
}

async function seedSimpleCta(placeholderMedia) {
  console.log('\n📋 Seeding SimpleCta (singleton)...')

  const ctaData = require('./seed-data/simple-cta-data.json')

  const mutation = `
    mutation CreateSimpleCta($data: SimpleCtaCreateInput!) {
      createSimpleCta(data: $data) {
        id
        internalLabel
      }
    }
  `

  const data = {
    ...ctaData,
    image1: placeholderMedia.id,
    image2: placeholderMedia.id,
    image3: placeholderMedia.id,
  }

  try {
    await graphqlRequest(mutation, { data })
    console.log(`  ✅ Created SimpleCta`)
    return 1
  } catch (error) {
    console.error(`  ❌ Failed:`, error.message)
    return 0
  }
}

async function seedSeriesIntro(placeholderMedia) {
  console.log('\n📋 Seeding SeriesIntro (10 items)...')

  const seriesIntroData = require('./seed-data/series-intro-data.json')

  // First, fetch all ProductSeries to get their IDs
  const seriesQuery = `
    query {
      productSeriesItems {
        id
        slug
      }
    }
  `
  const seriesResult = await graphqlRequest(seriesQuery)
  const seriesMap = {}
  seriesResult.productSeriesItems.forEach(series => {
    seriesMap[series.slug] = series.id
  })

  let created = 0
  for (const item of seriesIntroData) {
    const seriesId = seriesMap[item.productSeriesSlug]
    if (!seriesId) {
      console.log(`  ⚠️  Skipping: ProductSeries '${item.productSeriesSlug}' not found`)
      continue
    }

    const mutation = `
      mutation CreateSeriesIntro($data: SeriesIntroCreateInput!) {
        createSeriesIntro(data: $data) {
          id
          title
        }
      }
    `

    const data = {
      internalLabel: `${item.title.en} Series Introduction`,
      title: item.title,
      description: item.description,
      images: item.images,
      productSeries: { connect: { id: seriesId } },
      status: item.status,
    }

    try {
      await graphqlRequest(mutation, { data })
      created++
      console.log(`  ✅ ${created}/10: ${item.title.en}`)
    } catch (error) {
      console.error(`  ❌ Failed: ${item.title.en}`, error.message)
    }
  }

  return created
}

async function seedFeaturedProducts(placeholderMedia, productSeriesIds = []) {
  console.log('\n📋 Seeding FeaturedProducts (singleton)...')

  if (productSeriesIds.length === 0) {
    console.log('🔍 Fetching ProductSeries IDs...')
    const seriesQuery = `
      query {
        productSeriesItems(take: 6) {
          id
        }
      }
    `
    const seriesResult = await graphqlRequest(seriesQuery)
    productSeriesIds = seriesResult.productSeriesItems?.map(s => s.id) || []
  }

  if (productSeriesIds.length === 0) {
    console.log('⚠️  No ProductSeries found! Cannot create FeaturedProducts.')
    return 0
  }

  const featuredProductsData = require('./seed-data/featured-products-data.json')

  const mutation = `
    mutation CreateFeaturedProducts($data: FeaturedProductsCreateInput!) {
      createFeaturedProducts(data: $data) {
        id
        internalLabel
      }
    }
  `

  // Use first 6 ProductSeries for featured display
  const selectedSeriesIds = productSeriesIds.slice(0, 6)

  const data = {
    ...featuredProductsData,
    categories: selectedSeriesIds, // JSON field, just array of IDs
  }

  try {
    await graphqlRequest(mutation, { data })
    console.log(`  ✅ Created FeaturedProducts with ${selectedSeriesIds.length} series`)
    return 1
  } catch (error) {
    console.error(`  ❌ Failed:`, error.message)
    return 0
  }
}

async function seedBrandAdvantages(placeholderMedia) {
  console.log('\n📋 Seeding BrandAdvantages (singleton with 9 advantages)...')

  const advantagesData = require('./seed-data/brand-advantages-data.json')

  const mutation = `
    mutation CreateBrandAdvantages($data: BrandAdvantagesCreateInput!) {
      createBrandAdvantages(data: $data) {
        id
        internalLabel
      }
    }
  `

  const data = {
    ...advantagesData,
  }

  try {
    await graphqlRequest(mutation, { data })
    console.log(`  ✅ Created BrandAdvantages (9 advantages)`)
    return 1
  } catch (error) {
    console.error(`  ❌ Failed:`, error.message)
    return 0
  }
}

async function seedOemOdm(placeholderMedia) {
  console.log('\n📋 Seeding OemOdm (singleton)...')

  const oemOdmData = require('./seed-data/oem-odm-data.json')

  const mutation = `
    mutation CreateOemOdm($data: OemOdmCreateInput!) {
      createOemOdm(data: $data) {
        id
        internalLabel
      }
    }
  `

  const data = {
    internalLabel: oemOdmData.internalLabel,
    oemTitle: oemOdmData.oemTitle,
    oemDescription1: oemOdmData.oemDescription1,
    oemDescription2: oemOdmData.oemDescription2,
    oemBgImage: placeholderMedia.id,
    oemImage: placeholderMedia.id,
    odmTitle: oemOdmData.odmTitle,
    odmDescription1: oemOdmData.odmDescription1,
    odmDescription2: oemOdmData.odmDescription2,
    odmBgImage: placeholderMedia.id,
    odmImage: placeholderMedia.id,
    status: oemOdmData.status,
  }

  try {
    await graphqlRequest(mutation, { data })
    console.log(`  ✅ Created OemOdm`)
    return 1
  } catch (error) {
    console.error(`  ❌ Failed:`, error.message)
    return 0
  }
}

async function seedQuoteSteps(placeholderMedia) {
  console.log('\n📋 Seeding QuoteSteps (singleton)...')

  const quoteStepsData = require('./seed-data/quote-steps-data.json')

  const mutation = `
    mutation CreateQuoteSteps($data: QuoteStepsCreateInput!) {
      createQuoteSteps(data: $data) {
        id
        internalLabel
      }
    }
  `

  const data = {
    ...quoteStepsData,
  }

  try {
    await graphqlRequest(mutation, { data })
    console.log(`  ✅ Created QuoteSteps (5 steps)`)
    return 1
  } catch (error) {
    console.error(`  ❌ Failed:`, error.message)
    return 0
  }
}

async function seedMainForm(placeholderMedia) {
  console.log('\n📋 Seeding MainForm (singleton)...')

  const mainFormData = require('./seed-data/main-form-data.json')

  const mutation = `
    mutation CreateMainForm($data: MainFormCreateInput!) {
      createMainForm(data: $data) {
        id
        internalLabel
      }
    }
  `

  const data = {
    ...mainFormData,
  }

  try {
    await graphqlRequest(mutation, { data })
    console.log(`  ✅ Created MainForm`)
    return 1
  } catch (error) {
    console.error(`  ❌ Failed:`, error.message)
    return 0
  }
}

async function seedWhyChooseBusrom(placeholderMedia) {
  console.log('\n📋 Seeding WhyChooseBusrom (singleton)...')

  const whyChooseData = require('./seed-data/why-choose-busrom-data.json')

  const mutation = `
    mutation CreateWhyChooseBusrom($data: WhyChooseBusromCreateInput!) {
      createWhyChooseBusrom(data: $data) {
        id
        internalLabel
      }
    }
  `

  const data = {
    ...whyChooseData,
  }

  try {
    await graphqlRequest(mutation, { data })
    console.log(`  ✅ Created WhyChooseBusrom (5 reasons)`)
    return 1
  } catch (error) {
    console.error(`  ❌ Failed:`, error.message)
    return 0
  }
}

async function seedCaseStudies(placeholderMedia, applicationCategoryIds = []) {
  console.log('\n📋 Seeding CaseStudies (singleton)...')

  // Fetch APPLICATION categories if not provided
  if (applicationCategoryIds.length === 0) {
    console.log('🔍 Fetching APPLICATION category IDs...')
    const categoriesQuery = `
      query {
        categories(where: { type: { equals: "APPLICATION" } }) {
          id
        }
      }
    `
    const categoriesResult = await graphqlRequest(categoriesQuery)
    applicationCategoryIds = categoriesResult.categories?.map(c => c.id) || []

    if (applicationCategoryIds.length === 0) {
      console.log('⚠️  No APPLICATION categories found. Please seed applicationCategories first!')
      return 0
    }
  }

  const caseStudiesData = require('./seed-data/case-studies-data.json')

  const mutation = `
    mutation CreateCaseStudies($data: CaseStudiesCreateInput!) {
      createCaseStudies(data: $data) {
        id
        internalLabel
      }
    }
  `

  // Use first 3 APPLICATION categories for the case studies display
  const selectedCategoryIds = applicationCategoryIds.slice(0, 3)

  const data = {
    ...caseStudiesData,
    categories: selectedCategoryIds, // JSON field, just array of IDs
  }

  try {
    await graphqlRequest(mutation, { data })
    console.log(`  ✅ Created CaseStudies with ${selectedCategoryIds.length} categories`)
    return 1
  } catch (error) {
    console.error(`  ❌ Failed:`, error.message)
    return 0
  }
}

async function seedBrandAnalysis(placeholderMedia) {
  console.log('\n📋 Seeding BrandAnalysis (singleton)...')

  const brandAnalysisData = require('./seed-data/brand-analysis-data.json')

  const mutation = `
    mutation CreateBrandAnalysis($data: BrandAnalysisCreateInput!) {
      createBrandAnalysis(data: $data) {
        id
        internalLabel
      }
    }
  `

  const data = {
    ...brandAnalysisData,
  }

  try {
    await graphqlRequest(mutation, { data })
    console.log(`  ✅ Created BrandAnalysis (4 centers)`)
    return 1
  } catch (error) {
    console.error(`  ❌ Failed:`, error.message)
    return 0
  }
}

async function seedBrandValue(placeholderMedia) {
  console.log('\n📋 Seeding BrandValue (singleton)...')

  const brandValueData = require('./seed-data/brand-value-data.json')

  const mutation = `
    mutation CreateBrandValue($data: BrandValueCreateInput!) {
      createBrandValue(data: $data) {
        id
        internalLabel
      }
    }
  `

  const data = {
    ...brandValueData,
  }

  try {
    await graphqlRequest(mutation, { data })
    console.log(`  ✅ Created BrandValue (5 value sections)`)
    return 1
  } catch (error) {
    console.error(`  ❌ Failed:`, error.message)
    return 0
  }
}

async function seedModule(moduleName, placeholderMedia, options = {}) {
  console.log(`\n🌱 Seeding ${SEED_MODULES[moduleName] || moduleName}...`)

  switch (moduleName) {
    case 'applicationCategories':
      return await seedApplicationCategories()

    case 'applications':
      return await seedApplications(graphqlRequest, placeholderMedia.id)

    case 'hero':
      return await seedHeroBannerItems(placeholderMedia)

    case 'carousel':
      return await seedProductSeriesCarousel(placeholderMedia)

    case 'serviceFeatures':
      return await seedServiceFeaturesConfig(placeholderMedia)

    case 'simpleCta':
      return await seedSimpleCta(placeholderMedia)

    case 'seriesIntro':
      return await seedSeriesIntro(placeholderMedia)

    case 'featuredProducts':
      return await seedFeaturedProducts(placeholderMedia, options.productSeriesIds)

    case 'brandAdvantages':
      return await seedBrandAdvantages(placeholderMedia)

    case 'oemOdm':
      return await seedOemOdm(placeholderMedia)

    case 'quoteSteps':
      return await seedQuoteSteps(placeholderMedia)

    case 'mainForm':
      return await seedMainForm(placeholderMedia)

    case 'whyChoose':
      return await seedWhyChooseBusrom(placeholderMedia)

    case 'caseStudies':
      return await seedCaseStudies(placeholderMedia, options.applicationCategoryIds)

    case 'brandAnalysis':
      return await seedBrandAnalysis(placeholderMedia)

    case 'brandValue':
      return await seedBrandValue(placeholderMedia)

    default:
      console.error(`❌ Unknown module: ${moduleName}`)
      return 0
  }
}

async function main() {
  console.log('🌱 Home Content Seed Manager')
  console.log(`🔗 Keystone URL: ${KEYSTONE_URL}\n`)

  // List modules
  if (flags.list) {
    console.log('📋 Available modules:')
    Object.entries(SEED_MODULES).forEach(([key, name]) => {
      console.log(`  - ${key.padEnd(20)} (${name})`)
    })
    console.log('\nUsage:')
    console.log('  node scripts/seed-home-content.js --module hero')
    console.log('  node scripts/seed-home-content.js --all')
    return
  }

  // Check connection
  try {
    const placeholder = await getPlaceholderMedia()
    console.log(`📷 Placeholder media: ${placeholder.filename}\n`)

    let totalSeeded = 0
    let applicationCategoryIds = []

    // Seed all modules
    if (flags.all) {
      console.log('🚀 Seeding ALL modules...')

      // First, seed APPLICATION categories
      console.log('\n📌 Step 1: Creating APPLICATION categories (required for CaseStudies)...')
      const categoryResult = await seedApplicationCategories()
      applicationCategoryIds = categoryResult.ids
      totalSeeded += categoryResult.count

      // Then seed all other modules
      console.log('\n📌 Step 2: Creating all home content modules...')
      for (const moduleName of Object.keys(SEED_MODULES)) {
        if (moduleName === 'applicationCategories') continue // Already seeded

        const result = await seedModule(moduleName, placeholder, { applicationCategoryIds })
        const count = typeof result === 'object' ? result.count : result
        totalSeeded += count
      }
    }
    // Seed specific module
    else if (flags.module) {
      if (flags.module === 'applicationCategories') {
        const result = await seedApplicationCategories()
        totalSeeded = result.count
      } else {
        // For caseStudies, check if APPLICATION categories exist
        if (flags.module === 'caseStudies') {
          console.log('\n🔍 Checking for existing APPLICATION categories...')
          const query = `
            query {
              categories(where: { type: { equals: "APPLICATION" } }) {
                id
              }
            }
          `
          const data = await graphqlRequest(query)
          applicationCategoryIds = data.categories?.map(c => c.id) || []

          if (applicationCategoryIds.length === 0) {
            console.log('⚠️  No APPLICATION categories found!')
            console.log('⚠️  Please run: node scripts/seed-home-content.js --module applicationCategories')
            process.exit(1)
          }
          console.log(`✅ Found ${applicationCategoryIds.length} APPLICATION categories`)
        }

        const result = await seedModule(flags.module, placeholder, { applicationCategoryIds })
        totalSeeded = typeof result === 'object' ? result.count : result
      }
    }
    // No flags - show help
    else {
      console.log('❌ No module specified!')
      console.log('\nUsage:')
      console.log('  --all              Seed all modules')
      console.log('  --module <name>    Seed specific module')
      console.log('  --list             List available modules')
      console.log('\nExample:')
      console.log('  node scripts/seed-home-content.js --module hero')
      console.log('  node scripts/seed-home-content.js --module applicationCategories')
      process.exit(1)
    }

    console.log(`\n✅ Seeding complete! Total records created: ${totalSeeded}`)
    console.log('⚠️  Remember to manually replace placeholder images in CMS Admin UI')

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message)
    process.exit(1)
  }
}

main()
