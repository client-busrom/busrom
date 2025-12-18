/**
 * Seed WhyChooseBusrom Global for Payload CMS
 *
 * This script migrates the Why Choose Busrom data from Keystone
 * with proper bilingual content (en/zh) and 5 reasons
 */

import { getPayload } from 'payload'
import config from '../payload.config.js'

const whyChooseBusromData = {
  status: 'published',

  // Main Title
  title: {
    en: 'Why Choose Busrom',
    zh: '为什么选择 Busrom',
  },

  // ==================================================================
  // Reason 01: Original & Proprietary Design
  // ==================================================================
  reason01Title: {
    en: 'Original & Proprietary Design',
    zh: '原创与专有设计',
  },
  reason01Description: {
    en: 'Exclusive hardware that blends form and function.',
    zh: '融合形式与功能的独家五金配件。',
  },
  reason01Icon: 'Sparkles',

  // ==================================================================
  // Reason 02: Relentless Quality & Integration
  // ==================================================================
  reason02Title: {
    en: 'Relentless Quality & Integration',
    zh: '严格质量与整合',
  },
  reason02Description: {
    en: 'Strict material selection, testing, and smart-home readiness for reliable safety, function, and finish.',
    zh: '严格的材料选择、测试和智能家居就绪，确保可靠的安全性、功能性和表面处理。',
  },
  reason02Icon: 'ShieldCheck',

  // ==================================================================
  // Reason 03: Factory-direct Production
  // ==================================================================
  reason03Title: {
    en: 'Factory-direct Production',
    zh: '工厂直接生产',
  },
  reason03Description: {
    en: 'Full vertical manufacturing for tighter quality control, faster lead times, and better pricing.',
    zh: '全垂直制造，更严格的质量控制、更快的交货时间和更优惠的价格。',
  },
  reason03Icon: 'Factory',

  // ==================================================================
  // Reason 04: Years of Global Expertise
  // ==================================================================
  reason04Title: {
    en: 'Years of Global Expertise',
    zh: '多年全球专业经验',
  },
  reason04Description: {
    en: 'Experienced teams and market insight that deliver durable, high-performance components.',
    zh: '经验丰富的团队和市场洞察力，提供耐用、高性能的组件。',
  },
  reason04Icon: 'Target',

  // ==================================================================
  // Reason 05: Collaborative R&D Partnership
  // ==================================================================
  reason05Title: {
    en: 'Collaborative R&D Partnership',
    zh: '合作研发伙伴关系',
  },
  reason05Description: {
    en: 'Co-engineer custom solutions that turn your concepts into production-ready reality.',
    zh: '共同设计定制解决方案，将您的概念变为可投入生产的现实。',
  },
  reason05Icon: 'Cpu',
}

/**
 * Helper function to update global with locales
 */
async function updateGlobalWithLocales(
  payload: any,
  globalSlug: string,
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

  // Update with English (default locale)
  const enData = { ...nonLocalizedFields }
  for (const [key, value] of Object.entries(localizedFields)) {
    enData[key] = (value as any).en
  }

  await payload.updateGlobal({
    slug: globalSlug,
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
      slug: globalSlug,
      data: zhData,
      locale: 'zh',
    })
  }
}

async function seedWhyChooseBusrom() {
  console.log('🚀 Starting WhyChooseBusrom seeding...\n')

  const payload = await getPayload({ config })
  console.log('✅ Payload initialized\n')

  try {
    console.log('📦 Updating WhyChooseBusrom global...')

    await updateGlobalWithLocales(payload, 'why-choose-busrom', whyChooseBusromData)

    console.log('  ✓ Updated WhyChooseBusrom with 5 reasons')

    console.log('\n✅ WhyChooseBusrom seeding completed!')
    console.log('📊 Summary:')
    console.log('   - 5 reasons migrated from Keystone')
    console.log('   - Status: published')
    console.log('   - Languages: en, zh')
    console.log('   - Icons: Sparkles, ShieldCheck, Factory, Target, Cpu')

  } catch (error) {
    console.error('❌ Error seeding WhyChooseBusrom:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

seedWhyChooseBusrom().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
