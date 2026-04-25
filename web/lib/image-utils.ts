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
import { getVariantUrl, getSrcSet } from './utils'

/**
 * Get optimized image URL
 */
export function getOptimizedImageUrl(
  image: MediaImage | null | undefined,
  size: 'thumbnail' | 'small' | 'medium' | 'large' | 'xlarge' = 'medium',
  preferWebP: boolean = true,
  strategy?: string
): string {
  // 转换 MediaImage 到 ImageObject (内部结构是一致的，主要是 variants)
  return getVariantUrl(image as any, size, strategy)
}

/**
 * Get responsive image srcset
 */
export function getImageSrcSet(
  image: MediaImage | null | undefined,
  strategy?: string
): string {
  return getSrcSet(image as any, strategy) || ''
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
 * 案例图集随机选图助手 (双随机策略)
 * 1. 随机选一个包含图片的场景 (Scene)
 * 2. 从该场景中随机选一张图 (Image)
 * 这种做法比“池化随机”更省运存，且能保证不同场景的展示权重均衡。
 */
export function getRandomAppImage(app: any): any | null {
  if (!app || !Array.isArray(app.sceneGallery)) return null

  // 1. 筛选出有图的有效场景
  const validScenes = app.sceneGallery.filter((scene: any) => 
    Array.isArray(scene.images) && scene.images.length > 0
  )

  if (validScenes.length === 0) return null

  // 2. 第一步随机：选场景
  const randomScene = validScenes[Math.floor(Math.random() * validScenes.length)]
  
  // 3. 第二步随机：选图
  const images = randomScene.images
  const picked = images[Math.floor(Math.random() * images.length)]
  
  // 处理 Payload 关联对象的不同嵌套层级 (picked.image 或 picked 本身)
  return picked?.image || picked
}
