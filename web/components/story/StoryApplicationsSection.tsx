"use client"

import React, { useState } from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { motion, AnimatePresence } from "framer-motion"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

interface ApplicationItem {
  title: string
  image: MediaObject | null
}

interface MediaObject {
  url: string
  id: string
}

interface StoryApplicationsSectionProps {
  data: {
    title: string
    description: string
    items: {
      slides: ApplicationItem[]
      autoplay: boolean
      interval: number
    }
  }
}

export function StoryApplicationsSection({ data }: StoryApplicationsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const slides = data.items.slides || []

  return (
    <section 
      className="relative w-full bg-[#f2efd8] overflow-hidden py-20" 
      style={{ height: vw(922) }}
    >
      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto flex flex-col items-center">
         {/* 1. Title Area (bRqlU) */}
         <div className="text-center">
            <h2 className="font-josefin-sans font-bold text-[#574f0e]" style={{ fontSize: vw(64) }}>
               {data.title}
            </h2>
            <p className="mt-4 font-josefin-sans font-semibold text-[#756f3f] max-w-[800px]" style={{ fontSize: vw(24) }}>
               {data.description}
            </p>
         </div>

         {/* 2. Grid of items (EfnMJ) */}
         <div className="mt-20 w-full px-20 grid grid-cols-4 gap-10">
            {slides.slice(0, 4).map((item, idx) => (
               <motion.div 
                 key={idx}
                 whileHover={{ y: -10 }}
                 className="relative aspect-square rounded-[40px] overflow-hidden group shadow-xl border border-white/20"
               >
                  {item.image && <OptimizedImage image={item.image} alt={item.title} size="medium" className="object-cover group-hover:scale-110 transition-transform duration-500" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-8 text-white font-josefin-sans font-bold uppercase tracking-widest" style={{ fontSize: vw(32) }}>
                     {item.title}
                  </div>
               </motion.div>
            ))}
         </div>

         {/* Navigation Controls (HNpkv, xcaXH) */}
         <div className="mt-10 flex gap-4">
            <button className="w-12 h-12 rounded-full border border-[#574f0e] flex items-center justify-center hover:bg-[#574f0e] hover:text-white transition-colors">
               <div className="w-3 h-3 border-l-2 border-b-2 border-current rotate-45 ml-1" />
            </button>
            <button className="w-12 h-12 rounded-full bg-[#574f0e] text-white flex items-center justify-center hover:shadow-lg transition-all">
               <div className="w-3 h-3 border-r-2 border-t-2 border-current rotate-45 mr-1" />
            </button>
         </div>
      </div>
    </section>
  )
}
