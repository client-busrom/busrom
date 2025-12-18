import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Fill missing Chinese translations in database
 * Run: npx tsx scripts/fill-missing-translations.ts
 */

const translations = {
  'why-choose-busrom': {
    title2: 'Busrom',
    viewMoreButtonText: '查看更多信息',
  },
  footer: {
    contactEmailLabel: '电子邮箱',
    afterSalesLabel: '售后服务',
    whatsappLabel: 'WhatsApp',
    officialNoticeLine1: '官方邮箱联系方式：xxx@busromhouse.com。',
    officialNoticeLine2: '任何来自非官方来源的联系均为未经授权且可能存在欺诈行为——请勿参与或付款。',
    officialNoticeLine3: '如需验证或有任何疑问，请通过官方邮箱或访问我们的网站 www.busromhouse.com 联系我们',
    officialNoticeLine4: 'Busrom 团队',
  },
  'brand-value': {
    param1Title: '品质',
    param2Title: '创新',
  },
}

async function fillMissingTranslations() {
  console.log('🔧 Filling missing Chinese translations...\n')

  const payload = await getPayload({ config })

  for (const [globalSlug, zhData] of Object.entries(translations)) {
    try {
      console.log(`📝 Updating ${globalSlug}...`)

      // Get current data for both locales
      const currentData = await payload.findGlobal({
        slug: globalSlug,
        locale: 'all' as any,
      })

      // Update with Chinese translations
      const updateData: any = {}

      for (const [field, zhValue] of Object.entries(zhData)) {
        // Check if field exists and needs updating
        if (currentData[field] !== undefined) {
          if (typeof currentData[field] === 'object' && currentData[field].zh === null) {
            // Field is localized and zh is missing
            updateData[field] = zhValue
          }
        } else {
          // Field doesn't exist at all
          updateData[field] = zhValue
        }
      }

      if (Object.keys(updateData).length > 0) {
        await payload.updateGlobal({
          slug: globalSlug,
          data: updateData,
          locale: 'zh',
        })
        console.log(`  ✅ Updated ${Object.keys(updateData).length} fields`)
      } else {
        console.log(`  ⊙ No updates needed`)
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`)
    }
  }

  console.log('\n✅ Translations filled successfully!')
  process.exit(0)
}

fillMissingTranslations().catch((error) => {
  console.error('❌ Failed:', error)
  process.exit(1)
})
