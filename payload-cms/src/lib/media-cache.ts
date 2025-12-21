/**
 * Global cache for individual media items
 * Prevents duplicate API requests when fetching selected media
 */

interface MediaItem {
  id: number
  filename: string
  url: string
  thumbnailURL?: string
  alt?: string
  width?: number
  height?: number
  mimeType?: string
  filesize?: number
  createdAt?: string
  primaryCategory?: {
    id: number
    name: string
    displayName?: string
  }
  tags?: Array<{
    id: number
    name: string
  }>
}

interface CacheEntry {
  data: MediaItem
  timestamp: number
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const cache = new Map<number, CacheEntry>()

// Track ongoing requests to prevent duplicate fetches
const ongoingRequests = new Map<number, Promise<MediaItem | null>>()

/**
 * Check if cache is still valid
 */
function isCacheValid(entry?: CacheEntry): boolean {
  if (!entry) return false
  return Date.now() - entry.timestamp < CACHE_DURATION
}

/**
 * Get the best available thumbnail URL
 * Priority: sizes.thumbnail.url > sizes.card.url > original url
 *
 * Note: Old Keystone data has thumbnailURL pointing to /variants/thumbnail/ path
 * which may not exist for some images. We prefer Payload's sizes structure.
 */
function getThumbnailUrl(data: any): string {
  // Try Payload's sizes structure first (more reliable)
  if (data.sizes?.thumbnail?.url) {
    return data.sizes.thumbnail.url
  }
  if (data.sizes?.card?.url) {
    return data.sizes.card.url
  }
  // Fall back to original URL
  return data.url || ''
}

/**
 * Fetch a single media item with caching
 */
export async function fetchMediaItem(id: number): Promise<MediaItem | null> {
  // Return cached data if valid
  const cached = cache.get(id)
  if (isCacheValid(cached)) {
    return cached!.data
  }

  // Wait for ongoing request if exists
  const ongoing = ongoingRequests.get(id)
  if (ongoing) {
    return ongoing
  }

  // Create new request
  const request = (async () => {
    try {
      const res = await fetch(`/api/media/${id}`)
      if (!res.ok) {
        throw new Error(`Failed to fetch media ${id}: ${res.status}`)
      }

      const data = await res.json()

      // Normalize thumbnailURL to use sizes structure instead of legacy /variants/ path
      const normalizedData: MediaItem = {
        ...data,
        thumbnailURL: getThumbnailUrl(data),
      }

      // Update cache
      cache.set(id, {
        data: normalizedData,
        timestamp: Date.now(),
      })

      return normalizedData
    } catch (error) {
      console.error(`Failed to fetch media item ${id}:`, error)
      return null
    } finally {
      // Clear ongoing request
      ongoingRequests.delete(id)
    }
  })()

  ongoingRequests.set(id, request)
  return request
}

/**
 * Fetch multiple media items with caching
 */
export async function fetchMediaItems(ids: number[]): Promise<MediaItem[]> {
  const promises = ids.map((id) => fetchMediaItem(id))
  const results = await Promise.all(promises)
  return results.filter((item): item is MediaItem => item !== null)
}

/**
 * Clear the cache for specific items or all
 */
export function clearMediaCache(ids?: number[]): void {
  if (ids) {
    ids.forEach((id) => cache.delete(id))
  } else {
    cache.clear()
  }
}

/**
 * Prefetch media items (call this early to warm up the cache)
 */
export async function prefetchMediaItems(ids: number[]): Promise<void> {
  await fetchMediaItems(ids)
}
