"use client"

import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { cn } from "@/lib/utils"
import type { ProductTechSpecsData } from "@/lib/content-parser"

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 922

interface ProductTechSpecsProps {
  data: ProductTechSpecsData
  className?: string
}

export function ProductTechSpecs({ data, className }: ProductTechSpecsProps) {
  if (!data) return null

  const {
    title = '',
    titleImages = [],
    techSpecImages = [],
    techSpecTitle = '',
    techSpecItems = [],
  } = data

  // State for tech spec image swap (0 = first image big, 1 = second image big)
  const [techSpecMainIndex, setTechSpecMainIndex] = React.useState(0)

  // Embla carousel setup with native spring physics and strict boundaries (Horizontal Gallery)
  const [emblaRef] = useEmblaCarousel(
    {
      dragFree: true,
      containScroll: 'trimSnaps',
      watchResize: true,
      watchSlides: true,
    },
    [WheelGesturesPlugin()]
  )

  // Custom Drag-to-Scroll setup for vertical tech specs list (Flawless scroll & drag, zero rebound bugs)
  const specsScrollRef = React.useRef<HTMLDivElement>(null)
  const [isSpecsDragging, setIsSpecsDragging] = React.useState(false)
  const specsStartYRef = React.useRef(0)
  const specsScrollTopRef = React.useRef(0)

  const handleSpecsMouseDown = (e: React.MouseEvent) => {
    if (!specsScrollRef.current) return
    setIsSpecsDragging(true)
    specsStartYRef.current = e.clientY
    specsScrollTopRef.current = specsScrollRef.current.scrollTop
  }

  const handleSpecsMouseMove = (e: React.MouseEvent) => {
    if (!isSpecsDragging || !specsScrollRef.current) return
    e.preventDefault()
    const deltaY = e.clientY - specsStartYRef.current
    specsScrollRef.current.scrollTop = specsScrollTopRef.current - deltaY
  }

  const handleSpecsMouseUp = () => {
    setIsSpecsDragging(false)
  }

  const swapTechSpecImages = () => {
    setTechSpecMainIndex((prev) => (prev === 0 ? 1 : 0))
  }

  const titleLines = title.split(/\/n|\\n|\n/).map(line => line.trim()).filter(Boolean)

  return (
    <div className={cn("w-full", className)}>
      {/* ===== DESKTOP LAYOUT (lg and above, 100% pristine absolute positioning) ===== */}
      <div className="hidden lg:block w-full">
        <section
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}
        >
          {/* Gradient Background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #756F3F 0%, rgba(255, 227, 0, 0.3) 100%)',
            }}
          />

          {/* Embla Carousel Wrapper (Masked to match Tech Spec Area width 1100px) */}
          <div
            className="absolute overflow-hidden cursor-grab active:cursor-grabbing"
            ref={emblaRef}
            style={{
              right: 0,
              top: `${(80 / DESIGN_HEIGHT) * 100}%`,
              width: `${(1100 / DESIGN_WIDTH) * 100}vw`,
              height: `${(280 / DESIGN_WIDTH) * 100}vw`,
              zIndex: 1,
            }}
          >
            <div 
              className="flex select-none h-full"
              style={{ gap: `${(16 / DESIGN_WIDTH) * 100}vw` }}
            >
              {titleImages.map((img, index) => (
                <div
                  key={`title-img-${index}`}
                  className="relative flex-[0_0_auto] overflow-hidden bg-white pointer-events-none"
                  style={{
                    width: `${(440 / DESIGN_WIDTH) * 100}vw`,
                    height: `${(280 / DESIGN_WIDTH) * 100}vw`,
                    borderRadius: `${(20 / DESIGN_WIDTH) * 100}vw`,
                  }}
                >
                  <OptimizedImage image={img} alt="" size="medium" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Main Title (above images) */}
          <h2
            className="absolute font-anaheim font-extrabold gradient-text-shine-white select-none"
            style={{
              left: `${(153 / DESIGN_WIDTH) * 100}%`,
              top: `${(100 / DESIGN_HEIGHT) * 100}%`,
              width: `${(700 / DESIGN_WIDTH) * 100}%`,
              fontSize: `${(86 / DESIGN_WIDTH) * 100}vw`,
              lineHeight: `${80 / 86}`,
              zIndex: 2,
            }}
          >
            {titleLines.map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < titleLines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </h2>

          {/* ===== TECH SPEC AREA ===== */}
          <div
            className="absolute flex justify-start"
            style={{
              right: 0,
              top: `${(400 / DESIGN_HEIGHT) * 100}%`,
              width: `${(1100 / DESIGN_WIDTH) * 100}vw`,
              minHeight: `${(480 / DESIGN_WIDTH) * 100}vw`,
              backgroundColor: '#FFFDE9',
              borderTopLeftRadius: `${(20 / DESIGN_WIDTH) * 100}vw`,
              borderBottomLeftRadius: `${(20 / DESIGN_WIDTH) * 100}vw`,
            }}
          >
            <div
              className="flex flex-col"
              style={{
                width: `${(1000 / DESIGN_WIDTH) * 100}vw`,
                padding: `${(30 / DESIGN_WIDTH) * 100}vw ${(50 / DESIGN_WIDTH) * 100}vw`,
              }}
            >
              <h3
                className="font-lilita-one gradient-text-shine-olive"
                style={{
                  fontSize: `${(48 / DESIGN_WIDTH) * 100}vw`,
                  lineHeight: 1,
                  marginBottom: `${(30 / DESIGN_WIDTH) * 100}vw`,
                }}
              >
                {techSpecTitle}
              </h3>

              {/* Tech Specs Vertical Scroll Viewport (Native Smooth Scroll + Custom Drag to Scroll) */}
              <div
                className="overflow-y-auto scrollbar-none cursor-grab active:cursor-grabbing select-none"
                ref={specsScrollRef}
                data-lenis-prevent="true"
                style={{
                  height: `${(360 / DESIGN_WIDTH) * 100}vw`,
                }}
                onMouseDown={handleSpecsMouseDown}
                onMouseMove={handleSpecsMouseMove}
                onMouseUp={handleSpecsMouseUp}
                onMouseLeave={handleSpecsMouseUp}
              >
                <div className="flex flex-col select-none">
                  {techSpecItems.map((item, index) => (
                    <div key={`spec-${index}`} className="relative flex-[0_0_auto]">
                      <div
                        className="flex"
                        style={{
                          gap: `${(20 / DESIGN_WIDTH) * 100}vw`,
                          paddingTop: `${(8 / DESIGN_WIDTH) * 100}vw`,
                          paddingBottom: `${(8 / DESIGN_WIDTH) * 100}vw`,
                        }}
                      >
                        <span
                          className="font-inter font-semibold text-[#756f3f] flex-shrink-0"
                          style={{
                            width: `${(280 / DESIGN_WIDTH) * 100}vw`,
                            fontSize: `${(20 / DESIGN_WIDTH) * 100}vw`,
                            lineHeight: 1.5,
                          }}
                        >
                          {item.key}
                        </span>

                        <span
                          className="font-inter text-black text-left flex-1 whitespace-pre-line"
                          style={{
                            fontSize: `${(18 / DESIGN_WIDTH) * 100}vw`,
                            lineHeight: 1.5,
                          }}
                        >
                          {item.value}
                        </span>
                      </div>

                      {index < techSpecItems.length - 1 && (
                        <div className="w-full h-px bg-[#DFD8B8]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tech Spec Left Images with Swap */}
          {techSpecImages.slice(0, 2).map((img, index) => {
            const isMain = index === techSpecMainIndex
            const mainPos = { x: 280, y: 440, w: 340, h: 420, radius: 24 }
            const smallPos = { x: 180, y: 620, w: 200, h: 220, radius: 16 }
            const pos = isMain ? mainPos : smallPos

            if (!img) return null

            return (
              <div
                key={`tech-img-${index}`}
                className="absolute overflow-hidden bg-white transition-all duration-500 ease-in-out"
                style={{
                  left: `${(pos.x / DESIGN_WIDTH) * 100}%`,
                  top: `${(pos.y / DESIGN_HEIGHT) * 100}%`,
                  width: `${(pos.w / DESIGN_WIDTH) * 100}vw`,
                  height: `${(pos.h / DESIGN_WIDTH) * 100}vw`,
                  borderRadius: `${(pos.radius / DESIGN_WIDTH) * 100}vw`,
                  zIndex: isMain ? 1 : 2,
                }}
              >
                <OptimizedImage image={img} alt="" size="small" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            )
          })}

          {techSpecImages.length >= 2 && (
            <>
              <style>{`
                @keyframes float {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-10px); }
                }
              `}</style>
              <button
                className="absolute cursor-pointer z-10 group transition-all duration-300"
                style={{
                  left: `${(160 / DESIGN_WIDTH) * 100}%`,
                  top: `${(420 / DESIGN_HEIGHT) * 100}%`,
                  width: `${(60 / DESIGN_WIDTH) * 100}vw`,
                  height: `${(60 / DESIGN_WIDTH) * 100}vw`,
                  animation: 'float 3s ease-in-out infinite',
                }}
                onClick={swapTechSpecImages}
              >
                <svg className="w-full h-full transition-all duration-300" viewBox="0 0 85 85" fill="none">
                  <circle
                    cx="42.1816"
                    cy="42.1816"
                    r="37.8399"
                    transform="rotate(6.07406 42.1816 42.1816)"
                    className="stroke-white fill-transparent group-hover:fill-white transition-all duration-300"
                    strokeWidth="2"
                  />
                  <path
                    d="M58.047 41.8215L58.0462 41.7988C58.0309 41.4968 57.9237 41.2067 57.739 40.9672L57.7281 40.9533L57.7309 40.9573C57.6645 40.8621 57.5891 40.7737 57.5056 40.6931L57.4817 40.6705L46.4688 30.4222C45.7476 29.751 44.6195 29.7923 43.9493 30.5143L43.9294 30.5361C43.2801 31.2588 43.3277 32.372 44.0415 33.0363L52.1138 40.548L28.0729 41.4272C27.2519 41.4572 26.6107 42.1479 26.6407 42.9697L26.6484 43.1781C26.6913 43.9881 27.3756 44.617 28.1885 44.5873L52.2294 43.7082L44.7273 51.7895C44.0571 52.5114 44.0984 53.6404 44.8195 54.3114C45.5406 54.9826 46.6687 54.9413 47.339 54.2194L57.5748 43.1932L57.5961 43.1699C57.6665 43.0913 57.7297 43.0067 57.7852 42.917L57.7991 42.8941L57.796 42.8983C57.9756 42.6358 58.0658 42.3226 58.0538 42.0049L58.047 41.8215Z"
                    className="fill-white group-hover:fill-[#756F3F] transition-all duration-300"
                  />
                </svg>
              </button>
            </>
          )}
        </section>
      </div>

      {/* ===== MOBILE LAYOUT (below lg, premium flowing flex layout) ===== */}
      <div className="block lg:hidden w-full relative overflow-hidden py-12 px-4" style={{ background: 'linear-gradient(180deg, #756F3F 0%, rgba(255, 227, 0, 0.3) 100%)' }}>
        {/* Mobile Main Title */}
        <h2 className="font-anaheim font-extrabold gradient-text-shine-white text-center text-3xl sm:text-4xl mb-8 leading-tight">
          {titleLines.map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < titleLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </h2>

        {/* Mobile Title Images Gallery (Native Horizontal Scroll) */}
        {titleImages.length > 0 && (
          <div className="flex overflow-x-auto gap-4 pb-6 mb-10 scrollbar-none snap-x snap-mandatory">
            {titleImages.map((img, index) => (
              <div
                key={`mobile-title-img-${index}`}
                className="relative flex-shrink-0 w-[260px] sm:w-[320px] h-[180px] sm:h-[220px] rounded-2xl overflow-hidden bg-white snap-center shadow-lg"
              >
                <OptimizedImage image={img} alt="" size="medium" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Mobile Tech Spec Images with Interactive Swap */}
        {techSpecImages.length > 0 && (
          <div className="relative w-full max-w-md mx-auto mb-10 flex flex-col items-center">
            <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-white shadow-2xl transition-all duration-500">
              <OptimizedImage image={techSpecImages[techSpecMainIndex] || techSpecImages[0]} alt="" size="medium" className="absolute inset-0 w-full h-full object-cover" />
            </div>

            {techSpecImages.length >= 2 && (
              <button
                className="absolute -bottom-6 cursor-pointer bg-[#756F3F] text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:bg-[#5A5530] active:scale-95 transition-all duration-300 border-2 border-white group"
                onClick={swapTechSpecImages}
                aria-label="Swap Image View"
              >
                <svg className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 10h14l-4-4" />
                  <path d="M17 14H3l4 4" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Mobile Tech Specs Flowing Card */}
        <div className="w-full bg-[#FFFDE9] rounded-3xl p-6 sm:p-8 shadow-xl mt-6">
          <h3 className="font-lilita-one gradient-text-shine-olive text-2xl sm:text-3xl mb-6 text-center">
            {techSpecTitle}
          </h3>

          <div className="flex flex-col divide-y divide-[#DFD8B8]">
            {techSpecItems.map((item, index) => (
              <div key={`mobile-spec-${index}`} className="py-4 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                <span className="font-inter font-semibold text-[#756f3f] text-base sm:text-lg sm:w-1/3">
                  {item.key}
                </span>
                <span className="font-inter text-black text-sm sm:text-base flex-1 whitespace-pre-line leading-relaxed">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTechSpecs
