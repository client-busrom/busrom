/**
 * ServerImage - SSR-only Image Component for LCP optimization
 *
 * This component renders on the server without requiring JavaScript hydration.
 * Use this for LCP (Largest Contentful Paint) images like hero banners.
 *
 * For non-critical images, use OptimizedImage instead.
 */

import Image from 'next/image'
import type { ImageObject } from '@/lib/content-data'

type ImageVariants = {
  thumbnail?: string
  card?: string
  tablet?: string
  desktop?: string
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
}

/**
 * Get the best image URL based on size preset
 */
function getImageUrl(image: ImageObject | null | undefined, size: string): string {
  if (!image) return '/images/placeholder.jpg'

  const variants = image.variants as ImageVariants | undefined

  // Map size to variant name
  const variantMap: Record<string, string> = {
    thumbnail: 'thumbnail',
    small: 'card',
    medium: 'tablet',
    large: 'desktop',
  }

  const variantKey = variantMap[size] || 'desktop'
  const variantUrl = variants?.[variantKey]

  if (variantUrl) return variantUrl

  // Fallback to base URL
  return image.url || '/images/placeholder.jpg'
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
}: ServerImageProps) {
  const src = getImageUrl(image, size)
  const altText = alt || image?.altText || ''

  // For fill mode (most hero images)
  if (fill) {
    return (
      <Image
        src={src}
        alt={altText}
        fill
        priority={priority}
        className={className}
        style={{ objectPosition }}
        sizes="100vw"
        fetchPriority={priority ? 'high' : undefined}
      />
    )
  }

  // For fixed dimensions
  return (
    <Image
      src={src}
      alt={altText}
      width={width || 1920}
      height={height || 1080}
      priority={priority}
      className={className}
      style={{ objectPosition }}
      fetchPriority={priority ? 'high' : undefined}
    />
  )
}

export default ServerImage
