/**
 * Check all homepage globals for JSON string issue
 */

import { getPayload } from 'payload'
import config from '../payload.config'

const globalsToCheck = [
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

async function checkGlobals() {
  const payload = await getPayload({ config })
  const issues: string[] = []

  for (const slug of globalsToCheck) {
    try {
      const enData = await payload.findGlobal({
        slug,
        locale: 'en',
      })

      // Check each field for JSON string issue
      for (const [key, value] of Object.entries(enData)) {
        if (
          typeof value === 'string' &&
          value.startsWith('{') &&
          value.includes('"en":') &&
          value.includes('"zh":')
        ) {
          issues.push(`${slug}.${key} (EN locale)`)
        }
      }
    } catch (error) {
      console.log(`⚠️  Skip ${slug}: ${error}`)
    }
  }

  console.log('\n=== Summary ===')
  if (issues.length === 0) {
    console.log('✅ No JSON string issues found!')
  } else {
    console.log(`❌ Found ${issues.length} fields with JSON string issues:`)
    issues.forEach((issue) => console.log(`   - ${issue}`))
  }

  process.exit(0)
}

checkGlobals()
