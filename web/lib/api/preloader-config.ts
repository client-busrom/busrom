import { cmsFetch, CMS_URL } from "./client";
import { convertToCDNUrl } from '@/lib/cdn-url'

/**
 * Image configuration for the image wall
 */
export interface ImageWallItem {
  src: string
}

/**
 * Preloader configuration data
 */
export interface PreloaderConfigData {
  // Animation settings
  enabled: boolean
  backgroundColor: string
  textColor: string
  highlightColor: string

  // Image wall settings
  imageWallEnabled: boolean
  images: (ImageWallItem | null)[]

  // Animation timing (in seconds)
  loadingDuration: number
  logoAnimationDuration: number
  imageWallDuration: number
  imageWallStagger: number
}

/**
 * Default preloader configuration (fallback when CMS is unavailable)
 * 导出供 layout.tsx 直接使用，避免服务端阻塞
 */
export const defaultPreloaderConfig: PreloaderConfigData = {
  enabled: true,
  backgroundColor: '#EBE6D8',
  textColor: '#EBE6D8',
  highlightColor: '#000000',
  imageWallEnabled: true,
  // 使用存在的图片作为默认值
  images: [
    { src: '/blog-post-1.jpg' },
    { src: '/blog-post-2.jpg' },
    { src: '/blog-post-3.jpg' },
    { src: '/blog-post-4.jpg' },
    { src: '/blog-post-5.jpg' },
    { src: '/blog-post-6.jpg' },
    { src: '/blog-post-7.jpg' },
  ],
  loadingDuration: 2.5,
  logoAnimationDuration: 2,
  imageWallDuration: 0.8,
  imageWallStagger: 0.2,
}

/**
 * Helper function to convert Media URL to CDN URL
 */
function getMediaUrl(fileUrl: string | null | undefined): string | null {
  if (!fileUrl) return null
  return convertToCDNUrl(fileUrl)
}

/**
 * Resolve an image from ImageWallItem data
 * Uses imageResolved (from afterRead hook) if available, otherwise resolves manually
 */
async function resolveImageWallItem(item: any): Promise<ImageWallItem | null> {
  if (!item) return null

  // 1. Prefer pre-resolved image from CMS afterRead hook
  if (item.imageResolved) {
    const resolved = item.imageResolved
    const url = resolved.sizes?.card?.url
      || resolved.sizes?.tablet?.url
      || resolved.sizes?.thumbnail?.url
      || resolved.url
    const cdnUrl = getMediaUrl(url)
    if (cdnUrl) return { src: cdnUrl }
  }

  // 2. Fallback: resolve from image config
  const imageConfig = item.image
  if (!imageConfig) return null

  let backgroundImage: string | null = null

  if (imageConfig.mode === 'manual' && imageConfig.manualImage) {
    // manualImage could be an ID or an object with url
    if (typeof imageConfig.manualImage === 'object' && imageConfig.manualImage?.url) {
      backgroundImage = imageConfig.manualImage.sizes?.card?.url
        || imageConfig.manualImage.sizes?.tablet?.url
        || imageConfig.manualImage.sizes?.thumbnail?.url
        || imageConfig.manualImage.url
    } else {
      // It's an ID, fetch the media
      try {
        const mediaRes = await cmsFetch(`/api/media/${imageConfig.manualImage}?depth=0`, {
          next: { revalidate: 3600 },
        });
        if (mediaRes.ok) {
          const media = await mediaRes.json()
          backgroundImage = media.sizes?.card?.url
            || media.sizes?.tablet?.url
            || media.sizes?.thumbnail?.url
            || media.url
        }
      } catch (e) {
        console.error('[Preloader] Failed to fetch manual image:', e)
      }
    }
  } else if (imageConfig.mode === 'application' && imageConfig.applicationId) {
    try {
      const appRes = await cmsFetch(`/api/applications/${imageConfig.applicationId}?depth=1`, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 3600 },
      });
      if (appRes.ok) {
        const app = await appRes.json()
        const allImages = (app.sceneGallery || []).flatMap((scene: any) => scene.images || [])
        const uniqueImages = Array.from(new Map(allImages.map((img: any) => [img.id, img])).values())
        if (uniqueImages.length > 0) {
          const randomIndex = Math.floor(Math.random() * uniqueImages.length)
          const img = uniqueImages[randomIndex] as any
          backgroundImage = img.sizes?.card?.url
            || img.sizes?.tablet?.url
            || img.sizes?.thumbnail?.url
            || img.url || null
        }
      }
    } catch (e) {
      console.error('[Preloader] Failed to resolve application image:', e)
    }
  }

  const cdnUrl = getMediaUrl(backgroundImage)
  return cdnUrl ? { src: cdnUrl } : null
}

/**
 * Fetch preloader configuration from Payload CMS
 *
 * @returns PreloaderConfigData
 *
 * @example
 * ```typescript
 * const config = await getPreloaderConfig()
 * ```
 */
let preloaderPromiseCache: Promise<PreloaderConfigData> | null = null;
let preloaderCacheTime: number = 0;
const CACHE_TTL = 60 * 1000;

export async function getPreloaderConfig(): Promise<PreloaderConfigData> {
  const now = Date.now();
  if (preloaderPromiseCache && now - preloaderCacheTime < CACHE_TTL) {
    return preloaderPromiseCache;
  }

  const fetchPromise = (async () => {
    try {
      const response = await cmsFetch(`/api/globals/preloader-config?depth=1`, {
        next: { revalidate: 60 }, // Revalidate every 60 seconds
        redirect: 'manual', // Don't follow redirects (302 to /signin means auth required)
      })

      // If redirected (302) or not OK, return default config
      if (!response.ok || response.status === 302) {
        console.warn(`Failed to fetch preloader config: ${response.status} ${response.statusText}`)
        return defaultPreloaderConfig
      }

      // Check content type to ensure we got JSON, not HTML (login page)
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        console.warn(`Preloader config returned non-JSON content type: ${contentType}`)
        return defaultPreloaderConfig
      }

      const text = await response.text()
      if (!text || text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
        console.warn('Preloader config returned HTML instead of JSON')
        return defaultPreloaderConfig
      }

      const data = JSON.parse(text)

      // New structure: imageWallItems is an array of related ImageWallItem documents
      const items = data.imageWallItems || []
      const resolvedImages = await Promise.all(
        items.map((item: any) => resolveImageWallItem(item))
      )

      // Pad to 7 images with nulls if fewer items
      const images: (ImageWallItem | null)[] = [
        ...resolvedImages,
        ...Array(Math.max(0, 7 - resolvedImages.length)).fill(null),
      ].slice(0, 7)

      const hasImages = images.some(img => img !== null)

      return {
        enabled: data.enabled ?? true,
        backgroundColor: data.backgroundColor || defaultPreloaderConfig.backgroundColor,
        textColor: data.textColor || defaultPreloaderConfig.textColor,
        highlightColor: data.highlightColor || defaultPreloaderConfig.highlightColor,
        imageWallEnabled: data.imageWallEnabled ?? true,
        images: hasImages ? images : defaultPreloaderConfig.images,
        loadingDuration: data.loadingDuration || defaultPreloaderConfig.loadingDuration,
        logoAnimationDuration: data.logoAnimationDuration || defaultPreloaderConfig.logoAnimationDuration,
        imageWallDuration: data.imageWallDuration || defaultPreloaderConfig.imageWallDuration,
        imageWallStagger: data.imageWallStagger || defaultPreloaderConfig.imageWallStagger,
      }
    } catch (error) {
      console.error('Error fetching preloader config:', error)
      return defaultPreloaderConfig
    }
  })();

  preloaderPromiseCache = fetchPromise;
  preloaderCacheTime = now;
  return fetchPromise;
}
