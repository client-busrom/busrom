"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ProductOverviewHeroSectionProps {
  data: {
    content1: string[];
    content2: string[];
    content3: string[];
    cta: {
      title: string;
      url: string;
      openInNewTab: boolean;
    };
    productItems: any[];
  }
}

// Sub-component for individual masked image to handle specific SVG shapes
const MaskedImage = ({ item, index, maskId, config }: { item: any; index: number; maskId: string; config: any }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
      className="absolute group"
      style={{
        ...config,
        zIndex: index + 10,
      }}
    >
      <div className="relative w-full h-full overflow-hidden" style={{ clipPath: `url(#${maskId})` }}>
        <OptimizedImage
          image={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Soft overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      </div>
      
      {/* Floating tag on hover */}
      <motion.div 
        className="absolute -bottom-4 left-0 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ y: 0 }}
        whileHover={{ y: -5 }}
      >
        <span className="text-[10px] text-white font-anaheim uppercase tracking-wider">{item.title}</span>
      </motion.div>
    </motion.div>
  )
}

export function ProductOverviewHeroSection({ data }: ProductOverviewHeroSectionProps) {
  const [step, setStep] = useState(0)
  const [selectedItems, setSelectedItems] = useState<any[]>([])

  const steps = useMemo(() => [
    { 
      items: data.content1.length > 0 ? data.content1 : ["Innovative Projects", "Technical Support", "Global Supply Chain"],
      cta: "Step 1: Discover More",
      title: "Sustainable \nProject Solution"
    },
    { 
      items: data.content2.length > 0 ? data.content2 : ["Material Analysis", "High-Value Design", "Professional Engineering"],
      cta: "Step 2: Start Exploration",
      title: "Professional \nBrand Service"
    },
    { 
      items: data.content3.length > 0 ? data.content3 : ["Market Highlights", "Customer Success", "Future Vision"],
      cta: data.cta.title || "Step 3: Partner Now",
      title: "Elevate Your \nBusiness Potential"
    }
  ], [data])

  useEffect(() => {
    if (data.productItems.length > 0) {
      // Pick 5 items (shuffled)
      const shuffled = [...data.productItems].sort(() => Math.random() - 0.5)
      setSelectedItems(shuffled.slice(0, 5))
    }
  }, [data.productItems])

  const handleCtaClick = (e: React.MouseEvent) => {
    if (step < 2) {
      e.preventDefault()
      setStep(prev => (prev + 1) % 3)
    }
  }

  const currentStep = steps[step]

  // Based on 1920x968 design mapping
  const imageGalleryConfig = [
    { top: "5%", left: "45%", width: "22%", height: "45%" },
    { top: "10%", left: "70%", width: "18%", height: "40%" },
    { top: "45%", left: "62%", width: "24%", height: "42%" },
    { top: "50%", left: "40%", width: "20%", height: "38%" },
    { top: "25%", left: "82%", width: "14%", height: "50%" },
  ]

  return (
    <section className="relative min-h-screen w-full bg-[#0D0D0D] overflow-hidden flex items-center">
      {/* Dynamic Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_#1a1a1a_0%,_#0d0d0d_70%)] opacity-50" />
      
      {/* Decorative Icons */}
      <motion.img 
        src="/product-overview/icon-1.svg" 
        alt="" 
        className="absolute top-[12%] left-[8%] w-[100px] opacity-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      <motion.img 
        src="/product-overview/icon-2.svg" 
        alt="" 
        className="absolute bottom-[10%] left-[15%] w-[140px] opacity-10"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.img 
        src="/product-overview/icon-4.svg" 
        alt="" 
        className="absolute top-[20%] right-[5%] w-[80px] opacity-10"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-6 relative z-20 flex flex-col md:flex-row h-full items-center justify-between py-24">
        {/* Left Side Content */}
        <div className="w-full md:w-[45%] flex flex-col items-start gap-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <h1 className="text-6xl md:text-8xl font-josefin-sans font-bold text-white uppercase tracking-tighter leading-[0.9] whitespace-pre-line mb-10">
                {currentStep.title}
              </h1>
              
              <div className="space-y-6">
                {currentStep.items.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
                    className="flex items-center gap-4 group cursor-default"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FFAA2B] group-hover:scale-150 transition-transform duration-300" />
                    <span className="text-xl md:text-2xl text-white/70 font-anaheim group-hover:text-white transition-colors duration-300">
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="relative pt-4">
            <Link 
              href={data.cta.url}
              onClick={handleCtaClick}
              target={data.cta.openInNewTab ? "_blank" : undefined}
              className="relative px-12 py-5 bg-[#FFAA2B] text-black font-josefin-sans font-bold text-2xl rounded-full transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,170,43,0.4)] group overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                {currentStep.cta}
                {step < 2 && (
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                    →
                  </motion.span>
                )}
              </span>
              <motion.div 
                className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"
              />
            </Link>

            {/* Step Progress */}
            <div className="mt-8 flex items-center gap-2">
              {[0, 1, 2].map(i => (
                <div 
                  key={i} 
                  onClick={() => setStep(i)}
                  className={cn(
                    "h-1 cursor-pointer transition-all duration-500 rounded-full",
                    i === step ? "bg-[#FFAA2B] w-12" : "bg-white/20 w-8 hover:bg-white/40"
                  )} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side Image Gallery */}
        <div className="w-full md:w-[50%] h-[700px] relative mt-16 md:mt-0 perspective-1000">
          <AnimatePresence>
            {selectedItems.map((item, index) => (
              <MaskedImage 
                key={item.id} 
                item={item} 
                index={index} 
                maskId={`mask-${index + 1}`} 
                config={imageGalleryConfig[index]} 
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* SVG ClipPath Definitions - Extracted exactly from user's assets */}
      <svg className="fixed h-0 w-0 pointer-events-none" aria-hidden="true" viewBox="0 0 1 1">
        <defs>
          {/* Mask 1: product-overview-svg-1.svg (408x500) */}
          <clipPath id="mask-1" clipPathUnits="objectBoundingBox">
            <path d="M0.926,0.54 C0.967,0.54,1,0.567,1,0.6 V0.94 C1,0.973,0.967,1,0.926,1 H0.221 C0.099,1,0,0.92,0,0.82 V0.6 C0,0.567,0.033,0.54,0.074,0.54 H0.926 Z M0.417,0.138 C0.458,0.138,0.49,0.165,0.49,0.198 V0.46 C0.49,0.493,0.458,0.52,0.417,0.52 H0.221 C0.099,0.52,0.001,0.439,0,0.34 V0.198 C0.003,0.165,0.036,0.138,0.077,0.138 H0.417 Z M0.926,0 C0.967,0,1,0.027,1,0.06 V0.46 C1,0.493,0.967,0.52,0.926,0.52 H0.73 C0.609,0.52,0.51,0.439,0.51,0.34 V0.06 C0.51,0.027,0.543,0,0.583,0 H0.926 Z" />
          </clipPath>
          {/* Mask 2: product-overview-svg-2.svg (357x439) */}
          <clipPath id="mask-2" clipPathUnits="objectBoundingBox">
            <path d="M0.916,0.51 C0.962,0.51,1,0.541,1,0.579 V0.932 C1,0.97,0.962,1,0.916,1 H0.084 C0.038,1,0,0.97,0,0.932 V0.579 C0,0.541,0.038,0.51,0.084,0.51 H0.916 Z M0.916,0 C0.962,0,1,0.031,1,0.068 V0.421 C1,0.459,0.962,0.49,0.916,0.49 H0.084 C0.038,0.49,0,0.459,0,0.421 V0.068 C0,0.031,0.038,0,0.084,0 H0.916 Z" />
          </clipPath>
          {/* Mask 3: product-overview-svg-3.svg (373x370) */}
          <clipPath id="mask-3" clipPathUnits="objectBoundingBox">
            <path d="M0.92,0.505 C0.964,0.505,1,0.541,1,0.586 V0.919 C1,0.964,0.964,1,0.92,1 H0.08 C0.036,1,0,0.964,0,0.919 V0.586 C0,0.541,0.036,0.505,0.08,0.505 H0.92 Z M0.92,0 C0.964,0,1,0.036,1,0.081 V0.4 C1,0.445,0.964,0.481,0.92,0.481 H0.08 C0.036,0.481,0,0.445,0,0.4 V0.081 C0,0.036,0.036,0,0.08,0 H0.92 Z" />
          </clipPath>
          {/* Mask 4: product-overview-svg-4.svg (476x478) */}
          <clipPath id="mask-4" clipPathUnits="objectBoundingBox">
            <path d="M0.937,0.617 C0.972,0.617,1,0.645,1,0.68 V0.937 C1,0.972,0.972,1,0.937,1 H0.063 C0.028,1,0,0.972,0,0.937 V0.68 C0,0.645,0.028,0.617,0.063,0.617 H0.937 Z M0.5,0 C0.535,0,0.563,0.028,0.563,0.063 V0.538 C0.563,0.573,0.535,0.6,0.5,0.6 H0.063 C0.028,0.6,0,0.573,0,0.538 V0.063 C0,0.028,0.028,0,0.063,0 H0.5 Z M0.937,0.115 C0.972,0.115,1,0.143,1,0.178 V0.538 C1,0.573,0.972,0.6,0.937,0.6 H0.651 C0.616,0.6,0.588,0.573,0.588,0.538 V0.178 C0.588,0.143,0.616,0.115,0.651,0.115 H0.937 Z" />
          </clipPath>
          {/* Mask 5: product-overview-svg-5.svg (260x503) */}
          <clipPath id="mask-5" clipPathUnits="objectBoundingBox">
            <path d="M0.885,0.652 C0.948,0.652,1,0.679,1,0.712 V0.881 C1,0.947,0.897,1,0.769,1 H0.115 C0.052,1,0,0.973,0,0.94 V0.712 C0,0.679,0.052,0.652,0.115,0.652 H0.885 Z M0.885,0 C0.948,0,1,0.027,1,0.06 V0.517 C1,0.583,0.897,0.636,0.769,0.636 H0.115 C0.052,0.636,0,0.609,0,0.577 V0.06 C0,0.027,0.052,0,0.115,0 H0.885 Z" />
          </clipPath>
        </defs>
      </svg>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </section>
  )
}
