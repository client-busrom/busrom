/**
 * Copy Keystone Media Files to Payload 'media/' Prefix
 *
 * Keystone stores files at the bucket root (e.g., busrom-media/xyz.jpg)
 * Payload S3 plugin expects files at media/ prefix (e.g., busrom-media/media/xyz.jpg)
 *
 * This script copies:
 * 1. Main files from root to media/
 * 2. Variant files from variants/{size}/ to media/
 *
 * Usage:
 *   npx tsx scripts/copy-keystone-media-to-prefix.ts
 */

import 'dotenv/config'
import { S3Client, ListObjectsV2Command, CopyObjectCommand } from '@aws-sdk/client-s3'

// S3/MinIO configuration
const s3Config = {
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin123',
  },
  forcePathStyle: true, // Required for MinIO
}

const BUCKET = process.env.S3_BUCKET_NAME || 'busrom-media'

const s3Client = new S3Client(s3Config)

async function listObjects(prefix: string = ''): Promise<string[]> {
  const keys: string[] = []
  let continuationToken: string | undefined

  do {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    })

    const response = await s3Client.send(command)

    if (response.Contents) {
      for (const obj of response.Contents) {
        if (obj.Key) {
          keys.push(obj.Key)
        }
      }
    }

    continuationToken = response.NextContinuationToken
  } while (continuationToken)

  return keys
}

async function copyObject(sourceKey: string, destKey: string): Promise<boolean> {
  try {
    const command = new CopyObjectCommand({
      Bucket: BUCKET,
      CopySource: `${BUCKET}/${sourceKey}`,
      Key: destKey,
    })

    await s3Client.send(command)
    return true
  } catch (error: any) {
    console.error(`Failed to copy ${sourceKey} -> ${destKey}: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🚀 Copying Keystone media files to Payload prefix...\n')
  console.log(`   Bucket: ${BUCKET}`)
  console.log(`   Endpoint: ${s3Config.endpoint}\n`)

  let copied = 0
  let skipped = 0
  let errors = 0

  // Step 1: Copy root-level image files (main images)
  console.log('📁 Copying main image files from bucket root to media/...')
  const rootObjects = await listObjects('')

  // Filter for root-level files only (not in subdirectories, and not already in media/)
  const rootFiles = rootObjects.filter(key => {
    // Skip if already in a directory
    if (key.includes('/')) return false
    // Only process image files
    if (!key.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return false
    return true
  })

  console.log(`   Found ${rootFiles.length} root-level image files\n`)

  for (const key of rootFiles) {
    const destKey = `media/${key}`
    const success = await copyObject(key, destKey)

    if (success) {
      copied++
      if (copied % 100 === 0) {
        console.log(`   Progress: ${copied} copied`)
      }
    } else {
      errors++
    }
  }

  console.log(`   Root files: ${copied} copied, ${errors} errors\n`)

  // Step 2: Copy variant files
  console.log('📁 Copying variant files...')
  const variantPrefixes = ['variants/thumbnail/', 'variants/small/', 'variants/medium/', 'variants/large/', 'variants/xlarge/', 'variants/webp/']

  for (const variantPrefix of variantPrefixes) {
    const variantObjects = await listObjects(variantPrefix)

    // Filter for actual files (skip directory markers)
    const variantFiles = variantObjects.filter(key => {
      if (!key.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return false
      return true
    })

    if (variantFiles.length === 0) continue

    console.log(`   ${variantPrefix}: ${variantFiles.length} files`)

    for (const key of variantFiles) {
      // Extract just the filename from the path
      const filename = key.split('/').pop()
      if (!filename) continue

      // Map Keystone variant names to Payload size names
      let sizePrefix = variantPrefix.replace('variants/', '').replace('/', '')
      if (sizePrefix === 'small') sizePrefix = 'card'
      if (sizePrefix === 'medium') sizePrefix = 'tablet'
      if (sizePrefix === 'large' || sizePrefix === 'xlarge') sizePrefix = 'desktop'

      // Payload stores variants as: media/{size}-{filename}
      const destKey = `media/${filename}`

      const success = await copyObject(key, destKey)
      if (success) {
        copied++
      } else {
        errors++
      }
    }
  }

  console.log(`\n✅ Copy completed!`)
  console.log(`   Total copied: ${copied}`)
  console.log(`   Total errors: ${errors}`)
}

main().catch(console.error)
