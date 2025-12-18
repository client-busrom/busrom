/**
 * Global cache for media filters (categories and tags)
 * Prevents duplicate API requests when multiple MediaPicker instances are mounted
 */

interface MediaCategory {
  id: number
  name: string
  displayName?: string
}

interface MediaTag {
  id: number
  name: string
  type?: string
}

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const cache: {
  categories?: CacheEntry<MediaCategory[]>
  tags?: CacheEntry<MediaTag[]>
} = {}

// Track ongoing requests to prevent duplicate fetches
const ongoingRequests: {
  categories?: Promise<MediaCategory[]>
  tags?: Promise<MediaTag[]>
} = {}

/**
 * Check if cache is still valid
 */
function isCacheValid<T>(entry?: CacheEntry<T>): boolean {
  if (!entry) return false
  return Date.now() - entry.timestamp < CACHE_DURATION
}

/**
 * Fetch categories with caching
 */
export async function fetchMediaCategories(): Promise<MediaCategory[]> {
  // Return cached data if valid
  if (isCacheValid(cache.categories)) {
    return cache.categories!.data
  }

  // Wait for ongoing request if exists
  if (ongoingRequests.categories) {
    return ongoingRequests.categories
  }

  // Create new request
  const request = (async () => {
    try {
      const res = await fetch('/api/media-categories?limit=100&sort=order')
      const data = await res.json()
      const categories = data.docs || []

      // Update cache
      cache.categories = {
        data: categories,
        timestamp: Date.now(),
      }

      return categories
    } catch (error) {
      console.error('Failed to fetch media categories:', error)
      return []
    } finally {
      // Clear ongoing request
      delete ongoingRequests.categories
    }
  })()

  ongoingRequests.categories = request
  return request
}

/**
 * Fetch tags with caching
 */
export async function fetchMediaTags(): Promise<MediaTag[]> {
  // Return cached data if valid
  if (isCacheValid(cache.tags)) {
    return cache.tags!.data
  }

  // Wait for ongoing request if exists
  if (ongoingRequests.tags) {
    return ongoingRequests.tags
  }

  // Create new request
  const request = (async () => {
    try {
      const res = await fetch('/api/media-tags?limit=100&sort=name')
      const data = await res.json()
      const tags = data.docs || []

      // Update cache
      cache.tags = {
        data: tags,
        timestamp: Date.now(),
      }

      return tags
    } catch (error) {
      console.error('Failed to fetch media tags:', error)
      return []
    } finally {
      // Clear ongoing request
      delete ongoingRequests.tags
    }
  })()

  ongoingRequests.tags = request
  return request
}

/**
 * Clear the cache (useful for testing or when data changes)
 */
export function clearMediaFiltersCache(): void {
  delete cache.categories
  delete cache.tags
}

/**
 * Prefetch filters (call this early to warm up the cache)
 */
export async function prefetchMediaFilters(): Promise<void> {
  await Promise.all([fetchMediaCategories(), fetchMediaTags()])
}
