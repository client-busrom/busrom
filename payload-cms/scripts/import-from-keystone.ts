/**
 * Import homepage data directly from Keystone CMS database to Payload CMS
 *
 * This script:
 * 1. Reads data from Keystone PostgreSQL database
 * 2. Transforms it to Payload format
 * 3. Imports into Payload CMS with proper localization
 */

import { Client } from 'pg'
import { getPayload } from 'payload'
import config from '../payload.config.js'

const keystoneClient = new Client({
  host: 'localhost',
  port: 5432,
  database: 'busrom_cms',
  user: 'busrom',
  password: 'busrom_dev_password',
})

/**
 * Helper function to create localized document
 */
async function createLocalizedDocument(
  payload: any,
  collection: string,
  data: any,
): Promise<string> {
  // Extract localized fields (those with {en, zh} structure)
  const localizedFields: Record<string, any> = {}
  const nonLocalizedFields: Record<string, any> = {}

  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && 'en' in value && 'zh' in value) {
      localizedFields[key] = value
    } else {
      nonLocalizedFields[key] = value
    }
  }

  // Create document with English (default locale)
  const enData = { ...nonLocalizedFields }
  for (const [key, value] of Object.entries(localizedFields)) {
    enData[key] = (value as any).en
  }

  const doc = await payload.create({
    collection,
    data: enData,
    locale: 'en',
  })

  // Update with Chinese translations
  const zhData: Record<string, any> = {}
  for (const [key, value] of Object.entries(localizedFields)) {
    zhData[key] = (value as any).zh
  }

  if (Object.keys(zhData).length > 0) {
    await payload.update({
      collection,
      id: doc.id,
      data: zhData,
      locale: 'zh',
    })
  }

  return doc.id
}

/**
 * Helper function to update localized global
 */
async function updateLocalizedGlobal(
  payload: any,
  slug: string,
  data: any,
): Promise<void> {
  // Extract localized fields (those with {en, zh} structure)
  const localizedFields: Record<string, any> = {}
  const nonLocalizedFields: Record<string, any> = {}

  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && 'en' in value && 'zh' in value) {
      localizedFields[key] = value
    } else {
      nonLocalizedFields[key] = value
    }
  }

  // Update global with English (default locale)
  const enData = { ...nonLocalizedFields }
  for (const [key, value] of Object.entries(localizedFields)) {
    enData[key] = (value as any).en
  }

  await payload.updateGlobal({
    slug,
    data: enData,
    locale: 'en',
  })

  // Update with Chinese translations
  const zhData: Record<string, any> = {}
  for (const [key, value] of Object.entries(localizedFields)) {
    zhData[key] = (value as any).zh
  }

  if (Object.keys(zhData).length > 0) {
    await payload.updateGlobal({
      slug,
      data: zhData,
      locale: 'zh',
    })
  }
}

async function importFromKeystone() {
  console.log('🚀 Starting import from Keystone CMS...\n')

  // Connect to Keystone database
  await keystoneClient.connect()
  console.log('✅ Connected to Keystone database\n')

  // Initialize Payload
  const payload = await getPayload({ config })
  console.log('✅ Payload initialized\n')

  try {
    // ==================== 1. Import HeroBannerItems ====================
    console.log('📦 Importing HeroBannerItems...')

    // First, delete all existing HeroBannerItems
    console.log('  🗑️  Deleting existing HeroBannerItems...')
    const existingItems = await payload.find({
      collection: 'hero-banner-items',
      limit: 1000,
    })

    for (const item of existingItems.docs) {
      await payload.delete({
        collection: 'hero-banner-items',
        id: item.id,
      })
    }
    console.log(`  ✓ Deleted ${existingItems.docs.length} existing items`)

    // Now import from Keystone
    const heroBannerResult = await keystoneClient.query(`
      SELECT * FROM "HeroBannerItem" ORDER BY "order"
    `)

    for (const item of heroBannerResult.rows) {
      await createLocalizedDocument(payload, 'hero-banner-items', {
        internalLabel: item.internalLabel,
        title: item.title,
        feature1: item.feature1,
        feature2: item.feature2,
        feature3: item.feature3,
        feature4: item.feature4,
        feature5: item.feature5,
        // Skip images - will be handled separately
        order: item.order,
        status: item.status.toLowerCase() === 'published' ? 'published' : 'draft',
      })
    }
    console.log(`✅ Imported ${heroBannerResult.rows.length} HeroBannerItems\n`)

    // ==================== 2. Import SeriesIntroItems ====================
    console.log('📦 Importing SeriesIntroItems...')

    // First, delete all existing SeriesIntroItems
    console.log('  🗑️  Deleting existing SeriesIntroItems...')
    const existingSeriesIntro = await payload.find({
      collection: 'series-intro-items',
      limit: 1000,
    })

    for (const item of existingSeriesIntro.docs) {
      await payload.delete({
        collection: 'series-intro-items',
        id: item.id,
      })
    }
    console.log(`  ✓ Deleted ${existingSeriesIntro.docs.length} existing items`)

    const seriesIntroResult = await keystoneClient.query(`
      SELECT * FROM "SeriesIntro" ORDER BY "updatedAt"
    `)

    if (seriesIntroResult.rows.length > 0) {
      for (const item of seriesIntroResult.rows) {
        // Note: Need to map Keystone ProductSeries UUID to Payload ProductSeries ID
        // For now, skip productSeries relationship - can be set manually in admin
        await createLocalizedDocument(payload, 'series-intro-items', {
          internalLabel: item.internalLabel,
          title: item.title,
          description: item.description,
          // Skip productSeries - requires UUID to ID mapping
          // Skip images - requires Media UUID to ID mapping
          status: item.status?.toLowerCase() === 'published' ? 'published' : 'draft',
        })
      }
      console.log(`✅ Imported ${seriesIntroResult.rows.length} SeriesIntroItems\n`)
    } else {
      console.log('⊙ No SeriesIntroItems found in Keystone (table is empty)\n')
    }

    // ==================== 3. Import ServiceFeatures ====================
    console.log('📦 Importing ServiceFeatures...')
    const serviceFeaturesResult = await keystoneClient.query(`
      SELECT * FROM "ServiceFeaturesConfig" LIMIT 1
    `)

    if (serviceFeaturesResult.rows.length > 0) {
      const sf = serviceFeaturesResult.rows[0]
      await updateLocalizedGlobal(payload, 'service-features', {
        title: sf.title,
        subtitle: sf.subtitle,
        feature1Title: sf.feature1Title,
        feature1ShortTitle: sf.feature1ShortTitle,
        feature1Description: sf.feature1Description,
        feature2Title: sf.feature2Title,
        feature2ShortTitle: sf.feature2ShortTitle,
        feature2Description: sf.feature2Description,
        feature3Title: sf.feature3Title,
        feature3ShortTitle: sf.feature3ShortTitle,
        feature3Description: sf.feature3Description,
        feature4Title: sf.feature4Title,
        feature4ShortTitle: sf.feature4ShortTitle,
        feature4Description: sf.feature4Description,
        feature5Title: sf.feature5Title,
        feature5ShortTitle: sf.feature5ShortTitle,
        feature5Description: sf.feature5Description,
        status: sf.status?.toLowerCase() === 'published' ? 'published' : 'draft',
      })
      console.log('✅ Imported ServiceFeatures\n')
    }

    // ==================== 3. Import BrandAdvantages ====================
    console.log('📦 Importing BrandAdvantages...')
    const brandAdvantagesResult = await keystoneClient.query(`
      SELECT * FROM "BrandAdvantages" LIMIT 1
    `)

    if (brandAdvantagesResult.rows.length > 0) {
      const ba = brandAdvantagesResult.rows[0]
      await updateLocalizedGlobal(payload, 'brand-advantages', {
        title: ba.title,
        subtitle: ba.subtitle,
        status: ba.status?.toLowerCase() === 'published' ? 'published' : 'draft',
      })
      console.log('✅ Imported BrandAdvantages\n')
    }

    // ==================== 4. Import OemOdm ====================
    console.log('📦 Importing OemOdm...')
    const oemOdmResult = await keystoneClient.query(`
      SELECT * FROM "OemOdm" LIMIT 1
    `)

    if (oemOdmResult.rows.length > 0) {
      const oo = oemOdmResult.rows[0]
      await updateLocalizedGlobal(payload, 'oem-odm', {
        oemTitle: oo.oemTitle,
        oemDescription1: oo.oemDescription1,
        oemDescription2: oo.oemDescription2,
        // Skip oemBgImage, oemImage
        odmTitle: oo.odmTitle,
        odmDescription1: oo.odmDescription1,
        odmDescription2: oo.odmDescription2,
        // Skip odmBgImage, odmImage
        status: oo.status?.toLowerCase() === 'published' ? 'published' : 'draft',
      })
      console.log('✅ Imported OemOdm\n')
    }

    // ==================== 5. Import QuoteSteps ====================
    console.log('📦 Importing QuoteSteps...')
    const quoteStepsResult = await keystoneClient.query(`
      SELECT * FROM "QuoteSteps" LIMIT 1
    `)

    if (quoteStepsResult.rows.length > 0) {
      const qs = quoteStepsResult.rows[0]
      await updateLocalizedGlobal(payload, 'quote-steps', {
        headerTitle: qs.title,
        headerTitle2: qs.title2,
        headerSubtitle: qs.subtitle,
        headerDescription: qs.description,
        step01Text: qs.step1Text,
        step02Text: qs.step2Text,
        step03Text: qs.step3Text,
        step04Text: qs.step4Text,
        step05Text: qs.step5Text,
        // Skip step images
        status: qs.status?.toLowerCase() === 'published' ? 'published' : 'draft',
      })
      console.log('✅ Imported QuoteSteps\n')
    }

    // ==================== 6. Import WhyChooseBusrom ====================
    console.log('📦 Importing WhyChooseBusrom...')
    const whyChooseResult = await keystoneClient.query(`
      SELECT * FROM "WhyChooseBusrom" LIMIT 1
    `)

    if (whyChooseResult.rows.length > 0) {
      const wc = whyChooseResult.rows[0]
      await updateLocalizedGlobal(payload, 'why-choose-busrom', {
        title: wc.title,
        subtitle: wc.subtitle,
        status: wc.status?.toLowerCase() === 'published' ? 'published' : 'draft',
      })
      console.log('✅ Imported WhyChooseBusrom\n')
    }

    // ==================== 7. Import BrandAnalysis ====================
    console.log('📦 Importing BrandAnalysis...')
    const brandAnalysisResult = await keystoneClient.query(`
      SELECT * FROM "BrandAnalysis" LIMIT 1
    `)

    if (brandAnalysisResult.rows.length > 0) {
      const ba = brandAnalysisResult.rows[0]
      await updateLocalizedGlobal(payload, 'brand-analysis', {
        status: ba.status?.toLowerCase() === 'published' ? 'published' : 'draft',
      })
      console.log('✅ Imported BrandAnalysis\n')
    }

    // ==================== 8. Import BrandValue ====================
    console.log('📦 Importing BrandValue...')
    const brandValueResult = await keystoneClient.query(`
      SELECT * FROM "BrandValue" LIMIT 1
    `)

    if (brandValueResult.rows.length > 0) {
      const bv = brandValueResult.rows[0]
      await updateLocalizedGlobal(payload, 'brand-value', {
        param1Title: bv.param1Title,
        param1Description: bv.param1Description,
        param2Title: bv.param2Title,
        param2Description: bv.param2Description,
        sloganTitle: bv.sloganTitle,
        sloganDescription: bv.sloganDescription,
        valueTitle: bv.valueTitle,
        valueDescription: bv.valueDescription,
        visionTitle: bv.visionTitle,
        visionDescription: bv.visionDescription,
        status: bv.status?.toLowerCase() === 'published' ? 'published' : 'draft',
      })
      console.log('✅ Imported BrandValue\n')
    }

    // ==================== 9. Import SimpleCta ====================
    console.log('📦 Importing SimpleCta...')
    const simpleCtaResult = await keystoneClient.query(`
      SELECT * FROM "SimpleCta" LIMIT 1
    `)

    if (simpleCtaResult.rows.length > 0) {
      const sc = simpleCtaResult.rows[0]
      await updateLocalizedGlobal(payload, 'simple-cta', {
        title: sc.title,
        subtitle: sc.subtitle,
        ctaText: sc.ctaText,
        ctaLink: sc.ctaLink,
        status: sc.status?.toLowerCase() === 'published' ? 'published' : 'draft',
      })
      console.log('✅ Imported SimpleCta\n')
    }

    // ==================== 10. Import Sphere3d ====================
    console.log('📦 Importing Sphere3d...')
    const sphere3dResult = await keystoneClient.query(`
      SELECT * FROM "Sphere3d" LIMIT 1
    `)

    if (sphere3dResult.rows.length > 0) {
      const sp = sphere3dResult.rows[0]
      await updateLocalizedGlobal(payload, 'sphere-3d', {
        status: sp.status?.toLowerCase() === 'published' ? 'published' : 'draft',
      })
      console.log('✅ Imported Sphere3d\n')
    }

    // ==================== 11. Import ProductSeriesCarousel ====================
    console.log('📦 Importing ProductSeriesCarousel...')
    const carouselResult = await keystoneClient.query(`
      SELECT * FROM "ProductSeriesCarousel" LIMIT 1
    `)

    if (carouselResult.rows.length > 0) {
      const psc = carouselResult.rows[0]
      await updateLocalizedGlobal(payload, 'product-series-carousel', {
        title: psc.title,
        autoplay: psc.autoplay || false,
        autoplaySpeed: psc.autoplaySpeed || 3000,
        status: psc.status?.toLowerCase() === 'published' ? 'published' : 'draft',
      })
      console.log('✅ Imported ProductSeriesCarousel\n')
    }

    // ==================== 12. Import FeaturedProducts ====================
    console.log('📦 Importing FeaturedProducts...')
    const featuredProductsResult = await keystoneClient.query(`
      SELECT * FROM "FeaturedProducts" LIMIT 1
    `)

    if (featuredProductsResult.rows.length > 0) {
      const fp = featuredProductsResult.rows[0]
      await updateLocalizedGlobal(payload, 'featured-products', {
        title: fp.title,
        description: fp.description,
        viewAllButtonText: fp.viewAllButtonText,
        status: fp.status?.toLowerCase() === 'published' ? 'published' : 'draft',
      })
      console.log('✅ Imported FeaturedProducts\n')
    }

    // ==================== 13. Import MainForm ====================
    console.log('📦 Importing MainForm...')
    const mainFormResult = await keystoneClient.query(`
      SELECT * FROM "MainForm" LIMIT 1
    `)

    if (mainFormResult.rows.length > 0) {
      const mf = mainFormResult.rows[0]

      // Fix incorrect Chinese translations in Keystone data
      const designTextLeft = mf.designTextLeft || {}
      const designTextRight = mf.designTextRight || {}

      // Correct translations
      if (designTextLeft.zh === '高端') {
        designTextLeft.zh = '高端建筑玻璃五金'
      }
      if (designTextRight.zh === '五金') {
        designTextRight.zh = '定制结构与颜色'
      }

      await updateLocalizedGlobal(payload, 'main-form', {
        formPlaceholderName: mf.placeholderName,
        formPlaceholderEmail: mf.placeholderEmail,
        formPlaceholderPhone: mf.placeholderWhatsapp, // Note: Keystone uses "placeholderWhatsapp"
        formPlaceholderCompany: mf.placeholderCompany,
        formPlaceholderMessage: mf.placeholderMessage,
        buttonText: mf.buttonText,
        designTextLeft: designTextLeft,
        designTextRight: designTextRight,
        status: mf.status?.toLowerCase() === 'published' ? 'published' : 'draft',
      })
      console.log('✅ Imported MainForm\n')
    }

    // ==================== 14. Import CaseStudies ====================
    console.log('📦 Importing CaseStudies...')
    const caseStudiesResult = await keystoneClient.query(`
      SELECT * FROM "CaseStudies" LIMIT 1
    `)

    if (caseStudiesResult.rows.length > 0) {
      const cs = caseStudiesResult.rows[0]
      await updateLocalizedGlobal(payload, 'case-studies', {
        title: cs.title,
        description: cs.description,
        status: cs.status?.toLowerCase() === 'published' ? 'published' : 'draft',
      })
      console.log('✅ Imported CaseStudies\n')
    }

    // ==================== 15. Import Footer ====================
    console.log('📦 Importing Footer...')
    const footerResult = await keystoneClient.query(`
      SELECT * FROM "Footer" LIMIT 1
    `)

    if (footerResult.rows.length > 0) {
      const ft = footerResult.rows[0]
      await updateLocalizedGlobal(payload, 'footer', {
        formPlaceholderName: ft.formPlaceholderName,
        formPlaceholderEmail: ft.formPlaceholderEmail,
        formPlaceholderMessage: ft.formPlaceholderMessage,
        contactTitle: ft.contactTitle,
        address: ft.address,
        workingHours: ft.workingHours,
        officialNoticeTitle: ft.officialNoticeTitle,
        copyrightText: ft.copyrightText,
        status: ft.status?.toLowerCase() === 'published' ? 'published' : 'draft',
      })
      console.log('✅ Imported Footer\n')
    }

    console.log('\n✅ All homepage data imported successfully!')
    console.log('📊 Summary:')
    console.log(`   - ${heroBannerResult.rows.length} HeroBannerItems`)
    console.log(`   - ${seriesIntroResult.rows.length} SeriesIntroItems`)
    console.log('   - 14 Global configs')
    console.log(`   - Total: ${heroBannerResult.rows.length + seriesIntroResult.rows.length + 14} homepage modules imported`)

  } catch (error) {
    console.error('❌ Error importing data:', error)
    throw error
  } finally {
    await keystoneClient.end()
    process.exit(0)
  }
}

importFromKeystone().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
