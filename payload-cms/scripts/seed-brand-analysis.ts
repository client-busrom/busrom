/**
 * Seed BrandAnalysis Global for Payload CMS
 *
 * This script migrates the Brand Analysis data from Keystone
 * with proper bilingual content (en/zh) and 3 centers
 */

import { getPayload } from 'payload'
import config from '../payload.config.js'

const brandAnalysisData = {
  status: 'published',

  // Brand Name Analysis
  brandNameAnalysis: {
    titlePart1: {
      en: 'Bus',
      zh: 'Bus',
    },
    titlePart2: {
      en: 'rom',
      zh: 'rom',
    },
    textPart1: {
      en: 'Buffer & Bridge',
      zh: '缓冲与桥梁',
    },
    textPart2: {
      en: 'Room & Space',
      zh: '房间与空间',
    },
  },

  // Brand Center
  brandCenter: {
    title: {
      en: 'Brand Center',
      zh: '品牌中心',
    },
    description: {
      en: "At Busrom, we don't just create structures — we turn dreams into reality. Our vision is to make every glass installation safe without sacrificing elegance, so you'll never have to worry about finding the right solution again.",
      zh: '在 Busrom，我们不仅仅是创建结构——我们将梦想变为现实。我们的愿景是让每一次玻璃安装都安全而不失优雅，让您再也不用担心找不到合适的解决方案。',
    },
  },

  // Project Center
  projectCenter: {
    title: {
      en: 'Project Center',
      zh: '项目中心',
    },
    description: {
      en: "Here we bring together Busrom's selected engineering cases from around the world. whether it is a commercial, residential or public project, we are committed to providing professional, efficient and customized indoor & outdoor space solutions.",
      zh: '在这里，我们汇集了 Busrom 在全球精选的工程案例。无论是商业、住宅还是公共项目，我们致力于提供专业、高效和定制化的室内外空间解决方案。',
    },
  },

  // Service Center
  serviceCenter: {
    title: {
      en: 'Service Center',
      zh: '服务中心',
    },
    description: {
      en: 'On journey to excellence, Busrom is always your trusted partner. Our professional Team deliver worry-free service experience, saving your time, energy, and money.',
      zh: '在追求卓越的旅程中，Busrom 始终是您值得信赖的合作伙伴。我们专业的团队提供无忧的服务体验，为您节省时间、精力和金钱。',
    },
  },
}

/**
 * Helper function to update global with nested localized fields
 */
async function updateGlobalWithNestedLocales(
  payload: any,
  globalSlug: string,
  data: any,
): Promise<void> {
  // Process nested structure for Brand Analysis
  const enData: any = { status: data.status }
  const zhData: any = {}

  // Handle brandNameAnalysis group
  if (data.brandNameAnalysis) {
    enData.brandNameAnalysis = {}
    for (const [key, value] of Object.entries(data.brandNameAnalysis)) {
      if (value && typeof value === 'object' && 'en' in value) {
        enData.brandNameAnalysis[key] = (value as any).en
        if (!zhData.brandNameAnalysis) zhData.brandNameAnalysis = {}
        zhData.brandNameAnalysis[key] = (value as any).zh
      }
    }
  }

  // Handle brandCenter group
  if (data.brandCenter) {
    enData.brandCenter = {}
    for (const [key, value] of Object.entries(data.brandCenter)) {
      if (value && typeof value === 'object' && 'en' in value) {
        enData.brandCenter[key] = (value as any).en
        if (!zhData.brandCenter) zhData.brandCenter = {}
        zhData.brandCenter[key] = (value as any).zh
      }
    }
  }

  // Handle projectCenter group
  if (data.projectCenter) {
    enData.projectCenter = {}
    for (const [key, value] of Object.entries(data.projectCenter)) {
      if (value && typeof value === 'object' && 'en' in value) {
        enData.projectCenter[key] = (value as any).en
        if (!zhData.projectCenter) zhData.projectCenter = {}
        zhData.projectCenter[key] = (value as any).zh
      }
    }
  }

  // Handle serviceCenter group
  if (data.serviceCenter) {
    enData.serviceCenter = {}
    for (const [key, value] of Object.entries(data.serviceCenter)) {
      if (value && typeof value === 'object' && 'en' in value) {
        enData.serviceCenter[key] = (value as any).en
        if (!zhData.serviceCenter) zhData.serviceCenter = {}
        zhData.serviceCenter[key] = (value as any).zh
      }
    }
  }

  // Update with English (default locale)
  await payload.updateGlobal({
    slug: globalSlug,
    data: enData,
    locale: 'en',
  })

  // Update with Chinese translations
  if (Object.keys(zhData).length > 0) {
    await payload.updateGlobal({
      slug: globalSlug,
      data: zhData,
      locale: 'zh',
    })
  }
}

async function seedBrandAnalysis() {
  console.log('🚀 Starting BrandAnalysis seeding...\n')

  const payload = await getPayload({ config })
  console.log('✅ Payload initialized\n')

  try {
    console.log('📦 Updating BrandAnalysis global...')

    await updateGlobalWithNestedLocales(payload, 'brand-analysis', brandAnalysisData)

    console.log('  ✓ Updated BrandAnalysis with brand name analysis')
    console.log('  ✓ Updated Brand Center, Project Center, Service Center')

    console.log('\n✅ BrandAnalysis seeding completed!')
    console.log('📊 Summary:')
    console.log('   - Brand Name: Bus + rom (Buffer & Bridge + Room & Space)')
    console.log('   - 3 Centers: Brand, Project, Service')
    console.log('   - Status: published')
    console.log('   - Languages: en, zh')
    console.log('   - Images: left empty (as requested)')

  } catch (error) {
    console.error('❌ Error seeding BrandAnalysis:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

seedBrandAnalysis().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
