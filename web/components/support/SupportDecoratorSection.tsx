"use client"

import React from "react"
import { motion } from "framer-motion"
import { HollowText } from "@/components/common/HollowText"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `calc(${px} * min(100vw, 1920px) / 1920)`

interface SupportDecoratorSectionProps {
  leftText?: string
  rightText?: string
  image?: any
}

export function SupportDecoratorSection({ 
  leftText = "busrom", 
  rightText = "support", 
  image 
}: SupportDecoratorSectionProps) {
  // Border circle is 572px wide. Radius is 286px.
  // Gap 50px from the border circle.
  // Total distance from center: 286 + 50 = 336px.
  const distance = vw(300)

  return (
    <section 
      className="relative w-full overflow-hidden flex items-center justify-center bg-[#f6f4ed]" 
      style={{ height: vw(600) }}
    >
        {/* 1. Background Image Border Wrapper (handles centering) */}
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: vw(572), height: vw(572) }}
        >
          {/* Inner Rotating Div (handles spin) */}
          <div 
            className="w-full h-full rounded-full animate-[spin_3s_linear_infinite]"
            style={{ 
              border: "1px solid transparent",
              backgroundImage: "linear-gradient(#f6f4ed, #f6f4ed), linear-gradient(130deg, #464010 0%, rgba(102, 102, 102, 0) 100%)",
              backgroundOrigin: "border-box",
              backgroundClip: "content-box, border-box"
            }}
          />
        </div>

        {/* 2. Left Text (support-decorator-left) */}
        <div 
          className="absolute z-10 flex items-center justify-end whitespace-nowrap"
          style={{ 
            right: `calc(50% + ${distance})`,
            top: "50%",
            transform: "translateY(-50%)",
            width: vw(1000) // Large width to allow text to bleed off screen
          }}
        >
            <HollowText 
              strokeWidth={1.5} 
              strokeColor="#000000" 
              className="font-josefin-sans font-bold"
              style={{ 
                fontSize: vw(140), 
                textTransform: "uppercase"
              }}
            >
              {leftText}
            </HollowText>
        </div>

        {/* 3. Center Image (support-decorator-image) */}
        <div 
          className="relative z-20 rounded-full overflow-hidden bg-[#d9d9d9] flex-shrink-0"
          style={{ 
            width: vw(506), 
            height: vw(506)
          }}
        >
            {image ? (
              <OptimizedImage 
                  image={image} 
                  size="medium"
                  className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#f1ecc8]/20 flex items-center justify-center">
                <span className="text-[#464010]/20 font-josefin-sans uppercase" style={{ fontSize: vw(40) }}>busrom</span>
              </div>
            )}
        </div>

        {/* 4. Right Text (support-decorator-right) */}
        <div 
          className="absolute z-10 flex items-center justify-start whitespace-nowrap"
          style={{ 
            left: `calc(50% + ${distance})`,
            top: "50%",
            transform: "translateY(-50%)",
            width: vw(1000)
          }}
        >
            <span 
                className="font-josefin-sans font-bold text-[#524d20] uppercase"
                style={{ fontSize: vw(140), lineHeight: "0.7" }}
            >
                {rightText}
            </span>
        </div>
    </section>
  )
}
