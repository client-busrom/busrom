"use client"

import React from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { motion } from "framer-motion"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

interface StoryQuoteSectionProps {
  data: {
    title: string
    description: string
    buttonText: string
  }
}

export function StoryQuoteSection({ data }: StoryQuoteSectionProps) {
  return (
    <section 
      className="relative w-full bg-white overflow-hidden py-20" 
      style={{ height: vw(922) }}
    >
      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto flex items-center">
         {/* 1. Content Area (Ksj0Y, fXJWh, l4K1U) */}
         <div className="w-1/2 flex flex-col justify-center px-40">
            <h2 className="font-josefin-sans font-bold text-[#574f0e] uppercase" style={{ fontSize: vw(64), lineHeight: 1 }}>
               {data.title}
            </h2>
            <div className="w-24 h-1 bg-[#574f0e] mt-10 mb-20" />
            <p className="font-josefin-sans font-semibold text-[#574f0e]" style={{ fontSize: vw(24), lineHeight: 1.25, maxWidth: vw(431) }}>
               {data.description}
            </p>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-20 w-80 bg-[#574f0e] text-white font-josefin-sans font-bold rounded-[63px] py-6 uppercase tracking-widest hover:bg-black transition-colors"
              style={{ fontSize: vw(24) }}
            >
               {data.buttonText}
            </motion.button>
         </div>

         {/* 2. Featured Image Area (Xosqp) */}
         <div className="w-1/2 flex items-center justify-center pr-20">
            <motion.div 
               whileHover={{ scale: 1.02 }}
               className="relative overflow-hidden shadow-2xl"
               style={{ width: vw(518), height: vw(672), borderRadius: vw(30) }}
            >
               <OptimizedImage 
                 image="/BusromFooterBg_original.webp" 
                 alt="One-stop Shop" 
                 size="medium"
                 className="object-cover" 
               />
               <div className="absolute inset-0 bg-black/10" />
            </motion.div>
         </div>
      </div>
      
      {/* Background Decorative Ellipse (SJfde shape) */}
      <div 
        className="absolute w-full h-full bg-[#f2efd8] z-0 bottom-0 translate-y-2/3 rounded-[50%]" 
        style={{ height: vw(2000), width: vw(3000), left: vw(-500) }}
      />
    </section>
  )
}
