/**
 * Fix Migrated Media URLs and Add Variants
 *
 * This script updates the migrated media records to:
 * 1. Fix the URL format for MinIO
 * 2. Add thumbnail URL for admin display
 * 3. Map Keystone variants to Payload sizes
 *
 * Keystone variants → Payload sizes mapping:
 * - thumbnail → sizes_thumbnail
 * - small → sizes_card (768px)
 * - medium → sizes_tablet (1024px)
 * - large/xlarge → sizes_desktop (1920px)
 */

import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

// Keystone database connection
const keystonePool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'busrom_cms',
  user: 'busrom',
  password: 'busrom_dev_password',
})

// Payload database connection
const payloadPool = new Pool({
  connectionString: process.env.DATABASE_URI || 'postgresql://busrom_dev:busrom_dev_password@localhost:5432/busrom_payload',
})

// MinIO base URL
const MINIO_BASE_URL = 'http://localhost:9000/busrom-media'

interface KeystoneMedia {
  id: string
  filename: string
  fileKey: string
  fileSize: number
  width: number
  height: number
  variants: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
    xlarge?: string
    webp?: string
  }
}

async function main() {
  console.log('🔧 Fixing migrated media URLs and adding variants...\n')

  try {
    // Get all Keystone media with variants
    console.log('📥 Fetching Keystone media with variants...')
    const keystoneMedia = await getKeystoneMediaWithVariants()
    console.log(`   Found ${keystoneMedia.length} records with variants\n`)

    // Update Payload media records
    console.log('📤 Updating Payload media records...')
    let updated = 0
    let errors = 0

    for (const media of keystoneMedia) {
      if (!media.fileKey) continue

      try {
        await updatePayloadMedia(media)
        updated++
        if (updated % 100 === 0) {
          console.log(`   Progress: ${updated} updated`)
        }
      } catch (err: any) {
        errors++
        if (errors <= 5) {
          console.error(`   Error updating ${media.fileKey}: ${err.message}`)
        }
      }
    }

    console.log(`\n✅ Update completed!`)
    console.log(`   Updated: ${updated}`)
    console.log(`   Errors: ${errors}`)

  } catch (error) {
    console.error('❌ Update failed:', error)
    process.exit(1)
  } finally {
    await keystonePool.end()
    await payloadPool.end()
  }

  process.exit(0)
}

async function getKeystoneMediaWithVariants(): Promise<KeystoneMedia[]> {
  const result = await keystonePool.query(`
    SELECT
      id,
      filename,
      "fileKey",
      "fileSize",
      width,
      height,
      variants
    FROM "Media"
    WHERE "fileKey" IS NOT NULL
    ORDER BY "createdAt" ASC
  `)
  return result.rows.map(row => ({
    ...row,
    fileKey: row.fileKey,
    fileSize: row.fileSize,
    variants: row.variants || {}
  }))
}

async function updatePayloadMedia(media: KeystoneMedia): Promise<void> {
  const fileKey = media.fileKey
  const baseName = fileKey.replace(/\.[^.]+$/, '') // Remove extension
  const ext = fileKey.split('.').pop() || 'jpg'

  // Build URLs
  const mainUrl = `${MINIO_BASE_URL}/${fileKey}`
  const thumbnailUrl = `${MINIO_BASE_URL}/variants/thumbnail/${fileKey}`

  // Calculate variant dimensions (approximate based on Payload's imageSizes config)
  // thumbnail: 400x300, card: 768x512, tablet: 1024xAuto, desktop: 1920xAuto
  const aspectRatio = media.width && media.height ? media.width / media.height : 1

  const thumbnailWidth = 400
  const thumbnailHeight = Math.round(thumbnailWidth / aspectRatio)

  const cardWidth = 768
  const cardHeight = Math.round(cardWidth / aspectRatio)

  const tabletWidth = 1024
  const tabletHeight = Math.round(tabletWidth / aspectRatio)

  const desktopWidth = 1920
  const desktopHeight = Math.round(desktopWidth / aspectRatio)

  // Update Payload media record
  await payloadPool.query(`
    UPDATE media SET
      url = $1,
      thumbnail_u_r_l = $2,
      sizes_thumbnail_url = $2,
      sizes_thumbnail_width = $3,
      sizes_thumbnail_height = $4,
      sizes_thumbnail_mime_type = 'image/jpeg',
      sizes_thumbnail_filename = $5,
      sizes_card_url = $6,
      sizes_card_width = $7,
      sizes_card_height = $8,
      sizes_card_mime_type = 'image/jpeg',
      sizes_card_filename = $9,
      sizes_tablet_url = $10,
      sizes_tablet_width = $11,
      sizes_tablet_height = $12,
      sizes_tablet_mime_type = 'image/jpeg',
      sizes_tablet_filename = $13,
      sizes_desktop_url = $14,
      sizes_desktop_width = $15,
      sizes_desktop_height = $16,
      sizes_desktop_mime_type = 'image/jpeg',
      sizes_desktop_filename = $17
    WHERE filename = $18
  `, [
    mainUrl,
    thumbnailUrl,
    thumbnailWidth,
    thumbnailHeight,
    `thumbnail-${fileKey}`,
    `${MINIO_BASE_URL}/variants/small/${fileKey}`,
    cardWidth,
    cardHeight,
    `card-${fileKey}`,
    `${MINIO_BASE_URL}/variants/medium/${fileKey}`,
    tabletWidth,
    tabletHeight,
    `tablet-${fileKey}`,
    `${MINIO_BASE_URL}/variants/large/${fileKey}`,
    desktopWidth,
    desktopHeight,
    `desktop-${fileKey}`,
    fileKey,
  ])
}

// Run update
main()
