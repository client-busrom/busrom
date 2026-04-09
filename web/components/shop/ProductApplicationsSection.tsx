"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import useEmblaCarousel from "embla-carousel-react"
import AutoScroll from "embla-carousel-auto-scroll"

const DESIGN_WIDTH = 1920

const rpx = (designValue: number) => `calc(var(--rpx-applications) * ${designValue})`

interface MediaObject {
  id: string
  url: string
  alt?: string
  altText?: string
  variants?: Record<string, string>
  cropFocalPoint?: { x: number; y: number } | null
}

interface ApplicationItem {
  id: string
  title: string
  description?: string
  image: MediaObject | null
  link?: string
}

interface ProductApplicationsSectionProps {
  locale: string
  title?: string
  titleImage?: MediaObject | string
  applicationIds?: string[]
}

export function ProductApplicationsSection({
  locale,
  title = "Applicable Scenes",
  titleImage,
  applicationIds,
}: ProductApplicationsSectionProps) {
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [loading, setLoading] = useState(true)

  // Embla carousel for desktop - infinite loop + auto scroll + drag
  const [emblaRef, emblaApi] = useEmblaCarousel(
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
    const fetchApplications = async () => {
      try {
        if (applicationIds && applicationIds.length > 0) {
          const res = await fetch(`/api/applications?locale=${locale}&ids=${applicationIds.join(',')}`)
          if (res.ok) {
            const data = await res.json()
            const appMap = new Map<string, any>()
            data.docs?.forEach((app: any) => {
              appMap.set(String(app.id), app)
            })
            const items: ApplicationItem[] = applicationIds
              .map((id) => appMap.get(String(id)))
              .filter(Boolean)
              .map((app: any) => {
                const appImage = app.image || app.sceneGallery?.[0]?.images?.[0]
                return {
                  id: app.id,
                  title: app.name || app.slug,
                  description: app.shortDescription || "",
                  image: appImage || null,
                  link: `/${locale}/applications/${app.slug}`,
                }
              })
            setApplications(items)
          }
        } else {
          const res = await fetch(`/api/applications?locale=${locale}&limit=12`)
          if (res.ok) {
            const data = await res.json()
            const items: ApplicationItem[] = data.docs?.map((app: any) => {
              const appImage = app.image || app.sceneGallery?.[0]?.images?.[0]
              return {
                id: app.id,
                title: app.name || app.slug,
                description: app.shortDescription || "",
                image: appImage || null,
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
  }, [locale, applicationIds])

  // Get AutoScroll plugin instance
  const autoScrollPlugin = useMemo(() => {
    return emblaApi?.plugins()?.autoScroll
  }, [emblaApi])

  const lastActionTimeRef = React.useRef(0)
  const ACTION_THROTTLE = 250

  // Navigation
  const goToPrev = useCallback(() => {
    if (!emblaApi) return
    const now = Date.now()
    if (now - lastActionTimeRef.current < ACTION_THROTTLE) return
    lastActionTimeRef.current = now

    autoScrollPlugin?.stop()
    emblaApi.scrollPrev()
    setTimeout(() => autoScrollPlugin?.play(), 2000)
  }, [emblaApi, autoScrollPlugin])

  const goToNext = useCallback(() => {
    if (!emblaApi) return
    const now = Date.now()
    if (now - lastActionTimeRef.current < ACTION_THROTTLE) return
    lastActionTimeRef.current = now

    autoScrollPlugin?.stop()
    emblaApi.scrollNext()
    setTimeout(() => autoScrollPlugin?.play(), 2000)
  }, [emblaApi, autoScrollPlugin])

  return (
    <>
    {/* Mobile Layout */}
    <section
      className="md:hidden px-4 py-8"
      style={{ background: "linear-gradient(to bottom, #464040, #AC9D27)" }}
    >
      {/* Title */}
      <div className="mb-6">
        <img
          src={titleImage ? (typeof titleImage === 'string' ? titleImage : titleImage.url) : '/applications/applicable-scenes-title.svg'}
          alt={title || "Applicable Scenes"}
          className="h-16 object-contain object-left"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={goToPrev}
          className="w-12 h-12 rounded-full border border-white/50 flex items-center justify-center"
          aria-label="Previous slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={goToNext}
          className="w-12 h-12 rounded-full bg-white flex items-center justify-center"
          aria-label="Next slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 6L15 12L9 18" stroke="#5D5409" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Applications Grid - 2 columns */}
      <div className="grid grid-cols-2 gap-3">
        {applications.length > 0 ? (
          applications.slice(0, 6).map((app, index) => (
            <div
              key={`mobile-${app.id}-${index}`}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden"
            >
              {app.image ? (
                <OptimizedImage
                  image={app.image as any}
                  alt={app.title}
                  size="medium"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">{app.title}</span>
                </div>
              )}
              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <h3 className="font-anaheim font-bold text-white text-sm leading-tight">
                  {app.title}
                </h3>
              </div>
            </div>
          ))
        ) : loading ? (
          <>
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="aspect-[3/4] rounded-2xl bg-muted/30 animate-pulse"
              />
            ))}
          </>
        ) : null}
      </div>
    </section>

    {/* Desktop Layout - 所有元素缩小到80%，背景保持1920x922 */}
    <section
      className="relative w-full overflow-hidden hidden md:block"
      style={{
        ["--rpx-applications" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
        height: rpx(922),
        background: "linear-gradient(to bottom, #464040, #AC9D27)",
      }}
    >
      {/* Title - SVG image (缩小80%，左移100px) */}
      <div
        className="absolute z-20"
        style={{
          left: rpx(214),
          top: rpx(213),
          width: rpx(477),
          height: rpx(290),
        }}
      >
        <img
          src={titleImage ? (typeof titleImage === 'string' ? titleImage : titleImage.url) : '/applications/applicable-scenes-title.svg'}
          alt={title || "Applicable Scenes"}
          className="w-full h-full object-contain object-left"
        />
      </div>

      {/* Left Navigation Button (缩小80%，左移100px) */}
      <button
        onClick={goToPrev}
        className="absolute cursor-pointer z-10 group"
        style={{
          left: rpx(214),
          top: rpx(566),
          width: rpx(66),
          height: rpx(66),
        }}
        aria-label="Previous slide"
      >
        {/* Default state - white outline */}
        <svg width="83" height="82" viewBox="0 0 83 82" fill="none" className="w-full h-full absolute inset-0 transition-opacity duration-300 group-hover:opacity-0">
          <path d="M41.5 0.5C18.8506 0.5 0.5 18.6382 0.5 41C0.5 63.3618 18.8506 81.5 41.5 81.5C64.1494 81.5 82.5 63.3618 82.5 41C82.5 18.6382 64.1494 0.5 41.5 0.5Z" stroke="white"/>
          <path d="M50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z" fill="white"/>
        </svg>
        {/* Hover state - white filled */}
        <svg width="83" height="82" viewBox="0 0 83 82" fill="none" className="w-full h-full absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
          <circle cx="41.5" cy="41" r="41" fill="white"/>
          <path d="M50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z" fill="#5D5409"/>
        </svg>
      </button>

      {/* Right Navigation Button (缩小80%，左移100px) */}
      <button
        onClick={goToNext}
        className="absolute cursor-pointer z-10 group"
        style={{
          left: rpx(310),
          top: rpx(566),
          width: rpx(66),
          height: rpx(66),
        }}
        aria-label="Next slide"
      >
        {/* Default state - white outline */}
        <svg width="83" height="82" viewBox="0 0 83 82" fill="none" className="w-full h-full absolute inset-0 transition-opacity duration-300 group-hover:opacity-0" style={{ transform: 'rotate(180deg)' }}>
          <path d="M41.5 0.5C18.8506 0.5 0.5 18.6382 0.5 41C0.5 63.3618 18.8506 81.5 41.5 81.5C64.1494 81.5 82.5 63.3618 82.5 41C82.5 18.6382 64.1494 0.5 41.5 0.5Z" stroke="white"/>
          <path d="M50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z" fill="white"/>
        </svg>
        {/* Hover state - white filled */}
        <svg width="83" height="82" viewBox="0 0 83 82" fill="none" className="w-full h-full absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100" style={{ transform: 'rotate(180deg)' }}>
          <circle cx="41.5" cy="41" r="41" fill="white"/>
          <path d="M50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z" fill="#5D5409"/>
        </svg>
      </button>

      {/* Carousel (缩小80%，左移100px) */}
      <div
        className="absolute overflow-hidden"
        ref={emblaRef}
        style={{
          left: rpx(623),
          top: rpx(148),
          right: 0,
          height: rpx(620),
        }}
      >
        <div
          className="flex h-full"
          style={{ gap: rpx(30) }}
        >
          {applications.length > 0 ? (
            applications.map((app, index) => {
              const isLast = index === applications.length - 1
              return (
              <div
                key={`${app.id}-${index}`}
                className="relative flex-shrink-0 overflow-hidden group"
                style={{
                  width: rpx(350),
                  height: rpx(600),
                  borderRadius: rpx(24),
                  marginRight: isLast ? rpx(30) : undefined,
                }}
              >
                {app.image ? (
                  <OptimizedImage
                    image={app.image as any}
                    alt={app.title}
                    size="medium"
                    loading="eager"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">{app.title}</span>
                  </div>
                )}
                {/* Title overlay */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent"
                  style={{ padding: rpx(16) }}
                >
                  <h3
                    className="font-anaheim font-bold text-white leading-tight"
                    style={{ fontSize: rpx(16) }}
                  >
                    {app.title}
                  </h3>
                </div>
              </div>
            )})
          ) : loading ? (
            <>
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="flex-shrink-0 bg-muted animate-pulse"
                  style={{
                    width: rpx(271),
                    height: rpx(534),
                    borderRadius: rpx(24),
                  }}
                />
              ))}
            </>
          ) : null}
        </div>
      </div>
    </section>
    </>
  )
}
