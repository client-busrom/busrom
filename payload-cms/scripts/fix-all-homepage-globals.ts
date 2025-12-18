/**
 * Fix all homepage globals with JSON string issues
 *
 * This script will:
 * 1. Check all homepage globals for JSON string issues
 * 2. Parse the JSON strings
 * 3. Update with correct localized values
 */

import { getPayload } from 'payload'
import config from '../payload.config'

const globalsToFix = [
  'service-features',
  'brand-advantages',
  'oem-odm',
  'featured-products',
  'main-form',
  'case-studies',
  'quote-steps',
  'why-choose-busrom',
  'brand-analysis',
  'brand-value',
  'simple-cta',
  'sphere-3d',
  'product-series-carousel',
  'footer',
]

async function fixAllGlobals() {
  console.log('🔧 Fixing all homepage globals...\n')

  const payload = await getPayload({ config })
  let totalFixed = 0

  for (const slug of globalsToFix) {
    console.log(`\n📦 Processing ${slug}...`)

    try {
      // Get EN data
      const enData = await payload.findGlobal({
        slug,
        locale: 'en',
      })

      // Find fields with JSON string issues
      const fieldsToFix: Record<string, { en: string; zh: string }> = {}
      let fixedFieldsCount = 0

      for (const [key, value] of Object.entries(enData)) {
        if (
          typeof value === 'string' &&
          value.startsWith('{') &&
          value.includes('"en":') &&
          value.includes('"zh":')
        ) {
          try {
            const parsed = JSON.parse(value)
            // Fix even if en or zh is null or empty string
            if ('en' in parsed && 'zh' in parsed) {
              fieldsToFix[key] = {
                en: parsed.en || '',
                zh: parsed.zh || '',
              }
              fixedFieldsCount++
            }
          } catch (e) {
            console.log(`   ⚠️  Failed to parse ${key}:`, value)
          }
        }
      }

      if (fixedFieldsCount === 0) {
        console.log(`   ✓ No issues found`)
        continue
      }

      console.log(`   Found ${fixedFieldsCount} fields to fix`)

      // Update EN locale
      const enUpdate: Record<string, any> = {}
      for (const [key, value] of Object.entries(fieldsToFix)) {
        enUpdate[key] = value.en
      }

      await payload.updateGlobal({
        slug,
        data: enUpdate,
        locale: 'en',
      })
      console.log(`   ✓ Updated EN locale`)

      // Update ZH locale
      const zhUpdate: Record<string, any> = {}
      for (const [key, value] of Object.entries(fieldsToFix)) {
        zhUpdate[key] = value.zh
      }

      await payload.updateGlobal({
        slug,
        data: zhUpdate,
        locale: 'zh',
      })
      console.log(`   ✓ Updated ZH locale`)

      totalFixed += fixedFieldsCount
    } catch (error) {
      console.log(`   ❌ Error: ${error}`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`✅ Fixed ${totalFixed} fields across ${globalsToFix.length} globals`)
  console.log('='.repeat(60))
}

fixAllGlobals()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
