/**
 * Import SEO Settings to Local via Payload API
 * Uses Payload's API to properly handle localized fields
 */

import fs from 'fs'

const INPUT_FILE = './prod-seo-settings.json'
const LOCAL_CMS_URL = 'http://localhost:3002'

// You need to provide admin credentials
const ADMIN_EMAIL = 'admin@busrom.com' // Change this
const ADMIN_PASSWORD = 'your-admin-password' // Change this

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
    throw new Error(`Login failed: ${response.status}`)
  }

  const data = await response.json()
  console.log(`   ✅ Logged in as: ${data.user.email}\n`)

  return data.token
}

async function clearExistingSeoSettings(token) {
  console.log('🗑️  Clearing existing SEO settings...')

  // Get all existing IDs
  const response = await fetch(`${LOCAL_CMS_URL}/api/seo-settings?limit=1000`, {
    headers: { 'Authorization': `JWT ${token}` },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`)
  }

  const data = await response.json()
  console.log(`   Found ${data.docs.length} existing settings`)

  // Delete each one
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
      console.error(`\n   ⚠️  Failed to delete ${doc.id}:`, err.message)
    }
  }

  console.log(`\n   ✅ Deleted ${deleteCount} settings\n`)
}

async function importSeoSettings(token) {
  console.log('📥 Importing production SEO settings...')

  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`${INPUT_FILE} not found! Run: node export-prod-seo.mjs first`)
  }

  const prodSettings = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'))
  console.log(`   Loaded ${prodSettings.length} settings from ${INPUT_FILE}\n`)

  let successCount = 0
  let failCount = 0

  for (const setting of prodSettings) {
    try {
      // Prepare payload (remove id and timestamps)
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
        console.error(`\n   ⚠️  Failed to import ${setting.identifier}: ${error.substring(0, 100)}`)
      }

      process.stdout.write(`\r   Imported: ${successCount}/${prodSettings.length} (${failCount} failed)`)

    } catch (err) {
      failCount++
      console.error(`\n   ⚠️  Error importing ${setting.identifier}:`, err.message)
    }
  }

  console.log(`\n   ✅ Successfully imported ${successCount} SEO settings\n`)
}

async function main() {
  console.log('📦 Importing SEO Settings via Payload API\n')

  try {
    const token = await login()
    await clearExistingSeoSettings(token)
    await importSeoSettings(token)

    console.log('✅ Import complete!')
    console.log('\n📝 Next steps:')
    console.log('   1. Check: http://localhost:3002/admin/collections/seo-settings')
    console.log('   2. Run: node test-new-seo-logic.mjs')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

main()
