"use client"

import * as React from "react"
// Using native img instead of next/image to avoid CDN caching issues
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import AutoScroll from "embla-carousel-auto-scroll"
import { cn } from "@/lib/utils"
import type { MoreSeriesData, MoreSeriesItem } from "@/lib/content-parser"

/**
 * More Series Section
 *
 * Based on Figma design:
 * - Title "More series" centered at top
 * - Carousel of cards that can be scrolled
 * - Cards scale up on hover
 * - Navigation buttons and progress bar at bottom
 */

// Design constants
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 784
const CARD_WIDTH = 391
const CARD_HEIGHT = 360
const CARD_GAP = 35

// Image position - adjust top value to move image down (e.g., '20%' = start 20% from top)
const CARD_IMAGE_TOP = '25%'
// Image size - width/height as percentage of card (e.g., '80%' = 80% of card size)
const CARD_IMAGE_SIZE = '75%'

interface MoreSeriesProps {
  data: MoreSeriesData
  currentSlug?: string  // Current product series slug to exclude
  className?: string
}

export function MoreSeries({ data, currentSlug, className }: MoreSeriesProps) {
  if (!data) return null

  const { title = 'More series', series: dataSeries = [] } = data

  // Filter out current series from the list
  const series = React.useMemo(() => {
    return (dataSeries || []).filter(item => item.slug !== currentSlug)
  }, [dataSeries, currentSlug])

  // Embla carousel with auto-scroll
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

  const [selectedIndex, setSelectedIndex] = React.useState(0)

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  React.useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  const goToPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const goToNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  // Progress calculation
  const progressPercent = series.length > 0
    ? ((selectedIndex + 1) / series.length) * 100
    : 0

  if (!series || series.length === 0) {
    return null
  }

  // Size calculations in vw
  const cardWidthVw = (CARD_WIDTH / DESIGN_WIDTH) * 100
  const cardHeightVw = (CARD_HEIGHT / DESIGN_WIDTH) * 100
  const cardGapVw = (CARD_GAP / DESIGN_WIDTH) * 100

  return (
    <section
      className={cn("relative w-full overflow-hidden bg-[#F6F4ED]", className)}
      style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}
    >
      {/* Title - "More series" */}
      <h2
        className="absolute font-josefin-sans font-bold text-center"
        style={{
          left: `${(602 / DESIGN_WIDTH) * 100}%`,
          top: `${(40 / DESIGN_WIDTH) * 100}vw`,
          width: `${(717 / DESIGN_WIDTH) * 100}%`,
          fontSize: `${(96 / DESIGN_WIDTH) * 100}vw`,
          lineHeight: `${(101 / DESIGN_WIDTH) * 100}vw`,
          color: "#46401F",
        }}
      >
        {title || "More series"}
      </h2>

      {/* Embla Viewport */}
      <div
        className="absolute overflow-x-clip overflow-y-visible"
        ref={emblaRef}
        style={{
          left: `${(100 / DESIGN_WIDTH) * 100}%`,
          right: `${(100 / DESIGN_WIDTH) * 100}%`,
          top: `${(160 / DESIGN_WIDTH) * 100}vw`,
          height: `${((CARD_HEIGHT + 120) / DESIGN_WIDTH) * 100}vw`,
        }}
      >
        {/* Embla Container */}
        <div
          className="flex h-full items-start"
          style={{
            gap: `${cardGapVw}vw`,
            paddingTop: `${(20 / DESIGN_WIDTH) * 100}vw`,
          }}
        >
          {series.map((item, index) => {
            const isLast = index === series.length - 1

            return (
              <div
                key={`slide-${index}`}
                className="relative flex-shrink-0"
                style={{
                  width: `${cardWidthVw}vw`,
                  height: `${cardHeightVw}vw`,
                  marginRight: isLast ? `${cardGapVw}vw` : undefined,
                }}
              >
                <Link
                  href={item.link || "#"}
                  className="block w-full h-full group"
                >
                  {/* Card background with special shape */}
                  <div
                    className="absolute inset-0 transition-all duration-300 group-hover:scale-110"
                    style={{
                      transformOrigin: "center center",
                    }}
                  >
                  {/* Shadow layer */}
                  <div
                    className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"
                    style={{
                      filter: "drop-shadow(0 15px 25px rgba(0, 0, 0, 0.3))",
                    }}
                  >
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 391 361"
                      preserveAspectRatio="none"
                    >
                      <path d="M300.447 0C318.599 0.000263884 333.314 14.7153 333.314 32.8672V37.1211C333.315 52.9239 346.125 65.7342 361.928 65.7344C377.731 65.7344 390.542 78.5456 390.542 94.3486V320.382C390.542 342.473 372.633 360.382 350.542 360.382H40C17.9087 360.382 0.000214435 342.473 0 320.382V40C0 17.9086 17.9086 0 40 0H300.447Z" fill="white"/>
                    </svg>
                  </div>
                    {/* SVG clip path for card shape */}
                    <svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 391 361"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <clipPath id={`card-clip-${index}`}>
                          <path d="M300.447 0C318.599 0.000263884 333.314 14.7153 333.314 32.8672V37.1211C333.315 52.9239 346.125 65.7342 361.928 65.7344C377.731 65.7344 390.542 78.5456 390.542 94.3486V320.382C390.542 342.473 372.633 360.382 350.542 360.382H40C17.9087 360.382 0.000214435 342.473 0 320.382V40C0 17.9086 17.9086 0 40 0H300.447Z" />
                        </clipPath>
                      </defs>
                      <path d="M300.447 0C318.599 0.000263884 333.314 14.7153 333.314 32.8672V37.1211C333.315 52.9239 346.125 65.7342 361.928 65.7344C377.731 65.7344 390.542 78.5456 390.542 94.3486V320.382C390.542 342.473 372.633 360.382 350.542 360.382H40C17.9087 360.382 0.000214435 342.473 0 320.382V40C0 17.9086 17.9086 0 40 0H300.447Z" fill="white"/>
                    </svg>

                    {/* Image with clip path */}
                    {item.image && (
                      <div
                        className="absolute flex items-center justify-center"
                        style={{
                          clipPath: `url(#card-clip-${index})`,
                          top: CARD_IMAGE_TOP,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: CARD_IMAGE_SIZE,
                          height: CARD_IMAGE_SIZE,
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      </div>
                    )}

                    {/* Card title */}
                    <span
                      className="absolute font-anaheim font-bold group-hover:font-extrabold text-black transition-all duration-300"
                      style={{
                        left: `${(44 / DESIGN_WIDTH) * 100}vw`,
                        top: `${(31 / DESIGN_WIDTH) * 100}vw`,
                        fontSize: `${(32 / DESIGN_WIDTH) * 100}vw`,
                        lineHeight: `${(54 / DESIGN_WIDTH) * 100}vw`,
                        maxWidth: `${(260 / DESIGN_WIDTH) * 100}vw`,
                      }}
                    >
                      {item.name}
                    </span>

                    {/* Arrow button - white circle with arrow, positioned in the corner notch */}
                    <div
                      className="absolute"
                      style={{
                        right: `${(0 / DESIGN_WIDTH) * 100}vw`,
                        top: `${(0 / DESIGN_WIDTH) * 100}vw`,
                        width: `${(50 / DESIGN_WIDTH) * 100}vw`,
                        height: `${(50 / DESIGN_WIDTH) * 100}vw`,
                      }}
                    >
                      {/* Default state - white circle with arrow */}
                      <svg
                        className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
                        viewBox="0 0 50 50"
                        fill="none"
                      >
                        <circle cx="24.7472" cy="24.7472" r="24.7472" fill="white"/>
                        <path d="M32.2538 14.6234L32.2388 14.6121C32.0365 14.465 31.7941 14.3832 31.5441 14.3776L31.5295 14.3774L31.5336 14.3777C31.4378 14.3709 31.3417 14.3735 31.2465 14.3854L31.2195 14.389L18.9035 16.1492C18.097 16.2645 17.5373 17.0117 17.6536 17.8181L17.6573 17.8422C17.7848 18.6355 18.5257 19.1833 19.3241 19.0692L28.3515 17.7789L16.4249 33.7031C16.0176 34.247 16.1288 35.0184 16.6732 35.4261L16.8112 35.5295C17.3547 35.9227 18.1149 35.8093 18.5181 35.2709L30.4447 19.3466L31.7458 28.3725C31.862 29.1788 32.6098 29.7389 33.4163 29.6237C34.2228 29.5084 34.7824 28.7612 34.6662 27.9549L32.891 15.6399L32.887 15.6141C32.873 15.528 32.8515 15.4433 32.8226 15.361L32.8151 15.3402L32.8163 15.3442C32.7406 15.0924 32.586 14.8716 32.3753 14.7143L32.2538 14.6234Z" fill="#5E571F"/>
                      </svg>
                      {/* Hover state - filled circle with arrow */}
                      <svg
                        className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                        viewBox="0 0 98 98"
                        fill="none"
                      >
                        <path d="M27.0495 14.2666C46.0711 2.30507 71.188 8.02844 83.1496 27.05C95.111 46.0716 89.3877 71.1886 70.3661 83.1501C51.3445 95.1113 26.2275 89.388 14.266 70.3666C2.3046 51.3451 8.02815 26.2282 27.0495 14.2666ZM60.5021 37.4031L60.4667 37.4001L44.5571 36.0914C43.5152 36.0057 42.6014 36.781 42.5169 37.823L42.5149 37.8536C42.4484 38.8823 43.2191 39.7795 44.2502 39.8646L55.9126 40.8234L36.4516 57.3462C35.7871 57.9105 35.7061 58.9074 36.2708 59.5726L36.4146 59.7416C36.9823 60.3881 37.9652 60.4625 38.6231 59.9043L58.0841 43.3815L57.1391 55.0451C57.0548 56.0868 57.8307 57.001 58.8724 57.0867C59.9142 57.1724 60.8271 56.3968 60.9116 55.3549L62.2019 39.4421L62.2036 39.4084C62.2106 39.2967 62.2085 39.1843 62.1959 39.0731L62.193 39.0504C62.17 38.7138 62.0391 38.3931 61.8204 38.1362L61.6948 37.9884L61.6791 37.9698C61.4679 37.7281 61.1878 37.5567 60.8766 37.4784L60.8632 37.4754C60.7455 37.4397 60.6245 37.4154 60.5021 37.4031Z" fill="#564E16"/>
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* Left Navigation Button */}
      <button
        className="absolute cursor-pointer group z-10"
        style={{
          left: `${(508 / DESIGN_WIDTH) * 100}%`,
          top: `${(620 / DESIGN_WIDTH) * 100}vw`,
          width: `${(85 / DESIGN_WIDTH) * 100}vw`,
          height: `${(85 / DESIGN_WIDTH) * 100}vw`,
        }}
        onClick={goToPrev}
        aria-label="Previous"
      >
        {/* White circle with arrow, flipped for left direction */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 85 85"
          fill="none"
          style={{ transform: "scaleX(-1)" }}
        >
          <circle cx="42.1816" cy="42.1816" r="37.8399" transform="rotate(6.07406 42.1816 42.1816)" stroke="white"/>
          <path d="M58.047 41.8215L58.0462 41.7988C58.0309 41.4968 57.9237 41.2067 57.739 40.9672L57.7281 40.9533L57.7309 40.9573C57.6645 40.8621 57.5891 40.7737 57.5056 40.6931L57.4817 40.6705L46.4688 30.4222C45.7476 29.7511 44.6195 29.7923 43.9493 30.5143L43.9294 30.5361C43.2801 31.2588 43.3277 32.372 44.0415 33.0363L52.1138 40.548L28.0729 41.4272C27.2519 41.4572 26.6107 42.1479 26.6407 42.9697L26.6484 43.1781C26.6913 43.9881 27.3756 44.617 28.1885 44.5873L52.2294 43.7082L44.7273 51.7895C44.0571 52.5114 44.0984 53.6404 44.8195 54.3114C45.5406 54.9826 46.6687 54.9413 47.339 54.2194L57.5748 43.1932L57.5961 43.1699C57.6665 43.0913 57.7297 43.0067 57.7852 42.917L57.7991 42.8941L57.7963 42.8983C57.9756 42.6358 58.0658 42.3226 58.0538 42.0049L58.047 41.8215Z" fill="white"/>
        </svg>
      </button>

      {/* Right Navigation Button */}
      <button
        className="absolute cursor-pointer group z-10"
        style={{
          left: `${(1338 / DESIGN_WIDTH) * 100}%`,
          top: `${(620 / DESIGN_WIDTH) * 100}vw`,
          width: `${(85 / DESIGN_WIDTH) * 100}vw`,
          height: `${(85 / DESIGN_WIDTH) * 100}vw`,
        }}
        onClick={goToNext}
        aria-label="Next"
      >
        {/* White circle with arrow */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 85 85"
          fill="none"
        >
          <circle cx="42.1816" cy="42.1816" r="37.8399" transform="rotate(6.07406 42.1816 42.1816)" stroke="white"/>
          <path d="M58.047 41.8215L58.0462 41.7988C58.0309 41.4968 57.9237 41.2067 57.739 40.9672L57.7281 40.9533L57.7309 40.9573C57.6645 40.8621 57.5891 40.7737 57.5056 40.6931L57.4817 40.6705L46.4688 30.4222C45.7476 29.7511 44.6195 29.7923 43.9493 30.5143L43.9294 30.5361C43.2801 31.2588 43.3277 32.372 44.0415 33.0363L52.1138 40.548L28.0729 41.4272C27.2519 41.4572 26.6107 42.1479 26.6407 42.9697L26.6484 43.1781C26.6913 43.9881 27.3756 44.617 28.1885 44.5873L52.2294 43.7082L44.7273 51.7895C44.0571 52.5114 44.0984 53.6404 44.8195 54.3114C45.5406 54.9826 46.6687 54.9413 47.339 54.2194L57.5748 43.1932L57.5961 43.1699C57.6665 43.0913 57.7297 43.0067 57.7852 42.917L57.7991 42.8941L57.7963 42.8983C57.9756 42.6358 58.0658 42.3226 58.0538 42.0049L58.047 41.8215Z" fill="white"/>
        </svg>
      </button>

      {/* Progress Bar */}
      <div
        className="absolute rounded-full overflow-hidden"
        style={{
          left: `${(630 / DESIGN_WIDTH) * 100}%`,
          top: `${(660 / DESIGN_WIDTH) * 100}vw`,
          width: `${(669 / DESIGN_WIDTH) * 100}vw`,
          height: `${(6 / DESIGN_WIDTH) * 100}vw`,
          backgroundColor: "rgba(209, 209, 209, 0.52)",
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: "#3F3F3F",
          }}
        />
      </div>
    </section>
  )
}

export default MoreSeries
