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
import { getVariantUrl, getSrcSet, getCropImageUrl, getCropStyles } from '@/lib/utils'

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
  const src = cropData ? getCropImageUrl(image, cropData) : getVariantUrl(image, size)
  const altText = alt || image?.altText || ''
  const srcSet = getSrcSet(image)

  // Check if we need CSS fallback crop
  // In Payload, if a variant exists, its filename typically has dimensions appended like "-1920x1080.webp"
  // If getCropImageUrl returns the exact original URL (possibly CDN prefixed), we need to apply CSS cropping.
  // A robust check is to see if the filename in src exactly matches the original filename, 
  // or if src doesn't contain a typical dimension suffix like "-\d+x\d+\.".
  const originalFilename = image?.url?.split('/').pop() || '';
  const isOriginalUrl = 
    src === image?.url || 
    (originalFilename && src.endsWith(originalFilename)) || 
    !/-\d+x\d+\.[a-zA-Z0-9]+$/.test(src);
    
  const needsCssCrop = cropData && cropData.croppedAreaPixels && isOriginalUrl;

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

  const imgTag = (
    <img
      src={src}
      srcSet={priority ? undefined : srcSet}
      sizes={priority ? undefined : "100vw"}
      alt={altText}
      width={width || 1920}
      height={height || 1080}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding={priority ? 'sync' : 'async'}
      className={className}
      style={fillStyle}
    />
  )

  if (needsCssCrop) {
    const cropStyles = getCropStyles(cropData);
    if (cropStyles) {
      return (
        <div style={cropStyles.container} className={`w-full h-full ${className}`}>
          <img
            src={src}
            alt={altText}
            style={cropStyles.image}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            decoding={priority ? 'sync' : 'async'}
            width={cropData.variantWidth}
            height={cropData.variantHeight}
          />
        </div>
      );
    }
  }

  return imgTag;
}

export default ServerImage
