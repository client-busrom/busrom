/**
 * Delete orphan files from S3 manually
 *
 * This script deletes the 7 orphan files that were uploaded before
 * the TempFileUpload tracking system was implemented.
 */

import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'

// Initialize S3 Client
function getS3Client(): S3Client {
  return new S3Client({
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    ...(process.env.USE_MINIO === 'true' && {
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      forcePathStyle: true,
    }),
  })
}

async function deleteOrphanFiles() {
  const s3Client = getS3Client()
  const bucketName = process.env.S3_BUCKET_NAME || 'busrom-media'
  const prefix = 'form-attachments/'

  console.log('🔍 Listing files in form-attachments/...')

  try {
    // List all files in form-attachments/
    const listResponse = await s3Client.send(new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    }))

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      console.log('✅ No files found in form-attachments/')
      return
    }

    console.log(`📋 Found ${listResponse.Contents.length} files`)
    console.log('')

    // Delete each file
    let deletedCount = 0
    let totalSize = 0

    for (const object of listResponse.Contents) {
      if (!object.Key) continue

      console.log(`🗑️  Deleting: ${object.Key} (${(object.Size || 0) / 1024} KB)`)

      try {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: bucketName,
          Key: object.Key,
        }))

        deletedCount++
        totalSize += object.Size || 0
        console.log(`   ✅ Deleted`)
      } catch (error) {
        console.error(`   ❌ Failed to delete: ${error}`)
      }
    }

    console.log('')
    console.log('========================================')
    console.log(`✅ Cleanup completed!`)
    console.log(`   Deleted: ${deletedCount} files`)
    console.log(`   Freed: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
    console.log('========================================')

  } catch (error) {
    console.error('❌ Failed to list or delete files:', error)
    process.exit(1)
  }
}

// Run the script
deleteOrphanFiles()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
