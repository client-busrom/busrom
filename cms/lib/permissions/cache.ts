/**
 * Permission Caching Layer
 *
 * This module provides a caching mechanism for user permissions
 * to reduce database queries and improve performance.
 *
 * Cache Strategy:
 * - TTL: 15 minutes
 * - Invalidation: On role/user permission changes
 * - Key format: `user_permissions:{userId}`
 */

import type { Context } from '.keystone/types'

// Simple in-memory cache
// For production, consider using Redis or another distributed cache
interface CacheEntry {
  permissions: string[]
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()

// Cache TTL in milliseconds (15 minutes)
const CACHE_TTL = 15 * 60 * 1000

/**
 * Get user permissions with caching
 *
 * @param userId - The ID of the user
 * @param context - Keystone context
 * @returns Array of permission identifiers
 */
export async function getCachedUserPermissions(
  userId: string,
  context: Context
): Promise<string[]> {
  const cacheKey = `user_permissions:${userId}`
  const now = Date.now()

  // Check cache
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > now) {
    return cached.permissions
  }

  // Cache miss or expired - recalculate
  // Import here to avoid circular dependency
  const { calculateUserPermissions } = await import('./calculate-permissions')
  const permissions = await calculateUserPermissions(userId, context)

  // Store in cache
  cache.set(cacheKey, {
    permissions,
    expiresAt: now + CACHE_TTL,
  })

  return permissions
}

/**
 * Clear permission cache for a specific user
 *
 * Call this when a user's roles or permissions are modified
 *
 * @param userId - The ID of the user
 */
export function clearUserPermissionsCache(userId: string): void {
  const cacheKey = `user_permissions:${userId}`
  cache.delete(cacheKey)
}

/**
 * Clear permission cache for all users with a specific role
 *
 * Call this when a role's permissions are modified
 *
 * @param roleId - The ID of the role
 * @param context - Keystone context
 */
export async function clearRolePermissionsCache(
  roleId: string,
  context: Context
): Promise<void> {
  try {
    // Find all users with this role
    const users = await context.sudo().query.User.findMany({
      where: {
        roles: {
          some: {
            id: { equals: roleId },
          },
        },
      },
      query: 'id',
    })

    // Clear cache for each user
    for (const user of users) {
      clearUserPermissionsCache(user.id)
    }

    console.log(`Cleared permission cache for ${users.length} users with role ${roleId}`)
  } catch (error) {
    console.error(`Failed to clear role permissions cache:`, error)
  }
}

/**
 * Clear all permission cache entries
 *
 * Use this for debugging or when performing bulk permission updates
 */
export function clearAllPermissionsCache(): void {
  cache.clear()
  console.log('Cleared all permission caches')
}

/**
 * Get cache statistics
 *
 * Useful for monitoring and debugging
 */
export function getCacheStats() {
  const now = Date.now()
  let validEntries = 0
  let expiredEntries = 0

  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt > now) {
      validEntries++
    } else {
      expiredEntries++
    }
  }

  return {
    totalEntries: cache.size,
    validEntries,
    expiredEntries,
    ttlMs: CACHE_TTL,
  }
}

/**
 * Clean up expired cache entries
 *
 * This function can be called periodically to free memory
 */
export function cleanupExpiredCache(): void {
  const now = Date.now()
  let cleanedCount = 0

  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt <= now) {
      cache.delete(key)
      cleanedCount++
    }
  }

  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} expired permission cache entries`)
  }
}

// Auto-cleanup expired entries every 5 minutes
setInterval(cleanupExpiredCache, 5 * 60 * 1000)
