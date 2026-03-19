import { getPayload } from 'payload'
import config from '../payload.config.ts'
import { regenerateImageSizesTask } from '../src/jobs/regenerateImageSizes.ts'

async function run() {
  try {
    const payload = await getPayload({ config })
    console.log('🔄 Payload initialized for local image regeneration')

    // Find all media items
    const mediaItems = await payload.find({
      collection: 'media',
      limit: 1000,
    })

    console.log(`📸 Found ${mediaItems.docs.length} media items. Regenerating variants with new "inside" fit rules...`)

    let successCount = 0
    let failCount = 0

    for (const doc of mediaItems.docs) {
      // Only process image files
      if (!doc.mimeType?.startsWith('image/')) continue
      
      try {
        console.log(`⏳ Processing: ${doc.filename}...`)
        
        // Call the job handler manually
        // We use focalX: 50, focalY: 50 as default since we don't care about focal point for inside fit
        const result = await regenerateImageSizesTask.handler({
          input: {
            mediaId: doc.id as number,
            filename: doc.filename as string,
            focalX: (doc.focalX as number) || 50,
            focalY: (doc.focalY as number) || 50,
          },
          req: { payload },
        })

        if (result?.output?.success) {
          successCount++
          console.log(`   ✅ Success: ${doc.filename}`)
        } else {
          failCount++
          console.log(`   ❌ Failed: ${doc.filename}`, result?.output?.error)
        }
      } catch (err: any) {
        failCount++
        console.error(`   ❌ Critical Error processing ${doc.filename}:`, err.message)
      }
    }

    console.log(`\n🎉 Finished! Successfully regenerated ${successCount} items. Failed: ${failCount}`)
    process.exit(0)
  } catch (e: any) {
    console.error('CRITICAL FAILED:', e.message)
    process.exit(1)
  }
}

run()
