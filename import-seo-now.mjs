/**
 * Import SEO Settings to Local via Payload API
 */

import fs from 'fs'

const INPUT_FILE = './prod-seo-settings.json'
const LOCAL_CMS_URL = 'http://localhost:3002'
const ADMIN_EMAIL = 'admin@busrom.com'
const ADMIN_PASSWORD = 'Admin123456'

async function login() {
  console.log('🔐 Logging in to local CMS...')

  const response = await fetch(`${LOCAL_CMS_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Login failed: ${response.status} - ${error}`)
  }

  const data = await response.json()
  console.log(`   ✅ Logged in as: ${data.user.email}\n`)

  return data.token
}

async function clearExistingSeoSettings(token) {
  console.log('🗑️  Clearing existing SEO settings...')

  const response = await fetch(`${LOCAL_CMS_URL}/api/seo-settings?limit=1000`, {
    headers: { 'Authorization': `JWT ${token}` },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`)
  }

  const data = await response.json()
  console.log(`   Found ${data.docs.length} existing settings`)

  let deleteCount = 0
  for (const doc of data.docs) {
    try {
      const delResponse = await fetch(`${LOCAL_CMS_URL}/api/seo-settings/${doc.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `JWT ${token}` },
      })

      if (delResponse.ok) {
        deleteCount++
        process.stdout.write(`\r   Deleted: ${deleteCount}/${data.docs.length}`)
      }
    } catch (err) {
      // Continue on error
    }
  }

  console.log(`\n   ✅ Deleted ${deleteCount} settings\n`)
}

async function importSeoSettings(token) {
  console.log('📥 Importing production SEO settings...')

  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`${INPUT_FILE} not found!`)
  }

  const prodSettings = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'))
  console.log(`   Loaded ${prodSettings.length} settings from file\n`)

  let successCount = 0
  let failCount = 0
  const errors = []

  for (const setting of prodSettings) {
    try {
      const payload = { ...setting }
      delete payload.id
      delete payload.createdAt
      delete payload.updatedAt

      const response = await fetch(`${LOCAL_CMS_URL}/api/seo-settings`, {
        method: 'POST',
        headers: {
          'Authorization': `JWT ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        successCount++
      } else {
        failCount++
        const error = await response.text()
        errors.push(`${setting.identifier}: ${error.substring(0, 100)}`)
      }

      process.stdout.write(`\r   Progress: ${successCount + failCount}/${prodSettings.length} (✓${successCount} ✗${failCount})`)

    } catch (err) {
      failCount++
      errors.push(`${setting.identifier}: ${err.message}`)
    }
  }

  console.log(`\n\n   ✅ Successfully imported ${successCount} SEO settings`)

  if (failCount > 0) {
    console.log(`\n   ⚠️  ${failCount} failures:`)
    errors.slice(0, 5).forEach(err => console.log(`      - ${err}`))
    if (errors.length > 5) {
      console.log(`      ... and ${errors.length - 5} more`)
    }
  }

  return { successCount, failCount }
}

async function verify(token) {
  console.log('\n📊 Verifying import...')

  const response = await fetch(`${LOCAL_CMS_URL}/api/seo-settings?limit=1000`, {
    headers: { 'Authorization': `JWT ${token}` },
  })

  if (!response.ok) {
    throw new Error(`Failed to verify: ${response.status}`)
  }

  const data = await response.json()
  console.log(`   Total SEO settings in local DB: ${data.totalDocs}`)

  // Count by scope
  const byScope = {}
  data.docs.forEach(doc => {
    byScope[doc.scope] = (byScope[doc.scope] || 0) + 1
  })

  console.log(`\n   By scope:`)
  Object.entries(byScope).forEach(([scope, count]) => {
    console.log(`   - ${scope}: ${count}`)
  })
}

async function main() {
  console.log('═'.repeat(70))
  console.log('📦 Import SEO Settings from Production to Local')
  console.log('═'.repeat(70))
  console.log()

  try {
    const token = await login()
    await clearExistingSeoSettings(token)
    const { successCount } = await importSeoSettings(token)
    await verify(token)

    console.log('\n' + '═'.repeat(70))
    console.log('✅ Import Complete!')
    console.log('═'.repeat(70))
    console.log(`\n📈 Result: ${successCount}/110 SEO settings imported`)
    console.log('\n📝 Next steps:')
    console.log('   1. Visit: http://localhost:3002/admin/collections/seo-settings')
    console.log('   2. Run: node test-new-seo-logic.mjs\n')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

main()
