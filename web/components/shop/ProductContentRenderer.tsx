"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import * as LucideIcons from 'lucide-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'

// Helper function to get Lucide icon component
function getLucideIcon(iconName: string) {
  const Icon = (LucideIcons as any)[iconName]
  return Icon || LucideIcons.ExternalLink
}

// Link Jump Component
function LinkJumpBlock({ props }: any) {
  const { iconType, lucideIconName, mediaIcon, title, linkText, linkUrl, openInNewTab } = props

  return (
    <Link
      href={linkUrl || '#'}
      target={openInNewTab ? '_blank' : undefined}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
      className="inline-flex items-center gap-3 py-4 group text-left"
    >
      {/* Icon - smaller and closer to text */}
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

      {/* Content - always left-aligned internally */}
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

// Marquee Links Component - Full viewport width, compact height with separators
function MarqueeLinksBlock({ props }: any) {
  const { speed, items } = props
  const [isPaused, setIsPaused] = React.useState(false)

  // Speed duration mapping
  const speedDuration = {
    slow: '30s',
    medium: '20s',
    fast: '10s',
  }[speed as 'slow' | 'medium' | 'fast'] || '20s'

  return (
    <div
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden bg-brand-secondary py-3"
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
        {/* Duplicate items for seamless loop */}
        {[...items, ...items].map((item: any, idx: number) => (
          <React.Fragment key={idx}>
            <Link
              href={item.linkUrl || '#'}
              target={item.openInNewTab ? '_blank' : undefined}
              rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
              className="flex items-center gap-3 px-4 py-2 hover:opacity-80 transition-opacity whitespace-nowrap flex-shrink-0"
            >
              {/* Icon */}
              {item.iconType === 'lucide' ? (
                <div className="text-brand-cream">
                  {React.createElement(getLucideIcon(item.lucideIconName), { size: 20 })}
                </div>
              ) : item.mediaIcon?.url ? (
                <div className="w-5 h-5 rounded overflow-hidden">
                  <Image
                    src={item.mediaIcon.url}
                    alt={item.linkText}
                    width={20}
                    height={20}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null}

              <span className="text-white font-medium">{item.linkText}</span>
            </Link>

            {/* Separator - stronger vertical line */}
            <div className="flex items-center">
              <div className="w-px h-6 bg-white/30 flex-shrink-0"></div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Add keyframes to global styles */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}

// Carousel Component - Full viewport width with gradient masks on sides, centered items
function CarouselBlock({ props }: any) {
  const { items } = props
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

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen py-8 pb-20">
      <div className="overflow-hidden">
        {/* Left gradient mask - LG+ only */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-brand-main to-transparent z-10 pointer-events-none"></div>

        {/* Right gradient mask - LG+ only */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-brand-main to-transparent z-10 pointer-events-none"></div>

        <Carousel
          setApi={setApi}
          opts={{
            align: 'center',
            loop: true,
            dragFree: false,
            watchDrag: true,
            axis: 'x',
          }}
          plugins={[WheelGesturesPlugin()]}
          className="w-full"
        >
          <CarouselContent className="-ml-6">
            {items.map((item: any, index: number) => (
              <CarouselItem key={index} className="pl-6 basis-auto">
                <div className="space-y-4">
                  {/* Image - Square with rounded corners, separate from text */}
                  {/* Mobile: 256x256, MD+: 488x488 */}
                  {(item.media?.variants?.large || item.media?.url) && (
                    <div className="relative w-64 h-64 md:w-[488px] md:h-[488px] rounded-2xl overflow-hidden">
                      <Image
                        src={item.media.variants?.large || item.media.url}
                        alt={item.title || ''}
                        width={488}
                        height={488}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}

                  {/* Text content below image - left aligned, no background box */}
                  <div className="space-y-3 max-w-[256px] md:max-w-[488px]">
                    {/* Title and description in same block, title is bold */}
                    {(item.title || item.text) && (
                      <div className="text-brand-text-main text-sm leading-relaxed">
                        {item.title && (
                          <span className="font-bold text-brand-text-black">
                            {item.title}
                          </span>
                        )}
                        {item.text && (
                          <span>
                            {item.title && ' '}
                            {item.text}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Button below text, left aligned */}
                    {item.showButton && item.buttonText && (
                      <div>
                        <Link
                          href={item.buttonLink || '#'}
                          target={item.buttonOpenInNewTab ? '_blank' : undefined}
                          rel={item.buttonOpenInNewTab ? 'noopener noreferrer' : undefined}
                          className="inline-block px-6 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary/90 transition-colors font-medium text-sm"
                        >
                          {item.buttonText}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Navigation buttons - positioned at bottom right corner, outside overflow container */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-20">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-[#756F3F] text-[#756F3F] transition-colors hover:bg-[#756F3F] hover:text-brand-text-inverse"
          onClick={() => api?.scrollPrev()}
          disabled={!canScrollPrev}
        >
          <ChevronLeft className="h-8 w-8" />
          <span className="sr-only">Previous slide</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-[#756F3F] text-[#756F3F] transition-colors hover:bg-[#756F3F] hover:text-brand-text-inverse"
          onClick={() => api?.scrollNext()}
          disabled={!canScrollNext}
        >
          <ChevronRight className="h-8 w-8" />
          <span className="sr-only">Next slide</span>
        </Button>
      </div>
    </div>
  )
}

// Layout Component
function LayoutBlock({ node }: any) {
  const { layout, children } = node

  // Map layout array to grid column fractions
  // e.g., [2, 1, 1] means 2fr 1fr 1fr (50% 25% 25%)
  const gridTemplateColumns = layout
    ? layout.map((fraction: number) => `${fraction}fr`).join(' ')
    : '1fr'

  // Determine alignment for each column based on the largest column position
  // Logic:
  // - Large column aligns to its position (left/center/right)
  // - Small columns align to opposite side
  // Examples:
  // [1,1] → [left, right]
  // [1,1,1] → [left, center, right]
  // [2,1,1] → [left, right, right] (large at left, small at right)
  // [1,1,2] → [left, left, right] (large at right, small at left)
  // [1,2,1] → [left, center, right] (large at center)
  const getColumnAlignment = (index: number, allFractions: number[]) => {
    const totalColumns = allFractions.length

    // Single column: always left
    if (totalColumns === 1) return 'text-left'

    // Two columns: left and right
    if (totalColumns === 2) {
      return index === 0 ? 'text-left' : 'text-right'
    }

    // Three or more columns
    const maxFraction = Math.max(...allFractions)

    // If all equal: first left, middle center, last right
    if (allFractions.every(f => f === allFractions[0])) {
      if (index === 0) return 'text-left'
      if (index === totalColumns - 1) return 'text-right'
      return 'text-center'
    }

    // Find where the largest column is
    const maxIndex = allFractions.indexOf(maxFraction)

    // Large column at first position: it's left, rest are right
    if (maxIndex === 0) {
      return index === 0 ? 'text-left' : 'text-right'
    }

    // Large column at last position: it's right, rest are left
    if (maxIndex === totalColumns - 1) {
      return index === totalColumns - 1 ? 'text-right' : 'text-left'
    }

    // Large column in middle: it's center, left columns left, right columns right
    if (index < maxIndex) return 'text-left'
    if (index === maxIndex) return 'text-center'
    return 'text-right'
  }

  const allFractions = layout || []
  const totalColumns = children.length

  return (
    <div
      className="grid gap-6"
      style={{ gridTemplateColumns }}
    >
      {children.map((layoutArea: any, index: number) => {
        const alignment = getColumnAlignment(index, allFractions)
        return (
          <div key={index} className={`space-y-4 ${alignment}`}>
            {layoutArea.children.map((child: any, childIdx: number) => (
              <ContentNode key={childIdx} node={child} />
            ))}
          </div>
        )
      })}
    </div>
  )
}

// Main Content Node Renderer
export function ContentNode({ node }: { node: any }) {
  // Paragraph
  if (node.type === 'paragraph') {
    return (
      <p className="text-brand-text-main text-sm md:text-base leading-relaxed">
        {node.children.map((child: any, childIdx: number) => {
          if (child.bold)
            return (
              <strong key={childIdx} className="font-semibold text-brand-text-black">
                {child.text}
              </strong>
            )
          if (child.italic) return <em key={childIdx}>{child.text}</em>
          return <span key={childIdx}>{child.text}</span>
        })}
      </p>
    )
  }

  // Heading
  if (node.type === 'heading') {
    const HeadingTag = `h${node.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    const headingClasses = {
      1: 'text-4xl md:text-5xl lg:text-6xl',
      2: 'text-3xl md:text-4xl lg:text-5xl',
      3: 'text-2xl md:text-3xl lg:text-4xl',
      4: 'text-xl md:text-2xl lg:text-3xl',
      5: 'text-lg md:text-xl lg:text-2xl',
      6: 'text-base md:text-lg lg:text-xl',
    }[node.level as 1 | 2 | 3 | 4 | 5 | 6] || 'text-xl'

    return (
      <HeadingTag className={`font-anaheim font-extrabold text-brand-text-black ${headingClasses}`}>
        {node.children.map((child: any, childIdx: number) => {
          if (child.bold) return <strong key={childIdx}>{child.text}</strong>
          if (child.italic) return <em key={childIdx}>{child.text}</em>
          return <span key={childIdx}>{child.text}</span>
        })}
      </HeadingTag>
    )
  }

  // Divider
  if (node.type === 'divider') {
    return <hr className="my-8 border-2 border-brand-accent-border" />
  }

  // Blockquote
  if (node.type === 'blockquote') {
    return (
      <blockquote className="border-l-4 border-brand-secondary pl-4 md:pl-6 italic text-brand-text-main bg-brand-cream/30 py-3 rounded-r">
        {node.children.map((child: any, childIdx: number) => {
          if (child.type === 'code') {
            return (
              <code
                key={childIdx}
                className="not-italic bg-brand-cream-dark px-2 py-1 rounded text-sm font-mono text-brand-text-black"
              >
                {child.children.map((c: any) => c.text).join('')}
              </code>
            )
          }
          return null
        })}
      </blockquote>
    )
  }

  // Component blocks (these should be full-width)
  if (node.type === 'component-block') {
    if (node.component === 'linkJump') {
      return <LinkJumpBlock props={node.props} />
    }
    if (node.component === 'marqueeLinks') {
      return <MarqueeLinksBlock props={node.props} />
    }
    if (node.component === 'carousel') {
      return <CarouselBlock props={node.props} />
    }
  }

  // Layout
  if (node.type === 'layout') {
    return <LayoutBlock node={node} />
  }

  return null
}

// Section Renderer - groups content nodes and determines if they should be in a container
export function renderSection(section: any): React.ReactNode {
  const nodes = section.content || []
  const result: React.ReactNode[] = []
  let containerContent: React.ReactNode[] = []
  let containerKey = 0

  const flushContainer = () => {
    if (containerContent.length > 0) {
      result.push(
        <div key={`container-${containerKey++}`} className="bg-white rounded-lg p-6 md:p-8 border-2 border-brand-accent-border">
          <div className="prose md:prose-lg max-w-none space-y-6">
            {containerContent}
          </div>
        </div>
      )
      containerContent = []
    }
  }

  nodes.forEach((node: any, index: number) => {
    // Skip empty paragraphs
    if (
      node.type === 'paragraph' &&
      node.children?.length === 1 &&
      node.children[0]?.text === ''
    ) {
      return
    }

    // Full-width components and layouts should break out of container
    if (
      (node.type === 'component-block' &&
        (node.component === 'marqueeLinks' || node.component === 'carousel')) ||
      node.type === 'layout'
    ) {
      flushContainer()
      result.push(
        <div key={`fullwidth-${index}`} className="w-full">
          <ContentNode node={node} />
        </div>
      )
    } else {
      // Regular content stays in container
      containerContent.push(<ContentNode key={index} node={node} />)
    }
  })

  flushContainer()

  return <>{result}</>
}
