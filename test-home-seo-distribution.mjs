/**
 * Test what getHomePageSeo is actually returning
 * This will help us verify if the backend is generating the correct distribution
 */

const PAYLOAD_URL = 'http://localhost:3002'

async function login() {
  const response = await fetch(`${PAYLOAD_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@busrom.com',
      password: 'Admin123456',
    }),
  })

  const data = await response.json()
  if (!data.token) {
    throw new Error('Login failed: ' + JSON.stringify(data))
  }
  return data.token
}

async function getAllSeoSettings(token) {
  const response = await fetch(`${PAYLOAD_URL}/api/seo-settings?limit=1000&locale=en`, {
    headers: {
      'Authorization': `JWT ${token}`,
    },
  })
  const data = await response.json()
  return data.docs
}

function extractAllTextFromSetting(setting) {
  const texts = []
  if (setting.metaTitle) texts.push(setting.metaTitle)
  if (setting.metaDescription) texts.push(setting.metaDescription)
  if (setting.metaKeywords) {
    const keywords = setting.metaKeywords.split(/[,\n]/).map(k => k.trim()).filter(k => k.length > 0)
    texts.push(...keywords)
  }
  return texts
}

function matchPathPattern(pattern, path) {
  try {
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\//g, '\\/')
    const regex = new RegExp(`^${regexPattern}$`)
    return regex.test(path)
  } catch (e) {
    console.error(`Invalid pattern: ${pattern}`, e)
    return false
  }
}

async function getHomePageSeo(allSettings) {
  const globalSetting = allSettings.find(s => s.scope === 'global')

  const homeMatches = allSettings.filter(s => {
    if (s.scope === 'exact_path' && s.exactPath === '/') return true
    if (s.scope === 'page_type' && s.pageType === 'home') return true
    if (s.scope === 'path_pattern' && s.pathPattern && matchPathPattern(s.pathPattern, '/')) return true
    return false
  })

  console.log('\n🔍 Analyzing Home Page SEO Data:\n')
  console.log('═'.repeat(80))

  console.log(`\n📊 Global Setting:`)
  if (globalSetting) {
    console.log(`   Identifier: ${globalSetting.identifier}`)
    console.log(`   Meta Title: ${globalSetting.metaTitle || 'N/A'}`)
    console.log(`   Meta Description: ${globalSetting.metaDescription || 'N/A'}`)
    if (globalSetting.metaKeywords) {
      const keywords = globalSetting.metaKeywords.split(/[,\n]/).map(k => k.trim()).filter(k => k.length > 0)
      console.log(`   Keywords: ${keywords.length} keywords`)
    }
  } else {
    console.log('   ❌ No global setting found!')
  }

  console.log(`\n📊 Home Matches: ${homeMatches.length} configs`)
  homeMatches.forEach((match, i) => {
    console.log(`\n   ${i + 1}. ${match.identifier}`)
    console.log(`      Scope: ${match.scope}`)
    console.log(`      Priority: ${match.sitemapPriority || 0.5}`)
    const texts = extractAllTextFromSetting(match)
    console.log(`      Total texts: ${texts.length}`)
  })

  // Collect all texts
  const allTexts = []

  // 1. Add global keywords
  if (globalSetting?.metaKeywords) {
    const keywords = globalSetting.metaKeywords.split(/[,\n]/).map(k => k.trim()).filter(k => k.length > 0)
    allTexts.push(...keywords)
    console.log(`\n✅ Added ${keywords.length} keywords from global`)
  }

  // 2. Add all text from other homepage matches
  homeMatches.forEach(setting => {
    const texts = extractAllTextFromSetting(setting)
    allTexts.push(...texts)
    console.log(`✅ Added ${texts.length} texts from ${setting.identifier}`)
  })

  // Remove duplicates
  const uniqueTexts = [...new Set(allTexts)]

  console.log('\n' + '═'.repeat(80))
  console.log(`\n📈 Summary:`)
  console.log(`   Total texts collected: ${allTexts.length}`)
  console.log(`   Unique texts: ${uniqueTexts.length}`)
  console.log(`   Duplicates removed: ${allTexts.length - uniqueTexts.length}`)

  // Calculate expected distribution
  const total = uniqueTexts.length
  console.log(`\n📊 Expected Distribution (for ${total} unique keywords):`)
  console.log(`   img[alt] (30%):          ${Math.floor(total * 0.30)}`)
  console.log(`   a[title] (15%):          ${Math.floor(total * 0.15)}`)
  console.log(`   [aria-label] (15%):      ${Math.floor(total * 0.15)}`)
  console.log(`   [aria-describedby] (10%): ${Math.floor(total * 0.10)}`)
  console.log(`   img[title] (10%):        ${Math.floor(total * 0.10)}`)
  console.log(`   [placeholder] (8%):      ${Math.floor(total * 0.08)}`)
  console.log(`   .sr-only (5%):           ${Math.floor(total * 0.05)}`)
  console.log(`   [data-category] (5%):    ${Math.floor(total * 0.05)}`)

  const used = Math.floor(total * 0.30) + Math.floor(total * 0.15) + Math.floor(total * 0.15) +
               Math.floor(total * 0.10) + Math.floor(total * 0.10) + Math.floor(total * 0.08) +
               Math.floor(total * 0.05) + Math.floor(total * 0.05)
  const remaining = total - used
  console.log(`   [data-label] (remaining): ${remaining}`)

  return {
    globalSetting,
    homeMatches,
    allTexts,
    uniqueTexts,
  }
}

async function main() {
  try {
    console.log('🔐 Logging in...')
    const token = await login()
    console.log('✅ Login successful')

    console.log('\n📥 Fetching all SEO settings...')
    const allSettings = await getAllSeoSettings(token)
    console.log(`✅ Fetched ${allSettings.length} SEO settings`)

    await getHomePageSeo(allSettings)

  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

main()
