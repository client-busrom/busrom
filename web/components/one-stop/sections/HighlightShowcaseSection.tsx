"use client"

import React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import useEmblaCarousel from "embla-carousel-react"
import { AnimatedLinkButton } from "@/components/ui/animated-link-button"

// Viewport width conversion utility based on 1920px design width
const vw = (px: number) => `${(px / 1920) * 100}vw`

interface HighlightProduct {
  id: string
  image: any
  title?: string
  link?: string
}

interface HighlightShowcaseSectionProps {
  title?: string
  products: HighlightProduct[]
  locale: string
  viewMoreText?: string
  viewMoreLink?: string
}

export function HighlightShowcaseSection({ title, products, locale, viewMoreText, viewMoreLink }: HighlightShowcaseSectionProps) {
  // Use Embla for the slider effect as the width exceeds the 1860 container in JSON
  const [emblaRef] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    dragFree: true
  })

  return (
    <section className="relative w-full bg-transparent py-20 lg:py-0 lg:h-[vw(1120)] overflow-hidden flex flex-col items-center justify-center">
      
      {/* 1. MOBILE VIEW: Vertical List (Simple Display) - Visible below lg */}
      <div className="lg:hidden w-full px-6 flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <h2 
            className="font-anaheim font-bold text-[#756F3F] text-3xl md:text-5xl tracking-wider"
            dangerouslySetInnerHTML={{ __html: (title || "Highlight Showcase").replace(/\n/g, '<br />') }}
          />
          <div className="h-1 w-20 bg-[#C7BB5D]" />
        </div>

        <div className="flex flex-col gap-10">
          {products.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="w-full bg-white rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-black/5 group"
            >
              <Link href={item.link || "#"} className="flex flex-col">
                <div className="relative aspect-video w-full">
                  <OptimizedImage 
                    image={item.image} 
                    alt={item.title || ""} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    size="large"
                  />
                </div>
                <div className="p-6 flex justify-between items-center bg-[#EEEACB]/10">
                  <h4 className="text-[#333] font-bold text-xl md:text-2xl font-anaheim uppercase">{item.title}</h4>
                  <div className="w-10 h-10 rounded-full bg-[#756F3F]/10 flex items-center justify-center transition-colors group-hover:bg-[#C7BB5D]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#756F3F" strokeWidth="2.5">
                      <path d="M5 12h14m-7-7l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile View More */}
        <div className="mt-8 flex justify-center">
           <Link href={viewMoreLink || `/${locale}/shop`} className="flex items-center gap-4">
            <AnimatedLinkButton 
              variant="dark" 
              className="text-white"
              ballColor="#C7BB5D"
              style={{ fontSize: "20px", height: "50px", paddingLeft: "30px", paddingRight: "20px" }}
            >
              {viewMoreText || "VIEW MORE"}
            </AnimatedLinkButton>
          </Link>
        </div>
      </div>

      {/* 2. DESKTOP VIEW: High-Fidelity 3D Carousel - Visible only on lg */}
      <div 
        className="hidden lg:block relative"
        style={{ 
          width: vw(1860), 
          height: vw(860), 
          borderRadius: vw(30), 
          overflow: "visible", // Changed to visible for shadow/glow overflow
          background: "linear-gradient(180deg, #756F3F 0%, #C0B985 100%)",
          zIndex: 0
        }}
      >
        {/* Section Title */}
        <div 
          className="absolute flex justify-center w-full"
          style={{ top: vw(100) }}
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center font-bold"
            style={{ 
              fontSize: vw(64),
              width: vw(1193),
              fontFamily: "var(--font-anaheim)", 
              lineHeight: vw(102),
              color: "#FFFED7",
              WebkitTextStroke: `${vw(1)} #FFFED7`,
              paintOrder: "stroke fill"
            }}
            dangerouslySetInnerHTML={{ __html: (title || "You Might Be Looking For...").replace(/\n/g, '<br />') }}
          />
        </div>

        {/* View More Button (Group 186) */}
        <Link
          href={viewMoreLink || `/${locale}/shop`}
          className="absolute z-20 flex items-center group"
          style={{ top: vw(160), right: vw(160), gap: vw(15) }}
        >
          <AnimatedLinkButton 
            variant="dark" 
            className="text-white"
            ballColor="#ABA465"
          >
            {viewMoreText || "VIEW MORE"}
          </AnimatedLinkButton>
          <div 
            className="relative transition-transform duration-300 group-hover:translate-x-2"
            style={{ width: vw(32), height: vw(26) }}
          >
             <Image 
               src="/images/service-icons/view-more-arrow.svg" 
               alt="View More" 
               fill 
               className="object-contain brightness-0 invert"
             />
          </div>
        </Link>

        {/* Cards Area (Slider Layout) */}
        <div 
          className="absolute w-full" 
          style={{ top: vw(280), height: vw(676) }}
          ref={emblaRef}
        >
          <div className="flex justify-center" style={{ gap: 0 }}>
             {products.map((item, index) => {
               const isStraight = index % 2 !== 0
               const rotation = !isStraight ? (index === 0 ? -4.38 : 4.38) : 0
               
               return (
                 <motion.div 
                   key={item.id} 
                   initial={{ opacity: 0, y: 50, rotate: rotation }}
                   whileInView={{ opacity: 1, y: 0, rotate: rotation }}
                   whileHover={{ 
                     y: vw(-80), 
                     rotate: 0, 
                     zIndex: 100,
                     transition: { type: "spring", stiffness: 260, damping: 20 }
                   }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.8, delay: index * 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
                   className="flex-shrink-0 relative group"
                   style={{
                     width: vw(525),
                     height: isStraight ? vw(676) : vw(656),
                     marginTop: isStraight ? "0px" : vw(90),
                     marginLeft: index === 0 ? 0 : vw(-80),
                     zIndex: index === 1 ? 30 : (index === 0 ? 10 : 20)
                   }}
                 >
                    {/* Glow Effects */}
                    <div className="absolute inset-[5%] bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-700 blur-[60px] translate-y-32 pointer-events-none group-hover:scale-[1.2] z-0 rounded-[vw(30)]" />

                    <Link href={item.link || "#"} className="block w-full h-full relative z-10">
                      <div className="absolute inset-0 shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-300 group-hover:scale-[1.04]" style={{ borderRadius: vw(30) }}>
                        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                          <OptimizedImage image={item.image} alt={item.title || ""} className="w-full h-full object-cover" containerClassName="w-full h-full" size="large" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                           <h4 className="text-white font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,1)] font-anaheim uppercase text-center" style={{ fontSize: vw(32), lineHeight: 1.2 }}>{item.title}</h4>
                        </div>
                      </div>
                   </Link>
                 </motion.div>
               )
             })}
          </div>
        </div>
      </div>
    </section>
  )
}
