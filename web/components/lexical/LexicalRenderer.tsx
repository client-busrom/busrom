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
import * as LucideIcons from 'lucide-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { RichText, defaultJSXConverters } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical'
import type { JSXConverters } from '@payloadcms/richtext-lexical/react'

// Helper function to get Lucide icon component
function getLucideIcon(iconName: string) {
  const Icon = (LucideIcons as any)[iconName]
  return Icon || LucideIcons.ExternalLink
}

interface LexicalRendererProps {
  content: SerializedEditorState
  className?: string
}

/**
 * Block Component Definitions
 */

const ImageGalleryBlock = ({ node }: any) => {
  const { images, layout, spacing, lightbox } = node.data || node.fields || {}

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

  return (
    <div className={`my-6 ${isMasonry ? layoutClasses : `grid ${layoutClasses} ${spacingClasses}`}`}>
      {images.map((item: any, index: number) => {
        // Try different variant names: tablet, card, or fallback to main URL
        const imageUrl = item.image?.variants?.tablet?.url || item.image?.variants?.card?.url || item.image?.url
        if (!imageUrl) return null

        const imageElement = (
          <div
            key={index}
            className={`relative ${isMasonry ? 'mb-4 break-inside-avoid' : 'aspect-square'} rounded-lg overflow-hidden group ${lightbox ? 'cursor-pointer' : ''}`}
          >
            <Image
              src={imageUrl}
              alt={item.caption || item.image?.alt || `Gallery image ${index + 1}`}
              width={item.image?.width || 800}
              height={item.image?.height || 800}
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

        // TODO: Implement lightbox functionality if needed
        // For now, just render the image
        return imageElement
      })}
    </div>
  )
}

const SingleImageBlock = ({ node }: any) => {
  const { image, caption, alignment, size } = node.data || node.fields || {}
  // Try different variant names: desktop, tablet, card, or fallback to main URL
  const imageUrl = image?.variants?.desktop?.url || image?.variants?.tablet?.url || image?.variants?.card?.url || image?.url

  if (!imageUrl) return null

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

  return (
    <figure className={`my-6 ${alignmentClasses}`}>
      <div className={`relative w-full ${sizeClasses} rounded-lg overflow-hidden`}>
        <Image
          src={imageUrl}
          alt={caption || image?.alt || ''}
          width={image?.width || 1920}
          height={image?.height || 1080}
          className="w-full h-auto object-contain"
          unoptimized
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
        {iconType === 'lucide' ? (
          <div className="w-6 h-6 flex items-center justify-center text-brand-accent-gold">
            {React.createElement(getLucideIcon(lucideIconName), { size: 24 })}
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
              const imageUrl = slide.image?.variants?.desktop?.url || slide.image?.variants?.tablet?.url || slide.image?.url

              return (
                <CarouselItem key={index} className="pl-6 basis-auto">
                  <div className="space-y-4">
                    {imageUrl && (
                      <div className="relative w-64 h-64 md:w-[488px] md:h-[488px] rounded-2xl overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={slide.title || slide.description || ''}
                          width={488}
                          height={488}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
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
  // Try different variant names: desktop, tablet, or fallback to main URL
  const bgUrl = backgroundImage?.variants?.desktop?.url || backgroundImage?.variants?.tablet?.url || backgroundImage?.url

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
  const { speed, items } = node.data || node.fields || {}
  const [isPaused, setIsPaused] = React.useState(false)

  const speedDuration = {
    slow: '30s',
    medium: '20s',
    fast: '10s',
  }[speed as 'slow' | 'medium' | 'fast'] || '20s'

  if (!items || items.length === 0) return null

  return (
    <div
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden bg-brand-secondary py-3 my-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex gap-8"
        style={{
          animation: `marquee ${speedDuration} linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {[...items, ...items].map((item: any, idx: number) => (
          <React.Fragment key={idx}>
            <Link
              href={item.linkUrl || '#'}
              target={item.openInNewTab ? '_blank' : undefined}
              className="flex items-center gap-3 px-4 py-2 hover:opacity-80 transition-opacity whitespace-nowrap flex-shrink-0"
            >
              {item.iconType === 'lucide' ? (
                <div className="text-brand-cream">
                  {React.createElement(getLucideIcon(item.lucideIconName), { size: 20 })}
                </div>
              ) : item.mediaIcon?.url ? (
                <div className="w-5 h-5 rounded overflow-hidden">
                  <Image src={item.mediaIcon.url} alt={item.linkText} width={20} height={20} className="w-full h-full object-cover" />
                </div>
              ) : null}
              <span className="text-white font-medium">{item.linkText}</span>
            </Link>
            <div className="flex items-center">
              <div className="w-px h-6 bg-white/30 flex-shrink-0"></div>
            </div>
          </React.Fragment>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

/**
 * Two Columns Block
 */
const TwoColumnsBlock = ({ node }: any) => {
  const { leftColumn, rightColumn, gap } = node.data || node.fields || {}

  const gapClass = {
    small: 'gap-4',
    normal: 'gap-8',
    large: 'gap-12',
  }[gap || 'normal']

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${gapClass} my-8`}>
      <div className="space-y-4">
        {leftColumn && <RichText data={leftColumn} converters={defaultJSXConverters} />}
      </div>
      <div className="space-y-4">
        {rightColumn && <RichText data={rightColumn} converters={defaultJSXConverters} />}
      </div>
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

    // CamelCase naming (aliases)
    'custom-image-gallery': ImageGalleryBlock,
    'singleImage': SingleImageBlock,
    'videoEmbed': VideoEmbedBlock,
    'ctaButton': CtaButtonBlock,
    'linkJump': LinkJumpBlock,
    'marqueeLinks': MarqueeLinksBlock,
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
    'custom-image-gallery': ImageGalleryBlock,
    'image-gallery': ImageGalleryBlock,
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
