/**
 * Test New SEO Logic with Global Priority System
 * Tests homepage and non-homepage SEO behavior
 */

const CMS_URL = 'http://localhost:3002'

async function testNewSeoLogic() {
  console.log('🧪 Testing New SEO Logic\n')
  console.log('═'.repeat(80))

  try {
    // Fetch all SEO settings
    console.log('\n📥 Fetching all SEO settings...')
    const response = await fetch(`${CMS_URL}/api/seo-settings?locale=en&limit=100&depth=1`)

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    const data = await response.json()
    const allSettings = data.docs
    console.log(`   ✅ Found ${allSettings.length} total SEO settings`)

    // Find global setting
    const globalSetting = allSettings.find(s => s.scope === 'global')
    console.log(`\n🌍 Global Setting:`)
    if (globalSetting) {
      console.log(`   Title: ${globalSetting.metaTitle || '(none)'}`)
      console.log(`   Description: ${globalSetting.metaDescription || '(none)'}`)
      console.log(`   Keywords: ${globalSetting.metaKeywords ? globalSetting.metaKeywords.split(',').length : 0} keywords`)
      console.log(`   Sitemap Priority: ${globalSetting.sitemapPriority ?? 0.5}`)
    } else {
      console.log(`   ⚠️  No global setting found!`)
    }

    // Test Homepage Logic
    console.log(`\n${'─'.repeat(80)}`)
    console.log('🏠 HOMEPAGE LOGIC TEST')
    console.log('─'.repeat(80))

    const homeMatches = allSettings.filter(s => {
      if (s.scope === 'exact_path' && s.exactPath === '/') return true
      if (s.scope === 'page_type' && s.pageType === 'home') return true
      if (s.scope === 'path_pattern' && s.pathPattern) {
        // Simple pattern matching for testing
        return s.pathPattern === '/' || s.pathPattern === '/*'
      }
      return false
    })

    console.log(`\n✅ Found ${homeMatches.length} matching settings for homepage (excluding global)`)

    homeMatches.forEach((s, i) => {
      console.log(`\n   Match #${i + 1}:`)
      console.log(`   - Scope: ${s.scope}`)
      console.log(`   - Identifier: ${s.identifier}`)
      console.log(`   - Priority: ${s.sitemapPriority ?? 0.5}`)
      console.log(`   - Title: ${s.metaTitle || '(none)'}`)
      console.log(`   - Keywords: ${s.metaKeywords ? s.metaKeywords.split(',').length : 0}`)
    })

    // Extract all text for homepage distribution
    const homeTexts = []

    // Add global keywords
    if (globalSetting?.metaKeywords) {
      const keywords = globalSetting.metaKeywords.split(/[,\n]/).map(k => k.trim()).filter(k => k)
      homeTexts.push(...keywords)
      console.log(`\n📝 From global keywords: ${keywords.length} items`)
    }

    // Add all text from homepage matches
    homeMatches.forEach(s => {
      const texts = []
      if (s.metaTitle) texts.push(s.metaTitle)
      if (s.metaDescription) texts.push(s.metaDescription)
      if (s.metaKeywords) {
        texts.push(...s.metaKeywords.split(/[,\n]/).map(k => k.trim()).filter(k => k))
      }
      homeTexts.push(...texts)
      console.log(`   From ${s.identifier}: ${texts.length} items`)
    })

    const uniqueHomeTexts = [...new Set(homeTexts)]
    console.log(`\n📊 Homepage Distribution Summary:`)
    console.log(`   Total texts (with duplicates): ${homeTexts.length}`)
    console.log(`   Unique texts: ${uniqueHomeTexts.length}`)
    console.log(`   SEO Title: ${globalSetting?.metaTitle || '(use fallback)'}`)
    console.log(`   SEO Description: ${globalSetting?.metaDescription || '(use fallback)'}`)

    // Test Non-Homepage Logic (Product Page Example)
    console.log(`\n${'─'.repeat(80)}`)
    console.log('📄 NON-HOMEPAGE LOGIC TEST (Example: /products/abc)')
    console.log('─'.repeat(80))

    const testPath = '/products/abc'
    const testPageType = 'product_detail'

    const nonHomeMatches = allSettings.filter(s => {
      if (s.scope === 'global') return false
      if (s.scope === 'exact_path' && s.exactPath === testPath) return true
      if (s.scope === 'page_type' && s.pageType === testPageType) return true
      if (s.scope === 'path_pattern' && s.pathPattern) {
        // Simple wildcard matching
        if (s.pathPattern === '/products/*' || s.pathPattern === '/products/**') return true
      }
      return false
    })

    console.log(`\n✅ Found ${nonHomeMatches.length} matching settings for ${testPath}`)

    if (nonHomeMatches.length === 0) {
      console.log(`\n   ℹ️  No matches found, will use global as fallback`)
      if (globalSetting) {
        console.log(`   Title: ${globalSetting.metaTitle}`)
        console.log(`   Description: ${globalSetting.metaDescription}`)
        const globalKeywords = globalSetting.metaKeywords ? globalSetting.metaKeywords.split(',').map(k => k.trim()).filter(k => k) : []
        console.log(`   Keywords to distribute: ${globalKeywords.length}`)
      }
    } else {
      // Sort by priority
      const sorted = nonHomeMatches.sort((a, b) => {
        const priorityA = a.sitemapPriority ?? 0.5
        const priorityB = b.sitemapPriority ?? 0.5
        if (priorityA !== priorityB) return priorityB - priorityA

        const scopePriority = { exact_path: 4, path_pattern: 3, page_type: 2, global: 1 }
        const scopeA = scopePriority[a.scope] || 0
        const scopeB = scopePriority[b.scope] || 0
        if (scopeA !== scopeB) return scopeB - scopeA

        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return timeA - timeB
      })

      console.log(`\n   Sorted by priority:`)
      sorted.forEach((s, i) => {
        console.log(`\n   #${i + 1} (${i === 0 ? 'WINNER' : 'other'}):`)
        console.log(`      Scope: ${s.scope}`)
        console.log(`      Identifier: ${s.identifier}`)
        console.log(`      Priority: ${s.sitemapPriority ?? 0.5}`)
        console.log(`      Title: ${s.metaTitle || '(none)'}`)
        console.log(`      Keywords: ${s.metaKeywords ? s.metaKeywords.split(',').length : 0}`)
      })

      const winner = sorted[0]
      const others = sorted.slice(1)

      // Extract texts for distribution
      const nonHomeTexts = []

      // Winner's keywords
      if (winner.metaKeywords) {
        const keywords = winner.metaKeywords.split(/[,\n]/).map(k => k.trim()).filter(k => k)
        nonHomeTexts.push(...keywords)
        console.log(`\n   Winner's keywords: ${keywords.length}`)
      }

      // Others' all text
      others.forEach(s => {
        const texts = []
        if (s.metaTitle) texts.push(s.metaTitle)
        if (s.metaDescription) texts.push(s.metaDescription)
        if (s.metaKeywords) {
          texts.push(...s.metaKeywords.split(/[,\n]/).map(k => k.trim()).filter(k => k))
        }
        nonHomeTexts.push(...texts)
        console.log(`   From ${s.identifier}: ${texts.length} items`)
      })

      const uniqueNonHomeTexts = [...new Set(nonHomeTexts)]
      console.log(`\n📊 Product Page Distribution Summary:`)
      console.log(`   Total texts: ${nonHomeTexts.length}`)
      console.log(`   Unique texts: ${uniqueNonHomeTexts.length}`)
      console.log(`   SEO Title: ${winner.metaTitle || '(none)'}`)
      console.log(`   SEO Description: ${winner.metaDescription || '(none)'}`)
    }

    // Summary
    console.log(`\n${'═'.repeat(80)}`)
    console.log('✅ TEST SUMMARY')
    console.log('═'.repeat(80))
    console.log(`\n✅ Homepage:`)
    console.log(`   - Uses global title/description`)
    console.log(`   - Distributes ${uniqueHomeTexts.length} unique texts (global keywords + all matching data)`)
    console.log(`\n✅ Non-Homepage:`)
    console.log(`   - Uses highest priority match (or global if no match)`)
    console.log(`   - Distributes keywords from winner + all text from others`)
    console.log(`\n✅ Priority Order:`)
    console.log(`   1. sitemapPriority (higher first)`)
    console.log(`   2. scope (exact_path > path_pattern > page_type)`)
    console.log(`   3. createdAt (earlier first)`)

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

testNewSeoLogic()
