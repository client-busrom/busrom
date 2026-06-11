'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  getOptimizedImageUrl,
  getImageSrcSet,
  getImageAlt,
  getResponsiveSizes,
  type MediaImage,
} from '@/lib/image-utils'
import type { ImageObject } from '@/lib/content-data'
import { useSeoAlt } from '@/components/product-series/SeoKeywordProvider'

/**
 * Size presets for common use cases
 */
export type ImageSizePreset =
  | 'thumbnail'    // 400x300
  | 'small'        // 768x512
  | 'medium'       // 1024px
  | 'large'        // 1920px
  | 'xlarge'       // Original
  | 'auto'         // Use responsive srcSet

/**
 * Universal image type - supports both MediaImage (from CMS) and ImageObject (from API)
 */
export type UniversalImage = MediaImage | ImageObject | null | undefined

/**
 * Normalize image to MediaImage format
 */
function normalizeImage(image: UniversalImage | string): MediaImage | null {
  if (!image) return null
  if (typeof image === 'string') {
    return {
      id: '',
      filename: '',
      file: { url: image },
      fileUrl: image,
      altText: null,
    }
  }

  if ('id' in image) {
    const mediaImage = image as MediaImage
    if (!mediaImage.file?.url && !mediaImage.fileUrl && (image as any).url) {
      const urlStr = (image as any).url
      return {
        ...mediaImage,
        file: { url: urlStr },
        fileUrl: urlStr,
      }
    }
    return mediaImage
  }

  const imgObj = image as ImageObject
  const sizes = (image as any).sizes
  const variants = imgObj.variants || sizes

  // If using Payload sizes, try to pick a webp source
  if (sizes && !variants?.webp) {
    const webpUrl = sizes.card?.url || sizes.tablet?.url || sizes.thumbnail?.url
    if (webpUrl?.endsWith('.webp')) {
      (variants as any).webp = webpUrl
    }
  }

  return {
    id: '',
    filename: '',
    file: imgObj.url ? { url: imgObj.url } : null,
    fileUrl: imgObj.url,
    variants: variants,
    altText: imgObj.altText ? { en: imgObj.altText, zh: imgObj.altText } : null,
  }
}

export interface OptimizedImageProps {
  image?: UniversalImage | string
  media?: MediaImage | null | undefined
  alt?: string
  locale?: string
  size?: ImageSizePreset
  sizes?: string
  preferWebP?: boolean
  className?: string
  containerClassName?: string
  width?: number
  height?: number
  aspectRatio?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
  loading?: 'lazy' | 'eager'
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
}

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
  priority = false,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const getSeoAlt = useSeoAlt()
  const [autoAlt] = useState(() => getSeoAlt())
  const [hasError, setHasError] = useState(false)
  
  const normalizedMedia = normalizeImage(image) || media
  const hasValidUrl = normalizedMedia?.file?.url || normalizedMedia?.fileUrl

  useEffect(() => {
    setHasError(false)
  }, [hasValidUrl])

  if (!normalizedMedia || !hasValidUrl || hasError) {
    return null
  }

  const loadingStrategy = priority ? 'eager' : (loading || 'lazy')
  const altText = alt || autoAlt || getImageAlt(normalizedMedia?.altText, locale) || normalizedMedia?.filename || ''

  // Dimensions
  const imgWidth = width ?? normalizedMedia?.file?.width
  const imgHeight = height ?? normalizedMedia?.file?.height

  // URL Selection
  const imageUrl = getOptimizedImageUrl(normalizedMedia, size === 'auto' ? 'medium' : size, false)
  const variants = normalizedMedia.variants

  return (
    <ImageContainer
      className={containerClassName}
      aspectRatio={aspectRatio}
      width={imgWidth}
      height={imgHeight}
    >
      <picture>
        {preferWebP && variants?.webp && (
          <source srcSet={variants.webp} type="image/webp" />
        )}
        {size === 'auto' && variants && (
          <source srcSet={getImageSrcSet(normalizedMedia)} sizes={sizes || getResponsiveSizes()} />
        )}
        <img
          src={imageUrl}
          alt={altText}
          width={imgWidth}
          height={imgHeight}
          className={`${className} ${objectFit ? `object-${objectFit}` : ''}`}
          style={{ objectPosition }}
          loading={loadingStrategy}
          onLoad={onLoad}
          onError={() => {
            setHasError(true)
            onError?.()
          }}
          fetchPriority={priority ? 'high' : undefined}
        />
      </picture>
    </ImageContainer>
  )
}

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
  const style: React.CSSProperties = {}
  if (aspectRatio) style.aspectRatio = aspectRatio
  else if (width && height) style.aspectRatio = `${width}/${height}`

  if (Object.keys(style).length > 0 || className) {
    return <div className={`relative overflow-hidden ${className}`} style={style}>{children}</div>
  }
  return <>{children}</>
}

export function OptimizedBackgroundImage({
  image,
  size = 'xlarge',
  className = '',
  children,
  overlay,
}: {
  image?: UniversalImage
  size?: Exclude<ImageSizePreset, 'auto'>
  className?: string
  children?: React.ReactNode
  overlay?: string
}) {
  const imageUrl = getOptimizedImageUrl(normalizeImage(image), size, true)

  const backgroundStyle: React.CSSProperties = {
    backgroundImage: imageUrl ? (overlay ? `${overlay}, url("${imageUrl}")` : `url("${imageUrl}")`) : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }

  return <div className={className} style={backgroundStyle}>{children}</div>
}

export default OptimizedImage
