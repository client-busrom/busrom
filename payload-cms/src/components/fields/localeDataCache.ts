/**
 * Shared locale data cache for multilingual field components
 *
 * This module provides a shared cache that prevents multiple field components
 * from making redundant API calls to fetch the same locale data.
 *
 * Instead of each field fetching all 24 locales independently (resulting in
 * 24 × number_of_fields requests), all fields share a single fetch operation.
 */

import { SUPPORTED_LOCALES, type LocaleCode } from '../../lib/locales'

interface CacheEntry {
  data: Record<string, Record<string, unknown>>
  timestamp: number
  promise?: Promise<Record<string, Record<string, unknown>>>
}

// Cache keyed by document identifier (collection/id or global/slug)
const cache = new Map<string, CacheEntry>()

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000

/**
 * Generate cache key for a document
 */
function getCacheKey(collectionSlug: string | undefined, globalSlug: string | undefined, id: string | number | undefined): string {
  if (collectionSlug && id) {
    return `collection:${collectionSlug}:${id}`
  }
  if (globalSlug) {
    return `global:${globalSlug}`
  }
  return ''
}

/**
 * Check if cache entry is valid
 */
function isCacheValid(entry: CacheEntry | undefined): boolean {
  if (!entry) return false
  return Date.now() - entry.timestamp < CACHE_TTL
}

/**
 * Fetch all locale data for a document
 * Uses deduplication - if a fetch is in progress, returns the same promise
 */
export async function fetchAllLocaleData(
  collectionSlug: string | undefined,
  globalSlug: string | undefined,
  id: string | number | undefined
): Promise<Record<string, Record<string, unknown>>> {
  const cacheKey = getCacheKey(collectionSlug, globalSlug, id)

  if (!cacheKey || !id) {
    // New document - return empty data
    return {}
  }

  // Check cache
  const cached = cache.get(cacheKey)
  if (cached && isCacheValid(cached)) {
    // If there's an ongoing fetch, wait for it
    if (cached.promise) {
      return cached.promise
    }
    return cached.data
  }

  // Create fetch promise
  const endpoint = collectionSlug
    ? `/api/${collectionSlug}/${id}`
    : `/api/globals/${globalSlug}`

  const fetchPromise = (async () => {
    try {
      // 使用 locale=all 一次性获取所有语言数据（只需 1 个请求！）
      const url = `${endpoint}?locale=all&depth=0`
      const res = await fetch(url)

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`)
      }

      const data = await res.json()

      // locale=all 返回格式: { name: { en: "Name", zh: "名称" }, sku: "SKU-001" }
      // 需要转换为: { en: { name: "Name", sku: "SKU-001" }, zh: { name: "名称", sku: "SKU-001" } }
      const localeData: Record<string, Record<string, unknown>> = {}

      // 初始化所有语言
      SUPPORTED_LOCALES.forEach(locale => {
        localeData[locale.code] = {}
      })

      // 转换数据结构
      for (const [fieldName, fieldValue] of Object.entries(data)) {
        if (fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
          // 检查是否是本地化字段（包含语言代码作为 key）
          const hasLocaleKeys = SUPPORTED_LOCALES.some(l => l.code in (fieldValue as Record<string, unknown>))

          if (hasLocaleKeys) {
            // 本地化字段 - 分发到各语言
            for (const locale of SUPPORTED_LOCALES) {
              const localeValue = (fieldValue as Record<string, unknown>)[locale.code]
              if (localeValue !== undefined) {
                localeData[locale.code][fieldName] = localeValue
              }
            }
          } else {
            // 非本地化对象字段 - 复制到所有语言
            for (const locale of SUPPORTED_LOCALES) {
              localeData[locale.code][fieldName] = fieldValue
            }
          }
        } else {
          // 非本地化字段（字符串、数字、数组等）- 复制到所有语言
          for (const locale of SUPPORTED_LOCALES) {
            localeData[locale.code][fieldName] = fieldValue
          }
        }
      }

      // 更新缓存
      cache.set(cacheKey, {
        data: localeData,
        timestamp: Date.now(),
      })

      return localeData
    } catch (error) {
      console.error('Failed to fetch locale data:', error)
      return {}
    }
  })()

  // Store promise in cache to deduplicate concurrent requests
  cache.set(cacheKey, {
    data: {},
    timestamp: Date.now(),
    promise: fetchPromise,
  })

  return fetchPromise
}

/**
 * Get field value from cached locale data
 */
export function getFieldFromCache(
  collectionSlug: string | undefined,
  globalSlug: string | undefined,
  id: string | number | undefined,
  fieldPath: string,
  locale: LocaleCode
): unknown {
  const cacheKey = getCacheKey(collectionSlug, globalSlug, id)
  const cached = cache.get(cacheKey)

  if (!cached || !cached.data[locale]) {
    return undefined
  }

  // Handle nested paths
  return fieldPath.split('.').reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, cached.data[locale])
}

/**
 * Invalidate cache for a document
 */
export function invalidateCache(
  collectionSlug: string | undefined,
  globalSlug: string | undefined,
  id: string | number | undefined
): void {
  const cacheKey = getCacheKey(collectionSlug, globalSlug, id)
  if (cacheKey) {
    cache.delete(cacheKey)
  }
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  cache.clear()
}
