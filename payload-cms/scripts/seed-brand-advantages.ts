/**
 * Seed BrandAdvantages Global for Payload CMS
 *
 * This script creates the Brand Advantages data with 9 advantages
 * featuring icons and bilingual content (en/zh)
 */

import { getPayload } from 'payload'
import config from '../payload.config.js'

const brandAdvantagesData = {
  status: 'published',
  // 9 advantages with icons from lucide-react
  advantage01Text: {
    en: 'Precision Engineering',
    zh: '精密工程',
  },
  advantage01Icon: 'Sparkles',

  advantage02Text: {
    en: 'Certified Quality',
    zh: '认证质量',
  },
  advantage02Icon: 'Target',

  advantage03Text: {
    en: 'Modular Design',
    zh: '模块化设计',
  },
  advantage03Icon: 'Component',

  advantage04Text: {
    en: 'Advanced Manufacturing',
    zh: '先进制造',
  },
  advantage04Icon: 'Gauge',

  advantage05Text: {
    en: 'Weatherproof Solutions',
    zh: '防水解决方案',
  },
  advantage05Icon: 'Waves',

  advantage06Text: {
    en: 'Safety Certified',
    zh: '安全认证',
  },
  advantage06Icon: 'ShieldCheck',

  advantage07Text: {
    en: 'Minimal Hardware',
    zh: '极简硬件',
  },
  advantage07Icon: 'EyeOff',

  advantage08Text: {
    en: 'Factory Direct',
    zh: '工厂直销',
  },
  advantage08Icon: 'Factory',

  advantage09Text: {
    en: 'Smart Engineering',
    zh: '智能工程',
  },
  advantage09Icon: 'Cpu',
}

/**
 * Helper function to create localized document
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

async function seedBrandAdvantages() {
  console.log('🚀 Starting BrandAdvantages seeding...\n')

  const payload = await getPayload({ config })
  console.log('✅ Payload initialized\n')

  try {
    console.log('📦 Updating BrandAdvantages global...')

    await updateGlobalWithLocales(payload, 'brand-advantages', brandAdvantagesData)

    console.log('  ✓ Updated BrandAdvantages with 9 advantages')

    console.log('\n✅ BrandAdvantages seeding completed!')
    console.log('📊 Summary:')
    console.log('   - 9 advantages created')
    console.log('   - Status: published')
    console.log('   - Languages: en, zh')

  } catch (error) {
    console.error('❌ Error seeding BrandAdvantages:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

seedBrandAdvantages().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
