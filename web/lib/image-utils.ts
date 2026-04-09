/**
 * Image Optimization Utilities
 *
 * This module provides utilities for working with Payload CMS Media images,
 * including image variants selection and alt text localization.
 *
 * @module lib/image-utils
 */

/**
 * Image Variants type definition
 *
 * Payload CMS generates these variants via the home API endpoint:
 * - Payload sizes: thumbnail (400x300), card (768x512), tablet (1024w), desktop (1920w)
 * - API transforms to: thumbnail, small, medium, large, xlarge
 */
export interface ImageVariants {
  thumbnail?: string   // 400x300 - Thumbnails, admin UI (from Payload thumbnail)
  small?: string       // 768x512 - Mobile lists, card covers (from Payload card)
  medium?: string      // 1024px width - Tablet, desktop lists (from Payload tablet)
  large?: string       // 1920px width - Desktop detail pages (from Payload desktop)
  xlarge?: string      // Original - Full-screen backgrounds, hero banners
  webp?: string        // WebP format (not currently generated)
}

/**
 * Media Image type definition
 *
 * Represents a media object from Payload CMS
 */
export interface MediaImage {
  id: string
  filename: string
  file?: {
    url: string
    width?: number
    height?: number
  } | null
  /** Direct file URL (used by batch uploads via presigned URL) */
  fileUrl?: string | null
  variants?: ImageVariants
  altText?: Record<string, string> | null  // Multilingual alt text
  /** Focal point for image cropping ({ x: 0-100, y: 0-100 }) */
  cropFocalPoint?: { x: number; y: number } | null
}

/**
 * CDN Domain configuration
 *
 * - Local (MinIO via Nginx): http://localhost:8080/busrom-media/...
 * - Production (CloudFront): https://xxx.cloudfront.net/...
 */
import { convertToCDNUrl } from './cdn-url'

/**
 * Normalize image URL to use CDN domain
 * 
 * NOTE: This now delegates to convertToCDNUrl which handles the 
 * dynamic strategy switching (China vs Global).
 */
function normalizeToCDN(url: string | unknown, strategy?: string): string {
  // Ensure url is a valid string
  if (!url) return ''
  
  let stringUrl = ''
  if (typeof url !== 'string') {
    if (typeof url === 'object' && url !== null && 'url' in url) {
      const extractedUrl = (url as { url: unknown }).url
      if (typeof extractedUrl === 'string') {
        stringUrl = extractedUrl
      }
    }
  } else {
    stringUrl = url
  }

  if (!stringUrl) {
    if (url) console.warn('[normalizeToCDN] Could not extract string url from:', typeof url, url)
    return ''
  }

  return convertToCDNUrl(stringUrl, strategy)
}

/**
 * Get optimized image URL
 *
 * Returns the best image URL based on requested size and format preference.
 * Falls back to smaller/larger sizes if the requested size is not available.
 *
 * @param image - Media object from Payload CMS
 * @param size - Desired image size (default: 'medium')
 * @param preferWebP - Whether to prefer WebP format (default: true)
 * @param strategy - Optional forced strategy ('china' | 'global')
 * @returns Optimized image URL or placeholder
 */
export function getOptimizedImageUrl(
  image: MediaImage | null | undefined,
  size: 'thumbnail' | 'small' | 'medium' | 'large' | 'xlarge' = 'medium',
  preferWebP: boolean = true,
  strategy?: string
): string {
  // If no image, return placeholder
  if (!image) {
    return '/images/placeholder.jpg'
  }

  // Get the original URL (support both file.url and fileUrl)
  const originalUrl = image.file?.url || image.fileUrl
  if (!originalUrl) {
    return '/images/placeholder.jpg'
  }

  const { variants } = image

  // 1. Try WebP format first (if enabled and available)
  if (preferWebP && variants?.webp) {
    return normalizeToCDN(variants.webp, strategy)
  }

  // 2. If xlarge requested, return original image directly
  if (size === 'xlarge') {
    return normalizeToCDN(originalUrl, strategy)
  }

  // 3. Try requested size variant
  if (variants && variants[size]) {
    return normalizeToCDN(variants[size]!, strategy)
  }

  // 4. Fallback strategy: try other sizes from large to small (skip xlarge/original)
  const fallbackOrder: Array<keyof ImageVariants> = [
    'large', 'medium', 'small', 'thumbnail'
  ]

  for (const fallbackSize of fallbackOrder) {
    if (variants && variants[fallbackSize]) {
      return normalizeToCDN(variants[fallbackSize]!, strategy)
    }
  }

  // 5. Last resort: return original URL (normalized to CDN)
  // This only happens if no variants exist at all
  return normalizeToCDN(originalUrl, strategy)
}

/**
 * Get responsive image srcset
 *
 * Generates a srcset string for use in <picture> tags or Next.js Image loader
 *
 * @param image - Media object from Payload CMS
 * @param strategy - Optional forced strategy ('china' | 'global')
 * @returns srcset string with multiple sizes
 */
export function getImageSrcSet(
  image: MediaImage | null | undefined,
  strategy?: string
): string {
  if (!image || !image.variants) {
    return ''
  }

  const { variants } = image
  const srcset: string[] = []

  if (variants.thumbnail) srcset.push(`${normalizeToCDN(variants.thumbnail, strategy)} 400w`)
  if (variants.small) srcset.push(`${normalizeToCDN(variants.small, strategy)} 768w`)
  if (variants.medium) srcset.push(`${normalizeToCDN(variants.medium, strategy)} 1024w`)
  if (variants.large) srcset.push(`${normalizeToCDN(variants.large, strategy)} 1920w`)

  return srcset.join(', ')
}

/**
 * Get localized alt text
 *
 * Extracts alt text in the specified language with fallback strategy:
 * 1. Try specified locale
 * 2. Fallback to English
 * 3. Return first available value
 * 4. Return empty string
 *
 * @param altText - Multilingual alt text object
 * @param locale - Language code (e.g., 'en', 'zh', 'es')
 * @returns Localized alt text
 *
 * @example
 * ```typescript
 * const alt = getImageAlt(image.altText, 'zh')
 * // Returns Chinese alt text, or falls back to English, or first available
 * ```
 */
export function getImageAlt(
  altText: Record<string, string> | null | undefined,
  locale: string
): string {
  if (!altText || typeof altText !== 'object') {
    return ''
  }

  // 1. Try specified locale
  if (altText[locale]) {
    return altText[locale]
  }

  // 2. Fallback to English
  if (altText['en']) {
    return altText['en']
  }

  // 3. Return first available value
  const values = Object.values(altText)
  if (values.length > 0 && values[0]) {
    return values[0]
  }

  // 4. Return empty string
  return ''
}

/**
 * Get responsive image sizes string
 *
 * Generates a sizes string for responsive images based on breakpoints
 *
 * @param defaultSize - Default size for largest viewport (e.g., '1200px')
 * @returns sizes string for responsive images
 *
 * @example
 * ```typescript
 * const sizes = getResponsiveSizes('1200px')
 * // Returns: "(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
 * ```
 */
export function getResponsiveSizes(defaultSize: string = '1200px'): string {
  return `(max-width: 640px) 400px, (max-width: 1024px) 800px, ${defaultSize}`
}

/**
 * Check if browser supports WebP format
 *
 * @returns true if WebP is supported
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const canvas = document.createElement('canvas')
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }
  return false
}

/**
 * Get image dimensions from variants
 *
 * @param image - Media object
 * @param size - Desired size variant
 * @returns Object with width and height, or undefined
 */
export function getImageDimensions(
  image: MediaImage | null | undefined,
  size: keyof ImageVariants = 'medium'
): { width: number; height: number } | undefined {
  if (!image?.file) {
    return undefined
  }

  // Return original dimensions if available
  if (image.file.width && image.file.height) {
    return {
      width: image.file.width,
      height: image.file.height
    }
  }

  return undefined
}

/**
 * Size recommendations for different use cases
 */
export const IMAGE_SIZE_RECOMMENDATIONS = {
  productCard: 'medium' as const,
  productDetail: 'large' as const,
  productThumbnail: 'small' as const,
  heroBanner: 'large' as const,  // Max is 1920px desktop, never use original
  blogFeatured: 'large' as const,
  blogThumbnail: 'medium' as const,
  galleryThumbnail: 'thumbnail' as const,
  galleryMain: 'large' as const,
} as const

/**
 * Get recommended image size for a specific use case
 *
 * @param useCase - The use case scenario
 * @returns Recommended size variant
 *
 * @example
 * ```typescript
 * const size = getRecommendedSize('productCard')
 * const url = getOptimizedImageUrl(image, size)
 * ```
 */
export function getRecommendedSize(
  useCase: keyof typeof IMAGE_SIZE_RECOMMENDATIONS
): 'thumbnail' | 'small' | 'medium' | 'large' | 'xlarge' {
  return IMAGE_SIZE_RECOMMENDATIONS[useCase]
}

/**
 * 案例图集随机选图助手 (池化随机策略)
 * 打平应用中所有场景的所有图片，从中随机抽取一张
 */
export function getRandomAppImage(app: any): any | null {
  if (!app) return null

  const allImages: any[] = []
  
  const isPopulatedMedia = (m: any) => {
    if (!m) return false
    if (typeof m === 'string') return m.startsWith('http') || m.startsWith('/')
    return !!(m.url || m.fileUrl || (m.file && m.file.url))
  }

  // 1. 尝试从场景图集中收集 (池化)
  if (Array.isArray(app.sceneGallery)) {
    app.sceneGallery.forEach((scene: any) => {
      if (Array.isArray(scene.images)) {
        scene.images.forEach((img: any) => {
          const mediaObj = img?.image || img
          if (isPopulatedMedia(mediaObj)) {
            allImages.push(mediaObj)
          }
        })
      }
    })
  }

  // 2. 如果场景图集为空，尝试回退到根路径的 images 字段
  if (allImages.length === 0 && Array.isArray(app.images)) {
    app.images.forEach((img: any) => {
      const mediaObj = img?.image || img
      if (isPopulatedMedia(mediaObj)) {
        allImages.push(mediaObj)
      }
    })
  }

  // 3. 最终回退：主图
  if (allImages.length === 0 && isPopulatedMedia(app.mainImage)) {
    allImages.push(app.mainImage)
  }

  if (allImages.length === 0) return null
  
  return allImages[Math.floor(Math.random() * allImages.length)]
}
