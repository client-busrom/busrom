"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { HollowText } from "@/components/common/HollowText"

interface Product {
  id: string
  name: string
  slug: string
  productAttributes?: string | string[]
  mainImage?: any[]
  showImage?: any
}

interface ProductSeriesShowcaseSectionProps {
  title?: string
  products: Product[]
  locale: string
}

export function ProductSeriesShowcaseSection({ title, products, locale }: ProductSeriesShowcaseSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const validProducts = useMemo(() => {
    return products.filter(p => p.name && p.slug)
  }, [products])

  const activeProduct = validProducts[currentIndex]

  const displayedImages = useMemo(() => {
    if (!activeProduct) return [null, null]
    const mainImages = (activeProduct as any).mainImage || []
    const showImgNode = (activeProduct as any).showImage

    if (mainImages.length > 0) {
      const shuffled = [...mainImages].sort(() => 0.5 - Math.random())
      const img1 = shuffled[0]
      const img2 = shuffled.length > 1 ? shuffled[1] : (showImgNode || shuffled[0])
      return [img1, img2]
    }
    return [showImgNode, showImgNode]
  }, [activeProduct])

  const attributes = useMemo(() => {
    if (!activeProduct) return []
    const config = (activeProduct as any)._carouselItem
    if (config && config.showHighlights === false) return []

    if (Array.isArray(activeProduct.productAttributes) && activeProduct.productAttributes.length > 0) return activeProduct.productAttributes
    if (typeof activeProduct.productAttributes === 'string') {
        return (activeProduct.productAttributes as string).split('\n').filter(line => line.trim())
    }
    return ["Robust and stable", "Resistant to moisture", "Minimalist aesthetics", "Versatile and adaptable"]
  }, [activeProduct])

  const nextProduct = () => setCurrentIndex((prev) => (prev + 1) % (validProducts.length || 1))
  const prevProduct = () => setCurrentIndex((prev) => (prev - 1 + (validProducts.length || 1)) % (validProducts.length || 1))

  const getDisplayName = () => {
    if (!activeProduct) return ""
    const item = (activeProduct as any)._carouselItem
    const categoryName = (activeProduct as any).category?.name || (activeProduct as any).categoryName || "Category"
    const productName = activeProduct.name || ""
    
    if (item) {
        if (item.customName && item.customName.trim() !== "") return item.customName
        if (item.showCategory === true || item.showName === false) return categoryName
        if (item.showName === true) return productName
    }
    return (activeProduct as any).title || productName
  }

  if (validProducts.length === 0) return null

  return (
    <section className="relative w-full bg-transparent flex flex-col items-center py-8 lg:py-0 lg:h-[700px]">
      
      {/* 1. MOBILE VIEW */}
      <div className="lg:hidden w-full flex flex-col items-center px-6 gap-8">
        <div className="w-full text-center">
           <HollowText 
            strokeColor="#846500"
            strokeWidth={1}
            className="block text-5xl font-[900] leading-none pointer-events-none"
            style={{ fontFamily: "var(--font-anaheim)", whiteSpace: "pre-line" }}
          >
            {title || "PRODUCT SERIES"}
          </HollowText>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeProduct.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full flex flex-col gap-6"
          >
            <div className="w-full bg-[#F1E8CA] rounded-[24px] p-8 shadow-xl flex flex-col gap-6">
              <h3 className="text-4xl font-extrabold text-[#6D5400] font-anaheim leading-tight uppercase">
                {getDisplayName()}
              </h3>
              <div className="flex flex-col gap-4">
                {attributes.slice(0, 4).map((attr, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#A5A075] flex items-center justify-center shrink-0">
                      <svg width="14" height="12" viewBox="0 0 18 14" fill="none"><path d="M1.5 7L6.5 12L16.5 2" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <p className="text-lg font-bold text-black font-anaheim uppercase leading-none">{attr}</p>
                  </div>
                ))}
              </div>
                <Link 
                  href={`/${locale}/shop/${activeProduct.slug}`} 
                  className="flex items-center gap-[0.78vw] xl:gap-[12px] group/see transition-all duration-300 transform translate-x-[40px] translate-y-[50px]"
                >
                  <span className="text-xl font-bold text-[#756F3F] font-anaheim transition-colors group-hover/see:text-black">
                    {(activeProduct as any)._carouselItem?.buttonText || "SEE ALL"}
                  </span>
                  <div className="w-12 h-12 rounded-full border border-[#756F3F] flex items-center justify-center text-[#756F3F] group-hover/see:bg-[#756F3F] group-hover/see:text-white transition-all">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="aspect-[3/4] rounded-[20px] overflow-hidden shadow-lg border-none">
                <OptimizedImage image={displayedImages[0]} alt="Feature 1" className="w-full h-full object-cover" size="large" />
              </div>
              <div className="aspect-[3/4] rounded-[20px] overflow-hidden shadow-lg border-none">
                <OptimizedImage image={displayedImages[1]} alt="Feature 2" className="w-full h-full object-cover" size="large" />
              </div>
            </div>

            <div className="flex justify-center gap-10 mt-4">
              <button onClick={prevProduct} className="nav-btn-standard w-14 h-14 rounded-full border-2 border-[#756F3F] flex items-center justify-center bg-white text-[#756F3F] hover:bg-[#756F3F] hover:text-white active:scale-95 transition-all">
                <svg width="12" height="20" viewBox="0 0 17 29" fill="none" className="transition-colors">
                  <path d="M15.5 2L3 14.5L15.5 27" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </button>
              <button onClick={nextProduct} className="nav-btn-standard w-14 h-14 rounded-full border-2 border-[#756F3F] flex items-center justify-center bg-white text-[#756F3F] hover:bg-[#756F3F] hover:text-white active:scale-95 transition-all">
                <svg width="12" height="20" viewBox="0 0 17 29" fill="none" className="transition-colors">
                  <path d="M1.5 2L14 14.5L1.5 27" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. DESKTOP VIEW */}
      <div className="hidden lg:block relative w-full h-full max-w-[1536px] mx-auto z-30">
        
        {/* Hollow Title Background */}
        <div className="absolute left-[4.95%] top-[12%] z-10 pointer-events-none">
          <HollowText 
            strokeColor="#846500"
            strokeWidth={3}
            className="block text-[6.25vw] xl:text-[96px] font-[900] leading-none"
            style={{ 
              fontFamily: "var(--font-anaheim)",
              width: "50vw",
              whiteSpace: "pre-line"
            }}
          >
            {title || "PRODUCT SERIES"}
          </HollowText>
        </div>

        {/* Desktop Nav Arrows */}
        <div className="absolute right-[15%] top-[18%] flex gap-16 z-30">
          <button 
            onClick={prevProduct} 
            className="w-[3.85vw] h-[3.85vw] xl:w-[59px] xl:h-[59px] rounded-full border-[1.5px] border-[#756F3F] flex items-center justify-center bg-white text-[#756F3F] shadow-lg hover:bg-[#756F3F] hover:text-white transition-all active:scale-95"
          >
            <svg width="23%" height="40%" viewBox="0 0 17 29" fill="none">
              <path d="M15.5 2L3 14.5L15.5 27" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </button>
          <button 
            onClick={nextProduct} 
            className="w-[3.85vw] h-[3.85vw] xl:w-[59px] xl:h-[59px] rounded-full border-[1.5px] border-[#756F3F] flex items-center justify-center bg-white text-[#756F3F] shadow-lg hover:bg-[#756F3F] hover:text-white transition-all active:scale-95"
          >
            <svg width="23%" height="40%" viewBox="0 0 17 29" fill="none">
              <path d="M1.5 2L14 14.5L1.5 27" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Content Rail */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeProduct.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-x-0 bottom-[4%] z-0 flex justify-center gap-8"
          >
            {/* Left Beige Card */}
            <div className="w-[40%] aspect-[766/561] rounded-[1.56vw] xl:rounded-[22.8px] bg-[#F1E8CA] p-[4.68%] flex flex-col justify-between shadow-2xl relative">
              <div className="relative z-10">
                <h3 className="text-[3.33vw] xl:text-[48px] font-[800] text-[#6D5400] leading-none mb-6 font-anaheim uppercase">
                  {getDisplayName()}
                </h3>
                <div className="flex flex-col gap-2">
                  {attributes.slice(0, 4).map((attr, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-[1.87vw] h-[2vw] xl:w-[28.8px] xl:h-[28.8px] rounded-full bg-[#A5A075] flex items-center justify-center shrink-0">
                        <svg width="60%" height="60%" viewBox="0 0 18 14" fill="none"><path d="M1.5 7L6.5 12L16.5 2" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <p className="text-[1.25vw] xl:text-[20px] font-semibold text-black font-anaheim uppercase leading-none truncate">{attr}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="self-end relative z-10">
                <Link 
                  href={`/${locale}/shop/${activeProduct.slug}`} 
                  className="flex items-center gap-[0.78vw] xl:gap-[12px] group/see transition-all duration-300 transform translate-x-[40px] translate-y-[50px]"
                >
                  <span className="text-[1.14vw] xl:text-[17.6px] font-bold text-[#756F3F] transition-colors group-hover/see:text-black font-anaheim uppercase">
                    {(activeProduct as any)._carouselItem?.buttonText || "SEE ALL"}
                  </span>
                  <div className="w-[2.97vw] h-[2.97vw] xl:w-[45.6px] xl:h-[45.6px] rounded-full border border-[#756F3F] flex items-center justify-center text-[#756F3F] group-hover/see:bg-[#756F3F] group-hover/see:text-white transition-all">
                    <svg width="42%" height="42%" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </Link>
              </div>
            </div>

            {/* Right Image Card 1 (Clean) */}
            <div className="w-[19.53%] aspect-[375/561] rounded-[1.56vw] xl:rounded-[22.8px] overflow-hidden shadow-2xl border-none">
              <OptimizedImage image={displayedImages[0]} alt="Showcase 1" className="w-full h-full object-cover" size="large" />
            </div>

            {/* Right Image Card 2 (Clean) */}
            <div className="w-[19.53%] aspect-[375/561] rounded-[1.56vw] xl:rounded-[22.8px] overflow-hidden shadow-2xl border-none">
              <OptimizedImage image={displayedImages[1]} alt="Showcase 2" className="w-full h-full object-cover" size="large" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
