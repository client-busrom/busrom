/**
 * Activity Log Auto-Cleanup Utility
 *
 * Automatically maintains the ActivityLog table by:
 * - Keeping only the most recent N records
 * - Deleting older records to prevent database bloat
 * - Running periodically in the background
 */

import { PrismaClient } from '.prisma/client'

const RETENTION_COUNT = 200 // Keep the most recent 200 records
const CLEANUP_INTERVAL = 60 * 60 * 1000 // Run every 1 hour

let cleanupTimer: NodeJS.Timeout | null = null

/**
 * Clean up old activity logs, keeping only the most recent records
 */
export async function cleanupActivityLogs(prisma: PrismaClient): Promise<void> {
  try {
    // Count total activity logs
    const totalCount = await prisma.activityLog.count()

    // Only cleanup if we exceed the retention count
    if (totalCount <= RETENTION_COUNT) {
      console.log(
        `📊 ActivityLog: ${totalCount} records (no cleanup needed, threshold: ${RETENTION_COUNT})`
      )
      return
    }

    // Calculate how many records to delete
    const deleteCount = totalCount - RETENTION_COUNT

    // Get the timestamp of the Nth most recent record
    // We'll delete everything older than this
    const keepRecords = await prisma.activityLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: RETENTION_COUNT,
      select: { timestamp: true },
    })

    if (keepRecords.length === 0) {
      console.log('⚠️ ActivityLog: No records found to keep')
      return
    }

    // Get the oldest timestamp we want to keep
    const oldestToKeep = keepRecords[keepRecords.length - 1].timestamp

    // Delete all records older than this timestamp
    const result = await prisma.activityLog.deleteMany({
      where: {
        timestamp: {
          lt: oldestToKeep,
        },
      },
    })

    console.log(
      `🧹 ActivityLog cleanup: Deleted ${result.count} old records (kept ${RETENTION_COUNT} most recent, total was ${totalCount})`
    )
  } catch (error) {
    console.error('❌ ActivityLog cleanup failed:', error)
  }
}

/**
 * Start automatic cleanup timer
 */
export function startActivityLogCleanup(prisma: PrismaClient): void {
  // Run cleanup immediately on startup
  console.log(
    `🚀 Starting ActivityLog auto-cleanup (retention: ${RETENTION_COUNT} records, interval: ${CLEANUP_INTERVAL / 60000} minutes)`
  )
  cleanupActivityLogs(prisma).catch(console.error)

  // Schedule periodic cleanup
  cleanupTimer = setInterval(() => {
    cleanupActivityLogs(prisma).catch(console.error)
  }, CLEANUP_INTERVAL)

  console.log('✅ ActivityLog auto-cleanup scheduled')
}

/**
 * Stop automatic cleanup timer
 */
export function stopActivityLogCleanup(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer)
    cleanupTimer = null
    console.log('⏹️ ActivityLog auto-cleanup stopped')
  }
}
