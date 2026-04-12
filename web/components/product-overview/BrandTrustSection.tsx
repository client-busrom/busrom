"use client"

import React from "react"
import { motion } from "framer-motion"
import { BrandTrust } from "@/types/product-overview"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

interface BrandTrustSectionProps {
  data: BrandTrust;
}

export function BrandTrustSection({ data }: BrandTrustSectionProps) {
  if (!data) return null;

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: vw(896), paddingBottom: vw(100) }}>
      <div className="mx-auto flex items-stretch" style={{ width: vw(1727) }}>
        {/* Left Column: Image Area */}
        <div className="relative" style={{ width: vw(665) }}>
          {/* Decorative Ellipse Background */}
          <div 
            className="absolute rounded-full border-2 border-white/30" 
            style={{ 
              width: vw(309), 
              height: vw(309), 
              left: vw(287), 
              top: vw(530),
              zIndex: 1
            }} 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden"
            style={{ 
              width: vw(476), 
              height: vw(792), 
              borderRadius: `0 0 0 ${vw(310.5)}`,
              border: `${vw(1)} solid rgba(255, 255, 255, 0.2)`,
              zIndex: 2
            }}
          >
            <OptimizedImage 
              image={data.image?.url} 
              alt="Brand Trust" 
              width={476} 
              height={792} 
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* Right Column: Text Content */}
        <div className="relative flex-1 flex flex-col justify-center" style={{ paddingLeft: vw(60) }}>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="font-berkshire-swash text-black leading-tight"
            style={{ fontSize: vw(88), maxWidth: vw(1001), marginBottom: vw(60) }}
          >
            {data.title}
          </motion.h2>

          <div className="relative" style={{ width: vw(767), minHeight: vw(349) }}>
            {/* SVG Background for content (Matches brand-trust-content-bg) */}
            <div className="absolute inset-0" style={{ zIndex: 0 }}>
               <svg width="100%" height="100%" viewBox="0 0 767 349" fill="none" preserveAspectRatio="none">
                  <path 
                    d="M0 40C0 17.9086 17.9086 0 40 0H727C749.091 0 767 17.9086 767 40V309C767 331.091 749.091 349 727 349H40C17.9086 349 0 331.091 0 309V40Z" 
                    fill="#756f3f" 
                  />
               </svg>
            </div>
            
            <div className="relative p-10" style={{ zIndex: 1, padding: `${vw(40)} ${vw(50)}` }}>
               <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
               >
                  <svg width={vw(96)} height={vw(98)} viewBox="0 0 96 98" fill="none" className="mb-6 opacity-50">
                     <path d="M48 0L58.5 39.5H96L65.5 64L76 98L48 76.5L20 98L30.5 64L0 39.5H37.5L48 0Z" fill="#464010" />
                  </svg>
                  <p className="font-josefin-sans text-[#fffad3] leading-relaxed" style={{ fontSize: vw(28), opacity: 0.9 }}>
                    {data.content}
                  </p>
               </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
