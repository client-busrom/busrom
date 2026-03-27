"use client"

import React from "react"
import { motion } from "framer-motion"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

interface StoryBrandProspectSectionProps {
  data: {
    title: string
    items: string[]
  }
}

export function StoryBrandProspectSection({ data }: StoryBrandProspectSectionProps) {
  return (
    <section 
      className="relative w-full overflow-hidden py-40" 
      style={{ 
        height: vw(1444),
        background: "linear-gradient(to bottom, #f8efce, #f6f4ed)"
      }}
    >
      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto">
        {/* 1. Future Prospect Title (VU2Hn) */}
        <div className="absolute" style={{ right: vw(160), top: vw(120) }}>
           <h2 
             className="font-josefin-sans font-bold text-[#574f0e] text-right" 
             style={{ fontSize: vw(120), lineHeight: 0.875, maxWidth: vw(636) }}
           >
             {data.title}
           </h2>
        </div>

        {/* 2. Side Tips (BpxUN) */}
        <div className="absolute" style={{ left: vw(152), bottom: vw(145) }}>
           <div 
             className="font-josefin-sans font-bold text-[#574f0e] origin-left -rotate-90 uppercase tracking-[4px] whitespace-nowrap"
             style={{ fontSize: vw(40) }}
           >
             Our Vision
           </div>
        </div>

        {/* 3. Prospect Items Staggered (xRzGI, FTqXd, qOmoH) */}
        <div className="absolute inset-x-0 top-[40%] flex flex-col gap-40 px-[15%]">
            {data.items.slice(0, 3).map((item, idx) => (
               <motion.div 
                 key={idx}
                 initial={{ opacity: 0, x: idx % 2 === 0 ? -100 : 100 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 className={`relative w-[600px] p-10 bg-white/40 backdrop-blur-md rounded-[40px] border border-[#574f0e]/10 ${idx % 2 === 0 ? "self-start" : "self-end"}`}
               >
                  <div className="font-josefin-sans font-bold text-[#574f0e]" style={{ fontSize: vw(40) }}>
                     {String(idx + 1).padStart(2, '0')}
                  </div>
                  <p className="mt-4 font-josefin-sans font-normal text-[#574f0e]/80" style={{ fontSize: vw(24) }}>
                     {item}
                  </p>
               </motion.div>
            ))}
        </div>

        {/* Floating Decorative Item (bPWLu Ellipse 108) */}
        <div 
          className="absolute bg-[#f1ead1] pointer-events-none" 
          style={{ right: vw(-50), top: vw(0), width: vw(300), height: vw(300), borderRadius: "50%", opacity: 0.4 }}
        />
      </div>
    </section>
  )
}
