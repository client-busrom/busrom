"use client"

import React from "react"
import { motion } from "framer-motion"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

interface StoryBrandSustainabilitySectionProps {
  data: {
    title: string
    description: string
    images: { url: string }[]
    content1: string
    content2: string
    tips: string
  }
}

function StaggeredBalls() {
  return (
    <div className="flex gap-[0px]">
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-full shadow-sm" style={{ width: vw(18), height: vw(18), backgroundColor: '#756F3F' }} 
      />
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        className="rounded-full shadow-sm" style={{ width: vw(18), height: vw(18), backgroundColor: '#DAC99E' }} 
      />
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        className="rounded-full border border-black/10 shadow-sm" style={{ width: vw(18), height: vw(18), backgroundColor: '#F6F4ED' }} 
      />
    </div>
  )
}

export function StoryBrandSustainabilitySection({ data }: StoryBrandSustainabilitySectionProps) {
  const images = data.images || []
  
  return (
    <section 
      className="relative w-full bg-[#f6f4ed] overflow-hidden" 
      style={{ height: vw(922) }}
    >
      {/* Decorative Rotating/Orbiting Group (Direct copy from BrandPosition vnWA6 + MdA83) */}
      <div 
        className="absolute pointer-events-none"
        style={{ 
          left: vw(280), 
          top: vw(100),
          width: vw(408),
          height: vw(168),
          zIndex: 1
        }}
      >
        {/* The Ellipse Border */}
        <div 
          className="absolute inset-0 border border-[#C9C177]" 
          style={{ 
            borderRadius: "50%",
            transform: "rotate(-22.02deg)",
          }}
        />

        {/* Orbiting Star */}
        <motion.div
          className="absolute"
          style={{ 
            width: vw(38), 
            height: vw(38),
            marginLeft: vw(-19),
            marginTop: vw(-19),
            zIndex: 3
          }}
          animate={{ 
            left: Array.from({ length: 61 }).map((_, i) => {
              const t = (i / 60) * 2 * Math.PI
              const a = 204 // 408/2
              const b = 84 // 168/2
              const rot = -22.02 * (Math.PI / 180)
              const x = a * Math.cos(t) * Math.cos(rot) - b * Math.sin(t) * Math.sin(rot)
              return vw(204 + x)
            }),
            top: Array.from({ length: 61 }).map((_, i) => {
              const t = (i / 60) * 2 * Math.PI
              const a = 204
              const b = 84
              const rot = -22.02 * (Math.PI / 180)
              const y = a * Math.cos(t) * Math.sin(rot) + b * Math.sin(t) * Math.cos(rot)
              return vw(84 + y)
            }),
            rotate: 360
          }}
          transition={{ 
            duration: 8, 
            ease: "linear", 
            repeat: Infinity 
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 1000 1000" fill="none">
             <path 
               d="M531.07202 33.408c-15.35998-44.544-39.93603-44.544-55.29602 0l-84.992 250.87999c-14.848 44.54401-64 93.18403-108.03202 108.54401l-249.34398 84.99201c-44.544 15.35998-44.544 39.936 0 55.29599l247.808 86.01599c44.54401 15.35998 93.18399 64.51202 108.54398 108.544l86.52801 251.39203c15.35999 44.54398 39.93607 44.54398 55.29606 0l84.47998-249.85602c14.84802-44.544 63.48797-93.18402 108.03198-108.544l252.92804-86.52802c44.54405-15.35998 44.54405-39.936 0-54.78399l-248.83203-83.96799c-44.54401-14.84799-93.18402-63.48801-108.54401-108.03201-1.53601-0.512-88.57599-253.95199-88.57599-253.95199z" 
               fill="#C9C177" 
             />
          </svg>
        </motion.div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto flex">
        
        {/* Left Side (Content) */}
        <div className="relative h-full" style={{ width: vw(727) }}>
          {/* Title (xQrJw) */}
          <div 
            className="absolute"
            style={{ left: vw(120), top: vw(148), width: vw(481) }}
          >
            <h2 
              className="font-josefin-sans font-bold text-black tracking-widest whitespace-pre-line"
              style={{ fontSize: vw(72), lineHeight: 1.1 }}
            >
              {data.title}
            </h2>
          </div>

          {/* Marker (F5dCK) */}
          <div 
            className="absolute flex items-center"
            style={{ left: vw(117), top: vw(427), width: vw(60), height: vw(24) }}
          >
            <StaggeredBalls />
          </div>

          {/* Description (FnQDP) */}
          <div 
            className="absolute"
            style={{ left: vw(117), top: vw(467), width: vw(543) }}
          >
            <p className="font-josefin-sans font-normal text-black whitespace-pre-line" style={{ fontSize: vw(24), lineHeight: 1.3 }}>
              {data.description}
            </p>
          </div>
        </div>

        {/* Right Side (Boxes + Circles) */}
        <div className="relative flex-1 flex h-full">
          
          {/* Box 1 (mLzcZ) */}
          <div className="relative h-full overflow-hidden" style={{ width: vw(391) }}>
            {/* BUS Text (jq6Z4) */}
            <div 
               className="absolute font-josefin-sans font-bold text-[#756f3f] opacity-20 select-none z-0"
               style={{ left: vw(60), top: vw(80), fontSize: vw(160), pointerEvents: "none" }}
            >
              BUS
            </div>
            {/* Circle 1 (JfwHz) */}
            <div 
              className="absolute overflow-hidden rounded-full z-10"
              style={{ left: vw(26), top: vw(226), width: vw(600), height: vw(600) }}
            >
              <img 
                src={images[0]?.url || "/placeholder.webp"} 
                alt="Sustainability 1"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Box 2 (rY5Rj) */}
          <div className="relative h-full overflow-hidden border-l border-black" style={{ width: vw(361) }}>
             {/* ROM Text (Dcaz7) */}
             <div 
                className="absolute font-josefin-sans font-bold text-[#756f3f] opacity-20 select-none z-0"
                style={{ left: vw(-20), top: vw(560), fontSize: vw(160), pointerEvents: "none" }}
             >
                ROM
             </div>
             {/* Circle 2 (imhEg) */}
             <div 
              className="absolute overflow-hidden rounded-full z-10"
              style={{ left: vw(-79.7), top: vw(35), width: vw(600), height: vw(600) }}
            >
              <img 
                src={images[1]?.url || "/placeholder.webp"} 
                alt="Sustainability 2"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Label below (r7h7c / ojW0a ?) */}
            {data.content1 && (
              <div 
                className="absolute z-20"
                style={{ top: vw(763), left: vw(49), width: vw(240) }}
              >
                 <div className="mb-2">
                   <StaggeredBalls />
                 </div>
                 <p className="font-josefin-sans font-bold text-[#ff7c03] tracking-wide whitespace-pre-line" style={{ fontSize: vw(24), lineHeight: 1.2 }}>
                   {data.content1}
                 </p>
              </div>
            )}
          </div>

          {/* Box 3 (GygH2) */}
          <div className="relative h-full overflow-hidden border-l border-black" style={{ width: vw(159) }}> 
             {/* Circle 3 (n0NV0) */}
             <div 
              className="absolute overflow-hidden rounded-full z-10"
              style={{ left: vw(-475), top: vw(330), width: vw(600), height: vw(600) }}
            >
              <img 
                src={images[2]?.url || "/placeholder.webp"} 
                alt="Sustainability 3"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          {/* content2 (GwBWH) now inside Box 3 area */}
          {data.content2 && (
            <div 
              className="absolute z-20"
              style={{ top: vw(211), left: vw(800), width: vw(200) }}
            >
                <div className="mb-4">
                  <StaggeredBalls />
                </div>
                <p className="font-josefin-sans font-bold text-[#ff7c03] tracking-wide whitespace-pre-line" style={{ fontSize: vw(24), lineHeight: 1.2 }}>
                  {data.content2}
                </p>
            </div>
          )}

          {/* Additional space on the right */}
          <div className="relative h-full" style={{ width: vw(283) }}>
            {/* Vertical Label (UC4Fe) */}
            <div 
              className="absolute flex items-center"
              style={{ 
                right: vw(100), 
                bottom: vw(250), 
                width: vw(245), 
                transform: "rotate(-90deg)",
                transformOrigin: "right center"
              }}
            >
              <div className="w-[80vw] h-[1px] bg-black/20" />
              <span className="ml-4 whitespace-nowrap font-josefin-sans uppercase opacity-30 tracking-[0.2em]" style={{ fontSize: vw(14) }}>
                {data.tips || "ABOUT BUSROM"}
              </span>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}
