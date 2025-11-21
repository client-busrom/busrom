/**
 * Orphan File Cleanup Service
 *
 * Automatically cleans up orphan files (uploaded but never used in form submissions)
 *
 * Features:
 * - Runs every 6 hours
 * - Marks files as ORPHAN if older than 24 hours and status is PENDING
 * - Deletes files marked as ORPHAN for more than 7 days
 * - Deletes from both S3 and database
 */

import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import type { PrismaClient } from '@prisma/client'

// Configurable thresholds
const ORPHAN_THRESHOLD_HOURS = 24 // Mark as orphan after 24 hours
const DELETE_THRESHOLD_DAYS = 7   // Delete after 7 days

/**
 * Initialize S3 Client
 */
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

/**
 * Extract S3 key from file URL
 */
function extractS3Key(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl)
    // For S3: https://bucket.s3.region.amazonaws.com/key
    // For MinIO: http://localhost:9000/bucket/key
    const pathname = url.pathname
    // Remove leading slash and bucket name
    const parts = pathname.split('/').filter(Boolean)
    if (parts.length >= 2) {
      // Remove bucket name, keep the rest as key
      parts.shift()
      return parts.join('/')
    }
    return null
  } catch (error) {
    console.error('Failed to parse file URL:', fileUrl, error)
    return null
  }
}

/**
 * Delete file from S3
 */
async function deleteFromS3(fileUrl: string): Promise<boolean> {
  try {
    const s3Key = extractS3Key(fileUrl)
    if (!s3Key) {
      console.error('❌ Could not extract S3 key from URL:', fileUrl)
      return false
    }

    const s3Client = getS3Client()
    const bucketName = process.env.S3_BUCKET_NAME || 'busrom-media'

    await s3Client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    }))

    console.log(`🗑️ Deleted from S3: ${s3Key}`)
    return true
  } catch (error) {
    console.error('❌ Failed to delete from S3:', fileUrl, error)
    return false
  }
}

/**
 * Mark old PENDING files as ORPHAN
 */
async function markOrphanFiles(prisma: PrismaClient): Promise<number> {
  const threshold = new Date(Date.now() - ORPHAN_THRESHOLD_HOURS * 60 * 60 * 1000)

  try {
    const orphanFiles = await prisma.tempFileUpload.findMany({
      where: {
        status: 'PENDING',
        uploadedAt: {
          lt: threshold,
        },
      },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
      },
    })

    if (orphanFiles.length === 0) {
      return 0
    }

    console.log(`🔍 Found ${orphanFiles.length} orphan files (older than ${ORPHAN_THRESHOLD_HOURS} hours)`)

    // Mark as ORPHAN
    const result = await prisma.tempFileUpload.updateMany({
      where: {
        id: {
          in: orphanFiles.map(f => f.id),
        },
      },
      data: {
        status: 'ORPHAN',
        orphanedAt: new Date(),
      },
    })

    console.log(`✅ Marked ${result.count} files as ORPHAN`)
    return result.count
  } catch (error) {
    console.error('❌ Failed to mark orphan files:', error)
    return 0
  }
}

/**
 * Delete old ORPHAN files (from both S3 and database)
 */
async function deleteOrphanFiles(prisma: PrismaClient): Promise<number> {
  const threshold = new Date(Date.now() - DELETE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000)

  try {
    const filesToDelete = await prisma.tempFileUpload.findMany({
      where: {
        status: 'ORPHAN',
        orphanedAt: {
          lt: threshold,
        },
      },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        fileSize: true,
      },
    })

    if (filesToDelete.length === 0) {
      return 0
    }

    console.log(`🗑️ Deleting ${filesToDelete.length} orphan files (older than ${DELETE_THRESHOLD_DAYS} days)`)

    let deletedCount = 0
    let totalSize = 0

    for (const file of filesToDelete) {
      // Delete from S3
      const s3Deleted = await deleteFromS3(file.fileUrl)

      if (s3Deleted) {
        // Delete from database
        await prisma.tempFileUpload.delete({
          where: { id: file.id },
        })

        deletedCount++
        totalSize += file.fileSize || 0
        console.log(`✅ Deleted: ${file.fileName} (${(file.fileSize || 0) / 1024} KB)`)
      } else {
        console.warn(`⚠️ Skipped database deletion for: ${file.fileName} (S3 delete failed)`)
      }
    }

    console.log(`✅ Cleaned up ${deletedCount} orphan files, freed ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
    return deletedCount
  } catch (error) {
    console.error('❌ Failed to delete orphan files:', error)
    return 0
  }
}

/**
 * Cleanup old USED file records (keep for 30 days for audit)
 */
async function cleanupOldUsedFiles(prisma: PrismaClient): Promise<number> {
  const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days

  try {
    const result = await prisma.tempFileUpload.deleteMany({
      where: {
        status: 'USED',
        usedAt: {
          lt: threshold,
        },
      },
    })

    if (result.count > 0) {
      console.log(`🧹 Cleaned up ${result.count} old USED file records (older than 30 days)`)
    }

    return result.count
  } catch (error) {
    console.error('❌ Failed to cleanup old USED files:', error)
    return 0
  }
}

/**
 * Run cleanup task
 */
export async function runOrphanFileCleanup(prisma: PrismaClient): Promise<void> {
  console.log('\n🧹 ========== Orphan File Cleanup Starting ==========')
  console.log(`⏰ Time: ${new Date().toISOString()}`)

  try {
    // Step 1: Mark old PENDING files as ORPHAN
    const markedCount = await markOrphanFiles(prisma)

    // Step 2: Delete old ORPHAN files
    const deletedCount = await deleteOrphanFiles(prisma)

    // Step 3: Cleanup old USED file records
    const cleanedCount = await cleanupOldUsedFiles(prisma)

    // Statistics
    const stats = await prisma.tempFileUpload.groupBy({
      by: ['status'],
      _count: true,
    })

    console.log('\n📊 Current Statistics:')
    stats.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count} files`)
    })

    console.log('\n✅ Orphan File Cleanup Completed')
    console.log(`   Marked as ORPHAN: ${markedCount}`)
    console.log(`   Deleted: ${deletedCount}`)
    console.log(`   Cleaned USED records: ${cleanedCount}`)
  } catch (error) {
    console.error('❌ Orphan File Cleanup Failed:', error)
  }

  console.log('========== Orphan File Cleanup Finished ==========\n')
}

/**
 * Start automatic cleanup (runs every 6 hours)
 */
export function startOrphanFileCleanup(prisma: PrismaClient): void {
  console.log('🔄 Starting automatic orphan file cleanup service...')
  console.log(`   Will run every 6 hours`)
  console.log(`   Orphan threshold: ${ORPHAN_THRESHOLD_HOURS} hours`)
  console.log(`   Delete threshold: ${DELETE_THRESHOLD_DAYS} days`)

  // Run immediately on startup
  runOrphanFileCleanup(prisma)

  // Schedule to run every 6 hours
  const intervalMs = 6 * 60 * 60 * 1000 // 6 hours
  setInterval(() => {
    runOrphanFileCleanup(prisma)
  }, intervalMs)

  console.log('✅ Orphan file cleanup service started')
}
