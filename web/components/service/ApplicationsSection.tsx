"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import AutoScroll from "embla-carousel-auto-scroll"
import { AnimatedLinkButton } from "@/components/ui/animated-link-button"

const DESIGN_WIDTH = 1920

interface MediaObject {
  id: string
  url: string
  alt?: string
  variants?: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
    xlarge?: string
  }
  cropFocalPoint?: { x: number; y: number } | null
  width?: number
  height?: number
}

interface ApplicationItem {
  id: string
  title: string
  description?: string
  image: MediaObject | null
  link?: string
}

interface ApplicationsSectionProps {
  locale: string
  titleLine1?: string
  titleLine2?: string
  highlightText?: string
  applications?: ApplicationItem[]
  applicationIds?: string[] // Ordered list of application IDs from CMS
  viewMoreLink?: string
  viewMoreText?: string
}

// Design constants
const DESIGN_HEIGHT = 922

// Card configurations based on Figma layout - staggered heights
const CARD_STYLES = [
  { width: 812, height: 574, yOffset: 0 },    // Large card
  { width: 602, height: 574, yOffset: 124 },  // Medium card, offset down
  { width: 812, height: 574, yOffset: 0 },    // Large card
  { width: 602, height: 574, yOffset: 124 },  // Medium card, offset down
]

export function ApplicationsSection({
  locale,
  titleLine1 = "Busrom",
  titleLine2 = "For You",
  highlightText = "Cases",
  applications: initialApplications,
  applicationIds,
  viewMoreLink = "/applications",
  viewMoreText = "VIEW MORE",
}: ApplicationsSectionProps) {
  const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

  const [applications, setApplications] = useState<ApplicationItem[]>(initialApplications || [])
  const [loading, setLoading] = useState(!initialApplications)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mobileSelectedIndex, setMobileSelectedIndex] = useState(0)

  // Embla carousel for mobile - draggable
  const [mobileEmblaRef, mobileEmblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  })

  // Embla carousel for desktop - infinite loop + auto scroll + drag
  const [desktopEmblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      skipSnaps: false,
      dragFree: true,
      containScroll: false,
    },
    [
      AutoScroll({
        speed: 1,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    ]
  )

  // Fetch applications from API
  useEffect(() => {
    if (initialApplications && initialApplications.length > 0) return

    const fetchApplications = async () => {
      try {
        // If applicationIds provided, fetch specific applications in order
        if (applicationIds && applicationIds.length > 0) {
          const res = await fetch(`/api/applications?locale=${locale}&ids=${applicationIds.join(',')}`)
          if (res.ok) {
            const data = await res.json()
            // Create a map for quick lookup - use string keys for consistency
            const appMap = new Map<string, any>()
            data.docs?.forEach((app: any) => {
              appMap.set(String(app.id), app)
            })
            // Build items in the order specified by applicationIds
            const items: ApplicationItem[] = applicationIds
              .map((id) => appMap.get(String(id)))
              .filter(Boolean)
              .map((app: any) => {
                const firstScene = app.sceneGallery?.[0]
                const firstImage = firstScene?.images?.[0]
                return {
                  id: app.id,
                  title: app.name || app.slug,
                  description: app.shortDescription || "",
                  image: firstImage || null,
                  link: `/${locale}/applications/${app.slug}`,
                }
              })
            setApplications(items)
          }
        } else {
          // Fallback: fetch all applications
          const res = await fetch(`/api/applications?locale=${locale}&limit=12`)
          if (res.ok) {
            const data = await res.json()
            const items: ApplicationItem[] = data.docs?.map((app: any) => {
              const firstScene = app.sceneGallery?.[0]
              const firstImage = firstScene?.images?.[0]
              return {
                id: app.id,
                title: app.name || app.slug,
                description: app.shortDescription || "",
                image: firstImage || null,
                link: `/${locale}/applications/${app.slug}`,
              }
            }) || []
            setApplications(items)
          }
        }
      } catch (err) {
        console.error("Error fetching applications:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [locale, initialApplications, applicationIds])

  // Get AutoScroll plugin instance
  const autoScrollPlugin = useMemo(() => {
    return emblaApi?.plugins()?.autoScroll
  }, [emblaApi])

  // Track selected index for desktop
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  // Track selected index for mobile
  const onMobileSelect = useCallback(() => {
    if (!mobileEmblaApi) return
    setMobileSelectedIndex(mobileEmblaApi.selectedScrollSnap())
  }, [mobileEmblaApi])

  useEffect(() => {
    if (!mobileEmblaApi) return
    onMobileSelect()
    mobileEmblaApi.on("select", onMobileSelect)
    mobileEmblaApi.on("reInit", onMobileSelect)
    return () => {
      mobileEmblaApi.off("select", onMobileSelect)
      mobileEmblaApi.off("reInit", onMobileSelect)
    }
  }, [mobileEmblaApi, onMobileSelect])

  // Navigation - stop auto scroll on click, resume after delay
  const goToPrev = useCallback(() => {
    if (!emblaApi) return
    autoScrollPlugin?.stop()
    emblaApi.scrollPrev()
    setTimeout(() => autoScrollPlugin?.play(), 2000)
  }, [emblaApi, autoScrollPlugin])

  const goToNext = useCallback(() => {
    if (!emblaApi) return
    autoScrollPlugin?.stop()
    emblaApi.scrollNext()
    setTimeout(() => autoScrollPlugin?.play(), 2000)
  }, [emblaApi, autoScrollPlugin])

  // Get card style based on index
  const getCardStyle = (index: number) => {
    return CARD_STYLES[index % CARD_STYLES.length]
  }

  // Progress calculation
  const totalItems = applications.length
  const progressPercent = totalItems > 0 ? ((selectedIndex + 1) / totalItems) * 100 : 0
  const mobileProgressPercent = totalItems > 0 ? ((mobileSelectedIndex + 1) / totalItems) * 100 : 0

  return (
    <section
      className="relative w-full bg-background py-8 lg:py-0 mx-auto lg:overflow-visible"
      style={{
        marginTop: undefined,
        marginBottom: undefined,
      }}
    >
      {/* Desktop-specific wrapper styles */}
      <style jsx>{`
        @media (min-width: 1024px) {
          section {
            width: ${vw(1920)};
            height: ${vw(1022)};
            margin-top: ${vw(120)};
            margin-bottom: ${vw(120)};
          }
        }
      `}</style>
      {/* ==================== Mobile Layout ==================== */}
      <div className="lg:hidden px-6">
        {/* Title Area */}
        <div className="flex justify-between items-start mb-5">
          <div className="relative">
            {/* Large highlight text */}
            <span
              className="absolute left-[50px] -top-[4px] font-anaheim font-extrabold text-[40px] leading-[36px] z-0"
              style={{
                color: "#F6F4EF",
                WebkitTextStroke: "1.5px #756F3F",
                paintOrder: "stroke fill",
              }}
            >
              {highlightText}
            </span>
            {/* Main Title */}
            <h2 className="relative font-anaheim font-extrabold text-[24px] leading-[32px] text-foreground z-10">
              {titleLine1}
              <br />
              <span className="ml-[16px]">{titleLine2}</span>
            </h2>
          </div>
          {/* VIEW MORE Button */}
          <Link href={viewMoreLink} className="flex-shrink-0">
            <AnimatedLinkButton>
              {viewMoreText}
            </AnimatedLinkButton>
          </Link>
        </div>

        {/* Mobile Carousel */}
        <div className="overflow-hidden -mx-6" ref={mobileEmblaRef}>
          <div className="flex gap-3 px-6">
            {applications.length > 0 ? (
              applications.map((app, index) => (
                <div
                  key={`mobile-${app.id}-${index}`}
                  className="flex-shrink-0 w-[220px] h-[280px] rounded-[16px] overflow-hidden group relative"
                  style={{ boxShadow: "0px 16px 24px rgba(0, 0, 0, 0.12)" }}
                >
                  {app.image ? (
                    <OptimizedImage
                      image={app.image as any}
                      alt={app.title}
                      size="small"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">{app.title}</span>
                    </div>
                  )}
                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                    <h3 className="font-anaheim font-bold text-[14px] text-white leading-tight">
                      {app.title}
                    </h3>
                  </div>
                </div>
              ))
            ) : loading ? (
              <>
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-[220px] h-[280px] rounded-[16px] bg-muted animate-pulse"
                  />
                ))}
              </>
            ) : null}
          </div>
        </div>

        {/* Mobile Progress indicator */}
        {totalItems > 0 && (
          <div className="flex justify-center mt-3">
            <div
              className="w-[120px] h-[2px] rounded-full overflow-hidden"
              style={{ backgroundColor: "rgba(209, 209, 209, 0.52)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${mobileProgressPercent}%`,
                  backgroundColor: "rgba(63, 63, 63, 0.6)",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ==================== Desktop Layout ==================== */}
      <div className="hidden lg:block relative w-full h-full">
      {/* Title Area - overlapping text effect */}
      <div
        className="absolute z-10"
        style={{
          left: vw(195),
          top: 0,
        }}
      >
        {/* Large highlight text with stroke - positioned behind */}
        <span
          className="absolute font-anaheim font-extrabold"
          style={{
            left: vw(228),
            top: vw(19),
            fontSize: vw(150),
            lineHeight: vw(97),
            color: "#F6F4EF",
            WebkitTextStroke: `${vw(4)} #756F3F`,
            paintOrder: "stroke fill",
          }}
        >
          {highlightText}
        </span>

        {/* Main Title - two lines */}
        <h2
          className="relative font-anaheim font-extrabold text-foreground"
          style={{
            fontSize: vw(80),
            lineHeight: vw(113),
          }}
        >
          {titleLine1}
          <br />
          <span style={{ marginLeft: vw(80) }}>{titleLine2}</span>
        </h2>
      </div>

      {/* VIEW MORE Button */}
      <Link
        href={viewMoreLink}
        className="absolute z-10"
        style={{
          right: vw(195),
          top: vw(15),
        }}
      >
        <AnimatedLinkButton>
          {viewMoreText}
        </AnimatedLinkButton>
      </Link>

      {/* Embla Carousel */}
      <div
        className="absolute overflow-hidden"
        ref={desktopEmblaRef}
        style={{
          left: 0,
          right: 0,
          top: vw(224),
          height: vw(798), // 574 + 124 offset + 100 for shadow
          paddingBottom: vw(100),
        }}
      >
        <div
          className="flex h-full"
          style={{
            gap: vw(38),
            marginLeft: vw(-200), // Start with card partially visible on left
          }}
        >
          {applications.length > 0 ? (
            applications.map((app, index) => {
              const style = getCardStyle(index)
              const isLast = index === applications.length - 1
              return (
                <div
                  key={`${app.id}-${index}`}
                  className="relative flex-shrink-0 overflow-hidden group transition-shadow duration-300 hover:shadow-2xl"
                  style={{
                    width: vw(style.width),
                    height: vw(style.height),
                    marginTop: vw(style.yOffset),
                    marginRight: isLast ? vw(38) : undefined, // Add gap after last item for loop continuity
                    borderRadius: vw(30),
                    boxShadow: `0px ${vw(49)} ${vw(47.3)} rgba(0, 0, 0, 0.25)`,
                  }}
                >
                  {/* Card content - no link, just display */}
                  {app.image ? (
                    <OptimizedImage
                      image={app.image as any}
                      alt={app.title}
                      size="medium"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">{app.title}</span>
                    </div>
                  )}
                  {/* Title and description overlay */}
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent"
                    style={{ padding: vw(24) }}
                  >
                    <h3
                      className="font-anaheim font-bold text-white leading-tight"
                      style={{ fontSize: vw(24) }}
                    >
                      {app.title}
                    </h3>
                    {app.description && (
                      <p
                        className="font-anaheim text-white/80 line-clamp-2"
                        style={{
                          fontSize: vw(16),
                          marginTop: vw(8),
                        }}
                      >
                        {app.description}
                      </p>
                    )}
                  </div>
                </div>
              )
            })
          ) : loading ? (
            // Loading placeholders
            <>
              {[0, 1, 2, 3].map((index) => {
                const style = getCardStyle(index)
                return (
                  <div
                    key={index}
                    className="flex-shrink-0 overflow-hidden bg-muted animate-pulse"
                    style={{
                      width: vw(style.width),
                      height: vw(style.height),
                      marginTop: vw(style.yOffset),
                      borderRadius: vw(30),
                      boxShadow: `0px ${vw(49)} ${vw(47.3)} rgba(0, 0, 0, 0.25)`,
                    }}
                  />
                )
              })}
            </>
          ) : null}
        </div>
      </div>

      {/* Left Navigation Button */}
      <button
        onClick={goToPrev}
        className="absolute flex items-center justify-center transition-all cursor-pointer group z-10"
        style={{
          left: vw(132),
          top: vw(519),
          width: vw(134),
          height: vw(134),
          borderRadius: vw(67),
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          boxShadow: `0px ${vw(4)} ${vw(17.3)} rgba(0, 0, 0, 0.25)`,
        }}
        aria-label="Previous slide"
      >
        {/* Default state */}
        <svg
          className="transition-opacity duration-300 group-hover:opacity-0"
          style={{ width: vw(30), height: vw(52) }}
          viewBox="0 0 30 52"
          fill="none"
        >
          <path d="M27 49L5 26L27 3" stroke="#756F3F" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {/* Hover state */}
        <svg
          className="absolute transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          style={{ width: vw(30), height: vw(52) }}
          viewBox="0 0 30 52"
          fill="none"
        >
          <path d="M27 49L5 26L27 3" stroke="#464010" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Right Navigation Button */}
      <button
        onClick={goToNext}
        className="absolute flex items-center justify-center transition-all cursor-pointer group z-10"
        style={{
          left: vw(1630),
          top: vw(519),
          width: vw(134),
          height: vw(134),
          borderRadius: vw(67),
          backgroundColor: "#FFFBDC",
          boxShadow: `0px ${vw(4)} ${vw(21.3)} rgba(0, 0, 0, 0.25)`,
        }}
        aria-label="Next slide"
      >
        {/* Default state */}
        <svg
          className="transition-opacity duration-300 group-hover:opacity-0"
          style={{ width: vw(30), height: vw(52) }}
          viewBox="0 0 30 52"
          fill="none"
        >
          <path d="M3 3L25 26L3 49" stroke="#756F3F" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {/* Hover state */}
        <svg
          className="absolute transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          style={{ width: vw(30), height: vw(52) }}
          viewBox="0 0 30 52"
          fill="none"
        >
          <path d="M3 3L25 26L3 49" stroke="#464010" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Progress Bar */}
      {totalItems > 0 && (
        <div
          className="absolute overflow-hidden z-10"
          style={{
            right: vw(195),
            top: vw(100),
            width: vw(300),
            height: vw(4),
            borderRadius: vw(2),
            backgroundColor: "rgba(209, 209, 209, 0.52)",
          }}
        >
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{
              width: `${progressPercent}%`,
              borderRadius: vw(2),
              backgroundColor: "rgba(63, 63, 63, 0.6)",
            }}
          />
        </div>
      )}
      </div>
    </section>
  )
}
