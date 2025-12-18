# Media Caching Optimization

## Overview

Implemented global caching system for media-related API requests to eliminate redundant network calls when multiple MediaPicker components are mounted simultaneously.

## Problem

When opening Product Series Carousel with 9 items (each having 2 MediaPicker instances for image + sceneImage):

**Before optimization:**
- 18 requests to `/api/media-categories`
- 18 requests to `/api/media-tags`
- Multiple duplicate requests to `/api/media/:id` for the same media items
- **Total:** 36+ redundant requests on every page load

**Impact:**
- Slow page load times
- Excessive server load
- Poor user experience
- Wasted bandwidth

## Solution

### 1. Media Filters Cache (`/src/lib/media-filters-cache.ts`)

Global cache for categories and tags that:
- **Caches data** for 5 minutes (configurable)
- **Deduplicates requests** - if a request is already in flight, subsequent calls wait for it
- **Automatic cleanup** after requests complete
- **Prefetch support** for warming up the cache

**API:**
```typescript
export async function fetchMediaCategories(): Promise<MediaCategory[]>
export async function fetchMediaTags(): Promise<MediaTag[]>
export function clearMediaFiltersCache(): void
export async function prefetchMediaFilters(): Promise<void>
```

**Impact:**
- ✅ **18 → 1 request** for categories (94% reduction)
- ✅ **18 → 1 request** for tags (94% reduction)

### 2. Media Items Cache (`/src/lib/media-cache.ts`)

Global cache for individual media items that:
- **Caches each media item** by ID for 5 minutes
- **Deduplicates requests** for the same media ID
- **Batch fetching** support with `fetchMediaItems()`
- **Selective cache clearing** by ID or全部清空

**API:**
```typescript
export async function fetchMediaItem(id: number): Promise<MediaItem | null>
export async function fetchMediaItems(ids: number[]): Promise<MediaItem[]>
export function clearMediaCache(ids?: number[]): void
export async function prefetchMediaItems(ids: number[]): Promise<void>
```

**Impact:**
- ✅ Eliminates duplicate requests for the same media item
- ✅ Faster load times for selected media
- ✅ Reduced server load

### 3. MediaPicker Integration

Updated MediaPicker component to use the caching system:

**Before:**
```typescript
// Each instance makes its own requests
const [catRes, tagRes] = await Promise.all([
  fetch('/api/media-categories?limit=100&sort=order'),
  fetch('/api/media-tags?limit=100&sort=name'),
])

const promises = ids.map(id =>
  fetch(`/api/media/${id}`).then(res => res.json())
)
```

**After:**
```typescript
// All instances share the same cache
const [categories, tags] = await Promise.all([
  fetchMediaCategories(),  // Cached
  fetchMediaTags(),        // Cached
])

const items = await fetchMediaItems(ids)  // Cached & deduplicated
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Multiple MediaPicker Instances            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ Picker1 │ │ Picker2 │ │ Picker3 │ │ ...     │          │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘          │
│       │           │           │           │                 │
│       └───────────┴───────────┴───────────┘                 │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │   Global Cache Layer              │
        │   ┌─────────────────────────┐    │
        │   │ Media Filters Cache     │    │
        │   │ - Categories (5 min)    │    │
        │   │ - Tags (5 min)          │    │
        │   │ - Request deduplication │    │
        │   └─────────────────────────┘    │
        │   ┌─────────────────────────┐    │
        │   │ Media Items Cache       │    │
        │   │ - By ID (5 min)         │    │
        │   │ - Request deduplication │    │
        │   └─────────────────────────┘    │
        └───────────────┬───────────────────┘
                        │ (Only on cache miss)
                        ▼
                ┌───────────────┐
                │  API Requests │
                │  - /api/media-categories  │
                │  - /api/media-tags        │
                │  - /api/media/:id         │
                └───────────────┘
```

## Cache Behavior

### Cache Hit (Fast Path)
1. Component calls `fetchMediaCategories()`
2. Cache checks timestamp
3. Returns cached data immediately
4. **No network request**

### Cache Miss (Cold Start)
1. Component calls `fetchMediaCategories()`
2. Cache checks - no valid data
3. Makes API request
4. Stores result with timestamp
5. Returns data

### Concurrent Requests (Request Deduplication)
1. Component A calls `fetchMediaCategories()`
2. Component B calls `fetchMediaCategories()` (before A completes)
3. Component C calls `fetchMediaCategories()` (before A completes)
4. **Only 1 API request** is made
5. All components wait for the same Promise
6. All components receive the same result

## Performance Metrics

### Network Requests (Product Series Carousel with 9 items)

| Request Type | Before | After | Reduction |
|--------------|--------|-------|-----------|
| `/api/media-categories` | 18 | 1 | 94% |
| `/api/media-tags` | 18 | 1 | 94% |
| `/api/media/:id` (duplicates) | Variable | 0 | 100% |
| **Total** | 36+ | 2 | 94%+ |

### Page Load Time (estimated)

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial load | ~3-5s | ~0.5-1s | 70-80% faster |
| Cache hit load | ~3-5s | ~50ms | 98% faster |

## Configuration

### Cache Duration

Adjust cache TTL in the cache files:

```typescript
// In media-filters-cache.ts or media-cache.ts
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes (default)

// For longer cache:
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

// For shorter cache:
const CACHE_DURATION = 60 * 1000 // 1 minute
```

### Cache Invalidation

Clear cache when data changes:

```typescript
import { clearMediaFiltersCache } from '@/lib/media-filters-cache'
import { clearMediaCache } from '@/lib/media-cache'

// After creating/updating/deleting categories or tags
clearMediaFiltersCache()

// After creating/updating/deleting media items
clearMediaCache() // Clear all
clearMediaCache([123, 456]) // Clear specific IDs
```

### Prefetching

Warm up cache on app initialization:

```typescript
import { prefetchMediaFilters } from '@/lib/media-filters-cache'

// In app initialization or layout component
useEffect(() => {
  prefetchMediaFilters() // Loads categories + tags in background
}, [])
```

## Future Improvements

1. **Cache Statistics**
   - Track hit/miss ratios
   - Monitor cache effectiveness
   - Adjust TTL based on usage patterns

2. **Smart Invalidation**
   - Use WebSocket/SSE to invalidate cache when data changes server-side
   - Implement cache versioning

3. **Persistent Cache**
   - Use IndexedDB for longer-term caching
   - Survive page reloads

4. **React Query Integration**
   - Consider migrating to React Query for more sophisticated caching
   - Better built-in support for mutations and invalidation

## Testing Checklist

- [x] Single MediaPicker instance loads filters once
- [x] Multiple MediaPicker instances share cache
- [x] Concurrent requests are deduplicated
- [x] Cache expires after TTL
- [x] Cache can be manually cleared
- [x] Selected media items are cached
- [x] Same media ID requested multiple times uses cache

## Files Created/Modified

**New Files:**
- `/src/lib/media-filters-cache.ts` - Categories & tags cache
- `/src/lib/media-cache.ts` - Media items cache
- `/docs/MEDIA_CACHING_OPTIMIZATION.md` - This document

**Modified Files:**
- `/src/components/fields/MediaPicker/index.tsx` - Use caching system

## Related Documentation

- [FIX_PRODUCT_SERIES_CAROUSEL_INFINITE_REQUESTS.md](./FIX_PRODUCT_SERIES_CAROUSEL_INFINITE_REQUESTS.md) - Original issue and fix

---

**Implemented:** 2025-12-16
**Status:** ✅ Complete and tested
**Impact:** 94%+ reduction in redundant API requests
