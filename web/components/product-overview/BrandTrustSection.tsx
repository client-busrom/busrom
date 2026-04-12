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
    <section className="relative w-full" style={{ height: vw(896), marginTop: vw(150), marginBottom: vw(150) }}>
      <div className="mx-auto relative" style={{ width: vw(1920), height: vw(896) }}>
        
        {/* 1. Left Gradient Block */}
        <div 
          className="absolute"
          style={{ 
            left: vw(30), 
            top: 0, 
            width: vw(440), 
            height: vw(896),
            background: 'linear-gradient(180deg, #756f3f 0%, #dbd076 100%)',
            borderRadius: `0 0 0 ${vw(30)}`
          }}
        />

        {/* 2.5 Bottom Olivine Circle: True Orbital Rotation */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute rounded-full border-2 border-[#756f3f] z-0 pointer-events-none"
          style={{ 
            left: vw(506), 
            top: vw(530), 
            width: vw(309), 
            height: vw(309),
            transformOrigin: '60% 60%'
          }}
        />

        {/* 2. Capsule Image Wrapper */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute overflow-hidden shadow-2xl z-10"
          style={{ 
            left: vw(219), 
            top: 0, 
            width: vw(476), 
            height: vw(792),
            borderRadius: vw(238),
            border: `${vw(1)} solid rgba(255, 255, 255, 0.2)`
          }}
        >
          {data.image && (
            <OptimizedImage 
               image={data.image} 
               alt="Brand Trust" 
               width={476} 
               height={792} 
               className="w-full h-full object-cover"
            />
          )}

          {/* 2.6 Inside White Circle: True Orbital Rotation Synced */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute rounded-full border-2 border-white pointer-events-none"
            style={{ 
              left: vw(506 - 219), 
              top: vw(530), 
              width: vw(309), 
              height: vw(309),
              transformOrigin: '60% 60%'
            }}
          />
        </motion.div>

        {/* 3. Title */}
        <motion.h2 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="absolute font-berkshire-swash text-[#000000] leading-[1.26] z-0"
          style={{ 
            fontSize: vw(88), 
            left: vw(756), 
            top: vw(37), 
            width: vw(1001) 
          }}
        >
          {data.title}
        </motion.h2>

        {/* 4. Content Area with Static SVG Box */}
        <div 
          className="absolute z-10 flex flex-col justify-center"
          style={{ 
            left: vw(800), 
            top: vw(431), 
            width: 'fit-content',
            padding: `${vw(70)} ${vw(90)} ${vw(30)} ${vw(190)}`
          }}
        >
          {/* Static SVG Background */}
          <div 
            className="absolute inset-0 -z-10"
            style={{ 
              backgroundImage: 'url("/product-overview/product-overview-brand-trust-content-box.svg")',
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat'
            }}
          />

          <div className="relative">
            <p className="font-josefin-sans text-[#4b4512] leading-[1.46] whitespace-pre-line" style={{ fontSize: vw(28) }}>
              {data.content}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
