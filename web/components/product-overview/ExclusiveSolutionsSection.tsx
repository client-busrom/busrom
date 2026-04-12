"use client"

import React, { useCallback, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { ProductOverviewData } from "@/types/product-overview"
import useEmblaCarousel from "embla-carousel-react"

interface ExclusiveSolutionsSectionProps {
  data: ProductOverviewData["exclusiveSolutions"]
}

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

const NavButton = ({ direction, onClick }: { direction: 'prev' | 'next', onClick: () => void }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative outline-none transition-all duration-300 transform active:scale-95"
      style={{ width: vw(115), height: vw(61) }}
    >
      <AnimatePresence mode="wait">
        {!isHovered ? (
          <motion.svg
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            width="100%"
            height="100%"
            viewBox="0 0 115 61"
            fill="none"
          >
            <path 
              d={direction === 'prev' 
                ? "M36.7383 28.2695H94V32.7559H36.7383V37.2422L21.2627 30.5127L36.7383 23.7832V28.2695Z" 
                : "M78.2617 28.2695H21V32.7559H78.2617V37.2422L93.7373 30.5127L78.2617 23.7832V28.2695Z"} 
              fill="white"
            />
            <rect 
              x="1" y="1" width="113" height="59" rx="29.5" 
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
              strokeDasharray="6 6" 
            />
          </motion.svg>
        ) : (
          <motion.svg
            key="hover"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            width="100%"
            height="100%"
            viewBox="0 0 113 58"
            fill="none"
          >
            <path 
              fillRule="evenodd" clipRule="evenodd" 
              d={direction === 'next'
                ? "M84 0C100.016 0 113 12.9837 113 29C113 45.0163 100.016 58 84 58H29C12.9837 58 0 45.0163 0 29C0 12.9837 12.9837 0 29 0H84ZM78.3271 27.2803H24V31.7676H78.3271V36.2539L93.0098 29.5244L78.3271 22.7949V27.2803Z"
                : "M29 0C12.9837 0 0 12.9837 0 29C0 45.0163 12.9837 58 29 58H84C100.016 58 113 45.0163 113 29C113 12.9837 100.016 0 84 0H29ZM34.6729 27.2803H89V31.7676H34.6729V36.2539L19.9902 29.5244L34.6729 22.7949V27.2803Z"} 
              fill="white"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
};

export function ExclusiveSolutionsSection({ data }: ExclusiveSolutionsSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: "start",
    skipSnaps: false
  })

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  if (!data || !data.items || data.items.length === 0) return null

  const { logoText, title, subtitle, content, items } = data

  return (
    <section 
      className="relative w-full overflow-hidden" 
      style={{ 
        paddingTop: vw(125),
        paddingBottom: vw(125),
        background: 'linear-gradient(180deg, #fff6d4 0%, #fff6d4 70%, #f6f4ed 100%)',
        borderRadius: vw(80),
      }}
    >
      <div className="mx-auto" style={{ width: vw(1604) }}>
        {/* Header Info - Strict Design Alignment */}
        <div className="relative" style={{ marginBottom: vw(80), paddingLeft: vw(42) }}>
          <div className="flex">
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="font-katibeh flex items-center justify-center bg-[#ffe484] text-black leading-none rounded-full relative"
              style={{ 
                fontSize: vw(40), 
                padding: `${vw(15)} ${vw(60)} ${vw(0)} ${vw(60)}`,
                marginBottom: vw(40),
                lineHeight: 1,
              }}
            >
              {logoText}
            </motion.p>
          </div>
          
          <div className="flex justify-between items-start gap-10">
            <div className="flex flex-col" style={{ width: vw(800) }}>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="font-katibeh leading-none text-black"
                style={{ fontSize: vw(110) }}
              >
                {title}
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="font-katibeh text-black whitespace-pre-line"
                style={{ fontSize: vw(42), lineHeight: 1.3, marginTop: vw(30) }}
              >
                {subtitle}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative bg-[#FFBB3220] border-2 border-dashed border-[#E9D89E] backdrop-blur-sm self-start flex items-center"
              style={{ 
                width: "fit-content",
                padding: `${vw(30)} ${vw(40)}`,
                borderRadius: vw(35),
                marginTop: vw(-20),
              }}
            >
              <p className="font-katibeh text-[#965200] whitespace-pre-line leading-relaxed" style={{ fontSize: vw(40) }}>
                {content}
              </p>
            </motion.div>
          </div>
        </div>

        {/* 3-Column Split Carousel Box - Strict Coordinates */}
        <div 
          className="relative overflow-hidden w-full"
          style={{ 
            height: vw(896), 
            background: "linear-gradient(180deg, #464010 0%, rgba(172, 157, 39, 0.55) 100%)",
            borderRadius: vw(60),
          }}
        >
          {/* Navigation Buttons - Use Style for absolute positioning to avoid Tailwind bracket issues */}
          <div className="absolute z-30" style={{ left: vw(42), top: vw(70) }}>
            <NavButton direction="prev" onClick={scrollPrev} />
          </div>
          <div className="absolute z-30" style={{ left: vw(1426), top: vw(64) }}>
            <NavButton direction="next" onClick={scrollNext} />
          </div>

          <div className="overflow-visible h-full" ref={emblaRef}>
            <div className="flex h-full">
              {items.map((item: any, idx: number) => (
                <div key={idx} className="flex-shrink-0 w-full relative h-full">
                   {/* Column 1: Left Text Block (x_abs: 195, relative_to_box: 42) */}
                   <div 
                    className="absolute z-20 flex flex-col justify-between"
                    style={{ 
                      left: vw(42), 
                      top: vw(165), 
                      width: vw(435),
                      height: vw(668)
                    }}
                   >
                      <div 
                        className="bg-[#5a5319] flex items-center shadow-lg"
                        style={{ width: 'fit-content', maxWidth: vw(520), borderRadius: vw(60), padding: vw(40) }}
                      >
                        <p className="font-josefin-sans text-white opacity-90 whitespace-pre-line" style={{ fontSize: vw(30), lineHeight: 1.4 }}>
                           {item.description}
                        </p>
                      </div>

                      <h3 className="font-josefin-sans font-bold text-white uppercase tracking-tight whitespace-pre-line" style={{ fontSize: vw(48), lineHeight: 1.1, width: vw(900) }}>
                        {item.title}
                      </h3>
                   </div>

                   {/* Column 2: Middle Image (x_abs: 797, relative_to_box: 644) */}
                   <div 
                    className="absolute z-10 overflow-hidden shadow-xl"
                    style={{ 
                      left: vw(644), 
                      top: vw(165),
                      width: vw(447),
                      height: vw(668),
                      borderRadius: vw(60)
                    }}
                   >
                      {item.leftImage && (
                        <OptimizedImage 
                          image={item.leftImage} 
                          alt="Solution Detail" 
                          size="medium"
                          className="w-full h-full object-cover"
                        />
                      )}
                   </div>

                   {/* Column 3: Right Image (x_abs: 1264, relative_to_box: 1111) */}
                   <div 
                    className="absolute z-10 overflow-hidden shadow-xl"
                    style={{ 
                      left: vw(1111), 
                      top: vw(165),
                      width: vw(447),
                      height: vw(668),
                      borderRadius: vw(60)
                    }}
                   >
                      {item.rightImage && (
                        <OptimizedImage 
                          image={item.rightImage} 
                          alt="Application Case" 
                          size="medium"
                          className="w-full h-full object-cover"
                        />
                      )}
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
