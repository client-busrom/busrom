"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { motion, AnimatePresence } from "framer-motion"
import { HollowText } from "@/components/common/HollowText"
import useEmblaCarousel from "embla-carousel-react"
import AutoScroll from "embla-carousel-auto-scroll"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

interface BrandStoryItem {
  title: string
  image: MediaObject | null
  description?: string
}

interface MediaObject {
  url: string
  id: string
}

interface StoryBrandStorySectionProps {
  data: {
    title: string
    subtitle: string
    bgTextTop: string
    bgTextBottom: string
    items: {
      slides: BrandStoryItem[]
      autoplay: boolean
      interval: number
    }
    bgImage: string
  }
}

export function StoryBrandStorySection({ data }: StoryBrandStorySectionProps) {
  const [orderedSlides, setOrderedSlides] = useState<BrandStoryItem[]>(data.items.slides || [])
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Embla setup with Infinite Scroll
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

  const handleItemSwap = (clickedIdx: number) => {
    const ACTIVE_COL_IDX = 2
    if (clickedIdx === ACTIVE_COL_IDX) return
    
    setOrderedSlides(prev => {
      const newSlides = [...prev]
      const clickedContent = newSlides[clickedIdx]
      const activeContent = newSlides[ACTIVE_COL_IDX]
      
      newSlides[clickedIdx] = activeContent
      newSlides[ACTIVE_COL_IDX] = clickedContent
      return newSlides
    })
  }

  // Exact Distances from the Design Layout to ensure tight and overlapping gaps
  // Col Step is the distance from start of one column to start of the next
  const columns = useMemo(() => {
    const s = (idx: number) => orderedSlides[idx % orderedSlides.length]

    return [
      { id: 'col0', step: 602, items: [{ type: 'image', data: s(0), y: 182, w: 610, h: 610 }] },
      { id: 'col1', step: 340, items: [
          { type: 'image', data: s(1), y: 196, w: 291, h: 291 },
          { type: 'brand', text: data.subtitle, color: '#92c741', y: 501, w: 291, h: 291 }
        ] 
      },
      { id: 'col2-active', step: 548, items: [{ type: 'image', data: s(2), y: 137, w: 610, h: 610, isActive: true }] },
      { id: 'col3', step: 303, items: [
          { type: 'image', data: s(3), y: 501, w: 291, h: 291 },
          { type: 'brand', text: data.title, color: '#ffeb4b', y: 196, w: 291, h: 291 }
        ] 
      },
      { id: 'col4', step: 279, items: [
          { type: 'image', data: s(4), y: 189, w: 291, h: 291 },
          { type: 'image', data: s(5), y: 501, w: 291, h: 291 }
        ] 
      },
      { id: 'col5', step: 600, items: [{ type: 'image', data: s(6), y: 182, w: 610, h: 610 }] },
    ]
  }, [orderedSlides, data.subtitle, data.title])

  return (
    <section 
      className="relative w-full overflow-hidden"
      style={{ height: vw(922) }}
    >
      {/* 1. Background Masking */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage image={data.bgImage} alt="Brand Story Background" size="large" className="object-cover" />
        <div className="absolute inset-0 bg-[#464010]" style={{ opacity: 0.82 }} />
      </div>

      {/* 2. Hollow Typography Background */}
      <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden uppercase">
        <div 
          className="absolute font-josefin-sans font-bold leading-none select-none text-right"
          style={{ right: vw(-75), top: vw(54) }}
        >
          <HollowText strokeColor="#ffffff" strokeWidth={1.2} style={{ fontSize: vw(240), letterSpacing: "0.2em" }}>
            {data.bgTextTop}
          </HollowText>
        </div>
        <div 
          className="absolute font-josefin-sans font-bold leading-none select-none"
          style={{ left: vw(22), top: vw(649) }}
        >
          <HollowText strokeColor="#ffffff" strokeWidth={1.2} style={{ fontSize: vw(240), letterSpacing: "0.2em" }}>
            {data.bgTextBottom}
          </HollowText>
        </div>
      </div>

      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto">
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full items-start">
            {columns.map((col, idx) => (
              <div 
                key={`${col.id}-${idx}`}
                className="relative flex-shrink-0 h-full"
                style={{ width: vw(col.step) }} // Distance to NEXT column: achieves the overlapping/tight look of the design
              >
                {col.items.map((item: any, itemIdx) => (
                  <div
                    key={`${col.id}-item-${itemIdx}`}
                    className="absolute cursor-pointer shadow-2xl"
                    onClick={() => {
                      if (item.type === 'image') handleItemSwap(idx)
                    }}
                    style={{ 
                      top: vw(item.y),
                      width: vw(item.w),
                      height: vw(item.h),
                      borderRadius: "50%",
                      overflow: 'hidden',
                      zIndex: item.isActive ? 50 : 20,
                      backgroundColor: item.type === 'brand' ? item.color : 'transparent'
                    }}
                  >
                    {item.type === 'brand' ? (
                      <div className="w-full h-full flex items-center justify-center p-8">
                         <h3 className="font-josefin-sans font-bold text-black text-center" style={{ fontSize: vw(48) }}>
                           {item.text}
                         </h3>
                      </div>
                    ) : (
                      <>
                        <OptimizedImage image={item.data?.image} alt={item.data?.title} size="medium" className="object-cove w-full h-full" />
                        
                        <AnimatePresence>
                          {item.isActive && (
                            <motion.div 
                              className="absolute inset-0 flex flex-col items-center justify-center bg-black/70"
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            >
                              <div className="absolute inset-0 border-[5px] border-[#ffe830] rounded-full z-20 shadow-[0_4px_12.6px_#fff6aa]" />
                              <div className="relative z-30 px-[15%] text-center text-white">
                                <h4 className="font-josefin-sans font-bold mb-4" style={{ fontSize: vw(34) }}>
                                  {item.data?.title}
                                </h4>
                                <p className="font-josefin-sans font-normal opacity-90" style={{ fontSize: vw(18), lineHeight: 1.6 }}>
                                  {item.data?.description}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {!item.isActive && (
                          <div className="absolute inset-0 bg-black/20 hover:opacity-0 transition-opacity duration-300" />
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
