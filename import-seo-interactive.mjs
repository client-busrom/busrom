/**
 * Import SEO Settings to Local via Payload API (Interactive)
 */

import fs from 'fs'
import readline from 'readline'

const INPUT_FILE = './prod-seo-settings.json'
const LOCAL_CMS_URL = 'http://localhost:3002'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function login(email, password) {
  console.log('\n🔐 Logging in to local CMS...')

  const response = await fetch(`${LOCAL_CMS_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Login failed: ${response.status} - ${error}`)
  }

  const data = await response.json()
  console.log(`   ✅ Logged in as: ${data.user.email}`)

  return data.token
}

async function clearExistingSeoSettings(token) {
  console.log('\n🗑️  Clearing existing SEO settings...')

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
      // Silent fail
    }
  }

  console.log(`\n   ✅ Deleted ${deleteCount} settings`)
}

async function importSeoSettings(token) {
  console.log('\n📥 Importing production SEO settings...')

  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`${INPUT_FILE} not found! Run: node export-prod-seo.mjs first`)
  }

  const prodSettings = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'))
  console.log(`   Loaded ${prodSettings.length} settings from file`)

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
        errors.push(`${setting.identifier}: ${error.substring(0, 80)}`)
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
}

async function main() {
  console.log('═'.repeat(70))
  console.log('📦 Import SEO Settings from Production to Local')
  console.log('═'.repeat(70))

  try {
    console.log('\n📋 Steps:')
    console.log('   1. Login to local CMS')
    console.log('   2. Clear existing SEO settings')
    console.log('   3. Import production SEO settings\n')

    const email = await question('👤 Admin email: ')
    const password = await question('🔑 Admin password: ')

    rl.close()

    const token = await login(email, password)
    await clearExistingSeoSettings(token)
    await importSeoSettings(token)

    console.log('\n' + '═'.repeat(70))
    console.log('✅ Import complete!')
    console.log('═'.repeat(70))
    console.log('\n📝 Next steps:')
    console.log('   1. Visit: http://localhost:3002/admin/collections/seo-settings')
    console.log('   2. Verify the imported data')
    console.log('   3. Run: node test-new-seo-logic.mjs\n')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    rl.close()
    process.exit(1)
  }
}

main()
