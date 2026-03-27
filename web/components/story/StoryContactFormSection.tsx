"use client"

import React from "react"
import { motion } from "framer-motion"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

interface StoryContactFormSectionProps {
  data: {
    title: string
    description: string
  }
}

export function StoryContactFormSection({ data }: StoryContactFormSectionProps) {
  return (
    <section 
      className="relative w-full overflow-hidden" 
      style={{ 
        height: vw(983),
        background: "linear-gradient(to bottom, #756f3f, #dbd076)"
      }}
    >
      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto flex">
         {/* 1. Left Content (4wE4R) */}
         <div className="w-1/2 flex flex-col justify-center px-40">
            <h2 className="font-josefin-sans font-bold text-white uppercase" style={{ fontSize: vw(120), lineHeight: 1 }}>
               {data.title}
            </h2>
            <p className="mt-10 font-josefin-sans font-medium text-[#fff287]" style={{ fontSize: vw(20), maxWidth: vw(444) }}>
               {data.description}
            </p>
         </div>

         {/* 2. Right Form Area */}
         <div className="w-1/2 flex items-center justify-center">
            <div className="w-full max-w-[500px] flex flex-col gap-6">
               <input 
                 type="text" 
                 placeholder="Your Name" 
                 className="w-full bg-[#746d37]/40 border border-white/30 rounded-[15px] p-6 text-white placeholder:text-white/50 outline-none focus:border-white transition-colors" 
               />
               <input 
                 type="email" 
                 placeholder="Your Email" 
                 className="w-full bg-[#746d37]/40 border border-white/30 rounded-[15px] p-6 text-white placeholder:text-white/50 outline-none focus:border-white transition-colors" 
               />
               <input 
                 type="text" 
                 placeholder="Your WhatsApp" 
                 className="w-full bg-[#746d37]/40 border border-white/30 rounded-[15px] p-6 text-white placeholder:text-white/50 outline-none focus:border-white transition-colors" 
               />
               <textarea 
                 placeholder="Message" 
                 rows={4}
                 className="w-full bg-[#746d37]/40 border border-white/30 rounded-[15px] p-6 text-white placeholder:text-white/50 outline-none focus:border-white transition-colors resize-none" 
               />
               <button 
                 className="w-full bg-[#564d03] text-white font-josefin-sans font-bold rounded-[63px] py-6 uppercase tracking-widest hover:bg-black transition-colors"
                 style={{ fontSize: vw(32) }}
               >
                  Submit
               </button>
            </div>
         </div>
      </div>
    </section>
  )
}
