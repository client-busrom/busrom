"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import useEmblaCarousel from "embla-carousel-react"
import { AnimatedLinkButton } from "@/components/ui/animated-link-button"

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
}

export function HighlightShowcaseSection({ title, products, locale }: HighlightShowcaseSectionProps) {
  // Use Embla for the slider effect as the width exceeds the 1860 container in JSON
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true
  })

  return (
    <section className="relative w-full overflow-hidden flex flex-col items-center bg-[#F9F9F5] pt-20 pb-40">
      
      {/* 70% Scale Container to match Figma coordinate system */}
      <div className="relative w-[1920px] origin-top flex flex-col items-center flex-shrink-0" 
        style={{ 
          transform: "scale(0.7)",
          marginBottom: "-280px" // Compensate for scaled height
        }}
      >
        
        {/* Main Background Box (Rectangle 289) */}
        <div 
          className="relative w-[1860px] h-[959px] rounded-[30px] overflow-hidden shadow-2xl"
          style={{ 
            background: "linear-gradient(180deg, #756F3F 0%, #8F884E 100%)"
          }}
        >
          {/* Section Title */}
          <div className="absolute top-[117px] left-0 right-0 flex justify-center">
            <h2 
              className="text-[64px] font-bold text-[#FFFED7] text-center w-[1193px]"
              style={{ fontFamily: "var(--font-anaheim)", lineHeight: "102px" }}
              dangerouslySetInnerHTML={{ __html: (title || "You Might Be Looking For...").replace(/\n/g, '<br />') }}
            />
          </div>

          {/* View More Button (Group 186) */}
          <Link
            href={`/${locale}/shop`}
            className="absolute top-[194px] right-[160px] z-20 flex items-center gap-[15px]"
          >
            <AnimatedLinkButton variant="dark" className="text-white">
              VIEW MORE
            </AnimatedLinkButton>
            <div className="relative w-[32px] h-[26px]">
               <Image 
                 src="/images/service-icons/view-more-arrow.svg" 
                 alt="View More" 
                 fill 
                 className="object-contain brightness-0 invert"
               />
            </div>
          </Link>

          {/* Cards Area (Slider Layout) */}
          <div className="absolute top-[315px] left-0 w-full h-[676px] px-[169px]" ref={emblaRef}>
            <div className="flex gap-[45px]">
               {products.map((item, index) => {
                 // Layout logic based on JSON: 
                 // Side cards (index 0, 2, ...) are rotated. 
                 // Center card (index 1) is taller and straight.
                 const isStraight = index % 2 !== 0
                 
                 const offset = index === 0 ? 100 : (index === 2 ? -100 : 0)
                 const rotation = !isStraight ? (index === 0 ? -4.38 : 4.38) : 0
                 
                 return (
                   <div 
                    key={item.id} 
                    className="flex-shrink-0 relative transition-all duration-500"
                    style={{
                      width: "525px",
                      height: isStraight ? "676px" : "656px",
                      marginTop: isStraight ? "0px" : "90px",
                      transform: `translateX(${offset}px) rotate(${rotation}deg)`,
                      zIndex: index === 0 ? 10 : (index === 1 ? 20 : 30)
                    }}
                   >
                     <Link href={item.link || "#"} className="block w-full h-full relative group">
                        {/* Shadow & Background Shape */}
                        <div 
                          className="absolute inset-0 shadow-[0_4px_30.1px_rgba(0,0,0,0.25)] rounded-[30px] overflow-hidden transition-all duration-300 group-hover:scale-[1.02]"
                        >
                          {/* Product Image */}
                          <div className="absolute inset-0">
                            <OptimizedImage 
                              image={item.image} 
                              alt={item.title || ""} 
                              className="w-full h-full object-cover"
                              containerClassName="w-full h-full"
                              size="large"
                            />
                          </div>

                          {/* Gradient Hover Overlay */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 flex flex-col justify-end p-8">
                             <h4 className="text-white text-[32px] font-bold">{item.title}</h4>
                          </div>
                        </div>
                     </Link>
                   </div>
                 )
               })}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
