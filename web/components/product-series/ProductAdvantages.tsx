"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { cn } from "@/lib/utils"
import type { ProductAdvantagesData } from "@/lib/content-parser"

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 922

interface ProductAdvantagesProps {
  data: ProductAdvantagesData
  className?: string
}

export function ProductAdvantages({ data, className }: ProductAdvantagesProps) {
  if (!data) return null

  const {
    advantagesTitle = '',
    advantagesImages = [],
    advantagesCategories = [],
  } = data

  const [currentCategory, setCurrentCategory] = React.useState(0)
  const [expandedCardIndex, setExpandedCardIndex] = React.useState(0)

  // Drag and Wheel Scroll Refs
  const listRef = React.useRef<HTMLDivElement>(null)
  const isDragging = React.useRef(false)
  const startY = React.useRef(0)
  const scrollTop = React.useRef(0)

  // Prevent Lenis page scroll bubbling to enable smooth internal mouse wheel scrolling
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation()
  }

  // Mouse Drag Scroll Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!listRef.current) return
    isDragging.current = true
    startY.current = e.pageY - listRef.current.offsetTop
    scrollTop.current = listRef.current.scrollTop
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !listRef.current) return
    e.preventDefault()
    const y = e.pageY - listRef.current.offsetTop
    const walk = (y - startY.current) * 2 // Double scroll speed
    listRef.current.scrollTop = scrollTop.current - walk
  }

  const handleMouseUpOrLeave = () => {
    isDragging.current = false
  }

  const currentCategoryData = advantagesCategories[currentCategory] || { title: '', cards: [] }
  const currentImage = advantagesImages[currentCategory] || ''

  const goToPrevCategory = () => {
    setCurrentCategory((prev) => (prev > 0 ? prev - 1 : advantagesCategories.length - 1))
    setExpandedCardIndex(0)
  }

  const goToNextCategory = () => {
    setCurrentCategory((prev) => (prev < advantagesCategories.length - 1 ? prev + 1 : 0))
    setExpandedCardIndex(0)
  }

  return (
    <div className={cn("w-full", className)}>
      {/* ===== DESKTOP LAYOUT (lg and above, pristine absolute positioning + scrollable right side) ===== */}
      <div className="hidden lg:block w-full">
        <section
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}
        >
          {/* Gradient Background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 227, 0, 0.3) 0%, rgba(255, 227, 0, 0) 100%)',
            }}
          />

          {/* Advantages Title (behind image) */}
          <motion.h3
            className="absolute font-josefin-sans font-bold text-[#464010]"
            style={{
              left: `${(153 / DESIGN_WIDTH) * 100}%`,
              top: `${(221 / DESIGN_HEIGHT) * 100}%`,
              width: `${(717 / DESIGN_WIDTH) * 100}%`,
              fontSize: `${(96 / DESIGN_WIDTH) * 100}vw`,
              lineHeight: `${101 / 96}`,
            }}
            initial={{ y: 0 }}
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            {advantagesTitle}
          </motion.h3>

          {/* Advantages Main Image (overlaps title) */}
          {currentImage && (
            <motion.div
              className="absolute overflow-hidden"
              style={{
                left: `${(468 / DESIGN_WIDTH) * 100}%`,
                top: `${(150 / DESIGN_HEIGHT) * 100}%`,
                width: `${(518 / DESIGN_WIDTH) * 100}vw`,
                height: `${(605 / DESIGN_WIDTH) * 100}vw`,
                borderRadius: `${(60 / DESIGN_WIDTH) * 100}vw`,
              }}
              initial={{ y: 0 }}
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <OptimizedImage image={currentImage} alt="" size="medium" className="absolute inset-0 w-full h-full object-cover" />
              {/* White title overlay on image */}
              <div
                className="absolute font-josefin-sans font-bold text-white"
                style={{
                  left: `${((153 - 468) / 518) * 100}%`,
                  top: `${((221 - 150) / 605) * 100}%`,
                  width: `${(717 / 518) * 100}%`,
                  fontSize: `${(96 / DESIGN_WIDTH) * 100}vw`,
                  lineHeight: `${101 / 96}`,
                }}
              >
                {advantagesTitle}
              </div>
            </motion.div>
          )}

          {/* Category Navigation Buttons (LEFT/RIGHT capsule style below image) */}
          {(() => {
            const NAV_BUTTON_LEFT_X = 153
            const NAV_BUTTON_LEFT_Y = 634
            const NAV_BUTTON_RIGHT_X = 360
            const NAV_BUTTON_RIGHT_Y = 564
            const NAV_BUTTON_WIDTH = 148
            const NAV_BUTTON_HEIGHT = 61

            return (
              <>
                <button
                  className="absolute cursor-pointer group"
                  style={{
                    left: `${(NAV_BUTTON_LEFT_X / DESIGN_WIDTH) * 100}%`,
                    top: `${(NAV_BUTTON_LEFT_Y / DESIGN_HEIGHT) * 100}%`,
                    width: `${(NAV_BUTTON_WIDTH / DESIGN_WIDTH) * 100}vw`,
                    height: `${(NAV_BUTTON_HEIGHT / DESIGN_WIDTH) * 100}vw`,
                  }}
                  onClick={goToPrevCategory}
                >
                  <svg
                    className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
                    viewBox="0 0 148 61"
                    fill="none"
                  >
                    <path d="M43.6943 28.2695H126.695V32.75:59H43.6943V37.2422L21.2627 30.5127L43.6943 23.7832V28.2695Z" fill="#BAB489"/>
                    <rect x="1" y="1" width="146" height="59" rx="29.5" stroke="#BAB489" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6"/>
                  </svg>
                  <svg
                    className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                    viewBox="0 0 146 58"
                    fill="none"
                  >
                    <path d="M29 0C12.9837 1.35295e-06 0 12.9837 0 29C0 45.0163 12.9837 58 29 58H117C133.016 58 146 45.0163 146 29C146 12.9837 133.016 1.77172e-07 117 0H29ZM42.422 27.2812H125.423V31.7676H42.422V36.2539L19.99 29.5244L42.422 22.7949V27.2812Z" fill="#F1DC35"/>
                  </svg>
                </button>

                <button
                  className="absolute cursor-pointer group"
                  style={{
                    left: `${(NAV_BUTTON_RIGHT_X / DESIGN_WIDTH) * 100}%`,
                    top: `${(NAV_BUTTON_RIGHT_Y / DESIGN_HEIGHT) * 100}%`,
                    width: `${(NAV_BUTTON_WIDTH / DESIGN_WIDTH) * 100}vw`,
                    height: `${(NAV_BUTTON_HEIGHT / DESIGN_WIDTH) * 100}vw`,
                  }}
                  onClick={goToNextCategory}
                >
                  <svg
                    className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
                    viewBox="0 0 148 61"
                    fill="none"
                  >
                    <path d="M104.306 28.2695H21.3047V32.7559H104.306V37.2422L126.737 30.5127L104.306 23.7832V28.2695Z" fill="#BAB489"/>
                    <rect x="1" y="1" width="146" height="59" rx="29.5" stroke="#BAB489" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6"/>
                  </svg>
                  <svg
                    className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                    viewBox="0 0 146 58"
                    fill="none"
                  >
                    <path d="M117 0C133.016 1.35295e-06 146 12.9837 146 29C146 45.0163 133.016 58 117 58H29C12.9837 58 0 45.0163 0 29C0 12.9837 12.9837 1.77172e-07 29 0H117ZM103.578 27.2812H20.5771V31.7676H103.578V36.2539L126.01 29.5244L103.578 22.7949V27.2812Z" fill="#F1DC35"/>
                  </svg>
                </button>
              </>
            )
          })()}

          {/* ===== Desktop Right Side Container (Category Title + Scrollable Cards List) ===== */}
          <div
            className="absolute flex flex-col"
            style={{
              left: `${(1076 / DESIGN_WIDTH) * 100}%`,
              top: `${(174 / DESIGN_HEIGHT) * 100}%`,
              width: `${(681 / DESIGN_WIDTH) * 100}vw`,
              height: `${(650 / DESIGN_HEIGHT) * 100}%`,
            }}
          >
            {/* Category Title (Elegant automatic wrapping) */}
            <h4
              className="font-jomhuria text-black font-bold break-words mb-6 animate-pulse-scale"
              style={{
                fontSize: `${(96 / DESIGN_WIDTH) * 100}vw`,
                lineHeight: 0.95,
              }}
            >
              {currentCategoryData.title}
            </h4>

            {/* Scrollable Cards List Container (Supports Wheel & Drag Scroll, absolutely hidden scrollbar to prevent transition flash) */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 scrollbar-none [&::-webkit-scrollbar]:hidden select-none cursor-grab active:cursor-grabbing"
              style={{
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
              }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            >
              {currentCategoryData.cards.map((card, index) => {
                const isExpanded = expandedCardIndex === index

                return (
                  <div
                    key={`desktop-card-${currentCategory}-${index}`}
                    className={cn(
                      "w-full cursor-pointer border-2 border-[#756F3F] transition-all duration-500 ease-out flex flex-col justify-center px-8 relative flex-shrink-0",
                      isExpanded ? "bg-[#F5EB99]" : "bg-transparent hover:bg-[#F5EB99]/30"
                    )}
                    style={{
                      minHeight: isExpanded ? `${(208 / DESIGN_WIDTH) * 100}vw` : `${(105 / DESIGN_WIDTH) * 100}vw`,
                      borderRadius: `${(38 / DESIGN_WIDTH) * 100}vw`,
                      paddingTop: `${(24 / DESIGN_WIDTH) * 100}vw`,
                      paddingBottom: `${(24 / DESIGN_WIDTH) * 100}vw`,
                    }}
                    onClick={() => setExpandedCardIndex(index)}
                  >
                    <div className="flex items-center justify-between gap-4 w-full">
                      <span
                        className="font-inter font-bold text-[#464010] flex-1 leading-snug"
                        style={{
                          fontSize: `${(28 / DESIGN_WIDTH) * 100}vw`,
                        }}
                      >
                        {card.title}
                      </span>
                      <div
                        className="transition-transform duration-300 flex-shrink-0 flex items-center justify-center"
                        style={{
                          transform: `rotate(${isExpanded ? '180deg' : '0deg'})`,
                          width: `${(52 / DESIGN_WIDTH) * 100}vw`,
                          height: `${(52 / DESIGN_WIDTH) * 100}vw`,
                        }}
                      >
                        <svg className="w-full h-full" viewBox="0 0 32 32" fill="none">
                          <path d="M32 16C32 7.16344 24.8366 3.13124e-07 16 6.99382e-07C7.16344 1.08564e-06 -1.08564e-06 7.16345 -6.99382e-07 16C-3.13124e-07 24.8366 7.16344 32 16 32C24.8366 32 32 24.8366 32 16ZM21.4863 19L16.2041 13.75L10.9229 19L10 18.1055L16.2041 11.8613L22.4082 18.1055L21.4863 19Z" fill="#756F3F"/>
                        </svg>
                      </div>
                    </div>

                    {isExpanded && card.content && (
                      <div
                        className="font-inter text-[#928E66] mt-4 border-t border-[#756F3F]/20 pt-4 leading-relaxed animate-fadeIn"
                        style={{
                          fontSize: `${(20 / DESIGN_WIDTH) * 100}vw`,
                        }}
                      >
                        {card.content}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ===== MOBILE LAYOUT (below lg, premium flowing flex layout) ===== */}
      <div className="block lg:hidden w-full relative overflow-hidden py-12 px-4" style={{ background: 'linear-gradient(180deg, rgba(255, 227, 0, 0.3) 0%, rgba(255, 227, 0, 0) 100%)' }}>
        {/* Mobile Main Title */}
        <h3 className="font-josefin-sans font-bold text-[#464010] text-center text-3xl sm:text-4xl mb-8">
          {advantagesTitle}
        </h3>

        {/* Mobile Main Image with Levitation */}
        {currentImage && (
          <motion.div
            className="relative w-full max-w-md mx-auto aspect-[5/6] rounded-3xl overflow-hidden shadow-2xl mb-10 border-4 border-white"
            initial={{ y: 0 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <OptimizedImage image={currentImage} alt="" size="medium" className="absolute inset-0 w-full h-full object-cover" />
          </motion.div>
        )}

        {/* Mobile Category Navigation Bar */}
        <div className="w-full max-w-xl mx-auto my-8 bg-[#FFFDE9] border-2 border-[#756F3F] rounded-[2rem] p-2 flex items-center justify-between gap-3 shadow-lg">
          <button
            className="w-12 h-12 rounded-full bg-[#BAB489] text-white flex items-center justify-center hover:bg-[#756F3F] active:scale-95 transition-all shadow-md flex-shrink-0"
            onClick={goToPrevCategory}
            aria-label="Previous Category"
          >
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>

          <h4 className="font-jomhuria text-4xl sm:text-5xl font-bold text-black px-2 py-1 select-none flex-1 text-center leading-none break-words">
            {currentCategoryData.title}
          </h4>

          <button
            className="w-12 h-12 rounded-full bg-[#BAB489] text-white flex items-center justify-center hover:bg-[#756F3F] active:scale-95 transition-all shadow-md flex-shrink-0"
            onClick={goToNextCategory}
            aria-label="Next Category"
          >
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>

        {/* Mobile Expandable Cards Accordion */}
        <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
          {currentCategoryData.cards.map((card, index) => {
            const isExpanded = expandedCardIndex === index

            return (
              <div
                key={`mobile-card-${currentCategory}-${index}`}
                className={cn(
                  "w-full cursor-pointer border-2 border-[#756F3F] rounded-3xl p-5 sm:p-6 transition-all duration-300 shadow-md",
                  isExpanded ? "bg-[#F5EB99]" : "bg-white/80 hover:bg-white"
                )}
                onClick={() => setExpandedCardIndex(index)}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-inter font-bold text-[#464010] text-lg sm:text-xl flex-1 leading-snug">
                    {card.title}
                  </span>
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full bg-[#756F3F] flex items-center justify-center text-white transition-transform duration-300 flex-shrink-0",
                      isExpanded ? "rotate-180" : "rotate-0"
                    )}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
                      <path d="M21.4863 19L16.2041 13.75L10.9229 19L10 18.1055L16.2041 11.8613L22.4082 18.1055L21.4863 19Z" fill="white"/>
                    </svg>
                  </div>
                </div>

                {isExpanded && card.content && (
                  <div className="mt-4 pt-4 border-t border-[#756F3F]/20 font-inter text-[#756F3F] text-sm sm:text-base leading-relaxed animate-fadeIn">
                    {card.content}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ProductAdvantages
