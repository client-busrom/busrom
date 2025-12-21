/**
 * Fix Keystone Media URLs in Payload CMS Database
 *
 * Problem:
 * - Keystone migrated images are stored at: /{category}/{type}/{filename}
 *   e.g., /glass-standoff/scene/glass-standoff_scene_g-1_sn-9_013.jpg
 * - But Payload CMS database has URLs pointing to: /media/{filename}
 *   e.g., /media/glass-standoff_scene_g-1_sn-9_013.jpg
 *
 * This script updates the `url` field in the `media` table to point to the correct S3 path.
 *
 * Usage:
 *   # Dry run (default) - show what would be changed
 *   npx tsx scripts/fix-keystone-media-urls.ts
 *
 *   # Actually apply changes
 *   npx tsx scripts/fix-keystone-media-urls.ts --apply
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const CDN_DOMAIN = process.env.CDN_DOMAIN || 'd2kqew3hn5wphn.cloudfront.net'

// Category mapping based on filename prefix
const CATEGORY_MAP: Record<string, string> = {
  'glass-standoff': 'glass-standoff',
  'glass-connected': 'glass-connected-fitting',
  'glass-fence': 'glass-fence-spigot',
  'glass-hinge': 'glass-hinge',
  'guardrail': 'guardrail-glass-clip',
  'bathroom-glass': 'bathroom-glass-clip',
  'bathroom-door': 'bathroom-door-handle',
  'sliding-door': 'sliding-door-kit',
  'hidden-hook': 'hidden-hook',
}

// Type mapping based on filename pattern
const TYPE_PATTERNS: Record<string, string> = {
  '_scene_': 'scene',
  '_effect_': 'effect',
  '_combo_': 'combo',
  '_product_': 'product',
}

function getCategory(filename: string): string | null {
  for (const [prefix, category] of Object.entries(CATEGORY_MAP)) {
    if (filename.startsWith(prefix)) {
      return category
    }
  }
  return null
}

function getType(filename: string): string | null {
  for (const [pattern, type] of Object.entries(TYPE_PATTERNS)) {
    if (filename.includes(pattern)) {
      return type
    }
  }
  return null
}

function buildCorrectUrl(filename: string): string | null {
  const category = getCategory(filename)
  const type = getType(filename)

  if (!category || !type) {
    return null
  }

  return `https://${CDN_DOMAIN}/${category}/${type}/${filename}`
}

function isKeystoneMigratedImage(filename: string): boolean {
  // Keystone images have patterns like: category_type_xxx.jpg
  return getCategory(filename) !== null && getType(filename) !== null
}

async function main() {
  const applyChanges = process.argv.includes('--apply')

  console.log('🔧 Fix Keystone Media URLs Script')
  console.log('==================================\n')
  console.log(`Mode: ${applyChanges ? '⚠️  APPLY CHANGES' : '🔍 DRY RUN (use --apply to actually update)'}`)
  console.log(`CDN Domain: ${CDN_DOMAIN}\n`)

  const payload = await getPayload({ config })

  // Fetch all media items
  console.log('📥 Fetching all media items...')
  const allMedia = await payload.find({
    collection: 'media',
    limit: 5000,
    pagination: false,
  })

  console.log(`   Found ${allMedia.docs.length} media items\n`)

  // Analyze and categorize
  const needsUpdate: Array<{
    id: number
    filename: string
    currentUrl: string
    correctUrl: string
  }> = []

  const alreadyCorrect: string[] = []
  const payloadUploaded: string[] = []
  const unknown: string[] = []

  for (const media of allMedia.docs) {
    const filename = media.filename as string
    const currentUrl = media.url as string

    if (!isKeystoneMigratedImage(filename)) {
      // This is a Payload-uploaded image, leave it alone
      payloadUploaded.push(filename)
      continue
    }

    const correctUrl = buildCorrectUrl(filename)
    if (!correctUrl) {
      unknown.push(filename)
      continue
    }

    if (currentUrl === correctUrl) {
      alreadyCorrect.push(filename)
      continue
    }

    needsUpdate.push({
      id: media.id as number,
      filename,
      currentUrl,
      correctUrl,
    })
  }

  // Report
  console.log('📊 Analysis Results:')
  console.log(`   ✅ Already correct: ${alreadyCorrect.length}`)
  console.log(`   📦 Payload uploads (no change needed): ${payloadUploaded.length}`)
  console.log(`   ❓ Unknown pattern: ${unknown.length}`)
  console.log(`   🔄 Needs update: ${needsUpdate.length}\n`)

  if (unknown.length > 0 && unknown.length <= 20) {
    console.log('   Unknown files:')
    unknown.forEach((f) => console.log(`      - ${f}`))
    console.log('')
  }

  if (needsUpdate.length === 0) {
    console.log('✅ No updates needed!')
    process.exit(0)
  }

  // Show sample updates
  console.log('📝 Sample updates (first 10):')
  needsUpdate.slice(0, 10).forEach((item, i) => {
    console.log(`   ${i + 1}. [ID: ${item.id}] ${item.filename}`)
    console.log(`      FROM: ${item.currentUrl}`)
    console.log(`      TO:   ${item.correctUrl}`)
    console.log('')
  })

  if (!applyChanges) {
    console.log('ℹ️  This was a dry run. Run with --apply to actually update the database.')
    process.exit(0)
  }

  // Apply updates
  console.log(`\n🚀 Applying ${needsUpdate.length} updates...`)

  let success = 0
  let failed = 0

  for (const item of needsUpdate) {
    try {
      await payload.update({
        collection: 'media',
        id: item.id,
        data: {
          url: item.correctUrl,
        },
      })
      success++

      if (success % 100 === 0) {
        console.log(`   Progress: ${success}/${needsUpdate.length}`)
      }
    } catch (error: any) {
      console.error(`   ❌ Failed to update ID ${item.id}: ${error.message}`)
      failed++
    }
  }

  console.log(`\n✅ Update completed!`)
  console.log(`   Success: ${success}`)
  console.log(`   Failed: ${failed}`)

  process.exit(failed > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
