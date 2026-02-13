// @ts-nocheck
"use client"

/**
 * Payload CMS Lexical Content Renderer
 *
 * Renders Lexical EditorState JSON using Payload's official rendering approach
 * with custom JSX converters for our custom node types.
 */

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { IconifyIcon } from '@/components/ui/IconifyIcon'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { RichText, defaultJSXConverters } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical'
import type { JSXConverters } from '@payloadcms/richtext-lexical/react'

interface LexicalRendererProps {
  content: SerializedEditorState
  className?: string
}

/**
 * Block Component Definitions
 */

// Helper to get CMS URL for fetching media
const getCmsUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use public CMS URL
    return process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.busromhouse.com'
  }
  // Server-side: use internal URL if available
  return process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.busromhouse.com'
}

// Client component to handle image gallery with media fetching
const ImageGalleryBlock = ({ node }: any) => {
  const { images, layout, spacing, lightbox } = node.data || node.fields || {}
  const [mediaCache, setMediaCache] = React.useState<Record<string, any>>({})
  const [loading, setLoading] = React.useState(true)

  // Fetch media data for image IDs
  React.useEffect(() => {
    if (!images || images.length === 0) {
      setLoading(false)
      return
    }

    const fetchMedia = async () => {
      const cmsUrl = getCmsUrl()
      const newCache: Record<string, any> = {}

      await Promise.all(
        images.map(async (item: any) => {
          // Handle both string ID and object with id
          const imageId = typeof item.image === 'string' ? item.image : item.image?.id
          if (!imageId || mediaCache[imageId]) return

          try {
            const res = await fetch(`${cmsUrl}/api/media/${imageId}?depth=0`)
            if (res.ok) {
              const data = await res.json()
              newCache[imageId] = data
            }
          } catch (err) {
            console.error(`Failed to fetch media ${imageId}:`, err)
          }
        })
      )

      if (Object.keys(newCache).length > 0) {
        setMediaCache(prev => ({ ...prev, ...newCache }))
      }
      setLoading(false)
    }

    fetchMedia()
  }, [images])

  if (!images || images.length === 0) return null

  // Layout configurations (matches Payload CMS feature config)
  const layoutClasses = {
    'grid-2': 'grid-cols-1 md:grid-cols-2',
    'grid-3': 'grid-cols-2 md:grid-cols-3',
    'grid-4': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    'masonry': 'columns-2 md:columns-3 lg:columns-4',
  }[layout || 'grid-3']

  // Spacing configurations
  const spacingClasses = {
    small: 'gap-2',
    normal: 'gap-4',
    large: 'gap-6',
  }[spacing || 'normal']

  const isMasonry = layout === 'masonry'

  if (loading) {
    return (
      <div className={`my-6 grid ${layoutClasses} ${spacingClasses}`}>
        {images.map((_: any, index: number) => (
          <div key={index} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className={`my-6 ${isMasonry ? layoutClasses : `grid ${layoutClasses} ${spacingClasses}`}`}>
      {images.map((item: any, index: number) => {
        // Handle both string ID and object with id/url
        const imageId = typeof item.image === 'string' ? item.image : item.image?.id
        const mediaData = imageId ? mediaCache[imageId] : item.image

        // Try different variant names: desktop (1920px) > tablet (1024px) > card (768px)
        // Never use original URL directly - always prefer variants
        const imageUrl = mediaData?.variants?.desktop?.url ||
                         mediaData?.variants?.tablet?.url ||
                         mediaData?.variants?.card?.url ||
                         mediaData?.variants?.thumbnail?.url ||
                         mediaData?.url  // Last resort fallback

        if (!imageUrl) {
          return (
            <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
              Image not found
            </div>
          )
        }

        const imageElement = (
          <div
            key={index}
            className={`relative ${isMasonry ? 'mb-4 break-inside-avoid' : 'aspect-square'} rounded-lg overflow-hidden group ${lightbox ? 'cursor-pointer' : ''}`}
          >
            <Image
              src={imageUrl}
              alt={item.caption || mediaData?.alt || `Gallery image ${index + 1}`}
              width={mediaData?.width || 800}
              height={mediaData?.height || 800}
              className={`w-full ${isMasonry ? 'h-auto' : 'h-full'} object-cover transition-transform ${lightbox ? 'group-hover:scale-105' : ''}`}
              unoptimized
            />
            {item.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm">
                {item.caption}
              </div>
            )}
          </div>
        )

        if (item.enableLink && item.linkUrl) {
          return (
            <Link
              key={index}
              href={item.linkUrl}
              target={item.openInNewTab ? '_blank' : undefined}
              rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
            >
              {imageElement}
            </Link>
          )
        }

        return imageElement
      })}
    </div>
  )
}

const SingleImageBlock = ({ node }: any) => {
  const { image, caption, alignment, size, enableLink, linkUrl, openInNewTab } = node.data || node.fields || {}
  const [mediaData, setMediaData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  // Fetch media data if image is an ID
  React.useEffect(() => {
    const imageId = typeof image === 'string' ? image : image?.id
    if (!imageId) {
      setLoading(false)
      return
    }

    // If image already has url, use it directly
    if (image?.url) {
      setMediaData(image)
      setLoading(false)
      return
    }

    const fetchMedia = async () => {
      try {
        const cmsUrl = getCmsUrl()
        const res = await fetch(`${cmsUrl}/api/media/${imageId}?depth=0`)
        if (res.ok) {
          const data = await res.json()
          setMediaData(data)
        }
      } catch (err) {
        console.error(`Failed to fetch media ${imageId}:`, err)
      }
      setLoading(false)
    }

    fetchMedia()
  }, [image])

  // Size configurations (matches Payload CMS feature config)
  const sizeClasses = {
    small: 'max-w-xs',    // 300px
    medium: 'max-w-2xl',  // 600px
    large: 'max-w-4xl',   // 900px
    full: 'max-w-full',   // 100%
  }[size || 'large']

  // Alignment configurations
  const alignmentClasses = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto',
  }[alignment || 'center']

  if (loading) {
    return (
      <figure className={`my-6 ${alignmentClasses}`}>
        <div className={`relative w-full ${sizeClasses} aspect-video bg-gray-200 rounded-lg animate-pulse`} />
      </figure>
    )
  }

  // Try different variant names: desktop (1920px) > tablet (1024px) > card (768px)
  // Never use original URL directly - always prefer variants
  const imageUrl = mediaData?.variants?.desktop?.url ||
                   mediaData?.variants?.tablet?.url ||
                   mediaData?.variants?.card?.url ||
                   mediaData?.variants?.thumbnail?.url ||
                   mediaData?.url  // Last resort fallback

  if (!imageUrl) return null

  const imageContent = (
    <div className={`relative w-full ${sizeClasses} rounded-lg overflow-hidden`}>
      <Image
        src={imageUrl}
        alt={caption || mediaData?.alt || ''}
        width={mediaData?.width || 1920}
        height={mediaData?.height || 1080}
        className="w-full h-auto object-contain"
        unoptimized
      />
    </div>
  )

  return (
    <figure className={`my-6 ${alignmentClasses}`}>
      {enableLink && linkUrl ? (
        <Link
          href={linkUrl}
          target={openInNewTab ? '_blank' : undefined}
          rel={openInNewTab ? 'noopener noreferrer' : undefined}
        >
          {imageContent}
        </Link>
      ) : (
        imageContent
      )}
      {caption && (
        <figcaption className="text-sm text-gray-600 mt-2 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

const VideoEmbedBlock = ({ node }: any) => {
  const { videoUrl, caption } = node.data || node.fields || {}

  if (!videoUrl) return null

  return (
    <figure className="my-6">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
        <iframe
          src={videoUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {caption && (
        <figcaption className="text-sm text-gray-600 mt-2 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

const CtaButtonBlock = ({ node }: any) => {
  const { text, url, variant, size } = node.data || node.fields || {}

  const variantClasses = {
    primary: 'bg-brand-secondary text-white hover:bg-brand-secondary/90',
    secondary: 'bg-brand-accent-gold text-white hover:bg-brand-accent-gold/90',
    outline: 'border-2 border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white',
  }[variant || 'primary']

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  }[size || 'medium']

  return (
    <div className="my-6">
      <Link
        href={url || '#'}
        className={`inline-block rounded-lg transition-colors font-medium ${variantClasses} ${sizeClasses}`}
      >
        {text}
      </Link>
    </div>
  )
}

const NoticeBlock = ({ node }: any) => {
  const { type, title, content } = node.data || node.fields || {}

  const typeStyles = {
    info: 'bg-blue-50 border-blue-500 text-blue-900',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-900',
    error: 'bg-red-50 border-red-500 text-red-900',
    success: 'bg-green-50 border-green-500 text-green-900',
  }[type || 'info']

  return (
    <div className={`border-l-4 p-4 rounded-r my-6 ${typeStyles}`}>
      {title && <div className="font-bold mb-2">{title}</div>}
      {content && <div>{content}</div>}
    </div>
  )
}

const LinkJumpBlock = ({ node }: any) => {
  const { iconType, lucideIconName, mediaIcon, title, linkText, linkUrl, openInNewTab } = node.data || node.fields || {}

  return (
    <Link
      href={linkUrl || '#'}
      target={openInNewTab ? '_blank' : undefined}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
      className="inline-flex items-center gap-3 py-4 group text-left my-4"
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        {iconType === 'lucide' && lucideIconName ? (
          <div className="w-6 h-6 flex items-center justify-center text-brand-accent-gold">
            <IconifyIcon name={lucideIconName} size={24} color="currentColor" />
          </div>
        ) : mediaIcon?.url ? (
          <div className="w-6 h-6 rounded overflow-hidden">
            <Image
              src={mediaIcon.url}
              alt={title || linkText}
              width={24}
              height={24}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-6 h-6 bg-gray-200 rounded" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        {title && (
          <div className="text-lg font-anaheim font-extrabold text-brand-text-black mb-1">
            {title}
          </div>
        )}
        <div className="text-brand-accent-gold group-hover:text-brand-secondary transition-colors font-medium">
          {linkText} →
        </div>
      </div>
    </Link>
  )
}

const CarouselBlock = ({ node }: any) => {
  const { slides, autoplay, interval, itemsPerView } = node.data || node.fields || {}
  const [api, setApi] = React.useState<any>()
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(true)
  const [mediaCache, setMediaCache] = React.useState<Record<string, any>>({})
  const [loading, setLoading] = React.useState(true)

  // Fetch media data for slide images
  React.useEffect(() => {
    if (!slides || slides.length === 0) {
      setLoading(false)
      return
    }

    const fetchMedia = async () => {
      const cmsUrl = getCmsUrl()
      const newCache: Record<string, any> = {}

      await Promise.all(
        slides.map(async (slide: any) => {
          const imageId = typeof slide.image === 'string' ? slide.image : slide.image?.id
          if (!imageId || mediaCache[imageId] || slide.image?.url) return

          try {
            const res = await fetch(`${cmsUrl}/api/media/${imageId}?depth=0`)
            if (res.ok) {
              const data = await res.json()
              newCache[imageId] = data
            }
          } catch (err) {
            console.error(`Failed to fetch media ${imageId}:`, err)
          }
        })
      )

      if (Object.keys(newCache).length > 0) {
        setMediaCache(prev => ({ ...prev, ...newCache }))
      }
      setLoading(false)
    }

    fetchMedia()
  }, [slides])

  React.useEffect(() => {
    if (!api) return

    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }

    api.on('select', onSelect)
    api.on('reInit', onSelect)
    onSelect()

    return () => {
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api])

  // Auto-play functionality
  React.useEffect(() => {
    if (!api || !autoplay) return

    const intervalId = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext()
      } else {
        api.scrollTo(0) // Loop back to start
      }
    }, (interval || 5) * 1000)

    return () => clearInterval(intervalId)
  }, [api, autoplay, interval])

  if (!slides || slides.length === 0) return null

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen py-8 pb-20 my-8">
      <div className="overflow-hidden">
        {/* Gradient masks */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-brand-main to-transparent z-10 pointer-events-none"></div>
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-brand-main to-transparent z-10 pointer-events-none"></div>

        <Carousel
          setApi={setApi}
          opts={{
            align: 'center',
            loop: true,
            dragFree: false,
            slidesToScroll: 1,
          }}
          plugins={[WheelGesturesPlugin()]}
          className="w-full"
        >
          <CarouselContent className="-ml-6">
            {slides.map((slide: any, index: number) => {
              const imageId = typeof slide.image === 'string' ? slide.image : slide.image?.id
              const mediaData = imageId ? mediaCache[imageId] : slide.image
              // Prefer variants: desktop (1920px) > tablet (1024px) > card (768px)
              const imageUrl = mediaData?.variants?.desktop?.url || mediaData?.variants?.tablet?.url || mediaData?.variants?.card?.url || mediaData?.variants?.thumbnail?.url || mediaData?.url

              return (
                <CarouselItem key={index} className="pl-6 basis-auto">
                  <div className="space-y-4">
                    {(imageUrl || loading) && (
                      <div className="relative w-64 h-64 md:w-[488px] md:h-[488px] rounded-2xl overflow-hidden">
                        {loading ? (
                          <div className="w-full h-full bg-gray-200 animate-pulse" />
                        ) : imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={slide.title || slide.description || ''}
                            width={488}
                            height={488}
                            className="object-cover w-full h-full"
                            unoptimized
                          />
                        ) : null}
                      </div>
                    )}

                    <div className="space-y-3 max-w-[256px] md:max-w-[488px]">
                      {slide.title && (
                        <div className="font-bold text-brand-text-black text-lg">
                          {slide.title}
                        </div>
                      )}

                      {slide.description && (
                        <div className="text-brand-text-main text-sm leading-relaxed">
                          {slide.description}
                        </div>
                      )}

                      {slide.showButton && slide.buttonText && slide.buttonLink && (
                        <div>
                          <Link
                            href={slide.buttonLink}
                            target={slide.openInNewTab ? '_blank' : undefined}
                            rel={slide.openInNewTab ? 'noopener noreferrer' : undefined}
                            className="inline-block px-6 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary/90 transition-colors font-medium text-sm"
                          >
                            {slide.buttonText}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Navigation buttons */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-20">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-[#756F3F] text-[#756F3F] hover:bg-[#756F3F] hover:text-white"
          onClick={() => api?.scrollPrev()}
          disabled={!canScrollPrev}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-[#756F3F] text-[#756F3F] hover:bg-[#756F3F] hover:text-white"
          onClick={() => api?.scrollNext()}
          disabled={!canScrollNext}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>
    </div>
  )
}

const HeroBlock = ({ node }: any) => {
  const { title, subtitle, backgroundImage, ctaText, ctaUrl } = node.data || node.fields || {}
  // Prefer variants: desktop (1920px) > tablet (1024px) > card (768px)
  const bgUrl = backgroundImage?.variants?.desktop?.url || backgroundImage?.variants?.tablet?.url || backgroundImage?.variants?.card?.url || backgroundImage?.variants?.thumbnail?.url || backgroundImage?.url

  return (
    <div className="relative w-full h-[400px] md:h-[600px] my-8 rounded-2xl overflow-hidden">
      {bgUrl && (
        <Image
          src={bgUrl}
          alt={title || ''}
          fill
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        {title && (
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl">
            {subtitle}
          </p>
        )}
        {ctaText && ctaUrl && (
          <Link
            href={ctaUrl}
            className="px-8 py-4 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary/90 transition-colors font-bold text-lg"
          >
            {ctaText}
          </Link>
        )}
      </div>
    </div>
  )
}

const MarqueeLinksBlock = ({ node }: any) => {
  const { speed, links, theme } = node.data || node.fields || {}
  const [isPaused, setIsPaused] = React.useState(false)
  const [mediaCache, setMediaCache] = React.useState<Record<string, any>>({})
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [repeatCount, setRepeatCount] = React.useState(10) // Default repeat count

  // Calculate how many times to repeat items to fill the screen
  React.useEffect(() => {
    if (!containerRef.current || !links || links.length === 0) return

    // Estimate: each item is roughly 200px wide, we need at least 2x screen width
    const screenWidth = window.innerWidth
    const estimatedItemWidth = 200
    const totalItemsWidth = links.length * estimatedItemWidth
    const neededRepeats = Math.ceil((screenWidth * 2.5) / totalItemsWidth)
    setRepeatCount(Math.max(neededRepeats, 5)) // At least 5 repeats
  }, [links])

  // Fetch media data for icons that are media IDs
  React.useEffect(() => {
    if (!links || links.length === 0) return

    const fetchMedia = async () => {
      const cmsUrl = getCmsUrl()
      const newCache: Record<string, any> = {}

      await Promise.all(
        links.map(async (link: any) => {
          const iconId = typeof link.icon === 'object' ? link.icon?.id : link.icon
          if (!iconId || mediaCache[iconId]) return

          try {
            const res = await fetch(`${cmsUrl}/api/media/${iconId}?depth=0`)
            if (res.ok) {
              const data = await res.json()
              newCache[iconId] = data
            }
          } catch (err) {
            console.error(`Failed to fetch media ${iconId}:`, err)
          }
        })
      )

      if (Object.keys(newCache).length > 0) {
        setMediaCache(prev => ({ ...prev, ...newCache }))
      }
    }

    fetchMedia()
  }, [links])

  const speedDuration = {
    slow: '60s',
    medium: '40s',
    fast: '20s',
  }[speed as 'slow' | 'medium' | 'fast'] || '40s'

  const isDark = theme === 'dark'
  // Dark theme: dark background, white text, gold icons
  // Light theme: cream/beige background with slight contrast, dark text, gold icons
  const bgClass = isDark ? 'bg-[#bfb672]' : 'bg-[#ebe6d7]'
  const textClass = isDark ? 'text-white' : 'text-black'
  const iconClass = isDark ? 'text-brand-accent-gold' : 'text-brand-accent-gold'
  const dividerClass = isDark ? 'bg-white/30' : 'bg-brand-secondary/25'

  if (!links || links.length === 0) return null

  // Render a single link item
  const renderLinkItem = (link: any, keyPrefix: string, idx: number) => {
    const iconId = typeof link.icon === 'object' ? link.icon?.id : link.icon
    const mediaData = iconId ? mediaCache[iconId] : null
    const iconUrl = mediaData?.variants?.thumbnail?.url || mediaData?.url

    return (
      <div key={`${keyPrefix}-${idx}`} className="flex items-center shrink-0">
        <Link
          href={link.url || '#'}
          className="flex items-center gap-3 px-6 hover:opacity-70 transition-opacity whitespace-nowrap"
        >
          {link.iconName ? (
            <div className={`${iconClass} flex-shrink-0`}>
              <IconifyIcon name={link.iconName} size={20} color="currentColor" />
            </div>
          ) : iconUrl ? (
            <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0">
              <Image src={iconUrl} alt={link.title} width={20} height={20} className="w-full h-full object-cover" unoptimized />
            </div>
          ) : null}
          <span className={`${textClass} text-[16px] font-montserrat font-medium`}>{link.title}</span>
        </Link>
        <div className={`w-px h-5 ${dividerClass}`}></div>
      </div>
    )
  }

  // Create repeated items array
  const repeatedItems = React.useMemo(() => {
    const items: React.ReactNode[] = []
    for (let r = 0; r < repeatCount; r++) {
      links.forEach((link: any, idx: number) => {
        items.push(renderLinkItem(link, `r${r}`, idx))
      })
    }
    return items
  }, [links, repeatCount, mediaCache, iconClass, textClass, dividerClass])

  return (
    <div
      ref={containerRef}
      className={`relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden ${bgClass} py-3`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Infinite scroll container */}
      <div className="flex">
        {/* First track */}
        <div
          className="flex shrink-0 items-center animate-marquee"
          style={{
            animationDuration: speedDuration,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {repeatedItems}
        </div>
        {/* Second track - identical copy for seamless loop */}
        <div
          className="flex shrink-0 items-center animate-marquee"
          style={{
            animationDuration: speedDuration,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {repeatedItems}
        </div>
      </div>
    </div>
  )
}

/**
 * Two Columns Block
 *
 * Uses a separate NestedLexicalRenderer component that builds full converters
 * including all custom blocks for proper nested rendering.
 */
const TwoColumnsBlock = ({ node }: any) => {
  const { leftColumn, rightColumn, gap, columnRatio, verticalAlign } = node.data || node.fields || {}

  const gapClass = {
    small: 'gap-4',
    normal: 'gap-8',
    large: 'gap-12',
  }[gap || 'normal']

  // Column ratio classes
  const ratioClass = {
    '1:1': 'md:grid-cols-2',
    '2:1': 'md:grid-cols-[2fr_1fr]',
    '1:2': 'md:grid-cols-[1fr_2fr]',
    '3:1': 'md:grid-cols-[3fr_1fr]',
    '1:3': 'md:grid-cols-[1fr_3fr]',
  }[columnRatio || '1:1']

  // Vertical alignment classes
  const alignClass = {
    top: 'items-start',
    center: 'items-center',
    bottom: 'items-end',
  }[verticalAlign || 'top']

  return (
    <div className={`grid grid-cols-1 ${ratioClass} ${gapClass} ${alignClass} my-8`}>
      <div className="space-y-4">
        {leftColumn && <NestedLexicalRenderer content={leftColumn} />}
      </div>
      <div className="space-y-4">
        {rightColumn && <NestedLexicalRenderer content={rightColumn} />}
      </div>
    </div>
  )
}

/**
 * Icon List Block - renders icon + title + subtitle items
 */
function IconListBlock({ node }: { node: any }) {
  const items = node?.data?.items || []
  if (items.length === 0) return null

  return (
    <div className="flex justify-between items-start gap-2 py-4">
      {items.slice(0, 8).map((item: any, index: number) => (
        <div key={index} className="flex flex-col items-center text-center flex-1 min-w-0">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#e8e4d9] flex items-center justify-center mb-2">
            {item.icon && <IconifyIcon name={item.icon} size={24} color="#5d6b4a" />}
          </div>
          <p className="font-josefin-sans font-semibold text-xs md:text-sm text-[#3a3a3a] leading-tight whitespace-pre-line">
            {item.title}
          </p>
          {item.subtitle && (
            <p className="font-josefin-sans text-xs md:text-sm text-[#3a3a3a] leading-tight whitespace-pre-line">
              {item.subtitle}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * Custom JSX Converters for our Lexical nodes
 */
export const customConverters: JSXConverters = {
  // Blocks (custom features)
  blocks: {
    // Kebab-case naming (original)
    'image-gallery': ImageGalleryBlock,
    'single-image': SingleImageBlock,
    'video-embed': VideoEmbedBlock,
    'cta-button': CtaButtonBlock,
    'notice': NoticeBlock,
    'link-jump': LinkJumpBlock,
    'carousel': CarouselBlock,
    'hero': HeroBlock,
    'marquee-links': MarqueeLinksBlock,
    'twoColumns': TwoColumnsBlock,

    'icon-list': IconListBlock,

    // CamelCase naming (aliases)
    'custom-image-gallery': ImageGalleryBlock,
    'singleImage': SingleImageBlock,
    'videoEmbed': VideoEmbedBlock,
    'ctaButton': CtaButtonBlock,
    'linkJump': LinkJumpBlock,
    'marqueeLinks': MarqueeLinksBlock,
    'iconList': IconListBlock,
  },
}

/**
 * Main Lexical Renderer Component
 *
 * Uses Payload's official RichText component with our custom converters
 */
export function LexicalRenderer({ content, className = '' }: LexicalRendererProps) {
  // Merge default converters with our custom ones
  const converters: JSXConverters = {
    ...defaultJSXConverters,
    blocks: {
      ...defaultJSXConverters.blocks,
      ...customConverters.blocks,
    },
    // Also register as top-level node types (for DecoratorNodes)
    carousel: CarouselBlock,
    ctaButton: CtaButtonBlock,
    hero: HeroBlock,
    linkJump: LinkJumpBlock,
    marqueeLinks: MarqueeLinksBlock,
    notice: NoticeBlock,
    singleImage: SingleImageBlock,
    iconList: IconListBlock,
    'custom-image-gallery': ImageGalleryBlock,
    'image-gallery': ImageGalleryBlock,
    'icon-list': IconListBlock,
    videoEmbed: VideoEmbedBlock,
    'video-embed': VideoEmbedBlock,
    'cta-button': CtaButtonBlock,
    'link-jump': LinkJumpBlock,
    'marquee-links': MarqueeLinksBlock,
    'single-image': SingleImageBlock,
  }

  return (
    <div className={`lexical-content ${className}`}>
      <RichText data={content} converters={converters} />
    </div>
  )
}

/**
 * Nested Lexical Renderer
 *
 * Used for rendering nested rich text content (e.g., inside TwoColumnsBlock).
 * Includes all custom converters for proper block rendering.
 */
function NestedLexicalRenderer({ content }: { content: any }) {
  // Build full converters including all custom blocks
  const converters: JSXConverters = {
    ...defaultJSXConverters,
    blocks: {
      ...defaultJSXConverters.blocks,
      ...customConverters.blocks,
    },
    // Also register as top-level node types (for DecoratorNodes)
    carousel: CarouselBlock,
    ctaButton: CtaButtonBlock,
    hero: HeroBlock,
    linkJump: LinkJumpBlock,
    marqueeLinks: MarqueeLinksBlock,
    notice: NoticeBlock,
    singleImage: SingleImageBlock,
    iconList: IconListBlock,
    'custom-image-gallery': ImageGalleryBlock,
    'image-gallery': ImageGalleryBlock,
    'icon-list': IconListBlock,
    videoEmbed: VideoEmbedBlock,
    'video-embed': VideoEmbedBlock,
    'cta-button': CtaButtonBlock,
    'link-jump': LinkJumpBlock,
    'marquee-links': MarqueeLinksBlock,
    'single-image': SingleImageBlock,
  }

  return <RichText data={content} converters={converters} />
}
