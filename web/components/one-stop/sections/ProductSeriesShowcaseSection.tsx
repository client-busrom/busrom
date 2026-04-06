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

const vw = (px: number) => `${(px / 1920) * 100}vw`

export function ProductSeriesShowcaseSection({ title, products, locale }: ProductSeriesShowcaseSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // 仅获取有足够图片的或有效的产品
  const validProducts = useMemo(() => {
    return products.filter(p => p.name && p.slug)
  }, [products])

  if (validProducts.length === 0) return null

  const activeProduct = validProducts[currentIndex]

  // Logic to determine name vs category display
  const getDisplayName = () => {
    const item = (activeProduct as any)._carouselItem
    const categoryName = (activeProduct as any).category?.name || "Category"
    const productName = activeProduct.name || ""
    
    if (item) {
       if (item.showCategory === true) return categoryName
       if (item.showName === false) return categoryName
    }
    return productName
  }

  // 从 mainImage 中随机选两张图片，如果没有则用占位图或展示图
  const displayedImages = useMemo(() => {
    const images = activeProduct.mainImage && activeProduct.mainImage.length > 0 
      ? [...activeProduct.mainImage] 
      : (activeProduct.showImage ? [activeProduct.showImage] : [])
    
    if (images.length === 0) return [null, null]
    if (images.length === 1) return [images[0], images[0]]
    
    // 简单打乱选前两个
    const shuffled = images.sort(() => 0.5 - Math.random())
    return [shuffled[0], shuffled[1]]
  }, [activeProduct])

  // 处理属性展示
  const attributes = useMemo(() => {
    if (Array.isArray(activeProduct.productAttributes)) return activeProduct.productAttributes
    if (typeof activeProduct.productAttributes === 'string') {
        return activeProduct.productAttributes.split('\n').filter(line => line.trim())
    }
    return ["Robust and stable", "Resistant to moisture", "Minimalist aesthetics", "Versatile and adaptable"]
  }, [activeProduct])

  const nextProduct = () => setCurrentIndex((prev) => (prev + 1) % validProducts.length)
  const prevProduct = () => setCurrentIndex((prev) => (prev - 1 + validProducts.length) % validProducts.length)

  return (
    <section className="relative w-full bg-transparent overflow-hidden flex flex-col items-center py-10 md:py-0 md:h-[48.02vw]">
      
      {/* 1. MOBILE VIEW (Visible on md and below) */}
      <div className="md:hidden w-full flex flex-col items-center px-6 gap-8">
        {/* Title Background (Hollow) */}
        <div className="w-full text-center">
           <HollowText 
            strokeColor="#846500"
            strokeWidth={1}
            className="block text-5xl md:text-8xl font-[900] leading-none pointer-events-none"
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
            {/* Top Beige Card */}
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
              <Link href={`/${locale}/shop/${activeProduct.slug}`} className="self-end flex items-center gap-3 mt-4 group">
                <span className="text-xl font-bold text-[#756F3F] font-anaheim uppercase">SEE ALL</span>
                <div className="w-12 h-12 rounded-full border border-[#756F3F] flex items-center justify-center group-hover:bg-[#756F3F] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="group-hover:stroke-white transition-colors"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </Link>
            </div>

            {/* Bottom Media Display */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="aspect-[3/4] rounded-[20px] overflow-hidden shadow-lg border border-black/5">
                <OptimizedImage image={displayedImages[0]} alt="Feature 1" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-[3/4] rounded-[20px] overflow-hidden shadow-lg border border-black/5">
                <OptimizedImage image={displayedImages[1]} alt="Feature 2" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Navigation Arrows (Mobile) */}
            <div className="flex justify-center gap-10 mt-4">
              <button onClick={prevProduct} className="w-14 h-14 rounded-full border-2 border-[#756F3F] flex items-center justify-center bg-white shadow-md active:scale-95 transition-all"><svg width="12" height="20" viewBox="0 0 17 29" fill="none"><path d="M15.5 2L3 14.5L15.5 27" stroke="#756F3F" strokeWidth="3" strokeLinecap="round"/></svg></button>
              <button onClick={nextProduct} className="w-14 h-14 rounded-full bg-[#756F3F] flex items-center justify-center shadow-md active:scale-95 transition-all"><svg width="12" height="20" viewBox="0 0 17 29" fill="none"><path d="M1.5 2L14 14.5L1.5 27" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg></button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. DESKTOP VIEW (Visible on tablet MD and above) */}
      <div className="hidden md:flex relative w-full h-full max-w-[1920px] mx-auto items-center">
        
        {/* 1. Base Background Title Layer (HollowText) */}
        <div className="absolute left-[4.95vw] top-[3.44vw] z-40 pointer-events-none">
          <HollowText 
            strokeColor="#846500"
            strokeWidth={3}
            className="block text-[6.25vw] font-[900] leading-none"
            style={{ 
              fontFamily: "var(--font-anaheim)",
              width: "50vw",
              whiteSpace: "pre-line"
            }}
          >
            {title || "PRODUCT SERIES"}
          </HollowText>
        </div>

        {/* Navigation Arrows (Desktop) */}
        <div className="absolute right-[8.49vw] top-[6.25vw] flex gap-[4.01vw] z-30">
          <button onClick={prevProduct} className="w-[3.85vw] h-[3.85vw] rounded-full border-[1.5px] border-[#756F3F] flex items-center justify-center bg-white shadow-lg hover:bg-[#756F3F] group transition-all">
            <svg width="0.88vw" height="1.51vw" viewBox="0 0 17 29" fill="none" className="group-hover:stroke-white transition-colors"><path d="M15.5 2L3 14.5L15.5 27" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
          </button>
          <button onClick={nextProduct} className="w-[3.85vw] h-[3.85vw] rounded-full bg-[#756F3F] flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <svg width="0.88vw" height="1.51vw" viewBox="0 0 17 29" fill="none"><path d="M1.5 2L14 14.5L1.5 27" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Content Animation Rail */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeProduct.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-x-0 bottom-[5.21vw] z-20 flex gap-[2.76vw] pl-[7.97vw]"
          >
            {/* Beige Main Card */}
            <div 
              className="w-[39.9vw] h-[29.2vw] rounded-[1.56vw] bg-[#F1E8CA] p-[4.68vw] flex flex-col justify-between shadow-2xl relative"
            >
              <div className="relative z-10">
                <h3 className="text-[3.33vw] font-[800] text-[#6D5400] leading-none mb-[1.56vw] font-anaheim uppercase">
                  {getDisplayName()}
                </h3>
                <div className="flex flex-col gap-[0.99vw]">
                  {attributes.slice(0, 4).map((attr, i) => (
                    <div key={i} className="flex items-center gap-[0.99vw]">
                      <div className="w-[1.87vw] h-[1.87vw] rounded-full bg-[#A5A075] flex items-center justify-center shrink-0">
                        <svg width="0.94vw" height="0.73vw" viewBox="0 0 18 14" fill="none"><path d="M1.5 7L6.5 12L16.5 2" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <p className="text-[1.25vw] font-semibold text-black font-anaheim uppercase leading-none">{attr}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="self-end relative z-10">
                <Link href={`/${locale}/shop/${activeProduct.slug}`} className="flex items-center gap-[0.625vw] group">
                  <span className="text-[1.14vw] font-bold text-[#756F3F] transition-colors group-hover:text-black font-anaheim uppercase">SEE ALL</span>
                  <div className="w-[2.97vw] h-[2.97vw] rounded-full border border-[#756F3F] flex items-center justify-center group-hover:bg-[#756F3F] transition-colors">
                    <svg width="1.25vw" height="1.25vw" viewBox="0 0 24 24" fill="none" className="group-hover:stroke-white transition-colors"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </Link>
              </div>
            </div>

            {/* Right Images */}
            <div className="h-[29.2vw] w-[19.53vw] rounded-[1.56vw] overflow-hidden shadow-2xl border border-black/5">
              <OptimizedImage image={displayedImages[0]} alt="Showcase 1" className="w-full h-full object-cover" />
            </div>
            <div className="h-[29.2vw] w-[19.53vw] rounded-[1.56vw] overflow-hidden shadow-2xl border border-black/5">
              <OptimizedImage image={displayedImages[1]} alt="Showcase 2" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
