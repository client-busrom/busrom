import { getPayload } from 'payload'
import config from '../payload.config.ts'

/**
 * Trigger Production Image Regeneration
 * 
 * This script DOES NOT process images locally.
 * It simply queues a background job in the database for each media item.
 * The job will be executed by the Production Worker using Production Env Vars,
 * ensuring correct URLs (S3/CDN) and storage.
 */
async function run() {
  try {
    const payload = await getPayload({ config })
    console.log('🔄 Payload initialized. Preparing to queue regeneration jobs...')

    // Find all media items that are images
    const mediaItems = await payload.find({
      collection: 'media',
      limit: 0, // Get all
      where: {
        mimeType: {
          like: 'image/',
        },
      },
    })

    console.log(`📸 Found ${mediaItems.docs.length} images. Queuing background jobs...`)

    let queuedCount = 0

    for (const doc of mediaItems.docs) {
      try {
        await payload.jobs.queue({
          task: 'regenerateImageSizes' as any,
          input: {
            mediaId: doc.id,
            filename: doc.filename,
            focalX: doc.focalX ?? 50,
            focalY: doc.focalY ?? 50,
          },
        })
        queuedCount++
        if (queuedCount % 10 === 0) {
          console.log(`⏳ Queued ${queuedCount}/${mediaItems.docs.length}...`)
        }
      } catch (err: any) {
        console.error(`❌ Failed to queue job for ${doc.filename}:`, err.message)
      }
    }

    console.log(`\n🎉 Success! Queued ${queuedCount} regeneration jobs.`)
    console.log('👷 The backgrounds workers on the server will process these shortly.')
    process.exit(0)
  } catch (e: any) {
    console.error('CRITICAL FAILED:', e.message)
    process.exit(1)
  }
}

run()
