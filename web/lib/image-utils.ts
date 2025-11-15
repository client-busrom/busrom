/**
 * Image Optimization Utilities
 *
 * This module provides utilities for working with Keystone CMS Media images,
 * including image variants selection and alt text localization.
 *
 * @module lib/image-utils
 */

/**
 * Image Variants type definition
 *
 * Keystone CMS automatically generates these variants for each uploaded image
 */
export interface ImageVariants {
  thumbnail?: string   // 150x150 - Thumbnails, admin UI
  small?: string       // 400px width - Mobile lists, card covers
  medium?: string      // 800px width - Tablet, desktop lists
  large?: string       // 1200px width - Desktop detail pages, carousels
  xlarge?: string      // 1920px width - Full-screen backgrounds, hero banners
  webp?: string        // Adaptive - WebP format (smaller file size)
}

/**
 * Media Image type definition
 *
 * Represents a media object from Keystone CMS
 */
export interface MediaImage {
  id: string
  filename: string
  file: {
    url: string
    width?: number
    height?: number
  }
  variants?: ImageVariants
  altText?: Record<string, string> | null  // Multilingual alt text
}

/**
 * Get optimized image URL
 *
 * Returns the best image URL based on requested size and format preference.
 * Falls back to smaller/larger sizes if the requested size is not available.
 *
 * @param image - Media object from Keystone
 * @param size - Desired image size (default: 'medium')
 * @param preferWebP - Whether to prefer WebP format (default: true)
 * @returns Optimized image URL or placeholder
 *
 * @example
 * ```typescript
 * const url = getOptimizedImageUrl(product.image, 'medium', true)
 * // Returns WebP URL if available, otherwise medium size, or falls back
 * ```
 */
export function getOptimizedImageUrl(
  image: MediaImage | null | undefined,
  size: 'thumbnail' | 'small' | 'medium' | 'large' | 'xlarge' = 'medium',
  preferWebP: boolean = true
): string {
  // If no image, return placeholder
  if (!image || !image.file?.url) {
    return '/images/placeholder.jpg'
  }

  const { variants, file } = image

  // 1. Try WebP format first (if enabled and available)
  if (preferWebP && variants?.webp) {
    return variants.webp
  }

  // 2. Try requested size variant
  if (variants && variants[size]) {
    return variants[size]!
  }

  // 3. Fallback strategy: try other sizes from large to small
  const fallbackOrder: Array<keyof ImageVariants> = [
    'xlarge', 'large', 'medium', 'small', 'thumbnail'
  ]

  for (const fallbackSize of fallbackOrder) {
    if (variants && variants[fallbackSize]) {
      return variants[fallbackSize]!
    }
  }

  // 4. Last resort: return original URL
  return file.url
}

/**
 * Get responsive image srcset
 *
 * Generates a srcset string for use in <picture> tags or Next.js Image loader
 *
 * @param image - Media object from Keystone
 * @returns srcset string with multiple sizes
 *
 * @example
 * ```typescript
 * const srcset = getImageSrcSet(image)
 * // Returns: "url1 400w, url2 800w, url3 1200w, url4 1920w"
 * ```
 */
export function getImageSrcSet(
  image: MediaImage | null | undefined
): string {
  if (!image || !image.variants) {
    return ''
  }

  const { variants } = image
  const srcset: string[] = []

  if (variants.small) srcset.push(`${variants.small} 400w`)
  if (variants.medium) srcset.push(`${variants.medium} 800w`)
  if (variants.large) srcset.push(`${variants.large} 1200w`)
  if (variants.xlarge) srcset.push(`${variants.xlarge} 1920w`)

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
  heroBanner: 'xlarge' as const,
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
