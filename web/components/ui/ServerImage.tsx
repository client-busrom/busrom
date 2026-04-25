/**
 * ServerImage - SSR-only Image Component for LCP optimization
 *
 * This component renders on the server without requiring JavaScript hydration.
 * Uses native <img> tag to bypass Next.js Image optimizer and load directly from CDN.
 * This eliminates the /_next/image processing delay for LCP images.
 *
 * CDN images are already in WebP format with size suffix (e.g., image-1920x1280.webp)
 * so we just need to select the right size variant.
 *
 * For non-critical images, use OptimizedImage instead.
 */

import type { ImageObject } from '@/lib/content-data'

type ImageVariants = {
  thumbnail?: string  // 400x300
  card?: string       // 768x512
  tablet?: string     // 1024x683
  desktop?: string    // 1920x1280
  webp?: string       // Original WebP (avoid using - too large)
  [key: string]: string | undefined
}

type ServerImageProps = {
  image: ImageObject | null | undefined
  alt?: string
  size?: 'thumbnail' | 'small' | 'medium' | 'large'
  className?: string
  priority?: boolean
  fill?: boolean
  width?: number
  height?: number
  objectPosition?: string
  style?: React.CSSProperties
  cropData?: any
}

/**
 * Get the best image URL based on size preset
 * Returns the appropriately sized variant URL
 */
function getImageUrl(image: ImageObject | null | undefined, size: string): string {
  if (!image) return '/images/placeholder.jpg'

  const variants = image.variants as ImageVariants | undefined

  // Map size to variant name (use sized variants, NOT the full webp)
  const variantMap: Record<string, string> = {
    thumbnail: 'thumbnail',  // 400px
    small: 'card',           // 768px
    medium: 'tablet',        // 1024px
    large: 'desktop',        // 1920px
  }

  const variantKey = variantMap[size] || 'desktop'
  const variantUrl = variants?.[variantKey]

  // Return the sized variant, or fall back to original URL
  // Avoid using variants.webp as it's the full-size original
  return variantUrl || image.url || '/images/placeholder.jpg'
}

/**
 * Generate srcset for responsive images
 * Uses CDN variants directly without Next.js Image optimization
 */
function generateSrcSet(image: ImageObject | null | undefined): string | undefined {
  if (!image) return undefined

  const variants = image.variants as ImageVariants | undefined
  if (!variants) return undefined

  const srcsetParts: string[] = []

  // Map variants to widths (based on Payload image sizes)
  // All CDN variants are already WebP format
  if (variants.thumbnail) srcsetParts.push(`${variants.thumbnail} 400w`)
  if (variants.card) srcsetParts.push(`${variants.card} 768w`)
  if (variants.tablet) srcsetParts.push(`${variants.tablet} 1024w`)
  if (variants.desktop) srcsetParts.push(`${variants.desktop} 1920w`)

  return srcsetParts.length > 0 ? srcsetParts.join(', ') : undefined
}

export function ServerImage({
  image,
  alt,
  size = 'large',
  className = '',
  priority = false,
  fill = false,
  width,
  height,
  objectPosition,
  style,
  cropData,
}: ServerImageProps) {
  const src = getImageUrl(image, size)
  const altText = alt || image?.altText || ''
  const srcSet = generateSrcSet(image)

  // Common style for fill mode
  const fillStyle: React.CSSProperties = fill
    ? {
        position: 'absolute',
        height: '100%',
        width: '100%',
        inset: 0,
        objectFit: 'cover',
        objectPosition: objectPosition || 'center',
        ...style,
      }
    : {
        objectPosition: objectPosition || 'center',
        ...style,
      }

  // For LCP images with priority, use simple img tag with correct size
  // For non-priority images, use srcset for responsive loading
  return (
    <img
      src={src}
      srcSet={priority ? undefined : srcSet}
      sizes={priority ? undefined : "100vw"}
      alt={altText}
      width={fill ? undefined : (width || 1920)}
      height={fill ? undefined : (height || 1080)}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding={priority ? 'sync' : 'async'}
      className={className}
      style={fillStyle}
    />
  )
}

export default ServerImage
