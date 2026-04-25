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
import { getVariantUrl, getSrcSet } from '@/lib/utils'

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
  const src = getVariantUrl(image, size)
  const altText = alt || image?.altText || ''
  const srcSet = getSrcSet(image)

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
