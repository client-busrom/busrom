/**
 * Fix ServiceFeatures data
 *
 * Problem: EN locale has JSON strings instead of plain text values
 * Solution: Re-seed the data correctly
 */

import { getPayload } from 'payload'
import config from '../payload.config'

const serviceFeaturesData = {
  status: 'published',
  title: {
    en: 'Premium Architectural Glass Hardware',
    zh: '高端建筑玻璃五金',
  },
  subtitle: {
    en: 'Fully Customized Glass Hardware by Busrom (Serving USA, CA, UK, AU, KSA, UAE, and clients worldwide to create the ideal indoor & outdoor space.)',
    zh: 'Busrom 提供全定制玻璃五金(服务美国、加拿大、英国、澳大利亚、沙特阿拉伯、阿联酋及全球客户,打造理想的室内外空间。)',
  },
  feature01Title: {
    en: 'Any Size, Any Structure, Any Shape',
    zh: '任意尺寸、任意结构、任意形状',
  },
  feature01ShortTitle: {
    en: 'Any Size',
    zh: '任意尺寸',
  },
  feature01Description: {
    en: 'Whether it\'s framed or frameless partitions, or even load-bearing curtain walls, we can customize glass hardware to match any size and structure.',
    zh: '无论是带框还是无框隔断,甚至是承重幕墙,我们都能定制匹配任意尺寸和结构的玻璃五金。',
  },
  feature02Title: {
    en: 'Flexible Installation',
    zh: '灵活安装',
  },
  feature02ShortTitle: {
    en: 'Flexible Installation',
    zh: '灵活安装',
  },
  feature02Description: {
    en: 'Whether it\'s frameless glass, tiled walls, metal frames, or renovation projects, Busrom\'s glass hardware adapts to every setting. From indoor bathrooms to poolside decks, our solutions install quickly and with minimal fuss.',
    zh: '无论是无框玻璃、瓷砖墙面、金属框架还是翻新项目,Busrom 的玻璃五金都能适应各种环境。从室内浴室到池畔露台,我们的解决方案安装快捷,麻烦最少。',
  },
  feature03Title: {
    en: 'A Color That\'s So You',
    zh: '专属色彩',
  },
  feature03ShortTitle: {
    en: 'A Color That\'s So You',
    zh: '专属色彩',
  },
  feature03Description: {
    en: 'From classic brushed stainless steel and matte black to any RAL color or custom PVD finish, Busrom\'s bespoke craftsmanship elevates projects into the crowning touch of any space. Durable coatings resist corrosion and wear, maintaining their aesthetic appeal for years to come.',
    zh: '从经典的拉丝不锈钢和哑光黑,到任意 RAL 颜色或定制 PVD 表面,Busrom 的定制工艺将项目提升为点睛之笔。耐用的涂层抗腐蚀和磨损,长久保持美观。',
  },
  feature04Title: {
    en: 'OEM / ODM & Project Customization',
    zh: 'OEM / ODM 及项目定制',
  },
  feature04ShortTitle: {
    en: 'OEM / ODM',
    zh: 'OEM / ODM',
  },
  feature04Description: {
    en: 'From prototype to mass production, we support drawing-based customization, small-batch runs, and full OEM/ODM services.',
    zh: '从原型到批量生产,我们支持来图定制、小批量试产以及完整的 OEM/ODM 服务。',
  },
  feature05Title: {
    en: 'Global Quality Standards & After-Sales Support',
    zh: '全球质量标准与售后支持',
  },
  feature05ShortTitle: {
    en: 'Global Quality Standards',
    zh: '全球质量标准',
  },
  feature05Description: {
    en: 'Strict QC, worldwide shipping, and responsive spare-part and technical support for project continuity.',
    zh: '严格的质量控制,全球配送,以及响应迅速的备件和技术支持,确保项目连续性。',
  },
}

async function fixServiceFeaturesData() {
  console.log('🔧 Fixing ServiceFeatures data...\n')

  const payload = await getPayload({ config })

  // Extract localized and non-localized fields
  const localizedFields: Record<string, any> = {}
  const nonLocalizedFields: Record<string, any> = {}

  for (const [key, value] of Object.entries(serviceFeaturesData)) {
    if (value && typeof value === 'object' && 'en' in value && 'zh' in value) {
      localizedFields[key] = value
    } else {
      nonLocalizedFields[key] = value
    }
  }

  console.log(`Found ${Object.keys(localizedFields).length} localized fields`)
  console.log(`Found ${Object.keys(nonLocalizedFields).length} non-localized fields\n`)

  // Update English locale
  console.log('Updating EN locale...')
  const enData: Record<string, any> = { ...nonLocalizedFields }
  for (const [key, value] of Object.entries(localizedFields)) {
    enData[key] = value.en // Extract ONLY the English value
  }

  console.log('EN data keys:', Object.keys(enData))
  console.log('EN title:', enData.title)
  console.log('EN feature01Title:', enData.feature01Title)

  await payload.updateGlobal({
    slug: 'service-features',
    data: enData,
    locale: 'en',
  })
  console.log('✅ EN locale updated\n')

  // Update Chinese locale
  console.log('Updating ZH locale...')
  const zhData: Record<string, any> = {}
  for (const [key, value] of Object.entries(localizedFields)) {
    zhData[key] = value.zh // Extract ONLY the Chinese value
  }

  console.log('ZH data keys:', Object.keys(zhData))
  console.log('ZH title:', zhData.title)
  console.log('ZH feature01Title:', zhData.feature01Title)

  await payload.updateGlobal({
    slug: 'service-features',
    data: zhData,
    locale: 'zh',
  })
  console.log('✅ ZH locale updated\n')

  // Verify the fix
  console.log('Verifying the fix...')
  const enVerify = await payload.findGlobal({
    slug: 'service-features',
    locale: 'en',
  })
  const zhVerify = await payload.findGlobal({
    slug: 'service-features',
    locale: 'zh',
  })

  console.log('\n=== Verification ===')
  console.log('EN title:', enVerify.title)
  console.log('ZH title:', zhVerify.title)
  console.log('EN title type:', typeof enVerify.title)
  console.log('ZH title type:', typeof zhVerify.title)

  if (typeof enVerify.title === 'string' && !enVerify.title.includes('{')) {
    console.log('\n✅ Fix successful! EN locale now has plain string values.')
  } else {
    console.log('\n❌ Fix failed! EN locale still has JSON string values.')
  }
}

fixServiceFeaturesData()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
