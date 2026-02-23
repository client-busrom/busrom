"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import useEmblaCarousel from "embla-carousel-react"
import AutoScroll from "embla-carousel-auto-scroll"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ApplicationItem {
  id: string
  title: string
  description?: string
  image: any
  link?: string
}

interface ApplicationsSectionProps {
  title?: string
  items: ApplicationItem[]
  locale: string
}

export function ApplicationsSection({ title, items, locale }: ApplicationsSectionProps) {
  // Figma Constants (1920px base)
  const DESIGN_WIDTH = 1920
  const SECTION_HEIGHT = 1083
  const ITEM_WIDTH = 373
  const ITEM_HEIGHT = 654
  const ITEM_GAP = 42 
  // Significantly increased vertical offset for a dramatic "High-Mid-Low" valley effect
  const MAX_Y_OFFSET = 300 

  // Layout vw helper (matching 0.7 scale design)
  const vw = (px: number) => `${(px * 0.7 / DESIGN_WIDTH) * 100}vw`

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      dragFree: true,
      containScroll: false,
    },
    [
      AutoScroll({
        speed: 1.2,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    ]
  )

  const applyParallax = useCallback(() => {
    if (!emblaApi) return
    
    const scrollProgress = emblaApi.scrollProgress()
    const snaps = emblaApi.scrollSnapList()
    const slideNodes = emblaApi.slideNodes()
    
    slideNodes.forEach((slide, index) => {
      let diffToTarget = scrollProgress - snaps[index]

      // Loop normalization
      if (diffToTarget > 0.5) diffToTarget -= 1
      if (diffToTarget < -0.5) diffToTarget += 1

      // distFromCenter 0 = Center (Low point), 1 = Edges (High point)
      // Multiplier increased to 3.2 to ensure it reaches 'High' plateau faster toward the edges
      const distFromCenter = Math.abs(diffToTarget * 3.2) 
      const clampedDist = Math.max(0, Math.min(1, distFromCenter))
      
      // Trajectory function: Sharp Parabolic
      // Offset = MAX_Y_OFFSET at 0, 0 at 1
      const yOffset = MAX_Y_OFFSET * (1 - Math.pow(clampedDist, 2))
      
      const card = slide.querySelector('.carousel-item-card') as HTMLElement
      if (card) {
        card.style.transform = `translateY(${yOffset}px)`
      }
    })
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on("scroll", applyParallax)
    emblaApi.on("reInit", applyParallax)
    window.addEventListener('resize', applyParallax)
    
    applyParallax()
    
    return () => {
      window.removeEventListener('resize', applyParallax)
    }
  }, [emblaApi, applyParallax])

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return
    emblaApi.plugins().autoScroll?.stop()
    emblaApi.scrollPrev()
    setTimeout(() => emblaApi.plugins().autoScroll?.play(), 2000)
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (!emblaApi) return
    emblaApi.plugins().autoScroll?.stop()
    emblaApi.scrollNext()
    setTimeout(() => emblaApi.plugins().autoScroll?.play(), 2000)
  }, [emblaApi])

  if (!items || items.length === 0) return null

  const displayItems = items.length < 8 ? [...items, ...items, ...items] : [...items, ...items]

  return (
    <section 
      className="relative w-full overflow-hidden bg-[#F6F4ED] flex flex-col items-center" 
      style={{ height: vw(SECTION_HEIGHT / 0.7) }}
    >
      <style jsx>{`
        .embla__viewport {
          overflow: visible;
          width: 100%;
        }
        .embla__container {
          display: flex;
          margin-right: -${vw(ITEM_GAP / 0.7)}; 
        }
        .embla__slide {
          flex: 0 0 auto;
          padding-right: ${vw(ITEM_GAP / 0.7)};
        }
        .carousel-item-card {
          transition: transform 0.05s linear; 
          will-change: transform;
        }
      `}</style>
      
      <div className="absolute inset-0 pointer-events-none z-0" style={{ transform: "scale(0.7)", transformOrigin: "top center" }}>
         <div className="absolute bg-[#ECE8D8] rounded-full" style={{ left: "567px", top: "127px", width: "101px", height: "101px" }} />
         <div className="absolute bg-[#ECE8D8] rounded-full" style={{ left: "1164px", top: "285px", width: "51px", height: "51px" }} />
         <div className="absolute bg-[#ECE8D8] rounded-full" style={{ left: "1190px", top: "65px", width: "81px", height: "81px" }} />
         <div className="absolute bg-[#ECE8D8] rounded-full" style={{ left: "778px", top: "0px", width: "29px", height: "29px" }} />
      </div>

      <div className="relative w-[1920px] h-[1083px] origin-top flex-shrink-0 z-10" style={{ transform: "scale(0.7)" }}>
        <div className="absolute inset-x-0 top-[75px] flex flex-col items-center">
          <div className="relative text-center select-none">
            {/* 1. Underlying Stroke Layer (Offset 4px) - Only the outline */}
            <h2 
              className="absolute inset-x-0 whitespace-pre-line text-[96px] font-extrabold leading-[106px] tracking-tight" 
              style={{ 
                fontFamily: "var(--font-anaheim)",
                color: "transparent",
                WebkitTextStroke: "4px #756F3F",
                transform: "translateY(4px)",
                zIndex: 0,
                top: 0
              }}
            >
              {title || "Application\nscenarios"}
            </h2>

            {/* 2. Middle Offset Fill Layer (Offset 4px) - Covers internal stroke */}
            <h2 
              className="absolute inset-x-0 whitespace-pre-line text-[96px] font-extrabold leading-[106px] tracking-tight" 
              style={{ 
                fontFamily: "var(--font-anaheim)",
                color: "#F6F4ED",
                transform: "translateY(4px)",
                zIndex: 1,
                top: 0
              }}
            >
              {title || "Application\nscenarios"}
            </h2>
            
            {/* 3. Foreground Main Layer (0 offset) - The primary text color */}
            <h2 
              className="relative whitespace-pre-line text-[96px] font-extrabold leading-[106px] tracking-tight" 
              style={{ 
                fontFamily: "var(--font-anaheim)",
                color: "#645C1F",
                zIndex: 2
              }}
            >
              {title || "Application\nscenarios"}
            </h2>
          </div>
        </div>

        {/* Carousel */}
        <div className="absolute inset-x-0 bottom-[116px] h-[800px] embla__viewport" ref={emblaRef}>
          <div className="embla__container">
             {displayItems.map((item, i) => (
                <div key={`${item.id}-${i}`} className="embla__slide">
                  <div 
                    className="carousel-item-card relative overflow-hidden group"
                    style={{ 
                      width: `${ITEM_WIDTH}px`, 
                      height: `${ITEM_HEIGHT}px`,
                      borderRadius: "30px",
                      boxShadow: "0px 16px 24px rgba(0, 0, 0, 0.12)"
                    }}
                  >
                     <OptimizedImage image={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" size="large" />
                     <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h3 className="text-white text-[24px] font-bold" style={{ fontFamily: "var(--font-anaheim)" }}>{item.title}</h3>
                        <p className="text-white/80 text-[16px] mt-2 line-clamp-2">{item.description}</p>
                     </div>
                  </div>
                </div>
             ))}
          </div>
        </div>

        <button onClick={scrollPrev} className="absolute left-[80px] top-[141px] w-[82px] h-[82px] rounded-full border-2 border-[#756f3f] flex items-center justify-center hover:bg-[#756f3f] hover:text-white transition-all z-50 bg-white/10 text-[#756f3f]">
          <ChevronLeft className="w-10 h-10" />
        </button>
        <button onClick={scrollNext} className="absolute right-[80px] top-[141px] w-[82px] h-[82px] rounded-full bg-[#756f3f] flex items-center justify-center hover:opacity-90 transition-all z-50 text-white shadow-xl">
          <ChevronRight className="w-10 h-10" />
        </button>
      </div>
    </section>
  )
}
