/**
 * Export SEO Settings from AWS Production
 */

import fs from 'fs'

const PROD_CMS_URL = 'https://cms.busromhouse.com' // Production CMS URL
const OUTPUT_FILE = './prod-seo-settings.json'

async function exportProdSeoSettings() {
  console.log('📥 Exporting SEO Settings from AWS Production...\n')

  try {
    const url = `${PROD_CMS_URL}/api/seo-settings?limit=1000&depth=1`
    console.log(`   Fetching: ${url}`)

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`   ✅ Fetched ${data.docs.length} SEO settings\n`)

    // Save to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data.docs, null, 2))
    console.log(`   💾 Saved to: ${OUTPUT_FILE}`)

    // Show summary
    console.log(`\n📊 Summary:`)
    const byScope = {}
    data.docs.forEach(doc => {
      byScope[doc.scope] = (byScope[doc.scope] || 0) + 1
    })

    Object.entries(byScope).forEach(([scope, count]) => {
      console.log(`   ${scope}: ${count}`)
    })

    console.log(`\n✅ Export complete!`)
    console.log(`\n📝 Next steps:`)
    console.log(`   1. Review: ${OUTPUT_FILE}`)
    console.log(`   2. Run: node import-seo-to-local.mjs`)

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

exportProdSeoSettings()
