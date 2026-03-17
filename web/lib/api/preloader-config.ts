/**
 * Preloader Config API
 *
 * Fetches preloader/loading animation configuration from Payload CMS
 * Used by Preloader.tsx and image-wall.tsx components
 */

import { convertToCDNUrl } from '@/lib/cdn-url'

// Use runtime environment variable for server-side API calls
// Prefer internal URL (from CMS_GRAPHQL_URL) over external CMS_URL for better performance
const CMS_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002')

/**
 * Image configuration for the image wall
 */
export interface ImageWallItem {
  src: string
  position: { top: string; left: string }
  aspectRatio: string
  widthScale: number
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
  images: ImageWallItem[]

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
    { src: '/blog-post-1.jpg', position: { top: '50%', left: '50%' }, aspectRatio: '9 / 16', widthScale: 1.0 },
    { src: '/blog-post-2.jpg', position: { top: '50%', left: '35%' }, aspectRatio: '9 / 6', widthScale: 1.0 },
    { src: '/blog-post-3.jpg', position: { top: '50%', left: '65%' }, aspectRatio: '9 / 12', widthScale: 0.8 },
    { src: '/blog-post-4.jpg', position: { top: '75%', left: '50%' }, aspectRatio: '9 / 6', widthScale: 1.0 },
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
 * Fetch preloader configuration from Payload CMS
 *
 * @returns PreloaderConfigData
 *
 * @example
 * ```typescript
 * const config = await getPreloaderConfig()
 * ```
 */
export async function getPreloaderConfig(): Promise<PreloaderConfigData> {
  try {
    const response = await fetch(`${CMS_URL}/api/globals/preloader-config?depth=2`, {
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

    // Transform CMS data to PreloaderConfigData
    const images: ImageWallItem[] = (data.images || []).map((item: any) => {
      // Get the image URL from the media object
      // Prefer smaller variants for ImageWall (displayed at ~256-512px width)
      // Priority: card (768px) > tablet (1024px) > thumbnail (400px) > original (last resort)
      const imageUrl = item.image?.sizes?.card?.url
        || item.image?.sizes?.tablet?.url
        || item.image?.sizes?.thumbnail?.url
        || item.image?.url  // Last resort fallback
      const cdnUrl = getMediaUrl(imageUrl)

      return {
        src: cdnUrl || '/images/placeholder.jpg',
        position: {
          top: `${item.positionTop || 50}%`,
          left: `${item.positionLeft || 50}%`,
        },
        aspectRatio: item.aspectRatio || '9 / 6',
        widthScale: item.widthScale || 1.0,
      }
    })

    return {
      enabled: data.enabled ?? true,
      backgroundColor: data.backgroundColor || defaultPreloaderConfig.backgroundColor,
      textColor: data.textColor || defaultPreloaderConfig.textColor,
      highlightColor: data.highlightColor || defaultPreloaderConfig.highlightColor,
      imageWallEnabled: data.imageWallEnabled ?? true,
      images: images.length > 0 ? images : defaultPreloaderConfig.images,
      loadingDuration: data.loadingDuration || defaultPreloaderConfig.loadingDuration,
      logoAnimationDuration: data.logoAnimationDuration || defaultPreloaderConfig.logoAnimationDuration,
      imageWallDuration: data.imageWallDuration || defaultPreloaderConfig.imageWallDuration,
      imageWallStagger: data.imageWallStagger || defaultPreloaderConfig.imageWallStagger,
    }
  } catch (error) {
    console.error('Error fetching preloader config:', error)
    return defaultPreloaderConfig
  }
}
