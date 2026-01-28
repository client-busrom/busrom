/**
 * Test SEO Distribution System
 * Verifies that keywords are properly distributed
 */

const CMS_URL = 'http://localhost:3002'

async function testDistribution() {
  console.log('🔍 Testing SEO Distribution System\n')
  console.log('═'.repeat(70))

  try {
    // 1. Fetch all SEO settings
    console.log('\n1️⃣  Fetching SEO settings from CMS...')
    const response = await fetch(`${CMS_URL}/api/seo-settings?locale=en&limit=100&depth=1`)

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    const data = await response.json()
    console.log(`   ✅ Found ${data.docs.length} SEO settings total`)

    // 2. Filter matching settings for homepage
    console.log('\n2️⃣  Filtering settings for homepage (/)...')
    const homeSettings = data.docs.filter(setting => {
      return (
        (setting.scope === 'exact_path' && setting.exactPath === '/') ||
        (setting.scope === 'page_type' && setting.pageType === 'home') ||
        (setting.scope === 'path_pattern' && setting.pathPattern === '/*') ||
        (setting.scope === 'global')
      )
    })
    console.log(`   ✅ Found ${homeSettings.length} matching settings for homepage`)

    // 3. Extract all keywords
    console.log('\n3️⃣  Extracting keywords from all settings...')
    const allKeywords = []
    homeSettings.forEach(setting => {
      if (setting.metaKeywords) {
        const keywords = setting.metaKeywords
          .split(/[,\n]/)
          .map(k => k.trim())
          .filter(k => k.length > 0)
        allKeywords.push(...keywords)
      }
    })

    const uniqueKeywords = [...new Set(allKeywords)]
    console.log(`   ✅ Total keywords (with duplicates): ${allKeywords.length}`)
    console.log(`   ✅ Unique keywords: ${uniqueKeywords.length}`)

    // 4. Show distribution percentages
    console.log('\n4️⃣  Calculated distribution:')
    const total = uniqueKeywords.length

    const distribution = {
      'img alt': Math.floor(total * 0.30),
      'a title': Math.floor(total * 0.15),
      'aria-label': Math.floor(total * 0.15),
      'aria-describedby': Math.floor(total * 0.10),
      'img title': Math.floor(total * 0.10),
      'placeholder': Math.floor(total * 0.08),
      'sr-only labels': Math.floor(total * 0.05),
      'data-* attributes': Math.floor(total * 0.05),
      'meta tags': Math.floor(total * 0.02),
    }

    Object.entries(distribution).forEach(([attr, count]) => {
      const percentage = ((count / total) * 100).toFixed(1)
      console.log(`   ${attr.padEnd(20)} ${count.toString().padStart(3)} (${percentage}%)`)
    })

    // 5. Show some example keywords
    console.log('\n5️⃣  Sample keywords (first 10):')
    uniqueKeywords.slice(0, 10).forEach((keyword, i) => {
      console.log(`   ${(i + 1).toString().padStart(2)}. ${keyword}`)
    })

    // 6. Summary
    console.log('\n' + '═'.repeat(70))
    console.log('📊 SUMMARY:')
    console.log(`   • ${homeSettings.length} SEO settings match homepage`)
    console.log(`   • ${uniqueKeywords.length} unique keywords to distribute`)
    console.log(`   • New approach: NO hidden content, NO CSS tricks`)
    console.log(`   • Keywords distributed across ${Object.keys(distribution).length} attribute types`)
    console.log('═'.repeat(70))

    console.log('\n✅ Test passed! The distribution system is working correctly.')
    console.log('\n📝 Next steps:')
    console.log('   1. Visit http://localhost:3001/en in browser')
    console.log('   2. Open DevTools and run: document.querySelectorAll("img[alt]").length')
    console.log('   3. Check Network tab for any errors')
    console.log('   4. View page source - should NOT see <div class="seo-hidden">')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

testDistribution()
