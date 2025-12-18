import fs from 'fs'
import path from 'path'

/**
 * Check for missing Chinese translations in exported data
 * Run: npx tsx scripts/check-missing-translations.ts
 */

interface MissingTranslation {
  global: string
  field: string
  enValue: any
  zhValue: any
  path: string
}

function analyzeTranslations() {
  const dataPath = path.join(process.cwd(), 'scripts/homepage-data-export.json')
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  const missing: MissingTranslation[] = []

  console.log('🔍 Checking for missing Chinese translations...\n')

  // Check each global
  for (const [globalSlug, globalData] of Object.entries(data.globals)) {
    if (!globalData || typeof globalData !== 'object') continue

    checkObject(globalData as any, globalSlug, '', missing)
  }

  // Report findings
  if (missing.length === 0) {
    console.log('✅ No missing translations found!')
  } else {
    console.log(`❌ Found ${missing.length} missing translations:\n`)

    // Group by global
    const byGlobal: Record<string, MissingTranslation[]> = {}
    missing.forEach(m => {
      if (!byGlobal[m.global]) byGlobal[m.global] = []
      byGlobal[m.global].push(m)
    })

    for (const [globalSlug, items] of Object.entries(byGlobal)) {
      console.log(`📦 ${globalSlug} (${items.length} missing):`)
      items.forEach(item => {
        console.log(`   - ${item.field}`)
        console.log(`     EN: "${truncate(JSON.stringify(item.enValue))}"`)
        console.log(`     ZH: "${truncate(JSON.stringify(item.zhValue))}"`)
      })
      console.log()
    }
  }

  // Save detailed report
  const reportPath = path.join(process.cwd(), 'scripts/missing-translations-report.json')
  fs.writeFileSync(reportPath, JSON.stringify({ missing, byGlobal: groupByGlobal(missing) }, null, 2))
  console.log(`📝 Detailed report saved to: ${reportPath}`)
}

function checkObject(obj: any, globalSlug: string, pathPrefix: string, missing: MissingTranslation[]) {
  if (!obj || typeof obj !== 'object') return

  // Check for localized fields (object with 'en' and 'zh' keys)
  if (obj.en !== undefined || obj.zh !== undefined) {
    const enValue = obj.en
    const zhValue = obj.zh

    // Check if zh is missing or empty
    if (!zhValue || (typeof zhValue === 'string' && zhValue.trim() === '')) {
      missing.push({
        global: globalSlug,
        field: pathPrefix || 'root',
        enValue,
        zhValue,
        path: pathPrefix,
      })
    }
    return // Don't recurse into locale objects
  }

  // Recurse into nested objects and arrays
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object') {
      const newPath = pathPrefix ? `${pathPrefix}.${key}` : key

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item && typeof item === 'object') {
            checkObject(item, globalSlug, `${newPath}[${index}]`, missing)
          }
        })
      } else {
        checkObject(value, globalSlug, newPath, missing)
      }
    }
  }
}

function groupByGlobal(missing: MissingTranslation[]) {
  const byGlobal: Record<string, MissingTranslation[]> = {}
  missing.forEach(m => {
    if (!byGlobal[m.global]) byGlobal[m.global] = []
    byGlobal[m.global].push(m)
  })
  return byGlobal
}

function truncate(str: string, maxLen = 80): string {
  if (str.length <= maxLen) return str
  return str.substring(0, maxLen) + '...'
}

analyzeTranslations()
