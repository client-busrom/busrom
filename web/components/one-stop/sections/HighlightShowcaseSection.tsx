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
    <section 
      className="relative w-full overflow-hidden flex flex-col items-center bg-[#F9F9F5]"
      style={{ paddingTop: vw(80), paddingBottom: vw(50) }}
    >
      
      {/* Main Background Box (Rectangle 289) */}
      <div 
        className="relative shadow-2xl"
        style={{ 
          width: vw(1860), 
          height: vw(860), 
          borderRadius: vw(30), 
          overflow: "hidden",
          background: "linear-gradient(180deg, #756F3F 0%, #8F884E 100%)"
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
               // Layout logic: 
               // Use negative margin-left for cards (from index 1 onwards) to force overlap.
               const isStraight = index % 2 !== 0
               const rotation = !isStraight ? (index === 0 ? -4.38 : 4.38) : 0
               
               return (
                 <motion.div 
                   key={item.id} 
                   initial={{ opacity: 0, y: 50, rotate: rotation }}
                   whileInView={{ opacity: 1, y: 0, rotate: rotation }}
                   whileHover={{ 
                     y: -80, 
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
                     // Force overlap using negative margin
                     marginLeft: index === 0 ? 0 : vw(-80),
                     // Default stacking: index 2 (right) is on top
                     zIndex: index === 2 ? 30 : (index === 0 ? 10 : 20)
                   }}
                 >
                    {/* 第一层：巨幅弥散氛围影 - 制造大范围的黑色晕染场 */}
                    <div 
                      className="absolute inset-[5%] bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-700 blur-[130px] translate-y-32 pointer-events-none group-hover:scale-[1.3] z-0"
                      style={{ borderRadius: vw(30) }}
                    />
                    
                    {/* 第二层：沉稳核心落地影 - 锁定卡片物理轮廓的根部 */}
                    <div 
                      className="absolute inset-[12%] bg-black opacity-0 group-hover:opacity-100 transition-all duration-500 blur-[50px] translate-y-20 pointer-events-none z-0"
                      style={{ borderRadius: vw(30) }}
                    />

                    <Link href={item.link || "#"} className="block w-full h-full relative z-10">
                      {/* Shadow & Background Shape */}
                      <div 
                        className="absolute inset-0 shadow-[0_15px_40px_rgba(0,0,0,0.25)] overflow-hidden transition-all duration-300 group-hover:scale-[1.04]"
                        style={{ borderRadius: vw(30) }}
                      >
                        {/* Product Image */}
                        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                          <OptimizedImage 
                            image={item.image} 
                            alt={item.title || ""} 
                            className="w-full h-full object-cover"
                            containerClassName="w-full h-full"
                            size="small"
                          />
                        </div>

                        {/* Text Overlay Only (No dark gradient covering image) */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                           <h4 
                             className="text-white font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
                             style={{ fontSize: vw(32), lineHeight: 1.2 }}
                           >
                             {item.title}
                           </h4>
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
