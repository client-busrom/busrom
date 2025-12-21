/**
 * OptimizedImage Component
 *
 * A unified image component that automatically selects the best variant
 * from CDN-hosted images. Does NOT use Next.js Image optimization since
 * images are already served from CloudFront CDN with pre-generated variants.
 *
 * Features:
 * - Automatic variant selection based on size prop
 * - Responsive srcSet for browser-native resolution selection
 * - WebP format with JPEG fallback using <picture>
 * - Native lazy loading
 * - Localized alt text
 * - Optional blur placeholder
 *
 * @module components/ui/OptimizedImage
 */

'use client'

import React, { useState, useRef } from 'react'
import {
  getOptimizedImageUrl,
  getImageSrcSet,
  getImageAlt,
  getResponsiveSizes,
  type MediaImage,
  type ImageVariants,
} from '@/lib/image-utils'
import type { ImageObject } from '@/lib/content-data'

/**
 * Size presets for common use cases
 */
export type ImageSizePreset =
  | 'thumbnail'    // 400x300 - Thumbnails (from Payload thumbnail)
  | 'small'        // 768x512 - Mobile lists (from Payload card)
  | 'medium'       // 1024px - Tablet (from Payload tablet)
  | 'large'        // 1920px - Desktop (from Payload desktop)
  | 'xlarge'       // Original - Full-screen, hero banners
  | 'auto'         // Use responsive srcSet

/**
 * Universal image type - supports both MediaImage (from CMS) and ImageObject (from API)
 */
export type UniversalImage = MediaImage | ImageObject | null | undefined

/**
 * Convert ImageObject to MediaImage format for unified handling
 */
function normalizeImage(image: UniversalImage | string): MediaImage | null {
  if (!image) return null

  // Handle string URL input
  if (typeof image === 'string') {
    return {
      id: '',
      filename: '',
      file: { url: image },
      fileUrl: image,
      variants: undefined,
      altText: null,
    }
  }

  // Check if it's already MediaImage format (has 'id' field)
  if ('id' in image) {
    const mediaImage = image as MediaImage
    // Handle API format where url is at root level instead of file.url
    if (!mediaImage.file?.url && !mediaImage.fileUrl && (image as any).url) {
      const rawUrl = (image as any).url
      // Ensure url is a string
      const urlStr = typeof rawUrl === 'string' ? rawUrl :
                     (typeof rawUrl === 'object' && rawUrl?.url && typeof rawUrl.url === 'string') ? rawUrl.url : null
      if (urlStr) {
        return {
          ...mediaImage,
          file: { url: urlStr },
          fileUrl: urlStr,
        }
      }
    }
    return mediaImage
  }

  // Convert ImageObject to MediaImage format
  const imgObj = image as ImageObject
  return {
    id: '',
    filename: '',
    file: imgObj.url ? { url: imgObj.url } : null,
    fileUrl: imgObj.url,
    variants: imgObj.variants,
    altText: imgObj.altText ? { en: imgObj.altText, zh: imgObj.altText } : null,
    cropFocalPoint: imgObj.cropFocalPoint,
  }
}

/**
 * Props for OptimizedImage component
 */
export interface OptimizedImageProps {
  /** Image object or URL string - supports MediaImage (CMS), ImageObject (API), or direct URL */
  image?: UniversalImage | string
  /** @deprecated Use 'image' prop instead. Media object from Payload CMS */
  media?: MediaImage | null | undefined
  /** Alt text override (if not provided, uses localized altText from media) */
  alt?: string
  /** Current locale for alt text */
  locale?: string
  /** Image size preset or 'auto' for responsive */
  size?: ImageSizePreset
  /** Custom sizes attribute for responsive images */
  sizes?: string
  /** Whether to prefer WebP format */
  preferWebP?: boolean
  /** CSS class name */
  className?: string
  /** Container CSS class name (for aspect ratio wrapper) */
  containerClassName?: string
  /** Image width (for aspect ratio) */
  width?: number
  /** Image height (for aspect ratio) */
  height?: number
  /** Aspect ratio (e.g., '16/9', '4/3', '1/1') */
  aspectRatio?: string
  /** Object fit style */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  /** Object position style */
  objectPosition?: string
  /** Loading strategy */
  loading?: 'lazy' | 'eager'
  /** Placeholder image URL */
  placeholder?: string
  /** Show blur placeholder while loading */
  showBlurPlaceholder?: boolean
  /** Called when image loads */
  onLoad?: () => void
  /** Called on error */
  onError?: () => void
  /** Priority loading (sets loading="eager" and fetchpriority="high") */
  priority?: boolean
}

/**
 * OptimizedImage Component
 *
 * Renders an optimized image with automatic variant selection.
 * Uses native HTML img/picture elements (no Next.js Image optimization).
 *
 * @example
 * ```tsx
 * // Basic usage
 * <OptimizedImage media={product.image} size="medium" />
 *
 * // With aspect ratio
 * <OptimizedImage
 *   media={hero.image}
 *   size="xlarge"
 *   aspectRatio="16/9"
 *   priority
 * />
 *
 * // Responsive with custom sizes
 * <OptimizedImage
 *   media={blog.featuredImage}
 *   size="auto"
 *   sizes="(max-width: 768px) 100vw, 50vw"
 * />
 * ```
 */
export function OptimizedImage({
  image,
  media,
  alt,
  locale = 'en',
  size = 'medium',
  sizes,
  preferWebP = true,
  className = '',
  containerClassName = '',
  width,
  height,
  aspectRatio,
  objectFit = 'cover',
  objectPosition = 'center',
  loading,
  placeholder = '/images/placeholder.jpg',
  showBlurPlaceholder = false,
  onLoad,
  onError,
  priority = false,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Normalize image to MediaImage format (supports both image and media props)
  const normalizedMedia = normalizeImage(image) || media

  // Determine loading strategy
  const loadingStrategy = priority ? 'eager' : (loading || 'lazy')

  // Get alt text
  const altText = alt || getImageAlt(normalizedMedia?.altText, locale) || normalizedMedia?.filename || ''

  // Calculate object position from cropFocalPoint (if not explicitly set)
  // cropFocalPoint: { x: 0-100, y: 0-100 } -> objectPosition: "x% y%"
  const calculatedObjectPosition = objectPosition !== 'center'
    ? objectPosition
    : normalizedMedia?.cropFocalPoint
      ? `${normalizedMedia.cropFocalPoint.x}% ${normalizedMedia.cropFocalPoint.y}%`
      : objectPosition

  // Check if media has a valid URL (support both file.url and fileUrl)
  const hasValidUrl = normalizedMedia?.file?.url || normalizedMedia?.fileUrl

  // Handle no media
  if (!normalizedMedia || !hasValidUrl) {
    return (
      <ImageContainer
        className={containerClassName}
        aspectRatio={aspectRatio}
        width={width}
        height={height}
      >
        <img
          src={placeholder}
          alt={altText || 'Placeholder'}
          className={`${className} ${objectFit ? `object-${objectFit}` : ''}`}
          style={{ objectPosition: calculatedObjectPosition }}
          loading={loadingStrategy}
        />
      </ImageContainer>
    )
  }

  const { variants } = normalizedMedia

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  // Handle image error
  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  // If error, show placeholder
  if (hasError) {
    return (
      <ImageContainer
        className={containerClassName}
        aspectRatio={aspectRatio}
        width={width}
        height={height}
      >
        <img
          src={placeholder}
          alt={altText}
          className={`${className} ${objectFit ? `object-${objectFit}` : ''}`}
          style={{ objectPosition: calculatedObjectPosition }}
          loading={loadingStrategy}
        />
      </ImageContainer>
    )
  }

  // For 'auto' size, use responsive srcSet
  if (size === 'auto' && variants) {
    const srcSet = getImageSrcSet(normalizedMedia)
    const defaultSizes = sizes || getResponsiveSizes()
    const defaultSrc = getOptimizedImageUrl(normalizedMedia, 'medium', false)

    return (
      <ImageContainer
        className={containerClassName}
        aspectRatio={aspectRatio}
        width={width}
        height={height}
      >
        {/* Blur placeholder */}
        {showBlurPlaceholder && !isLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        <picture>
          {/* WebP source */}
          {preferWebP && variants.webp && (
            <source srcSet={variants.webp} type="image/webp" />
          )}
          {/* Responsive JPEG/PNG sources */}
          {srcSet && (
            <source srcSet={srcSet} sizes={defaultSizes} />
          )}
          {/* Fallback img */}
          <img
            ref={imgRef}
            src={defaultSrc}
            alt={altText}
            className={`${className} ${objectFit ? `object-${objectFit}` : ''} ${
              showBlurPlaceholder && !isLoaded ? 'opacity-0' : 'opacity-100'
            } transition-opacity duration-300`}
            style={{ objectPosition: calculatedObjectPosition }}
            loading={loadingStrategy}
            fetchPriority={priority ? 'high' : undefined}
            onLoad={handleLoad}
            onError={handleError}
            width={width}
            height={height}
          />
        </picture>
      </ImageContainer>
    )
  }

  // For specific size, use single source with WebP fallback
  const imageUrl = getOptimizedImageUrl(normalizedMedia, size === 'auto' ? 'medium' : size, false)
  const webpUrl = preferWebP && variants?.webp ? variants.webp : null

  return (
    <ImageContainer
      className={containerClassName}
      aspectRatio={aspectRatio}
      width={width}
      height={height}
    >
      {/* Blur placeholder */}
      {showBlurPlaceholder && !isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      <picture>
        {/* WebP source for modern browsers */}
        {webpUrl && (
          <source srcSet={webpUrl} type="image/webp" />
        )}
        {/* Fallback img */}
        <img
          ref={imgRef}
          src={imageUrl}
          alt={altText}
          className={`${className} ${objectFit ? `object-${objectFit}` : ''} ${
            showBlurPlaceholder && !isLoaded ? 'opacity-0' : 'opacity-100'
          } transition-opacity duration-300`}
          style={{ objectPosition: calculatedObjectPosition }}
          loading={loadingStrategy}
          fetchPriority={priority ? 'high' : undefined}
          onLoad={handleLoad}
          onError={handleError}
          width={width}
          height={height}
        />
      </picture>
    </ImageContainer>
  )
}

/**
 * Image container with aspect ratio support
 */
function ImageContainer({
  children,
  className = '',
  aspectRatio,
  width,
  height,
}: {
  children: React.ReactNode
  className?: string
  aspectRatio?: string
  width?: number
  height?: number
}) {
  // If aspect ratio provided, use aspect-ratio CSS
  if (aspectRatio) {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        style={{ aspectRatio }}
      >
        {children}
      </div>
    )
  }

  // If width and height provided, calculate aspect ratio
  if (width && height) {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        style={{ aspectRatio: `${width}/${height}` }}
      >
        {children}
      </div>
    )
  }

  // No aspect ratio, render as-is
  if (className) {
    return <div className={className}>{children}</div>
  }

  return <>{children}</>
}

/**
 * Background image variant using CSS background-image
 *
 * Useful for hero sections or decorative backgrounds
 */
export function OptimizedBackgroundImage({
  image,
  media,
  size = 'xlarge',
  preferWebP = true,
  className = '',
  children,
  overlay,
}: {
  /** Image object - supports both MediaImage (CMS) and ImageObject (API) */
  image?: UniversalImage
  /** @deprecated Use 'image' prop instead */
  media?: MediaImage | null | undefined
  size?: Exclude<ImageSizePreset, 'auto'>
  preferWebP?: boolean
  className?: string
  children?: React.ReactNode
  overlay?: string // e.g., 'rgba(0,0,0,0.5)' or 'linear-gradient(...)'
}) {
  const normalizedMedia = normalizeImage(image) || media
  const imageUrl = getOptimizedImageUrl(normalizedMedia, size, preferWebP)

  const backgroundStyle: React.CSSProperties = overlay
    ? {
        backgroundImage: `${overlay}, url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }

  return (
    <div className={className} style={backgroundStyle}>
      {children}
    </div>
  )
}

export default OptimizedImage
